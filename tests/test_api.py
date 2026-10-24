"""Root test forwarding module for API endpoints."""

from worker.tests.test_api import (
    test_health_check_endpoint,
    test_fixtures_endpoint,
    test_verify_and_retrieve_report_flow,
    test_watchlist_endpoints,
    test_hitl_resolve_endpoint,
    test_pdf_report_export,
    test_pdf_report_export_all_fixtures_pymupdf_structure,
    test_pdf_export_queued_and_running_guard_409,
    test_pdf_generator_none_value_resilience,
    test_verify_empty_payload_validation,
    test_nonexistent_report_404,
)

__all__ = [
    "test_health_check_endpoint",
    "test_fixtures_endpoint",
    "test_verify_and_retrieve_report_flow",
    "test_watchlist_endpoints",
    "test_hitl_resolve_endpoint",
    "test_pdf_report_export",
    "test_pdf_report_export_all_fixtures_pymupdf_structure",
    "test_pdf_export_queued_and_running_guard_409",
    "test_pdf_generator_none_value_resilience",
    "test_verify_empty_payload_validation",
    "test_nonexistent_report_404",
]
