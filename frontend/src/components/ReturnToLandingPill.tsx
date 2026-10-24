"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, X } from "lucide-react";
import { getLandingUrl } from "@/lib/url";

function PillContent() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [landingUrl, setLandingUrl] = useState("http://localhost:3000");

  useEffect(() => {
    setLandingUrl(getLandingUrl());
    const fromLanding = searchParams.get("from") === "landing";
    // Also check session storage in case they navigate between pages inside the main app
    if (fromLanding) {
      try {
        sessionStorage.setItem("ghar_from_landing", "true");
      } catch {}
      setVisible(true);
    } else {
      try {
        if (sessionStorage.getItem("ghar_from_landing") === "true") {
          setVisible(true);
        }
      } catch {}
    }
  }, [searchParams]);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-6 left-5 z-50 animate-pill-float-in flex items-center group">
      <a
        href={landingUrl}
        className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white hover:border-emerald-500/50 hover:bg-[#0f1013] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.9)] hover:shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
        title="Return to Scrollytelling Landing Page"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
          <ArrowLeft className="w-3 h-3" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-mono font-semibold tracking-wider text-emerald-300">
            BACK TO STORY
          </span>
          <span className="text-[9px] font-mono tracking-tight text-white/40">
            Interactive Pitch &amp; Scrollytelling
          </span>
        </div>
        <Sparkles className="w-3 h-3 text-emerald-400/60 ml-1 group-hover:text-emerald-300 group-hover:rotate-12 transition-all" />
      </a>

      {/* Subtle dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="ml-1.5 p-1 rounded-full text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
        aria-label="Dismiss pill"
        title="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function ReturnToLandingPill() {
  return (
    <Suspense fallback={null}>
      <PillContent />
    </Suspense>
  );
}
