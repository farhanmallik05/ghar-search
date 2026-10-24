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
  let strokeColor = '#10B981'; // Emerald 500
  let strokeGradientId = 'gauge-emerald';
  let badgeBg = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
  let badgeIcon = <ShieldCheck className="w-4 h-4 text-emerald-400" />;

  if (score < 40) {
    strokeColor = '#EF4444'; // Red 500
    strokeGradientId = 'gauge-rose';
    badgeBg = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
    badgeIcon = <AlertOctagon className="w-4 h-4 text-rose-400" />;
  } else if (score < 60) {
    strokeColor = '#F97316'; // Orange 500
    strokeGradientId = 'gauge-orange';
    badgeBg = 'bg-orange-950/60 text-orange-300 border-orange-500/30';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-orange-400" />;
  } else if (score < 80) {
    strokeColor = '#F59E0B'; // Amber 500
    strokeGradientId = 'gauge-amber';
    badgeBg = 'bg-amber-950/60 text-amber-300 border-amber-500/30';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
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
    <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#0d0d0e]/90 shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex flex-col justify-between h-full">
      <div>
        {/* Header Label */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-5">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400">
              Deterministic Verification
            </span>
            <h3 className="font-semibold text-sm sm:text-base text-white tracking-tight">
              Trust Score Engine
            </h3>
          </div>
          <span className="text-[10px] font-mono font-medium text-white/50 bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded">
            Scale: 0–100
          </span>
        </div>

        {/* Circular Gauge Centerpiece */}
        <div className="relative flex flex-col items-center justify-center my-3">
          <svg className="w-48 h-48 transform -rotate-90">
            <defs>
              <linearGradient id="gauge-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
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
              stroke="rgba(255, 255, 255, 0.08)"
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
            <span className="text-5xl font-light tracking-tight text-white font-mono tabular-nums">
              {score}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 mt-0.5">
              out of 100
            </span>
          </div>
        </div>

        {/* Rating Tier Pill */}
        <div className="flex flex-col items-center justify-center mt-2 mb-6">
          <span className={`inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-mono tracking-wider border shadow-subtle ${badgeBg}`}>
            {badgeIcon}
            <span>{label}</span>
          </span>
          <span className="text-[11px] text-white/40 mt-1.5 font-mono">
            6-Dimension Statutory Audit
          </span>
        </div>

        {/* Sub-Dimension Breakdown List */}
        <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">
            Statutory Weights &amp; Score
          </div>

          {dimensions.map((dim) => {
            const rawCurrent = dimensionScores[dim.key];
            const rawMax = maxDimensionScores[dim.key];
            const current = rawCurrent !== undefined ? rawCurrent : 0;
            const max = rawMax || dim.defaultMax;
            const pct = max > 0 ? Math.round((current / max) * 100) : 0;

            let barColor = 'bg-emerald-400';
            let pillBadge = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
            if (pct < 40) {
              barColor = 'bg-rose-400';
              pillBadge = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
            } else if (pct < 75) {
              barColor = 'bg-amber-400';
              pillBadge = 'bg-amber-950/60 text-amber-300 border-amber-500/30';
            }

            return (
              <div
                key={dim.key}
                className="p-2.5 rounded-xl bg-[#121214] border border-white/[0.06] hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-center text-xs mb-1.5 gap-2">
                  <span className="font-medium text-white/80 truncate text-[11px]">
                    {dim.label}
                  </span>
                  <span className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border tabular-nums shrink-0 ${pillBadge}`}>
                    {current}/{max} pts
                  </span>
                </div>
                <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]`}
                    style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] text-white/40 font-mono text-center">
        Deterministic Rules Engine · Pure Verifiable Scoring
      </div>
    </div>
  );
}
