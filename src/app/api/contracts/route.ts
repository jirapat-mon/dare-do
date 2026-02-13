import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all contracts for user with submissions count
    const contracts = await prisma.contract.findMany({
      where: { userId: session.userId },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { goal, stakes, duration, deadline } = body;

    // Validate inputs
    if (!goal || !stakes || !duration || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (stakes < 100) {
      return NextResponse.json(
        { error: "Minimum stakes is 100 baht" },
        { status: 400 }
      );
    }

    // Calculate fee (5% of stakes)
    const fee = Math.round(stakes * 0.05);
    const total = stakes + fee;

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

    // Check wallet balance
    if (wallet.balance < total) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          required: total,
          current: wallet.balance,
        },
        { status: 400 }
      );
    }

    // Create contract and deduct from wallet in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct stakes + fee from wallet
      const updatedWallet = await tx.wallet.update({
        where: { userId: session.userId },
        data: {
          balance: { decrement: total },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: updatedWallet.id,
          type: "deposit",
          amount: -total,
          description: `มัดจำ: ${goal}`,
        },
      });

      // Create contract
      const contract = await tx.contract.create({
        data: {
          userId: session.userId,
          goal,
          stakes,
          fee,
          duration,
          deadline,
          status: "active",
          daysCompleted: 0,
        },
      });

      return { contract, wallet: updatedWallet };
    });

    return NextResponse.json({
      success: true,
      contract: result.contract,
    });
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
