"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";

type SubmissionStatus = "pending" | "approved" | "rejected";
type AdminTab = SubmissionStatus | "revenue";

interface Submission {
  id: string;
  imageData: string;
  note: string | null;
  metadata: string | null;
  status: SubmissionStatus;
  createdAt: string;
  contract: {
    id: string;
    goal: string;
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  };
}

interface RevenueTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface RevenueData {
  balance: number;
  totalRevenue: number;
  transactions: RevenueTransaction[];
}

interface AdminStats {
  users: { total: number; active7d: number; withActiveContracts: number };
  subscriptions: { free: number; starter: number; pro: number };
  contracts: { total: number; active: number; success: number; failed: number };
  pendingSubmissions: number;
  totalPointsStaked: number;
}

export default function AdminPage() {
  const { t } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("pending");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "revenue") {
      fetchRevenue();
    } else {
      fetchSubmissions(activeTab as SubmissionStatus);
    }
  }, [activeTab]);

  const fetchSubmissions = async (status: SubmissionStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
      } else {
        console.error("Failed to fetch submissions");
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchRevenue = async () => {
    setRevenueLoading(true);
    try {
      const res = await fetch("/api/admin/revenue");
      if (res.ok) {
        const data = await res.json();
        setRevenue(data);
      }
    } catch (err) {
      console.error("Error fetching revenue:", err);
    } finally {
      setRevenueLoading(false);
    }
  };

  const handleReview = async (
    submissionId: string,
    status: "approved" | "rejected"
  ) => {
    setProcessingIds((prev) => new Set(prev).add(submissionId));

    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          status,
          notes: reviewNotes[submissionId] || undefined,
        }),
      });

      if (res.ok) {
        await fetchSubmissions(activeTab as SubmissionStatus);
        setReviewNotes((prev) => {
          const newNotes = { ...prev };
          delete newNotes[submissionId];
          return newNotes;
        });
      } else {
        const data = await res.json();
        alert(`${t({ th: "เกิดข้อผิดพลาด", en: "Error" })}: ${data.error || t({ th: "ไม่สามารถตรวจสอบได้", en: "Failed to review submission" })}`);
      }
    } catch (err) {
      console.error("Error reviewing submission:", err);
      alert(t({ th: "ไม่สามารถตรวจสอบได้", en: "Failed to review submission" }));
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const getTabCount = (status: SubmissionStatus) => {
    return status === activeTab ? submissions.length : "?";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Admin access check — redirect non-admin users
  if (!authLoading && user && user.role !== "admin") {
    router.push("/dashboard");
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--bg-primary)] text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Title */}
          <h1 className="text-3xl font-bold mb-6">{t("admin.title")}</h1>

          {/* Stats Dashboard */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t({ th: "ผู้ใช้ทั้งหมด", en: "Total Users" })}</p>
                <p className="text-2xl font-bold text-white">{stats.users.total}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t({ th: "ใช้งาน 7 วัน", en: "Active 7d" })}</p>
                <p className="text-2xl font-bold text-green-400">{stats.users.active7d}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t({ th: "Contract ใช้งาน", en: "Active Contracts" })}</p>
                <p className="text-2xl font-bold text-orange-400">{stats.contracts.active}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t({ th: "แต้มเดิมพันรวม", en: "Points Staked" })}</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.totalPointsStaked.toLocaleString()} pts</p>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Free</p>
                <p className="text-xl font-bold text-gray-400">{stats.subscriptions.free}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Starter</p>
                <p className="text-xl font-bold text-orange-400">{stats.subscriptions.starter}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Pro</p>
                <p className="text-xl font-bold text-purple-400">{stats.subscriptions.pro}</p>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t({ th: "รอตรวจสอบ", en: "Pending Reviews" })}</p>
                <p className="text-xl font-bold text-red-400">{stats.pendingSubmissions}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-[var(--border-primary)] mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 pb-3 transition-colors whitespace-nowrap ${
                activeTab === "pending"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              {t("admin.pending")} ({getTabCount("pending")})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-6 pb-3 transition-colors whitespace-nowrap ${
                activeTab === "approved"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              {t("admin.approved")} ({getTabCount("approved")})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-6 pb-3 transition-colors whitespace-nowrap ${
                activeTab === "rejected"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              {t("admin.rejected")} ({getTabCount("rejected")})
            </button>
            <button
              onClick={() => setActiveTab("revenue")}
              className={`px-6 pb-3 transition-colors whitespace-nowrap ${
                activeTab === "revenue"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              {t({ th: "รายได้", en: "Revenue" })}
            </button>
          </div>

          {/* Revenue Tab */}
          {activeTab === "revenue" ? (
            revenueLoading ? (
              <div className="text-gray-500 text-center py-12">{t({ th: "กำลังโหลด...", en: "Loading..." })}</div>
            ) : (
              <div className="space-y-6">
                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-600/20 to-green-500/10 border border-green-500/30 rounded-2xl p-6">
                    <p className="text-sm text-green-400 mb-1">
                      {t({
                        th: "ยอดเงินคงเหลือ",
                        en: "Platform Wallet Balance",
                      })}
                    </p>
                    <p className="text-3xl font-black text-white">
                      ฿{(revenue?.balance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
                    <p className="text-sm text-orange-400 mb-1">
                      {t({ th: "รายได้ทั้งหมด", en: "Total Revenue" })}
                    </p>
                    <p className="text-3xl font-black text-white">
                      ฿{(revenue?.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl overflow-hidden">
                  <div className="p-6 pb-4">
                    <h2 className="text-xl font-bold">
                      {t({
                        th: "ธุรกรรมล่าสุด",
                        en: "Recent Transactions",
                      })}
                    </h2>
                  </div>
                  <div className="divide-y divide-[var(--border-primary)]">
                    {(revenue?.transactions || []).length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-400">
                        {t({
                          th: "ยังไม่มีธุรกรรม",
                          en: "No transactions yet",
                        })}
                      </div>
                    ) : (
                      revenue!.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="px-6 py-4 flex items-center gap-4"
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.amount > 0
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {tx.amount > 0 ? (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 13l-5 5m0 0l-5-5m5 5V6"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {tx.description}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatShortDate(tx.createdAt)}
                            </div>
                          </div>
                          <div
                            className={`text-lg font-bold ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {tx.amount > 0 ? "+" : ""}฿
                            {Math.abs(tx.amount).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )
          ) : loading ? (
            <div className="text-gray-500 text-center py-12">{t({ th: "กำลังโหลด...", en: "Loading..." })}</div>
          ) : submissions.length === 0 ? (
            <div className="text-gray-500 text-center py-12">
              {t("admin.noSubmissions")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6"
                >
                  {/* User */}
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">
                      {t("admin.user")}:{" "}
                    </span>
                    <span className="text-white">
                      {submission.contract.user.name ||
                        submission.contract.user.email}
                    </span>
                  </div>

                  {/* Contract */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-400">
                      {t("admin.contract")}:{" "}
                    </span>
                    <span className="font-semibold">
                      {submission.contract.goal}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="bg-[var(--bg-card-inner)] w-full h-48 rounded-xl overflow-hidden flex items-center justify-center text-gray-500 mb-3">
                    <img
                      src={submission.imageData}
                      alt={t({ th: "หลักฐาน", en: "Evidence" })}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.textContent =
                          t({ th: "ไม่สามารถแสดงรูปภาพได้", en: "Image not available" });
                      }}
                    />
                  </div>

                  {/* Note */}
                  {submission.note && (
                    <div className="mb-3 text-sm text-gray-300 bg-[var(--bg-card-inner)] p-3 rounded-lg">
                      <span className="text-gray-400">{t({ th: "หมายเหตุ: ", en: "Note: " })}</span>
                      {submission.note}
                    </div>
                  )}

                  {/* Metadata - Live capture badge */}
                  <div className="text-xs text-green-400 mb-2">
                    {t({ th: "ถ่ายสด ✓", en: "Live Capture ✓" })}
                  </div>

                  {/* Submitted At */}
                  <div className="text-sm text-gray-500 mb-3">
                    {t("admin.submittedAt")}: {formatDate(submission.createdAt)}
                  </div>

                  {/* Status-specific Actions */}
                  {submission.status === "pending" ? (
                    <>
                      <textarea
                        value={reviewNotes[submission.id] || ""}
                        onChange={(e) =>
                          setReviewNotes((prev) => ({
                            ...prev,
                            [submission.id]: e.target.value,
                          }))
                        }
                        placeholder={t("admin.notesPlaceholder")}
                        className="bg-[var(--bg-card-inner)] border border-[var(--border-secondary)] rounded-xl w-full px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 transition-colors mt-3"
                        rows={2}
                        disabled={processingIds.has(submission.id)}
                      />
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() =>
                            handleReview(submission.id, "approved")
                          }
                          disabled={processingIds.has(submission.id)}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingIds.has(submission.id)
                            ? t({ th: "กำลังดำเนินการ...", en: "Processing..." })
                            : t("admin.approve")}
                        </button>
                        <button
                          onClick={() =>
                            handleReview(submission.id, "rejected")
                          }
                          disabled={processingIds.has(submission.id)}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingIds.has(submission.id)
                            ? t({ th: "กำลังดำเนินการ...", en: "Processing..." })
                            : t("admin.reject")}
                        </button>
                      </div>
                    </>
                  ) : submission.status === "approved" ? (
                    <div className="bg-green-500/20 text-green-400 rounded-full px-3 py-1 inline-block mt-3">
                      {t("admin.approved")}
                    </div>
                  ) : (
                    <div className="bg-red-500/20 text-red-400 rounded-full px-3 py-1 inline-block mt-3">
                      {t("admin.rejected")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
