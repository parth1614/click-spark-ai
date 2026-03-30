import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("landing_pages")
      .select(
        "id, headline, subheadline, product_service, theme_color, hero_image_url, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ pages: data ?? [] });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to fetch landing pages";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
