import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

// POST /api/submissions - Create a new submission (camera capture only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contractId, imageData, note, metadata } = body;

    if (!contractId || !imageData) {
      return NextResponse.json(
        { error: "Missing required fields: contractId, imageData" },
        { status: 400 }
      );
    }

    // Validate base64 image
    if (!imageData.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    // Limit image size (~5MB base64)
    if (imageData.length > 7_000_000) {
      return NextResponse.json(
        { error: "Image too large. Maximum 5MB." },
        { status: 400 }
      );
    }

    // Validate metadata - must have capturedAt timestamp within last 5 minutes
    let meta: { capturedAt?: string; userAgent?: string } = {};
    if (metadata) {
      try {
        meta = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      } catch {
        // ignore invalid metadata
      }
    }

    if (meta.capturedAt) {
      const capturedTime = new Date(meta.capturedAt).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      if (isNaN(capturedTime) || Math.abs(now - capturedTime) > fiveMinutes) {
        return NextResponse.json(
          { error: "Photo must be taken live (within 5 minutes)" },
          { status: 400 }
        );
      }
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

    // Check if already submitted today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingSubmission = await prisma.submission.findFirst({
      where: {
        contractId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "Already submitted today for this contract" },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        contractId,
        imageData,
        note: note || null,
        metadata: JSON.stringify({
          capturedAt: meta.capturedAt || new Date().toISOString(),
          userAgent: meta.userAgent || "unknown",
          source: "camera_capture",
        }),
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      submission: { id: submission.id, status: submission.status },
    });
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
      select: {
        id: true,
        note: true,
        status: true,
        createdAt: true,
        metadata: true,
        // Don't return imageData in list to save bandwidth
      },
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
