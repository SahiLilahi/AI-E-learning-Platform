const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tutorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  studyMaterial: {
    type: DataTypes.JSON, // ✅ Ensure it's stored as an array in MySQL
    allowNull: true,
    defaultValue: [], // ✅ Default to an empty array instead of NULL
  },
  image: {
    type: DataTypes.STRING, // File path for image
    allowNull: true,
  },
});

module.exports = Course;
