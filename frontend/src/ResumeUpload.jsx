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
  "https://dimensional-drain-buyers-absorption.trycloudflare.com/webhook/resume-upload";

/* ===================== Progress Bar ===================== */
function ProgressBar({ label, percentage }) {
  const [width, setWidth] = useState("0%");

  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 200);
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

/* ===================== Helpers ===================== */
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function normalizeKeywords(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(k => k.trim()).filter(Boolean);
  if (typeof input === "string")
    return input.split(",").map(k => k.trim()).filter(Boolean);
  return [];
}

function normalizeAnalyzeResponse(raw) {
  if (Array.isArray(raw) && raw[0]?.output) {
    const parsed = safeJsonParse(raw[0].output) || {};
    return { ...parsed, url: raw[0].url || parsed.url || null };
  }
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") return safeJsonParse(raw) || {};
  return {};
}

function overallFromParameters(parameters = []) {
  if (!parameters.length) return 0;
  const nums = parameters.map(p => Number(p.score) || 0);
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

/* ===================== Component ===================== */
function ResumeUpload() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [improvedResumeLink, setImprovedResumeLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formRef = useRef(null);

  /* ===== Download Cover Letter ===== */
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

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");

    if (!resumeFile || !jobDescription) {
      alert("Please upload a resume and job description.");
      return;
    }

    setLoading(true);
    setShowResults(false);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const response = await fetch(ANALYZE_URL, {
        method: "POST",
        body: formData,
      });

      const rawText = await response.text();
      const parsed = normalizeAnalyzeResponse(safeJsonParse(rawText) ?? rawText);

      setAnalysisResults({
        parameters: parsed.parameters || [],
        suggestions: parsed.suggestions || [],
        roleFit: Array.isArray(parsed.role_fit)
          ? parsed.role_fit
          : parsed.role_fit
          ? [parsed.role_fit]
          : [],
        missingKeywords: normalizeKeywords(parsed.missing_keywords),
        gapAnalysis: parsed.gap_analysis || [],
        coverLetter: parsed.cover_letter || "",
      });

      setImprovedResumeLink(parsed.url || null);
      setShowResults(true);

      /* Save minimal record */
      await fetch(`${API}/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resumeName: resumeFile.name,
          score: overallFromParameters(parsed.parameters),
          suggestions: parsed.suggestions || [],
          improvedResumeUrl: parsed.url || null,
        }),
      });

      window.dispatchEvent(new Event("analysis:changed"));
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section id="resume-upload" className="resume-analyzer-container">
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
                placeholder="Paste the job description here..."
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
              <h3 className="hint-title">AI Suggestions</h3>
              <ul>
                {analysisResults.suggestions.map((s, i) => (
                  <li key={i}>💡 {s}</li>
                ))}
              </ul>
            </div>

            {/* Role Matches */}
            {analysisResults.roleFit.length > 0 && (
              <div className="ai-hints">
                <h3 className="hint-title">Best Role Matches</h3>
                <ul>
                  {analysisResults.roleFit.map((r, i) => (
                    <li key={i}>
                      <strong>{r.primary_role || r.role}</strong> —{" "}
                      {r.confidence}%
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Keywords */}
            {analysisResults.missingKeywords.length > 0 && (
              <div className="ai-hints">
                <h3 className="hint-title">Missing Keywords</h3>
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
                <h3 className="hint-title">Gap Analysis</h3>
                <ul>
                  {analysisResults.gapAnalysis.map((g, i) => (
                    <li key={i}>
                      <strong>{g.type}:</strong> {g.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cover Letter */}
            {analysisResults.coverLetter && (
              <div className="ai-hints">
                <h3 className="hint-title">AI Cover Letter</h3>
                <pre className="cover-letter">
                  {analysisResults.coverLetter}
                </pre>
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

              {analysisResults.coverLetter && (
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

      <div className="reports-below">
        <ReportsTable />
      </div>
    </>
  );
}

export default ResumeUpload;
