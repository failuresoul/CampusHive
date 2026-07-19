require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const courseRoutes = require('./routes/courseRoutes');
const labReportRoutes = require('./routes/labReportRoutes');
const quizRoutes = require('./routes/quizRoutes');
require('./models/associations'); // Force models and associations to be loaded for sync

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/quizzes', quizRoutes);
app.use('/api/lab-reports', labReportRoutes);

// Database Sync and Server Start
// New columns are added via `node migrate-student-fields.js` (run once).
// alter: true is avoided here because it breaks on SQLite tables with
// composite primary keys (RollNumberCounter).
sequelize.sync()
  .then(() => {
    console.log('Database synced successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });
