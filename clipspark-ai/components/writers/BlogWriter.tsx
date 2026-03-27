"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import {
  TopicBar,
  CopyButton,
  SectionHeader,
  EmptyState,
} from "@/components/shared";

interface Blog {
  title: string;
  metaDescription: string;
  content: string;
}

export default function BlogWriter() {
  const [topic, setTopic] = useState("");
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/content/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.blog) setBlog(data.blog);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={<FileText className="w-5 h-5 text-emerald-600" />}
        title="Blog Post Writer"
        description="Generate SEO-friendly blog posts with proper structure and CTAs."
      />
      <TopicBar
        topic={topic}
        setTopic={setTopic}
        onGenerate={generate}
        loading={loading}
      />
      <div className="mt-6">
        {!blog && !loading && (
          <EmptyState
            icon={<FileText className="w-10 h-10 text-gray-500" />}
            message="Enter a topic to generate a blog post"
          />
        )}
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-600">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3" />
            Writing blog post...
          </div>
        )}
        {!loading && blog && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-xs mt-1">
                    {blog.metaDescription}
                  </p>
                </div>
                <CopyButton text={blog.content} />
              </div>
            </div>
            <div className="p-5 text-gray-700 text-sm whitespace-pre-line max-h-[600px] overflow-y-auto leading-relaxed">
              {blog.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
