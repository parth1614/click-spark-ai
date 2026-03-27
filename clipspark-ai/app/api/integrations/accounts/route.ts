import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("ad_accounts")
      .select("id, platform, account_id, account_name, is_active, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ accounts: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch accounts";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
