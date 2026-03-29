import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { formData } = body;

    if (!formData || typeof formData !== "object") {
      return NextResponse.json(
        { error: "formData is required" },
        { status: 400 },
      );
    }

    const supabase = getSupabase();

    const { error } = await supabase.from("lead_submissions").insert({
      landing_page_id: params.id,
      form_data: formData,
    });

    if (error) {
      console.error("Lead submission error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Submit error:", err);
    const msg = err instanceof Error ? err.message : "Failed to submit form";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
