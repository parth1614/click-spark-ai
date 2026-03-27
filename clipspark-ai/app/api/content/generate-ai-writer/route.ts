import { NextRequest, NextResponse } from "next/server";
import { generateAIContent } from "@/skills/ai-writer";

export async function POST(req: NextRequest) {
  try {
    const {
      topic,
      format,
      script,
      tone,
      targetAudience,
      additionalInstructions,
    } = await req.json();
    if (!topic || !format)
      return NextResponse.json(
        { error: "topic and format are required" },
        { status: 400 },
      );
    const result = await generateAIContent({
      topic,
      format,
      script,
      tone,
      targetAudience,
      additionalInstructions,
    });
    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
