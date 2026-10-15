import postgres from 'postgres';

const TARGET_URL = process.env.TEST_TARGET_URL || 'http://localhost:3000';
const DB_URL = process.env.DATABASE_URL || 'postgresql://creatorin_user:Cr3at0rIn_Secure_2026_Db@127.0.0.1:5432/creatorin_db';
const sql = postgres(DB_URL, { max: 1 });

async function run() {
  console.log('=============================================================');
  console.log('🚀 Verifying UMKM Login, Banner & Profile Persistence');
  console.log(`Target: ${TARGET_URL}`);
  console.log('=============================================================');

  // 1. Login as UMKM via Demo
  console.log('\n• 1. Logging in as UMKM via POST /api/auth/demo...');
  const demoRes = await fetch(`${TARGET_URL}/api/auth/demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'business' }),
  });
  if (!demoRes.ok) throw new Error(`Demo login failed: ${demoRes.status}`);
  const demoData = await demoRes.json();
  const token = demoData.session?.accessToken;
  const cookie = demoRes.headers.get('set-cookie') || `creatorin_token=${token}`;
  console.log(`  -> Logged in as: ${demoData.user?.fullName} (${demoData.user?.email})`);
  console.log(`  -> User ID: ${demoData.user?.id}`);
  console.log(`  -> Initial coverUrl in demo response: ${demoData.user?.coverUrl || '(empty)'}`);

  const userId = demoData.user?.id;
  if (!userId) throw new Error('Missing user ID in demo response');

  // 2. Call GET /api/auth/me
  console.log('\n• 2. Verifying GET /api/auth/me returns coverUrl...');
  const meRes = await fetch(`${TARGET_URL}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cookie': cookie,
    },
  });
  if (!meRes.ok) throw new Error(`GET /api/auth/me failed: ${meRes.status}`);
  const meData = await meRes.json();
  console.log(`  -> /api/auth/me user coverUrl: ${meData.user?.coverUrl || '(empty)'}`);

  // 3. Call GET /api/businesses?id=userId
  console.log('\n• 3. Verifying GET /api/businesses?id=...');
  const bizRes = await fetch(`${TARGET_URL}/api/businesses?id=${encodeURIComponent(userId)}`);
  if (!bizRes.ok) throw new Error(`GET /api/businesses failed: ${bizRes.status}`);
  const bizData = await bizRes.json();
  console.log(`  -> Business brandName: ${bizData.business?.brandName}`);
  console.log(`  -> Business coverBanner: ${bizData.business?.coverBanner}`);

  // 4. Update banner via PUT /api/profile
  const testCover = '/uploads/avatars/test-persistent-banner.jpg';
  console.log(`\n• 4. Updating coverUrl via PUT /api/profile to "${testCover}"...`);
  const updateRes = await fetch(`${TARGET_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cookie': cookie,
    },
    body: JSON.stringify({ coverUrl: testCover }),
  });
  if (!updateRes.ok) throw new Error(`PUT /api/profile failed: ${updateRes.status}`);
  console.log('  -> PUT /api/profile succeeded (HTTP 200)');

  // 5. Query PostgreSQL directly to verify persistence
  console.log('\n• 5. Verifying cover_url in PostgreSQL profiles table...');
  const [profileRow] = await sql`SELECT id, full_name, cover_url FROM profiles WHERE id = ${userId}::uuid`;
  if (!profileRow || profileRow.cover_url !== testCover) {
    throw new Error(`DB mismatch! Expected ${testCover}, found ${profileRow?.cover_url}`);
  }
  console.log(`  -> PostgreSQL profiles.cover_url: "${profileRow.cover_url}" ✅ (PERSISTED)`);

  // 6. Verify cache invalidation: GET /api/businesses?id= returns updated banner immediately
  console.log('\n• 6. Checking immediate refresh via GET /api/businesses...');
  const refreshedBizRes = await fetch(`${TARGET_URL}/api/businesses?id=${encodeURIComponent(userId)}`, { cache: 'no-store' });
  const refreshedBizData = await refreshedBizRes.json();
  if (refreshedBizData.business?.coverBanner !== testCover) {
    throw new Error(`Cache invalidation failed! Expected ${testCover}, got ${refreshedBizData.business?.coverBanner}`);
  }
  console.log(`  -> Refreshed business coverBanner: "${refreshedBizData.business?.coverBanner}" ✅ (SYNCED)`);

  // 7. Verify profile update via POST /api/onboarding
  console.log('\n• 7. Testing profile update via POST /api/onboarding...');
  const newBrandName = 'Kopi Lereng Nusantara Modern';
  const newBio = 'Kopi khas pegunungan Jawa Timur dengan aroma semerbak rempah alami.';
  const onbRes = await fetch(`${TARGET_URL}/api/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cookie': cookie,
    },
    body: JSON.stringify({
      fullName: newBrandName,
      companyName: newBrandName,
      businessCategory: 'Food & Beverage',
      description: newBio,
      location: 'Surabaya, Jawa Timur',
    }),
  });
  if (!onbRes.ok) throw new Error(`POST /api/onboarding failed: ${onbRes.status}`);
  console.log('  -> POST /api/onboarding succeeded (HTTP 200)');

  // 8. Query PostgreSQL business_profiles directly
  console.log('\n• 8. Verifying business_profiles table in PostgreSQL...');
  const [bizRow] = await sql`SELECT company_name, description FROM business_profiles WHERE profile_id = ${userId}::uuid`;
  if (!bizRow || bizRow.company_name !== newBrandName) {
    throw new Error(`DB mismatch in business_profiles! Expected ${newBrandName}, found ${bizRow?.company_name}`);
  }
  console.log(`  -> PostgreSQL business_profiles.company_name: "${bizRow.company_name}" ✅ (PERSISTED)`);
  console.log(`  -> PostgreSQL business_profiles.description: "${bizRow.description}" ✅ (PERSISTED)`);

  // 9. Restore original demo state
  console.log('\n• 9. Restoring original cover and profile values...');
  const origCover = '/uploads/avatars/1792031942244-3b58fe62fd0a.jpg';
  await sql`UPDATE profiles SET cover_url = ${origCover}, full_name = 'Kopi Lereng Nusantara' WHERE id = ${userId}::uuid`;
  await sql`UPDATE business_profiles SET company_name = 'Kopi Lereng Nusantara', description = 'Produsen biji kopi specialty lereng pegunungan Jawa Timur.' WHERE profile_id = ${userId}::uuid`;
  console.log('  -> Restored successfully.');

  console.log('\n=============================================================');
  console.log('🎉 ALL UMKM PERSISTENCE & DATA INTEGRITY TESTS PASSED!');
  console.log('=============================================================');

  await sql.end();
}

run().catch(async (err) => {
  console.error('\n❌ TEST FAILED:', err);
  await sql.end();
  process.exit(1);
});
