"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "th" | "en";

const translations = {
  th: {
    // Navbar
    "nav.home": "หน้าหลัก",
    "nav.dashboard": "แดชบอร์ด",
    "nav.create": "สร้างสัญญา",
    "nav.admin": "แอดมิน",
    "nav.wallet": "แต้ม",
    "nav.login": "เข้าสู่ระบบ",
    "nav.register": "สมัครสมาชิก",
    "nav.logout": "ออกจากระบบ",

    // Landing Page
    "hero.title1": "กล้าเดิมพัน",
    "hero.title2": "กับตัวเอง",
    "hero.title3": "ไหม?",
    "hero.subtitle": "ตั้งเป้าหมาย → ส่งหลักฐานทุกวัน → สะสม Points → แลกรางวัล",
    "hero.subtitle2": "เสียทั้งหมด",
    "hero.or": "หรือ",
    "hero.cta": "สร้างสัญญากับตัวเอง",
    "hero.startFrom": "เริ่มต้นฟรี ไม่มีค่าใช้จ่าย",

    "howItWorks.title1": "มันทำงาน",
    "howItWorks.title2": "ยังไง?",
    "howItWorks.step1.title": "ตั้งเป้าหมาย",
    "howItWorks.step1.desc": "เลือกสิ่งที่จะทำ วางแต้มเดิมพัน เลือกระยะเวลา",
    "howItWorks.step2.title": "ส่งหลักฐานทุกวัน",
    "howItWorks.step2.desc": "ถ่ายรูปพร้อมรหัสประจำวัน ส่งก่อนเวลาหมด",
    "howItWorks.step3.title": "สะสม Points + แลกรางวัล",
    "howItWorks.step3.desc": "ทำสำเร็จครบ ได้แต้มคืน + โบนัส",
    "howItWorks.step3.fail": "ล้มเหลว เสียแต้ม",

    "stats.successRate": "ผู้ใช้ทำสำเร็จ",
    "stats.totalStakes": "Points ที่สะสม",
    "stats.totalContracts": "สัญญาที่สร้าง",

    "quote.text1": "คนเราไม่กลัวความล้มเหลว...",
    "quote.text2": "แต่กลัวเสียสิ่งที่สะสมมา",
    "quote.attribution": "— หลักจิตวิทยา Loss Aversion",

    "finalCta.title1": "พร้อมท้าทาย",
    "finalCta.title2": "ตัวเอง",
    "finalCta.title3": "ยัง?",
    "finalCta.cta": "เริ่มท้าทายตัวเองเลย",

    "footer.rights": "© 2025 DareDo. All rights reserved.",
    "footer.about": "เกี่ยวกับเรา",
    "footer.terms": "เงื่อนไข",
    "footer.contact": "ติดต่อ",

    // Auth
    "auth.login": "เข้าสู่ระบบ",
    "auth.register": "สมัครสมาชิก",
    "auth.email": "อีเมล",
    "auth.password": "รหัสผ่าน",
    "auth.confirmPassword": "ยืนยันรหัสผ่าน",
    "auth.forgotPassword": "ลืมรหัสผ่าน?",
    "auth.noAccount": "ยังไม่มีบัญชี?",
    "auth.hasAccount": "มีบัญชีแล้ว?",
    "auth.orContinueWith": "หรือเข้าสู่ระบบด้วย",
    "auth.magicLink": "ส่ง Magic Link",
    "auth.loginButton": "เข้าสู่ระบบ",
    "auth.registerButton": "สมัครสมาชิก",
    "auth.continueWith": "ดำเนินการด้วย",
    "auth.orSignUpWith": "หรือสมัครด้วย",

    // Create Contract
    "create.title": "สร้างสัญญากับตัวเอง",
    "create.goal": "เป้าหมายของคุณ",
    "create.goalPlaceholder": "เช่น วิ่ง 5 กม. ทุกวัน, ตื่นก่อน 6 โมง",
    "create.duration": "ระยะเวลา",
    "create.days": "วัน",
    "create.stakes": "แต้มเดิมพัน (Points)",
    "create.stakesPlaceholder": "จำนวนแต้ม",
    "create.deadline": "เวลาส่งหลักฐาน (Deadline)",
    "create.summary": "สรุป",
    "create.fee": "โบนัสเมื่อสำเร็จ (ตามแพลน)",
    "create.total": "รวมทั้งหมด",
    "create.refundSuccess": "ได้คืนเมื่อสำเร็จ + โบนัสตามแพลน",
    "create.submit": "ยืนยันและสร้างสัญญา",
    "create.warning": "เมื่อยืนยันแล้ว ไม่สามารถยกเลิกได้",

    // Dashboard
    "dashboard.title": "แดชบอร์ด",
    "dashboard.activeContracts": "สัญญาที่กำลังดำเนิน",
    "dashboard.noContracts": "ยังไม่มีสัญญา",
    "dashboard.createFirst": "สร้างสัญญาแรกของคุณ",
    "dashboard.daysLeft": "เหลืออีก {days} วัน",
    "dashboard.progress": "ความคืบหน้า",
    "dashboard.submitToday": "ส่งหลักฐานวันนี้",
    "dashboard.submitted": "ส่งแล้ววันนี้",
    "dashboard.status.active": "กำลังดำเนิน",
    "dashboard.status.success": "สำเร็จ",
    "dashboard.status.failed": "ไม่สำเร็จ",
    "dashboard.dailyCode": "รหัสประจำวัน",

    // Submit Evidence
    "submit.title": "ส่งหลักฐาน",
    "submit.instruction": "ถ่ายรูปหลักฐานพร้อมเขียนรหัสประจำวันใส่กระดาษวางข้างๆ",
    "submit.upload": "อัปโหลดรูปภาพ",
    "submit.dragDrop": "ลากไฟล์มาวางหรือคลิกเพื่อเลือก",
    "submit.preview": "ตัวอย่างรูป",
    "submit.note": "หมายเหตุ (ไม่จำเป็น)",
    "submit.notePlaceholder": "อธิบายเพิ่มเติม...",
    "submit.send": "ส่งหลักฐาน",
    "submit.deadline": "ต้องส่งก่อน",

    // Admin
    "admin.title": "Admin Panel",
    "admin.pending": "รอตรวจสอบ",
    "admin.approved": "อนุมัติแล้ว",
    "admin.rejected": "ปฏิเสธแล้ว",
    "admin.approve": "อนุมัติ",
    "admin.reject": "ปฏิเสธ",
    "admin.notes": "หมายเหตุ",
    "admin.notesPlaceholder": "เหตุผล...",
    "admin.noSubmissions": "ไม่มีรายการรอตรวจ",
    "admin.submittedAt": "ส่งเมื่อ",
    "admin.contract": "สัญญา",
    "admin.user": "ผู้ใช้",

    // Gamification
    "nav.leaderboard": "ลีดเดอร์บอร์ด",
    "nav.profile": "โปรไฟล์",
    "leaderboard.title": "ลีดเดอร์บอร์ด",
    "leaderboard.weekly": "รายสัปดาห์",
    "leaderboard.monthly": "รายเดือน",
    "leaderboard.allTime": "ตลอดกาล",
    "leaderboard.rank": "อันดับ",
    "leaderboard.points": "คะแนน",
    "leaderboard.streak": "Streak",
    "leaderboard.empty": "ยังไม่มีข้อมูล",
    "leaderboard.you": "คุณ",
    "profile.title": "โปรไฟล์",
    "profile.badges": "เหรียญรางวัล",
    "profile.stats": "สถิติ",
    "profile.rank": "แรงค์",
    "profile.totalSubmissions": "ส่งหลักฐานทั้งหมด",
    "profile.contractsCompleted": "สัญญาสำเร็จ",
    "profile.lifetimePoints": "คะแนนสะสมตลอดกาล",
    "profile.currentStreak": "Streak ปัจจุบัน",
    "profile.badgesEarned": "เหรียญที่ได้",
    "profile.noBadges": "ยังไม่มีเหรียญ ลุยส่งหลักฐานเลย!",
    "profile.locked": "ยังไม่ปลดล็อค",
    "insurance.title": "Streak Insurance",
    "insurance.description": "ใช้ 200 points เพื่อพักวันนี้ โดย streak ไม่ reset",
    "insurance.use": "ใช้ Insurance",
    "insurance.used": "ใช้แล้ว",
    "insurance.remaining": "เหลือ {count} ครั้ง",
    "insurance.noPoints": "Points ไม่พอ (ต้องใช้ 200 pts)",
    "insurance.notAvailable": "ไม่สามารถใช้ได้ในแพลนนี้",
    "insurance.success": "ใช้ Streak Insurance สำเร็จ!",
    "streak.fire": "Streak",
    "streak.days": "วัน",
    "streak.multiplier": "x{mult} Points",

    // Friends
    "nav.friends": "เพื่อน",
    "friends.title": "เพื่อน",
    "friends.search": "ค้นหาเพื่อน (อีเมล)",
    "friends.add": "เพิ่มเพื่อน",
    "friends.pending": "รอตอบรับ",
    "friends.requests": "คำขอเป็นเพื่อน",
    "friends.accept": "ตอบรับ",
    "friends.reject": "ปฏิเสธ",
    "friends.noFriends": "ยังไม่มีเพื่อน",
    "friends.activity": "กิจกรรมเพื่อน",

    // Province
    "nav.province": "แผนที่",
    "province.title": "แผนที่จังหวัด",
    "province.heatmap": "Heatmap คะแนนทั้งประเทศ",
    "province.myProvince": "จังหวัดของคุณ",
    "province.ranking": "อันดับจังหวัด",
    "province.selectProvince": "เลือกจังหวัด",
    "province.totalPoints": "คะแนนรวม",
    "province.totalUsers": "จำนวนผู้ใช้",
    "province.avgPoints": "คะแนนเฉลี่ย",
    "province.noProvince": "กรุณาเลือกจังหวัดของคุณ",
    "province.topUsers": "ผู้ใช้อันดับต้นในจังหวัด",
    "province.yourRank": "อันดับของคุณในจังหวัด",

    // Stake/Escrow
    "stake.title": "แต้มเดิมพัน",
    "stake.amount": "จำนวนแต้มเดิมพัน",
    "stake.min": "เลือกจำนวนแต้ม",
    "stake.balance": "แต้มในกระเป๋า",
    "stake.locked": "แต้มที่ล็อคอยู่",
    "stake.available": "แต้มที่ใช้ได้",
    "stake.escrow": "แต้มในสัญญา",
    "stake.successReturn": "ทำสำเร็จ: ได้แต้มคืน + โบนัสตามแพลน",
    "stake.failLose": "ไม่สำเร็จ: เสียแต้มทั้งหมด",
    "stake.topup": "ดูแต้ม",
    "stake.noBalance": "แต้มไม่พอ",
  },

  en: {
    // Navbar
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.create": "Create Contract",
    "nav.admin": "Admin",
    "nav.wallet": "Points",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.logout": "Logout",

    // Landing Page
    "hero.title1": "Dare to bet",
    "hero.title2": "on yourself",
    "hero.title3": "?",
    "hero.subtitle": "Set a goal → Submit proof daily → Earn Points → Redeem Rewards",
    "hero.subtitle2": "lose it all",
    "hero.or": "or",
    "hero.cta": "Make a contract with yourself",
    "hero.startFrom": "Start free, no cost",

    "howItWorks.title1": "How does",
    "howItWorks.title2": "it work?",
    "howItWorks.step1.title": "Set a Goal",
    "howItWorks.step1.desc": "Choose your challenge, stake your points, pick a duration",
    "howItWorks.step2.title": "Submit Proof Daily",
    "howItWorks.step2.desc": "Take a photo with daily code, submit before deadline",
    "howItWorks.step3.title": "Earn Points + Redeem Rewards",
    "howItWorks.step3.desc": "Complete every day, get points back + tier bonus.",
    "howItWorks.step3.fail": "Fail and lose your staked points",

    "stats.successRate": "Users succeeded",
    "stats.totalStakes": "Points earned",
    "stats.totalContracts": "Contracts created",

    "quote.text1": "People don't fear failure...",
    "quote.text2": "They fear losing what they've earned",
    "quote.attribution": "— Loss Aversion Psychology",

    "finalCta.title1": "Ready to",
    "finalCta.title2": "challenge yourself",
    "finalCta.title3": "?",
    "finalCta.cta": "Start your challenge now",

    "footer.rights": "© 2025 DareDo. All rights reserved.",
    "footer.about": "About Us",
    "footer.terms": "Terms",
    "footer.contact": "Contact",

    // Auth
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.orContinueWith": "Or continue with",
    "auth.magicLink": "Send Magic Link",
    "auth.loginButton": "Login",
    "auth.registerButton": "Register",
    "auth.continueWith": "Continue with",
    "auth.orSignUpWith": "Or sign up with",

    // Create Contract
    "create.title": "Create Your Contract",
    "create.goal": "Your Goal",
    "create.goalPlaceholder": "e.g. Run 5km every day, Wake up before 6am",
    "create.duration": "Duration",
    "create.days": "days",
    "create.stakes": "Points Stake",
    "create.stakesPlaceholder": "Points amount",
    "create.deadline": "Daily Submission Deadline",
    "create.summary": "Summary",
    "create.fee": "Bonus on success (by tier)",
    "create.total": "Total",
    "create.refundSuccess": "Points back on success + tier bonus",
    "create.submit": "Confirm & Create Contract",
    "create.warning": "Once confirmed, this cannot be cancelled",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.activeContracts": "Active Contracts",
    "dashboard.noContracts": "No contracts yet",
    "dashboard.createFirst": "Create your first contract",
    "dashboard.daysLeft": "{days} days left",
    "dashboard.progress": "Progress",
    "dashboard.submitToday": "Submit today's proof",
    "dashboard.submitted": "Submitted today",
    "dashboard.status.active": "Active",
    "dashboard.status.success": "Completed",
    "dashboard.status.failed": "Failed",
    "dashboard.dailyCode": "Daily Code",

    // Submit Evidence
    "submit.title": "Submit Evidence",
    "submit.instruction": "Take a photo of your proof with today's code written on paper next to it",
    "submit.upload": "Upload Photo",
    "submit.dragDrop": "Drag & drop or click to select",
    "submit.preview": "Preview",
    "submit.note": "Note (optional)",
    "submit.notePlaceholder": "Additional details...",
    "submit.send": "Submit Evidence",
    "submit.deadline": "Must submit before",

    // Admin
    "admin.title": "Admin Panel",
    "admin.pending": "Pending Review",
    "admin.approved": "Approved",
    "admin.rejected": "Rejected",
    "admin.approve": "Approve",
    "admin.reject": "Reject",
    "admin.notes": "Notes",
    "admin.notesPlaceholder": "Reason...",
    "admin.noSubmissions": "No pending submissions",
    "admin.submittedAt": "Submitted at",
    "admin.contract": "Contract",
    "admin.user": "User",

    // Gamification
    "nav.leaderboard": "Leaderboard",
    "nav.profile": "Profile",
    "leaderboard.title": "Leaderboard",
    "leaderboard.weekly": "Weekly",
    "leaderboard.monthly": "Monthly",
    "leaderboard.allTime": "All Time",
    "leaderboard.rank": "Rank",
    "leaderboard.points": "Points",
    "leaderboard.streak": "Streak",
    "leaderboard.empty": "No data yet",
    "leaderboard.you": "You",
    "profile.title": "Profile",
    "profile.badges": "Badges",
    "profile.stats": "Stats",
    "profile.rank": "Rank",
    "profile.totalSubmissions": "Total Submissions",
    "profile.contractsCompleted": "Contracts Completed",
    "profile.lifetimePoints": "Lifetime Points",
    "profile.currentStreak": "Current Streak",
    "profile.badgesEarned": "Badges Earned",
    "profile.noBadges": "No badges yet. Start submitting!",
    "profile.locked": "Locked",
    "insurance.title": "Streak Insurance",
    "insurance.description": "Use 200 points to skip today without breaking your streak",
    "insurance.use": "Use Insurance",
    "insurance.used": "Used",
    "insurance.remaining": "{count} remaining",
    "insurance.noPoints": "Not enough points (need 200 pts)",
    "insurance.notAvailable": "Not available on your plan",
    "insurance.success": "Streak Insurance used successfully!",
    "streak.fire": "Streak",
    "streak.days": "days",
    "streak.multiplier": "x{mult} Points",

    // Friends
    "nav.friends": "Friends",
    "friends.title": "Friends",
    "friends.search": "Search friends (email)",
    "friends.add": "Add Friend",
    "friends.pending": "Pending",
    "friends.requests": "Friend Requests",
    "friends.accept": "Accept",
    "friends.reject": "Reject",
    "friends.noFriends": "No friends yet",
    "friends.activity": "Friend Activity",

    // Province
    "nav.province": "Map",
    "province.title": "Province Map",
    "province.heatmap": "Nationwide Points Heatmap",
    "province.myProvince": "Your Province",
    "province.ranking": "Province Ranking",
    "province.selectProvince": "Select Province",
    "province.totalPoints": "Total Points",
    "province.totalUsers": "Total Users",
    "province.avgPoints": "Avg Points",
    "province.noProvince": "Please select your province",
    "province.topUsers": "Top Users in Province",
    "province.yourRank": "Your Province Rank",

    // Stake/Escrow
    "stake.title": "Points Stake",
    "stake.amount": "Points Stake Amount",
    "stake.min": "Choose points amount",
    "stake.balance": "Points Balance",
    "stake.locked": "Locked in Contracts",
    "stake.available": "Available Points",
    "stake.escrow": "Staked in Contract",
    "stake.successReturn": "Success: get points back + tier bonus",
    "stake.failLose": "Fail: Lose all staked points",
    "stake.topup": "View Points",
    "stake.noBalance": "Insufficient points.",
  },
} as const;

type TranslationKey = keyof typeof translations.th;
type TranslationInput = TranslationKey | { th: string; en: string };

interface I18nContextType {
  locale: Locale;
  t: (key: TranslationInput, params?: Record<string, string>) => string;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("th");

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "th" ? "en" : "th"));
  }, []);

  const t = useCallback(
    (key: TranslationInput, params?: Record<string, string>) => {
      let text: string;
      if (typeof key === "object") {
        text = key[locale];
      } else {
        text = translations[locale][key] || key;
      }
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, v);
        });
      }
      return text;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
