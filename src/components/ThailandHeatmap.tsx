"use client";

import { useMemo, useState } from "react";
import { PROVINCES, GRID_ROWS, GRID_COLS, getProvince } from "@/lib/provinces";
import { REGIONS, type RegionKey } from "@/lib/provinces";

interface ProvinceData {
  code: string;
  totalPoints: number;
}

interface ThailandHeatmapProps {
  data: ProvinceData[];
  userProvince?: string | null;
  selectedProvince?: string | null;
  highlightRegion?: RegionKey | "all" | null;
  onProvinceClick?: (code: string) => void;
}

function getIntensity(points: number, maxPoints: number): number {
  if (maxPoints === 0) return 0;
  return Math.max(0.15, Math.min(1, points / maxPoints));
}

export default function ThailandHeatmap({
  data,
  userProvince,
  selectedProvince,
  highlightRegion = "all",
  onProvinceClick,
}: ThailandHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    code: string;
    x: number;
    y: number;
  } | null>(null);

  const pointsMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.code, d.totalPoints));
    return map;
  }, [data]);

  const maxPoints = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => d.totalPoints), 1);
  }, [data]);

  function handleMouseEnter(code: string, e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ code, x: rect.left + rect.width / 2, y: rect.top });
  }

  return (
    <div className="relative w-full">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none" />

      {/* Grid */}
      <div
        className="relative mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          gap: "3px",
          maxWidth: "500px",
        }}
      >
        {PROVINCES.map((province) => {
          const points = pointsMap.get(province.code) ?? 0;
          const intensity = points > 0 ? getIntensity(points, maxPoints) : 0;
          const regionColor = REGIONS[province.region].color;
          const isUser = province.code === userProvince;
          const isSelected = province.code === selectedProvince;
          const isRegionDimmed =
            highlightRegion !== null &&
            highlightRegion !== "all" &&
            province.region !== highlightRegion;

          const bgColor =
            intensity > 0
              ? `${regionColor}${Math.round(intensity * 255)
                  .toString(16)
                  .padStart(2, "0")}`
              : `${regionColor}15`;

          return (
            <div
              key={province.code}
              onClick={() => onProvinceClick?.(province.code)}
              onMouseEnter={(e) => handleMouseEnter(province.code, e)}
              onMouseLeave={() => setTooltip(null)}
              className={`
                aspect-square rounded-md sm:rounded-lg cursor-pointer
                flex items-center justify-center
                text-[7px] sm:text-[10px] md:text-xs font-bold select-none
                transition-all duration-200 hover:scale-110 hover:z-10 hover:ring-2 hover:ring-white/40
                ${isSelected ? "ring-2 ring-orange-500 scale-110 z-10" : ""}
                ${isUser && !isSelected ? "ring-2 ring-orange-400/60" : ""}
                ${isRegionDimmed ? "opacity-20" : ""}
              `}
              style={{
                gridRow: province.row + 1,
                gridColumn: province.col + 1,
                backgroundColor: bgColor,
              }}
              title={`${province.nameTh} (${province.nameEn})`}
            >
              <span className="truncate text-white/90 drop-shadow-sm">
                {province.code}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltip &&
        (() => {
          const info = getProvince(tooltip.code);
          const points = pointsMap.get(tooltip.code) ?? 0;
          if (!info) return null;
          const region = REGIONS[info.region];
          return (
            <div
              className="fixed z-50 pointer-events-none bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-xs shadow-xl -translate-x-1/2 -translate-y-full"
              style={{ left: tooltip.x, top: tooltip.y - 8 }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: region.color }}
                />
                <p className="font-bold text-white">{info.nameTh}</p>
              </div>
              <p className="text-gray-400">{info.nameEn}</p>
              <p className="text-orange-400 font-semibold mt-1">
                {points.toLocaleString()} pts
              </p>
            </div>
          );
        })()}

      {/* Region Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs">
        {(
          Object.entries(REGIONS) as [RegionKey, (typeof REGIONS)[RegionKey]][]
        ).map(([key, region]) => (
          <span key={key} className="flex items-center gap-1 text-gray-500">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: region.color }}
            />
            {region.nameTh}
          </span>
        ))}
      </div>
    </div>
  );
}
