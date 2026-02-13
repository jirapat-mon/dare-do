import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const search = request.nextUrl.searchParams.get("search");

    // Search mode: find users by name/email
    if (search) {
      const users = await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: session.userId } },
            {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          lifetimePoints: true,
          province: true,
        },
        take: 20,
      });

      // Get existing friendships between current user and search results
      const userIds = users.map((u) => u.id);
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { userId: session.userId, friendId: { in: userIds } },
            { userId: { in: userIds }, friendId: session.userId },
          ],
        },
      });

      const usersWithStatus = users.map((user) => {
        const friendship = friendships.find(
          (f) =>
            (f.userId === session.userId && f.friendId === user.id) ||
            (f.userId === user.id && f.friendId === session.userId)
        );
        return {
          ...user,
          friendshipStatus: friendship?.status ?? "none",
          friendshipId: friendship?.id ?? null,
        };
      });

      return NextResponse.json({ users: usersWithStatus });
    }

    // Default: list accepted friends
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [
          { userId: session.userId },
          { friendId: session.userId },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, lifetimePoints: true, province: true },
        },
        friend: {
          select: { id: true, name: true, email: true, lifetimePoints: true, province: true },
        },
      },
    });

    const friends = friendships.map((f) => {
      const friendUser = f.userId === session.userId ? f.friend : f.user;
      return {
        friendshipId: f.id,
        ...friendUser,
      };
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("Error in friends API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
