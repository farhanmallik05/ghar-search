# 🏠 Ghar Search

> **"Paste a property listing. Get a verified trust report, backed by evidence from official records."**  
> An agentic due-diligence layer for Indian homebuyers and institutional mortgage underwriters, powered by autonomous web agents, LangGraph parallel fan-out, and a deterministic mathematical Trust Scoring engine.

[![HackIIITD 2026](https://img.shields.io/badge/HackIIITD-2026-blue.svg)](https://github.com/farhanmallik05/ghar-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-purple)](https://www.langchain.com/langgraph)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_15-emerald)](https://supabase.com/)
[![Pytest](https://img.shields.io/badge/Tests-85_Unit_&_Integration-brightgreen)](https://docs.pytest.org/)
[![E2E Runner](https://img.shields.io/badge/E2E-85_Tests_Passed_(5_Tiers)-success)](e2e_tests/)

---

## 🌟 The Core Problem

Indian homebuyers and mortgage lenders face massive information asymmetry and legal fraud risk:
- **1.5 lakh+** RERA-registered projects across 35 states and Union Territories.
- **1.47 lakh+** buyer complaints formally disposed of by RERA authorities nationwide.
- **6 disjointed checks** required per property (RERA registration, marketing claim mismatches, promoter litigation record, eCourts/NCLT signals, municipal plan sanctions, public reputation).
- Homebuyers, DSAs, and loan underwriters spend **hours hopping across archaic government portals** with no unified evidence audit trail.

---

## 💡 The Ghar Search Solution

Ghar Search condenses hours of complex due diligence into a **sub-90-second automated verification dossier**:

1. **Intake & Claim Extraction**: Homebuyer or underwriter inputs a property URL, RERA ID, or manual parameters. TinyFish Web Agents extract advertised claims (promoter name, possession date, total units, promised amenities).
2. **Parallel 6-Check Fan-Out**: LangGraph orchestrates concurrent verification workers:
   - 🏛️ **RERA Status & Expiry (30 pts)**: State RERA validity, completion certificates, official complaints.
   - 📋 **Claim vs Disclosure Match (20 pts)**: Detects missed possession dates and mismatched unit counts.
   - ⚖️ **Court & Tribunal Signals (20 pts)**: eCourts and NCLT insolvency case queries.
   - 👤 **Promoter Track Record (10 pts)**: Background checks on directors, prior defaulted projects.
   - ✅ **Statutory Approvals (10 pts)**: Municipal sanctions, Fire NOC, environmental clearances.
   - 🌐 **Public Reputation (10 pts)**: Consumer forum grievances and news sentiment.
3. **Deterministic 0–100 Trust Score**: Evaluated by a pure mathematical rule engine (zero LLM hallucination in the math).
4. **Evidence-First Dossier**: Every finding links to an immutable source URL, machine timestamp, and captured screenshot.
5. **Interactive Human-in-the-Loop (HIL) Gate**: When government portals present CAPTCHAs or OTP challenges, the execution engine halts and requests real-time user resolution via modal overlay.
6. **B2B Bulk Loan Underwriting (`/bulk`)**: Mortgage lenders batch-audit portfolio loan applications via CSV ingest, live progress tracking, and portfolio mean score analytics.
7. **Side-by-Side Comparison Matrix (`/compare`)**: Multi-property comparative benchmark evaluating 2–4 properties across all 6 statutory dimensions.
8. **Automated Watchlist Re-check Engine (`/dashboard`)**: Simulates nightly `pg_cron` jobs at 02:00 IST detecting delta changes in litigation or RERA status.
9. **PyMuPDF Vector PDF Export**: Generates multi-page, paginated, high-fidelity PDF dossiers ready for banking submission.

---

## 🏗️ System Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │              Experience Layer (Next.js 14)             │
                  │   Search (/) · Live Rail (/progress) · Report (/report) │
                  │  Watchlist (/dashboard) · Compare (/compare) · Bulk    │
                  └───────────────────────────┬────────────────────────────┘
                                              │ HTTP / SSE / WS
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │               Worker Gateway (FastAPI)                 │
                  │        /api/v1/verify · /api/v1/report · /compare      │
                  │    /api/v1/reports/bulk · /api/v1/watchlist/recheck    │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │            LangGraph Orchestration Engine              │
                  │          Intake → Extractor → Parallel Fan-out         │
                  └──┬─────────────┬─────────────┬─────────────┬───────────┘
                     │             │             │             │
        ┌────────────┴────┐  ┌─────┴──────┐ ┌────┴──────┐ ┌────┴────────┐
        │ RERA Checker    │  │ Claim Match│ │ Courts    │ │ Approvals   │ ...
        └────────────┬────┘  └─────┬──────┘ └────┬──────┘ └────┬────────┘
                     │             │             │             │
                     ▼             ▼             ▼             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │                TinyFish Web Agent APIs                 │
                  │  Search · Fetch · Agent · Stealth Browser · Captcha    │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │             Supabase Persistence & Realtime            │
                  │          Postgres 15 · Storage · RLS · pg_cron         │
                  └────────────────────────────────────────────────────────┘
```

---

## 🗺️ Application Routes

| Route | Functionality | Status |
|---|---|---|
| **`/`** | Listing intake (URL, RERA ID, manual details) + 3 Instant Demo Fixtures (Clean, Delayed, Flagged) | ✅ Complete |
| **`/progress/[id]`** | Real-time 6-check verification stream, agent execution terminal, and interactive HIL CAPTCHA challenge gate | ✅ Complete |
| **`/report/[id]`** | Comprehensive Due Diligence Dossier, 6-dimension breakdown, evidence links, and PyMuPDF vector PDF download | ✅ Complete |
| **`/dashboard`** | Homebuyer Watchlist with single-click and batch nightly re-check simulation (`pg_cron`) + delta alert banners | ✅ Complete |
| **`/compare`** | Multi-property side-by-side benchmark matrix (2–4 properties) with comparative AI synthesis and dimensional charts | ✅ Complete |
| **`/bulk`** | B2B Institutional Underwriting portal with CSV/manifest parser, batch progress monitoring, and portfolio risk distribution | ✅ Complete |
| **`/_not-found`** | Branded resilient 404 recovery route | ✅ Complete |

---

## 📡 REST API Reference

The FastAPI backend runs on port 8000 and exposes the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System health check and API version status |
| `GET` | `/api/v1/fixtures` | Returns canonical pre-vetted demo properties (Clean, Delayed, Flagged) |
| `POST` | `/api/v1/verify` | Enqueues a property for asynchronous verification and returns report ID |
| `GET` | `/api/v1/report/{id}` | Fetches the full due diligence report, trust score, and check evidence |
| `GET` | `/api/v1/report/{id}/pdf` | Streams a paginated, vector-rendered PyMuPDF due diligence PDF |
| `POST` | `/api/v1/hil/resolve` | Resolves a Human-in-the-Loop challenge (CAPTCHA / OTP response) |
| `GET` | `/api/v1/watchlist` | Lists all bookmarked properties in the user's due diligence watchlist |
| `POST` | `/api/v1/watchlist` | Adds a verified report to the persistent watchlist |
| `DELETE`| `/api/v1/watchlist/{id}` | Removes a property from the watchlist |
| `POST` | `/api/v1/watchlist/{id}/recheck` | Triggers single-property statutory re-check and computes delta score |
| `POST` | `/api/v1/watchlist/recheck-all` | Batch re-checks all active watchlist properties (simulates `pg_cron` at 02:00 IST) |
| `POST` | `/api/v1/compare` | Compares 2–4 properties and generates side-by-side dimensional matrices |
| `GET` | `/api/v1/compare?ids=...` | Query-param variant for sharable comparative matrix URLs |
| `POST` | `/api/v1/reports/bulk` | Ingests a batch manifest of properties for institutional underwriting |
| `GET` | `/api/v1/reports/bulk/{batch_id}` | Polls status, mean trust score, and risk tiers of a bulk underwriting run |

---

## 🏛️ Supported RERA Portals

The agent routing engine (`worker/tools/tinyfish.py`) automatically maps state identifiers to official regulatory authorities:

1. **Maharashtra**: MahaRERA (`maharera.mahaonline.gov.in`)
2. **Karnataka**: Karnataka RERA (`rera.karnataka.gov.in`)
3. **Uttar Pradesh**: UP RERA (`up-rera.in`)
4. **Haryana**: HRERA Gurugram & Panchkula (`haryanarera.gov.in`)
5. **Delhi**: Delhi RERA (`rera.delhi.gov.in`)
6. **Gujarat**: GujRERA (`gujrera.gujarat.gov.in`)
7. **Telangana**: TSRERA (`rera.telangana.gov.in`)
8. **Tamil Nadu**: TNRERA (`rera.tn.gov.in`)
9. **West Bengal**: WBHIRA / WBRERA (`rera.wb.gov.in`)

---

## 📂 Repository Structure

```
ghar-search/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI (pytest, E2E runner, Next.js build)
│
├── frontend/                     # Next.js 14 App Router, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Global layout with responsive Navbar
│   │   │   ├── page.tsx           # Home & intake screen
│   │   │   ├── progress/[id]/     # Real-time multi-agent execution stream & HIL gate
│   │   │   ├── report/[id]/       # Comprehensive Due Diligence Dossier
│   │   │   ├── dashboard/         # Watchlist & nightly re-check simulation
│   │   │   ├── compare/           # Side-by-side comparative benchmark matrix
│   │   │   └── bulk/              # B2B institutional loan underwriting portal
│   │   ├── components/           # TrustGauge, ProgressRail, EvidenceCard, HilModal
│   │   └── lib/                  # API client, TypeScript interfaces, sample data
│   ├── package.json
│   └── tailwind.config.ts
│
├── worker/                       # Python 3.12, FastAPI, LangGraph
│   ├── core/                     # Supabase client, configuration settings
│   ├── intelligence/             # Pydantic schemas, Deterministic Rule Engine, PDF Generator
│   ├── tools/                    # TinyFish Search, Fetch, Agent, Browser API client
│   ├── graphs/                   # LangGraph verification workflow (parallel fan-out/fan-in)
│   ├── fixtures/                 # Pre-vetted demo properties (Clean, Delayed, Flagged)
│   ├── tests/                    # Unit tests for rule engine, API, and PDF export
│   ├── main.py                   # FastAPI application entry point
│   └── requirements.txt
│
├── supabase/
│   └── migrations/               # 001_initial_schema.sql (Postgres DDL, RLS, Realtime)
│
├── e2e_tests/                    # Automated 80-test E2E runner across 4 tiers
│   ├── test_tier1_features.py
│   ├── test_tier2_boundaries.py
│   ├── test_tier3_interactions.py
│   ├── test_tier4_scenarios.py
│   └── runner.py
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

# Run unit and integration tests (85 tests)
pytest tests/ -v

# Start FastAPI worker
python main.py
```
Worker will be live at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 4. E2E Test Suite
```bash
# In project root with worker running or local environment:
python e2e_tests/runner.py
```

### 5. Frontend
```bash
cd ../frontend
npm install
npm run build
npm run dev
```
Open `http://localhost:3000` to interact with Ghar Search.

---

## 👥 Team — HackIIITD 2026

- **Farhan Rahaman Mallik** — Team Lead, AI Agents & Full-Stack
- **Piyush Kumar Gautam** — UI / Frontend Developer
