const sequelize = require('./config/database');
const { User } = require('./models/associations');
const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production',
    { expiresIn: '1h' }
  );
}

async function runTeacherSortingTests() {
  console.log('--- Starting Teacher Sorting API Verification Tests ---');
  const baseUrl = 'http://localhost:5000/api';

  let adminUser = null;
  let adminToken = null;
  let teachersCreated = [];

  try {
    await sequelize.sync();

    // 1. Setup admin token
    [adminUser] = await User.findOrCreate({
      where: { email: 'sorting-admin@campushive.com' },
      defaults: {
        name: 'Sorting Admin',
        passwordHash: 'dummyhash',
        role: 'admin',
      }
    });
    adminToken = generateToken(adminUser);

    // 2. Setup multiple teacher records to test sorting
    console.log('Creating test teacher profiles...');
    const teacherData = [
      { name: 'Zahir Rayhan', email: 'zahir@campushive.edu', role: 'teacher', department: 'CE', designation: 'Lecturer' },
      { name: 'Anisur Rahman', email: 'anisur@campushive.edu', role: 'teacher', department: 'CSE', designation: 'Professor' },
      { name: 'Badrul Hasan', email: 'badrul@campushive.edu', role: 'teacher', department: 'EEE', designation: 'Assistant Professor' },
    ];

    for (const data of teacherData) {
      await User.destroy({ where: { email: data.email } });
      const teacher = await User.create({
        ...data,
        passwordHash: 'dummyhash',
      });
      teachersCreated.push(teacher);
    }

    // --- TEST 1: Default sort (Expected: alphabetical by name ASC: Anisur, Badrul, Zahir) ---
    console.log('\nTest 1: Fetching teachers with default sort...');
    const resDefault = await fetch(`${baseUrl}/teachers`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const defaultData = await resDefault.json();
    const defaultNames = defaultData.data?.teachers?.map(t => t.name) || [];
    console.log('Returned teacher order:', defaultNames);
    const testNames = ['Anisur Rahman', 'Badrul Hasan', 'Zahir Rayhan'];
    const filteredDefault = defaultNames.filter(name => testNames.includes(name));
    console.log('Filtered order:', filteredDefault);
    if (filteredDefault[0] !== 'Anisur Rahman' || filteredDefault[1] !== 'Badrul Hasan' || filteredDefault[2] !== 'Zahir Rayhan') {
      throw new Error('Default alphabetical sorting by name failed');
    }
    console.log('Test 1 Passed: default alphabetical by name correct!');

    // --- TEST 2: Sort by department ASC (Expected: CE [Zahir], CSE [Anisur], EEE [Badrul]) ---
    console.log('\nTest 2: Fetching teachers sorted by department ASC...');
    const resDeptAsc = await fetch(`${baseUrl}/teachers?sortBy=department&sortOrder=asc`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const deptAscData = await resDeptAsc.json();
    const deptAscNames = deptAscData.data?.teachers?.map(t => t.name) || [];
    console.log('Returned order (Dept ASC):', deptAscNames);
    const filteredDeptAsc = deptAscNames.filter(name => testNames.includes(name));
    console.log('Filtered order:', filteredDeptAsc);
    if (filteredDeptAsc[0] !== 'Zahir Rayhan' || filteredDeptAsc[1] !== 'Anisur Rahman' || filteredDeptAsc[2] !== 'Badrul Hasan') {
      throw new Error('Sort by department ASC failed');
    }
    console.log('Test 2 Passed: department sorting correct!');

    // --- TEST 3: Sort by designation DESC (Expected: Professor [Anisur], Lecturer [Zahir], Assistant Professor [Badrul]) ---
    // Note: standard DB string sorting order: 'Professor', 'Lecturer', 'Assistant Professor'
    console.log('\nTest 3: Fetching teachers sorted by designation DESC...');
    const resDesgDesc = await fetch(`${baseUrl}/teachers?sortBy=designation&sortOrder=desc`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const desgDescData = await resDesgDesc.json();
    const desgDescNames = desgDescData.data?.teachers?.map(t => t.name) || [];
    console.log('Returned order (Designation DESC):', desgDescNames);
    const filteredDesgDesc = desgDescNames.filter(name => testNames.includes(name));
    console.log('Filtered order:', filteredDesgDesc);
    if (filteredDesgDesc[0] !== 'Anisur Rahman' || filteredDesgDesc[1] !== 'Zahir Rayhan' || filteredDesgDesc[2] !== 'Badrul Hasan') {
      throw new Error('Sort by designation DESC failed');
    }
    console.log('Test 3 Passed: designation sorting DESC correct!');

    console.log('\n--- All Teacher Sorting API Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test run failed:', error);
    process.exit(1);
  } finally {
    console.log('Cleaning up test data...');
    if (adminUser) {
      await User.destroy({ where: { id: adminUser.id } });
    }
    for (const t of teachersCreated) {
      await User.destroy({ where: { id: t.id } });
    }
  }
}

runTeacherSortingTests();
