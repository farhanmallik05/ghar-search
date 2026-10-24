"""Standalone CLI Runner for Ghar Search E2E Test Suite.
Executes Tiers 1-4 with detailed console output, per-tier breakdown, and JSON reporting.
Usage:
    python e2e_tests/runner.py
    python e2e_tests/runner.py --tier 1
    python e2e_tests/runner.py --json report.json
"""

import os
import sys
import time
import json
import argparse
from datetime import datetime, timezone
import pytest

# Ensure worker directory is on sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WORKER_DIR = os.path.join(BASE_DIR, "worker")
if WORKER_DIR not in sys.path:
    sys.path.insert(0, WORKER_DIR)

TIER_FILES = {
    1: ("Tier 1: Feature Coverage (>=5 per feature)", "e2e_tests/test_tier1_features.py"),
    2: ("Tier 2: Boundary & Corner Cases (>=5 per feature)", "e2e_tests/test_tier2_boundaries.py"),
    3: ("Tier 3: Cross-Feature Interactions", "e2e_tests/test_tier3_interactions.py"),
    4: ("Tier 4: Real-World Scenarios", "e2e_tests/test_tier4_scenarios.py"),
    5: ("Tier 5: Stage 2 Features (Bulk, Compare, Watchlist Re-check, PDF)", "e2e_tests/test_tier5_stage2.py"),
}


class E2EReporterPlugin:
    """Pytest plugin to capture granular test results for console and JSON reporting."""

    def __init__(self):
        self.results = []

    def pytest_runtest_logreport(self, report):
        if report.when == "call":
            self.results.append({
                "nodeid": report.nodeid,
                "name": report.location[2],
                "outcome": report.outcome,
                "duration": report.duration,
                "error": str(report.longrepr) if report.failed else None
            })


def run_tier(tier_num: int, tier_title: str, file_path: str):
    """Executes a single test tier and returns summary metrics."""
    abs_path = os.path.join(BASE_DIR, file_path)
    if not os.path.exists(abs_path):
        print(f"  [ERROR] File not found: {abs_path}")
        return {"tier": tier_num, "title": tier_title, "total": 0, "passed": 0, "failed": 0, "duration": 0.0, "tests": []}

    plugin = E2EReporterPlugin()
    t0 = time.time()
    exit_code = pytest.main([abs_path, "-q", "--tb=no"], plugins=[plugin])
    elapsed = time.time() - t0

    passed = sum(1 for r in plugin.results if r["outcome"] == "passed")
    failed = sum(1 for r in plugin.results if r["outcome"] == "failed")
    total = len(plugin.results)

    return {
        "tier": tier_num,
        "title": tier_title,
        "file": file_path,
        "total": total,
        "passed": passed,
        "failed": failed,
        "duration": round(elapsed, 3),
        "tests": plugin.results
    }


def main():
    parser = argparse.ArgumentParser(description="Ghar Search E2E Test Suite Runner")
    parser.add_argument("--tier", type=int, choices=[1, 2, 3, 4, 5], help="Run a specific tier only")
    parser.add_argument("--json", type=str, help="Output JSON report to specified path")
    args = parser.parse_args()

    print("\n" + "=" * 76)
    print("  GHAR SEARCH — E2E TEST RUNNER (STAGE 1 & 2)")
    print("  Indian Homebuyer Agentic Property Due-Diligence Engine")
    print(f"  Started at: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 76 + "\n")

    tiers_to_run = [args.tier] if args.tier else [1, 2, 3, 4, 5]
    tier_reports = []
    total_passed = 0
    total_failed = 0
    total_duration = 0.0

    for t_num in tiers_to_run:
        title, rel_path = TIER_FILES[t_num]
        print(f"--> Running {title} [{rel_path}]...")
        report = run_tier(t_num, title, rel_path)
        tier_reports.append(report)

        total_passed += report["passed"]
        total_failed += report["failed"]
        total_duration += report["duration"]

        status_str = "PASS" if report["failed"] == 0 and report["total"] > 0 else "FAIL"
        print(f"    Result: {status_str} | Passed: {report['passed']}/{report['total']} | Duration: {report['duration']}s\n")

    total_tests = total_passed + total_failed

    print("-" * 76)
    print("  E2E TEST EXECUTION SUMMARY")
    print("-" * 76)
    print(f"  {'Tier':<8} {'Title':<45} {'Pass':<8} {'Total':<8} {'Duration'}")
    print(f"  {'-'*6} {'-'*43} {'-'*6} {'-'*6} {'-'*8}")
    for rep in tier_reports:
        print(f"  Tier {rep['tier']:<3} {rep['title'][:43]:<45} {rep['passed']:<8} {rep['total']:<8} {rep['duration']}s")
    print("-" * 76)
    print(f"  TOTAL: {total_passed}/{total_tests} passed ({total_duration:.2f}s total)")

    verdict_passed = (total_failed == 0 and total_tests > 0)
    print("\n" + ("=" * 76))
    if verdict_passed:
        print(f"  SUCCESS: All {total_tests} tests in Tiers {tiers_to_run} passed with 100% success rate.")
    else:
        print(f"  FAILURE: {total_failed} out of {total_tests} tests failed.")
    print("=" * 76 + "\n")

    if args.json:
        json_path = os.path.abspath(args.json)
        export_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_tests": total_tests,
            "total_passed": total_passed,
            "total_failed": total_failed,
            "total_duration_seconds": round(total_duration, 3),
            "verdict": "PASS" if verdict_passed else "FAIL",
            "tiers": tier_reports
        }
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(export_data, f, indent=2)
        print(f"  JSON execution report exported to: {json_path}\n")

    sys.exit(0 if verdict_passed else 1)


if __name__ == "__main__":
    main()
