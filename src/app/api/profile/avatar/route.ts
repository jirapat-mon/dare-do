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
    const { avatarUrl, bannerUrl } = body;

    // Must have at least one field
    if (!avatarUrl && !bannerUrl) {
      return NextResponse.json(
        { error: "avatarUrl or bannerUrl is required" },
        { status: 400 }
      );
    }

    const maxSize = 2 * 1024 * 1024; // 2MB

    // Handle avatarUrl upload
    if (avatarUrl) {
      const sizeInBytes = Buffer.byteLength(avatarUrl, "utf-8");
      if (sizeInBytes > maxSize) {
        return NextResponse.json(
          { error: "Image too large. Max 2MB." },
          { status: 400 }
        );
      }

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
    }

    // Handle bannerUrl upload
    if (bannerUrl) {
      const sizeInBytes = Buffer.byteLength(bannerUrl, "utf-8");
      if (sizeInBytes > maxSize) {
        return NextResponse.json(
          { error: "Banner image too large. Max 2MB." },
          { status: 400 }
        );
      }

      const isBase64 = bannerUrl.startsWith("data:image/");
      const isUrl = bannerUrl.startsWith("http://") || bannerUrl.startsWith("https://");
      if (!isBase64 && !isUrl) {
        return NextResponse.json(
          { error: "Invalid image format. Must be base64 data URI or URL." },
          { status: 400 }
        );
      }

      const user = await prisma.user.update({
        where: { id: session.userId },
        data: { bannerUrl },
        select: {
          id: true,
          name: true,
          bannerUrl: true,
        },
      });

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: "No valid field provided" }, { status: 400 });
  } catch (error) {
    console.error("Error uploading avatar/banner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if there's a query param for field type
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field") || "avatar";

    if (field === "banner") {
      const user = await prisma.user.update({
        where: { id: session.userId },
        data: { bannerUrl: null },
        select: {
          id: true,
          name: true,
          bannerUrl: true,
        },
      });
      return NextResponse.json({ success: true, user });
    }

    // Default: remove avatar
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
    console.error("Error removing avatar/banner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
