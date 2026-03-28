"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  AlertCircle,
  TrendingUp,
  MousePointerClick,
  DollarSign,
  BarChart2,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  channelType: string;
  metrics: { impressions: number; clicks: number; spend: number; ctr: string };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; text: string; bg: string }
> = {
  ENABLED: {
    label: "Active",
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-50",
  },
  PAUSED: {
    label: "Paused",
    dot: "bg-yellow-500",
    text: "text-yellow-700",
    bg: "bg-yellow-50",
  },
  REMOVED: {
    label: "Removed",
    dot: "bg-red-400",
    text: "text-red-700",
    bg: "bg-red-50",
  },
};

const CHANNEL_LABELS: Record<string, string> = {
  SEARCH: "Search",
  DISPLAY: "Display",
  SHOPPING: "Shopping",
  VIDEO: "Video",
  SMART: "Smart",
  PERFORMANCE_MAX: "PMax",
};

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className="p-2.5 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function GoogleCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("google_campaigns");
      if (cached) {
        const { campaigns: c, customerId: id, fetchedAt } = JSON.parse(cached);
        setCampaigns(c);
        setCustomerId(id);
        setLastFetched(fetchedAt);
        setFetched(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations/google/campaigns");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      const fetchedAt = new Date().toLocaleString();
      setCampaigns(data.campaigns || []);
      setCustomerId(data.customerId || "");
      setLastFetched(fetchedAt);
      setFetched(true);
      localStorage.setItem(
        "google_campaigns",
        JSON.stringify({
          campaigns: data.campaigns || [],
          customerId: data.customerId || "",
          fetchedAt,
        }),
      );
    } catch (e) {
      setError("Failed to reach Google Ads API");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    localStorage.removeItem("google_campaigns");
    setCampaigns([]);
    setCustomerId("");
    setFetched(false);
    setLastFetched(null);
  };

  const totalSpend = campaigns.reduce((s, c) => s + c.metrics.spend, 0);
  const totalImpressions = campaigns.reduce(
    (s, c) => s + c.metrics.impressions,
    0,
  );
  const totalClicks = campaigns.reduce((s, c) => s + c.metrics.clicks, 0);
  const avgCtr =
    campaigns.length > 0
      ? (
          campaigns.reduce((s, c) => s + parseFloat(c.metrics.ctr), 0) /
          campaigns.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Google Ads</h1>
          <p className="text-sm text-gray-500 mt-1">
            {customerId
              ? `Customer ID: ${customerId}`
              : "Top campaigns by spend"}
            {lastFetched && (
              <span className="ml-3 inline-flex items-center gap-1 text-green-600">
                <Wifi className="w-3 h-3" />
                Cached · {lastFetched}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fetched && (
            <button
              onClick={clearCache}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear cache
            </button>
          )}
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Fetching..." : fetched ? "Refresh" : "Fetch Campaigns"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              Connection Error
            </p>
            <p className="text-xs text-red-600 mt-1 whitespace-pre-line">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Empty / loading */}
      {!fetched && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 bg-gray-100 rounded-2xl mb-4">
            <WifiOff className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No data loaded yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Fetch Campaigns" to pull live data from Google Ads
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">
            Fetching from Google Ads...
          </p>
          <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
        </div>
      )}

      {!loading && fetched && (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard
              icon={<DollarSign className="w-5 h-5 text-blue-600" />}
              label="Total Spend"
              value={`$${totalSpend.toFixed(2)}`}
              sub="All-time"
            />
            <MetricCard
              icon={<BarChart2 className="w-5 h-5 text-purple-600" />}
              label="Impressions"
              value={totalImpressions.toLocaleString()}
              sub="All-time"
            />
            <MetricCard
              icon={<MousePointerClick className="w-5 h-5 text-green-600" />}
              label="Clicks"
              value={totalClicks.toLocaleString()}
              sub="All-time"
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
              label="Avg. CTR"
              value={`${avgCtr}%`}
              sub={`${campaigns.length} campaigns`}
            />
          </div>

          {/* Campaign cards */}
          <div className="space-y-3">
            {campaigns.map((c) => {
              const st = STATUS_CONFIG[c.status] || {
                label: c.status,
                dot: "bg-gray-400",
                text: "text-gray-600",
                bg: "bg-gray-50",
              };
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Campaign header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          ID: {c.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {CHANNEL_LABELS[c.channelType] || c.channelType}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>
                  {/* Metrics row */}
                  <div className="grid grid-cols-4 divide-x divide-gray-100">
                    {[
                      {
                        label: "Spend",
                        value: `$${c.metrics.spend.toFixed(2)}`,
                        highlight: true,
                      },
                      {
                        label: "Impressions",
                        value: c.metrics.impressions.toLocaleString(),
                      },
                      {
                        label: "Clicks",
                        value: c.metrics.clicks.toLocaleString(),
                      },
                      { label: "CTR", value: `${c.metrics.ctr}%` },
                    ].map((m) => (
                      <div key={m.label} className="px-5 py-4">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                          {m.label}
                        </p>
                        <p
                          className={`text-xl font-bold mt-1 ${m.highlight ? "text-blue-600" : "text-gray-900"}`}
                        >
                          {m.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Showing top {campaigns.length} campaigns by spend · All-time data ·
            Expand limit in API to load more
          </p>
        </>
      )}
    </div>
  );
}
