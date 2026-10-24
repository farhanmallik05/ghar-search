'use client';

import React, { useState } from 'react';
import { EvidenceItem } from '@/lib/types';
import { ExternalLink, Calendar, ShieldCheck, Image as ImageIcon, X } from 'lucide-react';

interface EvidenceCardProps {
  evidence: EvidenceItem;
}

export default function EvidenceCard({ evidence }: EvidenceCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-subtle hover:shadow-premium hover:border-slate-300 transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></span>
            <span className="truncate max-w-[280px] sm:max-w-md tracking-tight">{evidence.title}</span>
          </div>

          <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 shrink-0 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Official Record</span>
          </span>
        </div>

        {/* Verbatim quote block */}
        <blockquote className="text-xs text-slate-600 bg-slate-50/90 border-l-2 border-brand-500 pl-3.5 py-2.5 my-2.5 rounded-r-lg font-mono leading-relaxed">
          &ldquo;{evidence.snippet}&rdquo;
        </blockquote>

        {/* Source metadata footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center space-x-3">
            <a
              href={evidence.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-brand-600 hover:text-brand-700 font-semibold hover:underline"
            >
              <span className="truncate max-w-[220px]">{evidence.url.replace(/^https?:\/\//, '')}</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
            </a>

            <span className="flex items-center space-x-1 text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{new Date(evidence.timestamp).toLocaleDateString()}</span>
            </span>
          </div>

          {evidence.screenshot_url && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] px-2.5 py-1 rounded-lg transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>View Machine Proof</span>
            </button>
          )}
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      {modalOpen && evidence.screenshot_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{evidence.title}</h4>
                <p className="text-xs text-slate-500 font-mono">Machine-captured snapshot as legal evidence</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[75vh] overflow-auto bg-slate-950 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={evidence.screenshot_url}
                alt={evidence.title}
                className="max-w-full rounded border border-slate-800 shadow"
              />
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>Machine Timestamp: {evidence.timestamp}</span>
              <a
                href={evidence.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline flex items-center space-x-1 font-semibold"
              >
                <span>Visit Primary Source Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
