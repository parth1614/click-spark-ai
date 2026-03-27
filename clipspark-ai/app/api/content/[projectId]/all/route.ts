import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const { data, error } = await supabase
      .from("content_outputs")
      .select("*")
      .eq("project_id", params.projectId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const linkedin = (data || [])
      .filter((d) => d.content_type === "linkedin")
      .map((d) => d.content_text);
    const twitter = (data || [])
      .filter((d) => d.content_type === "twitter")
      .map((d) => {
        try {
          return JSON.parse(d.content_text);
        } catch {
          return d.content_text;
        }
      });
    const blogRaw = (data || []).find((d) => d.content_type === "blog");
    const blog = blogRaw
      ? (() => {
          try {
            return JSON.parse(blogRaw.content_text);
          } catch {
            return blogRaw.content_text;
          }
        })()
      : null;
    const email = (data || [])
      .filter((d) => d.content_type === "email")
      .map((d) => d.content_text);

    return NextResponse.json({ linkedin, twitter, blog, email });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
