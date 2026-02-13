import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceMonthly: "asc" },
    });

    return NextResponse.json({
      plans: plans.map((p) => ({
        ...p,
        features: JSON.parse(p.features),
      })),
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
