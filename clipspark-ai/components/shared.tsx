"use client";

import { useState, ReactNode } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors shrink-0 flex items-center gap-1"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" /> Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" /> Copy
        </>
      )}
    </button>
  );
}

export function ContentCard({
  label,
  labelColor,
  text,
  children,
}: {
  label: string;
  labelColor?: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs ${labelColor || "text-gray-600"}`}>
          {label}
        </span>
        {text && <CopyButton text={text} />}
      </div>
      {text && !children && (
        <p className="text-gray-700 text-sm whitespace-pre-line">{text}</p>
      )}
      {children}
    </div>
  );
}

export function GenerateButton({
  onClick,
  loading,
  label,
  loadingLabel,
}: {
  onClick: () => void;
  loading: boolean;
  label: string;
  loadingLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 text-white rounded-lg transition-colors text-sm font-medium"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingLabel || "Generating..."}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

export function TopicBar({
  topic,
  setTopic,
  onGenerate,
  loading,
  children,
}: {
  topic: string;
  setTopic: (t: string) => void;
  onGenerate: () => void;
  loading: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your topic..."
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && topic.trim()) onGenerate();
          }}
        />
        <GenerateButton
          onClick={onGenerate}
          loading={loading}
          label="Generate"
        />
      </div>
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  message,
}: {
  icon: ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <div className="mb-3">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        {icon} {title}
      </h2>
      <p className="text-gray-600 text-sm mt-1">{description}</p>
    </div>
  );
}
