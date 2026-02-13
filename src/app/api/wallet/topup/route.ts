import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    // Validate amount
    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 baht" },
        { status: 400 }
      );
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.userId,
          balance: 0,
          points: 0,
          streak: 0,
          lastActiveAt: new Date(),
        },
      });
    }

    // Update wallet balance and create transaction
    const updatedWallet = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const wallet = await tx.wallet.update({
        where: { userId: session.userId },
        data: {
          balance: { increment: amount },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "topup",
          amount: amount,
          description: `เติมเงิน ฿${amount}`,
        },
      });

      return wallet;
    });

    return NextResponse.json({
      success: true,
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error("Error topping up wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
