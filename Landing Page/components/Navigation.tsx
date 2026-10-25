"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ArrowUpRight,
  Volume2,
  VolumeX,
  ShieldCheck,
  Search,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
} from "lucide-react";
import { getAppUrl } from "@/lib/url";
import CrossAppLink from "@/components/CrossAppLink";
import LoginModal from "@/components/LoginModal";
import {
  UserProfile,
  getStoredUser,
  clearStoredUser,
  buildAppLaunchUrl,
} from "@/lib/auth";

export default function Navigation() {
  const [appUrl, setAppUrl] = useState(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000?from=landing"
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync auth state and scroll listeners
  useEffect(() => {
    setAppUrl(getAppUrl());
    setCurrentUser(getStoredUser());

    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("ghar_auth_change", handleAuthChange);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("ghar_auth_change", handleAuthChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLaunchAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsLoginModalOpen(true);
    } else {
      window.location.href = buildAppLaunchUrl(appUrl, currentUser);
    }
  };

  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
    setIsUserDropdownOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-4 transition-all duration-500">
        <div
          className={`max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-6 py-3 rounded-full transition-all duration-500 ${
            isScrolled
              ? "bg-[#0a0a0c]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.85)]"
              : "bg-black/30 backdrop-blur-sm border border-white/[0.06]"
          }`}
        >
          {/* Brand Logo & Hackathon Tag */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold tracking-tight text-xs group-hover:bg-emerald-500 group-hover:text-black transition-colors duration-300">
              <Search className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-white/95 group-hover:text-white">
                  Ghar Search
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  HACKIIITD 2026
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-wider text-white/40">
                Agentic Due-Diligence Layer • TinyFish
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-mono tracking-wider text-white/60">
            <a
              href="#problem"
              className="hover:text-white transition-colors duration-200"
            >
              01 // Problem
            </a>
            <a
              href="#solution"
              className="hover:text-white transition-colors duration-200"
            >
              02 // Solution
            </a>
            <a
              href="#live-verdict"
              className="hover:text-emerald-400 text-white/80 transition-colors duration-200 flex items-center gap-1.5 font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              03 // Live Prototype
            </a>
            <a
              href="#pipeline"
              className="hover:text-white transition-colors duration-200"
            >
              04 // Architecture
            </a>
            <a
              href="#tinyfish"
              className="hover:text-white transition-colors duration-200"
            >
              05 // TinyFish
            </a>
            <a
              href="#team"
              className="hover:text-white transition-colors duration-200"
            >
              06 // Team
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Ambient Audio Indicator */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all text-[10px] font-mono"
              title={isMuted ? "Audio muted" : "Audio active"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span>AUDIO OFF</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-white/80">AUDIO ON</span>
                </>
              )}
            </button>

            {/* Authenticated User Pill OR Launch App Button */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:border-emerald-500/60 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center">
                    {currentUser.avatar}
                  </div>
                  <span className="max-w-[100px] truncate text-white text-xs font-semibold">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <span className="hidden md:inline px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/10 text-white/60">
                    {currentUser.badge}
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/40" />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-[#0c0d12]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.8)] z-50 text-left"
                    >
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
                        <a
                          href={buildAppLaunchUrl(appUrl, currentUser)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 text-xs font-medium hover:bg-emerald-500 hover:text-black transition-colors"
                        >
                          <span>Launch Due Diligence App</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            setIsLoginModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] text-xs transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Switch Persona / Account</span>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Launch App / Sign In Trigger */
              <button
                type="button"
                onClick={handleLaunchAppClick}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-tight hover:bg-emerald-500 hover:text-black transition-all group"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black transition-colors" />
                <span>Launch App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Test Live Prototype CTA */}
            <CrossAppLink
              href={`${appUrl}#verify-section`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold tracking-tight hover:bg-emerald-400 hover:text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Listing</span>
            </CrossAppLink>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="lg:hidden mt-3 mx-2 p-6 rounded-2xl bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 text-center flex flex-col gap-4 text-xs font-mono tracking-widest uppercase text-white/70"
            >
              <a
                href="#problem"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-white"
              >
                01 // The Problem
              </a>
              <a
                href="#solution"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-white"
              >
                02 // Proposed Solution
              </a>
              <a
                href="#live-verdict"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-emerald-400 hover:text-white"
              >
                03 // Live Prototype
              </a>
              <a
                href="#pipeline"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-white"
              >
                04 // 5-Layer Pipeline
              </a>
              <a
                href="#tinyfish"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-white"
              >
                05 // TinyFish Integration
              </a>
              <a
                href="#team"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 hover:text-white"
              >
                06 // Team Details
              </a>

              {/* Mobile Auth & Launch Actions */}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                {currentUser ? (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-left mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-semibold">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {currentUser.badge}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2 text-[10px] text-rose-400 hover:underline uppercase tracking-wider"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (!currentUser) {
                      setIsLoginModalOpen(true);
                    } else {
                      window.location.href = buildAppLaunchUrl(appUrl, currentUser);
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider hover:bg-emerald-500 hover:text-black transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{currentUser ? "Launch App Workspace" : "Launch App (Sign In)"}</span>
                </button>

                <CrossAppLink
                  href={`${appUrl}#verify-section`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-emerald-400 hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Verify Listing Now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </CrossAppLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Login / Auth Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        appUrl={appUrl}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </>
  );
}
