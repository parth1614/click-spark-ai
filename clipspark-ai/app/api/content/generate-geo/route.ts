import { NextRequest, NextResponse } from "next/server";
import { generateGEOContent } from "@/skills/geo-content-generator";

export async function POST(req: NextRequest) {
  try {
    const { topic, script, targetEngine } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    const content = await generateGEOContent({ topic, script, targetEngine });
    return NextResponse.json({ content });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate GEO content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
