import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      where: { status: "success" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            avatarFrame: true,
            lifetimePoints: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const announcements = contracts.map((c) => ({
      id: c.id,
      user: {
        id: c.user.id,
        name: c.user.name,
        avatarUrl: c.user.avatarUrl,
        avatarFrame: c.user.avatarFrame,
        lifetimePoints: c.user.lifetimePoints,
      },
      goal: c.goal,
      duration: c.duration,
      daysCompleted: c.daysCompleted,
      stakes: c.stakes,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
