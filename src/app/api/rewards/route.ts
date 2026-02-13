import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: "asc" },
    });

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
