import { NextRequest, NextResponse } from "next/server";
import { prisma, type PrismaTransactionClient } from "@/lib/db";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const isSimulateMode =
  !STRIPE_KEY || STRIPE_KEY.includes("REPLACE") || STRIPE_KEY.length < 20;

const stripe = isSimulateMode ? null : new Stripe(STRIPE_KEY);

// Stripe webhook payloads include fields the SDK types may not expose
interface SubscriptionData {
  id: string;
  customer: string | { id: string };
  status: string;
  items: { data: Array<{ price: { id: string; unit_amount: number | null } }> };
  current_period_end?: number;
  ended_at?: number | null;
}

interface InvoiceData {
  customer: string | { id: string } | null;
  subscription: string | null;
  amount_paid: number;
  payment_intent: string | null;
}

export async function POST(request: NextRequest) {
  if (isSimulateMode) {
    return NextResponse.json(
      { error: "Webhook not available in simulate mode" },
      { status: 400 }
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe!.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const data = event.data.object as unknown;

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscriptionUpdate(data as SubscriptionData);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionCancelled(data as SubscriptionData);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = data as InvoiceData;
        if (invoice.subscription) {
          await handlePaymentSucceeded(invoice);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionUpdate(subscription: SubscriptionData) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  const item = subscription.items.data[0];
  const tier = determineTier(item);

  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "cancelled",
    unpaid: "inactive",
  };

  const endsAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: tier,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: statusMap[subscription.status] || "inactive",
      ...(endsAt && { subscriptionEndsAt: endsAt }),
    },
  });
}

async function handleSubscriptionCancelled(subscription: SubscriptionData) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  const endsAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: "free",
      subscriptionStatus: "cancelled",
      ...(endsAt && { subscriptionEndsAt: endsAt }),
    },
  });
}

async function handlePaymentSucceeded(invoice: InvoiceData) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  const amount = (invoice.amount_paid || 0) / 100; // Convert from satang to baht

  let platformWallet = await prisma.platformWallet.findFirst();
  if (!platformWallet) {
    platformWallet = await prisma.platformWallet.create({
      data: { balance: 0, totalRevenue: 0 },
    });
  }

  await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    await tx.platformWallet.update({
      where: { id: platformWallet.id },
      data: {
        balance: { increment: amount },
        totalRevenue: { increment: amount },
      },
    });

    await tx.platformTransaction.create({
      data: {
        platformWalletId: platformWallet.id,
        userId: user.id,
        type: "subscription_income",
        amount,
        description: `Subscription payment - ${user.subscriptionTier}`,
        stripePaymentId: invoice.payment_intent,
      },
    });
  });
}

function determineTier(item: SubscriptionData["items"]["data"][0]): string {
  const amount = (item.price.unit_amount || 0) / 100;

  if (amount >= 200) return "pro";
  if (amount >= 50) return "starter";
  return "free";
}
