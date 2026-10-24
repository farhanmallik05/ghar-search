'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WatchlistItem, WatchlistAlert } from '@/lib/types';
import { getWatchlist, recheckAllWatchlist, recheckWatchlistItem } from '@/lib/api';
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
  RefreshCw,
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechecking, setRechecking] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<WatchlistAlert[]>([]);
  const [recheckStatus, setRecheckStatus] = useState<string | null>(null);

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

  const handleRunNightlyRecheck = async () => {
    setRechecking(true);
    setRecheckStatus('Simulating automated pg_cron 02:00 IST batch execution...');
    try {
      const res = await recheckAllWatchlist();
      setActiveAlerts(res.alerts || []);
      setRecheckStatus(`✓ Nightly re-check complete. ${res.total_checked} properties audited. ${res.alerts_triggered} regulatory alerts raised.`);

      // Refresh items list
      const updated = await getWatchlist();
      setItems(updated.items || []);
    } catch (err) {
      console.error('Failed batch re-check:', err);
      setRecheckStatus('Notice: Worker re-check concluded with fallback state.');
    } finally {
      setRechecking(false);
    }
  };

  const handleRecheckSingle = async (watchlistId: string) => {
    try {
      const res = await recheckWatchlistItem(watchlistId);
      setItems((prev) =>
        prev.map((item) =>
          item.watchlist_id === watchlistId
            ? { ...item, last_checked_at: res.last_checked_at, current_trust_score: res.current_trust_score, score_delta_7d: res.score_delta }
            : item
        )
      );
      if (res.alert_triggered && res.alert_message) {
        setActiveAlerts((prev) => [
          ...prev,
          {
            watchlist_id: res.watchlist_id,
            property_name: res.property_name,
            delta: res.score_delta,
            message: res.alert_message || 'Score delta detected.',
          },
        ]);
      }
    } catch (err) {
      console.error('Single recheck error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-32 relative">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 mb-2">
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nightly Background Due Diligence</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            Monitored Property Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl leading-relaxed font-light">
            Automated pg_cron workers re-scan official statutory portals nightly at 02:00 IST. Receive proactive alerts on score drops &gt; 10 points or newly admitted litigation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/compare?ids=rpt_sunshine_clean,rpt_green_valley_delayed"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/70 text-cyan-300 text-xs font-mono border border-cyan-500/30 transition-all active:scale-[0.98]"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Shortlist</span>
          </Link>

          <button
            onClick={handleRunNightlyRecheck}
            disabled={rechecking}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-[#121214] hover:bg-[#1a1a1e] border border-white/10 text-white text-xs font-mono transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rechecking ? 'animate-spin' : ''}`} />
            <span>{rechecking ? 'Auditing...' : 'Run Nightly Re-check'}</span>
          </button>

          <Link
            href="/#verify-section"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black text-xs font-semibold shadow-[0_0_20px_-2px_rgba(16,185,129,0.35)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Re-check Status Banner */}
      {recheckStatus && (
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{recheckStatus}</span>
          </div>
          <button
            onClick={() => setRecheckStatus(null)}
            className="text-xs font-bold text-cyan-300 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Alerts Drawer */}
      {activeAlerts.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-rose-500/40 bg-rose-950/20 shadow-premium space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-300 font-semibold text-xs uppercase tracking-wider font-mono">
              <Bell className="w-4 h-4 text-rose-400" />
              <span>Automated Watchlist Alerts Triggered ({activeAlerts.length})</span>
            </div>
            <button
              onClick={() => setActiveAlerts([])}
              className="text-[11px] font-mono text-rose-300 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {activeAlerts.map((alt, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0d0d0e] rounded-xl border border-rose-500/30 text-xs text-white/90 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <strong className="font-semibold text-white">{alt.property_name}:</strong>{' '}
                    <span className="text-white/70 font-light">{alt.message}</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-rose-400 shrink-0 ml-4">
                  {alt.delta < 0 ? `${alt.delta} pts` : `+${alt.delta} pts`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
          <p className="text-xs font-mono text-white/50">Loading statutory watchlist...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl border border-white/[0.08] bg-[#0d0d0e]/90 shadow-premium p-8">
          <BookmarkCheck className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white tracking-tight">Your Watchlist is Empty</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto mt-1 mb-6 font-light">
            Verify a property listing to save it to your monitored watchlist and receive automated regulatory alerts.
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black rounded-xl text-xs font-semibold transition-all shadow-[0_0_20px_-2px_rgba(16,185,129,0.35)]"
          >
            Start Property Due Diligence
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            let scoreBadge = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
            if (item.current_trust_score < 40) {
              scoreBadge = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
            } else if (item.current_trust_score < 75) {
              scoreBadge = 'bg-amber-950/60 text-amber-300 border-amber-500/30';
            }

            return (
              <div
                key={item.watchlist_id}
                className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#0d0d0e]/95 shadow-subtle flex flex-col justify-between hover:shadow-[0_8px_32px_rgba(0,0,0,0.85)] hover:border-emerald-500/30 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      {item.rera_id}
                    </span>

                    <span className={`inline-flex items-center space-x-1 text-xs font-mono px-2.5 py-0.5 rounded-full border tabular-nums ${scoreBadge}`}>
                      <span>Score: {item.current_trust_score}/100</span>
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-white tracking-tight">
                    {item.property_name}
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5 font-light">
                    {item.promoter_name} • {item.city}
                  </p>

                  {/* 7-Day Delta Indicator */}
                  <div className="mt-4 p-3 bg-[#121214] rounded-xl border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <span className="text-white/40">7-Day Score Trend:</span>
                    {item.score_delta_7d === 0 ? (
                      <span className="flex items-center space-x-1 text-white/60 font-semibold">
                        <Minus className="w-3.5 h-3.5" />
                        <span>Stable (0)</span>
                      </span>
                    ) : item.score_delta_7d < 0 ? (
                      <span className="flex items-center space-x-1 text-rose-400 font-semibold">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>{item.score_delta_7d} pts</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{item.score_delta_7d} pts</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-white/40 flex items-center space-x-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.last_checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <button
                      onClick={() => handleRecheckSingle(item.watchlist_id)}
                      title="Run on-demand recheck"
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>

                  <Link
                    href={`/report/${item.report_id || 'rpt_sunshine_clean'}`}
                    className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-mono text-xs hover:underline"
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
