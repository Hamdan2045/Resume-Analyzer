/* ============================================================================
 * @file        frontend/src/ResetPasswordPage.jsx
 * @brief       UI to set a new password via a one-time token.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SignupPage.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/* =========================
   VALIDATION HELPERS
========================= */
const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
    setErr("");
    setMsg("");

    /* =========================
       CLIENT-SIDE VALIDATION
    ========================= */
    if (!password.trim() || !confirm.trim()) {
      return setErr("Please enter and confirm your new password.");
    }

    if (!isStrongPassword(password)) {
      return setErr(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
    }

    if (password !== confirm) {
      return setErr("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");

      setMsg("Password reset successful. Redirecting to login…");
      setTimeout(() => navigate("/login"), 1000);
    } catch (e2) {
      setErr(e2.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className="card-inner">
          <header className="card-head">
            <h1>Set a new password</h1>
            <p>Enter a strong new password for your account</p>
          </header>

          <form onSubmit={onSubmit} className="form">
            <label className="field">
              <span className="field-label">New Password</span>
              <span className="field-wrap">
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">Confirm Password</span>
              <span className="field-wrap">
                <input
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </span>
            </label>

            {err && (
              <div style={{ color: "#ff8a8a", fontSize: 14 }}>{err}</div>
            )}
            {msg && (
              <div style={{ color: "#a7f3d0", fontSize: 14 }}>{msg}</div>
            )}

            <button className="cta" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <p className="signin">
            Back to <a href="/login">login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
