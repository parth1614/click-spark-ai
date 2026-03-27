import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { campaignId: string } },
) {
  try {
    const { data, error } = await supabase
      .from("campaign_metrics")
      .select("*")
      .eq("campaign_id", params.campaignId)
      .order("date", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ metrics: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch metrics";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
