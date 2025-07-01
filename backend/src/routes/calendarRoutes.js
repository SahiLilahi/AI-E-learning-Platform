const express = require("express");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");
const CalendarEvent = require("../models/calendarEvent");

const router = express.Router();

// ✅ Add Calendar Event
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["tutor"]),
  async (req, res) => {
    const { title, date } = req.body;
    const tutorId = req.user.id;

    const event = await CalendarEvent.create({ title, date, tutorId });
    res.json(event);
  }
);

// ✅ Fetch Events
router.get("/", authMiddleware, async (req, res) => {
  const events = await CalendarEvent.findAll();
  res.json(events);
});

module.exports = router;
