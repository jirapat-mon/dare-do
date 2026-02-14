import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma, type PrismaTransactionClient } from "@/lib/db";
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
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // In simulate mode, cannot verify
    if (isSimulateMode || !stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 400 }
      );
    }

    // Retrieve the Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to this user
    if (checkoutSession.metadata?.userId !== session.userId) {
      return NextResponse.json(
        { error: "Session does not belong to this user" },
        { status: 403 }
      );
    }

    // Verify it's a wallet topup
    if (checkoutSession.metadata?.type !== "wallet_topup") {
      return NextResponse.json(
        { error: "Not a wallet topup session" },
        { status: 400 }
      );
    }

    // Verify payment is completed
    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const amount = parseFloat(checkoutSession.metadata.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Idempotency check: look for existing transaction with this Stripe session ID
    const existing = await prisma.transaction.findFirst({
      where: {
        description: { contains: sessionId },
        type: "topup",
      },
    });

    if (existing) {
      // Already credited, just return success
      const wallet = await prisma.wallet.findUnique({
        where: { userId: session.userId },
      });
      return NextResponse.json({
        success: true,
        alreadyCredited: true,
        wallet: wallet
          ? {
              id: wallet.id,
              balance: wallet.balance,
              lockedBalance: wallet.lockedBalance,
            }
          : null,
      });
    }

    // Credit the wallet
    const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      let wallet = await tx.wallet.findUnique({
        where: { userId: session.userId },
      });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId: session.userId, points: 0, streak: 0 },
        });
      }

      wallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "topup",
          amount,
          description: `Stripe top-up ฿${amount} [${sessionId}]`,
        },
      });

      return wallet;
    });

    return NextResponse.json({
      success: true,
      alreadyCredited: false,
      wallet: {
        id: result.id,
        balance: result.balance,
        lockedBalance: result.lockedBalance,
      },
    });
  } catch (error) {
    console.error("Error verifying topup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
