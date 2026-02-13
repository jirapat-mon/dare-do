"use client";

import { useState } from "react";
import Link from "next/link";

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState<"card" | "qr">("card");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
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
            ย้อนกลับ
          </Link>
          <h1 className="text-3xl font-bold">ชำระเงินมัดจำ</h1>
        </div>

        {/* Contract Summary Card */}
        <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">สรุปสัญญา</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">เป้าหมาย:</span>
              <span className="font-medium">วิ่ง 5 กม. ทุกวัน</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ระยะเวลา:</span>
              <span className="font-medium">30 วัน</span>
            </div>
            <div className="h-px bg-[#1A1A1A] my-4"></div>
            <div className="flex justify-between">
              <span className="text-gray-400">เงินมัดจำ:</span>
              <span className="font-medium">฿1,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ค่าธรรมเนียม (10%):</span>
              <span className="font-medium">฿100</span>
            </div>
            <div className="h-px bg-[#1A1A1A] my-4"></div>
            <div className="flex justify-between text-xl">
              <span className="font-semibold">รวมทั้งหมด:</span>
              <span className="font-bold text-orange-500">฿1,100</span>
            </div>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">เลือกช่องทางชำระเงิน</h2>
          <div className="flex border-b border-[#1A1A1A]">
            <button
              onClick={() => setActiveTab("card")}
              className={`flex-1 pb-3 text-center transition-colors ${
                activeTab === "card"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              💳 บัตรเครดิต/เดบิต
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 pb-3 text-center transition-colors ${
                activeTab === "qr"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              📱 QR Code PromptPay
            </button>
          </div>
        </div>

        {/* Credit Card Tab Content */}
        {activeTab === "card" && (
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                หมายเลขบัตร
              </label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  วันหมดอายุ
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="***"
                  className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                ชื่อบนบัตร
              </label>
              <input
                type="text"
                placeholder="CARDHOLDER NAME"
                className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              รองรับ Visa, Mastercard, JCB
            </p>
          </div>
        )}

        {/* QR Code Tab Content */}
        {activeTab === "qr" && (
          <div className="space-y-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-[200px] h-[200px] bg-white rounded-2xl flex items-center justify-center mb-4">
                <span className="text-black font-semibold">QR Code</span>
              </div>
              <p className="text-center text-gray-300 mb-2">
                สแกน QR Code เพื่อชำระผ่าน PromptPay
              </p>
              <p className="text-center text-sm text-gray-400 mb-1">
                ชื่อบัญชี: DareDo Co., Ltd.
              </p>
              <p className="text-center text-sm text-gray-400 mb-4">
                จำนวนเงิน: ฿1,100
              </p>
              <div className="bg-[#111111] border border-[#1A1A1A] rounded-xl p-4 w-full mb-4">
                <p className="text-sm text-gray-400 text-center">
                  หลังโอนเงิน กรุณาอัปโหลดหลักฐานการโอน
                </p>
              </div>
              <button className="w-full border-2 border-orange-500 text-orange-500 rounded-xl px-6 py-3 font-medium hover:bg-orange-500/10 transition-colors">
                📤 อัปโหลดสลิป
              </button>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full py-4 text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/50 animate-[glow-pulse_2s_ease-in-out_infinite] mb-6">
          ชำระเงิน ฿1,100
        </button>

        {/* Security Notice */}
        <p className="text-gray-500 text-sm text-center">
          🔒 ข้อมูลการชำระเงินถูกเข้ารหัส SSL 256-bit
        </p>
      </div>
    </div>
  );
}
