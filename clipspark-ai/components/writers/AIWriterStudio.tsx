"use client";

import { useState } from "react";
import {
  Sparkles,
  FileText,
  List,
  BookOpen,
  Scale,
  BarChart3,
  Newspaper,
  Tag,
  Rocket,
  Megaphone,
  Play,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CopyButton,
  SectionHeader,
  EmptyState,
  GenerateButton,
} from "@/components/shared";

type WriterFormat =
  | "article"
  | "listicle"
  | "how-to"
  | "comparison"
  | "case-study"
  | "press-release"
  | "product-description"
  | "landing-page-copy"
  | "ad-copy"
  | "youtube-description";

interface AIResult {
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  suggestedTags: string[];
}

const FORMATS: { value: WriterFormat; label: string; Icon: LucideIcon }[] = [
  { value: "article", label: "Article", Icon: FileText },
  { value: "listicle", label: "Listicle", Icon: List },
  { value: "how-to", label: "How-To Guide", Icon: BookOpen },
  { value: "comparison", label: "Comparison", Icon: Scale },
  { value: "case-study", label: "Case Study", Icon: BarChart3 },
  { value: "press-release", label: "Press Release", Icon: Newspaper },
  { value: "product-description", label: "Product Desc.", Icon: Tag },
  { value: "landing-page-copy", label: "Landing Page", Icon: Rocket },
  { value: "ad-copy", label: "Ad Copy", Icon: Megaphone },
  { value: "youtube-description", label: "YouTube Desc.", Icon: Play },
];

export default function AIWriterStudio() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<WriterFormat>("article");
  const [tone, setTone] = useState("Professional yet engaging");
  const [audience, setAudience] = useState("");
  const [instructions, setInstructions] = useState("");
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/content/generate-ai-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          format,
          tone,
          targetAudience: audience,
          additionalInstructions: instructions,
        }),
      });
      const data = await res.json();
      if (data.result) setResult(data.result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={<Sparkles className="w-5 h-5 text-pink-600" />}
        title="AI Writer Studio"
        description="Generate any type of content — articles, listicles, ad copy, landing pages, and more."
      />

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your topic or brief..."
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && topic.trim()) generate();
          }}
        />

        <div>
          <label className="text-xs text-gray-500 mb-2 block">
            Content Format
          </label>
          <div className="grid grid-cols-5 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={`p-2 rounded-lg text-xs text-center transition-colors border ${
                  format === f.value
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-600"
                }`}
              >
                <f.Icon className="w-5 h-5 mx-auto mb-1" />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="Tone (e.g., Professional, Casual)"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Target audience"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Additional instructions (optional)..."
          rows={2}
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm resize-none"
        />

        <GenerateButton
          onClick={generate}
          loading={loading}
          label={`Generate ${FORMATS.find((f) => f.value === format)?.label || "Content"}`}
        />
      </div>

      <div className="mt-6">
        {!result && !loading && (
          <EmptyState
            icon={<Sparkles className="w-10 h-10 text-gray-500" />}
            message="Configure your content and hit Generate"
          />
        )}
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-600">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mr-3" />
            Writing your{" "}
            {FORMATS.find((f) => f.value === format)?.label.toLowerCase()}...
          </div>
        )}
        {!loading && result && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {result.title}
                  </h3>
                  <p className="text-gray-600 text-xs mt-1">{result.summary}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-white text-gray-600 rounded text-xs">
                      {result.wordCount} words
                    </span>
                    {result.suggestedTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <CopyButton text={result.content} />
              </div>
            </div>
            <div className="p-5 text-gray-700 text-sm whitespace-pre-line max-h-[600px] overflow-y-auto leading-relaxed">
              {result.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
