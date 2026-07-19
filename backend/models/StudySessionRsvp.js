const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * StudySessionRsvp model
 * Maps many-to-many RSVPs between Users (students) and StudySessions.
 */
const StudySessionRsvp = sequelize.define('StudySessionRsvp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'StudySessions',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
  rsvpAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'StudySessionRsvps',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['sessionId', 'studentId'],
      name: 'idx_study_session_rsvp_unique',
    }
  ],
});

module.exports = StudySessionRsvp;
