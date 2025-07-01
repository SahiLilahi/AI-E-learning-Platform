const express = require("express");
const router = express.Router();
const openai = require("../config/openai");
const AIAssessment = require("../models/AIAssessmentt");
const AssessmentAssignment = require("../models/AssessmentAssignment");
const AIStudentResponse = require("../models/AIStudentResponse");
const User = require("../models/User");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");

const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
/**
 * Generate MCQ Questions using OpenAI
 */

const upload = multer({ dest: "uploads/" });

router.post("/generate-from-file", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { description } = req.body; // Get user-provided description

    if (!file) return res.status(400).json({ error: "File is required" });

    let textContent = "";

    // Extract text from PDF or Word
    if (file.mimetype === "application/pdf") {
      const pdfBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(pdfBuffer);
      textContent = pdfData.text;
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const docBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: docBuffer });
      textContent = result.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    fs.unlinkSync(file.path); // cleanup

    // Combine description and file content
    const combinedText = `${description || ""}\n\n${textContent}`;

    if (!combinedText || combinedText.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "Combined content is too short for questions" });
    }

    const prompt = `
You are a helpful AI assistant. Using the following user instructions and file content, generate 3 multiple-choice questions (MCQs) and 2 subjective (short answer) questions.

- Use the user's description to understand the context or focus area.
- Then generate questions based on both the instructions and the content.
- Questions should be relevant to educational assessments.

Combined Content:
"""${combinedText.substring(0, 3000)}"""

Expected Format:
[
  { "type": "mcq", "question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "..." },
  { "type": "subjective", "question": "...", "expected_answer": "..." }
]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that generates educational MCQs and subjective questions.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    let questions = [];
    try {
      questions = JSON.parse(response.choices[0].message.content);
    } catch (err) {
      return res
        .status(500)
        .json({ error: "AI response could not be parsed." });
    }

    if (!Array.isArray(questions) || questions.length !== 5) {
      return res
        .status(500)
        .json({ error: "Invalid AI-generated questions format." });
    }

    // Save with title, description and questions
    const assessment = await AIAssessment.create({
      title: file.originalname,
      description: description || "", // save original description
      questions,
    });

    res
      .status(201)
      .json({ message: "Assessment generated from file", assessment });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to generate assessment." });
  }
});

router.post("/generate", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // OpenAI prompt for MCQs and Subjective Questions
    const prompt = `
      Generate 3 multiple-choice questions (MCQs) and 2 subjective questions on "${title}". 
      Format:
      [
        { "type": "mcq", "question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "..." },
        { "type": "subjective", "question": "...", "expected_answer": "..." }
      ]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use a cheaper model
      messages: [
        {
          role: "system",
          content:
            "You are an AI that generates educational MCQs and subjective questions.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    // Parse AI response
    let questions = [];
    try {
      questions = JSON.parse(response.choices[0].message.content);
    } catch (err) {
      return res
        .status(500)
        .json({ error: "AI response could not be parsed." });
    }

    if (!Array.isArray(questions) || questions.length !== 5) {
      return res
        .status(500)
        .json({ error: "Invalid AI-generated questions format." });
    }

    // Save assessment in DB
    const assessment = await AIAssessment.create({ title, questions });

    res.status(201).json({ message: "Assessment generated", assessment });
  } catch (error) {
    console.error("❌ OpenAI error:", error.message);
    res.status(500).json({ error: "Failed to generate assessment." });
  }
});

/**
 * Assign an Assessment to a Student
 */
router.post(
  "/assign",
  authMiddleware,
  roleMiddleware(["tutor"]),
  async (req, res) => {
    try {
      const { assessmentId, studentIds } = req.body;

      if (
        !assessmentId ||
        !Array.isArray(studentIds) ||
        studentIds.length === 0
      ) {
        return res
          .status(400)
          .json({ error: "Assessment ID and valid student IDs are required" });
      }

      // Check if assessment exists
      const assessment = await AIAssessment.findByPk(assessmentId);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Assign assessment to students
      const assignments = await Promise.all(
        studentIds.map((studentId) =>
          AssessmentAssignment.create({ studentId, assessmentId })
        )
      );

      res
        .status(201)
        .json({ message: "Assessment assigned successfully", assignments });
    } catch (error) {
      console.error("❌ Error assigning AI assessment:", error);
      res.status(500).json({ error: "Failed to assign AI assessment." });
    }
  }
);

