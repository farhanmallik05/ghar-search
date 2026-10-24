# 🏠 Ghar Search

> **"Paste a property listing. Get a verified trust report, backed by evidence from official records."**  
> An agentic due-diligence layer for Indian homebuyers, powered by autonomous web agents, LangGraph parallel fan-out, and a deterministic mathematical Trust Scoring engine.

[![HackIIITD 2026](https://img.shields.io/badge/HackIIITD-2026-blue.svg)](https://github.com/farhanmallik05/ghar-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-purple)](https://www.langchain.com/langgraph)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_15-emerald)](https://supabase.com/)

---

## 🌟 The Core Problem

Indian homebuyers face massive information asymmetry and fraud risk:
- **1.5 lakh+** RERA-registered projects across 35 states and UTs.
- **1.47 lakh+** buyer complaints disposed of by RERA authorities nationwide.
- **6 disjointed checks** required per property (RERA registration, marketing claim mismatches, promoter litigation record, eCourts/NCLT signals, municipal plan sanctions, public reputation).
- Homebuyers and loan underwriters spend **hours hopping across archaic government portals** with no unified evidence audit trail.

---

## 💡 The Ghar Search Solution

Ghar Search condenses hours of complex due diligence into a **sub-90-second automated verification dossier**:

1. **Intake & Claim Extraction**: Homebuyer inputs a property URL or RERA ID. TinyFish Web Agents extract claims (promoter name, possession date, total units, promised amenities).
2. **Parallel 6-Check Fan-Out**: LangGraph orchestrates concurrent verification workers:
   - 🏛️ **RERA Status & Expiry**: MahaRERA / State RERA validity, completion certificate, complaints.
   - 📋 **Claim vs Disclosure Match**: Detects missed possession dates and mismatched unit counts.
   - 👤 **Promoter Track Record**: Background checks on directors, prior defaulted projects.
   - ⚖️ **Court & Tribunal Signals**: eCourts and NCLT insolvency case queries.
   - ✅ **Statutory Approvals**: Municipal sanctions, Fire NOC, environmental clearances.
   - 🌐 **Public Reputation**: Consumer forum grievances and news sentiment.
3. **Deterministic 0–100 Trust Score**: Evaluated by a pure mathematical rule engine (no LLM hallucination in the math).
4. **Evidence-First Dossier**: Every finding links to an immutable source URL, machine timestamp, and captured screenshot.
5. **Real-Time Live UI & PDF Export**: Homebuyers watch checks complete live over WebSockets and can export a branded PDF report.

---

## 🏗️ System Architecture

```
                  ┌────────────────────────────────────────┐
                  │       Experience Layer (Next.js 14)    │
                  │  Search · Live Rail · Report · Monitor │
                  └───────────────────┬────────────────────┘
                                      │ HTTP / WS
                                      ▼
                  ┌────────────────────────────────────────┐
                  │      Worker Gateway (FastAPI)          │
                  │     /api/v1/verify · /api/v1/report    │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │     LangGraph Orchestration Engine     │
                  │   Intake → Extractor → Parallel Fan-out│
                  └──┬────────┬────────┬────────┬───────┬──┘
                     │        │        │        │       │
       ┌─────────────┴──┐ ┌───┴────┐ ┌─┴──────┐ ┌┴──────┴─┐
       │ RERA Checker   │ │ Claims │ │ Court  │ │ Approvals│ ...
       └─────────────┬──┘ └───┬────┘ └─┬──────┘ └┬────────┘
                     │        │        │         │
                     ▼        ▼        ▼         ▼
                  ┌────────────────────────────────────────┐
                  │        TinyFish Web Agent APIs         │
                  │  Search · Fetch · Agent · Stealth CDP  │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │     Supabase Persistence & Realtime    │
                  │  Postgres 15 · Storage · RLS · pg_cron │
                  └────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```
ghar-search/
├── frontend/                     # Next.js 14 App Router, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/                  # Routes: /, /report/[id], /dashboard
│   │   ├── components/           # TrustGauge, ProgressRail, EvidenceCard, Navbar
│   │   └── lib/                  # Supabase client, API client, TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
│
├── worker/                       # Python 3.12, FastAPI, LangGraph
│   ├── core/                     # Supabase client, configuration settings
│   ├── intelligence/             # Pydantic schemas, Deterministic Rule Engine, Summarizer
│   ├── tools/                    # TinyFish Search, Fetch, Agent, Browser API client
│   ├── graphs/                   # LangGraph verification workflow (parallel fan-out/fan-in)
│   ├── fixtures/                 # Pre-vetted demo properties (Clean, Delayed, High-Risk)
│   ├── tests/                    # Pytest test suite for rule engine & schemas
│   ├── main.py                   # FastAPI application entry point
│   ├── requirements.txt
│   └── Dockerfile
│
├── supabase/
│   └── migrations/               # 001_initial_schema.sql (Postgres DDL, RLS, Realtime)
│
├── docker-compose.yml            # Multi-container local orchestration
├── .env.example                  # Environment configuration blueprint
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js ≥ 18.17.0
- Python ≥ 3.12
- Git

### 2. Clone & Setup
```bash
git clone https://github.com/farhanmallik05/ghar-search.git
cd ghar-search
cp .env.example .env
```

### 3. Worker (Backend)
```bash
cd worker
python -m venv .venv
source .venv/Scripts/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run unit tests
pytest tests/ -v

# Start FastAPI worker
python main.py
```
Worker will be live at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 4. Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with Ghar Search.

---

## 👥 Team — HackIIITD 2026

- **Farhan Rahaman Mallik** — Team Lead, AI Agents & Full-Stack
- **Piyush Kumar Gautam** — UI / Frontend Developer
