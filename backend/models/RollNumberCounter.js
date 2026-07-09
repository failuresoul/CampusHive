const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RollNumberCounter = sequelize.define('RollNumberCounter', {
  department: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  batch: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  lastSequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = RollNumberCounter;
