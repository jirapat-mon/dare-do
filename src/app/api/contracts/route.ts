import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

const TIER_LIMITS: Record<string, number> = {
  free: 1,
  basic: 5,
  pro: 999,
};

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contracts = await prisma.contract.findMany({
      where: { userId: session.userId },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { goal, duration, deadline } = body;

    if (!goal || !duration || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check subscription tier contract limit
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const maxContracts = TIER_LIMITS[user.subscriptionTier] ?? 1;

    const activeCount = await prisma.contract.count({
      where: { userId: session.userId, status: "active" },
    });

    if (activeCount >= maxContracts) {
      return NextResponse.json(
        {
          error: "Contract limit reached",
          limit: maxContracts,
          current: activeCount,
          tier: user.subscriptionTier,
        },
        { status: 403 }
      );
    }

    const contract = await prisma.contract.create({
      data: {
        userId: session.userId,
        goal,
        duration,
        deadline,
        status: "active",
        daysCompleted: 0,
      },
    });

    return NextResponse.json({ success: true, contract });
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
