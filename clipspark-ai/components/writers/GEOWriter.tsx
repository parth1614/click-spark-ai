"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import {
  TopicBar,
  CopyButton,
  ContentCard,
  SectionHeader,
  EmptyState,
} from "@/components/shared";

interface GEOContent {
  optimizedArticle: string;
  citationSuggestions: string[];
  entityMarkup: Array<{ entity: string; type: string; description: string }>;
  conversationalSnippets: string[];
  structuredData: string;
  optimizationTips: string[];
}

type GEOTab = "article" | "snippets" | "entities" | "schema" | "tips";

export default function GEOWriter() {
  const [topic, setTopic] = useState("");
  const [engine, setEngine] = useState<string>("all");
  const [content, setContent] = useState<GEOContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<GEOTab>("article");

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/content/generate-geo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, targetEngine: engine }),
      });
      const data = await res.json();
      if (data.content) setContent(data.content);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: GEOTab; label: string }[] = [
    { id: "article", label: "Article" },
    { id: "snippets", label: "AI Snippets" },
    { id: "entities", label: "Entities" },
    { id: "schema", label: "Schema" },
    { id: "tips", label: "Tips" },
  ];

  return (
    <div>
      <SectionHeader
        icon={<Bot className="w-5 h-5 text-purple-600" />}
        title="GEO — Generative Engine Optimization"
        description="Optimize content to appear in AI-generated answers from ChatGPT, Perplexity, Gemini, and more."
      />
      <TopicBar
        topic={topic}
        setTopic={setTopic}
        onGenerate={generate}
        loading={loading}
      >
        <select
          value={engine}
          onChange={(e) => setEngine(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        >
          <option value="all">All AI Engines</option>
          <option value="chatgpt">ChatGPT</option>
          <option value="perplexity">Perplexity</option>
          <option value="gemini">Gemini</option>
        </select>
      </TopicBar>

      <div className="mt-6">
        {!content && !loading && (
          <EmptyState
            icon={<Bot className="w-10 h-10 text-gray-500" />}
            message="Enter a topic to generate GEO-optimized content"
          />
        )}
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-600">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
            Generating GEO content...
          </div>
        )}
        {!loading && content && (
          <>
            <div
              className="flex gap-1 mb-4 bg-white rounded-lg p-1"
              role="tablist"
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 text-sm rounded-md transition-colors ${tab === t.id ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-700"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "article" && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-900 font-medium">
                    GEO-Optimized Article
                  </span>
                  <CopyButton text={content.optimizedArticle} />
                </div>
                <div className="p-5 text-gray-700 text-sm whitespace-pre-line max-h-[500px] overflow-y-auto leading-relaxed">
                  {content.optimizedArticle}
                </div>
                {content.citationSuggestions.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Suggested Citations
                    </span>
                    <ul className="mt-2 space-y-1">
                      {content.citationSuggestions.map((c, i) => (
                        <li key={i} className="text-xs text-purple-600">
                          • {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {tab === "snippets" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Short answers optimized for AI chat responses
                </p>
                {content.conversationalSnippets.map((s, i) => (
                  <ContentCard
                    key={i}
                    label={`Snippet ${i + 1}`}
                    labelColor="text-purple-600"
                    text={s}
                  />
                ))}
              </div>
            )}

            {tab === "entities" && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-xs">
                      <th className="text-left p-3">Entity</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.entityMarkup.map((e, i) => (
                      <tr key={i} className="border-b border-gray-200/50">
                        <td className="p-3 text-gray-900">{e.entity}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                            {e.type}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{e.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "schema" && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-900 font-medium">
                    JSON-LD Structured Data
                  </span>
                  <CopyButton text={content.structuredData} />
                </div>
                <pre className="p-5 text-green-600 text-xs overflow-x-auto max-h-[400px]">
                  {content.structuredData}
                </pre>
              </div>
            )}

            {tab === "tips" && (
              <div className="space-y-3">
                {content.optimizationTips.map((tip, i) => (
                  <ContentCard
                    key={i}
                    label={`Tip ${i + 1}`}
                    labelColor="text-yellow-600"
                    text={tip}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
