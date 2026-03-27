// ---- Ad Accounts ----
export type AdPlatform = "facebook" | "google";

export interface AdAccount {
  id: string;
  user_id: string;
  platform: AdPlatform;
  account_id: string;
  account_name: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  is_active: boolean;
  created_at: string;
}

// ---- Ad Creatives ----
export type AdObjective = "awareness" | "consideration" | "conversion";
export type AdFormat =
  | "single_image"
  | "video"
  | "carousel"
  | "story"
  | "responsive_display"
  | "responsive_search";

export interface AdCreative {
  id: string;
  platform: AdPlatform | "google_display" | "google_search";
  creativeType: AdFormat;
  primaryText: string;
  headline: string;
  description: string;
  cta: string;
  mediaUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface AdCreativeSet {
  platform: string;
  objective: AdObjective;
  creatives: AdCreative[];
}

// ---- Campaigns ----
export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "failed";

export interface Campaign {
  id: string;
  platform: AdPlatform;
  platform_campaign_id?: string;
  campaign_name: string;
  objective: string;
  status: CampaignStatus;
  daily_budget?: number;
  lifetime_budget?: number;
  start_date?: string;
  end_date?: string;
  targeting?: CampaignTargeting;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CampaignTargeting {
  ageMin?: number;
  ageMax?: number;
  genders?: string[];
  locations?: string[];
  interests?: string[];
  customAudiences?: string[];
}

// ---- Campaign Metrics ----
export interface CampaignMetrics {
  campaign_id: string;
  campaign_name?: string;
  platform?: AdPlatform;
  date?: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  roas?: number;
  reach?: number;
  frequency?: number;
}

export interface CampaignWithMetrics extends Campaign {
  metrics?: CampaignMetrics;
}

// ---- Optimization ----
export interface OptimizationRecommendation {
  campaignId: string;
  campaignName: string;
  currentBudget: number;
  recommendedBudget: number;
  recommendedAction: "scale_up" | "reduce" | "pause" | "maintain";
  reason: string;
  roas?: number;
  cpa?: number;
}

export interface OptimizationResult {
  winningCampaigns: OptimizationRecommendation[];
  losingCampaigns: OptimizationRecommendation[];
  budgetReallocation: {
    totalCurrentBudget: number;
    totalRecommendedBudget: number;
    changes: Array<{ from: string; to: string; amount: number }>;
  };
  projectedImpact: {
    currentRoas: number;
    projectedRoas: number;
    improvement: string;
  };
}

// ---- Alerts ----
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertType =
  | "pacing_issue"
  | "roas_drop"
  | "cpa_spike"
  | "budget_cap"
  | "policy_violation"
  | "opportunity";

export interface CampaignAlert {
  id: string;
  campaign_id: string;
  campaign_name?: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  is_read: boolean;
  created_at: string;
}
