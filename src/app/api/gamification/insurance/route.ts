import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import {
  INSURANCE_COST,
  INSURANCE_LIMIT,
  type SubscriptionTier,
} from "@/lib/gamification";

// GET: Check insurance status for a contract
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get("contractId");

    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required" },
        { status: 400 }
      );
    }

    // Verify contract belongs to user
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, userId: session.userId },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscriptionTier: true },
    });

    const tier = (user?.subscriptionTier || "free") as SubscriptionTier;
    const limit = INSURANCE_LIMIT[tier];

    const usedCount = await prisma.streakInsurance.count({
      where: {
        wallet: { userId: session.userId },
        contractId,
      },
    });

    return NextResponse.json({
      contractId,
      tier,
      limit,
      used: usedCount,
      remaining: Math.max(0, limit - usedCount),
      cost: INSURANCE_COST,
    });
  } catch (error) {
    console.error("Error checking insurance status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Use streak insurance
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contractId } = body;

    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required" },
        { status: 400 }
      );
    }

    // Verify contract belongs to user and is active
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, userId: session.userId, status: "active" },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Active contract not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscriptionTier: true },
    });

    const tier = (user?.subscriptionTier || "free") as SubscriptionTier;
    const limit = INSURANCE_LIMIT[tier];

    if (limit === 0) {
      return NextResponse.json(
        { error: "Streak insurance is not available for free tier" },
        { status: 403 }
      );
    }

    // Check wallet has enough points
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    if (wallet.points < INSURANCE_COST) {
      return NextResponse.json(
        { error: `Not enough points. Need ${INSURANCE_COST}, have ${wallet.points}` },
        { status: 400 }
      );
    }

    // Check usage limit
    const usedCount = await prisma.streakInsurance.count({
      where: {
        walletId: wallet.id,
        contractId,
      },
    });

    if (usedCount >= limit) {
      return NextResponse.json(
        { error: `Insurance limit reached (${limit} per contract for ${tier} tier)` },
        { status: 400 }
      );
    }

    // Execute insurance purchase in transaction
    await prisma.$transaction(async (tx) => {
      // Deduct points
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { points: { decrement: INSURANCE_COST } },
      });

      // Create insurance record
      await tx.streakInsurance.create({
        data: {
          walletId: wallet.id,
          contractId,
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          contractId,
          type: "points_redeemed",
          amount: -INSURANCE_COST,
          description: "Streak insurance purchased",
        },
      });
    });

    return NextResponse.json({
      success: true,
      pointsDeducted: INSURANCE_COST,
      remainingInsurance: Math.max(0, limit - usedCount - 1),
    });
  } catch (error) {
    console.error("Error using streak insurance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
