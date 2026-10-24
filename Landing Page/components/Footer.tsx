"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, Search, ShieldCheck } from "lucide-react";
import { getAppUrl } from "@/lib/url";
import CrossAppLink from "@/components/CrossAppLink";

export default function Footer() {
  const [appUrl, setAppUrl] = useState(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

  useEffect(() => {
    setAppUrl(getAppUrl());
  }, []);

  return (
    <footer className="relative bg-[#050505] border-t border-white/[0.08] text-white/50 text-xs font-mono py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-white/95 font-semibold tracking-tight text-base">
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Ghar Search</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
              HackIIITD 2026
            </span>
          </div>
          <p className="text-[11px] text-white/50 max-w-md leading-relaxed">
            Paste a property listing. Get a verified trust report, backed by evidence from official records. Powered by TinyFish web agent APIs.
          </p>
          <div className="text-[10px] text-white/30 pt-1">
            Built by Farhan Rahaman Mallik & Piyush Kumar Gautam · KCC ITM, Greater Noida
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-[11px] uppercase tracking-wider text-white/60">
          <a href="#problem" className="hover:text-white transition-colors">
            01 // Problem
          </a>
          <a href="#solution" className="hover:text-white transition-colors">
            02 // Solution
          </a>
          <a href="#live-verdict" className="hover:text-emerald-400 transition-colors">
            03 // Live Prototype
          </a>
          <a href="#pipeline" className="hover:text-white transition-colors">
            04 // Architecture
          </a>
          <a href="#tinyfish" className="hover:text-white transition-colors">
            05 // TinyFish
          </a>
          <span className="text-white/20 hidden sm:inline">|</span>
          <CrossAppLink
            href={`${appUrl}#verify-section`}
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Verify Listing</span>
            <ArrowUpRight className="w-3 h-3" />
          </CrossAppLink>
          <CrossAppLink
            href={`${appUrl}/dashboard`}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Watchlist</span>
            <ArrowUpRight className="w-3 h-3" />
          </CrossAppLink>
          <CrossAppLink
            href={`${appUrl}/compare`}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Compare</span>
            <ArrowUpRight className="w-3 h-3" />
          </CrossAppLink>
          <a
            href="https://rera.mohua.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>MoHUA RERA</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        <div className="text-left md:text-right text-[10px] text-white/30 space-y-1">
          <div>HACKIIITD 2026 · ROUND 1 IDEA SUBMISSION</div>
          <div>PROPTECH • CONSUMER PROTECTION • WEB AGENTS</div>
        </div>
      </div>
    </footer>
  );
}
