"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

interface Friend {
  id: string;
  friendshipId: string;
  name: string | null;
  email: string;
  lifetimePoints: number;
  province: string | null;
}

interface SearchResult {
  id: string;
  name: string | null;
  email: string;
  lifetimePoints: number;
  province: string | null;
  isFriend: boolean;
  isPending: boolean;
}

interface PendingRequest {
  friendshipId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    lifetimePoints: number;
  };
  createdAt: string;
}

interface ActivityItem {
  id: string;
  userName: string;
  goal: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
}

function relativeTime(dateStr: string, locale: "th" | "en") {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return locale === "th" ? "เมื่อสักครู่" : "just now";
  if (mins < 60)
    return locale === "th" ? `${mins} นาทีที่แล้ว` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)
    return locale === "th" ? `${hrs} ชั่วโมงที่แล้ว` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return locale === "th" ? `${days} วันที่แล้ว` : `${days}d ago`;
}

const tabNamesTh: Record<string, string> = {
  friends: "เพื่อน",
  search: "ค้นหา",
  requests: "คำขอ",
  activity: "กิจกรรม",
};

const tabNamesEn: Record<string, string> = {
  friends: "Friends",
  search: "Search",
  requests: "Requests",
  activity: "Activity",
};

export default function FriendsPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const tabs = ["friends", "search", "requests", "activity"];
  const [activeTab, setActiveTab] = useState("friends");

  // Friends tab state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Requests tab state
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  // Activity tab state
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const pendingCount = pendingRequests.length;

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    setFriendsLoading(true);
    try {
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
      }
    } catch {
      // silently fail
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  // Fetch pending requests
  const fetchPending = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch("/api/friends/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.requests || []);
      }
    } catch {
      // silently fail
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  // Fetch activity feed
  const fetchActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const res = await fetch("/api/friends/activity");
      if (res.ok) {
        const data = await res.json();
        // Map API response fields to frontend ActivityItem interface
        // API returns: { activity: [{ friendId, friendName, goal, submissionStatus, createdAt }] }
        // Frontend expects: { id, userName, goal, status, createdAt }
        const mapped = (data.activity || []).map((item: { friendId: string; friendName: string | null; goal: string; submissionStatus: string; createdAt: string }, idx: number) => ({
          id: item.friendId + "-" + idx,
          userName: item.friendName || t({ th: "ผู้ใช้", en: "User" }),
          goal: item.goal,
          status: item.submissionStatus,
          createdAt: item.createdAt,
        }));
        setActivities(mapped);
      }
    } catch {
      // silently fail
    } finally {
      setActivityLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFriends();
    fetchPending();
  }, [fetchFriends, fetchPending]);

  // Load activity when tab is opened
  useEffect(() => {
    if (activeTab === "activity") {
      fetchActivity();
    }
  }, [activeTab, fetchActivity]);

  // Search with debounce
  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      clearTimeout(debounceRef.current);
      if (value.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const res = await fetch(
            `/api/friends?search=${encodeURIComponent(value.trim())}`
          );
          if (res.ok) {
            const data = await res.json();
            // Map API response (friendshipStatus) to frontend interface (isFriend/isPending)
            const mapped = (data.users || []).map((u: { id: string; name: string | null; email: string; lifetimePoints: number; province: string | null; friendshipStatus?: string }) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              lifetimePoints: u.lifetimePoints,
              province: u.province,
              isFriend: u.friendshipStatus === "accepted",
              isPending: u.friendshipStatus === "pending",
            }));
            setSearchResults(mapped);
          }
        } catch {
          // silently fail
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    },
    []
  );

  // Send friend request
  const handleAddFriend = async (friendId: string) => {
    setAddingId(friendId);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });
      if (res.ok) {
        setSearchResults((prev) =>
          prev.map((u) => (u.id === friendId ? { ...u, isPending: true } : u))
        );
      }
    } catch {
      // silently fail
    } finally {
      setAddingId(null);
    }
  };

  // Accept or reject request
  const handleRespondRequest = async (
    friendshipId: string,
    action: "accept" | "reject"
  ) => {
    setRespondingId(friendshipId);
    try {
      const res = await fetch("/api/friends/request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, action }),
      });
      if (res.ok) {
        setPendingRequests((prev) =>
          prev.filter((r) => r.friendshipId !== friendshipId)
        );
        if (action === "accept") {
          fetchFriends();
        }
      }
    } catch {
      // silently fail
    } finally {
      setRespondingId(null);
    }
  };

  // Unfriend
  const handleUnfriend = async (friendshipId: string, friendName: string) => {
    const msg =
      locale === "th"
        ? `ต้องการลบ ${friendName} ออกจากเพื่อนหรือไม่?`
        : `Remove ${friendName} from friends?`;
    if (!confirm(msg)) return;

    try {
      const res = await fetch("/api/friends/request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        setFriends((prev) =>
          prev.filter((f) => f.friendshipId !== friendshipId)
        );
      }
    } catch {
      // silently fail
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "rejected":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return locale === "th" ? "อนุมัติ" : "Approved";
      case "pending":
        return locale === "th" ? "รอตรวจ" : "Pending";
      case "rejected":
        return locale === "th" ? "ปฏิเสธ" : "Rejected";
      default:
        return status;
    }
  };

  // Skeleton loader
  const CardSkeleton = () => (
    <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#1A1A1A]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#1A1A1A] rounded w-2/3" />
          <div className="h-3 bg-[#1A1A1A] rounded w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <h1 className="text-2xl font-bold mb-6">
            {t({ th: "เพื่อน", en: "Friends" })}
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab
                    ? "bg-orange-500 text-white"
                    : "bg-[#1A1A1A] text-gray-400 hover:text-white"
                }`}
              >
                {t({ th: tabNamesTh[tab], en: tabNamesEn[tab] })}
                {tab === "friends" && friends.length > 0 && (
                  <span className="ml-1.5 text-xs opacity-75">
                    {friends.length}
                  </span>
                )}
                {tab === "requests" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab: Friends */}
          {activeTab === "friends" && (
            <div>
              {friendsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">👥</div>
                  <p className="text-gray-400 mb-2">
                    {t({
                      th: "ยังไม่มีเพื่อน",
                      en: "No friends yet",
                    })}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {t({
                      th: "ค้นหาและเพิ่มเพื่อนเพื่อเริ่มต้น!",
                      en: "Search and add friends to get started!",
                    })}
                  </p>
                  <button
                    onClick={() => setActiveTab("search")}
                    className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition"
                  >
                    {t({ th: "ค้นหาเพื่อน", en: "Find Friends" })}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-4">
                    {friends.length}{" "}
                    {t({ th: "เพื่อน", en: "friends" })}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 hover:border-[#333] transition"
                      >
                        <Link href={`/profile/${friend.id}`} className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-lg mb-2">
                            {friend.name?.charAt(0)?.toUpperCase() ||
                              friend.email?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <p className="text-sm font-medium text-white truncate w-full">
                            {friend.name || friend.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate w-full">
                            {friend.lifetimePoints.toLocaleString()} pts
                          </p>
                          {friend.province && (
                            <p className="text-xs text-gray-600 truncate w-full mt-0.5">
                              {friend.province}
                            </p>
                          )}
                        </Link>
                        <button
                          onClick={() =>
                            handleUnfriend(
                              friend.friendshipId,
                              friend.name || friend.email
                            )
                          }
                          className="mt-3 text-xs text-gray-500 hover:text-red-400 transition px-3 py-1 rounded-full border border-[#1A1A1A] hover:border-red-500/50"
                        >
                          {t({ th: "ลบเพื่อน", en: "Unfriend" })}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Search */}
          {activeTab === "search" && (
            <div>
              <div className="relative mb-6">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={t({
                    th: "ค้นหาด้วยชื่อหรืออีเมล...",
                    en: "Search by name or email...",
                  })}
                  className="w-full bg-[#111111] border border-[#1A1A1A] text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition placeholder:text-gray-600"
                />
              </div>

              {searchLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-gray-400 text-sm">
                    {t({
                      th: "พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา",
                      en: "Type at least 2 characters to search",
                    })}
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">😕</div>
                  <p className="text-gray-400">
                    {t({
                      th: "ไม่พบผู้ใช้",
                      en: "No users found",
                    })}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((result) => {
                    const isMe = result.id === user?.id;
                    return (
                      <div
                        key={result.id}
                        className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 flex items-center gap-3"
                      >
                        <Link href={`/profile/${result.id}`} className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {result.name?.charAt(0)?.toUpperCase() ||
                            result.email?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </Link>
                        <Link href={`/profile/${result.id}`} className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {result.name || result.email}
                            {isMe && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({t({ th: "คุณ", en: "You" })})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {result.email}
                          </p>
                          <p className="text-xs text-gray-600">
                            {result.lifetimePoints.toLocaleString()} pts
                            {result.province && ` · ${result.province}`}
                          </p>
                        </Link>
                        <div className="flex-shrink-0">
                          {isMe ? null : result.isFriend ? (
                            <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">
                              {t({
                                th: "เป็นเพื่อนแล้ว",
                                en: "Friends",
                              })}
                            </span>
                          ) : result.isPending ? (
                            <span className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                              {t({
                                th: "รอตอบรับ",
                                en: "Pending",
                              })}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(result.id)}
                              disabled={addingId === result.id}
                              className="text-xs bg-orange-500 text-white px-4 py-1.5 rounded-full font-medium hover:bg-orange-600 transition disabled:opacity-50"
                            >
                              {addingId === result.id
                                ? "..."
                                : t({
                                    th: "ส่งคำขอ",
                                    en: "Add Friend",
                                  })}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Requests */}
          {activeTab === "requests" && (
            <div>
              {requestsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-400">
                    {t({
                      th: "ไม่มีคำขอเป็นเพื่อน",
                      en: "No pending requests",
                    })}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.friendshipId}
                      className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4"
                    >
                      <Link href={`/profile/${req.user.id}`} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {req.user.name?.charAt(0)?.toUpperCase() ||
                            req.user.email?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {req.user.name || req.user.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {req.user.email}
                          </p>
                          <p className="text-xs text-gray-600">
                            {req.user.lifetimePoints.toLocaleString()} pts
                            {" · "}
                            {relativeTime(req.createdAt, locale)}
                          </p>
                        </div>
                      </Link>
                      <div className="flex gap-2 mt-3 ml-15">
                        <button
                          onClick={() =>
                            handleRespondRequest(req.friendshipId, "accept")
                          }
                          disabled={respondingId === req.friendshipId}
                          className="flex-1 bg-orange-500 text-white py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
                        >
                          {t({ th: "ตอบรับ", en: "Accept" })}
                        </button>
                        <button
                          onClick={() =>
                            handleRespondRequest(req.friendshipId, "reject")
                          }
                          disabled={respondingId === req.friendshipId}
                          className="flex-1 border border-[#333] text-gray-400 py-2 rounded-full text-sm font-medium hover:text-white hover:border-white transition disabled:opacity-50"
                        >
                          {t({ th: "ปฏิเสธ", en: "Reject" })}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Activity */}
          {activeTab === "activity" && (
            <div>
              {activityLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📰</div>
                  <p className="text-gray-400">
                    {t({
                      th: "ยังไม่มีกิจกรรม",
                      en: "No activity yet",
                    })}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {t({
                      th: "เพิ่มเพื่อนเพื่อเห็นกิจกรรม",
                      en: "Add friends to see their activity",
                    })}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                        {item.userName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <span className="font-medium">{item.userName}</span>
                          <span className="text-gray-400">
                            {" "}
                            {t({
                              th: "ส่งหลักฐาน",
                              en: "submitted proof for",
                            })}{" "}
                          </span>
                          <span className="text-gray-300">{item.goal}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-medium ${statusColor(item.status)}`}
                          >
                            {statusLabel(item.status)}
                          </span>
                          <span className="text-xs text-gray-600">·</span>
                          <span className="text-xs text-gray-500">
                            {relativeTime(item.createdAt, locale)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.status === "approved"
                              ? "bg-green-400"
                              : item.status === "pending"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
