const sequelize = require('./config/database');
const { LostFoundItem, User } = require('./models/associations');

async function runTests() {
  console.log('--- Starting Lost & Found API Verification Tests ---');
  const baseUrl = 'http://localhost:5000/api';
  let studentToken = null;
  let testItemIds = [];

  try {
    await sequelize.sync();

    const student = await User.findOne({ where: { email: 'student@campushive.com' } });
    if (!student) {
      throw new Error('Please run seed script first.');
    }

    // Login to get token
    console.log('Logging in as student...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@campushive.com', password: 'student123' }),
    });
    const loginData = await loginRes.json();
    studentToken = loginData.data.token;

    // Clean up any old test items
    await LostFoundItem.destroy({ where: { title: ['Test Calc Book', 'Test Blue Pen', 'Test Resolved Phone'] } });

    // Create test items directly in the database to test listing filters
    console.log('Creating test items...');
    const item1 = await LostFoundItem.create({
      reporterId: student.id,
      type: 'lost',
      title: 'Test Calc Book',
      description: 'Lost calculus math book in library',
      category: 'books',
      location: 'Library Room 102',
      itemDate: '2026-07-18',
      status: 'open',
    });
    testItemIds.push(item1.id);

    const item2 = await LostFoundItem.create({
      reporterId: student.id,
      type: 'found',
      title: 'Test Blue Pen',
      description: 'Found a blue gel pen on the corridor floor',
      category: 'other',
      location: 'Main Hallway',
      itemDate: '2026-07-19',
      status: 'open',
    });
    testItemIds.push(item2.id);

    const item3 = await LostFoundItem.create({
      reporterId: student.id,
      type: 'found',
      title: 'Test Resolved Phone',
      description: 'Found iPhone. Owner picked it up.',
      category: 'electronics',
      location: 'Cafeteria',
      itemDate: '2026-07-17',
      status: 'resolved',
    });
    testItemIds.push(item3.id);

    // Test 1: GET list - No Token (Expected: 401)
    console.log('\nTest 1: GET list with no auth token...');
    const resNoToken = await fetch(`${baseUrl}/lost-found-items`);
    console.log('GET No Token Status:', resNoToken.status, '(Expected: 401)');
    if (resNoToken.status !== 401) throw new Error('Expected 401 for no token');

    // Test 2: GET list - Default filter (Expected: 200, status default 'open')
    console.log('\nTest 2: GET list default filters (status defaults to open)...');
    const resDefault = await fetch(`${baseUrl}/lost-found-items`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    console.log('GET Default Status:', resDefault.status, '(Expected: 200)');
    const defaultData = await resDefault.json();
    console.log('Default items returned:', defaultData.data.items.length);
    
    // Ensure open items are in the list
    const hasItem1 = defaultData.data.items.some(i => i.id === item1.id);
    const hasItem2 = defaultData.data.items.some(i => i.id === item2.id);
    const hasItem3 = defaultData.data.items.some(i => i.id === item3.id);
    console.log(`Contains open item1 (Test Calc Book): ${hasItem1} (Expected: true)`);
    console.log(`Contains open item2 (Test Blue Pen): ${hasItem2} (Expected: true)`);
    console.log(`Contains resolved item3 (Test Resolved Phone): ${hasItem3} (Expected: false)`);
    
    if (!hasItem1 || !hasItem2 || hasItem3) {
      throw new Error('Default view failed: either open items are missing or resolved items are visible.');
    }

    // Verify reporter details are included
    if (defaultData.data.items.length > 0) {
      const first = defaultData.data.items[0];
      console.log('Reporter object present:', !!first.reporter, '(Expected: true)');
      console.log('Reporter name present:', first.reporter?.name === 'Student User', '(Expected: true)');
      if (!first.reporter || first.reporter.name !== 'Student User') {
        throw new Error('Reporter name not included in items');
      }
    }

    // Test 3: GET list - Filter by type=lost (Expected: only lost items)
    console.log('\nTest 3: GET list filtered by type=lost...');
    const resLostType = await fetch(`${baseUrl}/lost-found-items?type=lost`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const lostTypeData = await resLostType.json();
    const hasOnlyLost = lostTypeData.data.items.every(i => i.type === 'lost');
    console.log(`Every item is 'lost': ${hasOnlyLost} (Expected: true)`);
    if (!hasOnlyLost) throw new Error('Type filter type=lost returned found items');

    // Test 4: GET list - Filter by category=books
    console.log('\nTest 4: GET list filtered by category=books...');
    const resBooks = await fetch(`${baseUrl}/lost-found-items?category=books`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const booksData = await resBooks.json();
    const hasOnlyBooks = booksData.data.items.every(i => i.category === 'books');
    console.log(`Every item has category 'books': ${hasOnlyBooks} (Expected: true)`);
    if (!hasOnlyBooks) throw new Error('Category filter returned items of other categories');

    // Test 5: GET list - Search query 'calculus'
    console.log('\nTest 5: GET list searched for "calculus"...');
    const resSearch = await fetch(`${baseUrl}/lost-found-items?search=calculus`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const searchData = await resSearch.json();
    console.log('Items returned for search:', searchData.data.items.length);
    const matchesSearch = searchData.data.items.every(i => 
      i.title.toLowerCase().includes('calculus') || i.description.toLowerCase().includes('calculus')
    );
    console.log(`Every returned item matches search text: ${matchesSearch} (Expected: true)`);
    if (!matchesSearch || searchData.data.items.length === 0) {
      throw new Error('Search query filter failed');
    }

    // Test 6: GET list - Status filter status=all (Expected: resolved items should be visible)
    console.log('\nTest 6: GET list with status=all (showing resolved/claimed items)...');
    const resAllStatus = await fetch(`${baseUrl}/lost-found-items?status=all`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const allStatusData = await resAllStatus.json();
    const hasResolved = allStatusData.data.items.some(i => i.id === item3.id);
    console.log(`Contains resolved item3 (Test Resolved Phone): ${hasResolved} (Expected: true)`);
    if (!hasResolved) throw new Error('status=all filter failed to return resolved items');

    // Test 7: GET list - Pagination testing page=1, pageSize=1
    console.log('\nTest 7: Pagination checks (page=1, pageSize=1)...');
    const resPaginated = await fetch(`${baseUrl}/lost-found-items?pageSize=1`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const paginatedData = await resPaginated.json();
    console.log('Items returned in page 1:', paginatedData.data.items.length, '(Expected: 1)');
    console.log('Pagination info:', paginatedData.data.pagination);
    if (paginatedData.data.items.length !== 1 || !paginatedData.data.pagination) {
      throw new Error('Pagination support failed');
    }

    console.log('\n--- All Lost & Found API Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test run failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('Cleaning up test data...');
    if (testItemIds.length > 0) {
      await LostFoundItem.destroy({ where: { id: testItemIds } });
    }
  }
}

runTests();
