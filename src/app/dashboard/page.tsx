"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import StreakFire from "@/components/StreakFire";
import RankBadge from "@/components/RankBadge";
import Avatar from "@/components/Avatar";
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [gamStats, setGamStats] = useState<GamificationStats | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<Contract | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

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

  const handleCancelContract = async (contract: Contract) => {
    setCancelling(true);
    try {
      const res = await fetch("/api/contracts/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract.id }),
      });
      if (res.ok) {
        setCancelConfirm(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || t({ th: "ไม่สามารถยกเลิกสัญญาได้", en: "Failed to cancel contract" }));
      }
    } catch {
      alert(t({ th: "เกิดข้อผิดพลาดในการยกเลิกสัญญา", en: "Error cancelling contract" }));
    } finally {
      setCancelling(false);
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

  // Split contracts by status
  const activeContracts = contracts.filter((c) => c.status === "active");
  const completedContracts = contracts.filter(
    (c) => c.status === "success" || c.status === "failed"
  );

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
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

          {/* ===== 1. Profile Summary Hero Card ===== */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 mb-6 border border-[#1A1A1A]"
            style={{
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)",
            }}
          >
            {/* Subtle glow orb */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(249,115,22,0.6) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10">
              {/* Top row: Avatar + Info + Rank */}
              <div className="flex items-center gap-4 mb-5">
                <Avatar
                  name={user?.name}
                  size="lg"
                  showFrame={true}
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-white truncate">
                    {user?.name || t({ th: "ผู้ใช้", en: "User" } as any)}
                  </h1>
                  <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                </div>
                <RankBadge lifetimePoints={lifetimePoints} size="lg" />
              </div>

              {/* Streak + Points row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <StreakFire streak={currentStreak} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {currentStreak}{" "}
                      <span className="text-gray-400 font-normal">
                        {t({ th: "วัน", en: "days" } as any)}
                      </span>
                    </p>
                    <p className="text-xs text-orange-400/80">
                      {t({ th: streakLevel.nameTh, en: streakLevel.nameEn } as any)}
                    </p>
                  </div>
                </div>

                <div className="w-px h-8 bg-[#333]" />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {totalPoints.toLocaleString()}{" "}
                    <span className="text-gray-400 font-normal">pts</span>
                  </p>
                  {hasMultiplier && (
                    <span
                      className="inline-flex items-center gap-1 text-orange-400 text-xs font-bold"
                      style={{
                        animation:
                          "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      }}
                    >
                      x1.5 Active
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
              </div>

              {/* Rank progress bar */}
              {nextRank ? (
                <div>
                  <div className="bg-[#1A1A1A] rounded-full h-2 overflow-hidden mb-1.5">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${rankProgress}%`,
                        background: `linear-gradient(90deg, ${rankColors[currentRank.key] || "#6b7280"}, ${rankColors[nextRank.key] || "#6b7280"})`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {lifetimePoints.toLocaleString()} /{" "}
                    {nextRank.minPoints.toLocaleString()} pts{" "}
                    {t({
                      th: `ถึง ${nextRank.nameTh}`,
                      en: `to ${nextRank.nameEn}`,
                    } as any)}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-yellow-400/70">
                  {t({ th: "แรงค์สูงสุดแล้ว!", en: "Max rank achieved!" } as any)}
                </p>
              )}
            </div>
          </div>

          {/* ===== 2. Quick Stats Row ===== */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {/* Active Contracts */}
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-3 text-center">
              <p className="text-xl font-bold text-white">
                {activeContracts.length}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                {t({ th: "สัญญา", en: "Active" } as any)}
              </p>
            </div>

            {/* Streak Days */}
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-3 text-center">
              <p className="text-xl font-bold text-orange-400">
                {currentStreak}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                {t({ th: "Streak", en: "Streak" } as any)}
              </p>
            </div>

            {/* Total Points */}
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-3 text-center">
              <p className="text-xl font-bold text-yellow-400">
                {totalPoints.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                {t({ th: "แต้ม", en: "Points" } as any)}
              </p>
            </div>

            {/* Wallet Balance */}
            <Link href="/wallet">
              <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-3 text-center hover:border-orange-500/30 transition-colors group cursor-pointer">
                <p className="text-xl font-bold text-green-400 group-hover:text-green-300 transition-colors">
                  {wallet?.balance?.toLocaleString() ?? 0}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                  {t({ th: "กระเป๋า", en: "Wallet" } as any)}
                </p>
              </div>
            </Link>
          </div>

          {/* ===== 3. Quick Actions ===== */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link
              href="/submit"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-2xl px-4 py-3.5 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
            >
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
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {t({ th: "ส่งหลักฐาน", en: "Submit Proof" } as any)}
            </Link>

            <Link
              href="/leaderboard"
              className="flex items-center justify-center gap-2 border border-[#333] hover:border-orange-500/40 text-gray-300 hover:text-white font-semibold rounded-2xl px-4 py-3.5 transition-all bg-[#111111]"
            >
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
                  d="M5 3h14a1 1 0 011 1v3a6 6 0 01-6 6h-4a6 6 0 01-6-6V4a1 1 0 011-1zM12 13v4m-4 4h8m-4-4v4"
                />
              </svg>
              {t({ th: "Leaderboard", en: "Leaderboard" } as any)}
            </Link>
          </div>

          {/* ===== 4. Active Contracts Section ===== */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full bg-green-500"
                style={{ boxShadow: "0 0 6px rgba(34,197,94,0.5)" }}
              />
              {t("dashboard.activeContracts")}
              {activeContracts.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({activeContracts.length})
                </span>
              )}
            </h2>

            <div className="space-y-3">
              {activeContracts.length === 0 ? (
                <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-3 opacity-50">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4 text-sm">
                    {t({
                      th: "คุณยังไม่มีสัญญา",
                      en: "You don't have any contracts yet",
                    } as any)}
                  </p>
                  <Link
                    href="/create"
                    className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-full px-6 py-2.5 transition text-sm"
                  >
                    {t({
                      th: "สร้างสัญญาใหม่",
                      en: "Create New Contract",
                    } as any)}
                  </Link>
                </div>
              ) : (
                activeContracts.map((contract) => {
                  const progress = Math.round(
                    (contract.daysCompleted / contract.duration) * 100
                  );
                  const daysLeft = contract.duration - contract.daysCompleted;

                  return (
                    <div
                      key={contract.id}
                      className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 hover:border-[#2A2A2A] transition-colors"
                    >
                      {/* Header: Goal + Status */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-bold text-white flex-1 min-w-0 mr-3 truncate">
                          {contract.goal}
                        </h3>
                        <span className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0">
                          {t(`dashboard.status.${contract.status}`)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="bg-[#1A1A1A] rounded-full h-2">
                          <div
                            className="rounded-full h-2 transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              background:
                                "linear-gradient(90deg, #ea580c, #f97316, #fb923c)",
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                          <span>
                            {t({ th: "วันที่", en: "Day" } as any)}{" "}
                            {contract.daysCompleted}/{contract.duration} ({progress}%)
                          </span>
                          <span>
                            {t("dashboard.daysLeft", {
                              days: String(daysLeft),
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Stakes info */}
                      {contract.stakes > 0 && (
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <svg
                            className="w-3.5 h-3.5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-gray-500">
                            {t({ th: "เดิมพัน", en: "Staked" } as any)}
                          </span>
                          <span className="text-orange-400 font-semibold">
                            &#3647;{contract.stakes.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-600">
                            ({t({ th: "ล็อคอยู่", en: "locked" } as any)})
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          href="/submit"
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold rounded-xl px-4 py-2.5 transition-all text-sm shadow-sm shadow-orange-500/10"
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
                        <button
                          onClick={() => setCancelConfirm(contract)}
                          className="px-3 py-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm"
                          title={t({
                            th: "ยกเลิกสัญญา",
                            en: "Cancel Contract",
                          } as any)}
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ===== 5. Completed / Failed Contracts (Collapsible) ===== */}
          {completedContracts.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center justify-between w-full text-left mb-3 group"
              >
                <h2 className="text-lg font-bold text-gray-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-500" />
                  {t({
                    th: "สัญญาที่จบแล้ว",
                    en: "Past Contracts",
                  } as any)}
                  <span className="text-sm font-normal text-gray-600">
                    ({completedContracts.length})
                  </span>
                </h2>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    showCompleted ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showCompleted && (
                <div className="space-y-3">
                  {completedContracts.map((contract) => {
                    const progress = Math.round(
                      (contract.daysCompleted / contract.duration) * 100
                    );
                    const isSuccess = contract.status === "success";

                    return (
                      <div
                        key={contract.id}
                        className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 opacity-75"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-300 flex-1 min-w-0 mr-3 truncate">
                            {contract.goal}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 border ${
                              isSuccess
                                ? "bg-green-500/15 text-green-400 border-green-500/25"
                                : "bg-red-500/15 text-red-400 border-red-500/25"
                            }`}
                          >
                            {t(`dashboard.status.${contract.status}`)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="bg-[#1A1A1A] rounded-full h-1.5">
                            <div
                              className={`rounded-full h-1.5 transition-all duration-500 ${
                                isSuccess
                                  ? "bg-green-500"
                                  : "bg-red-500/60"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>
                              {contract.daysCompleted}/{contract.duration}{" "}
                              {t({ th: "วัน", en: "days" } as any)}
                            </span>
                            <span>{progress}%</span>
                          </div>
                        </div>

                        {/* Status Message */}
                        {isSuccess && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-green-400 font-medium">
                              {t({ th: "สำเร็จแล้ว!", en: "Completed!" } as any)}
                            </p>
                          </div>
                        )}
                        {!isSuccess && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-red-400 font-medium">
                              {t({ th: "ไม่สำเร็จ", en: "Failed" } as any)}
                            </p>
                          </div>
                        )}

                        {/* Stakes info for completed */}
                        {contract.stakes > 0 && (
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-gray-600">
                              {t({ th: "เดิมพัน:", en: "Staked:" } as any)}
                            </span>
                            <span
                              className={
                                isSuccess
                                  ? "text-green-400 font-semibold"
                                  : "text-red-400 font-semibold line-through"
                              }
                            >
                              &#3647;{contract.stakes.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== 6. Recent Badges ===== */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">
                {t({
                  th: "เหรียญรางวัลล่าสุด",
                  en: "Recent Badges",
                } as any)}
              </h2>
              <Link
                href="/profile"
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                {t({ th: "ดูทั้งหมด", en: "View all" } as any)}
                <span className="ml-1">&#8594;</span>
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

        {/* Cancel Contract Confirmation Modal */}
        {cancelConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">&#9888;&#65039;</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {t({ th: "ยกเลิกสัญญา?", en: "Cancel Contract?" } as any)}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t({
                    th: "การยกเลิกไม่สามารถย้อนกลับได้",
                    en: "This action cannot be undone",
                  } as any)}
                </p>
              </div>

              {/* Contract info */}
              <div className="bg-[#1A1A1A] rounded-xl p-4 mb-4">
                <p className="font-semibold text-white mb-2">
                  {cancelConfirm.goal}
                </p>
                <p className="text-sm text-gray-400">
                  {t({ th: "ความคืบหน้า:", en: "Progress:" } as any)}{" "}
                  {cancelConfirm.daysCompleted}/{cancelConfirm.duration}{" "}
                  {t({ th: "วัน", en: "days" } as any)}
                </p>
              </div>

              {/* Refund breakdown */}
              {cancelConfirm.stakes > 0 ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {t({ th: "เงินเดิมพัน:", en: "Original stake:" } as any)}
                    </span>
                    <span className="text-white font-semibold">
                      &#3647;{cancelConfirm.stakes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {t({ th: "คืน 50%:", en: "50% refund:" } as any)}
                    </span>
                    <span className="text-green-400">
                      &#3647;
                      {Math.floor(cancelConfirm.stakes * 0.5).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {t({
                        th: "หักค่าบริการ 5%:",
                        en: "5% service fee:",
                      } as any)}
                    </span>
                    <span className="text-red-400">
                      -&#3647;
                      {Math.floor(
                        cancelConfirm.stakes * 0.05
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-red-500/20 pt-2 flex justify-between">
                    <span className="text-white font-bold">
                      {t({ th: "ได้รับจริง:", en: "You receive:" } as any)}
                    </span>
                    <span className="text-orange-400 font-bold text-lg">
                      &#3647;
                      {Math.floor(
                        cancelConfirm.stakes * 0.45
                      ).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-red-400 mt-1">
                    {t({ th: "* เสียเงิน", en: "* You lose" } as any)} &#3647;
                    {Math.floor(
                      cancelConfirm.stakes * 0.55
                    ).toLocaleString()}{" "}
                    (
                    {t({
                      th: "55% ของเดิมพัน",
                      en: "55% of stake",
                    } as any)}
                    )
                  </p>
                </div>
              ) : (
                <div className="bg-[#1A1A1A] rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-400 text-center">
                    {t({
                      th: "ไม่มีเงินเดิมพัน — ไม่มีค่าใช้จ่าย",
                      en: "No stake — no cost to cancel",
                    } as any)}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirm(null)}
                  className="flex-1 border border-[#333] text-gray-400 hover:text-white hover:border-white rounded-full py-3 font-semibold transition"
                >
                  {t({ th: "ไม่ยกเลิก", en: "Keep Contract" } as any)}
                </button>
                <button
                  onClick={() => handleCancelContract(cancelConfirm)}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-full py-3 font-semibold transition disabled:opacity-50"
                >
                  {cancelling
                    ? t({
                        th: "กำลังยกเลิก...",
                        en: "Cancelling...",
                      } as any)
                    : t({
                        th: "ยืนยันยกเลิก",
                        en: "Confirm Cancel",
                      } as any)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
