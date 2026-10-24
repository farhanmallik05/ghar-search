'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  VerificationReport,
  CheckType,
  CheckResult,
} from '@/lib/types';
import { getReport, addToWatchlist, resolveHITL } from '@/lib/api';
import TrustGauge from '@/components/TrustGauge';
import ProgressRail from '@/components/ProgressRail';
import EvidenceCard from '@/components/EvidenceCard';
import {
  Building2,
  FileCheck2,
  Scale,
  UserCheck,
  CheckCircle,
  MessageSquareWarning,
  BookmarkPlus,
  Download,
  Share2,
  AlertCircle,
  Clock,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CheckType>('rera_status');
  const [watchlistSaved, setWatchlistSaved] = useState(false);
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
        // If not found yet, keep waiting
      }
    }

    fetchStatus();
    // Poll every 1s while in progress
    interval = setInterval(fetchStatus, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reportId]);

  const handleAddToWatchlist = async () => {
    try {
      await addToWatchlist(reportId);
      setWatchlistSaved(true);
      setTimeout(() => setWatchlistSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

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
    window.print();
  };

  if (loading && !report) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Connecting to agentic verification pipeline...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto my-20 p-8 glass-card rounded-2xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Verification Report Unavailable</h2>
        <p className="text-xs text-slate-600">{error || 'Could not retrieve report data.'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const isCompleted = report.status === 'completed';
  const propDetails = report.property_details || {};
  const currentCheck = report.checks?.find((c) => c.check_type === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Back button and quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Property Search</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* HITL Demo Trigger */}
          <button
            onClick={() => setHitlActive(!hitlActive)}
            className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            {hitlActive ? 'Hide HITL Challenge' : 'Simulate Captcha (HITL)'}
          </button>

          <button
            onClick={handleAddToWatchlist}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              watchlistSaved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {watchlistSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Added to Watchlist</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 text-slate-500" />
                <span>Save to Watchlist</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all shadow-brand-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {/* Human-in-the-Loop Challenge Banner (Requirement 1.3 / Section 3.3) */}
      {hitlActive && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-md animate-in slide-in-from-top">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Human-in-the-Loop Required — Regulatory Bot Defense Detected
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  State RERA portal presented a Cloudflare CAPTCHA challenge. The autonomous worker paused execution and surfaced this challenge.
                </p>
              </div>
            </div>

            <button
              onClick={handleResolveHITL}
              disabled={hitlResolved}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-all shrink-0 disabled:opacity-50"
            >
              {hitlResolved ? 'Challenge Solved! Resuming...' : 'Simulate Captcha Solution & Resume'}
            </button>
          </div>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span>{propDetails.city || 'Pune'}, {propDetails.state || 'Maharashtra'}</span>
              <span>•</span>
              <span className="text-brand-600 font-mono">RERA: {propDetails.rera_id || 'P52100012345'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {propDetails.project_name || 'Sunshine Residency Baner'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Developed by <strong className="text-slate-800">{propDetails.promoter_name || 'Godrej Properties Limited'}</strong>
            </p>
          </div>

          <div className="text-left md:text-right">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                report.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-brand-50 text-brand-700 border border-brand-200 animate-pulse'
              }`}
            >
              <span>{report.status.toUpperCase()}</span>
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              Dossier ID: <span className="font-mono">{report.report_id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Progress Rail (Visible while scanning or as audit history) */}
      <ProgressRail checks={report.checks || []} overallStatus={report.status} />

      {/* Trust Gauge & Executive Summary (When Completed) */}
      {isCompleted && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TrustGauge
                score={report.trust_score || 0}
                label={report.trust_label || 'High Trust'}
                dimensionScores={report.breakdown?.dimension_scores}
                maxDimensionScores={report.breakdown?.max_dimension_scores}
              />
            </div>

            {/* Executive Summary Card */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Plain-Language Due-Diligence Summary
                  </h3>
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                    Deterministic Math + LLM Plain Synthesis
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {report.summary?.verdict || 'Verification concluded successfully.'}
                </p>

                {/* Key Findings List */}
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Key Highlights & Disclosures:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {report.summary?.highlights?.map((h, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action recommendations */}
              {report.summary?.action_items && report.summary.action_items.length > 0 && (
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Recommended Buyer Next Steps:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {report.summary.action_items.map((item, idx) => (
                      <li key={idx}>→ {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Deductions Audit Drawer */}
          {report.breakdown?.deductions && report.breakdown.deductions.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-rose-200 bg-rose-50/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-3 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Auditable Score Deductions ({report.breakdown.deductions.length})</span>
              </h4>
              <div className="space-y-2">
                {report.breakdown.deductions.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-3 rounded-xl bg-white border border-rose-100 text-xs"
                  >
                    <div>
                      <span className="font-bold text-rose-900 font-mono">[{d.rule}]</span>{' '}
                      <span className="text-slate-700">{d.reason}</span>
                    </div>
                    <span className="font-bold text-rose-600 ml-4 shrink-0">
                      -{d.points_deducted} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6-Tab Deep Dive & Evidence Inspector */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              Comprehensive Evidence Inspector
            </h3>

            {/* Tab Bar */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6">
              {[
                { type: 'rera_status', label: '1. RERA Status', icon: <Building2 className="w-4 h-4" /> },
                { type: 'claim_match', label: '2. Claim Match', icon: <FileCheck2 className="w-4 h-4" /> },
                { type: 'court_signals', label: '3. Court Signals', icon: <Scale className="w-4 h-4" /> },
                { type: 'promoter_record', label: '4. Promoter Record', icon: <UserCheck className="w-4 h-4" /> },
                { type: 'approvals', label: '5. Approvals & NOCs', icon: <CheckCircle className="w-4 h-4" /> },
                { type: 'reputation', label: '6. Reputation', icon: <MessageSquareWarning className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type as CheckType)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.type
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
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
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Automated Verification Findings:
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Score Contribution: {currentCheck.score_contribution} / {currentCheck.max_score} pts
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {currentCheck.findings.map((f, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-brand-600 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary Evidence Cards */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
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
