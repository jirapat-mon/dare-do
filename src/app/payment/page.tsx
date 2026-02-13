"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";

export default function PaymentPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"card" | "qr">("card");

  return (
    <AuthGuard>
    <div className="px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/create"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t("payment.back")}
          </Link>
          <h1 className="text-3xl font-bold">{t("payment.title")}</h1>
        </div>

        {/* Contract Summary Card */}
        <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{t("payment.summary")}</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">{t("payment.goal")}:</span>
              <span className="font-medium">วิ่ง 5 กม. ทุกวัน</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t("payment.durationLabel")}:</span>
              <span className="font-medium">30 {t("create.days")}</span>
            </div>
            <div className="h-px bg-[#1A1A1A] my-4"></div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t("payment.deposit")}:</span>
              <span className="font-medium">฿1,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t("payment.feeLabel")}:</span>
              <span className="font-medium">฿50</span>
            </div>
            <div className="h-px bg-[#1A1A1A] my-4"></div>
            <div className="flex justify-between text-xl">
              <span className="font-semibold">{t("payment.totalLabel")}:</span>
              <span className="font-bold text-orange-500">฿1,050</span>
            </div>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t("payment.selectMethod")}</h2>
          <div className="flex border-b border-[#1A1A1A]">
            <button
              onClick={() => setActiveTab("card")}
              className={`flex-1 pb-3 text-center transition-colors ${
                activeTab === "card"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              {t("payment.creditDebit")}
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 pb-3 text-center transition-colors ${
                activeTab === "qr"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              {t("payment.qrCode")}
            </button>
          </div>
        </div>

        {/* Credit Card Tab */}
        {activeTab === "card" && (
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {t("payment.cardNumber")}
              </label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {t("payment.expiry")}
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="***"
                  className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {t("payment.cardName")}
              </label>
              <input
                type="text"
                placeholder="CARDHOLDER NAME"
                className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              {t("payment.supported")}
            </p>
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === "qr" && (
          <div className="space-y-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-[200px] h-[200px] bg-white rounded-2xl flex items-center justify-center mb-4">
                <span className="text-black font-semibold">QR Code</span>
              </div>
              <p className="text-center text-gray-300 mb-2">
                {t("payment.scanQr")}
              </p>
              <p className="text-center text-sm text-gray-400 mb-1">
                {t("payment.accountName")}
              </p>
              <p className="text-center text-sm text-gray-400 mb-4">
                {t("payment.totalLabel")}: ฿1,050
              </p>
              <div className="bg-[#111111] border border-[#1A1A1A] rounded-xl p-4 w-full mb-4">
                <p className="text-sm text-gray-400 text-center">
                  {t("payment.afterTransfer")}
                </p>
              </div>
              <button className="w-full border-2 border-orange-500 text-orange-500 rounded-xl px-6 py-3 font-medium hover:bg-orange-500/10 transition">
                {t("payment.uploadSlip")}
              </button>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-full py-4 text-lg font-bold transition-all animate-[glow-pulse_2s_ease-in-out_infinite] mb-6">
          {t("payment.payButton")} ฿1,050
        </button>

        {/* Security Notice */}
        <p className="text-gray-500 text-sm text-center">
          {t("payment.secure")}
        </p>
      </div>
    </div>
    </AuthGuard>
  );
}
