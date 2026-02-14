import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRank } from "@/lib/gamification";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        avatarFrame: true,
        lifetimePoints: true,
        province: true,
        createdAt: true,
        badges: {
          select: { badgeKey: true, earnedAt: true },
          orderBy: { earnedAt: "desc" },
        },
        wallet: {
          select: { streak: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const rank = getRank(user.lifetimePoints);

    // Contract stats
    const [activeContracts, completedContracts, failedContracts] =
      await Promise.all([
        prisma.contract.count({
          where: { userId, status: "active" },
        }),
        prisma.contract.count({
          where: { userId, status: "success" },
        }),
        prisma.contract.count({
          where: { userId, status: "failed" },
        }),
      ]);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        avatarFrame: user.avatarFrame,
        lifetimePoints: user.lifetimePoints,
        province: user.province,
        createdAt: user.createdAt,
        rank,
        streak: user.wallet?.streak ?? 0,
        badges: user.badges,
        stats: {
          activeContracts,
          completedContracts,
          failedContracts,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
