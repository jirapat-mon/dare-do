"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function SubmitEvidencePage() {
  const { t } = useI18n();
  const [hasFile, setHasFile] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
        >
          ← {t("nav.dashboard")}
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">{t("submit.title")}</h1>

        {/* Contract Banner */}
        <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 mb-6">
          <div className="text-lg font-semibold">วิ่ง 5 กม. ทุกวัน</div>
        </div>

        {/* Daily Code */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-400 mb-2">{t("dashboard.dailyCode")}</div>
          <div className="text-4xl font-mono font-bold text-orange-500">#WIN42</div>
        </div>

        {/* Instruction */}
        <p className="text-gray-400 text-sm mb-4">{t("submit.instruction")}</p>

        {/* Deadline */}
        <p className="text-red-400 font-semibold mb-6">
          {t("submit.deadline")} 21:00 น.
        </p>

        {/* Upload Area */}
        <div
          onClick={() => setHasFile(!hasFile)}
          className={`min-h-[250px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
            !hasFile
              ? "border-[#333] hover:border-orange-500"
              : "border-green-500 bg-green-500/5"
          }`}
        >
          {!hasFile ? (
            <>
              {/* Camera Icon */}
              <svg
                className="w-16 h-16 text-gray-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-gray-500">{t("submit.dragDrop")}</p>
            </>
          ) : (
            <>
              {/* Checkmark Icon */}
              <svg
                className="w-16 h-16 text-green-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-green-400 mb-2">{t("submit.preview")}</p>
              <p className="text-gray-500 text-sm">evidence_photo.jpg</p>
            </>
          )}
        </div>

        {/* Note Textarea */}
        <div className="mt-6">
          <label className="block text-sm mb-2">{t("submit.note")}</label>
          <textarea
            placeholder={t("submit.notePlaceholder")}
            rows={3}
            className="bg-[#1A1A1A] border border-[#333] rounded-xl w-full px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          disabled={!hasFile}
          className={`w-full mt-6 font-bold py-4 rounded-full text-lg transition-all ${
            !hasFile
              ? "bg-gray-700 opacity-50 cursor-not-allowed text-gray-400"
              : "bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400"
          }`}
        >
          {t("submit.send")}
        </button>
      </div>
    </div>
  );
}