/**
 * Submit Answers
 */
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { assessmentId, responses } = req.body;
    const studentId = req.user.id;

    if (!studentId || !assessmentId || !Array.isArray(responses)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Fetch assessment from the database
    const assessment = await AIAssessment.findByPk(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Ensure `questions` is an array
    const questionsArray = Array.isArray(assessment.questions)
      ? assessment.questions
      : JSON.parse(assessment.questions || "[]");

    if (questionsArray.length === 0) {
      return res
        .status(400)
        .json({ error: "No questions found in this assessment" });
    }

    // Ensure student hasn't already submitted
    const existingSubmission = await AIStudentResponse.findOne({
      where: { studentId, assessmentId },
    });
    if (existingSubmission) {
      return res
        .status(400)
        .json({ error: "You have already submitted this assessment" });
    }

    // Combine questions and responses into one array
    const questions_responses = questionsArray.map((question, index) => ({
      question: question.question,
      type: question.type,
      options: question.options || null,
      correct_answer: question.correct_answer || null,
      student_response: responses[index] || null,
    }));

    // Save student submission
    const studentResponse = await AIStudentResponse.create({
      studentId,
      assessmentId,
      questions_responses,
      grade: "Pending",
    });

    res.status(201).json({
      message: "Responses submitted successfully",
      submission: studentResponse,
    });
  } catch (error) {
    console.error("❌ Error saving AI assessment response:", error);
    res.status(500).json({ error: "Failed to submit responses." });
  }
});

/**
 * Get All AI-Generated Assessments
 */
router.get("/ai-assessments", async (req, res) => {
  try {
    const aiAssessments = await AIAssessment.findAll();
    res.status(200).json(aiAssessments);
  } catch (error) {
    console.error("❌ Error fetching AI assessments:", error.message);
    res.status(500).json({ error: "Failed to fetch AI assessments." });
  }
});

/**
 * Get Student's Assigned Assessments
 */
router.get("/student-assigned", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;

    if (!studentId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const assignedAI = await AssessmentAssignment.findAll({
      where: { studentId },
      include: [{ model: AIAssessment, as: "assessmentDetails" }],
    });

    res.status(200).json(assignedAI.map((a) => a.assessmentDetails));
  } catch (error) {
    console.error("❌ Error fetching AI assessments:", error);
    res.status(500).json({ error: "Failed to fetch AI assessments." });
  }
});

/**
 * Fetch All Student Submissions for an Assessment
 */
