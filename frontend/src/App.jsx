import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL = "https://verity-global-innovation-hackathon-1.onrender.com/verify";
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png"];
const MAX_PROBLEM = 600;
const LOADING = [
  "Comparing visual evidence...",
  "Assessing observed change...",
  "Preparing verification result...",
];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const OUTCOMES = {
  VERIFIED: {
    slug: "verified",
    title: "Verified",
    message: "Evidence strongly supports that the reported problem has been resolved.",
  },
  PARTIALLY_RESOLVED: {
    slug: "partial",
    title: "Partially Resolved",
    message: "Evidence indicates improvement, but the original problem remains partially visible.",
  },
  UNRESOLVED: {
    slug: "unresolved",
    title: "Unresolved",
    message: "Fresh evidence indicates that the original problem is still present.",
  },
  INSUFFICIENT_EVIDENCE: {
    slug: "insufficient",
    title: "Insufficient Evidence",
    message: "The available evidence is insufficient to reliably determine the outcome.",
  },
};

const meta = (outcome) => {
  const key = String(outcome ?? "").trim().toUpperCase().replace(/\s+/g, "_");
  return OUTCOMES[key] ?? {
    slug: "unknown",
    title: key ? key.replace(/_/g, " ") : "Result received",
    message: "The verification completed, but this outcome could not be interpreted.",
  };
};

// Backend may return true / false / null — reflect each honestly.
const tri = (v) => (v === true ? "good" : v === false ? "bad" : "unknown");
const locState = (v) =>
  v === true ? ["good", "SAME LOCATION"] :
    v === false ? ["bad", "DIFFERENT LOCATION"] :
      ["unknown", "UNCERTAIN"];
const probState = (v) =>
  v === true ? ["bad", "STILL VISIBLE"] :
    v === false ? ["good", "NOT VISIBLE"] :
      ["unknown", "UNCERTAIN"];

function buildSummary(loc, prob, change) {
  const clauses = [
    loc === "good" ? "the before and after images appear to show the same location"
      : loc === "bad" ? "the before and after images do not appear to show the same location"
        : "location consistency could not be determined from the supplied images",
    prob === "bad" ? "the reported problem is still visible after the action"
      : prob === "good" ? "the reported problem is no longer visible after the action"
        : "the state of the problem after the action could not be determined",
  ];
  const list = clauses.length > 1 ? `${clauses[0]} and ${clauses[1]}` : clauses[0];
  const tail = change ? ` Observed change: ${change.replace(/[.\s]+$/, "")}.` : "";
  return `Based on the submitted evidence, ${list}.${tail}`;
}

