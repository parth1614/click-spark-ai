"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  TopicBar,
  ContentCard,
  CopyButton,
  SectionHeader,
  EmptyState,
} from "@/components/shared";

interface Thread {
  hook: string;
  tweets: string[];
}

export default function TwitterWriter() {
  const [topic, setTopic] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/content/generate-twitter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.threads) setThreads(data.threads);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={<MessageCircle className="w-5 h-5 text-sky-600" />}
        title="X / Twitter Thread Writer"
        description="Generate 5 viral-worthy tweet threads with hooks and CTAs."
      />
      <TopicBar
        topic={topic}
        setTopic={setTopic}
        onGenerate={generate}
        loading={loading}
      />
      <div className="mt-6 space-y-4">
        {threads.length === 0 && !loading && (
          <EmptyState
            icon={<MessageCircle className="w-10 h-10 text-gray-500" />}
            message="Enter a topic to generate Twitter threads"
          />
        )}
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-600">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mr-3" />
            Generating 5 Twitter threads...
          </div>
        )}
        {!loading &&
          threads.map((thread, i) => (
            <ContentCard
              key={i}
              label={`Thread ${i + 1}`}
              labelColor="text-sky-600"
            >
              <div className="flex justify-end mb-2">
                <CopyButton
                  text={[thread.hook, ...thread.tweets].join("\n\n")}
                />
              </div>
              <p className="text-gray-900 text-sm font-medium mb-3">
                {thread.hook}
              </p>
              {thread.tweets.map((tweet, j) => (
                <p
                  key={j}
                  className="text-gray-700 text-sm border-l-2 border-gray-200 pl-3 mb-2"
                >
                  {tweet}
                </p>
              ))}
            </ContentCard>
          ))}
      </div>
    </div>
  );
}
