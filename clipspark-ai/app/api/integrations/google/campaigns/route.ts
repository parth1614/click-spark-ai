import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const GOOGLE_ADS_API = "https://googleads.googleapis.com/v23";

const ACCOUNTS: Record<string, { label: string; customerId: string }> = {
  default: {
    label: "Default",
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID || "",
  },
  tradewise: {
    label: "Tradewise",
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID_TRADEWISE || "",
  },
  astrolearn: {
    label: "Astrolearn",
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID_ASTROLEARN || "",
  },
};

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN || "",
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  console.log("Token exchange response:", JSON.stringify(data));
  if (data.error)
    throw new Error(`Token error: ${data.error} — ${data.error_description}`);
  if (!data.access_token)
    throw new Error(`No access_token in response: ${JSON.stringify(data)}`);
  return data.access_token;
}

export async function GET(req: NextRequest) {
  try {
    const accountKey = req.nextUrl.searchParams.get("account") || "default";
    const account = ACCOUNTS[accountKey] || ACCOUNTS.default;
    const customerId = account.customerId;
    const managerId = process.env.GOOGLE_ADS_MANAGER_ID;
    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

    if (!customerId || !devToken || !process.env.GOOGLE_ADS_REFRESH_TOKEN) {
      return NextResponse.json(
        { error: "Google Ads credentials not configured in .env" },
        { status: 401 },
      );
    }

    const availableAccounts = Object.entries(ACCOUNTS)
      .filter(([, v]) => v.customerId)
      .map(([key, v]) => ({
        id: key,
        label: v.label,
        customerId: v.customerId,
      }));

    const accessToken = await getAccessToken();

    // Fetch active (ENABLED) campaigns only, ordered by spend
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.ctr
      FROM campaign
      WHERE campaign.status = 'ENABLED'
      ORDER BY metrics.cost_micros DESC
      LIMIT 50
    `;

    const res = await fetch(
      `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:searchStream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": devToken,
          "login-customer-id": managerId || customerId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      },
    );

    const raw = await res.json();

    if (!res.ok) {
      const errMsg =
        raw?.error?.message || raw?.[0]?.error?.message || JSON.stringify(raw);
      return NextResponse.json({ error: errMsg }, { status: res.status });
    }

    // searchStream returns an array of result batches
    const rows: Array<Record<string, unknown>> = [];
    if (Array.isArray(raw)) {
      for (const batch of raw) {
        const results = (batch as Record<string, unknown>).results;
        if (Array.isArray(results)) rows.push(...results);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaigns = rows.map((row: any) => ({
      id: row.campaign?.id,
      name: row.campaign?.name,
      status: row.campaign?.status,
      channelType: row.campaign?.advertisingChannelType,
      metrics: {
        impressions: Number(row.metrics?.impressions || 0),
        clicks: Number(row.metrics?.clicks || 0),
        spend: Number(row.metrics?.costMicros || 0) / 1_000_000,
        ctr: (Number(row.metrics?.ctr || 0) * 100).toFixed(2),
      },
    }));

    // Upsert to DB
    if (campaigns.length > 0) {
      const rows_to_upsert = campaigns.map((c) => ({
        platform: "google",
        account_key: accountKey,
        campaign_id: String(c.id),
        campaign_name: c.name,
        status: c.status,
        channel_type: c.channelType,
        impressions: c.metrics.impressions,
        clicks: c.metrics.clicks,
        spend: c.metrics.spend,
        ctr: parseFloat(c.metrics.ctr),
        raw_metrics: c.metrics,
        fetched_at: new Date().toISOString(),
      }));
      await supabase
        .from("ad_campaigns_cache")
        .upsert(rows_to_upsert, { onConflict: "platform,campaign_id" });
    }

    return NextResponse.json({
      campaigns,
      customerId,
      accountLabel: account.label,
      availableAccounts,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Failed to fetch Google Ads campaigns";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
