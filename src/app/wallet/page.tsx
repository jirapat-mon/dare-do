"use client";

import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

export default function WalletPage() {
  const { t } = useI18n();

  // Mock transaction data
  const transactions = [
    {
      type: "deposit",
      desc: { th: "มัดจำ: วิ่ง 5 กม.", en: "Deposit: Run 5 km" },
      amount: -1000,
      date: { th: "14 ก.พ.", en: "14 Feb" },
    },
    {
      type: "refund",
      desc: { th: "คืนเงิน: ตื่นเช้า (95%)", en: "Refund: Wake up early (95%)" },
      amount: 475,
      date: { th: "13 ก.พ.", en: "13 Feb" },
    },
    {
      type: "points",
      desc: { th: "แลก Points: ฿25 credit", en: "Redeem Points: ฿25 credit" },
      amount: 25,
      date: { th: "10 ก.พ.", en: "10 Feb" },
    },
    {
      type: "deposit",
      desc: { th: "มัดจำ: อ่านหนังสือ", en: "Deposit: Read books" },
      amount: -300,
      date: { th: "8 ก.พ.", en: "8 Feb" },
    },
    {
      type: "failed",
      desc: { th: "ยึดเงิน: ออกกำลังกาย", en: "Forfeited: Exercise" },
      amount: -500,
      date: { th: "5 ก.พ.", en: "5 Feb" },
    },
  ];

  // Streak calendar data (30 days)
  type DayStatus = "completed" | "today" | "future" | "failed";
  const streakDays: DayStatus[] = Array.from({ length: 30 }, (_, i) => {
    if (i < 12) return "completed" as DayStatus;
    if (i === 12) return "today" as DayStatus;
    return "future" as DayStatus;
  });

  const currentStreak = 12;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-6 mb-6">
            <h1 className="text-xl font-semibold mb-4">
              {t({ th: "กระเป๋าเงิน DareDo", en: "DareDo Wallet" })}
            </h1>
            <div className="mb-6">
              <div className="text-4xl font-black text-white mb-1">฿2,450</div>
              <div className="text-white/80 text-sm">
                {t({ th: "ยอดเงินคงเหลือ", en: "Available Balance" })}
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                {t({ th: "เติมเงิน", en: "Top Up" })}
              </button>
              <button className="flex-1 border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition">
                {t({ th: "ถอนเงิน", en: "Withdraw" })}
              </button>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <div className="text-2xl font-bold text-orange-500">1,250 Points</div>
                </div>
              </div>
              <Link
                href="/rewards"
                className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition text-sm"
              >
                {t({ th: "แลกรางวัล", en: "Redeem" })}
              </Link>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">
                {t({
                  th: "อีก 750 pts ถึง Silver",
                  en: "750 pts to Silver tier",
                })}
              </div>
              <div className="w-full bg-[#1A1A1A] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-orange-500 h-full transition-all duration-300"
                  style={{ width: "62.5%" }}
                />
              </div>
            </div>
          </div>

          {/* Streak Section */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {t({ th: "ความต่อเนื่อง", en: "Streak" })}
              </h2>
              {currentStreak >= 7 && (
                <div className="bg-orange-500/20 text-orange-500 px-4 py-1 rounded-full text-sm font-semibold">
                  x1.5 Points Multiplier
                </div>
              )}
            </div>
            <div className="text-3xl font-bold mb-6 flex items-center gap-2">
              <span>🔥</span>
              <span>
                {currentStreak}{" "}
                {t({ th: "วันติดต่อกัน", en: "Day Streak" })}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {streakDays.map((status, i) => (
                <div
                  key={i}
                  className={`
                    aspect-square rounded-full flex items-center justify-center text-xs
                    ${
                      status === "completed"
                        ? "bg-orange-500"
                        : status === "today"
                          ? "bg-orange-500/50 ring-2 ring-orange-500"
                          : status === "failed"
                            ? "bg-red-500/50"
                            : "bg-[#1A1A1A]"
                    }
                  `}
                  title={`Day ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="text-xl font-bold">
                {t({ th: "ประวัติธุรกรรม", en: "Transaction History" })}
              </h2>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {transactions.map((tx, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div
                    className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${
                      tx.amount > 0
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }
                  `}
                  >
                    {tx.amount > 0 ? (
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
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                    ) : (
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
                          d="M17 13l-5 5m0 0l-5-5m5 5V6"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {t(tx.desc)}
                    </div>
                    <div className="text-xs text-gray-400">{t(tx.date)}</div>
                  </div>
                  <div
                    className={`
                    text-lg font-bold
                    ${tx.amount > 0 ? "text-green-500" : "text-red-500"}
                  `}
                  >
                    {tx.amount > 0 ? "+" : ""}฿{Math.abs(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
