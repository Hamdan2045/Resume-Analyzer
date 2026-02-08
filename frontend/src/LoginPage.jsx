/* ============================================================================
 * @file        frontend/src/LoginPage.jsx
 * @brief       Login form with API integration and auth refresh broadcast.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignupPage.css";
import { withMinDelay } from "./withMinDelay";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/* =========================
   VALIDATION HELPERS
========================= */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    /* =========================
       CLIENT-SIDE VALIDATION
    ========================= */
    if (!email || !password) {
      return setErr("Please enter your email and password.");
    }

    if (!isValidEmail(email)) {
      return setErr("Please enter a valid email address.");
    }

    setLoading(true);
    try {
      const res = await withMinDelay(
        fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
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
            {/* EMAIL */}
            <label className="field">
              <span className="field-label">Email Address</span>
              <span className="field-wrap">
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

            {/* PASSWORD */}
            <label className="field">
              <span className="field-label">Password</span>
              <span className="field-wrap">
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
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>

            <div className="signin" style={{ textAlign: "right", marginTop: "-6px" }}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            {err && (
              <div style={{ color: "#ff8a8a", fontSize: 14 }}>{err}</div>
            )}
            {msg && (
              <div style={{ color: "#a7f3d0", fontSize: 14 }}>{msg}</div>
            )}

            <button className="cta" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="signin">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
