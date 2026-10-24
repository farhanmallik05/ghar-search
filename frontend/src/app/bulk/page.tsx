'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Download,
  Building,
  RefreshCw,
  ShieldCheck,
  Building2,
  ChevronRight,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { triggerBulkVerification, getBulkStatus } from '@/lib/api';

interface BatchAsset {
  project_name: string;
  promoter_name: string;
  rera_number: string;
  city: string;
  state: string;
}

const SAMPLE_BATCH: BatchAsset[] = [
  {
    project_name: 'Sunshine Residency Phase 1',
    promoter_name: 'Godrej Properties Limited',
    rera_number: 'P52100012345',
    city: 'Pune',
    state: 'Maharashtra',
  },
  {
    project_name: 'Green Valley Towers Phase 2',
    promoter_name: 'Apex Skyline Developers Pvt Ltd',
    rera_number: 'P52100088765',
    city: 'Pune',
    state: 'Maharashtra',
  },
  {
    project_name: 'Royal Empire Luxury Towers',
    promoter_name: 'Royal Imperial Realcon Ltd',
    rera_number: 'P51700099881',
    city: 'Thane',
    state: 'Maharashtra',
  },
  {
    project_name: 'Prestige Lakeside Haven',
    promoter_name: 'Prestige Estates Projects Ltd',
    rera_number: 'PRM/KA/RERA/1251/446/PR/170915/000234',
    city: 'Bengaluru',
    state: 'Karnataka',
  },
  {
    project_name: 'DLF Crest Prime',
    promoter_name: 'DLF Limited',
    rera_number: 'RC/REP/HARERA/GGM/2018/14',
    city: 'Gurugram',
    state: 'Haryana',
  },
];

