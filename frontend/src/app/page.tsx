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
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HackIIITD 2026 · Autonomous Due-Diligence Layer</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Paste a property listing.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-800">
            Get a verified trust report.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Autonomous web agents cross-reference real-estate listings against state RERA portals,
          eCourts, NCLT insolvency registers, and municipal plan sanctions in under 90 seconds.
        </p>

        {/* Search & Verification Box */}
        <div id="verify-section" className="mt-10 max-w-3xl mx-auto text-left">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
            {/* Input Method Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 pb-4 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex items-center space-x-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'url'
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Paste Property URL</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`flex items-center space-x-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'manual'
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building className="w-4 h-4" />
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
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Property Listing or Brochure Link
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="e.g. https://housing.com/in/buy/projects/sunshine-baner or MagicBricks / 99acres URL"
                      value={listingUrl}
                      onChange={(e) => setListingUrl(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-slate-900"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Supports Housing.com, 99acres, MagicBricks, builder websites, or public marketing links.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    RERA Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. P52100012345"
                    value={reraNumber}
                    onChange={(e) => setReraNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    State RERA Jurisdiction
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                  >
                    <option value="Maharashtra">Maharashtra (MahaRERA)</option>
                    <option value="Karnataka">Karnataka (K-RERA)</option>
                    <option value="Delhi">Delhi NCT (D-RERA)</option>
                    <option value="Uttar Pradesh">Uttar Pradesh (UP RERA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunshine Residency"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Promoter / Builder Entity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Godrej Properties Limited"
                    value={promoterName}
                    onChange={(e) => setPromoterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Launch Verification CTA */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero hallucinations: Pure deterministic mathematical scoring</span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleStartVerification()}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
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

        {/* 1-Click Interactive Judge Demo Strip (MOCK-01) */}
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            🚀 1-Click Live Test Cases (Zero-Failure Resilient Demo Mode)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Case 1: Clean */}
            <button
              onClick={() => handleQuickDemo('clean')}
              className="text-left p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Clean Case
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-xs text-slate-900">Sunshine Residency (Pune)</div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                RERA valid, 0 litigations, AAA promoter (Score 92)
              </p>
            </button>

            {/* Case 2: Delayed */}
            <button
              onClick={() => handleQuickDemo('delayed')}
              className="text-left p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Delayed Case
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-xs text-slate-900">Green Valley Towers (Pune)</div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                14 mo. possession delay, consumer cases (Score 68)
              </p>
            </button>

            {/* Case 3: Flagged */}
            <button
              onClick={() => handleQuickDemo('flagged')}
              className="text-left p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  Critical Alert
                </span>
                <AlertOctagon className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-xs text-slate-900">Royal Empire (Thane)</div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                NCLT insolvency, 8 illegal floors (Score 18)
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* 2-Check Focus & 3-Screen Workflow Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">
            2 Core Statutory Checks. Zero Hallucinations.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every score deduction links directly to official government portal records with primary source URLs, timestamps, and screenshots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Building className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-1">Check 1 · 60% Weight</div>
            <h3 className="font-bold text-base text-slate-900 mb-2">RERA Status & Regulatory Disclosures</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Autonomous web agents query MahaRERA and State RERA portals to verify registration authenticity, certificate validity expiry, Section 7/8 revocation orders, designated 70% escrow accounts, and quarterly CA progress filings.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Scale className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-1">Check 2 · 40% Weight</div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Litigation Signals & Court News</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scans the National Judicial Data Grid (eCourts India), NCLT/IBBI corporate insolvency ledgers (Section 7 and Section 9 CIRP petitions), High Court stop-work injunctions, and consumer court delay compensation claims.
            </p>
          </div>
        </div>

        {/* 3-Screen Workflow Pills */}
        <div className="mt-10 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <div className="font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>3-Screen Due Diligence Journey:</span>
          </div>
          <div className="flex items-center space-x-3 font-medium">
            <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs font-semibold text-slate-800">1. Input Listing</span>
            <span className="text-slate-400">➔</span>
            <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs font-semibold text-slate-800">2. Live Agent Progress</span>
            <span className="text-slate-400">➔</span>
            <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs font-semibold text-slate-800">3. Verified Trust Report</span>
          </div>
        </div>
      </section>
    </div>
  );
}
