import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateVideo } from "@/lib/video-api";

export async function POST(req: NextRequest) {
  try {
    const { projectId, scriptId, scriptText } = await req.json();

    if (!projectId || !scriptId || !scriptText) {
      return NextResponse.json(
        { error: "projectId, scriptId, and scriptText are required" },
        { status: 400 },
      );
    }

    const result = await generateVideo({ script: scriptText });

    const { data, error } = await supabase
      .from("videos")
      .insert({
        project_id: projectId,
        script_id: scriptId,
        video_url: "",
        status: "processing",
        provider: "heygen",
      })
      .select()
      .single();

    if (error) throw error;

    // Store the provider video ID in metadata for polling
    await supabase
      .from("videos")
      .update({ video_url: result.videoId }) // temporarily store provider ID
      .eq("id", data.id);

    return NextResponse.json({
      videoId: data.id,
      providerVideoId: result.videoId,
      status: "processing",
      message: "Video generation started",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
