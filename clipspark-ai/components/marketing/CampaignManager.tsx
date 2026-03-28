"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { SectionHeader, EmptyState, GenerateButton } from "@/components/shared";

type CampaignStatus = "draft" | "active" | "paused" | "completed";

interface Campaign {
  id: string;
  campaign_name: string;
  platform: string;
  objective: string;
  status: CampaignStatus;
  daily_budget: number | null;
  lifetime_budget: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-200 text-gray-700",
  active: "bg-green-50 text-green-600",
  paused: "bg-yellow-50 text-yellow-600",
  completed: "bg-blue-50 text-blue-600",
  failed: "bg-red-50 text-red-600",
};

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    campaignName: "",
    platform: "facebook",
    objective: "traffic",
    dailyBudget: "",
    startDate: "",
    endDate: "",
  });
  const [creating, setCreating] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns/all");
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!form.campaignName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: form.campaignName,
          platform: form.platform,
          objective: form.objective,
          dailyBudget: form.dailyBudget ? parseFloat(form.dailyBudget) : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      });
      const data = await res.json();
      if (data.campaign) {
        setCampaigns((prev) => [data.campaign, ...prev]);
        setShowCreate(false);
        setForm({
          campaignName: "",
          platform: "facebook",
          objective: "traffic",
          dailyBudget: "",
          startDate: "",
          endDate: "",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "active" ? "paused" : "active";
    try {
      await fetch(`/api/campaigns/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: next as CampaignStatus } : c,
        ),
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
        title="Campaign Manager"
        description="Create, manage, and monitor your ad campaigns across Facebook and Google."
      />

      <div className="flex gap-3 mb-6">
        <GenerateButton
          onClick={fetchCampaigns}
          loading={loading}
          label="Load Campaigns"
          loadingLabel="Loading..."
        />
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          + New Campaign
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Create Campaign</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.campaignName}
              onChange={(e) =>
                setForm({ ...form, campaignName: e.target.value })
              }
              placeholder="Campaign name"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
            >
              <option value="facebook">Facebook</option>
              <option value="google">Google</option>
            </select>
            <select
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
            >
              <option value="traffic">Traffic</option>
              <option value="conversions">Conversions</option>
              <option value="awareness">Brand Awareness</option>
              <option value="engagement">Engagement</option>
              <option value="leads">Lead Generation</option>
            </select>
            <input
              type="number"
              value={form.dailyBudget}
              onChange={(e) =>
                setForm({ ...form, dailyBudget: e.target.value })
              }
              placeholder="Daily budget ($)"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
            />
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <GenerateButton
              onClick={createCampaign}
              loading={creating}
              label="Create Campaign"
            />
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campaign table */}
      {campaigns.length === 0 && !loading && (
        <EmptyState
          icon={<BarChart3 className="w-10 h-10 text-gray-500" />}
          message="No campaigns yet. Create one or load from connected accounts."
        />
      )}
      {campaigns.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs">
                <th className="text-left p-3">Campaign</th>
                <th className="text-left p-3">Platform</th>
                <th className="text-left p-3">Objective</th>
                <th className="text-left p-3">Budget</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-200/50 hover:bg-gray-100/30"
                >
                  <td className="p-3 text-gray-900">{c.campaign_name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-white text-gray-700 rounded text-xs capitalize">
                      {c.platform}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 capitalize">
                    {c.objective}
                  </td>
                  <td className="p-3 text-gray-700">
                    {c.daily_budget
                      ? `₹${c.daily_budget}/day`
                      : c.lifetime_budget
                        ? `₹${c.lifetime_budget} total`
                        : "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs capitalize ${STATUS_COLORS[c.status] || ""}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(c.id, c.status)}
                      className="text-xs text-blue-600 hover:text-blue-300 mr-3"
                    >
                      {c.status === "active" ? "Pause" : "Activate"}
                    </button>
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
