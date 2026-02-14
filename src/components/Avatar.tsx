"use client";

import { getFrame } from "@/lib/avatar-frames";

interface AvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  frameKey?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showFrame?: boolean;
}

const SIZE_MAP = {
  sm: { container: "w-8 h-8", text: "text-xs" },
  md: { container: "w-12 h-12", text: "text-base" },
  lg: { container: "w-16 h-16", text: "text-xl" },
  xl: { container: "w-24 h-24", text: "text-3xl" },
};

export default function Avatar({
  avatarUrl,
  name,
  frameKey = "default",
  size = "md",
  showFrame = true,
}: AvatarProps) {
  const frame = getFrame(frameKey);
  const sizeConfig = SIZE_MAP[size];

  const firstLetter = (name || "?").charAt(0).toUpperCase();

  // Build glow style
  const glowStyle: React.CSSProperties = {};
  if (showFrame && frame.glowColor) {
    if (frame.glowColor.startsWith("linear-gradient")) {
      // Rainbow: use a background gradient behind the border
      glowStyle.background = frame.glowColor;
      glowStyle.padding = "3px";
    } else {
      glowStyle.boxShadow = `0 0 12px ${frame.glowColor}, 0 0 24px ${frame.glowColor}`;
    }
  }

  const isRainbow = frame.key === "rainbow" && showFrame;

  if (isRainbow) {
    // Special rainbow rendering: gradient border using a wrapper
    return (
      <div
        className={`${sizeConfig.container} rounded-full flex-shrink-0`}
        style={{
          background: frame.glowColor,
          padding: "3px",
          boxShadow: "0 0 12px rgba(168,85,247,0.4)",
        }}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-primary)]">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name || "Avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-600 to-orange-800">
              <span className={`${sizeConfig.text} font-bold text-white`}>
                {firstLetter}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sizeConfig.container} rounded-full overflow-hidden flex-shrink-0 ${
        showFrame ? frame.borderStyle : ""
      }`}
      style={glowStyle}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name || "Avatar"}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-600 to-orange-800 rounded-full">
          <span className={`${sizeConfig.text} font-bold text-white`}>
            {firstLetter}
          </span>
        </div>
      )}
    </div>
  );
}
