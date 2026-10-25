'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  User,
  LogOut,
  ChevronDown,
  Zap,
  LogIn,
} from 'lucide-react';
import {
  UserProfile,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  syncAuthFromQuery,
} from '@/lib/auth';
import LoginModal from '@/components/LoginModal';

export default function Navbar() {
  const pathname = usePathname();
  const landingUrl = getLandingUrl();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Sync from inbound cross-app redirect query param or storage
    const user = syncAuthFromQuery();
    setCurrentUser(user);

    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    window.addEventListener('ghar_auth_change', handleAuthChange);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('ghar_auth_change', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
    setIsUserDropdownOpen(false);
  };

  return (
    <>
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

            {/* User Session Profile Pill OR Sign In Button */}
            {currentUser ? (
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:border-emerald-500/60 transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold flex items-center justify-center">
                    {currentUser.avatar}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[110px] truncate text-white text-xs font-semibold">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="hidden md:inline px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/10 text-white/60">
                    {currentUser.badge}
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/40" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 p-3 rounded-2xl bg-[#0c0d12]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.85)] z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1.5 border-b border-white/[0.08] mb-2">
                      <p className="text-xs font-semibold text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] font-mono text-emerald-400 truncate">
                        {currentUser.email}
                      </p>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">
                        {currentUser.organization}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setIsLoginModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] text-xs transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Switch Persona</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/30 text-xs transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center space-x-1.5 bg-white/[0.06] hover:bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 transition-all duration-200 ml-1"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

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

      {/* In-app Login / Persona Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </>
  );
}
