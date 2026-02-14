import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl) {
      return NextResponse.json(
        { error: "avatarUrl is required" },
        { status: 400 }
      );
    }

    // Validate base64 size (~500KB max)
    const sizeInBytes = Buffer.byteLength(avatarUrl, "utf-8");
    const maxSize = 500 * 1024; // 500KB
    if (sizeInBytes > maxSize) {
      return NextResponse.json(
        { error: "Image too large. Max 500KB." },
        { status: 400 }
      );
    }

    // Validate that it looks like a base64 image or URL
    const isBase64 = avatarUrl.startsWith("data:image/");
    const isUrl = avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://");
    if (!isBase64 && !isUrl) {
      return NextResponse.json(
        { error: "Invalid image format. Must be base64 data URI or URL." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        avatarFrame: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: null },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        avatarFrame: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error removing avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
