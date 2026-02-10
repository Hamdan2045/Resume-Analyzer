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
  "https://outside-served-catering-papers.trycloudflare.com/webhook/resume-upload";

/* ===================== Progress Bar ===================== */
function ProgressBar({ label, percentage }) {
  const [width, setWidth] = useState("0%");

  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 150);
    return () => clearTimeout(t);
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

/* ===================== Safe Helpers ===================== */
const safeJsonParse = (v) => {
  try {
    return typeof v === "string" ? JSON.parse(v) : v;
  } catch {
    return null;
  }
};

const toArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
};

const normalizeKeywords = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(k => k.trim()).filter(Boolean);
  if (typeof v === "string")
    return v
      .replace(/[\n|;]/g, ",")
      .split(",")
      .map(k => k.trim())
      .filter(Boolean);
  return [];
};

const overallFromParameters = (parameters = []) => {
  if (!parameters.length) return 0;
  const nums = parameters.map(p => Number(p.score) || 0);
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
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

  const formRef = useRef(null);

  /* ===== Cover Letter Download ===== */
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

    if (!resumeFile || !jobDescription) {
      alert("Please upload a resume and paste a job description.");
      return;
    }

    setLoading(true);
    setShowResults(false);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const res = await fetch(ANALYZE_URL, {
        method: "POST",
        body: formData,
      });

      const rawText = await res.text();
      const parsed = safeJsonParse(rawText)?.[0]?.output
        ? safeJsonParse(safeJsonParse(rawText)[0].output)
        : safeJsonParse(rawText);

      const result = parsed || {};

      const normalized = {
        parameters: toArray(result.parameters),
        suggestions: toArray(result.suggestions),
        roleFit: toArray(result.role_fit),
        missingKeywords: normalizeKeywords(result.missing_keywords),
        gapAnalysis: toArray(result.gap_analysis).map(g =>
  typeof g === "string"
    ? { type: "Skill Gap", description: g }
    : g
),

        coverLetter:
          typeof result.cover_letter === "string"
            ? result.cover_letter
            : "",
      };

      setAnalysisResults(normalized);
      setImprovedResumeLink(result.url || null);
      setShowResults(true);

      await fetch(`${API}/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resumeName: resumeFile.name,
          score: overallFromParameters(normalized.parameters),
          suggestions: normalized.suggestions,
          improvedResumeUrl: result.url || null,
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
                placeholder="Paste job description here..."
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
                label={p.name}
                percentage={`${p.score}%`}
              />
            ))}

            {/* Suggestions */}
            <div className="ai-hints">
              <h3>AI Suggestions</h3>
              <ul>
                {analysisResults.suggestions.map((s, i) => (
                  <li key={i}>💡 {s}</li>
                ))}
              </ul>
            </div>

            {/* Roles */}
            {analysisResults.roleFit.length > 0 && (
              <div className="ai-hints">
                <h3>Suggested Roles</h3>
                <ul>
                  {analysisResults.roleFit.map((r, i) => (
                    <li key={i}>
                      <strong>{r.primary_role || r.role}</strong> — {r.confidence}%
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords */}
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
            {/* Gap Analysis */}
{analysisResults.gapAnalysis.length > 0 && (
  <div className="ai-hints">
    <h3>Gap Analysis</h3>
    <ul>
      {analysisResults.gapAnalysis.map((g, i) => (
        <li key={i}>
          <strong>{g.type || "Gap"}:</strong>{" "}
          {g.description || g}
        </li>
      ))}
    </ul>
  </div>
)}


            {/* Cover Letter */}
            {analysisResults.coverLetter && (
              <div className="ai-hints">
                <h3>AI Cover Letter</h3>
                <pre className="cover-letter">{analysisResults.coverLetter}</pre>
              </div>
            )}

            {/* Downloads */}
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

              {typeof analysisResults.coverLetter === "string" && (
 
                <button
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
