# VERITY

**See the problem. Track the action. Verify the change.**

An AI-powered evidence layer for verifying whether real-world problems were actually resolved.

---

## 1. The Problem

Modern issue-reporting and service workflows are good at recording what was reported and what was marked complete.

But there is a critical gap:

> **A closed ticket is not the same as a fixed problem.**

A citizen may report a pothole. A contractor may receive the work order. The task may eventually be marked `RESOLVED`. But what proves that the physical problem was actually fixed?

The same gap exists across:

- Infrastructure maintenance
- Waste cleanup
- Accessibility improvements
- Public utilities
- Construction
- Environmental restoration
- Facility maintenance

Digital workflows can confirm that an action was recorded. They do not necessarily confirm that the physical world actually changed.

---

## 2. Introducing VERITY

VERITY is an AI-powered verification layer that compares evidence from before and after an intervention to determine whether the claimed change is actually supported by visual evidence.

Instead of treating `"RESOLVED"` as the final answer, VERITY asks:

> **What evidence shows that the original problem changed?**

```text
ORIGINAL PROBLEM
      ↓
ACTION
      ↓
NEW EVIDENCE
      ↓
COMPARISON
      ↓
VERIFICATION
      ↓
OUTCOME
```

---

## 3. Core Insight

> **The status is a claim.**
>
> **The change is the evidence.**

VERITY does not blindly trust a completion status. It evaluates the available evidence and determines whether it supports the claimed resolution.

- What the original problem looked like
- What the new evidence shows
- Whether the images appear to represent the same location
- Whether the original problem is still visible
- What physical change occurred

---

## The VERITY Pipeline

**See → Understand → Track → Compare → Verify**

- **See** — Capture the original condition and its context.
- **Understand** — Identify the issue, affected object, and severity.
- **Track** — Maintain an evidence record as the work progresses.
- **Compare** — Analyse new evidence against the original condition.
- **Verify** — Classify the outcome based on the available evidence.

## VERITY Doesn’t Guess

When the evidence is weak, uncertainty becomes the result. Real-world evidence is messy: different angles, lighting changes, partial repairs, or missing evidence. VERITY is designed to recognise these situations rather than manufacture certainty.

## Scale + Impact

Traditional workflows can report, assign, and close a task — but they often stop at the status. VERITY adds an evidence layer that connects the original problem, the action taken, and the resulting change. By turning physical-world outcomes into evidence-backed assessments, VERITY can improve accountability, reduce unresolved work, and build greater trust across municipalities, enterprises, contractors, NGOs, and communities.


## 4. How VERITY Works

```text
REPORT
  ↓
EVIDENCE
  ↓
COMPARE
  ↓
VERIFY
  ↓
OUTCOME
```

### Step 1 — Report

The original problem is described and an initial image is provided.

Example: "A large pothole and damaged asphalt are present on the road."

### Step 2 — Evidence

A subsequent image is provided after the claimed intervention.

### Step 3 — Compare

Google Gemini's multimodal capabilities analyze both images, examining physical condition, visual similarities, location consistency, remaining problem, and physical changes.

### Step 4 — Verify

The evidence is classified into one of four outcome states.

### Step 5 — Outcome

VERITY produces an evidence-based verification result.

---

## 5. Verification Outcomes

### VERIFIED

Evidence strongly supports that the original problem has been resolved.

### PARTIALLY RESOLVED

The condition has improved, but the original problem remains partially visible.

### UNRESOLVED

Fresh evidence indicates that the original problem still exists.

### INSUFFICIENT EVIDENCE

The available evidence is inadequate or contradictory to reliably determine the outcome.

---

## 6. Example

**Before:** A road contains a large pothole and damaged asphalt.

**Action:** The road section is reported as repaired.

**After:** A new image is submitted.

**VERITY Analysis:**

```text
Same location?
      ↓
Is the original problem still visible?
      ↓
What physical change occurred?
      ↓
Does the evidence support resolution?
```

**Result: VERIFIED**

The result is accompanied by an explanation of the observed physical change.

---

## 7. Why Multimodal AI Matters

Real-world evidence is messy. A verification system cannot simply compare two images pixel-by-pixel.

