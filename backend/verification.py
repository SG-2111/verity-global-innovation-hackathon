from fastapi import UploadFile, HTTPException

from gemini import verify_images
from schemas import VerificationResult


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB


async def read_image(
    upload: UploadFile,
    field_name: str,
) -> tuple[bytes, str]:

    if upload.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"{field_name} must be JPEG, PNG, or WEBP. "
                f"Received: {upload.content_type}"
            ),
        )

    data = await upload.read()

    if not data:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} is empty.",
        )

    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=(
                f"{field_name} is too large. "
                f"Maximum allowed size is 10 MB."
            ),
        )

    return data, upload.content_type


async def run_verification(
    before_image: UploadFile,
    after_image: UploadFile,
    problem_description: str,
) -> VerificationResult:

    if not problem_description.strip():
        raise HTTPException(
            status_code=400,
            detail="problem_description cannot be empty.",
        )

    before_bytes, before_mime = await read_image(
        before_image,
        "before_image",
    )

    after_bytes, after_mime = await read_image(
        after_image,
        "after_image",
    )

    try:
        result = verify_images(
            before_bytes=before_bytes,
            before_mime=before_mime,
            after_bytes=after_bytes,
            after_mime=after_mime,
            problem_description=problem_description.strip(),
        )

        return result

    except Exception as exc:
        print(f"[VERITY] Verification error: {exc}")

        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(exc)}",
        )