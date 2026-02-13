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
    const { amount } = body;

    if (typeof amount !== "number" || amount < 20 || amount > 10000) {
      return NextResponse.json(
        { error: "Amount must be between 20 and 10,000 THB" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Find or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: session.userId },
      });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId: session.userId, points: 0, streak: 0 },
        });
      }

      // Increase balance
      wallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "topup",
          amount,
          description: `Top up ฿${amount}`,
        },
      });

      return wallet;
    });

    return NextResponse.json({
      success: true,
      wallet: {
        id: result.id,
        balance: result.balance,
        lockedBalance: result.lockedBalance,
      },
    });
  } catch (error) {
    console.error("Error topping up wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
