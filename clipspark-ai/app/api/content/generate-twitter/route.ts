import { NextRequest, NextResponse } from "next/server";
import { generateTwitterThreads } from "@/skills/twitter-thread-generator";
import { generateNapkinVisual } from "@/lib/napkin";
import { uploadVisualToStorage } from "@/lib/upload-visual";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { topic, script } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "topic is required" }, { status: 400 });

    const threads = await generateTwitterThreads({
      topic,
      script: script || topic,
    });

    // Generate visual with Napkin AI
    let visualUrl: string | null = null;
    let visualStoragePath: string | null = null;
    try {
      const firstThread = threads[0];
      const content = firstThread
        ? [firstThread.hook, ...firstThread.tweets].join("\n")
        : topic;
      const result = await generateNapkinVisual(content, {
        context: `Twitter thread about: ${topic}`,
        query: "diagram",
      });
      if (result) {
        const path = `twitter/${Date.now()}.png`;
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
        content_type: "twitter",
        topic,
        content: { threads },
        visual_url: visualUrl,
        visual_storage_path: visualStoragePath,
      });
    } catch (err) {
      console.error("DB save failed:", err);
    }

    return NextResponse.json({ threads, visualUrl });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate Twitter threads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
