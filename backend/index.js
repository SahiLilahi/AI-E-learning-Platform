require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/database");

// Import Routes
const aiAssessmentsRoutes = require("./src/routes/aiAssessments");
const authRoutes = require("./src/routes/authRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const assessmentRoutes = require("./src/routes/assessmentRoutes");
const calendarRoutes = require("./src/routes/calendarRoutes");
const aiAssessmentRoutes = require("./src/routes/aiRoutes");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve Static Files (for file uploads)
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes

app.use("/api/ai/assessments", aiAssessmentsRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assessments", assessmentRoutes); // ✅ New
app.use("/api/calendar", calendarRoutes); // ✅ New
app.use("/api/ai", aiAssessmentRoutes);
// Default Route
app.get("/", (req, res) => {
  res.send("E-learning Backend API is Running...");
});

// Start Server and Sync Database
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await sequelize.sync({ alter: true }); // Sync Database Tables
    console.log(`✅ Server running on port ${PORT}`);
  } catch (error) {
    console.error("❌ Database Sync Error:", error);
  }
});
