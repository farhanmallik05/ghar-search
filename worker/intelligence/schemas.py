from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CheckType(str, Enum):
    RERA_STATUS = "rera_status"
    CLAIM_MATCH = "claim_match"
    PROMOTER_RECORD = "promoter_record"
    COURT_SIGNALS = "court_signals"
    APPROVALS = "approvals"
    REPUTATION = "reputation"

class CheckStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FLAGGED = "flagged"
    FAILED = "failed"
    TIMEOUT = "timeout"
    NEEDS_REVIEW = "needs_review"

class TrustLabel(str, Enum):
    HIGH_TRUST = "High Trust"
    MODERATE_RISK = "Moderate Risk"
    HIGH_RISK = "High Risk"
    CRITICAL_ALERT = "Critical Alert"
    PENDING = "Pending"

class ManualDetails(BaseModel):
    project_name: Optional[str] = None
    promoter_name: Optional[str] = None
    rera_number: Optional[str] = None
    state: Optional[str] = "Maharashtra"
    city: Optional[str] = None
    address: Optional[str] = None

class PropertyInput(BaseModel):
    property_url: Optional[str] = None
    manual_details: Optional[ManualDetails] = None
    user_id: Optional[str] = "anonymous"
    priority: Optional[str] = "normal"

class PropertyClaims(BaseModel):
    project_name: str
    promoter_name: str
    rera_id: Optional[str] = None
    state: str = "Maharashtra"
    city: Optional[str] = None
    claimed_completion_date: Optional[str] = None
    total_units: Optional[int] = None
    approved_floors: Optional[int] = None
    claimed_amenities: List[str] = Field(default_factory=list)
    confidence: float = 1.0

class EvidenceItem(BaseModel):
    url: str
    title: str
    snippet: str
    screenshot_url: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    verified: bool = True

class CheckResult(BaseModel):
    check_type: CheckType
    status: CheckStatus = CheckStatus.PENDING
    score_contribution: int = 0
    max_score: int = 0
    findings: List[str] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    credits_used: int = 0
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

class ScoreDeduction(BaseModel):
    rule: str
    dimension: str
    points_deducted: int
    reason: str
    evidence_ref: Optional[str] = None

class TrustScoreBreakdown(BaseModel):
    total_score: int
    label: TrustLabel
    dimension_scores: Dict[str, int]
    max_dimension_scores: Dict[str, int]
    deductions: List[ScoreDeduction] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)

class VerificationReport(BaseModel):
    report_id: str
    property_id: str
    status: str
    property_details: Dict[str, Any]
    claims: Optional[PropertyClaims] = None
    trust_score: Optional[int] = None
    trust_label: Optional[TrustLabel] = None
    breakdown: Optional[TrustScoreBreakdown] = None
    summary: Dict[str, Any] = Field(default_factory=dict)
    checks: List[CheckResult] = Field(default_factory=list)
    pdf_url: Optional[str] = None
    credits_consumed: int = 0
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    completed_at: Optional[str] = None

class WatchlistCreateRequest(BaseModel):
    report_id: str
    alert_threshold: int = 10
    notify_email: bool = True
    notify_webhook: Optional[str] = None

class HITLResolveRequest(BaseModel):
    report_id: str
    check_type: str
    resolution_data: Dict[str, Any]
