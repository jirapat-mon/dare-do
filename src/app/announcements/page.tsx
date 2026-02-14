"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import RankBadge from "@/components/RankBadge";

interface Announcement {
  id: string;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    avatarFrame: string;
    lifetimePoints: number;
  };
  goal: string;
  duration: number;
  daysCompleted: number;
  stakes: number;
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

function formatDuration(days: number, locale: "th" | "en") {
  return locale === "th" ? `${days} วัน` : `${days} days`;
}

export default function AnnouncementsPage() {
  const { t, locale } = useI18n();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Skeleton loader
  const CardSkeleton = () => (
    <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#1A1A1A] rounded w-1/3" />
          <div className="h-3 bg-[#1A1A1A] rounded w-2/3" />
          <div className="h-3 bg-[#1A1A1A] rounded w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {t({ th: "ประกาศ", en: "Announcements" })}
            </h1>
            <p className="text-sm text-gray-500">
              {t({
                th: "เมื่อใครทำสัญญาสำเร็จ จะประกาศที่นี่",
                en: "When someone completes a contract, it shows up here",
              })}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && announcements.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📢</div>
            <p className="text-gray-400 text-lg">
              {t({
                th: "ยังไม่มีประกาศ",
                en: "No announcements yet",
              })}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {t({
                th: "เมื่อมีคนทำสัญญาสำเร็จ จะแสดงที่นี่",
                en: "When someone completes a contract, it will show up here",
              })}
            </p>
          </div>
        )}

        {/* Announcements list */}
        {!loading && announcements.length > 0 && (
          <div className="space-y-3">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 hover:border-[#333] transition"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <Link
                    href={`/profile/${item.user.id}`}
                    className="flex-shrink-0"
                  >
                    <Avatar
                      avatarUrl={item.user.avatarUrl}
                      name={item.user.name}
                      frameKey={item.user.avatarFrame}
                      size="md"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* User name + rank + celebration */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/profile/${item.user.id}`}
                        className="text-sm font-semibold text-white hover:text-orange-400 transition truncate"
                      >
                        {item.user.name || t({ th: "ผู้ใช้", en: "User" })}
                      </Link>
                      <RankBadge
                        lifetimePoints={item.user.lifetimePoints}
                        size="sm"
                        showLabel={false}
                      />
                      <span className="text-base" title={t({ th: "ทำสำเร็จ!", en: "Completed!" })}>
                        🎉
                      </span>
                    </div>

                    {/* Goal */}
                    <p className="text-sm text-gray-300 mt-1">
                      <span className="text-green-400 font-medium">
                        {t({ th: "ทำสำเร็จ", en: "Completed" })}
                      </span>
                      {" — "}
                      <span>{item.goal}</span>
                    </p>

                    {/* Details row */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {/* Duration */}
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatDuration(item.duration, locale)}
                      </span>

                      {/* Days completed */}
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {item.daysCompleted}/{item.duration}{" "}
                        {t({ th: "วัน", en: "days" })}
                      </span>

                      {/* Stakes */}
                      {item.stakes > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-400/80">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          ฿{item.stakes.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Relative time */}
                    <p className="text-xs text-gray-600 mt-2">
                      {relativeTime(item.createdAt, locale)}
                    </p>
                  </div>

                  {/* Success badge */}
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                      <svg
                        className="w-3 h-3"
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
                      {t({ th: "สำเร็จ", en: "Success" })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
