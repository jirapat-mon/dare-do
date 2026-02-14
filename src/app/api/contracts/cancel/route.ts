import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma, type PrismaTransactionClient } from "@/lib/db";

// Cancel contract: refund 50% of staked points (no platform fee)
export async function POST(request: Request) {
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

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    if (contract.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (contract.status !== "active") {
      return NextResponse.json(
        { error: "Only active contracts can be cancelled" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Cancel the contract
      await tx.contract.update({
        where: { id: contractId },
        data: { status: "failed" },
      });

      let refundPoints = 0;

      if (contract.pointsStaked > 0) {
        // 50% refund of staked points (no platform fee)
        refundPoints = Math.floor(contract.pointsStaked * 0.5);

        const wallet = await tx.wallet.findUniqueOrThrow({
          where: { userId: session.userId },
        });

        // Release from lockedPoints, add refund to points
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            lockedPoints: { decrement: contract.pointsStaked },
            points: { increment: refundPoints },
          },
        });

        // Transaction: refund
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            contractId,
            type: "stake_cancelled",
            amount: refundPoints,
            description: `Contract cancelled: ${refundPoints} points refunded (50% of ${contract.pointsStaked} staked)`,
          },
        });
      }

      return { refundPoints, pointsStaked: contract.pointsStaked };
    });

    return NextResponse.json({
      success: true,
      contractId,
      originalPointsStaked: result.pointsStaked,
      refundPoints: result.refundPoints,
    });
  } catch (error) {
    console.error("Error cancelling contract:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
