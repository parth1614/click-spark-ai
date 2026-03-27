import { chatCompletion } from "@/lib/openrouter";

interface TwitterInput {
  script: string;
  topic: string;
}

export interface TwitterThread {
  hook: string;
  tweets: string[];
}

export async function generateTwitterThreads(
  input: TwitterInput,
): Promise<TwitterThread[]> {
  const prompt = `You are a Twitter/X content strategist. Generate 5 different tweet threads based on this video script.

Script: ${input.script}
Topic: ${input.topic}

Each thread should have:
- Hook tweet (attention-grabbing, < 280 chars)
- 4-7 supporting tweets (each < 280 chars)
- CTA tweet at the end

Generate 5 thread variations with different angles.

Return as JSON:
{
  "threads": [
    { "hook": "hook tweet", "tweets": ["tweet1", "tweet2", "tweet3", "cta tweet"] }
  ]
}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });
  return JSON.parse(raw).threads;
}
