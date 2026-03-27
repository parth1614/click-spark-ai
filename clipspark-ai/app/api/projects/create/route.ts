import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { topic, targetAudience, tone, videoLength } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        topic,
        target_audience: targetAudience || null,
        tone: tone || "professional",
        video_length: videoLength || 90,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ projectId: data.id, project: data });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
