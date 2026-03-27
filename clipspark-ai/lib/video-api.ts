// HeyGen video generation API wrapper

const HEYGEN_API_URL = "https://api.heygen.com/v2/video/generate";
const HEYGEN_STATUS_URL = "https://api.heygen.com/v1/video_status.get";

interface GenerateVideoInput {
  script: string;
  avatarId?: string;
  voiceId?: string;
}

interface VideoResult {
  videoId: string;
  status: string;
}

export async function generateVideo(
  input: GenerateVideoInput,
): Promise<VideoResult> {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) throw new Error("HEYGEN_API_KEY not configured");

  const res = await fetch(HEYGEN_API_URL, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: input.avatarId || "Angela-inblackskirt-20220820",
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            input_text: input.script,
            voice_id: input.voiceId || "1bd001e7e50f421d891986aad5158bc8",
          },
          background: {
            type: "color",
            value: "#f5f5f5",
          },
        },
      ],
      dimension: { width: 1920, height: 1080 },
    }),
  });

  if (!res.ok) {
    throw new Error(`HeyGen API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return {
    videoId: data.data.video_id,
    status: "processing",
  };
}

export async function getVideoStatus(videoId: string) {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) throw new Error("HEYGEN_API_KEY not configured");

  const res = await fetch(`${HEYGEN_STATUS_URL}?video_id=${videoId}`, {
    headers: { "X-Api-Key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`HeyGen status error: ${res.status}`);
  }

  const data = await res.json();
  return {
    status: data.data.status, // processing | completed | failed
    videoUrl: data.data.video_url || null,
    duration: data.data.duration || null,
  };
}
