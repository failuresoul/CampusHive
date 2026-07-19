const { Course, User, Enrollment, CourseMaterial } = require('./models/associations');
const sequelize = require('./config/database');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Find the student
    const student = await User.findOne({ where: { email: 'student@campushive.com' } });
    if (!student) {
      console.error('Student user student@campushive.com not found!');
      process.exit(1);
    }

    // 2. Find the course
    const course = await Course.findOne({ where: { code: 'CSE-3106' } });
    if (!course) {
      console.error('Course CSE-3106 not found!');
      process.exit(1);
    }

    // 3. Find the teacher (anisur.rahman@campushive.edu)
    const teacher = await User.findOne({ where: { email: 'anisur.rahman@campushive.edu' } });
    if (!teacher) {
      console.error('Teacher anisur.rahman@campushive.edu not found!');
      process.exit(1);
    }

    // 4. Enroll the student in CSE-3106
    const [enrollment, createdEnrollment] = await Enrollment.findOrCreate({
      where: { studentId: student.id, courseId: course.id }
    });
    if (createdEnrollment) {
      console.log('Enrolled student@campushive.com in CSE-3106.');
    } else {
      console.log('student@campushive.com is already enrolled in CSE-3106.');
    }

    // 5. Seed some course materials for CSE-3106
    // Clean old materials first to make it deterministic
    await CourseMaterial.destroy({ where: { courseId: course.id } });

    const materials = [
      {
        courseId: course.id,
        teacherId: teacher.id,
        title: 'Week 1: Introduction to Software Engineering',
        category: 'Lecture Notes',
        filePath: 'uploads/week1_intro.pdf',
        originalFileName: 'week1_intro.pdf',
        fileSize: 4500000,
        fileType: 'pdf',
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        courseId: course.id,
        teacherId: teacher.id,
        title: 'Software Requirements Specification Template',
        category: 'Assignment',
        filePath: 'uploads/srs_template.docx',
        originalFileName: 'srs_template.docx',
        fileSize: 150000,
        fileType: 'docx',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        courseId: course.id,
        teacherId: teacher.id,
        title: 'Scrum Guide 2020 Official PDF',
        category: 'Reference',
        filePath: 'uploads/scrum_guide.pdf',
        originalFileName: 'scrum_guide.pdf',
        fileSize: 2500000,
        fileType: 'pdf',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        courseId: course.id,
        teacherId: teacher.id,
        title: 'Week 2: Agile Software Development and Scrum',
        category: 'Lecture Notes',
        filePath: 'uploads/week2_agile.pptx',
        originalFileName: 'week2_agile.pptx',
        fileSize: 18500000,
        fileType: 'pptx',
        uploadedAt: new Date() // Today
      },
      {
        courseId: course.id,
        teacherId: teacher.id,
        title: 'Project Group Sign-up Sheet (ZIP Archive)',
        category: 'Other',
        filePath: 'uploads/group_signup.zip',
        originalFileName: 'group_signup.zip',
        fileSize: 1024000,
        fileType: 'zip',
        uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      }
    ];

    await CourseMaterial.bulkCreate(materials);
    console.log('Successfully seeded 5 materials for CSE-3106.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed:', err);
    process.exit(1);
  }
}

run();
