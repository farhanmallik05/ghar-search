'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Search, Github, ExternalLink, BookmarkCheck, GitCompare, Layers, Activity } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 via-indigo-600 to-brand-800 flex items-center justify-center text-white shadow-sm shadow-brand-600/30 ring-1 ring-inset ring-white/20 group-hover:scale-105 group-hover:shadow-glow-brand transition-all duration-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Ghar Search
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md border border-brand-200/80 font-mono">
                HACKIIITD 2026
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block tracking-normal">
              Agentic Property Due-Diligence Layer
            </p>
          </div>
        </Link>

        {/* Navigation & Status Items */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Agent Network Status Pill */}
          <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/80 text-[11px] font-medium text-slate-600 mr-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Agents:</span>
            <span className="font-semibold text-slate-700">Online & Synchronized</span>
          </div>

          <Link
            href="/"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
              pathname === '/' ? 'bg-brand-50 text-brand-700 border border-brand-200/80' : 'text-slate-700 hover:text-brand-600 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Verify</span>
          </Link>

          <Link
            href="/dashboard"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
              pathname === '/dashboard' ? 'bg-brand-50 text-brand-700 border border-brand-200/80' : 'text-slate-700 hover:text-brand-600 hover:bg-slate-100'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Watchlist</span>
          </Link>

          <Link
            href="/compare"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
              pathname === '/compare' ? 'bg-brand-50 text-brand-700 border border-brand-200/80' : 'text-slate-700 hover:text-brand-600 hover:bg-slate-100'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Compare</span>
          </Link>

          <Link
            href="/bulk"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
              pathname === '/bulk' ? 'bg-brand-50 text-brand-700 border border-brand-200/80' : 'text-slate-700 hover:text-brand-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Bulk B2B</span>
          </Link>

          <a
            href="https://github.com/farhanmallik05/ghar-search"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150 active:scale-[0.98]"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">GitHub</span>
          </a>

          <Link
            href="/#verify-section"
            className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.97] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm shadow-brand-600/20 hover:shadow-md transition-all duration-150 ml-1"
          >
            <span>Verify Listing</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
