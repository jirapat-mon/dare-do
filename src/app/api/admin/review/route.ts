import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { prisma, type PrismaTransactionClient } from "@/lib/db";
import {
  calculatePoints,
  COMPLETION_BONUS,
  type SubscriptionTier,
} from "@/lib/gamification";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
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

    if (submission.status !== "pending") {
      return NextResponse.json(
        { error: "Submission already reviewed" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Update submission status
      await tx.submission.update({
        where: { id: submissionId },
        data: { status, note: notes || submission.note },
      });

      if (status === "approved") {
        const userId = submission.contract.userId;

        // Get user info for tier
        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId },
        });
        const subscriptionTier = (user.subscriptionTier || "free") as SubscriptionTier;

        // Ensure wallet exists
        let wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) {
          wallet = await tx.wallet.create({
            data: { userId, points: 0, streak: 0, lastActiveAt: new Date() },
          });
        }

        // --- Streak logic ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let newStreak = 1;

        if (wallet.lastActiveAt) {
          const lastActive = new Date(wallet.lastActiveAt);
          lastActive.setHours(0, 0, 0, 0);
          const diffDays = Math.floor(
            (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 0) {
            // Same day — keep current streak
            newStreak = wallet.streak;
          } else if (diffDays === 1) {
            // Yesterday — increment streak
            newStreak = wallet.streak + 1;
          } else {
            // More than 1 day gap — reset streak
            newStreak = 1;
          }
        }

        // --- Calculate points ---
        const pointsEarned = calculatePoints(subscriptionTier, newStreak);

        // Update wallet: add points, update streak
        wallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            points: { increment: pointsEarned },
            streak: newStreak,
            lastActiveAt: new Date(),
          },
        });

        // Increment lifetime points
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { lifetimePoints: { increment: pointsEarned } },
        });

        // Create points transaction
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            contractId: submission.contractId,
            type: "points_earned",
            amount: pointsEarned,
            description: `Earned ${pointsEarned} points (streak: ${newStreak})`,
          },
        });

        // --- Contract completion check ---
        const updatedContract = await tx.contract.update({
          where: { id: submission.contractId },
          data: { daysCompleted: { increment: 1 } },
        });

        let contractCompleted = false;
        if (updatedContract.daysCompleted >= updatedContract.duration) {
          await tx.contract.update({
            where: { id: submission.contractId },
            data: { status: "success" },
          });
          contractCompleted = true;

          // Award completion bonus
          const bonus = COMPLETION_BONUS[subscriptionTier];
          if (bonus > 0) {
            await tx.wallet.update({
              where: { id: wallet.id },
              data: { points: { increment: bonus } },
            });
            await tx.user.update({
              where: { id: userId },
              data: { lifetimePoints: { increment: bonus } },
            });
            await tx.transaction.create({
              data: {
                walletId: wallet.id,
                contractId: submission.contractId,
                type: "streak_bonus",
                amount: bonus,
                description: `Contract completion bonus (${subscriptionTier} tier)`,
              },
            });
          }
        }

        // --- Badge checks ---
        const badgesToAward: string[] = [];
        const totalLifetimePoints = updatedUser.lifetimePoints + (contractCompleted ? COMPLETION_BONUS[subscriptionTier] : 0);

        // first_blood: first approved submission
        const approvedCount = await tx.submission.count({
          where: {
            contract: { userId },
            status: "approved",
          },
        });
        if (approvedCount === 1) {
          badgesToAward.push("first_blood");
        }

        // Streak badges
        if (newStreak >= 7) badgesToAward.push("week_warrior");
        if (newStreak >= 30) badgesToAward.push("iron_will");
        if (newStreak >= 100) badgesToAward.push("century");

        // Contract badges
        if (contractCompleted) {
          const completedContracts = await tx.contract.count({
            where: { userId, status: "success" },
          });
          if (completedContracts >= 1) badgesToAward.push("contract_master");
          if (completedContracts >= 5) badgesToAward.push("five_contracts");
        }

        // Points badge
        if (totalLifetimePoints >= 1000) {
          badgesToAward.push("point_collector");
        }

        // Create badge records (ignore duplicates via unique constraint)
        for (const badgeKey of badgesToAward) {
          try {
            await tx.userBadge.create({
              data: { userId, badgeKey },
            });
          } catch {
            // Badge already earned — ignore unique constraint error
          }
        }

        return {
          pointsEarned,
          newStreak,
          contractCompleted,
          badgesAwarded: badgesToAward,
        };
      } else if (status === "rejected") {
        await tx.contract.update({
          where: { id: submission.contractId },
          data: { status: "failed" },
        });
        return { pointsEarned: 0, newStreak: 0, contractCompleted: false, badgesAwarded: [] };
      }

      return { pointsEarned: 0, newStreak: 0, contractCompleted: false, badgesAwarded: [] };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Error reviewing submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
