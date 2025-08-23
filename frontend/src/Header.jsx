/* ============================================================================
 * @file        frontend/src/Header.jsx
 * @brief       Sticky header with brand and auth controls; shows user greeting and logout when authenticated.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function Header() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const recheck = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${API}/auth/check`, { credentials: "include" });
      if (!res.ok) {
        setUser(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setUser(data?.user || null);
      }
    } catch {
      setUser(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    recheck();
    const onAuthChanged = () => recheck();
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, []);

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // do the server call and a tiny UX delay together
      await Promise.all([
        fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {}),
        new Promise((r) => setTimeout(r, 850)),
      ]);
    } finally {
      setUser(null);
      window.dispatchEvent(new Event("auth:changed"));
      setLoggingOut(false);
      navigate("/");
    }
  };

  const firstName = (user?.name || "").split("") || "there";

  return (
    <header className="head">
      <Link to="/" className="d-title" style={{ textDecoration: "none" }}>
        ResumeX
      </Link>

      {!checking && (
        user ? (
          <div className="auth-group">
            <span className="d-title">Hi, {firstName}</span>
            <button className="btn" onClick={onLogout} disabled={loggingOut}>
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        ) : (
          <div className="auth-group">
            <Link to="/login" className="btn" style={{ marginRight: 8 }}>Login</Link>
            <Link to="/signup" className="btn">Sign up</Link>
          </div>
        )
      )}
    </header>
  );
}

export default Header;
