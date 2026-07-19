const sequelize = require('./config/database');
const { LostFoundItem, User, LostFoundClaim, Notification } = require('./models/associations');
const jwt = require('jsonwebtoken');

// Helper to generate auth token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production',
    { expiresIn: '1h' }
  );
}

async function runClaimsTests() {
  console.log('--- Starting Lost & Found Claims API Verification Tests ---');
  const baseUrl = 'http://localhost:5000/api';
  
  let reporter = null;
  let claimant1 = null;
  let claimant2 = null;
  
  let reporterToken = null;
  let claimant1Token = null;
  let claimant2Token = null;
  
  let testItem = null;
  let claim1Id = null;
  let claim2Id = null;

  try {
    await sequelize.sync();

    // 1. Get test users
    // If seeds are loaded, we can find some users or create them.
    // Let's find or create a reporter and two claimants
    console.log('Setting up test users...');
    
    // Find or create Student A (reporter)
    [reporter] = await User.findOrCreate({
      where: { email: 'reporter@campushive.com' },
      defaults: {
        name: 'Reporter Student',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyzaaaaaaaaaaaaaaaaaaaaa',
        role: 'student',
        rollNumber: 'CS-001',
      }
    });

    // Find or create Student B (claimant 1)
    [claimant1] = await User.findOrCreate({
      where: { email: 'claimant1@campushive.com' },
      defaults: {
        name: 'Claimant One Student',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyzaaaaaaaaaaaaaaaaaaaaa',
        role: 'student',
        rollNumber: 'CS-002',
      }
    });

    // Find or create Student C (claimant 2)
    [claimant2] = await User.findOrCreate({
      where: { email: 'claimant2@campushive.com' },
      defaults: {
        name: 'Claimant Two Student',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyzaaaaaaaaaaaaaaaaaaaaa',
        role: 'student',
        rollNumber: 'CS-003',
      }
    });

    reporterToken = generateToken(reporter);
    claimant1Token = generateToken(claimant1);
    claimant2Token = generateToken(claimant2);

    // Clean up any old test claims/items
    await LostFoundClaim.destroy({ where: {} });
    await LostFoundItem.destroy({ where: { title: 'Claims Test Phone' } });

    // Create test item (reported by reporter)
    testItem = await LostFoundItem.create({
      reporterId: reporter.id,
      type: 'found',
      title: 'Claims Test Phone',
      description: 'Found a black iPhone in the canteen',
      category: 'electronics',
      location: 'Canteen',
      itemDate: '2026-07-20',
      status: 'open',
    });

    console.log(`Created test item ID: ${testItem.id}`);

    // --- TEST 1: Reporter claiming their own item (Expected: 400 Bad Request) ---
    console.log('\nTest 1: Submit claim by the reporter...');
    const resReporterClaim = await fetch(`${baseUrl}/lost-found-items/${testItem.id}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${reporterToken}`
      },
      body: JSON.stringify({ message: 'This is my own phone!' })
    });
    console.log('Status code:', resReporterClaim.status, '(Expected: 400)');
    const reporterClaimData = await resReporterClaim.json();
    console.log('Response body:', reporterClaimData);
    if (resReporterClaim.status !== 400) {
      throw new Error('Allowed reporter to claim their own item');
    }

    // --- TEST 2: Claimant 1 claiming the item (Expected: 201 Created) ---
    console.log('\nTest 2: Submit valid claim by Claimant 1...');
    const resClaimant1 = await fetch(`${baseUrl}/lost-found-items/${testItem.id}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${claimant1Token}`
      },
      body: JSON.stringify({ message: 'I lost my black iPhone in the canteen around noon.' })
    });
    console.log('Status code:', resClaimant1.status, '(Expected: 201)');
    const claim1Data = await resClaimant1.json();
    console.log('Response body:', claim1Data);
    if (resClaimant1.status !== 201 || !claim1Data.success) {
      throw new Error('Failed to submit valid claim');
    }
    claim1Id = claim1Data.data.claimId;

    // Verify Notification was created
    const notif = await Notification.findOne({
      where: { userId: reporter.id, type: 'lost_found_claim', referenceId: testItem.id }
    });
    console.log('Reporter Notification created:', !!notif, '(Expected: true)');
    if (!notif) {
      throw new Error('Notification was not created for reporter');
    }
    console.log('Notification message:', notif.message);

    // --- TEST 3: Claimant 1 submitting duplicate claim (Expected: 400 Bad Request) ---
    console.log('\nTest 3: Submit duplicate claim by Claimant 1...');
    const resDuplicate = await fetch(`${baseUrl}/lost-found-items/${testItem.id}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${claimant1Token}`
      },
      body: JSON.stringify({ message: 'Another request for the same phone' })
    });
    console.log('Status code:', resDuplicate.status, '(Expected: 400)');
    const duplicateData = await resDuplicate.json();
    console.log('Response body:', duplicateData);
    if (resDuplicate.status !== 400) {
      throw new Error('Allowed duplicate pending claim');
    }

    // --- TEST 4: Claimant 2 claiming the item (Expected: 201 Created) ---
    console.log('\nTest 4: Submit valid claim by Claimant 2...');
    const resClaimant2 = await fetch(`${baseUrl}/lost-found-items/${testItem.id}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${claimant2Token}`
      },
      body: JSON.stringify({ message: 'This is my sibling\'s phone, can verify.' })
    });
    console.log('Status code:', resClaimant2.status, '(Expected: 201)');
    const claim2Data = await resClaimant2.json();
    if (resClaimant2.status !== 201) {
      throw new Error('Failed to create second claim');
    }
    claim2Id = claim2Data.data.claimId;

    // --- TEST 5: Non-reporter fetching claims list (Expected: 403 Forbidden) ---
    console.log('\nTest 5: Non-reporter tries to fetch claims list...');
    const resNonReporterFetch = await fetch(`${baseUrl}/lost-found-items/${testItem.id}/claims`, {
      headers: { 'Authorization': `Bearer ${claimant1Token}` }
    });
    console.log('Status code:', resNonReporterFetch.status, '(Expected: 403)');
    if (resNonReporterFetch.status !== 403) {
      throw new Error('Non-reporter was allowed to fetch claims list');
    }

    // --- TEST 6: Reporter fetching claims list (Expected: 200 OK) ---
    console.log('\nTest 6: Reporter fetches claims list...');
    const resReporterFetch = await fetch(`${baseUrl}/lost-found-items/${testItem.id}/claims`, {
      headers: { 'Authorization': `Bearer ${reporterToken}` }
    });
    console.log('Status code:', resReporterFetch.status, '(Expected: 200)');
    const claimsListData = await resReporterFetch.json();
    console.log('Claims count returned:', claimsListData.data.length, '(Expected: 2)');
    if (resReporterFetch.status !== 200 || claimsListData.data.length !== 2) {
      throw new Error('Reporter claims fetch failed');
    }
    console.log('First claim claimant name:', claimsListData.data[0].claimant?.name);

    // --- TEST 7: Non-reporter confirming claim (Expected: 403 Forbidden) ---
    console.log('\nTest 7: Non-reporter tries to confirm claim...');
    const resNonReporterConfirm = await fetch(`${baseUrl}/lost-found-items/${testItem.id}/claims/${claim1Id}/confirm`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${claimant2Token}` }
    });
    console.log('Status code:', resNonReporterConfirm.status, '(Expected: 403)');
    if (resNonReporterConfirm.status !== 403) {
      throw new Error('Non-reporter was allowed to confirm claim');
    }

    // --- TEST 8: Reporter confirming claim 1 (Expected: 200 OK) ---
    console.log('\nTest 8: Reporter confirms claim 1...');
    const resConfirm = await fetch(`${baseUrl}/lost-found-items/${testItem.id}/claims/${claim1Id}/confirm`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${reporterToken}` }
    });
    console.log('Status code:', resConfirm.status, '(Expected: 200)');
    const confirmResult = await resConfirm.json();
    console.log('Response body:', confirmResult);
    if (resConfirm.status !== 200) {
      throw new Error('Reporter failed to confirm claim');
    }

    // --- TEST 9: Verify statuses in database (Expected: claim 1 confirmed, claim 2 rejected, item resolved) ---
    console.log('\nTest 9: Verifying database status post-confirmation...');
    
    // Check item status
    const updatedItem = await LostFoundItem.findByPk(testItem.id);
    console.log('Item status:', updatedItem.status, "(Expected: 'resolved')");
    if (updatedItem.status !== 'resolved') {
      throw new Error('Item status was not set to resolved');
    }

    // Check claim 1 status
    const dbClaim1 = await LostFoundClaim.findByPk(claim1Id);
    console.log('Claim 1 status:', dbClaim1.status, "(Expected: 'confirmed')");
    if (dbClaim1.status !== 'confirmed') {
      throw new Error('Claim 1 status was not set to confirmed');
    }

    // Check claim 2 status
    const dbClaim2 = await LostFoundClaim.findByPk(claim2Id);
    console.log('Claim 2 status:', dbClaim2.status, "(Expected: 'rejected')");
    if (dbClaim2.status !== 'rejected') {
      throw new Error('Claim 2 status was not auto-rejected');
    }

    // --- TEST 10: Submitting claim on resolved item (Expected: 400 Bad Request) ---
    console.log('\nTest 10: Submit claim on already resolved item...');
    const resClaimOnResolved = await fetch(`${baseUrl}/lost-found-items/${testItem.id}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${claimant2Token}`
      },
      body: JSON.stringify({ message: 'Attempting to claim resolved item.' })
    });
    console.log('Status code:', resClaimOnResolved.status, '(Expected: 400)');
    if (resClaimOnResolved.status !== 400) {
      throw new Error('Allowed claim on already resolved item');
    }

    console.log('\n--- All Lost & Found Claims API Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test run failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('Cleaning up test data...');
    if (testItem) {
      await LostFoundClaim.destroy({ where: { itemId: testItem.id } });
      await LostFoundItem.destroy({ where: { id: testItem.id } });
    }
  }
}

runClaimsTests();
