"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";

const DURATIONS = [7, 14, 30, 60, 90];
const HOURS = Array.from({ length: 18 }, (_, i) => {
  const h = i + 6;
  return `${h.toString().padStart(2, "0")}:00`;
});

export default function CreateContractPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState(30);
  const [stakes, setStakes] = useState<number | "">("");
  const [deadline, setDeadline] = useState("21:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stakesNum = typeof stakes === "number" ? stakes : 0;
  const fee = Math.round(stakesNum * 0.05);
  const total = stakesNum + fee;
  const refund = Math.round(stakesNum * 0.95);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!goal.trim()) {
      setError(t({ th: "กรุณากรอกเป้าหมาย", en: "Please enter a goal" }));
      return;
    }

    if (stakesNum < 100) {
      setError(
        t({
          th: "เงินมัดจำขั้นต่ำ 100 บาท",
          en: "Minimum stakes is 100 baht",
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
          stakes: stakesNum,
          duration,
          deadline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Insufficient balance") {
          setError(
            t({
              th: `ยอดเงินไม่พอ ต้องการ ฿${data.required} แต่มีเพียง ฿${data.current}`,
              en: `Insufficient balance. Required ฿${data.required} but only have ฿${data.current}`,
            })
          );
        } else {
          setError(data.error || "Failed to create contract");
        }
        return;
      }

      // Success - redirect to dashboard
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t("create.title")}</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 space-y-6">
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
                  disabled={loading}
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
                      disabled={loading}
                      className={`px-5 py-2 rounded-full border font-medium transition ${
                        duration === d
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-[#1A1A1A] border-[#333] text-gray-400 hover:border-orange-500"
                      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {d} {t("create.days")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stakes */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {t("create.stakes")}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ฿
                  </span>
                  <input
                    type="number"
                    value={stakes}
                    onChange={(e) =>
                      setStakes(e.target.value ? Number(e.target.value) : "")
                    }
                    min={100}
                    placeholder={t("create.stakesPlaceholder")}
                    className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-orange-500 transition"
                    required
                    disabled={loading}
                  />
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
                  disabled={loading}
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h} น.
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4">{t("create.summary")}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-400">
                    <span>{t("create.stakes")}</span>
                    <span className="text-white">
                      ฿{stakesNum.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>{t("create.fee")}</span>
                    <span className="text-white">฿{fee.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-[#333] my-2"></div>
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">{t("create.total")}</span>
                    <span className="text-orange-500 font-bold">
                      ฿{total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {t("create.refundSuccess")}
                    </span>
                    <span className="text-green-500 font-semibold">
                      ฿{refund.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !goal.trim() || stakesNum < 100}
                  className="w-full text-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 rounded-full transition-all text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? t({
                        th: "กำลังสร้าง...",
                        en: "Creating...",
                      })
                    : t("create.submit")}
                </button>
                <p className="text-red-500/70 text-sm text-center mt-3">
                  {t("create.warning")}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}
