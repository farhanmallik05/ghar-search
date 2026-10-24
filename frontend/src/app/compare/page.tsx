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
  'rpt_royal_empire_flagged',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-32 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30 mb-2">
            <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Side-by-Side Due Diligence Benchmark</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            Property Due Diligence Comparison
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-3xl leading-relaxed font-light">
            Multi-dimensional statutory benchmark comparing official RERA disclosures, judicial records, possession promises, and regulatory penalty ledgers.
          </p>
        </div>

        {/* Quick Selector Pills & Export */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#121214] p-1.5 rounded-xl border border-white/[0.08]">
            <span className="text-[11px] font-mono text-white/40 px-2">Toggle Assets:</span>
            {CANONICAL_IDS.map((id) => {
              const isSelected = selectedIds.includes(id);
              const label = id.includes('clean') ? 'Sunshine (92)' : id.includes('delayed') ? 'Green Valley (68)' : 'Royal Empire (18)';
              return (
                <button
                  key={id}
                  onClick={() => toggleProperty(id)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
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
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono text-white/80 bg-white/[0.04] hover:bg-white/10 border border-white/10 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-white/50" />
              <span>Export Benchmark</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs font-mono text-white/50">Assembling comparative due-diligence matrix...</p>
        </div>
      ) : !comparison ? (
        <div className="py-20 text-center glass-card rounded-2xl border border-white/[0.08] bg-[#0d0d0e]/90 p-8">
          <p className="text-sm font-light text-white/60">Please select at least 2 properties to benchmark.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Executive Comparative Verdict Banner */}
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/15 shadow-premium">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                  Comparative AI Synthesis
                </span>
                <p className="text-sm sm:text-base font-medium text-white leading-snug">
                  {comparison.comparative_verdict}
                </p>
                <p className="text-xs text-white/50 pt-1 flex items-center space-x-1.5 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ranked via deterministic 100-point statutory rule engine without hallucination.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Side-by-Side Property Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparison.properties.map((prop) => {
              const isWinner = prop.report_id === comparison.winner_report_id;
              let scoreColor = 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30';
              if (prop.trust_score < 40) {
                scoreColor = 'text-rose-300 bg-rose-950/60 border-rose-500/30';
              } else if (prop.trust_score < 75) {
                scoreColor = 'text-amber-300 bg-amber-950/60 border-amber-500/30';
              }

              return (
                <div
                  key={prop.report_id}
                  className={`glass-card rounded-2xl p-6 border flex flex-col justify-between transition-all duration-200 ${
                    isWinner
                      ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-[0_0_24px_rgba(16,185,129,0.15)] bg-[#0d0d0e]/95'
                      : 'border-white/[0.08] bg-[#0d0d0e]/90 shadow-subtle'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Winner or Benchmark Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-white/[0.05] text-white/60 border-white/10">
                        {prop.rera_id}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>TOP BENCHMARK</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Developer */}
                    <div>
                      <h2 className="text-xl font-light text-white tracking-tight leading-snug">
                        {prop.project_name}
                      </h2>
                      <p className="text-xs text-white/50 mt-0.5 font-light">
                        {prop.promoter_name} • {prop.city}, {prop.state}
                      </p>
                    </div>

                    {/* Trust Score Big Badge */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${scoreColor}`}>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                          Trust Score
                        </div>
                        <div className="text-3xl font-light font-mono tabular-nums mt-0.5">
                          {prop.trust_score}
                          <span className="text-sm font-normal opacity-60">/100</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-lg bg-black/40 border border-white/10">
                        {prop.trust_label}
                      </span>
                    </div>

                    {/* Possession Promise */}
                    <div className="text-xs p-3 bg-[#121214] rounded-xl border border-white/[0.06] flex items-center justify-between font-mono">
                      <span className="text-white/40 flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-white/40" />
                        <span>Completion Date:</span>
                      </span>
                      <span className="text-white font-medium">
                        {prop.possession_date || 'December 2027'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <Link
                      href={`/report/${prop.report_id}`}
                      className="inline-flex items-center space-x-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <span>Full Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {prop.pdf_url && (
                      <a
                        href={prop.pdf_url}
                        download
                        className="inline-flex items-center space-x-1 text-[11px] font-mono text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 transition-all"
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
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.85)] bg-[#0d0d0e]/95">
            <div className="bg-[#070709] px-6 py-4 flex items-center justify-between text-white border-b border-white/[0.08]">
              <div className="flex items-center space-x-2.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold tracking-wide">
                  6-Dimension Statutory Compliance Comparison Matrix
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/40">Deterministic Score Allocations</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#121214] border-b border-white/[0.08] text-white/50 font-mono uppercase tracking-wider text-[10.5px]">
                    <th className="py-3.5 px-6 font-semibold w-1/3">Statutory Dimension</th>
                    {comparison.properties.map((p) => (
                      <th key={p.report_id} className="py-3.5 px-6 font-semibold text-white text-sm">
                        {p.project_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] font-sans">
                  {dimensionDefinitions.map((dim) => {
                    const Icon = dim.icon;
                    return (
                      <tr key={dim.key} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 font-medium text-white flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-medium text-white">{dim.label}</span>
                            <span className="block text-[10.5px] text-white/40 font-mono">Max: {dim.max} pts</span>
                          </div>
                        </td>

                        {comparison.properties.map((p) => {
                          const score = p.dimension_scores[dim.key] ?? 0;
                          const pct = Math.round((score / dim.max) * 100);
                          let barColor = 'bg-emerald-400';
                          if (pct < 40) barColor = 'bg-rose-400';
                          else if (pct < 75) barColor = 'bg-amber-400';

                          return (
                            <td key={p.report_id} className="py-4 px-6 align-middle font-mono">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-white">
                                    {score} <span className="text-[10px] text-white/40 font-normal">/ {dim.max}</span>
                                  </span>
                                  <span className="text-[10px] text-white/50">{pct}%</span>
                                </div>
                                <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
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
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/10 shadow-subtle space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold tracking-tight">Verified Strengths Benchmark</h3>
              </div>

              <div className="space-y-4">
                {comparison.properties.map((p) => (
                  <div key={p.report_id} className="border-t border-white/[0.06] pt-3">
                    <span className="text-xs font-semibold text-white block font-mono">{p.project_name}</span>
                    <ul className="mt-1.5 space-y-1 text-xs text-white/60 font-light">
                      {p.key_strengths.length > 0 ? (
                        p.key_strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-white/40 text-[11px] italic">No major regulatory strengths identified.</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags & Deductions */}
            <div className="glass-card rounded-2xl p-6 border border-rose-500/30 bg-rose-950/10 shadow-subtle space-y-4">
              <div className="flex items-center space-x-2 text-rose-400 font-mono">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold tracking-tight">Statutory Red Flags &amp; Deductions</h3>
              </div>

              <div className="space-y-4">
                {comparison.properties.map((p) => (
                  <div key={p.report_id} className="border-t border-white/[0.06] pt-3">
                    <span className="text-xs font-semibold text-white block font-mono">{p.project_name}</span>
                    <ul className="mt-1.5 space-y-1 text-xs text-white/60 font-light">
                      {p.key_red_flags.length > 0 ? (
                        p.key_red_flags.map((rf, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5 text-rose-300">
                            <span className="text-rose-400 font-bold">⚠</span>
                            <span>{rf}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-emerald-400 text-[11px] flex items-center space-x-1 font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
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
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs font-mono text-white/50">Loading benchmark parameters...</p>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
