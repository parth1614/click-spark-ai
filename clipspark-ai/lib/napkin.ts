const NAPKIN_BASE = "https://api.napkin.ai/v1";

interface NapkinVisualRequest {
  content: string;
  context?: string;
  format?: "svg" | "png" | "ppt";
  style_id?: string;
  visual_query?: string;
  number_of_visuals?: number;
  width?: number;
  language?: string;
  orientation?: string;
}

interface NapkinGeneratedFile {
  id: string;
  url: string;
  format: string;
}

interface NapkinStatusResponse {
  id: string;
  status: "pending" | "completed" | "failed";
  generated_files?: NapkinGeneratedFile[];
  error?: { message: string };
}

function getApiKey(): string {
  const key = process.env.NAPKIN_AI_API_KEY;
  if (!key) throw new Error("Missing NAPKIN_AI_API_KEY env variable");
  return key;
}

/** Create a visual request and poll until completed. Returns the file bytes. */
export async function generateNapkinVisual(
  content: string,
  options?: { context?: string; query?: string },
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const apiKey = getApiKey();

  const body: NapkinVisualRequest = {
    content,
    format: "png",
    width: 800,
    language: "en-US",
    style_id: "CDQPRVVJCSTPRBBCD5Q6AWR", // Vibrant Strokes
    number_of_visuals: 1,
    orientation: "horizontal",
  };
  if (options?.context) body.context = options.context;
  if (options?.query) body.visual_query = options.query;

  // 1. Create request
  const createRes = await fetch(`${NAPKIN_BASE}/visual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    console.error("Napkin create failed:", createRes.status, text);
    return null;
  }

  const createData = (await createRes.json()) as NapkinStatusResponse;
  const requestId = createData.id;

  // 2. Poll for completion (max 60s)
  let status: NapkinStatusResponse | null = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const pollRes = await fetch(`${NAPKIN_BASE}/visual/${requestId}/status`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!pollRes.ok) continue;
    status = (await pollRes.json()) as NapkinStatusResponse;

    if (status.status === "completed") break;
    if (status.status === "failed") {
      console.error("Napkin visual failed:", status.error?.message);
      return null;
    }
  }

  if (
    !status ||
    status.status !== "completed" ||
    !status.generated_files?.length
  ) {
    console.error("Napkin visual timed out or no files");
    return null;
  }

  // 3. Download the file
  const file = status.generated_files[0];
  const downloadRes = await fetch(file.url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!downloadRes.ok) {
    console.error("Napkin download failed:", downloadRes.status);
    return null;
  }

  const arrayBuf = await downloadRes.arrayBuffer();
  const contentType = downloadRes.headers.get("content-type") || "image/png";

  return { buffer: Buffer.from(arrayBuf), contentType };
}
