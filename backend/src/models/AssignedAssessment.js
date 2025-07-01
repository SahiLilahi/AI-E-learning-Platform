const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User"); // Use User instead of Student
const Assessment = require("./Assessment");

const AssignedAssessment = sequelize.define("AssignedAssessment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Reference User model
      key: "id",
    },
  },
  assessmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Assessment,
      key: "id",
    },
  },
});

// ✅ Define Associations
AssignedAssessment.belongsTo(User, {
  foreignKey: "studentId",
  as: "studentDetails",
});
AssignedAssessment.belongsTo(Assessment, {
  foreignKey: "assessmentId",
  as: "assessmentDetails",
});

User.hasMany(AssignedAssessment, { foreignKey: "studentId" });
Assessment.hasMany(AssignedAssessment, { foreignKey: "assessmentId" });

module.exports = AssignedAssessment;
