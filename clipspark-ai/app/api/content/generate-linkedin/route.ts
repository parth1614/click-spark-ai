import { NextRequest, NextResponse } from "next/server";
import { generateLinkedInPosts } from "@/skills/linkedin-post-generator";

export async function POST(req: NextRequest) {
  try {
    const { topic, script } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    const posts = await generateLinkedInPosts({
      topic,
      script: script || topic,
    });
    return NextResponse.json({ posts });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate LinkedIn posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
