"use client";

import { Download } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string | null;
  status: "processing" | "completed" | "failed";
  onRetry?: () => void;
}

export default function VideoPlayer({
  videoUrl,
  status,
  onRetry,
}: VideoPlayerProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Video</h2>

      {status === "processing" && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Generating video... This may take a few minutes.</p>
        </div>
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center justify-center py-16 text-red-600">
          <p className="mb-4">Video generation failed.</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {status === "completed" && videoUrl && (
        <div className="space-y-4">
          <video src={videoUrl} controls className="w-full rounded-lg bg-black">
            <track kind="captions" />
            Your browser does not support the video tag.
          </video>
          <a
            href={videoUrl}
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" /> Download Video
          </a>
        </div>
      )}
    </div>
  );
}
