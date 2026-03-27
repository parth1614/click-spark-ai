"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Video } from "lucide-react";

interface ScriptEditorProps {
  hook: string;
  body: string;
  cta: string;
  onSave: (data: {
    hook: string;
    body: string;
    cta: string;
    fullScript: string;
  }) => void;
  onRegenerate: () => void;
  onGenerateVideo: (fullScript: string) => void;
  saving?: boolean;
  regenerating?: boolean;
  generatingVideo?: boolean;
}

export default function ScriptEditor({
  hook: initialHook,
  body: initialBody,
  cta: initialCta,
  onSave,
  onRegenerate,
  onGenerateVideo,
  saving,
  regenerating,
  generatingVideo,
}: ScriptEditorProps) {
  const [hook, setHook] = useState(initialHook);
  const [body, setBody] = useState(initialBody);
  const [cta, setCta] = useState(initialCta);

  useEffect(() => {
    setHook(initialHook);
    setBody(initialBody);
    setCta(initialCta);
  }, [initialHook, initialBody, initialCta]);

  const fullScript = `${hook}\n\n${body}\n\n${cta}`;
  const wordCount = fullScript.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 2.5); // ~150 wpm spoken

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Script Editor</h2>
        <div className="text-sm text-gray-600">
          {wordCount} words · ~{readingTime}s reading time
        </div>
      </div>

      <div>
        <label
          htmlFor="hook"
          className="block text-sm font-medium text-yellow-600 mb-1"
        >
          Hook (first 10s)
        </label>
        <textarea
          id="hook"
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
        />
      </div>

      <div>
        <label
          htmlFor="body"
          className="block text-sm font-medium text-blue-600 mb-1"
        >
          Body
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label
          htmlFor="cta"
          className="block text-sm font-medium text-green-600 mb-1"
        >
          CTA (last 10s)
        </label>
        <textarea
          id="cta"
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onSave({ hook, body, cta, fullScript })}
          disabled={saving}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors text-sm"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
        >
          {regenerating ? (
            "Regenerating..."
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
              Regenerate
            </>
          )}
        </button>
        <button
          onClick={() => onGenerateVideo(fullScript)}
          disabled={generatingVideo}
          className="ml-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {generatingVideo ? (
            "Generating Video..."
          ) : (
            <>
              <Video className="w-3.5 h-3.5 inline mr-1" />
              Generate Video
            </>
          )}
        </button>
      </div>
    </div>
  );
}
