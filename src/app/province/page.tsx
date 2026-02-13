"use client";

import { useI18n } from "@/lib/i18n";
import AuthGuard from "@/components/AuthGuard";
import ThailandHeatmap from "@/components/ThailandHeatmap";
import { getProvinceOptions } from "@/lib/provinces";
import { useEffect, useState, useCallback, useRef } from "react";

interface HeatmapProvince {
  code: string;
  nameTh: string;
  nameEn: string;
  region: string;
  totalPoints: number;
  userCount: number;
}

interface HeatmapData {
  provinces: HeatmapProvince[];
  national: { totalUsers: number; totalPoints: number };
}

interface LeaderboardEntry {
  rank: number;
  code: string;
  nameTh: string;
  nameEn: string;
  region: string;
  totalPoints: number;
  userCount: number;
  avgPoints: number;
}

interface MyProvinceData {
  province: { code: string; nameTh: string; nameEn: string; region: string } | null;
  stats?: {
    totalUsers: number;
    totalPoints: number;
    rankInProvince: number;
    nationalRank: number | null;
  };
}

const provinceOptions = getProvinceOptions();

export default function ProvincePage() {
  const { t } = useI18n();

  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myProvince, setMyProvince] = useState<MyProvinceData | null>(null);
  const [loading, setLoading] = useState(true);

  // Province selector
  const [selectedCode, setSelectedCode] = useState("");
  const [saving, setSaving] = useState(false);

  // Selected province detail from map click
  const [focusedProvince, setFocusedProvince] = useState<string | null>(null);

  const detailRef = useRef<HTMLDivElement>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [heatRes, lbRes, myRes] = await Promise.all([
        fetch("/api/province/heatmap"),
        fetch("/api/province/leaderboard"),
        fetch("/api/province/my"),
      ]);
      const [heatJson, lbJson, myJson] = await Promise.all([
        heatRes.json(),
        lbRes.json(),
        myRes.json(),
      ]);
      setHeatmap(heatJson);
      setLeaderboard(lbJson.leaderboard ?? []);
      setMyProvince(myJson);
      if (myJson.province) {
        setFocusedProvince(myJson.province.code);
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

  const handleSaveProvince = async () => {
    if (!selectedCode) return;
    setSaving(true);
    try {
      const res = await fetch("/api/province/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province: selectedCode }),
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

  const handleProvinceClick = (code: string) => {
    setFocusedProvince(code);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const focusedData = focusedProvince
    ? heatmap?.provinces.find((p) => p.code === focusedProvince)
    : null;

  const focusedLeaderboard = focusedProvince
    ? leaderboard.find((e) => e.code === focusedProvince)
    : null;

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">{t("province.title")}</h1>

        {/* Province Selector — show if no province set */}
        {!loading && myProvince && !myProvince.province && (
          <div className="mb-8 rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
            <p className="text-orange-400 font-medium mb-3">
              {t("province.noProvince")}
            </p>
            <div className="flex gap-3">
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="flex-1 bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">{t("province.selectProvince")}</option>
                {provinceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.labelEn})
                  </option>
                ))}
              </select>
              <button
                onClick={handleSaveProvince}
                disabled={!selectedCode || saving}
                className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-orange-600 transition-colors"
              >
                {saving ? "..." : { th: "บันทึก", en: "Save" }[t("nav.home") === "Home" ? "en" : "th"]}
              </button>
            </div>
          </div>
        )}

        {/* My Province Badge */}
        {!loading && myProvince?.province && myProvince.stats && (
          <div className="mb-8 rounded-xl border border-[#222] bg-[#0A0A0A] p-5">
            <p className="text-sm text-gray-500 mb-1">{t("province.myProvince")}</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold">{myProvince.province.nameTh}</span>
              <span className="text-gray-500 text-sm">{myProvince.province.nameEn}</span>
              {myProvince.stats.nationalRank && (
                <span className="ml-auto text-xs bg-orange-500/10 text-orange-400 rounded-full px-3 py-1">
                  #{myProvince.stats.nationalRank} {t("province.ranking")}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-orange-400">
                  {myProvince.stats.totalPoints.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{t("province.totalPoints")}</p>
              </div>
              <div>
                <p className="text-lg font-bold">{myProvince.stats.totalUsers}</p>
                <p className="text-xs text-gray-500">{t("province.totalUsers")}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-400">
                  #{myProvince.stats.rankInProvince}
                </p>
                <p className="text-xs text-gray-500">{t("province.yourRank")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        )}

        {/* Heatmap */}
        {!loading && heatmap && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-1">{t("province.heatmap")}</h2>
            <p className="text-sm text-gray-500 mb-5">
              {heatmap.national.totalUsers.toLocaleString()} {t("province.totalUsers")} /{" "}
              {heatmap.national.totalPoints.toLocaleString()} {t("province.totalPoints")}
            </p>
            <ThailandHeatmap
              data={heatmap.provinces.map((p) => ({
                code: p.code,
                totalPoints: p.totalPoints,
              }))}
              userProvince={myProvince?.province?.code}
              onProvinceClick={handleProvinceClick}
            />
          </div>
        )}

        {/* Selected Province Detail */}
        {focusedData && (
          <div ref={detailRef} className="mb-10 rounded-xl border border-[#222] bg-[#0A0A0A] p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-bold">{focusedData.nameTh}</span>
              <span className="text-gray-500 text-sm">{focusedData.nameEn}</span>
              {focusedLeaderboard && (
                <span className="ml-auto text-xs bg-[#1A1A1A] text-gray-400 rounded-full px-3 py-1">
                  #{focusedLeaderboard.rank}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-orange-400">
                  {focusedData.totalPoints.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{t("province.totalPoints")}</p>
              </div>
              <div>
                <p className="text-lg font-bold">{focusedData.userCount}</p>
                <p className="text-xs text-gray-500">{t("province.totalUsers")}</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {focusedData.userCount > 0
                    ? Math.round(focusedData.totalPoints / focusedData.userCount).toLocaleString()
                    : 0}
                </p>
                <p className="text-xs text-gray-500">{t("province.avgPoints")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Province Ranking Table */}
        {!loading && leaderboard.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">{t("province.ranking")}</h2>
            <div className="rounded-xl border border-[#1A1A1A] overflow-hidden">
              {leaderboard.slice(0, 20).map((entry, idx) => {
                const isUser = entry.code === myProvince?.province?.code;
                const maxPts = leaderboard[0]?.totalPoints || 1;
                const barWidth = Math.max((entry.totalPoints / maxPts) * 100, 2);

                return (
                  <div
                    key={entry.code}
                    onClick={() => handleProvinceClick(entry.code)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition hover:bg-[#151515] ${
                      isUser
                        ? "bg-orange-500/5 border-l-2 border-l-orange-500"
                        : idx % 2 === 0
                        ? "bg-[#0A0A0A]"
                        : "bg-[#111111]"
                    }`}
                  >
                    {/* Rank */}
                    <span
                      className={`w-8 text-center text-sm font-bold ${
                        entry.rank <= 3 ? "text-orange-400" : "text-gray-500"
                      }`}
                    >
                      {entry.rank}
                    </span>

                    {/* Province Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {entry.nameTh}
                        </span>
                        {isUser && (
                          <span className="text-[10px] text-orange-400 bg-orange-400/10 rounded px-1.5 py-0.5">
                            {t("province.myProvince")}
                          </span>
                        )}
                      </div>
                      {/* Points bar */}
                      <div className="mt-1 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <span className="text-sm font-semibold text-orange-400 tabular-nums whitespace-nowrap">
                      {entry.totalPoints.toLocaleString()} pts
                    </span>
                    <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">
                      {entry.userCount} users
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🗺️</p>
            <p className="text-gray-400 text-lg">{t("province.noProvince")}</p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
