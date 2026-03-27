import { NextRequest, NextResponse } from "next/server";
import { analyzeCampaignPerformance } from "@/skills/campaign-performance-analyzer";

export async function POST(req: NextRequest) {
  try {
    const { campaigns, targetRoas, targetCpa, totalBudget } = await req.json();
    if (!campaigns?.length)
      return NextResponse.json(
        { error: "campaigns array is required" },
        { status: 400 },
      );
    const result = await analyzeCampaignPerformance({
      campaigns,
      targetRoas: targetRoas || 3,
      targetCpa: targetCpa || 50,
      totalBudget: totalBudget || 10000,
    });
    return NextResponse.json({ recommendations: result });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to analyze campaigns";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
