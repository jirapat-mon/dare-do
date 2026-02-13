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

    await prisma.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id: submissionId },
        data: { status, note: notes || submission.note },
      });

      if (status === "approved") {
        const updatedContract = await tx.contract.update({
          where: { id: submission.contractId },
          data: { daysCompleted: { increment: 1 } },
        });

        // Check if contract is now complete
        if (updatedContract.daysCompleted >= updatedContract.duration) {
          await tx.contract.update({
            where: { id: submission.contractId },
            data: { status: "success" },
          });
        }
      } else if (status === "rejected") {
        await tx.contract.update({
          where: { id: submission.contractId },
          data: { status: "failed" },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reviewing submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
