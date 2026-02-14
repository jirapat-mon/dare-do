import { NextResponse } from "next/server";
import { prisma, type PrismaTransactionClient } from "@/lib/db";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

const stripe = new Stripe(STRIPE_KEY);

async function creditWallet(userId: string, amount: number, stripeSessionId: string) {
  // Idempotency check: look for existing transaction with this Stripe session ID
  const existing = await prisma.transaction.findFirst({
    where: {
      description: { contains: stripeSessionId },
      type: "topup",
    },
  });

  if (existing) {
    console.log(`[Stripe Webhook] Already processed session ${stripeSessionId}, skipping`);
    return { alreadyProcessed: true };
  }

  const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Find or create wallet
    let wallet = await tx.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { userId, points: 0, streak: 0 },
      });
    }

    // Increment balance
    wallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    // Create transaction record with Stripe session ID for idempotency
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: "topup",
        amount,
        description: `Stripe top-up ฿${amount} [${stripeSessionId}]`,
      },
    });

    return wallet;
  });

  console.log(`[Stripe Webhook] Credited ฿${amount} to user ${userId}, wallet ${result.id}`);
  return { alreadyProcessed: false, wallet: result };
}

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

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};

      if (metadata.type === "wallet_topup") {
        const userId = metadata.userId;
        const amount = parseFloat(metadata.amount);

        if (!userId || isNaN(amount) || amount <= 0) {
          console.error("[Stripe Webhook] Invalid metadata:", metadata);
          return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
        }

        // Only credit if payment is actually paid
        if (session.payment_status === "paid") {
          await creditWallet(userId, amount, session.id);
        } else {
          console.log(`[Stripe Webhook] Session ${session.id} payment_status: ${session.payment_status}, skipping credit`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
