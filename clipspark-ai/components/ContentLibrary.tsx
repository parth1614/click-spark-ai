"use client";

import { useState } from "react";

interface ContentLibraryProps {
  linkedin: string[];
  twitter: Array<{ hook: string; tweets: string[] }>;
  blog: { title: string; metaDescription: string; content: string } | null;
  email: string[];
  loading?: boolean;
  onGenerate: () => void;
}

type Tab = "linkedin" | "twitter" | "blog" | "email";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function ContentLibrary({
  linkedin,
  twitter,
  blog,
  email,
  loading,
  onGenerate,
}: ContentLibraryProps) {
  const [tab, setTab] = useState<Tab>("linkedin");
  const tabs: Tab[] = ["linkedin", "twitter", "blog", "email"];

  const hasContent =
    linkedin.length > 0 || twitter.length > 0 || blog || email.length > 0;

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Content Library</h2>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white rounded-lg transition-colors text-sm"
        >
          {loading
            ? "Generating..."
            : hasContent
              ? "Regenerate All"
              : "Generate All Content"}
        </button>
      </div>

      {!hasContent && !loading && (
        <p className="text-gray-500 text-center py-8">
          No content yet. Generate content from your script.
        </p>
      )}

      {(hasContent || loading) && (
        <>
          <div
            className="flex gap-1 mb-4 bg-white rounded-lg p-1"
            role="tablist"
          >
            {tabs.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm rounded-md capitalize transition-colors ${
                  tab === t
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12 text-gray-600">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
              Generating content...
            </div>
          )}

          {!loading && tab === "linkedin" && (
            <div className="space-y-4">
              {linkedin.map((post, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-blue-600">Post {i + 1}</span>
                    <CopyButton text={post} />
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-line">
                    {post}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!loading && tab === "twitter" && (
            <div className="space-y-4">
              {twitter.map((thread, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-sky-600">Thread {i + 1}</span>
                    <CopyButton
                      text={[thread.hook, ...thread.tweets].join("\n\n")}
                    />
                  </div>
                  <p className="text-gray-900 text-sm font-medium mb-2">
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
                </div>
              ))}
            </div>
          )}

          {!loading && tab === "blog" && blog && (
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-emerald-600">{blog.title}</span>
                <CopyButton text={blog.content} />
              </div>
              <p className="text-gray-600 text-xs mb-3">
                {blog.metaDescription}
              </p>
              <div className="text-gray-700 text-sm whitespace-pre-line max-h-96 overflow-y-auto">
                {blog.content}
              </div>
            </div>
          )}

          {!loading && tab === "email" && (
            <div className="space-y-4">
              {email.map((snippet, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-orange-600">
                      Snippet {i + 1}
                    </span>
                    <CopyButton text={snippet} />
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-line">
                    {snippet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
