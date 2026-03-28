"use client";

import { useState } from "react";
import {
  Palette,
  Image,
  MonitorSmartphone,
  Tv2,
  Plus,
  X,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader, EmptyState, GenerateButton } from "@/components/shared";
import type { AdCreativeResult } from "@/skills/ad-creative-generator";

type Platform = "facebook" | "google_display" | "instagram";
type Objective = "awareness" | "consideration" | "conversion";

const PLATFORMS: { value: Platform; label: string; Icon: LucideIcon }[] = [
  { value: "facebook", label: "Facebook", Icon: MonitorSmartphone },
  { value: "instagram", label: "Instagram", Icon: Tv2 },
  { value: "google_display", label: "Google Display", Icon: Image },
];

const OBJECTIVES: { value: Objective; label: string }[] = [
  { value: "awareness", label: "Brand Awareness" },
  { value: "consideration", label: "Consideration" },
  { value: "conversion", label: "Conversions" },
];

const AGE_BRACKETS = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
  "18-44",
  "25-54",
];

export default function AdCreativeGenerator() {
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [objective, setObjective] = useState<Objective>("conversion");
  const [sourceContent, setSourceContent] = useState("");
  const [productService, setProductService] = useState("");

  // Audience
  const [ageBracket, setAgeBracket] = useState("25-44");
  const [countries, setCountries] = useState<string[]>(["United States"]);
  const [countryInput, setCountryInput] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [regionInput, setRegionInput] = useState("");
  const [genderRatio, setGenderRatio] = useState("");

  const [creatives, setCreatives] = useState<AdCreativeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const addTag = (
    list: string[],
    setList: (v: string[]) => void,
    input: string,
    setInput: (v: string) => void,
  ) => {
    const val = input.trim();
    if (val && !list.includes(val)) setList([...list, val]);
    setInput("");
  };

  const removeTag = (
    list: string[],
    setList: (v: string[]) => void,
    item: string,
  ) => setList(list.filter((x) => x !== item));

  const generate = async () => {
    if (!sourceContent.trim() || !productService.trim()) return;
    setLoading(true);
    setError(null);
    setCreatives([]);
    setLoadedImages({});
    try {
      const res = await fetch("/api/ad-creatives/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContent,
          platform,
          objective,
          productService,
          audience: { ageBracket, countries, regions, genderRatio },
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.creatives) setCreatives(data.creatives);
    } catch (e) {
      setError("Failed to generate creatives");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = sourceContent.trim() && productService.trim();

  return (
    <div>
      <SectionHeader
        icon={<Palette className="w-5 h-5 text-blue-600" />}
        title="Ad Creative Generator"
        description="AI generates 5 high-quality image creatives, each more refined than the last."
      />

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5">
        {/* Platform */}
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
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
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
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product + source */}
        <input
          type="text"
          value={productService}
          onChange={(e) => setProductService(e.target.value)}
          placeholder="Product / Service name"
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <textarea
          value={sourceContent}
          onChange={(e) => setSourceContent(e.target.value)}
          rows={5}
          placeholder="Source content — product description, key benefits, tagline..."
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-y min-h-[120px]"
        />

        {/* Target Audience */}
        <div className="border border-gray-200 rounded-xl bg-white p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Target Audience
          </p>

          {/* Age bracket */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Age Bracket
            </label>
            <div className="flex gap-2 flex-wrap">
              {AGE_BRACKETS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAgeBracket(a)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    ageBracket === a
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Target Countries
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {countries.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                >
                  {c}
                  <button onClick={() => removeTag(countries, setCountries, c)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addTag(countries, setCountries, countryInput, setCountryInput)
                }
                placeholder="Add country and press Enter"
                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() =>
                  addTag(countries, setCountries, countryInput, setCountryInput)
                }
                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* States / Cities */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              States / Cities (optional)
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {regions.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs"
                >
                  {r}
                  <button onClick={() => removeTag(regions, setRegions, r)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addTag(regions, setRegions, regionInput, setRegionInput)
                }
                placeholder="Add state or city and press Enter"
                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() =>
                  addTag(regions, setRegions, regionInput, setRegionInput)
                }
                className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Gender ratio */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Gender Ratio (optional)
            </label>
            <input
              type="text"
              value={genderRatio}
              onChange={(e) => setGenderRatio(e.target.value)}
              placeholder="e.g. 60% female, 40% male — leave blank for any"
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <GenerateButton
          onClick={generate}
          loading={loading}
          label="Generate 5 Ad Creatives"
          loadingLabel="Generating creatives..."
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading skeleton — horizontal carousel */}
      {loading && (
        <div className="mt-6">
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-none w-80 bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse snap-start"
              >
                <div className="bg-gray-200 h-48 w-full" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results — horizontal carousel */}
      {!loading && creatives.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-gray-400 mb-3">
            {creatives.length} creatives · {creatives[0]?.dimensions}px · scroll
            to compare →
          </p>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
            {creatives.map((c, i) => (
              <CreativeCard
                key={c.id || i}
                creative={c}
                index={i}
                loaded={!!loadedImages[c.id]}
                onLoad={() =>
                  setLoadedImages((prev) => ({ ...prev, [c.id]: true }))
                }
              />
            ))}
          </div>
        </div>
      )}

      {!loading && creatives.length === 0 && !error && (
        <EmptyState
          icon={<Palette className="w-10 h-10 text-gray-400" />}
          message="Fill in the details above and generate 5 AI image creatives"
        />
      )}
    </div>
  );
}

function CreativeCard({
  creative,
  index,
  loaded,
  onLoad,
}: {
  creative: AdCreativeResult;
  index: number;
  loaded: boolean;
  onLoad: () => void;
}) {
  const iterationColors = [
    "bg-gray-100 text-gray-600",
    "bg-blue-50 text-blue-600",
    "bg-purple-50 text-purple-600",
    "bg-orange-50 text-orange-600",
    "bg-green-50 text-green-700",
  ];

  return (
    <div className="flex-none w-80 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow snap-start">
      {/* Image */}
      <div className="relative bg-gray-100 overflow-hidden h-48">
        {!loaded && creative.imageUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Rendering...</span>
          </div>
        )}
        {!creative.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-red-400">Generation failed</span>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={creative.imageUrl}
          alt={creative.adAngle}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={onLoad}
          onError={onLoad}
        />
        {/* Iteration badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${iterationColors[index] || iterationColors[0]}`}
          >
            v{index + 1}
          </span>
        </div>
        {/* Download */}
        <a
          href={creative.imageUrl}
          download={`creative-v${index + 1}.jpg`}
          target="_blank"
          rel="noreferrer"
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-gray-700" />
        </a>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-xs text-gray-700 font-medium leading-snug">
          {creative.adAngle}
        </p>
        {index > 0 && (
          <p className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block">
            ↑ {creative.improvement}
          </p>
        )}
      </div>
    </div>
  );
}
