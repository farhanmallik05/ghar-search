"""State-Specific RERA Registration Format Parser and Heuristic Validation Engine.

Provides deterministic syntactic and structural validation of Indian Real Estate
Regulatory Authority (RERA) registration numbers across major Indian jurisdictions:
- Maharashtra (MahaRERA)
- Uttar Pradesh (UP RERA)
- Karnataka (K-RERA)
- Delhi (D-RERA)
- Haryana (HRERA Panchkula / Gurugram)
- Telangana (T-RERA)
- Tamil Nadu (TNRERA)
- Gujarat (GujRERA)
"""

import re
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class ReraValidationResult(BaseModel):
    """Result payload from the state-specific RERA format validator."""
    is_valid: bool = Field(..., description="Whether the ID matches a recognized RERA syntax")
    input_id: str = Field(..., description="Raw input string")
    normalized_id: str = Field(..., description="Cleaned, normalized RERA registration string")
    detected_state: Optional[str] = Field(None, description="Auto-detected Indian state or UT")
    format_name: str = Field("Unknown", description="Name of the statutory registration format")
    authority_portal: Optional[str] = Field(None, description="Official state RERA portal URL")
    confidence: float = Field(0.0, description="Heuristic confidence score (0.0 to 1.0)")
    notes: List[str] = Field(default_factory=list, description="Parsing or sanity notes")

# Official State Authority Portals
STATE_AUTHORITY_PORTALS: Dict[str, str] = {
    "Maharashtra": "https://maharera.mahaonline.gov.in",
    "Uttar Pradesh": "https://up-rera.in",
    "Karnataka": "https://rera.karnataka.gov.in",
    "Delhi": "https://rera.delhi.gov.in",
    "Haryana": "https://haryanarera.gov.in",
    "Telangana": "https://rera.telangana.gov.in",
    "Tamil Nadu": "https://rera.tn.gov.in",
    "Gujarat": "https://gujrera.gujarat.gov.in",
}

# Regex Pattern Rules per Authority
# 1. MahaRERA: Starts with P5 followed by 10 digits (MahaRERA standard regional code 5)
MAHARERA_PATTERN = re.compile(r"^P5\d{10}$", re.IGNORECASE)

# 2. UP RERA: Starts with UPRERAPRJ followed by 4 to 8 digits (e.g. UPRERAPRJ123456)
UPRERA_PATTERN = re.compile(r"^UPRERAPRJ\d{4,8}$", re.IGNORECASE)

# 3. Karnataka RERA: Standard complex slash format or short format
# e.g., PRM/KA/RERA/1251/310/PR/171015/000456 or PR/KN/170730/000123
KARNATAKA_PATTERN = re.compile(
    r"^(PRM/KA/RERA/\d+/\d+/PR/\d{6}/\d+|PR/KN/\d{6}/\d+|KA/RERA/\d+/\d+)$",
    re.IGNORECASE
)

# 4. Delhi RERA: Format like DLRERA2019P0001 or DLRERA/PRJ/2020/001
DELHI_PATTERN = re.compile(
    r"^(DLRERA\d{4}P\d{4}|DLRERA/PRJ/\d{4}/\d+|DLRERA\d{6,8})$",
    re.IGNORECASE
)

# 5. Haryana RERA (HRERA): HRERA-PKL-GGM-123-2021 or HRERA(Reg.)123/2019 or HRERA/GGM/123/2020
HARYANA_PATTERN = re.compile(
    r"^(HRERA[-/](?:PKL|GGM|REG)[-/].+|HRERA\([A-Z.]+\)\d+/\d{4}|HRERA\d{3,6})$",
    re.IGNORECASE
)

# 6. Telangana RERA: P02400000123 or TSRERA... (02 is Telangana authority prefix)
TELANGANA_PATTERN = re.compile(
    r"^(P02[0-9]{9}|TSRERA\d{6,8})$",
    re.IGNORECASE
)

# 7. Tamil Nadu RERA: TN/01/Building/0123/2022 or TN/29/Building/0001/2024
TAMILNADU_PATTERN = re.compile(
    r"^TN/\d{2}/(?:BUILDING|LAYOUT)/\d+/\d{4}$",
    re.IGNORECASE
)

# 8. Gujarat RERA: PR/GJ/...
GUJARAT_PATTERN = re.compile(
    r"^PR/GJ/[A-Z0-9/_-]+$",
    re.IGNORECASE
)

# Generic fallback pattern: contains RERA or alphanumeric sequence of length 8-35
GENERIC_RERA_PATTERN = re.compile(r"^[A-Z0-9/-]{8,35}$", re.IGNORECASE)


def normalize_rera_id(raw_id: str) -> str:
    """Cleans and standardizes whitespace and delimiters in raw RERA inputs."""
    if not raw_id:
        return ""
    # Strip whitespace, collapse multi-spaces
    cleaned = raw_id.strip()
    # Normalize multiple slashes to single slashes
    cleaned = re.sub(r"/+", "/", cleaned)
    # Normalize multiple hyphens to single hyphen
    cleaned = re.sub(r"-+", "-", cleaned)
    return cleaned.upper()


