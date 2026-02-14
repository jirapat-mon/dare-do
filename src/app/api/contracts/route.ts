import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma, type PrismaTransactionClient } from "@/lib/db";
import { TIER_LIMITS } from "@/lib/gamification";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const { goal, duration, deadline, pointsStaked: rawPointsStaked } = body;
    const pointsStaked = typeof rawPointsStaked === "number" && rawPointsStaked > 0 ? Math.floor(rawPointsStaked) : 0;

    if (!goal || !duration || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check subscription tier contract limit
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tierLimit = TIER_LIMITS[user.subscriptionTier];
    const maxContracts = tierLimit === null ? Infinity : (tierLimit ?? 1);

    const activeCount = await prisma.contract.count({
      where: { userId: session.userId, status: "active" },
    });

    if (activeCount >= maxContracts) {
      return NextResponse.json(
        {
          error: "Contract limit reached",
          limit: tierLimit === null ? "unlimited" : maxContracts,
          current: activeCount,
          tier: user.subscriptionTier,
        },
        { status: 403 }
      );
    }

    // If pointsStaked > 0, check wallet points and lock atomically
    if (pointsStaked > 0) {
      const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        let wallet = await tx.wallet.findUnique({
          where: { userId: session.userId },
        });
        if (!wallet) {
          wallet = await tx.wallet.create({
            data: { userId: session.userId, points: 0, streak: 0 },
          });
        }

        if (wallet.points < pointsStaked) {
          throw new Error("INSUFFICIENT_POINTS");
        }

        // Create contract with pointsStaked
        const contract = await tx.contract.create({
          data: {
            userId: session.userId,
            goal,
            duration,
            deadline,
            pointsStaked,
            status: "active",
            daysCompleted: 0,
          },
        });

        // Deduct points, increase lockedPoints
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            points: { decrement: pointsStaked },
            lockedPoints: { increment: pointsStaked },
          },
        });

        // Record transaction
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            contractId: contract.id,
            type: "points_staked",
            amount: -pointsStaked,
            description: `Staked ${pointsStaked} points on contract`,
          },
        });

        return contract;
      });

      return NextResponse.json({ success: true, contract: result });
    }

    // No stakes — existing behavior
    const contract = await prisma.contract.create({
      data: {
        userId: session.userId,
        goal,
        duration,
        deadline,
        status: "active",
        daysCompleted: 0,
      },
    });

    return NextResponse.json({ success: true, contract });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_POINTS") {
      return NextResponse.json(
        { error: "Insufficient points" },
        { status: 400 }
      );
    }
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
