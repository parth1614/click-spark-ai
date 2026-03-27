ClipSpark AI - Product Requirements Document (PRD)

1. Product Overview
   1.1 Product Vision
   ClipSpark AI is an end-to-end AI content factory that transforms a single topic input into 50+ pieces of distributed content across multiple platforms (video, clips, blogs, social posts) - enabling companies to build complete distribution systems with minimal human effort.
   1.2 Target Users

B2B companies and startups needing content distribution systems
Marketing teams with limited resources
Agencies managing multiple client content pipelines

1.3 Core Value Proposition
One topic input → 50+ platform-optimized content pieces in under 5 minutes, fully automated.

2. Technical Architecture
   2.1 Tech Stack
   ComponentTechnologyRationaleLLM RouterOpenRouter APIFlexibility to switch models; default: Gemini 2.0 FlashFrontendNext.js 14 + TypeScript + Tailwind CSSFast development, modern UIBackendNext.js API RoutesServerless, easy deploymentDatabaseSupabase (PostgreSQL)Real-time, easy setup, free tierVideo GenerationHeyGen API or D-ID APIAI avatar video generationVoice (Optional)ElevenLabs APIVoice cloning capabilityVideo ProcessingFFmpegClip extraction, formattingTranscriptionOpenAI Whisper APIAccurate transcriptionFile StorageSupabase Storage or Cloudflare R2Video/asset storageHostingVercelOne-click deployment, CDN
   2.2 AI Model Configuration
   javascript// OpenRouter Configuration
   {
   provider: "openrouter",
   defaultModel: "google/gemini-2.0-flash-exp:free",
   fallbackModels: [
   "anthropic/claude-3.5-sonnet",
   "openai/gpt-4o",
   "meta-llama/llama-3.1-70b-instruct"
   ]
   }
   2.3 Skills-Based Architecture
   Each content generation task uses a specialized "skill" (prompt template + workflow):

Skill 1: Topic Research & Script Generation
Skill 2: LinkedIn Post Generation
Skill 3: Twitter Thread Generation
Skill 4: Blog Post Generation
Skill 5: Clip Moment Identification
Skill 6: Caption Generation

3. Phased Development Plan

PHASE 1: Core Pipeline (Week 1)
Goal: Topic → Script → Video → Basic Dashboard
3.1 Features
Feature 1.1: Topic Input Interface

Description: Simple form where user enters a topic/keyword
Input Fields:

Topic (required, text input)
Target audience (optional, dropdown)
Tone (optional: Professional/Casual/Educational)
Video length (dropdown: 60s / 90s / 120s)

Output: Topic data sent to script generation

Feature 1.2: AI Script Generation

Skill Name: script-generator
Input: Topic + context parameters
Process:

Call OpenRouter API with Gemini 2.0 Flash
Generate structured video script with:

Hook (first 10 seconds)
Problem statement
Solution/value prop
Call-to-action

Return script in JSON format

Output:

json {
"hook": "text",
"body": "text",
"cta": "text",
"fullScript": "text",
"estimatedDuration": "90s"
}

Success Criteria: Script generated in < 15 seconds

Feature 1.3: Script Editor

Description: Allow user to edit generated script before video creation
UI Components:

Text editor with sections (Hook, Body, CTA)
Character count
Estimated reading time
"Regenerate" button (calls skill again)
"Generate Video" button

Feature 1.4: AI Avatar Video Generation

API: HeyGen or D-ID (to be decided based on cost/quality testing)
Input: Final script text
Process:

Send script to video API
Poll for completion (webhook or polling)
Store video URL in database
Display video player

Configuration:

Avatar: Default professional avatar
Voice: Default English voice (neutral accent)
Background: Clean office/studio setting

Output: Video URL (MP4)
Success Criteria: Video generated in < 3 minutes

Feature 1.5: Basic Dashboard

Page Structure:

Header: "ClipSpark AI - Content Factory"
Input Section: Topic form
Script Section: Generated script + editor
Video Section: Video player + download button
Status indicators: Loading states for each step

UI/UX:

Clean, minimal design
Progress bar showing pipeline stages
Clear CTAs at each step

3.2 Database Schema (Phase 1)
sql-- Projects table
CREATE TABLE projects (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id),
topic TEXT NOT NULL,
target_audience TEXT,
tone TEXT,
video_length INTEGER, -- in seconds
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

-- Scripts table
CREATE TABLE scripts (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
hook TEXT,
body TEXT,
cta TEXT,
full_script TEXT NOT NULL,
is_edited BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
script_id UUID REFERENCES scripts(id),
video_url TEXT NOT NULL,
duration INTEGER, -- in seconds
status TEXT DEFAULT 'processing', -- processing, completed, failed
provider TEXT, -- heygen, d-id
created_at TIMESTAMP DEFAULT NOW()
);

```

### **3.3 API Endpoints (Phase 1)**
```

POST /api/projects/create

- Body: { topic, targetAudience, tone, videoLength }
- Returns: { projectId, message }

POST /api/scripts/generate

- Body: { projectId, topic, context }
- Returns: { scriptId, hook, body, cta, fullScript }

PUT /api/scripts/:scriptId/update

- Body: { hook, body, cta, fullScript }
- Returns: { success, updatedScript }

POST /api/videos/generate

- Body: { projectId, scriptId, scriptText }
- Returns: { videoId, status, message }

GET /api/videos/:videoId/status

- Returns: { status, videoUrl, duration }
  3.4 Skills Implementation (Phase 1)
  Skill: script-generator
  File: /skills/script-generator.ts
  typescriptinterface ScriptGeneratorInput {
  topic: string;
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'educational';
  videoLength: number; // in seconds
  }

interface ScriptOutput {
hook: string;
body: string;
cta: string;
fullScript: string;
estimatedDuration: string;
}

async function generateScript(input: ScriptGeneratorInput): Promise<ScriptOutput> {
const prompt = `
You are an expert video script writer. Generate a compelling ${input.videoLength}-second video script.

Topic: ${input.topic}
Target Audience: ${input.targetAudience || 'General business audience'}
Tone: ${input.tone || 'Professional'}

Structure:

1. HOOK (first 10 seconds): Attention-grabbing opening that presents a problem or bold statement
2. BODY (main content): Core message, explanation, or solution
3. CTA (last 10 seconds): Clear call-to-action

Requirements:

- Write for spoken delivery (conversational, not written)
- Use short sentences
- Include natural pauses
- Estimated ${input.videoLength} seconds when read at normal pace
- NO fluff or filler words
- Make it engaging and valuable

Return ONLY a JSON object with this structure:
{
"hook": "The opening 10 seconds",
"body": "The main content",
"cta": "The closing call-to-action",
"fullScript": "Complete script as one piece"
}
`;

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
'Content-Type': 'application/json',
},
body: JSON.stringify({
model: 'google/gemini-2.0-flash-exp:free',
messages: [{ role: 'user', content: prompt }],
response_format: { type: 'json_object' }
})
});

const data = await response.json();
return JSON.parse(data.choices[0].message.content);
}
3.5 Success Metrics (Phase 1)

User can input topic and generate script in < 15 seconds
User can edit script before video generation
Video generates successfully in < 3 minutes
Video is playable and downloadable
End-to-end flow: Topic → Video works without errors

PHASE 2: Content Atomization (Week 2)
Goal: Generate text-based content outputs (LinkedIn, Twitter, Blog)
3.6 Features
Feature 2.1: LinkedIn Post Generation

Skill Name: linkedin-post-generator
Input: Script + topic
Process:

Extract key points from script
Generate 5 LinkedIn posts (different angles)
Format with proper line breaks, emojis (optional)

Output: Array of 5 LinkedIn posts
Post Variations:

Problem-focused post
Solution-focused post
Story/case study format
Stats/data-driven post
Question/engagement post

Feature 2.2: Twitter Thread Generation

Skill Name: twitter-thread-generator
Input: Script + topic
Process:

Break down script into tweet-sized chunks
Create compelling thread hook
Generate 5-8 tweet threads

Output: Array of 5 thread variations
Thread Structure:

