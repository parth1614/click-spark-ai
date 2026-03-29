"use client";

import { useState, useEffect } from "react";
import { Briefcase, Image } from "lucide-react";
import {
  TopicBar,
  ContentCard,
  SectionHeader,
  EmptyState,
} from "@/components/shared";

interface SavedItem {
  id: string;
  topic: string;
  content: { posts: string[] };
  visual_url: string | null;
  created_at: string;
}

export default function LinkedInWriter() {
  const [tab, setTab] = useState<"create" | "saved">("create");
  const [topic, setTopic] = useState("");
  const [posts, setPosts] = useState<string[]>([]);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setVisualUrl(null);
    try {
      const res = await fetch("/api/content/generate-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
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
      const res = await fetch("/api/content/saved?type=linkedin");
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

  const LABELS = [
    "Problem-focused",
    "Solution-focused",
    "Story format",
    "Data-driven",
    "Engagement",
  ];

  return (
    <div>
      <SectionHeader
        icon={<Briefcase className="w-5 h-5 text-blue-600" />}
        title="LinkedIn Post Writer"
        description="Generate 5 LinkedIn post variations with AI-generated visuals."
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

          {/* Visual */}
          {visualUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 max-w-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={visualUrl}
                alt="Generated visual"
                className="w-full max-h-56 object-contain bg-gray-50"
              />
              <div className="px-3 py-2 bg-gray-50 flex items-center gap-1.5 text-xs text-gray-500">
                <Image className="w-3.5 h-3.5" /> Visual by Napkin AI
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {posts.length === 0 && !loading && (
              <EmptyState
                icon={<Briefcase className="w-10 h-10 text-gray-500" />}
                message="Enter a topic to generate LinkedIn posts"
              />
            )}
            {loading && (
              <div className="flex items-center justify-center py-12 text-gray-600">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                Generating posts + visual...
              </div>
            )}
            {!loading &&
              posts.map((post, i) => (
                <ContentCard
                  key={i}
                  label={LABELS[i] || `Post ${i + 1}`}
                  labelColor="text-blue-600"
                  text={post}
                />
              ))}
          </div>
        </>
      )}

      {tab === "saved" && (
        <div className="space-y-4">
          {loadingSaved && (
            <div className="flex items-center justify-center py-12 text-gray-600">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
              Loading...
            </div>
          )}
          {!loadingSaved && saved.length === 0 && (
            <EmptyState
              icon={<Briefcase className="w-10 h-10 text-gray-500" />}
              message="No saved LinkedIn posts yet"
            />
          )}
          {!loadingSaved &&
            saved.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    {item.topic}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                {item.visual_url && (
                  <div className="border-b border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.visual_url}
                      alt="Visual"
                      className="w-full max-h-48 object-contain bg-gray-50"
                    />
                  </div>
                )}
                <div className="p-4 space-y-3">
                  {item.content.posts.map((post, i) => (
                    <ContentCard
                      key={i}
                      label={LABELS[i] || `Post ${i + 1}`}
                      labelColor="text-blue-600"
                      text={post}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
