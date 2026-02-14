import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { PROVINCES } from "@/lib/provinces";

// Instagram-style display names with Thai flair
const DISPLAY_NAMES = [
  "ปังมาก.exe", "นุ่น_fitlife", "เจ_ชิลล์ๆ", "มิ้นท์.run", "บีม_grind",
  "แพร_healthy", "ก้อง.daily", "ไอซ์_noexcuse", "ฟ้า.warrior", "เอม_savage",
  "นัท.hustle", "ออม_glow", "พีท.beast", "มุก_shine", "ต้น.vibes",
  "แจน_momentum", "โอ๊ต.level.up", "ปิง_focus", "เมย์.strong", "กิ๊ก_active",
  "บอส.unstop", "พลอย_fire", "เจมส์.dare", "แนน_grinder", "ท็อป.alpha",
  "มายด์_zen", "กัน.nonstop", "ปอ_champ", "เฟิร์น.rise", "แบงค์_legend",
  "หมิว_spark", "เต้.commit", "เบล_power", "ไนท์.owl", "มิว_earlybird",
  "แอน.streak", "บิ๊ก_iron", "หนึ่ง.goal", "เนย_discipline", "ตั้ม.prove",
  "เกม_winner", "ใหม่.fresh", "ปลา_swim", "ชมพู.grit", "ดิว_steady",
  "ปู_crusher", "แม็ก.max", "ลูกตาล_sweet", "จ๊ะจ๋า.fun", "เค_machine",
  "ว่าน.วิ่ง", "หนุ่ย_push", "กุ๊ก.cook", "ส้ม_juicy", "โม_flow",
  "จี้.เจ๋ง", "พี่เบิร์ด.fly", "น้อง.กล้า", "แพท_fit", "จีน.strong.af",
];

const GOALS = [
  "ออกกำลังกายทุกวัน", "อ่านหนังสือ 30 นาที", "เขียนไดอารี่", "ทำสมาธิ 15 นาที",
  "วิ่ง 5 กม.", "เรียนภาษาอังกฤษ", "กินอาหารสุขภาพ", "นอนก่อน 4 ทุ่ม",
  "ไม่กินขนม", "ดื่มน้ำ 8 แก้ว", "เขียนโค้ด 2 ชม.", "ยืดเหยียดร่างกาย",
  "ไม่เล่นมือถือก่อนนอน", "ทำอาหารเอง", "เดิน 10,000 ก้าว",
];

const SUBMISSION_NOTES = [
  "ทำเสร็จแล้ววันนี้!", "วันนี้ทำได้ดีมาก", "ไม่ยอมแพ้", "สู้ๆ ทุกวัน",
  "ครบแล้ววันนี้", "เหนื่อยแต่สำเร็จ", "วันนี้ทำได้!", "ง่ายมาก",
  "ยากนิดหน่อยแต่ผ่าน", "ทำจนเป็นนิสัยแล้ว", "อีกวันที่สำเร็จ",
  "ทำครบตามเป้า", null, null, null,
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
      const baseName = DISPLAY_NAMES[i % DISPLAY_NAMES.length];
      const name = i < DISPLAY_NAMES.length ? baseName : `${baseName}${randomBetween(1, 99)}`;
      const email = `${name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || `user${i}`}_${i}@daredo.app`;

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
      const initialPoints = tier === "pro"
        ? randomBetween(500, 5000)
        : tier === "starter"
          ? randomBetween(100, 2000)
          : randomBetween(0, 500);
      const lockedPoints = tier === "free" ? 0 : randomBetween(0, Math.floor(initialPoints * 0.5));

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
              points: initialPoints,
              lockedPoints,
              streak,
              lastActiveAt: new Date(Date.now() - randomBetween(0, 7) * 24 * 60 * 60 * 1000),
            },
          },
        },
      });

      // Create 1-3 contracts with submissions
      const numContracts = randomBetween(1, 3);
      for (let j = 0; j < numContracts; j++) {
        const duration = randomItem([7, 14, 30, 60]);
        const daysCompleted = randomBetween(0, duration);
        const status = daysCompleted >= duration ? "success" : j === 0 ? "active" : randomItem(["active", "success", "failed"] as const);
        const contractPointsStaked = tier === "free" ? 0 : randomBetween(0, 500);
        const goal = randomItem(GOALS);

        const contract = await prisma.contract.create({
          data: {
            userId: user.id,
            goal,
            duration,
            deadline: `${randomBetween(6, 23).toString().padStart(2, "0")}:00`,
            pointsStaked: contractPointsStaked,
            status,
            daysCompleted: Math.min(daysCompleted, duration),
          },
        });

        // Create submissions for completed days (realistic activity)
        const numSubmissions = Math.min(daysCompleted, randomBetween(1, Math.min(daysCompleted, 10)));
        for (let s = 0; s < numSubmissions; s++) {
          const daysAgo = randomBetween(0, Math.min(daysCompleted, 30));
          const submissionStatus = randomItem(["approved", "approved", "approved", "pending"] as const);
          await prisma.submission.create({
            data: {
              contractId: contract.id,
              imageData: `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#${Math.floor(Math.random()*16777215).toString(16).padStart(6,"0")}" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="12">${goal.slice(0, 8)}</text></svg>`).toString("base64")}`,
              note: randomItem(SUBMISSION_NOTES),
              status: submissionStatus,
              createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - randomBetween(0, 12) * 60 * 60 * 1000),
            },
          });
        }
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