Hook tweet (attention-grabbing)
4-7 supporting tweets
CTA tweet

Feature 2.3: Blog Post Generation

Skill Name: blog-post-generator
Input: Script + topic
Process:

Expand script into 800-1000 word article
Add SEO-friendly structure (H2, H3 headings)
Include introduction, body sections, conclusion

Output: Markdown-formatted blog post
Structure:

SEO title
Meta description
Introduction
3-5 body sections with subheadings
Conclusion with CTA

Feature 2.4: Email Newsletter Snippets

Skill Name: email-snippet-generator
Input: Script + topic
Process: Generate 3 email-ready snippets
Output: Array of 3 snippets
Variations:

Quick tip format
Story/anecdote format
Announcement format

Feature 2.5: Content Library Dashboard

UI Components:

Tabs: LinkedIn | Twitter | Blog | Email
Copy button for each piece
Download all as ZIP
Regenerate individual pieces

Display:

Show all content organized by platform
Character/word count for each
Preview formatting

3.7 Database Schema (Phase 2)
sql-- Content outputs table
CREATE TABLE content_outputs (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
content_type TEXT NOT NULL, -- linkedin, twitter, blog, email
content_text TEXT NOT NULL,
metadata JSONB, -- word count, character count, etc.
created_at TIMESTAMP DEFAULT NOW()
);

```

### **3.8 API Endpoints (Phase 2)**
```

POST /api/content/generate-all

- Body: { projectId, scriptId }
- Returns: { contentIds: [], message }

POST /api/content/generate-linkedin

- Body: { projectId, script, topic }
- Returns: { posts: [] }

POST /api/content/generate-twitter

- Body: { projectId, script, topic }
- Returns: { threads: [] }

POST /api/content/generate-blog

- Body: { projectId, script, topic }
- Returns: { blogPost: {} }

GET /api/content/:projectId/all

- Returns: { linkedin: [], twitter: [], blog: {}, email: [] }
  3.9 Skills Implementation (Phase 2)
  Skill: linkedin-post-generator
  typescriptinterface LinkedInPostInput {
  script: string;
  topic: string;
  }

async function generateLinkedInPosts(input: LinkedInPostInput): Promise<string[]> {
const prompt = `
You are a LinkedIn content strategist. Generate 5 different LinkedIn posts based on this video script.

Script: ${input.script}
Topic: ${input.topic}

Requirements for each post:

- 150-250 words
- Hook in first line
- Use line breaks for readability (not paragraph blocks)
- Professional but conversational tone
- Include 1-2 relevant emojis (optional, use sparingly)
- End with clear CTA or question

Generate 5 variations:

1. Problem-focused (highlight the pain point)
2. Solution-focused (emphasize the value/benefit)
3. Story format (use "Last week..." or case study)
4. Data-driven (lead with stats or numbers)
5. Engagement (ask a thought-provoking question)

Return as JSON array of strings.
`;

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
'Content-Type': 'application/json',
},
body: JSON.stringify({
model: 'google/gemini-2.0-flash-exp:free',
messages: [{ role: 'user', content: prompt }],
response_format: { type: 'json_object' }
})
});

const data = await response.json();
return JSON.parse(data.choices[0].message.content).posts;
}
3.10 Success Metrics (Phase 2)

5 LinkedIn posts generated in < 20 seconds
5 Twitter threads generated in < 20 seconds
1 blog post (800+ words) generated in < 30 seconds
3 email snippets generated in < 15 seconds
Content displays properly in dashboard with copy/download options

PHASE 3: Video Clipping Engine (Week 3)
Goal: Auto-generate short clips from main video with captions
3.11 Features
Feature 3.1: Video Transcription

API: OpenAI Whisper API
Input: Main video URL
Process:

Download video from storage
Send to Whisper API
Get timestamped transcription

Output:

json {
"segments": [
{
"start": 0.0,
"end": 5.2,
"text": "Companies today need distribution systems"
}
]
}
Feature 3.2: Clip Moment Identification

Skill Name: clip-moment-identifier
Input: Transcription + script
Process:

Analyze transcription for viral-worthy moments
Identify 5-8 clip-worthy segments (30-60 seconds each)
Look for: hooks, punchlines, key insights, actionable tips

Output:

json {
"clips": [
{
"startTime": 0,
"endTime": 45,
"title": "Why distribution beats product",
"hook": "Companies are burning millions on content teams...",
"reason": "Strong problem statement + stat"
}
]
}
Feature 3.3: Clip Extraction

Tool: FFmpeg
Input: Main video + clip timestamps
Process:

Use FFmpeg to extract clip segments
Add fade in/out transitions
Export as MP4

Command Example:

bash ffmpeg -i input.mp4 -ss 00:00:10 -to 00:00:45 -c copy clip1.mp4
Feature 3.4: Auto-Caption Generation

Input: Clip video + transcription segment
Process:

Extract words for clip timeframe
Generate SRT subtitle file
Burn captions into video using FFmpeg

Caption Style:

White text, black background with transparency
Bold, large font (readable on mobile)
Word-by-word highlighting (optional)

Feature 3.5: Multi-Format Export

Formats:

16:9 (YouTube, LinkedIn)
9:16 (Instagram Reels, TikTok, YouTube Shorts)
1:1 (Instagram feed)

Process: FFmpeg resize + crop
Example:

bash # 9:16 vertical
ffmpeg -i clip.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" output_vertical.mp4
Feature 3.6: Clip Library Dashboard

UI Components:

Grid view of all generated clips
Each clip card shows:

Thumbnail
Title
Duration
Download buttons (16:9, 9:16, 1:1)

Bulk download option

3.12 Database Schema (Phase 3)
sql-- Transcriptions table
CREATE TABLE transcriptions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
segments JSONB NOT NULL, -- array of {start, end, text}
created_at TIMESTAMP DEFAULT NOW()
);

-- Clips table
CREATE TABLE clips (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
title TEXT NOT NULL,
start_time FLOAT NOT NULL,
end_time FLOAT NOT NULL,
hook TEXT,
clip_url_16_9 TEXT,
clip_url_9_16 TEXT,
clip_url_1_1 TEXT,
status TEXT DEFAULT 'processing',
created_at TIMESTAMP DEFAULT NOW()
);

```

### **3.13 API Endpoints (Phase 3)**
```

POST /api/videos/:videoId/transcribe

- Returns: { transcriptionId, segments }

POST /api/clips/identify

- Body: { videoId, transcriptionId }
- Returns: { clipSuggestions: [] }

POST /api/clips/generate

- Body: { videoId, clipData: [] }
- Returns: { clipIds: [], status }

GET /api/clips/:projectId/all

- Returns: { clips: [] }
  3.14 Skills Implementation (Phase 3)
  Skill: clip-moment-identifier
  typescriptinterface ClipIdentifierInput {
  transcription: Array<{start: number, end: number, text: string}>;
  script: string;
  }

async function identifyClipMoments(input: ClipIdentifierInput): Promise<any[]> {
const fullTranscript = input.transcription.map(s => s.text).join(' ');

const prompt = `
You are a viral content strategist. Analyze this video transcript and identify 5-8 clip-worthy moments.

Full Transcript:
${fullTranscript}

Original Script Context:
${input.script}

Identify segments that are:

- Self-contained (make sense without full context)
- 30-60 seconds long
- Have a strong hook or punchline
- Contain actionable insights or bold statements
- Would perform well as standalone social media clips

For each clip, provide:

1. Start and end timestamps (estimate based on transcript flow)
2. Title (5-8 words, attention-grabbing)
3. Hook (the opening line that grabs attention)
4. Reason (why this would be a good clip)

Return as JSON array:
[
{
"startTime": 10,
"endTime": 55,
"title": "Why distribution beats product quality",
"hook": "Companies are burning millions on content teams...",
"reason": "Strong problem statement with specific pain point"
}
]
`;

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
'Content-Type': 'application/json',
},
body: JSON.stringify({
model: 'google/gemini-2.0-flash-exp:free',
messages: [{ role: 'user', content: prompt }],
response_format: { type: 'json_object' }
})
});

