"use client";

import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface WalletData {
  id: string;
  balance: number;
  lockedBalance: number;
  points: number;
  streak: number;
  lastActiveAt: string | null;
}

interface SubscriptionData {
  tier: string;
  status: string;
  endsAt: string | null;
}

export default function WalletPage() {
  return (
    <Suspense>
      <WalletContent />
    </Suspense>
  );
}

function WalletContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [cancelLoading, setCancelLoading] = useState(false);

  const subscriptionStatus = searchParams.get("subscription");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, subRes] = await Promise.all([
        fetch("/api/wallet"),
        fetch("/api/subscription/status"),
      ]);

      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data.wallet);
        setTransactions(data.transactions);
      }

      if (subRes.ok) {
        const data = await subRes.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        t({
          th: "ต้องการยกเลิกสมาชิกหรือไม่?",
          en: "Are you sure you want to cancel your subscription?",
        })
      )
    )
      return;

    setCancelLoading(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setCancelLoading(false);
    }
  };

  const currentStreak = wallet?.streak || 0;

  type DayStatus = "completed" | "today" | "future";
  const streakDays: DayStatus[] = Array.from({ length: 30 }, (_, i) => {
    if (i < currentStreak) return "completed" as DayStatus;
    if (i === currentStreak) return "today" as DayStatus;
    return "future" as DayStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("th-TH", { month: "short" });
    const day = date.getDate();
    return `${day} ${month}`;
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "pro":
        return {
          label: "Pro",
          color: "bg-gradient-to-r from-purple-500 to-pink-500",
        };
      case "starter":
        return {
          label: "Starter",
          color: "bg-gradient-to-r from-orange-500 to-yellow-500",
        };
      default:
        return { label: "Free", color: "bg-gray-600" };
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "points_earned":
        return { icon: "+", color: "bg-green-500/20 text-green-500" };
      case "points_redeemed":
        return { icon: "-", color: "bg-red-500/20 text-red-500" };
      case "streak_bonus":
        return { icon: "x", color: "bg-orange-500/20 text-orange-500" };
      case "subscription":
        return { icon: "S", color: "bg-purple-500/20 text-purple-500" };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const tier = subscription?.tier || "free";
  const badge = getTierBadge(tier);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Subscription Success Banner */}
          {subscriptionStatus === "success" && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 rounded-xl px-4 py-3 mb-6">
              {t({
                th: "สมัครสมาชิกสำเร็จ!",
                en: "Subscription activated!",
              })}
            </div>
          )}

          {/* Subscription Status Card */}
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[#1A1A1A] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">
                {t({ th: "สมาชิก DareDo", en: "DareDo Membership" })}
              </h1>
              <span
                className={`${badge.color} text-white text-sm font-bold px-4 py-1 rounded-full`}
              >
                {badge.label}
              </span>
            </div>

            {subscription?.status === "active" && tier !== "free" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-green-400 text-sm font-medium">
                    {t({ th: "สมาชิกใช้งานอยู่", en: "Active Subscription" })}
                  </span>
                </div>
                {subscription.endsAt && (
                  <div className="text-sm text-gray-400">
                    {t({ th: "ต่ออายุ: ", en: "Renews: " })}
                    <span className="text-white">
                      {new Date(subscription.endsAt).toLocaleDateString(
                        "th-TH",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Link
                    href="/pricing"
                    className="flex-1 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition text-center text-sm"
                  >
                    {t({ th: "อัปเกรดแพลน", en: "Upgrade Plan" })}
                  </Link>
                  <button
                    onClick={handleCancel}
                    disabled={cancelLoading}
                    className="flex-1 border border-[#333] text-gray-400 px-6 py-3 rounded-full font-semibold hover:text-white hover:border-white transition text-sm disabled:opacity-50"
                  >
                    {cancelLoading
                      ? t({ th: "กำลังยกเลิก...", en: "Cancelling..." })
                      : t({ th: "ยกเลิกสมาชิก", en: "Cancel" })}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">
                  {t({
                    th: "อัปเกรดเพื่อปลดล็อคสัญญาเพิ่มและฟีเจอร์พิเศษ",
                    en: "Upgrade to unlock more contracts and premium features",
                  })}
                </p>
                <Link
                  href="/pricing"
                  className="block text-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-6 py-3 rounded-full font-semibold transition"
                >
                  {t({ th: "ดูแพลนทั้งหมด", en: "View Plans" })}
                </Link>
              </div>
            )}
          </div>

          {/* Points Card */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <div className="text-2xl font-bold text-orange-500">
                    {wallet?.points.toLocaleString() || "0"} Points
                  </div>
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
                          : "bg-[#1A1A1A]"
                    }
                  `}
                  title={`Day ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Transaction History (Points Activity) */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="text-xl font-bold">
                {t({ th: "ประวัติกิจกรรม", en: "Activity History" })}
              </h2>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {transactions.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400">
                  {t({
                    th: "ยังไม่มีกิจกรรม",
                    en: "No activity yet",
                  })}
                </div>
              ) : (
                transactions.map((tx) => {
                  const special = getTransactionIcon(tx.type);
                  return (
                    <div
                      key={tx.id}
                      className="px-6 py-4 flex items-center gap-4"
                    >
                      <div
                        className={`
                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold
                        ${
                          special
                            ? special.color
                            : tx.amount > 0
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                        }
                      `}
                      >
                        {special ? (
                          <span className="text-lg">{special.icon}</span>
                        ) : tx.amount > 0 ? (
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
                          {tx.description}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(tx.createdAt)}
                        </div>
                      </div>
                      <div
                        className={`
                        text-lg font-bold
                        ${tx.amount > 0 ? "text-green-500" : "text-red-500"}
                      `}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {Math.abs(tx.amount).toLocaleString()} pts
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
