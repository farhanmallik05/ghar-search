'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-900 text-slate-400 text-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5 text-white font-extrabold text-lg tracking-tight">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Ghar Search</span>
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Gov-Backed Verification
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              An autonomous agentic due-diligence layer for Indian homebuyers. Condensing 30+ siloed government portals,
              court ledgers, and marketing brochures into a verifiable 0-100 Trust Score backed by immutable screenshots and cryptographic timestamps.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Statutory record aggregator. Findings reflect official state registers and primary legal citations.</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3.5 font-mono">
              Statutory Ledgers
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-slate-200 transition-colors">MahaRERA & State RERA Portals</span></li>
              <li><span className="hover:text-slate-200 transition-colors">eCourts India (NJDG Records)</span></li>
              <li><span className="hover:text-slate-200 transition-colors">NCLT & IBBI Insolvency Registry</span></li>
              <li><span className="hover:text-slate-200 transition-colors">Ministry of Corporate Affairs (MCA21)</span></li>
              <li><span className="hover:text-slate-200 transition-colors">Municipal Plan Sanctions & Fire NOCs</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3.5 font-mono">
              HackIIITD 2026
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Team Lead: <strong className="text-slate-200 font-semibold">Farhan Rahaman Mallik</strong></li>
              <li>UI / Frontend: <strong className="text-slate-200 font-semibold">Piyush Kumar Gautam</strong></li>
              <li className="font-mono text-[11px] text-slate-400">Next.js 14 · FastAPI · LangGraph · TinyFish</li>
              <li className="pt-2">
                <a
                  href="https://github.com/farhanmallik05/ghar-search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-brand-400 hover:text-brand-300 font-medium transition-colors"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
          <p>© 2026 Ghar Search · HackIIITD 2026 Entry · MIT License</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0 text-slate-400">
            <span>Deterministic Math + Automated Portal Aggregation</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
