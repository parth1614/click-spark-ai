"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { SectionHeader, EmptyState } from "@/components/shared";

interface Alert {
  id: string;
  campaign_name: string;
  alert_type: string;
  severity: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const SEVERITY_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  critical: {
    bg: "bg-red-50 border-red-800/40",
    text: "text-red-600",
    dot: "bg-red-500",
  },
  high: {
    bg: "bg-orange-50 border-orange-800/40",
    text: "text-orange-600",
    dot: "bg-orange-500",
  },
  medium: {
    bg: "bg-yellow-50 border-yellow-800/40",
    text: "text-yellow-600",
    dot: "bg-yellow-500",
  },
  low: {
    bg: "bg-blue-50 border-blue-800/40",
    text: "text-blue-600",
    dot: "bg-blue-500",
  },
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  pacing_issue: "Pacing",
  roas_drop: "ROAS Drop",
  cpa_spike: "CPA Spike",
  budget_cap: "Budget Cap",
  policy_violation: "Policy",
  opportunity: "Opportunity",
};

// Demo alerts
const DEMO_ALERTS: Alert[] = [
  {
    id: "1",
    campaign_name: "Display - Awareness",
    alert_type: "roas_drop",
    severity: "high",
    message:
      "ROAS dropped to 1.2x (below 3.0x target). Consider pausing or optimizing creatives.",
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    campaign_name: "Q1 Video Ads",
    alert_type: "opportunity",
    severity: "low",
    message:
      "Campaign hitting daily budget cap by 2 PM. Scaling opportunity — increase budget by 30%.",
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3",
    campaign_name: "Instagram Stories",
    alert_type: "cpa_spike",
    severity: "medium",
    message:
      "CPA increased 40% in the last 3 days ($17.22 vs $12.30 avg). Review audience targeting.",
    is_read: false,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "4",
    campaign_name: "Search - Brand Terms",
    alert_type: "budget_cap",
    severity: "low",
    message:
      "Campaign spent 90% of daily budget. Performance is strong (ROAS 5.1x).",
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "5",
    campaign_name: "Retargeting - Website",
    alert_type: "pacing_issue",
    severity: "medium",
    message:
      "Spending 80% of budget before noon. Adjust ad scheduling or increase budget.",
    is_read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const markRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)),
    );
    fetch(`/api/alerts/${id}/read`, { method: "PATCH" }).catch(console.error);
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  };

  const filtered =
    filter === "unread" ? alerts.filter((a) => !a.is_read) : alerts;
  const unreadCount = alerts.filter((a) => !a.is_read).length;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div>
      <SectionHeader
        icon={<Bell className="w-5 h-5 text-yellow-600" />}
        title="Campaign Alerts"
        description="Real-time alerts for campaign performance issues and opportunities."
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === "all" ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-700"}`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === "unread" ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-700"}`}
          >
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-blue-600 hover:text-blue-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-5 h-5 text-yellow-600" />}
          message={filter === "unread" ? "No unread alerts" : "No alerts yet"}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const style =
              SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.medium;
            return (
              <div
                key={alert.id}
                className={`rounded-lg p-4 border transition-colors ${style.bg} ${alert.is_read ? "opacity-60" : ""}`}
                onClick={() => !alert.is_read && markRead(alert.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !alert.is_read) markRead(alert.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {ALERT_TYPE_LABELS[alert.alert_type] || "Alert"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900 text-sm font-medium">
                        {alert.campaign_name}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider ${style.text} bg-gray-100`}
                      >
                        {alert.severity}
                      </span>
                      {!alert.is_read && (
                        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      )}
                    </div>
                    <p className="text-gray-700 text-sm">{alert.message}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {timeAgo(alert.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
