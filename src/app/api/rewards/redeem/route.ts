import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma, type PrismaTransactionClient } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rewardId, address } = body;

    if (!rewardId) {
      return NextResponse.json(
        { error: "rewardId is required" },
        { status: 400 }
      );
    }

    // Fetch reward
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      );
    }

    if (!reward.isActive) {
      return NextResponse.json(
        { error: "Reward is no longer available" },
        { status: 400 }
      );
    }

    // Check stock (stock === -1 means unlimited)
    if (reward.stock !== -1 && reward.stock <= 0) {
      return NextResponse.json(
        { error: "Reward is out of stock" },
        { status: 400 }
      );
    }

    // Fetch user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found. Please visit the wallet page first." },
        { status: 404 }
      );
    }

    // Check if user has enough points
    if (wallet.points < reward.pointsCost) {
      return NextResponse.json(
        {
          error: "Insufficient points",
          required: reward.pointsCost,
          available: wallet.points,
        },
        { status: 400 }
      );
    }

    // Execute redemption in a transaction
    const redemption = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Deduct points from wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          points: { decrement: reward.pointsCost },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "points_redeemed",
          amount: -reward.pointsCost,
          description: `Redeemed: ${reward.name}`,
        },
      });

      // Decrement stock if finite
      if (reward.stock !== -1) {
        await tx.reward.update({
          where: { id: reward.id },
          data: {
            stock: { decrement: 1 },
          },
        });
      }

      // Create redemption record
      const newRedemption = await tx.rewardRedemption.create({
        data: {
          rewardId: reward.id,
          userId: session.userId,
          walletId: wallet.id,
          status: "pending",
          address: address || null,
        },
        include: {
          reward: true,
        },
      });

      return newRedemption;
    });

    return NextResponse.json({ success: true, redemption });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
