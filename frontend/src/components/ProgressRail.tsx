'use client';

import React from 'react';
import { CheckResult, CheckType, CheckStatus } from '@/lib/types';
import {
  Building2,
  FileCheck2,
  UserCheck,
  Scale,
  CheckCircle,
  MessageSquareWarning,
  Loader2,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

interface ProgressRailProps {
  checks: CheckResult[];
  overallStatus: string;
}

const CHECK_CONFIG: Record<
  CheckType,
  { label: string; icon: React.ReactNode; desc: string }
> = {
  rera_status: {
    label: 'RERA Registration & Status',
    icon: <Building2 className="w-4 h-4" />,
    desc: 'Querying state RERA portal for active certificate, expiry & escrow account',
  },
  claim_match: {
    label: 'Marketing Claim Match',
    icon: <FileCheck2 className="w-4 h-4" />,
    desc: 'Cross-referencing brochure possession date, unit count & sanctioned floors',
  },
  promoter_record: {
    label: 'Promoter Background & MCA',
    icon: <UserCheck className="w-4 h-4" />,
    desc: 'Scanning MCA21 director master data, past delivery track record & charges',
  },
  court_signals: {
    label: 'eCourts & NCLT Insolvency',
    icon: <Scale className="w-4 h-4" />,
    desc: 'Checking National Judicial Data Grid, consumer forums & CIRP filings',
  },
  approvals: {
    label: 'Municipal Sanctions & NOCs',
    icon: <CheckCircle className="w-4 h-4" />,
    desc: 'Verifying Commencement Certificate (CC), Fire NOC & Environmental Clearance',
  },
  reputation: {
    label: 'Public Reputation & Sentiment',
    icon: <MessageSquareWarning className="w-4 h-4" />,
    desc: 'Synthesizing buyer forum grievances, news archives & consumer complaints',
  },
};

export default function ProgressRail({ checks, overallStatus }: ProgressRailProps) {
  const checkMap = new Map<CheckType, CheckResult>();
  checks.forEach((c) => checkMap.set(c.check_type, c));

  const allTypes: CheckType[] = [
    'rera_status',
    'court_signals',
  ];

  const relevantChecks = checks.filter(c => c.check_type === 'rera_status' || c.check_type === 'court_signals');
  const completedCount = relevantChecks.filter(
    (c) => c.status === 'passed' || c.status === 'flagged' || c.status === 'failed'
  ).length;

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <span>Agentic Verification Pipeline</span>
            {overallStatus === 'running' && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500">
            2 core statutory web agent checkers querying official portals & judicial ledgers
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            {completedCount} of 2 Checks Completed
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {allTypes.map((type) => {
          const config = CHECK_CONFIG[type];
          const result = checkMap.get(type);
          const status: CheckStatus = result ? result.status : 'pending';

          let statusBadge = (
            <span className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Queued</span>
            </span>
          );

          let borderHighlight = 'border-slate-100 bg-white/50';

          if (status === 'running') {
            statusBadge = (
              <span className="flex items-center space-x-1.5 text-brand-600 text-xs font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning...</span>
              </span>
            );
            borderHighlight = 'border-brand-300 bg-brand-50/40 shadow-sm';
          } else if (status === 'passed') {
            statusBadge = (
              <span className="flex items-center space-x-1 text-emerald-600 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Clean</span>
              </span>
            );
            borderHighlight = 'border-emerald-200 bg-emerald-50/20';
          } else if (status === 'flagged' || status === 'needs_review') {
            statusBadge = (
              <span className="flex items-center space-x-1 text-amber-600 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Discrepancy</span>
              </span>
            );
            borderHighlight = 'border-amber-200 bg-amber-50/20';
          } else if (status === 'failed') {
            statusBadge = (
              <span className="flex items-center space-x-1 text-rose-600 text-xs font-bold">
                <XCircle className="w-3.5 h-3.5" />
                <span>Flagged</span>
              </span>
            );
            borderHighlight = 'border-rose-200 bg-rose-50/20';
          }

          return (
            <div
              key={type}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${borderHighlight}`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  {config.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{config.label}</div>
                  <div className="text-[11px] text-slate-500 hidden sm:block max-w-md truncate">
                    {config.desc}
                  </div>
                </div>
              </div>

              <div>{statusBadge}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
