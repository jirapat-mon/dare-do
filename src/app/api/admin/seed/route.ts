import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Seed subscription plans (updated pricing + pointsPerMonth)
    const plans = [
      {
        tier: "free",
        name: "Free",
        priceMonthly: 0,
        pointsPerMonth: 0,
        maxContracts: 1,
        features: JSON.stringify([
          "1 Contract",
          "Basic Streak",
          "Daily Submissions",
        ]),
        stripePriceId: null,
      },
      {
        tier: "starter",
        name: "Starter",
        priceMonthly: 99,
        pointsPerMonth: 100,
        maxContracts: 3,
        features: JSON.stringify([
          "3 Contracts",
          "100 Points/Month",
          "Streak Rewards",
          "Daily Submissions",
        ]),
        stripePriceId: null,
      },
      {
        tier: "pro",
        name: "Pro",
        priceMonthly: 299,
        pointsPerMonth: 500,
        maxContracts: 999,
        features: JSON.stringify([
          "Unlimited Contracts",
          "500 Points/Month",
          "All Features",
          "Priority Support",
          "Badges",
        ]),
        stripePriceId: null,
      },
    ];

    for (const plan of plans) {
      await prisma.subscriptionPlan.upsert({
        where: { tier: plan.tier },
        update: {
          name: plan.name,
          priceMonthly: plan.priceMonthly,
          pointsPerMonth: plan.pointsPerMonth,
          maxContracts: plan.maxContracts,
          features: plan.features,
          stripePriceId: plan.stripePriceId,
        },
        create: plan,
      });
    }

    // Remove old "basic" tier if it still exists
    await prisma.subscriptionPlan
      .delete({ where: { tier: "basic" } })
      .catch(() => {
        // Ignore if not found
      });

    // Seed platform wallet (create if not exists)
    const existingWallet = await prisma.platformWallet.findFirst();
    if (!existingWallet) {
      await prisma.platformWallet.create({
        data: { balance: 0, totalRevenue: 0 },
      });
    }

    // Seed rewards with real product images
    const rewards = [
      {
        name: "Starbucks Gift Card ฿100",
        nameTh: "บัตรของขวัญ Starbucks ฿100",
        description: "Enjoy a Starbucks gift card worth ฿100",
        descriptionTh: "บัตรของขวัญ Starbucks มูลค่า ฿100",
        pointsCost: 500,
        imageUrl:
          "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400&h=400&fit=crop",
        category: "gift_card",
        stock: -1,
        isActive: true,
      },
      {
        name: "LINE Gift Card ฿200",
        nameTh: "บัตรของขวัญ LINE ฿200",
        description: "LINE gift card worth ฿200 for stickers, themes, and more",
        descriptionTh: "บัตรของขวัญ LINE มูลค่า ฿200 สำหรับสติกเกอร์ ธีม และอื่นๆ",
        pointsCost: 1000,
        imageUrl:
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
        category: "gift_card",
        stock: -1,
        isActive: true,
      },
      {
        name: "AirPods 4",
        nameTh: "AirPods 4",
        description: "Apple AirPods 4 with active noise cancellation",
        descriptionTh: "Apple AirPods 4 พร้อมระบบตัดเสียงรบกวน",
        pointsCost: 5000,
        imageUrl:
          "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop",
        category: "gadget",
        stock: -1,
        isActive: true,
      },
      {
        name: "JBL Flip 6 Speaker",
        nameTh: "ลำโพง JBL Flip 6",
        description: "Portable waterproof Bluetooth speaker",
        descriptionTh: "ลำโพงบลูทูธพกพากันน้ำ",
        pointsCost: 4000,
        imageUrl:
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
        category: "gadget",
        stock: -1,
        isActive: true,
      },
      {
        name: "Nintendo Switch Lite",
        nameTh: "Nintendo Switch Lite",
        description: "Portable gaming console for on-the-go play",
        descriptionTh: "เครื่องเล่นเกมพกพา Nintendo Switch Lite",
        pointsCost: 10000,
        imageUrl:
          "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop",
        category: "gadget",
        stock: -1,
        isActive: true,
      },
      {
        name: "iPad 10th Gen",
        nameTh: "iPad รุ่นที่ 10",
        description: "Apple iPad 10th generation with A14 Bionic chip",
        descriptionTh: "Apple iPad รุ่นที่ 10 พร้อมชิป A14 Bionic",
        pointsCost: 15000,
        imageUrl:
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
        category: "gadget",
        stock: -1,
        isActive: true,
      },
      {
        name: "iPhone 16",
        nameTh: "iPhone 16",
        description: "Apple iPhone 16 with A18 chip and advanced camera",
        descriptionTh: "Apple iPhone 16 พร้อมชิป A18 และกล้องขั้นสูง",
        pointsCost: 40000,
        imageUrl:
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop",
        category: "gadget",
        stock: -1,
        isActive: true,
      },
      {
        name: "MacBook Air M4",
        nameTh: "MacBook Air M4",
        description: "Apple MacBook Air with M4 chip, ultra-thin and powerful",
        descriptionTh: "Apple MacBook Air ชิป M4 บางเบาทรงพลัง",
        pointsCost: 50000,
        imageUrl:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
        category: "gadget",
        stock: -1,
        isActive: true,
      },
      {
        name: "Nike Gift Card ฿500",
        nameTh: "บัตรของขวัญ Nike ฿500",
        description: "Nike gift card worth ฿500 for shoes, apparel, and gear",
        descriptionTh: "บัตรของขวัญ Nike มูลค่า ฿500 สำหรับรองเท้า เสื้อผ้า และอุปกรณ์",
        pointsCost: 2500,
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
        category: "lifestyle",
        stock: -1,
        isActive: true,
      },
      {
        name: "Netflix Premium 3 Months",
        nameTh: "Netflix Premium 3 เดือน",
        description: "3-month Netflix Premium subscription with 4K Ultra HD",
        descriptionTh: "สมาชิก Netflix Premium 3 เดือน รองรับ 4K Ultra HD",
        pointsCost: 3000,
        imageUrl:
          "https://images.unsplash.com/photo-1574375927938-d5a98e8d7e28?w=400&h=400&fit=crop",
        category: "lifestyle",
        stock: -1,
        isActive: true,
      },
    ];

    for (const reward of rewards) {
      await prisma.reward.upsert({
        where: { name: reward.name },
        update: {
          nameTh: reward.nameTh,
          description: reward.description,
          descriptionTh: reward.descriptionTh,
          pointsCost: reward.pointsCost,
          imageUrl: reward.imageUrl,
          category: reward.category,
          stock: reward.stock,
          isActive: reward.isActive,
        },
        create: reward,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Seeded 3 subscription plans, platform wallet, and 10 rewards",
    });
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
