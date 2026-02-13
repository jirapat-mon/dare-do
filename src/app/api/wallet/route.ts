import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch wallet with recent transactions
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.userId,
          balance: 0,
          points: 0,
          streak: 0,
          lastActiveAt: new Date(),
        },
        include: {
          transactions: true,
        },
      });
    }

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        points: wallet.points,
        streak: wallet.streak,
        lastActiveAt: wallet.lastActiveAt,
      },
      transactions: wallet.transactions,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
