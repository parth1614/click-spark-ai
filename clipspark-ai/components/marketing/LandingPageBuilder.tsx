"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Plus,
  Trash2,
  Loader2,
  Copy,
  Check,
  Image,
  ExternalLink,
} from "lucide-react";

interface LeadFormField {
  label: string;
  type: "text" | "email" | "number" | "tel" | "textarea";
  required: boolean;
}

interface AdCreativeOption {
  id: string;
  storage_url: string;
  ad_angle: string;
  platform: string;
}

export default function LandingPageBuilder() {
  // Form state
  const [productService, setProductService] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [themeColor, setThemeColor] = useState("#1a73e8");
  const [selectedCreative, setSelectedCreative] =
    useState<AdCreativeOption | null>(null);
  const [leadFields, setLeadFields] = useState<LeadFormField[]>([
    { label: "Full Name", type: "text", required: true },
    { label: "Email", type: "email", required: true },
  ]);

  // Creatives from gallery
  const [creatives, setCreatives] = useState<AdCreativeOption[]>([]);
  const [loadingCreatives, setLoadingCreatives] = useState(true);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ id: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/ad-creatives/gallery")
      .then((r) => r.json())
      .then((d) => setCreatives(d.creatives ?? []))
      .catch(() => {})
      .finally(() => setLoadingCreatives(false));
  }, []);

  const addField = () => {
    setLeadFields((f) => [...f, { label: "", type: "text", required: false }]);
  };

  const removeField = (i: number) => {
    setLeadFields((f) => f.filter((_, idx) => idx !== i));
  };

  const updateField = (
    i: number,
    key: keyof LeadFormField,
    value: string | boolean,
  ) => {
    setLeadFields((f) =>
      f.map((field, idx) => (idx === i ? { ...field, [key]: value } : field)),
    );
  };

  const handleGenerate = async () => {
    if (!productService.trim() || !description.trim()) return;
    setGenerating(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/landing-pages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productService,
          description,
          adCreativeUrl: selectedCreative?.storage_url || null,
          tone,
          leadFormFields: leadFields.filter((f) => f.label.trim()),
          themeColor,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Generation failed");
      }

      const data = await res.json();
      setResult({ id: data.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const pageUrl = result ? `${window.location.origin}/lp/${result.id}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          Landing Page Builder
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Generate an AI-powered landing page with a lead capture form
        </p>
      </div>

      {/* Success banner */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
          <p className="text-green-800 font-semibold">Landing page created!</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={pageUrl}
              className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm text-gray-700 font-mono"
            />
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={pageUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          </div>
        </div>
      )}

      {/* Main form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Content config */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Page Content
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Product / Service Name
              </label>
              <input
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                placeholder="e.g. ClickSpark AI"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                What should the page be about?
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the offer, key selling points, target audience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual & Friendly</option>
                  <option value="bold">Bold & Urgent</option>
                  <option value="luxury">Luxury & Premium</option>
                  <option value="playful">Playful & Fun</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Theme Color
                </label>
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-12 h-9 rounded-lg border border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Ad Creative picker */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Hero Image (from Ad Creatives)
            </h3>
            {loadingCreatives ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading
                creatives...
              </div>
            ) : creatives.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                No ad creatives found. Generate some first.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {creatives.map((c) => (
                  <button
                    key={c.id}
                    onClick={() =>
                      setSelectedCreative(
                        selectedCreative?.id === c.id ? null : c,
                      )
                    }
                    className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${
                      selectedCreative?.id === c.id
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.storage_url}
                      alt={c.ad_angle}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Lead form builder */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              Lead Capture Form
            </h3>
            <button
              onClick={addField}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add Field
            </button>
          </div>

          <div className="space-y-3">
            {leadFields.map((field, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <input
                    value={field.label}
                    onChange={(e) => updateField(i, "label", e.target.value)}
                    placeholder="Field label"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={field.type}
                      onChange={(e) => updateField(i, "type", e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="tel">Phone</option>
                      <option value="textarea">Textarea</option>
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(i, "required", e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      Required
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => removeField(i)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {leadFields.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">
              No form fields yet. Click &quot;Add Field&quot; above.
            </p>
          )}

          {/* Preview */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Form Preview
            </p>
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              {leadFields
                .filter((f) => f.label.trim())
                .map((f, i) => (
                  <div key={i}>
                    <label className="block text-xs text-gray-600 mb-0.5">
                      {f.label}
                      {f.required && (
                        <span className="text-red-500 ml-0.5">*</span>
                      )}
                    </label>
                    {f.type === "textarea" ? (
                      <textarea
                        disabled
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white resize-none"
                      />
                    ) : (
                      <input
                        disabled
                        type={f.type}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                      />
                    )}
                  </div>
                ))}
              {leadFields.filter((f) => f.label.trim()).length > 0 && (
                <button
                  disabled
                  className="w-full py-1.5 rounded text-xs font-medium text-white mt-1"
                  style={{ backgroundColor: themeColor }}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generate button */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}
      <button
        onClick={handleGenerate}
        disabled={generating || !productService.trim() || !description.trim()}
        className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ backgroundColor: themeColor }}
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Landing Page...
          </>
        ) : (
          <>
            <Globe className="w-4 h-4" />
            Generate Landing Page
          </>
        )}
      </button>
    </div>
  );
}
