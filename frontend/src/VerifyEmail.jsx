/* ============================================================================
 * @file        frontend/src/VerifyEmail.jsx
 * @brief       6-digit OTP verification UI and request handler.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import { withMinDelay } from "./withMinDelay";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const inputsRef = useRef([]);

  // hover glow (drives --x/--y used by your CSS)
  const onMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  const onLeave = (e) => {
    const el = e.currentTarget;
    el.style.removeProperty("--x");
    el.style.removeProperty("--y");
  };

  const focusIndex = (i) => {
    const el = inputsRef.current[i];
    if (el) el.focus();
  };

  useEffect(() => {
    // focus first box on mount
    focusIndex(0);
  }, []);

  const handleChange = (i, value) => {
    const v = (value || "").replace(/\D/g, "").slice(-1); // single digit
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < 5) focusIndex(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        setDigits((prev) => {
          const next = [...prev];
          next[i] = "";
          return next;
        });
      } else if (i > 0) {
        focusIndex(i - 1);
        setTimeout(() => {
          setDigits((prev) => {
            const next = [...prev];
            next[i - 1] = "";
            return next;
          });
        }, 0);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusIndex(i - 1);
    } else if (e.key === "ArrowRight" && i < 5) {
      e.preventDefault();
      focusIndex(i + 1);
    } else if (e.key === "Enter") {
      onSubmit(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!text) return;
    const arr = text.slice(0, 6).split("");
    setDigits((prev) => {
      const next = [...prev];
      for (let j = 0; j < 6; j++) next[j] = arr[j] || "";
      return next;
    });
    focusIndex(Math.min(arr.length, 6) - 1 || 0);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    const code = digits.join("");
    if (code.length !== 6) {
      setErr("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await withMinDelay(
        fetch(`${API}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code }),
        }),
        900
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Verification failed.");

      setMsg("Email verified! Redirecting to Sign in…");
      setTimeout(() => navigate("/login"), 900);
    } catch (e2) {
      setErr(e2.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className="card-inner">
          <header className="card-head">
            <h1>Verify your email</h1>
            <p>Enter the 6-digit code we sent to your inbox</p>
          </header>

          <form onSubmit={onSubmit} className="form">
            <div className="otp-grid" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  className="otp-box"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  aria-label={`Digit ${i + 1}`}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {err && <div className="mt-2" style={{ color: "#ff8a8a", fontSize: 14 }}>{err}</div>}
            {msg && <div className="mt-2" style={{ color: "#a7f3d0", fontSize: 14 }}>{msg}</div>}

            <button className="cta" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <p className="signin">
            Wrong inbox? <a href="/signup">Go back</a>
          </p>
        </div>
      </div>
    </div>
  );
}
