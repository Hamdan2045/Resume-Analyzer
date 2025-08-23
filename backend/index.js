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
const allowedOrigins = new Set(
  (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
);

// Strong CORS with credentials + proper preflight handling
const corsOptions = {
  origin(origin, cb) {
    // allow server-to-server calls (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ← handle OPTIONS preflights

app.use(express.json());
app.use(cookieParser());

// Health check (handy to debug CORS quickly)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, allow: [...allowedOrigins] });
});

// Routes
app.use("/api/auth", router);
app.use("/api/analysis", analysisRouter);

connectToDatabase();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
