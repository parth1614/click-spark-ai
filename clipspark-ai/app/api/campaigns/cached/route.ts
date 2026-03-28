import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: campaigns, error } = await supabase
      .from("ad_campaigns_cache")
      .select("*")
      .order("spend", { ascending: false });

    if (error) throw error;

    const { data: latestAnalysis } = await supabase
      .from("campaign_analysis")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      campaigns: campaigns || [],
      latestAnalysis: latestAnalysis?.analysis_result || null,
      analysisCreatedAt: latestAnalysis?.created_at || null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load campaigns";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
