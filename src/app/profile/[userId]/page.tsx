"use client";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import Avatar from "@/components/Avatar";
import RankBadge from "@/components/RankBadge";
import { useEffect, useState, use } from "react";
import { getBadgeDefinition } from "@/lib/gamification";
import type { RankDefinition } from "@/lib/gamification";
import { PROVINCES } from "@/lib/provinces";
import Link from "next/link";

interface PublicProfile {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  avatarFrame: string;
  lifetimePoints: number;
  province: string | null;
  createdAt: string;
  rank: RankDefinition;
  streak: number;
  badges: { badgeKey: string; earnedAt: string }[];
  stats: {
    activeContracts: number;
    completedContracts: number;
    failedContracts: number;
  };
}

interface FriendshipStatus {
  status: "none" | "pending_sent" | "pending_received" | "accepted";
  friendshipId?: string;
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { t } = useI18n();
  const { user: currentUser, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendshipStatus>({ status: "none" });
  const [friendLoading, setFriendLoading] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
    if (isLoggedIn && !isOwnProfile) {
      checkFriendship();
    }
  }, [userId, isLoggedIn]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/profile/${userId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "User not found");
        return;
      }
      const data = await res.json();
      setProfile(data.user);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const checkFriendship = async () => {
    try {
      const res = await fetch("/api/friends");
      if (!res.ok) return;
      const data = await res.json();

      // Check accepted friends
      const accepted = (data.friends || []).find(
        (f: { friendId?: string; userId?: string }) =>
          f.friendId === userId || f.userId === userId
      );
      if (accepted) {
        setFriendStatus({ status: "accepted", friendshipId: accepted.id });
        return;
      }

      // Check pending sent
      const pendingRes = await fetch("/api/friends/pending");
      if (!pendingRes.ok) return;
      const pendingData = await pendingRes.json();

      const sentPending = (pendingData.sent || []).find(
        (f: { friendId: string }) => f.friendId === userId
      );
      if (sentPending) {
        setFriendStatus({ status: "pending_sent", friendshipId: sentPending.id });
        return;
      }

      const receivedPending = (pendingData.received || []).find(
        (f: { userId: string }) => f.userId === userId
      );
      if (receivedPending) {
        setFriendStatus({ status: "pending_received", friendshipId: receivedPending.id });
        return;
      }
    } catch {
      // ignore
    }
  };

  const handleAddFriend = async () => {
    setFriendLoading(true);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFriendStatus({ status: "pending_sent", friendshipId: data.friendship.id });
      } else {
        const data = await res.json();
        // If already exists, refresh
        if (res.status === 409) {
          checkFriendship();
        } else {
          alert(data.error || "Failed");
        }
      }
    } catch {
      alert("Failed to send friend request");
    } finally {
      setFriendLoading(false);
    }
  };

  const handleAcceptFriend = async () => {
    if (!friendStatus.friendshipId) return;
    setFriendLoading(true);
    try {
      const res = await fetch("/api/friends/request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId: friendStatus.friendshipId, action: "accept" }),
      });
      if (res.ok) {
        setFriendStatus({ ...friendStatus, status: "accepted" });
      }
    } catch {
      alert("Failed");
    } finally {
      setFriendLoading(false);
    }
  };

  const getProvinceName = (code: string | null) => {
    if (!code) return null;
    const province = PROVINCES.find((p) => p.code === code);
    return province ? province.nameTh : code;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">?</div>
          <h1 className="text-xl font-bold mb-2">
            {t({ th: "ไม่พบผู้ใช้", en: "User not found" })}
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/friends" className="text-orange-500 hover:text-orange-400 transition">
            {t({ th: "กลับไปหน้าเพื่อน", en: "Back to Friends" })}
          </Link>
        </div>
      </div>
    );
  }

  // Redirect to own profile if viewing self
  if (isOwnProfile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{t({ th: "นี่คือโปรไฟล์ของคุณ", en: "This is your profile" })}</p>
          <Link
            href="/profile"
            className="text-orange-500 hover:text-orange-400 transition font-medium"
          >
            {t({ th: "ไปหน้าโปรไฟล์ของฉัน", en: "Go to My Profile" })}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[#1A1A1A] rounded-2xl p-6 mb-6 text-center">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <Avatar
              avatarUrl={profile.avatarUrl}
              name={profile.name}
              frameKey={profile.avatarFrame}
              size="xl"
              showFrame={true}
            />
          </div>

          {/* Name & Rank */}
          <h1 className="text-2xl font-bold mb-1">
            {profile.name || t({ th: "ผู้ใช้", en: "User" })}
          </h1>
          <div className="flex justify-center mb-3">
            <RankBadge lifetimePoints={profile.lifetimePoints} size="md" />
          </div>

          {/* Province */}
          {profile.province && (
            <p className="text-sm text-gray-400 mb-3">
              {getProvinceName(profile.province)}
            </p>
          )}

          {/* Member since */}
          <p className="text-xs text-gray-500 mb-4">
            {t({ th: "สมาชิกตั้งแต่", en: "Member since" })}: {formatDate(profile.createdAt)}
          </p>

          {/* Friend Action Button */}
          {isLoggedIn && !isOwnProfile && (
            <div className="mt-4">
              {friendStatus.status === "none" && (
                <button
                  onClick={handleAddFriend}
                  disabled={friendLoading}
                  className="px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition disabled:opacity-50"
                >
                  {friendLoading
                    ? "..."
                    : t({ th: "เพิ่มเพื่อน", en: "Add Friend" })}
                </button>
              )}
              {friendStatus.status === "pending_sent" && (
                <span className="px-6 py-2 rounded-full bg-[#1A1A1A] text-gray-400 font-medium">
                  {t({ th: "ส่งคำขอแล้ว", en: "Request Sent" })}
                </span>
              )}
              {friendStatus.status === "pending_received" && (
                <button
                  onClick={handleAcceptFriend}
                  disabled={friendLoading}
                  className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium transition disabled:opacity-50"
                >
                  {friendLoading
                    ? "..."
                    : t({ th: "ตอบรับเป็นเพื่อน", en: "Accept Friend Request" })}
                </button>
              )}
              {friendStatus.status === "accepted" && (
                <span className="px-6 py-2 rounded-full bg-green-500/20 text-green-400 font-medium">
                  {t({ th: "เป็นเพื่อนแล้ว", en: "Friends" })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{profile.lifetimePoints.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">
              {t({ th: "Lifetime Points", en: "Lifetime Points" })}
            </div>
          </div>
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{profile.streak}</div>
            <div className="text-xs text-gray-400 mt-1">
              {t({ th: "Streak", en: "Streak" })}
            </div>
          </div>
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{profile.stats.completedContracts}</div>
            <div className="text-xs text-gray-400 mt-1">
              {t({ th: "สัญญาสำเร็จ", en: "Completed" })}
            </div>
          </div>
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{profile.stats.activeContracts}</div>
            <div className="text-xs text-gray-400 mt-1">
              {t({ th: "สัญญาที่กำลังทำ", en: "Active" })}
            </div>
          </div>
        </div>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              {t({ th: "เหรียญรางวัล", en: "Badges" })}{" "}
              <span className="text-sm font-normal text-gray-400">
                ({profile.badges.length})
              </span>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {profile.badges.map((badge) => {
                const def = getBadgeDefinition(badge.badgeKey);
                if (!def) return null;
                return (
                  <div
                    key={badge.badgeKey}
                    className="bg-[#1A1A1A] rounded-xl p-3 text-center border border-[#222]"
                  >
                    <div className="text-3xl mb-1">{def.icon}</div>
                    <div className="text-xs font-medium text-white">
                      {t({ th: def.nameTh, en: def.nameEn })}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDate(badge.earnedAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {profile.badges.length === 0 && (
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6 text-center">
            <p className="text-gray-500">
              {t({ th: "ยังไม่มีเหรียญรางวัล", en: "No badges yet" })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
