'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <span className="text-brand-400">🏠 Ghar Search</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              An autonomous agentic due-diligence layer for Indian homebuyers. Condensing 30+ siloed government portals,
              court ledgers, and marketing brochures into a verifiable 0-100 Trust Score backed by immutable screenshots and timestamps.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500 pt-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Public records index. Findings are advisory and backed by primary citations.</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Statutory Sources</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white transition-colors">MahaRERA & State RERA Portals</span></li>
              <li><span className="hover:text-white transition-colors">eCourts India (NJDG)</span></li>
              <li><span className="hover:text-white transition-colors">NCLT & IBBI Insolvency Registry</span></li>
              <li><span className="hover:text-white transition-colors">Ministry of Corporate Affairs (MCA21)</span></li>
              <li><span className="hover:text-white transition-colors">Municipal Plan Sanctions (PMC/TMC/BBMP)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">HackIIITD 2026</h4>
            <ul className="space-y-2 text-xs">
              <li>Team Lead: <strong className="text-slate-200">Farhan Rahaman Mallik</strong></li>
              <li>UI / Frontend: <strong className="text-slate-200">Piyush Kumar Gautam</strong></li>
              <li>Stack: Next.js 14 · FastAPI · LangGraph · TinyFish</li>
              <li className="pt-2">
                <a
                  href="https://github.com/farhanmallik05/ghar-search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-brand-400 hover:text-brand-300"
                >
                  <span>View Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Ghar Search · HackIIITD 2026 Submission · MIT License</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built with precision for Indian Homebuyers</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
