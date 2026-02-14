"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import {
  POINTS_STAKE_PRESETS,
  STAKE_BONUS_PERCENT,
  calculateStakeReturn,
} from "@/lib/gamification";

const DURATIONS = [7, 14, 30, 60, 90];
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
  starter: 5,
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
  const [pointsStaked, setPointsStaked] = useState(0);
  const [customPointsStake, setCustomPointsStake] = useState("");
  const [availablePoints, setAvailablePoints] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    checkContractLimit();
    fetchAvailablePoints();
  }, []);

  const fetchAvailablePoints = async () => {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setAvailablePoints(data.wallet.points || 0);
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
  const bonusPercent = STAKE_BONUS_PERCENT[tier] || 0;
  const stakeReturn = calculateStakeReturn(tier, pointsStaked);

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

    if (pointsStaked > availablePoints) {
      setError(
        t({
          th: "แต้มไม่เพียงพอ",
          en: "Insufficient points.",
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
          pointsStaked,
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
        } else if (data.error === "Insufficient balance" || data.error === "Insufficient points") {
          setError(
            t({
              th: "แต้มไม่เพียงพอ",
              en: "Insufficient points.",
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
                : "bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-gray-400"
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

        {/* Available Points Display */}
        {!walletLoading && (
          <div className="rounded-xl px-4 py-3 mb-6 bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {t({ th: "แต้มที่ใช้ได้", en: "Available Points" })}
            </span>
            <span className="text-white font-bold text-lg">
              {availablePoints.toLocaleString()} pts
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
                className="w-full bg-[var(--bg-card-inner)] border border-[var(--border-secondary)] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
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
                        : "bg-[var(--bg-card-inner)] border-[var(--border-secondary)] text-gray-400 hover:border-orange-500"
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
                className="w-full bg-[var(--bg-card-inner)] border border-[var(--border-secondary)] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
                disabled={loading || isAtLimit}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h} น.
                  </option>
                ))}
              </select>
            </div>

            {/* Points Stake Amount */}
            <div>
              <label className="block text-sm text-gray-400 mb-3">
                {t({ th: "วางแต้มเดิมพัน (Points Stake)", en: "Points Stake" })}
              </label>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {POINTS_STAKE_PRESETS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setPointsStaked(amount);
                      setCustomPointsStake("");
                    }}
                    disabled={loading || isAtLimit}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                      pointsStaked === amount && customPointsStake === ""
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-[var(--bg-card-inner)] border-[var(--border-secondary)] text-gray-400 hover:border-orange-500"
                    } ${loading || isAtLimit ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {amount === 0 ? t({ th: "ฟรี", en: "Free" }) : `${amount} pts`}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={availablePoints}
                  value={customPointsStake}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomPointsStake(val);
                    const num = parseInt(val, 10);
                    setPointsStaked(isNaN(num) || num < 0 ? 0 : num);
                  }}
                  placeholder={t({ th: "จำนวนแต้มที่ต้องการ", en: "Custom points amount" })}
                  className="w-full bg-[var(--bg-card-inner)] border border-[var(--border-secondary)] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
                  disabled={loading || isAtLimit}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  pts
                </span>
              </div>

              {/* Stake result info */}
              {pointsStaked > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">&#10003;</span>
                    <span className="text-gray-300">
                      {tier === "free" && (
                        <>
                          {t({ th: "ทำสำเร็จ → ได้แต้มคืน", en: "Success: get 100% points back" })}{" "}
                          <span className="text-green-400 font-bold">
                            {stakeReturn.returnAmount.toLocaleString()} pts
                          </span>
                        </>
                      )}
                      {tier === "starter" && (
                        <>
                          {t({ th: "ทำสำเร็จ → ได้คืน 110%", en: "Success: get 110% back" })}{" "}
                          <span className="text-green-400 font-bold">
                            {stakeReturn.returnAmount.toLocaleString()} pts
                          </span>{" "}
                          <span className="text-yellow-400">(+{bonusPercent}% {t({ th: "โบนัส!", en: "bonus!" })})</span>
                        </>
                      )}
                      {tier === "pro" && (
                        <>
                          {t({ th: "ทำสำเร็จ → ได้คืน 125%", en: "Success: get 125% back" })}{" "}
                          <span className="text-green-400 font-bold">
                            {stakeReturn.returnAmount.toLocaleString()} pts
                          </span>{" "}
                          <span className="text-yellow-400">(+{bonusPercent}% {t({ th: "โบนัส!", en: "bonus!" })})</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-red-400">&#10007;</span>
                    <span className="text-gray-300">
                      {t({ th: "ล้มเหลว → เสียแต้ม", en: "Fail → lose" })}{" "}
                      <span className="text-red-400 font-bold">
                        {pointsStaked.toLocaleString()} pts
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Insufficient points warning */}
              {pointsStaked > availablePoints && (
                <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-red-400 text-sm">
                    {t({
                      th: "แต้มไม่พอ",
                      en: "Insufficient points.",
                    })}
                  </span>
                  <Link
                    href="/wallet"
                    className="text-orange-500 hover:text-orange-400 text-sm font-semibold transition"
                  >
                    {t({ th: "ดูแต้ม", en: "View Points" })}
                  </Link>
                </div>
              )}
            </div>

            {/* Escrow Info Box */}
            {pointsStaked > 0 && (
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500 text-lg">&#128274;</span>
                  <span className="text-white font-semibold text-sm">
                    {t({ th: "ระบบล็อคแต้ม", en: "Points Lock" })}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t({
                    th: "แต้มจะถูก lock ไว้จนกว่าสัญญาจะจบ",
                    en: "Your points will be locked until the contract ends",
                  })}
                </p>
                <div className="flex gap-3">
                  <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-center">
                    <p className="text-green-400 text-xs font-medium">
                      {t({ th: "ทำครบ", en: "Complete" })}
                    </p>
                    <p className="text-green-400 font-bold text-sm mt-0.5">
                      {bonusPercent > 0
                        ? t({ th: `ได้คืน 100% + โบนัส ${bonusPercent}%`, en: `Get 100% + ${bonusPercent}% bonus` })
                        : t({ th: "ได้แต้มคืน 100%", en: "Get 100% points back" })}
                    </p>
                  </div>
                  <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
                    <p className="text-red-400 text-xs font-medium">
                      {t({ th: "ล้มเหลว", en: "Failed" })}
                    </p>
                    <p className="text-red-400 font-bold text-sm mt-0.5">
                      {t({ th: "เสียแต้มทั้งหมด", en: "Lose all staked points" })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !goal.trim() || isAtLimit || pointsStaked > availablePoints}
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
