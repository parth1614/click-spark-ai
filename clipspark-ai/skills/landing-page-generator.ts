import { chatCompletion } from "@/lib/openrouter";

export interface LandingPageInput {
  productService: string;
  description: string;
  adCreativeUrl?: string;
  tone?: string;
}

export interface BodySection {
  type: "features" | "benefits" | "testimonial" | "stats" | "cta-block";
  heading: string;
  content: string;
  items?: string[];
}

export interface LandingPageContent {
  headline: string;
  subheadline: string;
  bodySections: BodySection[];
  ctaText: string;
}

export async function generateLandingPageContent(
  input: LandingPageInput,
): Promise<LandingPageContent> {
  const prompt = `You are an expert landing page copywriter. Generate compelling landing page content for:

Product/Service: ${input.productService}
Description: ${input.description}
Tone: ${input.tone || "professional and persuasive"}

Return a JSON object with this exact structure:
{
  "headline": "A powerful, attention-grabbing headline (max 10 words)",
  "subheadline": "A supporting subheadline that expands on the value proposition (1-2 sentences)",
  "bodySections": [
    {
      "type": "features",
      "heading": "Section heading",
      "content": "Brief intro paragraph",
      "items": ["Feature 1 — short description", "Feature 2 — short description", "Feature 3 — short description"]
    },
    {
      "type": "benefits",
      "heading": "Section heading",
      "content": "Brief intro paragraph",
      "items": ["Benefit 1", "Benefit 2", "Benefit 3"]
    },
    {
      "type": "stats",
      "heading": "Section heading",
      "content": "",
      "items": ["95% customer satisfaction", "10x faster results", "500+ happy clients"]
    },
    {
      "type": "testimonial",
      "heading": "What People Say",
      "content": "A realistic testimonial quote — Author Name, Title",
      "items": []
    }
  ],
  "ctaText": "Short CTA button text (2-4 words)"
}

Return ONLY valid JSON, no markdown fences.`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });

  const cleaned = raw
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned) as LandingPageContent;
}