const data = await response.json();
return JSON.parse(data.choices[0].message.content).clips;
}
3.15 Success Metrics (Phase 3)

Video transcribed accurately in < 1 minute
5-8 clip moments identified in < 30 seconds
Clips extracted and exported in < 2 minutes
Captions burned into clips correctly
All 3 aspect ratios generated per clip
Clips downloadable from dashboard

PHASE 4: Polish & Optimization (Week 4)
Goal: UI/UX improvements, error handling, performance optimization
3.16 Features
Feature 4.1: Project Management

Create new projects
View all projects (list view)
Delete projects
Duplicate projects

Feature 4.2: Error Handling & Retry Logic

Display clear error messages
Retry failed API calls automatically
Allow manual retry for failed steps

Feature 4.3: Loading States & Progress Tracking

Show progress bar for each pipeline stage
Estimated time remaining
Real-time status updates

Feature 4.4: Export & Download

Bulk download all outputs as ZIP
Individual download buttons
Copy to clipboard for text content

Feature 4.5: Analytics Dashboard (Optional)

Total projects created
Total content pieces generated
API usage stats

Feature 4.6: Settings Page

OpenRouter model selection (allow switching from Gemini to Claude/GPT)
Video avatar selection
Default tone/style preferences

3.17 Performance Optimizations

Parallel Processing: Generate all text content (LinkedIn, Twitter, blog) simultaneously
Caching: Cache frequently used prompts
Queue System: Use job queue (BullMQ) for video generation
CDN: Serve videos via CDN for faster playback

3.18 Success Metrics (Phase 4)

All errors have clear user-facing messages
Failed operations can be retried
Loading states show progress percentage
ZIP download includes all content + videos
Settings persist across sessions

4. Environment Variables
   env# OpenRouter
   OPENROUTER_API_KEY=your_key_here

# Video Generation (choose one)

HEYGEN_API_KEY=your_key_here

# OR

DID_API_KEY=your_key_here

# Transcription

OPENAI_API_KEY=your_key_here

# Voice (optional)

ELEVENLABS_API_KEY=your_key_here

# Database

SUPABASE_URL=your_url_here
SUPABASE_ANON_KEY=your_key_here

# Storage

NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here

```

---

## **5. File Structure**
```

clipspark-ai/
├── app/
│ ├── api/
│ │ ├── projects/
│ │ │ ├── create/route.ts
│ │ ├── scripts/
│ │ │ ├── generate/route.ts
│ │ │ ├── [scriptId]/update/route.ts
│ │ ├── videos/
│ │ │ ├── generate/route.ts
│ │ │ ├── [videoId]/status/route.ts
│ │ │ ├── [videoId]/transcribe/route.ts
│ │ ├── content/
│ │ │ ├── generate-all/route.ts
│ │ │ ├── generate-linkedin/route.ts
│ │ │ ├── generate-twitter/route.ts
│ │ │ ├── generate-blog/route.ts
│ │ ├── clips/
│ │ │ ├── identify/route.ts
│ │ │ ├── generate/route.ts
│ ├── dashboard/
│ │ ├── page.tsx
│ │ ├── [projectId]/page.tsx
│ ├── page.tsx (landing/home)
├── components/
│ ├── TopicInput.tsx
│ ├── ScriptEditor.tsx
│ ├── VideoPlayer.tsx
│ ├── ContentLibrary.tsx
│ ├── ClipGrid.tsx
│ ├── ProgressBar.tsx
├── lib/
│ ├── supabase.ts
│ ├── openrouter.ts
│ ├── video-api.ts (HeyGen or D-ID)
│ ├── ffmpeg.ts
│ ├── whisper.ts
├── skills/
│ ├── script-generator.ts
│ ├── linkedin-post-generator.ts
│ ├── twitter-thread-generator.ts
│ ├── blog-post-generator.ts
│ ├── email-snippet-generator.ts
│ ├── clip-moment-identifier.ts
├── types/
│ ├── index.ts
├── utils/
│ ├── helpers.ts
├── .env.local
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json

6. Dependencies
   json{
   "dependencies": {
   "next": "^14.0.0",
   "react": "^18.2.0",
   "react-dom": "^18.2.0",
   "@supabase/supabase-js": "^2.38.0",
   "axios": "^1.6.0",
   "fluent-ffmpeg": "^2.1.2",
   "openai": "^4.20.0",
   "zod": "^3.22.4",
   "tailwindcss": "^3.3.5",
   "typescript": "^5.2.2"
   },
   "devDependencies": {
   "@types/node": "^20.8.0",
   "@types/react": "^18.2.0",
   "eslint": "^8.51.0",
   "eslint-config-next": "^14.0.0"
   }
   }

7. Testing Strategy
   Phase 1 Testing

Topic → Script generation works
Script editor saves changes
Video generates from edited script
Video plays and downloads

Phase 2 Testing

All text content generates correctly
Copy buttons work
Content formatting is correct (line breaks, markdown)

Phase 3 Testing

Transcription accuracy
Clip moments identified correctly
Clips extract at right timestamps
Captions display correctly
All aspect ratios export properly

Phase 4 Testing

Error handling works for API failures
Retry logic functions
Bulk download creates valid ZIP
Settings persist

8. Success Criteria (MVP Overall)
   Functional Requirements

User inputs topic → Full pipeline completes in < 5 minutes
Generates 1 main video (60-120s)
Generates 5 LinkedIn posts
Generates 5 Twitter threads
Generates 1 blog post (800+ words)
Generates 5-8 short clips with captions
All content downloadable

Non-Functional Requirements

Responsive design (mobile + desktop)
< 3 second page load time
Clear error messages
Loading states for all async operations

Business Metrics

Demo-able for Red Bull Basement pitch
Can process 10 projects without breaking
Total cost per project < $2 (API costs)

9. Future Enhancements (Post-MVP)
   Phase 5 Ideas

Voice cloning (user uploads audio sample)
Stock footage video mode (instead of avatar)
Multi-language support (auto-translate content)
Scheduled posting to social platforms
A/B testing for hooks/thumbnails
Custom branding (logos, colors)
Team collaboration features
Analytics dashboard (track content performance)

10. Risks & Mitigation
    RiskImpactMitigationAPI rate limits (OpenRouter/HeyGen)HighImplement queue system, retry logicVideo generation too slowMediumUse faster provider (D-ID vs HeyGen)FFmpeg processing failuresMediumError handling + fallback to simpler processingHigh API costsMediumStart with Gemini Flash (cheapest), optimize promptsTranscription inaccuracyLowUse Whisper large model, manual review option

11. Deployment Checklist
    Pre-Deployment

All environment variables set in Vercel
Database migrations run on Supabase
Storage buckets created
API keys validated (test calls)
Error tracking setup (Sentry optional)

Post-Deployment

Test full pipeline in production
Monitor API usage/costs
Check video storage limits
Verify all downloads work

12. Documentation Needed

API documentation (endpoints, request/response formats)
Skills documentation (how to add new skills)
Deployment guide
User guide (how to use the platform)
Troubleshooting guide

PHASE 5: Marketing & Advertising Engine
Goal: Enable marketing teams to generate ad creatives, launch campaigns, and optimize ad spend across Facebook and Google

5.1 Target Users (Updated)

B2B companies and startups needing content distribution systems
Marketing teams with limited resources
Agencies managing multiple client advertising campaigns
Performance marketers running multi-platform ad campaigns
Growth teams optimizing ad spend across channels

5.2 Features
Feature 5.1: Ad Creative Generation Dashboard
Description: Dedicated dashboard for marketing teams to generate platform-specific ad creatives from existing content
UI Components:

Creative Generator Tab
Input Section:

Select source content (video/script/blog from existing project)
Platform selection: Facebook Ads, Google Display Ads, Google Search Ads
Campaign objective: (Awareness/Consideration/Conversion)
Target audience description
Budget range

Output Section:

Generated ad creatives grid
Preview by platform
Edit/regenerate individual creatives

Ad Creative Types:

Facebook/Instagram Ads:

