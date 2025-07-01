const express = require("express");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Only Students can access this route
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["student"]),
  (req, res) => {
    res.json({ message: "Welcome to Student Dashboard" });
  }
);

module.exports = router;
