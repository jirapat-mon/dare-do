import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Total users
    const totalUsers = await prisma.user.count();

    // Active users (submitted at least once in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await prisma.user.count({
      where: {
        contracts: {
          some: {
            submissions: {
              some: { createdAt: { gte: sevenDaysAgo } },
            },
          },
        },
      },
    });

    // Users with active contracts
    const usersWithActiveContracts = await prisma.user.count({
      where: {
        contracts: {
          some: { status: "active" },
        },
      },
    });

    // Subscription breakdown
    const subscriptionBreakdown = await prisma.user.groupBy({
      by: ["subscriptionTier"],
      _count: true,
    });

    const tiers: Record<string, number> = { free: 0, starter: 0, pro: 0 };
    for (const row of subscriptionBreakdown) {
      tiers[row.subscriptionTier] = row._count;
    }

    // Total contracts
    const totalContracts = await prisma.contract.count();
    const activeContracts = await prisma.contract.count({
      where: { status: "active" },
    });
    const successContracts = await prisma.contract.count({
      where: { status: "success" },
    });
    const failedContracts = await prisma.contract.count({
      where: { status: "failed" },
    });

    // Pending withdrawals
    const pendingWithdrawals = await prisma.withdrawRequest.count({
      where: { status: "pending" },
    });

    // Pending submissions
    const pendingSubmissions = await prisma.submission.count({
      where: { status: "pending" },
    });

    // Total staked money
    const stakedResult = await prisma.contract.aggregate({
      where: { status: "active" },
      _sum: { stakes: true },
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
        active7d: activeUsers,
        withActiveContracts: usersWithActiveContracts,
      },
      subscriptions: tiers,
      contracts: {
        total: totalContracts,
        active: activeContracts,
        success: successContracts,
        failed: failedContracts,
      },
      pendingWithdrawals,
      pendingSubmissions,
      totalStaked: stakedResult._sum.stakes || 0,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