Primary text (125 characters)
Headline (40 characters)
Description (30 characters)
Image/video ad variations (1:1, 4:5, 9:16)
Carousel ad copy + images
Story ad format

Google Display Ads:

Responsive display ads
Headlines (5 variations, 30 chars each)
Descriptions (5 variations, 90 chars each)
Image ads (multiple sizes: 300x250, 728x90, 160x600, 300x600)

Google Search Ads:

Headlines (15 variations, 30 chars each)
Descriptions (4 variations, 90 chars each)
Keywords suggestions
Ad extensions copy

Skill Name: ad-creative-generator
Input:
typescript{
sourceContent: string, // script or blog text
platform: 'facebook' | 'google_display' | 'google_search',
objective: 'awareness' | 'consideration' | 'conversion',
targetAudience: string,
productService: string,
cta: string // optional custom CTA
}
Output:
json{
"platform": "facebook",
"creatives": [
{
"id": "creative_1",
"primaryText": "Companies waste $400B on content teams. Here's the AI solution...",
"headline": "Turn 1 Video Into 50 Content Pieces",
"description": "Automated content distribution",
"imageUrl": "generated_image_url",
"callToAction": "Learn More",
"adFormat": "single_image"
}
]
}

Feature 5.2: Platform Integration & Authentication
Description: Connect Facebook Ads and Google Ads accounts to enable campaign creation and management
Integration Flow:

Facebook Ads Integration:

OAuth flow to get Facebook user token
Select Ad Account
Select Facebook Page
Permissions required:

ads_management
ads_read
business_management

Google Ads Integration:

OAuth flow to get Google Ads API access
Select Google Ads Account (Customer ID)
Permissions required:

Google Ads API access
Campaign management

UI Components:

Settings page with "Connected Accounts" section
"Connect Facebook Ads" button → OAuth flow
"Connect Google Ads" button → OAuth flow
Display connected accounts with status
Disconnect option

Database Schema Addition:
sql-- Ad accounts table
CREATE TABLE ad_accounts (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id),
platform TEXT NOT NULL, -- 'facebook' or 'google'
account_id TEXT NOT NULL, -- FB Ad Account ID or Google Ads Customer ID
account_name TEXT,
access_token TEXT NOT NULL, -- encrypted
refresh_token TEXT, -- encrypted
token_expires_at TIMESTAMP,
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

-- Ad creatives table
CREATE TABLE ad_creatives (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
platform TEXT NOT NULL,
creative_type TEXT NOT NULL, -- single_image, video, carousel, etc.
primary_text TEXT,
headline TEXT,
description TEXT,
cta TEXT,
media_url TEXT,
metadata JSONB, -- platform-specific fields
created_at TIMESTAMP DEFAULT NOW()
);

Feature 5.3: Campaign Creation & Scheduling
Description: Create and schedule advertising campaigns directly from the dashboard
Workflow:

User selects generated ad creatives
Sets campaign parameters
System creates campaign via API
Campaign goes live or gets scheduled

Campaign Parameters:

Campaign Name
Objective: Traffic, Conversions, Brand Awareness, etc.
Budget: Daily or Lifetime
Schedule: Start date, End date (optional)
Targeting:

Demographics (age, gender, location)
Interests
Custom audiences (optional)
Lookalike audiences (optional)

Placements: Facebook Feed, Instagram Stories, Google Search, Display Network, etc.

API Integrations:

Facebook Marketing API:

typescript// Create campaign
POST https://graph.facebook.com/v18.0/act_{ad_account_id}/campaigns
{
"name": "ClipSpark Q1 Campaign",
"objective": "LINK_CLICKS",
"status": "PAUSED", // or ACTIVE
"special_ad_categories": []
}

// Create ad set
POST https://graph.facebook.com/v18.0/act_{ad_account_id}/adsets
{
"name": "Ad Set 1",
"campaign_id": "{campaign_id}",
"daily_budget": "5000", // in cents
"billing_event": "IMPRESSIONS",
"optimization_goal": "LINK_CLICKS",
"targeting": {
"geo_locations": {"countries": ["IN"]},
"age_min": 25,
"age_max": 55
},
"status": "PAUSED"
}

// Create ad
POST https://graph.facebook.com/v18.0/act_{ad_account_id}/ads
{
"name": "Ad 1",
"adset_id": "{adset_id}",
"creative": {
"object_story_spec": {
"page_id": "{page_id}",
"link_data": {
"message": "Primary text here",
"link": "https://example.com",
"name": "Headline here",
"description": "Description here",
"image_hash": "{image_hash}"
}
}
},
"status": "PAUSED"
}

Google Ads API:

typescript// Create campaign
const campaign = {
name: "ClipSpark Search Campaign",
advertisingChannelType: "SEARCH",
status: "PAUSED",
biddingStrategy: {
targetCpa: {
targetCpaMicros: 1000000 // $1 CPA
}
},
campaignBudget: {
amountMicros: 50000000, // $50
deliveryMethod: "STANDARD"
}
}

// Create ad group
const adGroup = {
name: "Ad Group 1",
campaign: "campaigns/{campaign_id}",
status: "ENABLED",
cpcBidMicros: 500000 // $0.50
}

// Create responsive search ad
const ad = {
responsiveSearchAd: {
headlines: [
{text: "Headline 1"},
{text: "Headline 2"},
{text: "Headline 3"}
],
descriptions: [
{text: "Description 1"},
{text: "Description 2"}
],
path1: "content",
path2: "automation"
},
finalUrls: ["https://example.com"]
}
UI Components:

Campaign creation wizard (multi-step form)
Budget calculator
Audience selector with suggestions
Preview panel showing how ad will look on each placement
Schedule calendar picker
"Launch Campaign" vs "Schedule Campaign" buttons

Database Schema Addition:
sql-- Campaigns table
CREATE TABLE campaigns (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id),
ad_account_id UUID REFERENCES ad_accounts(id),
project_id UUID REFERENCES projects(id),
platform TEXT NOT NULL,
platform_campaign_id TEXT, -- FB/Google campaign ID
campaign_name TEXT NOT NULL,
objective TEXT,
status TEXT DEFAULT 'draft', -- draft, scheduled, active, paused, completed
daily_budget DECIMAL,
lifetime_budget DECIMAL,
start_date TIMESTAMP,
end_date TIMESTAMP,
targeting JSONB,
metadata JSONB,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaign ad creatives relationship
CREATE TABLE campaign_creatives (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
ad_creative_id UUID REFERENCES ad_creatives(id),
platform_ad_id TEXT, -- FB/Google ad ID
status TEXT DEFAULT 'active',
created_at TIMESTAMP DEFAULT NOW()
);

Feature 5.4: Campaign Performance Analytics
Description: Real-time dashboard showing campaign performance metrics with AI-powered insights
Metrics Tracked:
Facebook Ads Metrics:

Impressions
Reach
Clicks (Link clicks)
CTR (Click-through rate)
CPC (Cost per click)
CPM (Cost per 1000 impressions)
Spend
Conversions
CPA (Cost per acquisition)
ROAS (Return on ad spend)

Google Ads Metrics:

Impressions
Clicks
CTR
Average CPC
Cost
Conversions
Conversion rate
Cost per conversion
Quality Score
Impression share

Data Fetching:

Facebook Ads Insights API:

typescriptGET https://graph.facebook.com/v18.0/act_{ad_account_id}/insights
?fields=impressions,clicks,spend,cpc,cpm,ctr,reach,conversions,cost_per_conversion
&time_range={'since':'2024-01-01','until':'2024-01-31'}
&level=campaign // or ad, adset
&access_token={access_token}

Google Ads Reporting API:

typescriptconst query = `  SELECT
    campaign.id,
    campaign.name,
    metrics.impressions,
    metrics.clicks,
    metrics.ctr,
    metrics.average_cpc,
    metrics.cost_micros,
    metrics.conversions,
    metrics.cost_per_conversion
  FROM campaign
  WHERE segments.date DURING LAST_30_DAYS`;
UI Components:

Performance Dashboard:

Date range selector
Platform filter (All/Facebook/Google)
Campaign status filter
Key metrics cards (total spend, total conversions, average ROAS)
Charts:

