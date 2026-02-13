"use client";

import { getStreakLevel } from "@/lib/gamification";
import { useI18n } from "@/lib/i18n";

interface StreakFireProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function StreakFire({
  streak,
  size = "md",
  showLabel = false,
}: StreakFireProps) {
  const { t } = useI18n();
  const level = getStreakLevel(streak);

  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-xl gap-1.5",
    lg: "text-4xl gap-2",
  };

  const numberSize = {
    sm: "text-sm font-semibold",
    md: "text-xl font-bold",
    lg: "text-4xl font-extrabold",
  };

  const labelSize = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  // flames=0: no fire, gray
  if (level.flames === 0) {
    return (
      <span className={`inline-flex items-center ${sizeClasses[size]}`}>
        <span className={`${numberSize[size]} text-gray-500`}>{streak}</span>
        {showLabel && (
          <span className={`${labelSize[size]} text-gray-500`}>
            {t("streak.fire")}
          </span>
        )}
      </span>
    );
  }

  // flames=1: Spark — single 🔥, subtle orange
  if (level.flames === 1) {
    return (
      <span className={`inline-flex items-center ${sizeClasses[size]}`}>
        <span className="opacity-80">🔥</span>
        <span className={`${numberSize[size]} text-orange-400`}>{streak}</span>
        {showLabel && (
          <span className={`${labelSize[size]} text-orange-400/70`}>
            {t({ th: level.nameTh, en: level.nameEn })}
          </span>
        )}
      </span>
    );
  }

  // flames=2: Flame — 🔥 with animate-pulse orange glow
  if (level.flames === 2) {
    return (
      <span className={`inline-flex items-center ${sizeClasses[size]}`}>
        <span className="animate-pulse">🔥</span>
        <span
          className={`${numberSize[size]} text-orange-400`}
          style={{ textShadow: "0 0 8px rgba(251,146,60,0.5)" }}
        >
          {streak}
        </span>
        {showLabel && (
          <span className={`${labelSize[size]} text-orange-400`}>
            {t({ th: level.nameTh, en: level.nameEn })}
          </span>
        )}
      </span>
    );
  }

  // flames=3: Blaze — 🔥🔥 with strong glow
  if (level.flames === 3) {
    return (
      <span
        className={`inline-flex items-center ${sizeClasses[size]}`}
        style={{ filter: "drop-shadow(0 0 6px rgba(251,146,60,0.4))" }}
      >
        <span className="scale-110">🔥🔥</span>
        <span
          className={`${numberSize[size]} text-orange-300`}
          style={{ textShadow: "0 0 12px rgba(251,146,60,0.6)" }}
        >
          {streak}
        </span>
        {showLabel && (
          <span className={`${labelSize[size]} text-orange-300`}>
            {t({ th: level.nameTh, en: level.nameEn })}
          </span>
        )}
      </span>
    );
  }

  // flames=4: Inferno — 🔥🔥🔥 with pulsing glow + drop-shadow
  if (level.flames === 4) {
    return (
      <span
        className={`inline-flex items-center animate-pulse ${sizeClasses[size]}`}
        style={{ filter: "drop-shadow(0 0 10px rgba(251,146,60,0.6))" }}
      >
        <span>🔥🔥🔥</span>
        <span
          className={`${numberSize[size]} text-orange-200`}
          style={{ textShadow: "0 0 16px rgba(251,146,60,0.8)" }}
        >
          {streak}
        </span>
        {showLabel && (
          <span className={`${labelSize[size]} text-orange-200`}>
            {t({ th: level.nameTh, en: level.nameEn })}
          </span>
        )}
      </span>
    );
  }

  // flames=5: Legendary — ✨🔥✨ with golden glow + scale animation
  return (
    <span
      className={`inline-flex items-center animate-bounce ${sizeClasses[size]}`}
      style={{
        filter: "drop-shadow(0 0 14px rgba(250,204,21,0.7))",
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
    >
      <span className="animate-spin" style={{ animationDuration: "3s" }}>
        ✨
      </span>
      <span>🔥</span>
      <span
        className="animate-spin"
        style={{ animationDuration: "3s", animationDirection: "reverse" }}
      >
        ✨
      </span>
      <span
        className={`${numberSize[size]} text-yellow-300`}
        style={{ textShadow: "0 0 20px rgba(250,204,21,0.9)" }}
      >
        {streak}
      </span>
      {showLabel && (
        <span className={`${labelSize[size]} text-yellow-300`}>
          {t({ th: level.nameTh, en: level.nameEn })}
        </span>
      )}
    </span>
  );
}
