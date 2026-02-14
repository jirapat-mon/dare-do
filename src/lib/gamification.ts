// DareDo Gamification Configuration
// All constants for points, ranks, badges, streaks

export type SubscriptionTier = "free" | "starter" | "pro";

// --- Points per approved submission ---
export const POINTS_PER_TIER: Record<SubscriptionTier, number> = {
  free: 5,
  starter: 15,
  pro: 50,
};

// --- Streak multiplier (kicks in at STREAK_THRESHOLD days) ---
export const STREAK_MULTIPLIER: Record<SubscriptionTier, number> = {
  free: 1,
  starter: 2,
  pro: 3,
};

export const STREAK_THRESHOLD = 7; // days before multiplier activates

// --- Completion bonus (when contract finishes successfully) ---
export const COMPLETION_BONUS: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 200,
  pro: 500,
};

// --- Streak Insurance ---
export const INSURANCE_COST = 200; // points to use insurance
export const INSURANCE_LIMIT: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 2,
  pro: 5,
};

// --- Rank System (based on lifetime points) ---
export interface RankDefinition {
  key: string;
  nameTh: string;
  nameEn: string;
  minPoints: number;
  color: string; // tailwind color class
  bgColor: string; // tailwind bg class
  icon: string;
}

export const RANKS: RankDefinition[] = [
  { key: "newbie", nameTh: "มือใหม่", nameEn: "Newbie", minPoints: 0, color: "text-gray-400", bgColor: "bg-gray-500/20", icon: "🌱" },
  { key: "challenger", nameTh: "ผู้ท้าทาย", nameEn: "Challenger", minPoints: 500, color: "text-green-400", bgColor: "bg-green-500/20", icon: "⚡" },
  { key: "warrior", nameTh: "นักรบ", nameEn: "Warrior", minPoints: 2000, color: "text-blue-400", bgColor: "bg-blue-500/20", icon: "⚔️" },
  { key: "champion", nameTh: "แชมป์", nameEn: "Champion", minPoints: 10000, color: "text-purple-400", bgColor: "bg-purple-500/20", icon: "👑" },
  { key: "legend", nameTh: "ตำนาน", nameEn: "Legend", minPoints: 50000, color: "text-yellow-400", bgColor: "bg-yellow-500/20", icon: "✨" },
];

