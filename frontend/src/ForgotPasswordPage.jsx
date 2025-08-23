/* ============================================================================
 * @file        frontend/src/ForgotPasswordPage.jsx
 * @brief       Reset link request form for users who forgot their password.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import React, { useState } from "react";
import "./SignupPage.css";
import { withMinDelay } from "./withMinDelay";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!email.trim()) { setErr("Please enter your email."); return; }

    setLoading(true);
    try {
      const res = await withMinDelay(
        fetch(`${API}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        }),
        900
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to send reset email.");

      setMsg("If that email exists, we’ve sent a reset link to your inbox.");
    } catch (e2) {
      setErr(e2.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className="card-inner">
          <header className="card-head">
            <h1>Forgot password</h1>
            <p>Enter your email to receive a reset link</p>
          </header>

          <form onSubmit={onSubmit} className="form">
            <label className="field">
              <span className="field-label">Email Address</span>
              <span className="field-wrap">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            {err && <div className="mt-2" style={{ color: "#ff8a8a", fontSize: 14 }}>{err}</div>}
            {msg && <div className="mt-2" style={{ color: "#a7f3d0", fontSize: 14 }}>{msg}</div>}

            <button className="cta" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="signin">
            Remembered it? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
