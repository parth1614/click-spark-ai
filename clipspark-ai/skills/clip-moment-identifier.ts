import { chatCompletion } from "@/lib/openrouter";
import type { TranscriptionSegment } from "@/types";

interface ClipIdentifierInput {
  transcription: TranscriptionSegment[];
  script: string;
}

export interface ClipMoment {
  startTime: number;
  endTime: number;
  title: string;
  hook: string;
  reason: string;
}

export async function identifyClipMoments(
  input: ClipIdentifierInput,
): Promise<ClipMoment[]> {
  const fullTranscript = input.transcription.map((s) => s.text).join(" ");

  const prompt = `You are a viral content strategist. Analyze this video transcript and identify 5-8 clip-worthy moments.

Full Transcript:
${fullTranscript}

Original Script Context:
${input.script}

Identify segments that are:
- Self-contained (make sense without full context)
- 30-60 seconds long
- Have a strong hook or punchline
- Contain actionable insights or bold statements

For each clip provide:
1. Start and end timestamps (estimate based on transcript flow)
2. Title (5-8 words, attention-grabbing)
3. Hook (the opening line)
4. Reason (why this would be a good clip)

Return as JSON:
{
  "clips": [
    { "startTime": 10, "endTime": 55, "title": "...", "hook": "...", "reason": "..." }
  ]
}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });
  return JSON.parse(raw).clips;
}
