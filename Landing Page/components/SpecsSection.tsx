"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Sun, 
  Wind, 
  ShieldCheck, 
  Cpu, 
  Maximize, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function SpecsSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const specs = [
    {
      icon: Building2,
      number: "12,450",
      unit: "SQ FT",
      label: "Conditioned Interior Living",
      desc: "Four cascading split-levels engineered with monolithic post-tensioned slabs.",
    },
    {
      icon: Sun,
      number: "98.7%",
      unit: "DAYLIGHT INDEX",
      label: "Natural Lux Harvesting",
      desc: "Micro-angled louvers designed according to year-round solar trajectory.",
    },
    {
      icon: Wind,
      number: "0.22",
      unit: "ACH50",
      label: "Ultra-Acoustic Envelope",
      desc: "Hermetic Swiss glazing delivering silence down to 24dB in the master suite.",
    },
    {
      icon: Cpu,
      number: "AI-10",
      unit: "INTELLIGENCE",
      label: "Passive Microclimate OS",
      desc: "Autonomous geothermal heat exchangers balancing room-by-room dew points.",
    },
    {
      icon: Maximize,
      number: "7.2M",
      unit: "CANTILEVER",
      label: "Unsupported Glass Spans",
      desc: "Structural carbon reinforced columns creating zero-corner column boundaries.",
    },
    {
      icon: ShieldCheck,
      number: "LEED",
      unit: "PLATINUM",
      label: "Zero-Carbon Footprint",
      desc: "Integrated photovoltaic roof tile canopy generating 140% annual energy offset.",
    },
  ];

  return (
    <section id="specs" className="relative bg-[#050505] text-white py-32 px-6 overflow-hidden">
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-white/[0.015] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md mb-6">
            <Sparkles className="w-3.5 h-3.5 text-white/60" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-white/60">
              Structural Dossier
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white/95 leading-tight">
            ENGINEERED TO <br />
            <span className="font-serif italic text-white/80">PERFECTION.</span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-white/60 leading-relaxed font-light">
            Each residence within the GharSaach masterplan is commissioned as a standalone work of architectural art, integrating high-performance physics with serene minimalism.
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-28">
          {specs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group relative p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                    SPEC // 0{idx + 1}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl sm:text-5xl font-light tracking-tight text-white/95">
                    {item.number}
                  </span>
                  <span className="text-xs font-mono tracking-widest text-white/50 uppercase">
                    {item.unit}
                  </span>
                </div>

                <h3 className="text-base font-medium text-white/90 mb-2 tracking-tight">
                  {item.label}
                </h3>

                <p className="text-xs text-white/50 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* =====================================================================
            PRIVATE INQUIRY / ALLOCATION FORM
        ====================================================================== */}
        <div id="inquire" className="relative p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 max-w-4xl mx-auto backdrop-blur-xl">
          <div className="max-w-xl mx-auto text-center">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50 mb-3 block">
              Confidential Acquisition
            </span>

            <h3 className="text-3xl sm:text-4xl font-light tracking-tight text-white/95 mb-4">
              Request Private Dossier
            </h3>

            <p className="text-sm text-white/60 mb-8 leading-relaxed">
              Residences are allocated strictly via confidential consultation. Enter your credentials to receive the comprehensive architectural portfolio and coordinate an on-site private inspection.
            </p>

            {formSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-white mb-1">Inquiry Registered</h4>
                <p className="text-xs text-white/60">
                  Our Managing Principal will contact you within 4 hours to verify credentials and dispatch the cryptographic estate blueprint.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Full Legal Name"
                    className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Corporate or Private Email"
                    className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Direct Phone / Signal"
                    className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  />
                  <select
                    className="w-full px-5 py-3.5 rounded-xl bg-[#0c0c0e] border border-white/10 text-white/80 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  >
                    <option value="residence-1">Residence 01 // The Horizon Spans (Featured)</option>
                    <option value="residence-2">Residence 02 // Cantilever Glass Suite</option>
                    <option value="penthouse">The Grand Pavilion Villa</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-white text-black font-semibold text-sm tracking-tight hover:bg-white/90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  <span>Transmit Private Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] font-mono text-white/30 text-center uppercase tracking-widest mt-3">
                  Encrypted Transmission • Strict NDA Governed
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
