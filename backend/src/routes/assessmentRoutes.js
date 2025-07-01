const express = require("express");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");
const Assessment = require("../models/Assessment");
const StudentSubmission = require("../models/studentsubmission");
const upload = require("../middlewares/uploadMiddleware");
const AssignedAssessment = require("../models/AssignedAssessment");
const path = require("path");
const OpenAI = require("openai");
const { Op } = require("sequelize");
const User = require("../models/User"); // Add this for fetching student details
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const router = express.Router();

// ✅ Create Assessment (Tutor Only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["tutor"]),
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const file = req.file ? req.file.filename : null;
      const tutorId = req.user.id;

      const assessment = await Assessment.create({
        title,
        description,
        file,
        tutorId,
      });
      res.status(201).json(assessment);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating assessment", error: error.message });
    }
  }
);

// ✅ Get Assessments (Tutor Only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["tutor", "admin"]),
  async (req, res) => {
    try {
      const assessments = await Assessment.findAll({
        where: { tutorId: req.user.id },
      });
      res.json(assessments);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching assessments", error: error.message });
    }
  }
);

// ✅ Assign Assessment to Students
router.post(
  "/assign",
  authMiddleware,
  roleMiddleware(["tutor"]),
  async (req, res) => {
    try {
      const { assessmentId, studentIds } = req.body;

      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res
          .status(400)
          .json({ message: "Please provide valid student IDs" });
      }

      const assessment = await Assessment.findByPk(assessmentId);
      if (!assessment)
        return res.status(404).json({ message: "Assessment not found" });

      await Promise.all(
        studentIds.map(async (studentId) => {
          await AssignedAssessment.create({ studentId, assessmentId });
        })
      );

      res.json({ message: "Assessment assigned successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error assigning assessment", error: error.message });
    }
  }
);

// ✅ Student: View Assigned Assessments
router.get(
  "/student/assigned",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const studentId = req.user.id;

      // ✅ Correcting the association
      const assignedAssessments = await AssignedAssessment.findAll({
        where: { studentId },
        include: [
          { model: Assessment, as: "assessmentDetails" }, // ✅ Correct alias
        ],
      });

      if (!assignedAssessments.length) {
        return res
          .status(404)
          .json({ message: "No assigned assessments found" });
      }

      res.json(assignedAssessments);
    } catch (error) {
      console.error("Error fetching assigned assessments:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ✅ Student: Submit Assessment
router.post(
  "/submissions",
  authMiddleware,
  roleMiddleware(["student"]),
  upload.single("file"),
  async (req, res) => {
    try {
      const { assessmentId } = req.body;
      const file = req.file.filename;
      const studentId = req.user.id;

      await StudentSubmission.create({ studentId, assessmentId, file });
      res.json({ message: "Solution submitted successfully!" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error submitting solution", error: error.message });
    }
  }
);

// ✅ Tutor: View Submissions
router.get(
  "/submissions",
  authMiddleware,
  roleMiddleware(["tutor"]),
  async (req, res) => {
    try {
      const submissions = await StudentSubmission.findAll({
        include: [
          { model: Assessment, as: "assessmentDetails" }, // ✅ Correct alias
          { model: User, as: "studentDetails" }, // ✅ Fetch student details
        ],
      });
      res.json(submissions);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching submissions", error: error.message });
    }
  }
);

// ✅ Tutor: Grade Submissions
router.post(
  "/grade",
  authMiddleware,
  roleMiddleware(["tutor"]),
  async (req, res) => {
    try {
      const { submissionId, grade, feedback } = req.body;
      const submission = await StudentSubmission.findByPk(submissionId);

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // ✅ Update grade and feedback
      submission.grade = grade;
      submission.feedback = feedback;
      await submission.save();

      res.json({ message: "Grading submitted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error grading submission", error: error.message });
    }
  }
);

// ✅ Student: View Grades
router.get(
  "/student/grades",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const gradedSubmissions = await StudentSubmission.findAll({
        where: { studentId, grade: { [Op.ne]: null } },
        include: [{ model: Assessment, as: "assessmentDetails" }], // ✅ Fix alias
      });

      res.json(gradedSubmissions);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching grades", error: error.message });
    }
  }
);

// ✅ Delete Assessment
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["tutor"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const assessment = await Assessment.findByPk(id);
      if (!assessment)
        return res.status(404).json({ message: "Assessment not found" });

      await assessment.destroy();
      res.json({ message: "Assessment deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting assessment", error: error.message });
    }
  }
);

// ✅ Serve Uploaded Files
router.get("/file/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);
  res.sendFile(filePath);
});

module.exports = router;
