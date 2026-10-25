"use client";

/**
 * CrossAppLink — Drop-in replacement for <a> tags that navigate between the
 * Landing Page (port 3000) and the Main App (port 3001).
 *
 * Automatically appends ?from=landing query parameter so the Main App
 * can detect arrival from the landing page and trigger smooth entry transitions
 * and the floating "Back to Story" pill.
 *
 * On click it briefly displays a full-screen branded exit overlay so the raw
 * page-reload flash is masked, giving the impression of a smooth transition.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

interface CrossAppLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export default function CrossAppLink({
  href,
  children,
  onClick,
  ...props
}: CrossAppLinkProps) {
  const [exiting, setExiting] = useState(false);
  const [resolvedHref, setResolvedHref] = useState(href);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const url = new URL(href, window.location.origin);
        if (!url.searchParams.has("from")) {
          url.searchParams.set("from", "landing");
        }
        // If user is stored, pass auth session
        const rawUser = localStorage.getItem("ghar_auth_user");
        if (rawUser && !url.searchParams.has("auth_user")) {
          url.searchParams.set("auth_user", rawUser);
        }
        setResolvedHref(url.toString());
      }
    } catch {
      setResolvedHref(href);
    }
  }, [href]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modifier-key clicks (open in new tab, etc.) pass through normally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // Also respect explicitly set target="_blank"
    if (props.target === "_blank") return;

    e.preventDefault();
    if (onClick) onClick(e);
    setExiting(true);
    setTimeout(() => {
      window.location.href = resolvedHref;
    }, 390);
  };

  return (
    <>
      <a href={resolvedHref} onClick={handleClick} {...props}>
        {children}
      </a>

      <AnimatePresence>
        {exiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            {/* Brand logo pulse */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.22, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                <Search className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/40">
                Ghar Search
              </span>
              {/* Shimmer bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.15, duration: 0.35, ease: "easeOut" }}
                className="w-28 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent origin-left"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
