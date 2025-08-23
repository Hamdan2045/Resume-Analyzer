/* ============================================================================
 * @file        frontend/src/SignupPage.jsx
 * @brief       Sign up form with animated glassy card and API integration.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import { withMinDelay } from "./withMinDelay";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await withMinDelay(
        fetch(`${API}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }),
        900
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setMessage("Account created. Check your email for the verification code.");
      setTimeout(() => navigate("/verify-email"), 400);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className="card-inner">
          <header className="card-head">
            <h1>Create an account</h1>
            <p>Join us and start your journey today</p>
          </header>

          <form onSubmit={onSubmit} className="form">
            <label className="field">
              <span className="field-label">Full Name</span>
              <span className="field-wrap">
                <span className="icon left" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" fill="currentColor"/>
                  </svg>
                </span>
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={onChange}
                  autoComplete="name"
                  required
                />
              </span>
            </label>

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
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="new-password"
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

            {error && <div className="mt-2" style={{ color: "#ff8a8a", fontSize: 14 }}>{error}</div>}
            {message && <div className="mt-2" style={{ color: "#a7f3d0", fontSize: 14 }}>{message}</div>}

            <button className="cta" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="signin">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
