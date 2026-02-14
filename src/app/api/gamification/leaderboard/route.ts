import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "weekly";

    if (!["weekly", "monthly", "alltime"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Use weekly, monthly, or alltime" },
        { status: 400 }
      );
    }

    let entries: {
      position: number;
      userId: string;
      name: string | null;
      points: number;
      streak: number;
      lifetimePoints: number;
      badgeCount: number;
      isCurrentUser: boolean;
    }[];

    if (period === "alltime") {
      // Use lifetimePoints directly from User model
      const users = await prisma.user.findMany({
        orderBy: { lifetimePoints: "desc" },
        take: 50,
        select: {
          id: true,
          name: true,
          lifetimePoints: true,
          wallet: { select: { streak: true } },
          _count: { select: { badges: true } },
        },
      });

      entries = users.map((u, i) => ({
        position: i + 1,
        userId: u.id,
        name: u.name,
        points: u.lifetimePoints,
        streak: u.wallet?.streak ?? 0,
        lifetimePoints: u.lifetimePoints,
        badgeCount: u._count.badges,
        isCurrentUser: u.id === session.userId,
      }));
    } else {
      // weekly or monthly: aggregate points_earned transactions
      const now = new Date();
      let startDate: Date;

      if (period === "weekly") {
        // Start of current week (Monday 00:00)
        const day = now.getDay(); // 0=Sun, 1=Mon, ...
        const diff = day === 0 ? 6 : day - 1; // days since Monday
        startDate = new Date(now);
        startDate.setDate(now.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
      } else {
        // monthly: start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Group transactions by wallet, sum amounts
      const grouped = await prisma.transaction.groupBy({
        by: ["walletId"],
        where: {
          type: "points_earned",
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 50,
      });

      if (grouped.length === 0) {
        return NextResponse.json({
          period,
          leaderboard: [],
          currentUser: null,
        });
      }

      // Fetch wallet + user data for top wallets
      const walletIds = grouped.map((g) => g.walletId);
      const wallets = await prisma.wallet.findMany({
        where: { id: { in: walletIds } },
        select: {
          id: true,
          userId: true,
          streak: true,
          user: {
            select: {
              id: true,
              name: true,
              lifetimePoints: true,
              _count: { select: { badges: true } },
            },
          },
        },
      });

      const walletMap = new Map(wallets.map((w) => [w.id, w]));

      entries = grouped.map((g, i) => {
        const w = walletMap.get(g.walletId);
        return {
          position: i + 1,
          userId: w?.userId ?? "",
          name: w?.user.name ?? null,
          points: Math.round(g._sum.amount ?? 0),
          streak: w?.streak ?? 0,
          lifetimePoints: w?.user.lifetimePoints ?? 0,
          badgeCount: w?.user._count.badges ?? 0,
          isCurrentUser: w?.userId === session.userId,
        };
      });
    }

    // Check if current user is already in the list
    const currentUserInList = entries.find((e) => e.isCurrentUser);

    let currentUser = null;
    if (!currentUserInList) {
      // Find current user's position
      if (period === "alltime") {
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            name: true,
            lifetimePoints: true,
            wallet: { select: { streak: true } },
            _count: { select: { badges: true } },
          },
        });

        if (user) {
          // Count users with more lifetime points
          const rank = await prisma.user.count({
            where: { lifetimePoints: { gt: user.lifetimePoints } },
          });

          currentUser = {
            position: rank + 1,
            userId: user.id,
            name: user.name,
            points: user.lifetimePoints,
            streak: user.wallet?.streak ?? 0,
            lifetimePoints: user.lifetimePoints,
            badgeCount: user._count.badges,
            isCurrentUser: true,
          };
        }
      } else {
        // weekly/monthly: find current user's wallet and their period points
        const now = new Date();
        let startDate: Date;
        if (period === "weekly") {
          const day = now.getDay();
          const diff = day === 0 ? 6 : day - 1;
          startDate = new Date(now);
          startDate.setDate(now.getDate() - diff);
          startDate.setHours(0, 0, 0, 0);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const wallet = await prisma.wallet.findUnique({
          where: { userId: session.userId },
          select: {
            id: true,
            streak: true,
            user: {
              select: {
                id: true,
                name: true,
                lifetimePoints: true,
                _count: { select: { badges: true } },
              },
            },
          },
        });

        if (wallet) {
          const userPoints = await prisma.transaction.aggregate({
            where: {
              walletId: wallet.id,
              type: "points_earned",
              createdAt: { gte: startDate },
            },
            _sum: { amount: true },
          });

          const myPoints = Math.round(userPoints._sum.amount ?? 0);

          // Count wallets with more points in this period
          const higherCount = await prisma.transaction.groupBy({
            by: ["walletId"],
            where: {
              type: "points_earned",
              createdAt: { gte: startDate },
            },
            _sum: { amount: true },
            having: { amount: { _sum: { gt: myPoints } } },
          });

          currentUser = {
            position: higherCount.length + 1,
            userId: wallet.user.id,
            name: wallet.user.name,
            points: myPoints,
            streak: wallet.streak,
            lifetimePoints: wallet.user.lifetimePoints,
            badgeCount: wallet.user._count.badges,
            isCurrentUser: true,
          };
        }
      }
    }

    return NextResponse.json({
      period,
      leaderboard: entries,
      currentUser: currentUserInList ?? currentUser,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