- Different camera angles
- Different lighting
- Different weather
- Different framing
- Partial visibility
- Objects blocking the original issue
- Changes in surrounding context

VERITY therefore uses multimodal AI reasoning to interpret the physical meaning of the evidence rather than relying only on pixel-level similarity.

```text
BEFORE
Large pothole
      ↓
AFTER
Fresh asphalt patch
      ↓
AI reasoning
      ↓
Original defect no longer visible
      ↓
VERIFIED
```

---

## 8. System Architecture

```text
USER
  ↓
REACT + VITE
  ↓ POST /verify
FASTAPI BACKEND
  ↓
VERITY VERIFICATION ENGINE
  ↓
GOOGLE GEMINI
  ↓
RESULT PARSER
  ↓
VERIFICATION REPORT
```

---

## 9. Verification Flow

```text
REPORT
  ↓
EVIDENCE
  ↓
COMPARE
  ↓
VERIFY
  ↓
OUTCOME
```

Possible outcomes: `VERIFIED`, `PARTIALLY_RESOLVED`, `UNRESOLVED`, `INSUFFICIENT_EVIDENCE`.

---

## 10. Technology Stack

- **Frontend:** React + Vite
- **Backend:** Python + FastAPI
- **AI:** Google Gemini
- **AI capability:** Multimodal Vision + Reasoning
- **Image handling:** Multipart uploads
- **Result processing:** Python

---

## 11. Project Structure

```text
verity/
├── frontend/
│   ├── src/
|   ├── index.html
|   ├── README.md
|   ├── package-lock.json
|   ├── vite.config.js
|   ├── eslint.config.js
│   ├── package.json
│   └── .gitignore
|
├── backend/
│   ├── main.py
│   ├── verity_engine.py
│   ├── result_parser.py
│   ├── schemas.py
|   ├── verification.py
|   ├── test_parser.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
|
├── docs/
|   └── screenshots/
│       ├── veritypage.png
|       ├── veritypage-evidence.png          
│   ├── architecture.png
│   ├── verification-flow.png
├── README.md
```

---

## 12. API

VERITY currently exposes:

```http
POST /verify
```

**Inputs:**

- `before_image`
- `after_image`
- `problem_description`

**Example response:**

```json
{
  "outcome": "VERIFIED",
  "problem": "A deep pothole and damaged asphalt are visible.",
  "same_location": true,
  "problem_visible_after": false,
  "change": "Fresh asphalt covers the damaged section.",
  "analysis": "Based on the visual evidence..."
}
```

---

## 13. Running Locally

### Prerequisites

- Python 3.10+
- Node.js
- npm
- A Google Gemini API key

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env`:

```env
GEMINI_API_KEY=your-api-here
GEMINI_MODEL=your-model-here
```

Run the backend:

```bash
uvicorn main:app --reload
```

Backend: http://127.0.0.1:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

---

## 14. Verification Workflow

1. Open VERITY
2. Upload BEFORE image
3. Upload AFTER image
4. Describe the original problem
5. Click **VERIFY THE CHANGE**
6. VERITY sends both images to Gemini
7. Gemini analyzes the evidence
8. VERITY extracts the result
9. Verification report is displayed

---

## 15. Evidence Analysis

### What physical problem is visible?

Identifies the original issue represented in the evidence.

### Do the images appear to show the same location?

Looks for visual and contextual consistency.

### Is the problem still visible?

Determines whether the original issue remains visible.

### What physical change occurred?

Describes the observable difference between the original and subsequent evidence.

---

## 16. Beyond Potholes

- **Infrastructure** — Damaged road → Repair → Verification
- **Waste** — Waste accumulation → Cleanup → Verification
- **Accessibility** — Blocked access / damaged ramp → Modification → Verification
- **Utilities** — Damaged infrastructure → Repair → Verification
- **Construction** — Incomplete work → Construction activity → Verification
- **Environment** — Degraded site → Restoration → Verification

---

## 17. One Engine, Many Problems

VERITY is not designed as a pothole detector. The pothole scenario is simply an intuitive demonstration of the verification problem.

The same verification engine can potentially be applied across infrastructure, waste, accessibility, utilities, construction, and environmental restoration.

> **Does the available evidence support the claimed change?**

---

## 18. Evidence Robustness

Real-world verification requires handling imperfect evidence. VERITY is built around the principle that uncertainty should be represented rather than hidden.

- **Different camera angle** — focus on semantic and contextual similarities.
- **Different lighting** — consider physical structures rather than raw pixels.
- **Partial repair** — use `PARTIALLY_RESOLVED` when the issue remains.
- **Missing evidence** — use `INSUFFICIENT_EVIDENCE`.
- **Conflicting evidence** — represent uncertainty rather than forcing a decision.

---

## 19. Important Limitations

VERITY is currently a working prototype, not a production-grade municipal verification system.

The prototype does not independently guarantee:

- Image authenticity
- Camera provenance
- Timestamp authenticity
- GPS authenticity
- Submitter identity
- Tamper-proof evidence
- Legal admissibility
- Continuous monitoring
- Government system integration

It should therefore be treated as an AI-assisted evidence assessment layer rather than an absolute source of truth.

---

## 20. Responsible AI Considerations

Physical-world verification can have real consequences. A verification system should avoid presenting uncertain evidence as fact.

```text
VERIFIED
PARTIALLY_RESOLVED
UNRESOLVED
INSUFFICIENT_EVIDENCE
```

This allows uncertainty and incomplete evidence to remain visible.

---

## 21. Current Prototype Scope

```text
Image Upload
      ↓