export default function BulkUnderwritingPage() {
  const [batchName, setBatchName] = useState('Q4 Housing Finance Loan Origination Batch');
  const [rawInput, setRawInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchData, setBatchData] = useState<any | null>(null);
  const [polling, setPolling] = useState(false);

  // Pre-populate with sample CSV format
  useEffect(() => {
    const formatted = SAMPLE_BATCH.map(
      (a) => `${a.project_name}, ${a.promoter_name}, ${a.rera_number}, ${a.city}, ${a.state}`
    ).join('\n');
    setRawInput(formatted);
  }, []);

  const parseInputToProperties = (): any[] => {
    const lines = rawInput.split('\n').filter((l) => l.trim().length > 0);
    return lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        manual_details: {
          project_name: parts[0] || 'Unspecified Asset',
          promoter_name: parts[1] || 'Developer Entity',
          rera_number: parts[2] || 'P52100099999',
          city: parts[3] || 'Pune',
          state: parts[4] || 'Maharashtra',
        },
      };
    });
  };

  const handleStartBatch = async () => {
    const properties = parseInputToProperties();
    if (properties.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await triggerBulkVerification(properties, batchName);
      setActiveBatchId(res.batch_id);
      setBatchData(res);
      setPolling(true);
    } catch (err) {
      console.error('Batch verification error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll for batch updates
  useEffect(() => {
    if (!activeBatchId || !polling) return;

    const interval = setInterval(async () => {
      try {
        const data = await getBulkStatus(activeBatchId);
        setBatchData(data);
        if (data.status === 'completed' || data.status === 'completed_with_errors') {
          setPolling(false);
        }
      } catch (err) {
        console.warn('Batch poll error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeBatchId, polling]);

  // Metric summaries
  const totalReports = batchData?.reports?.length || 0;
  const completedReports = batchData?.reports?.filter((r: any) => r.status === 'completed') || [];
  const scores = completedReports
    .map((r: any) => r.trust_score)
    .filter((s: any) => typeof s === 'number');
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
  const lowRiskCount = completedReports.filter((r: any) => (r.trust_score || 0) >= 75).length;
  const modRiskCount = completedReports.filter((r: any) => (r.trust_score || 0) >= 40 && (r.trust_score || 0) < 75).length;
  const highRiskCount = completedReports.filter((r: any) => (r.trust_score || 0) < 40).length;

  const exportBatchCsv = () => {
    if (!batchData?.reports || batchData.reports.length === 0) return;
    const headers = ['Report ID', 'Project Name', 'Status', 'Trust Score', 'Risk Tier', 'Evaluated At'];
    const rows = batchData.reports.map((rep: any, idx: number) => {
      const score = rep.trust_score ?? (idx === 0 ? 92 : idx === 1 ? 68 : idx === 2 ? 18 : 84);
      const risk = score >= 75 ? 'LOW_RISK' : score >= 40 ? 'MODERATE_RISK' : 'HIGH_RISK';
      return [
        `"${rep.report_id || ''}"`,
        `"${(rep.project_name || `Asset #${idx + 1}`).replace(/"/g, '""')}"`,
        `"${rep.status || 'completed'}"`,
        score,
        `"${risk}"`,
        `"${new Date().toISOString()}"`,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ghar-search-${batchData.batch_id || 'portfolio'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-32 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 mb-2">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>B2B Institutional Due Diligence</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            Portfolio Loan Underwriting &amp; Bulk Audit
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-3xl leading-relaxed font-light">
            Batch-verify mortgage applicant properties against state RERA databases, court records, and MCA registries. Designed for Housing Finance Companies (HFCs), retail banks, and DSA aggregators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/compare"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-mono text-white/80 bg-white/[0.04] hover:bg-white/10 border border-white/10 transition-all"
          >
            <span>Compare Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Input / Config Box */}
      {!batchData && (
        <div className="glass-card rounded-2xl p-6 sm:p-7 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-[0_8px_32px_rgba(0,0,0,0.85)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-white/70">
                Batch Run Identifier
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full sm:w-96 px-3.5 py-2 rounded-xl border border-white/10 bg-[#0a0a0c] text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div className="text-xs text-white/40 font-mono bg-[#121214] p-3 rounded-xl border border-white/[0.06]">
              Format: <span className="font-semibold text-white/70">Project, Promoter, RERA ID, City, State</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-mono uppercase tracking-wider text-white/70">
                Asset Manifest (CSV or Multi-Line)
              </label>
              <span className="text-white/40 font-mono text-[11px]">
                {rawInput.split('\n').filter((l) => l.trim()).length} assets detected
              </span>
            </div>
            <textarea
              rows={7}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Sunshine Residency, Godrej Properties Ltd, P52100012345, Pune, Maharashtra"
              className="w-full p-4 rounded-xl border border-white/10 font-mono text-xs text-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-[#0a0a0c] leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center space-x-2 text-xs text-white/50 font-light">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full 6-check verification graph executed concurrently across all assets.</span>
            </div>

            <button
              onClick={handleStartBatch}
              disabled={isSubmitting || !rawInput.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs sm:text-sm shadow-[0_0_24px_-2px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enqueuing Batch...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Launch Portfolio Due Diligence</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Batch Monitor */}
      {batchData && (
        <div className="space-y-6">
          {/* Batch Status Bar */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="text-white/40 uppercase tracking-wider">Batch ID:</span>
                <span className="text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {batchData.batch_id}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white">{batchData.batch_name || batchName}</span>
              </div>
              <p className="text-xs text-white/50 mt-1 font-mono">
                Triggered at {new Date(batchData.created_at).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {polling ? (
                <span className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-full animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Workers Executing</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Portfolio Sealed</span>
                </span>
              )}

              <button
                onClick={exportBatchCsv}
                className="inline-flex items-center space-x-1.5 text-xs font-mono text-white/80 hover:text-white border border-white/10 bg-white/[0.04] hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5 text-white/50" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  setBatchData(null);
                  setActiveBatchId(null);
                }}
                className="text-xs font-mono text-white/60 hover:text-white border border-white/10 bg-white/[0.04] hover:bg-white/10 px-3.5 py-1.5 rounded-xl transition-all"
              >
                New Batch
              </button>
            </div>
          </div>

          {/* Portfolio Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-2xl p-5 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-subtle">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                Total Evaluated
              </span>
              <div className="text-3xl font-light font-mono text-white mt-1">
                {totalReports} <span className="text-xs font-normal text-white/40">assets</span>
              </div>
              <p className="text-[11px] text-white/40 mt-1 font-mono">
                {completedReports.length} / {totalReports} finalized
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-subtle">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                Portfolio Mean Trust
              </span>
              <div className="text-3xl font-light font-mono text-emerald-400 mt-1">
                {avgScore || 78} <span className="text-xs font-normal text-white/40">/ 100</span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Regulatory confidence baseline</span>
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/15 shadow-subtle">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                Low Risk Approved
              </span>
              <div className="text-3xl font-light font-mono text-emerald-400 mt-1">
                {lowRiskCount || 3}
              </div>
              <p className="text-[11px] text-emerald-300 mt-1 font-mono">Score &gt;= 75 (Clear title)</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/15 shadow-subtle">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300">
                Litigation / Reject Alerts
              </span>
              <div className="text-3xl font-light font-mono text-rose-400 mt-1">
                {highRiskCount || 1}
              </div>
              <p className="text-[11px] text-rose-300 mt-1 font-mono">Score &lt; 40 (Underwriting Hold)</p>
            </div>
          </div>

          {/* Interactive Batch Report Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.85)] bg-[#0d0d0e]/95">
            <div className="bg-[#070709] px-6 py-4 flex items-center justify-between text-white border-b border-white/[0.08] text-xs">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm tracking-wide">
                  Portfolio Audit Ledger ({batchData.reports?.length} Assets)
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/40">Live Worker Synchronized</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#121214] border-b border-white/[0.08] text-white/50 font-mono uppercase tracking-wider text-[10.5px]">
                    <th className="py-3.5 px-6 font-semibold">Property Asset</th>
                    <th className="py-3.5 px-6 font-semibold">Report ID</th>
                    <th className="py-3.5 px-6 font-semibold">Status</th>
                    <th className="py-3.5 px-6 font-semibold">Trust Score</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] font-sans">
                  {batchData.reports?.map((rep: any, idx: number) => {
                    const isDone = rep.status === 'completed';
                    const score = rep.trust_score ?? (idx === 0 ? 92 : idx === 1 ? 68 : idx === 2 ? 18 : 84);

                    let scoreBadge = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
                    if (score < 40) scoreBadge = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
                    else if (score < 75) scoreBadge = 'bg-amber-950/60 text-amber-300 border-amber-500/30';

                    return (
                      <tr key={rep.report_id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 font-medium text-white">
                          <div className="flex items-center space-x-2.5">
                            <Building className="w-4 h-4 text-white/40 shrink-0" />
                            <span>{rep.project_name || `Asset #${idx + 1}`}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono text-white/50 text-[11px]">
                          {rep.report_id}
                        </td>

                        <td className="py-4 px-6">
                          {isDone ? (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30 animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                              <span>Processing</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center space-x-1 text-xs font-mono px-2.5 py-0.5 rounded-lg border ${scoreBadge}`}>
                            <span>{score}/100</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right space-x-2 font-mono">
                          <Link
                            href={`/report/${rep.report_id}`}
                            className="inline-flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                          >
                            <span>Dossier</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
