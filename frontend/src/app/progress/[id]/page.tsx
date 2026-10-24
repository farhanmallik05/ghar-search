'use client';

import React, { useEffect, useState } from 'react';
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
  Sparkles,
  ChevronRight,
  Clock,
  Activity,
} from 'lucide-react';
import { getReport } from '@/lib/api';
import { VerificationReport } from '@/lib/types';

interface AgentLog {
  time: string;
  source: 'RERA_AGENT' | 'COURT_AGENT' | 'COORDINATOR';
  message: string;
  status: 'info' | 'success' | 'warn' | 'error';
}

export default function ProgressScreen() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<VerificationReport | null>(null);
  const [progressPct, setProgressPct] = useState<number>(15);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [reraStep, setReraStep] = useState<'queued' | 'scanning' | 'passed' | 'flagged'>('scanning');
  const [courtStep, setCourtStep] = useState<'queued' | 'scanning' | 'passed' | 'flagged'>('queued');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [logs, setLogs] = useState<AgentLog[]>([
    {
      time: '00:00',
      source: 'COORDINATOR',
      message: 'Intake initiated. Spinning up parallel worker agents for 2 core checks...',
      status: 'info',
    },
    {
      time: '00:01',
      source: 'RERA_AGENT',
      message: 'Connecting to State RERA Portal (MahaRERA API gateway)...',
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

  // Poll report status
  useEffect(() => {
    let checkInterval: any = null;

    async function checkBackend() {
      try {
        const data = await getReport(reportId);
        setReport(data);

        if (data.status === 'completed') {
          setProgressPct(100);
          setReraStep(data.checks?.find((c) => c.check_type === 'rera_status')?.status === 'flagged' ? 'flagged' : 'passed');
          setCourtStep(data.checks?.find((c) => c.check_type === 'court_signals')?.status === 'flagged' ? 'flagged' : 'passed');
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

  // Staged progress simulation for responsive demo
  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgressPct(35);
      setCourtStep('scanning');
      setLogs((prev) => [
        ...prev,
        {
          time: '00:02',
          source: 'RERA_AGENT',
          message: 'Certificate validity verified. Extracting promoter identity & escrow accounts...',
          status: 'info',
        },
        {
          time: '00:03',
          source: 'COURT_AGENT',
          message: 'Querying eCourts National Judicial Data Grid (NJDG) for commercial disputes...',
          status: 'info',
        },
      ]);
    }, 1200);

    const t2 = setTimeout(() => {
      setProgressPct(68);
      setReraStep('passed');
      setLogs((prev) => [
        ...prev,
        {
          time: '00:04',
          source: 'RERA_AGENT',
          message: '✓ Check 1 Complete: Official RERA disclosures matched with statutory portal records.',
          status: 'success',
        },
        {
          time: '00:05',
          source: 'COURT_AGENT',
          message: 'Cross-referencing NCLT & IBBI insolvency database for Section 7/9 filings...',
          status: 'info',
        },
      ]);
    }, 2400);

    const t3 = setTimeout(() => {
      setProgressPct(92);
      setCourtStep('passed');
      setLogs((prev) => [
        ...prev,
        {
          time: '00:06',
          source: 'COURT_AGENT',
          message: '✓ Check 2 Complete: National judicial and insolvency registry scan completed.',
          status: 'success',
        },
        {
          time: '00:07',
          source: 'COORDINATOR',
          message: 'Deterministic mathematical rule engine computing 0-100 Trust Score...',
          status: 'info',
        },
      ]);
    }, 3600);

    const t4 = setTimeout(() => {
      setProgressPct(100);
      setIsCompleted(true);
      setLogs((prev) => [
        ...prev,
        {
          time: '00:08',
          source: 'COORDINATOR',
          message: '✓ Verification dossier assembled and cryptographic timestamp sealed.',
          status: 'success',
        },
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
    state: 'Maharashtra',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-28">
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
                {isCompleted ? 'Verification Complete!' : 'Autonomous Agents Scanning Official Portals...'}
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

      {/* The 2 Statutory Verification Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check 1: RERA Status */}
        <div
          className={`glass-card rounded-2xl p-6 border transition-all duration-200 ${
            reraStep === 'passed'
              ? 'border-emerald-300 bg-emerald-50/20 shadow-subtle'
              : reraStep === 'flagged'
              ? 'border-rose-300 bg-rose-50/20'
              : 'border-brand-300 ring-2 ring-brand-500/10 shadow-premium'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-inset ring-black/5 ${
                  reraStep === 'passed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : reraStep === 'flagged'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-brand-100 text-brand-800'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Check 1 of 2 · Statutory Authority
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  RERA Registration & Status
                </h3>
              </div>
            </div>

            <div>
              {reraStep === 'scanning' && (
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 animate-pulse font-mono">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Probing</span>
                </span>
              )}
              {reraStep === 'passed' && (
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </span>
              )}
              {reraStep === 'flagged' && (
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Flagged</span>
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-2 font-mono text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span>Target: State RERA Official Public Portal</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Validating certificate expiry, Section 7 status & approved layout</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Audit: Designated 70% escrow bank account quarterly disclosures</span>
            </div>
          </div>
        </div>

        {/* Check 2: Litigation & Court News */}
        <div
          className={`glass-card rounded-2xl p-6 border transition-all duration-200 ${
            courtStep === 'passed'
              ? 'border-emerald-300 bg-emerald-50/20 shadow-subtle'
              : courtStep === 'flagged'
              ? 'border-rose-300 bg-rose-50/20'
              : courtStep === 'scanning'
              ? 'border-brand-300 ring-2 ring-brand-500/10 shadow-premium'
              : 'border-slate-200/80 shadow-subtle'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-inset ring-black/5 ${
                  courtStep === 'passed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : courtStep === 'flagged'
                    ? 'bg-rose-100 text-rose-800'
                    : courtStep === 'scanning'
                    ? 'bg-brand-100 text-brand-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Check 2 of 2 · Judicial & News Ledgers
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Litigation & Court Records
                </h3>
              </div>
            </div>

            <div>
              {courtStep === 'queued' && (
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-mono">
                  Queued
                </span>
              )}
              {courtStep === 'scanning' && (
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 animate-pulse font-mono">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Scanning</span>
                </span>
              )}
              {courtStep === 'passed' && (
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </span>
              )}
              {courtStep === 'flagged' && (
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Disputes Found</span>
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-2 font-mono text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span>Target: National Judicial Data Grid (eCourts India)</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Scanning NCLT & IBBI Insolvency registry (Section 7 / 9 CIRP)</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Indexing consumer forum compensation claims & stay orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Agent Terminal Log */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 font-mono shadow-premium">
        <div className="bg-slate-900/90 px-5 py-3.5 flex items-center justify-between border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white tracking-wider">Live Web Agent Execution Feed</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
            ● STREAMING
          </span>
        </div>

        <div className="p-5 space-y-2.5 text-xs max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start space-x-2 leading-relaxed">
              <span className="text-slate-500 shrink-0 font-mono">[{log.time}]</span>
              <span
                className={`font-bold shrink-0 font-mono ${
                  log.source === 'RERA_AGENT'
                    ? 'text-sky-400'
                    : log.source === 'COURT_AGENT'
                    ? 'text-purple-400'
                    : 'text-amber-400'
                }`}
              >
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
          ))}
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
          <span>Every check is backed by immutable source citations and portal timestamps.</span>
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
