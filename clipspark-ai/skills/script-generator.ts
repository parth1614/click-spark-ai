import { chatCompletion } from "@/lib/openrouter";
import type { ScriptOutput } from "@/types";

interface ScriptGeneratorInput {
  topic: string;
  targetAudience?: string;
  tone?: "professional" | "casual" | "educational";
  videoLength: number;
}

export async function generateScript(
  input: ScriptGeneratorInput,
): Promise<ScriptOutput> {
  const prompt = `You are an expert video script writer. Generate a compelling ${input.videoLength}-second video script.

Topic: ${input.topic}
Target Audience: ${input.targetAudience || "General business audience"}
Tone: ${input.tone || "professional"}

Structure:
1. HOOK (first 10 seconds): Attention-grabbing opening that presents a problem or bold statement
2. BODY (main content): Core message, explanation, or solution
3. CTA (last 10 seconds): Clear call-to-action

Requirements:
- Write for spoken delivery (conversational, not written)
- Use short sentences
- Include natural pauses
- Estimated ${input.videoLength} seconds when read at normal pace
- NO fluff or filler words
- Make it engaging and valuable

Return ONLY a JSON object with this exact structure:
{
  "hook": "The opening 10 seconds",
  "body": "The main content",
  "cta": "The closing call-to-action",
  "fullScript": "Complete script as one piece",
  "estimatedDuration": "${input.videoLength}s"
}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });

  return JSON.parse(raw) as ScriptOutput;
}
