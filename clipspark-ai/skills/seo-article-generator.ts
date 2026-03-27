import { chatCompletion } from "@/lib/openrouter";

interface SEOArticleInput {
  topic: string;
  script?: string;
  keywords?: string[];
  wordCount?: number;
}

export interface SEOArticle {
  title: string;
  metaDescription: string;
  slug: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  content: string;
  faqSchema: Array<{ question: string; answer: string }>;
}

export async function generateSEOArticle(
  input: SEOArticleInput,
): Promise<SEOArticle> {
  const prompt = `You are an expert SEO content strategist and writer. Generate a comprehensive, SEO-optimized article.

Topic: ${input.topic}
${input.script ? `Reference Script: ${input.script}` : ""}
${input.keywords?.length ? `Target Keywords: ${input.keywords.join(", ")}` : ""}
Target Word Count: ${input.wordCount || 1500}

Requirements:
- SEO-optimized title with primary keyword (50-60 chars)
- Meta description (150-160 chars) with primary keyword
- URL-friendly slug
- Focus keyword and 3-5 secondary keywords
- Well-structured content with H2/H3 headings
- Introduction with hook + keyword in first 100 words
- 4-6 body sections with subheadings
- Internal linking suggestions (use [internal link: topic] placeholders)
- Conclusion with CTA
- 3-5 FAQ items for schema markup
- Natural keyword density (1-2%)
- Written in markdown format
- Include bullet points, numbered lists where appropriate
- Transition sentences between sections

Return as JSON:
{
  "title": "SEO title",
  "metaDescription": "150-160 char description",
  "slug": "url-friendly-slug",
  "focusKeyword": "primary keyword",
  "secondaryKeywords": ["kw1", "kw2", "kw3"],
  "content": "Full markdown article",
  "faqSchema": [{"question": "Q1", "answer": "A1"}]
}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });
  return JSON.parse(raw) as SEOArticle;
}
