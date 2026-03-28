"use client";

import {
  ArrowRight,
  BarChart2,
  Zap,
  Target,
  TrendingUp,
  Brain,
  Palette,
  CheckCircle,
  Database,
  RefreshCw,
  FileText,
  MousePointerClick,
  Globe,
  Mail,
  Search,
  Layers,
} from "lucide-react";

interface LandingPageProps {
  onEnter: (section?: string) => void;
}

const FEATURES = [
  {
    icon: BarChart2,
    title: "Live Campaign Sync",
    body: "Pull real-time data from Google Ads and Meta into a single dashboard. Impressions, clicks, spend, CTR — all in one place, updated every time you fetch.",
  },
  {
    icon: Brain,
    title: "AI Campaign Scoring",
    body: "Every campaign gets an A–F grade across 5 dimensions: efficiency, engagement, reach, consistency, and growth potential. No more guessing what's working.",
  },
  {
    icon: Palette,
    title: "Ad Creative Generation",
    body: "Describe your product, set your audience, and get 5 high-quality ad images — each iteration more refined than the last. Powered by state-of-the-art image models.",
  },
  {
    icon: Target,
    title: "Precision Audience Targeting",
    body: "Define age brackets, target countries, specific states and cities, and gender ratios before generating creatives. Your ads reach exactly who you want.",
  },
  {
    icon: TrendingUp,
    title: "Cross-Platform Analytics",
    body: "Unified charts for spend, CTR, impressions, and clicks across Google and Meta. See your platform split at a glance and drill into individual campaigns.",
  },
  {
    icon: Database,
    title: "Database-Backed Storage",
    body: "All campaign data and AI analysis results are stored in your own Supabase database — not in browser storage. Persistent, queryable, and yours.",
  },
  {
    icon: FileText,
    title: "50+ Content Formats",
    body: "One topic becomes LinkedIn posts, tweets, blog articles, SEO content, GEO-optimized copy, email sequences, and more. The content factory runs 24/7.",
  },
  {
    icon: Globe,
    title: "GEO Content Optimization",
    body: "Generate content optimized for AI search engines like Perplexity and ChatGPT. Stay visible as search behavior shifts away from traditional SEO.",
  },
  {
    icon: Mail,
    title: "Email Writer",
    body: "Write cold outreach, nurture sequences, and promotional emails with AI. Tone-matched to your brand, structured for conversion.",
  },
];

const STATS = [
  { value: "50+", label: "Content formats from one brief" },
  { value: "5", label: "AI creatives per campaign" },
  { value: "A–F", label: "Campaign scoring system" },
  { value: "2", label: "Ad platforms connected" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Connect your ad accounts",
    body: "Link Google Ads and Meta via OAuth in under 2 minutes. Your campaigns, ad accounts, and metrics sync automatically. No CSV exports, no manual data entry.",
    cta: "Connect accounts",
    section: "integrations",
    detail:
      "Supports multiple ad accounts per platform — switch between Tradewise, AstroLearn, and others from a single dropdown.",
  },
  {
    step: "02",
    title: "Fetch live campaign data",
    body: "Pull real metrics — spend, CTR, impressions, clicks, reach, frequency — directly from the platform APIs. Data is stored in your database, not your browser.",
    cta: "View Google Ads",
    section: "google-campaigns",
    detail:
      "Fetches up to 50 active campaigns per account, ordered by spend. Supports ENABLED campaigns only to keep the view clean.",
  },
  {
    step: "03",
    title: "Run AI performance analysis",
    body: "Get every campaign scored across 5 dimensions with specific, actionable recommendations. See what's bleeding budget, what has growth potential, and exactly what to do next.",
    cta: "Analyze campaigns",
    section: "analytics",
    detail:
      "Analysis results are saved to your database so you can track how recommendations change over time.",
  },
  {
    step: "04",
    title: "Generate ad creatives",
    body: "Brief the AI on your product, audience, and objective. Get 5 high-quality ad images — each one more refined than the last — ready to download and deploy.",
    cta: "Create ads",
    section: "ad-creatives",
    detail:
      "Supports Facebook, Instagram, and Google Display formats. Images generated at 4K resolution via Seedream 4.5.",
  },
  {
    step: "05",
    title: "Publish content at scale",
    body: "Turn one topic into a full content calendar. LinkedIn posts, tweets, blog articles, SEO content, emails — all generated and ready to publish.",
    cta: "Open content factory",
    section: "pipeline",
    detail:
      "The AI Writer Studio lets you customize tone, length, and format for every piece of content.",
  },
];

