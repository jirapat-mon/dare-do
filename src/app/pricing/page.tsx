"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

interface Plan {
  tier: string;
  price: number;
  maxContracts: number | null;
  pointsPerMonth: number;
  features: { th: string; en: string }[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    tier: "free",
    price: 0,
    maxContracts: 1,
    pointsPerMonth: 0,
    features: [
      { th: "สัญญาได้ 1 รายการ", en: "1 Contract" },
      { th: "5 pts/ส่งหลักฐาน", en: "5 pts/submission" },
      { th: "Streak พื้นฐาน", en: "Basic Streak" },
      { th: "ส่งหลักฐานรายวัน", en: "Daily Submissions" },
    ],
  },
  {
    tier: "starter",
    price: 99,
    maxContracts: 5,
    pointsPerMonth: 200,
    popular: true,
    features: [
      { th: "สัญญาได้ 5 รายการ", en: "5 Contracts" },
      { th: "200 Points/เดือน", en: "200 Points/Month" },
      { th: "15 pts/ส่งหลักฐาน + 2x streak", en: "15 pts/submission + 2x streak" },
      { th: "+10% โบนัสเดิมพัน", en: "+10% stake bonus" },
      { th: "2x Streak Insurance", en: "2x Streak Insurance" },
      { th: "ตรวจสอบเร็วขึ้น", en: "Priority Review" },
    ],
  },
  {
    tier: "pro",
    price: 299,
    maxContracts: null,
    pointsPerMonth: 1000,
    features: [
      { th: "สัญญาไม่จำกัด", en: "Unlimited Contracts" },
      { th: "1,000 Points/เดือน", en: "1,000 Points/Month" },
      { th: "50 pts/ส่งหลักฐาน + 3x streak", en: "50 pts/submission + 3x streak" },
      { th: "+25% โบนัสเดิมพัน", en: "+25% stake bonus" },
      { th: "5x Streak Insurance", en: "5x Streak Insurance" },
      { th: "All Premium Frames", en: "All Premium Frames" },
      { th: "ซัพพอร์ตด่วน", en: "Priority Support" },
    ],
  },
];

const REWARD_PREVIEWS = [
  {
    name: { th: "AirPods Pro", en: "AirPods Pro" },
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409?wid=400&hei=400&fmt=png-alpha",
    points: 5000,
  },
  {
    name: { th: "iPhone 16", en: "iPhone 16" },
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-ultramarine?wid=400&hei=400&fmt=png-alpha",
    points: 25000,
  },
  {
    name: { th: "MacBook Air", en: "MacBook Air" },
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=400&hei=400&fmt=png-alpha",
    points: 50000,
  },
];

