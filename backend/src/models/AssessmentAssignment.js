const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const AIAssessment = require("./AIAssessmentt");

const AssessmentAssignment = sequelize.define("AssessmentAssignment", {
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assessmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: AIAssessment,
      key: "id",
    },
  },
});

AssessmentAssignment.belongsTo(AIAssessment, {
  foreignKey: "assessmentId",
  as: "assessmentDetails",
});

module.exports = AssessmentAssignment;
