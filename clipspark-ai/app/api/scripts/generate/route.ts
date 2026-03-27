import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateScript } from "@/skills/script-generator";

export async function POST(req: NextRequest) {
  try {
    const { projectId, topic, targetAudience, tone, videoLength } =
      await req.json();

    if (!projectId || !topic) {
      return NextResponse.json(
        { error: "projectId and topic are required" },
        { status: 400 },
      );
    }

    const script = await generateScript({
      topic,
      targetAudience,
      tone,
      videoLength: videoLength || 90,
    });

    const { data, error } = await supabase
      .from("scripts")
      .insert({
        project_id: projectId,
        hook: script.hook,
        body: script.body,
        cta: script.cta,
        full_script: script.fullScript,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      scriptId: data.id,
      hook: script.hook,
      body: script.body,
      cta: script.cta,
      fullScript: script.fullScript,
      estimatedDuration: script.estimatedDuration,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate script";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
