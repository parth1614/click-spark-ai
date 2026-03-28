import { NextResponse } from "next/server";

const GOOGLE_ADS_API = "https://googleads.googleapis.com/v23";

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
  if (data.error)
    throw new Error(`Token error: ${data.error_description || data.error}`);
  return data.access_token;
}

export async function GET() {
  try {
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    const managerId = process.env.GOOGLE_ADS_MANAGER_ID;
    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

    if (!customerId || !devToken || !process.env.GOOGLE_ADS_REFRESH_TOKEN) {
      return NextResponse.json(
        { error: "Google Ads credentials not configured in .env.local" },
        { status: 401 },
      );
    }

    const accessToken = await getAccessToken();

    // Minimal query — only 2 campaigns, only essential fields, no date segmentation
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
      WHERE campaign.status != 'REMOVED'
      ORDER BY metrics.cost_micros DESC
      LIMIT 2
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

    return NextResponse.json({ campaigns, customerId });
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Failed to fetch Google Ads campaigns";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
