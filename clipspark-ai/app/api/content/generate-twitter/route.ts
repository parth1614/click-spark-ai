import { NextRequest, NextResponse } from "next/server";
import { generateTwitterThreads } from "@/skills/twitter-thread-generator";

export async function POST(req: NextRequest) {
  try {
    const { topic, script } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    const threads = await generateTwitterThreads({
      topic,
      script: script || topic,
    });
    return NextResponse.json({ threads });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate Twitter threads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
