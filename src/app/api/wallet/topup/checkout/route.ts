import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const isSimulateMode =
  !STRIPE_KEY || STRIPE_KEY.includes("REPLACE") || STRIPE_KEY.length < 20;

const stripe = isSimulateMode ? null : new Stripe(STRIPE_KEY);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (typeof amount !== "number" || amount < 20 || amount > 100000) {
      return NextResponse.json(
        { error: "Amount must be between 20 and 100,000 THB" },
        { status: 400 }
      );
    }

    // Simulate mode: use demo topup
    if (isSimulateMode) {
      return NextResponse.json({
        simulated: true,
        message: "Use /api/wallet/topup for demo mode",
      });
    }

    // Real Stripe Checkout
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

    const checkoutSession = await stripe!.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card", "promptpay"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: `DareDo Wallet Top-up ฿${amount}`,
              description: `เติมเงิน ฿${amount} เข้ากระเป๋า DareDo`,
            },
            unit_amount: Math.round(amount * 100), // Stripe uses satangs
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/wallet?topup=success&amount=${amount}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/wallet?topup=cancel`,
      metadata: {
        userId: session.userId,
        type: "wallet_topup",
        amount: String(amount),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating topup checkout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
