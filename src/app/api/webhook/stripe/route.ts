import { NextResponse } from "next/server";
import { prisma, type PrismaTransactionClient } from "@/lib/db";
import Stripe from "stripe";
import { MONTHLY_BONUS_POINTS } from "@/lib/gamification";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

const stripe = new Stripe(STRIPE_KEY);

// --- Subscription handlers ---

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

function getCustomerId(customer: string | { id: string } | null): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

function determineTier(item: SubscriptionData["items"]["data"][0]): string {
  const amount = (item.price.unit_amount || 0) / 100;
  if (amount >= 200) return "pro";
  if (amount >= 50) return "starter";
  return "free";
}

async function handleSubscriptionUpdate(subscription: SubscriptionData) {
  const customerId = getCustomerId(subscription.customer);
  if (!customerId) return;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });
  if (!user) {
    console.log(`[Stripe Webhook] No user found for customer ${customerId}`);
    return;
  }

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

  console.log(`[Stripe Webhook] Subscription updated: user=${user.id} tier=${tier} status=${subscription.status}`);
}

async function handleSubscriptionCancelled(subscription: SubscriptionData) {
  const customerId = getCustomerId(subscription.customer);
  if (!customerId) return;

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

  console.log(`[Stripe Webhook] Subscription cancelled: user=${user.id}`);
}

async function handlePaymentSucceeded(invoice: InvoiceData) {
  const customerId = getCustomerId(invoice.customer);
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
    // Record platform revenue
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

    // Grant monthly bonus points based on tier
    const tier = user.subscriptionTier || "free";
    const bonusPoints = MONTHLY_BONUS_POINTS[tier] || 0;

    if (bonusPoints > 0) {
      // Find or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: user.id },
      });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId: user.id, points: 0, streak: 0 },
        });
      }

      // Add bonus points
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { points: { increment: bonusPoints } },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "monthly_bonus",
          amount: bonusPoints,
          description: `Monthly bonus: +${bonusPoints} points (${tier} tier)`,
        },
      });

      console.log(`[Stripe Webhook] Granted ${bonusPoints} monthly bonus points to user=${user.id} (${tier} tier)`);
    }
  });

  console.log(`[Stripe Webhook] Payment succeeded: user=${user.id} amount=${amount}`);
}

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const userId = metadata.userId;
  const tier = metadata.tier;

  if (!userId || !tier) {
    console.log(`[Stripe Webhook] Subscription checkout missing metadata:`, metadata);
    return;
  }

  // Update user subscription immediately on checkout completion
  const endsAt = new Date();
  endsAt.setMonth(endsAt.getMonth() + 1);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: "active",
      subscriptionEndsAt: endsAt,
      stripeSubscriptionId: session.subscription as string || `stripe_sub_${Date.now()}`,
    },
  });

  console.log(`[Stripe Webhook] Subscription checkout completed: user=${userId} tier=${tier}`);
}

// --- Main webhook handler ---

export async function POST(request: Request) {
  try {
    const body = await request.text();
    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (WEBHOOK_SECRET) {
      const signature = request.headers.get("stripe-signature");
      if (!signature) {
        console.error("[Stripe Webhook] Missing stripe-signature header");
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }
      try {
        event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
      } catch (err) {
        console.error("[Stripe Webhook] Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      // Dev mode: skip verification
      console.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set, skipping signature verification");
      event = JSON.parse(body) as Stripe.Event;
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          // Subscription checkout flow
          await handleSubscriptionCheckout(session);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscriptionUpdate(event.data.object as unknown as SubscriptionData);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionCancelled(event.data.object as unknown as SubscriptionData);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as unknown as InvoiceData;
        if (invoice.subscription) {
          await handlePaymentSucceeded(invoice);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as unknown as InvoiceData;
        const customerId = getCustomerId(invoice.customer);
        if (customerId) {
          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: customerId },
          });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscriptionStatus: "past_due" },
            });
            console.log(`[Stripe Webhook] Payment failed: user=${user.id} marked as past_due`);
          }
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
