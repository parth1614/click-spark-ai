"use client";

import { useState } from "react";

interface TopicInputProps {
  onSubmit: (data: {
    topic: string;
    targetAudience: string;
    tone: string;
    videoLength: number;
  }) => void;
  loading?: boolean;
}

export default function TopicInput({ onSubmit, loading }: TopicInputProps) {
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("professional");
  const [videoLength, setVideoLength] = useState(90);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSubmit({ topic, targetAudience, tone, videoLength });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-50 rounded-xl p-6 border border-gray-200"
    >
      <div>
        <label
          htmlFor="topic"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Topic *
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Why distribution beats product quality"
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="audience"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Target Audience
          </label>
          <input
            id="audience"
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g. B2B founders"
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="tone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tone
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="educational">Educational</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="length"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Video Length
          </label>
          <select
            id="length"
            value={videoLength}
            onChange={(e) => setVideoLength(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={60}>60 seconds</option>
            <option value={90}>90 seconds</option>
            <option value={120}>120 seconds</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? "Generating Script..." : "Generate Script →"}
      </button>
    </form>
  );
}
