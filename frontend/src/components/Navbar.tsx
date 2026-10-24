'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Search, BookmarkCheck, Github, ExternalLink } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">Ghar Search</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                HackIIITD 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Agentic Property Due-Diligence Layer</p>
          </div>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Search</span>
          </Link>


          <a
            href="https://github.com/farhanmallik05/ghar-search"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span className="hidden md:inline">GitHub</span>
          </a>

          <Link
            href="/#verify-section"
            className="hidden sm:inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all shadow-brand-500/20"
          >
            <span>Verify Listing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
