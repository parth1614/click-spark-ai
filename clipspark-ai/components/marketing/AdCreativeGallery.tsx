"use client";

import { useState, useEffect } from "react";
import {
  Download,
  RefreshCw,
  ExternalLink,
  Calendar,
  Layers,
} from "lucide-react";

interface AdCreativeRow {
  id: string;
  platform: string;
  storage_url: string;
  storage_path: string;
  ad_angle: string;
  improvement: string;
  dimensions: string;
  iteration: number;
  metadata: { objective?: string; productService?: string } | null;
  created_at: string;
}

export default function AdCreativeGallery() {
  const [creatives, setCreatives] = useState<AdCreativeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchCreatives = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ad-creatives/gallery");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCreatives(data.creatives ?? []);
    } catch (err) {
      console.error("Gallery fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatives();
  }, []);

  const platforms = Array.from(new Set(creatives.map((c) => c.platform)));
  const filtered =
    filter === "all"
      ? creatives
      : creatives.filter((c) => c.platform === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Ad Creatives Gallery
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {creatives.length} creative{creatives.length !== 1 ? "s" : ""}{" "}
            generated
          </p>
        </div>
        <button
          onClick={fetchCreatives}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Platform filter */}
      {platforms.length > 1 && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                filter === p
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && creatives.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No creatives yet</p>
          <p className="text-sm mt-1">Generate ad creatives to see them here</p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((creative) => (
            <GalleryCard key={creative.id} creative={creative} />
          ))}
        </div>
      )}
    </div>
  );
}

const ITERATION_COLORS = [
  "bg-gray-100 text-gray-600",
  "bg-blue-50 text-blue-600",
  "bg-purple-50 text-purple-600",
  "bg-orange-50 text-orange-600",
  "bg-green-50 text-green-700",
];

function GalleryCard({ creative }: { creative: AdCreativeRow }) {
  const [loaded, setLoaded] = useState(false);
  const colorClass =
    ITERATION_COLORS[(creative.iteration - 1) % ITERATION_COLORS.length];
  const date = new Date(creative.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative bg-gray-100 h-48 overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={creative.storage_url}
          alt={creative.ad_angle || "Ad creative"}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}
          >
            v{creative.iteration}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm text-gray-700 capitalize">
            {creative.platform}
          </span>
        </div>
        {/* Actions */}
        <div className="absolute top-2 right-2 flex gap-1">
          <a
            href={creative.storage_url}
            download
            target="_blank"
            rel="noreferrer"
            className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gray-700" />
          </a>
          <a
            href={creative.storage_url}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-700" />
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        {creative.ad_angle && (
          <p className="text-xs text-gray-700 font-medium leading-snug">
            {creative.ad_angle}
          </p>
        )}
        {creative.improvement && creative.iteration > 1 && (
          <p className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block">
            ↑ {creative.improvement}
          </p>
        )}
        <div className="flex items-center gap-2 text-[10px] text-gray-400 pt-1">
          <Calendar className="w-3 h-3" />
          {date}
          {creative.dimensions && <span>· {creative.dimensions}</span>}
        </div>
        {creative.metadata?.productService && (
          <p className="text-[10px] text-gray-400 truncate">
            {creative.metadata.productService}
          </p>
        )}
      </div>
    </div>
  );
}
