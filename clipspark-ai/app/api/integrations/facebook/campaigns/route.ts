import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const FB_API = "https://graph.facebook.com/v18.0";

async function fbGet<T>(
  path: string,
  token: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${FB_API}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

// Available accounts from env
function getAccounts(): Array<{ id: string; label: string }> {
  const accounts: Array<{ id: string; label: string }> = [];
  const primary = process.env.FACEBOOK_AD_ACCOUNT_ID;
  if (primary) accounts.push({ id: primary, label: "Primary" });

  const extras: Record<string, string> = {
    FACEBOOK_AD_ACCOUNT_TRADEWISE: "Tradewise",
    FACEBOOK_AD_ACCOUNT_ASTROLEARN: "AstroLearn",
    FACEBOOK_AD_ACCOUNT_ASTROLEARN_OLD: "AstroLearn (Old)",
    FACEBOOK_AD_ACCOUNT_HEALOVED: "Healoved",
  };
  for (const [envKey, label] of Object.entries(extras)) {
    const val = process.env[envKey];
    if (val && val !== primary) accounts.push({ id: val, label });
  }
  return accounts;
}

export async function GET(req: NextRequest) {
  try {
    const token = process.env.FACEBOOK_ACCESS_TOKEN || "";
    if (!token || token === "your_access_token_here") {
      return NextResponse.json(
        {
          error: "No Facebook access token configured.",
          help: "Set FACEBOOK_ACCESS_TOKEN in .env.local",
        },
        { status: 401 },
      );
    }

    // Allow selecting account via query param, default to primary
    const accountId =
      req.nextUrl.searchParams.get("account") ||
      process.env.FACEBOOK_AD_ACCOUNT_ID;
    if (!accountId) {
      return NextResponse.json(
        { error: "No ad account ID configured" },
        { status: 500 },
      );
    }

    const sinceDays = parseInt(req.nextUrl.searchParams.get("days") || "30");
    const since = new Date(Date.now() - sinceDays * 86400000)
      .toISOString()
      .split("T")[0];
    const until = new Date().toISOString().split("T")[0];

    // Fetch account info
    const account = await fbGet<Record<string, string | number>>(
      `/act_${accountId}`,
      token,
      { fields: "id,name,currency,account_status,amount_spent" },
    );

    // Fetch campaigns
    const campaignsData = await fbGet<{ data: Array<Record<string, string>> }>(
      `/act_${accountId}/campaigns`,
      token,
      {
        fields:
          "id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time,effective_status",
        limit: "100",
      },
    );

    // Fetch insights
    let insights: Array<Record<string, string>> = [];
    try {
      const insightsData = await fbGet<{ data: Array<Record<string, string>> }>(
        `/act_${accountId}/insights`,
        token,
        {
          fields:
            "campaign_id,campaign_name,impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions,cost_per_action_type",
          level: "campaign",
          time_range: JSON.stringify({ since, until }),
          limit: "100",
        },
      );
      insights = insightsData.data || [];
    } catch (e) {
      console.warn("Could not fetch insights:", e);
    }

    const insightsMap = new Map(insights.map((i) => [i.campaign_id, i]));

    const campaigns = (campaignsData.data || []).map((c) => {
      const ins = insightsMap.get(c.id);
      return {
        id: c.id,
        name: c.name,
        objective: c.objective,
        status: c.status,
        effectiveStatus: c.effective_status,
        dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
        lifetimeBudget: c.lifetime_budget
          ? parseFloat(c.lifetime_budget) / 100
          : null,
        startTime: c.start_time,
        stopTime: c.stop_time,
        createdTime: c.created_time,
        metrics: ins
          ? {
              impressions: parseInt(ins.impressions || "0"),
              clicks: parseInt(ins.clicks || "0"),
              spend: parseFloat(ins.spend || "0"),
              cpc: parseFloat(ins.cpc || "0"),
              cpm: parseFloat(ins.cpm || "0"),
              ctr: parseFloat(ins.ctr || "0"),
              reach: parseInt(ins.reach || "0"),
              frequency: parseFloat(ins.frequency || "0"),
            }
          : null,
      };
    });

    const totals = {
      totalSpend: campaigns.reduce((s, c) => s + (c.metrics?.spend || 0), 0),
      totalImpressions: campaigns.reduce(
        (s, c) => s + (c.metrics?.impressions || 0),
        0,
      ),
      totalClicks: campaigns.reduce((s, c) => s + (c.metrics?.clicks || 0), 0),
      totalReach: campaigns.reduce((s, c) => s + (c.metrics?.reach || 0), 0),
      campaignCount: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === "ACTIVE").length,
    };

    // Upsert to DB
    if (campaigns.length > 0) {
      const rows_to_upsert = campaigns.map((c) => ({
        platform: "facebook",
        account_key: accountId,
        campaign_id: c.id,
        campaign_name: c.name,
        status: c.status,
        objective: c.objective,
        daily_budget: c.dailyBudget,
        lifetime_budget: c.lifetimeBudget,
        impressions: c.metrics?.impressions ?? 0,
        clicks: c.metrics?.clicks ?? 0,
        spend: c.metrics?.spend ?? 0,
        ctr: c.metrics?.ctr ?? 0,
        cpc: c.metrics?.cpc ?? null,
        cpm: c.metrics?.cpm ?? null,
        reach: c.metrics?.reach ?? null,
        frequency: c.metrics?.frequency ?? null,
        raw_metrics: c.metrics,
        fetched_at: new Date().toISOString(),
      }));
      await supabase
        .from("ad_campaigns_cache")
        .upsert(rows_to_upsert, { onConflict: "platform,campaign_id" });
    }

    return NextResponse.json({
      account: {
        id: account.id,
        name: account.name || `Account ${accountId}`,
        currency: account.currency || "USD",
        status: account.account_status,
        amountSpent: account.amount_spent,
      },
      campaigns,
      totals,
      dateRange: { since, until },
      availableAccounts: getAccounts(),
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to fetch Meta campaigns";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
