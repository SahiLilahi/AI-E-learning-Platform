const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("../models/User"); // Import User model
const AIAssessment = require("../models/AIAssessmentt"); // Import AIAssessment model
const AIStudentResponse = sequelize.define("AIStudentResponse", {
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assessmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  questions_responses: {
    type: DataTypes.JSON, // Store both questions and responses
    allowNull: false,
    validate: {
      isValidJSON(value) {
        if (!Array.isArray(value)) {
          throw new Error(
            "Data must be an array of question-response objects."
          );
        }
      },
    },
  },
  grade: {
    type: DataTypes.STRING,
    defaultValue: "Pending",
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

AIStudentResponse.belongsTo(AIAssessment, {
  foreignKey: "assessmentId",
  as: "assessmentDetails",
});

AIStudentResponse.belongsTo(User, {
  foreignKey: "studentId",
  as: "student",
});
module.exports = AIStudentResponse;
