'use client';

import React from 'react';
import Link from 'next/link';
import { getLandingUrl } from '@/lib/url';
import { ShieldAlert, ExternalLink, ShieldCheck, ArrowUpRight, Search } from 'lucide-react';

export default function Footer() {
  const [landingUrl, setLandingUrl] = React.useState(process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3001');

  React.useEffect(() => {
    setLandingUrl(getLandingUrl());
  }, []);

  return (
    <footer className="relative bg-[#050505] border-t border-white/[0.08] text-white/50 text-xs font-mono py-16 px-4 sm:px-6 mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5 text-white/95 font-semibold text-base tracking-tight">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span>Ghar Search</span>
              <span className="text-[9px] font-mono uppercase bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                HackIIITD 2026
              </span>
            </div>
            <p className="text-xs text-white/50 max-w-md leading-relaxed font-sans">
              Autonomous agentic due-diligence layer for Indian homebuyers. Condensing 30+ siloed government portals,
              court ledgers, and marketing brochures into a verifiable 0–100 Trust Score backed by immutable evidence citations.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-white/40 pt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Statutory record aggregator. Findings reflect official state registers and primary legal citations.</span>
            </div>
          </div>

          {/* Statutory Ledgers */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3.5 text-white/80">
              Statutory Ledgers
            </h4>
            <ul className="space-y-2 text-xs text-white/50">
              <li className="hover:text-emerald-400 transition-colors">MahaRERA &amp; State RERA Portals</li>
              <li className="hover:text-emerald-400 transition-colors">eCourts India (NJDG Records)</li>
              <li className="hover:text-emerald-400 transition-colors">NCLT &amp; IBBI Insolvency Registry</li>
              <li className="hover:text-emerald-400 transition-colors">Ministry of Corporate Affairs (MCA21)</li>
              <li className="hover:text-emerald-400 transition-colors">Municipal Plan Sanctions &amp; Fire NOCs</li>
            </ul>
          </div>

          {/* Team & Navigation */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3.5 text-white/80">
              Team &amp; Navigation
            </h4>
            <ul className="space-y-2 text-xs text-white/50">
              <li>Team Lead: <span className="text-white/80 font-medium">Farhan Rahaman Mallik</span></li>
              <li>UI / Frontend: <span className="text-white/80 font-medium">Piyush Kumar Gautam</span></li>
              <li>
                <a
                  href={landingUrl}
                  className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <span>Landing Page</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white transition-colors">
                  Verify Listing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Watchlist &amp; Alerts
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
          <div>HACKIIITD 2026 · PROPTECH • AUTONOMOUS WEB AGENTS • TINYFISH</div>
          <div>KCC ITM, GREATER NOIDA • ALL RIGHTS RESERVED</div>
        </div>
      </div>
    </footer>
  );
}
