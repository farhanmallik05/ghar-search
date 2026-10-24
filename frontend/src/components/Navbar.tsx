'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getLandingUrl } from '@/lib/url';
import {
  ShieldCheck,
  Search,
  Github,
  ExternalLink,
  BookmarkCheck,
  GitCompare,
  Layers,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const landingUrl = getLandingUrl();

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-6 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full bg-[#0a0a0c]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors duration-300">
            <Search className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold tracking-tight text-white/95 group-hover:text-white transition-colors">
                Ghar Search
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                HACKIIITD 2026
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-wider text-white/40 hidden sm:block">
              Agentic Due-Diligence Layer • TinyFish
            </span>
          </div>
        </Link>

        {/* Navigation & Status Items */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Agent Network Status Pill */}
          <div className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Agents:</span>
            <span className="text-emerald-300 font-medium">Online &amp; Sync</span>
          </div>

          {/* Back to Landing */}
          <a
            href={landingUrl}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Landing</span>
          </a>

          <Link
            href="/verify"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-150 ${
              pathname === '/verify'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Search className="w-3.5 h-3.5 opacity-80" />
            <span className="hidden sm:inline">Verify</span>
          </Link>

          <Link
            href="/dashboard"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-150 ${
              pathname === '/dashboard'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 opacity-80" />
            <span className="hidden sm:inline">Watchlist</span>
          </Link>

          <Link
            href="/compare"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-150 ${
              pathname === '/compare'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 opacity-80" />
            <span className="hidden sm:inline">Compare</span>
          </Link>

          <Link
            href="/bulk"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-150 ${
              pathname === '/bulk'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 opacity-80" />
            <span className="hidden sm:inline">Bulk</span>
          </Link>

          <a
            href="https://github.com/farhanmallik05/ghar-search"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-150"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Repo</span>
          </a>

          {/* Quick CTA Button */}
          <Link
            href="/verify"
            className="inline-flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] text-black text-xs font-semibold px-4 py-1.5 rounded-full shadow-[0_0_20px_-2px_rgba(16,185,129,0.35)] transition-all duration-200 ml-1"
          >
            <span>Live Audit</span>
            <ExternalLink className="w-3 h-3 opacity-90" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
