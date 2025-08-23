// backend/model/analysis.js
import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resumeName: { type: String, required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    suggestions: [{ type: String }],
    improvedResumeUrl: { type: String },
  },
  { timestamps: true }
);

// Use default export and this exact name once across the app
export default mongoose.model("Analysis", AnalysisSchema);
