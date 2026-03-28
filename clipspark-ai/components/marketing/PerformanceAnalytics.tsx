"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  RefreshCw,
  WifiOff,
  Sparkles,
  BarChart2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Target,
} from "lucide-react";
import { SectionHeader, EmptyState } from "@/components/shared";
import type {
  AnalysisResult,
  CampaignScore,
} from "@/skills/campaign-performance-analyzer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface CampaignRow {
  id: string;
  name: string;
  platform: "facebook" | "google";
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

function loadFromCache(): { campaigns: CampaignRow[]; sources: string[] } {
  const campaigns: CampaignRow[] = [];
  const sources: string[] = [];
  try {
    const google = localStorage.getItem("google_campaigns");
    if (google) {
      const { campaigns: gc } = JSON.parse(google);
      (gc as any[]).forEach((c) =>
        campaigns.push({
          id: `g_${c.id}`,
          name: c.name,
          platform: "google",
          status: c.status,
          spend: c.metrics?.spend ?? 0,
          impressions: c.metrics?.impressions ?? 0,
          clicks: c.metrics?.clicks ?? 0,
          ctr: parseFloat(c.metrics?.ctr ?? "0"),
        }),
      );
      sources.push("Google Ads");
    }
  } catch {
    /* ignore */
  }
  try {
    const meta = localStorage.getItem("meta_campaigns");
    if (meta) {
      const { campaigns: mc } = JSON.parse(meta);
      (mc as any[]).forEach((c) =>
        campaigns.push({
          id: `m_${c.id}`,
          name: c.name,
          platform: "facebook",
          status: c.status,
          spend: c.metrics?.spend ?? 0,
          impressions: c.metrics?.impressions ?? 0,
          clicks: c.metrics?.clicks ?? 0,
          ctr: c.metrics?.ctr ?? 0,
        }),
      );
      sources.push("Meta Ads");
    }
  } catch {
    /* ignore */
  }
  return { campaigns, sources };
}

const PLATFORM_COLORS = { google: "#16a34a", facebook: "#2563eb" };

