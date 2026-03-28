"use client";

import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { SectionHeader, EmptyState, GenerateButton } from "@/components/shared";

interface CampaignMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  cpc: number;
  cpm: number;
  ctr: number;
  reach: number;
  frequency: number;
}

interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  dailyBudget: number | null;
  lifetimeBudget: number | null;
  startTime: string | null;
  stopTime: string | null;
  createdTime: string;
  metrics: CampaignMetrics | null;
}

interface AccountInfo {
  id: string;
  name: string;
  currency: string;
  status: number;
}

interface Totals {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalReach: number;
  campaignCount: number;
  activeCampaigns: number;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  PAUSED: "bg-yellow-50 text-yellow-700",
  DELETED: "bg-red-50 text-red-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

export default function MetaCampaigns() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [dateRange, setDateRange] = useState<{
    since: string;
    until: string;
  } | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState("30");

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ days });
      if (selectedAccount) params.set("account", selectedAccount);
      const res = await fetch(`/api/integrations/facebook/campaigns?${params}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error + (data.help ? "\n\n" + data.help : ""));
        return;
      }
      setAccount(data.account);
      setCampaigns(data.campaigns);
      setTotals(data.totals);
      setDateRange(data.dateRange);
      if (data.availableAccounts) setAvailableAccounts(data.availableAccounts);
    } catch (e) {
      setError("Failed to connect to Meta API");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={<RefreshCw className="w-5 h-5 text-blue-600" />}
        title="Meta Ad Campaigns"
        description={`Live data from your Meta Ad Account${account ? ` — ${account.name} (${account.currency})` : ""}`}
      />

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {availableAccounts.length > 1 && (
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
          >
            <option value="">Primary Account</option>
            {availableAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} ({a.id})
              </option>
            ))}
          </select>
        )}
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="60">Last 60 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <GenerateButton
          onClick={fetchCampaigns}
          loading={loading}
          label="Fetch Campaigns"
          loadingLabel="Fetching from Meta..."
        />
        {dateRange && (
          <span className="text-xs text-gray-500">
            {dateRange.since} → {dateRange.until}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 font-medium">
                Connection Error
              </p>
              <p className="text-xs text-red-600 mt-1 whitespace-pre-line">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && campaigns.length === 0 && !error && (
        <EmptyState
          icon={<RefreshCw className="w-10 h-10 text-gray-400" />}
          message="Click 'Fetch Campaigns' to load your Meta Ad Account data"
        />
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
          Fetching campaigns from Meta...
        </div>
      )}

      {/* Results */}
      {!loading && totals && campaigns.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500">Total Spend</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totals.totalSpend.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500">Impressions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totals.totalImpressions.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500">Clicks</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totals.totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500">Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totals.activeCampaigns}{" "}
                <span className="text-sm font-normal text-gray-500">
                  / {totals.campaignCount}
                </span>
              </p>
            </div>
          </div>

          {/* Campaign table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-xs">
                  <th className="text-left p-3">Campaign</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Objective</th>
                  <th className="text-right p-3">Budget</th>
                  <th className="text-right p-3">Spend</th>
                  <th className="text-right p-3">Impr.</th>
                  <th className="text-right p-3">Clicks</th>
                  <th className="text-right p-3">CTR</th>
                  <th className="text-right p-3">CPC</th>
                  <th className="text-right p-3">Reach</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <p className="text-gray-900 font-medium">{c.name}</p>
                      <p className="text-[10px] text-gray-400">ID: {c.id}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${STATUS_STYLES[c.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 text-xs">
                      {c.objective?.replace("OUTCOME_", "")}
                    </td>
                    <td className="p-3 text-right text-gray-700">
                      {c.dailyBudget
                        ? `$${c.dailyBudget}/day`
                        : c.lifetimeBudget
                          ? `$${c.lifetimeBudget}`
                          : "—"}
                    </td>
                    <td className="p-3 text-right text-gray-900 font-medium">
                      {c.metrics ? `$${c.metrics.spend.toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      {c.metrics ? c.metrics.impressions.toLocaleString() : "—"}
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      {c.metrics ? c.metrics.clicks.toLocaleString() : "—"}
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      {c.metrics ? `${c.metrics.ctr.toFixed(2)}%` : "—"}
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      {c.metrics ? `$${c.metrics.cpc.toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      {c.metrics ? c.metrics.reach.toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
