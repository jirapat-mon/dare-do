import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { getProvince } from "@/lib/provinces";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { province } = body;

    if (!province || typeof province !== "string") {
      return NextResponse.json(
        { error: "Province code is required" },
        { status: 400 }
      );
    }

    const provinceInfo = getProvince(province);
    if (!provinceInfo) {
      return NextResponse.json(
        { error: "Invalid province code" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { province },
    });

    return NextResponse.json({
      province: {
        code: provinceInfo.code,
        nameTh: provinceInfo.nameTh,
        nameEn: provinceInfo.nameEn,
        region: provinceInfo.region,
      },
    });
  } catch (error) {
    console.error("Error updating province:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
