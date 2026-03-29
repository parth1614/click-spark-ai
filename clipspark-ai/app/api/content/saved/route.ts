import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type");
    if (!type) {
      return NextResponse.json(
        { error: "type query param is required" },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("generated_content")
      .select("*")
      .eq("content_type", type)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to fetch saved content";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