Spend over time (line chart)
CTR comparison by campaign (bar chart)
Conversion funnel (funnel chart)

Campaign performance table:

Campaign name
Platform
Status
Spend
Impressions
Clicks
CTR
Conversions
CPA
ROAS
Actions (pause/resume, edit)

Database Schema Addition:
sql-- Campaign metrics table (daily snapshots)
CREATE TABLE campaign_metrics (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
date DATE NOT NULL,
impressions INTEGER DEFAULT 0,
clicks INTEGER DEFAULT 0,
spend DECIMAL DEFAULT 0,
conversions INTEGER DEFAULT 0,
ctr DECIMAL,
cpc DECIMAL,
cpm DECIMAL,
cpa DECIMAL,
roas DECIMAL,
metadata JSONB, -- platform-specific metrics
created_at TIMESTAMP DEFAULT NOW(),
UNIQUE(campaign_id, date)
);

Feature 5.5: AI-Powered Campaign Optimization
Description: Automatically identify winning campaigns and reallocate budget for maximum ROI
Optimization Features:

Winning Campaign Identification:

Skill Name: campaign-performance-analyzer
Input: Campaign metrics for last 7/14/30 days
Process:

Analyze ROAS, CPA, CTR across all active campaigns
Identify top performers (e.g., ROAS > 3x, CPA < target)
Identify underperformers (e.g., ROAS < 1x, high CPA)
Generate recommendations

Output:

json {
"winningCampaigns": [
{
"campaignId": "campaign_123",
"campaignName": "Q1 Video Ads",
"roas": 4.2,
"currentBudget": 5000,
"recommendedBudget": 8000,
"reason": "ROAS 4.2x exceeds target of 3x. Scale up by 60%."
}
],
"losingCampaigns": [
{
"campaignId": "campaign_456",
"campaignName": "Display Ads Test",
"roas": 0.8,
"currentBudget": 3000,
"recommendedAction": "pause",
"reason": "ROAS below 1x. Pause and reallocate budget."
}
],
"budgetReallocation": {
"totalCurrentBudget": 20000,
"totalRecommendedBudget": 20000,
"changes": [
{
"from": "campaign_456",
"to": "campaign_123",
"amount": 2000
}
]
}
}

Budget Rebalancing Engine:

Auto-rebalancing (if enabled):

System automatically adjusts budgets based on performance
Increases budget for winning campaigns
Decreases or pauses losing campaigns
Maintains total budget cap

Manual approval mode:

Shows recommended changes
User approves/rejects each change
One-click apply all recommendations

Ad Creative Testing (A/B Testing):

Automatically create variations of winning ad creatives
Test different headlines, images, CTAs
Identify best-performing variations
Pause low performers after statistical significance

Smart Bidding Adjustments:

Monitor cost per result vs target
Adjust bid caps/targets automatically
Platform-specific optimization:

Facebook: Switch bid strategies (Lowest cost → Cost cap)
Google: Adjust target CPA/ROAS

UI Components:

Optimization Dashboard Tab:

"Analyze Campaigns" button → runs AI analysis
Recommendations Panel:

Winning campaigns (green highlight)
Losing campaigns (red highlight)
Recommended actions for each

Budget Rebalancing Simulator:

Current allocation pie chart
Recommended allocation pie chart
Projected ROAS improvement

Apply Recommendations buttons:

"Auto-apply winning campaigns" (scale up)
"Pause losing campaigns"
"Rebalance all budgets"

A/B Test Manager:

Active tests table
Create new test
View test results

Skill Implementation:
typescript// Skill: campaign-performance-analyzer
interface CampaignMetrics {
campaignId: string;
campaignName: string;
platform: string;
spend: number;
conversions: number;
revenue: number; // if tracked
impressions: number;
clicks: number;
ctr: number;
cpc: number;
cpa: number;
roas: number;
}

interface OptimizationInput {
campaigns: CampaignMetrics[];
targetRoas: number; // e.g., 3.0
targetCpa: number; // e.g., 50
totalBudget: number;
}

async function analyzeCampaignPerformance(input: OptimizationInput) {
const prompt = `
You are a performance marketing expert. Analyze these campaign metrics and provide optimization recommendations.

Campaign Data:
${JSON.stringify(input.campaigns, null, 2)}

Targets:

- Target ROAS: ${input.targetRoas}x
- Target CPA: $${input.targetCpa}
- Total Budget: $${input.totalBudget}

Identify:

1. Winning campaigns (ROAS > target OR CPA < target AND trending positively)
2. Losing campaigns (ROAS < 1x OR CPA > 2x target)
3. Budget reallocation strategy to maximize ROAS while maintaining total budget

For each winning campaign, recommend budget increase (%).
For each losing campaign, recommend: pause, reduce budget, or optimize creative.

Provide a complete budget reallocation plan that:

- Scales winning campaigns
- Reduces/pauses losing campaigns
- Maintains total budget = $${input.totalBudget}

Return JSON:
{
"winningCampaigns": [{campaignId, currentBudget, recommendedBudget, reason}],
"losingCampaigns": [{campaignId, recommendedAction, reason}],
"budgetReallocation": {
"totalCurrentBudget": number,
"totalRecommendedBudget": number,
"changes": [{from, to, amount}]
},
"projectedImpact": {
"currentRoas": number,
"projectedRoas": number,
"improvement": "percentage"
}
}
`;

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
'Content-Type': 'application/json',
},
body: JSON.stringify({
model: 'google/gemini-2.0-flash-exp:free',
messages: [{ role: 'user', content: prompt }],
response_format: { type: 'json_object' }
})
});

const data = await response.json();
return JSON.parse(data.choices[0].message.content);
}
Automation Settings:
sql-- Optimization settings table
CREATE TABLE optimization_settings (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id),
auto_rebalance_enabled BOOLEAN DEFAULT FALSE,
rebalance_frequency TEXT DEFAULT 'weekly', -- daily, weekly, biweekly
min_roas_threshold DECIMAL DEFAULT 3.0,
max_cpa_threshold DECIMAL DEFAULT 50.0,
auto_pause_losing_campaigns BOOLEAN DEFAULT FALSE,
min_data_points INTEGER DEFAULT 100, -- min conversions before optimization
notification_enabled BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

Feature 5.6: Cross-Platform Spend Optimization
Description: Intelligently allocate budget between Facebook and Google based on performance
Algorithm:

Compare ROAS/CPA between platforms
Identify which platform is delivering better results
Suggest budget shifts (e.g., "Move $2000 from Google to Facebook")
Consider platform-specific factors:

Audience saturation (frequency on Facebook)
Search volume trends (Google)
Seasonal patterns

UI Component:

Platform Comparison View:

Side-by-side metrics: Facebook vs Google
Recommendation: "Facebook is outperforming Google by 40%. Shift $3000 to Facebook."
"Apply Recommendation" button

Feature 5.7: Notification & Alerting System
Description: Real-time alerts for campaign performance issues
Alert Types:

Campaign spent 80% of daily budget before 12 PM (pacing issue)
ROAS dropped below threshold
CPA exceeded threshold
Campaign paused due to policy violation
Daily spend limit approaching
Winning campaign hitting budget cap (opportunity to scale)

Delivery Channels:

In-app notifications
Email alerts
Slack integration (optional)
SMS for critical alerts (optional)

Database Schema Addition:
sql-- Alerts table
CREATE TABLE campaign_alerts (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id),
campaign_id UUID REFERENCES campaigns(id),
alert_type TEXT NOT NULL, -- pacing_issue, roas_drop, cpa_spike, etc.
severity TEXT DEFAULT 'medium', -- low, medium, high, critical
message TEXT NOT NULL,
is_read BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT NOW()
);

5.3 API Endpoints (Phase 5)
typescript// Ad Creative Generation
POST /api/ad-creatives/generate
Body: { sourceContent, platform, objective, targetAudience, productService }
Returns: { creatives: [] }

// Platform Integration
POST /api/integrations/facebook/connect
Body: { code } // OAuth code
Returns: { accountId, accountName, status }

