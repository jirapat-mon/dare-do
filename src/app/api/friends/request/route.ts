import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendId } = await request.json();

    if (!friendId) {
      return NextResponse.json(
        { error: "friendId is required" },
        { status: 400 }
      );
    }

    if (friendId === session.userId) {
      return NextResponse.json(
        { error: "Cannot send friend request to yourself" },
        { status: 400 }
      );
    }

    // Check friend exists
    const friendUser = await prisma.user.findUnique({
      where: { id: friendId },
    });
    if (!friendUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check no existing friendship in either direction
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: session.userId, friendId },
          { userId: friendId, friendId: session.userId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Friendship already exists", status: existing.status },
        { status: 409 }
      );
    }

    const friendship = await prisma.friendship.create({
      data: {
        userId: session.userId,
        friendId,
        status: "pending",
      },
    });

    return NextResponse.json({ friendship }, { status: 201 });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendshipId, action } = await request.json();

    if (!friendshipId || !action) {
      return NextResponse.json(
        { error: "friendshipId and action are required" },
        { status: 400 }
      );
    }

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json(
        { error: "action must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 }
      );
    }

    // Only the receiver can accept/reject
    if (friendship.friendId !== session.userId) {
      return NextResponse.json(
        { error: "Only the request receiver can accept or reject" },
        { status: 403 }
      );
    }

    if (friendship.status !== "pending") {
      return NextResponse.json(
        { error: "Request is no longer pending" },
        { status: 400 }
      );
    }

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: action === "accept" ? "accepted" : "rejected" },
    });

    return NextResponse.json({ friendship: updated });
  } catch (error) {
    console.error("Error updating friend request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendshipId } = await request.json();

    if (!friendshipId) {
      return NextResponse.json(
        { error: "friendshipId is required" },
        { status: 400 }
      );
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 }
      );
    }

    // Either user can unfriend
    if (
      friendship.userId !== session.userId &&
      friendship.friendId !== session.userId
    ) {
      return NextResponse.json(
        { error: "Not authorized to remove this friendship" },
        { status: 403 }
      );
    }

    await prisma.friendship.delete({ where: { id: friendshipId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing friendship:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
