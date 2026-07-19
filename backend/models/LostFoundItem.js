const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LostFoundItem = sequelize.define('LostFoundItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('lost', 'found'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  itemDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  photoPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('open', 'claimed', 'resolved'),
    allowNull: false,
    defaultValue: 'open',
  },
}, {
  tableName: 'LostFoundItems',
  timestamps: true, // automatically manages createdAt and updatedAt
});

module.exports = LostFoundItem;
