import { chatCompletion } from "@/lib/openrouter";

export interface CampaignInput {
  id: string;
  name: string;
  platform: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions?: number;
  cpa?: number;
  roas?: number;
}

export interface CampaignScore {
  campaignId: string;
  campaignName: string;
  platform: string;
  overallScore: number; // 0-100
  scores: {
    efficiency: number; // spend vs results
    engagement: number; // CTR quality
    reach: number; // impressions scale
    consistency: number; // status & activity
    potential: number; // growth headroom
  };
  grade: "A" | "B" | "C" | "D" | "F";
  verdict: string; // one-line summary
}

export interface MetricAlert {
  metric: string;
  status: "critical" | "warning" | "good";
  value: string;
  benchmark: string;
  action: string;
}

export interface PlatformInsight {
  platform: string;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  campaignCount: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface AnalysisResult {
  summary: {
    overallHealthScore: number; // 0-100
    verdict: string;
    topPositive: string;
    topNegative: string;
    urgentAction: string;
  };
  campaignScores: CampaignScore[];
  metricAlerts: MetricAlert[];
  platformInsights: PlatformInsight[];
  positives: string[];
  negatives: string[];
  optimizationPriorities: Array<{
    priority: number;
    area: string;
    impact: "high" | "medium" | "low";
    action: string;
    expectedOutcome: string;
  }>;
  metricsToWatch: Array<{
    metric: string;
    why: string;
    currentStatus: string;
    target: string;
  }>;
}

interface AnalyzerInput {
  campaigns: CampaignInput[];
  targetRoas?: number;
  targetCpa?: number;
  totalBudget?: number;
}

export async function analyzeCampaignPerformance(
  input: AnalyzerInput,
): Promise<AnalysisResult> {
  const totalSpend = input.campaigns.reduce((s, c) => s + c.spend, 0);
  const totalClicks = input.campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalImpressions = input.campaigns.reduce(
    (s, c) => s + c.impressions,
    0,
  );
  const avgCtr =
    totalClicks > 0 && totalImpressions > 0
      ? (totalClicks / totalImpressions) * 100
      : 0;

  const prompt = `You are a senior performance marketing analyst. Analyze these ad campaigns and return a comprehensive structured analysis.

CAMPAIGN DATA:
${JSON.stringify(input.campaigns, null, 2)}

AGGREGATE STATS:
- Total Spend: ₹${totalSpend.toFixed(2)}
- Total Impressions: ${totalImpressions.toLocaleString()}
- Total Clicks: ${totalClicks.toLocaleString()}
- Avg CTR: ${avgCtr.toFixed(2)}%
- Target ROAS: ${input.targetRoas || 3}x
- Target CPA: ₹${input.targetCpa || 500}

SCORING CRITERIA (score each campaign 0-100):
- efficiency (0-100): How well spend converts to results. High spend + low clicks = low score.
- engagement (0-100): CTR quality. Industry avg for Google Search ~5-10%, Display ~0.5%, Meta ~1-3%.
- reach (0-100): Impression volume relative to peers in this dataset.
- consistency (0-100): Is the campaign ENABLED/ACTIVE and running? Paused = lower score.
- potential (0-100): Room to grow — low spend + good CTR = high potential.
- overallScore: weighted average of above (efficiency 30%, engagement 25%, reach 20%, consistency 15%, potential 10%)
- grade: A (85-100), B (70-84), C (50-69), D (30-49), F (0-29)

Return ONLY valid JSON matching this exact structure:
{
  "summary": {
    "overallHealthScore": 0,
    "verdict": "one sentence overall assessment",
    "topPositive": "best thing happening",
    "topNegative": "biggest problem",
    "urgentAction": "single most important thing to do right now"
  },
  "campaignScores": [
    {
      "campaignId": "...",
      "campaignName": "...",
      "platform": "...",
      "overallScore": 0,
      "scores": { "efficiency": 0, "engagement": 0, "reach": 0, "consistency": 0, "potential": 0 },
      "grade": "A",
      "verdict": "one-line campaign summary"
    }
  ],
  "metricAlerts": [
    {
      "metric": "Avg CTR",
      "status": "warning",
      "value": "0.8%",
      "benchmark": "1-3% for Meta",
      "action": "Test new ad creatives"
    }
  ],
  "platformInsights": [
    {
      "platform": "google",
      "totalSpend": 0,
      "totalImpressions": 0,
      "totalClicks": 0,
      "avgCtr": 0,
      "campaignCount": 0,
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendation": "..."
    }
  ],
  "positives": ["list of good things happening across campaigns"],
  "negatives": ["list of problems or concerns"],
  "optimizationPriorities": [
    {
      "priority": 1,
      "area": "Budget Allocation",
      "impact": "high",
      "action": "specific action to take",
      "expectedOutcome": "what will improve"
    }
  ],
  "metricsToWatch": [
    {
      "metric": "CTR",
      "why": "why this matters",
      "currentStatus": "current state",
      "target": "what to aim for"
    }
  ]
}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    model: "google/gemini-2.5-flash-lite",
    jsonSchema: {
      name: "campaign_analysis",
      strict: true,
      schema: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            properties: {
              overallHealthScore: { type: "number" },
              verdict: { type: "string" },
              topPositive: { type: "string" },
              topNegative: { type: "string" },
              urgentAction: { type: "string" },
            },
            required: [
              "overallHealthScore",
              "verdict",
              "topPositive",
              "topNegative",
              "urgentAction",
            ],
            additionalProperties: false,
          },
          campaignScores: {
            type: "array",
            items: {
              type: "object",
              properties: {
                campaignId: { type: "string" },
                campaignName: { type: "string" },
                platform: { type: "string" },
                overallScore: { type: "number" },
                scores: {
                  type: "object",
                  properties: {
                    efficiency: { type: "number" },
                    engagement: { type: "number" },
                    reach: { type: "number" },
                    consistency: { type: "number" },
                    potential: { type: "number" },
                  },
                  required: [
                    "efficiency",
                    "engagement",
                    "reach",
                    "consistency",
                    "potential",
                  ],
                  additionalProperties: false,
                },
                grade: { type: "string", enum: ["A", "B", "C", "D", "F"] },
                verdict: { type: "string" },
              },
              required: [
                "campaignId",
                "campaignName",
                "platform",
                "overallScore",
                "scores",
                "grade",
                "verdict",
              ],
              additionalProperties: false,
            },
          },
          metricAlerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                metric: { type: "string" },
                status: {
                  type: "string",
                  enum: ["critical", "warning", "good"],
                },
                value: { type: "string" },
                benchmark: { type: "string" },
                action: { type: "string" },
              },
              required: ["metric", "status", "value", "benchmark", "action"],
              additionalProperties: false,
            },
          },
          platformInsights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                totalSpend: { type: "number" },
                totalImpressions: { type: "number" },
                totalClicks: { type: "number" },
                avgCtr: { type: "number" },
                campaignCount: { type: "number" },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                recommendation: { type: "string" },
              },
              required: [
                "platform",
                "totalSpend",
                "totalImpressions",
                "totalClicks",
                "avgCtr",
                "campaignCount",
                "strengths",
                "weaknesses",
                "recommendation",
              ],
              additionalProperties: false,
            },
          },
          positives: { type: "array", items: { type: "string" } },
          negatives: { type: "array", items: { type: "string" } },
          optimizationPriorities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                priority: { type: "number" },
                area: { type: "string" },
                impact: { type: "string", enum: ["high", "medium", "low"] },
                action: { type: "string" },
                expectedOutcome: { type: "string" },
              },
              required: [
                "priority",
                "area",
                "impact",
                "action",
                "expectedOutcome",
              ],
              additionalProperties: false,
            },
          },
          metricsToWatch: {
            type: "array",
            items: {
              type: "object",
              properties: {
                metric: { type: "string" },
                why: { type: "string" },
                currentStatus: { type: "string" },
                target: { type: "string" },
              },
              required: ["metric", "why", "currentStatus", "target"],
              additionalProperties: false,
            },
          },
        },
        required: [
          "summary",
          "campaignScores",
          "metricAlerts",
          "platformInsights",
          "positives",
          "negatives",
          "optimizationPriorities",
          "metricsToWatch",
        ],
        additionalProperties: false,
      },
    },
  });

  return JSON.parse(raw) as AnalysisResult;
}
