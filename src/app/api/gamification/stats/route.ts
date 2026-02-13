import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import {
  getRank,
  getNextRank,
  getStreakLevel,
  RANKS,
  type SubscriptionTier,
} from "@/lib/gamification";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        lifetimePoints: true,
        subscriptionTier: true,
        badges: {
          orderBy: { earnedAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.userId,
          points: 0,
          streak: 0,
          lastActiveAt: new Date(),
        },
      });
    }

    const tier = (user.subscriptionTier || "free") as SubscriptionTier;
    const lifetimePoints = user.lifetimePoints;

    // Rank info
    const currentRank = getRank(lifetimePoints);
    const nextRank = getNextRank(lifetimePoints);
    const currentRankIdx = RANKS.findIndex((r) => r.key === currentRank.key);
    const currentRankMin = RANKS[currentRankIdx].minPoints;
    const nextRankMin = nextRank ? nextRank.minPoints : currentRankMin;

    let rankProgress = 100;
    if (nextRank) {
      const range = nextRankMin - currentRankMin;
      rankProgress = range > 0
        ? Math.min(100, Math.round(((lifetimePoints - currentRankMin) / range) * 100))
        : 100;
    }

    // Streak info
    const streakLevel = getStreakLevel(wallet.streak);

    // Active contracts count
    const activeContracts = await prisma.contract.count({
      where: { userId: session.userId, status: "active" },
    });

    const completedContracts = await prisma.contract.count({
      where: { userId: session.userId, status: "success" },
    });

    return NextResponse.json({
      tier,
      points: wallet.points,
      lifetimePoints,
      streak: wallet.streak,
      lastActiveAt: wallet.lastActiveAt,
      rank: currentRank,
      nextRank,
      rankProgress,
      streakLevel,
      badges: user.badges,
      stats: {
        activeContracts,
        completedContracts,
      },
    });
  } catch (error) {
    console.error("Error fetching gamification stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