router.get("/submissions/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`🔍 Fetching all AI responses for studentId: ${studentId}`);

    // Check if student exists
    const student = await User.findByPk(studentId);
    if (!student) {
      console.log("❌ Student not found");
      return res.status(404).json({ error: "Student not found" });
    }

    const submissions = await AIStudentResponse.findAll({
      where: { studentId },
      include: [
        {
          model: AIAssessment,
          as: "assessmentDetails",
          attributes: ["title"],
        },
        {
          model: User,
          as: "student",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    submissions.forEach((submission, index) => {
      try {
        submission.questions_responses = JSON.parse(
          JSON.stringify(submission.questions_responses || "[]")
        );
      } catch (err) {
        console.error(`🚨 JSON Parsing Error in submission ${index}:`, err);
      }
    });

    res.status(200).json(submissions);
  } catch (error) {
    console.error("❌ Error fetching AI submissions:", error);
    res.status(500).json({ error: "Failed to fetch AI submissions." });
  }
});

/**
 * AI-Based Answer Evaluation
 */

router.post("/evaluate", async (req, res) => {
  try {
    const { submissionId } = req.body;

    if (!submissionId) {
      return res.status(400).json({ error: "Submission ID is required" });
    }

    const submission = await AIStudentResponse.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    let questions_responses = submission.questions_responses;
    if (typeof questions_responses === "string") {
      try {
        questions_responses = JSON.parse(questions_responses);
      } catch (err) {
        console.error("🚨 Failed to parse questions_responses:", err);
        return res.status(500).json({ error: "Invalid responses format." });
      }
    }

    if (!Array.isArray(questions_responses)) {
      return res
        .status(400)
        .json({ error: "questions_responses should be an array" });
    }

    let totalScore = 0;
    let totalQuestions = questions_responses.length;
    let correctAnswers = 0;

    // Evaluate MCQs
    for (let q of questions_responses) {
      if (q.type === "mcq") {
        const isCorrect = q.student_response === q.correct_answer;
        q.score = isCorrect ? 1 : 0;
        if (isCorrect) correctAnswers++;
      } else {
        q.score = "Pending"; // Subjective eval can be done later
      }
    }

    const percentage = (correctAnswers / totalQuestions) * 100;

    // 📦 Generate AI Feedback using OpenAI
    const feedbackPrompt = `
You are an expert tutor. A student submitted an AI-generated test. Below are their answers and whether they were correct:

${questions_responses
  .map(
    (q, index) =>
      `Q${index + 1}: ${q.question}
Student Answer: ${q.student_response}
Correct Answer: ${q.correct_answer || "Subjective"}
Score: ${q.score}`
  )
  .join("\n\n")}

The student scored ${correctAnswers} out of ${totalQuestions} (${percentage.toFixed(
      2
    )}%).

Give a short and constructive feedback (max 3-4 sentences) highlighting:
- Strengths based on correct answers
- Specific topics or areas they should revise
- Encouragement or next steps
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or gpt-4 if preferred
      messages: [{ role: "user", content: feedbackPrompt }],
    });

    const aiFeedback = completion.choices[0].message.content.trim();

    // Save updated submission
    submission.grade = `${correctAnswers} / ${totalQuestions}`;
    submission.feedback = aiFeedback;
    submission.questions_responses = questions_responses;

    await submission.save();

    res.status(200).json({
      message: "Evaluation complete with AI feedback",
      submission,
    });
  } catch (error) {
    console.error("❌ AI Evaluation error:", error);
    res.status(500).json({ error: "Failed to evaluate with AI feedback" });
  }
});

/**
 * Get All AI-Generated Assessments (For Tutor Dashboard)
 */
router.get(
  "/tutor/ai-assessments",
  authMiddleware,
  roleMiddleware(["tutor"]),
  async (req, res) => {
    try {
      const assessments = await AIAssessment.findAll();
      res.status(200).json(assessments);
    } catch (error) {
      console.error("❌ Error fetching AI assessments:", error.message);
      res.status(500).json({ error: "Failed to fetch AI assessments." });
    }
  }
);

router.get(
  "/all-submissions",
  authMiddleware,
  roleMiddleware(["tutor"]),
  async (req, res) => {
    try {
      console.log("🔍 Fetching all AI-generated student submissions...");

      const submissions = await AIStudentResponse.findAll({
        include: [
          {
            model: AIAssessment,
            as: "assessmentDetails",
            attributes: ["title"],
          },
          { model: User, as: "student", attributes: ["id", "name", "email"] },
        ],
      });

      console.log(`📊 Found ${submissions.length} AI submissions`);

      // Ensure `questions_responses` is properly parsed
      submissions.forEach((submission, index) => {
        try {
          submission.questions_responses = JSON.parse(
            JSON.stringify(submission.questions_responses || "[]")
          );
        } catch (err) {
          console.error(`🚨 JSON Parsing Error in submission ${index}:`, err);
        }
      });

      res.status(200).json(submissions);
    } catch (error) {
      console.error("❌ Error fetching all AI submissions:", error);
      res.status(500).json({ error: "Failed to fetch all submissions." });
    }
  }
);

router.get("/submissions/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch submissions, grade, and feedback for the student
    const submissions = await AIStudentResponse.findAll({
      where: { studentId },
      attributes: ["assessmentId", "grade", "feedback"],
      include: [
        {
          model: Assessment,
          attributes: ["title"], // Include assessment title
        },
      ],
    });

    if (!submissions.length) {
      return res
        .status(404)
        .json({ message: "No submissions found for this student." });
    }

    res.status(200).json(submissions);
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions." });
  }
});

module.exports = router;
