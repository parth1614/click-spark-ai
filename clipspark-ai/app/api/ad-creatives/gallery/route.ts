import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("ad_creatives")
      .select("*")
      .not("storage_url", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gallery fetch error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ creatives: data ?? [] });
  } catch (err: unknown) {
    console.error("Gallery error:", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch gallery";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
