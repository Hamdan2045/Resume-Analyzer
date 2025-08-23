// backend/routes/analysis-route.js
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { listAnalyses, createAnalysis, deleteAnalysis } from "../controllers/analysis-controller.js";

const router = express.Router();
router.get("/", verifyToken, listAnalyses);
router.post("/", verifyToken, createAnalysis);
router.delete("/:id", verifyToken, deleteAnalysis);
export default router;
