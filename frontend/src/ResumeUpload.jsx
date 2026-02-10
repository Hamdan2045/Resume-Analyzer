/* ============================================================================
 * @file        frontend/src/ResumeUpload.jsx
 * @brief       Resume analyzer upload form, renders scores & suggestions, lists prior reports.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */


import React, { useState, useEffect, useRef } from "react";
import "./ResumeUpload.css";
import ReportsTable from "./ReportsTable";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const ANALYZE_URL =
  "https://indexed-stanley-secretary-regardless.trycloudflare.com/webhook/resume-upload";

/* ===================== Progress Bar ===================== */
function ProgressBar({ label = "", percentage = "0%" }) {
  const [width, setWidth] = useState("0%");

  useEffect(() => {
    setWidth(percentage);
  }, [percentage]);

  return (
    <div className="result-bar">
      <div className="result-label">
        {label} <span>{percentage}</span>
      </div>
      <div className="progress-container">
        <div className="progress-fill" style={{ width }} />
      </div>
    </div>
  );
}

/* ===================== Helpers ===================== */
const safeJsonParse = (v) => {
  try {
    return typeof v === "string" ? JSON.parse(v) : v;
  } catch {
    return null;
  }
};

const ensureArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const normalizeKeywords = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).map(k => k.trim()).filter(Boolean);
  if (typeof v === "string")
    return v
      .replace(/[\n|;]/g, ",")
      .split(",")
      .map(k => k.trim())
      .filter(Boolean);
  return [];
};

const overallFromParameters = (parameters) => {
  if (!Array.isArray(parameters) || !parameters.length) return 0;
  const total = parameters.reduce((sum, p) => sum + (Number(p.score) || 0), 0);
  return Math.round(total / parameters.length);
};

/* ===================== Component ===================== */
function ResumeUpload() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [improvedResumeLink, setImprovedResumeLink] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasCoverLetter =
  typeof analysisResults?.coverLetter === "string" &&
  analysisResults.coverLetter.trim().length > 0;


  const formRef = useRef(null);

  /* ===================== Cover Letter Download ===================== */
  const downloadCoverLetter = () => {
    if (!analysisResults?.coverLetter) return;

    const blob = new Blob([analysisResults.coverLetter], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Cover_Letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ===================== Analyze ===================== */
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");
    setShowResults(false);

    if (!resumeFile || !jobDescription) {
      alert("Please upload a resume and paste a job description.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const res = await fetch(ANALYZE_URL, {
        method: "POST",
        body: formData,
      });

      const rawText = await res.text();

      const parsed =
        safeJsonParse(rawText)?.[0]?.output
          ? safeJsonParse(safeJsonParse(rawText)[0].output)
          : safeJsonParse(rawText);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid AI response");
      }

      const normalized = {
        parameters: ensureArray(parsed.parameters),
        suggestions: ensureArray(parsed.suggestions),
        roleFit: ensureArray(parsed.role_fit),
        missingKeywords: normalizeKeywords(parsed.missing_keywords),
        gapAnalysis: ensureArray(parsed.gap_analysis).map(g =>
          typeof g === "string"
            ? { type: "Skill Gap", description: g }
            : g
        ),
        coverLetter:
          typeof parsed.cover_letter === "string"
            ? parsed.cover_letter
            : "",
      };

      setAnalysisResults(normalized);
      setImprovedResumeLink(parsed.url || null);
      setShowResults(true);

      await fetch(`${API}/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resumeName: resumeFile.name,
          score: overallFromParameters(normalized.parameters),
          suggestions: normalized.suggestions,
          improvedResumeUrl: parsed.url || null,
        }),
      });

      window.dispatchEvent(new Event("analysis:changed"));
    } catch (err) {
      console.error(err);
      setError("Resume analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== Render ===================== */
  return (
    <>
      <section className="resume-analyzer-container">
        {/* LEFT */}
        <div className="left-panel">
          <h2 className="d-title">Upload Resume & Job Description</h2>

          <form ref={formRef} onSubmit={handleAnalyze} className="upload-form">
            <label className="upload-label">
              Upload Resume
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
            </label>

            <label className="upload-label">
              Job Description
              <textarea
                rows="5"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </label>

            <button className="btn" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>

            {error && <p className="error">{error}</p>}
          </form>
        </div>

        {/* RIGHT */}
        {showResults && analysisResults && (
          <div className="right-panel">
            <h2 className="d-title">Resume Match Report</h2>

            {analysisResults.parameters.map((p, i) => (
              <ProgressBar
                key={i}
                label={p.name || `Metric ${i + 1}`}
                percentage={`${p.score || 0}%`}
              />
            ))}

            {analysisResults.suggestions.length > 0 && (
              <div className="ai-hints">
                <h3>AI Suggestions</h3>
                <ul>
                  {analysisResults.suggestions.map((s, i) => (
                    <li key={i}>💡 {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResults.roleFit.length > 0 && (
              <div className="ai-hints">
                <h3>Suggested Roles</h3>
                <ul>
                  {analysisResults.roleFit.map((r, i) => (
                    <li key={i}>
                      <strong>{r.primary_role || r.role || r}</strong>
                      {r.confidence ? ` — ${r.confidence}%` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResults.missingKeywords.length > 0 && (
              <div className="ai-hints">
                <h3>Missing Keywords</h3>
                <div className="keyword-list">
                  {analysisResults.missingKeywords.map((k, i) => (
                    <span key={i} className="keyword-chip">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {analysisResults.gapAnalysis.length > 0 && (
              <div className="ai-hints">
                <h3>Gap Analysis</h3>
                <ul>
                  {analysisResults.gapAnalysis.map((g, i) => (
                    <li key={i}>
                      <strong>{g.type || "Gap"}:</strong> {g.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

        


            <div className="download-row">
              {improvedResumeLink && (
                <a
                  href={improvedResumeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn download-btn"
                >
                  📄 Download Improved Resume
                </a>
              )}

              {hasCoverLetter && (
  <button
    type="button"
    className="btn download-btn"
    onClick={downloadCoverLetter}
  >
    ✉️ Download Cover Letter
  </button>
)}

            </div>
          </div>
        )}
      </section>

      <ReportsTable />
    </>
  );
}

export default ResumeUpload;

