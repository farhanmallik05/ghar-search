'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Link as LinkIcon,
  Building,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileText,
  Sparkles,
  Loader2,
  Activity,
  Layers,
} from 'lucide-react';
import { triggerVerification } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'url' | 'manual'>('url');
  const [listingUrl, setListingUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [promoterName, setPromoterName] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartVerification = async (customPayload?: any) => {
    setLoading(true);
    setError(null);

    if (!customPayload) {
      if (activeTab === 'url' && !listingUrl.trim()) {
        setError('Please enter a valid property listing or marketing brochure URL.');
        setLoading(false);
        return;
      }
      if (activeTab === 'manual' && !projectName.trim() && !reraNumber.trim()) {
        setError('Please enter at least a Project Name or RERA Registration Number.');
        setLoading(false);
        return;
      }
    }

    try {
      const payload = customPayload || (activeTab === 'url'
        ? { property_url: listingUrl }
        : {
            project_name: projectName,
            promoter_name: promoterName,
            rera_number: reraNumber,
            state: stateName,
          });

      const res = await triggerVerification(payload);
      router.push(`/progress/${res.report_id}`);
    } catch (err: any) {
      setError(err.message || 'Verification initiation failed. Check worker connection.');
      setLoading(false);
    }
  };

  const handleQuickDemo = (key: 'clean' | 'delayed' | 'flagged') => {
    const reportMap = {
      clean: 'rpt_sunshine_clean',
      delayed: 'rpt_green_valley_delayed',
      flagged: 'rpt_royal_empire_flagged',
    };
    router.push(`/progress/${reportMap[key]}`);
  };

  return (
    <div className="space-y-20 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 md:pt-22 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Hackathon Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/90 text-brand-700 text-xs font-bold mb-6 shadow-subtle font-mono">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>HackIIITD 2026 · Autonomous Due-Diligence Layer</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.12]">
          Paste a property listing.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-800">
            Get a verified trust report.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Autonomous web agents cross-reference real-estate listings against state RERA portals,
          eCourts, NCLT insolvency registers, and municipal plan sanctions in under 90 seconds.
        </p>

        {/* Search & Verification Input Console */}
        <div id="verify-section" className="mt-10 max-w-3xl mx-auto text-left">
          <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-premium border border-slate-200/80">
            {/* Input Method Tabs */}
            <div className="flex space-x-2 border-b border-slate-100 pb-4 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex items-center space-x-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all duration-150 active:scale-[0.98] ${
                  activeTab === 'url'
                    ? 'bg-brand-600 text-white shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Paste Property URL</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`flex items-center space-x-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all duration-150 active:scale-[0.98] ${
                  activeTab === 'manual'
                    ? 'bg-brand-600 text-white shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>RERA ID / Project Name</span>
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Inputs */}
            {activeTab === 'url' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                    Property Listing or Marketing Brochure Link
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="e.g. https://housing.com/in/buy/projects/sunshine-baner or MagicBricks / 99acres URL"
                      value={listingUrl}
                      onChange={(e) => setListingUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-slate-900 placeholder:text-slate-400 font-sans"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Supports Housing.com, 99acres, MagicBricks, builder websites, and public marketing links.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                    RERA Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. P52100012345"
                    value={reraNumber}
                    onChange={(e) => setReraNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                    State RERA Jurisdiction
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 font-sans"
                  >
                    <option value="Maharashtra">Maharashtra (MahaRERA)</option>
                    <option value="Karnataka">Karnataka (K-RERA)</option>
                    <option value="Delhi">Delhi NCT (D-RERA)</option>
                    <option value="Uttar Pradesh">Uttar Pradesh (UP RERA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunshine Residency"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                    Promoter / Builder Entity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Godrej Properties Limited"
                    value={promoterName}
                    onChange={(e) => setPromoterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 font-sans"
                  />
                </div>
              </div>
            )}

            {/* Launch Verification CTA */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center space-x-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero hallucinations: Pure deterministic mathematical scoring</span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleStartVerification()}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-subtle hover:shadow-premium transition-all duration-150 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deploying Agents...</span>
                  </>
                ) : (
                  <>
                    <span>Run 2-Check Due Diligence</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 1-Click Interactive Judge Demo Strip */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3.5 text-center font-mono">
            ⚡ 1-Click Test Scenarios (Instant Evaluation Benchmarks)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Case 1: Clean */}
            <button
              onClick={() => handleQuickDemo('clean')}
              className="text-left p-4 rounded-xl border border-emerald-200/80 bg-white hover:bg-emerald-50/40 hover:border-emerald-300 transition-all duration-150 shadow-subtle group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 font-mono">
                  Clean · 92 Pts
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-xs text-slate-900 tracking-tight">Sunshine Residency</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Valid RERA, zero court disputes, AAA promoter.
              </p>
            </button>

            {/* Case 2: Delayed */}
            <button
              onClick={() => handleQuickDemo('delayed')}
              className="text-left p-4 rounded-xl border border-amber-200/80 bg-white hover:bg-amber-50/40 hover:border-amber-300 transition-all duration-150 shadow-subtle group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80 font-mono">
                  Delayed · 68 Pts
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-xs text-slate-900 tracking-tight">Green Valley Towers</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                14 mo. possession lag, consumer claims.
              </p>
            </button>

            {/* Case 3: Flagged */}
            <button
              onClick={() => handleQuickDemo('flagged')}
              className="text-left p-4 rounded-xl border border-rose-200/80 bg-white hover:bg-rose-50/40 hover:border-rose-300 transition-all duration-150 shadow-subtle group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80 font-mono">
                  Alert · 18 Pts
                </span>
                <AlertOctagon className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-xs text-slate-900 tracking-tight">Royal Empire (Thane)</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                NCLT insolvency petition, unauthorized floors.
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* 2-Check Focus & Statutory Workflow Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 font-mono">
            Auditable Evidence Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            2 Core Statutory Checks. Zero Hallucinations.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Every score deduction links directly to official government portal records with primary source URLs, timestamps, and screenshots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-premium">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 ring-1 ring-blue-100">
              <Building className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-1 font-mono">
              Check 1 · 60% Weight
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-2 tracking-tight">
              RERA Status & Regulatory Disclosures
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Autonomous web agents query MahaRERA and State RERA portals to verify registration authenticity, certificate validity expiry, Section 7/8 revocation orders, designated 70% escrow accounts, and quarterly CA progress filings.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-premium">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 ring-1 ring-purple-100">
              <Scale className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-1 font-mono">
              Check 2 · 40% Weight
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-2 tracking-tight">
              Litigation Signals & Court News
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scans the National Judicial Data Grid (eCourts India), NCLT/IBBI corporate insolvency ledgers (Section 7 and Section 9 CIRP petitions), High Court stop-work injunctions, and consumer court delay compensation claims.
            </p>
          </div>
        </div>

        {/* 3-Screen Workflow Breadcrumb Bar */}
        <div className="mt-10 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <div className="font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>3-Screen Due Diligence Journey:</span>
          </div>
          <div className="flex items-center space-x-2.5 font-medium font-mono text-[11px]">
            <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/80 font-bold text-slate-800">
              1. Input Listing
            </span>
            <span className="text-slate-300">→</span>
            <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/80 font-bold text-slate-800">
              2. Live Agent Progress
            </span>
            <span className="text-slate-300">→</span>
            <span className="bg-brand-50 px-3 py-1 rounded-lg border border-brand-200 font-bold text-brand-700">
              3. Verified Trust Report
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
