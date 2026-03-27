import { chatCompletion } from "@/lib/openrouter";
import type { AdCreative, AdObjective } from "@/types/marketing";

interface AdCreativeInput {
  sourceContent: string;
  platform: "facebook" | "google_display" | "google_search";
  objective: AdObjective;
  targetAudience: string;
  productService: string;
  cta?: string;
}

export async function generateAdCreatives(
  input: AdCreativeInput,
): Promise<AdCreative[]> {
  const platformInstructions: Record<string, string> = {
    facebook: `Generate 5 Facebook/Instagram ad creative variations:
For each creative provide:
- primaryText (max 125 chars, compelling hook)
- headline (max 40 chars)
- description (max 30 chars)
- cta (one of: Learn More, Shop Now, Sign Up, Get Offer, Book Now, Contact Us)
- creativeType: one of "single_image", "video", "carousel", "story"
- adAngle: brief description of the angle used

Variations:
1. Pain point → solution
2. Social proof / testimonial style
3. Urgency / scarcity
4. Benefit-led
5. Question hook`,

    google_display: `Generate 5 Google Display responsive ad variations:
For each creative provide:
- headline (max 30 chars)
- longHeadline (max 90 chars)
- description (max 90 chars)
- cta (one of: Learn More, Get Quote, Shop Now, Sign Up, Contact Us)
- creativeType: "responsive_display"
- adAngle: brief description

Variations should cover different value propositions and hooks.`,

    google_search: `Generate 5 Google Search responsive ad variations:
For each provide:
- headlines: array of 3 headlines (each max 30 chars)
- descriptions: array of 2 descriptions (each max 90 chars)
- cta: implied CTA in copy
- creativeType: "responsive_search"
- adAngle: brief description
- suggestedKeywords: array of 5 target keywords

Variations should target different search intents.`,
  };

  const prompt = `You are an expert performance marketer and ad copywriter.

Source Content: ${input.sourceContent}
Platform: ${input.platform}
Campaign Objective: ${input.objective}
Target Audience: ${input.targetAudience}
Product/Service: ${input.productService}
${input.cta ? `Preferred CTA: ${input.cta}` : ""}

${platformInstructions[input.platform]}

Requirements:
- Every character counts — be concise and punchy
- Use power words that drive action
- Match the objective (awareness = broad appeal, conversion = specific action)
- No generic filler copy

Return as JSON:
{
  "creatives": [
    {
      "id": "creative_1",
      "platform": "${input.platform}",
      "creativeType": "...",
      "primaryText": "...",
      "headline": "...",
      "description": "...",
      "cta": "...",
      "metadata": { "adAngle": "...", "suggestedKeywords": [] }
    }
  ]
}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });
  const parsed = JSON.parse(raw);
  return parsed.creatives as AdCreative[];
}
