const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Assessment = require("./Assessment");
const User = require("./User");

const StudentSubmission = sequelize.define("StudentSubmission", {
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assessmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  file: {
    type: DataTypes.STRING,
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// ✅ Define association
StudentSubmission.belongsTo(Assessment, {
  foreignKey: "assessmentId",
  as: "assessmentDetails",
});
StudentSubmission.belongsTo(User, {
  foreignKey: "studentId",
  as: "studentDetails", // ✅ Fix for fetching student details in routes
});

module.exports = StudentSubmission;
