import { chatCompletion } from "@/lib/openrouter";

interface LinkedInInput {
  script: string;
  topic: string;
}

export async function generateLinkedInPosts(
  input: LinkedInInput,
): Promise<string[]> {
  const prompt = `You are a LinkedIn content strategist. Generate 5 different LinkedIn posts based on this video script.

Script: ${input.script}
Topic: ${input.topic}

Requirements for each post:
- 150-250 words
- Hook in first line
- Use line breaks for readability
- Professional but conversational tone
- Include 1-2 relevant emojis (use sparingly)
- End with clear CTA or question

Generate 5 variations:
1. Problem-focused (highlight the pain point)
2. Solution-focused (emphasize the value/benefit)
3. Story format (use "Last week..." or case study)
4. Data-driven (lead with stats or numbers)
5. Engagement (ask a thought-provoking question)

Return as JSON: { "posts": ["post1", "post2", "post3", "post4", "post5"] }`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });
  return JSON.parse(raw).posts;
}
