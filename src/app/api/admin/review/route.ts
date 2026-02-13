import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, status, notes } = body;

    if (!submissionId || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid request: submissionId and status (approved/rejected) required" },
        { status: 400 }
      );
    }

    // Get submission and contract
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { contract: true },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Update submission status
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status, note: notes || submission.note },
    });

    // If approved, increment contract.daysCompleted
    if (status === "approved") {
      const updatedContract = await prisma.contract.update({
        where: { id: submission.contractId },
        data: { daysCompleted: { increment: 1 } },
      });

      // Check if contract is now complete
      if (updatedContract.daysCompleted >= updatedContract.duration) {
        // Mark contract as success
        await prisma.contract.update({
          where: { id: submission.contractId },
          data: { status: "success" },
        });

        // Refund 95% to wallet
        const refundAmount = updatedContract.stakes * 0.95;

        // Get or create wallet
        let wallet = await prisma.wallet.findUnique({
          where: { userId: updatedContract.userId },
        });

        if (!wallet) {
          wallet = await prisma.wallet.create({
            data: {
              userId: updatedContract.userId,
              balance: 0,
            },
          });
        }

        // Update wallet balance
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: refundAmount } },
        });

        // Create transaction record
        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: "refund",
            amount: refundAmount,
            description: `Contract completed: ${updatedContract.goal}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reviewing submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
