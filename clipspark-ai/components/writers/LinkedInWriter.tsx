"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import {
  TopicBar,
  ContentCard,
  SectionHeader,
  EmptyState,
} from "@/components/shared";

export default function LinkedInWriter() {
  const [topic, setTopic] = useState("");
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/content/generate-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
        description="Generate 5 LinkedIn post variations optimized for engagement and reach."
      />
      <TopicBar
        topic={topic}
        setTopic={setTopic}
        onGenerate={generate}
        loading={loading}
      />
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
            Generating 5 LinkedIn posts...
          </div>
        )}
        {!loading &&
          posts.map((post, i) => (
            <ContentCard
              key={i}
              label={`${LABELS[i] || `Post ${i + 1}`}`}
              labelColor="text-blue-600"
              text={post}
            />
          ))}
      </div>
    </div>
  );
}
