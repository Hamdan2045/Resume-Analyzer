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
const key = process.env.SENDGRID_API_KEY || "";
console.log("[sendgrid] key present:", !!key, "len:", key.length);
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(express.json());
app.use(cookieParser());

// REQUIRED for cookie-based auth from the browser
const allowed = (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);          // server-to-server, curl, etc.
    return cb(null, allowed.includes(origin));   // allow only listed origins
  },
  credentials: true,
}));

// Your auth routes mounted here
app.use("/api/auth", router);
app.use("/api/analysis", analysisRouter);
connectToDatabase();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

