import { NextRequest, NextResponse } from "next/server";
import { generateLinkedInPosts } from "@/skills/linkedin-post-generator";
import { generateNapkinVisual } from "@/lib/napkin";
import { uploadVisualToStorage } from "@/lib/upload-visual";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { topic, script } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "topic is required" }, { status: 400 });

    const posts = await generateLinkedInPosts({
      topic,
      script: script || topic,
    });

    // Generate visual with Napkin AI
    let visualUrl: string | null = null;
    let visualStoragePath: string | null = null;
    try {
      const result = await generateNapkinVisual(posts[0] || topic, {
        context: `LinkedIn post about: ${topic}`,
        query: "infographic",
      });
      if (result) {
        const path = `linkedin/${Date.now()}.png`;
        const uploaded = await uploadVisualToStorage(
          result.buffer,
          path,
          result.contentType,
        );
        visualUrl = uploaded.publicUrl;
        visualStoragePath = uploaded.storagePath;
      }
    } catch (err) {
      console.error("Napkin visual generation failed:", err);
    }

    // Save to DB
    try {
      const supabase = getSupabase();
      await supabase.from("generated_content").insert({
        content_type: "linkedin",
        topic,
        content: { posts },
        visual_url: visualUrl,
        visual_storage_path: visualStoragePath,
      });
    } catch (err) {
      console.error("DB save failed:", err);
    }

    return NextResponse.json({ posts, visualUrl });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate LinkedIn posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
