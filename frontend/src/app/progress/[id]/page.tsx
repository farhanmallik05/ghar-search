'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Activity,
  FileCheck,
  UserCheck,
  Award,
  Star,
  ExternalLink,
  KeyRound,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { getReport, resolveHITL } from '@/lib/api';
import { VerificationReport, CheckType } from '@/lib/types';

interface AgentLog {
  time: string;
  source: 'COORDINATOR' | 'RERA_AGENT' | 'CLAIM_AGENT' | 'PROMOTER_AGENT' | 'COURT_AGENT' | 'APPROVALS_AGENT' | 'REPUTATION_AGENT';
  message: string;
  status: 'info' | 'success' | 'warn' | 'error';
}

interface DimensionDef {
  type: CheckType;
  title: string;
  category: string;
  maxScore: number;
  icon: React.ElementType;
  targetPortal: string;
  checksDetail: string[];
}

const DIMENSIONS: DimensionDef[] = [
  {
    type: 'rera_status',
    title: 'RERA Registration & Status',
    category: 'Check 1 of 6 · Statutory Authority',
    maxScore: 30,
    icon: Building2,
    targetPortal: 'State RERA Official Public Portal',
    checksDetail: [
      'Validating certificate expiry, Section 7 status & approved layout',
      'Audit: Designated 70% escrow bank account quarterly disclosures',
    ],
  },
  {
    type: 'claim_match',
    title: 'Brochure Claim vs Filings',
    category: 'Check 2 of 6 · Marketing Truth & Disclosures',
    maxScore: 20,
    icon: FileCheck,
    targetPortal: 'Registered RERA Form B & Layout Disclosures',
    checksDetail: [
      'Cross-referencing promised possession date with sanctioned schedule',
      'Verifying carpet area, total units, tower heights & promised amenities',
    ],
  },
  {
    type: 'promoter_record',
    title: 'Promoter Track Record',
    category: 'Check 3 of 6 · Entity Health & Governance',
    maxScore: 10,
    icon: UserCheck,
    targetPortal: 'Ministry of Corporate Affairs (MCA21)',
    checksDetail: [
      'Verifying active DIN, director disqualifications & charge satisfaction',
      'Portfolio delivery track record & past non-compliance scan',
    ],
  },
  {
    type: 'court_signals',
    title: 'Litigation & Judicial Records',
    category: 'Check 4 of 6 · Judicial & News Ledgers',
    maxScore: 20,
    icon: Scale,
    targetPortal: 'National Judicial Data Grid (eCourts India)',
    checksDetail: [
      'Scanning NCLT & IBBI Insolvency registry (Section 7 / 9 CIRP)',
      'Indexing consumer forum compensation claims & stay orders',
    ],
  },
  {
    type: 'approvals',
    title: 'Statutory Sanctions & NOCs',
    category: 'Check 5 of 6 · Municipal Clearances',
    maxScore: 10,
    icon: Award,
    targetPortal: 'Municipal Town Planning & Fire Portals',
    checksDetail: [
      'Commencement Certificate (CC) & sanctioned floor plans verified',
      'State Fire Department provisional NOC & Environmental Clearance',
    ],
  },
  {
    type: 'reputation',
    title: 'Public Sentiment & Reviews',
    category: 'Check 6 of 6 · Consumer Grievance Registries',
    maxScore: 10,
    icon: Star,
    targetPortal: 'Consumer Dispute Portals & Homebuyer Communities',
    checksDetail: [
      'Public consumer grievance indexing & construction halt reports',
      'Homebuyer forum sentiment & on-ground execution feedback',
    ],
  },
];

function ProgressScreenContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<VerificationReport | null>(null);
  const [progressPct, setProgressPct] = useState<number>(15);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hilChallengeActive, setHilChallengeActive] = useState<boolean>(false);
  const [hilInput, setHilInput] = useState<string>('7G4K9');
  const [hilResolving, setHilResolving] = useState<boolean>(false);
  const [hilResolved, setHilResolved] = useState<boolean>(false);

  // Fallback / simulated state for each dimension while agents are probing
  const [simSteps, setSimSteps] = useState<Record<CheckType, 'queued' | 'scanning' | 'passed' | 'flagged'>>({
    rera_status: 'scanning',
    claim_match: 'queued',
    promoter_record: 'queued',
    court_signals: 'queued',
    approvals: 'queued',
    reputation: 'queued',
  });

  const [logs, setLogs] = useState<AgentLog[]>([
    {
      time: '00:00',
      source: 'COORDINATOR',
      message: 'Intake initiated. Spinning up parallel worker agents for 6 statutory checks...',
      status: 'info',
    },
    {
      time: '00:01',
      source: 'RERA_AGENT',
      message: 'Connecting to State RERA Portal API gateway...',
      status: 'info',
    },
  ]);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll report status from FastAPI worker
  useEffect(() => {
    let checkInterval: any = null;

    async function checkBackend() {
      try {
        const data = await getReport(reportId);
        setReport(data);

        if (data.status === 'completed' || data.status === 'failed') {
          setProgressPct(100);
          setIsCompleted(true);
          if (checkInterval) clearInterval(checkInterval);
        }
      } catch (err) {
        console.warn('Backend polling error:', err);
      }
    }

    checkBackend();
    checkInterval = setInterval(checkBackend, 1200);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [reportId]);

  // Staged progress simulation across all 6 dimensions
  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgressPct(35);
      setSimSteps((prev) => ({
        ...prev,
        rera_status: 'scanning',
        claim_match: 'scanning',
      }));
      setLogs((prev) => [
        ...prev,
        {
          time: '00:03',
          source: 'RERA_AGENT',
          message: 'Target project record found. Extracting certificate validity and designated 70% escrow account status...',
          status: 'info',
        },
        {
          time: '00:04',
          source: 'CLAIM_AGENT',
          message: 'Extracting marketing brochure claims: Promised possession Dec 2026, 4 towers, 450 units...',
          status: 'info',
        },
      ]);
    }, 2500);

    const t2 = setTimeout(() => {
      setProgressPct(60);
      setSimSteps((prev) => ({
        ...prev,
        rera_status: 'passed',
        claim_match: 'passed',
        promoter_record: 'scanning',
        court_signals: 'scanning',
      }));
      setLogs((prev) => [
        ...prev,
        {
          time: '00:07',
          source: 'RERA_AGENT',
          message: '✓ Verified: RERA active through Dec 2027. Escrow account authenticated.',
          status: 'success',
        },
        {
          time: '00:08',
          source: 'COURT_AGENT',
          message: 'Probing National Judicial Data Grid (NJDG) for commercial & consumer litigation...',
          status: 'info',
        },
        {
          time: '00:09',
          source: 'PROMOTER_AGENT',
          message: 'Querying MCA21 director master database: 4 active directors, DIN checks clean.',
          status: 'info',
        },
      ]);
    }, 5500);

    const t3 = setTimeout(() => {
      setProgressPct(85);
      const isDelayed = reportId.includes('delayed');
      const isFlagged = reportId.includes('flagged');

      setSimSteps((prev) => ({
        ...prev,
        promoter_record: 'passed',
        court_signals: isFlagged ? 'flagged' : 'passed',
        approvals: isDelayed ? 'flagged' : 'passed',
        reputation: 'scanning',
      }));

      setLogs((prev) => [
        ...prev,
        {
          time: '00:12',
          source: 'PROMOTER_AGENT',
          message: '✓ Promoter health authenticated: Zero MCA defaults, charges satisfied.',
          status: 'success',
        },
        {
          time: '00:13',
          source: 'COURT_AGENT',
          message: isFlagged
            ? '⚠ ALERT: Insolvency Petition detected on NCLT docket (IBC Section 7).'
            : '✓ Court records clean. Zero active stay orders or injunctions.',
          status: isFlagged ? 'error' : 'success',
        },
        {
          time: '00:14',
          source: 'APPROVALS_AGENT',
          message: isDelayed
            ? '⚠ WARNING: Revised completion schedule pending municipal re-validation.'
            : '✓ Commencement Certificate (CC) & Fire NOC fully validated.',
          status: isDelayed ? 'warn' : 'success',
        },
      ]);
    }, 8500);

    const t4 = setTimeout(() => {
      setProgressPct(100);
      setIsCompleted(true);
      setSimSteps((prev) => ({
        ...prev,
        reputation: 'passed',
      }));
      setLogs((prev) => [
        ...prev,
        {
          time: '00:16',
          source: 'REPUTATION_AGENT',
          message: '✓ Consumer sentiment synthesis concluded. No structural halt reports.',
          status: 'success',
        },
        {
          time: '00:17',
          source: 'COORDINATOR',
          message: '★ All 6 statutory agents concluded investigation. Generating verifiable report...',
          status: 'success',
        },
      ]);
    }, 11500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [reportId]);

  const handleResolveHITL = async (e: React.FormEvent) => {
    e.preventDefault();
    setHilResolving(true);
    try {
      await resolveHITL(reportId, 'rera_status', { captcha_token: hilInput });
      setHilResolved(true);
      setHilChallengeActive(false);
      setLogs((prev) => [
        ...prev,
        {
          time: '00:10',
          source: 'COORDINATOR',
          message: `✓ Human-in-the-Loop challenge solved (${hilInput}). Resuming autonomous agent crawl.`,
          status: 'success',
        },
      ]);
    } catch (err) {
      console.error(err);
      setHilResolved(true);
      setHilChallengeActive(false);
    } finally {
      setHilResolving(false);
    }
  };

  const handleProceedToReport = () => {
    router.push(`/report/${reportId}`);
  };

  const propDetails = useMemo(() => {
    if (report?.property_details?.project_name) {
      return report.property_details;
    }

    // Check search params passed from intake
    const projectParam = searchParams.get('project') || searchParams.get('query');
    const promoterParam = searchParams.get('promoter');
    const reraParam = searchParams.get('rera');
    const stateParam = searchParams.get('state');
    const cityParam = searchParams.get('city');

    if (projectParam) {
      const cleanProject = projectParam.trim();
      const titleCase = cleanProject.charAt(0).toUpperCase() + cleanProject.slice(1);
      return {
        project_name: titleCase,
        promoter_name: promoterParam || `${titleCase} Properties Ltd`,
        rera_id: reraParam || 'P52100099999',
        city: cityParam || 'Mumbai',
        state: stateParam || 'Maharashtra',
      };
    }

    if (reportId.includes('delayed') || reportId.includes('green_valley')) {
      return {
        project_name: 'Green Valley Towers Phase 2',
        promoter_name: 'Apex Skyline Developers Pvt Ltd',
        rera_id: 'P52100088765',
        city: 'Pune',
        state: 'Maharashtra',
      };
    }
    if (reportId.includes('royal_empire') || reportId.includes('flagged')) {
      return {
        project_name: 'Royal Empire Luxury Towers',
        promoter_name: 'Royal Imperial Realcon Ltd',
        rera_id: 'P51700099881',
        city: 'Thane',
        state: 'Maharashtra',
      };
    }
    if (reportId.includes('sunshine') || reportId.includes('clean')) {
      return {
        project_name: 'Sunshine Residency Phase 1',
        promoter_name: 'Godrej Properties Limited',
        rera_id: 'P52100012345',
        city: 'Pune',
        state: 'Maharashtra',
      };
    }

    return {
      project_name: 'Verified Real Estate Asset',
      promoter_name: 'Promoter Entity Under Audit',
      rera_id: 'P52100099999',
      city: 'Mumbai',
      state: 'Maharashtra',
    };
  }, [report, reportId, searchParams]);

  const getDimensionState = (type: CheckType) => {
    const checkObj = report?.checks?.find((c) => c.check_type === type);
    if (checkObj) {
      const isFlagged = checkObj.status === 'flagged' || checkObj.status === 'failed';
      const isPassed = checkObj.status === 'passed';
      const isRunning = checkObj.status === 'running';
      return {
        status: isFlagged ? 'flagged' : isPassed ? 'passed' : isRunning ? 'scanning' : 'queued',
        score: checkObj.score_contribution,
        maxScore: checkObj.max_score || DIMENSIONS.find((d) => d.type === type)?.maxScore || 10,
      };
    }
    const sim = simSteps[type];
    const maxScore = DIMENSIONS.find((d) => d.type === type)?.maxScore || 10;
    return {
      status: sim,
      score: sim === 'passed' ? maxScore : sim === 'flagged' ? Math.floor(maxScore * 0.4) : null,
      maxScore,
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-28 relative">
      {/* 3-Step Journey Navigation Breadcrumb */}
      <div className="flex items-center justify-center text-xs font-mono">
        <div className="inline-flex items-center space-x-1 sm:space-x-2 p-1.5 rounded-full bg-[#0d0d0e] border border-white/[0.08] shadow-subtle">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-white/50 hover:text-white transition-all"
          >
            <span className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[9px] font-bold">
              1
            </span>
            <span className="hidden sm:inline">Input Listing</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-white/20" />

          <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold bg-emerald-950/60 px-3.5 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>2. Live Due Diligence</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-white/20" />

          <div className="flex items-center space-x-1.5 px-3 py-1 text-white/40">
            <span className="w-4 h-4 rounded-full bg-white/5 text-white/40 flex items-center justify-center text-[9px]">
              3
            </span>
            <span className="hidden sm:inline">Verified Trust Report</span>
          </div>
        </div>
      </div>

      {/* Target Property Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-mono text-white/50 uppercase tracking-wider">
              <span>{propDetails.city || 'Mumbai'}, {propDetails.state || 'Maharashtra'}</span>
              <span>•</span>
              <span className="text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                RERA: {propDetails.rera_id || 'P52100099999'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              {propDetails.project_name || 'Verified Real Estate Asset'}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 font-light">
              Developer:{' '}
              <strong className="text-white font-medium">
                {propDetails.promoter_name || 'Promoter Entity Under Audit'}
              </strong>
            </p>
          </div>

          <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
            <div className="text-left sm:text-right bg-[#121214] p-4 rounded-xl border border-white/[0.06] shrink-0 w-full sm:w-auto">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                Pipeline Clock
              </div>
              <div className="text-3xl font-light font-mono tabular-nums text-emerald-400 mt-0.5">
                00:{elapsedSec < 10 ? `0${elapsedSec}` : elapsedSec}
              </div>
              <div className="text-[11px] text-white/40 font-mono mt-0.5">SLO Target: &lt; 90s</div>
            </div>

            {!hilResolved && (
              <button
                type="button"
                onClick={() => setHilChallengeActive(!hilChallengeActive)}
                className="text-[11px] font-mono px-3 py-1 rounded-lg border border-amber-500/30 bg-amber-950/40 text-amber-300 hover:bg-amber-950/70 transition-all flex items-center space-x-1.5"
              >
                <KeyRound className="w-3 h-3 text-amber-400" />
                <span>{hilChallengeActive ? 'Hide HIL Challenge' : 'Simulate HIL Portal Gate'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-6 space-y-2 pt-5 border-t border-white/[0.06]">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-white/80 flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isCompleted ? 'Verification Complete — All 6 Dimensions Sealed!' : 'Parallel Autonomous Agents Scanning Statutory Portals...'}
              </span>
            </span>
            <span className="text-emerald-400 font-semibold tabular-nums">{progressPct}%</span>
          </div>
          <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop (HITL) Interactive Challenge Banner */}
      {hilChallengeActive && !hilResolved && (
        <div className="glass-card rounded-2xl p-6 border-2 border-amber-500/50 bg-amber-950/30 shadow-premium space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                  Human-in-the-Loop Gate Required
                </span>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  State RERA Portal Security Verification
                </h3>
              </div>
            </div>
            <span className="text-[10px] font-mono font-medium uppercase bg-amber-950/80 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
              Agent Paused (Max 5m)
            </span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed max-w-3xl font-light">
            The official government portal detected automated access and requested interactive challenge verification. Please enter the captcha characters shown below to unpause the autonomous crawler.
          </p>

          <form onSubmit={handleResolveHITL} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="bg-[#050505] text-emerald-400 font-mono font-bold text-lg tracking-widest px-5 py-2.5 rounded-xl border border-white/10 select-none shadow-inner">
              7 · G · 4 · K · 9
            </div>

            <input
              type="text"
              value={hilInput}
              onChange={(e) => setHilInput(e.target.value)}
              placeholder="Enter CAPTCHA characters..."
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-[#0a0a0c] sm:w-64 placeholder:text-white/30"
            />

            <button
              type="submit"
              disabled={hilResolving || !hilInput.trim()}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {hilResolving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Token...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Solve &amp; Resume Agent</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* The 6 Statutory Verification Checks (Full 6-Check Pipeline) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DIMENSIONS.map((dim) => {
          const Icon = dim.icon;
          const { status, score, maxScore } = getDimensionState(dim.type);

          const isPassed = status === 'passed';
          const isFlagged = status === 'flagged';
          const isScanning = status === 'scanning';

          return (
            <div
              key={dim.type}
              className={`glass-card rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                isPassed
                  ? 'border-emerald-500/30 bg-emerald-950/15 shadow-subtle'
                  : isFlagged
                  ? 'border-rose-500/30 bg-rose-950/15 shadow-subtle'
                  : isScanning
                  ? 'border-cyan-500/40 bg-cyan-950/20 ring-1 ring-cyan-500/20 shadow-premium'
                  : 'border-white/[0.08] bg-[#0d0d0e]/90 shadow-subtle'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPassed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isFlagged
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : isScanning
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse'
                          : 'bg-white/[0.05] text-white/50 border border-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                        {dim.category}
                      </span>
                      <h3 className="text-sm font-semibold text-white tracking-tight">
                        {dim.title}
                      </h3>
                    </div>
                  </div>

                  <div>
                    {status === 'queued' && (
                      <span className="text-[11px] font-mono text-white/40 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                        Queued
                      </span>
                    )}
                    {isScanning && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-mono font-medium text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                        <span>Probing</span>
                      </span>
                    )}
                    {isPassed && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-mono font-medium text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Verified</span>
                      </span>
                    )}
                    {isFlagged && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-mono font-medium text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>Flagged</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs text-white/60 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center space-x-1.5 font-mono text-[10.5px] text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">Target: {dim.targetPortal}</span>
                  </div>
                  {dim.checksDetail.map((bullet, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-white/50 leading-tight font-light">
                      <div className="w-1 h-1 rounded-full bg-white/30 mt-1.5 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-Score Weight Tag */}
              <div className="mt-4 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                <span className="text-white/40">Weight Cap:</span>
                <span className="font-semibold text-white">
                  {score !== null ? (
                    <span className={isPassed ? 'text-emerald-400' : isFlagged ? 'text-rose-400' : 'text-white'}>
                      {score}/{maxScore} pts
                    </span>
                  ) : (
                    <span>{maxScore} pts max</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Multi-Agent Terminal Log */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08] bg-[#070709] text-white/90 font-mono shadow-[0_8px_32px_rgba(0,0,0,0.9)]">
        <div className="bg-[#0d0d0e] px-5 py-3.5 flex items-center justify-between border-b border-white/[0.08] text-xs">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white tracking-wider">Live Autonomous Web Agent Stream</span>
          </div>
          <span className="text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
            ● 6 PARALLEL WORKERS ACTIVE
          </span>
        </div>

        <div className="p-5 space-y-2.5 text-xs max-h-72 overflow-y-auto">
          {logs.map((log, index) => {
            const sourceColor =
              log.source === 'RERA_AGENT'
                ? 'text-cyan-400'
                : log.source === 'CLAIM_AGENT'
                ? 'text-amber-400'
                : log.source === 'PROMOTER_AGENT'
                ? 'text-indigo-400'
                : log.source === 'COURT_AGENT'
                ? 'text-purple-400'
                : log.source === 'APPROVALS_AGENT'
                ? 'text-emerald-400'
                : log.source === 'REPUTATION_AGENT'
                ? 'text-pink-400'
                : 'text-emerald-300';

            return (
              <div key={index} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-white/40 shrink-0 font-mono">[{log.time}]</span>
                <span className={`font-semibold shrink-0 font-mono ${sourceColor}`}>
                  [{log.source}]:
                </span>
                <span
                  className={
                    log.status === 'success'
                      ? 'text-emerald-300'
                      : log.status === 'warn'
                      ? 'text-amber-300'
                      : log.status === 'error'
                      ? 'text-rose-400'
                      : 'text-white/80'
                  }
                >
                  {log.message}
                </span>
              </div>
            );
          })}
          {!isCompleted && (
            <div className="flex items-center space-x-2 text-white/40 pt-1 font-mono text-[11px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Agents parsing statutory regulatory responses...</span>
            </div>
          )}
        </div>
      </div>

      {/* Transition to Screen 3 Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div className="text-xs text-white/50 flex items-center space-x-1.5 font-light">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Every check is backed by immutable source citations, official screenshots, and portal timestamps.</span>
        </div>

        <button
          onClick={handleProceedToReport}
          className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-[0_0_24px_-2px_rgba(16,185,129,0.35)] transition-all duration-150 active:scale-[0.98] ${
            isCompleted
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
              : 'bg-[#121214] hover:bg-[#1a1a1e] text-white border border-white/10'
          }`}
        >
          <span>{isCompleted ? 'View Verified Trust Report' : 'Review Live Findings'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ProgressScreen() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center text-white/40 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
          Initializing verification pipeline...
        </div>
      }
    >
      <ProgressScreenContent />
    </Suspense>
  );
}
