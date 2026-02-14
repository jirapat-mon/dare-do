"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

const DURATIONS = [7, 14, 30, 60, 90];
const STAKE_PRESETS = [0, 50, 100, 200, 500];
const HOURS = Array.from({ length: 18 }, (_, i) => {
  const h = i + 6;
  return `${h.toString().padStart(2, "0")}:00`;
});

interface SubscriptionStatus {
  tier: string;
  status: string;
  endsAt: string | null;
}

const TIER_LIMITS: Record<string, number | null> = {
  free: 1,
  basic: 5,
  pro: null,
};

export default function CreateContractPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState(30);
  const [deadline, setDeadline] = useState("21:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [activeContracts, setActiveContracts] = useState(0);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [stakes, setStakes] = useState(0);
  const [customStake, setCustomStake] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    checkContractLimit();
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.wallet.balance || 0);
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
    } finally {
      setWalletLoading(false);
    }
  };

  const checkContractLimit = async () => {
    try {
      const [subRes, contractsRes] = await Promise.all([
        fetch("/api/subscription/status"),
        fetch("/api/contracts"),
      ]);

      if (subRes.ok) {
        const data = await subRes.json();
        setSubscription(data);
      }

      if (contractsRes.ok) {
        const data = await contractsRes.json();
        const active = (data.contracts || []).filter(
          (c: { status: string }) => c.status === "active"
        ).length;
        setActiveContracts(active);
      }
    } catch (err) {
      console.error("Error checking limit:", err);
    } finally {
      setCheckingLimit(false);
    }
  };

  const tier = subscription?.tier || "free";
  const maxContracts = TIER_LIMITS[tier] ?? 1;
  const isAtLimit = maxContracts !== null && activeContracts >= maxContracts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!goal.trim()) {
      setError(t({ th: "กรุณากรอกเป้าหมาย", en: "Please enter a goal" }));
      return;
    }

    if (isAtLimit) {
      setError(
        t({
          th: "คุณสร้างสัญญาครบตามแพลนแล้ว กรุณาอัปเกรด",
          en: "You've reached your plan's contract limit. Please upgrade.",
        })
      );
      return;
    }

    if (stakes > walletBalance) {
      setError(
        t({
          th: "ยอดเงินไม่เพียงพอ กรุณาเติมเงินก่อน",
          en: "Insufficient balance. Please top up first.",
        })
      );
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          duration,
          deadline,
          stakes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Contract limit reached") {
          setError(
            t({
              th: "คุณสร้างสัญญาครบตามแพลนแล้ว กรุณาอัปเกรด",
              en: "You've reached your plan's contract limit. Please upgrade.",
            })
          );
        } else if (data.error === "Insufficient balance") {
          setError(
            t({
              th: "ยอดเงินไม่เพียงพอ กรุณาเติมเงินก่อน",
              en: "Insufficient balance. Please top up first.",
            })
          );
        } else {
          setError(data.error || t({ th: "สร้างสัญญาไม่สำเร็จ", en: "Failed to create contract" }));
        }
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error creating contract:", err);
      setError(
        t({
          th: "เกิดข้อผิดพลาด กรุณาลองใหม่",
          en: "An error occurred. Please try again",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t("create.title")}</h1>

        {/* Contract Limit Banner */}
        {!checkingLimit && (
          <div
            className={`rounded-xl px-4 py-3 mb-6 text-sm ${
              isAtLimit
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-[#111111] border border-[#1A1A1A] text-gray-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>
                {t({ th: "สัญญาที่ใช้งาน", en: "Active Contracts" })}:{" "}
                <span className="text-white font-semibold">
                  {activeContracts}
                </span>
                /
                <span className="text-white font-semibold">
                  {maxContracts === null
                    ? t({ th: "ไม่จำกัด", en: "Unlimited" })
                    : maxContracts}
                </span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </span>
              </span>
              {isAtLimit && (
                <Link
                  href="/pricing"
                  className="text-orange-500 hover:text-orange-400 font-semibold transition"
                >
                  {t({ th: "อัปเกรด", en: "Upgrade" })}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Wallet Balance Display */}
        {!walletLoading && (
          <div className="rounded-xl px-4 py-3 mb-6 bg-[#111111] border border-[#1A1A1A] flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {t({ th: "ยอดถอนได้", en: "Available" })}
            </span>
            <span className="text-white font-bold text-lg">
              ฿{walletBalance.toLocaleString()}
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Goal */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {t("create.goal")}
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={t("create.goalPlaceholder")}
                className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
                required
                disabled={loading || isAtLimit}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm text-gray-400 mb-3">
                {t("create.duration")}
              </label>
              <div className="flex flex-wrap gap-3">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    disabled={loading || isAtLimit}
                    className={`px-5 py-2 rounded-full border font-medium transition ${
                      duration === d
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-[#1A1A1A] border-[#333] text-gray-400 hover:border-orange-500"
                    } ${loading || isAtLimit ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {d} {t("create.days")}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {t("create.deadline")}
              </label>
              <select
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
                disabled={loading || isAtLimit}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h} น.
                  </option>
                ))}
              </select>
            </div>

            {/* Stake Amount */}
            <div>
              <label className="block text-sm text-gray-400 mb-3">
                {t({ th: "วางเดิมพัน (Stake)", en: "Stake Amount" })}
              </label>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {STAKE_PRESETS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setStakes(amount);
                      setCustomStake("");
                    }}
                    disabled={loading || isAtLimit}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                      stakes === amount && customStake === ""
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-[#1A1A1A] border-[#333] text-gray-400 hover:border-orange-500"
                    } ${loading || isAtLimit ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {amount === 0 ? t({ th: "ฟรี", en: "Free" }) : `฿${amount}`}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  ฿
                </span>
                <input
                  type="number"
                  min={0}
                  max={walletBalance}
                  value={customStake}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomStake(val);
                    const num = parseInt(val, 10);
                    setStakes(isNaN(num) || num < 0 ? 0 : num);
                  }}
                  placeholder={t({ th: "จำนวนที่ต้องการ", en: "Custom amount" })}
                  className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading || isAtLimit}
                />
              </div>

              {/* Stake result info */}
              {stakes > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">&#10003;</span>
                    <span className="text-gray-300">
                      {t({ th: "ทำสำเร็จ → ได้คืน", en: "Complete → get back" })}{" "}
                      <span className="text-green-400 font-bold">
                        ฿{Math.floor(stakes * 0.95).toLocaleString()}
                      </span>{" "}
                      <span className="text-gray-500">(95%)</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-red-400">&#10007;</span>
                    <span className="text-gray-300">
                      {t({ th: "ล้มเหลว → เสียเงิน", en: "Fail → lose" })}{" "}
                      <span className="text-red-400 font-bold">
                        ฿{stakes.toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Insufficient balance warning */}
              {stakes > walletBalance && (
                <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-red-400 text-sm">
                    {t({
                      th: "ยอดเงินไม่พอ กรุณาเติมเงิน",
                      en: "Insufficient balance. Please top up.",
                    })}
                  </span>
                  <Link
                    href="/wallet"
                    className="text-orange-500 hover:text-orange-400 text-sm font-semibold transition"
                  >
                    {t({ th: "เติมเงิน", en: "Top Up" })}
                  </Link>
                </div>
              )}
            </div>

            {/* Escrow Info Box */}
            {stakes > 0 && (
              <div className="bg-[#111111] border border-[#1A1A1A] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500 text-lg">&#128274;</span>
                  <span className="text-white font-semibold text-sm">
                    {t({ th: "ระบบ Escrow", en: "Escrow System" })}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t({
                    th: "เงินจะถูก lock ไว้จนกว่าสัญญาจะจบ",
                    en: "Your stake will be locked until the contract ends",
                  })}
                </p>
                <div className="flex gap-3">
                  <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-center">
                    <p className="text-green-400 text-xs font-medium">
                      {t({ th: "ทำครบ", en: "Complete" })}
                    </p>
                    <p className="text-green-400 font-bold text-sm mt-0.5">
                      {t({ th: "ได้คืน 95%", en: "Get 95% back" })}
                    </p>
                  </div>
                  <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
                    <p className="text-red-400 text-xs font-medium">
                      {t({ th: "ล้มเหลว", en: "Failed" })}
                    </p>
                    <p className="text-red-400 font-bold text-sm mt-0.5">
                      {t({ th: "เสียเดิมพัน", en: "Lose stake" })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !goal.trim() || isAtLimit || stakes > walletBalance}
              className="w-full text-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 rounded-full transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? t({ th: "กำลังสร้าง...", en: "Creating..." })
                : isAtLimit
                  ? t({
                      th: "ครบลิมิตแล้ว — อัปเกรดแพลน",
                      en: "Limit Reached — Upgrade Plan",
                    })
                  : t({
                      th: "สร้างสัญญา",
                      en: "Create Contract",
                    })}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}
