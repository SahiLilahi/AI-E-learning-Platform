const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Assessment = sequelize.define("Assessment", {
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
    allowNull: true,
  },
  file: {
    type: DataTypes.STRING, // File path for uploaded assessment
    allowNull: true,
  },
  tutorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Assessment;
