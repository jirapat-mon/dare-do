import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, method } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!method || !["card", "qr"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid payment method. Use 'card' or 'qr'" },
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
        },
      });
    }

    // Update wallet balance
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    // Create transaction record
    const methodName = method === "card" ? "Credit Card" : "QR Code";
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "topup",
        amount,
        description: `Wallet top up via ${methodName} (${amount} THB)`,
      },
    });

    return NextResponse.json({
      success: true,
      wallet: {
        balance: wallet.balance + amount,
      },
    });
  } catch (error) {
    console.error("Error simulating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
