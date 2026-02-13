import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redemptions = await prisma.rewardRedemption.findMany({
      where: { userId: session.userId },
      include: {
        reward: {
          select: {
            id: true,
            name: true,
            nameTh: true,
            imageUrl: true,
            pointsCost: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error("Error fetching redemptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
