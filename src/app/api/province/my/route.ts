import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { getProvince } from "@/lib/provinces";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { province: true, lifetimePoints: true },
    });

    if (!user || !user.province) {
      return NextResponse.json({ province: null });
    }

    const provinceInfo = getProvince(user.province);
    if (!provinceInfo) {
      return NextResponse.json({ province: null });
    }

    // Get user's rank within their province
    const higherRanked = await prisma.user.count({
      where: {
        province: user.province,
        lifetimePoints: { gt: user.lifetimePoints },
      },
    });
    const rankInProvince = higherRanked + 1;

    // Get province stats
    const provinceStats = await prisma.user.aggregate({
      where: { province: user.province },
      _sum: { lifetimePoints: true },
      _count: true,
    });

    // Get province's national rank (by total points)
    const allProvinceStats = await prisma.user.groupBy({
      by: ["province"],
      where: { province: { not: null } },
      _sum: { lifetimePoints: true },
    });

    const sorted = allProvinceStats
      .map((s) => ({ code: s.province!, points: s._sum.lifetimePoints ?? 0 }))
      .sort((a, b) => b.points - a.points);

    const nationalRank = sorted.findIndex((s) => s.code === user.province) + 1;

    return NextResponse.json({
      province: {
        code: provinceInfo.code,
        nameTh: provinceInfo.nameTh,
        nameEn: provinceInfo.nameEn,
        region: provinceInfo.region,
      },
      stats: {
        totalUsers: provinceStats._count,
        totalPoints: provinceStats._sum.lifetimePoints ?? 0,
        rankInProvince,
        nationalRank: nationalRank || null,
      },
    });
  } catch (error) {
    console.error("Error fetching user province:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
