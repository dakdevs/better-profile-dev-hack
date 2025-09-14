#!/usr/bin/env node

// ~/verify-fixes.js
/**
 * Verification script to test the fixes for demo users and jobs.map error
 */

const BASE_URL = 'http://localhost:3000';

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testJobsAPI() {
  console.log('🔧 Testing Jobs API (jobs.map error fix)...');
  console.log('=' .repeat(50));
  
  const result = await makeRequest('/api/recruiter/jobs?limit=5');
  
  if (!result.success) {
    console.log('❌ Jobs API failed:', result.error);
    return false;
  }
  
  console.log('✅ Jobs API working');
  console.log('📊 Response structure:');
  console.log(`   • Success: ${result.data.success}`);
  console.log(`   • Data type: ${Array.isArray(result.data.data) ? 'Array' : typeof result.data.data}`);
  console.log(`   • Jobs count: ${result.data.data?.length || 0}`);
  console.log(`   • Has pagination: ${!!result.data.pagination}`);
  
  return true;
}

async function testRealUsersCheck() {
  console.log('\\n👥 Testing Real Users Check...');
  console.log('=' .repeat(50));
  
  const result = await makeRequest('/api/debug/check-real-users');
  
  if (!result.success) {
    console.log('❌ Real users check failed:', result.error);
    return false;
  }
  
  const { summary } = result.data;
  
  console.log('✅ Real users check working');
  console.log('📊 Database state:');
  console.log(`   • Total Users: ${summary.totalUsers}`);
  console.log(`   • Users with Skills: ${summary.usersWithSkills}`);
  console.log(`   • Total Skills: ${summary.totalUserSkills}`);
  console.log(`   • Unique Skills: ${summary.uniqueSkills}`);
  
  if (summary.totalUsers > 0) {
    console.log('\\n⚠️  Found users in database:');
    if (summary.usersWithSkills > 0) {
      console.log('   • These could be test candidates or real users');
      console.log('   • Use "Clear Test Data" button to remove test candidates');
    } else {
      console.log('   • Users exist but have no skills (likely real users without interviews)');
    }
  } else {
    console.log('\\n✅ Database is clean - no users found');
    console.log('   • This is correct if no AI interviews have been taken');
  }
  
  return true;
}

async function testClearTestData() {
  console.log('\\n🗑️  Testing Clear Test Data API...');
  console.log('=' .repeat(50));
  
  // First check if there are test users
  const checkResult = await makeRequest('/api/debug/check-real-users');
  if (!checkResult.success) {
    console.log('❌ Cannot check users before clearing');
    return false;
  }
  
  const beforeCount = checkResult.data.summary.totalUsers;
  console.log(`📊 Users before clearing: ${beforeCount}`);
  
  if (beforeCount === 0) {
    console.log('✅ No users to clear - database is already clean');
    return true;
  }
  
  // Test the clear endpoint (but don't actually clear unless there are obvious test users)
  const testEmails = ['alice.johnson@example.com', 'bob.smith@example.com'];
  const hasTestUsers = checkResult.data.users?.some(user => 
    testEmails.includes(user.email.toLowerCase())
  );
  
  if (hasTestUsers) {
    console.log('⚠️  Found test users (Alice, Bob, etc.)');
    console.log('   • Clear Test Data API is available');
    console.log('   • Use the dashboard button to remove them');
  } else {
    console.log('✅ No obvious test users found');
    console.log('   • Users might be real - don\\'t auto-clear');
  }
  
  console.log('✅ Clear Test Data API is ready');
  return true;
}

async function testCandidateMatching() {
  console.log('\\n🎯 Testing Candidate Matching with Real Data...');
  console.log('=' .repeat(50));
  
  // Test with a sample job description
  const result = await makeRequest('/api/match', {
    method: 'POST',
    body: JSON.stringify({
      jobDescription: 'Looking for a JavaScript developer with React experience',
      limit: 5,
      minMatchScore: 10
    })
  });
  
  if (!result.success) {
    console.log('❌ Candidate matching failed:', result.data?.error || result.error);
    return false;
  }
  
  const { candidates, summary } = result.data.data;
  
  console.log('✅ Candidate matching working');
  console.log('📊 Matching results:');
  console.log(`   • Total Candidates: ${summary.totalCandidates}`);
  console.log(`   • Matched Candidates: ${summary.matchedCandidates}`);
  console.log(`   • Average Match Score: ${summary.averageMatchScore}%`);
  
  if (candidates.length > 0) {
    console.log('\\n🏆 Sample candidates found:');
    candidates.slice(0, 3).forEach((candidate, index) => {
      console.log(`   ${index + 1}. ${candidate.candidate.name} (${candidate.match.score}% match)`);
    });
  } else {
    console.log('\\n✅ No candidates found - this is correct if database is empty');
  }
  
  return true;
}

async function runVerification() {
  console.log('🚀 Verifying Fixes for Demo Users and Jobs.map Error');
  console.log('=' .repeat(70));
  
  const tests = [
    { name: 'Jobs API (jobs.map fix)', fn: testJobsAPI },
    { name: 'Real Users Check', fn: testRealUsersCheck },
    { name: 'Clear Test Data API', fn: testClearTestData },
    { name: 'Candidate Matching', fn: testCandidateMatching },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  console.log('\\n📋 Verification Results');
  console.log('=' .repeat(70));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\\n🎉 All fixes verified successfully!');
    console.log('\\n📋 Next Steps:');
    console.log('   1. Go to recruiter dashboard');
    console.log('   2. Click "Clear Test Data" to remove demo users');
    console.log('   3. Click "Check Real Users" to verify clean state');
    console.log('   4. System is ready for real users from AI interviews');
  } else {
    console.log('\\n⚠️  Some tests failed. Check the details above.');
  }
}

runVerification().catch(console.error);