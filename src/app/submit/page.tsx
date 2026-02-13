"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";

interface Contract {
  id: string;
  goal: string;
  duration: number;
  deadline: string;
  status: string;
  daysCompleted: number;
}

export default function SubmitEvidencePage() {
  const { t } = useI18n();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchContracts();
    return () => stopCamera();
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

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(
        t({ th: "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง", en: "Cannot access camera. Please allow camera permission." })
      );
    }
  }, [t]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage("");
    startCamera();
  };

  const handleSubmit = async () => {
    if (!capturedImage || !selectedContractId) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: selectedContractId,
          imageData: capturedImage,
          note: note || null,
          metadata: {
            capturedAt: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setCapturedImage("");
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
          <h1 className="text-3xl font-bold mb-2">{t("submit.title")}</h1>
          <p className="text-gray-400 text-sm mb-6">
            {t({ th: "ถ่ายรูปสดเพื่อยืนยันว่าคุณทำตามสัญญาวันนี้", en: "Take a live photo to prove you kept your commitment today" })}
          </p>

          {/* Contract Selection */}
          {contracts.length === 0 ? (
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 mb-6 text-gray-400 text-center">
              {t({ th: "ไม่มีสัญญาที่ active กรุณาสร้างสัญญาก่อน", en: "No active contracts. Please create a contract first." })}
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                {t({ th: "เลือกสัญญา:", en: "Select Contract:" })}
              </label>
              <select
                value={selectedContractId}
                onChange={(e) => setSelectedContractId(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              >
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.goal} ({t({ th: "วันที่", en: "Day" })} {contract.daysCompleted + 1}/{contract.duration})
                  </option>
                ))}
              </select>
              {selectedContract && (
                <div className="mt-2 text-sm text-gray-400">
                  {t({ th: "กำหนดส่ง:", en: "Deadline:" })} {selectedContract.deadline}
                </div>
              )}
            </div>
          )}

          {/* Camera Area */}
          <div className="mb-6">
            {!capturedImage && !cameraActive && (
              <button
                onClick={startCamera}
                className="w-full min-h-[250px] border-2 border-dashed border-[#333] hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">
                  {t({ th: "แตะเพื่อเปิดกล้อง", en: "Tap to open camera" })}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {t({ th: "ต้องถ่ายสดเท่านั้น ไม่รับรูปจากอัลบั้ม", en: "Live photo only — no gallery uploads" })}
                </p>
              </button>
            )}

            {cameraError && (
              <div className="mt-4 bg-red-500/20 border border-red-500 text-red-400 rounded-xl px-4 py-3">
                {cameraError}
              </div>
            )}

            {cameraActive && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-2xl border-2 border-orange-500"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white rounded-full border-4 border-orange-500 shadow-lg hover:scale-105 transition-transform active:scale-95"
                  >
                    <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto" />
                  </button>
                </div>
                <div className="absolute top-3 right-3">
                  <button
                    onClick={stopCamera}
                    className="bg-black/60 text-white rounded-full px-3 py-1 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full rounded-2xl border-2 border-green-500"
                />
                <div className="absolute top-3 left-3 bg-green-500 text-white rounded-full px-3 py-1 text-sm font-medium">
                  {t({ th: "ถ่ายสดแล้ว ✓", en: "Live captured ✓" })}
                </div>
                <button
                  onClick={retakePhoto}
                  className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full px-4 py-2 text-sm hover:bg-black/80 transition"
                >
                  {t({ th: "ถ่ายใหม่", en: "Retake" })}
                </button>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm mb-2">{t("submit.note")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("submit.notePlaceholder")}
              rows={3}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl w-full px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500 text-red-400 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 bg-green-500/20 border border-green-500 text-green-400 rounded-xl px-4 py-3">
              {t({ th: "ส่งหลักฐานสำเร็จ! กำลังกลับไปหน้าหลัก...", en: "Submission successful! Redirecting..." })}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!capturedImage || !selectedContractId || loading}
            className={`w-full font-bold py-4 rounded-full text-lg transition-all ${
              !capturedImage || !selectedContractId || loading
                ? "bg-gray-700 opacity-50 cursor-not-allowed text-gray-400"
                : "bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400"
            }`}
          >
            {loading
              ? t({ th: "กำลังส่ง...", en: "Submitting..." })
              : t("submit.send")}
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
