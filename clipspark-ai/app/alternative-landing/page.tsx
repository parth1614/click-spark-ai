"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = [
  "We decide what you buy.",
  "We decide what you scroll past.",
  "We decide what stays in your head.",
];

function splitWords(line: string) {
  return line.split(" ");
}

export default function AlternativeLanding() {
  const [activeLine, setActiveLine] = useState(-1);
  const [showBrand, setShowBrand] = useState(false);
  const [key, setKey] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;

    // Line 1 starts at 1s
    const t1 = setTimeout(() => setActiveLine(0), 1000);
    // Line 2 at 7s
    const t2 = setTimeout(() => setActiveLine(1), 7000);
    // Line 3 at 13s
    const t3 = setTimeout(() => setActiveLine(2), 13000);
    // Brand appears at 19s
    // const t4 = setTimeout(() => setShowBrand(true), 18000);
    // Reset everything at 22s and show button again
    const t4 = setTimeout(() => {
      setActiveLine(-1);
      setShowBrand(false);
      setStarted(false);
      setKey((prev) => prev + 1);
    }, 18000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      // clearTimeout(t5);
    };
  }, [key, started]);

  const handleStart = () => {
    setStarted(true);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Faint red glow in center */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 60%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-5xl px-6">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key={`button-${key}`}
              className="flex items-center min-h-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <motion.button
                onClick={handleStart}
                className="px-8 py-4 md:px-16 md:py-8 text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white bg-red-600 hover:bg-red-700 transition-colors rounded-xl md:rounded-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Click Spark <span className="text-black">AI</span>
              </motion.button>
            </motion.div>
          ) : !showBrand ? (
            <motion.div
              key={`lines-${key}`}
              className="flex flex-col items-center justify-start pt-24 gap-8 min-h-screen"
            >
              {LINES.map((line, lineIdx) => {
                const words = splitWords(line);
                return (
                  <div
                    key={lineIdx}
                    className="text-center w-full min-h-[5rem]"
                  >
                    {activeLine >= lineIdx && (
                      <p className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1]">
                        {words.map((word, wIdx) => (
                          <motion.span
                            key={wIdx}
                            className="inline-block mr-[0.3em] text-red-600"
                            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{
                              duration: 0.5,
                              delay: wIdx * 0.25,
                              ease: "easeOut",
                            }}
                          >
                            {word}
                          </motion.span>
                        ))}
                      </p>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key={`brand-${key}`}
              className="flex flex-col items-center justify-center min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              {/* <motion.h1
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white"
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.3,
                }}
              >
                Click Spark
                <span className="text-red-600"> AI</span>
              </motion.h1> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
