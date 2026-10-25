# 🎯 Mentoring Strategy — Ghar Search @ HackIIITD 2026

> **Team**: Farhan Rahaman Mallik (AI/Full-Stack) + Piyush Kumar Gautam (UI/Frontend)
> **Project**: Agentic property due-diligence platform for Indian homebuyers
> **Hackathon**: HackIIITD 2026 @ IIT Delhi

---

## 1. Purpose of Mentoring Sessions

Mentoring at a 24-hour hackathon is not casual conversation — it is **targeted intelligence gathering**. Every 15-minute mentor slot must yield at least one concrete decision, one architectural validation, or one risk de-risked. The three core purposes are:

### 1.1 Technical Validation
Confirm that our chosen stack (LangGraph + TinyFish + Supabase + Next.js) is not overengineered for a 24-hour build. Get early warnings on integration traps before we hit them at hour 18.

### 1.2 Domain Credibility
Judges at a PropTech track will include people who know RERA, Indian real estate law, and fraud patterns. We need mentors who can sharpen our problem framing so our pitch resonates as *insider knowledge*, not a student guess.

### 1.3 Business Model Pressure-Testing
The most common question after a good technical demo is: *"So how do you make money?"* Mentor sessions are rehearsal space for that answer before it gets asked on stage.

### 1.4 Confidence Calibration
Mentors can tell us if we're thinking too small or overcomplicating. Their perspective recalibrates scope during the hack, which can save 4–6 hours of wasted building.

---

## 2. Mentor Types to Seek

| Priority | Mentor Type | What to Look For | When to Approach |
|----------|-------------|------------------|------------------|
| 🔴 Critical | **Technical Mentor** — AI/Agents/LangGraph | Has shipped LLM pipelines in production; knows rate limits in real environments | H2–H6 (before deep build begins) |
| 🔴 Critical | **Domain Mentor** — PropTech / RERA | Works in real estate tech, legal-tech, or consumer protection; knows Indian property laws | H4–H10 |
| 🟡 Important | **Business Mentor** — GTM / Pricing / VC | Has advised startups, done SaaS pricing, or evaluates B2C tools | H14–H20 (after MVP is stable) |
| 🟢 Optional | **Design / UX Mentor** | Has opinion on onboarding flows, trust signals in fintech/proptech | H8–H12 |

---

## 3. Questions to Ask Technical Mentors (15+)

> **Context to give first**: *"We're building a 5-layer agent pipeline: Next.js → FastAPI → LangGraph orchestrator → TinyFish property APIs → Supabase. The agent does property due-diligence in 5 dimensions: legal status, RERA compliance, builder history, locality safety, and price fairness."*

### LangGraph Architecture
1. Should we use a **StateGraph or MessageGraph** for a pipeline where each node is an independent API call with retries? What's the failure recovery story?
2. How do we handle **partial pipeline failures** gracefully — if TinyFish returns a 429 on node 3, do we checkpoint and resume or restart?
3. Is it worth implementing **LangGraph's persistence layer** for a 24-hour hack, or should we fake it with Supabase direct writes?
4. What's your recommended pattern for **parallel sub-agent execution** within a single LangGraph run — `Send()` API or separate async tasks?
5. How do we prevent **LLM hallucination in the rule engine layer** where we're classifying risk as Red/Amber/Green? Should we constrain output with structured JSON schema + Pydantic?

### TinyFish & External APIs
6. TinyFish has rate limits — what's the safest **caching strategy** for property lookup responses (Redis vs Supabase table vs in-memory TTL)?
7. If TinyFish returns incomplete data for a property (happens with rural or new listings), how do we **communicate uncertainty** in our risk score without misleading the user?
8. Should we call TinyFish endpoints **synchronously inside LangGraph nodes** or fire them as async background tasks and poll? What's the latency implication for a live demo?

