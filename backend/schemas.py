from typing import Literal

from pydantic import BaseModel, Field


Outcome = Literal[
    "VERIFIED",
    "PARTIALLY_RESOLVED",
    "UNRESOLVED",
    "INSUFFICIENT_EVIDENCE",
]


class IssueAnalysis(BaseModel):
    type: str = Field(
        description="The type of physical-world issue visible in the before image."
    )

    description: str = Field(
        description="A concise description of the original problem."
    )

    affected_object: str = Field(
        description="The physical object, surface, structure, or area affected."
    )

    severity: Literal["LOW", "MEDIUM", "HIGH"] = Field(
        description="Estimated severity of the original issue."
    )

    visual_features: list[str] = Field(
        description=(
            "Distinctive visual features that can help identify the same "
            "problem or location in the after image."
        )
    )


class ComparisonResult(BaseModel):
    same_location_likelihood: Literal[
        "HIGH",
        "MEDIUM",
        "LOW",
        "UNKNOWN",
    ] = Field(
        description=(
            "How strongly the before and after images appear to show "
            "the same physical location."
        )
    )

    issue_visible_before: bool = Field(
        description="Whether the original issue is visibly present in the before image."
    )

    issue_visible_after: bool = Field(
        description="Whether the original issue remains visibly present in the after image."
    )

    degree_of_change: Literal[
        "NONE",
        "MINOR",
        "MODERATE",
        "SUBSTANTIAL",
        "UNKNOWN",
    ] = Field(
        description="The visible degree of physical change between the two images."
    )

    physical_change_summary: str = Field(
        description="What visibly changed between the before and after evidence."
    )


class VerificationResult(BaseModel):
    outcome: Outcome = Field(
        description=(
            "Final evidence-based verification state. "
            "Do not assume the claimed resolution is true."
        )
    )

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description=(
            "Model confidence in the classification based on the available evidence. "
            "This is not a probability that the real-world claim is true."
        ),
    )

    issue: IssueAnalysis

    comparison: ComparisonResult

    evidence: list[str] = Field(
        description=(
            "Specific visual observations supporting the verification result."
        )
    )

    uncertainties: list[str] = Field(
        description=(
            "Important limitations, ambiguities, or missing evidence."
        )
    )

    reasoning_summary: str = Field(
        description=(
            "A concise explanation of why the evidence supports the final outcome."
        )
    )