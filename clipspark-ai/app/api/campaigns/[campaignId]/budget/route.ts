import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { campaignId: string } },
) {
  try {
    const { dailyBudget, lifetimeBudget } = await req.json();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (dailyBudget !== undefined) updates.daily_budget = dailyBudget;
    if (lifetimeBudget !== undefined) updates.lifetime_budget = lifetimeBudget;

    const { data, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", params.campaignId)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, campaign: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update budget";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
