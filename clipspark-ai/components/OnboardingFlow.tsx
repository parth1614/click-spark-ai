"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const RESEARCH_SUBS = [
  "Scraping Reddit — 200+ subreddits in your niche",
  "Mapping top LinkedIn accounts in your industry",
  "Analyzing competitor ad libraries on Meta & Google",
  "Crawling G2 and Capterra for market positioning data",
  "Indexing top-performing content in your vertical",
  "Scanning Twitter/X for trending conversations",
  "Pulling SEO keyword gaps from top 50 competitors",
  "Identifying high-intent communities on Discord & Slack",
  "Extracting pricing page patterns from 30+ competitors",
  "Aggregating product review sentiment from Trustpilot",
];

const PIPELINE_STEPS = [
  {
    text: "Spawning deep research agent",
    sub: "Analyzing your market, competitors, and positioning",
    duration: 8000,
    color: "#8b5cf6",
    gradient: "from-violet-600 to-purple-600",
  },
  {
    text: "Building marketing engine",
    sub: "Connecting ad intelligence and campaign optimization layers",
    duration: 3200,
    color: "#3b82f6",
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    text: "Initializing AI UGC pipeline",
    sub: "Setting up video generation, script writing, and creative tools",
    duration: 2800,
    color: "#ef4444",
    gradient: "from-red-500 to-orange-500",
  },
  {
    text: "Activating distribution network",
    sub: "Preparing multi-channel publishing across all platforms",
    duration: 3000,
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [phase, setPhase] = useState<"form" | "animation">("form");
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [allDone, setAllDone] = useState(false);
  const [researchSub, setResearchSub] = useState(RESEARCH_SUBS[0]);

  const handleProceed = () => {
    if (!companyName.trim()) return;
    setPhase("animation");
  };

  const stableOnComplete = useCallback(onComplete, [onComplete]);

  // Cycle research sub-text while step 0 is active
  useEffect(() => {
    if (currentStep !== 0 || completedSteps.includes(0)) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % RESEARCH_SUBS.length;
      setResearchSub(RESEARCH_SUBS[idx]);
    }, 1200);
    return () => clearInterval(interval);
  }, [currentStep, completedSteps]);

  useEffect(() => {
    if (phase !== "animation") return;

    let stepIdx = 0;
    const timer = setTimeout(() => {
      const runStep = () => {
        if (stepIdx >= PIPELINE_STEPS.length) {
          setAllDone(true);
          setTimeout(stableOnComplete, 1800);
          return;
        }
        setCurrentStep(stepIdx);
        const dur = PIPELINE_STEPS[stepIdx].duration;
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, stepIdx]);
          stepIdx++;
          setTimeout(runStep, 400);
        }, dur);
      };
      runStep();
    }, 1200);

    return () => clearTimeout(timer);
  }, [phase, stableOnComplete]);

  return (
    <AnimatePresence mode="wait">
      {phase === "form" && (
        <motion.div
          key="form"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
          >
            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />

            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-600/25"
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Zap className="w-7 h-7 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Welcome to ClickSpark
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Tell us about your company and we&apos;ll build your
                  personalized marketing workspace
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Inc."
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50/50 focus:bg-white transition-all placeholder:text-gray-400"
                    onKeyDown={(e) => e.key === "Enter" && handleProceed()}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Website
                  </label>
                  <input
                    type="url"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://acme.com"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50/50 focus:bg-white transition-all placeholder:text-gray-400"
                    onKeyDown={(e) => e.key === "Enter" && handleProceed()}
                  />
                </div>
              </div>

              <motion.button
                onClick={handleProceed}
                disabled={!companyName.trim()}
                className="w-full mt-7 py-4 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Launch my workspace <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {phase === "animation" && (
        <motion.div
          key="animation"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Clean white background */}
          <div className="absolute inset-0 bg-white" />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
              left: "20%",
              top: "30%",
            }}
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -60, 40, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
              right: "15%",
              bottom: "20%",
            }}
            animate={{
              x: [0, -60, 30, 0],
              y: [0, 50, -30, 0],
              scale: [1, 0.8, 1.1, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
              left: "50%",
              top: "10%",
            }}
            animate={{
              x: [0, 40, -60, 0],
              y: [0, 70, -20, 0],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating particles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 3,
                height: 2 + Math.random() * 3,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: [
                  "#818cf8",
                  "#a78bfa",
                  "#f472b6",
                  "#34d399",
                  "#60a5fa",
                ][i % 5],
              }}
              animate={{
                y: [0, -(100 + Math.random() * 200)],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0, 0.7, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Main content */}
          <div className="relative z-10 w-full max-w-xl mx-4">
            {/* Logo entrance */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 12,
                delay: 0.2,
              }}
            >
              <div className="relative">
                {/* Outer ring pulse */}
                <motion.div
                  className="absolute -inset-8 rounded-full border border-gray-200/50"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -inset-16 rounded-full border border-gray-200/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Company name */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p className="text-gray-400 text-xs font-semibold tracking-[0.3em] uppercase mb-3">
                Initializing
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                {companyName}
              </h2>
            </motion.div>

            {/* Steps */}
            <div className="space-y-3">
              {PIPELINE_STEPS.map((step, i) => {
                const isActive =
                  currentStep === i && !completedSteps.includes(i);
                const isCompleted = completedSteps.includes(i);
                const isVisible =
                  currentStep >= i || completedSteps.includes(i);

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={
                      isVisible
                        ? { opacity: 1, y: 0, filter: "blur(0px)" }
                        : { opacity: 0, y: 20, filter: "blur(10px)" }
                    }
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <div
                      className={`relative rounded-2xl border transition-all duration-500 overflow-hidden ${
                        isActive
                          ? "border-gray-200 bg-gray-50/80 shadow-sm"
                          : isCompleted
                            ? "border-gray-100 bg-gray-50/40"
                            : "border-transparent bg-transparent"
                      }`}
                    >
                      {/* Active glow */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 opacity-10"
                          style={{
                            background: `linear-gradient(135deg, ${step.color}20 0%, transparent 60%)`,
                          }}
                          animate={{ opacity: [0.05, 0.15, 0.05] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      <div className="relative flex items-center gap-4 px-5 py-4">
                        {/* Status indicator */}
                        <div className="relative w-10 h-10 shrink-0">
                          {isActive && (
                            <>
                              <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{ border: `2px solid ${step.color}` }}
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                <div
                                  className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                                  style={{
                                    backgroundColor: step.color,
                                    boxShadow: `0 0 12px ${step.color}`,
                                  }}
                                />
                              </motion.div>
                              <motion.div
                                className="absolute inset-1 rounded-full"
                                style={{ backgroundColor: `${step.color}10` }}
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            </>
                          )}
                          {isCompleted && (
                            <motion.div
                              className="absolute inset-0 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${step.color}20` }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                              }}
                            >
                              <motion.svg
                                className="w-5 h-5"
                                style={{ color: step.color }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                              >
                                <motion.path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{
                                    duration: 0.4,
                                    ease: "easeOut",
                                  }}
                                />
                              </motion.svg>
                            </motion.div>
                          )}
                          {!isActive && !isCompleted && (
                            <div className="absolute inset-0 rounded-full border border-gray-200 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold transition-colors duration-300 ${
                              isActive
                                ? "text-gray-900"
                                : isCompleted
                                  ? "text-gray-400"
                                  : "text-gray-300"
                            }`}
                          >
                            {step.text}
                          </p>
                          {(isActive || isCompleted) && (
                            <motion.p
                              key={i === 0 && isActive ? researchSub : step.sub}
                              className={`text-xs mt-0.5 ${isActive ? "text-gray-500" : "text-gray-400"}`}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {i === 0 && isActive ? researchSub : step.sub}
                            </motion.p>
                          )}
                        </div>

                        {/* Status text */}
                        <div className="shrink-0">
                          {isActive && (
                            <motion.span
                              className="text-xs font-medium"
                              style={{ color: step.color }}
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              Processing
                            </motion.span>
                          )}
                          {isCompleted && (
                            <motion.span
                              className="text-xs font-medium text-gray-400"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              Done
                            </motion.span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      {isActive && (
                        <div className="h-[2px] bg-gray-100">
                          <motion.div
                            className="h-full"
                            style={{
                              background: `linear-gradient(90deg, ${step.color}, ${step.color}80)`,
                            }}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              duration: step.duration / 1000,
                              ease: "easeInOut",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Completion state */}
            <AnimatePresence>
              {allDone && (
                <motion.div
                  className="mt-10 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Success burst */}
                  <motion.div
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <motion.svg
                        className="w-9 h-9 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <motion.path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        />
                      </motion.svg>
                    </div>
                  </motion.div>

                  <motion.p
                    className="text-xl font-bold text-gray-900 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Your workspace is ready
                  </motion.p>
                  <motion.p
                    className="text-sm text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Launching dashboard...
                  </motion.p>

                  {/* Loading dots */}
                  <motion.div
                    className="flex justify-center gap-1.5 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-300"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
