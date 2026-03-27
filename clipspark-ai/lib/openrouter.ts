const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_MODEL = "google/gemini-2.0-flash-exp:free";
const FALLBACK_MODELS = [
  "anthropic/claude-3.5-sonnet",
  "openai/gpt-4o",
  "meta-llama/llama-3.1-70b-instruct",
];

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterOptions {
  model?: string;
  jsonMode?: boolean;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: OpenRouterOptions = {},
): Promise<string> {
  const model = options.model || DEFAULT_MODEL;
  const models = [model, ...FALLBACK_MODELS.filter((m) => m !== model)];

  let lastError: Error | null = null;

  for (const currentModel of models) {
    try {
      const body: Record<string, unknown> = {
        model: currentModel,
        messages,
      };
      if (options.jsonMode) {
        body.response_format = { type: "json_object" };
      }

      const res = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      return data.choices[0].message.content;
    } catch (err) {
      lastError = err as Error;
      console.warn(`Model ${currentModel} failed, trying next...`, err);
    }
  }

  throw lastError || new Error("All models failed");
}
