import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rewards = await prisma.reward.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
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

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      nameTh,
      description,
      descriptionTh,
      pointsCost,
      imageUrl,
      category,
      stock,
    } = body;

    if (!name || !nameTh || !description || !descriptionTh || !pointsCost || !imageUrl || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, nameTh, description, descriptionTh, pointsCost, imageUrl, category" },
        { status: 400 }
      );
    }

    const reward = await prisma.reward.create({
      data: {
        name,
        nameTh,
        description,
        descriptionTh,
        pointsCost,
        imageUrl,
        category,
        stock: stock ?? -1,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, reward }, { status: 201 });
  } catch (error) {
    console.error("Error creating reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
