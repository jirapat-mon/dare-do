import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PROVINCES } from "@/lib/provinces";

export async function GET() {
  try {
    const provinceStats = await prisma.user.groupBy({
      by: ["province"],
      where: { province: { not: null } },
      _sum: { lifetimePoints: true },
      _count: true,
    });

    const provinceMap = new Map(PROVINCES.map((p) => [p.code, p]));

    const provinces = provinceStats.map((stat) => {
      const info = provinceMap.get(stat.province!);
      return {
        code: stat.province!,
        nameTh: info?.nameTh ?? "",
        nameEn: info?.nameEn ?? "",
        region: info?.region ?? "",
        totalPoints: stat._sum.lifetimePoints ?? 0,
        userCount: stat._count,
      };
    });

    const totalUsers = provinces.reduce((sum, p) => sum + p.userCount, 0);
    const totalPoints = provinces.reduce((sum, p) => sum + p.totalPoints, 0);

    return NextResponse.json({
      provinces,
      national: { totalUsers, totalPoints },
    });
  } catch (error) {
    console.error("Error fetching heatmap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
