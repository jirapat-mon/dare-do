import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let platformWallet = await prisma.platformWallet.findFirst();

    if (!platformWallet) {
      platformWallet = await prisma.platformWallet.create({
        data: { balance: 0, totalRevenue: 0 },
      });
    }

    const transactions = await prisma.platformTransaction.findMany({
      where: { platformWalletId: platformWallet.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const subscriberCounts = await prisma.user.groupBy({
      by: ["subscriptionTier"],
      _count: { id: true },
    });

    return NextResponse.json({
      wallet: {
        balance: platformWallet.balance,
        totalRevenue: platformWallet.totalRevenue,
      },
      subscribers: subscriberCounts.reduce(
        (acc: Record<string, number>, item) => {
          acc[item.subscriptionTier] = item._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
      transactions,
    });
  } catch (error) {
    console.error("Error fetching revenue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
