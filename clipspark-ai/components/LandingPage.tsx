"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Zap,
  BarChart2,
  Brain,
  Palette,
  FileText,
  Globe,
  Mail,
  TrendingUp,
  Video,
  Sparkles,
  Search,
  MessageSquare,
  Target,
  Database,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

interface LandingPageProps {
  onEnter: (section?: string) => void;
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(24px) scale(0.98)",
        transition: `opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const PIPELINES = [
  {
    id: "performance",
    label: "Ad Intelligence",
    title: "Run smarter ads.",
    tagline: "Stop guessing which campaigns work.",
    description:
      "Connect your Google Ads and Meta accounts. See every campaign's real numbers — spend, clicks, reach — in one place. Our AI grades each campaign from A to F and tells you exactly what to cut, what to scale, and what to fix. No more spreadsheets. No more gut calls.",
    color: "#1a73e8",
    lightColor: "#e8f0fe",
    features: [
      { icon: BarChart2, text: "Live Google & Meta campaign data" },
      { icon: Brain, text: "AI grades every campaign A–F" },
      { icon: TrendingUp, text: "Charts across both platforms" },
      { icon: Target, text: "Alerts when metrics go off-track" },
      { icon: Palette, text: "5 AI ad images per brief, at 4K" },
      { icon: Database, text: "Everything saved to your database" },
    ],
    cta: "See your campaigns",
    section: "analytics",
  },
  {
    id: "ugc",
    label: "AI Video & UGC",
    title: "Content that doesn't feel like an ad.",
    tagline: "The trust layer your brand is missing.",
    description:
      "Real-looking, scroll-stopping video scripts and UGC-style content — generated in seconds. The kind of content people share, save, and remember. It doesn't interrupt. It earns attention. And it makes every paid ad you run work harder.",
    color: "#f4511e",
    lightColor: "#fce8e6",
    features: [
      { icon: Video, text: "Video scripts for any platform" },
      { icon: Sparkles, text: "Hooks that stop the scroll" },
      { icon: Brain, text: "UGC formats that feel authentic" },
      { icon: Target, text: "Matched to your audience's language" },
      { icon: FileText, text: "Repurpose one idea everywhere" },
      { icon: Zap, text: "Multiple variations from one brief" },
    ],
    cta: "Write your first script",
    section: "ai-writer",
  },
  {
    id: "distribution",
    label: "Content Engine",
    title: "Publish everywhere.",
    tagline: "Build an audience you actually own.",
    description:
      "Type a topic. ClickSpark writes LinkedIn posts, tweets, blog articles, SEO content, emails, and more — all in your brand's voice, all ready to post. The more you publish, the less you pay for attention. Owned channels compound. Ad spend doesn't.",
    color: "#0f9d58",
    lightColor: "#e6f4ea",
    features: [
      { icon: MessageSquare, text: "LinkedIn & Twitter posts" },
      { icon: FileText, text: "Blog articles & SEO content" },
      { icon: Globe, text: "Content for AI search engines" },
      { icon: Mail, text: "Cold emails & nurture sequences" },
      { icon: Sparkles, text: "Any format, any tone" },
      { icon: RefreshCw, text: "Full calendar from one brief" },
    ],
    cta: "Start creating content",
    section: "pipeline",
  },
];

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activePipeline, setActivePipeline] = useState(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#1a73e8" }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              ClickSpark
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            {[
              ["Ad Intelligence", "analytics"],
              ["Content Engine", "pipeline"],
              ["AI Video & UGC", "ai-writer"],
              ["Integrations", "integrations"],
            ].map(([l, s]) => (
              <button
                key={l}
                onClick={() => onEnter(s)}
                className="hover:text-blue-600 transition-colors font-medium"
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={() => onEnter()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: "#1a73e8" }}
          >
            Get started <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* HERO — full width */}
      <section
        className="w-full pt-32 pb-0 overflow-hidden"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
              style={{ backgroundColor: "#e8f0fe", color: "#1a73e8" }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              One platform. Every marketing move.
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1
              className="text-[4.5rem] md:text-[6rem] font-black tracking-tight leading-[0.95] text-gray-900 mb-8 max-w-5xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Run better ads.
              <br />
              <span style={{ color: "#1a73e8" }}>Publish everywhere.</span>
              <br />
              Build real trust.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-xl md:text-2xl text-gray-500 font-light max-w-2xl leading-relaxed mb-12">
              ClickSpark gives your marketing team three superpowers: smarter ad
              decisions, content that compounds, and video that earns attention
              — all from one place.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex items-center gap-4 flex-wrap mb-16">
              <button
                onClick={() => onEnter("analytics")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: "#1a73e8" }}
              >
                Analyze my ads <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEnter("pipeline")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold border-2 border-gray-200 text-gray-700 hover:border-blue-400 transition-all"
              >
                Write content
              </button>
              <button
                onClick={() => onEnter("ai-writer")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold border-2 border-gray-200 text-gray-700 hover:border-orange-400 transition-all"
              >
                Make a video script
              </button>
            </div>
          </Reveal>
        </div>

        {/* Hero visual — 3 pipeline cards full width */}
        <div className="w-full px-6 pb-8">
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4 items-stretch">
            {PIPELINES.map((p, i) => (
              <Reveal key={p.id} delay={i * 100} className="flex">
                <div
                  className="rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col w-full"
                  style={{
                    backgroundColor: p.lightColor,
                    borderTop: `4px solid ${p.color}`,
                  }}
                  onClick={() => onEnter(p.section)}
                >
                  <div
                    className="text-xs font-bold tracking-widest uppercase mb-3"
                    style={{ color: p.color }}
                  >
                    {p.label}
                  </div>
                  <h3
                    className="text-2xl font-black text-gray-900 mb-1"
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-sm font-semibold mb-4"
                    style={{ color: p.color }}
                  >
                    {p.tagline}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">
                    {p.description.slice(0, 120)}...
                  </p>
                  <div
                    className="flex items-center gap-1.5 mt-6 text-sm font-semibold"
                    style={{ color: p.color }}
                  >
                    {p.cta} <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY STRIP */}
      <section
        className="w-full py-16 px-6"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-700">
              {[
                {
                  label: "Ad Intelligence",
                  sub: "Know which ads are making money and which are burning it.",
                  color: "#4285f4",
                },
                {
                  label: "Content Engine",
                  sub: "Build an audience you own. Publish everywhere, automatically.",
                  color: "#34a853",
                },
                {
                  label: "AI Video & UGC",
                  sub: "Create content that earns trust — not just impressions.",
                  color: "#ea4335",
                },
              ].map((item) => (
                <div key={item.label} className="px-10 py-8">
                  <div
                    className="text-lg font-bold mb-1"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </div>
                  <div className="text-gray-400 text-sm leading-relaxed">
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* THREE PIPELINES DEEP DIVE */}
      {PIPELINES.map((p, idx) => (
        <section
          key={p.id}
          className="w-full py-28 px-6"
          style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f8f9fa" }}
        >
          <div className="max-w-7xl mx-auto">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-16 items-center ${idx % 2 !== 0 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              {/* Text */}
              <div>
                <Reveal>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
                    style={{ backgroundColor: p.lightColor, color: p.color }}
                  >
                    {p.label}
                  </div>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="text-5xl font-black tracking-tight text-gray-900 leading-tight mb-3"
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                    }}
                  >
                    {p.title}
                  </h2>
                  <p
                    className="text-2xl font-semibold mb-6"
                    style={{ color: p.color }}
                  >
                    {p.tagline}
                  </p>
                </Reveal>
                <Reveal delay={160}>
                  <p className="text-lg text-gray-500 leading-relaxed mb-10">
                    {p.description}
                  </p>
                </Reveal>
                <Reveal delay={220}>
                  <button
                    onClick={() => onEnter(p.section)}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white shadow-md hover:shadow-xl transition-all"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </Reveal>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-2 gap-3">
                {p.features.map((f, i) => (
                  <Reveal key={f.text} delay={i * 60}>
                    <div
                      className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all duration-300 cursor-pointer group"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                      onClick={() => onEnter(p.section)}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors"
                        style={{ backgroundColor: p.lightColor }}
                      >
                        <f.icon
                          className="w-4 h-4"
                          style={{ color: p.color }}
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-700 leading-snug">
                        {f.text}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* UNIFIED INTELLIGENCE SECTION */}
      <section
        className="w-full py-28 px-6"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <Reveal>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
              style={{
                backgroundColor: "rgba(66,133,244,0.15)",
                color: "#4285f4",
              }}
            >
              <Sparkles className="w-4 h-4" /> One platform. Three superpowers.
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2
              className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6"
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                color: "#fff",
              }}
            >
              Three tools.
              <br />
              <span style={{ color: "#4285f4" }}>
                One brain behind all of them.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed mb-16">
              Your ad data tells you what messages convert. That insight shapes
              your content. Your content builds the audience your ads need. Your
              video makes all of it feel human. ClickSpark is the thread
              connecting all three.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: "Your ads tell you what works",
                body: "Campaign data reveals which messages, audiences, and offers actually convert. That signal should feed everything else you create.",
                color: "#4285f4",
                icon: BarChart2,
              },
              {
                title: "Your content builds what ads can't buy",
                body: "Organic reach, search rankings, email lists — owned channels that grow over time and make every rupee of ad spend go further.",
                color: "#34a853",
                icon: Globe,
              },
              {
                title: "Your UGC makes it all feel real",
                body: "Content that doesn't look like an ad. The kind people share, save, and trust. It runs quietly in the background while your paid campaigns close the deal.",
                color: "#ea4335",
                icon: Video,
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div
                  className="p-8 rounded-2xl"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${item.color}22` }}
                  >
                    <item.icon
                      className="w-5 h-5"
                      style={{ color: item.color }}
                    />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="w-full py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            {
              value: "50+",
              label: "Content formats, one brief",
              color: "#1a73e8",
            },
            {
              value: "5",
              label: "Ad images generated per campaign",
              color: "#0f9d58",
            },
            {
              value: "A–F",
              label: "Every campaign gets a grade",
              color: "#f4511e",
            },
            {
              value: "3",
              label: "Marketing tools, one login",
              color: "#f9ab00",
            },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div>
                <p
                  className="text-5xl font-black mb-2"
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    color: s.color,
                  }}
                >
                  {s.value}
                </p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="w-full py-28 px-6"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
              How it works
            </p>
            <h2
              className="text-5xl font-black tracking-tight text-gray-900 leading-tight mb-16 max-w-2xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Up and running
              <br />
              in 5 minutes flat.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                n: "01",
                title: "Connect",
                body: "Link your Google Ads and Meta accounts. Takes 2 minutes.",
                color: "#1a73e8",
                section: "integrations",
              },
              {
                n: "02",
                title: "Sync",
                body: "Your live campaign data pulls in automatically and saves to your database.",
                color: "#0f9d58",
                section: "google-campaigns",
              },
              {
                n: "03",
                title: "Analyze",
                body: "AI grades every campaign and tells you exactly what to do next.",
                color: "#f4511e",
                section: "analytics",
              },
              {
                n: "04",
                title: "Create",
                body: "Generate ad images and content from a single brief.",
                color: "#f9ab00",
                section: "ad-creatives",
              },
              {
                n: "05",
                title: "Publish",
                body: "Post across every channel. Build the audience you own.",
                color: "#9c27b0",
                section: "pipeline",
              },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 80}>
                <div
                  className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                  onClick={() => onEnter(step.section)}
                >
                  <div
                    className="text-3xl font-black mb-4"
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      color: step.color,
                    }}
                  >
                    {step.n}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT FORMATS GRID */}
      <section className="w-full py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <Reveal>
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                  Content Engine
                </p>
                <h2
                  className="text-5xl font-black tracking-tight text-gray-900 leading-tight mb-6"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  One topic.
                  <br />
                  Everywhere it needs to be.
                </h2>
                <p className="text-lg text-gray-500 leading-relaxed mb-8">
                  Type a topic. ClickSpark writes the LinkedIn post, the tweet
                  thread, the blog article, the SEO piece, and the email — all
                  at once, all in your voice. The brands that win aren't the
                  ones with the biggest ad budgets. They're the ones that show
                  up everywhere, consistently.
                </p>
                <button
                  onClick={() => onEnter("pipeline")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white shadow-md hover:shadow-xl transition-all"
                  style={{ backgroundColor: "#0f9d58" }}
                >
                  Start publishing <ArrowRight className="w-4 h-4" />
                </button>
              </Reveal>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: MessageSquare,
                  label: "LinkedIn Writer",
                  sub: "Professional posts that drive engagement",
                  section: "linkedin",
                  color: "#0077b5",
                },
                {
                  icon: Zap,
                  label: "Twitter / X",
                  sub: "Punchy, shareable, algorithm-friendly",
                  section: "twitter",
                  color: "#1da1f2",
                },
                {
                  icon: FileText,
                  label: "Blog Writer",
                  sub: "Long-form, structured, SEO-ready",
                  section: "blog",
                  color: "#ff6d00",
                },
                {
                  icon: Search,
                  label: "SEO Articles",
                  sub: "Keyword-optimized, rank-worthy content",
                  section: "seo",
                  color: "#1a73e8",
                },
                {
                  icon: Globe,
                  label: "GEO Optimizer",
                  sub: "Visible in AI search engines",
                  section: "geo",
                  color: "#0f9d58",
                },
                {
                  icon: Mail,
                  label: "Email Writer",
                  sub: "Cold outreach & nurture sequences",
                  section: "email",
                  color: "#ea4335",
                },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 50}>
                  <div
                    className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all duration-300 cursor-pointer"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                    onClick={() => onEnter(item.section)}
                  >
                    <item.icon
                      className="w-5 h-5 mb-3"
                      style={{ color: item.color }}
                    />
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                      {item.sub}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="w-full py-32 px-6"
        style={{ backgroundColor: "#1a73e8" }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <Reveal>
            <h2
              className="text-6xl font-black tracking-tight leading-tight mb-6 text-white"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Your marketing,
              <br />
              finally working together.
            </h2>
            <p className="text-xl text-blue-100 font-light max-w-xl mx-auto leading-relaxed mb-12">
              Smarter ads. Content that compounds. Video that earns trust. One
              platform, one brief, one brand voice.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={() => onEnter("analytics")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-white text-blue-600 hover:shadow-xl transition-all"
              >
                Get started free <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEnter("integrations")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold border-2 border-white/40 text-white hover:border-white transition-all"
              >
                Connect ad accounts
              </button>
            </div>
            <p className="text-sm text-blue-200 mt-8">
              Your data stays in your database. Always.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-10 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#1a73e8" }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">ClickSpark AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-400">
            {[
              ["Ad Intelligence", "analytics"],
              ["Ad Creatives", "ad-creatives"],
              ["Content Engine", "pipeline"],
              ["AI Video & UGC", "ai-writer"],
              ["Integrations", "integrations"],
            ].map(([l, s]) => (
              <button
                key={l}
                onClick={() => onEnter(s)}
                className="hover:text-gray-700 transition-colors"
              >
                {l}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            One intelligence. Three pipelines.
          </p>
        </div>
      </footer>
    </div>
  );
}
