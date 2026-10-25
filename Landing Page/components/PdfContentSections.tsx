"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  AlertOctagon, 
  Database, 
  Scale, 
  Clock, 
  Search, 
  ShieldCheck, 
  FileText, 
  Bell, 
  Users, 
  UserCheck, 
  Building, 
  Briefcase, 
  Layers, 
  GitBranch, 
  Cpu, 
  Terminal, 
  Server, 
  Zap, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Code2,
  Calendar,
  Sparkles,
  Award
} from "lucide-react";

export default function PdfContentSections() {
  return (
    <div className="relative bg-[#050505] text-white">
      {/* =======================================================================
          SLIDE 2: PROBLEM STATEMENT
      ======================================================================== */}
      <section id="problem" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/30 backdrop-blur-md mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-300">
              01 · Problem Statement
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
            Homebuyers can't verify what they're sold
          </h2>
          <p className="mt-4 text-white/60 text-sm sm:text-base">
            Listings and brochures advertise possession dates, RERA IDs and approvals. Few buyers verify them.
          </p>
        </div>

        {/* 3 Metric Cards from Slide 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm">
            <div className="text-4xl sm:text-5xl font-light text-white mb-2">
              1.5 lakh+
            </div>
            <p className="text-sm text-white/60 font-normal">
              projects registered under RERA across 35 states and UTs
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm">
            <div className="text-4xl sm:text-5xl font-light text-amber-400 mb-2">
              1.47 lakh+
            </div>
            <p className="text-sm text-white/60 font-normal">
              buyer complaints already disposed by RERA authorities
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm">
            <div className="text-4xl sm:text-5xl font-light text-emerald-400 mb-2">
              6 checks
            </div>
            <p className="text-sm text-white/60 font-normal">
              per property: RERA, claims, promoter, courts, approvals, reviews
            </p>
          </div>
        </div>

        {/* Why buyers still get burned, even after RERA */}
        <div className="mb-12">
          <h3 className="text-xl sm:text-2xl font-light text-white/90 mb-8 text-center sm:text-left">
            Why buyers still get burned, even after RERA
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-sm font-semibold flex-shrink-0">
                1
              </span>
              <div>
                <h4 className="text-base font-medium text-white mb-1.5">Claims are never checked against records</h4>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Listings and brochures advertise possession dates, RERA IDs and approvals. Few buyers verify them.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-sm font-semibold flex-shrink-0">
                2
              </span>
              <div>
                <h4 className="text-base font-medium text-white mb-1.5">Evidence is public but scattered</h4>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  RERA filings, court cases, promoter filings and complaints sit on separate sites with different forms and no common API.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-sm font-semibold flex-shrink-0">
                3
              </span>
              <div>
                <h4 className="text-base font-medium text-white mb-1.5">Manual diligence doesn't scale</h4>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Portal-hopping for one property takes hours, and lenders and brokers repeat it for every project.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-sm font-semibold flex-shrink-0">
                4
              </span>
              <div>
                <h4 className="text-base font-medium text-white mb-1.5">A miss costs a family's savings</h4>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Delayed possession, litigation or an EMI plus rent: a home is often the largest purchase a family makes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Source citation footnote */}
        <div className="p-4 rounded-xl bg-white/[0.015] border border-white/[0.05] text-[11px] font-mono text-white/40 leading-relaxed">
          <strong className="text-white/60">Sources:</strong> MoHUA, 5th Central Advisory Council on RERA (4 Sep 2025), which also launched the unified portal <code className="text-emerald-400">rera.mohua.gov.in</code> to consolidate state RERA data. A registry shows records; <em>Ghar Search checks what a listing claims against them.</em>
        </div>
      </section>

      {/* =======================================================================
          SLIDE 3: PROPOSED SOLUTION
      ======================================================================== */}
      <section id="solution" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 backdrop-blur-md mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-300">
              02 · Proposed Solution
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
            One link in, a verified trust report out
          </h2>
          <p className="mt-4 text-white/60 text-sm sm:text-base">
            Autonomous web agents bridge the gap between advertising promises and statutory filings.
          </p>
        </div>

        {/* 4-Step Process Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-semibold text-sm mb-4">
              1
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Paste</h3>
            <p className="text-xs sm:text-sm text-white/60">
              Listing link, RERA number or project name
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-semibold text-sm mb-4">
              2
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Extract claims</h3>
            <p className="text-xs sm:text-sm text-white/60">
              Price, possession date, RERA ID, promoter, approvals
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-semibold text-sm mb-4">
              3
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Verify in parallel</h3>
            <p className="text-xs sm:text-sm text-white/60">
              Agents check official and public sources at once
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-semibold text-sm mb-4">
              4
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Trust report</h3>
            <p className="text-xs sm:text-sm text-white/60">
              Score, red, amber and green flags, evidence, PDF
            </p>
          </div>
        </div>

        {/* 3 Core Tenets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
            <h4 className="text-base font-semibold text-emerald-300 mb-2">Evidence first</h4>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              No evidence, no flag. Every finding links to a source URL, a screenshot and a timestamp.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <h4 className="text-base font-semibold text-white mb-2">Explainable score</h4>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              A rule-based 0 to 100 Trust Score. The LLM extracts and explains; it never decides.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <h4 className="text-base font-semibold text-white mb-2">Always-on watchlist</h4>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Saved projects are re-checked nightly; alerts fire on date slips, new complaints or lapses.
            </p>
          </div>
        </div>

        {/* Six Checks Per Property Bar */}
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-white/50 mb-4 text-center sm:text-left">
            Six Checks Per Property
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              "RERA status",
              "Claim match",
              "Promoter record",
              "Court signals",
              "Approvals",
              "Public reputation",
            ].map((check, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center font-mono text-xs font-medium text-white/90"
              >
                {check}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================================
          SLIDE 4: TARGET USERS & BUSINESS MODEL
      ======================================================================== */}
      <section id="users" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-white/60">
              03 · Target Users
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
            Who it protects first, and who pays later
          </h2>
        </div>

        {/* 4 User Segments from Slide 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Segment 1 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-semibold tracking-wider mb-4">
                B2C · BEACHHEAD
              </span>
              <h3 className="text-lg font-medium text-white mb-4">
                First-time home buyers
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-0.5">Pain</span>
                  <p className="text-white/70">No budget for a lawyer per flat, so they trust the builder's pitch.</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-0.5">Value</span>
                  <p className="text-white/90">Red flags in minutes, before token money moves.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Segment 2 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-semibold tracking-wider mb-4">
                B2C
              </span>
              <h3 className="text-lg font-medium text-white mb-4">
                NRIs and remote buyers
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-0.5">Pain</span>
                  <p className="text-white/70">Can't visit sites or offices to check records.</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-0.5">Value</span>
                  <p className="text-white/90">An evidence pack, plus alerts when a project changes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Segment 3 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-semibold tracking-wider mb-4">
                B2B · API
              </span>
              <h3 className="text-lg font-medium text-white mb-4">
                Lenders, HFCs and DSAs
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-0.5">Pain</span>
                  <p className="text-white/70">Project screening is manual and repeated for every file.</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-0.5">Value</span>
                  <p className="text-white/90">Batch checks with an audit trail for every flag.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Segment 4 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-semibold tracking-wider mb-4">
                B2B2C
              </span>
              <h3 className="text-lg font-medium text-white mb-4">
                Brokers and channel partners
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-0.5">Pain</span>
                  <p className="text-white/70">Buyers doubt listings; one bad project hurts reputation.</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-0.5">Value</span>
                  <p className="text-white/90">A shareable verified report that builds trust faster.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Tier Monetization Model */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] font-mono text-xs">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-emerald-400 font-bold mr-2">1 · Land:</span>
            <span className="text-white/80">pay-per-report for buyers</span>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-cyan-400 font-bold mr-2">2 · Expand:</span>
            <span className="text-white/80">batch API for lenders and brokers</span>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-purple-400 font-bold mr-2">3 · Retain:</span>
            <span className="text-white/80">watchlist subscriptions</span>
          </div>
        </div>
      </section>

      {/* =======================================================================
          SLIDE 5: TECHNICAL ARCHITECTURE & FIVE-LAYER PIPELINE
      ======================================================================== */}
      <section id="pipeline" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 backdrop-blur-md mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-300">
              04 · Technical Architecture and Stack
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
            A five-layer pipeline, built on our stack
          </h2>
        </div>

        {/* 5-Layer Stack Grid from Slide 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {/* Layer 1: Experience */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xs font-mono font-semibold uppercase text-emerald-400 mb-3 pb-2 border-b border-white/10">
              1 Experience
            </div>
            <ul className="space-y-2 text-xs text-white/70">
              <li>• Next.js App Router + TypeScript</li>
              <li>• Tailwind UI with a live progress view</li>
              <li>• Supabase Realtime updates</li>
              <li>• PDF report export</li>
            </ul>
          </div>

          {/* Layer 2: Orchestration */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xs font-mono font-semibold uppercase text-cyan-400 mb-3 pb-2 border-b border-white/10">
              2 Orchestration
            </div>
            <ul className="space-y-2 text-xs text-white/70">
              <li>• LangGraph in Python (FastAPI worker)</li>
              <li>• Parallel fan-out and fan-in per property</li>
              <li>• Retries, timeouts and cost budgets</li>
              <li>• Human-in-the-loop for captcha or OTP</li>
            </ul>
          </div>

          {/* Layer 3: TinyFish */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="text-xs font-mono font-semibold uppercase text-emerald-300 mb-3 pb-2 border-b border-emerald-500/20">
              3 TinyFish
            </div>
            <ul className="space-y-2 text-xs text-white/80">
              <li>• Search, Fetch, Agent, Browser</li>
              <li>• Cheapest tool first; escalate only when needed</li>
              <li>• Stealth browser profile and proxy routing where blocked</li>
              <li>• Batch queue for nightly runs</li>
            </ul>
          </div>

          {/* Layer 4: Intelligence */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xs font-mono font-semibold uppercase text-purple-400 mb-3 pb-2 border-b border-white/10">
              4 Intelligence
            </div>
            <ul className="space-y-2 text-xs text-white/70">
              <li>• LLM extracts claims into a fixed schema</li>
              <li>• Rule engine computes the Trust Score</li>
              <li>• LLM writes the plain-language summary</li>
              <li>• Every flag must cite evidence</li>
            </ul>
          </div>

          {/* Layer 5: Data and trust */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xs font-mono font-semibold uppercase text-amber-400 mb-3 pb-2 border-b border-white/10">
              5 Data and trust
            </div>
            <ul className="space-y-2 text-xs text-white/70">
              <li>• Supabase Postgres with Row-Level Security</li>
              <li>• Storage for screenshots and PDFs</li>
              <li>• Auth for users and lender orgs</li>
              <li>• pg_cron for watchlist re-checks</li>
            </ul>
          </div>
        </div>

        {/* Design Principles and Deployment Notes */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs font-mono">
          <p className="text-white/80">
            <strong className="text-emerald-400 uppercase">Design principles:</strong> evidence first, deterministic scoring, human-in-the-loop, and a source URL, screenshot and timestamp on every finding.
          </p>
          <p className="text-white/60">
            <strong className="text-white/90 uppercase">Deploy:</strong> Vercel for the web app, a containerised Python worker, and Supabase for data.
          </p>
        </div>
      </section>

      {/* =======================================================================
          SLIDE 6: TINYFISH API INTEGRATION
      ======================================================================== */}
      <section id="tinyfish" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 backdrop-blur-md mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-300">
              05 · TinyFish API Integration
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
            How do you plan to integrate the TinyFish API?
          </h2>
        </div>

        {/* 4 TinyFish Tools Breakdown from Slide 6 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Tool 1 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Search API</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/40 text-emerald-300 border border-emerald-500/30">
                free
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-400 mb-2">Discover</div>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Find official project pages, promoter news, court-order mentions and complaints by project name.
            </p>
          </div>

          {/* Tool 2 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Fetch API</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/40 text-emerald-300 border border-emerald-500/30">
                free
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-400 mb-2">Read</div>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Render listing and builder pages in a real browser; pull clean text so the LLM can extract claims.
            </p>
          </div>

          {/* Tool 3 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Agent API</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-900/40 text-amber-300 border border-amber-500/30">
                credits
              </span>
            </div>
            <div className="text-xs font-semibold text-amber-400 mb-2">Act</div>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Plain-English goals run multi-step flows on 30+ state RERA sites: search, open, read status and dates.
            </p>
          </div>

          {/* Tool 4 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Browser API</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-900/40 text-amber-300 border border-amber-500/30">
                credits
              </span>
            </div>
            <div className="text-xs font-semibold text-amber-400 mb-2">Control</div>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Remote Playwright or CDP session for deterministic steps, evidence screenshots and captcha handoff.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-white/40 mb-8 text-center sm:text-left">
          Cost control: Search and Fetch are free; credits go only to Agent and Browser.
        </div>

        {/* Sample Agent Goal & Why TinyFish from Slide 6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#090b10] border border-emerald-500/30">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block mb-3">
              Sample Agent Goal
            </span>
            <p className="font-mono text-xs sm:text-sm text-white/90 leading-relaxed bg-black/60 p-4 rounded-xl border border-white/10 mb-4">
              "Open the &#123;state&#125; RERA project search. Find &#123;RERA ID&#125;. Return promoter, status, completion dates and complaint count."
            </p>
            <div className="text-xs font-mono text-emerald-300">
              Output: structured JSON that feeds the Trust Score
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <h4 className="text-base font-medium text-white mb-4">
              Why TinyFish, not scrapers
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>One goal template covers 30+ differently built RERA sites</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Live browser view in our UI; batch queue for nightly runs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Stealth browser profile and proxy routing where sites block bots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Vault credentials for login-gated portals; the agent never sees passwords</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* =======================================================================
          SLIDE 1: TEAM DETAILS & HACKATHON CONTEXT
      ======================================================================== */}
      <section id="team" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 backdrop-blur-md mb-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-300">
              Team Details · HackIIITD 2026
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
            Built by Builders for Indian Homebuyers
          </h2>
          <p className="mt-4 text-white/60 text-sm sm:text-base">
            KCC Institute of Technology and Management, Greater Noida
          </p>
        </div>

        {/* 2 Team Cards from Slide 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Member 1: Farhan Rahaman Mallik */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                FM
              </div>
              <div>
                <h3 className="text-xl font-medium text-white">Farhan Rahaman Mallik</h3>
                <p className="text-xs font-mono text-emerald-400">Team Lead · AI agents and full-stack</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-white/60 pt-2 border-t border-white/10">
              <p>B.Tech CS/IT · KCC Institute of Technology and Management, Greater Noida</p>
              <p className="text-white/80 font-medium">Ex-FlyRank AI intern · Campus Lead, Open Source Connect Global 2026</p>
            </div>
          </div>

          {/* Member 2: Piyush Kumar Gautam */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                PG
              </div>
              <div>
                <h3 className="text-xl font-medium text-white">Piyush Kumar Gautam</h3>
                <p className="text-xs font-mono text-emerald-400">UI / Frontend Developer</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-white/60 pt-2 border-t border-white/10">
              <p>B.Tech · KCC Institute of Technology and Management, Greater Noida</p>
              <p className="text-white/80 font-medium">Creative Developer specializing in Next.js, Framer Motion & Responsive Web UI</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
