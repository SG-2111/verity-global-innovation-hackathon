from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from verity_engine import verify
from result_parser import parse_gemini_result


app = FastAPI(
    title="VERITY",
    description="AI Evidence Verification Engine",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://verity-global-innovation-hackathon.vercel.app",
]
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():

    return {
        "name": "VERITY",
        "status": "online",
        "message": "See the problem. Track the action. Verify the change."
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# @app.post("/verify")
# async def verify_case(
#     before_image: UploadFile = File(...),
#     after_image: UploadFile = File(...),
#     problem_description: str = Form(...),
# ):

#     before_bytes = await before_image.read()
#     after_bytes = await after_image.read()

#     gemini_result = verify(
#         before_bytes=before_bytes,
#         after_bytes=after_bytes,
#         before_mime=before_image.content_type or "image/jpeg",
#         after_mime=after_image.content_type or "image/jpeg",
#         problem_description=problem_description,
#     )

#     parsed_result = parse_gemini_result(
#         gemini_result["analysis"]
#     )

#     return parsed_result

@app.post("/verify")
async def verify_case(
    before_image: UploadFile = File(...),
    after_image: UploadFile = File(...),
    problem_description: str = Form(...),
):
    print("\n========== VERITY REQUEST ==========")
    print("Before filename:", before_image.filename)
    print("Before MIME:", before_image.content_type)
    print("After filename:", after_image.filename)
    print("After MIME:", after_image.content_type)
    print("Problem:", problem_description)

    before_bytes = await before_image.read()
    after_bytes = await after_image.read()

    print("Before bytes:", len(before_bytes))
    print("After bytes:", len(after_bytes))
    print("====================================")

    try:
        gemini_result = verify(
            before_bytes=before_bytes,
            after_bytes=after_bytes,
            before_mime=before_image.content_type or "image/jpeg",
            after_mime=after_image.content_type or "image/jpeg",
            problem_description=problem_description,
        )

        print("[1] Gemini succeeded")

        parsed_result = parse_gemini_result(
            gemini_result["analysis"]
        )

        print("[2] Parser succeeded")

        return parsed_result

    except Exception as e:
        print("\n========== VERITY ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print("==================================\n")

        raise
