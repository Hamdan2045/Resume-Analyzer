/* ============================================================================
 * @file        backend/utils/generateJWTToken.js
 * @brief       Helper to sign JWT and set it as a secure cookie.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import jwt from "jsonwebtoken";

export const generateJWTToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,                     // must be true on HTTPS
    sameSite: isProd ? "none" : "lax",  // allow cross-site in prod, dev works on localhost
    path: "/",                          // 👈 add this
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
