"use client";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import RankBadge from "@/components/RankBadge";
import StreakFire from "@/components/StreakFire";
import Avatar from "@/components/Avatar";
import { useEffect, useState, useRef } from "react";
import type { RankDefinition, BadgeDefinition } from "@/lib/gamification";
import type { AvatarFrame } from "@/lib/avatar-frames";

type BadgeCategory = "all" | "streak" | "submission" | "contract" | "points" | "special";

interface StatsData {
  tier: string;
  points: number;
  lifetimePoints: number;
  streak: number;
  rank: RankDefinition;
  nextRank: RankDefinition | null;
  rankProgress: number;
  stats: {
    activeContracts: number;
    completedContracts: number;
  };
}

interface BadgeData extends BadgeDefinition {
  earned: boolean;
  earnedAt: string | null;
}

interface BadgesResponse {
  badges: BadgeData[];
  earnedCount: number;
  totalCount: number;
}

interface FrameData extends AvatarFrame {
  owned: boolean;
  equipped: boolean;
}

interface FramesResponse {
  frames: FrameData[];
  currentFrame: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  streak: "border-orange-500/60",
  submission: "border-green-500/60",
  contract: "border-blue-500/60",
  points: "border-yellow-500/60",
  special: "border-purple-500/60",
};

const CATEGORY_GLOWS: Record<string, string> = {
  streak: "shadow-orange-500/20",
  submission: "shadow-green-500/20",
  contract: "shadow-blue-500/20",
  points: "shadow-yellow-500/20",
  special: "shadow-purple-500/20",
};

