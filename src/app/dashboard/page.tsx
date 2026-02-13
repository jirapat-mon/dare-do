"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const contracts = [
  {
    id: 1,
    goal: "วิ่ง 5 กม. ทุกวัน",
    stakes: 1000,
    daysTotal: 30,
    daysCompleted: 12,
    status: "active" as const,
    submittedToday: false,
  },
  {
    id: 2,
    goal: "ตื่นก่อน 6 โมง",
    stakes: 500,
    daysTotal: 14,
    daysCompleted: 14,
    status: "success" as const,
    submittedToday: true,
  },
  {
    id: 3,
    goal: "อ่านหนังสือ 30 นาที",
    stakes: 300,
    daysTotal: 7,
    daysCompleted: 2,
    status: "failed" as const,
    submittedToday: false,
  },
];

const statusStyles = {
  active: "bg-green-500/20 text-green-400",
  success: "bg-orange-500/20 text-orange-400",
  failed: "bg-red-500/20 text-red-400",
};

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("dashboard.title")}</h1>

      {/* Daily Code Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-5 mb-8">
        <p className="text-sm text-orange-100">{t("dashboard.dailyCode")}</p>
        <p className="text-3xl font-mono font-bold text-white">#WIN42</p>
      </div>

      {/* Active Contracts */}
      <h2 className="text-xl font-bold mb-4">
        {t("dashboard.activeContracts")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contracts.map((contract) => {
          const progress = Math.round(
            (contract.daysCompleted / contract.daysTotal) * 100
          );
          const daysLeft = contract.daysTotal - contract.daysCompleted;

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
                  {contract.daysTotal}
                </span>
                <span>
                  {t("dashboard.daysLeft", { days: String(daysLeft) })}
                </span>
              </div>

              {/* Stakes */}
              <p className="text-lg text-orange-500 font-bold mb-4">
                ฿{contract.stakes.toLocaleString()}
              </p>

              {/* Action Button */}
              {contract.status === "active" && !contract.submittedToday && (
                <Link
                  href="/submit"
                  className="block text-center bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-full px-6 py-2 transition"
                >
                  {t("dashboard.submitToday")}
                </Link>
              )}
              {contract.status === "active" && contract.submittedToday && (
                <div className="text-center bg-[#333] text-gray-500 rounded-full px-6 py-2 cursor-not-allowed">
                  {t("dashboard.submitted")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
