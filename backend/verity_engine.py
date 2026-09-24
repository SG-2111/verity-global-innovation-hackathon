import os
import json

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing.")

MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash"
)

client = genai.Client(api_key=API_KEY)


def verify(
    before_bytes: bytes,
    after_bytes: bytes,
    before_mime: str,
    after_mime: str,
    problem_description: str,
):

    prompt = f"""
You are comparing two images of a physical location.

The first image is BEFORE.
The second image is AFTER.

The reported problem is:

{problem_description}

Determine:

1. What physical problem is visible?
2. Do the two images appear to show the same location?
3. Is the problem still visible?
4. What physical change occurred?

Then classify the result as one of:

VERIFIED
PARTIALLY_RESOLVED
UNRESOLVED
INSUFFICIENT_EVIDENCE

Definitions:

VERIFIED = the evidence strongly supports that the original
problem has been resolved.

PARTIALLY_RESOLVED = the condition improved but the original
problem remains partially.

UNRESOLVED = the original problem is still present.

INSUFFICIENT_EVIDENCE = there is not enough reliable evidence
to determine the result.

Do not assume that the problem was fixed.

Return a concise answer.
"""

    print("[VERITY] Sending request to Gemini...")
    print(f"[VERITY] Model: {MODEL}")
    print(f"[VERITY] Before MIME: {before_mime}")
    print(f"[VERITY] After MIME: {after_mime}")
    print(
        f"[VERITY] Before size: {len(before_bytes)} bytes"
    )
    print(
        f"[VERITY] After size: {len(after_bytes)} bytes"
    )

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            prompt,

            types.Part.from_bytes(
                data=before_bytes,
                mime_type=before_mime,
            ),

            types.Part.from_bytes(
                data=after_bytes,
                mime_type=after_mime,
            ),
        ],
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    print("\n========== GEMINI RESPONSE ==========")
    print(response.text)
    print("=====================================\n")

    return {
        "status": "success",
        "model": MODEL,
        "analysis": response.text
    }