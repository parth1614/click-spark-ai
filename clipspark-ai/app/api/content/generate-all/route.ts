import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateLinkedInPosts } from "@/skills/linkedin-post-generator";
import { generateTwitterThreads } from "@/skills/twitter-thread-generator";
import { generateBlogPost } from "@/skills/blog-post-generator";
import { generateEmailSnippets } from "@/skills/email-snippet-generator";

export async function POST(req: NextRequest) {
  try {
    const { projectId, scriptId } = await req.json();

    if (!projectId || !scriptId) {
      return NextResponse.json(
        { error: "projectId and scriptId are required" },
        { status: 400 },
      );
    }

    // Fetch script
    const { data: script, error: scriptErr } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", scriptId)
      .single();

    if (scriptErr || !script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }

    // Fetch project for topic
    const { data: project } = await supabase
      .from("projects")
      .select("topic")
      .eq("id", projectId)
      .single();

    const topic = project?.topic || "";
    const fullScript = script.full_script;

    // Generate all content in parallel
    const [linkedinPosts, twitterThreads, blogPost, emailSnippets] =
      await Promise.all([
        generateLinkedInPosts({ script: fullScript, topic }),
        generateTwitterThreads({ script: fullScript, topic }),
        generateBlogPost({ script: fullScript, topic }),
        generateEmailSnippets({ script: fullScript, topic }),
      ]);

    // Store all content
    const contentRows = [
      ...linkedinPosts.map((text: string) => ({
        project_id: projectId,
        content_type: "linkedin",
        content_text: text,
        metadata: { wordCount: text.split(/\s+/).length },
      })),
      ...twitterThreads.map((thread) => ({
        project_id: projectId,
        content_type: "twitter",
        content_text: JSON.stringify(thread),
        metadata: { tweetCount: thread.tweets.length + 1 },
      })),
      {
        project_id: projectId,
        content_type: "blog",
        content_text: JSON.stringify(blogPost),
        metadata: { wordCount: blogPost.content.split(/\s+/).length },
      },
      ...emailSnippets.map((text: string) => ({
        project_id: projectId,
        content_type: "email",
        content_text: text,
        metadata: { wordCount: text.split(/\s+/).length },
      })),
    ];

    const { data, error } = await supabase
      .from("content_outputs")
      .insert(contentRows)
      .select();

    if (error) throw error;

    return NextResponse.json({
      contentIds: data?.map((d) => d.id) || [],
      message: "All content generated successfully",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
