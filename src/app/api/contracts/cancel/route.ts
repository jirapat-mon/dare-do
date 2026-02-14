import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma, type PrismaTransactionClient } from "@/lib/db";

// Cancel contract: refund 50% of stake minus 5% platform fee = 45% of original stake
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

      let refundAmount = 0;

      if (contract.stakes > 0) {
        // 50% refund minus 5% platform fee
        const halfRefund = Math.floor(contract.stakes * 0.50 * 100) / 100;
        const platformFee = Math.floor(contract.stakes * 0.05 * 100) / 100;
        refundAmount = Math.floor((halfRefund - platformFee) * 100) / 100;

        const wallet = await tx.wallet.findUniqueOrThrow({
          where: { userId: session.userId },
        });

        // Release from locked, add refund to balance
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            lockedBalance: { decrement: contract.stakes },
            balance: { increment: refundAmount },
          },
        });

        // Transaction: refund
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            contractId,
            type: "stake_cancelled",
            amount: refundAmount,
            description: `Contract cancelled: refund ฿${refundAmount} (50% - 5% fee)`,
          },
        });

        // Transaction: platform fee
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            contractId,
            type: "platform_fee",
            amount: -platformFee,
            description: `Platform fee: ฿${platformFee} (5%)`,
          },
        });
      }

      return { refundAmount, stakes: contract.stakes };
    });

    return NextResponse.json({
      success: true,
      contractId,
      originalStake: result.stakes,
      refundAmount: result.refundAmount,
    });
  } catch (error) {
    console.error("Error cancelling contract:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