### Supabase & Backend
9. We're using Supabase Row Level Security for per-user report isolation. What's the fastest way to write **RLS policies** for a new schema without getting locked out during testing?
10. Is Supabase Realtime reliable enough to **stream agent progress updates** to the Next.js frontend during a live demo, or should we use SSE from FastAPI instead?
11. How do we handle **Supabase connection pool exhaustion** if 3 judges simultaneously click "Generate Report" during the demo?

### Next.js & Frontend
12. For **streaming LLM output** to the frontend, should we use Next.js Route Handlers with `ReadableStream`, or just proxy through FastAPI's streaming endpoint?
13. What's the right way to show a **multi-step progress tracker** (5 agent stages) in React without over-engineering state management — Zustand, Jotai, or just `useState` with SSE events?
14. Is there a risk of **CORS issues** between Next.js (Vercel) and FastAPI (Railway/Render) during a live demo? How do we pre-empt that?
15. For the demo, should we **mock any slow API calls** with pre-seeded Supabase data to ensure speed, and if so, which layer is cleanest to inject the mock?
16. How do we **degrade gracefully** on the frontend if the LangGraph pipeline times out — show partial results or a friendly error state?

---

## 4. Questions to Ask Domain Mentors (10+)

> **Context to give first**: *"We're building for Indian homebuyers who can't afford lawyers or property consultants. We aggregate RERA data, builder history, locality crime, and market pricing into a risk report."*

1. What are the **top 3 fraud patterns** in Indian residential property transactions that most homebuyers fall for and that our tool should flag?
2. Which **RERA fields** are most often falsified or omitted by builders — which data points should we weight most heavily in our risk engine?
3. Is there a legal obligation for a platform like ours to be **RERA-registered** or carry disclaimers? Can we operate as an information aggregator without liability?
4. How inconsistent is **RERA data quality across states** — are Maharashtra and Karnataka significantly better than UP or Rajasthan, and how should we communicate this?
5. What's the difference in **due-diligence needs** between a resale flat, a new under-construction project, and a builder floor — should our pipeline handle all three differently?
6. Is **locality safety scoring** using police data or news sentiment analysis considered legally sensitive or defamatory in any Indian jurisdiction we should know about?
7. From a **consumer protection standpoint**, what's the minimum a platform like ours must disclose to avoid being misleading — what's the safe harbour language?
8. Who are the **real competitors** in this space — MagicBricks, NoBroker, 99acres — do any of them offer due-diligence at this depth, or is the market genuinely unserved?
9. What would it take for a **real estate agent or developer** to see us as a threat vs a tool they'd co-opt into their own workflow?
10. If a homebuyer takes a decision based on our report and it turns out to be wrong, what's our **legal exposure** and how do we mitigate it through product design?
11. Are there **government schemes** (PMAY, Awaas Yojana) where our due-diligence tool could slot in as a mandatory or recommended step?

---

## 5. Questions to Ask Business Mentors (10+)

> **Context to give first**: *"We're two students building this at a hackathon but we're serious about taking it forward. We want to validate the business model before we pitch."*

1. For a **B2C SaaS tool** targeting homebuyers in India at ₹499–₹999 per report, what's the realistic conversion rate from free trial to paid, and is that unit economics viable?
2. Should we consider a **B2B2C model** — selling to banks, NBFCs, or housing finance companies who embed our due-diligence into their loan approval workflow?
3. What's the **CAC (Customer Acquisition Cost)** likely to be for a product like this, and how does it compare to other Indian legal-tech/proptech tools?
4. Is there a **government tender or DPDP / consumer protection alignment** angle we should be pitching for credibility and early revenue?
5. How should we think about **ARPU scaling** — is per-report pricing better than a subscription for homebuyers who buy a property once in 5 years?
6. What does a **Series A PropTech story** in India look like right now — which VCs are actively writing cheques in this space (Pi Ventures, Antler, Elevation)?
7. What **traction metrics** would an investor want to see 6 months post-hackathon — number of reports generated, repeat users, NPS?
8. Should we partner with **housing societies, RWAs, or co-working real estate platforms** for distribution, or go direct-to-consumer via Google/Meta ads?
9. Is there a **WhatsApp-first or Bharat vernacular angle** we should be designing for, given that a large segment of homebuyers are tier-2/3 city users?
10. What's the **fastest path to ₹1 lakh MRR** for a tool like this — which customer segment do we start with and why?

