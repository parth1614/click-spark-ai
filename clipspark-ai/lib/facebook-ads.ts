// Facebook Marketing API wrapper
const FB_API_VERSION = "v18.0";
const FB_API_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;

async function fbApi<T>(
  endpoint: string,
  token: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${FB_API_BASE}${endpoint}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `FB API ${res.status}`);
  }
  return res.json();
}

export async function getAdAccount(accountId: string, token: string) {
  return fbApi<{
    id: string;
    account_id: string;
    name: string;
    currency: string;
  }>(`/act_${accountId}`, token, { fields: "id,account_id,name,currency" });
}

export async function getAllCampaigns(
  accountId: string,
  token: string,
  statusFilter?: string[],
) {
  const params: Record<string, string> = {
    fields:
      "id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time",
    limit: "100",
  };
  if (statusFilter?.length) {
    params.filtering = JSON.stringify([
      { field: "status", operator: "IN", value: statusFilter },
    ]);
  }
  const data = await fbApi<{ data: Array<Record<string, string>> }>(
    `/act_${accountId}/campaigns`,
    token,
    params,
  );
  return data.data.map((c) => ({
    id: c.id,
    name: c.name,
    objective: c.objective,
    status: c.status,
    dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
    lifetimeBudget: c.lifetime_budget
      ? parseFloat(c.lifetime_budget) / 100
      : null,
    startTime: c.start_time,
    stopTime: c.stop_time,
  }));
}

export async function getCampaignInsights(
  accountId: string,
  token: string,
  since: string,
  until: string,
) {
  const data = await fbApi<{ data: Array<Record<string, string>> }>(
    `/act_${accountId}/insights`,
    token,
    {
      fields:
        "campaign_id,campaign_name,impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions",
      level: "campaign",
      time_range: JSON.stringify({ since, until }),
      limit: "100",
    },
  );
  return data.data.map((i) => ({
    campaignId: i.campaign_id,
    campaignName: i.campaign_name,
    impressions: parseInt(i.impressions || "0"),
    clicks: parseInt(i.clicks || "0"),
    spend: parseFloat(i.spend || "0"),
    cpc: parseFloat(i.cpc || "0"),
    cpm: parseFloat(i.cpm || "0"),
    ctr: parseFloat(i.ctr || "0"),
    reach: parseInt(i.reach || "0"),
    frequency: parseFloat(i.frequency || "0"),
  }));
}
