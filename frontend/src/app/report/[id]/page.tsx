'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  VerificationReport,
  CheckType,
  CheckResult,
} from '@/lib/types';
import { getReport, resolveHITL, WORKER_URL } from '@/lib/api';
import TrustGauge from '@/components/TrustGauge';
import ProgressRail from '@/components/ProgressRail';
import EvidenceCard from '@/components/EvidenceCard';
import {
  Building2,
  Scale,
  Download,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  FileCheck2,
  UserCheck,
  CheckCircle,
  MessageSquareWarning,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CheckType>('rera_status');
  const [hitlActive, setHitlActive] = useState(false);
  const [hitlResolved, setHitlResolved] = useState(false);

  useEffect(() => {
    let interval: any = null;

    async function fetchStatus() {
      try {
        const data = await getReport(reportId);
        setReport(data);
        setLoading(false);

        // If completed or failed, stop polling
        if (data.status === 'completed' || data.status === 'failed') {
          if (interval) clearInterval(interval);
        }
      } catch (err: any) {
        console.warn('Polling report failed:', err);
      }
    }

    fetchStatus();
    interval = setInterval(fetchStatus, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reportId]);

  const handleResolveHITL = async () => {
    try {
      await resolveHITL(reportId, 'rera_status', { manual_verified: true });
      setHitlResolved(true);
      setTimeout(() => setHitlActive(false), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportPDF = () => {
    try {
      const pdfEndpoint = `${WORKER_URL}/api/v1/report/${reportId}/pdf`;
      window.open(pdfEndpoint, '_blank');
    } catch {
      window.print();
    }
  };

  if (loading && !report) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm border border-brand-200">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
        <p className="text-sm font-semibold text-slate-700 tracking-tight">
          Retrieving agentic verification dossier...
        </p>
        <span className="text-xs text-slate-400 font-mono">Dossier: {reportId}</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto my-20 p-8 glass-card rounded-2xl text-center space-y-5 border border-slate-200/80 shadow-premium">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Verification Report Unavailable
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          {error || 'Could not retrieve report data from the autonomous worker.'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-subtle"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Property Search</span>
        </button>
      </div>
    );
  }

  const isCompleted = report.status === 'completed';
  const propDetails = report.property_details || {};
  const currentCheck = report.checks?.find((c) => c.check_type === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      {/* 3-Step Journey Navigation Breadcrumb */}
      <div className="flex items-center justify-center text-xs font-semibold">
        <div className="inline-flex items-center space-x-1 sm:space-x-2 p-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-subtle">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-all font-medium"
          >
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold">
              1
            </span>
            <span className="hidden sm:inline">Input Listing</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

          <button
            onClick={() => router.push(`/progress/${reportId}`)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-all font-medium"
          >
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold">
              2
            </span>
            <span className="hidden sm:inline">Live Due Diligence</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

          <div className="flex items-center space-x-1.5 text-brand-700 font-bold bg-white px-3.5 py-1 rounded-full border border-brand-200/80 shadow-subtle">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>3. Verified Trust Report</span>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Input Another Listing</span>
        </button>

        <div className="flex items-center space-x-2.5">
          {/* HITL Demo Trigger Button */}
          <button
            onClick={() => setHitlActive(!hitlActive)}
            className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 text-xs font-bold transition-all active:scale-[0.98] shadow-subtle flex items-center space-x-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{hitlActive ? 'Hide HITL Challenge' : 'Simulate Captcha (HITL)'}</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs font-bold shadow-subtle hover:shadow-premium transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Legal Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {/* Human-in-the-Loop Challenge Banner */}
      {hitlActive && (
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-5 shadow-premium animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-amber-200/80 text-amber-900 shrink-0 ring-1 ring-amber-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 tracking-tight">
                  Human-in-the-Loop Required — Regulatory Bot Defense Detected
                </h4>
                <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed max-w-2xl">
                  State RERA portal presented a Cloudflare verification challenge. The autonomous worker safely paused execution and surfaced this challenge for human resolution.
                </p>
              </div>
            </div>

            <button
              onClick={handleResolveHITL}
              disabled={hitlResolved}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-subtle transition-all shrink-0 disabled:opacity-50"
            >
              {hitlResolved ? 'Challenge Solved! Resuming...' : 'Simulate Captcha Solution & Resume'}
            </button>
          </div>
        </div>
      )}

      {/* Target Property Executive Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-premium">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>{propDetails.city || 'Pune'}, {propDetails.state || 'Maharashtra'}</span>
              <span>•</span>
              <span className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 font-mono">
                RERA: {propDetails.rera_id || 'P52100012345'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {propDetails.project_name || 'Sunshine Residency Baner'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600">
              Promoter & Developer:{' '}
              <strong className="text-slate-900 font-bold">
                {propDetails.promoter_name || 'Godrej Properties Limited'}
              </strong>
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 shrink-0">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${
                report.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-subtle'
                  : 'bg-brand-50 text-brand-800 border border-brand-200 animate-pulse'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{report.status.toUpperCase()}</span>
            </span>
            <div className="text-[11px] text-slate-400 mt-1.5 font-mono">
              Dossier ID: <span className="text-slate-600 font-bold">{report.report_id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Progress Rail */}
      <ProgressRail checks={report.checks || []} overallStatus={report.status} />

      {/* Trust Gauge & Executive Summary (When Completed) */}
      {isCompleted && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Deterministic Trust Gauge */}
            <div className="lg:col-span-5">
              <TrustGauge
                score={report.trust_score || 0}
                label={report.trust_label || 'High Trust'}
                dimensionScores={report.breakdown?.dimension_scores}
                maxDimensionScores={report.breakdown?.max_dimension_scores}
              />
            </div>

            {/* Right Column: Executive Summary & Highlights */}
            <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-premium flex flex-col justify-between">
              <div>
                {/* Header & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Executive Assessment
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                      Plain-Language Due-Diligence Summary
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200/80 self-start sm:self-auto">
                    Deterministic Math + LLM Plain Synthesis
                  </span>
                </div>

                {/* Synthesis Verdict */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal mb-5">
                  {report.summary?.verdict || 'Verification concluded successfully.'}
                </div>

                {/* Key Findings List with Styled Regulatory Chips */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Statutory Findings & Disclosures
                  </div>

                  <ul className="space-y-2">
                    {report.summary?.highlights?.map((h, i) => {
                      // Check whether item is positive or penalty
                      const isWarning =
                        h.includes('pending') ||
                        h.includes('Minor') ||
                        h.includes('delay') ||
                        h.includes('discrepancy') ||
                        h.includes('⚠️') ||
                        h.includes('-4') ||
                        h.includes('pts');

                      const cleanText = h.replace(/^[✓⚠️•-]\s*/, '');

                      // Extract points penalty if present
                      const ptsMatch = cleanText.match(/\((-\d+\s*pts)\)/);
                      const displayPts = ptsMatch ? ptsMatch[1] : null;
                      const textWithoutPts = ptsMatch
                        ? cleanText.replace(/\((-\d+\s*pts)\)/, '').trim()
                        : cleanText;

                      return (
                        <li
                          key={i}
                          className={`flex items-start justify-between p-3 rounded-xl border text-xs transition-colors ${
                            isWarning
                              ? 'bg-amber-50/50 border-amber-200/80 text-amber-950'
                              : 'bg-emerald-50/30 border-emerald-200/60 text-slate-800'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <span className="mt-0.5 shrink-0">
                              {isWarning ? (
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )}
                            </span>
                            <span className="leading-relaxed font-medium">{textWithoutPts}</span>
                          </div>

                          {displayPts && (
                            <span className="ml-3 shrink-0 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              {displayPts}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

                {/* Recommended Buyer Next Steps */}
                {report.summary?.action_items && report.summary.action_items.length > 0 && (
                  <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white shadow-subtle border border-slate-800">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-400 mb-1.5 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Recommended Buyer Next Steps</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {report.summary.action_items.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-brand-400 font-bold">→</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>

          {/* Deductions Audit Drawer */}
          {report.breakdown?.deductions && report.breakdown.deductions.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-rose-200/80 bg-rose-50/20 shadow-premium">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-4 flex items-center space-x-2 font-mono">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Auditable Mathematical Score Deductions ({report.breakdown.deductions.length})</span>
              </h4>
              <div className="space-y-2.5">
                {report.breakdown.deductions.map((d, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white border border-rose-200/80 text-xs shadow-subtle gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-rose-950 font-mono bg-rose-100/70 px-2 py-0.5 rounded border border-rose-200">
                        [{d.rule}]
                      </span>
                      <span className="text-slate-800 font-medium">{d.reason}</span>
                    </div>
                    <span className="font-bold font-mono text-rose-600 sm:ml-4 shrink-0 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      -{d.points_deducted} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6-Dimension Deep Dive & Evidence Inspector */}
          <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-premium">
            <div className="pb-3 border-b border-slate-100 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Regulatory Cross-Examination
              </span>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                Statutory Evidence & Regulatory Record Inspector
              </h3>
            </div>

            {/* Tab Bar: 6 Dimensions */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 mb-6">
              {[
                { type: 'rera_status', label: '1. RERA Disclosures (30 pts)', icon: <Building2 className="w-4 h-4" /> },
                { type: 'claim_match', label: '2. Claim Match (20 pts)', icon: <FileCheck2 className="w-4 h-4" /> },
                { type: 'court_signals', label: '3. Litigation Records (20 pts)', icon: <Scale className="w-4 h-4" /> },
                { type: 'promoter_record', label: '4. Promoter Record (10 pts)', icon: <UserCheck className="w-4 h-4" /> },
                { type: 'approvals', label: '5. Statutory Approvals (10 pts)', icon: <CheckCircle className="w-4 h-4" /> },
                { type: 'reputation', label: '6. Buyer Sentiment (10 pts)', icon: <MessageSquareWarning className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type as CheckType)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
                    activeTab === tab.type
                      ? 'bg-brand-600 text-white shadow-subtle'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Selected Tab Content */}
            {currentCheck ? (
              <div className="space-y-6">
                {/* Findings List */}
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-4.5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                      Automated Verification Findings:
                    </span>
                    <span className="text-xs font-bold font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      Score Contribution: {currentCheck.score_contribution} / {currentCheck.max_score} pts
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {currentCheck.findings.map((f, i) => (
                      <li key={i} className="flex items-start space-x-2.5">
                        <span className="text-brand-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary Evidence Cards */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3.5 font-mono">
                    Captured Primary Evidence Proofs ({currentCheck.evidence?.length || 0}):
                  </h4>
                  <div className="space-y-3">
                    {currentCheck.evidence && currentCheck.evidence.length > 0 ? (
                      currentCheck.evidence.map((ev, idx) => (
                        <EvidenceCard key={idx} evidence={ev} />
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No secondary documents attached.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Select a check tab to inspect captured evidence.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
