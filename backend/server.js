require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const courseRoutes = require('./routes/courseRoutes');
const labReportRoutes = require('./routes/labReportRoutes');
const quizRoutes = require('./routes/quizRoutes');
const quizAnswerRoutes = require('./routes/quizAnswerRoutes');
const studySessionRoutes = require('./routes/studySessionRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
require('./models/associations'); // Force models and associations to be loaded for sync

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.set('io', io); // Expose io to routes
const PORT = process.env.PORT || 5000;

// Initialize WebSockets
require('./sockets/quizSocket')(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/quizzes', quizRoutes);
app.use('/api/quizzes', quizAnswerRoutes);
app.use('/api/lab-reports', labReportRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/lost-found-items', lostFoundRoutes);

// Database Sync and Server Start
// New columns are added via `node migrate-student-fields.js` (run once).
// alter: true is avoided here because it breaks on SQLite tables with
// composite primary keys (RollNumberCounter).
sequelize.sync()
  .then(() => {
    console.log('Database synced successfully');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });
