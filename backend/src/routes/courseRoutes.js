const express = require("express");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");
const Course = require("../models/Course");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// ✅ Create Course (Supports Image & Study Material)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "studyMaterial", maxCount: 10 }, // ✅ Allow multiple files
  ]),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const tutorId = req.user.id;

      if (!title || !description) {
        return res
          .status(400)
          .json({ message: "Title and description are required." });
      }

      if (!req.files || !req.files["image"] || !req.files["studyMaterial"]) {
        return res
          .status(400)
          .json({ message: "Both image and study material are required." });
      }

      const imagePath = `/uploads/${req.files["image"][0].filename}`;

      // ✅ Store studyMaterial as an array
      const studyMaterialPaths = req.files["studyMaterial"].map(
        (file) => `/uploads/${file.filename}`
      );

      const course = await Course.create({
        title,
        description,
        tutorId,
        studyMaterial: studyMaterialPaths, // ✅ Save as an array (not JSON string)
        image: imagePath,
      });

      res.status(201).json(course);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating course", error: error.message });
    }
  }
);

// ✅ Update Course (Supports Image & Additional Study Material Upload)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "studyMaterial", maxCount: 10 }, // ✅ Allow multiple files
  ]),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const course = await Course.findByPk(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // ✅ Ensure `studyMaterial` remains an array
      let existingMaterials = Array.isArray(course.studyMaterial)
        ? course.studyMaterial
        : JSON.parse(course.studyMaterial || "[]");

      // ✅ Append new files to the existing list
      if (req.files["studyMaterial"]) {
        const newMaterials = req.files["studyMaterial"].map(
          (file) => `/uploads/${file.filename}`
        );
        existingMaterials = [...existingMaterials, ...newMaterials];
      }

      // ✅ Update course details
      course.title = title || course.title;
      course.description = description || course.description;
      course.image = req.files["image"]
        ? `/uploads/${req.files["image"][0].filename}`
        : course.image;
      course.studyMaterial = existingMaterials; // ✅ Save as array

      await course.save();

      res.json({ message: "Course updated successfully", course });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating course", error: error.message });
    }
  }
);

// ✅ Serve Uploaded Images & Files
router.get("/image/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);
  res.sendFile(filePath);
});

router.get("/file/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);
  res.sendFile(filePath);
});

// ✅ Get All Courses
router.get("/", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.findAll();

    // ✅ Ensure `studyMaterial` is always an array when returning courses
    const updatedCourses = courses.map((course) => ({
      ...course.toJSON(),
      studyMaterial: course.studyMaterial
        ? JSON.parse(course.studyMaterial)
        : [],
    }));

    res.json(updatedCourses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching courses", error: error.message });
  }
});

// ✅ Delete Course
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // ✅ Delete the image file if it exists
      if (course.image) {
        const imagePath = path.join(
          __dirname,
          "../uploads",
          path.basename(course.image)
        );
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      // ✅ Check if `studyMaterial` is a JSON string, then parse it to an array
      let studyMaterials = [];
      if (course.studyMaterial) {
        try {
          studyMaterials = JSON.parse(course.studyMaterial); // ✅ Ensure it's parsed
          if (!Array.isArray(studyMaterials)) studyMaterials = []; // Handle cases where parsing fails
        } catch (error) {
          console.error("Error parsing studyMaterial:", error);
        }
      }

      // ✅ Delete each study material file
      studyMaterials.forEach((materialPath) => {
        const fullPath = path.join(
          __dirname,
          "../uploads",
          path.basename(materialPath)
        );
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });

      // ✅ Delete course from database
      await course.destroy();

      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// ✅ Upload Additional Study Materials
router.post(
  "/upload/:id",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  upload.array("studyMaterial", 10),
  async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (req.user.role === "tutor" && course.tutorId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this course" });
      }

      // ✅ Merge existing study materials with new ones
      const newFiles = req.files.map((file) => `/uploads/${file.filename}`);
      const updatedMaterials = [...course.studyMaterial, ...newFiles];

      course.studyMaterial = updatedMaterials;
      await course.save();

      res.json({ message: "Study materials added successfully", course });
    } catch (error) {
      res.status(500).json({
        message: "Error uploading study materials",
        error: error.message,
      });
    }
  }
);

module.exports = router;
