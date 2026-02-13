"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";

type SubmissionStatus = "pending" | "approved" | "rejected";

interface Submission {
  id: string;
  imageUrl: string;
  note: string | null;
  dailyCode: string;
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

export default function AdminPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<SubmissionStatus>("pending");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSubmissions(activeTab);
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
        // Refresh the list
        await fetchSubmissions(activeTab);
        // Clear the note
        setReviewNotes((prev) => {
          const newNotes = { ...prev };
          delete newNotes[submissionId];
          return newNotes;
        });
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || "Failed to review submission"}`);
      }
    } catch (err) {
      console.error("Error reviewing submission:", err);
      alert("Failed to review submission");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const getTabCount = (status: SubmissionStatus) => {
    // This is approximate since we only have current tab data
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Title */}
          <h1 className="text-3xl font-bold mb-8">{t("admin.title")}</h1>

          {/* Tabs */}
          <div className="flex border-b border-[#1A1A1A] mb-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 pb-3 transition-colors ${
                activeTab === "pending"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              {t("admin.pending")} ({getTabCount("pending")})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-6 pb-3 transition-colors ${
                activeTab === "approved"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              {t("admin.approved")} ({getTabCount("approved")})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-6 pb-3 transition-colors ${
                activeTab === "rejected"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
            >
              {t("admin.rejected")} ({getTabCount("rejected")})
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-gray-500 text-center py-12">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="text-gray-500 text-center py-12">
              {t("admin.noSubmissions")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6"
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
                  <div className="bg-[#1A1A1A] w-full h-48 rounded-xl overflow-hidden flex items-center justify-center text-gray-500 mb-3">
                    <img
                      src={submission.imageUrl}
                      alt="Evidence"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.textContent =
                          "Image not available";
                      }}
                    />
                  </div>

                  {/* Note */}
                  {submission.note && (
                    <div className="mb-3 text-sm text-gray-300 bg-[#1A1A1A] p-3 rounded-lg">
                      <span className="text-gray-400">Note: </span>
                      {submission.note}
                    </div>
                  )}

                  {/* Daily Code */}
                  <div className="font-mono text-orange-500 text-sm mb-2">
                    {submission.dailyCode}
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
                        className="bg-[#1A1A1A] border border-[#333] rounded-xl w-full px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 transition-colors mt-3"
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
                            ? "Processing..."
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
                            ? "Processing..."
                            : t("admin.reject")}
                        </button>
                      </div>
                    </>
                  ) : submission.status === "approved" ? (
                    <div className="bg-green-500/20 text-green-400 rounded-full px-3 py-1 inline-block mt-3">
                      Approved ✓
                    </div>
                  ) : (
                    <div className="bg-red-500/20 text-red-400 rounded-full px-3 py-1 inline-block mt-3">
                      Rejected ✗
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
