"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import ThailandHeatmap from "@/components/ThailandHeatmap";
import {
  REGIONS,
  getProvince,
  getProvinceOptions,
  type RegionKey,
} from "@/lib/provinces";

// --- Types ---

interface HeatmapProvince {
  code: string;
  totalPoints: number;
  userCount: number;
}

interface HeatmapData {
  provinces: HeatmapProvince[];
  national: { totalUsers: number; totalPoints: number };
}

interface LeaderboardEntry {
  code: string;
  totalPoints: number;
  userCount: number;
  avgPoints: number;
}

interface MyProvinceData {
  province: string | null;
  provinceRank: number | null;
  nationalRank: number | null;
}

// --- Helpers ---

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

// --- Region filter ---

type RegionFilter = "all" | RegionKey;

const REGION_TABS: { key: RegionFilter; labelTh: string; labelEn: string }[] = [
  { key: "all", labelTh: "ทั้งหมด", labelEn: "All" },
  { key: "north", labelTh: "เหนือ", labelEn: "North" },
  { key: "northeast", labelTh: "อีสาน", labelEn: "NE" },
  { key: "central", labelTh: "กลาง", labelEn: "Central" },
  { key: "east", labelTh: "ตะวันออก", labelEn: "East" },
  { key: "west", labelTh: "ตะวันตก", labelEn: "West" },
  { key: "south", labelTh: "ใต้", labelEn: "South" },
];

const provinceOptions = getProvinceOptions();

// --- Main Component ---

