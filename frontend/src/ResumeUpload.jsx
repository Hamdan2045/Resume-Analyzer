/* ============================================================================
 * @file        frontend/src/ResumeUpload.jsx
 * @brief       Resume analyzer upload form, renders scores & suggestions, lists prior reports.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import React, { useState, useEffect, useRef  } from "react";
import "./ResumeUpload.css";
import ReportsTable from "./ReportsTable"; // <- adjust path if needed

// Backend API (for saving a run & listing reports)
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// n8n webhook (returns {parameters, suggestions, url} in some shape)
const ANALYZE_URL = "https://employed-operate-queen-closure.trycloudflare.com/webhook/resume-upload
";

// Progress bar
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
        <div className="progress-fill" style={{ width }}></div>
      </div>
    </div>
  );
}

// ---- helpers to normalize n8n responses ----
function safeJsonParse(s) { try { return JSON.parse(s); } catch { return null; } }

function normalizeAnalyzeResponse(raw) {
  // Object already
  if (typeof raw === "object" && raw !== null) {
    // Array with { output: "stringified json" }
    if (Array.isArray(raw) && raw[0]?.output) {
      const parsed = safeJsonParse(raw[0].output) || {};
      return {
        parameters: parsed.parameters || [],
        suggestions: parsed.suggestions || [],
        url: raw[0].url || parsed.url || null,
      };
    }
    // Clean JSON object
    return {
      parameters: raw.parameters || [],
      suggestions: raw.suggestions || [],
      url: raw.url || raw.improvedResumeUrl || null,
    };
  }
  // Concatenated string: "{...json...} https://.../file.pdf"
  if (typeof raw === "string") {
    const urlMatch = raw.match(/https?:\/\/\S+\.pdf\S*/i);
    const url = urlMatch ? urlMatch[0] : null;
    const jsonPart = url ? raw.slice(0, raw.indexOf(url)).trim() : raw.trim();
    const start = jsonPart.lastIndexOf("{");
    const end   = jsonPart.lastIndexOf("}");
    const candidate = start !== -1 && end > start ? jsonPart.slice(start, end + 1) : jsonPart;
    const parsed = safeJsonParse(candidate) || {};
    return {
      parameters: parsed.parameters || [],
      suggestions: parsed.suggestions || [],
      url: url || parsed.url || null,
    };
  }
  return { parameters: [], suggestions: [], url: null };
}

// simple overall score heuristic
function overallFromParameters(parameters = []) {
  if (!parameters.length) return 0;
  const overall = parameters.find(p => /overall|match/i.test(p?.name || ""));
  if (overall?.score != null) return Number(overall.score) || 0;
  // else avg
  const nums = parameters.map(p => Number(p.score) || 0);
  return Math.round(nums.reduce((a,b)=>a+b,0) / nums.length);
}

function ResumeUpload() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null); // {parameters, suggestions}
  const [loading, setLoading] = useState(false);
  const [improvedResumeLink, setImprovedResumeLink] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => setResumeFile(e.target.files[0] || null);
  const handleDescriptionChange = (e) => setJobDescription(e.target.value);

  // Save an analysis row for logged-in users (cookie-based auth)
  const saveAnalysis = async ({ parameters, suggestions, url }) => {
    try {
      const score = overallFromParameters(parameters);
      await fetch(`${API}/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resumeName: resumeFile?.name || "resume.pdf",
          score,
          suggestions: suggestions || [],
          improvedResumeUrl: url || null,
        }),
      });
      // let the table know it should refetch
      window.dispatchEvent(new Event("analysis:changed"));
    } catch (e) {
      // Non-blocking; user may be logged out
      console.warn("Failed to save analysis:", e);
    }
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

if (!response.ok) {
  throw new Error(`Server error: ${response.status} ${response.statusText}`);
}

// ✅ SAFE: read body ONCE
const rawText = await response.text();
const parsedJson = safeJsonParse(rawText);
const body = parsedJson ?? rawText;

const normalized = normalizeAnalyzeResponse(body);

setAnalysisResults({
  parameters: normalized.parameters,
  suggestions: normalized.suggestions,
});
setImprovedResumeLink(normalized.url || null);
setShowResults(true);


      // Try to persist this run (only works when logged in)
      saveAnalysis({
        parameters: normalized.parameters,
        suggestions: normalized.suggestions,
        url: normalized.url || null,
      });
    } catch (err) {
      console.error("Analyze error:", err);
      setError(err.message || "There was an error analyzing your resume.");
      alert("There was an error analyzing your resume.");
    } finally {
      setLoading(false);
    }
  };
  

// inside your component:
const formRef = useRef(null);

const handleJDKeyDown = (e) => {
  // Submit on Enter (allow Shift+Enter for a new line)
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    formRef.current?.requestSubmit(); // triggers the form's onSubmit
  }
};

  return (
    <>
      <section id="resume-upload" className="resume-analyzer-container">
        <div className="left-panel">
      <h2 className="d-title">Upload Resume & Job Description</h2>

      <form ref={formRef} onSubmit={handleAnalyze} className="upload-form">
        <label className="upload-label">
          Upload Resume
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </label>

        <label className="upload-label">
          Job Description
          <textarea
            rows="5"
            value={jobDescription}
            onChange={handleDescriptionChange}
            onKeyDown={handleJDKeyDown}   // ← add this
            placeholder="Paste the job description here..."
          />
        </label>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}
      </form>
    </div>

        {showResults && analysisResults && (
          <div className="right-panel">
            <h2 className="d-title">Resume Match Report</h2>

            {(analysisResults.parameters || []).map((param, idx) => (
              <ProgressBar
                key={idx}
                label={param.name}
                percentage={`${param.score || 0}%`}
              />
            ))}

            <div className="ai-hints">
              <h3 className="hint-title">AI Suggestions</h3>
              <ul>
                {analysisResults.suggestions?.length > 0 ? (
                  analysisResults.suggestions.map((suggestion, index) => (
                    <li key={index}>💡 {suggestion}</li>
                  ))
                ) : (
                  <li>No suggestions provided.</li>
                )}
              </ul>
            </div>

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

      {/* Reports for the signed-in user (will be empty if not logged in) */}
      <div className="reports-below">
        <ReportsTable />
      </div>
    </>
  );
}

export default ResumeUpload;
