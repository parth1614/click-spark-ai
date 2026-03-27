"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { SectionHeader, EmptyState, GenerateButton } from "@/components/shared";

interface MetricCard {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

interface CampaignRow {
  id: string;
  name: string;
  platform: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
  roas: number;
}

// Demo data for the analytics dashboard
const DEMO_METRICS: MetricCard[] = [
  { label: "Total Spend", value: "$12,450", change: "+8.2%", positive: false },
  {
    label: "Total Conversions",
    value: "1,284",
    change: "+23.5%",
    positive: true,
  },
  { label: "Avg. ROAS", value: "3.8x", change: "+12.1%", positive: true },
  { label: "Avg. CPA", value: "$9.70", change: "-15.3%", positive: true },
];

const DEMO_CAMPAIGNS: CampaignRow[] = [
  {
    id: "1",
    name: "Q1 Video Ads",
    platform: "facebook",
    status: "active",
    spend: 4200,
    impressions: 285000,
    clicks: 8500,
    ctr: 2.98,
    conversions: 520,
    cpa: 8.08,
    roas: 4.2,
  },
  {
    id: "2",
    name: "Search - Brand Terms",
    platform: "google",
    status: "active",
    spend: 2800,
    impressions: 45000,
    clicks: 6200,
    ctr: 13.78,
    conversions: 380,
    cpa: 7.37,
    roas: 5.1,
  },
  {
    id: "3",
    name: "Retargeting - Website",
    platform: "facebook",
    status: "active",
    spend: 1800,
    impressions: 120000,
    clicks: 3600,
    ctr: 3.0,
    conversions: 210,
    cpa: 8.57,
    roas: 3.9,
  },
  {
    id: "4",
    name: "Display - Awareness",
    platform: "google",
    status: "paused",
    spend: 2100,
    impressions: 520000,
    clicks: 2600,
    ctr: 0.5,
    conversions: 84,
    cpa: 25.0,
    roas: 1.2,
  },
  {
    id: "5",
    name: "Instagram Stories",
    platform: "facebook",
    status: "active",
    spend: 1550,
    impressions: 195000,
    clicks: 4800,
    ctr: 2.46,
    conversions: 90,
    cpa: 17.22,
    roas: 2.1,
  },
];

export default function PerformanceAnalytics() {
  const [dateRange, setDateRange] = useState("30d");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [campaigns] = useState<CampaignRow[]>(DEMO_CAMPAIGNS);
  const [metrics] = useState<MetricCard[]>(DEMO_METRICS);

  const filtered = campaigns.filter(
    (c) => platformFilter === "all" || c.platform === platformFilter,
  );

  return (
    <div>
      <SectionHeader
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        title="Performance Analytics"
        description="Track campaign performance across Facebook and Google with real-time metrics."
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="14d">Last 14 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
        >
          <option value="all">All Platforms</option>
          <option value="facebook">Facebook</option>
          <option value="google">Google</option>
        </select>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <p className="text-xs text-gray-500">{m.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{m.value}</p>
            {m.change && (
              <p
                className={`text-xs mt-1 ${m.positive ? "text-green-600" : "text-red-600"}`}
              >
                {m.change} vs prev period
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Spend distribution bar */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Spend Distribution
        </h3>
        <div className="flex rounded-lg overflow-hidden h-8">
          <div
            className="bg-blue-600 flex items-center justify-center text-xs text-white"
            style={{ width: "60%" }}
          >
            Facebook 60%
          </div>
          <div
            className="bg-green-600 flex items-center justify-center text-xs text-white"
            style={{ width: "40%" }}
          >
            Google 40%
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>$7,550 on Facebook</span>
          <span>$4,900 on Google</span>
        </div>
      </div>

      {/* Campaign performance table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          message="No campaign data for the selected filters"
        />
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs">
                <th className="text-left p-3">Campaign</th>
                <th className="text-left p-3">Platform</th>
                <th className="text-right p-3">Spend</th>
                <th className="text-right p-3">Impr.</th>
                <th className="text-right p-3">Clicks</th>
                <th className="text-right p-3">CTR</th>
                <th className="text-right p-3">Conv.</th>
                <th className="text-right p-3">CPA</th>
                <th className="text-right p-3">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-200/50 hover:bg-gray-100/30"
                >
                  <td className="p-3">
                    <span className="text-gray-900">{c.name}</span>
                    <span
                      className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${c.status === "active" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 capitalize text-gray-600">{c.platform}</td>
                  <td className="p-3 text-right text-gray-700">
                    ${c.spend.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {c.impressions.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-gray-700">
                    {c.clicks.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-gray-700">
                    {c.ctr.toFixed(2)}%
                  </td>
                  <td className="p-3 text-right text-gray-900 font-medium">
                    {c.conversions}
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={c.cpa < 15 ? "text-green-600" : "text-red-600"}
                    >
                      ${c.cpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={
                        c.roas >= 3
                          ? "text-green-600 font-medium"
                          : c.roas >= 2
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {c.roas.toFixed(1)}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
