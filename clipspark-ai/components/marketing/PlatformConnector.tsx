"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  ExternalLink,
  Unplug,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { SectionHeader } from "@/components/shared";

interface ConnectedAccount {
  id: string;
  platform: string;
  account_id: string;
  account_name: string;
  is_active: boolean;
  created_at: string;
}

export default function PlatformConnector() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // Check URL params for OAuth callback results
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      setMessage({
        type: "success",
        text: `Successfully connected ${params.get("success")} Ads!`,
      });
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("error")) {
      const errMap: Record<string, string> = {
        fb_denied: "Facebook connection was denied.",
        fb_token: "Failed to get Facebook access token.",
        fb_no_accounts: "No Facebook Ad Accounts found on this account.",
        fb_error: "Something went wrong connecting Facebook.",
        google_denied: "Google connection was denied.",
        google_token: "Failed to get Google access token.",
        google_error: "Something went wrong connecting Google.",
      };
      setMessage({
        type: "error",
        text: errMap[params.get("error")!] || "Connection failed.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }

    fetchAccounts();
  }, []);

  const fetchAccounts = () => {
    fetch("/api/integrations/accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const disconnect = async (accountId: string) => {
    if (!confirm("Disconnect this account? You can reconnect later.")) return;
    try {
      await fetch(`/api/integrations/${accountId}/disconnect`, {
        method: "DELETE",
      });
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      setMessage({ type: "success", text: "Account disconnected." });
    } catch {
      setMessage({ type: "error", text: "Failed to disconnect." });
    }
  };

  const PLATFORMS = [
    {
      id: "facebook",
      name: "Facebook Ads",
      connectUrl: "/api/integrations/facebook/connect",
      description:
        "Connect your Facebook Ad Account to create and manage campaigns.",
      permissions: ["ads_management", "ads_read", "business_management"],
      color: "blue" as const,
      setupGuide:
        "Create a Facebook App at developers.facebook.com, add 'Marketing API' product, then set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in .env.local",
    },
    {
      id: "google",
      name: "Google Ads",
      connectUrl: "/api/integrations/google/connect",
      description:
        "Connect your Google Ads account for search and display campaigns.",
      permissions: ["Google Ads API access", "Campaign management"],
      color: "green" as const,
      setupGuide:
        "Create OAuth credentials at console.cloud.google.com, enable Google Ads API, then set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local",
    },
  ];

  const connected = (platform: string) =>
    accounts.find((a) => a.platform === platform && a.is_active);

  return (
    <div>
      <SectionHeader
        icon={<Settings className="w-5 h-5 text-gray-600" />}
        title="Platform Integrations"
        description="Connect your ad accounts to create campaigns and track performance."
      />

      {/* Status message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin mr-3" />
          Loading accounts...
        </div>
      ) : (
        <div className="space-y-4">
          {PLATFORMS.map((p) => {
            const acct = connected(p.id);
            return (
              <div
                key={p.id}
                className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-medium text-base">
                      {p.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {p.description}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {p.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    {acct ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          <CheckCircle className="w-3 h-3" /> Connected
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {acct.account_name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          ID: {acct.account_id}
                        </p>
                        <button
                          onClick={() => disconnect(acct.id)}
                          className="mt-2 text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                        >
                          <Unplug className="w-3 h-3" /> Disconnect
                        </button>
                      </div>
                    ) : (
                      <a
                        href={p.connectUrl}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          p.color === "blue"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        <ExternalLink className="w-4 h-4" /> Connect {p.name}
                      </a>
                    )}
                  </div>
                </div>
                {/* Setup guide if not connected */}
                {!acct && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-600">Setup:</span>{" "}
                      {p.setupGuide}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Optimization settings */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Auto-Optimization Settings
        </h3>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900">Auto-rebalance budgets</p>
              <p className="text-xs text-gray-500">
                Automatically shift budget to winning campaigns
              </p>
            </div>
            <button className="w-12 h-6 bg-gray-200 rounded-full relative transition-colors">
              <span className="w-5 h-5 bg-gray-400 rounded-full absolute left-0.5 top-0.5 transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900">
                Auto-pause losing campaigns
              </p>
              <p className="text-xs text-gray-500">
                Pause campaigns with ROAS below 1x after 100+ conversions
              </p>
            </div>
            <button className="w-12 h-6 bg-gray-200 rounded-full relative transition-colors">
              <span className="w-5 h-5 bg-gray-400 rounded-full absolute left-0.5 top-0.5 transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900">Performance alerts</p>
              <p className="text-xs text-gray-500">
                Get notified when campaigns need attention
              </p>
            </div>
            <button className="w-12 h-6 bg-blue-600 rounded-full relative transition-colors">
              <span className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Min ROAS Threshold
              </label>
              <input
                type="number"
                defaultValue="3.0"
                step="0.1"
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Max CPA Threshold ($)
              </label>
              <input
                type="number"
                defaultValue="50"
                step="1"
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm"
              />
            </div>
          </div>
          <button className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
