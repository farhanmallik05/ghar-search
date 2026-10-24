'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Building2,
  Scale,
  Award,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
  Cpu,
  Clock,
  TrendingUp,
  FileText,
  GitCompare,
  Code2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  speaker: string;
  duration: string;
  content: React.ReactNode;
}

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    // Slide 1: Hook & Team
    {
      id: 1,
      badge: 'HackIIITD 2026 · Pitch Presentation',
      title: '🏠 Ghar Search',
      subtitle: 'An agentic due-diligence layer for Indian homebuyers and institutional mortgage underwriters.',
      speaker: 'Farhan Rahaman Mallik (Team Lead)',
      duration: '45 sec',
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3 font-mono text-sm leading-relaxed">
            <p className="text-amber-300 font-bold">
              "Imagine saving ₹60 lakhs over 5 years. You find the perfect flat with an official RERA number.
              You pay your life savings. Six months later, you discover the project is embroiled in NCLT insolvency,
              the RERA registration has expired, and the developer has 8 unauthorized floors."
            </p>
            <p className="text-slate-400 text-xs">
              That is not an edge case. That is happening to lakhs of families across India right now.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider font-mono">Team Lead · AI & Full-Stack</span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">Farhan Rahaman Mallik</h3>
              <p className="text-xs text-slate-500 mt-0.5">B.Tech CS/IT · KCC ITM, Greater Noida</p>
              <p className="text-xs text-slate-600 mt-2">Ex-FlyRank AI Intern · Campus Lead, Open Source Connect Global 2026</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">UI / Frontend Developer</span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">Piyush Kumar Gautam</h3>
              <p className="text-xs text-slate-500 mt-0.5">B.Tech · KCC ITM, Greater Noida</p>
              <p className="text-xs text-slate-600 mt-2">Next.js 14 App Router, Tailwind CSS, Radial SVG Data Visualizations</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: The Problem
    {
      id: 2,
      badge: 'The Real Estate Problem',
      title: 'The ₹24 Lakh Crore Asymmetry',
      subtitle: 'The information exists, but it is buried across 30+ disconnected government portals.',
      speaker: 'Farhan Rahaman Mallik',
      duration: '60 sec',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-6 rounded-2xl border border-rose-200 bg-rose-50/20 text-center space-y-2">
            <span className="text-4xl font-black text-rose-700 font-mono">1.5L+</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">RERA Projects</h4>
            <p className="text-xs text-slate-500">Registered across 35 states & UTs with disjointed portals.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-amber-200 bg-amber-50/20 text-center space-y-2">
            <span className="text-4xl font-black text-amber-700 font-mono">1.47L+</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Buyer Complaints</h4>
            <p className="text-xs text-slate-500">Disposed by RERA nationwide. ~1 complaint per project.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-indigo-200 bg-indigo-50/20 text-center space-y-2">
            <span className="text-4xl font-black text-indigo-700 font-mono">3–5 Days</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Manual Diligence</h4>
            <p className="text-xs text-slate-500">Lawyers charge ₹15,000–₹50,000 for manual search reports.</p>
          </div>

          <div className="sm:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 space-y-2">
            <span className="font-bold font-mono text-slate-900 uppercase">The Pain Points:</span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <li className="flex items-center space-x-2">
                <span className="text-rose-500 font-bold">✖</span>
                <span>Brochure promises mismatch official RERA Form B disclosures.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-rose-500 font-bold">✖</span>
                <span>eCourts and NCLT insolvency orders are completely hidden from portals.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-rose-500 font-bold">✖</span>
                <span>Government portals crash and impose hostile CAPTCHAs.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-rose-500 font-bold">✖</span>
                <span>Banks & underwriters rely on outdated physical paperwork.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },

    // Slide 3: The Solution
    {
      id: 3,
      badge: 'Product Core',
      title: 'One Input In. Verified Dossier Out.',
      subtitle: 'Sub-90-second automated statutory due diligence backed by immutable evidence citations.',
      speaker: 'Farhan & Piyush',
      duration: '75 sec',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">1</div>
              <h4 className="text-xs font-bold text-slate-900">Intake & Extraction</h4>
              <p className="text-xs text-slate-500">Paste listing URL or RERA ID. TinyFish agents extract advertised possession dates, amenities, and promoter name.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">2</div>
              <h4 className="text-xs font-bold text-slate-900">Parallel 6-Check Fan-Out</h4>
              <p className="text-xs text-slate-500">LangGraph orchestrates concurrent workers across RERA, eCourts, NCLT, MCA21, and municipal planning registries.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">3</div>
              <h4 className="text-xs font-bold text-slate-900">Deterministic Trust Score</h4>
              <p className="text-xs text-slate-500">Mathematical 0–100 rule engine (zero math hallucination) + vector PyMuPDF audit report export.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Average Turnaround: <strong className="text-white">62 seconds</strong></span>
            </div>
            <span className="text-emerald-400 font-bold">100% Deterministic Math</span>
          </div>
        </div>
      )
    },

    // Slide 4: 6 Statutory Dimensions
    {
      id: 4,
      badge: 'Scoring Engine',
      title: '6 Statutory Diligence Dimensions',
      subtitle: 'Deterministic 100-point rubric calibrated against actual regulatory risk weights.',
      speaker: 'Farhan Rahaman Mallik',
      duration: '60 sec',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: '1. RERA Status & Expiry', pts: '30 pts', desc: 'Valid registration, completion certificate, no Section 7 revocation notices.' },
            { name: '2. Claim vs Disclosure Match', pts: '20 pts', desc: 'Cross-verifies brochure possession dates and unit counts against RERA Form B.' },
            { name: '3. Judicial Litigation & CIRP', pts: '20 pts', desc: 'Checks eCourts, NCLT insolvency proceedings, and consumer forum suits.' },
            { name: '4. Promoter Track Record', pts: '10 pts', desc: 'Director disqualification on MCA21, past default history, and sister companies.' },
            { name: '5. Municipal Sanctions & NOCs', pts: '10 pts', desc: 'Building plan approvals, Fire NOC, and environmental impact clearance.' },
            { name: '6. Public Sentiment & Grievances', pts: '10 pts', desc: 'Aggregated consumer complaints, possession delay protests, and media alerts.' },
          ].map((dim, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">{dim.name}</span>
                <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">{dim.pts}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{dim.desc}</p>
            </div>
          ))}
        </div>
      )
    },

    // Slide 5: Technical Architecture
    {
      id: 5,
      badge: 'Engineering Architecture',
      title: 'The 5-Layer Agentic Pipeline',
      subtitle: 'Production-grade architecture designed for resilience, concurrency, and real-time streaming.',
      speaker: 'Farhan Rahaman Mallik',
      duration: '60 sec',
      content: (
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-1">
            <span className="text-sky-400 font-bold uppercase">Layer 1: Experience Layer (Next.js 14 App Router)</span>
            <p className="text-[11px] text-slate-400">7 routes (Verify, Terminal, Report, Watchlist, Compare, Bulk B2B, 404). Radial SVG TrustGauge & Lucide icons.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold uppercase">Layer 2: Worker Gateway (FastAPI 0.115)</span>
            <p className="text-[11px] text-slate-400">Async REST endpoints, Pydantic v2 schemas, PyMuPDF vector PDF exporter, HIL challenge broker.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold uppercase">Layer 3: Orchestration (LangGraph 0.2)</span>
            <p className="text-[11px] text-slate-400">Stateful verification graph with fan-out to 6 worker nodes and deterministic fan-in aggregator.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold uppercase">Layer 4: Web Agents (TinyFish APIs)</span>
            <p className="text-[11px] text-slate-400">Stealth browser runtime, dynamic DOM scrapers, CAPTCHA detection, multi-state RERA routing (9 states).</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-1">
            <span className="text-rose-400 font-bold uppercase">Layer 5: Persistence & Scheduling (Supabase & pg_cron)</span>
            <p className="text-[11px] text-slate-400">PostgreSQL 15, RLS policies, Realtime WebSocket replication, automated nightly re-checks at 02:00 IST.</p>
          </div>
        </div>
      )
    },

    // Slide 6: B2B Underwriting & Comparison
    {
      id: 6,
      badge: 'Stage 2 Innovations',
      title: 'B2B Bulk Underwriting & Matrix Benchmark',
      subtitle: 'Empowering retail banks, HFCs, and homebuyers to scale diligence effortlessly.',
      speaker: 'Piyush & Farhan',
      duration: '45 sec',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-sky-200 bg-sky-50/20 space-y-2">
            <div className="flex items-center space-x-2 text-sky-800 font-bold text-sm">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>B2B Institutional Portal (/bulk)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mortgage underwriters batch-upload applicant manifests (CSV/multi-line). Real-time worker execution calculates portfolio mean trust scores, risk tiers, and one-click audit CSV export.
            </p>
            <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">LOS Integration Ready</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-800 font-bold text-sm">
              <GitCompare className="w-4 h-4 text-indigo-600" />
              <span>Comparative Benchmark (/compare)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Side-by-side dimensional matrix comparing 2–4 properties across all 6 statutory dimensions. Surfaces comparative AI synthesis, relative strengths, and penalty ledgers.
            </p>
            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">Sharable URL Parameters</span>
          </div>
        </div>
      )
    },

    // Slide 7: Live Demo Launchpad
    {
      id: 7,
      badge: 'Live Demonstration',
      title: 'Interactive Live Demo Launchpad',
      subtitle: 'Experience the 3 pre-vetted canonical scenarios or live pipeline.',
      speaker: 'Farhan & Piyush',
      duration: '90 sec',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-600">Click any scenario to jump directly into the live verification and audit views:</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/report/rpt_sunshine_clean"
              className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-all text-left space-y-1 group"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-900">Sunshine Residency</span>
                <span className="text-xs font-mono font-bold text-emerald-700">92/100</span>
              </div>
              <p className="text-[11px] text-emerald-700">Clean title, active RERA, zero litigation. High Trust.</p>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>View Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/report/rpt_green_valley_delayed"
              className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-all text-left space-y-1 group"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-900">Green Valley Towers</span>
                <span className="text-xs font-mono font-bold text-amber-700">68/100</span>
              </div>
              <p className="text-[11px] text-amber-700">Delayed possession by 14 mos, consumer suit. Moderate Risk.</p>
              <span className="text-[10px] font-bold text-amber-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>View Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/report/rpt_royal_empire_flagged"
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-all text-left space-y-1 group"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-rose-900">Royal Empire Towers</span>
                <span className="text-xs font-mono font-bold text-rose-700">18/100</span>
              </div>
              <p className="text-[11px] text-rose-700">NCLT CIRP admitted, Section 7 revocation. Critical Alert.</p>
              <span className="text-[10px] font-bold text-rose-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>View Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/compare"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
            >
              Launch Side-by-Side Comparison
            </Link>
            <Link
              href="/bulk"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all"
            >
              Launch B2B Bulk Underwriter
            </Link>
          </div>
        </div>
      )
    },

    // Slide 8: Judge Q&A Defense
    {
      id: 8,
      badge: 'Technical Due Diligence',
      title: 'Judge Technical Q&A Defense',
      subtitle: 'Anticipated questions and architectural defenses.',
      speaker: 'Farhan Rahaman Mallik',
      duration: 'Q&A Prep',
      content: (
        <div className="space-y-3 font-sans text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <strong className="text-slate-900 block font-semibold">Q1: How do you guarantee the Trust Score is not hallucinated by the LLM?</strong>
            <p className="text-slate-600 text-[11px]">
              <strong>Defense:</strong> The Trust Score is calculated by a pure, deterministic mathematical rule engine in <code className="bg-slate-100 px-1 rounded font-mono">rule_engine.py</code>. The LLM is strictly used for plain-language summarization of already verified facts; it has zero access to manipulate scoring arithmetic.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <strong className="text-slate-900 block font-semibold">Q2: How do you handle hostile government portal CAPTCHAs?</strong>
            <p className="text-slate-600 text-[11px]">
              <strong>Defense:</strong> Ghar Search implements a Human-in-the-Loop (HIL) gate. When a portal challenges an agent with an OCR/CAPTCHA, execution halts, broadcasts via Supabase Realtime to the UI modal, and seamlessly resumes once solved.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <strong className="text-slate-900 block font-semibold">Q3: How do you handle stale data or project status updates?</strong>
            <p className="text-slate-600 text-[11px]">
              <strong>Defense:</strong> Saved watchlist properties are re-checked nightly at 02:00 IST using automated <code className="bg-slate-100 px-1 rounded font-mono">pg_cron</code> batch worker triggers. Delta changes &gt; 5 pts immediately dispatch alert notifications.
            </p>
          </div>
        </div>
      )
    }
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 pb-24">
      {/* Presentation Control Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors font-mono flex items-center space-x-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to App</span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
            title="Previous Slide (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
            title="Next Slide (Right Arrow or Space)"
          >
            <ChevronRight className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl bg-gradient-to-b from-white to-slate-50/50 min-h-[480px] flex flex-col justify-between space-y-8">
        {/* Slide Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/80 font-mono">
              {slide.badge}
            </span>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
              <span>🎤 {slide.speaker}</span>
              <span>•</span>
              <span>⏱️ {slide.duration}</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {slide.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {slide.subtitle}
          </p>
        </div>

        {/* Slide Body */}
        <div className="flex-1 py-2">
          {slide.content}
        </div>

        {/* Slide Footer Navigation Dots */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center space-x-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'w-8 bg-brand-600'
                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Use <kbd className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 font-bold">←</kbd> / <kbd className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 font-bold">→</kbd> arrow keys to navigate
          </span>
        </div>
      </div>
    </div>
  );
}
