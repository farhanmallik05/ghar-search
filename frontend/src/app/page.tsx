'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'url' | 'manual'>('url');
  const [listingUrl, setListingUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [promoterName, setPromoterName] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [fromLanding, setFromLanding] = useState(false);

  const autoTriggeredRef = useRef(false);

  const sampleListings = [
    {
      title: 'Sample Residency (Greater Noida)',
      url: 'https://housing.com/in/buy/projects/sample-residency-greater-noida',
      rera: 'UPRERA-PRJ-2024-8841',
      promoter: 'Sample Developers Pvt Ltd',
      state: 'Uttar Pradesh',
    },
    {
      title: 'Skyline Nirvana (Gurugram)',
      url: 'https://99acres.com/skyline-nirvana-sector-65-gurugram',
      rera: 'HARERA-GGM-2023-102',
      promoter: 'Skyline Infra Holdings',
      state: 'Delhi',
    },
    {
      title: 'Oasis Grand (Bengaluru)',
      url: 'https://magicbricks.com/oasis-grand-whitefield-bengaluru',
      rera: 'PRM/KA/RERA/1251/446/PR/220101',
      promoter: 'Oasis Realty Group',
      state: 'Karnataka',
    },
  ];

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
      const payload =
        customPayload ||
        (activeTab === 'url'
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

  // Inbound query parameter ingestion & deep-link scrolling
  useEffect(() => {
    const urlParam = searchParams.get('url');
    const reraParam = searchParams.get('rera');
    const queryParam = searchParams.get('query');
    const autoParam = searchParams.get('auto') === 'true';
    const verifyParam = searchParams.get('verify') === 'true';
    const stateParam = searchParams.get('state');
    const projectParam = searchParams.get('project');
    const promoterParam = searchParams.get('promoter');

    if (stateParam) setStateName(stateParam);
    if (projectParam) setProjectName(projectParam);
    if (promoterParam) setPromoterName(promoterParam);

    const fromParam = searchParams.get('from') === 'landing';
    if (fromParam) setFromLanding(true);
    if (verifyParam || queryParam || urlParam || reraParam) {
      setIsHighlighted(true);
    }

    let resolvedTab: 'url' | 'manual' | null = null;
    let resolvedUrl = '';
    let resolvedRera = '';
    let resolvedProject = projectParam || '';

    if (urlParam) {
      resolvedTab = 'url';
      resolvedUrl = urlParam;
      setListingUrl(urlParam);
      setActiveTab('url');
    }

    if (reraParam) {
      resolvedTab = 'manual';
      resolvedRera = reraParam;
      setReraNumber(reraParam);
      setActiveTab('manual');
    }

    if (queryParam) {
      const trimmed = queryParam.trim();
      const isUrlPattern =
        /^https?:\/\//i.test(trimmed) ||
        trimmed.includes('housing.com') ||
        trimmed.includes('99acres.com') ||
        trimmed.includes('magicbricks.com') ||
        trimmed.includes('.com') ||
        trimmed.includes('.in');

      if (isUrlPattern) {
        if (!urlParam) {
          resolvedTab = 'url';
          resolvedUrl = trimmed;
          setListingUrl(trimmed);
          setActiveTab('url');
        }
      } else {
        if (!reraParam) {
          resolvedTab = 'manual';
          setActiveTab('manual');
          if (/\s/.test(trimmed)) {
            resolvedProject = trimmed;
            setProjectName(trimmed);
          } else if (/[0-9]/.test(trimmed)) {
            resolvedRera = trimmed;
            setReraNumber(trimmed);
          } else {
            resolvedProject = trimmed;
            setProjectName(trimmed);
          }
        }
      }
    }

    if (verifyParam || (typeof window !== 'undefined' && window.location.hash === '#verify-section')) {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById('verify-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(scrollTimer);
    }

    if (autoParam && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      let payloadToTrigger: any = null;

      if (resolvedTab === 'url' && resolvedUrl) {
        payloadToTrigger = { property_url: resolvedUrl };
      } else if (resolvedTab === 'manual' && (resolvedRera || resolvedProject)) {
        payloadToTrigger = {
          project_name: resolvedProject,
          promoter_name: promoterParam || '',
          rera_number: resolvedRera,
          state: stateParam || 'Maharashtra',
        };
      } else if (resolvedUrl) {
        payloadToTrigger = { property_url: resolvedUrl };
      }

      if (payloadToTrigger) {
        handleStartVerification(payloadToTrigger);
      }
    }
  }, [searchParams]);

  return (
    <div className="space-y-20 pb-24 relative overflow-hidden">
      {/* Background Decorative Glow (Landing Page Luxury Style) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-10 md:pt-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center z-10">
        {/* Hackathon Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs font-mono tracking-wider mb-6 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>HACKIIITD 2026 · AUTONOMOUS DUE-DILIGENCE LAYER</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Paste a property listing.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-500 font-normal">
            Get a verified trust report.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
          Autonomous TinyFish web agents cross-reference real-estate listings against state RERA portals,
          eCourts, NCLT insolvency registers, and municipal plan sanctions in real time.
        </p>

        {/* Search & Verification Input Console */}
        <div id="verify-section" className="mt-10 max-w-3xl mx-auto text-left">
          <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.85)] border border-white/[0.08] bg-[#0d0d0e]/95">
            {fromLanding && (
              <div className="mb-4 px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Arrived from Ghar Search Story &bull; Ready for Due Diligence</span>
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest hidden sm:inline">TinyFish Layer</span>
              </div>
            )}
            {/* Input Method Tabs */}
            <div className="flex space-x-2 border-b border-white/[0.06] pb-4 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex items-center space-x-2 text-xs sm:text-sm font-mono tracking-wider px-4 py-2 rounded-xl transition-all duration-150 active:scale-[0.98] ${
                  activeTab === 'url'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Paste Property URL</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`flex items-center space-x-2 text-xs sm:text-sm font-mono tracking-wider px-4 py-2 rounded-xl transition-all duration-150 active:scale-[0.98] ${
                  activeTab === 'manual'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>RERA ID / Project Name</span>
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center space-x-2 font-mono">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Inputs */}
            {activeTab === 'url' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-white/70 mb-2">
                    Property Listing or Marketing Brochure Link
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="e.g. https://housing.com/in/buy/projects/sunshine-baner or MagicBricks / 99acres URL"
                      value={listingUrl}
                      onChange={(e) => setListingUrl(e.target.value)}
                      className={`w-full px-4 py-3 bg-[#0a0a0c] border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-white placeholder:text-white/30 font-sans ${isHighlighted ? 'input-arrive-highlight' : ''}`}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-white/40 font-mono">
                    Supports Housing.com, 99acres, MagicBricks, builder websites, and public marketing links.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-white/70 mb-2">
                    RERA Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. P52100012345"
                    value={reraNumber}
                    onChange={(e) => setReraNumber(e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-white font-mono placeholder:text-white/30 ${isHighlighted ? 'input-arrive-highlight' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-white/70 mb-2">
                    State RERA Jurisdiction
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-white font-sans"
                  >
                    <option value="Maharashtra" className="bg-[#0d0d0e]">Maharashtra (MahaRERA)</option>
                    <option value="Karnataka" className="bg-[#0d0d0e]">Karnataka (K-RERA)</option>
                    <option value="Delhi" className="bg-[#0d0d0e]">Delhi NCT (D-RERA)</option>
                    <option value="Uttar Pradesh" className="bg-[#0d0d0e]">Uttar Pradesh (UP RERA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-white/70 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunshine Residency"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-white font-sans placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-white/70 mb-2">
                    Promoter / Builder Entity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Godrej Properties Limited"
                    value={promoterName}
                    onChange={(e) => setPromoterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-white/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-white font-sans placeholder:text-white/30"
                  />
                </div>
              </div>
            )}

            {/* Quick Presets (Landing Page UI Alignment) */}
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-white/40">Try sample listing:</span>
              {sampleListings.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => {
                    setListingUrl(sample.url);
                    setProjectName(sample.title);
                    setReraNumber(sample.rera);
                    setPromoterName(sample.promoter);
                    setStateName(sample.state);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70 hover:text-emerald-300 hover:border-emerald-500/40 hover:bg-emerald-950/20 transition-all text-[11px]"
                >
                  {sample.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Launch Verification CTA */}
            <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-white/50 flex items-center space-x-1.5 font-light">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero hallucinations: Pure deterministic mathematical scoring</span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleStartVerification()}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-semibold text-xs sm:text-sm shadow-[0_0_24px_-2px_rgba(16,185,129,0.4)] transition-all duration-150 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deploying Agents...</span>
                  </>
                ) : (
                  <>
                    <span>Run Verification Protocol</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 1-Click Interactive Judge Demo Strip */}
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="text-[11px] font-mono tracking-widest uppercase text-white/40 mb-3.5 text-center">
            ⚡ 1-Click Test Scenarios (Instant Evaluation Benchmarks)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Case 1: Clean */}
            <button
              onClick={() => handleQuickDemo('clean')}
              className="text-left p-4 rounded-xl border border-white/[0.08] bg-[#0d0d0e] hover:bg-[#121214] hover:border-emerald-500/30 transition-all duration-150 shadow-subtle group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Clean · 92 Pts
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-semibold text-xs text-white tracking-tight">Sunshine Residency</div>
              <p className="text-[11px] text-white/50 mt-1 leading-snug font-light">
                Valid RERA, zero court disputes, AAA promoter.
              </p>
            </button>

            {/* Case 2: Delayed */}
            <button
              onClick={() => handleQuickDemo('delayed')}
              className="text-left p-4 rounded-xl border border-white/[0.08] bg-[#0d0d0e] hover:bg-[#121214] hover:border-amber-500/30 transition-all duration-150 shadow-subtle group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Delayed · 68 Pts
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-semibold text-xs text-white tracking-tight">Green Valley Towers</div>
              <p className="text-[11px] text-white/50 mt-1 leading-snug font-light">
                14 mo. possession lag, consumer claims.
              </p>
            </button>

            {/* Case 3: Flagged */}
            <button
              onClick={() => handleQuickDemo('flagged')}
              className="text-left p-4 rounded-xl border border-white/[0.08] bg-[#0d0d0e] hover:bg-[#121214] hover:border-rose-500/30 transition-all duration-150 shadow-subtle group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                  Alert · 18 Pts
                </span>
                <AlertOctagon className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-semibold text-xs text-white tracking-tight">Royal Empire (Thane)</div>
              <p className="text-[11px] text-white/50 mt-1 leading-snug font-light">
                NCLT insolvency petition, unauthorized floors.
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* 2-Check Focus & Statutory Workflow Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
            Auditable Evidence Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-1">
            2 Core Statutory Checks. Zero Hallucinations.
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-2 leading-relaxed font-light">
            Every score deduction links directly to official government portal records with primary source URLs, timestamps, and screenshots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/[0.08] bg-[#0d0d0e]/90">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
              <Building className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1">
              Check 1 · 60% Weight
            </div>
            <h3 className="font-semibold text-base text-white mb-2 tracking-tight">
              RERA Status &amp; Regulatory Disclosures
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Autonomous web agents query MahaRERA and State RERA portals to verify registration authenticity, certificate validity expiry, Section 7/8 revocation orders, designated 70% escrow accounts, and quarterly CA progress filings.
            </p>
          </div>

          <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/[0.08] bg-[#0d0d0e]/90">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Scale className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-1">
              Check 2 · 40% Weight
            </div>
            <h3 className="font-semibold text-base text-white mb-2 tracking-tight">
              Litigation Signals &amp; Court News
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Scans the National Judicial Data Grid (eCourts India), NCLT/IBBI corporate insolvency ledgers (Section 7 and Section 9 CIRP petitions), High Court stop-work injunctions, and consumer court delay compensation claims.
            </p>
          </div>
        </div>

        {/* 3-Screen Workflow Breadcrumb Bar */}
        <div className="mt-10 p-5 rounded-2xl bg-[#0d0d0e] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <div className="font-semibold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>3-Screen Due Diligence Journey:</span>
          </div>
          <div className="flex items-center space-x-2.5 font-mono text-[11px]">
            <span className="bg-white/[0.04] px-3 py-1 rounded-lg border border-white/[0.08] text-white/80">
              1. Input Listing
            </span>
            <span className="text-white/30">→</span>
            <span className="bg-white/[0.04] px-3 py-1 rounded-lg border border-white/[0.08] text-white/80">
              2. Live Agent Progress
            </span>
            <span className="text-white/30">→</span>
            <span className="bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/30 text-emerald-300 font-semibold">
              3. Verified Trust Report
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-xs font-mono text-white/50">Loading due-diligence workspace...</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
