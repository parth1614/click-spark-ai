import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { campaignId: string } },
) {
  try {
    const { status } = await req.json();
    if (!["draft", "active", "paused", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("campaigns")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", params.campaignId)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, campaign: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