def validate_rera_number(raw_id: str, state_hint: Optional[str] = None) -> ReraValidationResult:
    """Validates and detects the state jurisdiction for an Indian RERA registration ID.
    
    Args:
        raw_id: The input RERA string (e.g. 'P52100012345', 'UPRERAPRJ123456')
        state_hint: Optional state name provided by caller for targeted verification
        
    Returns:
        ReraValidationResult object with validation verdict, normalized ID, and metadata.
    """
    if not raw_id or not raw_id.strip():
        return ReraValidationResult(
            is_valid=False,
            input_id=raw_id or "",
            normalized_id="",
            notes=["RERA registration ID is empty."]
        )

    norm_id = normalize_rera_id(raw_id)

    # 1. MahaRERA Check
    if MAHARERA_PATTERN.match(norm_id):
        return ReraValidationResult(
            is_valid=True,
            input_id=raw_id,
            normalized_id=norm_id,
            detected_state="Maharashtra",
            format_name="MahaRERA Project Identifier (P + 11 digits)",
            authority_portal=STATE_AUTHORITY_PORTALS["Maharashtra"],
            confidence=0.98,
            notes=["Matched official Maharashtra MahaRERA 12-character format specification."]
        )

    # 2. UP RERA Check
    if UPRERA_PATTERN.match(norm_id):
        return ReraValidationResult(
            is_valid=True,
            input_id=raw_id,
            normalized_id=norm_id,
            detected_state="Uttar Pradesh",
            format_name="UP RERA Project Registration (UPRERAPRJ prefix)",
            authority_portal=STATE_AUTHORITY_PORTALS["Uttar Pradesh"],
            confidence=0.99,
            notes=["Matched official Uttar Pradesh UP RERA canonical project format."]
        )

    # 3. Karnataka RERA Check
    if KARNATAKA_PATTERN.match(norm_id):
        return ReraValidationResult(
            is_valid=True,
            input_id=raw_id,
            normalized_id=norm_id,
            detected_state="Karnataka",
            format_name="K-RERA Multi-Segment Identifier",
            authority_portal=STATE_AUTHORITY_PORTALS["Karnataka"],
            confidence=0.95,
            notes=["Matched Karnataka K-RERA segmented statutory format."]
        )

    # 4. Delhi RERA Check
    if DELHI_PATTERN.match(norm_id):
        return ReraValidationResult(
            is_valid=True,
            input_id=raw_id,
            normalized_id=norm_id,
            detected_state="Delhi",
            format_name="Delhi D-RERA Project Registration",
            authority_portal=STATE_AUTHORITY_PORTALS["Delhi"],
            confidence=0.95,
            notes=["Matched Delhi RERA registration format."]
        )

    # 5. Haryana HRERA Check
    if HARYANA_PATTERN.match(norm_id):
        return ReraValidationResult(
            is_valid=True,
            input_id=raw_id,
            normalized_id=norm_id,
            detected_state="Haryana",
            format_name="HRERA Authority Identifier",
            authority_portal=STATE_AUTHORITY_PORTALS["Haryana"],
            confidence=0.95,
            notes=["Matched Haryana HRERA registration format."]
        )

    # 6. Telangana RERA Check
    if TELANGANA_PATTERN.match(norm_id):
        return ReraValidationResult(
            is_valid=True,
            input_id=raw_id,
            normalized_id=norm_id,
            detected_state="Telangana",
            format_name="Telangana T-RERA Registration Code",
            authority_portal=STATE_AUTHORITY_PORTALS["Telangana"],
            confidence=0.92,
            notes=["Matched Telangana T-RERA registration code pattern."]
        )

    # 7. Tamil Nadu RERA Check
    if TAMILNADU_PATTERN.match(norm_id):
        return ReraValidationResult(
            is_valid=True,
            input_id=raw_id,
            normalized_id=norm_id,
            detected_state="Tamil Nadu",
            format_name="TNRERA Statutory Building Code",
            authority_portal=STATE_AUTHORITY_PORTALS["Tamil Nadu"],
            confidence=0.96,
            notes=["Matched Tamil Nadu TNRERA building/layout registration syntax."]
        )

    # 8. Gujarat RERA Check
    if GUJARAT_PATTERN.match(norm_id):
        return ReraValidationResult(
            is_valid=True,
            input_id=raw_id,
            normalized_id=norm_id,
            detected_state="Gujarat",
            format_name="GujRERA Standard Project String",
            authority_portal=STATE_AUTHORITY_PORTALS["Gujarat"],
            confidence=0.94,
            notes=["Matched Gujarat GujRERA canonical project structure."]
        )

    # State Hint Fallback Validation
    if state_hint and state_hint in STATE_AUTHORITY_PORTALS:
        if GENERIC_RERA_PATTERN.match(norm_id):
            return ReraValidationResult(
                is_valid=True,
                input_id=raw_id,
                normalized_id=norm_id,
                detected_state=state_hint,
                format_name=f"Generic Statutory Format ({state_hint} Hint)",
                authority_portal=STATE_AUTHORITY_PORTALS.get(state_hint),
                confidence=0.75,
                notes=[f"Validated against generic RERA alphanumeric format using state hint: {state_hint}."]
            )

    # Generic Alphanumeric Pattern Matching (Unknown State)
    if GENERIC_RERA_PATTERN.match(norm_id):
        return ReraValidationResult(
            is_valid=True,
            input_id=raw_id,
            normalized_id=norm_id,
            detected_state=None,
            format_name="Generic Alphanumeric Registration",
            authority_portal=None,
            confidence=0.60,
            notes=["Matches standard statutory length and alphanumeric pattern, but state authority is ambiguous."]
        )

    return ReraValidationResult(
        is_valid=False,
        input_id=raw_id,
        normalized_id=norm_id,
        detected_state=None,
        format_name="Invalid / Unrecognized",
        authority_portal=None,
        confidence=0.0,
        notes=["Does not match any recognized Indian state RERA registration syntax."]
    )
