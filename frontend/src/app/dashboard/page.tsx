'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WatchlistItem } from '@/lib/types';
import { getWatchlist } from '@/lib/api';
import {
  BookmarkCheck,
  Building,
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowRight,
  ShieldAlert,
  Bell,
  Clock,
  Plus,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getWatchlist();
        setItems(res.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 mb-2">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Nightly Background Due Diligence</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Monitored Property Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated pg_cron workers re-scan official portals every night at 02:00 IST. Receive alerts on score drops &gt; 10 points.
          </p>
        </div>

        <Link
          href="/#verify-section"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Monitor New Property</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading watchlist registry...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl border border-slate-200">
          <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Verify a property listing to save it to your monitored watchlist and receive automated regulatory alerts.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
          >
            Start Search
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            let scoreBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (item.current_trust_score < 40) {
              scoreBadge = 'bg-rose-50 text-rose-700 border-rose-200';
            } else if (item.current_trust_score < 75) {
              scoreBadge = 'bg-amber-50 text-amber-700 border-amber-200';
            }

            return (
              <div
                key={item.watchlist_id}
                className="glass-card rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                      {item.rera_id}
                    </span>

                    <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${scoreBadge}`}>
                      <span>Score: {item.current_trust_score}/100</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 tracking-tight">
                    {item.property_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.promoter_name} • {item.city}
                  </p>

                  {/* 7-Day Delta Indicator */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">7-Day Score Trend:</span>
                    {item.score_delta_7d === 0 ? (
                      <span className="flex items-center space-x-1 text-slate-600 font-semibold">
                        <Minus className="w-3.5 h-3.5" />
                        <span>Stable (0)</span>
                      </span>
                    ) : item.score_delta_7d < 0 ? (
                      <span className="flex items-center space-x-1 text-rose-600 font-bold">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>{item.score_delta_7d} pts</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{item.score_delta_7d} pts</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Checked {new Date(item.last_checked_at).toLocaleDateString()}</span>
                  </span>

                  <Link
                    href={`/report/${item.report_id || 'rpt_sunshine_clean'}`}
                    className="inline-flex items-center space-x-1 text-brand-600 hover:text-brand-700 font-bold hover:underline"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
