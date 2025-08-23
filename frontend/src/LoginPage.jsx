/* ============================================================================
 * @file        frontend/src/LoginPage.jsx
 * @brief       Login form with API integration and auth refresh broadcast.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import { withMinDelay } from "./withMinDelay";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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

    if (!form.email || !form.password) {
      setErr("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await withMinDelay(
        fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }),
        900
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Login failed");

      setMsg("Logged in successfully. Redirecting…");
      window.dispatchEvent(new Event("auth:changed"));
      setTimeout(() => navigate("/"), 400);
    } catch (e2) {
      setErr(e2.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className="card-inner">
          <header className="card-head">
            <h1>Welcome back</h1>
            <p>Sign in to continue</p>
          </header>

          <form onSubmit={onSubmit} className="form">
            <label className="field">
              <span className="field-label">Email Address</span>
              <span className="field-wrap">
                <span className="icon left" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16a2 2 0 0 1 2 2v.35l-10 5.5-10-5.5V8a2 2 0 0 1 2-2Zm16 12H4a2 2 0 0 1-2-2V9.8l10 5.5 10-5.5V16a2 2 0 0 1-2 2Z" fill="currentColor"/>
                  </svg>
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <span className="field-wrap">
                <span className="icon left" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-6 0V7a3 3 0 0 1 6 0v2h-6Z" fill="currentColor"/>
                  </svg>
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="icon right eye"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3l18 18M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12M2 12s4-7 10-7 10 7 10 7-1.19 2.08-3.2 3.8M6.2 15.8C4.19 14.08 2 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5c6 0 10 7 10 7s-4 7-10 7S2 12 2 12s4-7 10-7Zm0 10a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" fill="currentColor"/>
                    </svg>
                  )}
                </button>
              </span>
            </label>

            <div className="signin" style={{ textAlign: "right", marginTop: "-6px" }}>
              <a href="/forgot-password">Forgot password?</a>
            </div>

            {err && <div className="mt-2" style={{ color: "#ff8a8a", fontSize: 14 }}>{err}</div>}
            {msg && <div className="mt-2" style={{ color: "#a7f3d0", fontSize: 14 }}>{msg}</div>}

            <button className="cta" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="signin">
            New here? <a href="/signup">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}
