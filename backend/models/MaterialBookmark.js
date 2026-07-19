const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MaterialBookmark = sequelize.define('MaterialBookmark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CourseMaterials',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  bookmarkedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'MaterialBookmarks',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'materialId'],
    },
  ],
});

module.exports = MaterialBookmark;
