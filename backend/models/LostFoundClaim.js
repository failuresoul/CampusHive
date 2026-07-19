const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LostFoundClaim = sequelize.define('LostFoundClaim', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  claimantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  tableName: 'LostFoundClaims',
  timestamps: true, // provides createdAt, updatedAt
});

module.exports = LostFoundClaim;
