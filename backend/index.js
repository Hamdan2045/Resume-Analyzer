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
app.set("trust proxy", 1); // ← REQUIRED on Render so secure cookies work behind proxy

const PORT = process.env.PORT || 3000;

// Build allowlist once (supports comma-separated CLIENT_URLS)
const originPatterns = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// optional: log what we allow
console.log("[CORS] patterns:", originPatterns);

// simple matcher with wildcard support on hostname
function isAllowedOrigin(origin) {
  if (!origin) return true; // server-to-server/curl
  try {
    const u = new URL(origin);
    return originPatterns.some((p) => {
      if (!p.startsWith("http")) return false;
      // exact match
      if (!p.includes("*")) return p === origin;

      // wildcard match on host (protocol must match)
      const pu = new URL(p.replace("*", "wildcard"));
      if (pu.protocol !== u.protocol) return false;

      const hostPattern = pu.host
        .replace(/[-/\\^$+?.()|[\]{}]/g, "\\.")
        .replace("wildcard", ".*");

      const re = new RegExp(`^${hostPattern}$`);
      return re.test(u.host);
    });
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, cb) {
    if (isAllowedOrigin(origin)) return cb(null, true);
    cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health check (handy to debug CORS quickly)


// Routes
app.use("/api/auth", router);
app.use("/api/analysis", analysisRouter);

connectToDatabase();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
