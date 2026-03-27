import { chatCompletion } from "@/lib/openrouter";

interface GEOInput {
  topic: string;
  script?: string;
  targetEngine?: "chatgpt" | "perplexity" | "gemini" | "all";
}

export interface GEOContent {
  optimizedArticle: string;
  citationSuggestions: string[];
  entityMarkup: Array<{ entity: string; type: string; description: string }>;
  conversationalSnippets: string[];
  structuredData: string;
  optimizationTips: string[];
}

export async function generateGEOContent(input: GEOInput): Promise<GEOContent> {
  const prompt = `You are a Generative Engine Optimization (GEO) expert. GEO optimizes content to appear in AI-generated answers from ChatGPT, Perplexity, Gemini, and similar AI search engines.

Topic: ${input.topic}
${input.script ? `Reference Script: ${input.script}` : ""}
Target Engine: ${input.targetEngine || "all"}

Generate GEO-optimized content with these components:

1. OPTIMIZED ARTICLE (800-1200 words):
   - Write in a factual, authoritative, citation-worthy style
   - Use clear definitions and explanations AI models prefer to quote
   - Include statistics, data points, and specific numbers
   - Structure with clear Q&A patterns AI models can extract
   - Use "According to..." and "Research shows..." patterns
   - Include comparison tables and structured lists
   - Write concise, quotable sentences (15-25 words each)

2. CITATION SUGGESTIONS: 5 authoritative sources to reference/link

3. ENTITY MARKUP: Key entities (people, concepts, tools) with types and descriptions for knowledge graph optimization

4. CONVERSATIONAL SNIPPETS: 5 short (1-2 sentence) answers optimized for AI chat responses - these should directly answer common questions about the topic

5. STRUCTURED DATA: JSON-LD schema suggestion for the content

6. OPTIMIZATION TIPS: 5 specific tips for improving GEO ranking for this topic

Return as JSON:
{
  "optimizedArticle": "markdown article",
  "citationSuggestions": ["source1", "source2"],
  "entityMarkup": [{"entity": "name", "type": "type", "description": "desc"}],
  "conversationalSnippets": ["snippet1", "snippet2"],
  "structuredData": "JSON-LD string",
  "optimizationTips": ["tip1", "tip2"]
}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });
  return JSON.parse(raw) as GEOContent;
}
