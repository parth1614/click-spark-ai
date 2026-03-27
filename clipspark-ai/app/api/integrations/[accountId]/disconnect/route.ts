import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { accountId: string } },
) {
  try {
    const { error } = await supabase
      .from("ad_accounts")
      .update({ is_active: false, access_token: "" })
      .eq("id", params.accountId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to disconnect";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