export function getRank(lifetimePoints: number): RankDefinition {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (lifetimePoints >= RANKS[i].minPoints) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(lifetimePoints: number): RankDefinition | null {
  const currentRank = getRank(lifetimePoints);
  const idx = RANKS.findIndex((r) => r.key === currentRank.key);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

// --- Streak Fire Levels ---
export interface StreakLevel {
  key: string;
  nameTh: string;
  nameEn: string;
  minDays: number;
  flames: number; // 1-5 for visual size
}

export const STREAK_LEVELS: StreakLevel[] = [
  { key: "none", nameTh: "ไม่มี", nameEn: "None", minDays: 0, flames: 0 },
  { key: "spark", nameTh: "ประกายไฟ", nameEn: "Spark", minDays: 1, flames: 1 },
  { key: "flame", nameTh: "เปลวไฟ", nameEn: "Flame", minDays: 7, flames: 2 },
  { key: "blaze", nameTh: "ไฟลุก", nameEn: "Blaze", minDays: 14, flames: 3 },
  { key: "inferno", nameTh: "อินเฟอร์โน", nameEn: "Inferno", minDays: 30, flames: 4 },
  { key: "legendary", nameTh: "ตำนาน", nameEn: "Legendary", minDays: 100, flames: 5 },
];

export function getStreakLevel(streak: number): StreakLevel {
  for (let i = STREAK_LEVELS.length - 1; i >= 0; i--) {
    if (streak >= STREAK_LEVELS[i].minDays) return STREAK_LEVELS[i];
  }
  return STREAK_LEVELS[0];
}

// --- Badge Definitions ---
export interface BadgeDefinition {
  key: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  icon: string;
  category: "streak" | "submission" | "contract" | "points" | "special";
}

export const BADGES: BadgeDefinition[] = [
  {
    key: "first_blood",
    nameTh: "เริ่มต้นแล้ว",
    nameEn: "First Blood",
    descriptionTh: "ส่งหลักฐานครั้งแรกสำเร็จ",
    descriptionEn: "First approved submission",
    icon: "🎯",
    category: "submission",
  },
  {
    key: "week_warrior",
    nameTh: "นักรบ 7 วัน",
    nameEn: "Week Warrior",
    descriptionTh: "Streak ติดต่อกัน 7 วัน",
    descriptionEn: "7-day streak",
    icon: "⚔️",
    category: "streak",
  },
  {
    key: "iron_will",
    nameTh: "เจตนาเหล็ก",
    nameEn: "Iron Will",
    descriptionTh: "Streak ติดต่อกัน 30 วัน",
    descriptionEn: "30-day streak",
    icon: "🛡️",
    category: "streak",
  },
  {
    key: "century",
    nameTh: "ร้อยวัน",
    nameEn: "Century",
    descriptionTh: "Streak ติดต่อกัน 100 วัน",
    descriptionEn: "100-day streak",
    icon: "💯",
    category: "streak",
  },
  {
    key: "contract_master",
    nameTh: "จบสัญญา",
    nameEn: "Contract Master",
    descriptionTh: "ทำ contract สำเร็จครั้งแรก",
    descriptionEn: "Complete your first contract",
    icon: "📜",
    category: "contract",
  },
  {
    key: "five_contracts",
    nameTh: "5 สัญญา",
    nameEn: "Five Timer",
    descriptionTh: "ทำ contract สำเร็จ 5 ครั้ง",
    descriptionEn: "Complete 5 contracts",
    icon: "🏆",
    category: "contract",
  },
  {
    key: "early_bird",
    nameTh: "ตื่นเช้า",
    nameEn: "Early Bird",
    descriptionTh: "ส่งหลักฐานก่อน 7 โมงเช้า 7 วัน",
    descriptionEn: "Submit before 7am for 7 days",
    icon: "🌅",
    category: "special",
  },
  {
    key: "night_owl",
    nameTh: "นกฮูก",
    nameEn: "Night Owl",
    descriptionTh: "ส่งหลักฐานหลัง 4 ทุ่ม 7 วัน",
    descriptionEn: "Submit after 10pm for 7 days",
    icon: "🦉",
    category: "special",
  },
  {
    key: "point_collector",
    nameTh: "นักสะสม",
    nameEn: "Point Collector",
    descriptionTh: "สะสม 1,000 points",
    descriptionEn: "Earn 1,000 lifetime points",
    icon: "⭐",
    category: "points",
  },
  {
    key: "big_spender",
    nameTh: "นักช้อป",
    nameEn: "Big Spender",
    descriptionTh: "ใช้ 1,000 points",
    descriptionEn: "Spend 1,000 points",
    icon: "💎",
    category: "points",
  },
];

export function getBadgeDefinition(key: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.key === key);
}

// --- Contract Limits per Tier ---
export const TIER_LIMITS: Record<string, number | null> = {
  free: 1,
  starter: 5,
  pro: null, // unlimited
};

export const MAX_CONTRACTS = TIER_LIMITS; // alias

// --- Monthly Bonus Points (granted on subscription renewal) ---
export const MONTHLY_BONUS_POINTS: Record<string, number> = {
  free: 0,
  starter: 200,
  pro: 1000,
};

// --- Stake Bonus Percent (extra % returned on contract success) ---
export const STAKE_BONUS_PERCENT: Record<string, number> = {
  free: 0,
  starter: 10,
  pro: 25,
};

// --- Points Stake Presets (UI preset amounts for staking) ---
export const POINTS_STAKE_PRESETS = [0, 50, 100, 200, 500];

// --- Stake Return Calculator ---
export function calculateStakeReturn(
  tier: string,
  stakedPoints: number
): { returnAmount: number; bonusAmount: number } {
  const bonusPercent = STAKE_BONUS_PERCENT[tier] || 0;
  const bonusAmount = Math.round(stakedPoints * bonusPercent / 100);
  return {
    returnAmount: stakedPoints + bonusAmount,
    bonusAmount,
  };
}

// --- Points Calculation Helper ---
export function calculatePoints(
  tier: SubscriptionTier,
  currentStreak: number
): number {
  const base = POINTS_PER_TIER[tier];
  const multiplier = currentStreak >= STREAK_THRESHOLD ? STREAK_MULTIPLIER[tier] : 1;
  return Math.round(base * multiplier);
}