export default function PricingPage() {
  const { t, locale } = useI18n();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (tier === "free") return;

    setLoadingTier(tier);
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else if (res.ok && data.success) {
        router.push("/wallet?subscription=success");
      } else {
        console.error("Checkout error:", data.error);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoadingTier(null);
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case "free":
        return t({ th: "Free", en: "Free" });
      case "starter":
        return t({ th: "Starter", en: "Starter" });
      case "pro":
        return t({ th: "Pro", en: "Pro" });
      default:
        return tier;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {t({ th: "เลือกแพลนที่ใช่", en: "Choose Your Plan" })}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t({
              th: "เริ่มต้นฟรี อัปเกรดเมื่อพร้อม ปลดล็อคศักยภาพเต็มที่",
              en: "Start free, upgrade when ready. Unlock your full potential.",
            })}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={`relative rounded-2xl p-8 transition-all ${
                plan.popular
                  ? "bg-gradient-to-b from-orange-500/10 to-[#111111] border-2 border-orange-500 scale-105 md:scale-110 z-10"
                  : "bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-sm font-bold px-6 py-1.5 rounded-full">
                    {t({ th: "ยอดนิยม", en: "Most Popular" })}
                  </span>
                </div>
              )}

              {/* Tier Name */}
              <h3
                className={`text-xl font-bold mb-2 ${plan.popular ? "text-orange-500" : "text-white"}`}
              >
                {getTierName(plan.tier)}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-black text-white">
                  {plan.price === 0
                    ? t({ th: "ฟรี", en: "Free" })
                    : `฿${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-400 text-sm ml-1">
                    /{t({ th: "เดือน", en: "mo" })}
                  </span>
                )}
              </div>

              {/* Points per month */}
              <div className={`rounded-xl px-4 py-3 mb-3 ${plan.pointsPerMonth > 0 ? "bg-orange-500/10 border border-orange-500/30" : "bg-[var(--bg-card-inner)]"}`}>
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 ${plan.pointsPerMonth > 0 ? "text-orange-500" : "text-gray-500"}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className={`text-sm font-bold ${plan.pointsPerMonth > 0 ? "text-orange-500" : "text-gray-500"}`}>
                    {plan.pointsPerMonth > 0
                      ? `${plan.pointsPerMonth} pts/${t({ th: "เดือน", en: "mo" })}`
                      : t({ th: "0 pts/เดือน", en: "0 pts/mo" })}
                  </span>
                </div>
              </div>

              {/* Contract Limit */}
              <div className="bg-[var(--bg-card-inner)] rounded-xl px-4 py-3 mb-6">
                <span className="text-sm text-gray-400">
                  {t({ th: "สัญญาสูงสุด", en: "Max Contracts" })}
                </span>
                <span className="text-white font-bold ml-2">
                  {plan.maxContracts === null
                    ? t({ th: "ไม่จำกัด", en: "Unlimited" })
                    : plan.maxContracts}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 ${plan.popular ? "text-orange-500" : "text-green-500"}`}
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
                    <span className="text-gray-300 text-sm">
                      {t(feature)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.tier === "free" ? (
                <Link
                  href={isLoggedIn ? "/dashboard" : "/login"}
                  className="block text-center w-full border border-[var(--border-secondary)] text-gray-400 hover:text-white hover:border-white rounded-full py-3 font-semibold transition"
                >
                  {isLoggedIn
                    ? t({ th: "แพลนปัจจุบัน", en: "Current Plan" })
                    : t({ th: "เริ่มต้นฟรี", en: "Get Started" })}
                </Link>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loadingTier === plan.tier}
                  className={`w-full rounded-full py-3 font-semibold transition disabled:opacity-50 ${
                    plan.popular
                      ? "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {loadingTier === plan.tier
                    ? t({ th: "กำลังดำเนินการ...", en: "Processing..." })
                    : t({ th: "สมัครสมาชิก", en: "Subscribe" })}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Section */}
        <div className="mt-16 mb-8">
          <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              {t({ th: "Pro ได้แต้มมากกว่า Free ถึง 33 เท่า", en: "Pro earns 33x more points than Free users" })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-6">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">{t({ th: "Pro 30 วัน", en: "Pro 30-day contract" })}</p>
                <p className="text-3xl font-black text-orange-500">5,000+ pts</p>
                <p className="text-xs text-gray-500 mt-1">{t({ th: "50 pts/วัน x3 streak + 1,000 โบนัส", en: "50 pts/day x3 streak + 1,000 bonus" })}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">{t({ th: "Free 30 วัน", en: "Free 30-day contract" })}</p>
                <p className="text-3xl font-black text-gray-500">~150 pts</p>
                <p className="text-xs text-gray-500 mt-1">{t({ th: "5 pts/วัน ไม่มี streak โบนัส", en: "5 pts/day, no streak bonus" })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Preview Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3">
            {t({
              th: "แลก Points เป็นของรางวัลจริง",
              en: "Redeem Points for Real Rewards",
            })}
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            {t({
              th: "สะสม Points จากแพลนสมาชิก แลกเป็นสินค้าจริงได้เลย!",
              en: "Earn points from your subscription plan and redeem for real products!",
            })}
          </p>

          <div className="flex justify-center gap-6 mb-8">
            {REWARD_PREVIEWS.map((reward, i) => (
              <Link
                key={i}
                href="/rewards"
                className="group"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-primary)] group-hover:border-orange-500 transition-all duration-300 mb-2">
                  <img
                    src={reward.image}
                    alt={reward.name[locale]}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {reward.name[locale]}
                </div>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <svg
                    className="w-3 h-3 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs text-orange-500 font-bold">
                    {reward.points.toLocaleString()} pts
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/rewards"
            className="inline-flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-orange-500 text-white px-6 py-3 rounded-full font-semibold transition-all"
          >
            {t({ th: "ดูของรางวัลทั้งหมด", en: "Browse All Rewards" })}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-12">
          {t({
            th: "ยกเลิกได้ทุกเมื่อ ไม่มีสัญญาผูกมัด",
            en: "Cancel anytime. No long-term commitment.",
          })}
        </p>
      </div>
    </div>
  );
}