export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [badgesData, setBadgesData] = useState<BadgesResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<BadgeCategory>("all");
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  // Avatar, Banner & Frame state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState("default");
  const [framesData, setFramesData] = useState<FramesResponse | null>(null);
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [frameAction, setFrameAction] = useState<string | null>(null);
  const [frameTab, setFrameTab] = useState<"free" | "premium">("free");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Edit mode
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, badgesRes, framesRes] = await Promise.all([
        fetch("/api/gamification/stats"),
        fetch("/api/gamification/badges"),
        fetch("/api/profile/frame"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (badgesRes.ok) {
        const data = await badgesRes.json();
        setBadgesData(data);
      }

      if (framesRes.ok) {
        const data: FramesResponse = await framesRes.json();
        setFramesData(data);
        setCurrentFrame(data.currentFrame);
      }

      // Get avatar + banner from user profile
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setAvatarUrl(meData.user.avatarUrl || null);
        setBannerUrl(meData.user.bannerUrl || null);
        if (meData.user.avatarFrame) {
          setCurrentFrame(meData.user.avatarFrame);
        }
      }

      // Get total submissions count from wallet/transactions
      const walletRes = await fetch("/api/wallet");
      if (walletRes.ok) {
        const data = await walletRes.json();
        const submissions = (data.transactions || []).filter(
          (tx: { type: string }) => tx.type === "points_earned"
        ).length;
        setTotalSubmissions(submissions);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Avatar upload
  const handleAvatarClick = () => {
    if (editMode) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(t({ th: "รูปภาพใหญ่เกิน 2MB", en: "Image exceeds 2MB limit" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(t({ th: "กรุณาเลือกไฟล์รูปภาพ", en: "Please select an image file" }));
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: base64 }),
        });

        if (res.ok) {
          setAvatarUrl(base64);
        } else {
          const data = await res.json();
          alert(data.error || t({ th: "อัปโหลดล้มเหลว", en: "Upload failed" }));
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      alert(t({ th: "อัปโหลดล้มเหลว", en: "Upload failed" }));
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      if (res.ok) {
        setAvatarUrl(null);
      }
    } catch {
      alert(t({ th: "ไม่สามารถลบรูปโปรไฟล์ได้", en: "Failed to remove avatar" }));
    } finally {
      setUploading(false);
    }
  };

  // Banner upload
  const handleBannerClick = () => {
    if (editMode) {
      bannerInputRef.current?.click();
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(t({ th: "รูปภาพใหญ่เกิน 2MB", en: "Banner image exceeds 2MB limit" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(t({ th: "กรุณาเลือกไฟล์รูปภาพ", en: "Please select an image file" }));
      return;
    }

    setBannerUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bannerUrl: base64 }),
        });

        if (res.ok) {
          setBannerUrl(base64);
        } else {
          const data = await res.json();
          alert(data.error || t({ th: "อัปโหลดล้มเหลว", en: "Upload failed" }));
        }
        setBannerUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setBannerUploading(false);
      alert(t({ th: "อัปโหลดล้มเหลว", en: "Upload failed" }));
    }
  };

  const handleRemoveBanner = async () => {
    setBannerUploading(true);
    try {
      const res = await fetch("/api/profile/avatar?field=banner", { method: "DELETE" });
      if (res.ok) {
        setBannerUrl(null);
      }
    } catch {
      alert(t({ th: "ไม่สามารถลบแบนเนอร์ได้", en: "Failed to remove banner" }));
    } finally {
      setBannerUploading(false);
    }
  };

  // Frame actions
  const handleFrameAction = async (frameKey: string, action: "equip" | "buy") => {
    setFrameAction(frameKey);
    try {
      const res = await fetch("/api/profile/frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frameKey, action }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentFrame(data.currentFrame);
        setPreviewFrame(null);
        // Refresh frames data
        const framesRes = await fetch("/api/profile/frame");
        if (framesRes.ok) {
          setFramesData(await framesRes.json());
        }
        // Refresh stats if points were spent
        if (action === "buy") {
          const statsRes = await fetch("/api/gamification/stats");
          if (statsRes.ok) setStats(await statsRes.json());
        }
      } else {
        const data = await res.json();
        alert(data.error || t({ th: "ล้มเหลว", en: "Failed" }));
      }
    } catch {
      alert(t({ th: "ล้มเหลว", en: "Failed" }));
    } finally {
      setFrameAction(null);
    }
  };

  const categories: { key: BadgeCategory; label: string }[] = [
    { key: "all", label: t({ th: "ทั้งหมด", en: "All" }) },
    { key: "streak", label: "Streak" },
    { key: "submission", label: t({ th: "ส่งหลักฐาน", en: "Submission" }) },
    { key: "contract", label: t({ th: "สัญญา", en: "Contract" }) },
    { key: "points", label: "Points" },
    { key: "special", label: t({ th: "พิเศษ", en: "Special" }) },
  ];

  const filteredBadges = badgesData?.badges.filter(
    (b) => activeCategory === "all" || b.category === activeCategory
  ) ?? [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const displayFrame = previewFrame || currentFrame;

  const filteredFrames = framesData?.frames.filter(
    (f) => f.category === frameTab
  ) ?? [];

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">{t({ th: "กำลังโหลด...", en: "Loading..." })}</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* Profile Card with Banner */}
          <div className="relative bg-[#111111] border border-[#1A1A1A] rounded-2xl mb-6 overflow-hidden">

            {/* Banner */}
            <div
              className={`relative w-full h-[150px] sm:h-[200px] ${editMode ? "cursor-pointer" : ""}`}
              onClick={handleBannerClick}
            >
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Profile banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
              )}

              {/* Banner edit overlay (only in edit mode) */}
              {editMode && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  {bannerUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white text-xs font-medium">
                        {t({ th: "เปลี่ยนแบนเนอร์", en: "Change Banner" })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Remove banner button (edit mode only) */}
              {editMode && bannerUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveBanner();
                  }}
                  className="absolute top-3 left-3 bg-red-600/80 hover:bg-red-600 backdrop-blur-sm text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition"
                  title={t({ th: "ลบแบนเนอร์", en: "Remove banner" })}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Hidden banner file input */}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />

            {/* Pencil / Edit button — top right */}
            <button
              onClick={() => setEditMode(!editMode)}
              className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                editMode
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "bg-[#1A1A1A]/80 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-[#1A1A1A]"
              }`}
              title={editMode
                ? t({ th: "ปิดแก้ไข", en: "Close edit" })
                : t({ th: "แก้ไขโปรไฟล์", en: "Edit profile" })
              }
            >
              {editMode ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </button>

            {/* Avatar + Info section below banner */}
            <div className="relative px-6 pb-6">
              {/* Avatar overlapping banner */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
                <div className="relative group z-10">
                  <button
                    onClick={handleAvatarClick}
                    className={`relative ${editMode ? "cursor-pointer" : "cursor-default"}`}
                    disabled={uploading || !editMode}
                  >
                    <div className="rounded-full border-4 border-[#111111] bg-[#111111]">
                      <Avatar
                        avatarUrl={avatarUrl}
                        name={user?.name}
                        frameKey={displayFrame}
                        size="xl"
                        showFrame={true}
                      />
                    </div>
                    {/* Camera overlay on avatar (edit mode only) */}
                    {editMode && (
                      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        {uploading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </div>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {/* Remove avatar button (edit mode only) */}
                  {editMode && avatarUrl && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="absolute -bottom-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition z-20"
                      title={t({ th: "ลบรูปโปรไฟล์", en: "Remove avatar" })}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Name + Rank */}
                <div className="flex-1 min-w-0 sm:pb-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold truncate">
                      {user?.name || t({ th: "ผู้ใช้", en: "User" })}
                    </h1>
                    {stats && (
                      <RankBadge lifetimePoints={stats.lifetimePoints} size="md" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Rank Progress */}
              {stats && (
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {t({ th: "คะแนนสะสม", en: "Lifetime Points" })}:{" "}
                      <span className="text-white font-semibold">
                        {stats.lifetimePoints.toLocaleString()} pts
                      </span>
                    </span>
                    <span className="text-gray-400">
                      {stats.nextRank
                        ? t({
                            th: `อีก ${(stats.nextRank.minPoints - stats.lifetimePoints).toLocaleString()} pts ถึง ${stats.nextRank.nameTh}`,
                            en: `${(stats.nextRank.minPoints - stats.lifetimePoints).toLocaleString()} pts to ${stats.nextRank.nameEn}`,
                          })
                        : t({ th: "Rank สูงสุดแล้ว!", en: "Max Rank!" })}
                    </span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-600 to-orange-400 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${stats.rankProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {t({ th: "สมาชิกตั้งแต่", en: "Member since" })}:{" "}
                    {user?.id
                      ? formatDate(new Date().toISOString())
                      : "---"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Edit Mode Panel — Avatar Frame Selector (slide-down) */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              editMode ? "max-h-[2000px] opacity-100 mb-6" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {t({ th: "กรอบโปรไฟล์", en: "Avatar Frames" })}
                </h2>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition"
                >
                  {t({ th: "เสร็จสิ้น", en: "Done" })}
                </button>
              </div>

              {/* Frame Preview */}
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <Avatar
                    avatarUrl={avatarUrl}
                    name={user?.name}
                    frameKey={displayFrame}
                    size="xl"
                    showFrame={true}
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    {t({ th: "ตัวอย่าง", en: "Preview" })}
                  </p>
                </div>
              </div>

              {/* Frame Category Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setFrameTab("free")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    frameTab === "free"
                      ? "bg-orange-500 text-white"
                      : "bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-[#222]"
                  }`}
                >
                  {t({ th: "ฟรี", en: "Free" })} ({framesData?.frames.filter(f => f.category === "free").length ?? 0})
                </button>
                <button
                  onClick={() => setFrameTab("premium")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    frameTab === "premium"
                      ? "bg-orange-500 text-white"
                      : "bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-[#222]"
                  }`}
                >
                  {t({ th: "พรีเมียม", en: "Premium" })} ({framesData?.frames.filter(f => f.category === "premium").length ?? 0})
                </button>
              </div>

              {/* Current points */}
              {frameTab === "premium" && stats && (
                <div className="mb-4 text-sm text-gray-400">
                  {t({ th: "Points ที่ใช้ได้:", en: "Available Points:" })}{" "}
                  <span className="text-yellow-400 font-semibold">{stats.points.toLocaleString()} pts</span>
                </div>
              )}

              {/* Frame Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {filteredFrames.map((frame) => {
                  const isEquipped = currentFrame === frame.key;
                  const isPreviewing = previewFrame === frame.key;

                  return (
                    <div
                      key={frame.key}
                      className={`relative rounded-xl p-3 text-center transition-all cursor-pointer ${
                        isEquipped
                          ? "bg-orange-500/10 border-2 border-orange-500"
                          : isPreviewing
                          ? "bg-blue-500/10 border-2 border-blue-500/50"
                          : "bg-[#1A1A1A] border border-[#222] hover:border-[#444]"
                      }`}
                      onMouseEnter={() => setPreviewFrame(frame.key)}
                      onMouseLeave={() => setPreviewFrame(null)}
                    >
                      {/* Mini avatar preview */}
                      <div className="flex justify-center mb-2">
                        <Avatar
                          avatarUrl={avatarUrl}
                          name={user?.name}
                          frameKey={frame.key}
                          size="md"
                          showFrame={true}
                        />
                      </div>

                      {/* Frame name */}
                      <div className="text-xs font-medium text-white truncate">
                        {t({ th: frame.nameTh, en: frame.nameEn })}
                      </div>

                      {/* Cost or status */}
                      {isEquipped ? (
                        <div className="text-xs text-orange-400 mt-1">
                          {t({ th: "ใช้อยู่", en: "Equipped" })}
                        </div>
                      ) : frame.owned ? (
                        <button
                          onClick={() => handleFrameAction(frame.key, "equip")}
                          disabled={frameAction === frame.key}
                          className="text-xs text-green-400 hover:text-green-300 mt-1 transition"
                        >
                          {frameAction === frame.key
                            ? "..."
                            : t({ th: "ใช้งาน", en: "Equip" })}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFrameAction(frame.key, "buy")}
                          disabled={frameAction === frame.key}
                          className="text-xs text-yellow-400 hover:text-yellow-300 mt-1 transition"
                        >
                          {frameAction === frame.key
                            ? "..."
                            : `${frame.pointsCost.toLocaleString()} pts`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {/* Submissions */}
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">
                <svg className="w-7 h-7 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{totalSubmissions}</div>
              <div className="text-xs text-gray-400 mt-1">
                {t({ th: "ส่งหลักฐาน", en: "Submissions" })}
              </div>
            </div>

            {/* Contracts Completed */}
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">
                <svg className="w-7 h-7 mx-auto text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats?.stats.completedContracts ?? 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {t({ th: "สัญญาสำเร็จ", en: "Completed" })}
              </div>
            </div>

            {/* Streak */}
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 text-center flex flex-col items-center justify-center">
              <StreakFire streak={stats?.streak ?? 0} size="md" />
              <div className="text-xs text-gray-400 mt-1">
                {t({ th: "Streak", en: "Streak" })}
              </div>
            </div>

            {/* Lifetime Points */}
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">
                <svg className="w-7 h-7 mx-auto text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats?.lifetimePoints.toLocaleString() ?? 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {t({ th: "Lifetime Points", en: "Lifetime Points" })}
              </div>
            </div>
          </div>

          {/* Badge Collection */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {t({ th: "เหรียญรางวัล", en: "Badges" })}{" "}
                <span className="text-sm font-normal text-gray-400">
                  ({badgesData?.earnedCount ?? 0}/{badgesData?.totalCount ?? 10}{" "}
                  {t({ th: "earned", en: "earned" })})
                </span>
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.key
                      ? "bg-orange-500 text-white"
                      : "bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-[#222]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {filteredBadges.map((badge) => (
                <div
                  key={badge.key}
                  className={`relative rounded-xl p-4 text-center transition-all duration-300 ${
                    badge.earned
                      ? `bg-[#1A1A1A] border-2 ${CATEGORY_COLORS[badge.category]} shadow-lg ${CATEGORY_GLOWS[badge.category]} hover:scale-105 hover:shadow-xl`
                      : "bg-[#1A1A1A] border border-[#222] opacity-50"
                  }`}
                >
                  {/* Lock overlay for unearned */}
                  {!badge.earned && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl z-10">
                      <span className="text-2xl opacity-60">🔒</span>
                    </div>
                  )}

                  {/* Badge icon */}
                  <div
                    className={`text-4xl mb-2 ${
                      !badge.earned ? "grayscale opacity-30" : ""
                    }`}
                    style={!badge.earned ? { filter: "grayscale(100%)" } : undefined}
                  >
                    {badge.icon}
                  </div>

                  {/* Badge name */}
                  <div
                    className={`text-sm font-bold mb-1 ${
                      badge.earned ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {t({ th: badge.nameTh, en: badge.nameEn })}
                  </div>

                  {/* Earned date or description */}
                  {badge.earned ? (
                    <div className="text-xs text-gray-400">
                      {badge.earnedAt ? formatDate(badge.earnedAt) : ""}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 relative z-0">
                      {t({ th: badge.descriptionTh, en: badge.descriptionEn })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredBadges.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t({ th: "ไม่มีเหรียญในหมวดนี้", en: "No badges in this category" })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
