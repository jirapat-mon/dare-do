"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

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

  useEffect(() => {
    checkContractLimit();
  }, []);

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

    try {
      setLoading(true);
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          duration,
          deadline,
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
        } else {
          setError(data.error || "Failed to create contract");
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !goal.trim() || isAtLimit}
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
