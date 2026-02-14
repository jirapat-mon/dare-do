"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { PROVINCES } from "@/lib/provinces";
import { REGIONS, type RegionKey } from "@/lib/provinces";
import { PROVINCE_PATHS, MAP_VIEWBOX } from "@/lib/thailand-map-paths";

interface ProvinceData {
  code: string;
  totalPoints: number;
  userCount?: number;
}

interface ThailandHeatmapProps {
  data: ProvinceData[];
  userProvince?: string | null;
  selectedProvince?: string | null;
  highlightRegion?: RegionKey | "all" | null;
  onProvinceClick?: (code: string) => void;
  maxPoints?: number;
}

function getIntensity(points: number, maxPoints: number): number {
  if (maxPoints === 0) return 0;
  return Math.max(0.15, Math.min(1, points / maxPoints));
}

/** Convert hex color to rgb components */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export default function ThailandHeatmap({
  data,
  userProvince,
  selectedProvince,
  highlightRegion = "all",
  onProvinceClick,
  maxPoints: maxPointsProp,
}: ThailandHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Build lookup maps
  const pointsMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.code, d.totalPoints));
    return map;
  }, [data]);

  const userCountMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => {
      if (d.userCount !== undefined) map.set(d.code, d.userCount);
    });
    return map;
  }, [data]);

  const maxPoints = useMemo(() => {
    if (maxPointsProp !== undefined) return maxPointsProp;
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => d.totalPoints), 1);
  }, [data, maxPointsProp]);

  // Build province code -> Province info lookup
  const provinceInfoMap = useMemo(() => {
    const map = new Map<string, (typeof PROVINCES)[number]>();
    PROVINCES.forEach((p) => map.set(p.code, p));
    return map;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!hoveredProvince) return;
      const rect = (
        e.currentTarget as SVGElement
      ).ownerSVGElement?.getBoundingClientRect();
      if (!rect) return;
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [hoveredProvince]
  );

  const handleProvinceMouseEnter = useCallback(
    (code: string, e: React.MouseEvent) => {
      setHoveredProvince(code);
      const rect = (
        e.currentTarget as SVGElement
      ).ownerSVGElement?.getBoundingClientRect();
      if (!rect) return;
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    []
  );

  const handleProvinceMouseLeave = useCallback(() => {
    setHoveredProvince(null);
  }, []);

  // Tooltip data
  const tooltipData = useMemo(() => {
    if (!hoveredProvince) return null;
    const info = provinceInfoMap.get(hoveredProvince);
    if (!info) return null;
    const points = pointsMap.get(hoveredProvince) ?? 0;
    const users = userCountMap.get(hoveredProvince) ?? 0;
    const region = REGIONS[info.region];
    return { info, points, users, region };
  }, [hoveredProvince, provinceInfoMap, pointsMap, userCountMap]);

  return (
    <div className="relative w-full">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none" />

      {/* SVG Map */}
      <div className="relative mx-auto" style={{ maxWidth: "420px" }}>
        <svg
          ref={svgRef}
          viewBox={MAP_VIEWBOX}
          className="w-full h-auto"
          style={{ filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))" }}
        >
          {/* Defs for filters and gradients */}
          <defs>
            {/* Selected province glow */}
            <filter
              id="selected-glow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#f97316" floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Hover brighten */}
            <filter id="hover-brighten" x="-5%" y="-5%" width="110%" height="110%">
              <feComponentTransfer>
                <feFuncR type="linear" slope="1.3" intercept="0.05" />
                <feFuncG type="linear" slope="1.3" intercept="0.05" />
                <feFuncB type="linear" slope="1.3" intercept="0.05" />
              </feComponentTransfer>
            </filter>
            {/* User province pulse */}
            <filter id="user-glow" x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor="#fb923c" floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render each province */}
          {PROVINCE_PATHS.map((pathData) => {
            const info = provinceInfoMap.get(pathData.code);
            if (!info) return null;

            const points = pointsMap.get(pathData.code) ?? 0;
            const intensity = points > 0 ? getIntensity(points, maxPoints) : 0;
            const regionColor = REGIONS[info.region].color;
            const rgb = hexToRgb(regionColor);
            const isHovered = hoveredProvince === pathData.code;
            const isSelected = selectedProvince === pathData.code;
            const isUser =
              userProvince === pathData.code && !isSelected;
            const isRegionDimmed =
              highlightRegion !== null &&
              highlightRegion !== "all" &&
              info.region !== highlightRegion;

            // Fill color: region color with opacity based on intensity
            const fillOpacity =
              intensity > 0 ? intensity * 0.85 + 0.15 : 0.08;
            const fillColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${fillOpacity})`;

            // Stroke
            let strokeColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
            let strokeWidth = 0.8;
            if (isSelected) {
              strokeColor = "#f97316";
              strokeWidth = 2.5;
            } else if (isUser) {
              strokeColor = "#fb923c";
              strokeWidth = 1.8;
            } else if (isHovered) {
              strokeColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
              strokeWidth = 1.5;
            }

            // Filter
            let filter: string | undefined;
            if (isSelected) {
              filter = "url(#selected-glow)";
            } else if (isUser) {
              filter = "url(#user-glow)";
            } else if (isHovered) {
              filter = "url(#hover-brighten)";
            }

            const dimOpacity = isRegionDimmed ? 0.15 : 1;

            return (
              <g
                key={pathData.code}
                style={{
                  opacity: dimOpacity,
                  transition: "opacity 0.3s ease",
                  cursor: "pointer",
                }}
                onClick={() => onProvinceClick?.(pathData.code)}
                onMouseEnter={(e) =>
                  handleProvinceMouseEnter(pathData.code, e)
                }
                onMouseLeave={handleProvinceMouseLeave}
                onMouseMove={handleMouseMove}
              >
                <polygon
                  points={pathData.points}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  filter={filter}
                  style={{
                    transition:
                      "fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease",
                  }}
                />
                {/* Province code label — only show for larger provinces or when hovered */}
                <text
                  x={pathData.cx}
                  y={pathData.cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="8"
                  fontWeight="600"
                  pointerEvents="none"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                    opacity: isHovered || isSelected ? 1 : 0.6,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  {pathData.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip — rendered as HTML overlay for better styling */}
        {tooltipData && (
          <div
            className="absolute z-50 pointer-events-none bg-[#111]/95 backdrop-blur-sm border border-[#333] rounded-lg px-3 py-2 text-xs shadow-xl"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 8,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: tooltipData.region.color }}
              />
              <p className="font-bold text-white whitespace-nowrap">
                {tooltipData.info.nameTh}
              </p>
            </div>
            <p className="text-gray-400">{tooltipData.info.nameEn}</p>
            <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-[#333]">
              <p className="text-orange-400 font-semibold">
                {tooltipData.points.toLocaleString()} pts
              </p>
              {tooltipData.users > 0 && (
                <p className="text-blue-400">
                  {tooltipData.users.toLocaleString()} users
                </p>
              )}
            </div>
          </div>
        )}
      </div>

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
