"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import {
  TopicBar,
  CopyButton,
  SectionHeader,
  EmptyState,
  ContentCard,
} from "@/components/shared";

interface SEOArticle {
  title: string;
  metaDescription: string;
  slug: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  content: string;
  faqSchema: Array<{ question: string; answer: string }>;
}

export default function SEOWriter() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [wordCount, setWordCount] = useState(1500);
  const [article, setArticle] = useState<SEOArticle | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/content/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          keywords: keywords ? keywords.split(",").map((k) => k.trim()) : [],
          wordCount,
        }),
      });
      const data = await res.json();
      if (data.article) setArticle(data.article);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={<Search className="w-5 h-5 text-green-600" />}
        title="SEO Article Writer"
        description="Generate long-form, SEO-optimized articles with keyword targeting, FAQ schema, and meta tags."
      />
      <TopicBar
        topic={topic}
        setTopic={setTopic}
        onGenerate={generate}
        loading={loading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Target keywords (comma-separated)"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          <select
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            <option value={800}>~800 words</option>
            <option value={1200}>~1200 words</option>
            <option value={1500}>~1500 words</option>
            <option value={2000}>~2000 words</option>
            <option value={2500}>~2500 words</option>
          </select>
        </div>
      </TopicBar>

      <div className="mt-6">
        {!article && !loading && (
          <EmptyState
            icon={<Search className="w-10 h-10 text-gray-500" />}
            message="Enter a topic and keywords to generate an SEO article"
          />
        )}
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-600">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mr-3" />
            Writing SEO-optimized article...
          </div>
        )}
        {!loading && article && (
          <div className="space-y-4">
            {/* Meta info */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Title</span>
                  <p className="text-gray-900">{article.title}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Slug</span>
                  <p className="text-green-600 font-mono text-xs mt-1">
                    /{article.slug}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">
                    Meta Description
                  </span>
                  <p className="text-gray-700 text-xs">
                    {article.metaDescription}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Focus Keyword</span>
                  <p className="text-green-600">{article.focusKeyword}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-gray-500 text-xs">
                  Secondary Keywords
                </span>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {article.secondaryKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white text-gray-700 rounded text-xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Article content */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-900 font-medium">
                  Article Content
                </span>
                <CopyButton text={article.content} />
              </div>
              <div className="p-5 text-gray-700 text-sm whitespace-pre-line max-h-[500px] overflow-y-auto leading-relaxed">
                {article.content}
              </div>
            </div>

            {/* FAQ Schema */}
            {article.faqSchema.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">
                  FAQ Schema
                </h3>
                {article.faqSchema.map((faq, i) => (
                  <ContentCard
                    key={i}
                    label={`Q${i + 1}`}
                    labelColor="text-green-600"
                    text={`${faq.question}\n\n${faq.answer}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