function formatBytes(b) {
  if (!b || b <= 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let v = b, i = 0;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i += 1; }
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${u[i]}`;
}

function formatTime(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()} • ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function makeCaseId() {
  const chars = "0123456789ABCDEF";
  let s = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const a = new Uint8Array(6);
    crypto.getRandomValues(a);
    s = Array.from(a, (n) => chars[n % 16]).join("");
  } else {
    for (let i = 0; i < 6; i += 1) s += chars[Math.floor(Math.random() * 16)];
  }
  return `VERITY-${s}`;
}

// Object URLs created once per file and revoked on change.
function useObjectUrl(file) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

  function renderInline(text) {
    return String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={i}>{part.slice(1, -1)}</em>;
      return part;
    });
  }

  function renderAnalysis(text) {
    if (!text) return null;
    const lines = String(text).split(/\r?\n/);
    const out = [];
    let list = null;

    const flush = () => {
      if (!list) return;
      const Tag = list.type;
      out.push(
        <Tag key={`l${out.length}`}>
          {list.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}
        </Tag>
      );
      list = null;
    };

    lines.forEach((raw, i) => {
      const line = raw.trim();
      if (!line) return flush();

      const num = line.match(/^\d+[.)]\s+(.*)$/);
      if (num) {
        if (!list || list.type !== "ol") { flush(); list = { type: "ol", items: [] }; }
        list.items.push(num[1]);
        return;
      }

      const bul = line.match(/^[-*•]\s+(.*)$/);
      if (bul) {
        if (!list || list.type !== "ul") { flush(); list = { type: "ul", items: [] }; }
        list.items.push(bul[1]);
        return;
      }

      flush();

      const head = line.match(/^#{1,3}\s+(.*)$/);
      if (head) return out.push(<h4 key={i} className="analysis-h">{renderInline(head[1])}</h4>);

      out.push(<p key={i}>{renderInline(line)}</p>);
    });

    flush();
    return out;
  }

/* ---------------- Icons ---------------- */

const SVG_BASE = {
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeLinecap: "round", strokeLinejoin: "round",
  "aria-hidden": "true", focusable: "false",
};

function OutcomeIcon({ slug }) {
  if (slug === "verified")
    return <svg {...SVG_BASE} strokeWidth="1.8"><path d="M4.5 12.6 9.6 17.7 19.5 6.9" /></svg>;
  if (slug === "partial")
    return <svg {...SVG_BASE} strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 3.6a8.4 8.4 0 0 1 0 16.8z" fill="currentColor" stroke="none" />
    </svg>;
  if (slug === "unresolved")
    return <svg {...SVG_BASE} strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.4" /><path d="M12 7.6v5.2" />
      <circle cx="12" cy="16.4" r="1.05" fill="currentColor" stroke="none" />
    </svg>;
  return <svg {...SVG_BASE} strokeWidth="1.8">
    <circle cx="12" cy="12" r="8.4" />
    <path d="M9.4 9.4a2.7 2.7 0 1 1 3.4 2.6v1.5" />
    <circle cx="12.7" cy="16.5" r="1.05" fill="currentColor" stroke="none" />
  </svg>;
}

function StateIcon({ tone }) {
  const p = tone === "good" ? "M5 12.5 10 17.5 19 7" : tone === "bad" ? "M7 7l10 10M17 7L7 17" : "M6 12h12";
  return <svg {...SVG_BASE} strokeWidth="2"><path d={p} /></svg>;
}

/* ---------------- Upload ---------------- */

function Upload({ step, title, hint, file, previewUrl, onSelect, onClear }) {
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState("");
  const ref = useRef(null);

  const accept = (f) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setErr("Unsupported file. Use JPG, JPEG or PNG.");
      if (ref.current) ref.current.value = "";
      return;
    }
    setErr("");
    onSelect(f);
  };

  const cls = ["upload-box", drag && "is-dragging", file && "has-file"].filter(Boolean).join(" ");

  return (
    <div className="upload-section">
      <div className="upload-head">
        <div className="upload-step">{step}</div>
        <div>
          <div className="upload-label">{title}</div>
          <p className="upload-hint">{hint}</p>
        </div>
      </div>

      <label
        className={cls}
        onDragEnter={() => setDrag(true)}
        onDragOver={(e) => { e.preventDefault(); if (!drag) setDrag(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDrag(false); accept(e.dataTransfer?.files?.[0]); }}
      >
        {file && previewUrl ? (
          <>
            <img src={previewUrl} alt={`${title} preview`} className="image-preview" />
            <span className="preview-hint">Click to replace</span>
            <div className="preview-bar">
              <div className="file-info">
                <span className="file-name" title={file.name}>{file.name}</span>
                <span className="file-size">{formatBytes(file.size)}</span>
              </div>
              <button
                type="button"
                className="file-remove"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setErr(""); onClear(); }}
              >
                REMOVE
              </button>
            </div>
          </>
        ) : (
          <div className="upload-empty">
            <span className="upload-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M12 16V4" /><path d="M7.5 8.5 12 4l4.5 4.5" />
                <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
              </svg>
            </span>
            <span className="upload-title">Upload image</span>
            <span className="upload-subtitle">JPG, JPEG or PNG</span>
            <span className="upload-drop">or drag &amp; drop</span>
          </div>
        )}

        <input
          ref={ref}
          type="file"
          className="upload-input"
          accept="image/jpeg,image/png"
          aria-label={`Upload ${title.toLowerCase()}`}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            e.target.value = "";
            accept(f);
          }}
        />
      </label>

      {err && <p className="upload-error">{err}</p>}
    </div>
  );
}

/* ---------------- Result ---------------- */

function Result({ result, caseId, completedAt, beforeUrl, afterUrl, onReset }) {
  const [open, setOpen] = useState(false);
  const m = meta(result?.outcome);
  const [locTone, locText] = locState(result?.same_location);
  const [probTone, probText] = probState(result?.problem_visible_after);

  const change = String(result?.change ?? "").trim();
  const analysis = String(result?.analysis ?? "").trim();
  const problem = String(result?.problem ?? "").trim();
  const summary = buildSummary(locTone, probTone, change);

  return (
    <section className={`result-page outcome-${m.slug}`}>
      <div className="print-only print-header">
        <div className="print-brand">VERITY</div>
        <div className="print-sub">EVIDENCE VERIFICATION REPORT</div>
      </div>

      <header className="report-header">
        <div className="eyebrow">VERIFICATION RESULT</div>
        <div className="report-meta">
          <div className="meta-item">
            <span className="meta-label">CASE ID</span>
            <span className="meta-value" title="Generated for this session">{caseId || "—"}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">VERIFICATION COMPLETED</span>
            <span className="meta-value">{completedAt ? formatTime(completedAt) : "—"}</span>
          </div>
        </div>
      </header>

      <div className="outcome-banner">
        <div className="outcome-icon"><OutcomeIcon slug={m.slug} /></div>
        <div className="outcome-copy">
          <div className="outcome-kicker">OUTCOME</div>
          <h1 className="outcome-title">{m.title}</h1>
          <p className="outcome-message">{m.message}</p>
        </div>
      </div>

      <section className="report-section">
        <h2 className="section-label">REPORTED PROBLEM</h2>
        <p className="problem-text">{problem || "No problem description was returned for this case."}</p>
      </section>

      <section className="report-section">
        <h2 className="section-label">EVIDENCE COMPARISON</h2>
        <div className="comparison">
          <figure className="compare-item">
            <div className="compare-frame">
              {beforeUrl
                ? <img src={beforeUrl} alt="Before evidence: original condition" />
                : <span className="compare-missing">Image unavailable</span>}
            </div>
            <figcaption className="compare-caption">
              <span className="compare-tag">BEFORE</span>
              <span className="compare-note">Original condition</span>
            </figcaption>
          </figure>

          <div className="compare-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" focusable="false">
              <path d="M4 12h15" /><path d="M13.5 6.5 20 12l-6.5 5.5" />
            </svg>
          </div>

          <figure className="compare-item">
            <div className="compare-frame">
              {afterUrl
                ? <img src={afterUrl} alt="After evidence: observed condition" />
                : <span className="compare-missing">Image unavailable</span>}
            </div>
            <figcaption className="compare-caption">
              <span className="compare-tag">AFTER</span>
              <span className="compare-note">Observed condition</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="report-section">
        <h2 className="section-label">EVIDENCE CHECKS</h2>
        <div className="evidence-grid">
          <div className="evidence-card">
            <span className="evidence-label">LOCATION CONSISTENCY</span>
            <div className={`evidence-value ${locTone}`}>
              <StateIcon tone={locTone} /><span>{locText}</span>
            </div>
          </div>

          <div className="evidence-card">
            <span className="evidence-label">PROBLEM AFTER ACTION</span>
            <div className={`evidence-value ${probTone}`}>
              <StateIcon tone={probTone} /><span>{probText}</span>
            </div>
          </div>

          <div className="evidence-card wide">
            <span className="evidence-label">OBSERVED CHANGE</span>
            <p className="evidence-text">
              {change || "No change description was returned for this comparison."}
            </p>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h2 className="section-label">VERIFICATION SUMMARY</h2>
        <div className="summary-card"><p className="summary-text">{summary}</p></div>
      </section>

      <div className="analysis">
        <button
          type="button"
          className="analysis-toggle"
          aria-expanded={open}
          aria-controls="analysis-body"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="analysis-title">AI EVIDENCE ANALYSIS</span>
          <span className="analysis-toggle-action">
            {open ? "HIDE ANALYSIS" : "VIEW ANALYSIS"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
        </button>
        {open && (
          <div className="analysis-body" id="analysis-body">
            {analysis
              ? renderAnalysis(analysis)
              : <p>No additional analysis text was returned for this verification.</p>}
          </div>
        )}
      </div>

      <div className="action-row">
        <button type="button" className="verify-button secondary" onClick={onReset}>
          <span className="btn-plus" aria-hidden="true">+</span> NEW VERIFICATION
        </button>
        <button type="button" className="ghost-button" onClick={() => window.print()}>
          EXPORT REPORT
        </button>
      </div>
    </section>
  );
}

/* ---------------- App ---------------- */

function App() {
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [caseId, setCaseId] = useState("");
  const [completedAt, setCompletedAt] = useState(null);
  const [error, setError] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const beforeUrl = useObjectUrl(beforeFile);
  const afterUrl = useObjectUrl(afterFile);

  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const id = window.setInterval(() => setStep((s) => (s + 1) % LOADING.length), 2200);
    return () => window.clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (result) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [result]);

  const clearError = () => { setError(null); setShowDetail(false); };

  async function verify() {
    if (loading) return;

    if (!beforeFile || !afterFile) {
      setError({
        kind: "input", title: "EVIDENCE INCOMPLETE",
        message: "Please upload both the BEFORE and AFTER images before verifying."
      });
      return;
    }
    if (!problem.trim()) {
      setError({
        kind: "input", title: "REPORT MISSING",
        message: "Please describe the reported problem so the evidence can be assessed against it."
      });
      return;
    }

    clearError();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("before_image", beforeFile);
      fd.append("after_image", afterFile);
      fd.append("problem_description", problem.trim());

      const res = await fetch(API_URL, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Verification request failed (HTTP ${res.status})`);

      setResult(await res.json());
      setCaseId(makeCaseId());
      setCompletedAt(new Date());
    } catch (err) {
      console.error(err);
      setError({
        kind: "request",
        title: "VERIFICATION FAILED",
        message: "We couldn't complete the evidence comparison. Please check your connection and try again.",
        detail: err?.message ? String(err.message) : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setBeforeFile(null); setAfterFile(null); setProblem("");
    setResult(null); setCaseId(""); setCompletedAt(null);
    clearError();
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span className="brand-mark">V</span>
          <span className="brand-name">VERITY</span>
        </div>
        <div className="status">
          <span className="status-dot" aria-hidden="true" />VERIFICATION ENGINE ONLINE
        </div>
      </header>

      <main className="container">
        {result ? (
          <Result
            result={result}
            caseId={caseId}
            completedAt={completedAt}
            beforeUrl={beforeUrl}
            afterUrl={afterUrl}
            onReset={reset}
          />
        ) : (
          <div className="input-page">
            <section className="hero">
              <div className="eyebrow">AI EVIDENCE LAYER</div>
              <h1>See the problem.<br /><span>Verify the change.</span></h1>
              <p style={{ maxWidth: 500 }}>Compare before-and-after evidence to determine whether a reported real-world problem was actually resolved.</p>
              <div className="hero-flow" aria-label="Verification process">
                <span>REPORT</span><i aria-hidden="true">→</i>
                <span>EVIDENCE</span><i aria-hidden="true">→</i>
                <span>COMPARE</span><i aria-hidden="true">→</i>
                <strong>VERIFY</strong>
              </div>
            </section>

            <section className="verification-card" aria-busy={loading}>
              <div className="card-head">
                <h2 className="card-title">Submit evidence</h2>
                <p className="card-sub">Provide the original report alongside the before and after images.</p>
              </div>

              <div className="upload-grid">
                <Upload
                  step="01" title="BEFORE EVIDENCE"
                  hint="Upload an image showing the original condition."
                  file={beforeFile} previewUrl={beforeUrl}
                  onSelect={(f) => { clearError(); setBeforeFile(f); }}
                  onClear={() => setBeforeFile(null)}
                />
                <Upload
                  step="02" title="AFTER EVIDENCE"
                  hint="Upload an image showing the condition after the claimed action."
                  file={afterFile} previewUrl={afterUrl}
                  onSelect={(f) => { clearError(); setAfterFile(f); }}
                  onClear={() => setAfterFile(null)}
                />
              </div>

              <div className="problem-section">
                <label htmlFor="problem-input">WHAT WAS REPORTED?</label>
                <p className="field-hint">Describe the problem as it was originally reported.</p>
                <textarea
                  id="problem-input"
                  value={problem}
                  maxLength={MAX_PROBLEM}
                  onChange={(e) => { clearError(); setProblem(e.target.value); }}
                  placeholder="Example: Large pothole approximately 1 meter wide near the intersection. Road surface is cracked and uneven."
                  rows={4}
                />
                <div className="field-meta">{problem.length} / {MAX_PROBLEM}</div>
              </div>

              {error && (
                <div className="error-panel" role="alert">
                  <div className="error-title">{error.title}</div>
                  <p className="error-message">{error.message}</p>
                  <div className="error-actions">
                    {error.kind === "request" && (
                      <button type="button" className="ghost-button" onClick={verify}>TRY AGAIN</button>
                    )}
                    {error.detail && (
                      <button
                        type="button"
                        className="link-button"
                        aria-expanded={showDetail}
                        onClick={() => setShowDetail((v) => !v)}
                      >
                        {showDetail ? "HIDE TECHNICAL DETAILS" : "VIEW TECHNICAL DETAILS"}
                      </button>
                    )}
                  </div>
                  {showDetail && error.detail && <pre className="error-detail">{error.detail}</pre>}
                </div>
              )}

              <button type="button" className="verify-button" onClick={verify} disabled={loading}>
                {loading ? (
                  <><span className="spinner" aria-hidden="true" />ANALYZING EVIDENCE...</>
                ) : (
                  <>VERIFY THE CHANGE<span className="btn-arrow" aria-hidden="true">→</span></>
                )}
              </button>

              {loading && (
                <div className="verifying-panel" role="status" aria-live="polite">
                  <div className="verifying-head">
                    <span className="verifying-pulse" aria-hidden="true" />VERIFYING EVIDENCE
                  </div>
                  <div className="verifying-message">{LOADING[step]}</div>
                  <div className="verifying-bar" aria-hidden="true"><span /></div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer>VERITY — SEE THE PROBLEM. TRACK THE ACTION. VERIFY THE CHANGE.</footer>
    </div>
  );
}

export default App;
