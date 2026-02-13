import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PROVINCES, getProvincesByRegion, type RegionKey } from "@/lib/provinces";

export async function GET(request: NextRequest) {
  try {
    const region = request.nextUrl.searchParams.get("region") as RegionKey | null;

    // If region filter, get valid province codes for that region
    const regionCodes = region ? getProvincesByRegion(region).map((p) => p.code) : null;

    const provinceStats = await prisma.user.groupBy({
      by: ["province"],
      where: {
        province: { not: null },
        ...(regionCodes ? { province: { in: regionCodes } } : {}),
      },
      _sum: { lifetimePoints: true },
      _count: true,
    });

    const provinceMap = new Map(PROVINCES.map((p) => [p.code, p]));

    const ranked = provinceStats
      .map((stat) => {
        const info = provinceMap.get(stat.province!);
        const totalPoints = stat._sum.lifetimePoints ?? 0;
        const userCount = stat._count;
        return {
          code: stat.province!,
          nameTh: info?.nameTh ?? "",
          nameEn: info?.nameEn ?? "",
          region: info?.region ?? "",
          totalPoints,
          userCount,
          avgPoints: userCount > 0 ? Math.round(totalPoints / userCount) : 0,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((item, index) => ({ rank: index + 1, ...item }));

    return NextResponse.json({ leaderboard: ranked });
  } catch (error) {
    console.error("Error fetching province leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
