import { NextRequest, NextResponse } from "next/server";
import { generateEmailSnippets } from "@/skills/email-snippet-generator";

export async function POST(req: NextRequest) {
  try {
    const { topic, script } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    const snippets = await generateEmailSnippets({
      topic,
      script: script || topic,
    });
    return NextResponse.json({ snippets });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate email snippets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
