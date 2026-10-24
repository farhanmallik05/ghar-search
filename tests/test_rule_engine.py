"""Root test forwarding module for Rule Engine and Invariant tests."""

from worker.tests.test_rule_engine import (
    test_max_dimension_scores_sum_to_100,
    test_clean_property_fixture_scoring,
    test_delayed_property_fixture_scoring,
    test_flagged_property_fixture_scoring,
    test_empty_checks_yields_zero_score,
    test_score_boundaries_never_exceed_limits,
    test_verification_graph_end_to_end,
    test_verification_graph_live_url_extraction,
    test_strict_scoring_equality_invariant_all_fixtures,
    test_strict_scoring_equality_invariant_dynamic_inputs,
    test_scoring_math_synthetic_permutations,
)

__all__ = [
    "test_max_dimension_scores_sum_to_100",
    "test_clean_property_fixture_scoring",
    "test_delayed_property_fixture_scoring",
    "test_flagged_property_fixture_scoring",
    "test_empty_checks_yields_zero_score",
    "test_score_boundaries_never_exceed_limits",
    "test_verification_graph_end_to_end",
    "test_verification_graph_live_url_extraction",
    "test_strict_scoring_equality_invariant_all_fixtures",
    "test_strict_scoring_equality_invariant_dynamic_inputs",
    "test_scoring_math_synthetic_permutations",
]
