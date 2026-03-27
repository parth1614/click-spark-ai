"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import {
  TopicBar,
  ContentCard,
  SectionHeader,
  EmptyState,
} from "@/components/shared";

export default function EmailWriter() {
  const [topic, setTopic] = useState("");
  const [snippets, setSnippets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/content/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.snippets) setSnippets(data.snippets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const LABELS = ["Quick Tip", "Story / Anecdote", "Announcement"];

  return (
    <div>
      <SectionHeader
        icon={<Mail className="w-5 h-5 text-orange-600" />}
        title="Email Newsletter Writer"
        description="Generate 3 email-ready snippets in different formats for your newsletter."
      />
      <TopicBar
        topic={topic}
        setTopic={setTopic}
        onGenerate={generate}
        loading={loading}
      />
      <div className="mt-6 space-y-4">
        {snippets.length === 0 && !loading && (
          <EmptyState
            icon={<Mail className="w-10 h-10 text-gray-500" />}
            message="Enter a topic to generate email snippets"
          />
        )}
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-600">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mr-3" />
            Writing email snippets...
          </div>
        )}
        {!loading &&
          snippets.map((snippet, i) => (
            <ContentCard
              key={i}
              label={LABELS[i] || `Snippet ${i + 1}`}
              labelColor="text-orange-600"
              text={snippet}
            />
          ))}
      </div>
    </div>
  );
}
