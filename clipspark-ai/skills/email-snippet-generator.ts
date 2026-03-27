import { chatCompletion } from "@/lib/openrouter";

interface EmailInput {
  script: string;
  topic: string;
}

export async function generateEmailSnippets(
  input: EmailInput,
): Promise<string[]> {
  const prompt = `You are an email marketing expert. Generate 3 email-ready snippets based on this video script.

Script: ${input.script}
Topic: ${input.topic}

Variations:
1. Quick tip format (short, punchy, actionable)
2. Story/anecdote format (narrative hook)
3. Announcement format (news-style)

Each snippet should be 100-200 words, ready to paste into a newsletter.

Return as JSON: { "snippets": ["snippet1", "snippet2", "snippet3"] }`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });
  return JSON.parse(raw).snippets;
}
