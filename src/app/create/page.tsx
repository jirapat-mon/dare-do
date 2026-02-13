"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";

const DURATIONS = [7, 14, 30, 60, 90];
const HOURS = Array.from({ length: 18 }, (_, i) => {
  const h = i + 6;
  return `${h.toString().padStart(2, "0")}:00`;
});

export default function CreateContractPage() {
  const { t } = useI18n();
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState(30);
  const [stakes, setStakes] = useState<number | "">("");
  const [deadline, setDeadline] = useState("21:00");

  const stakesNum = typeof stakes === "number" ? stakes : 0;
  const fee = Math.round(stakesNum * 0.05);
  const total = stakesNum + fee;
  const refund = Math.round(stakesNum * 0.95);

  return (
    <AuthGuard>
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("create.title")}</h1>

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
                  onClick={() => setDuration(d)}
                  className={`px-5 py-2 rounded-full border font-medium transition ${
                    duration === d
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-[#1A1A1A] border-[#333] text-gray-400 hover:border-orange-500"
                  }`}
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
                <span className="text-white">฿{stakesNum.toLocaleString()}</span>
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

            <Link
              href="/payment"
              className="block w-full text-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 rounded-full transition-all text-lg mt-6"
            >
              {t("create.submit")}
            </Link>
            <p className="text-red-500/70 text-sm text-center mt-3">
              {t("create.warning")}
            </p>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