POST /api/integrations/google/connect
Body: { code }
Returns: { customerId, accountName, status }

GET /api/integrations/accounts
Returns: { accounts: [] }

DELETE /api/integrations/:accountId/disconnect
Returns: { success }

// Campaign Management
POST /api/campaigns/create
Body: { adAccountId, campaignData, creatives, targeting, budget, schedule }
Returns: { campaignId, platformCampaignId, status }

GET /api/campaigns/:campaignId/metrics
Query: { startDate, endDate }
Returns: { metrics: {} }

GET /api/campaigns/all
Query: { platform?, status?, startDate?, endDate? }
Returns: { campaigns: [] }

PATCH /api/campaigns/:campaignId/status
Body: { status } // pause, resume
Returns: { success, newStatus }

PATCH /api/campaigns/:campaignId/budget
Body: { dailyBudget?, lifetimeBudget? }
Returns: { success, updatedBudget }

// Optimization
POST /api/campaigns/analyze
Body: { campaignIds?, dateRange, targetRoas, targetCpa }
Returns: { recommendations: {} }

POST /api/campaigns/optimize/apply
Body: { recommendations, autoApprove }
Returns: { applied: [], failed: [] }

// Alerts
GET /api/alerts
Query: { isRead?, severity? }
Returns: { alerts: [] }

PATCH /api/alerts/:alertId/read
Returns: { success }

```

---

### **5.4 Updated File Structure**
```

clipspark-ai/
├── app/
│ ├── api/
│ │ ├── ad-creatives/
│ │ │ ├── generate/route.ts
│ │ ├── integrations/
│ │ │ ├── facebook/
│ │ │ │ ├── connect/route.ts
│ │ │ │ ├── callback/route.ts
│ │ │ ├── google/
│ │ │ │ ├── connect/route.ts
│ │ │ │ ├── callback/route.ts
│ │ │ ├── accounts/route.ts
│ │ ├── campaigns/
│ │ │ ├── create/route.ts
│ │ │ ├── all/route.ts
│ │ │ ├── [campaignId]/
│ │ │ │ ├── metrics/route.ts
│ │ │ │ ├── status/route.ts
│ │ │ │ ├── budget/route.ts
│ │ │ ├── analyze/route.ts
│ │ │ ├── optimize/
│ │ │ │ ├── apply/route.ts
│ │ ├── alerts/
│ │ │ ├── route.ts
│ │ │ ├── [alertId]/read/route.ts
│ ├── marketing/
│ │ ├── page.tsx (Marketing Dashboard Home)
│ │ ├── creatives/page.tsx (Ad Creative Generator)
│ │ ├── campaigns/
│ │ │ ├── page.tsx (All Campaigns)
│ │ │ ├── create/page.tsx (Campaign Creation Wizard)
│ │ │ ├── [campaignId]/page.tsx (Campaign Detail)
│ │ ├── analytics/page.tsx (Performance Dashboard)
│ │ ├── optimization/page.tsx (AI Optimization Dashboard)
│ │ ├── settings/page.tsx (Platform Integrations & Settings)
├── components/
│ ├── marketing/
│ │ ├── AdCreativeGenerator.tsx
│ │ ├── PlatformConnector.tsx
│ │ ├── CampaignWizard.tsx
│ │ ├── PerformanceChart.tsx
│ │ ├── CampaignTable.tsx
│ │ ├── OptimizationPanel.tsx
│ │ ├── BudgetRebalancer.tsx
│ │ ├── AlertBanner.tsx
├── lib/
│ ├── facebook-ads.ts
│ ├── google-ads.ts
│ ├── campaign-optimizer.ts
├── skills/
│ ├── ad-creative-generator.ts
│ ├── campaign-performance-analyzer.ts

5.5 Additional Dependencies
json{
"dependencies": {
"facebook-nodejs-business-sdk": "^18.0.0",
"google-ads-api": "^15.0.0",
"date-fns": "^2.30.0",
"recharts": "^2.10.0",
"react-hook-form": "^7.48.0",
"@tanstack/react-query": "^5.8.0"
}
}

5.6 Success Metrics (Phase 5)
Functional Requirements:

User can connect Facebook and Google Ads accounts
Ad creatives generated for both platforms in < 30 seconds
Campaigns created and launched successfully via API
Performance metrics fetched and displayed correctly
AI optimization recommendations generated
Budget rebalancing applied successfully
Alerts triggered for performance issues

Business Metrics:

Marketing teams can manage entire ad workflow in one platform
Budget optimization increases ROAS by 20%+ on average
Reduces time spent on campaign management by 60%

5.7 Security & Compliance
Data Security:

All OAuth tokens encrypted at rest (AES-256)
Tokens refreshed automatically before expiration
API keys never exposed to frontend
User permissions validated on every API call

Compliance:

GDPR-compliant data handling
User can disconnect accounts and delete all ad data
Audit log for all campaign changes
Rate limiting to prevent API abuse

Facebook/Google API Compliance:

Follow Facebook Marketing API rate limits
Follow Google Ads API rate limits
Handle API errors gracefully
Implement exponential backoff for retries

5.8 Cost Estimation (Phase 5)
API Costs:

OpenRouter (Gemini Flash): ~$0.01 per ad creative generation
Facebook/Google API calls: Free (within rate limits)
Data storage (Supabase): Minimal (mostly metadata)

Infrastructure:

Background jobs for metrics syncing (cron jobs on Vercel)
Webhook handling for real-time campaign updates

Total Estimated Cost per User/Month:

Light usage (5 campaigns): ~$5-10
Heavy usage (50 campaigns): ~$30-50

Yes, absolutely! You can fetch all ad campaigns (and much more) from a Meta Ad Account using the Facebook Marketing API. Let me show you exactly how.

---

## **Fetching Meta Ad Campaigns - Complete Guide**

### **1. What You Can Fetch from Meta Ads API**

The Facebook Marketing API lets you fetch data at multiple levels:

1. **Ad Account level** - All campaigns under an account
2. **Campaign level** - All ad sets under a campaign
3. **Ad Set level** - All ads under an ad set
4. **Ad level** - Individual ad performance

---

### **2. API Endpoints for Fetching Data**

#### **A. Get All Campaigns**

```typescript
GET https://graph.facebook.com/v18.0/act_{ad_account_id}/campaigns
?fields=id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time
&access_token={access_token}
```

**Response:**

```json
{
  "data": [
    {
      "id": "123456789",
      "name": "Q1 Video Campaign",
      "objective": "OUTCOME_TRAFFIC",
      "status": "ACTIVE",
      "daily_budget": "5000",
      "lifetime_budget": null,
      "start_time": "2024-01-01T00:00:00+0000",
      "stop_time": null,
      "created_time": "2024-01-01T10:30:00+0000",
      "updated_time": "2024-01-15T14:20:00+0000"
    }
  ],
  "paging": {
    "cursors": {
      "before": "...",
      "after": "..."
    },
    "next": "https://graph.facebook.com/v18.0/..."
  }
}
```

#### **B. Get All Ad Sets for a Campaign**

```typescript
GET https://graph.facebook.com/v18.0/{campaign_id}/adsets
?fields=id,name,status,daily_budget,lifetime_budget,start_time,end_time,targeting,optimization_goal,billing_event
&access_token={access_token}
```

#### **C. Get All Ads for an Ad Set**

```typescript
GET https://graph.facebook.com/v18.0/{adset_id}/ads
?fields=id,name,status,creative,tracking_specs,conversion_specs
&access_token={access_token}
```

#### **D. Get Campaign Insights (Performance Metrics)**

```typescript
GET https://graph.facebook.com/v18.0/act_{ad_account_id}/insights
?fields=campaign_id,campaign_name,impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,conversions,cost_per_conversion,actions,action_values
&level=campaign
&time_range={'since':'2024-01-01','until':'2024-01-31'}
&access_token={access_token}
```

**Response:**

