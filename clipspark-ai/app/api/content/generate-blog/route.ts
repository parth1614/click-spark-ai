import { NextRequest, NextResponse } from "next/server";
import { generateBlogPost } from "@/skills/blog-post-generator";
import { generateNapkinVisual } from "@/lib/napkin";
import { uploadVisualToStorage } from "@/lib/upload-visual";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { topic, script } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "topic is required" }, { status: 400 });

    const blog = await generateBlogPost({ topic, script: script || topic });

    // Generate visual with Napkin AI
    let visualUrl: string | null = null;
    let visualStoragePath: string | null = null;
    try {
      const result = await generateNapkinVisual(blog.content.slice(0, 1000), {
        context: `Blog post: ${blog.title}`,
        query: "infographic",
      });
      if (result) {
        const path = `blog/${Date.now()}.png`;
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
        content_type: "blog",
        topic,
        content: { blog },
        visual_url: visualUrl,
        visual_storage_path: visualStoragePath,
      });
    } catch (err) {
      console.error("DB save failed:", err);
    }

    return NextResponse.json({ blog, visualUrl });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate blog post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
