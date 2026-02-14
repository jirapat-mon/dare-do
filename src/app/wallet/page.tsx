"use client";

import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StreakFire from "@/components/StreakFire";
import RankBadge from "@/components/RankBadge";
import {
  getStreakLevel,
  INSURANCE_COST,
  STREAK_THRESHOLD,
  STREAK_MULTIPLIER,
  type SubscriptionTier,
  type RankDefinition,
  type StreakLevel,
} from "@/lib/gamification";

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

interface GamificationStats {
  tier: SubscriptionTier;
  points: number;
  lifetimePoints: number;
  streak: number;
  rank: RankDefinition;
  nextRank: RankDefinition | null;
  rankProgress: number;
  streakLevel: StreakLevel;
}

interface Contract {
  id: string;
  goal: string;
  status: string;
  duration: number;
  daysCompleted: number;
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
  const router = useRouter();
  const topupVerifiedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [topupMsg, setTopupMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [cancelLoading, setCancelLoading] = useState(false);
  const [gamStats, setGamStats] = useState<GamificationStats | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState("");
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [insuranceMsg, setInsuranceMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [insuranceInfo, setInsuranceInfo] = useState<{
    remaining: number;
    limit: number;
  } | null>(null);

  // Top-up states
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState(100);
  const [topupLoading, setTopupLoading] = useState(false);

  // Withdraw states
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(50);
  const [withdrawBank, setWithdrawBank] = useState("");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawName, setWithdrawName] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const subscriptionStatus = searchParams.get("subscription");
  const topupStatus = searchParams.get("topup");
  const topupAmount_param = searchParams.get("amount");
  const stripeSessionId = searchParams.get("session_id");

  const verifyAndCreditTopup = useCallback(async () => {
    if (topupVerifiedRef.current) return;
    topupVerifiedRef.current = true;

    try {
      // Approach 1: Try verify via Stripe session ID (proper verification)
      if (stripeSessionId) {
        const res = await fetch("/api/wallet/topup/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: stripeSessionId }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.alreadyCredited) {
            setTopupMsg({
              type: "success",
              text: t({ th: "เติมเงินสำเร็จแล้ว!", en: "Top-up already credited!" }),
            });
          } else {
            setTopupMsg({
              type: "success",
              text: t({
                th: `เติมเงิน ฿${topupAmount_param || ""} สำเร็จ!`,
                en: `Top-up ฿${topupAmount_param || ""} successful!`,
              }),
            });
          }
          fetchData();
          // Clean URL params
          router.replace("/wallet", { scroll: false });
          return;
        }
      }

      // Approach 2: Fallback — use demo topup with the amount from URL
      if (topupAmount_param) {
        const amount = parseFloat(topupAmount_param);
        if (!isNaN(amount) && amount >= 20 && amount <= 100000) {
          const res = await fetch("/api/wallet/topup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
          });
          if (res.ok) {
            setTopupMsg({
              type: "success",
              text: t({
                th: `เติมเงิน ฿${amount.toLocaleString()} สำเร็จ!`,
                en: `Top-up ฿${amount.toLocaleString()} successful!`,
              }),
            });
            fetchData();
          }
        }
      }
    } catch (error) {
      console.error("Topup verification error:", error);
      setTopupMsg({
        type: "error",
        text: t({ th: "เกิดข้อผิดพลาดในการตรวจสอบการเติมเงิน", en: "Error verifying top-up" }),
      });
    }

    // Clean URL params
    router.replace("/wallet", { scroll: false });
  }, [stripeSessionId, topupAmount_param, router, t]);

  useEffect(() => {
    fetchData();
  }, []);

  // Handle topup success redirect from Stripe
  useEffect(() => {
    if (topupStatus === "success") {
      verifyAndCreditTopup();
    }
  }, [topupStatus, verifyAndCreditTopup]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, subRes, statsRes, contractsRes] = await Promise.all([
        fetch("/api/wallet"),
        fetch("/api/subscription/status"),
        fetch("/api/gamification/stats"),
        fetch("/api/contracts"),
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

      if (statsRes.ok) {
        const data = await statsRes.json();
        setGamStats(data);
      }

      if (contractsRes.ok) {
        const data = await contractsRes.json();
        const active = (data.contracts || []).filter(
          (c: Contract) => c.status === "active"
        );
        setContracts(active);
        if (active.length > 0) {
          setSelectedContractId(active[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    setTopupLoading(true);
    try {
      // Try real Stripe checkout first
      const checkoutRes = await fetch("/api/wallet/topup/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: topupAmount }),
      });
      const checkoutData = await checkoutRes.json();
      if (checkoutRes.ok && checkoutData.url) {
        window.location.href = checkoutData.url;
        return;
      }
      // Fallback to demo topup
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: topupAmount }),
      });
      if (res.ok) {
        setShowTopup(false);
        fetchData();
      }
    } catch {
      // ignore
    } finally {
      setTopupLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawBank || !withdrawAccount || !withdrawName) return;
    setWithdrawLoading(true);
    setWithdrawMsg(null);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: withdrawAmount,
          bankName: withdrawBank,
          bankAccount: withdrawAccount,
          accountName: withdrawName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawMsg({ type: "success", text: t({ th: "ส่งคำขอถอนเงินสำเร็จ! รอดำเนินการภายใน 24 ชั่วโมง", en: "Withdrawal request submitted! Processing within 24 hours" }) });
        setShowWithdraw(false);
        setWithdrawBank("");
        setWithdrawAccount("");
        setWithdrawName("");
        fetchData();
      } else {
        setWithdrawMsg({ type: "error", text: data.error || t({ th: "เกิดข้อผิดพลาด", en: "Error" }) });
      }
    } catch {
      setWithdrawMsg({ type: "error", text: t({ th: "เกิดข้อผิดพลาด", en: "Error" }) });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const tier = (subscription?.tier || "free") as SubscriptionTier;

  // Fetch insurance info when selected contract changes
  useEffect(() => {
    if (selectedContractId && tier !== "free") {
      fetchInsuranceInfo(selectedContractId);
    }
  }, [selectedContractId, tier]);

  const fetchInsuranceInfo = async (contractId: string) => {
    try {
      const res = await fetch(
        `/api/gamification/insurance?contractId=${contractId}`
      );
      if (res.ok) {
        const data = await res.json();
        setInsuranceInfo({ remaining: data.remaining, limit: data.limit });
      }
    } catch {
      // silently fail
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

  const handleUseInsurance = async () => {
    if (!selectedContractId) return;
    setInsuranceLoading(true);
    setInsuranceMsg(null);
    try {
      const res = await fetch("/api/gamification/insurance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: selectedContractId }),
      });
      const data = await res.json();
      if (res.ok) {
        setInsuranceMsg({
          type: "success",
          text: t({
            th: "ใช้ Streak Insurance สำเร็จ!",
            en: "Streak Insurance used successfully!",
          }),
        });
        fetchData();
        fetchInsuranceInfo(selectedContractId);
      } else {
        setInsuranceMsg({
          type: "error",
          text: data.error || t({ th: "เกิดข้อผิดพลาด", en: "Error" }),
        });
      }
    } catch {
      setInsuranceMsg({
        type: "error",
        text: t({ th: "เกิดข้อผิดพลาด", en: "Something went wrong" }),
      });
    } finally {
      setInsuranceLoading(false);
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
      case "insurance":
        return { icon: "🛡️", color: "bg-purple-500/20 text-purple-500" };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[var(--bg-primary)] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">{t({ th: "กำลังโหลด...", en: "Loading..." })}</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const badge = getTierBadge(tier);
  const streakLevel = getStreakLevel(currentStreak);
  const lifetimePoints = gamStats?.lifetimePoints || 0;
  const rankProgress = gamStats?.rankProgress || 0;
  const nextRank = gamStats?.nextRank;
  const multiplier =
    currentStreak >= STREAK_THRESHOLD ? STREAK_MULTIPLIER[tier] : 1;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--bg-primary)] text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Subscription Success Banner */}
          {subscriptionStatus === "success" && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 rounded-xl px-4 py-3 mb-6">
              {t({ th: "สมัครสมาชิกสำเร็จ!", en: "Subscription activated!" })}
            </div>
          )}

          {/* Topup Success/Error Banner */}
          {topupMsg && (
            <div className={`rounded-xl px-4 py-3 mb-6 ${topupMsg.type === "success" ? "bg-green-500/20 border border-green-500 text-green-400" : "bg-red-500/20 border border-red-500 text-red-400"}`}>
              {topupMsg.text}
            </div>
          )}

          {/* Withdraw message */}
          {withdrawMsg && (
            <div className={`rounded-xl px-4 py-3 mb-6 ${withdrawMsg.type === "success" ? "bg-green-500/20 border border-green-500 text-green-400" : "bg-red-500/20 border border-red-500 text-red-400"}`}>
              {withdrawMsg.text}
            </div>
          )}

          {/* === Money Balance Card === */}
          <div className="bg-gradient-to-br from-[#0d1a0d] to-[#111111] border border-green-500/20 rounded-2xl p-6 mb-6">
            <h2 className="text-sm text-gray-400 mb-3">
              {t({ th: "กระเป๋าเงิน", en: "Money Wallet" })}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">{t({ th: "ยอดถอนได้", en: "Available" })}</p>
                <p className="text-2xl font-bold text-green-400">&#3647;{(wallet?.balance || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{t({ th: "ล็อคใน contract", en: "Locked in contracts" })}</p>
                <p className="text-2xl font-bold text-orange-400">&#3647;{(wallet?.lockedBalance || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTopup(true)}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full py-3 transition text-sm"
              >
                {t({ th: "เติมเงิน", en: "Top Up" })}
              </button>
              <button
                onClick={() => setShowWithdraw(true)}
                disabled={(wallet?.balance || 0) < 20}
                className="flex-1 border border-[var(--border-secondary)] text-gray-300 hover:text-white hover:border-white font-semibold rounded-full py-3 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t({ th: "ถอนเงิน", en: "Withdraw" })}
              </button>
            </div>
          </div>

          {/* Top-up Modal */}
          {showTopup && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">{t({ th: "เติมเงิน", en: "Top Up" })}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[50, 100, 200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTopupAmount(amt)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${topupAmount === amt ? "bg-green-500 text-white" : "bg-[var(--bg-card-inner)] text-gray-400 border border-[var(--border-secondary)] hover:border-green-500"}`}
                    >
                      &#3647;{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Number(e.target.value))}
                  min={20}
                  max={100000}
                  className="w-full bg-[var(--bg-card-inner)] border border-[var(--border-secondary)] rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-green-500"
                  placeholder="฿"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowTopup(false)} className="flex-1 border border-[var(--border-secondary)] text-gray-400 rounded-full py-3 font-semibold transition hover:text-white hover:border-white">
                    {t({ th: "ยกเลิก", en: "Cancel" })}
                  </button>
                  <button onClick={handleTopup} disabled={topupLoading || topupAmount < 20} className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-full py-3 font-semibold transition disabled:opacity-50">
                    {topupLoading ? t({ th: "กำลังดำเนินการ...", en: "Processing..." }) : t({ th: `เติม ฿${topupAmount.toLocaleString()}`, en: `Top Up ฿${topupAmount.toLocaleString()}` })}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Withdraw Modal */}
          {showWithdraw && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-2">{t({ th: "ถอนเงิน", en: "Withdraw" })}</h3>
                <p className="text-xs text-gray-500 mb-4">{t({ th: "ใช้เวลาดำเนินการไม่เกิน 24 ชั่วโมง", en: "Processing time up to 24 hours" })}</p>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">{t({ th: "จำนวนเงิน (ขั้นต่ำ ฿20)", en: "Amount (min ฿20)" })}</label>
                    <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(Number(e.target.value))} min={20} max={wallet?.balance || 0} className="w-full bg-[var(--bg-card-inner)] border border-[var(--border-secondary)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">{t({ th: "ธนาคาร", en: "Bank" })}</label>
                    <select value={withdrawBank} onChange={(e) => setWithdrawBank(e.target.value)} className="w-full bg-[var(--bg-card-inner)] border border-[var(--border-secondary)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
                      <option value="">{t({ th: "เลือกธนาคาร", en: "Select bank" })}</option>
                      <option value="SCB">SCB ไทยพาณิชย์</option>
                      <option value="KBANK">KBANK กสิกร</option>
                      <option value="KTB">KTB กรุงไทย</option>
                      <option value="BBL">BBL กรุงเทพ</option>
                      <option value="TMB">TTB ทีเอ็มบี</option>
                      <option value="BAY">BAY กรุงศรี</option>
                      <option value="GSB">GSB ออมสิน</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">{t({ th: "เลขบัญชี", en: "Account number" })}</label>
                    <input type="text" value={withdrawAccount} onChange={(e) => setWithdrawAccount(e.target.value)} placeholder="xxx-x-xxxxx-x" className="w-full bg-[var(--bg-card-inner)] border border-[var(--border-secondary)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">{t({ th: "ชื่อบัญชี", en: "Account name" })}</label>
                    <input type="text" value={withdrawName} onChange={(e) => setWithdrawName(e.target.value)} className="w-full bg-[var(--bg-card-inner)] border border-[var(--border-secondary)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <p className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4">
                  {t({ th: "หลังจากส่งคำขอ เงินจะถูกหักจากยอดถอนได้ทันที และจะโอนเข้าบัญชีภายใน 24 ชั่วโมง", en: "After submitting, the amount will be deducted immediately and transferred within 24 hours" })}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowWithdraw(false); setWithdrawMsg(null); }} className="flex-1 border border-[var(--border-secondary)] text-gray-400 rounded-full py-3 font-semibold transition hover:text-white hover:border-white">
                    {t({ th: "ยกเลิก", en: "Cancel" })}
                  </button>
                  <button onClick={handleWithdraw} disabled={withdrawLoading || withdrawAmount < 20 || !withdrawBank || !withdrawAccount || !withdrawName || withdrawAmount > (wallet?.balance || 0)} className="flex-1 bg-orange-500 hover:bg-orange-400 text-white rounded-full py-3 font-semibold transition disabled:opacity-50">
                    {withdrawLoading ? t({ th: "กำลังดำเนินการ...", en: "Processing..." }) : t({ th: `ถอน ฿${withdrawAmount.toLocaleString()}`, en: `Withdraw ฿${withdrawAmount.toLocaleString()}` })}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Status Card */}
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[var(--border-primary)] rounded-2xl p-6 mb-6">
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
                    className="flex-1 border border-[var(--border-secondary)] text-gray-400 px-6 py-3 rounded-full font-semibold hover:text-white hover:border-white transition text-sm disabled:opacity-50"
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
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-500">
                      {wallet?.points.toLocaleString() || "0"} Points
                    </span>
                    <RankBadge lifetimePoints={lifetimePoints} size="sm" />
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

            {/* Multiplier badge */}
            {multiplier > 1 && (
              <div
                className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-semibold mb-3"
                style={{ boxShadow: "0 0 12px rgba(251,146,60,0.3)" }}
              >
                <span>🔥</span>
                <span>
                  x{multiplier}{" "}
                  {t({ th: "คะแนนพิเศษ!", en: "Points Active!" })}
                </span>
              </div>
            )}

            {/* Rank progress */}
            <div className="space-y-2">
              <div className="text-sm text-gray-400">
                {nextRank ? (
                  <>
                    {t({ th: "อีก ", en: "" })}
                    {(nextRank.minPoints - lifetimePoints).toLocaleString()} pts
                    {t({
                      th: ` ถึง ${nextRank.nameEn}`,
                      en: ` to ${nextRank.nameEn}`,
                    })}
                  </>
                ) : (
                  t({ th: "แร้งค์สูงสุดแล้ว!", en: "Max rank reached!" })
                )}
              </div>
              <div className="w-full bg-[var(--bg-card-inner)] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-orange-500 h-full transition-all duration-300"
                  style={{ width: `${rankProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak Section */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {t({ th: "ความต่อเนื่อง", en: "Streak" })}
              </h2>
              {currentStreak >= 7 && (
                <div className="bg-orange-500/20 text-orange-500 px-4 py-1 rounded-full text-sm font-semibold">
                  x{multiplier} Points Multiplier
                </div>
              )}
            </div>
            <div className="text-3xl font-bold mb-2 flex items-center gap-2">
              <StreakFire streak={currentStreak} size="md" />
              <span>
                {t({ th: "วันติดต่อกัน", en: "Day Streak" })}
              </span>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              {t({ th: streakLevel.nameTh, en: streakLevel.nameEn })}
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
                          : "bg-[var(--bg-card-inner)]"
                    }
                  `}
                  title={`Day ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Streak Insurance Card */}
          {tier !== "free" ? (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🛡️</span>
                <h2 className="text-xl font-bold">
                  {t({ th: "Streak Insurance", en: "Streak Insurance" })}
                </h2>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {t({
                  th: `ใช้ ${INSURANCE_COST} points เพื่อพักวันนี้ โดย streak ไม่ reset`,
                  en: `Use ${INSURANCE_COST} points to skip today without resetting your streak`,
                })}
              </p>

              {/* Remaining uses */}
              {insuranceInfo && (
                <div className="text-sm text-gray-300 mb-4">
                  {t({ th: "เหลือ ", en: "Remaining: " })}
                  <span className="font-semibold text-orange-400">
                    {insuranceInfo.remaining}/{insuranceInfo.limit}
                  </span>
                  {t({ th: " ครั้ง", en: " uses" })}
                </div>
              )}

              {/* Contract selector */}
              {contracts.length > 0 ? (
                <div className="mb-4">
                  <select
                    value={selectedContractId}
                    onChange={(e) => setSelectedContractId(e.target.value)}
                    className="w-full bg-[var(--bg-card-inner)] border border-[var(--border-secondary)] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition"
                  >
                    {contracts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.goal} ({c.daysCompleted}/{c.duration}{" "}
                        {t({ th: "วัน", en: "days" })})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4">
                  {t({
                    th: "ไม่มี contract ที่ใช้งานอยู่",
                    en: "No active contracts",
                  })}
                </p>
              )}

              {/* Feedback message */}
              {insuranceMsg && (
                <div
                  className={`text-sm px-4 py-2 rounded-xl mb-4 ${
                    insuranceMsg.type === "success"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {insuranceMsg.text}
                </div>
              )}

              {/* Use Insurance button */}
              <button
                onClick={handleUseInsurance}
                disabled={
                  insuranceLoading ||
                  contracts.length === 0 ||
                  !selectedContractId ||
                  (wallet?.points || 0) < INSURANCE_COST ||
                  (insuranceInfo?.remaining || 0) <= 0
                }
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {insuranceLoading
                  ? t({ th: "กำลังใช้...", en: "Processing..." })
                  : t({
                      th: `ใช้ Insurance (${INSURANCE_COST} pts)`,
                      en: `Use Insurance (${INSURANCE_COST} pts)`,
                    })}
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl opacity-50">🛡️</span>
                <h2 className="text-xl font-bold text-gray-500">
                  {t({ th: "Streak Insurance", en: "Streak Insurance" })}
                </h2>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                {t({
                  th: "อัปเกรดเพื่อใช้ Streak Insurance",
                  en: "Upgrade to use Streak Insurance",
                })}
              </p>
              <Link
                href="/pricing"
                className="block text-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-6 py-3 rounded-full font-semibold transition text-sm"
              >
                {t({ th: "ดูแพลน", en: "View Plans" })}
              </Link>
            </div>
          )}

          {/* Transaction History (Points Activity) */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="text-xl font-bold">
                {t({ th: "ประวัติกิจกรรม", en: "Activity History" })}
              </h2>
            </div>
            <div className="divide-y divide-[var(--border-primary)]">
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
