# Ghar Search — Scrollytelling Landing Page

> **HackIIITD 2026 · Round 1 Idea Submission**  
> **PropTech · Consumer Protection · Web Agents**

An agentic due-diligence layer for Indian homebuyers, powered by the **TinyFish web agent APIs**.

---

## 👥 Team Details
- **Farhan Rahaman Mallik** — Team Lead · AI Agents & Full-Stack (KCC ITM, Greater Noida)
- **Piyush Kumar Gautam** — UI / Frontend Developer (KCC ITM, Greater Noida)

---

## 🌟 Overview & Key Features

This folder contains the complete, production-ready scrollytelling landing page featuring:
- **Scroll-Linked HTML5 Canvas Animation**: 240 high-definition frames simulating a precision magnification inspection of real estate claims vs. RERA filings.
- **Framer Motion Smooth Physics**: Jitter-free scroll interpolation using `useSpring` (stiffness: 100, damping: 30).
- **Interactive Live Verdict Prototype**: Simulation of the Slide 8 verdict screen featuring:
  - Property link & RERA ID input
  - Extracted claims from listings
  - 6 parallel autonomous agent checks (RERA status, Claim match, Promoter record, Court signals, Approvals, Public reputation)
  - Rule-based Trust Score calculation (0–100)
  - Interactive **TinyFish Live Browser View** modal showing remote Playwright/CDP execution.
- **Complete HackIIITD Deck Coverage**: Includes all sections from the 8-slide presentation (Problem Statement, Proposed Solution, Target Users & Business Model, 5-Layer Technical Pipeline, TinyFish API Integration, Scalability & 24h Roadmap, and Team Credentials).

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS with custom minimalist dark scrollbars and `#050505` void aesthetics
- **Animation**: Framer Motion (useScroll, useSpring, useTransform)
- **Rendering**: HTML5 Canvas with HiDPI / Retina device pixel ratio scaling
- **Icons**: Lucide React

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
http://localhost:3000

# 4. Production build
npm run build
npm run start
```
