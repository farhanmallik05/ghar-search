# Ghar Search — E2E Testing Infrastructure (TEST_INFRA.md)

## Architecture Overview

Ghar Search is an agentic due-diligence platform for Indian homebuyers. The E2E test suite adopts an **opaque-box verification methodology**, validating system interfaces and behavioral contracts strictly from the outside without coupling to private internal implementation details.

The test infrastructure is designed around a **4-Tier Progressive Verification Hierarchy**:

```
+------------------------------------------------------------------------+
|                      Tier 4: Real-World Scenarios                      |
|  - Clean High-Trust Homebuyer Diligence                                |
|  - Delayed Project with Consumer Litigation & Extension                |
|  - Insolvent / Demolition Flagged Builder Critical Alert               |
|  - Live Web Portal Extraction & Manual Offline Builder Details         |
+------------------------------------------------------------------------+
                                   ▲
+------------------------------------------------------------------------+
|                 Tier 3: Cross-Feature Interactions                     |
|  - Verify -> Report -> Watchlist -> PDF Export Lifecycle               |
|  - Fixtures -> Report Schema -> PDF Stream Consistency                 |
|  - Verify -> HITL Resolution -> Report Audit Trail                     |
|  - Multi-Property Watchlist Delta & Alert Thresholds                   |
|  - Concurrent Verification Job Isolation                               |
+------------------------------------------------------------------------+
                                   ▲
+------------------------------------------------------------------------+
|               Tier 2: Boundary & Corner Cases (>= 5 / feature)         |
|  - F1 (Verify): Whitespace, empty JSON, 2000-char URLs, nulls, scripts |
|  - F2 (Report): 404 for missing IDs, path traversal, case sensitivity  |
|  - F3 (PDF): 404 on invalid IDs, HTTP 409 on queued/running jobs       |
|  - F4 (Fixtures): HTTP 405 on POST/PUT, query param resilience, schemas|
|  - F5 (Watchlist): 404 on missing report, thresholds [0, 100], missing |
|  - F6 (HITL): HTTP 422 on missing fields, empty data, unknown checks   |
|  - F7 (Math): Strict bounds [0, 100], clamp overflow, label boundaries |
+------------------------------------------------------------------------+
                                   ▲
+------------------------------------------------------------------------+
|                 Tier 1: Feature Coverage (>= 5 / feature)              |
|  - F1: Verification Initiation (`/api/v1/verify`)                      |
|  - F2: Due-Diligence Report Retrieval (`/api/v1/report/{id}`)          |
|  - F3: PDF Dossier Export (`/api/v1/report/{id}/pdf`)                  |
|  - F4: Interactive Demo Fixtures (`/api/v1/fixtures`)                  |
|  - F5: Watchlist Monitoring & Deltas (`/api/v1/watchlist`)             |
|  - F6: Human-in-the-Loop Task Resolution (`/api/v1/hil/resolve`)       |
|  - F7: Deterministic 0–100 Scoring Math Across 6 Dimensions            |
+------------------------------------------------------------------------+
```

---

## Directory & File Layout

```
ghar-search/
├── e2e_tests/
│   ├── __init__.py                     # Package declaration
│   ├── conftest.py                     # Shared fixtures, TestClient initialization & store resets
│   ├── test_tier1_features.py          # Tier 1: 35 tests (7 features × 5 tests each)
│   ├── test_tier2_boundaries.py        # Tier 2: 35 tests (7 features × 5 boundary tests each)
│   ├── test_tier3_interactions.py      # Tier 3: 5 multi-step cross-feature workflows
│   ├── test_tier4_scenarios.py         # Tier 4: 5 authentic Indian real estate end-to-end scenarios
│   └── runner.py                       # Standalone CLI execution runner with ANSI reports & JSON output
├── TEST_INFRA.md                       # Test architecture documentation (this document)
├── TEST_READY.md                       # Test readiness declaration and execution manifest
```

---

## Authoritative Expected Output Derivation

All assertions are mathematically and specification-grounded:
1. **Scoring Invariants**:
   - `total_score == sum(dimension_scores.values()) == sum(check.score_contribution for check in checks)`
   - Score boundaries: `0 <= total_score <= 100`
   - Weight constraints: `RERA_STATUS (30) + CLAIM_MATCH (20) + COURT_SIGNALS (20) + PROMOTER_RECORD (10) + APPROVALS (10) + REPUTATION (10) == 100`
   - Tier labels:
     - `total_score >= 80` -> `High Trust`
     - `60 <= total_score < 80` -> `Moderate Risk`
     - `40 <= total_score < 60` -> `High Risk`
     - `total_score < 40` -> `Critical Alert`
2. **Canonical Fixture Baselines**:
   - `rpt_sunshine_clean`: 92/100 (`High Trust`), 0 litigation, RERA active, zero delta.
   - `rpt_green_valley_delayed`: 68/100 (`Moderate Risk`), -10 delay, -8 dispute, -4 fire NOC.
   - `rpt_royal_empire_flagged`: 18/100 (`Critical Alert`), -20 NCLT insolvency, -20 revocation, -8 unauthorized floors, -6 demolition notice, -8 police protests.
3. **HTTP Protocol & Payload Standards**:
   - Verification initiation: `202 Accepted` with `report_id`, `status: "queued"`.
   - Watchlist creation: `201 Created` with `watchlist_id: "wl_*"` and `status: "active"`.
   - Missing resources: `404 Not Found` with structured error detail.
   - Incomplete verification PDF export: `409 Conflict`.
   - Invalid or empty payload: `400 Bad Request` or `422 Unprocessable Entity`.
   - PDF stream: binary stream starting with magic bytes `b"%PDF"` and `Content-Type: application/pdf`.

---

## Test Execution Instructions

### Option 1: Standalone CLI Runner (Recommended)
Executes all tiers, displays formatted tier breakdown, and outputs test execution metrics:
```bash
python e2e_tests/runner.py
```
Outputs:
- Live test execution counter and status indicators
- Summary metrics: total tests, passed, failed, duration
- Optional JSON artifact: `e2e_test_report.json`

### Option 2: Full Pytest Execution
Run all 80 tests using pytest:
```bash
pytest e2e_tests/ -v
```

### Option 3: Targeted Tier Execution
```bash
# Tier 1 only
pytest e2e_tests/test_tier1_features.py -v

# Tier 2 only
pytest e2e_tests/test_tier2_boundaries.py -v

# Tier 3 only
pytest e2e_tests/test_tier3_interactions.py -v

# Tier 4 only
pytest e2e_tests/test_tier4_scenarios.py -v
```

---

## Integrity & Non-Facade Guarantees
- **No Mock Bypasses**: Tests issue genuine HTTP requests against the FastAPI application gateway.
- **Dynamic Calculation Verification**: Assertions check runtime scoring outputs against mathematical summation rules, not hardcoded stub responses.
- **Zero Tolerance for Facade Tests**: Every test assertion evaluates actual business logic outputs, status codes, header values, and binary stream contents.
