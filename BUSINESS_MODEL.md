# DareDo — Business Model & Product Spec

## Overview

**DareDo** คือ Discipline Challenge Platform ที่ท้าให้ผู้ใช้ "เดิมพันกับตัวเอง" ด้วยการตั้งเป้าหมาย ส่งหลักฐานทุกวัน (ถ่ายรูปสด) และได้รางวัลเมื่อทำสำเร็จ

**Core Loop:** สร้าง Contract → ถ่ายรูปสดทุกวัน → Admin ตรวจ → ได้ Points → สะสม Streak → ปลดล็อค Badges/Rank → แข่ง Leaderboard

**Stack:** Next.js 16, React 19, TypeScript, Prisma 7, PostgreSQL (Neon), Stripe, Tailwind 4

**URL:** https://dare-do.vercel.app

---

## Revenue Model

### Subscription Tiers

| | Free | Starter | Pro |
|---|---|---|---|
| **ราคา** | 0฿/เดือน | 99฿/เดือน | 299฿/เดือน |
| Active Contracts | 1 | 3 | Unlimited |
| Points ต่อ submission | 5 pts | 10 pts | 15 pts |
| Streak Bonus (7+ วัน) | ไม่มี | 1.5x | 2x |
| Reward Shop | Digital เท่านั้น | ทั้งหมด | ทั้งหมด + Premium |
| Streak Insurance | ไม่มี | 1 ครั้ง/contract | 2 ครั้ง/contract |
| Leaderboard | ดูอย่างเดียว | ร่วมแข่ง | ร่วมแข่ง + Badge |

### Revenue Projection (100 paying users, 80% success)

| | จำนวน | ราคา | Revenue |
|---|---|---|---|
| Starter | 70 คน | 99฿ | 6,930฿ |
| Pro | 30 คน | 299฿ | 8,970฿ |
| **Gross** | | | **15,900฿/เดือน** |
| Stripe fee (~4%) | | | -636฿ |
| **Net Revenue** | | | **15,264฿/เดือน** |

### Cost Analysis

| รายการ | ต้นทุน |
|---|---|
| Physical Reward Redemption (est.) | ~500฿/เดือน |
| Infrastructure (Vercel/Neon free tier) | 0฿ |
| **Monthly Profit** | **~14,764฿ (96.7%)** |
| **Worst Case (all physical redeem)** | **~13,507฿ (88.5%)** |

---

## Points Economy

### Earning Points

**Per approved submission:**

| Tier | Base | Streak 7+ days | Streak 14+ days |
|---|---|---|---|
| Free | 5 pts | - | - |
| Starter | 10 pts | 15 pts (1.5x) | 15 pts (1.5x) |
| Pro | 15 pts | 30 pts (2x) | 30 pts (2x) |

**Bonuses:**
- Contract completion bonus: +100 pts (Starter) / +200 pts (Pro)
- Total per 30-day contract: ~515 pts (Starter) / ~995 pts (Pro)

### Spending Points (Points Sinks)

**Digital Rewards (ต้นทุน = 0฿):**

| Reward | Points | ต้นทุน |
|---|---|---|
| Profile Badge | 200 pts | 0฿ |
| Custom Theme | 500 pts | 0฿ |
| Rank Title | 1,000 pts | 0฿ |
| Trophy Animation | 2,000 pts | 0฿ |
| **Streak Insurance** | **200 pts** | **0฿** |

**Physical Rewards (มีต้นทุน):**

| Reward | Points | ต้นทุน | เดือนที่ต้องเก็บ (Starter) |
|---|---|---|---|
| Starbucks 100฿ | 3,000 pts | 100฿ | ~6 เดือน |
| LINE Gift 200฿ | 5,000 pts | 200฿ | ~10 เดือน |
| Gift Card 500฿ | 12,000 pts | 500฿ | ~23 เดือน |

### Points Expiry
- Points หมดอายุหลัง **6 เดือน** นับจากวันที่ได้รับ
- ลด liability ~40-60%

---

## Gamification System

### 1. Streak Fire 🔥

Visual fire icon ที่โตขึ้นตามจำนวนวันติดต่อกัน:

| Streak | Level | Visual |
|---|---|---|
| 1-6 วัน | Spark | 🔥 เล็ก |
| 7-13 วัน | Flame | 🔥🔥 กลาง |
| 14-29 วัน | Blaze | 🔥🔥🔥 ใหญ่ |
| 30+ วัน | Inferno | 🔥🔥🔥🔥 ใหญ่มาก + animation |
| 100+ วัน | Legendary | ✨🔥✨ legendary glow |

### 2. Rank System

Based on **lifetime points earned** (ไม่ลดเมื่อใช้ points):

| Rank | Lifetime Points | Color |
|---|---|---|
| Newbie | 0+ | Gray |
| Challenger | 500+ | Green |
| Warrior | 2,000+ | Blue |
| Champion | 10,000+ | Purple |
| Legend | 50,000+ | Gold + Glow |

### 3. Achievement Badges

