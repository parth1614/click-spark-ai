// ---- Project ----
export interface Project {
  id: string;
  user_id?: string;
  topic: string;
  target_audience?: string;
  tone?: "professional" | "casual" | "educational";
  video_length: number; // seconds
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  topic: string;
  targetAudience?: string;
  tone?: "professional" | "casual" | "educational";
  videoLength: number;
}

// ---- Script ----
export interface Script {
  id: string;
  project_id: string;
  hook: string;
  body: string;
  cta: string;
  full_script: string;
  is_edited: boolean;
  created_at: string;
}

export interface ScriptOutput {
  hook: string;
  body: string;
  cta: string;
  fullScript: string;
  estimatedDuration: string;
}

// ---- Video ----
export interface Video {
  id: string;
  project_id: string;
  script_id: string;
  video_url: string;
  duration?: number;
  status: "processing" | "completed" | "failed";
  provider: string;
  created_at: string;
}

// ---- Content (Phase 2) ----
export interface ContentOutput {
  id: string;
  project_id: string;
  content_type: "linkedin" | "twitter" | "blog" | "email";
  content_text: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ---- Clips (Phase 3) ----
export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface Clip {
  id: string;
  video_id: string;
  title: string;
  start_time: number;
  end_time: number;
  hook?: string;
  clip_url_16_9?: string;
  clip_url_9_16?: string;
  clip_url_1_1?: string;
  status: "processing" | "completed" | "failed";
  created_at: string;
}
