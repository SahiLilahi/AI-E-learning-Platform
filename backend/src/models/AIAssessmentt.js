const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AIAssessment = sequelize.define("AIAssessment", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  questions: {
    type: DataTypes.JSON, // Store MCQ and subjective questions
    allowNull: false,
    validate: {
      isValidJSON(value) {
        if (!Array.isArray(value)) {
          throw new Error("Questions must be an array of objects.");
        }
        value.forEach((q) => {
          if (!q.question || !q.type) {
            throw new Error(
              "Each question must have a question text and type."
            );
          }
          if (q.type === "mcq") {
            if (
              !Array.isArray(q.options) ||
              q.options.length !== 4 ||
              !q.correct_answer
            ) {
              throw new Error(
                "MCQ must have exactly 4 options and a correct answer."
              );
            }
          }
        });
      },
    },
  },
});

module.exports = AIAssessment;
