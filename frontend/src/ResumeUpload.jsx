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
  "https://pine-acc-cams-milk.trycloudflare.com/webhook/resume-upload";

/* ===================== Progress Bar ===================== */
function ProgressBar({ label, percentage }) {
  const [width, setWidth] = useState("0%");

  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 300);
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

function normalizeAnalyzeResponse(raw) {
  if (typeof raw === "object" && raw !== null) {
    if (Array.isArray(raw) && raw[0]?.output) {
      const parsed = safeJsonParse(raw[0].output) || {};
      return { ...parsed, url: raw[0].url || parsed.url || null };
    }
    return raw;
  }

  if (typeof raw === "string") {
    const urlMatch = raw.match(/https?:\/\/\S+\.pdf\S*/i);
    const url = urlMatch ? urlMatch[0] : null;
    const jsonPart = url ? raw.replace(url, "").trim() : raw.trim();
    const parsed = safeJsonParse(jsonPart) || {};
    return { ...parsed, url };
  }

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

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const rawText = await response.text();
      const parsed = safeJsonParse(rawText) ?? rawText;
      const data = normalizeAnalyzeResponse(parsed);

      setAnalysisResults({
        parameters: data.parameters || [],
        suggestions: data.suggestions || [],
        roleFit: data.role_fit || null,
        missingKeywords: data.missing_keywords || [],
        gapAnalysis: data.gap_analysis || [],
        coverLetter: data.cover_letter || null,
      });

      setImprovedResumeLink(data.url || null);
      setShowResults(true);

      // Save to backend (if logged in)
      try {
        await fetch(`${API}/analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            resumeName: resumeFile.name,
            score: overallFromParameters(data.parameters),
            suggestions: data.suggestions || [],
            improvedResumeUrl: data.url || null,
          }),
        });
        window.dispatchEvent(new Event("analysis:changed"));
      } catch {
        // non-blocking
      }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleJDKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <>
      <section id="resume-upload" className="resume-analyzer-container">
        {/* ================= LEFT ================= */}
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
                onKeyDown={handleJDKeyDown}
                placeholder="Paste the job description here..."
              />
            </label>

            <button className="btn" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>

            {error && <p className="error">{error}</p>}
          </form>
        </div>

        {/* ================= RIGHT ================= */}
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

            {/* AI Suggestions */}
            <div className="ai-hints">
              <h3 className="hint-title">AI Suggestions</h3>
              <ul>
                {analysisResults.suggestions.map((s, i) => (
                  <li key={i}>💡 {s}</li>
                ))}
              </ul>
            </div>

            {/* Role Fit */}
            {analysisResults.roleFit && (
              <div className="ai-hints">
                <h3 className="hint-title">Best Role Fit</h3>
                <p>
                  <strong>{analysisResults.roleFit.primary_role}</strong>{" "}
                  ({analysisResults.roleFit.confidence}% match)
                </p>
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

            {improvedResumeLink && (
              <div className="download-row">
                <a
                  href={improvedResumeLink}
                  target="_blank"
                  className="btn download-btn"
                  download
                >
                  📄 Download Improved Resume
                </a>
              </div>
            )}
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

