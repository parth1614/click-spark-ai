"use client";

import { useState } from "react";
import { Brain, Trophy, AlertTriangle, Wallet } from "lucide-react";
import { SectionHeader, EmptyState, GenerateButton } from "@/components/shared";
import type { OptimizationResult } from "@/types/marketing";

// Demo campaign data for the optimizer
const DEMO_CAMPAIGNS = [
  {
    campaign_id: "1",
    campaign_name: "Q1 Video Ads",
    platform: "facebook",
    spend: 4200,
    conversions: 520,
    impressions: 285000,
    clicks: 8500,
    ctr: 2.98,
    cpc: 0.49,
    cpa: 8.08,
    roas: 4.2,
  },
  {
    campaign_id: "2",
    campaign_name: "Search - Brand Terms",
    platform: "google",
    spend: 2800,
    conversions: 380,
    impressions: 45000,
    clicks: 6200,
    ctr: 13.78,
    cpc: 0.45,
    cpa: 7.37,
    roas: 5.1,
  },
  {
    campaign_id: "3",
    campaign_name: "Retargeting - Website",
    platform: "facebook",
    spend: 1800,
    conversions: 210,
    impressions: 120000,
    clicks: 3600,
    ctr: 3.0,
    cpc: 0.5,
    cpa: 8.57,
    roas: 3.9,
  },
  {
    campaign_id: "4",
    campaign_name: "Display - Awareness",
    platform: "google",
    spend: 2100,
    conversions: 84,
    impressions: 520000,
    clicks: 2600,
    ctr: 0.5,
    cpc: 0.81,
    cpa: 25.0,
    roas: 1.2,
  },
  {
    campaign_id: "5",
    campaign_name: "Instagram Stories",
    platform: "facebook",
    spend: 1550,
    conversions: 90,
    impressions: 195000,
    clicks: 4800,
    ctr: 2.46,
    cpc: 0.32,
    cpa: 17.22,
    roas: 2.1,
  },
];

export default function OptimizationPanel() {
  const [targetRoas, setTargetRoas] = useState("3");
  const [targetCpa, setTargetCpa] = useState("15");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const totalBudget = DEMO_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
      const res = await fetch("/api/campaigns/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaigns: DEMO_CAMPAIGNS,
          targetRoas: parseFloat(targetRoas),
          targetCpa: parseFloat(targetCpa),
          totalBudget,
        }),
      });
      const data = await res.json();
      if (data.recommendations) setResult(data.recommendations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={<Brain className="w-5 h-5 text-yellow-600" />}
        title="AI Campaign Optimizer"
        description="AI analyzes your campaigns and recommends budget reallocation to maximize ROAS."
      />

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Target ROAS
            </label>
            <input
              type="number"
              step="0.1"
              value={targetRoas}
              onChange={(e) => setTargetRoas(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Target CPA ($)
            </label>
            <input
              type="number"
              step="1"
              value={targetCpa}
              onChange={(e) => setTargetCpa(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
            />
          </div>
        </div>
        <GenerateButton
          onClick={analyze}
          loading={loading}
          label="Analyze & Optimize"
          loadingLabel="AI is analyzing..."
        />
      </div>

      {!result && !loading && (
        <EmptyState
          icon={<Brain className="w-5 h-5 text-yellow-600" />}
          message="Set your targets and run the AI optimizer"
        />
      )}
      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-600">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mr-3" />
          AI is analyzing 5 campaigns...
        </div>
      )}

      {!loading && result && (
        <div className="space-y-6">
          {/* Projected impact */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border border-green-800/30">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Projected Impact
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Current ROAS</p>
                <p className="text-xl font-semibold text-gray-900">
                  {result.projectedImpact.currentRoas.toFixed(1)}x
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Projected ROAS</p>
                <p className="text-xl font-semibold text-green-600">
                  {result.projectedImpact.projectedRoas.toFixed(1)}x
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Improvement</p>
                <p className="text-xl font-semibold text-green-600">
                  {result.projectedImpact.improvement}
                </p>
              </div>
            </div>
          </div>

          {/* Winners */}
          {result.winningCampaigns.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-green-600 mb-3 flex items-center gap-2">
                Winning Campaigns — Scale Up
              </h3>
              <div className="space-y-3">
                {result.winningCampaigns.map((c, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-lg p-4 border border-green-800/30"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 font-medium">
                          {c.campaignName}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">{c.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Budget Change</p>
                        <p className="text-green-600 font-medium">
                          ${c.currentBudget} → ${c.recommendedBudget}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Losers */}
          {result.losingCampaigns.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
                Underperforming — Action Needed
              </h3>
              <div className="space-y-3">
                {result.losingCampaigns.map((c, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-lg p-4 border border-red-800/30"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 font-medium">
                          {c.campaignName}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">{c.reason}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          c.recommendedAction === "pause"
                            ? "bg-red-50 text-red-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {c.recommendedAction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget reallocation */}
          {result.budgetReallocation.changes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-blue-600 mb-3">
                Budget Reallocation
              </h3>
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-xs">
                      <th className="text-left p-3">From</th>
                      <th className="text-left p-3">To</th>
                      <th className="text-right p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.budgetReallocation.changes.map((ch, i) => (
                      <tr key={i} className="border-b border-gray-200/50">
                        <td className="p-3 text-red-600">{ch.from}</td>
                        <td className="p-3 text-green-600">{ch.to}</td>
                        <td className="p-3 text-right text-gray-900 font-medium">
                          ${ch.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="mt-3 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Apply All Recommendations
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
