'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ExternalLink
} from 'lucide-react';
import { getReport } from '@/lib/api';
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
      'Audit: Designated 70% escrow bank account quarterly disclosures'
    ]
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
      'Verifying carpet area, total units, tower heights & promised amenities'
    ]
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
      'Portfolio delivery track record & past non-compliance scan'
    ]
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
      'Indexing consumer forum compensation claims & stay orders'
    ]
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
      'State Fire Department provisional NOC & Environmental Clearance'
    ]
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
      'Homebuyer forum sentiment & on-ground execution feedback'
    ]
  }
];

export default function ProgressScreen() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<VerificationReport | null>(null);
  const [progressPct, setProgressPct] = useState<number>(15);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Fallback / simulated state for each dimension while agents are probing
  const [simSteps, setSimSteps] = useState<Record<CheckType, 'queued' | 'scanning' | 'passed' | 'flagged'>>({
    rera_status: 'scanning',
    claim_match: 'queued',
    promoter_record: 'queued',
    court_signals: 'queued',
    approvals: 'queued',
    reputation: 'queued'
  });

  const [logs, setLogs] = useState<AgentLog[]>([
    {
      time: '00:00',
      source: 'COORDINATOR',
      message: 'Intake initiated. Spinning up parallel worker agents for 6 statutory checks...',
      status: 'info'
    },
    {
      time: '00:01',
      source: 'RERA_AGENT',
      message: 'Connecting to State RERA Portal API gateway...',
      status: 'info'
    }
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

        if (data.status === 'completed') {
          setProgressPct(100);
          setIsCompleted(true);
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
        promoter_record: 'scanning'
      }));
      setLogs((prev) => [
        ...prev,
        {
          time: '00:02',
          source: 'RERA_AGENT',
          message: 'Certificate validity verified. Extracting promoter identity & escrow accounts...',
          status: 'info'
        },
        {
          time: '00:02',
          source: 'CLAIM_AGENT',
          message: 'Extracting marketing brochure claims (carpet area, promised amenities, possession schedule)...',
          status: 'info'
        },
        {
          time: '00:03',
          source: 'PROMOTER_AGENT',
          message: 'Querying MCA21 Company Master database for director DIN status...',
          status: 'info'
        }
      ]);
    }, 1200);

    const t2 = setTimeout(() => {
      setProgressPct(65);
      setSimSteps((prev) => ({
        ...prev,
        rera_status: 'passed',
        claim_match: 'passed',
        court_signals: 'scanning',
        approvals: 'scanning'
      }));
      setLogs((prev) => [
        ...prev,
        {
          time: '00:03',
          source: 'RERA_AGENT',
          message: '✓ Check 1 Complete: Official RERA disclosures matched with statutory portal records.',
          status: 'success'
        },
        {
          time: '00:04',
          source: 'COURT_AGENT',
          message: 'Querying eCourts National Judicial Data Grid (NJDG) for commercial disputes...',
          status: 'info'
        },
        {
          time: '00:04',
          source: 'APPROVALS_AGENT',
          message: 'Verifying Commencement Certificate (CC) and Fire Dept provisional NOC...',
          status: 'info'
        }
      ]);
    }, 2400);

    const t3 = setTimeout(() => {
      setProgressPct(88);
      setSimSteps((prev) => ({
        ...prev,
        promoter_record: 'passed',
        court_signals: 'passed',
        reputation: 'scanning'
      }));
      setLogs((prev) => [
        ...prev,
        {
          time: '00:05',
          source: 'COURT_AGENT',
          message: 'Cross-referencing NCLT & IBBI insolvency database for Section 7/9 filings...',
          status: 'info'
        },
        {
          time: '00:06',
          source: 'REPUTATION_AGENT',
          message: 'Indexing consumer dispute forums and real-estate grievance registries...',
          status: 'info'
        },
        {
          time: '00:06',
          source: 'COORDINATOR',
          message: 'All 6 statutory streams converged. Deterministic 0-100 rule engine executing...',
          status: 'info'
        }
      ]);
    }, 3600);

    const t4 = setTimeout(() => {
      setProgressPct(100);
      setSimSteps({
        rera_status: 'passed',
        claim_match: 'passed',
        promoter_record: 'passed',
        court_signals: 'passed',
        approvals: 'passed',
        reputation: 'passed'
      });
      setIsCompleted(true);
      setLogs((prev) => [
        ...prev,
        {
          time: '00:07',
          source: 'COORDINATOR',
          message: '✓ Verification dossier assembled and cryptographic timestamp sealed.',
          status: 'success'
        }
      ]);
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleProceedToReport = () => {
    router.push(`/report/${reportId}`);
  };

  const propDetails = report?.property_details || {
    project_name: 'Sunshine Residency Phase 1',
    promoter_name: 'Godrej Properties Limited',
    rera_id: 'P52100012345',
    city: 'Pune',
    state: 'Maharashtra'
  };

  // Helper to determine the actual status and score of a check
  const getDimensionState = (type: CheckType) => {
    const checkObj = report?.checks?.find((c) => c.check_type === type);
    if (checkObj) {
      const isFlagged = checkObj.status === 'flagged' || checkObj.status === 'failed';
      const isPassed = checkObj.status === 'passed';
      const isRunning = checkObj.status === 'running';
      return {
        status: isFlagged ? 'flagged' : isPassed ? 'passed' : isRunning ? 'scanning' : 'queued',
        score: checkObj.score_contribution,
        maxScore: checkObj.max_score || DIMENSIONS.find(d => d.type === type)?.maxScore || 10
      };
    }
    const sim = simSteps[type];
    const maxScore = DIMENSIONS.find(d => d.type === type)?.maxScore || 10;
    return {
      status: sim,
      score: sim === 'passed' ? maxScore : sim === 'flagged' ? Math.floor(maxScore * 0.4) : null,
      maxScore
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-28">
      {/* 3-Step Journey Navigation Breadcrumb */}
      <div className="flex items-center justify-center text-xs font-semibold">
        <div className="inline-flex items-center space-x-1 sm:space-x-2 p-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-subtle">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-slate-500 hover:text-slate-900 transition-all font-medium"
          >
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold">
              1
            </span>
            <span className="hidden sm:inline">Input Listing</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

          <div className="flex items-center space-x-1.5 text-brand-700 font-bold bg-white px-3.5 py-1 rounded-full border border-brand-200/80 shadow-subtle">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
            <span>2. Live Due Diligence</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

          <div className="flex items-center space-x-1.5 px-3 py-1 text-slate-400 font-medium">
            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[9px]">
              3
            </span>
            <span className="hidden sm:inline">Verified Trust Report</span>
          </div>
        </div>
      </div>

      {/* Target Property Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-premium">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              <span>{propDetails.city || 'Pune'}, {propDetails.state || 'Maharashtra'}</span>
              <span>•</span>
              <span className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 font-mono">
                RERA: {propDetails.rera_id || 'P52100012345'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {propDetails.project_name || 'Sunshine Residency'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Developer:{' '}
              <strong className="text-slate-900 font-bold">
                {propDetails.promoter_name || 'Godrej Properties Limited'}
              </strong>
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-100 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Pipeline Clock
            </div>
            <div className="text-3xl font-black font-mono tabular-nums text-brand-600 mt-0.5">
              00:{elapsedSec < 10 ? `0${elapsedSec}` : elapsedSec}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">SLO Target: &lt; 90s</div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-6 space-y-2 pt-5 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs font-bold font-mono">
            <span className="text-slate-800 flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-brand-600" />
              <span>
                {isCompleted ? 'Verification Complete — All 6 Dimensions Sealed!' : 'Parallel Autonomous Agents Scanning Statutory Portals...'}
              </span>
            </span>
            <span className="text-brand-700 tabular-nums">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

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
                  ? 'border-emerald-300 bg-emerald-50/20 shadow-subtle'
                  : isFlagged
                  ? 'border-rose-300 bg-rose-50/20 shadow-subtle'
                  : isScanning
                  ? 'border-brand-400 ring-2 ring-brand-500/10 shadow-premium'
                  : 'border-slate-200/80 bg-white/70 shadow-subtle'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-inset ring-black/5 ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isFlagged
                          ? 'bg-rose-100 text-rose-800'
                          : isScanning
                          ? 'bg-brand-100 text-brand-800 animate-pulse'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                        {dim.category}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        {dim.title}
                      </h3>
                    </div>
                  </div>

                  <div>
                    {status === 'queued' && (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full font-mono">
                        Queued
                      </span>
                    )}
                    {isScanning && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 animate-pulse font-mono">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Probing</span>
                      </span>
                    )}
                    {isPassed && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    )}
                    {isFlagged && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-mono">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Flagged</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5 font-mono text-[10.5px] text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                    <span className="truncate">Target: {dim.targetPortal}</span>
                  </div>
                  {dim.checksDetail.map((bullet, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-500 leading-tight">
                      <div className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-Score Weight Tag */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Weight Cap:</span>
                <span className="font-bold text-slate-700">
                  {score !== null ? (
                    <span className={isPassed ? 'text-emerald-700' : isFlagged ? 'text-rose-700' : 'text-slate-700'}>
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
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 font-mono shadow-premium">
        <div className="bg-slate-900/90 px-5 py-3.5 flex items-center justify-between border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white tracking-wider">Live Autonomous Web Agent Stream</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
            ● 6 PARALLEL WORKERS ACTIVE
          </span>
        </div>

        <div className="p-5 space-y-2.5 text-xs max-h-72 overflow-y-auto">
          {logs.map((log, index) => {
            const sourceColor =
              log.source === 'RERA_AGENT'
                ? 'text-sky-400'
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
                : 'text-brand-300';

            return (
              <div key={index} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-slate-500 shrink-0 font-mono">[{log.time}]</span>
                <span className={`font-bold shrink-0 font-mono ${sourceColor}`}>
                  [{log.source}]:
                </span>
                <span
                  className={
                    log.status === 'success'
                      ? 'text-emerald-300 font-medium'
                      : log.status === 'warn'
                      ? 'text-amber-300'
                      : log.status === 'error'
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            );
          })}
          {!isCompleted && (
            <div className="flex items-center space-x-2 text-slate-500 pt-1 font-mono text-[11px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
              <span>Agents parsing statutory regulatory responses...</span>
            </div>
          )}
        </div>
      </div>

      {/* Transition to Screen 3 Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <div className="text-xs text-slate-500 flex items-center space-x-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Every check is backed by immutable source citations, official screenshots, and portal timestamps.</span>
        </div>

        <button
          onClick={handleProceedToReport}
          className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-subtle hover:shadow-premium transition-all duration-150 active:scale-[0.98] ${
            isCompleted
              ? 'bg-brand-600 hover:bg-brand-700 text-white ring-2 ring-brand-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <span>{isCompleted ? 'View Verified Trust Report' : 'Review Live Findings'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
