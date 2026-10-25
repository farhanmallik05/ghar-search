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
  Share2,
  Copy,
  Check,
  Printer,
  Award,
  Activity,
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
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintAudit = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  useEffect(() => {
    let interval: any = null;
    let failureCount = 0;

    async function fetchStatus() {
      try {
        const data = await getReport(reportId);
        setReport(data);
        setLoading(false);
        setError(null);

        // If completed or failed, stop polling
        if (data.status === 'completed' || data.status === 'failed') {
          if (interval) clearInterval(interval);
        }
      } catch (err: any) {
        console.warn('Polling report failed:', err);
        failureCount++;
        if (failureCount >= 3) {
          setError(err.message || `Could not retrieve report dossier for '${reportId}'.`);
          setLoading(false);
          if (interval) clearInterval(interval);
        }
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
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-white tracking-tight">
          Retrieving agentic verification dossier...
        </p>
        <span className="text-xs text-white/40 font-mono">Dossier: {reportId}</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto my-20 p-8 glass-card rounded-2xl text-center space-y-5 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Verification Report Unavailable
        </h2>
        <p className="text-xs text-white/60 leading-relaxed max-w-md mx-auto font-light">
          {error || 'Could not retrieve report data from the autonomous worker.'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-semibold transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)]"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28 relative">
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

          <button
            onClick={() => router.push(`/progress/${reportId}`)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-white/50 hover:text-white transition-all"
          >
            <span className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[9px] font-bold">
              2
            </span>
            <span className="hidden sm:inline">Live Due Diligence</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-white/20" />

          <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold bg-emerald-950/60 px-3.5 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Verified Trust Report</span>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Input Another Listing</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Share Permalink */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 active:scale-[0.98] text-white text-xs font-mono transition-all"
            title="Copy permalink to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-white/50" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Print Audit View */}
          <button
            onClick={handlePrintAudit}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 active:scale-[0.98] text-white text-xs font-mono transition-all"
            title="Print or save PDF audit view"
          >
            <Printer className="w-3.5 h-3.5 text-white/50" />
            <span>Print</span>
          </button>

          {/* HITL Demo Trigger Button */}
          <button
            onClick={() => setHitlActive(!hitlActive)}
            className="px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-950/70 text-amber-300 text-xs font-mono transition-all active:scale-[0.98] flex items-center space-x-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{hitlActive ? 'Hide HITL Challenge' : 'Simulate Captcha (HITL)'}</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black text-xs font-semibold shadow-[0_0_20px_-2px_rgba(16,185,129,0.35)] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Legal Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {/* Human-in-the-Loop Challenge Banner */}
      {hitlActive && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 shadow-premium animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white tracking-tight">
                  Human-in-the-Loop Required — Regulatory Bot Defense Detected
                </h4>
                <p className="text-xs text-white/60 mt-0.5 leading-relaxed max-w-2xl font-light">
                  State RERA portal presented an interactive bot defense verification challenge. The autonomous worker safely paused execution and surfaced this challenge for human verification.
                </p>
              </div>
            </div>

            <button
              onClick={handleResolveHITL}
              disabled={hitlResolved}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black text-xs font-semibold rounded-xl shadow-[0_0_16px_rgba(245,158,11,0.3)] transition-all shrink-0 disabled:opacity-50"
            >
              {hitlResolved ? 'Challenge Solved! Resuming...' : 'Simulate Captcha Solution & Resume'}
            </button>
          </div>
        </div>
      )}

      {/* Target Property Executive Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider">
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
              Promoter &amp; Developer:{' '}
              <strong className="text-white font-medium">
                {propDetails.promoter_name || 'Promoter Entity Under Audit'}
              </strong>
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.06] shrink-0">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider ${
                report.status === 'completed'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 animate-pulse'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{report.status.toUpperCase()}</span>
            </span>
            <div className="text-[11px] text-white/40 mt-1.5 font-mono">
              Dossier ID: <span className="text-white/80">{report.report_id}</span>
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
            <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-7 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-[0_8px_32px_rgba(0,0,0,0.85)] flex flex-col justify-between">
              <div>
                {/* Header & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-white/[0.06] gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                      Executive Assessment
                    </span>
                    <h3 className="font-semibold text-base text-white tracking-tight">
                      Plain-Language Due-Diligence Summary
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30 self-start sm:self-auto">
                    Deterministic Math + LLM Plain Synthesis
                  </span>
                </div>

                {/* Synthesis Verdict */}
                <div className="p-4 rounded-xl bg-[#121214] border border-white/[0.06] text-xs sm:text-sm text-white/80 leading-relaxed font-light mb-5">
                  {report.summary?.verdict || 'Verification concluded successfully.'}
                </div>

                {/* Key Findings List with Styled Regulatory Chips */}
                <div className="space-y-3">
                  <div className="text-[11px] font-mono text-white/60 uppercase tracking-wider">
                    Statutory Findings &amp; Disclosures
                  </div>

                  <ul className="space-y-2">
                    {report.summary?.highlights?.map((h, i) => {
                      const isWarning =
                        h.includes('pending') ||
                        h.includes('Minor') ||
                        h.includes('delay') ||
                        h.includes('discrepancy') ||
                        h.includes('⚠️') ||
                        h.includes('-4') ||
                        h.includes('pts');

                      const cleanText = h.replace(/^[✓⚠️•-]\s*/, '');
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
                              ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                              : 'bg-emerald-950/15 border-emerald-500/20 text-white/85'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <span className="mt-0.5 shrink-0">
                              {isWarning ? (
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                            </span>
                            <span className="leading-relaxed font-light">{textWithoutPts}</span>
                          </div>

                          {displayPts && (
                            <span className="ml-3 shrink-0 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-500/30">
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
                <div className="mt-6 p-4 rounded-xl bg-[#070709] border border-white/[0.08] shadow-subtle">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Recommended Buyer Next Steps</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-white/70 font-light">
                    {report.summary.action_items.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Statutory Risk Classification & Dimension Clearance */}
          {report.breakdown && (
            <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-[0_8px_32px_rgba(0,0,0,0.85)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-white/[0.06] gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      Statutory Risk Classification &amp; Dimension Clearance
                    </h4>
                    <p className="text-[11px] text-white/40 font-mono mt-0.5">
                      Deterministic mathematical attribution across 6 sovereign check dimensions
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  {report.breakdown.risk_category && (
                    <span className="px-2.5 py-1 rounded-md bg-[#121214] text-white border border-white/10 font-bold tracking-wider">
                      {report.breakdown.risk_category}
                    </span>
                  )}
                  {report.breakdown.peer_percentile_benchmark && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                      <Award className="w-3 h-3 text-emerald-400" />
                      <span>{report.breakdown.peer_percentile_benchmark}</span>
                    </span>
                  )}
                  {report.breakdown.statutory_compliance_rate !== undefined && (
                    <span className="px-2.5 py-1 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                      {report.breakdown.statutory_compliance_rate}% Clear
                    </span>
                  )}
                </div>
              </div>

              {/* Dimension Penalty Scorecard Grid */}
              {report.breakdown.penalty_summary && report.breakdown.penalty_summary.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {report.breakdown.penalty_summary.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-white/[0.06] bg-[#121214] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white/90 text-[11px] truncate">
                          {item.dimension_title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            item.severity === 'CLEAN'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                              : item.severity === 'LOW'
                              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                              : item.severity === 'MODERATE'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between font-mono text-[11px] text-white/50">
                        <span>Score Contribution</span>
                        <span className="font-bold text-white">
                          {item.points_awarded} / {item.max_points} pts
                        </span>
                      </div>

                      <div className="w-full bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.points_lost === 0
                              ? 'bg-emerald-400'
                              : item.percentage_loss >= 50
                              ? 'bg-rose-400'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${(item.points_awarded / item.max_points) * 100}%` }}
                        />
                      </div>

                      {item.primary_reason && (
                        <p className="text-[10px] text-white/40 leading-snug line-clamp-2 font-light">
                          {item.primary_reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Deductions Audit Drawer */}
          {report.breakdown?.deductions && report.breakdown.deductions.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-rose-500/30 bg-rose-950/20 shadow-premium">
              <h4 className="text-xs font-mono uppercase tracking-wider text-rose-300 mb-4 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Auditable Mathematical Score Deductions ({report.breakdown.deductions.length})</span>
              </h4>
              <div className="space-y-2.5">
                {report.breakdown.deductions.map((d, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#0d0d0e] border border-rose-500/30 text-xs shadow-subtle gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                        [{d.rule}]
                      </span>
                      <span className="text-white/85 font-light">{d.reason}</span>
                    </div>
                    <span className="font-mono text-rose-400 sm:ml-4 shrink-0 bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-500/30 font-semibold">
                      -{d.points_deducted} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6-Dimension Deep Dive & Evidence Inspector */}
          <div className="glass-card rounded-2xl p-6 sm:p-7 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
            <div className="pb-3 border-b border-white/[0.06] mb-5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                Regulatory Cross-Examination
              </span>
              <h3 className="font-semibold text-white text-base sm:text-lg tracking-tight">
                Statutory Evidence &amp; Regulatory Record Inspector
              </h3>
            </div>

            {/* Tab Bar: 6 Dimensions */}
            <div className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-3 mb-6">
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
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-150 active:scale-[0.98] ${
                    activeTab === tab.type
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
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
                <div className="bg-[#121214] border border-white/[0.06] rounded-xl p-4.5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-white/70">
                      Automated Verification Findings:
                    </span>
                    <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Score Contribution: {currentCheck.score_contribution} / {currentCheck.max_score} pts
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-white/80">
                    {currentCheck.findings.map((f, i) => (
                      <li key={i} className="flex items-start space-x-2.5">
                        <span className="text-emerald-400 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed font-light">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary Evidence Cards */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3.5">
                    Captured Primary Evidence Proofs ({currentCheck.evidence?.length || 0}):
                  </h4>
                  <div className="space-y-3">
                    {currentCheck.evidence && currentCheck.evidence.length > 0 ? (
                      currentCheck.evidence.map((ev, idx) => (
                        <EvidenceCard key={idx} evidence={ev} />
                      ))
                    ) : (
                      <p className="text-xs text-white/40 italic">No secondary documents attached.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40 italic">Select a check tab to inspect captured evidence.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
