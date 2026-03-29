"use client";

import { useState, useEffect } from "react";
import { FileText, Image } from "lucide-react";
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

interface SavedItem {
  id: string;
  topic: string;
  content: { blog: Blog };
  visual_url: string | null;
  created_at: string;
}

export default function BlogWriter() {
  const [tab, setTab] = useState<"create" | "saved">("create");
  const [topic, setTopic] = useState("");
  const [blog, setBlog] = useState<Blog | null>(null);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setVisualUrl(null);
    try {
      const res = await fetch("/api/content/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.blog) setBlog(data.blog);
      if (data.visualUrl) setVisualUrl(data.visualUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/content/saved?type=blog");
      const data = await res.json();
      setSaved(data.items ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (tab === "saved") fetchSaved();
  }, [tab]);

  const renderBlog = (b: Blog, vUrl: string | null) => (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {vUrl && (
        <div className="border-b border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vUrl}
            alt="Blog visual"
            className="w-full max-h-56 object-contain bg-white"
          />
          <div className="px-3 py-2 bg-gray-50 flex items-center gap-1.5 text-xs text-gray-500">
            <Image className="w-3.5 h-3.5" /> Visual by Napkin AI
          </div>
        </div>
      )}
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{b.title}</h3>
            <p className="text-gray-600 text-xs mt-1">{b.metaDescription}</p>
          </div>
          <CopyButton text={b.content} />
        </div>
      </div>
      <div className="p-5 text-gray-700 text-sm whitespace-pre-line max-h-[600px] overflow-y-auto leading-relaxed">
        {b.content}
      </div>
    </div>
  );

  return (
    <div>
      <SectionHeader
        icon={<FileText className="w-5 h-5 text-emerald-600" />}
        title="Blog Post Writer"
        description="Generate SEO-friendly blog posts with AI-generated visuals."
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("create")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "create"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Create New
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "saved"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Already Generated
        </button>
      </div>

      {tab === "create" && (
        <>
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
                Writing blog post + generating visual...
              </div>
            )}
            {!loading && blog && renderBlog(blog, visualUrl)}
          </div>
        </>
      )}

      {tab === "saved" && (
        <div className="space-y-4">
          {loadingSaved && (
            <div className="flex items-center justify-center py-12 text-gray-600">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3" />
              Loading...
            </div>
          )}
          {!loadingSaved && saved.length === 0 && (
            <EmptyState
              icon={<FileText className="w-10 h-10 text-gray-500" />}
              message="No saved blog posts yet"
            />
          )}
          {!loadingSaved &&
            saved.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    {item.topic}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                {renderBlog(item.content.blog, item.visual_url)}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
