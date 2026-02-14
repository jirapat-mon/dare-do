import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma, type PrismaTransactionClient } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, bankName, bankAccount, accountName } = body;

    if (!amount || !bankName || !bankAccount || !accountName) {
      return NextResponse.json(
        { error: "All fields are required: amount, bankName, bankAccount, accountName" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount < 20) {
      return NextResponse.json(
        { error: "Minimum withdrawal is ฿20" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.userId },
      });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.balance < amount) {
        throw new Error("Insufficient balance");
      }

      // Deduct from balance immediately
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      // Create withdraw request
      const withdrawRequest = await tx.withdrawRequest.create({
        data: {
          walletId: wallet.id,
          amount,
          bankName,
          bankAccount,
          accountName,
          status: "pending",
        },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "withdraw_pending",
          amount: -amount,
          description: `Withdrawal request ฿${amount} → ${bankName} ${bankAccount}`,
        },
      });

      return withdrawRequest;
    });

    return NextResponse.json({
      success: true,
      withdrawRequest: {
        id: result.id,
        amount: result.amount,
        status: result.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Insufficient balance" || message === "Wallet not found") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("Error creating withdrawal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: List user's withdrawal requests
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json({ withdrawals: [] });
    }

    const withdrawals = await prisma.withdrawRequest.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
