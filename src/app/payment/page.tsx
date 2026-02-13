"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import { useSearchParams } from "next/navigation";

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"card" | "qr">("card");
  const [amount, setAmount] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Check for payment status from URL params
  const paymentStatus = searchParams.get("payment");
  const showCancelledMessage = paymentStatus === "cancelled";

  const handlePayment = async () => {
    if (amount < 100) {
      setError("Minimum top-up amount is 100 baht");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Use simulate endpoint for testing
      const res = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          method: activeTab,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/wallet?payment=success";
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Payment failed");
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

          {/* Cancelled Payment Message */}
          {showCancelledMessage && (
            <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 rounded-xl px-4 py-3 mb-6">
              Payment was cancelled. You can try again below.
            </div>
          )}

          {/* Amount Input */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Top Up Amount</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Amount (THB)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="100"
                  step="100"
                  className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAmount(500)}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-white rounded-xl px-4 py-2 transition"
                >
                  ฿500
                </button>
                <button
                  onClick={() => setAmount(1000)}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-white rounded-xl px-4 py-2 transition"
                >
                  ฿1,000
                </button>
                <button
                  onClick={() => setAmount(2000)}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-white rounded-xl px-4 py-2 transition"
                >
                  ฿2,000
                </button>
                <button
                  onClick={() => setAmount(5000)}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-white rounded-xl px-4 py-2 transition"
                >
                  ฿5,000
                </button>
              </div>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {t("payment.selectMethod")}
            </h2>
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
              <div className="bg-blue-500/10 border border-blue-500 text-blue-400 rounded-xl px-4 py-3 text-sm">
                Demo mode: Payment will be simulated. No real charges will be
                made.
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {t("payment.cardNumber")}
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
                  disabled
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
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="***"
                    className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
                    disabled
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
                  disabled
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
              <div className="bg-blue-500/10 border border-blue-500 text-blue-400 rounded-xl px-4 py-3 text-sm">
                Demo mode: Payment will be simulated. No real QR code payment
                required.
              </div>
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
                  {t("payment.totalLabel")}: ฿{amount.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 rounded-xl px-4 py-3 mb-6">
              Payment successful! Redirecting to wallet...
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading || amount < 100}
            className={`w-full rounded-full py-4 text-lg font-bold transition-all mb-6 ${
              loading || amount < 100
                ? "bg-gray-700 opacity-50 cursor-not-allowed text-gray-400"
                : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white animate-[glow-pulse_2s_ease-in-out_infinite]"
            }`}
          >
            {loading
              ? "Processing..."
              : `${t("payment.payButton")} ฿${amount.toLocaleString()}`}
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
