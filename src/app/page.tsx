"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

// --- Inline SVG Icon Components ---

function CrosshairIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function CameraIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function BanknoteIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <circle cx="12" cy="12" r="4" />
      <path d="M1 10h2" />
      <path d="M21 10h2" />
      <path d="M1 14h2" />
      <path d="M21 14h2" />
    </svg>
  );
}

function TrendingUpIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function UsersIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function FlameIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  );
}

function StarIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function QuoteIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.166 0-2.267-.56-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.69 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.166 0-2.267-.56-2.917-1.179z" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function SparklesIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

// --- Step Number Badge ---
function StepBadge({ number }: { number: number }) {
  return (
    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-orange-500/30">
      {number}
    </div>
  );
}

export default function HomePage() {
  const { t } = useI18n();

  return (
    <main className="relative overflow-hidden">
      {/* Global Background Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden">
        {/* Hero background glow - center orange */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(255, 107, 0, 0.08) 0%, transparent 70%)",
          }}
        />
        {/* Top-left accent glow */}
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px]"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, rgba(255, 107, 0, 0.04) 0%, transparent 60%)",
          }}
        />
        {/* Bottom-right accent glow */}
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px]"
          style={{
            background:
              "radial-gradient(circle at 100% 100%, rgba(255, 140, 0, 0.03) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-sm font-medium">
            <SparklesIcon className="w-4 h-4" />
            <span>{t({ th: "แพลตฟอร์ม #1 สำหรับเดิมพันกับตัวเอง", en: "#1 Platform for Self-Accountability Bets" })}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            {t("hero.title1")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              {t("hero.title2")}
            </span>
            {t("hero.title3")}
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <p className="text-lg md:text-xl text-gray-400 mb-14 max-w-2xl mx-auto">
            {t("hero.or")}
            <span className="text-orange-500 font-bold">
              {" "}{t("hero.subtitle2")}
            </span>
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/create"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-lg md:text-xl font-bold px-10 py-5 rounded-full transition-all duration-300 animate-[glow-pulse_2s_ease-in-out_infinite]"
            >
              {t("hero.cta")}
              <ChevronRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <p className="text-sm text-gray-500">{t("hero.startFrom")}</p>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-green-500" />
              <span>{t({ th: "ปลอดภัย 100%", en: "100% Secure" })}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>{t({ th: "ไม่มีค่าสมัคร", en: "No signup fee" })}</span>
            </div>
            <div className="flex items-center gap-2">
              <FlameIcon className="w-4 h-4 text-orange-500" />
              <span>{t({ th: "10,000+ ผู้ใช้", en: "10,000+ users" })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="relative py-24 md:py-32 px-4 bg-black">
        {/* Section divider gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-4">
              {t({ th: "ขั้นตอน", en: "How it works" })}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black">
              {t("howItWorks.title1")}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                {t("howItWorks.title2")}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* Step 1 - Set Goal */}
            <div className="relative group bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8 hover:border-orange-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-orange-500/5">
              <StepBadge number={1} />
              <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
                <CrosshairIcon className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {t("howItWorks.step1.title")}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {t("howItWorks.step1.desc")}
              </p>
            </div>

            {/* Step 2 - Submit Proof */}
            <div className="relative group bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8 hover:border-orange-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-orange-500/5">
              <StepBadge number={2} />
              <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
                <CameraIcon className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {t("howItWorks.step2.title")}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {t("howItWorks.step2.desc")}
              </p>
            </div>

            {/* Step 3 - Get Money Back */}
            <div className="relative group bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8 hover:border-orange-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-orange-500/5">
              <StepBadge number={3} />
              <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
                <BanknoteIcon className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {t("howItWorks.step3.title")}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {t("howItWorks.step3.desc")}{" "}
                <span className="text-orange-500 font-semibold">
                  {t("howItWorks.step3.fail")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="relative py-24 px-4 bg-[#0A0A0A]">
        {/* Top divider */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Stat 1 */}
            <div className="relative text-center p-8 rounded-2xl border border-[#1A1A1A] bg-[#111111]/50">
              <div className="flex items-center justify-center mb-4">
                <TrendingUpIcon className="w-6 h-6 text-orange-500/60 mr-2" />
              </div>
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 mb-3">
                87%
              </div>
              <p className="text-gray-400 text-lg">{t("stats.successRate")}</p>
            </div>

            {/* Stat 2 */}
            <div className="relative text-center p-8 rounded-2xl border border-[#1A1A1A] bg-[#111111]/50">
              <div className="flex items-center justify-center mb-4">
                <BanknoteIcon className="w-6 h-6 text-orange-500/60" />
              </div>
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 mb-3">
                &#3647;2.5M+
              </div>
              <p className="text-gray-400 text-lg">{t("stats.totalStakes")}</p>
            </div>

            {/* Stat 3 */}
            <div className="relative text-center p-8 rounded-2xl border border-[#1A1A1A] bg-[#111111]/50">
              <div className="flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6 text-orange-500/60" />
              </div>
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 mb-3">
                10,000+
              </div>
              <p className="text-gray-400 text-lg">
                {t("stats.totalContracts")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES / WHY IT WORKS ==================== */}
      <section className="relative py-24 md:py-32 px-4 bg-black">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-4">
              {t({ th: "ทำไมถึงได้ผล", en: "Why it works" })}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black">
              {t({ th: "วิทยาศาสตร์เบื้องหลัง", en: "The science behind" })}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                {t({ th: "การเปลี่ยนแปลง", en: "the change" })}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 - Loss Aversion */}
            <div className="p-6 rounded-2xl border border-[#1A1A1A] bg-[#111111]/50 hover:border-[#2A2A2A] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-5">
                <FlameIcon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {t({ th: "Loss Aversion", en: "Loss Aversion" })}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t({ th: "คนเรากลัวเสียเงินมากกว่าอยากได้เงิน จิตวิทยาตัวนี้จะผลักดันคุณ", en: "People fear losing money more than gaining it. This psychology will push you forward." })}
              </p>
            </div>

            {/* Feature 2 - Streak System */}
            <div className="p-6 rounded-2xl border border-[#1A1A1A] bg-[#111111]/50 hover:border-[#2A2A2A] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-5">
                <StarIcon className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {t({ th: "Streak & Points", en: "Streak & Points" })}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t({ th: "สะสม streak ทุกวัน รับ points ที่เพิ่มขึ้นเรื่อยๆ ยิ่งทำต่อเนื่องยิ่งคุ้ม", en: "Build daily streaks, earn increasing points. The longer you go, the more you earn." })}
              </p>
            </div>

            {/* Feature 3 - Social Accountability */}
            <div className="p-6 rounded-2xl border border-[#1A1A1A] bg-[#111111]/50 hover:border-[#2A2A2A] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
                <UsersIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {t({ th: "เพื่อนช่วยดัน", en: "Social Accountability" })}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t({ th: "เพิ่มเพื่อน ดูกิจกรรมกัน แข่ง leaderboard สร้างแรงผลักดันจากคนรอบข้าง", en: "Add friends, track each other, compete on leaderboards. Social pressure keeps you going." })}
              </p>
            </div>

            {/* Feature 4 - Streak Insurance */}
            <div className="p-6 rounded-2xl border border-[#1A1A1A] bg-[#111111]/50 hover:border-[#2A2A2A] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-5">
                <ShieldCheckIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {t({ th: "Streak Insurance", en: "Streak Insurance" })}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t({ th: "ใช้ points แลกพักวันนึงได้ โดย streak ไม่ reset ยืดหยุ่นแต่ยังจริงจัง", en: "Use points to skip a day without losing your streak. Flexible yet still serious." })}
              </p>
            </div>

            {/* Feature 5 - Photo Verification */}
            <div className="p-6 rounded-2xl border border-[#1A1A1A] bg-[#111111]/50 hover:border-[#2A2A2A] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5">
                <CameraIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {t({ th: "ตรวจสอบด้วยรูปถ่าย", en: "Photo Verification" })}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t({ th: "ส่งรูปหลักฐานพร้อมรหัสประจำวัน ไม่มีทางโกง มั่นใจทุกวัน", en: "Submit photo proof with daily code. No cheating, verified every single day." })}
              </p>
            </div>

            {/* Feature 6 - Real Money */}
            <div className="p-6 rounded-2xl border border-[#1A1A1A] bg-[#111111]/50 hover:border-[#2A2A2A] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-5">
                <BanknoteIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {t({ th: "เงินจริง เดิมพันจริง", en: "Real Money, Real Stakes" })}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t({ th: "วางเงินจริงตั้งแต่ 100 บาท ทำสำเร็จได้คืน 95% ล้มเหลวเสียหมด", en: "Stake real money from 100 baht. Succeed and get 95% back. Fail and lose it all." })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MOTIVATION / QUOTE SECTION ==================== */}
      <section className="relative py-32 md:py-40 px-4 bg-[#0A0A0A] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        {/* Decorative glow behind quote */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255, 107, 0, 0.04) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <QuoteIcon className="w-16 h-16 text-orange-500/30 mx-auto mb-8" />
          <blockquote className="text-3xl md:text-4xl lg:text-5xl italic font-light text-gray-200 mb-8 leading-relaxed">
            {t("quote.text1")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 font-normal not-italic">
              {t("quote.text2")}
            </span>
          </blockquote>
          <p className="text-gray-500 text-lg">{t("quote.attribution")}</p>
        </div>
      </section>

      {/* ==================== FINAL CTA SECTION ==================== */}
      <section className="relative py-24 md:py-32 px-4 bg-black overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        {/* Large background glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 80%, rgba(255, 107, 0, 0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            {t("finalCta.title1")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              {t("finalCta.title2")}
            </span>
            {t("finalCta.title3")}
          </h2>

          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            {t({ th: "เริ่มต้นเปลี่ยนแปลงตัวเองวันนี้ ด้วยพลังของเงินเดิมพัน", en: "Start transforming yourself today, powered by the stakes you set." })}
          </p>

          <Link
            href="/create"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-lg md:text-xl font-bold px-10 py-5 rounded-full transition-all duration-300 animate-[glow-pulse_2s_ease-in-out_infinite]"
          >
            {t("finalCta.cta")}
            <ChevronRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative py-12 px-4 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-gray-500 mb-4">{t("footer.rights")}</p>
            <div className="flex justify-center gap-6 text-sm">
              <Link
                href="/about"
                className="text-gray-500 hover:text-orange-500 transition"
              >
                {t("footer.about")}
              </Link>
              <Link
                href="/terms"
                className="text-gray-500 hover:text-orange-500 transition"
              >
                {t("footer.terms")}
              </Link>
              <Link
                href="/contact"
                className="text-gray-500 hover:text-orange-500 transition"
              >
                {t("footer.contact")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
