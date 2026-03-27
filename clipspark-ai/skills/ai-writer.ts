import { chatCompletion } from "@/lib/openrouter";

export type WriterFormat =
  | "article"
  | "listicle"
  | "how-to"
  | "comparison"
  | "case-study"
  | "press-release"
  | "product-description"
  | "landing-page-copy"
  | "ad-copy"
  | "youtube-description";

interface AIWriterInput {
  topic: string;
  format: WriterFormat;
  script?: string;
  tone?: string;
  targetAudience?: string;
  additionalInstructions?: string;
}

export interface AIWriterOutput {
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  suggestedTags: string[];
}

const FORMAT_INSTRUCTIONS: Record<WriterFormat, string> = {
  article:
    "Write a well-structured article with introduction, body sections with H2 headings, and conclusion. 800-1200 words.",
  listicle:
    "Write a numbered listicle (e.g., '10 Ways to...') with a catchy intro, numbered items with explanations, and a wrap-up. 600-1000 words.",
  "how-to":
    "Write a step-by-step how-to guide with numbered steps, tips, and a summary. Include prerequisites if relevant. 800-1200 words.",
  comparison:
    "Write a comparison piece (X vs Y or multiple options). Include a comparison table in markdown, pros/cons, and a recommendation. 800-1200 words.",
  "case-study":
    "Write a case study with Background, Challenge, Solution, Results, and Key Takeaways sections. Use specific (but realistic) metrics. 600-1000 words.",
  "press-release":
    "Write a professional press release with headline, dateline, lead paragraph, body quotes, boilerplate. AP style. 400-600 words.",
  "product-description":
    "Write compelling product/service descriptions. Include features, benefits, use cases, and a CTA. 300-500 words.",
  "landing-page-copy":
    "Write conversion-focused landing page copy with headline, subheadline, benefit bullets, social proof section, and CTA. 400-700 words.",
  "ad-copy":
    "Write 5 ad copy variations for different platforms (Google Ads, Facebook, LinkedIn, Instagram, YouTube). Each with headline, body, and CTA. Keep platform character limits in mind.",
  "youtube-description":
    "Write an optimized YouTube video description with hook, timestamps placeholder, key points, links section, and hashtags. 300-500 words.",
};

export async function generateAIContent(
  input: AIWriterInput,
): Promise<AIWriterOutput> {
  const formatInstr = FORMAT_INSTRUCTIONS[input.format];

  const prompt = `You are a world-class content writer. Generate high-quality content in the specified format.

Topic: ${input.topic}
Format: ${input.format}
${input.script ? `Reference Script: ${input.script}` : ""}
Tone: ${input.tone || "Professional yet engaging"}
Target Audience: ${input.targetAudience || "General business audience"}
${input.additionalInstructions ? `Additional Instructions: ${input.additionalInstructions}` : ""}

Format Requirements:
${formatInstr}

General Requirements:
- Engaging and valuable content
- No fluff or filler
- Actionable insights where applicable
- Written in markdown format

Return as JSON:
{
  "title": "Content title",
  "content": "Full markdown content",
  "summary": "2-3 sentence summary",
  "wordCount": 850,
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });
  return JSON.parse(raw) as AIWriterOutput;
}
