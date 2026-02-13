import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { BADGES } from "@/lib/gamification";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all badges earned by current user
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: session.userId },
    });

    const earnedMap = new Map(
      userBadges.map((ub) => [ub.badgeKey, ub.earnedAt])
    );

    // Merge badge definitions with earned status
    const badges = BADGES.map((badge) => ({
      ...badge,
      earned: earnedMap.has(badge.key),
      earnedAt: earnedMap.get(badge.key) ?? null,
    }));

    // Sort by category
    const categoryOrder = ["streak", "submission", "contract", "points", "special"];
    badges.sort(
      (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    );

    return NextResponse.json({
      badges,
      earnedCount: userBadges.length,
      totalCount: BADGES.length,
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
