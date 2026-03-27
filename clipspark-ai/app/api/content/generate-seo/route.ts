import { NextRequest, NextResponse } from "next/server";
import { generateSEOArticle } from "@/skills/seo-article-generator";

export async function POST(req: NextRequest) {
  try {
    const { topic, script, keywords, wordCount } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    const article = await generateSEOArticle({
      topic,
      script,
      keywords,
      wordCount,
    });
    return NextResponse.json({ article });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate SEO article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
