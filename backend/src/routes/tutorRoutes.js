const express = require("express");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Only Tutors can access this route
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["tutor"]),
  (req, res) => {
    res.json({ message: "Welcome to Tutor Dashboard" });
  }
);

module.exports = router;
