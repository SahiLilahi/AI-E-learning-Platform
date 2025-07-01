const express = require("express");
const { checkAdminAuth } = require("../middlewares/authMiddleware"); // Ensure only admin access
const Course = require("../models/Course");
const User = require("../models/User");
const Assessment = require("../models/Assessment");

const router = express.Router();

// Get all courses
router.get("/courses", checkAdminAuth, async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a course
router.delete("/courses/:id", checkAdminAuth, async (req, res) => {
  try {
    await Course.destroy({ where: { id: req.params.id } });
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/users", checkAdminAuth, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
router.delete("/users/:id", checkAdminAuth, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all assessments
router.get("/assessments", checkAdminAuth, async (req, res) => {
  try {
    const assessments = await Assessment.findAll();
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an assessment
router.delete("/assessments/:id", checkAdminAuth, async (req, res) => {
  try {
    await Assessment.destroy({ where: { id: req.params.id } });
    res.json({ message: "Assessment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
