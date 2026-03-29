import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Landing page not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ page: data });
  } catch (err: unknown) {
    console.error("Landing page fetch error:", err);
    const msg =
      err instanceof Error ? err.message : "Failed to fetch landing page";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
