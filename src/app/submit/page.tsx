"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import { getDailyCode } from "@/lib/daily-code";

interface Contract {
  id: string;
  goal: string;
  stakes: number;
  duration: number;
  deadline: string;
  status: string;
  daysCompleted: number;
}

export default function SubmitEvidencePage() {
  const { t } = useI18n();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dailyCode] = useState(getDailyCode());

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await fetch("/api/contracts");
      if (res.ok) {
        const data = await res.json();
        const activeContracts = data.contracts.filter(
          (c: Contract) => c.status === "active"
        );
        setContracts(activeContracts);
        if (activeContracts.length > 0) {
          setSelectedContractId(activeContracts[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedContractId) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("contractId", selectedContractId);
      formData.append("dailyCode", dailyCode);
      formData.append("note", note);
      formData.append("image", selectedFile);

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSuccess(true);
        setSelectedFile(null);
        setPreviewUrl("");
        setNote("");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit");
      }
    } catch (err) {
      setError("Failed to submit. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedContract = contracts.find((c) => c.id === selectedContractId);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            ← {t("nav.dashboard")}
          </Link>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-6">{t("submit.title")}</h1>

          {/* Contract Selection */}
          {contracts.length === 0 ? (
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 mb-6 text-gray-400 text-center">
              No active contracts. Please create a contract first.
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Select Contract:
              </label>
              <select
                value={selectedContractId}
                onChange={(e) => setSelectedContractId(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              >
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.goal} (Day {contract.daysCompleted + 1}/
                    {contract.duration})
                  </option>
                ))}
              </select>
              {selectedContract && (
                <div className="mt-2 text-sm text-gray-400">
                  Deadline: {selectedContract.deadline}
                </div>
              )}
            </div>
          )}

          {/* Daily Code */}
          <div className="text-center mb-6">
            <div className="text-sm text-gray-400 mb-2">
              {t("dashboard.dailyCode")}
            </div>
            <div className="text-4xl font-mono font-bold text-orange-500">
              {dailyCode}
            </div>
          </div>

          {/* Instruction */}
          <p className="text-gray-400 text-sm mb-4">{t("submit.instruction")}</p>

          {/* Upload Area */}
          <div
            onClick={() => document.getElementById("fileInput")?.click()}
            className={`min-h-[250px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
              !selectedFile
                ? "border-[#333] hover:border-orange-500"
                : "border-green-500 bg-green-500/5"
            }`}
          >
            {!selectedFile ? (
              <>
                {/* Camera Icon */}
                <svg
                  className="w-16 h-16 text-gray-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-500">{t("submit.dragDrop")}</p>
              </>
            ) : (
              <>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-[200px] object-contain mb-4 rounded-lg"
                  />
                )}
                <p className="text-green-400 mb-2">{t("submit.preview")}</p>
                <p className="text-gray-500 text-sm">{selectedFile.name}</p>
              </>
            )}
          </div>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Note Textarea */}
          <div className="mt-6">
            <label className="block text-sm mb-2">{t("submit.note")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("submit.notePlaceholder")}
              rows={3}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl w-full px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500 text-red-400 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 bg-green-500/20 border border-green-500 text-green-400 rounded-xl px-4 py-3">
              Submission successful! Redirecting...
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || !selectedContractId || loading}
            className={`w-full mt-6 font-bold py-4 rounded-full text-lg transition-all ${
              !selectedFile || !selectedContractId || loading
                ? "bg-gray-700 opacity-50 cursor-not-allowed text-gray-400"
                : "bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400"
            }`}
          >
            {loading ? "Uploading..." : t("submit.send")}
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
