// backend/controllers/analysis-controller.js
import Analysis from "../model/analysis.js";   // <-- default import

export const listAnalyses = async (req, res) => {
  try {
    const items = await Analysis.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, items });
  } catch (e) {
    console.error("listAnalyses error:", e);
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createAnalysis = async (req, res) => {
  try {
    // debug log (remove later)
   

    const { resumeName, score, suggestions = [], improvedResumeUrl = null } = req.body;
    if (!resumeName || typeof score !== "number") {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const doc = await Analysis.create({
      userId: req.userId,
      resumeName,
      score,
      suggestions,
      improvedResumeUrl,
    });

    res.status(201).json({ success: true, item: doc });
  } catch (e) {
    console.error("createAnalysis error:", e);
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    await Analysis.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (e) {
    console.error("deleteAnalysis error:", e);
    res.status(400).json({ success: false, message: e.message });
  }
};
