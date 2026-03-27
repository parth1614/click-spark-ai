import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getVideoStatus } from "@/lib/video-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    // Get video record
    const { data: video, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", params.videoId)
      .single();

    if (error || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // If already completed, return cached result
    if (video.status === "completed") {
      return NextResponse.json({
        status: "completed",
        videoUrl: video.video_url,
        duration: video.duration,
      });
    }

    // Poll provider for status
    const providerStatus = await getVideoStatus(video.video_url);

    if (providerStatus.status === "completed" && providerStatus.videoUrl) {
      await supabase
        .from("videos")
        .update({
          status: "completed",
          video_url: providerStatus.videoUrl,
          duration: providerStatus.duration,
        })
        .eq("id", params.videoId);
    } else if (providerStatus.status === "failed") {
      await supabase
        .from("videos")
        .update({ status: "failed" })
        .eq("id", params.videoId);
    }

    return NextResponse.json({
      status: providerStatus.status,
      videoUrl: providerStatus.videoUrl,
      duration: providerStatus.duration,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to get video status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