---

## 6. Mentor Session Template — 15-Minute Slot

Use this structure for every mentor interaction. Do not improvise the flow.

```
┌──────────────────────────────────────────────────────┐
│  MENTOR SESSION STRUCTURE — 15 MINUTES               │
├──────────────────────────────────────────────────────┤
│  [0:00 – 1:30]  HOOK & CONTEXT                       │
│  • One sentence: what we build, for whom, the pain   │
│  • "We're Ghar Search — an AI agent that does the    │
│    property due-diligence a ₹10L lawyer does, for    │
│    ₹499. Indian homebuyers are losing crores to      │
│    builder fraud."                                   │
│                                                      │
│  [1:30 – 3:30]  QUICK DEMO (if laptop is with you)  │
│  • Show the live pipeline running on a sample prop   │
│  • OR show the Figma/wireframe if still building     │
│  • Point to the 5-layer architecture diagram         │
│                                                      │
│  [3:30 – 11:00]  TARGETED QUESTIONS (max 3–4)        │
│  • Ask ONLY pre-selected questions from this doc     │
│  • Lead with the highest-risk technical/domain Q     │
│  • Let them talk — don't cut them off               │
│                                                      │
│  [11:00 – 13:00]  VALIDATION ASKS                    │
│  • "Is there anything in our approach that worries  │
│    you that we haven't asked about?"                 │
│  • "If you were judging this, what would you look   │
│    for that we might be missing?"                    │
│                                                      │
│  [13:00 – 15:00]  CAPTURE & CLOSE                   │
│  • Fill Feedback Capture Template (section 8)        │
│  • Ask: "Can we follow up after the hackathon?"      │
│  • Get LinkedIn / email if they offer               │
└──────────────────────────────────────────────────────┘
```

**Ground rules:**
- Farhan leads technical sessions. Piyush leads design/UX feedback sessions.
- Never ask more than 4 questions — deep answers beat breadth.
- Take notes in real-time using the feedback capture table below.
- Don't argue with mentor feedback during the session; absorb first.

---

## 7. Red Flags — Advice to Ignore

Not all mentor feedback is useful. Learn to filter.

| Red Flag Advice | Why It's Dangerous | What to Do |
|---|---|---|
| *"You should use Blockchain for property records"* | Technically irrelevant, adds complexity, won't ship in 24h | Nod politely, park it, ignore |
| *"Build a mobile app first"* | Wrong priority for a B2C proptech MVP; web is faster to ship | Explain web-first strategy, don't pivot |
| *"RERA data is publicly available, just scrape it"* | Legally risky, fragile, inconsistent — TinyFish exists for this reason | Explain our TinyFish integration |
| *"Why not partner with MagicBricks?"* | Classic non-answer; partnership talk at a hackathon wastes time | Acknowledge as a future channel, not now |
| *"Make it free"* | Destroys unit economics; we have API costs per report | Explain variable cost structure |
| *"You need to cover all 36 states"* | Scope creep that kills demo; we're starting with MH + DL + KA | Explain phased geographic rollout |
| *"This needs a legal disclaimer page"* | Valid concern but not a build priority at hour 10 of a hackathon | Note it as a post-hack task |
| Contradictory advice from two mentors | Happens often; don't change core architecture based on one opinion | Log both, discuss as a team, decide |

**Rule**: If advice requires changing core architecture after H10, it's almost certainly wrong to act on.

---

## 8. Feedback Capture Template

Fill one row per mentor. Keep this table updated in real-time.