export default function ProvincePage() {
  const { t, locale } = useI18n();

  // Data states
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myProvince, setMyProvince] = useState<MyProvinceData | null>(null);
  const [loading, setLoading] = useState(true);

  // UI states
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [saving, setSaving] = useState(false);

  const detailRef = useRef<HTMLDivElement>(null);

  // --- Fetch data ---

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [heatmapRes, leaderboardRes, myRes] = await Promise.all([
        fetch("/api/province/heatmap"),
        fetch("/api/province/leaderboard?region=all"),
        fetch("/api/province/my"),
      ]);

      if (heatmapRes.ok) setHeatmap(await heatmapRes.json());
      if (leaderboardRes.ok) {
        const lData = await leaderboardRes.json();
        setLeaderboard(lData.leaderboard ?? []);
      }
      if (myRes.ok) {
        const mData = await myRes.json();
        setMyProvince(mData);
        if (mData.province) setSelectedProvince(mData.province);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --- Update province ---

  const handleUpdateProvince = async (code: string) => {
    if (!code) return;
    setSaving(true);
    try {
      const res = await fetch("/api/province/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province: code }),
      });
      if (res.ok) {
        await fetchAll();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  // --- Province click ---

  const handleProvinceClick = (code: string) => {
    setSelectedProvince(code);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // --- Computed ---

  const heatmapProvinces = heatmap?.provinces ?? [];
  const selectedProvinceData = selectedProvince
    ? getProvince(selectedProvince)
    : null;
  const selectedStats = selectedProvince
    ? heatmapProvinces.find((h) => h.code === selectedProvince)
    : null;

  // Rank of selected province
  const sortedLeaderboard = [...leaderboard].sort(
    (a, b) => b.totalPoints - a.totalPoints
  );
  const selectedRank = selectedProvince
    ? sortedLeaderboard.findIndex((l) => l.code === selectedProvince) + 1 || null
    : null;

  // Filter leaderboard by region
  const filteredLeaderboard = sortedLeaderboard.filter((entry) => {
    if (regionFilter === "all") return true;
    const prov = getProvince(entry.code);
    return prov?.region === regionFilter;
  });

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">{t("province.title")}</h1>
        <p className="text-gray-500 mb-8">{t("province.heatmap")}</p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
              <p className="text-gray-400">{t({ th: "กำลังโหลด...", en: "Loading..." } as any)}</p>
            </div>
          </div>
        ) : (
          <>
            {/* ============================================ */}
            {/* National Stats                               */}
            {/* ============================================ */}
            {heatmap?.national && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-400">
                    {formatNumber(heatmap.national.totalUsers)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("province.totalUsers")}
                  </p>
                </div>
                <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-400">
                    {formatNumber(heatmap.national.totalPoints)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("province.totalPoints")}
                  </p>
                </div>
              </div>
            )}

            {/* Region filter buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(
                Object.entries(REGIONS) as [
                  RegionKey,
                  (typeof REGIONS)[RegionKey],
                ][]
              ).map(([key, region]) => (
                <button
                  key={key}
                  onClick={() =>
                    setRegionFilter(regionFilter === key ? "all" : key)
                  }
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition ${
                    regionFilter === key
                      ? "border-white/30 bg-white/10"
                      : "border-[#333] hover:border-white/20"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: region.color }}
                  />
                  <span className="text-gray-300">
                    {locale === "th" ? region.nameTh : region.nameEn}
                  </span>
                </button>
              ))}
            </div>

            {/* ============================================ */}
            {/* SECTION 1: Thailand Heatmap (Hero)           */}
            {/* ============================================ */}
            {heatmap && (
              <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-4 sm:p-6 mb-8">
                <ThailandHeatmap
                  data={heatmapProvinces.map((p) => ({
                    code: p.code,
                    totalPoints: p.totalPoints,
                    userCount: p.userCount,
                  }))}
                  userProvince={myProvince?.province}
                  selectedProvince={selectedProvince}
                  highlightRegion={regionFilter}
                  onProvinceClick={handleProvinceClick}
                />
              </div>
            )}

            {/* ============================================ */}
            {/* SECTION 2: Province Detail Panel             */}
            {/* ============================================ */}
            {selectedProvinceData && (
              <div
                ref={detailRef}
                className="bg-[#111] border border-[#222] rounded-2xl p-5 mb-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedProvinceData.nameTh}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedProvinceData.nameEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          REGIONS[selectedProvinceData.region].color,
                      }}
                    />
                    <span className="text-sm text-gray-400">
                      {locale === "th"
                        ? REGIONS[selectedProvinceData.region].nameTh
                        : REGIONS[selectedProvinceData.region].nameEn}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0A0A0A] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-orange-400">
                      {selectedStats
                        ? formatNumber(selectedStats.totalPoints)
                        : "—"}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {t("province.totalPoints")}
                    </p>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-blue-400">
                      {selectedStats
                        ? formatNumber(selectedStats.userCount)
                        : "—"}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {t("province.totalUsers")}
                    </p>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-yellow-400">
                      {selectedRank ? `#${selectedRank}` : "—"}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {t("province.ranking")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* SECTION 3: My Province Card                  */}
            {/* ============================================ */}
            <div className="bg-[#111] border border-[#222] rounded-2xl p-5 mb-8">
              <h2 className="text-lg font-bold mb-4">
                {t("province.myProvince")}
              </h2>

              {myProvince?.province ? (
                <div>
                  {(() => {
                    const myProv = getProvince(myProvince.province!);
                    if (!myProv) return null;
                    return (
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                          style={{
                            backgroundColor: REGIONS[myProv.region].color,
                          }}
                        >
                          {myProv.code}
                        </div>
                        <div>
                          <p className="font-semibold">{myProv.nameTh}</p>
                          <p className="text-xs text-gray-500">
                            {myProv.nameEn}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#0A0A0A] rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-orange-400">
                        {myProvince.provinceRank
                          ? `#${myProvince.provinceRank}`
                          : "—"}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {t("province.yourRank")}
                      </p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-yellow-400">
                        {myProvince.nationalRank
                          ? `#${myProvince.nationalRank}`
                          : "—"}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {t("province.ranking")}
                      </p>
                    </div>
                  </div>

                  {/* Change province */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      {t("province.selectProvince")}
                    </label>
                    <select
                      value={myProvince.province}
                      onChange={(e) => handleUpdateProvince(e.target.value)}
                      disabled={saving}
                      className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition disabled:opacity-50"
                    >
                      <option value="">
                        {locale === "th" ? "เลือกจังหวัด" : "Select province"}
                      </option>
                      {provinceOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label} ({o.labelEn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm mb-3">
                    {t("province.noProvince")}
                  </p>
                  <select
                    value=""
                    onChange={(e) => handleUpdateProvince(e.target.value)}
                    disabled={saving}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition disabled:opacity-50"
                  >
                    <option value="">
                      {locale === "th" ? "เลือกจังหวัด" : "Select province"}
                    </option>
                    {provinceOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label} ({o.labelEn})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* ============================================ */}
            {/* SECTION 4: Province Leaderboard              */}
            {/* ============================================ */}
            <div>
              <h2 className="text-lg font-bold mb-4">
                {t("province.ranking")}
              </h2>

              {/* Region Tabs */}
              <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
                {REGION_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setRegionFilter(tab.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition ${
                      regionFilter === tab.key
                        ? "bg-orange-500 text-white"
                        : "bg-[#1A1A1A] text-gray-400 hover:bg-[#222] hover:text-gray-300"
                    }`}
                  >
                    {tab.key !== "all" && (
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1.5"
                        style={{
                          backgroundColor:
                            REGIONS[tab.key as RegionKey].color,
                        }}
                      />
                    )}
                    {locale === "th" ? tab.labelTh : tab.labelEn}
                  </button>
                ))}
              </div>

              {/* Table */}
              {filteredLeaderboard.length > 0 ? (
                <div className="rounded-xl border border-[#1A1A1A] overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[40px_1fr_70px_80px_70px] sm:grid-cols-[50px_1fr_90px_100px_90px] gap-1 px-3 py-2 bg-[#0A0A0A] border-b border-[#1A1A1A] text-[10px] sm:text-xs text-gray-500 font-medium">
                    <span>#</span>
                    <span>{locale === "th" ? "จังหวัด" : "Province"}</span>
                    <span className="text-right">
                      {t("province.totalUsers")}
                    </span>
                    <span className="text-right">
                      {t("province.totalPoints")}
                    </span>
                    <span className="text-right">
                      {t("province.avgPoints")}
                    </span>
                  </div>

                  {/* Rows */}
                  {filteredLeaderboard.map((entry, idx) => {
                    const prov = getProvince(entry.code);
                    if (!prov) return null;
                    const isMyProvince = myProvince?.province === entry.code;
                    const isSelectedProv = selectedProvince === entry.code;

                    return (
                      <div
                        key={entry.code}
                        onClick={() => handleProvinceClick(entry.code)}
                        className={`grid grid-cols-[40px_1fr_70px_80px_70px] sm:grid-cols-[50px_1fr_90px_100px_90px] gap-1 px-3 py-2.5 cursor-pointer transition ${
                          isMyProvince
                            ? "bg-orange-500/10 border-l-2 border-l-orange-500"
                            : isSelectedProv
                              ? "bg-white/5"
                              : idx % 2 === 0
                                ? "bg-[#0A0A0A]"
                                : "bg-[#111]"
                        } hover:bg-white/5`}
                      >
                        <span className="text-sm font-bold text-gray-500 tabular-nums">
                          {idx + 1}
                        </span>
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: REGIONS[prov.region].color,
                            }}
                          />
                          <span className="text-sm font-medium truncate">
                            {locale === "th" ? prov.nameTh : prov.nameEn}
                          </span>
                          {isMyProvince && (
                            <span className="text-[10px] text-orange-400 flex-shrink-0">
                              ({locale === "th" ? "คุณ" : "You"})
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-gray-400 text-right tabular-nums">
                          {formatNumber(entry.userCount)}
                        </span>
                        <span className="text-sm font-semibold text-orange-400 text-right tabular-nums">
                          {formatNumber(entry.totalPoints)}
                        </span>
                        <span className="text-sm text-gray-400 text-right tabular-nums">
                          {formatNumber(entry.avgPoints)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🗺️</p>
                  <p className="text-gray-500">
                    {locale === "th" ? "ยังไม่มีข้อมูล" : "No data yet"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
