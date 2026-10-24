'use client';

import React from 'react';
import { TrustLabel } from '@/lib/types';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Award } from 'lucide-react';

interface TrustGaugeProps {
  score: number;
  label: TrustLabel;
  dimensionScores?: Record<string, number>;
  maxDimensionScores?: Record<string, number>;
}

export default function TrustGauge({
  score,
  label,
  dimensionScores = {},
  maxDimensionScores = {},
}: TrustGaugeProps) {
  // Determine color scheme based on score tier
  let strokeColor = '#059669'; // Emerald 600
  let strokeGradientId = 'gauge-emerald';
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
  let badgeIcon = <ShieldCheck className="w-4 h-4 text-emerald-600" />;

  if (score < 40) {
    strokeColor = '#dc2626'; // Red 600
    strokeGradientId = 'gauge-rose';
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200/80';
    badgeIcon = <AlertOctagon className="w-4 h-4 text-rose-600" />;
  } else if (score < 60) {
    strokeColor = '#ea580c'; // Orange 600
    strokeGradientId = 'gauge-orange';
    badgeBg = 'bg-orange-50 text-orange-800 border-orange-200/80';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-orange-600" />;
  } else if (score < 80) {
    strokeColor = '#d97706'; // Amber 600
    strokeGradientId = 'gauge-amber';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200/80';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
  }

  // Calculate SVG circular arc
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const dimensions = [
    { key: 'rera_status', label: '1. RERA Status & Validity', defaultMax: 30 },
    { key: 'claim_match', label: '2. Marketing Claim Match', defaultMax: 20 },
    { key: 'court_signals', label: '3. Litigation & Court Records', defaultMax: 20 },
    { key: 'promoter_record', label: '4. Promoter Track Record', defaultMax: 10 },
    { key: 'approvals', label: '5. Municipal Approvals & NOCs', defaultMax: 10 },
    { key: 'reputation', label: '6. Buyer Sentiment & Grievances', defaultMax: 10 },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-premium flex flex-col justify-between h-full">
      <div>
        {/* Header Label */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Mathematical Due Diligence
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
              Deterministic Trust Score
            </h3>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Scale: 0-100
          </span>
        </div>

        {/* Circular Gauge Centerpiece */}
        <div className="relative flex flex-col items-center justify-center my-3">
          <svg className="w-48 h-48 transform -rotate-90">
            <defs>
              <linearGradient id="gauge-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="gauge-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="gauge-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="gauge-rose" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>

            {/* Background ring */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Value ring */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke={`url(#${strokeGradientId})`}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-black tracking-tight text-slate-900 font-mono tabular-nums">
              {score}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono mt-0.5">
              out of 100
            </span>
          </div>
        </div>

        {/* Rating Tier Pill */}
        <div className="flex flex-col items-center justify-center mt-2 mb-6">
          <span className={`inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold border shadow-subtle ${badgeBg}`}>
            {badgeIcon}
            <span>{label}</span>
          </span>
          <span className="text-[11px] text-slate-500 mt-1 font-medium">
            6-Dimension Statutory Engine
          </span>
        </div>

        {/* Sub-Dimension Breakdown List */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
            Statutory Weights & Breakdown
          </div>

          {dimensions.map((dim) => {
            const rawCurrent = dimensionScores[dim.key];
            const rawMax = maxDimensionScores[dim.key];
            const current = rawCurrent !== undefined ? rawCurrent : 0;
            const max = rawMax || dim.defaultMax;
            const pct = max > 0 ? Math.round((current / max) * 100) : 0;

            let barColor = 'bg-emerald-500';
            let pillBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            if (pct < 40) {
              barColor = 'bg-rose-500';
              pillBadge = 'bg-rose-50 text-rose-800 border-rose-200';
            } else if (pct < 75) {
              barColor = 'bg-amber-500';
              pillBadge = 'bg-amber-50 text-amber-800 border-amber-200';
            }

            return (
              <div
                key={dim.key}
                className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex justify-between items-center text-xs mb-1.5 gap-2">
                  <span className="font-semibold text-slate-800 truncate text-[11px]">
                    {dim.label}
                  </span>
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border tabular-nums shrink-0 ${pillBadge}`}>
                    {current}/{max} pts
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-700 ease-out rounded-full`}
                    style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-mono text-center">
        Zero LLM Math Hallucinations · Pure Deterministic Scoring
      </div>
    </div>
  );
}
