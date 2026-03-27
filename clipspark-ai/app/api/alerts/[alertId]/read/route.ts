import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { alertId: string } },
) {
  try {
    const { error } = await supabase
      .from("campaign_alerts")
      .update({ is_read: true })
      .eq("id", params.alertId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to mark alert as read";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
