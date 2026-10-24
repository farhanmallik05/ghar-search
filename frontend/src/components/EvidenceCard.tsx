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
      <div className="bg-[#0d0d0e] border border-white/[0.08] rounded-xl p-4 shadow-subtle hover:border-emerald-500/30 hover:bg-[#121214] transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20"></span>
            <span className="truncate max-w-[280px] sm:max-w-md tracking-tight">{evidence.title}</span>
          </div>

          <span className="inline-flex items-center space-x-1 text-[10px] font-mono uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Official Record</span>
          </span>
        </div>

        {/* Verbatim quote block */}
        <blockquote className="text-xs text-white/75 bg-[#121214] border-l-2 border-emerald-500 pl-3.5 py-2.5 my-2.5 rounded-r-lg font-mono leading-relaxed">
          &ldquo;{evidence.snippet}&rdquo;
        </blockquote>

        {/* Source metadata footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/[0.06] text-[11px] text-white/40 font-mono">
          <div className="flex items-center space-x-3">
            <a
              href={evidence.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium hover:underline"
            >
              <span className="truncate max-w-[220px]">{evidence.url.replace(/^https?:\/\//, '')}</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
            </a>

            <span className="flex items-center space-x-1 text-white/40">
              <Calendar className="w-3 h-3" />
              <span>{new Date(evidence.timestamp).toLocaleDateString()}</span>
            </span>
          </div>

          {evidence.screenshot_url && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-white/80 bg-white/[0.05] hover:bg-white/10 active:scale-[0.98] border border-white/10 px-2.5 py-1 rounded-lg transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Machine Proof</span>
            </button>
          )}
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      {modalOpen && evidence.screenshot_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full bg-[#0d0d0e] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#121214]">
              <div>
                <h4 className="text-sm font-semibold text-white">{evidence.title}</h4>
                <p className="text-xs text-white/50 font-mono">Machine-captured snapshot as legal evidence</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[75vh] overflow-auto bg-[#050505] flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={evidence.screenshot_url}
                alt={evidence.title}
                className="max-w-full rounded border border-white/10 shadow"
              />
            </div>

            <div className="px-5 py-3 bg-[#121214] border-t border-white/[0.08] flex items-center justify-between text-xs text-white/50 font-mono">
              <span>Timestamp: {evidence.timestamp}</span>
              <a
                href={evidence.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1 font-medium"
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
