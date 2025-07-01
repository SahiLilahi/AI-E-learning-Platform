const express = require("express");
const AIAssessment = require("../models/AIAssessmentt");
const router = express.Router();

// ✅ Fetch all AI-generated assessments
router.get("/", async (req, res) => {
  try {
    const assessments = await AIAssessment.findAll();
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching AI assessments:", error);
    res.status(500).json({ message: "Error fetching AI assessments" });
  }
});

module.exports = router;
