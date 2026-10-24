'use client';

import React from 'react';
import { TrustLabel } from '@/lib/types';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

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
  // Determine color palette
  let strokeColor = '#10B981'; // green
  let bgColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let badgeIcon = <ShieldCheck className="w-5 h-5 text-emerald-600" />;

  if (score < 40) {
    strokeColor = '#EF4444'; // red
    bgColor = 'bg-rose-50 text-rose-700 border-rose-200';
    badgeIcon = <AlertOctagon className="w-5 h-5 text-rose-600" />;
  } else if (score < 60) {
    strokeColor = '#F97316'; // orange
    bgColor = 'bg-orange-50 text-orange-700 border-orange-200';
    badgeIcon = <AlertTriangle className="w-5 h-5 text-orange-600" />;
  } else if (score < 80) {
    strokeColor = '#F59E0B'; // amber
    bgColor = 'bg-amber-50 text-amber-700 border-amber-200';
    badgeIcon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
  }

  // Calculate SVG circular arc
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  // Use 75% arc (semi-circle plus wings)
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const dimensions = [
    { key: 'rera_status', label: 'RERA Status', max: 30 },
    { key: 'claim_match', label: 'Claim Match', max: 20 },
    { key: 'court_signals', label: 'Court Signals', max: 20 },
    { key: 'promoter_record', label: 'Promoter Record', max: 10 },
    { key: 'approvals', label: 'Approvals', max: 10 },
    { key: 'reputation', label: 'Reputation', max: 10 },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/80">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Radial Meter */}
        <div className="relative flex flex-col items-center justify-center">
          <svg className="w-52 h-52 transform -rotate-90">
            <circle
              cx="104"
              cy="104"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="14"
              fill="transparent"
            />
            <circle
              cx="104"
              cy="104"
              r={radius}
              stroke={strokeColor}
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-black tracking-tight text-slate-900">{score}</span>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">out of 100</span>
          </div>
        </div>

        {/* Verdict & Dimension Breakdown */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Deterministic Trust Score
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${bgColor}`}>
                {badgeIcon}
                <span>{label}</span>
              </span>
              <span className="text-xs text-slate-500">
                • Auditable 6-layer rule engine
              </span>
            </div>
          </div>

          {/* Sub-Dimension Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {dimensions.map((dim) => {
              const current = dimensionScores[dim.key] ?? 0;
              const max = maxDimensionScores[dim.key] ?? dim.max;
              const pct = Math.round((current / max) * 100);

              let pillColor = 'bg-emerald-500';
              if (pct < 40) pillColor = 'bg-rose-500';
              else if (pct < 75) pillColor = 'bg-amber-500';

              return (
                <div key={dim.key} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-medium text-slate-700 truncate">{dim.label}</span>
                    <span className="font-bold text-slate-900 ml-1">
                      {current}/{max}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pillColor} transition-all duration-700`}
                      style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
