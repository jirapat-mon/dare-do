"use client";

import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useState } from "react";

export default function RewardsPage() {
  const { t, locale } = useI18n();
  const [userPoints] = useState(1250);

  // Tier configuration
  const tiers = [
    { name: { th: "บรอนซ์", en: "Bronze" }, points: 0, icon: "🥉" },
    { name: { th: "ซิลเวอร์", en: "Silver" }, points: 1000, icon: "🥈" },
    { name: { th: "โกลด์", en: "Gold" }, points: 2500, icon: "🥇" },
    { name: { th: "ตำนาน", en: "Legend" }, points: 5000, icon: "👑" },
  ];

  // Determine current tier
  const currentTierIndex = tiers.findIndex((tier, index) => {
    const nextTier = tiers[index + 1];
    return userPoints >= tier.points && (!nextTier || userPoints < nextTier.points);
  });

  // Rewards data
  const rewards = [
    {
      id: 1,
      title: { th: "฿25 Credit", en: "฿25 Credit" },
      cost: 500,
      icon: "💰",
      description: {
        th: "เพิ่มเงินเข้ากระเป๋า ฿25",
        en: "Add ฿25 to your wallet",
      },
    },
    {
      id: 2,
      title: { th: "ลดค่าธรรมเนียม 3%", en: "3% Fee Discount" },
      cost: 1000,
      icon: "🏷️",
      description: {
        th: "ค่าธรรมเนียมเหลือ 3% แทน 5% (1 ครั้ง)",
        en: "Fee reduced to 3% instead of 5% (1 time)",
      },
    },
    {
      id: 3,
      title: { th: "คืนเงิน 100% Voucher", en: "100% Cashback Voucher" },
      cost: 2500,
      icon: "🎫",
      description: {
        th: "ไม่หักค่าธรรมเนียมใน Challenge ถัดไป",
        en: "No fee on next Challenge",
      },
    },
    {
      id: 4,
      title: { th: "Free Challenge ฿200", en: "Free Challenge ฿200" },
      cost: 5000,
      icon: "🎁",
      description: {
        th: "สร้าง Challenge ฟรีมูลค่า ฿200 โดย platform สนับสนุน",
        en: "Create a ฿200 Challenge sponsored by platform",
      },
    },
  ];

  const handleRedeem = (rewardId: number, cost: number) => {
    if (userPoints >= cost) {
      // Handle redemption logic here
      alert(locale === "th" ? "แลกรางวัลสำเร็จ!" : "Reward redeemed successfully!");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/wallet"
              className="text-gray-400 hover:text-white transition mb-4 inline-block"
            >
              ← {locale === "th" ? "กลับ" : "Back"}
            </Link>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">
                {locale === "th" ? "แลกรางวัล" : "Redeem Rewards"}
              </h1>
            </div>
            {/* Current Points Badge */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 inline-block">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-xl font-bold">{userPoints.toLocaleString()} Points</span>
              </div>
            </div>
          </div>

          {/* Tier Progress Section */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">
              {locale === "th" ? "ระดับสมาชิก" : "Membership Tier"}
            </h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-[#1A1A1A]">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                  style={{
                    width: `${((currentTierIndex + 1) / tiers.length) * 100}%`,
                  }}
                />
              </div>

              {/* Tier Circles */}
              <div className="relative flex justify-between">
                {tiers.map((tier, index) => {
                  const isActive = index <= currentTierIndex;
                  const isCurrent = index === currentTierIndex;

                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-br from-orange-500 to-orange-600"
                            : "bg-[#1A1A1A]"
                        } ${isCurrent ? "ring-4 ring-orange-500/50 scale-110" : ""}`}
                      >
                        {tier.icon}
                      </div>
                      <div className="text-center">
                        <div
                          className={`font-semibold ${
                            isActive ? "text-orange-500" : "text-gray-500"
                          }`}
                        >
                          {tier.name[locale]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tier.points.toLocaleString()} pts
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Available Rewards Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {locale === "th" ? "รางวัลที่มี" : "Available Rewards"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const canAfford = userPoints >= reward.cost;
                return (
                  <div
                    key={reward.id}
                    className={`bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 transition-all duration-300 ${
                      canAfford
                        ? "hover:border-orange-500 opacity-100"
                        : "opacity-60"
                    }`}
                  >
                    <div className="text-4xl mb-4">{reward.icon}</div>
                    <h3 className="text-xl font-bold mb-2">
                      {reward.title[locale]}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {reward.description[locale]}
                    </p>
                    <button
                      onClick={() => handleRedeem(reward.id, reward.cost)}
                      disabled={!canAfford}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        canAfford
                          ? "bg-orange-500 hover:bg-orange-400 text-white"
                          : "bg-[#333] text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {locale === "th" ? "แลก" : "Redeem"} {reward.cost.toLocaleString()} pts
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points Expiry Notice */}
          <div className="text-sm text-gray-500 text-center mb-8">
            ⚠️{" "}
            {locale === "th"
              ? "Points จะหมดอายุหลัง 6 เดือนนับจากวันที่ได้รับ"
              : "Points expire 6 months from the date received"}
          </div>

          {/* My Rewards Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {locale === "th" ? "รางวัลของฉัน" : "My Rewards"}
            </h2>
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold mb-1">
                    {locale === "th"
                      ? "ลดค่าธรรมเนียม 3%"
                      : "3% Fee Discount"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {locale === "th"
                      ? "ใช้ได้ถึง 14 ส.ค. 2025"
                      : "Valid until Aug 14, 2025"}
                  </div>
                </div>
                <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm font-semibold">
                  {locale === "th" ? "พร้อมใช้" : "Ready"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
