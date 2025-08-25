/* ============================================================================
 * @file        backend/index.js
 * @brief       Express app bootstrap (CORS, cookies, routes).
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectToDatabase } from "./database/connectiontoDatabase.js";
import router from "./routes/auth-route.js";
import analysisRouter from "./routes/analysis-route.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1); // Render/any proxy: required for secure cookies

const PORT = process.env.PORT || 3000;

// Build allowlist (supports comma-separated CLIENT_URLS). Add sensible defaults for dev.
const originPatterns = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

if (originPatterns.length === 0) {
  originPatterns.push(
    "http://localhost:5173",
    "http://localhost:3000",
    "https://*.vercel.app"
  );
}

console.log("[CORS] patterns:", originPatterns);

// Simple matcher with wildcard support on host (protocol must match)
function isAllowedOrigin(origin) {
  if (!origin) return true; // server-to-server/curl/no Origin header
  try {
    const u = new URL(origin);
    return originPatterns.some((p) => {
      if (!p.startsWith("http")) return false;

      // exact match
      if (!p.includes("*")) return p === origin;

      // wildcard on host (e.g., https://*.vercel.app)
      const marker = "__WILDCARD__";
      const pFixed = p.replace("*", marker);
      const pu = new URL(pFixed);
      if (pu.protocol !== u.protocol) return false;

      // Escape regex chars, then replace marker with .*
      const hostPattern = pu.host
        .replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&")
        .replace(marker, ".*");

      const re = new RegExp(`^${hostPattern}$`, "i");
      return re.test(u.host);
    });
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, cb) {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin || "no-origin"}`));
  },
  credentials: true,
};

// CORS + preflights (Express 5: use "*" not ".*")
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Health check (useful to confirm allowlist on Render)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, allow: originPatterns });
});

// Routes
app.use("/api/auth", router);
app.use("/api/analysis", analysisRouter);

// CORS error handler → return 403 JSON instead of throwing
app.use((err, req, res, next) => {
  if (err && typeof err.message === "string" && err.message.startsWith("Not allowed by CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }
  next(err);
});

connectToDatabase();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
