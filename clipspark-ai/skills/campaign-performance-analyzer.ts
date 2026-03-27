import { chatCompletion } from "@/lib/openrouter";
import type { CampaignMetrics, OptimizationResult } from "@/types/marketing";

interface OptimizationInput {
  campaigns: CampaignMetrics[];
  targetRoas: number;
  targetCpa: number;
  totalBudget: number;
}

export async function analyzeCampaignPerformance(
  input: OptimizationInput,
): Promise<OptimizationResult> {
  const prompt = `You are a performance marketing expert. Analyze these campaign metrics and provide optimization recommendations.

Campaign Data:
${JSON.stringify(input.campaigns, null, 2)}

Targets:
- Target ROAS: ${input.targetRoas}x
- Target CPA: $${input.targetCpa}
- Total Budget: $${input.totalBudget}

Identify:
1. Winning campaigns (ROAS > target OR CPA < target AND trending positively)
2. Losing campaigns (ROAS < 1x OR CPA > 2x target)
3. Budget reallocation strategy to maximize ROAS while maintaining total budget

For each winning campaign, recommend budget increase (%).
For each losing campaign, recommend: pause, reduce budget, or optimize creative.

Return JSON:
{
  "winningCampaigns": [{"campaignId": "...", "campaignName": "...", "currentBudget": 0, "recommendedBudget": 0, "recommendedAction": "scale_up", "reason": "...", "roas": 0}],
  "losingCampaigns": [{"campaignId": "...", "campaignName": "...", "currentBudget": 0, "recommendedBudget": 0, "recommendedAction": "pause", "reason": "...", "cpa": 0}],
  "budgetReallocation": {
    "totalCurrentBudget": ${input.totalBudget},
    "totalRecommendedBudget": ${input.totalBudget},
    "changes": [{"from": "campaign_id", "to": "campaign_id", "amount": 0}]
  },
  "projectedImpact": {
    "currentRoas": 0,
    "projectedRoas": 0,
    "improvement": "X%"
  }
}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });
  return JSON.parse(raw) as OptimizationResult;
}