| Badge Key | ชื่อ (TH) | Name (EN) | เงื่อนไข |
|---|---|---|---|
| first_blood | เริ่มต้นแล้ว | First Blood | ส่งหลักฐานครั้งแรก |
| week_warrior | นักรบ 7 วัน | Week Warrior | Streak 7 วัน |
| iron_will | เจตนาเหล็ก | Iron Will | Streak 30 วัน |
| century | ร้อยวัน | Century | Streak 100 วัน |
| contract_master | จบสัญญา | Contract Master | ทำ contract สำเร็จครั้งแรก |
| five_contracts | 5 สัญญา | Five Timer | ทำ contract สำเร็จ 5 ครั้ง |
| early_bird | ตื่นเช้า | Early Bird | ส่งก่อน 7 โมงเช้า 7 วัน |
| night_owl | นกฮูก | Night Owl | ส่งหลัง 4 ทุ่ม 7 วัน |
| point_collector | นักสะสม | Point Collector | สะสม 1,000 pts |
| big_spender | นักช้อป | Big Spender | ใช้ 1,000 pts |

### 4. Streak Insurance

- ใช้ **200 points** เพื่อ "พัก" 1 วัน โดย streak ไม่ reset
- จำกัด: Starter = 1 ครั้ง/contract, Pro = 2 ครั้ง/contract
- Free tier ไม่สามารถใช้ได้
- เป็น **points sink** ที่สำคัญ (ต้นทุน = 0฿)

### 5. Leaderboard

- **Weekly Leaderboard** — reset ทุกวันจันทร์
- **Monthly Leaderboard** — reset ทุกต้นเดือน
- **All-Time Leaderboard** — สะสมตลอด
- แสดง: Rank, Avatar, Name, Points, Streak, Badges count
- Free tier: ดูอย่างเดียว / Paid tier: ร่วมแข่ง

---

## Feature Specifications

### Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, how it works, CTA |
| `/login` | Login | Email/Password + Google OAuth |
| `/register` | Register | สมัครสมาชิก |
| `/dashboard` | Dashboard | Contracts, streak fire, rank, quick stats |
| `/create` | Create Contract | สร้างสัญญาใหม่ |
| `/submit` | Submit Evidence | ถ่ายรูปสด (camera only) |
| `/wallet` | Wallet | Points, streak, insurance, transactions |
| `/leaderboard` | Leaderboard | Weekly/Monthly/All-time rankings |
| `/profile` | Profile | Badges, rank, stats, achievements |
| `/rewards` | Rewards | Reward catalog + redemption |
| `/pricing` | Pricing | Subscription plans |
| `/admin` | Admin | Review submissions, revenue, withdrawals |

### API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/gamification/stats` | User's rank, badges, streak, lifetime pts |
| GET | `/api/gamification/leaderboard?period=weekly` | Leaderboard data |
| GET | `/api/gamification/badges` | User's earned badges |
| POST | `/api/gamification/insurance` | Use streak insurance |
| GET | `/api/wallet` | Wallet + gamification data |
| POST | `/api/admin/review` | Review submission (+ award points/streak/badges) |

### Components

| Component | Description |
|---|---|
| `StreakFire` | Animated fire icon based on streak level |
| `RankBadge` | Rank display with color + title |
| `BadgeCard` | Individual badge display (earned/locked) |
| `LeaderboardRow` | Single leaderboard entry |
| `InsuranceModal` | Streak insurance purchase modal |

---

## Technical Architecture

### Database Models (New/Modified)

```
User
  + lifetimePoints  Int @default(0)
  + userBadges      UserBadge[]

UserBadge (NEW)
  - id        String @id
  - userId    String
  - badgeKey  String  // matches BADGES constant
  - earnedAt  DateTime
  - @@unique([userId, badgeKey])

StreakInsurance (NEW)
  - id         String @id
  - walletId   String
  - contractId String
  - usedAt     DateTime
```

### Config Constants (src/lib/gamification.ts)

```typescript
POINTS_PER_TIER = { free: 5, starter: 10, pro: 15 }
STREAK_MULTIPLIER = { free: 1, starter: 1.5, pro: 2 }
STREAK_THRESHOLD = 7  // days before multiplier kicks in
COMPLETION_BONUS = { free: 0, starter: 100, pro: 200 }
INSURANCE_COST = 200  // points
INSURANCE_LIMIT = { free: 0, starter: 1, pro: 2 }
RANKS = [
  { key: "newbie", minPoints: 0, color: "gray" },
  { key: "challenger", minPoints: 500, color: "green" },
  { key: "warrior", minPoints: 2000, color: "blue" },
  { key: "champion", minPoints: 10000, color: "purple" },
  { key: "legend", minPoints: 50000, color: "gold" },
]
BADGES = [ ... ] // See badge definitions above
```

### Points Award Flow (on submission approval)

```
Admin approves submission
  → Calculate base points (by tier)
  → Check streak ≥ 7 → apply multiplier
  → Award points to wallet
  → Add lifetimePoints to user
  → Update streak (+1, set lastActiveAt)
  → Check contract completion → award bonus
  → Check badge conditions → award new badges
  → Create transaction record
```

---

## Design System

- **Theme:** Dark (#0A0A0A bg, #111111 cards, #1A1A1A borders)
- **Accent:** Orange (#FF6B00, gradient to #FF8C00)
- **Rank Colors:** Gray → Green → Blue → Purple → Gold
- **Typography:** Bold headings, clean sans-serif
- **Animations:** Glow pulse, fade-in, streak fire, badge unlock
- **Mobile-first:** Responsive, touch-friendly, camera optimized
