import { chatCompletion } from "@/lib/openrouter";

interface BlogInput {
  script: string;
  topic: string;
}

export interface BlogPost {
  title: string;
  metaDescription: string;
  content: string; // markdown
}

export async function generateBlogPost(input: BlogInput): Promise<BlogPost> {
  const prompt = `You are an SEO content writer. Expand this video script into an 800-1000 word blog post.

Script: ${input.script}
Topic: ${input.topic}

Requirements:
- SEO-friendly title
- Meta description (150-160 chars)
- Introduction paragraph
- 3-5 body sections with H2/H3 subheadings
- Conclusion with CTA
- Written in markdown format
- Engaging, informative, and actionable

Return as JSON:
{
  "title": "SEO title",
  "metaDescription": "150-160 char description",
  "content": "Full markdown blog post"
}`;

  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    jsonMode: true,
  });
  return JSON.parse(raw) as BlogPost;
}
