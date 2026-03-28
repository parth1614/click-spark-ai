"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
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

// ── Magnetic button ──────────────────────────────────────────────────────────
function MagneticButton({
  children,
  className,
  style,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.3);
    y.set((e.clientY - cy) * 0.3);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy, ...style }}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * to));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, to]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ── Floating orb ─────────────────────────────────────────────────────────────
function FloatingOrb({
  x,
  y,
  size,
  color,
  delay,
}: {
  x: string;
  y: string;
  size: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        backgroundColor: color,
        filter: "blur(60px)",
        opacity: 0.18,
      }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

// ── Ticker ────────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "Ad Intelligence",
  "AI Video & UGC",
  "Content Engine",
  "Google Ads",
  "Meta Ads",
  "SEO Articles",
  "LinkedIn Posts",
  "Email Sequences",
  "Video Scripts",
  "GEO Optimization",
  "Campaign Scoring",
  "AI Creatives",
  "Blog Writer",
];

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      className="w-full overflow-hidden py-4 border-y border-gray-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="text-sm font-medium text-gray-400 flex items-center gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Typing demo ───────────────────────────────────────────────────────────────
const TYPING_PHRASES = [
  "Analyze why my Google Ads CTR dropped this week",
  "Generate 5 ad creatives for our summer sale",
  "Generate an AI UGC video with the Founder's Avatar",
  "Create a video script for our Instagram Reel",
];

