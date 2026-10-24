'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  GitCompare,
  Building2,
  Scale,
  Award,
  Star,
  FileCheck,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Calendar,
  Sparkles,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { compareReports } from '@/lib/api';
import { CompareResponse } from '@/lib/types';

const CANONICAL_IDS = [
  'rpt_sunshine_clean',
  'rpt_green_valley_delayed',
  'rpt_royal_empire_flagged'
];

function ComparePageContent() {
  const searchParams = useSearchParams();
  const paramIds = searchParams.get('ids');

  const [selectedIds, setSelectedIds] = useState<string[]>(
    paramIds ? paramIds.split(',').filter(Boolean) : ['rpt_sunshine_clean', 'rpt_green_valley_delayed']
  );
  const [comparison, setComparison] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComparison() {
      if (selectedIds.length < 2) return;
      setLoading(true);
      try {
        const data = await compareReports(selectedIds);
        setComparison(data);
      } catch (err) {
        console.error('Failed loading comparison:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [selectedIds]);

  const toggleProperty = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([selectedIds[0], selectedIds[1], id]);
      }
    }
  };

  const dimensionDefinitions = [
    { key: 'rera_status', label: 'RERA Registration & Status', max: 30, icon: Building2 },
    { key: 'claim_match', label: 'Brochure Claim vs Filings', max: 20, icon: FileCheck },
    { key: 'court_signals', label: 'Litigation & Judicial Records', max: 20, icon: Scale },
    { key: 'promoter_record', label: 'Promoter Entity & Track Record', max: 10, icon: UserCheck },
    { key: 'approvals', label: 'Statutory Sanctions & NOCs', max: 10, icon: Award },
    { key: 'reputation', label: 'Public Sentiment & Reviews', max: 10, icon: Star },
  ];

  const exportComparisonJson = () => {
    if (!comparison) return;
    const blob = new Blob([JSON.stringify(comparison, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ghar-search-comparison-${comparison.comparison_id || 'benchmark'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/80 mb-2 font-mono">
            <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Side-by-Side Due Diligence Benchmark</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Property Due Diligence Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Multi-dimensional statutory benchmark comparing official RERA disclosures, judicial records, possession promises, and regulatory penalty ledgers.
          </p>
        </div>

        {/* Quick Selector Pills & Export */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 px-2 font-mono">Toggle Assets:</span>
            {CANONICAL_IDS.map((id) => {
              const isSelected = selectedIds.includes(id);
              const label = id.includes('clean') ? 'Sunshine (92)' : id.includes('delayed') ? 'Green Valley (68)' : 'Royal Empire (18)';
              return (
                <button
                  key={id}
                  onClick={() => toggleProperty(id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-white text-indigo-700 shadow-subtle border border-indigo-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {comparison && (
            <button
              onClick={exportComparisonJson}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Benchmark</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Assembling comparative due-diligence matrix...</p>
        </div>
      ) : !comparison ? (
        <div className="py-20 text-center glass-card rounded-2xl border border-slate-200 p-8">
          <p className="text-sm font-semibold text-slate-600">Please select at least 2 properties to benchmark.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Executive Comparative Verdict Banner */}
          <div className="glass-card rounded-2xl p-6 border border-indigo-200 bg-gradient-to-r from-indigo-50/60 via-brand-50/40 to-white shadow-premium">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono">
                  Comparative AI Synthesis
                </span>
                <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  {comparison.comparative_verdict}
                </p>
                <p className="text-xs text-slate-500 pt-1 flex items-center space-x-1.5 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ranked via deterministic 100-point statutory rule engine without hallucination.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Side-by-Side Property Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparison.properties.map((prop) => {
              const isWinner = prop.report_id === comparison.winner_report_id;
              let scoreColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
              if (prop.trust_score < 40) {
                scoreColor = 'text-rose-700 bg-rose-50 border-rose-200';
              } else if (prop.trust_score < 75) {
                scoreColor = 'text-amber-700 bg-amber-50 border-amber-200';
              }

              return (
                <div
                  key={prop.report_id}
                  className={`glass-card rounded-2xl p-6 border flex flex-col justify-between transition-all duration-200 ${
                    isWinner
                      ? 'border-indigo-400 ring-2 ring-indigo-500/20 shadow-premium bg-white/95'
                      : 'border-slate-200/90 bg-white/80 shadow-subtle'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Winner or Benchmark Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                        {prop.rera_id}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                          <span>TOP BENCHMARK</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Developer */}
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                        {prop.project_name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {prop.promoter_name} • {prop.city}, {prop.state}
                      </p>
                    </div>

                    {/* Trust Score Big Badge */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${scoreColor}`}>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-80">
                          Trust Score
                        </div>
                        <div className="text-3xl font-black font-mono tabular-nums mt-0.5">
                          {prop.trust_score}
                          <span className="text-sm font-semibold opacity-70">/100</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono uppercase tracking-wider px-3 py-1 rounded-lg bg-white/80 border border-black/5 shadow-subtle">
                        {prop.trust_label}
                      </span>
                    </div>

                    {/* Possession Promise */}
                    <div className="text-xs p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between font-mono">
                      <span className="text-slate-500 flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Completion Date:</span>
                      </span>
                      <span className="font-bold text-slate-800">
                        {prop.possession_date || 'December 2027'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/report/${prop.report_id}`}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <span>Full Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {prop.pdf_url && (
                      <a
                        href={prop.pdf_url}
                        download
                        className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 6-Dimension Deep Comparison Matrix Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/90 shadow-premium">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-extrabold tracking-wide">
                  6-Dimension Statutory Compliance Comparison Matrix
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Deterministic Score Allocations</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider text-[10.5px]">
                    <th className="py-3.5 px-6 font-bold w-1/3">Statutory Dimension</th>
                    {comparison.properties.map((p) => (
                      <th key={p.report_id} className="py-3.5 px-6 font-bold text-slate-900 text-sm">
                        {p.project_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {dimensionDefinitions.map((dim) => {
                    const Icon = dim.icon;
                    return (
                      <tr key={dim.key} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900 flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{dim.label}</span>
                            <span className="block text-[10.5px] text-slate-400 font-mono">Max: {dim.max} pts</span>
                          </div>
                        </td>

                        {comparison.properties.map((p) => {
                          const score = p.dimension_scores[dim.key] ?? 0;
                          const pct = Math.round((score / dim.max) * 100);
                          let barColor = 'bg-emerald-500';
                          if (pct < 40) barColor = 'bg-rose-500';
                          else if (pct < 75) barColor = 'bg-amber-500';

                          return (
                            <td key={p.report_id} className="py-4 px-6 align-middle font-mono">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-extrabold text-slate-800">
                                    {score} <span className="text-[10px] text-slate-400 font-normal">/ {dim.max}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-bold">{pct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Findings & Red Flags Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Strengths */}
            <div className="glass-card rounded-2xl p-6 border border-emerald-200 bg-emerald-50/10 shadow-subtle space-y-4">
              <div className="flex items-center space-x-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold tracking-tight">Verified Strengths Benchmark</h3>
              </div>

              <div className="space-y-4">
                {comparison.properties.map((p) => (
                  <div key={p.report_id} className="border-t border-emerald-100 pt-3">
                    <span className="text-xs font-bold text-slate-900 block font-mono">{p.project_name}</span>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
                      {p.key_strengths.length > 0 ? (
                        p.key_strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400 text-[11px] italic">No major regulatory strengths identified.</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags & Deductions */}
            <div className="glass-card rounded-2xl p-6 border border-rose-200 bg-rose-50/10 shadow-subtle space-y-4">
              <div className="flex items-center space-x-2 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-extrabold tracking-tight">Statutory Red Flags & Deductions</h3>
              </div>

              <div className="space-y-4">
                {comparison.properties.map((p) => (
                  <div key={p.report_id} className="border-t border-rose-100 pt-3">
                    <span className="text-xs font-bold text-slate-900 block font-mono">{p.project_name}</span>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
                      {p.key_red_flags.length > 0 ? (
                        p.key_red_flags.map((rf, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5 text-rose-900">
                            <span className="text-rose-600 font-bold">⚠</span>
                            <span>{rf}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-emerald-700 font-semibold text-[11px] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Clean ledger — zero statutory penalties applied.</span>
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading benchmark parameters...</p>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}
