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
          take: 20,
        },
      },
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.userId,
          points: 0,
          streak: 0,
          lastActiveAt: new Date(),
        },
        include: {
          transactions: true,
        },
      });
    }

    // Fetch user subscription info
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      },
    });

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        points: wallet.points,
        streak: wallet.streak,
        lastActiveAt: wallet.lastActiveAt,
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
      },
      subscription: {
        tier: user?.subscriptionTier || "free",
        status: user?.subscriptionStatus || "inactive",
        endsAt: user?.subscriptionEndsAt,
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
