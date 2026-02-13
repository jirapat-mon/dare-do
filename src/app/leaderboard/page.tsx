"use client";

import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import RankBadge from "@/components/RankBadge";
import StreakFire from "@/components/StreakFire";
import { useEffect, useState, useCallback } from "react";

type Period = "weekly" | "monthly" | "alltime";

interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  lifetimePoints: number;
  streak: number;
  badgeCount: number;
}

interface CurrentUser {
  position: number;
  points: number;
  lifetimePoints: number;
  streak: number;
  badgeCount: number;
  name: string;
  userId: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: CurrentUser | null;
}

const PERIODS: Period[] = ["weekly", "monthly", "alltime"];

const PERIOD_KEYS: Record<Period, string> = {
  weekly: "leaderboard.weekly",
  monthly: "leaderboard.monthly",
  alltime: "leaderboard.allTime",
};

export default function LeaderboardPage() {
  const { t } = useI18n();
  const [period, setPeriod] = useState<Period>("weekly");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLeaderboard = useCallback(async (p: Period) => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/gamification/leaderboard?period=${p}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period, fetchLeaderboard]);

  const handlePeriodChange = (p: Period) => {
    if (p !== period) setPeriod(p);
  };

  const leaderboard = data?.leaderboard ?? [];
  const currentUser = data?.currentUser ?? null;
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Check if current user is already visible in the list
  const currentUserInList = currentUser
    ? leaderboard.some((e) => e.userId === currentUser.userId)
    : false;

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">{t("leaderboard.title")}</h1>

        {/* Period Tabs */}
        <div className="flex gap-1 mb-8 border-b border-[#222]">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                period === p
                  ? "text-orange-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t(PERIOD_KEYS[p] as any)}
              {period === p && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t" />
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        )}

        {/* Error / Empty */}
        {!loading && (error || leaderboard.length === 0) && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-gray-400 text-lg">{t("leaderboard.empty")}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && leaderboard.length > 0 && (
          <>
            {/* Podium - Top 3 */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-10">
              {/* 2nd place */}
              {top3[1] && (
                <PodiumCard
                  entry={top3[1]}
                  position={2}
                  currentUserId={currentUser?.userId}
                  t={t}
                />
              )}
              {/* 1st place */}
              {top3[0] && (
                <PodiumCard
                  entry={top3[0]}
                  position={1}
                  currentUserId={currentUser?.userId}
                  t={t}
                />
              )}
              {/* 3rd place */}
              {top3[2] && (
                <PodiumCard
                  entry={top3[2]}
                  position={3}
                  currentUserId={currentUser?.userId}
                  t={t}
                />
              )}
            </div>

            {/* Rest of leaderboard (4+) */}
            {rest.length > 0 && (
              <div className="rounded-xl border border-[#1A1A1A] overflow-hidden">
                {rest.map((entry, idx) => {
                  const pos = idx + 4;
                  const isCurrentUser =
                    currentUser?.userId === entry.userId;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-3 px-4 py-3 transition ${
                        isCurrentUser
                          ? "bg-orange-500/5 border-l-2 border-l-orange-500"
                          : idx % 2 === 0
                          ? "bg-[#0A0A0A]"
                          : "bg-[#111111]"
                      }`}
                    >
                      {/* Position */}
                      <span className="w-8 text-center text-sm font-bold text-gray-500">
                        {pos}
                      </span>

                      {/* Rank Badge */}
                      <RankBadge
                        lifetimePoints={entry.lifetimePoints}
                        size="sm"
                        showLabel={false}
                      />

                      {/* Name */}
                      <span className="flex-1 font-medium text-sm truncate">
                        {entry.name}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-xs text-orange-400 font-normal">
                            ({t("leaderboard.you")})
                          </span>
                        )}
                      </span>

                      {/* Points */}
                      <span className="text-sm font-semibold text-orange-400 tabular-nums">
                        {entry.points.toLocaleString()} pts
                      </span>

                      {/* Streak */}
                      <StreakFire streak={entry.streak} size="sm" />

                      {/* Badge count */}
                      {entry.badgeCount > 0 && (
                        <span className="text-xs text-gray-500 bg-[#1A1A1A] rounded-full px-2 py-0.5">
                          {entry.badgeCount} 🏅
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Your Position Card (sticky bottom) */}
            {currentUser && !currentUserInList && (
              <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40">
                <div className="bg-[#111111] border border-orange-500/30 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg shadow-black/50">
                  <span className="text-lg font-bold text-orange-400">
                    #{currentUser.position}
                  </span>
                  <RankBadge
                    lifetimePoints={currentUser.lifetimePoints}
                    size="sm"
                    showLabel={false}
                  />
                  <span className="flex-1 font-medium text-sm truncate">
                    {currentUser.name}
                    <span className="ml-1.5 text-xs text-orange-400 font-normal">
                      ({t("leaderboard.you")})
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-orange-400 tabular-nums">
                    {currentUser.points.toLocaleString()} pts
                  </span>
                  <StreakFire streak={currentUser.streak} size="sm" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}

/* ---- Podium Card Component ---- */

const podiumStyles = {
  1: {
    border: "border-yellow-500/60",
    bg: "bg-yellow-500/10",
    glow: "shadow-yellow-500/20",
    height: "md:min-h-[220px]",
    textColor: "text-yellow-400",
    posSize: "text-4xl",
    crown: true,
  },
  2: {
    border: "border-gray-400/40",
    bg: "bg-gray-400/10",
    glow: "shadow-gray-400/10",
    height: "md:min-h-[190px]",
    textColor: "text-gray-300",
    posSize: "text-3xl",
    crown: false,
  },
  3: {
    border: "border-orange-700/40",
    bg: "bg-orange-700/10",
    glow: "shadow-orange-700/10",
    height: "md:min-h-[170px]",
    textColor: "text-orange-600",
    posSize: "text-3xl",
    crown: false,
  },
} as const;

function PodiumCard({
  entry,
  position,
  currentUserId,
  t,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
  currentUserId?: string;
  t: (key: any, params?: Record<string, string>) => string;
}) {
  const style = podiumStyles[position];
  const isCurrentUser = currentUserId === entry.userId;

  return (
    <div
      className={`w-full md:w-44 flex flex-col items-center rounded-2xl border p-4 ${style.border} ${style.bg} ${style.height} shadow-lg ${style.glow} transition-all ${
        isCurrentUser ? "ring-1 ring-orange-500/40" : ""
      }`}
    >
      {/* Crown for 1st */}
      {style.crown && <span className="text-2xl mb-1">👑</span>}

      {/* Position */}
      <span className={`${style.posSize} font-extrabold ${style.textColor}`}>
        {position}
      </span>

      {/* Name */}
      <p className="text-sm font-semibold mt-2 text-center truncate w-full">
        {entry.name}
        {isCurrentUser && (
          <span className="text-xs text-orange-400 font-normal block">
            ({t("leaderboard.you")})
          </span>
        )}
      </p>

      {/* Rank Badge */}
      <div className="mt-2">
        <RankBadge
          lifetimePoints={entry.lifetimePoints}
          size="sm"
        />
      </div>

      {/* Points */}
      <p className="text-orange-400 font-bold text-sm mt-2 tabular-nums">
        {entry.points.toLocaleString()} pts
      </p>

      {/* Streak */}
      <div className="mt-1">
        <StreakFire streak={entry.streak} size="sm" />
      </div>
    </div>
  );
}
