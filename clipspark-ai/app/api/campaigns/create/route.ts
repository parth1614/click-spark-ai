import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      campaignName,
      platform,
      objective,
      dailyBudget,
      lifetimeBudget,
      startDate,
      endDate,
      targeting,
      creativeIds,
    } = body;
    if (!campaignName || !platform)
      return NextResponse.json(
        { error: "campaignName and platform are required" },
        { status: 400 },
      );

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        campaign_name: campaignName,
        platform,
        objective: objective || "traffic",
        status: "draft",
        daily_budget: dailyBudget || null,
        lifetime_budget: lifetimeBudget || null,
        start_date: startDate || null,
        end_date: endDate || null,
        targeting: targeting || null,
        metadata: { creativeIds: creativeIds || [] },
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ campaign: data });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to create campaign";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
