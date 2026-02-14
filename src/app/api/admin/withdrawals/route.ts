import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/db";

// GET: List all withdrawal requests (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status") || "pending";

    const withdrawals = await prisma.withdrawRequest.findMany({
      where: { status },
      include: {
        wallet: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Approve or reject withdrawal
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { withdrawalId, action, note } = body;

    if (!withdrawalId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "withdrawalId and action (approve/reject) required" },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawRequest.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { error: "Withdrawal already processed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      await prisma.withdrawRequest.update({
        where: { id: withdrawalId },
        data: {
          status: "approved",
          note: note || null,
          processedAt: new Date(),
        },
      });
    } else {
      // Reject: refund back to wallet
      await prisma.$transaction(async (tx) => {
        await tx.withdrawRequest.update({
          where: { id: withdrawalId },
          data: {
            status: "rejected",
            note: note || null,
            processedAt: new Date(),
          },
        });

        // Refund balance
        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: { balance: { increment: withdrawal.amount } },
        });

        // Record refund transaction
        await tx.transaction.create({
          data: {
            walletId: withdrawal.walletId,
            type: "withdraw_refund",
            amount: withdrawal.amount,
            description: `Withdrawal rejected: ฿${withdrawal.amount} refunded`,
          },
        });
      });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
