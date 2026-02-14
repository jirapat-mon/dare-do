import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma, type PrismaTransactionClient } from "@/lib/db";
import { AVATAR_FRAMES, getFrame } from "@/lib/avatar-frames";

// GET: List all frames with user's owned status
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        avatarFrame: true,
        ownedFrames: { select: { frameKey: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ownedKeys = new Set(user.ownedFrames.map((f) => f.frameKey));

    const frames = AVATAR_FRAMES.map((frame) => ({
      ...frame,
      owned: frame.category === "free" || ownedKeys.has(frame.key),
      equipped: user.avatarFrame === frame.key,
    }));

    return NextResponse.json({
      frames,
      currentFrame: user.avatarFrame,
    });
  } catch (error) {
    console.error("Error fetching frames:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Buy or equip a frame
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { frameKey, action } = body;

    if (!frameKey || !action) {
      return NextResponse.json(
        { error: "frameKey and action are required" },
        { status: 400 }
      );
    }

    if (action !== "buy" && action !== "equip") {
      return NextResponse.json(
        { error: "action must be 'buy' or 'equip'" },
        { status: 400 }
      );
    }

    const frame = getFrame(frameKey);
    if (frame.key !== frameKey) {
      return NextResponse.json(
        { error: "Invalid frame key" },
        { status: 400 }
      );
    }

    if (action === "equip") {
      // Check if user owns it (free frames are always owned)
      if (frame.category === "premium") {
        const owned = await prisma.userOwnedFrame.findUnique({
          where: {
            userId_frameKey: { userId: session.userId, frameKey },
          },
        });
        if (!owned) {
          return NextResponse.json(
            { error: "You don't own this frame" },
            { status: 403 }
          );
        }
      }

      const user = await prisma.user.update({
        where: { id: session.userId },
        data: { avatarFrame: frameKey },
        select: { avatarFrame: true },
      });

      return NextResponse.json({ success: true, currentFrame: user.avatarFrame });
    }

    // action === "buy"
    if (frame.category === "free") {
      return NextResponse.json(
        { error: "This frame is free, just equip it" },
        { status: 400 }
      );
    }

    // Check if already owned
    const alreadyOwned = await prisma.userOwnedFrame.findUnique({
      where: {
        userId_frameKey: { userId: session.userId, frameKey },
      },
    });
    if (alreadyOwned) {
      return NextResponse.json(
        { error: "You already own this frame" },
        { status: 409 }
      );
    }

    // Check points
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    if (wallet.points < frame.pointsCost) {
      return NextResponse.json(
        {
          error: "Insufficient points",
          required: frame.pointsCost,
          available: wallet.points,
        },
        { status: 400 }
      );
    }

    // Execute purchase in transaction: deduct points, create ownership, equip
    const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Deduct points
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          points: { decrement: frame.pointsCost },
        },
      });

      // Record transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "points_redeemed",
          amount: -frame.pointsCost,
          description: `Purchased avatar frame: ${frame.nameEn}`,
        },
      });

      // Create ownership record
      await tx.userOwnedFrame.create({
        data: {
          userId: session.userId,
          frameKey,
        },
      });

      // Equip the frame
      const user = await tx.user.update({
        where: { id: session.userId },
        data: { avatarFrame: frameKey },
        select: { avatarFrame: true },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      currentFrame: result.avatarFrame,
      pointsSpent: frame.pointsCost,
    });
  } catch (error) {
    console.error("Error with frame action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
