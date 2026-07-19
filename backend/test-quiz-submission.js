const sequelize = require('./config/database');
const { Course, User, Enrollment, Quiz, QuizQuestion, QuizOption, QuizResponse } = require('./models/associations');
const { quizzes, submitAnswer } = require('./services/quizSessionService');
const bcrypt = require('bcrypt');

async function runTests() {
  console.log('--- Starting Quiz Submission API Integration Tests ---');
  let serverProcess = null;

  try {
    console.log('Syncing database...');
    await sequelize.sync();

    // Clean up any stale records from previous runs
    await User.destroy({ where: { email: 'unenrolled@campushive.edu' } });
    const oldQuizzes = await Quiz.findAll({ where: { title: 'Integration Test Quiz' } });
    for (const q of oldQuizzes) {
      await QuizResponse.destroy({ where: { quizId: q.id } });
      const questions = await QuizQuestion.findAll({ where: { quizId: q.id } });
      const questionIds = questions.map(qu => qu.id);
      await QuizOption.destroy({ where: { questionId: questionIds } });
      await QuizQuestion.destroy({ where: { quizId: q.id } });
      await Quiz.destroy({ where: { id: q.id } });
    }

    // 1. Setup/Find Test Data
    const student = await User.findOne({ where: { email: 'student@campushive.com' } });
    const teacher = await User.findOne({ where: { email: 'teacher@campushive.com' } });
    const course = await Course.findOne();

    if (!student || !teacher || !course) {
      throw new Error('Required seeded database elements not found. Please run seed script first.');
    }

    console.log(`Found Test Student: ${student.email}`);
    console.log(`Found Test Teacher: ${teacher.email}`);
    console.log(`Found Test Course: ${course.code}`);

    // Ensure student is enrolled in the course
    await Enrollment.findOrCreate({
      where: { studentId: student.id, courseId: course.id }
    });

    // Create a Test Quiz
    const quiz = await Quiz.create({
      title: 'Integration Test Quiz',
      status: 'launched',
      timeLimitPerQuestion: 15,
      teacherId: teacher.id,
      courseId: course.id
    });

    // Create a Question
    const question = await QuizQuestion.create({
      quizId: quiz.id,
      questionText: 'What is 2 + 2?',
      order: 1
    });

    // Create Options (one correct, one incorrect)
    const correctOption = await QuizOption.create({
      questionId: question.id,
      optionText: '4',
      isCorrect: true
    });

    const incorrectOption = await QuizOption.create({
      questionId: question.id,
      optionText: '5',
      isCorrect: false
    });

    console.log('Test Quiz, Question, and Options created successfully.');

    // 2. Initialize in-memory quiz state
    quizzes[quiz.id] = {
      teacherSocketId: 'mock-teacher-socket-id',
      participants: { [student.id]: 'mock-student-socket-id' },
      currentQuestionIndex: 0,
      timer: setInterval(() => {}, 1000), // Mock active timer
      timeRemaining: 15,
      quizData: quiz,
      questionStartedAt: Date.now() - 2000, // started 2 seconds ago
      questions: [
        {
          id: question.id,
          questionText: question.questionText,
          options: [correctOption, incorrectOption]
        }
      ]
    };

    // 3. Test Service Layer: Submit Correct Answer within Window
    console.log('Testing: Submit correct answer via service...');
    const res1 = await submitAnswer({
      quizId: quiz.id,
      questionId: question.id,
      studentId: student.id,
      optionId: correctOption.id
    });

    if (!res1 || !res1.isCorrect || res1.responseTimeMs < 1000) {
      throw new Error('Service submission failed. Correctness or responseTimeMs is incorrect.');
    }
    console.log(`Success! Response recorded. isCorrect: ${res1.isCorrect}, responseTimeMs: ${res1.responseTimeMs}`);

    // 4. Test Service Layer: Re-submission (Double Submission Prevention)
    console.log('Testing: Double submission prevention...');
    try {
      await submitAnswer({
        quizId: quiz.id,
        questionId: question.id,
        studentId: student.id,
        optionId: incorrectOption.id
      });
      throw new Error('Allowed double submission, which should be rejected!');
    } catch (err) {
      if (err.status !== 400 || !err.message.includes('already submitted')) {
        throw err;
      }
      console.log('Success! Double submission correctly rejected:', err.message);
    }

    // 5. Test Service Layer: Submission for Non-Enrolled Student
    // Create a new student that is NOT enrolled in the course
    const unenrolledStudent = await User.create({
      name: 'Unenrolled Student',
      email: 'unenrolled@campushive.edu',
      passwordHash: await bcrypt.hash('student123', 1),
      role: 'student',
      status: 'active',
      department: 'CSE',
      batch: '2022-2023',
      rollNumber: 'CSE-2022-998'
    });

    console.log('Testing: Unenrolled student submission rejection...');
    try {
      await submitAnswer({
        quizId: quiz.id,
        questionId: question.id,
        studentId: unenrolledStudent.id,
        optionId: correctOption.id
      });
      throw new Error('Allowed unenrolled student to submit answer!');
    } catch (err) {
      if (err.status !== 403 || !err.message.includes('not enrolled')) {
        throw err;
      }
      console.log('Success! Unenrolled student submission correctly rejected:', err.message);
    }

    // 6. Test Service Layer: Submission after Timer Expiration
    console.log('Testing: Submission after time expiration...');
    // Setup a new question for expiration check
    const question2 = await QuizQuestion.create({
      quizId: quiz.id,
      questionText: 'What is 3 + 3?',
      order: 2
    });
    const option2 = await QuizOption.create({
      questionId: question2.id,
      optionText: '6',
      isCorrect: true
    });

    quizzes[quiz.id].currentQuestionIndex = 0;
    quizzes[quiz.id].questions.push({
      id: question2.id,
      questionText: question2.questionText,
      options: [option2]
    });
    // Set active question to the new one
    quizzes[quiz.id].currentQuestionIndex = 1;
    // Set time remaining to 0 (expired)
    quizzes[quiz.id].timeRemaining = 0;
    clearInterval(quizzes[quiz.id].timer);
    quizzes[quiz.id].timer = null;

    try {
      await submitAnswer({
        quizId: quiz.id,
        questionId: question2.id,
        studentId: student.id,
        optionId: option2.id
      });
      throw new Error('Allowed submission after question timer expired!');
    } catch (err) {
      if (err.status !== 400 || !err.message.includes('expired')) {
        throw err;
      }
      console.log('Success! Expired question submission correctly rejected:', err.message);
    }

    // 7. Start the server on port 5099 to test the REST Fallback endpoint in-process
    console.log('Starting Express server in-process to test REST fallback endpoint...');
    process.env.PORT = '5099';
    require('./server');

    // Wait for server boot
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('Server started on port 5099.');

    const baseUrl = 'http://localhost:5099/api';

    // Log in as student to get token
    console.log('Logging in student...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@campushive.com', password: 'student123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('Student logged in successfully.');

    // Setup another question for REST verification
    const question3 = await QuizQuestion.create({
      quizId: quiz.id,
      questionText: 'What is 4 + 4?',
      order: 3
    });
    const correctOption3 = await QuizOption.create({
      questionId: question3.id,
      optionText: '8',
      isCorrect: true
    });

    // Update in-memory state for REST test
    quizzes[quiz.id] = {
      teacherSocketId: 'mock-teacher-socket-id',
      participants: { [student.id]: 'mock-student-socket-id' },
      currentQuestionIndex: 2, // question3
      timer: setInterval(() => {}, 1000),
      timeRemaining: 15,
      quizData: quiz,
      questionStartedAt: Date.now() - 1000,
      questions: [
        null, null, // padding
        {
          id: question3.id,
          questionText: question3.questionText,
          options: [correctOption3]
        }
      ]
    };

    console.log('Testing: REST fallback submission...');
    const restRes = await fetch(`${baseUrl}/quizzes/${quiz.id}/questions/${question3.id}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ optionId: correctOption3.id })
    });

    const restData = await restRes.json();
    console.log('REST response status:', restRes.status);
    console.log('REST response body:', restData);

    if (restRes.status !== 200 || !restData.success) {
      throw new Error(`REST submission failed with status ${restRes.status}: ${restData.message}`);
    }
    console.log('Success! REST fallback endpoint successfully recorded the answer.');

    // Clean up timers in quizzes object
    if (quizzes[quiz.id] && quizzes[quiz.id].timer) {
      clearInterval(quizzes[quiz.id].timer);
    }

    console.log('\n>>> ALL QUIZ SUBMISSION API TESTS PASSED SUCCESSFULLY! <<<');

  } catch (error) {
    console.error('\n!!! TESTS FAILED !!!');
    console.error(error);
    process.exitCode = 1;
  } finally {
    // Clean up the created test quiz, questions, options, and unenrolled student
    console.log('Cleaning up seeded database elements...');
    try {
      await User.destroy({ where: { email: 'unenrolled@campushive.edu' } });
      
      // Find all quizzes created by this test script to delete them safely
      const testQuizzes = await Quiz.findAll({ where: { title: 'Integration Test Quiz' } });
      for (const q of testQuizzes) {
        await QuizResponse.destroy({ where: { quizId: q.id } });
        const questions = await QuizQuestion.findAll({ where: { quizId: q.id } });
        const questionIds = questions.map(qu => qu.id);
        await QuizOption.destroy({ where: { questionId: questionIds } });
        await QuizQuestion.destroy({ where: { quizId: q.id } });
        await Quiz.destroy({ where: { id: q.id } });
      }
    } catch (cleanError) {
      console.error('Error during cleanup:', cleanError);
    }
    console.log('Done.');
    process.exit();
  }
}

runTests();