| # | Mentor Name | Role / Company | Session Time | Top Insight | Critical Warning | Action Taken | Follow-up? |
|---|---|---|---|---|---|---|---|
| 1 | | | H\_\_ | | | | ☐ |
| 2 | | | H\_\_ | | | | ☐ |
| 3 | | | H\_\_ | | | | ☐ |
| 4 | | | H\_\_ | | | | ☐ |
| 5 | | | H\_\_ | | | | ☐ |

**Post-session synthesis** (fill after all mentor sessions):
- Most repeated concern: _______________
- Most surprising validation: _______________
- One thing we're changing because of mentors: _______________
- One thing we're NOT changing despite pressure: _______________

---

## 9. Mentoring Strategy — 24-Hour Flowchart

```mermaid
flowchart LR
    Start([🚀 Hackathon Begins H0]) --> Settle[H0–H2: Team Setup\nArchitecture locked\nEnvironment ready]

    Settle --> TechM1[H2–H4: 🔧 SEEK TECHNICAL MENTOR\nLangGraph + TinyFish questions\nValidate pipeline design]

    TechM1 --> Build1[H4–H8: Core Build Sprint\nFarhan: FastAPI + LangGraph\nPiyush: UI skeleton]

    Build1 --> DomainM[H8–H10: 🏠 SEEK DOMAIN MENTOR\nRERA credibility check\nFraud pattern validation]

    DomainM --> Build2[H10–H14: Integration Sprint\nAgent pipeline end-to-end\nPipeline connected to UI]

    Build2 --> TechM2[H14–H16: 🔧 OPTIONAL: 2nd TECH MENTOR\nDebug tricky integration\nPerf + demo stability]

    TechM2 --> Build3[H16–H20: Polish Sprint\nDemo flow rehearsed\nReport UI finalized]

    Build3 --> BizM[H20–H22: 💼 SEEK BUSINESS MENTOR\nPricing + GTM validation\nPitch narrative sharpen]

    BizM --> Prep[H22–H24: Pitch Prep\nDeck finalized\nDemo rehearsed 3×]

    Prep --> Demo([🎤 Demo Time!])

    style Start fill:#4CAF50,color:#fff
    style Demo fill:#2196F3,color:#fff
    style TechM1 fill:#FF9800,color:#fff
    style DomainM fill:#9C27B0,color:#fff
    style TechM2 fill:#FF9800,color:#fff
    style BizM fill:#F44336,color:#fff
```

---

## 10. Post-Hackathon Mentoring Needs

If Ghar Search advances beyond HackIIITD 2026, mentoring needs shift fundamentally from *"can we build it?"* to *"can we scale it?"*

### Immediate Post-Hack (Week 1–4)
- **Technical mentor** for production deployment — Kubernetes/Docker on GCP vs Railway vs Vercel/Supabase managed stack
- **Legal advisor** (not a mentor, an actual professional) for RERA data usage rights, liability disclaimers, and terms of service
- **Early user research** — find 10 homebuyers willing to test and give feedback; a UX mentor can help design this

### Incubation Phase (Month 1–3)
- **IIT Delhi's FITT / NIT incubator** connection — HackIIITD organizers often have these pipelines; ask judges directly
- **PropTech domain expert as advisor** — someone with equity motivation, not just a 15-minute chat
- **Revenue model validator** — B2C vs B2B2C decision needs real data; a CFO-type mentor at this stage

### Fundraising Phase (Month 3+)
- **VC associate / angel** with PropTech portfolio — Pi Ventures, Antler India, Elevation Capital, Blume Ventures
- **GTM strategist** for India Tier-1 vs Tier-2 expansion sequencing
- **Technical co-founder / CTO advisor** if the team needs to scale engineering beyond two people

### Ongoing
- Maintain the mentor relationships built at HackIIITD — send them a 2-line update every 4 weeks. Most mentors *want* to be proven right; keep them in the loop and they become advocates.

---

*Last updated: HackIIITD 2026 prep | Team: Farhan + Piyush | KCC Institute*