FastAPI
      ↓
Gemini Multimodal Analysis
      ↓
Evidence Interpretation
      ↓
Outcome Classification
      ↓
Verification Report
```

> **Can multimodal AI compare physical-world evidence and determine whether a claimed change is actually supported?**

---

## 22. Future Development

- **Evidence provenance:** timestamp, GPS metadata, device information, evidence source, upload history.
- **Multi-evidence verification:** multiple progress and final images.
- **Video evidence:** short videos of completed work.
- **Geospatial verification:** geographic context for location consistency.
- **Evidence timeline:** report → assignment → work → evidence → verification.
- **Enterprise / municipal integration** with issue, contractor, asset, citizen-reporting, and maintenance systems.

---

## 23. Repository Assets

```text
docs/architecture.png
docs/verification-flow.png
docs/screenshots/veritypage.png
docs/screenshots/veritypage-evidence.png
docs/screenshots/
```

---

## 24. Design Philosophy

> **Do not confuse workflow completion with real-world resolution.**

> "The task was completed."
>
> "What evidence shows that the world actually changed?"

---

## 25. Hackathon Context

VERITY was developed as a software prototype for the **Global Innovation Hackathon 2026**.

The project explores how multimodal AI can improve accountability, transparency, and evidence-based verification of real-world interventions.

---

## 26. Why VERITY Matters

Across many real-world workflows, there is a gap between:

```text
ACTION RECORDED
```

and

```text
OUTCOME VERIFIED
```

VERITY is designed to operate in that gap.

```text
ACTION
  ↓
VERITY EVIDENCE LAYER
  ↓
OUTCOME
```

The goal is not to create another reporting system. The goal is to create an evidence layer between action and outcome.

---

## 27. Project Status

- Frontend ✓
- Backend ✓
- Image Upload ✓
- Gemini Integration ✓
- Multimodal Comparison ✓
- Result Parsing ✓
- Four Outcome States ✓
- Evidence Analysis ✓
- Multi-domain Testing ✓

**Current status: Working Hackathon Prototype**

---

## 28. Acknowledgements

VERITY uses Google's Gemini multimodal AI capabilities for visual analysis and reasoning.

Third-party assets, datasets, images, libraries, and references should be acknowledged according to their respective licenses and usage requirements.

---

## 29. Security

Never commit API keys or other credentials.

```text
.env
.env.local
```

Use environment variables for secrets. Never commit an actual secret key to the repository.

---

## 30. License

This project is developed as a hackathon prototype for Global Innovation Hackathon. 

---

## 31. Final Thought

> **The status is a claim.**
>
> **The change is the evidence.**

**VERITY**

**See the problem. Track the action. Verify the change.**
