import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all accepted friend IDs
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [
          { userId: session.userId },
          { friendId: session.userId },
        ],
      },
    });

    const friendIds = friendships.map((f) =>
      f.userId === session.userId ? f.friendId : f.userId
    );

    if (friendIds.length === 0) {
      return NextResponse.json({ activity: [] });
    }

    // Get recent submissions from friends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const submissions = await prisma.submission.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        contract: {
          userId: { in: friendIds },
        },
      },
      include: {
        contract: {
          select: {
            goal: true,
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const activity = submissions.map((s) => ({
      friendId: s.contract.user.id,
      friendName: s.contract.user.name,
      goal: s.contract.goal,
      submissionStatus: s.status,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Error fetching friend activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