function TypingDemo() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const phrase = TYPING_PHRASES[phraseIdx];
    if (typing) {
      if (displayed.length < phrase.length) {
        const t = setTimeout(
          () => setDisplayed(phrase.slice(0, displayed.length + 1)),
          38,
        );
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 1800);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 18);
        return () => clearTimeout(t);
      } else {
        setPhraseIdx((i) => (i + 1) % TYPING_PHRASES.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, phraseIdx]);

  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-gray-400 font-medium">
          ClickSpark AI
        </span>
      </div>
      <div className="flex items-start gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: "#1a73e8" }}
        >
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-h-[48px]">
          <p className="text-sm text-gray-700 leading-relaxed">
            {displayed}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 align-middle"
            />
          </p>
        </div>
      </div>
      {/* <AnimatePresence>
        {displayed.length > 20 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400">
              Generating response...
            </span>
          </motion.div>
        )}
      </AnimatePresence> */}
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
      "Connect your Google Ads and Meta accounts. See every campaign's real numbers — spend, clicks, reach — in one place. Our AI grades each campaign from A to F and tells you exactly what to cut, what to scale, and what to fix.",
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
      "Real-looking, scroll-stopping video scripts and UGC-style content — generated in seconds. The kind of content people share, save, and remember. It earns attention. And it makes every paid ad you run work harder.",
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
      "Type a topic. ClickSpark writes LinkedIn posts, tweets, blog articles, SEO content, emails, and more — all in your brand's voice, all ready to post. The more you publish, the less you pay for attention.",
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
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 h-0.5 z-[60]"
        style={{ width: progressWidth, backgroundColor: "#1a73e8" }}
      />

      {/* NAV */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-transparent"}`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.04 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#1a73e8" }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              ClickSpark
            </span>
          </motion.div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            {[
              ["Ad Intelligence", "analytics"],
              ["AI Video & UGC", "ai-writer"],
              ["Content Engine", "pipeline"],
              ["Integrations", "integrations"],
            ].map(([l, s]) => (
              <motion.button
                key={l}
                onClick={() => onEnter(s)}
                className="hover:text-blue-600 transition-colors font-medium"
                whileHover={{ y: -1 }}
              >
                {l}
              </motion.button>
            ))}
          </div>
          <MagneticButton
            onClick={() => onEnter()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#1a73e8" }}
          >
            Get started <ArrowRight className="w-3.5 h-3.5" />
          </MagneticButton>
        </div>
      </motion.nav>

      {/* HERO */}
      <section
        className="w-full pt-32 pb-0 overflow-hidden relative"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        {/* Floating orbs */}
        <FloatingOrb x="5%" y="10%" size={400} color="#1a73e8" delay={0} />
        <FloatingOrb x="70%" y="5%" size={300} color="#f4511e" delay={1.5} />
        <FloatingOrb x="85%" y="50%" size={250} color="#0f9d58" delay={3} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
                style={{ backgroundColor: "#e8f0fe", color: "#1a73e8" }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                One platform. Every marketing move.
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-[4.5rem] md:text-[6.5rem] font-black tracking-tight leading-[0.92] text-gray-900 mb-8 max-w-5xl"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Run better ads.
              <br />
              <motion.span
                style={{ color: "#1a73e8" }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Publish everywhere.
              </motion.span>
              <br />
              <motion.span
                style={{ color: "#f4511e" }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                Build real trust.
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl md:text-2xl text-gray-500 font-light max-w-2xl leading-relaxed mb-12"
            >
              ClickSpark gives your marketing team three superpowers: smarter ad
              decisions, content that compounds, and video that earns attention
              — all from one place.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex items-center gap-4 flex-wrap mb-16"
            >
              <MagneticButton
                onClick={() => onEnter("analytics")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white shadow-lg"
                style={{ backgroundColor: "#1a73e8" }}
              >
                Analyze my ads <ArrowRight className="w-4 h-4" />
              </MagneticButton>
              <MagneticButton
                onClick={() => onEnter("pipeline")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold border-2 border-gray-200 text-gray-700 bg-white"
              >
                Write content
              </MagneticButton>
              <MagneticButton
                onClick={() => onEnter("ai-writer")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold border-2 border-gray-200 text-gray-700 bg-white"
              >
                Make a video script
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Typing demo */}
          <motion.div
            className="max-w-xl mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            <TypingDemo />
          </motion.div>
        </div>

        {/* Hero cards */}
        <div className="w-full px-6 pb-8">
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4 items-stretch">
            {PIPELINES.map((p, i) => (
              <motion.div
                key={p.id}
                className="flex"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.9 + i * 0.12,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >
                <motion.div
                  className="rounded-2xl p-8 cursor-pointer flex flex-col w-full"
                  style={{
                    backgroundColor: p.lightColor,
                    borderTop: `4px solid ${p.color}`,
                  }}
                  onClick={() => onEnter(p.section)}
                  whileHover={{ y: -6, boxShadow: `0 20px 40px ${p.color}22` }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <Ticker />

      {/* PHILOSOPHY STRIP */}
      <section
        className="w-full py-16 px-6"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-700"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {[
              {
                label: "Ad Intelligence",
                sub: "Know which ads are making money and which are burning it.",
                color: "#4285f4",
              },
              {
                label: "AI Video & UGC",
                sub: "Create content that earns trust — not just impressions.",
                color: "#ea4335",
              },
              {
                label: "Content Engine",
                sub: "Build an audience you own. Publish everywhere, automatically.",
                color: "#34a853",
              },
            ].map((item) => (
              <motion.div
                key={item.label}
                className="px-10 py-8"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
              >
                <div
                  className="text-lg font-bold mb-1"
                  style={{ color: item.color }}
                >
                  {item.label}
                </div>
                <div className="text-gray-400 text-sm leading-relaxed">
                  {item.sub}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* THREE SECTIONS DEEP DIVE */}
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
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
                  style={{ backgroundColor: p.lightColor, color: p.color }}
                >
                  {p.label}
                </div>
                <h2
                  className="text-5xl font-black tracking-tight text-gray-900 leading-tight mb-3"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {p.title}
                </h2>
                <p
                  className="text-2xl font-semibold mb-6"
                  style={{ color: p.color }}
                >
                  {p.tagline}
                </p>
                <p className="text-lg text-gray-500 leading-relaxed mb-10">
                  {p.description}
                </p>
                <MagneticButton
                  onClick={() => onEnter(p.section)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white shadow-md"
                  style={{ backgroundColor: p.color }}
                >
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </MagneticButton>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 gap-3"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.07 } },
                }}
              >
                {p.features.map((f) => (
                  <motion.div
                    key={f.text}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.95 },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.4 },
                      },
                    }}
                    whileHover={{ y: -4, boxShadow: `0 8px 24px ${p.color}18` }}
                    className="p-5 rounded-2xl border border-gray-100 bg-white cursor-pointer"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                    onClick={() => onEnter(p.section)}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: p.lightColor }}
                    >
                      <f.icon className="w-4 h-4" style={{ color: p.color }} />
                    </div>
                    <p className="text-sm font-medium text-gray-700 leading-snug">
                      {f.text}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* UNIFIED SECTION */}
      <section
        className="w-full py-28 px-6"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
              style={{
                backgroundColor: "rgba(66,133,244,0.15)",
                color: "#4285f4",
              }}
            >
              <Sparkles className="w-4 h-4" /> One platform. Three superpowers.
            </div>
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
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed mb-16">
              Your ad data tells you what messages convert. That insight shapes
              your content. Your content builds the audience your ads need. Your
              video makes all of it feel human.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12 } },
            }}
          >
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
                body: "Content that doesn't look like an ad. The kind people share, save, and trust. It runs quietly while your paid campaigns close the deal.",
                color: "#ea4335",
                icon: Video,
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                whileHover={{ scale: 1.02, borderColor: item.color }}
                className="p-8 rounded-2xl transition-colors"
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="w-full py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            {
              value: 50,
              suffix: "+",
              label: "Content formats, one brief",
              color: "#1a73e8",
            },
            {
              value: 5,
              suffix: "",
              label: "Ad images generated per campaign",
              color: "#0f9d58",
            },
            {
              value: 3,
              suffix: "",
              label: "Marketing tools, one login",
              color: "#f4511e",
            },
            {
              value: 2,
              suffix: "",
              label: "Ad platforms connected",
              color: "#f9ab00",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <p
                className="text-5xl font-black mb-2"
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  color: s.color,
                }}
              >
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="w-full py-28 px-6"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
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
          </motion.div>
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
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6, boxShadow: `0 16px 32px ${step.color}20` }}
                className="p-6 rounded-2xl bg-white border border-gray-100 cursor-pointer h-full"
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT FORMATS */}
      <section className="w-full py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
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
                thread, the blog article, the SEO piece, and the email — all at
                once, all in your voice. The brands that win aren't the ones
                with the biggest ad budgets. They're the ones that show up
                everywhere, consistently.
              </p>
              <MagneticButton
                onClick={() => onEnter("pipeline")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white shadow-md"
                style={{ backgroundColor: "#0f9d58" }}
              >
                Start publishing <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.07 } },
              }}
            >
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
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.4 },
                    },
                  }}
                  whileHover={{
                    y: -4,
                    boxShadow: `0 8px 24px ${item.color}18`,
                  }}
                  className="p-5 rounded-2xl border border-gray-100 bg-white cursor-pointer"
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
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="w-full py-32 px-6"
        style={{ backgroundColor: "#1a73e8" }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
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
              <MagneticButton
                onClick={() => onEnter("analytics")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-white text-blue-600"
              >
                Get started free <ArrowRight className="w-4 h-4" />
              </MagneticButton>
              <MagneticButton
                onClick={() => onEnter("integrations")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold border-2 border-white/40 text-white"
              >
                Connect ad accounts
              </MagneticButton>
            </div>
            <p className="text-sm text-blue-200 mt-8">
              Your data stays in your database. Always.
            </p>
          </motion.div>
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
            One intelligence. Three superpowers.
          </p>
        </div>
      </footer>
    </div>
  );
}
