"use client";

import { useI18n } from "@/lib/i18n";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useI18n();

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#333] hover:border-orange-500 transition-colors text-sm font-medium"
      aria-label="Toggle language"
    >
      <span className={locale === "th" ? "text-orange-500" : "text-gray-400"}>
        TH
      </span>
      <span className="text-[#333]">/</span>
      <span className={locale === "en" ? "text-orange-500" : "text-gray-400"}>
        EN
      </span>
    </button>
  );
}
