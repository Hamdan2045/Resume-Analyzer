/* ============================================================================
 * @file        frontend/src/SignupPage.jsx
 * @brief       Sign up form with animated glassy card and API integration.
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

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

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

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    /* =========================
       CLIENT-SIDE VALIDATION
    ========================= */
    if (!name) {
      return setError("Please enter your full name.");
    }

    if (!isValidEmail(email)) {
      return setError("Please enter a valid email address.");
    }

    if (!isStrongPassword(password)) {
      return setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
    }

    setLoading(true);
    try {
      const res = await withMinDelay(
        fetch(`${API}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
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
            {/* NAME */}
            <label className="field">
              <span className="field-label">Full Name</span>
              <span className="field-wrap">
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
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>

            {/* ERRORS */}
            {error && (
              <div style={{ color: "#ff8a8a", fontSize: 14 }}>{error}</div>
            )}
            {message && (
              <div style={{ color: "#a7f3d0", fontSize: 14 }}>{message}</div>
            )}

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
