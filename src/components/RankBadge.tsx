"use client";

import { getRank } from "@/lib/gamification";
import { useI18n } from "@/lib/i18n";

interface RankBadgeProps {
  lifetimePoints: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function RankBadge({
  lifetimePoints,
  size = "md",
  showLabel = true,
}: RankBadgeProps) {
  const { t } = useI18n();
  const rank = getRank(lifetimePoints);
  const isLegend = rank.key === "legend";

  const rankName = t({ th: rank.nameTh, en: rank.nameEn });

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${rank.bgColor} ${rank.color}`}
        style={
          isLegend
            ? { boxShadow: "0 0 8px rgba(250,204,21,0.4)" }
            : undefined
        }
      >
        <span>{rank.icon}</span>
        {showLabel && <span>{rankName}</span>}
      </span>
    );
  }

  if (size === "lg") {
    return (
      <span
        className={`inline-flex items-center gap-2 text-xl font-bold ${rank.color}`}
        style={
          isLegend
            ? {
                textShadow: "0 0 16px rgba(250,204,21,0.6)",
                filter: "drop-shadow(0 0 10px rgba(250,204,21,0.4))",
              }
            : undefined
        }
      >
        <span className={isLegend ? "animate-pulse" : ""}>{rank.icon}</span>
        {showLabel && <span>{rankName}</span>}
      </span>
    );
  }

  // md (default)
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${rank.color}`}
      style={
        isLegend
          ? {
              textShadow: "0 0 12px rgba(250,204,21,0.5)",
              filter: "drop-shadow(0 0 6px rgba(250,204,21,0.3))",
            }
          : undefined
      }
    >
      <span className={isLegend ? "animate-pulse" : ""}>{rank.icon}</span>
      {showLabel && <span>{rankName}</span>}
    </span>
  );
}