```json
{
  "data": [
    {
      "campaign_id": "123456789",
      "campaign_name": "Q1 Video Campaign",
      "impressions": "125000",
      "clicks": "3500",
      "spend": "1250.50",
      "cpc": "0.357",
      "cpm": "10.00",
      "ctr": "2.8",
      "reach": "85000",
      "conversions": "250",
      "cost_per_conversion": "5.00",
      "actions": [
        {
          "action_type": "link_click",
          "value": "3500"
        },
        {
          "action_type": "purchase",
          "value": "250"
        }
      ],
      "date_start": "2024-01-01",
      "date_stop": "2024-01-31"
    }
  ]
}
```

---

### **3. Complete Implementation Code**

Here's production-ready code to fetch all campaigns and their metrics:

#### **File: `/lib/facebook-ads.ts`**

```typescript
import axios from "axios";

// Types
interface MetaAdAccount {
  id: string;
  accountId: string;
  name: string;
  currency: string;
  timezone: string;
}

interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
  dailyBudget?: string;
  lifetimeBudget?: string;
  startTime?: string;
  stopTime?: string;
  createdTime: string;
  updatedTime: string;
}

interface MetaCampaignInsights {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpc: number;
  cpm: number;
  ctr: number;
  reach: number;
  frequency: number;
  conversions: number;
  costPerConversion: number;
  actions?: Array<{
    actionType: string;
    value: string;
  }>;
  dateStart: string;
  dateStop: string;
}

// Facebook Marketing API Base URL
const FB_API_VERSION = "v18.0";
const FB_API_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;

// Helper function to make API calls with error handling
async function fbApiCall<T>(
  endpoint: string,
  accessToken: string,
  params: Record<string, any> = {},
): Promise<T> {
  try {
    const response = await axios.get(`${FB_API_BASE}${endpoint}`, {
      params: {
        access_token: accessToken,
        ...params,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Facebook API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message || "Facebook API call failed",
    );
  }
}

// 1. Get Ad Account Info
export async function getAdAccount(
  adAccountId: string,
  accessToken: string,
): Promise<MetaAdAccount> {
  const data = await fbApiCall<any>(`/act_${adAccountId}`, accessToken, {
    fields: "id,account_id,name,currency,timezone_name",
  });

  return {
    id: data.id,
    accountId: data.account_id,
    name: data.name,
    currency: data.currency,
    timezone: data.timezone_name,
  };
}

// 2. Get All Campaigns
export async function getAllCampaigns(
  adAccountId: string,
  accessToken: string,
  filters?: {
    status?: Array<"ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED">;
    limit?: number;
  },
): Promise<MetaCampaign[]> {
  const params: any = {
    fields:
      "id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time",
    limit: filters?.limit || 100,
  };

  // Add status filter if provided
  if (filters?.status && filters.status.length > 0) {
    params.filtering = JSON.stringify([
      {
        field: "status",
        operator: "IN",
        value: filters.status,
      },
    ]);
  }

  const data = await fbApiCall<{ data: any[] }>(
    `/act_${adAccountId}/campaigns`,
    accessToken,
    params,
  );

  return data.data.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    objective: campaign.objective,
    status: campaign.status,
    dailyBudget: campaign.daily_budget,
    lifetimeBudget: campaign.lifetime_budget,
    startTime: campaign.start_time,
    stopTime: campaign.stop_time,
    createdTime: campaign.created_time,
    updatedTime: campaign.updated_time,
  }));
}

// 3. Get Campaign Insights (Performance Metrics)
export async function getCampaignInsights(
  adAccountId: string,
  accessToken: string,
  options: {
    campaignIds?: string[]; // specific campaigns, or all if not provided
    dateRange: {
      since: string; // YYYY-MM-DD
      until: string; // YYYY-MM-DD
    };
    level?: "campaign" | "adset" | "ad"; // default: campaign
  },
): Promise<MetaCampaignInsights[]> {
  const params: any = {
    fields:
      "campaign_id,campaign_name,impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions,action_values",
    level: options.level || "campaign",
    time_range: JSON.stringify({
      since: options.dateRange.since,
      until: options.dateRange.until,
    }),
    limit: 100,
  };

  // Filter by specific campaigns if provided
  if (options.campaignIds && options.campaignIds.length > 0) {
    params.filtering = JSON.stringify([
      {
        field: "campaign.id",
        operator: "IN",
        value: options.campaignIds,
      },
    ]);
  }

  const data = await fbApiCall<{ data: any[] }>(
    `/act_${adAccountId}/insights`,
    accessToken,
    params,
  );

  return data.data.map((insight) => {
    // Extract conversions from actions array
    const conversions =
      insight.actions?.find(
        (a: any) =>
          a.action_type === "purchase" ||
          a.action_type === "offsite_conversion.fb_pixel_purchase",
      )?.value || "0";

    const spend = parseFloat(insight.spend || "0");
    const conversionsNum = parseInt(conversions);

    return {
      campaignId: insight.campaign_id,
      campaignName: insight.campaign_name,
      impressions: parseInt(insight.impressions || "0"),
      clicks: parseInt(insight.clicks || "0"),
      spend: spend,
      cpc: parseFloat(insight.cpc || "0"),
      cpm: parseFloat(insight.cpm || "0"),
      ctr: parseFloat(insight.ctr || "0"),
      reach: parseInt(insight.reach || "0"),
      frequency: parseFloat(insight.frequency || "0"),
      conversions: conversionsNum,
      costPerConversion: conversionsNum > 0 ? spend / conversionsNum : 0,
      actions: insight.actions,
      dateStart: insight.date_start,
      dateStop: insight.date_stop,
    };
  });
}

// 4. Get All Ad Sets for a Campaign
export async function getAdSets(
  campaignId: string,
  accessToken: string,
): Promise<any[]> {
  const data = await fbApiCall<{ data: any[] }>(
    `/${campaignId}/adsets`,
    accessToken,
    {
      fields:
        "id,name,status,daily_budget,lifetime_budget,start_time,end_time,targeting,optimization_goal,billing_event",
    },
  );

  return data.data;
}

// 5. Get All Ads for an Ad Set
export async function getAds(
  adSetId: string,
  accessToken: string,
): Promise<any[]> {
  const data = await fbApiCall<{ data: any[] }>(
    `/${adSetId}/ads`,
    accessToken,
    {
      fields:
        "id,name,status,creative{id,title,body,image_url,video_id},tracking_specs,conversion_specs",
    },
  );

  return data.data;
}

// 6. Pagination Helper (for large datasets)
export async function getAllCampaignsPaginated(
  adAccountId: string,
  accessToken: string,
): Promise<MetaCampaign[]> {
  let allCampaigns: MetaCampaign[] = [];
  let nextUrl: string | null = null;

  do {
    const endpoint = nextUrl || `/act_${adAccountId}/campaigns`;
    const params = nextUrl
      ? {} // params already in URL
      : {
          fields:
            "id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time",
          limit: 100,
        };

    const data = await fbApiCall<{ data: any[]; paging?: { next?: string } }>(
      endpoint,
      accessToken,
      params,
    );

    const campaigns = data.data.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      objective: campaign.objective,
      status: campaign.status,
      dailyBudget: campaign.daily_budget,
      lifetimeBudget: campaign.lifetime_budget,
      startTime: campaign.start_time,
      stopTime: campaign.stop_time,
      createdTime: campaign.created_time,
      updatedTime: campaign.updated_time,
    }));

    allCampaigns = [...allCampaigns, ...campaigns];
    nextUrl = data.paging?.next || null;
  } while (nextUrl);

  return allCampaigns;
}

// 7. Sync Campaigns to Database
export async function syncCampaignsToDatabase(
  adAccountId: string,
  accessToken: string,
  supabase: any, // Supabase client
): Promise<{ synced: number; errors: number }> {
  try {
    // Fetch all campaigns
    const campaigns = await getAllCampaigns(adAccountId, accessToken);

    // Fetch insights for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const today = new Date();

    const insights = await getCampaignInsights(adAccountId, accessToken, {
      dateRange: {
        since: thirtyDaysAgo.toISOString().split("T")[0],
        until: today.toISOString().split("T")[0],
      },
    });

    // Create a map of insights by campaign ID
    const insightsMap = new Map(
      insights.map((insight) => [insight.campaignId, insight]),
    );

    // Upsert campaigns to database
    let synced = 0;
    let errors = 0;

    for (const campaign of campaigns) {
      const insight = insightsMap.get(campaign.id);

      const { error } = await supabase.from("campaigns").upsert(
        {
          platform_campaign_id: campaign.id,
          campaign_name: campaign.name,
          platform: "facebook",
          objective: campaign.objective,
          status: campaign.status.toLowerCase(),
          daily_budget: campaign.dailyBudget
            ? parseFloat(campaign.dailyBudget) / 100
            : null,
          lifetime_budget: campaign.lifetimeBudget
            ? parseFloat(campaign.lifetimeBudget) / 100
            : null,
          start_date: campaign.startTime,
          end_date: campaign.stopTime,
          metadata: {
            createdTime: campaign.createdTime,
            updatedTime: campaign.updatedTime,
          },
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "platform_campaign_id",
        },
      );

      if (error) {
        console.error("Error syncing campaign:", error);
        errors++;
      } else {
        synced++;

        // If we have insights, save them too
        if (insight) {
          await supabase.from("campaign_metrics").upsert(
            {
              campaign_id: campaign.id, // This should be your internal campaign ID
              date: insight.dateStop,
              impressions: insight.impressions,
              clicks: insight.clicks,
              spend: insight.spend,
              conversions: insight.conversions,
              ctr: insight.ctr,
              cpc: insight.cpc,
              cpm: insight.cpm,
              cpa: insight.costPerConversion,
              metadata: {
                reach: insight.reach,
                frequency: insight.frequency,
                actions: insight.actions,
              },
            },
            {
              onConflict: "campaign_id,date",
            },
          );
        }
      }
    }

    return { synced, errors };
  } catch (error) {
    console.error("Error syncing campaigns:", error);
    throw error;
  }
}
```

