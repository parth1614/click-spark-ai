import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(
  req: NextRequest,
  { params }: { params: { scriptId: string } },
) {
  try {
    const { hook, body, cta, fullScript } = await req.json();

    const { data, error } = await supabase
      .from("scripts")
      .update({
        hook,
        body,
        cta,
        full_script: fullScript,
        is_edited: true,
      })
      .eq("id", params.scriptId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, updatedScript: data });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update script";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