const PLATFORM_FEATURES = [
  {
    label: "Google Ads",
    sub: "Live campaign sync · Multi-account · ENABLED filter",
    color: "bg-green-500",
  },
  {
    label: "Meta / Facebook",
    sub: "Campaigns · Insights · Multiple ad accounts",
    color: "bg-blue-500",
  },
  {
    label: "AI Analysis",
    sub: "A–F scoring · Metric alerts · Optimization priorities",
    color: "bg-purple-500",
  },
  {
    label: "Ad Creatives",
    sub: "5 images per brief · 4K resolution · Download ready",
    color: "bg-orange-400",
  },
  {
    label: "Content Factory",
    sub: "LinkedIn · Twitter · Blog · SEO · GEO · Email",
    color: "bg-pink-500",
  },
  {
    label: "Database Storage",
    sub: "Supabase · Persistent · Queryable · Yours",
    color: "bg-gray-700",
  },
];

const WHATS_INCLUDED = [
  "Campaign scores with A–F grades across 5 dimensions",
  "Platform-level spend breakdown with donut chart",
  "AI-generated optimization priorities with impact levels",
  "Cross-platform CTR and spend bar charts",
  "Metric alerts with benchmarks and recommended actions",
  "Metrics to watch with current status vs target",
  "50+ content formats from a single topic brief",
  "Ad creatives stored in your own database",
  "Multi-account support for Google and Meta",
  "GEO-optimized content for AI search engines",
  "Email writer with tone and structure controls",
  "AI Writer Studio for custom content formats",
];

