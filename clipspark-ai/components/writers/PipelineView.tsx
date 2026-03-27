"use client";

import { useState, useCallback } from "react";
import { Zap, Package } from "lucide-react";
import TopicInput from "@/components/TopicInput";
import ScriptEditor from "@/components/ScriptEditor";
import VideoPlayer from "@/components/VideoPlayer";
import ProgressBar from "@/components/ProgressBar";
import {
  SectionHeader,
  ContentCard,
  CopyButton,
  EmptyState,
} from "@/components/shared";

type StepStatus = "pending" | "active" | "done" | "error";

interface PipelineState {
  projectId: string | null;
  scriptId: string | null;
  videoId: string | null;
  topic: string;
  script: {
    hook: string;
    body: string;
    cta: string;
    fullScript: string;
  } | null;
  video: { url: string | null; status: "processing" | "completed" | "failed" };
  content: {
    linkedin: string[];
    twitter: Array<{ hook: string; tweets: string[] }>;
    blog: { title: string; metaDescription: string; content: string } | null;
    email: string[];
  };
}

type ContentTab = "linkedin" | "twitter" | "blog" | "email";

export default function PipelineView() {
  const [state, setState] = useState<PipelineState>({
    projectId: null,
    scriptId: null,
    videoId: null,
    topic: "",
    script: null,
    video: { url: null, status: "processing" },
    content: { linkedin: [], twitter: [], blog: null, email: [] },
  });

  const [steps, setSteps] = useState<{ label: string; status: StepStatus }[]>([
    { label: "Topic", status: "pending" },
    { label: "Script", status: "pending" },
    { label: "Video", status: "pending" },
    { label: "Content", status: "pending" },
  ]);

  const [loading, setLoading] = useState({
    script: false,
    saving: false,
    video: false,
    content: false,
  });
  const [contentTab, setContentTab] = useState<ContentTab>("linkedin");

  const updateStep = (i: number, status: StepStatus) => {
    setSteps((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, status } : s)),
    );
  };

  const handleTopicSubmit = useCallback(
    async (data: {
      topic: string;
      targetAudience: string;
      tone: string;
      videoLength: number;
    }) => {
      setLoading((l) => ({ ...l, script: true }));
      updateStep(0, "active");
      try {
        const projRes = await fetch("/api/projects/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const projData = await projRes.json();
        if (!projRes.ok) throw new Error(projData.error);
        updateStep(0, "done");
        updateStep(1, "active");

        const scriptRes = await fetch("/api/scripts/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: projData.projectId,
            topic: data.topic,
            targetAudience: data.targetAudience,
            tone: data.tone,
            videoLength: data.videoLength,
          }),
        });
        const scriptData = await scriptRes.json();
        if (!scriptRes.ok) throw new Error(scriptData.error);
        updateStep(1, "done");

        setState((s) => ({
          ...s,
          projectId: projData.projectId,
          scriptId: scriptData.scriptId,
          topic: data.topic,
          script: {
            hook: scriptData.hook,
            body: scriptData.body,
            cta: scriptData.cta,
            fullScript: scriptData.fullScript,
          },
        }));
      } catch (err) {
        console.error(err);
        updateStep(0, "error");
        updateStep(1, "error");
      } finally {
        setLoading((l) => ({ ...l, script: false }));
      }
    },
    [],
  );

  const handleSaveScript = useCallback(
    async (data: {
      hook: string;
      body: string;
      cta: string;
      fullScript: string;
    }) => {
      if (!state.scriptId) return;
      setLoading((l) => ({ ...l, saving: true }));
      try {
        await fetch(`/api/scripts/${state.scriptId}/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        setState((s) => ({ ...s, script: data }));
      } finally {
        setLoading((l) => ({ ...l, saving: false }));
      }
    },
    [state.scriptId],
  );

  const handleGenerateVideo = useCallback(
    async (fullScript: string) => {
      if (!state.projectId || !state.scriptId) return;
      setLoading((l) => ({ ...l, video: true }));
      updateStep(2, "active");
      setState((s) => ({ ...s, video: { url: null, status: "processing" } }));
      try {
        const res = await fetch("/api/videos/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: state.projectId,
            scriptId: state.scriptId,
            scriptText: fullScript,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setState((s) => ({ ...s, videoId: data.videoId }));
        const poll = setInterval(async () => {
          const sr = await fetch(`/api/videos/${data.videoId}/status`);
          const sd = await sr.json();
          if (sd.status === "completed") {
            clearInterval(poll);
            setState((s) => ({
              ...s,
              video: { url: sd.videoUrl, status: "completed" },
            }));
            updateStep(2, "done");
            setLoading((l) => ({ ...l, video: false }));
          } else if (sd.status === "failed") {
            clearInterval(poll);
            setState((s) => ({ ...s, video: { url: null, status: "failed" } }));
            updateStep(2, "error");
            setLoading((l) => ({ ...l, video: false }));
          }
        }, 5000);
      } catch {
        setState((s) => ({ ...s, video: { url: null, status: "failed" } }));
        updateStep(2, "error");
        setLoading((l) => ({ ...l, video: false }));
      }
    },
    [state.projectId, state.scriptId],
  );

  const handleGenerateContent = useCallback(async () => {
    if (!state.projectId || !state.scriptId) return;
    setLoading((l) => ({ ...l, content: true }));
    updateStep(3, "active");
    try {
      const res = await fetch("/api/content/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: state.projectId,
          scriptId: state.scriptId,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const cr = await fetch(`/api/content/${state.projectId}/all`);
      const cd = await cr.json();
      setState((s) => ({ ...s, content: cd }));
      updateStep(3, "done");
    } catch {
      updateStep(3, "error");
    } finally {
      setLoading((l) => ({ ...l, content: false }));
    }
  }, [state.projectId, state.scriptId]);

  const CONTENT_TABS: ContentTab[] = ["linkedin", "twitter", "blog", "email"];
  const hasContent =
    state.content.linkedin.length > 0 ||
    state.content.twitter.length > 0 ||
    state.content.blog ||
    state.content.email.length > 0;

  return (
    <div>
      <SectionHeader
        icon={<Zap className="w-5 h-5 text-yellow-600" />}
        title="Full Content Pipeline"
        description="Topic → Script → Video → 50+ content pieces in one flow."
      />
      <ProgressBar steps={steps} />
      <div className="space-y-6">
        <TopicInput onSubmit={handleTopicSubmit} loading={loading.script} />
        {state.script && (
          <ScriptEditor
            hook={state.script.hook}
            body={state.script.body}
            cta={state.script.cta}
            onSave={handleSaveScript}
            onRegenerate={() => {
              if (state.topic)
                handleTopicSubmit({
                  topic: state.topic,
                  targetAudience: "",
                  tone: "professional",
                  videoLength: 90,
                });
            }}
            onGenerateVideo={handleGenerateVideo}
            saving={loading.saving}
            regenerating={loading.script}
            generatingVideo={loading.video}
          />
        )}
        {(state.videoId || loading.video) && (
          <VideoPlayer
            videoUrl={state.video.url}
            status={state.video.status}
            onRetry={() => {
              if (state.script) handleGenerateVideo(state.script.fullScript);
            }}
          />
        )}

        {/* Content generation */}
        {state.script && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Generated Content
              </h2>
              <button
                onClick={handleGenerateContent}
                disabled={loading.content}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white rounded-lg transition-colors text-sm"
              >
                {loading.content
                  ? "Generating..."
                  : hasContent
                    ? "Regenerate All"
                    : "Generate All Content"}
              </button>
            </div>
            {!hasContent && !loading.content && (
              <EmptyState
                icon={<Package className="w-10 h-10 text-gray-500" />}
                message="Generate all content from your script"
              />
            )}
            {loading.content && (
              <div className="flex items-center justify-center py-12 text-gray-600">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
                Generating all content...
              </div>
            )}
            {hasContent && !loading.content && (
              <>
                <div
                  className="flex gap-1 mb-4 bg-white rounded-lg p-1"
                  role="tablist"
                >
                  {CONTENT_TABS.map((t) => (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={contentTab === t}
                      onClick={() => setContentTab(t)}
                      className={`flex-1 py-2 text-sm rounded-md capitalize transition-colors ${contentTab === t ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-700"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {contentTab === "linkedin" &&
                  state.content.linkedin.map((p, i) => (
                    <ContentCard
                      key={i}
                      label={`Post ${i + 1}`}
                      labelColor="text-blue-600"
                      text={p}
                    />
                  ))}
                {contentTab === "twitter" &&
                  state.content.twitter.map((t, i) => (
                    <ContentCard
                      key={i}
                      label={`Thread ${i + 1}`}
                      labelColor="text-sky-600"
                    >
                      <div className="flex justify-end mb-2">
                        <CopyButton text={[t.hook, ...t.tweets].join("\n\n")} />
                      </div>
                      <p className="text-gray-900 text-sm font-medium mb-2">
                        {t.hook}
                      </p>
                      {t.tweets.map((tw, j) => (
                        <p
                          key={j}
                          className="text-gray-700 text-sm border-l-2 border-gray-200 pl-3 mb-2"
                        >
                          {tw}
                        </p>
                      ))}
                    </ContentCard>
                  ))}
                {contentTab === "blog" && state.content.blog && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-emerald-600">
                        {state.content.blog.title}
                      </span>
                      <CopyButton text={state.content.blog.content} />
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-line max-h-96 overflow-y-auto">
                      {state.content.blog.content}
                    </div>
                  </div>
                )}
                {contentTab === "email" &&
                  state.content.email.map((s, i) => (
                    <ContentCard
                      key={i}
                      label={`Snippet ${i + 1}`}
                      labelColor="text-orange-600"
                      text={s}
                    />
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