export default function PerformanceAnalytics() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "insights">(
    "overview",
  );
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const reload = () => {
    const { campaigns: c, sources: s } = loadFromCache();
    setCampaigns(c);
    setSources(s);
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = campaigns.filter(
    (c) => platformFilter === "all" || c.platform === platformFilter,
  );

  const totalSpend = filtered.reduce((s, c) => s + c.spend, 0);
  const totalImpressions = filtered.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = filtered.reduce((s, c) => s + c.clicks, 0);
  const avgCtr =
    filtered.length > 0
      ? filtered.reduce((s, c) => s + c.ctr, 0) / filtered.length
      : 0;

  const googleSpend = campaigns
    .filter((c) => c.platform === "google")
    .reduce((s, c) => s + c.spend, 0);
  const metaSpend = campaigns
    .filter((c) => c.platform === "facebook")
    .reduce((s, c) => s + c.spend, 0);
  const combinedSpend = googleSpend + metaSpend;
  const googlePct =
    combinedSpend > 0 ? (googleSpend / combinedSpend) * 100 : 50;
  const metaPct = 100 - googlePct;

  // Top 8 by spend for bar chart
  const topBySpend = [...filtered]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 8);

  // Pie data
  const pieData = [
    { name: "Meta", value: metaSpend, color: PLATFORM_COLORS.facebook },
    { name: "Google", value: googleSpend, color: PLATFORM_COLORS.google },
  ].filter((d) => d.value > 0);

  const generateInsights = async () => {
    if (!campaigns.length) return;
    setInsightsLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/campaigns/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaigns: campaigns.map((c) => ({
            id: c.id,
            name: c.name,
            platform: c.platform,
            status: c.status,
            spend: c.spend,
            impressions: c.impressions,
            clicks: c.clicks,
            ctr: c.ctr,
          })),
          targetRoas: 3,
          targetCpa: 500,
          totalBudget: combinedSpend,
        }),
      });
      const data = await res.json();
      if (data.analysis) setAnalysis(data.analysis);
      else setAnalysis(null);
    } catch (e) {
      console.error(e);
    } finally {
      setInsightsLoading(false);
    }
  };

  const hasCampaigns = campaigns.length > 0;

  return (
    <div>
      <SectionHeader
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        title="Performance Analytics"
        description={
          hasCampaigns
            ? `Live data from: ${sources.join(", ")}`
            : "Aggregates data from your Google Ads and Meta Ads tabs."
        }
      />

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "overview"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "insights"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Sparkles className="w-4 h-4" /> AI Insights
        </button>
      </div>

      {/* No data */}
      {!hasCampaigns && (
        <EmptyState
          icon={<WifiOff className="w-10 h-10 text-gray-400" />}
          message="No cached data found. Fetch campaigns in the Google Ads or Meta Ads tabs first."
        />
      )}

      {/* ── OVERVIEW TAB ── */}
      {hasCampaigns && activeTab === "overview" && (
        <>
          {/* Filters */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Meta / Facebook</option>
              <option value="google">Google</option>
            </select>
            <button
              onClick={reload}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Spend", value: `₹${totalSpend.toFixed(2)}` },
              {
                label: "Impressions",
                value: totalImpressions.toLocaleString(),
              },
              { label: "Clicks", value: totalClicks.toLocaleString() },
              { label: "Avg. CTR", value: `${avgCtr.toFixed(2)}%` },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <p className="text-xs text-gray-500">{m.label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Spend by campaign bar chart */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Spend by Campaign (Top 8)
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={topBySpend}
                  margin={{ top: 0, right: 8, left: 0, bottom: 40 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(v) => [`₹${Number(v).toFixed(2)}`, "Spend"]}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                    {topBySpend.map((c) => (
                      <Cell key={c.id} fill={PLATFORM_COLORS[c.platform]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Platform spend pie */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Platform Split
              </p>
              {combinedSpend > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {pieData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(v) => `₹${Number(v).toFixed(2)}`}
                      contentStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 text-xs">
                  No spend data
                </div>
              )}
            </div>
          </div>

          {/* CTR bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-4">
              CTR by Campaign (%)
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={topBySpend}
                margin={{ top: 0, right: 8, left: 0, bottom: 40 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(2)}%`, "CTR"]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="ctr" radius={[4, 4, 0, 0]}>
                  {topBySpend.map((c) => (
                    <Cell
                      key={c.id}
                      fill={c.platform === "google" ? "#86efac" : "#93c5fd"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Campaign table */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="w-5 h-5 text-green-600" />}
              message="No campaigns for the selected filter"
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-xs">
                    <th className="text-left p-3">Campaign</th>
                    <th className="text-left p-3">Platform</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-right p-3">Spend</th>
                    <th className="text-right p-3">Impr.</th>
                    <th className="text-right p-3">Clicks</th>
                    <th className="text-right p-3">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3 text-gray-900 font-medium">
                        {c.name}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${c.platform === "google" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}
                        >
                          {c.platform === "google" ? "Google" : "Meta"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${["ACTIVE", "ENABLED"].includes(c.status) ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-gray-900 font-medium">
                        ₹{c.spend.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        {c.impressions.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        {c.clicks.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        {c.ctr.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 text-center py-3">
                {filtered.length} campaigns · from local cache
              </p>
            </div>
          )}
        </>
      )}

      {/* ── AI INSIGHTS TAB ── */}
      {hasCampaigns && activeTab === "insights" && (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm shrink-0">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base">
                AI Campaign Analysis
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Scores all {campaigns.length} campaigns, surfaces
                positives/negatives, and gives prioritized optimization actions.
              </p>
              <button
                onClick={generateInsights}
                disabled={insightsLoading}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {insightsLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {analysis ? "Regenerate" : "Generate AI Insights"}
                  </>
                )}
              </button>
            </div>
          </div>

          {insightsLoading && (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
                >
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {analysis && !insightsLoading && (
            <InsightsPanel
              analysis={analysis}
              totalCampaigns={campaigns.length}
              sources={sources}
              combinedSpend={combinedSpend}
            />
          )}

          {!analysis && !insightsLoading && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Click "Generate AI Insights" to get a scored analysis of your
              campaigns
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── InsightsPanel ──────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-700 border-green-200",
  B: "bg-blue-50 text-blue-700 border-blue-200",
  C: "bg-yellow-50 text-yellow-700 border-yellow-200",
  D: "bg-orange-50 text-orange-700 border-orange-200",
  F: "bg-red-50 text-red-700 border-red-200",
};

const SCORE_BAR_COLOR: Record<string, string> = {
  efficiency: "bg-blue-500",
  engagement: "bg-purple-500",
  reach: "bg-green-500",
  consistency: "bg-orange-400",
  potential: "bg-pink-500",
};

const ALERT_STYLES = {
  critical: {
    bg: "bg-red-50 border-red-200",
    icon: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
    text: "text-red-700",
  },
  warning: {
    bg: "bg-yellow-50 border-yellow-200",
    icon: <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />,
    text: "text-yellow-700",
  },
  good: {
    bg: "bg-green-50 border-green-200",
    icon: <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />,
    text: "text-green-700",
  },
};

const IMPACT_COLORS = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span className="capitalize">{label}</span>
        <span className="font-medium text-gray-700">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${SCORE_BAR_COLOR[label] || "bg-gray-400"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CampaignScoreCard({ c, index }: { c: CampaignScore; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-400 w-5 shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {c.campaignName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {c.platform} · {c.verdict}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{c.overallScore}</p>
            <p className="text-[10px] text-gray-400">/ 100</p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-sm font-bold border ${GRADE_COLORS[c.grade] || GRADE_COLORS.C}`}
          >
            {c.grade}
          </span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
          {Object.entries(c.scores).map(([k, v]) => (
            <ScoreBar key={k} label={k} value={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function InsightsPanel({
  analysis,
  totalCampaigns,
  sources,
  combinedSpend,
}: {
  analysis: AnalysisResult;
  totalCampaigns: number;
  sources: string[];
  combinedSpend: number;
}) {
  const s = analysis.summary;
  const healthColor =
    s.overallHealthScore >= 70
      ? "text-green-600"
      : s.overallHealthScore >= 40
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="space-y-5">
      {/* Health score + summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start gap-6">
          <div className="text-center shrink-0">
            <p className={`text-5xl font-black ${healthColor}`}>
              {s.overallHealthScore}
            </p>
            <p className="text-xs text-gray-400 mt-1">Health Score</p>
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-gray-800 font-medium">{s.verdict}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700">{s.topPositive}</p>
              </div>
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{s.topNegative}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
              <ArrowUpRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium">
                Urgent: {s.urgentAction}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign scores */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Campaign Scores
        </p>
        <div className="space-y-2">
          {[...analysis.campaignScores]
            .sort((a, b) => b.overallScore - a.overallScore)
            .map((c, i) => (
              <CampaignScoreCard key={c.campaignId} c={c} index={i} />
            ))}
        </div>
      </div>

      {/* Positives & Negatives */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> What's Working
          </p>
          <ul className="space-y-2">
            {analysis.positives.map((p, i) => (
              <li
                key={i}
                className="text-xs text-gray-600 flex items-start gap-2"
              >
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> What Needs Fixing
          </p>
          <ul className="space-y-2">
            {analysis.negatives.map((n, i) => (
              <li
                key={i}
                className="text-xs text-gray-600 flex items-start gap-2"
              >
                <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Metric alerts */}
      {analysis.metricAlerts?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Metric Alerts
          </p>
          <div className="space-y-2">
            {analysis.metricAlerts.map((a, i) => {
              const style = ALERT_STYLES[a.status] || ALERT_STYLES.warning;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${style.bg}`}
                >
                  {style.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${style.text}`}>
                        {a.metric}
                      </span>
                      <span className="text-xs text-gray-500">
                        {a.value} · benchmark: {a.benchmark}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{a.action}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optimization priorities */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" /> Optimization Priorities
        </p>
        <div className="space-y-2">
          {analysis.optimizationPriorities.map((op, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {op.priority}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {op.area}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${IMPACT_COLORS[op.impact]}`}
                  >
                    {op.impact} impact
                  </span>
                </div>
                <p className="text-xs text-gray-600">{op.action}</p>
                <p className="text-xs text-blue-600 mt-1">
                  → {op.expectedOutcome}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics to watch */}
      {analysis.metricsToWatch?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Metrics to Watch
          </p>
          <div className="grid grid-cols-2 gap-3">
            {analysis.metricsToWatch.map((m, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {m.metric}
                </p>
                <p className="text-xs text-gray-500 mt-1">{m.why}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600">
                    Now: {m.currentStatus}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">
                    Target: {m.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform insights */}
      {analysis.platformInsights?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Platform Breakdown
          </p>
          <div className="grid grid-cols-2 gap-4">
            {analysis.platformInsights.map((p, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${p.platform === "google" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}
                  >
                    {p.platform === "google" ? "Google" : "Meta"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {p.campaignCount} campaigns
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <span className="text-gray-400">Spend</span>
                    <p className="font-medium text-gray-800">
                      ₹{p.totalSpend?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Avg CTR</span>
                    <p className="font-medium text-gray-800">
                      {p.avgCtr?.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-blue-600 border-t border-gray-100 pt-2 mt-2">
                  {p.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
