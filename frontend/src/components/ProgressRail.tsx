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
  Activity,
} from 'lucide-react';

interface ProgressRailProps {
  checks: CheckResult[];
  overallStatus: string;
}

const CHECK_CONFIG: Record<
  CheckType,
  { label: string; icon: React.ReactNode; desc: string; authority: string }
> = {
  rera_status: {
    label: 'RERA Registration & Status',
    icon: <Building2 className="w-4 h-4" />,
    desc: 'Querying state RERA portal for active certificate, expiry & escrow account',
    authority: 'MahaRERA / State Authority',
  },
  claim_match: {
    label: 'Marketing Claim Match',
    icon: <FileCheck2 className="w-4 h-4" />,
    desc: 'Cross-referencing brochure possession date, unit count & sanctioned floors',
    authority: 'Brochure vs RERA Record',
  },
  court_signals: {
    label: 'eCourts & NCLT Insolvency',
    icon: <Scale className="w-4 h-4" />,
    desc: 'Checking National Judicial Data Grid, consumer forums & CIRP filings',
    authority: 'eCourts India (NJDG) & IBBI',
  },
  promoter_record: {
    label: 'Promoter Background & MCA',
    icon: <UserCheck className="w-4 h-4" />,
    desc: 'Scanning MCA21 director master data, past delivery track record & charges',
    authority: 'MCA21 Database',
  },
  approvals: {
    label: 'Municipal Sanctions & NOCs',
    icon: <CheckCircle className="w-4 h-4" />,
    desc: 'Verifying Commencement Certificate (CC), Fire NOC & Environmental Clearance',
    authority: 'Municipal Corporation (PMC/TMC)',
  },
  reputation: {
    label: 'Public Reputation & Sentiment',
    icon: <MessageSquareWarning className="w-4 h-4" />,
    desc: 'Synthesizing buyer forum grievances, news archives & consumer complaints',
    authority: 'Consumer Forums & Web Index',
  },
};

export default function ProgressRail({ checks, overallStatus }: ProgressRailProps) {
  const checkMap = new Map<CheckType, CheckResult>();
  checks.forEach((c) => checkMap.set(c.check_type, c));

  // Determine if this report is in 2-core statutory mode or 6-dimension mode
  const isTwoCheckMode =
    checks.length > 0 &&
    checks.length <= 2 &&
    checks.every((c) => c.check_type === 'rera_status' || c.check_type === 'court_signals');

  const activeTypes: CheckType[] = isTwoCheckMode
    ? ['rera_status', 'court_signals']
    : ['rera_status', 'claim_match', 'court_signals', 'promoter_record', 'approvals', 'reputation'];

  const completedCount = checks.filter(
    (c) => c.status === 'passed' || c.status === 'flagged' || c.status === 'failed'
  ).length;

  const totalChecks = activeTypes.length;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-premium transition-all">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 font-mono">
              Live Agentic Audit
            </span>
            {overallStatus === 'running' && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
              </span>
            )}
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
            Agentic Verification Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTwoCheckMode
              ? '2 core statutory web agent checkers querying official portals & judicial ledgers'
              : '6 core statutory web agent checkers querying official portals & judicial ledgers'}
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="inline-flex items-center space-x-1.5 text-xs font-bold font-mono text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200/80 shadow-subtle">
            <Activity className="w-3.5 h-3.5 text-brand-600" />
            <span>
              {completedCount} of {totalChecks} Checks Completed
            </span>
          </span>
        </div>
      </div>

      {/* Check Items List */}
      <div className="space-y-3">
        {activeTypes.map((type) => {
          const config = CHECK_CONFIG[type];
          const result = checkMap.get(type);
          const status: CheckStatus = result ? result.status : 'pending';

          let statusBadge = (
            <span className="inline-flex items-center space-x-1 text-slate-400 text-xs font-medium bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Queued</span>
            </span>
          );

          let rowStyle = 'border-slate-200/80 bg-white hover:border-slate-300';
          let iconBg = 'bg-slate-100 text-slate-600';

          if (status === 'running') {
            statusBadge = (
              <span className="inline-flex items-center space-x-1.5 text-brand-700 bg-brand-50 px-3 py-1 rounded-full text-xs font-bold border border-brand-200 shadow-subtle animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                <span>Scanning Portal...</span>
              </span>
            );
            rowStyle = 'border-brand-300 bg-brand-50/30 ring-2 ring-brand-500/10 shadow-sm';
            iconBg = 'bg-brand-100 text-brand-700';
          } else if (status === 'passed') {
            statusBadge = (
              <span className="inline-flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200/80 shadow-subtle">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Clean</span>
              </span>
            );
            rowStyle = 'border-slate-200/90 bg-emerald-50/10 hover:border-emerald-200';
            iconBg = 'bg-emerald-100 text-emerald-700';
          } else if (status === 'flagged' || status === 'needs_review') {
            statusBadge = (
              <span className="inline-flex items-center space-x-1.5 text-amber-800 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 shadow-subtle">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Discrepancy</span>
              </span>
            );
            rowStyle = 'border-amber-200/90 bg-amber-50/20';
            iconBg = 'bg-amber-100 text-amber-700';
          } else if (status === 'failed') {
            statusBadge = (
              <span className="inline-flex items-center space-x-1.5 text-rose-800 bg-rose-50 px-3 py-1 rounded-full text-xs font-bold border border-rose-200 shadow-subtle">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Flagged Issue</span>
              </span>
            );
            rowStyle = 'border-rose-200 bg-rose-50/20';
            iconBg = 'bg-rose-100 text-rose-700';
          }

          return (
            <div
              key={type}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 gap-3 ${rowStyle}`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-subtle ring-1 ring-inset ring-black/5 ${iconBg}`}>
                  {config.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      {config.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                      [{config.authority}]
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {config.desc}
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-auto shrink-0">
                {statusBadge}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
