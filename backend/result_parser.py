import re


VALID_OUTCOMES = {
    "VERIFIED",
    "PARTIALLY_RESOLVED",
    "UNRESOLVED",
    "INSUFFICIENT_EVIDENCE",
}


def parse_gemini_result(text: str) -> dict:
    """
    Convert Gemini's natural-language verification response
    into a predictable VERITY result.
    """

    if not text:
        raise ValueError("Gemini returned an empty response.")

    # Normalize for searching
    normalized = text.upper()

    # Find the classification
    outcome = None

    # Order matters: check the longer/more specific outcomes first.
    if "INSUFFICIENT EVIDENCE" in normalized:
        outcome = "INSUFFICIENT_EVIDENCE"

    elif "PARTIALLY RESOLVED" in normalized:
        outcome = "PARTIALLY_RESOLVED"

    elif "UNRESOLVED" in normalized:
        outcome = "UNRESOLVED"

    elif "VERIFIED" in normalized:
        outcome = "VERIFIED"

    if outcome is None:
        outcome = "INSUFFICIENT_EVIDENCE"

    # Extract useful information from Gemini's response.
    problem = extract_after_number(
        text,
        r"1\.\s*\*?\*?What physical problem is visible\??\*?\*?"
    )

    same_location = extract_after_number(
        text,
        r"2\.\s*\*?\*?Do the two images appear to show the same location\??\*?\*?"
    )

    problem_visible = extract_after_number(
        text,
        r"3\.\s*\*?\*?Is the problem still visible\??\*?\*?"
    )

    physical_change = extract_after_number(
        text,
        r"4\.\s*\*?\*?What physical change occurred\??\*?\*?"
    )

    return {
        "outcome": outcome,
        "problem": problem,
        "same_location": parse_boolean(same_location),
        "problem_visible_after": parse_boolean(problem_visible),
        "change": physical_change,
        "analysis": text,
    }


def extract_after_number(text: str, pattern: str):
    """
    Extract the answer following one of Gemini's numbered questions.
    """

    match = re.search(
        pattern + r"\s*(.*?)(?=\n\d+\.|\n\*\*Classification|\Z)",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    if not match:
        return None

    value = match.group(1).strip()

    # Remove markdown formatting
    value = value.replace("**", "").strip()

    return value


def parse_boolean(value):
    if not value:
        return None

    normalized = value.lower()

    if normalized.startswith("yes"):
        return True

    if normalized.startswith("no"):
        return False

    return None