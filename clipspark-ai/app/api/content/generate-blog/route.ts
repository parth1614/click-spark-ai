import { NextRequest, NextResponse } from "next/server";
import { generateBlogPost } from "@/skills/blog-post-generator";

export async function POST(req: NextRequest) {
  try {
    const { topic, script } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    const blog = await generateBlogPost({ topic, script: script || topic });
    return NextResponse.json({ blog });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate blog post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
