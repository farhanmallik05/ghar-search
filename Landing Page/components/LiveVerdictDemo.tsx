"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Bookmark, 
  ExternalLink, 
  Globe, 
  Cpu, 
  Terminal, 
  Sparkles,
  Info,
  Check
} from "lucide-react";

export default function LiveVerdictDemo() {
  const [inputUrl, setInputUrl] = useState("https://housing.com/in/buy/projects/sample-residency-greater-noida");
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeStep, setActiveStep] = useState(4); // 4 = complete
  const [isLiveBrowserOpen, setIsLiveBrowserOpen] = useState(false);
  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(false);
  const [exportedPdf, setExportedPdf] = useState(false);

  const sampleListings = [
    {
      title: "Sample Residency (Greater Noida)",
      url: "https://housing.com/in/buy/projects/sample-residency-greater-noida",
      rera: "UPRERA-PRJ-2024-8841",
      promoter: "Sample Developers Pvt Ltd",
    },
    {
      title: "Skyline Nirvana (Gurugram)",
      url: "https://99acres.com/skyline-nirvana-sector-65-gurugram",
      rera: "HARERA-GGM-2023-102",
      promoter: "Skyline Infra Holdings",
    },
    {
      title: "Oasis Grand (Bengaluru)",
      url: "https://magicbricks.com/oasis-grand-whitefield-bengaluru",
      rera: "PRM/KA/RERA/1251/446/PR/220101",
      promoter: "Oasis Realty Group",
    },
  ];

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 700);
    setTimeout(() => setActiveStep(3), 1400);
    setTimeout(() => {
      setActiveStep(4);
      setIsVerifying(false);
    }, 2100);
  };

  return (
    <section id="live-verdict" className="relative bg-[#050505] text-white py-28 px-4 sm:px-6 border-t border-white/[0.08] overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-300">
              07 // MVP Prototype • The Live Verdict Screen
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
            Interactive Verification Protocol
          </h2>

          <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed font-light">
            Test the live verdict concept as presented to the HackIIITD 2026 jury. Paste any property listing link or RERA registration ID to watch autonomous TinyFish agents inspect records in real time.
          </p>

          {/* Quick Preset Selector */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-2 text-xs font-mono">
            <span className="text-white/40">Try sample listing:</span>
            {sampleListings.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputUrl(sample.url);
                  handleVerify();
                }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-950/30 text-white/70 hover:text-emerald-300 transition-all"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* =====================================================================
            PROTOTYPE SCREEN CONTAINER (Matching Slide 8 UI Concept)
        ====================================================================== */}
        <div className="relative rounded-3xl bg-[#0c0d10] border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Header Bar of the Prototype */}
          <div className="bg-[#12141a] px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="h-4 w-[1px] bg-white/10 mx-1" />
              <div className="text-xs font-mono font-medium text-white/90">
                Ghar Search • Verification Report <span className="text-white/40 font-normal">(HackIIITD Demo Mode)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                TinyFish APIs Connected
              </span>
              <button
                type="button"
                onClick={() => setIsLiveBrowserOpen(true)}
                className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 text-white/90 flex items-center gap-1.5 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-300" />
                <span>TinyFish Live Browser View</span>
              </button>
            </div>
          </div>

          {/* Interactive URL Input Bar */}
          <div className="p-6 bg-[#0a0a0d] border-b border-white/[0.08]">
            <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Paste listing link (Housing, 99acres, MagicBricks) or RERA no..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-400/80 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs sm:text-sm tracking-tight transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 3-Column Layout: Claims Extracted | Agents Parallel Run | Trust Score */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] p-6 sm:p-8 gap-8 lg:gap-0">
            {/* Column 1: Claims Extracted (3 cols) */}
            <div className="lg:col-span-3 lg:pr-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Claims Extracted
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  via Fetch API
                </span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-white/40 mb-1">Advertised Possession:</div>
                  <div className="text-white font-medium text-sm flex items-center justify-between">
                    <span>Dec 2026</span>
                    <span className="text-amber-400 text-[10px]">Brochure Claim</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-white/40 mb-1">RERA ID Claim:</div>
                  <div className="text-white font-medium text-sm">
                    UPRERA-PRJ-2024-8841
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-white/40 mb-1">Promoter Entity:</div>
                  <div className="text-white font-medium text-sm">
                    Sample Developers Pvt Ltd
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-white/40 mb-1">Sanctioned Approvals:</div>
                  <div className="text-emerald-400 font-medium text-sm">
                    Stated (Fire, Environmental, AAI)
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Agents (5 cols) */}
            <div className="lg:col-span-5 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Autonomous Web Agents
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  Parallel Fan-Out (LangGraph)
                </span>
              </div>

              <div className="space-y-3">
                {/* Check 1: RERA status */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-white/90">RERA Status</div>
                      <div className="text-[11px] text-white/50">Registered & active on State Registry</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                {/* Check 2: Claim match (MISMATCH!) */}
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                    <div>
                      <div className="text-xs font-semibold text-red-200">Claim Match</div>
                      <div className="text-[11px] text-red-300/70">1 mismatch found (Ad: Dec 2026 vs RERA: Mar 2028)</div>
                    </div>
                  </div>
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>

                {/* Check 3: Promoter record */}
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div>
                      <div className="text-xs font-semibold text-amber-200">Promoter Record</div>
                      <div className="text-[11px] text-amber-300/70">4 other projects found; 1 delayed project</div>
                    </div>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>

                {/* Check 4: Court signals */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-white/90">Court Signals</div>
                      <div className="text-[11px] text-white/50">Search API scanned: No active injunctions</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                {/* Check 5: Approvals */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-white/90">Approvals</div>
                      <div className="text-[11px] text-white/50">Matched to municipal & environmental filings</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>

                {/* Check 6: Public reputation */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-white/90">Public Reputation</div>
                      <div className="text-[11px] text-white/50">No major negative news or FIR reports</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Column 3: Trust Score & Actions (4 cols) */}
            <div className="lg:col-span-4 lg:pl-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Trust Score
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  Rule-Based Engine (0–100)
                </span>
              </div>

              {/* Big Score Badge from Slide 8 */}
              <div className="p-6 rounded-2xl bg-[#14161f] border border-white/10 text-center relative overflow-hidden">
                <div className="text-6xl sm:text-7xl font-extralight tracking-tight text-white mb-1">
                  72
                </div>
                <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4">
                  Out of 100
                </div>

                {/* Verdict Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wide">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Proceed with caution</span>
                </div>

                {/* Flags Breakdown */}
                <div className="mt-6 pt-5 border-t border-white/10 text-left space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                    <span className="text-red-300/90">Ad date earlier than RERA date</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                    <span className="text-amber-300/90">Promoter has 1 delayed project</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                    <span className="text-emerald-300/90">RERA registration is active</span>
                  </div>
                </div>

                {/* Action Buttons from Slide 8 */}
                <div className="mt-6 flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExportedPdf(true);
                      setTimeout(() => setExportedPdf(false), 3000);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs tracking-tight hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{exportedPdf ? "Downloaded PDF!" : "Export PDF"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddedToWatchlist(!isAddedToWatchlist)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-medium text-xs tracking-tight transition-colors flex items-center justify-center gap-2"
                  >
                    {isAddedToWatchlist ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Saved to Watchlist</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Add to Watchlist</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* What judges will see live (from Slide 8) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
                  What judges will see live:
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>Paste a real listing</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>Watch agents run in the TinyFish live view</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>See the mismatch flagged with evidence</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono">4</span>
                  <span>Export the PDF and save to the watchlist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          TINYFISH LIVE BROWSER VIEW MODAL (from Slide 6 & 8)
      ======================================================================== */}
      <AnimatePresence>
        {isLiveBrowserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-[#0f1117] border border-emerald-500/40 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-[#181b24] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">TinyFish Remote Stealth Browser Stream</h3>
                    <p className="text-[11px] font-mono text-emerald-400">Playwright CDP Session // u-rera.gov.in/project-search</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLiveBrowserOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Terminal / Live View Content */}
              <div className="p-6 space-y-4 font-mono text-xs text-white/80 bg-[#090a0e]">
                <div className="flex items-center justify-between text-[11px] text-white/40 pb-2 border-b border-white/10">
                  <span>AGENT GOAL: "Open &#123;state&#125; RERA project search. Find &#123;RERA ID&#125;. Return promoter, status, completion dates and complaint count."</span>
                  <span className="text-emerald-400">STATUS: 200 OK</span>
                </div>

                <div className="bg-black/60 p-4 rounded-xl border border-white/10 space-y-1.5 text-[11px] text-emerald-300">
                  <div className="text-white/40">[00:01.12] Dispatching TinyFish Agent API with stealth proxy profile...</div>
                  <div className="text-white/40">[00:01.89] Navigating to official State RERA registry portal (up-rera.in)...</div>
                  <div className="text-white/40">[00:03.45] Inputting RERA ID: UPRERA-PRJ-2024-8841 into dynamic form fields...</div>
                  <div className="text-emerald-400">[00:04.10] ✓ Form submitted. CAPTCHA bypassed deterministically.</div>
                  <div className="text-white/40">[00:05.20] Parsing project ledger table:</div>
                  <div className="pl-4 text-white">
                    {`{
  "project_name": "Sample Residency Phase 1",
  "promoter": "Sample Developers Pvt Ltd",
  "validity_start": "2021-04-12",
  "revised_completion_date": "2028-03-31",
  "advertised_date": "2026-12-31",
  "discrepancy_months": 15,
  "complaints_registered": 3,
  "complaints_disposed": 2
}`}
                  </div>
                  <div className="text-amber-400">[00:06.01] ⚠️ Discrepancy detected: Ad date is 15 months earlier than RERA filings!</div>
                  <div className="text-emerald-400">[00:06.45] Evidence screenshot stored in Supabase with sha256 checksum & timestamp.</div>
                </div>

                <div className="flex justify-between items-center pt-2 text-[11px] text-white/50">
                  <span>Cost Control: Search/Fetch FREE • Agent Credits: 0.12 consumed</span>
                  <button
                    type="button"
                    onClick={() => setIsLiveBrowserOpen(false)}
                    className="px-4 py-2 rounded-lg bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition-colors"
                  >
                    Close Stream
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
