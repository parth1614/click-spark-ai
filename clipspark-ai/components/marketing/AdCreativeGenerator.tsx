"use client";

import { useState } from "react";
import { Palette, Image, MonitorSmartphone, SearchCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  SectionHeader,
  EmptyState,
  CopyButton,
  GenerateButton,
} from "@/components/shared";

type Platform = "facebook" | "google_display" | "google_search";
type Objective = "awareness" | "consideration" | "conversion";

interface Creative {
  id: string;
  platform: string;
  creativeType: string;
  primaryText: string;
  headline: string;
  description: string;
  cta: string;
  metadata?: Record<string, unknown>;
}

const PLATFORMS: { value: Platform; label: string; Icon: LucideIcon }[] = [
  { value: "facebook", label: "Facebook / Instagram", Icon: MonitorSmartphone },
  { value: "google_display", label: "Google Display", Icon: Image },
  { value: "google_search", label: "Google Search", Icon: SearchCheck },
];

const OBJECTIVES: { value: Objective; label: string }[] = [
  { value: "awareness", label: "Brand Awareness" },
  { value: "consideration", label: "Consideration / Traffic" },
  { value: "conversion", label: "Conversions / Sales" },
];

export default function AdCreativeGenerator() {
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [objective, setObjective] = useState<Objective>("conversion");
  const [sourceContent, setSourceContent] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [productService, setProductService] = useState("");
  const [cta, setCta] = useState("");
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (
      !sourceContent.trim() ||
      !targetAudience.trim() ||
      !productService.trim()
    )
      return;
    setLoading(true);
    try {
      const res = await fetch("/api/ad-creatives/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContent,
          platform,
          objective,
          targetAudience,
          productService,
          cta,
        }),
      });
      const data = await res.json();
      if (data.creatives) setCreatives(data.creatives);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={<Palette className="w-5 h-5 text-blue-600" />}
        title="Ad Creative Generator"
        description="Generate platform-specific ad creatives from your content. Facebook, Google Display, and Google Search."
      />

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
        {/* Platform selector */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Platform</label>
          <div className="flex gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`flex-1 p-3 rounded-lg text-sm text-center transition-colors border ${
                  platform === p.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-600"
                }`}
              >
                <p.Icon className="w-5 h-5 mx-auto mb-1" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Objective */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">
            Campaign Objective
          </label>
          <div className="flex gap-2">
            {OBJECTIVES.map((o) => (
              <button
                key={o.value}
                onClick={() => setObjective(o.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors border ${
                  objective === o.value
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-600"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={sourceContent}
          onChange={(e) => setSourceContent(e.target.value)}
          rows={3}
          placeholder="Paste your source content (script, blog post, or product description)..."
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
        />

        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            value={productService}
            onChange={(e) => setProductService(e.target.value)}
            placeholder="Product / Service name"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="Target audience"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <input
            type="text"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            placeholder="CTA (optional)"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <GenerateButton
          onClick={generate}
          loading={loading}
          label="Generate Ad Creatives"
          loadingLabel="Generating creatives..."
        />
      </div>

      {/* Results */}
      <div className="mt-6 space-y-4">
        {creatives.length === 0 && !loading && (
          <EmptyState
            icon={<Palette className="w-10 h-10 text-gray-500" />}
            message="Configure your campaign and generate ad creatives"
          />
        )}
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-600">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
            Generating 5 ad creatives for{" "}
            {PLATFORMS.find((p) => p.value === platform)?.label}...
          </div>
        )}
        {!loading &&
          creatives.map((c, i) => (
            <div
              key={c.id || i}
              className="bg-white rounded-lg overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                    {c.creativeType}
                  </span>
                  <span className="text-xs text-gray-500">
                    Creative {i + 1}
                  </span>
                  {c.metadata && "adAngle" in c.metadata && (
                    <span className="text-xs text-gray-600">
                      — {String(c.metadata.adAngle)}
                    </span>
                  )}
                </div>
                <CopyButton
                  text={`${c.primaryText}\n\n${c.headline}\n${c.description}`}
                />
              </div>
              <div className="p-4 space-y-3">
                {c.primaryText && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Primary Text
                    </span>
                    <p className="text-gray-800 text-sm mt-0.5">
                      {c.primaryText}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Headline
                    </span>
                    <p className="text-gray-900 text-sm font-medium mt-0.5">
                      {c.headline}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Description
                    </span>
                    <p className="text-gray-700 text-sm mt-0.5">
                      {c.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded">
                    {c.cta}
                  </span>
                  {c.metadata &&
                    "suggestedKeywords" in c.metadata &&
                    Array.isArray(c.metadata.suggestedKeywords) && (
                      <div className="flex gap-1 flex-wrap">
                        {(c.metadata.suggestedKeywords as string[]).map(
                          (kw, j) => (
                            <span
                              key={j}
                              className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px]"
                            >
                              {kw}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
