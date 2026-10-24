"""Unified Ghar Search Test Suite Orchestrator.

Systematically audits and runs all test tiers:
1. Node.js Empirical Stress & Asset Integrity Suite (Milestone 1)
2. Pytest Unit, Invariant, Adversarial, and Integration Suite
"""

import sys
import subprocess
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

def run_step(name: str, cmd: list) -> bool:
    print(f"\n========================================================")
    print(f">> RUNNING: {name}")
    print(f">> COMMAND: {' '.join(cmd)}")
    print(f"========================================================")
    start = time.time()
    res = subprocess.run(cmd, cwd=str(REPO_ROOT))
    duration = time.time() - start
    if res.returncode == 0:
        print(f"\n[OK] {name} passed in {duration:.2f}s")
        return True
    else:
        print(f"\n[FAIL] {name} failed with exit code {res.returncode}")
        return False

def main():
    print("=" * 60)
    print("GHAR SEARCH UNIFIED COMPREHENSIVE TEST RUNNER")
    print("=" * 60)

    steps = [
        ("Milestone 1 Node Empirics & Asset Integrity", ["node", "tests/test_m1_empirics.mjs"]),
        ("Python Pytest Comprehensive Test Suite", [sys.executable, "-m", "pytest", "-v"]),
    ]

    all_passed = True
    for name, cmd in steps:
        if not run_step(name, cmd):
            all_passed = False
            break

    print("\n" + "=" * 60)
    if all_passed:
        print("ALL TEST SUITES PASSED SUCCESSFULLY (100% GREEN)")
        print("=" * 60)
        sys.exit(0)
    else:
        print("TEST SUITE ENCOUNTERED FAILURES")
        print("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()
