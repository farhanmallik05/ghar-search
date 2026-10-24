"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { getAppUrl } from "@/lib/url";
import CrossAppLink from "@/components/CrossAppLink";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronDown, ShieldAlert, ShieldCheck, ArrowRight, Eye, CheckCircle2, Search, ExternalLink, Activity } from "lucide-react";

interface ScrollCanvasProps {
  frameCount?: number;
  sequencePath?: string;
  fileExtension?: "webp" | "jpg";
}

export default function ScrollCanvas({
  frameCount = 240,
  sequencePath = "/sequence/frame_",
  fileExtension = "webp",
}: ScrollCanvasProps) {
  const [appUrl, setAppUrl] = useState(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Loading state
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFrameDisplay, setActiveFrameDisplay] = useState<number>(0);

  useEffect(() => {
    setAppUrl(getAppUrl());
  }, []);

  // Framer Motion scroll tracking over the 400vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth buttery interpolation (stiffness: 100, damping: 30)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.0001,
  });

  // Draw current frame to canvas using responsive "contain" logic & retina scaling
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    // Ensure physical canvas resolution matches device pixel ratio
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    // Set canvas display CSS size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Fill background with exact #050505 void
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Responsive "contain" fit calculations
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const hRatio = canvas.width / imgWidth;
    const vRatio = canvas.height / imgHeight;
    const scale = Math.min(hRatio, vRatio);

    const targetWidth = imgWidth * scale;
    const targetHeight = imgHeight * scale;
    const offsetX = (canvas.width - targetWidth) / 2;
    const offsetY = (canvas.height - targetHeight) / 2;

    // High quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      img,
      0,
      0,
      imgWidth,
      imgHeight,
      offsetX,
      offsetY,
      targetWidth,
      targetHeight
    );
  }, []);

  // Preload all frames
  useEffect(() => {
    let isCancelled = false;
    let loaded = 0;
    const loadedImages: HTMLImageElement[] = [];

    const handleImageLoad = () => {
      if (isCancelled) return;
      loaded++;
      setLoadedCount(loaded);
      if (loaded >= frameCount) {
        setIsLoading(false);
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => drawFrame(0));
      }
    };

    const handleImageError = (index: number) => {
      // Fallback: If .webp fails, try .jpg
      if (isCancelled) return;
      const fallbackImg = new Image();
      fallbackImg.src = `${sequencePath}${index}.jpg`;
      fallbackImg.onload = () => {
        if (!isCancelled) {
          loadedImages[index] = fallbackImg;
          handleImageLoad();
        }
      };
      fallbackImg.onerror = () => {
        handleImageLoad();
      };
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = `${sequencePath}${i}.${fileExtension}`;
      img.onload = handleImageLoad;
      img.onerror = () => handleImageError(i);
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;

    return () => {
      isCancelled = true;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [frameCount, sequencePath, fileExtension, drawFrame]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        drawFrame(currentFrameRef.current);
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [drawFrame]);

  // Synchronize Framer Motion smooth spring progress with canvas render loop
  useEffect(() => {
    if (isLoading) return;

    const unsubscribe = smoothProgress.on("change", (latest) => {
      const clamped = Math.max(0, Math.min(1, latest));
      const frameIndex = Math.min(
        Math.floor(clamped * frameCount),
        frameCount - 1
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        setActiveFrameDisplay(frameIndex);

        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          drawFrame(frameIndex);
        });
      }
    });

    return () => {
      unsubscribe();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [smoothProgress, frameCount, isLoading, drawFrame]);

  // ===========================================================================
  // ANIMATION TIMING RULES:
  // - Opacity mapping: [start, start + 0.1, end - 0.1, end] → [0, 1, 1, 0]
  // - Subtle vertical motion: enter: y: 20px → 0, exit: 0 → -20px
  // ===========================================================================

  // Scroll to Explore indicator: visible at 0%, fades out by 10%
  const scrollIndicatorOpacity = useTransform(smoothProgress, [0.0, 0.08], [1, 0]);
  const scrollIndicatorY = useTransform(smoothProgress, [0.0, 0.08], [0, 15]);

  // Beat A — 0–20% Scroll (Hero Word / Phrase from Slide 1)
  const beatAOpacity = useTransform(smoothProgress, [0.0, 0.04, 0.16, 0.22], [1, 1, 1, 0]);
  const beatAY = useTransform(smoothProgress, [0.0, 0.04, 0.16, 0.22], [0, 0, 0, -20]);

  // Beat B — 25–45% Scroll (Problem Statement from Slide 2)
  const beatBOpacity = useTransform(smoothProgress, [0.24, 0.29, 0.41, 0.46], [0, 1, 1, 0]);
  const beatBY = useTransform(smoothProgress, [0.24, 0.29, 0.41, 0.46], [20, 0, 0, -20]);

  // Beat C — 50–70% Scroll (Proposed Solution from Slide 3)
  const beatCOpacity = useTransform(smoothProgress, [0.49, 0.54, 0.66, 0.71], [0, 1, 1, 0]);
  const beatCY = useTransform(smoothProgress, [0.49, 0.54, 0.66, 0.71], [20, 0, 0, -20]);

  // Beat D — 75–95% Scroll (Live Verdict Prototype from Slide 8)
  const beatDOpacity = useTransform(smoothProgress, [0.74, 0.79, 0.94, 0.99], [0, 1, 1, 0]);
  const beatDY = useTransform(smoothProgress, [0.74, 0.79, 0.94, 0.99], [20, 0, 0, -20]);

  // Top global progress bar
  const globalProgressScale = useTransform(smoothProgress, [0, 1], [0, 1]);

  const loadingPercentage = Math.round((loadedCount / frameCount) * 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#050505] selection:bg-emerald-500/30 selection:text-white"
      style={{ height: "400vh" }}
      id="scrollytelling-wrapper"
    >
      {/* =========================================================================
          PRELOADER / LOADING UI
      ========================================================================== */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white">
          <div className="relative flex flex-col items-center max-w-sm w-full px-6">
            <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-25" />
              <div className="w-16 h-16 rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-500/40 animate-spin" />
              <Search className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <div className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-mono">
                TinyFish Agents Connecting
              </div>
              <h2 className="text-xl font-light tracking-tight text-white/95">
                Calibrating Property Due-Diligence Stream
              </h2>
              <p className="text-xs text-white/50">
                Streaming {frameCount} optical inspection frames
              </p>
            </div>

            <div className="w-full bg-white/10 h-[2px] rounded-full overflow-hidden mb-3">
              <div
                className="bg-emerald-400 h-full transition-all duration-150 ease-out"
                style={{ width: `${loadingPercentage}%` }}
              />
            </div>

            <div className="flex justify-between w-full text-[11px] font-mono text-white/40">
              <span>RERA SYNC</span>
              <span className="text-emerald-400 font-medium">{loadingPercentage}%</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STICKY CANVAS CONTAINER
      ========================================================================== */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505]">
        {/* Seamless Blending: Pure Void Background & Feathered Edge Vignette */}
        <div className="absolute inset-0 pointer-events-none z-10 vignette-overlay" />
        <div className="absolute inset-0 pointer-events-none z-10 subtle-grid opacity-20" />

        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          className="relative z-0 block max-h-screen max-w-full object-contain"
          style={{
            backgroundColor: "#050505",
          }}
        />

        {/* Top Minimal Global Progress Line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/30 via-emerald-400 to-white z-30 origin-left"
          style={{ scaleX: globalProgressScale }}
        />

        {/* =======================================================================
            ARCHITECTURAL HUD & TELEMETRY
        ======================================================================== */}
        <div className="absolute top-24 left-6 md:left-8 z-20 pointer-events-none hidden sm:flex items-center space-x-3 text-[11px] font-mono tracking-widest text-white/60 bg-[#050505]/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>TINYFISH AGENTS // ACTIVE</span>
          <span className="text-white/20">|</span>
          <span className="text-emerald-300">FRAME {String(activeFrameDisplay + 1).padStart(3, "0")} / {frameCount}</span>
        </div>

        <div className="absolute top-24 right-6 md:right-8 z-20 pointer-events-none hidden sm:flex items-center space-x-3 text-[11px] font-mono tracking-widest text-white/60 bg-[#050505]/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>35 STATE PORTALS REACHABLE</span>
          <span className="text-white/20">|</span>
          <span className="text-white/90 font-medium">~90S VERDICT</span>
        </div>

        <div className="absolute bottom-6 left-6 md:left-8 z-20 pointer-events-none hidden md:flex items-center space-x-2 text-[10px] font-mono tracking-widest text-white/40 bg-[#050505]/50 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/[0.08]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>1.5 LAKH+ REGISTERED RERA PROJECTS</span>
        </div>

        <div className="absolute bottom-6 right-6 md:right-8 z-20 pointer-events-none hidden md:flex items-center space-x-2 text-[10px] font-mono tracking-widest text-white/40 bg-[#050505]/50 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/[0.08]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>6 CRITICAL CHECKS PER PROPERTY</span>
        </div>

        {/* =======================================================================
            SCROLL TO EXPLORE INDICATOR
        ======================================================================== */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity, y: scrollIndicatorY }}
          className="absolute bottom-8 md:bottom-10 z-30 flex flex-col items-center pointer-events-none"
        >
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-white/60 mb-2">
            Scroll to Inspect Evidence
          </span>
          <div className="w-5 h-9 rounded-full border border-white/30 flex items-start justify-center p-1 bg-black/40 backdrop-blur-sm">
            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-2 rounded-full bg-emerald-400"
            />
          </div>
          <ChevronDown className="w-4 h-4 text-white/50 mt-1 animate-bounce" />
        </motion.div>

        {/* =======================================================================
            TEXT OVERLAYS (Scrollytelling Beats — 100% PDF Aligned)
        ======================================================================== */}

        {/* BEAT A — 0–20% Scroll (From Slide 1: Cover & Problem Essence) */}
        <motion.div
          style={{ opacity: beatAOpacity, y: beatAY }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        >
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 backdrop-blur-md mb-6 shadow-[0_4px_25px_rgba(16,185,129,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-300">
                HACKIIITD 2026 · ROUND 1 · IDEA SUBMISSION
              </span>
            </div>

            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-tighter text-white leading-[0.9] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
              Ghar Search
            </h1>

            <p className="mt-6 text-xl sm:text-2xl md:text-3xl font-light text-white/90 max-w-3xl tracking-tight leading-snug drop-shadow-[0_2px_15px_rgba(0,0,0,0.85)]">
              Paste a property listing. Get a verified trust report, backed by evidence from official records.
            </p>

            <p className="mt-4 text-sm sm:text-base font-normal text-white/60 max-w-2xl leading-relaxed">
              An agentic due-diligence layer for Indian homebuyers, powered by the TinyFish web agent APIs.
            </p>

            {/* Badges from PDF Slide 1 */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono tracking-wider">
                PropTech
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono tracking-wider">
                Consumer protection
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono tracking-wider">
                Web agents
              </span>
            </div>
          </div>
        </motion.div>

        {/* BEAT B — 25–45% Scroll (From Slide 2: Problem Statement) */}
        <motion.div
          style={{ opacity: beatBOpacity, y: beatBY }}
          className="absolute inset-0 z-20 flex items-center justify-start px-6 sm:px-12 md:px-20 max-w-7xl mx-auto pointer-events-none"
        >
          <div className="max-w-xl text-left bg-black/80 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-amber-400 mb-4">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>01 // Problem Statement</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white/95 leading-[1.1]">
              Homebuyers can't verify <br />
              <span className="font-serif italic text-white/80">what they're sold.</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base font-normal text-white/70 leading-relaxed tracking-tight">
              Listings and brochures advertise possession dates, RERA IDs and approvals. Few buyers verify them — and evidence sits on 35+ scattered state portals with no common API.
            </p>

            {/* Stats from PDF Slide 2 */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/10">
              <div>
                <span className="text-2xl font-light text-white">1.5 lakh+</span>
                <span className="block text-[11px] font-mono text-white/50 leading-tight mt-1">
                  Projects registered under RERA across 35 states/UTs
                </span>
              </div>
              <div>
                <span className="text-2xl font-light text-amber-400">1.47 lakh+</span>
                <span className="block text-[11px] font-mono text-white/50 leading-tight mt-1">
                  Buyer complaints already disposed by RERA
                </span>
              </div>
            </div>

            <div className="mt-4 text-[11px] font-mono text-white/40 italic">
              "A miss costs a family's life savings."
            </div>
          </div>
        </motion.div>

        {/* BEAT C — 50–70% Scroll (From Slide 3: Proposed Solution) */}
        <motion.div
          style={{ opacity: beatCOpacity, y: beatCY }}
          className="absolute inset-0 z-20 flex items-center justify-end px-6 sm:px-12 md:px-20 max-w-7xl mx-auto pointer-events-none"
        >
          <div className="max-w-xl text-right bg-black/80 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 mb-4">
              <span>02 // Proposed Solution</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white/95 leading-[1.1]">
              One link in, <br />
              <span className="font-serif italic text-emerald-300">a verified trust report out.</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base font-normal text-white/70 leading-relaxed tracking-tight">
              TinyFish web agents check official and public sources at once. Deterministic scoring, zero hallucinations, backed by URL, screenshot and timestamp.
            </p>

            {/* 3 Pillars from PDF Slide 3 */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-3 text-xs font-mono text-white/60 text-right">
              <div>
                <span className="text-emerald-400 font-semibold uppercase">Evidence First:</span> No evidence, no flag. Every finding links to a live source.
              </div>
              <div>
                <span className="text-emerald-400 font-semibold uppercase">Explainable Score:</span> Rule-based 0–100. LLM extracts & explains; never decides.
              </div>
              <div>
                <span className="text-emerald-400 font-semibold uppercase">Always-on Watchlist:</span> Re-checked nightly; alerts fire on date slips.
              </div>
            </div>
          </div>
        </motion.div>

        {/* BEAT D — 75–95% Scroll (From Slide 8: Interactive Prototype Verdict) */}
        <motion.div
          style={{ opacity: beatDOpacity, y: beatDY }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center bg-black/80 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 backdrop-blur-md mb-6">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-300">
                07 // Prototype Concept: The Live Verdict Screen
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tighter text-white leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
              EVIDENCE-BACKED <br className="hidden sm:block" />
              <span className="font-serif italic text-emerald-300">TRUST REPORT</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg md:text-xl font-light text-white/80 max-w-2xl tracking-tight leading-relaxed">
              Watch agents inspect claims vs RERA in parallel. See red flags, promoter litigation, and possession date slips in under ~90 seconds.
            </p>

            {/* Call to Actions from Slide 8 */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
              <a
                href={`${appUrl}/#verify-section`}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-emerald-400 text-black font-semibold text-sm tracking-tight hover:bg-emerald-300 transition-all duration-300 shadow-[0_0_35px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Listing on Main Portal</span>
              </a>

              <a
                href="#live-verdict"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white hover:text-white font-medium text-sm tracking-tight hover:bg-white/15 transition-all duration-300 backdrop-blur-md"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <p className="mt-6 text-[11px] font-mono tracking-wider text-white/40 uppercase">
              HackIIITD 2026 Submission • Powered by TinyFish Web Agents
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
