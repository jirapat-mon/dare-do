"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";

type SubmissionStatus = "pending" | "approved" | "rejected";

interface Submission {
  id: number;
  user: string;
  contract: string;
  submittedAt: string;
  status: SubmissionStatus;
  dailyCode: string;
}

export default function AdminPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<SubmissionStatus>("pending");
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 1,
      user: "somchai@gmail.com",
      contract: "วิ่ง 5 กม.",
      submittedAt: "14 ก.พ. 2025 08:30",
      status: "pending",
      dailyCode: "#WIN42",
    },
    {
      id: 2,
      user: "somying@gmail.com",
      contract: "ตื่นก่อน 6 โมง",
      submittedAt: "14 ก.พ. 2025 05:45",
      status: "pending",
      dailyCode: "#WIN42",
    },
    {
      id: 3,
      user: "piti@gmail.com",
      contract: "อ่านหนังสือ",
      submittedAt: "14 ก.พ. 2025 20:10",
      status: "pending",
      dailyCode: "#WIN42",
    },
    {
      id: 4,
      user: "somchai@gmail.com",
      contract: "วิ่ง 5 กม.",
      submittedAt: "13 ก.พ. 2025 07:15",
      status: "approved",
      dailyCode: "#DAY41",
    },
  ]);

  const filteredSubmissions = submissions.filter((s) => s.status === activeTab);

  const getTabCount = (status: SubmissionStatus) => {
    return submissions.filter((s) => s.status === status).length;
  };

  const updateStatus = (id: number, newStatus: SubmissionStatus) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
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

        {/* Submissions Grid */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-gray-500 text-center py-12">
            {t("admin.noSubmissions")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-6"
              >
                {/* User */}
                <div className="mb-2">
                  <span className="text-sm text-gray-400">{t("admin.user")}: </span>
                  <span className="text-white">{submission.user}</span>
                </div>

                {/* Contract */}
                <div className="mb-4">
                  <span className="text-sm text-gray-400">
                    {t("admin.contract")}:{" "}
                  </span>
                  <span className="font-semibold">{submission.contract}</span>
                </div>

                {/* Mock Image */}
                <div className="bg-[#333] w-full h-48 rounded-xl flex items-center justify-center text-gray-500 mb-3">
                  Evidence Photo
                </div>

                {/* Daily Code */}
                <div className="font-mono text-orange-500 text-sm mb-2">
                  {submission.dailyCode}
                </div>

                {/* Submitted At */}
                <div className="text-sm text-gray-500 mb-3">
                  {t("admin.submittedAt")}: {submission.submittedAt}
                </div>

                {/* Status-specific Actions */}
                {submission.status === "pending" ? (
                  <>
                    <textarea
                      placeholder={t("admin.notesPlaceholder")}
                      className="bg-[#1A1A1A] border border-[#333] rounded-xl w-full px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 transition-colors mt-3"
                      rows={2}
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => updateStatus(submission.id, "approved")}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-full font-semibold transition-colors"
                      >
                        {t("admin.approve")}
                      </button>
                      <button
                        onClick={() => updateStatus(submission.id, "rejected")}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-semibold transition-colors"
                      >
                        {t("admin.reject")}
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
