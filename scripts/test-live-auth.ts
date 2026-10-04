/**
 * Live Auth & Frontend Route Health Verification
 */

export {};

const BASE_URL = "https://creatorin-drab.vercel.app";

async function testAuthAndRoutes() {
  console.log(`\n=======================================================`);
  console.log(`🔍 Testing Live Auth & Page Routes on ${BASE_URL}`);
  console.log(`=======================================================\n`);

  const uniqueSuffix = Date.now().toString().slice(-6);
  const testEmail = `creatorin.user.${uniqueSuffix}@gmail.com`;
  const testPassword = "Creatorin2026!SecurePassword";
  const testName = `Test User ${uniqueSuffix}`;

  // 1. Test Route Pages (HTTP 200)
  const routesToTest = [
    "/",
    "/sign-in",
    "/sign-up",
    "/explore",
    "/chat",
    "/briefs",
    "/contracts",
    "/notifications",
    "/settings"
  ];

  console.log("--- 1. Testing Frontend Page Routes (Status 200 OK) ---");
  for (const route of routesToTest) {
    try {
      const res = await fetch(`${BASE_URL}${route}`);
      if (res.status === 200) {
        console.log(`✅ [${res.status}] GET ${route}`);
      } else {
        console.log(`⚠️ [${res.status}] GET ${route}`);
      }
    } catch (err: any) {
      console.log(`❌ FAILED GET ${route}: ${err.message}`);
    }
  }

  // 2. Test Live Auth API Registration
  console.log("\n--- 2. Testing Live Auth API Flow ---");

  let registerSuccess = false;
  try {
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        fullName: testName,
        role: "creator"
      })
    });
    const regData = await regRes.json();
    if (regRes.ok && regData.success) {
      console.log(`✅ POST /api/auth/register (New user: ${testEmail}) - User ID: ${regData.user?.id}`);
      registerSuccess = true;
    } else {
      console.log(`⚠️ POST /api/auth/register returned: ${JSON.stringify(regData)}`);
    }
  } catch (err: any) {
    console.log(`❌ Register error: ${err.message}`);
  }

  // 3. Test Live Auth Login
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    const setCookie = loginRes.headers.get("set-cookie");
    if (loginRes.ok && loginData.user) {
      console.log(`✅ POST /api/auth/login successful - Role: ${loginData.user.role}, Name: ${loginData.user.fullName}`);
    } else {
      console.log(`⚠️ POST /api/auth/login response: ${JSON.stringify(loginData)}`);
    }
  } catch (err: any) {
    console.log(`❌ Login error: ${err.message}`);
  }

  // 4. Test Seeded Login (Sobakhul Munir & GlowLab)
  try {
    const seededRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { "x-user-id": "33333333-3333-3333-3333-333333333333" }
    });
    const seededData = await seededRes.json();
    if (seededRes.ok && seededData.user?.role === "creator") {
      console.log(`✅ GET /api/auth/me (Seeded Creator Session) - Verified: ${seededData.user.fullName}`);
    }
  } catch (err: any) {
    console.log(`❌ Seeded auth check error: ${err.message}`);
  }

  // 5. Test Logout Route
  try {
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST"
    });
    const logoutData = await logoutRes.json();
    if (logoutRes.ok && logoutData.success) {
      console.log(`✅ POST /api/auth/logout - Session cleared successfully`);
    }
  } catch (err: any) {
    console.log(`❌ Logout error: ${err.message}`);
  }

  console.log(`\n=======================================================`);
  console.log(`🎉 All live authentication and route checks completed!`);
  console.log(`=======================================================\n`);
}

testAuthAndRoutes();
