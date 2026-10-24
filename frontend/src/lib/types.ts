export type CheckType =
  | 'rera_status'
  | 'claim_match'
  | 'promoter_record'
  | 'court_signals'
  | 'approvals'
  | 'reputation';

export type CheckStatus =
  | 'pending'
  | 'running'
  | 'passed'
  | 'flagged'
  | 'failed'
  | 'timeout'
  | 'needs_review';

export type TrustLabel =
  | 'High Trust'
  | 'Moderate Risk'
  | 'High Risk'
  | 'Critical Alert'
  | 'Pending';

export interface PropertyClaims {
  project_name: string;
  promoter_name: string;
  rera_id?: string;
  state: string;
  city?: string;
  claimed_completion_date?: string;
  total_units?: number;
  approved_floors?: number;
  claimed_amenities: string[];
  confidence: number;
}

export interface EvidenceItem {
  url: string;
  title: string;
  snippet: string;
  screenshot_url?: string;
  timestamp: string;
  verified: boolean;
}

export interface CheckResult {
  check_type: CheckType;
  status: CheckStatus;
  score_contribution: number;
  max_score: number;
  findings: string[];
  evidence: EvidenceItem[];
  credits_used: number;
  started_at?: string;
  completed_at?: string;
}

export interface ScoreDeduction {
  rule: string;
  dimension: string;
  points_deducted: number;
  reason: string;
  evidence_ref?: string;
}

export interface TrustScoreBreakdown {
  total_score: number;
  label: TrustLabel;
  dimension_scores: Record<string, number>;
  max_dimension_scores: Record<string, number>;
  deductions: ScoreDeduction[];
  strengths: string[];
  recommendations: string[];
}

export interface VerificationReport {
  report_id: string;
  property_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'hitl_required';
  property_details: {
    project_name: string;
    promoter_name: string;
    rera_id: string;
    state: string;
    city?: string;
    address?: string;
    listing_url?: string;
  };
  claims?: PropertyClaims;
  trust_score?: number;
  trust_label?: TrustLabel;
  breakdown?: TrustScoreBreakdown;
  summary: {
    verdict?: string;
    trust_score?: number;
    trust_label?: string;
    highlights?: string[];
    action_items?: string[];
    disclaimer?: string;
  };
  checks: CheckResult[];
  pdf_url?: string;
  credits_consumed: number;
  created_at: string;
  completed_at?: string;
  error?: string;
}

export interface WatchlistItem {
  watchlist_id: string;
  report_id?: string;
  property_name: string;
  promoter_name: string;
  rera_id: string;
  city: string;
  current_trust_score: number;
  score_delta_7d: number;
  status: string;
  last_checked_at: string;
  alert_threshold: number;
}

export interface FixtureProperty {
  key: string;
  title: string;
  badge: string;
  rera_id: string;
  project_name: string;
  promoter_name: string;
  city: string;
  state: string;
  address: string;
  listing_url: string;
}

export interface PropertyComparisonItem {
  report_id: string;
  project_name: string;
  promoter_name: string;
  rera_id: string;
  city: string;
  state: string;
  trust_score: number;
  trust_label: string;
  dimension_scores: Record<string, number>;
  key_strengths: string[];
  key_red_flags: string[];
  possession_date?: string;
  pdf_url?: string;
}

export interface CompareResponse {
  comparison_id: string;
  properties: PropertyComparisonItem[];
  dimension_comparison: Record<string, Record<string, number>>;
  comparative_verdict: string;
  winner_report_id?: string;
  generated_at: string;
}

export interface WatchlistRecheckResponse {
  watchlist_id: string;
  property_name: string;
  previous_score: number;
  current_trust_score: number;
  score_delta: number;
  alert_triggered: boolean;
  alert_message?: string;
  last_checked_at: string;
}

export interface WatchlistAlert {
  watchlist_id: string;
  property_name: string;
  delta: number;
  message: string;
}

export interface WatchlistRecheckAllResponse {
  status: string;
  total_checked: number;
  alerts_triggered: number;
  alerts: WatchlistAlert[];
  items: Array<{
    watchlist_id: string;
    property_name: string;
    current_trust_score: number;
    score_delta: number;
    alert_triggered: boolean;
    last_checked_at: string;
  }>;
  timestamp: string;
}

export interface BulkVerifyResponse {
  batch_id: string;
  total_enqueued: number;
  status: string;
  reports: Array<{
    report_id: string;
    status: string;
    project_name: string;
    trust_score?: number;
  }>;
}

