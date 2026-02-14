import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma, type PrismaTransactionClient } from "@/lib/db";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const isSimulateMode =
  !STRIPE_KEY || STRIPE_KEY.includes("REPLACE") || STRIPE_KEY.length < 20;

const stripe = isSimulateMode ? null : new Stripe(STRIPE_KEY);

// Fallback Stripe Price IDs in case DB doesn't have them yet
const STRIPE_PRICE_IDS: Record<string, string> = {
  starter: "price_1T0YuhIqfCASXWSgQaHEb02N",
  pro: "price_1T0YuuIqfCASXWSgJPTbYqaN",
};

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tier } = body;

    if (!tier || !["starter", "pro"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be 'starter' or 'pro'" },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { tier },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // Simulate mode: directly update subscription without Stripe
    if (isSimulateMode) {
      const endsAt = new Date();
      endsAt.setMonth(endsAt.getMonth() + 1);

      await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        await tx.user.update({
          where: { id: session.userId },
          data: {
            subscriptionTier: tier,
            subscriptionStatus: "active",
            subscriptionEndsAt: endsAt,
            stripeSubscriptionId: `sim_sub_${Date.now()}`,
          },
        });

        // Record platform revenue
        let platformWallet = await tx.platformWallet.findFirst();
        if (!platformWallet) {
          platformWallet = await tx.platformWallet.create({
            data: { balance: 0, totalRevenue: 0 },
          });
        }

        await tx.platformWallet.update({
          where: { id: platformWallet.id },
          data: {
            balance: { increment: plan.priceMonthly },
            totalRevenue: { increment: plan.priceMonthly },
          },
        });

        await tx.platformTransaction.create({
          data: {
            platformWalletId: platformWallet.id,
            userId: session.userId,
            type: "subscription_income",
            amount: plan.priceMonthly,
            description: `${plan.name} subscription (simulated)`,
            stripePaymentId: `sim_pay_${Date.now()}`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        simulated: true,
        tier,
        message: "Subscription activated (simulate mode)",
      });
    }

    // Real Stripe checkout
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe!.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Use DB stripePriceId or fallback to hardcoded map
    const priceId = plan.stripePriceId || STRIPE_PRICE_IDS[tier];
    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured for this tier" },
        { status: 500 }
      );
    }

    const checkoutSession = await stripe!.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/wallet?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?cancelled=true`,
      metadata: {
        userId: session.userId,
        tier,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
