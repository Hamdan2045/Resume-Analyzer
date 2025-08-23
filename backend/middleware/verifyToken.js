/* ============================================================================
 * @file        backend/middleware/verifyToken.js
 * @brief       JWT cookie verifier; populates req.userId.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;           // requires cookie-parser
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
