// Google Ads API wrapper (placeholder — requires google-ads-api package for production)
// This provides the interface; actual OAuth + API calls need the Google Ads client library

export interface GoogleCampaign {
  id: string;
  name: string;
  status: string;
  channelType: string;
  budget: number;
  startDate?: string;
  endDate?: string;
}

export interface GoogleCampaignMetrics {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averageCpc: number;
  cost: number;
  conversions: number;
  costPerConversion: number;
  conversionRate: number;
}

// In production, these would use the google-ads-api package
// For now, they return mock data or throw if not configured

export async function getGoogleCampaigns(
  customerId: string,
  _refreshToken: string,
): Promise<GoogleCampaign[]> {
  if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    console.warn("Google Ads not configured — returning empty");
    return [];
  }
  // TODO: Implement with google-ads-api client
  return [];
}

export async function getGoogleCampaignMetrics(
  customerId: string,
  _refreshToken: string,
  _since: string,
  _until: string,
): Promise<GoogleCampaignMetrics[]> {
  if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) return [];
  // TODO: Implement with google-ads-api client
  return [];
}
