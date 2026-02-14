import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { PROVINCES } from "@/lib/provinces";

// Thai first names
const FIRST_NAMES = [
  "สมชาย", "สมหญิง", "สุดา", "วิชัย", "ประภา", "อนุชา", "พิมพ์", "ธนา",
  "กัลยา", "ชนิดา", "ปิยะ", "นันทนา", "วรรณา", "สุรชัย", "จิราภรณ์", "พงศ์",
  "รัตนา", "มานะ", "ศิริ", "บุญมี", "ขวัญ", "แก้ว", "ทอง", "เพชร",
  "ดาว", "เดือน", "ฟ้า", "น้ำ", "ลม", "ไฟ", "ใจ", "รัก",
  "นิด", "หน่อย", "เล็ก", "ใหญ่", "เก่ง", "ดี", "งาม", "สวย",
];

const LAST_NAMES = [
  "สุขสันต์", "ใจดี", "มั่งมี", "ศรีสุข", "แสงจันทร์", "พลอยงาม",
  "ทองดี", "เจริญ", "สิริมงคล", "วงศ์ประเสริฐ", "บุญส่ง", "สว่าง",
  "อารีย์", "เกษม", "รุ่งเรือง", "พูนสุข", "แก้วมณี", "ศรีทอง",
  "ชัยชนะ", "วัฒนา",
];

const GOALS = [
  "ออกกำลังกายทุกวัน", "อ่านหนังสือ 30 นาที", "เขียนไดอารี่", "ทำสมาธิ 15 นาที",
  "วิ่ง 5 กม.", "เรียนภาษาอังกฤษ", "กินอาหารสุขภาพ", "นอนก่อน 4 ทุ่ม",
  "ไม่กินขนม", "ดื่มน้ำ 8 แก้ว", "เขียนโค้ด 2 ชม.", "ยืดเหยียดร่างกาย",
  "ไม่เล่นมือถือก่อนนอน", "ทำอาหารเอง", "เดิน 10,000 ก้าว",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tiers: Array<{ tier: string; weight: number }> = [
      { tier: "free", weight: 60 },
      { tier: "starter", weight: 25 },
      { tier: "pro", weight: 15 },
    ];

    const provinceCodes = PROVINCES.map((p) => p.code);
    const createdUsers: string[] = [];

    for (let i = 0; i < 180; i++) {
      const firstName = randomItem(FIRST_NAMES);
      const lastName = randomItem(LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const email = `mock_${i + 1}_${Date.now()}@daredo.test`;

      // Weighted tier selection
      const roll = Math.random() * 100;
      let tier = "free";
      let cumulative = 0;
      for (const t of tiers) {
        cumulative += t.weight;
        if (roll < cumulative) {
          tier = t.tier;
          break;
        }
      }

      const province = randomItem(provinceCodes);
      const lifetimePoints = tier === "pro"
        ? randomBetween(2000, 50000)
        : tier === "starter"
          ? randomBetween(500, 10000)
          : randomBetween(0, 2000);

      const streak = randomBetween(0, tier === "pro" ? 100 : tier === "starter" ? 30 : 7);
      const balance = tier === "free" ? 0 : randomBetween(0, 5000);
      const stakes = tier === "free" ? 0 : randomBetween(0, 2000);

      // Create user with wallet and contracts
      const user = await prisma.user.create({
        data: {
          email,
          password: "$2b$10$mock_password_hash_not_real",
          name,
          role: "user",
          lifetimePoints,
          province,
          subscriptionTier: tier,
          subscriptionStatus: tier === "free" ? "inactive" : "active",
          subscriptionEndsAt: tier === "free" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          wallet: {
            create: {
              balance,
              lockedBalance: stakes,
              points: randomBetween(0, lifetimePoints),
              streak,
              lastActiveAt: new Date(Date.now() - randomBetween(0, 7) * 24 * 60 * 60 * 1000),
            },
          },
        },
      });

      // Create 1-3 contracts
      const numContracts = randomBetween(1, 3);
      for (let j = 0; j < numContracts; j++) {
        const duration = randomItem([7, 14, 30, 60]);
        const daysCompleted = randomBetween(0, duration);
        const status = daysCompleted >= duration ? "success" : j === 0 ? "active" : randomItem(["active", "success", "failed"] as const);
        const contractStakes = tier === "free" ? 0 : randomBetween(0, 500);

        await prisma.contract.create({
          data: {
            userId: user.id,
            goal: randomItem(GOALS),
            duration,
            deadline: `${randomBetween(6, 23).toString().padStart(2, "0")}:00`,
            stakes: contractStakes,
            status,
            daysCompleted: Math.min(daysCompleted, duration),
          },
        });
      }

      createdUsers.push(user.id);
    }

    return NextResponse.json({
      success: true,
      created: createdUsers.length,
      message: `Created ${createdUsers.length} mock users with contracts`,
    });
  } catch (error) {
    console.error("Error seeding users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
