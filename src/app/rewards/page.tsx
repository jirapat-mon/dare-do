"use client";

import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface Reward {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  pointsCost: number;
  imageUrl: string;
  category: string;
  stock: number;
}

interface Redemption {
  id: string;
  status: string;
  address: string | null;
  createdAt: string;
  reward: {
    id: string;
    name: string;
    nameTh: string;
    imageUrl: string;
    pointsCost: number;
    category: string;
  };
}

interface WalletData {
  points: number;
  streak: number;
}

type Category = "all" | "gadget" | "gift_card" | "lifestyle";

export default function RewardsPage() {
  const { t, locale } = useI18n();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemAddress, setRedeemAddress] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemError, setRedeemError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [walletRes, rewardsRes, redemptionsRes] = await Promise.all([
        fetch("/api/wallet"),
        fetch("/api/rewards"),
        fetch("/api/rewards/redemptions"),
      ]);

      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data.wallet);
      }

      if (rewardsRes.ok) {
        const data = await rewardsRes.json();
        setRewards(data.rewards || []);
      }

      if (redemptionsRes.ok) {
        const data = await redemptionsRes.json();
        setRedemptions(data.redemptions || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const userPoints = wallet?.points || 0;

  const categories: { key: Category; label: { th: string; en: string } }[] = [
    { key: "all", label: { th: "ทั้งหมด", en: "All" } },
    { key: "gadget", label: { th: "แกดเจ็ต", en: "Gadgets" } },
    { key: "gift_card", label: { th: "Gift Cards", en: "Gift Cards" } },
    { key: "lifestyle", label: { th: "ไลฟ์สไตล์", en: "Lifestyle" } },
  ];

  const filteredRewards =
    activeCategory === "all"
      ? rewards
      : rewards.filter((r) => r.category === activeCategory);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "gadget":
        return {
          label: t({ th: "แกดเจ็ต", en: "Gadget" }),
          color: "bg-blue-500/20 text-blue-400",
        };
      case "gift_card":
        return {
          label: t({ th: "Gift Card", en: "Gift Card" }),
          color: "bg-purple-500/20 text-purple-400",
        };
      case "lifestyle":
        return {
          label: t({ th: "ไลฟ์สไตล์", en: "Lifestyle" }),
          color: "bg-green-500/20 text-green-400",
        };
      default:
        return { label: category, color: "bg-gray-500/20 text-gray-400" };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: t({ th: "รอดำเนินการ", en: "Pending" }),
          color: "bg-yellow-500/20 text-yellow-400",
        };
      case "processing":
        return {
          label: t({ th: "กำลังจัดส่ง", en: "Processing" }),
          color: "bg-blue-500/20 text-blue-400",
        };
      case "shipped":
        return {
          label: t({ th: "จัดส่งแล้ว", en: "Shipped" }),
          color: "bg-purple-500/20 text-purple-400",
        };
      case "completed":
        return {
          label: t({ th: "เสร็จสิ้น", en: "Completed" }),
          color: "bg-green-500/20 text-green-400",
        };
      case "cancelled":
        return {
          label: t({ th: "ยกเลิก", en: "Cancelled" }),
          color: "bg-red-500/20 text-red-400",
        };
      default:
        return { label: status, color: "bg-gray-500/20 text-gray-400" };
    }
  };

  const handleRedeem = async () => {
    if (!selectedReward) return;

    if (selectedReward.category === "gadget" && !redeemAddress.trim()) {
      setRedeemError(
        t({
          th: "กรุณากรอกที่อยู่จัดส่ง",
          en: "Please enter a shipping address",
        })
      );
      return;
    }

    setRedeeming(true);
    setRedeemError("");

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId: selectedReward.id,
          address: redeemAddress || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRedeemSuccess(true);
        // Refresh data
        fetchData();
      } else {
        setRedeemError(
          data.error ||
            t({ th: "เกิดข้อผิดพลาด", en: "Something went wrong" })
        );
      }
    } catch {
      setRedeemError(
        t({ th: "เกิดข้อผิดพลาด", en: "Something went wrong" })
      );
    } finally {
      setRedeeming(false);
    }
  };

  const openRedeemModal = (reward: Reward) => {
    setSelectedReward(reward);
    setRedeemAddress("");
    setRedeemError("");
    setRedeemSuccess(false);
  };

  const closeModal = () => {
    setSelectedReward(null);
    setRedeemAddress("");
    setRedeemError("");
    setRedeemSuccess(false);
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[var(--bg-primary)] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">
              {t({ th: "กำลังโหลด...", en: "Loading..." })}
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--bg-primary)] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/wallet"
              className="text-gray-400 hover:text-white transition mb-4 inline-flex items-center gap-1"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t({ th: "กลับ", en: "Back" })}
            </Link>

            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl md:text-4xl font-black">
                {t({ th: "แลกของรางวัล", en: "Rewards Catalog" })}
              </h1>
            </div>

            {/* Points Banner */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white/70 text-sm font-medium">
                    {t({ th: "Points ของคุณ", en: "Your Points" })}
                  </div>
                  <div className="text-2xl font-black text-white">
                    {userPoints.toLocaleString()}
                  </div>
                </div>
              </div>
              <Link
                href="/wallet"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                {t({ th: "ดู Wallet", en: "View Wallet" })}
              </Link>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.key
                    ? "bg-orange-500 text-white"
                    : "bg-[var(--bg-secondary)] text-gray-400 border border-[var(--border-primary)] hover:border-orange-500/50 hover:text-white"
                }`}
              >
                {t(cat.label)}
              </button>
            ))}
          </div>

          {/* Rewards Grid */}
          {filteredRewards.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg">
                {t({
                  th: "ยังไม่มีของรางวัลในหมวดนี้",
                  en: "No rewards in this category yet",
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {filteredRewards.map((reward) => {
                const canAfford = userPoints >= reward.pointsCost;
                const outOfStock = reward.stock === 0;
                const badge = getCategoryBadge(reward.category);

                return (
                  <div
                    key={reward.id}
                    onClick={() =>
                      !outOfStock ? openRedeemModal(reward) : undefined
                    }
                    className={`bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group ${
                      outOfStock
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10"
                    }`}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={reward.imageUrl}
                        alt={locale === "th" ? reward.nameTh : reward.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Category Badge */}
                      <div className="absolute top-2 left-2">
                        <span
                          className={`${badge.color} text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      {/* Out of Stock Overlay */}
                      {outOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {t({ th: "หมดแล้ว", en: "Sold Out" })}
                          </span>
                        </div>
                      )}
                      {/* Stock indicator */}
                      {reward.stock > 0 && reward.stock <= 5 && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-red-500/90 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {t(
                              { th: "เหลือ {n} ชิ้น", en: "{n} left" },
                              { n: String(reward.stock) }
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-white text-sm md:text-base mb-1 line-clamp-2">
                        {locale === "th" ? reward.nameTh : reward.name}
                      </h3>

                      {/* Points Cost */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <svg
                          className="w-4 h-4 text-orange-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-orange-500 font-bold text-sm">
                          {reward.pointsCost.toLocaleString()} pts
                        </span>
                      </div>

                      {/* Redeem Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!outOfStock) openRedeemModal(reward);
                        }}
                        disabled={!canAfford || outOfStock}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          outOfStock
                            ? "bg-[var(--bg-card-inner)] text-gray-600 cursor-not-allowed"
                            : canAfford
                              ? "bg-orange-500 hover:bg-orange-400 text-white active:scale-95"
                              : "bg-[var(--bg-card-inner)] text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {outOfStock
                          ? t({ th: "หมดแล้ว", en: "Sold Out" })
                          : canAfford
                            ? t({ th: "แลก", en: "Redeem" })
                            : t({
                                th: "Points ไม่พอ",
                                en: "Not Enough Points",
                              })}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* My Redemptions Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {t({ th: "ประวัติการแลก", en: "My Redemptions" })}
            </h2>

            {redemptions.length === 0 ? (
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-8 text-center">
                <div className="text-gray-500 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  {t({
                    th: "ยังไม่มีประวัติการแลกของรางวัล",
                    en: "No redemptions yet",
                  })}
                </div>
                <p className="text-gray-600 text-sm">
                  {t({
                    th: "แลก Points เป็นของรางวัลจริงได้เลย!",
                    en: "Redeem your points for real rewards!",
                  })}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {redemptions.map((redemption) => {
                  const statusBadge = getStatusBadge(redemption.status);
                  return (
                    <div
                      key={redemption.id}
                      className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-4 flex items-center gap-4"
                    >
                      {/* Reward Image */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden">
                        <img
                          src={redemption.reward.imageUrl}
                          alt={
                            locale === "th"
                              ? redemption.reward.nameTh
                              : redemption.reward.name
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">
                          {locale === "th"
                            ? redemption.reward.nameTh
                            : redemption.reward.name}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <svg
                            className="w-3 h-3 text-orange-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {redemption.reward.pointsCost.toLocaleString()} pts
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(redemption.createdAt).toLocaleDateString(
                            locale === "th" ? "th-TH" : "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`${statusBadge.color} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Points Expiry Notice */}
          <div className="text-sm text-gray-500 text-center pb-8">
            {t({
              th: "Points จะหมดอายุหลัง 6 เดือนนับจากวันที่ได้รับ",
              en: "Points expire 6 months from the date received",
            })}
          </div>
        </div>

        {/* Redeem Modal */}
        {selectedReward && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div
              className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {redeemSuccess ? (
                /* Success State */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-500"
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
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t({
                      th: "แลกสำเร็จ!",
                      en: "Redemption Successful!",
                    })}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    {selectedReward.category === "gadget"
                      ? t({
                          th: "สินค้าจะจัดส่งไปยังที่อยู่ที่ระบุภายใน 7-14 วัน",
                          en: "Your item will be shipped to the provided address within 7-14 days",
                        })
                      : t({
                          th: "รางวัลจะส่งให้ทางอีเมลภายใน 24 ชั่วโมง",
                          en: "Your reward will be sent via email within 24 hours",
                        })}
                  </p>
                  <button
                    onClick={closeModal}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-white py-3 rounded-xl font-semibold transition"
                  >
                    {t({ th: "เข้าใจแล้ว", en: "Got it" })}
                  </button>
                </div>
              ) : (
                /* Redeem Form */
                <>
                  {/* Product Image */}
                  <div className="aspect-square max-h-64 overflow-hidden">
                    <img
                      src={selectedReward.imageUrl}
                      alt={
                        locale === "th"
                          ? selectedReward.nameTh
                          : selectedReward.name
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="mb-2">
                      <span
                        className={`${getCategoryBadge(selectedReward.category).color} text-xs font-semibold px-2.5 py-1 rounded-full`}
                      >
                        {getCategoryBadge(selectedReward.category).label}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-xl font-bold text-white mb-2">
                      {locale === "th"
                        ? selectedReward.nameTh
                        : selectedReward.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4">
                      {locale === "th"
                        ? selectedReward.descriptionTh
                        : selectedReward.description}
                    </p>

                    {/* Points Cost */}
                    <div className="bg-[var(--bg-primary)] rounded-xl p-3 flex items-center justify-between mb-4">
                      <span className="text-gray-400 text-sm">
                        {t({ th: "ใช้ Points", en: "Points Required" })}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 text-orange-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-orange-500 font-bold">
                          {selectedReward.pointsCost.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Your Balance */}
                    <div className="bg-[var(--bg-primary)] rounded-xl p-3 flex items-center justify-between mb-4">
                      <span className="text-gray-400 text-sm">
                        {t({ th: "Points คงเหลือ", en: "Your Balance" })}
                      </span>
                      <span
                        className={`font-bold ${userPoints >= selectedReward.pointsCost ? "text-green-400" : "text-red-400"}`}
                      >
                        {userPoints.toLocaleString()} pts
                      </span>
                    </div>

                    {/* Address Input for physical items */}
                    {selectedReward.category === "gadget" && (
                      <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">
                          {t({
                            th: "ที่อยู่จัดส่ง",
                            en: "Shipping Address",
                          })}
                        </label>
                        <textarea
                          value={redeemAddress}
                          onChange={(e) => setRedeemAddress(e.target.value)}
                          placeholder={t({
                            th: "กรอกที่อยู่สำหรับจัดส่งสินค้า...",
                            en: "Enter your shipping address...",
                          })}
                          rows={3}
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition resize-none"
                        />
                      </div>
                    )}

                    {/* Error Message */}
                    {redeemError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                        {redeemError}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={closeModal}
                        className="flex-1 border border-[var(--border-secondary)] text-gray-400 hover:text-white hover:border-white py-3 rounded-xl font-semibold transition"
                      >
                        {t({ th: "ยกเลิก", en: "Cancel" })}
                      </button>
                      <button
                        onClick={handleRedeem}
                        disabled={
                          userPoints < selectedReward.pointsCost || redeeming
                        }
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                          userPoints >= selectedReward.pointsCost && !redeeming
                            ? "bg-orange-500 hover:bg-orange-400 text-white active:scale-95"
                            : "bg-[var(--bg-card-inner)] text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {redeeming
                          ? t({
                              th: "กำลังแลก...",
                              en: "Redeeming...",
                            })
                          : t({ th: "ยืนยันแลก", en: "Confirm Redeem" })}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