const CONTENT_TYPES = [
  {
    icon: Layers,
    label: "Content Pipeline",
    sub: "Full campaign in one click",
  },
  { icon: FileText, label: "Blog Writer", sub: "Long-form, SEO-ready" },
  { icon: Search, label: "SEO Articles", sub: "Keyword-optimized" },
  { icon: Globe, label: "GEO Optimizer", sub: "AI search visibility" },
  { icon: Mail, label: "Email Writer", sub: "Cold & nurture sequences" },
  {
    icon: MousePointerClick,
    label: "LinkedIn Writer",
    sub: "Professional posts",
  },
];

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">
              ClickSpark AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <span
              className="hover:text-gray-900 cursor-pointer transition-colors"
              onClick={() => onEnter("analytics")}
            >
              Analytics
            </span>
            <span
              className="hover:text-gray-900 cursor-pointer transition-colors"
              onClick={() => onEnter("ad-creatives")}
            >
              Ad Creatives
            </span>
            <span
              className="hover:text-gray-900 cursor-pointer transition-colors"
              onClick={() => onEnter("pipeline")}
            >
              Content
            </span>
            <span
              className="hover:text-gray-900 cursor-pointer transition-colors"
              onClick={() => onEnter("integrations")}
            >
              Integrations
            </span>
          </div>
          <button
            onClick={() => onEnter()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-28 pb-24">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 font-medium mb-10 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Now with AI campaign scoring · Seedream 4.5 image generation
          </div>

          <h1
            className="text-7xl font-black tracking-tight text-gray-900 leading-[1.02] mb-8"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Stop guessing.
            <br />
            <span className="text-gray-300">Start knowing.</span>
          </h1>

          <p className="text-2xl text-gray-500 max-w-2xl leading-relaxed mb-4 font-light">
            ClickSpark connects your Google Ads and Meta accounts, scores every
            campaign with AI, and generates creatives — all in one platform.
          </p>
          <p className="text-lg text-gray-400 max-w-xl leading-relaxed mb-12">
            Built for performance marketers who are tired of switching between
            10 different tools and still not knowing what's actually working.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => onEnter("analytics")}
              className="inline-flex items-center gap-2.5 px-7 py-4 bg-black text-white rounded-xl text-base font-semibold hover:bg-gray-800 transition-colors"
            >
              Analyze My Campaigns <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEnter("ad-creatives")}
              className="inline-flex items-center gap-2.5 px-7 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl text-base font-semibold hover:border-gray-400 transition-colors"
            >
              Generate Ad Creatives
            </button>
            <button
              onClick={() => onEnter("integrations")}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-4"
            >
              Connect accounts first →
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 py-14">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s) => (
            <div key={s.label}>
              <p
                className="text-5xl font-black text-gray-900 mb-2"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {s.value}
              </p>
              <p className="text-sm text-gray-500 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem statement */}
      <section className="max-w-4xl mx-auto px-8 py-28">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-6">
          The problem
        </p>
        <h2
          className="text-5xl font-black tracking-tight text-gray-900 leading-tight mb-8"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          You're spending money on ads.
          <br />
          You don't know which ones work.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              title: "Data is scattered",
              body: "Google Ads in one tab. Meta Business Manager in another. Spreadsheets for everything else. You spend more time gathering data than acting on it.",
            },
            {
              title: "Insights are vague",
              body: '"CTR is low" isn\'t actionable. You need to know which campaigns to pause, which to scale, and exactly why — with specific next steps.',
            },
            {
              title: "Creatives take forever",
              body: "Briefing a designer, waiting for revisions, testing variations — it takes weeks to get 5 ad images. By then, the moment has passed.",
            },
          ].map((item) => (
            <div key={item.title} className="border-t-2 border-gray-900 pt-6">
              <h3 className="font-bold text-gray-900 text-lg mb-3">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="bg-gray-950 text-white py-28">
        <div className="max-w-4xl mx-auto px-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-6">
            The solution
          </p>
          <h2
            className="text-5xl font-black tracking-tight leading-tight mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            One platform.
            <br />
            <span className="text-gray-400">Every answer.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed mb-16 font-light">
            ClickSpark pulls your live campaign data, scores every campaign with
            AI, surfaces exactly what to fix, and generates creatives — all
            without leaving the dashboard.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORM_FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-4 p-5 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${f.color} shrink-0 mt-1.5`}
                />
                <div>
                  <p className="font-semibold text-white text-sm">{f.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {f.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-8 py-28">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">
            Features
          </p>
          <h2
            className="text-5xl font-black tracking-tight text-gray-900 leading-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Everything you need.
            <br />
            <span className="text-gray-300">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-7 border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-gray-200 transition-colors">
                <f.icon className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2.5">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-28">
        <div className="max-w-4xl mx-auto px-8">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">
              How it works
            </p>
            <h2
              className="text-5xl font-black tracking-tight text-gray-900 leading-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              From zero to insights
              <br />
              in under 5 minutes.
            </h2>
          </div>

          <div className="space-y-4">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-gray-100 p-7"
              >
                <div className="flex items-start gap-6">
                  <span
                    className="text-4xl font-black text-gray-100 shrink-0 leading-none"
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                    }}
                  >
                    {item.step}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-3">
                      {item.body}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-gray-200 pl-3">
                      {item.detail}
                    </p>
                  </div>
                  <button
                    onClick={() => onEnter(item.section)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:border-gray-400 hover:text-gray-900 transition-colors whitespace-nowrap"
                  >
                    {item.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content factory spotlight */}
      <section className="max-w-6xl mx-auto px-8 py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">
              Content Factory
            </p>
            <h2
              className="text-4xl font-black tracking-tight text-gray-900 leading-tight mb-6"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              One topic.
              <br />
              50+ pieces of content.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Enter a topic, set your audience and tone, and watch ClickSpark
              generate a full content calendar across every major platform — in
              minutes, not days.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Every piece is platform-native. LinkedIn posts read like LinkedIn
              posts. Tweets are punchy. Blog articles are structured for SEO.
              Emails are written to convert.
            </p>
            <button
              onClick={() => onEnter("pipeline")}
              className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Open Content Pipeline <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CONTENT_TYPES.map((ct) => (
              <div
                key={ct.label}
                onClick={() =>
                  onEnter(ct.label.toLowerCase().replace(" ", "-"))
                }
                className="p-5 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
              >
                <ct.icon className="w-5 h-5 text-gray-400 mb-3 group-hover:text-gray-700 transition-colors" />
                <p className="font-semibold text-gray-900 text-sm">
                  {ct.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{ct.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="bg-gray-950 text-white py-28">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4">
                What's included
              </p>
              <h2
                className="text-4xl font-black tracking-tight leading-tight mb-6"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Built for teams
                <br />
                that move fast.
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg font-light">
                ClickSpark isn't a reporting tool. It's an action platform.
                Every insight comes with a specific next step. Every creative is
                ready to deploy.
              </p>
            </div>
            <ul className="space-y-3 pt-2">
              {WHATS_INCLUDED.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-gray-300"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-6">
            Get started
          </p>
          <h2
            className="text-6xl font-black tracking-tight text-gray-900 leading-tight mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Ready to see what's
            <br />
            actually working?
          </h2>
          <p className="text-xl text-gray-400 mb-12 font-light leading-relaxed">
            Connect your first ad account in under 2 minutes. Your campaigns,
            scored and analyzed, waiting for you.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => onEnter("analytics")}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-black text-white rounded-xl text-base font-semibold hover:bg-gray-800 transition-colors"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEnter("integrations")}
              className="inline-flex items-center gap-2.5 px-8 py-4 border border-gray-200 text-gray-700 rounded-xl text-base font-semibold hover:border-gray-400 transition-colors"
            >
              Connect Ad Accounts
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-8">
            No credit card. No setup fee. Your data stays in your database.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">ClickSpark AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-400">
            <span
              className="cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => onEnter("analytics")}
            >
              Analytics
            </span>
            <span
              className="cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => onEnter("ad-creatives")}
            >
              Ad Creatives
            </span>
            <span
              className="cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => onEnter("pipeline")}
            >
              Content
            </span>
            <span
              className="cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => onEnter("integrations")}
            >
              Integrations
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Marketing intelligence. No fluff.
          </p>
        </div>
      </footer>
    </div>
  );
}
