const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_MODEL = "google/gemini-2.5-flash-lite";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface JsonSchema {
  name: string;
  strict?: boolean;
  schema: Record<string, unknown>;
}

interface OpenRouterOptions {
  model?: string;
  jsonMode?: boolean;
  jsonSchema?: JsonSchema;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: OpenRouterOptions = {},
): Promise<string> {
  const model = options.model || DEFAULT_MODEL;

  let lastError: Error | null = null;

  try {
    const body: Record<string, unknown> = {
      model: model,
      messages,
    };
    if (options.jsonSchema) {
      body.response_format = {
        type: "json_schema",
        json_schema: {
          name: options.jsonSchema.name,
          strict: options.jsonSchema.strict ?? true,
          schema: options.jsonSchema.schema,
        },
      };
    } else if (options.jsonMode) {
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
    console.warn(`Model ${model} failed, trying next...`, err);
  }

  throw lastError || new Error("All models failed");
}

const IMAGE_MODEL = "bytedance-seed/seedream-4.5";

interface ImageGenOptions {
  model?: string;
  aspectRatio?: "1:1" | "16:9" | "4:3" | "3:2" | "9:16";
  imageSize?: "1K" | "2K" | "4K";
}

/** Calls an OpenRouter image-only model and returns a base64 data URL. */
export async function imageCompletion(
  prompt: string,
  options: ImageGenOptions = {},
): Promise<string> {
  const body: Record<string, unknown> = {
    // model: options.model || IMAGE_MODEL,
    model: "black-forest-labs/flux.2-max",
    messages: [{ role: "user", content: prompt }],
    modalities: ["image"],
  };

  if (options.aspectRatio || options.imageSize) {
    const image_config: Record<string, string> = {};
    if (options.aspectRatio) image_config.aspect_ratio = options.aspectRatio;
    if (options.imageSize) image_config.image_size = options.imageSize;
    body.image_config = image_config;
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
    throw new Error(`OpenRouter image ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  console.log("OpenRouter image response:", JSON.stringify(data).slice(0, 500));
  const images = data.choices?.[0]?.message?.images;
  if (!images?.length)
    throw new Error(
      `No image returned. Response: ${JSON.stringify(data).slice(0, 300)}`,
    );
  return (images[0].image_url?.url ?? images[0].url) as string;
}
