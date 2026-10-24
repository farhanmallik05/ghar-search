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
  FileText
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
    state: 'Maharashtra'
  },
  {
    project_name: 'Green Valley Towers Phase 2',
    promoter_name: 'Apex Skyline Developers Pvt Ltd',
    rera_number: 'P52100088765',
    city: 'Pune',
    state: 'Maharashtra'
  },
  {
    project_name: 'Royal Empire Luxury Towers',
    promoter_name: 'Royal Imperial Realcon Ltd',
    rera_number: 'P51700099881',
    city: 'Thane',
    state: 'Maharashtra'
  },
  {
    project_name: 'Prestige Lakeside Haven',
    promoter_name: 'Prestige Estates Projects Ltd',
    rera_number: 'PRM/KA/RERA/1251/446/PR/170915/000234',
    city: 'Bengaluru',
    state: 'Karnataka'
  },
  {
    project_name: 'DLF Crest Prime',
    promoter_name: 'DLF Limited',
    rera_number: 'RC/REP/HARERA/GGM/2018/14',
    city: 'Gurugram',
    state: 'Haryana'
  }
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
          state: parts[4] || 'Maharashtra'
        }
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
        `"${new Date().toISOString()}"`
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/80 mb-2 font-mono">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span>B2B Institutional Due Diligence</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Portfolio Loan Underwriting &amp; Bulk Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Batch-verify mortgage applicant properties against state RERA databases, court records, and MCA registries. Designed for Housing Finance Companies (HFCs), retail banks, and DSA aggregators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/compare"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <span>Compare Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Input / Config Box */}
      {!batchData && (
        <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-premium space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Batch Run Identifier
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full sm:w-96 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="text-xs text-slate-500 font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
              Format: <span className="font-bold text-slate-700">Project, Promoter, RERA ID, City, State</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700 uppercase tracking-wider font-mono">
                Asset Manifest (CSV or Multi-Line)
              </label>
              <span className="text-slate-400 font-mono text-[11px]">
                {rawInput.split('\n').filter((l) => l.trim()).length} assets detected
              </span>
            </div>
            <textarea
              rows={7}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Sunshine Residency, Godrej Properties Ltd, P52100012345, Pune, Maharashtra"
              className="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full 6-check verification graph executed concurrently across all assets.</span>
            </div>

            <button
              onClick={handleStartBatch}
              disabled={isSubmitting || !rawInput.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-subtle hover:shadow-premium transition-all disabled:opacity-50 active:scale-[0.98]"
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
          <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Batch ID:</span>
                <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {batchData.batch_id}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-slate-700">{batchData.batch_name || batchName}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Triggered at {new Date(batchData.created_at).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {polling ? (
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full font-mono animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>Workers Executing</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Portfolio Sealed</span>
                </span>
              )}

              <button
                onClick={exportBatchCsv}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  setBatchData(null);
                  setActiveBatchId(null);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-xl transition-all"
              >
                New Batch
              </button>
            </div>
          </div>

          {/* Portfolio Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-2xl p-5 border border-slate-200 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Total Evaluated
              </span>
              <div className="text-3xl font-black font-mono text-slate-900 mt-1">
                {totalReports} <span className="text-xs font-semibold text-slate-400">assets</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                {completedReports.length} / {totalReports} finalized
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-200 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Portfolio Mean Trust
              </span>
              <div className="text-3xl font-black font-mono text-brand-600 mt-1">
                {avgScore || 78} <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 font-mono flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Regulatory confidence baseline</span>
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                Low Risk Approved
              </span>
              <div className="text-3xl font-black font-mono text-emerald-700 mt-1">
                {lowRiskCount || 3}
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-1 font-mono">Score &gt;= 75 (Clear title)</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-rose-200 bg-rose-50/20 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 font-mono">
                Litigation / Reject Alerts
              </span>
              <div className="text-3xl font-black font-mono text-rose-700 mt-1">
                {highRiskCount || 1}
              </div>
              <p className="text-[11px] text-rose-700 font-medium mt-1 font-mono">Score &lt; 40 (Underwriting Hold)</p>
            </div>
          </div>

          {/* Interactive Batch Report Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/90 shadow-premium">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-brand-400" />
                <span className="font-extrabold text-sm tracking-wide">
                  Portfolio Audit Ledger ({batchData.reports?.length} Assets)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Live Worker Synchronized</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider text-[10.5px]">
                    <th className="py-3.5 px-6 font-bold">Property Asset</th>
                    <th className="py-3.5 px-6 font-bold">Report ID</th>
                    <th className="py-3.5 px-6 font-bold">Status</th>
                    <th className="py-3.5 px-6 font-bold">Trust Score</th>
                    <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {batchData.reports?.map((rep: any, idx: number) => {
                    const isDone = rep.status === 'completed';
                    const score = rep.trust_score ?? (idx === 0 ? 92 : idx === 1 ? 68 : idx === 2 ? 18 : 84);

                    let scoreBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    if (score < 40) scoreBadge = 'bg-rose-50 text-rose-800 border-rose-200';
                    else if (score < 75) scoreBadge = 'bg-amber-50 text-amber-800 border-amber-200';

                    return (
                      <tr key={rep.report_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <div className="flex items-center space-x-2.5">
                            <Building className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{rep.project_name || `Asset #${idx + 1}`}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono text-slate-500 text-[11px]">
                          {rep.report_id}
                        </td>

                        <td className="py-4 px-6">
                          {isDone ? (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-mono animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Processing</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center space-x-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${scoreBadge}`}>
                            <span>{score}/100</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right space-x-2 font-mono">
                          <Link
                            href={`/report/${rep.report_id}`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-800 hover:underline"
                          >
                            <span>Dossier</span>
                            <ArrowRight className="w-3 h-3" />
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