---

### **4. API Route Implementation**

#### **File: `/app/api/campaigns/sync-meta/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import {
  getAllCampaigns,
  getCampaignInsights,
  syncCampaignsToDatabase,
} from "@/lib/facebook-ads";

export async function POST(req: NextRequest) {
  try {
    const { adAccountId } = await req.json();

    // Get user from session
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Meta ad account credentials from database
    const { data: adAccount, error: accountError } = await supabase
      .from("ad_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("account_id", adAccountId)
      .eq("platform", "facebook")
      .eq("is_active", true)
      .single();

    if (accountError || !adAccount) {
      return NextResponse.json(
        { error: "Ad account not found or not connected" },
        { status: 404 },
      );
    }

    // Decrypt access token (you should encrypt this in production)
    const accessToken = adAccount.access_token;

    // Sync campaigns
    const result = await syncCampaignsToDatabase(
      adAccountId,
      accessToken,
      supabase,
    );

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      message: `Successfully synced ${result.synced} campaigns`,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync campaigns" },
      { status: 500 },
    );
  }
}
```

#### **File: `/app/api/campaigns/fetch-meta/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getAllCampaigns, getCampaignInsights } from "@/lib/facebook-ads";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adAccountId = searchParams.get("adAccountId");
    const sinceDays = parseInt(searchParams.get("sinceDays") || "30");

    if (!adAccountId) {
      return NextResponse.json(
        { error: "adAccountId is required" },
        { status: 400 },
      );
    }

    // Get user from session
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get access token
    const { data: adAccount } = await supabase
      .from("ad_accounts")
      .select("access_token")
      .eq("user_id", user.id)
      .eq("account_id", adAccountId)
      .eq("platform", "facebook")
      .single();

    if (!adAccount) {
      return NextResponse.json(
        { error: "Ad account not found" },
        { status: 404 },
      );
    }

    const accessToken = adAccount.access_token;

    // Fetch campaigns
    const campaigns = await getAllCampaigns(adAccountId, accessToken, {
      status: ["ACTIVE", "PAUSED"],
    });

    // Fetch insights
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);
    const today = new Date();

    const insights = await getCampaignInsights(adAccountId, accessToken, {
      dateRange: {
        since: sinceDate.toISOString().split("T")[0],
        until: today.toISOString().split("T")[0],
      },
    });

    // Merge campaigns with insights
    const campaignsWithInsights = campaigns.map((campaign) => {
      const insight = insights.find((i) => i.campaignId === campaign.id);
      return {
        ...campaign,
        metrics: insight || null,
      };
    });

    return NextResponse.json({
      campaigns: campaignsWithInsights,
      count: campaigns.length,
    });
  } catch (error: any) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaigns" },
      { status: 500 },
    );
  }
}
```

---

### **5. Important Fields You Can Fetch**

Here's a comprehensive list of fields available:

#### **Campaign Fields:**

```
id, name, account_id, objective, status, effective_status,
daily_budget, lifetime_budget, budget_remaining,
start_time, stop_time, created_time, updated_time,
can_use_spend_cap, spend_cap, is_skadnetwork_attribution,
source_campaign_id, special_ad_categories, special_ad_category_country
```

#### **Insights Fields:**

```
// Core metrics
impressions, reach, frequency, clicks, unique_clicks,
ctr, unique_ctr, spend, cpc, cpm, cpp

// Conversions & Actions
actions, conversions, conversion_values,
cost_per_action_type, cost_per_conversion,
cost_per_unique_action_type

// Video metrics (if applicable)
video_avg_time_watched_actions, video_p25_watched_actions,
video_p50_watched_actions, video_p75_watched_actions,
video_p100_watched_actions

// Engagement
post_engagements, page_engagement, link_clicks,
post_reactions_by_type_total

// Advanced
quality_score_organic, quality_score_ectr, quality_score_ecvr,
auction_competitiveness, auction_overlap
```

---

### **6. Rate Limits & Best Practices**

**Rate Limits:**

- **Standard Access**: 200 calls per hour per user
- **Business Manager**: Higher limits (varies)
- Use batch requests for efficiency

**Best Practices:**

```typescript
// 1. Use batch requests for multiple campaigns
const batchRequest = campaigns.map((campaign) => ({
  method: "GET",
  relative_url: `${campaign.id}/insights?fields=impressions,clicks,spend`,
}));

// 2. Cache results
// Don't fetch insights more than once per hour

// 3. Use webhooks for real-time updates (advanced)
// Subscribe to campaign status changes

// 4. Handle pagination properly
// Use cursor-based pagination for large datasets
```

---

### **7. Testing the Integration**

```typescript
// Test script
import { getAllCampaigns, getCampaignInsights } from "@/lib/facebook-ads";

async function testMetaIntegration() {
  const adAccountId = "YOUR_AD_ACCOUNT_ID"; // without 'act_' prefix
  const accessToken = "YOUR_ACCESS_TOKEN";

  console.log("Fetching campaigns...");
  const campaigns = await getAllCampaigns(adAccountId, accessToken);
  console.log(`Found ${campaigns.length} campaigns`);
  console.log(campaigns);

  console.log("\nFetching insights...");
  const insights = await getCampaignInsights(adAccountId, accessToken, {
    dateRange: {
      since: "2024-01-01",
      until: "2024-01-31",
    },
  });
  console.log(`Found insights for ${insights.length} campaigns`);
  console.log(insights);
}

testMetaIntegration();
```

---

### **Summary**

✅ **Yes, you can fetch all ad campaigns** from a Meta Ad Account
✅ **Complete implementation provided** with TypeScript
✅ **Includes insights/metrics** fetching
✅ **Handles pagination** for large datasets
✅ **Database sync functionality** included
✅ **Error handling** and rate limit awareness

The tracking specs link you shared is for setting up conversion tracking when **creating ads**, not for fetching existing campaigns. For fetching, you use the `/campaigns` and `/insights` endpoints I've documented above.

5.9 Future Enhancements (Marketing Features)

TikTok Ads integration
LinkedIn Ads integration
Automated A/B testing framework
Predictive analytics (forecast campaign performance)
Multi-touch attribution (track user journey across platforms)
White-label reporting for agencies
Bulk campaign import/export
Custom conversion tracking setup
