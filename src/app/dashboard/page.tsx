"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import { getDailyCode } from "@/lib/daily-code";

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

const statusStyles = {
  active: "bg-green-500/20 text-green-400",
  success: "bg-orange-500/20 text-orange-400",
  failed: "bg-red-500/20 text-red-400",
};

export default function DashboardPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [dailyCode, setDailyCode] = useState("");

  useEffect(() => {
    fetchData();
    setDailyCode(getDailyCode());
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractsRes, walletRes] = await Promise.all([
        fetch("/api/contracts"),
        fetch("/api/wallet"),
      ]);

      if (contractsRes.ok) {
        const data = await contractsRes.json();
        setContracts(data.contracts);
      }

      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = wallet?.points || 0;
  const currentStreak = wallet?.streak || 0;
  const hasMultiplier = currentStreak >= 7;

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t("dashboard.title")}</h1>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Subscription Card */}
          <Link href="/wallet">
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-5 hover:opacity-90 transition cursor-pointer">
              <p className="text-sm text-orange-100 mb-1">
                {t({ th: "สมาชิก", en: "Membership" } as any)}
              </p>
              <p className="text-3xl font-bold text-white">DareDo</p>
            </div>
          </Link>

          {/* Points Card */}
          <Link href="/rewards">
            <div className="bg-[#111111] border border-orange-500/30 rounded-2xl p-5 hover:border-orange-500/50 transition cursor-pointer">
              <p className="text-sm text-gray-400 mb-1">คะแนนสะสม</p>
              <p className="text-3xl font-bold text-white">
                {totalPoints.toLocaleString()} pts
              </p>
            </div>
          </Link>

          {/* Streak Card */}
          <div className="bg-[#111111] border border-orange-500/30 rounded-2xl p-5">
            <p className="text-sm text-gray-400 mb-1">ทำติดต่อกัน</p>
            <p className="text-3xl font-bold text-white">
              🔥 {currentStreak} วัน
            </p>
          </div>
        </div>

        {/* Points Multiplier Banner */}
        {hasMultiplier && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-6">
            <p className="text-sm text-orange-400 text-center">
              🎯 x1.5 Points Multiplier Active!
            </p>
          </div>
        )}

        {/* Daily Code Banner */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-5 mb-8">
          <p className="text-sm text-orange-100">{t("dashboard.dailyCode")}</p>
          <p className="text-3xl font-mono font-bold text-white">{dailyCode}</p>
        </div>

        {/* Active Contracts */}
        <h2 className="text-xl font-bold mb-4">
          {t("dashboard.activeContracts")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              const submittedToday = false; // TODO: check if submitted today
              const pointsEarned = contract._count.submissions * 10; // 10 points per submission

              return (
                <div
                  key={contract.id}
                  className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{contract.goal}</h3>
                    <span
                      className={`${statusStyles[contract.status]} rounded-full px-3 py-1 text-xs font-semibold`}
                    >
                      {t(`dashboard.status.${contract.status}`)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="bg-[#1A1A1A] rounded-full h-3">
                      <div
                        className="bg-orange-500 rounded-full h-3 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Progress Text */}
                  <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span>
                      {t("dashboard.progress")}: {contract.daysCompleted}/
                      {contract.duration}
                    </span>
                    {contract.status === "active" && (
                      <span>
                        {t("dashboard.daysLeft", { days: String(daysLeft) })}
                      </span>
                    )}
                  </div>

                  {/* Points Earned */}
                  <div className="flex items-center justify-end mb-4">
                    <p className="text-sm text-orange-400">
                      +{pointsEarned} pts
                    </p>
                  </div>

                  {/* Success Message */}
                  {contract.status === "success" && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-400">
                        {t({ th: "สำเร็จแล้ว!", en: "Completed!" } as any)}
                      </p>
                    </div>
                  )}

                  {/* Failed Message */}
                  {contract.status === "failed" && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-400">
                        {t({ th: "ไม่สำเร็จ", en: "Failed" } as any)}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  {contract.status === "active" && !submittedToday && (
                    <Link
                      href="/submit"
                      className="block text-center bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-full px-6 py-2 transition"
                    >
                      {t("dashboard.submitToday")}
                    </Link>
                  )}
                  {contract.status === "active" && submittedToday && (
                    <div className="text-center bg-[#333] text-gray-500 rounded-full px-6 py-2 cursor-not-allowed">
                      {t("dashboard.submitted")}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
