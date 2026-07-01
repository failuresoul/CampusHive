require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const User = require('./models/User');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Force sync to reset database (CAUTION: Drops existing tables)
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const teacherPassword = await bcrypt.hash('teacher123', saltRounds);
    const studentPassword = await bcrypt.hash('student123', saltRounds);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@campushive.com',
        passwordHash: adminPassword,
        role: 'admin',
      },
      {
        name: 'Teacher User',
        email: 'teacher@campushive.com',
        passwordHash: teacherPassword,
        role: 'teacher',
      },
      {
        name: 'Student User',
        email: 'student@campushive.com',
        passwordHash: studentPassword,
        role: 'student',
      },
    ];

    await User.bulkCreate(users);
    console.log('Seed data inserted successfully.');
    
    console.log('\nTest Credentials:');
    console.log('-----------------');
    users.forEach(u => {
      console.log(`Email: ${u.email} | Password: ${u.role}123 | Role: ${u.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
