"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import StreakFire from "@/components/StreakFire";
import RankBadge from "@/components/RankBadge";
import { useEffect, useState } from "react";
import {
  getRank,
  getNextRank,
  getStreakLevel,
  getBadgeDefinition,
  STREAK_THRESHOLD,
  type RankDefinition,
  type StreakLevel,
} from "@/lib/gamification";

interface Contract {
  id: string;
  goal: string;
  stakes: number;
  duration: number;
  daysCompleted: number;
  status: "active" | "success" | "failed";
  _count: {
    submissions: number;
  };
}

interface WalletData {
  balance: number;
  points: number;
  streak: number;
}

interface BadgeData {
  id: string;
  key: string;
  earnedAt: string;
}

interface GamificationStats {
  tier: string;
  points: number;
  lifetimePoints: number;
  streak: number;
  rank: RankDefinition;
  nextRank: RankDefinition | null;
  rankProgress: number;
  streakLevel: StreakLevel;
  badges: BadgeData[];
  stats: {
    activeContracts: number;
    completedContracts: number;
  };
}

const statusStyles = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  success: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
};

// Map rank keys to actual CSS hex colors for the progress bar gradient
const rankColors: Record<string, string> = {
  newbie: "#6b7280",
  challenger: "#4ade80",
  warrior: "#60a5fa",
  champion: "#c084fc",
  legend: "#facc15",
};

export default function DashboardPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [gamStats, setGamStats] = useState<GamificationStats | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractsRes, walletRes, statsRes] = await Promise.all([
        fetch("/api/contracts"),
        fetch("/api/wallet"),
        fetch("/api/gamification/stats"),
      ]);

      if (contractsRes.ok) {
        const data = await contractsRes.json();
        setContracts(data.contracts);
      }

      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data.wallet);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setGamStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Derive values — gamification stats take priority, fallback to wallet
  const currentStreak = gamStats?.streak ?? wallet?.streak ?? 0;
  const totalPoints = gamStats?.points ?? wallet?.points ?? 0;
  const lifetimePoints = gamStats?.lifetimePoints ?? totalPoints;
  const hasMultiplier = currentStreak >= STREAK_THRESHOLD;

  const currentRank = gamStats?.rank ?? getRank(lifetimePoints);
  const nextRank = gamStats?.nextRank ?? getNextRank(lifetimePoints);
  const rankProgress = gamStats?.rankProgress ?? 0;
  const streakLevel = gamStats?.streakLevel ?? getStreakLevel(currentStreak);
  const badges = gamStats?.badges ?? [];

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">
              {t({ th: "กำลังโหลด...", en: "Loading..." } as any)}
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
          {/* Page Title */}
          <h1 className="text-2xl font-bold text-white mb-6">
            {t("dashboard.title")}
          </h1>

          {/* ===== Hero Stats Row ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Card 1: Streak Fire */}
            <div
              className="relative overflow-hidden rounded-2xl p-6 border border-orange-500/20"
              style={{
                background:
                  "linear-gradient(135deg, #1a0a00 0%, #111111 50%, #1a0800 100%)",
                boxShadow:
                  currentStreak > 0
                    ? "0 0 30px rgba(234,88,12,0.15), inset 0 0 30px rgba(234,88,12,0.05)"
                    : undefined,
              }}
            >
              {/* Subtle glow orb */}
              {currentStreak > 0 && (
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(249,115,22,0.8) 0%, transparent 70%)",
                  }}
                />
              )}
              <div className="relative z-10">
                <div className="mb-3">
                  <StreakFire streak={currentStreak} size="lg" />
                </div>
                <p className="text-3xl font-extrabold text-white mb-1">
                  {currentStreak}{" "}
                  <span className="text-lg font-normal text-gray-400">
                    {t({ th: "วันติดต่อกัน", en: "day streak" } as any)}
                  </span>
                </p>
                <p className="text-sm text-orange-400/80">
                  {t({ th: streakLevel.nameTh, en: streakLevel.nameEn } as any)}
                </p>
              </div>
            </div>

            {/* Card 2: Rank */}
            <div
              className="relative overflow-hidden rounded-2xl p-6 border border-[#1A1A1A]"
              style={{
                background:
                  "linear-gradient(135deg, #0d0d1a 0%, #111111 50%, #0d0d1a 100%)",
              }}
            >
              <div className="relative z-10">
                <div className="mb-3">
                  <RankBadge lifetimePoints={lifetimePoints} size="lg" />
                </div>

                {/* Rank progress bar */}
                {nextRank ? (
                  <>
                    <div className="bg-[#1A1A1A] rounded-full h-2.5 mb-2 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all duration-700"
                        style={{
                          width: `${rankProgress}%`,
                          background: `linear-gradient(90deg, ${rankColors[currentRank.key] || "#6b7280"}, ${rankColors[nextRank.key] || "#6b7280"})`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {lifetimePoints.toLocaleString()} / {nextRank.minPoints.toLocaleString()}{" "}
                      pts{" "}
                      {t({
                        th: `ถึง ${nextRank.nameTh}`,
                        en: `to ${nextRank.nameEn}`,
                      } as any)}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-yellow-400/70">
                    {t({ th: "แรงค์สูงสุดแล้ว!", en: "Max rank achieved!" } as any)}
                  </p>
                )}
              </div>
            </div>

            {/* Card 3: Points */}
            <Link href="/wallet">
              <div
                className="relative overflow-hidden rounded-2xl p-6 border border-[#1A1A1A] hover:border-orange-500/30 transition-all cursor-pointer group h-full"
                style={{
                  background:
                    "linear-gradient(135deg, #111111 0%, #0f0f0f 100%)",
                }}
              >
                <div className="relative z-10">
                  <p className="text-sm text-gray-400 mb-2">
                    {t({ th: "คะแนนสะสม", en: "Total Points" } as any)}
                  </p>
                  <p className="text-4xl font-extrabold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {totalPoints.toLocaleString()}
                    <span className="text-lg font-normal text-gray-500 ml-1">
                      pts
                    </span>
                  </p>

                  {/* Multiplier badge */}
                  {hasMultiplier && (
                    <span
                      className="inline-flex items-center gap-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold rounded-full px-3 py-1"
                      style={{
                        boxShadow: "0 0 12px rgba(249,115,22,0.3)",
                        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      }}
                    >
                      x1.5 Points Active!
                    </span>
                  )}

                  {!hasMultiplier && (
                    <p className="text-xs text-gray-600">
                      {t({
                        th: `อีก ${STREAK_THRESHOLD - currentStreak} วัน ถึง x1.5`,
                        en: `${STREAK_THRESHOLD - currentStreak} days to x1.5`,
                      } as any)}
                    </p>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-4 right-4 text-gray-600 group-hover:text-orange-400 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* ===== Quick Actions ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <Link
              href="/submit"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-xl px-6 py-4 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 text-lg"
            >
              {/* Camera icon */}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {t({ th: "ส่งหลักฐานวันนี้", en: "Submit Today's Proof" } as any)}
            </Link>

            <Link
              href="/leaderboard"
              className="flex items-center justify-center gap-2 border border-[#333] hover:border-orange-500/40 text-gray-300 hover:text-white font-semibold rounded-xl px-6 py-4 transition-all bg-[#111111] text-lg"
            >
              {/* Trophy icon */}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3h14a1 1 0 011 1v3a6 6 0 01-6 6h-4a6 6 0 01-6-6V4a1 1 0 011-1zM12 13v4m-4 4h8m-4-4v4"
                />
              </svg>
              {t({ th: "ดู Leaderboard", en: "View Leaderboard" } as any)}
            </Link>
          </div>

          {/* ===== Active Contracts ===== */}
          <h2 className="text-xl font-bold text-white mb-4">
            {t("dashboard.activeContracts")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {contracts.length === 0 ? (
              <div className="col-span-full bg-[#111111] border border-[#1A1A1A] rounded-2xl p-12 text-center">
                <p className="text-gray-400 mb-4">
                  {t({
                    th: "คุณยังไม่มีสัญญา",
                    en: "You don't have any contracts yet",
                  } as any)}
                </p>
                <Link
                  href="/create"
                  className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-full px-8 py-3 transition"
                >
                  {t({
                    th: "สร้างสัญญาใหม่",
                    en: "Create New Contract",
                  } as any)}
                </Link>
              </div>
            ) : (
              contracts.map((contract) => {
                const progress = Math.round(
                  (contract.daysCompleted / contract.duration) * 100
                );
                const daysLeft = contract.duration - contract.daysCompleted;

                return (
                  <div
                    key={contract.id}
                    className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#2A2A2A] transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-3">
                        <h3 className="text-lg font-bold text-white truncate">
                          {contract.goal}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t({ th: "วันที่", en: "Day" } as any)}{" "}
                          {contract.daysCompleted}/{contract.duration}
                        </p>
                      </div>
                      <span
                        className={`${statusStyles[contract.status]} border rounded-full px-3 py-1 text-xs font-semibold shrink-0`}
                      >
                        {t(`dashboard.status.${contract.status}`)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="bg-[#1A1A1A] rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-orange-600 to-orange-400 rounded-full h-2.5 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{progress}%</span>
                        {contract.status === "active" && (
                          <span>
                            {t("dashboard.daysLeft", {
                              days: String(daysLeft),
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Messages */}
                    {contract.status === "success" && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 mb-3">
                        <p className="text-sm text-green-400 font-medium">
                          {t({ th: "สำเร็จแล้ว!", en: "Completed!" } as any)}
                        </p>
                      </div>
                    )}
                    {contract.status === "failed" && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 mb-3">
                        <p className="text-sm text-red-400 font-medium">
                          {t({ th: "ไม่สำเร็จ", en: "Failed" } as any)}
                        </p>
                      </div>
                    )}

                    {/* Action Button for active contracts */}
                    {contract.status === "active" && (
                      <Link
                        href="/submit"
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold rounded-lg px-4 py-2.5 transition-all text-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {t("dashboard.submitToday")}
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ===== Recent Badges ===== */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                {t({
                  th: "เหรียญรางวัลล่าสุด",
                  en: "Recent Badges",
                } as any)}
              </h2>
              <Link
                href="/profile"
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                {t({ th: "ดูทั้งหมด →", en: "View all →" } as any)}
              </Link>
            </div>

            {badges.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                {t({
                  th: "ลุยส่งหลักฐานเพื่อปลดล็อคเหรียญ!",
                  en: "Submit proof to unlock badges!",
                } as any)}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.slice(0, 3).map((badge) => {
                  const def = getBadgeDefinition(badge.key);
                  if (!def) return null;
                  return (
                    <div
                      key={badge.id}
                      className="bg-[#1A1A1A] border border-[#222] rounded-xl p-3 text-center hover:border-orange-500/30 transition-colors"
                    >
                      <div className="text-3xl mb-1">{def.icon}</div>
                      <p className="text-xs font-medium text-white truncate">
                        {t({
                          th: def.nameTh,
                          en: def.nameEn,
                        } as any)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
