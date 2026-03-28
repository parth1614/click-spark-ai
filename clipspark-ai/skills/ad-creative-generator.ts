import { imageCompletion } from "@/lib/openrouter";

export interface TargetAudience {
  ageBracket: string;
  countries: string[];
  regions: string[];
  genderRatio?: string;
}

export interface AdCreativeInput {
  sourceContent: string;
  platform: "facebook" | "google_display" | "instagram";
  objective: "awareness" | "consideration" | "conversion";
  audience: TargetAudience;
  productService: string;
}

export interface AdCreativeResult {
  id: string;
  iteration: number;
  imageUrl: string; // base64 data URL from OpenRouter
  adAngle: string;
  improvement: string;
  dimensions: string;
}

// Aspect ratios per platform
const PLATFORM_ASPECT: Record<string, "16:9" | "1:1"> = {
  facebook: "16:9",
  google_display: "16:9",
  instagram: "1:1",
};

const PLATFORM_DIMS: Record<string, string> = {
  facebook: "1344×768",
  google_display: "1344×768",
  instagram: "1024×1024",
};

// Each iteration has a distinct creative angle + what makes it better
const ITERATIONS = [
  {
    angle: "Emotional storytelling — aspirational lifestyle",
    improvement: "Starting point — emotional hook",
    style:
      "warm cinematic lifestyle photography, golden hour lighting, aspirational mood, shallow depth of field",
  },
  {
    angle: "Social proof — community energy",
    improvement: "Adds social validation and crowd energy",
    style:
      "vibrant community scene, diverse happy people, dynamic composition, bright natural light",
  },
  {
    angle: "Problem → solution contrast",
    improvement: "Stronger narrative tension with before/after contrast",
    style:
      "split composition, dramatic contrast between dark problem side and bright solution side, bold visual storytelling",
  },
  {
    angle: "Bold product hero shot",
    improvement: "Clean product focus with premium studio feel",
    style:
      "minimalist studio photography, dramatic product hero shot, perfect lighting, luxury commercial aesthetic, white or dark gradient background",
  },
  {
    angle: "Ultra-refined premium — best of all angles",
    improvement:
      "Combines emotional storytelling, social proof, and premium product presentation into one cohesive visual",
    style:
      "award-winning advertising photography, perfect composition, cinematic color grading, ultra-sharp, magazine cover quality",
  },
];

export async function generateAdCreatives(
  input: AdCreativeInput,
): Promise<AdCreativeResult[]> {
  const audienceContext = [
    `age ${input.audience.ageBracket}`,
    input.audience.countries.join(", ") || "global audience",
    input.audience.regions.length ? input.audience.regions.join(", ") : null,
    input.audience.genderRatio || null,
  ]
    .filter(Boolean)
    .join(", ");

  const aspectRatio = PLATFORM_ASPECT[input.platform];
  const dimensions = PLATFORM_DIMS[input.platform];

  // Generate all 5 in parallel — catch per-image errors so one failure doesn't kill the batch
  const results = await Promise.all(
    ITERATIONS.map(async (iter, i) => {
      const prompt = buildImagePrompt({
        productService: input.productService,
        sourceContent: input.sourceContent,
        platform: input.platform,
        objective: input.objective,
        audienceContext,
        style: iter.style,
        iteration: i + 1,
      });

      let imageUrl = "";
      try {
        imageUrl = await imageCompletion(prompt, {
          aspectRatio,
          imageSize: "2K", // 4K can timeout; 2K is more reliable
        });
      } catch (err) {
        console.error(`imageCompletion failed for creative_${i + 1}:`, err);
        imageUrl = ""; // will show error state in UI
      }

      return {
        id: `creative_${i + 1}`,
        iteration: i + 1,
        imageUrl,
        adAngle: iter.angle,
        improvement: iter.improvement,
        dimensions,
      } satisfies AdCreativeResult;
    }),
  );

  return results;
}

function buildImagePrompt(p: {
  productService: string;
  sourceContent: string;
  platform: string;
  objective: string;
  audienceContext: string;
  style: string;
  iteration: number;
}): string {
  return [
    `Professional advertising creative for "${p.productService}".`,
    `Platform: ${p.platform} ad. Objective: ${p.objective}.`,
    `Target audience: ${p.audienceContext}.`,
    `Context: ${p.sourceContent.slice(0, 200)}.`,
    p.style,
    "No text overlays, no watermarks, no logos.",
    "Ultra high resolution, 8K, photorealistic, commercial advertising quality.",
    "Shot by a top advertising photographer.",
  ].join(" ");
}
