import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const contractId = formData.get("contractId") as string;
    const dailyCode = formData.get("dailyCode") as string;
    const note = formData.get("note") as string | null;
    const image = formData.get("image") as File;

    if (!contractId || !dailyCode || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify contract belongs to user and is active
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        userId: session.userId,
        status: "active",
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found or not active" },
        { status: 404 }
      );
    }

    // Save image to /public/uploads/
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(image.name);
    const filename = `${randomUUID()}${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

    await writeFile(uploadPath, buffer);

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        contractId,
        dailyCode,
        note: note || undefined,
        imageUrl: `/uploads/${filename}`,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/submissions?contractId=xxx - Fetch submissions for a contract
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get("contractId");

    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required" },
        { status: 400 }
      );
    }

    // Verify contract belongs to user
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        userId: session.userId,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const submissions = await prisma.submission.findMany({
      where: { contractId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
