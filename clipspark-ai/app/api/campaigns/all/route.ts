import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ campaigns: data || [] });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to fetch campaigns";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
