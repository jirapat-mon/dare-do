import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pending = await prisma.friendship.findMany({
      where: {
        friendId: session.userId,
        status: "pending",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            lifetimePoints: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const requests = pending.map((f) => ({
      friendshipId: f.id,
      user: f.user,
      createdAt: f.createdAt,
    }));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
