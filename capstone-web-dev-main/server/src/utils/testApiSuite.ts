/**
 * Comprehensive API Test Runner
 * Evaluates:
 * 1. Success test cases
 * 2. Validation-failure test cases
 * 3. Unauthorized-access test cases
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

interface TestResult {
  category: 'SUCCESS' | 'VALIDATION_FAILURE' | 'UNAUTHORIZED';
  name: string;
  passed: boolean;
  expectedStatus: number;
  actualStatus: number;
  details?: string;
}

const results: TestResult[] = [];

async function runTest(
  category: 'SUCCESS' | 'VALIDATION_FAILURE' | 'UNAUTHORIZED',
  name: string,
  url: string,
  options: RequestInit,
  expectedStatus: number,
  customCheck?: (data: any) => boolean
) {
  try {
    const res = await fetch(url, options);
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // non-json response
    }

    const statusMatch = res.status === expectedStatus;
    const checkMatch = customCheck ? customCheck(data) : true;
    const passed = statusMatch && checkMatch;

    results.push({
      category,
      name,
      passed,
      expectedStatus,
      actualStatus: res.status,
      details: passed ? 'OK' : `Expected ${expectedStatus}, got ${res.status} (${data?.message || 'No msg'})`,
    });
  } catch (err: any) {
    results.push({
      category,
      name,
      passed: false,
      expectedStatus,
      actualStatus: 0,
      details: err.message,
    });
  }
}

async function startSuite() {
  console.log('\n========================================================================');
  console.log('🧪 RUNNING K.R. MANGALAM UNIVERSITY API TEST SUITE (POSTMAN EQUIVALENT)');
  console.log(`🌐 Target Base URL: ${BASE_URL}`);
  console.log('========================================================================\n');

  // STEP 1: AUTHENTICATION & LOGIN (SUCCESS)
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@university.edu', password: 'Admin@123456' }),
  });
  const loginJson: any = await loginRes.json();
  const adminToken = loginJson?.data?.accessToken;

  results.push({
    category: 'SUCCESS',
    name: 'Admin Login & Token Generation',
    passed: loginRes.status === 200 && !!adminToken,
    expectedStatus: 200,
    actualStatus: loginRes.status,
  });

  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student01@university.edu', password: 'Student@123' }),
  });
  const studentLoginJson: any = await studentLoginRes.json();
  const studentToken = studentLoginJson?.data?.accessToken;

  results.push({
    category: 'SUCCESS',
    name: 'Student Login Verification',
    passed: studentLoginRes.status === 200 && studentLoginJson?.data?.user?.role === 'STUDENT',
    expectedStatus: 200,
    actualStatus: studentLoginRes.status,
  });

  // STEP 2: PROFILE RETRIEVAL (SUCCESS)
  await runTest(
    'SUCCESS',
    'Get Profile with Valid JWT (Admin)',
    `${BASE_URL}/auth/me`,
    { headers: { Authorization: `Bearer ${adminToken}` } },
    200,
    (d) => d.data?.email === 'admin@university.edu'
  );

  // STEP 3: MONGODB AGGREGATION PIPELINE (SUCCESS)
  await runTest(
    'SUCCESS',
    'MongoDB Aggregation Pipeline: Admin Dashboard Analytics',
    `${BASE_URL}/dashboard/admin`,
    { headers: { Authorization: `Bearer ${adminToken}` } },
    200,
    (d) => typeof d.data?.stats?.totalStudents === 'number'
  );

  // STEP 4: COURSE RETRIEVAL (SUCCESS)
  await runTest(
    'SUCCESS',
    'List University Courses',
    `${BASE_URL}/courses`,
    { headers: { Authorization: `Bearer ${adminToken}` } },
    200,
    (d) => Array.isArray(d.data)
  );

  // STEP 5: REGISTRATION SUCCESS
  const uniqueCode = Math.floor(1000 + Math.random() * 9000);
  await runTest(
    'SUCCESS',
    'Register New Student Account',
    `${BASE_URL}/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Evaluator Student',
        email: `evaluator.${uniqueCode}@krmu.edu.in`,
        registrationNumber: `24EVAL${uniqueCode}`,
        department: 'School of Engineering & Technology',
        semester: 1,
        password: 'Student@123',
        confirmPassword: 'Student@123',
        role: 'STUDENT',
      }),
    },
    201,
    (d) => d.data?.user?.role === 'STUDENT'
  );

  // --- VALIDATION FAILURE CASES ---
  // 1. Missing required fields on registration
  await runTest(
    'VALIDATION_FAILURE',
    'Register With Missing Password (Validation Fail)',
    `${BASE_URL}/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Incomplete User',
        email: 'incomplete@krmu.edu.in',
        role: 'STUDENT',
      }),
    },
    400
  );

  // 2. Duplicate registration number
  await runTest(
    'VALIDATION_FAILURE',
    'Register With Duplicate Student Reg Number (Conflict Fail)',
    `${BASE_URL}/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Student',
        email: `diff.${uniqueCode}@krmu.edu.in`,
        registrationNumber: `24EVAL${uniqueCode}`, // same as above
        department: 'School of Engineering & Technology',
        semester: 1,
        password: 'Student@123',
        confirmPassword: 'Student@123',
        role: 'STUDENT',
      }),
    },
    409
  );

  // 3. Mark attendance with non-existent session
  await runTest(
    'VALIDATION_FAILURE',
    'Mark Attendance with Non-Existent Session ID (Validation Fail)',
    `${BASE_URL}/attendance/mark`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classSessionId: '507f1f77bcf86cd799439011',
        attendanceData: [],
      }),
    },
    404
  );

  // --- UNAUTHORIZED / FORBIDDEN ACCESS CASES ---
  // 1. Missing Authorization Token
  await runTest(
    'UNAUTHORIZED',
    'Access Protected Profile Without JWT Token',
    `${BASE_URL}/auth/me`,
    { method: 'GET' },
    401
  );

  // 2. Invalid Password Login
  await runTest(
    'UNAUTHORIZED',
    'Login With Incorrect Password',
    `${BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@university.edu', password: 'WrongPassword999' }),
    },
    401
  );

  // 3. Public Admin Signup Attempt
  await runTest(
    'UNAUTHORIZED',
    'Public Attempt to Register ADMIN Account',
    `${BASE_URL}/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fake Admin',
        email: 'fake.admin@krmu.edu.in',
        password: 'AdminPassword@123',
        role: 'ADMIN',
      }),
    },
    400
  );

  // 4. Role Violation: Student attempting Admin-only Route
  await runTest(
    'UNAUTHORIZED',
    'Role Guard: Student Token Accessing Audit Logs (Forbidden)',
    `${BASE_URL}/audit`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    },
    403
  );

  // DISPLAY REPORT TABLE
  console.log('\n--- TEST RESULTS MATRIX ---');
  let passedCount = 0;
  for (const r of results) {
    if (r.passed) passedCount++;
    const icon = r.passed ? '✅ PASSED' : '❌ FAILED';
    const tag = `[${r.category}]`.padEnd(22);
    console.log(`${icon} | ${tag} | ${r.name} (Status: ${r.actualStatus})`);
  }

  console.log('\n========================================================================');
  console.log(`SUMMARY: ${passedCount} / ${results.length} Tests Passed (${((passedCount / results.length) * 100).toFixed(0)}%)`);
  console.log('========================================================================\n');

  if (passedCount === results.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

startSuite();
