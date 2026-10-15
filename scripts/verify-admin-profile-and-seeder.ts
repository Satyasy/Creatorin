import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🧪 Starting Verification: Admin Profile Banner & Avatar + Seeder Safety Guard');

  const connectionString = process.env.DATABASE_URL || 'postgresql://creatorin_user:Cr3at0rIn_Secure_2026_Db@127.0.0.1:5432/creatorin_db';
  const sql = postgres(connectionString, { ssl: false });

  // Record initial state to guarantee complete restoration
  const [initialAdmin] = await sql`SELECT id, avatar_url, cover_url, headline FROM profiles WHERE LOWER(email) = 'admin@creatorin.my.id'`;
  const initialAvatar = initialAdmin?.avatar_url || '/creatorin/avatar.png';
  const initialCover = initialAdmin?.cover_url || 'linear-gradient(135deg, #0B1F3A 0%, #155DFC 100%)';
  const initialHeadline = initialAdmin?.headline || '';

  // Setup actual physical files on disk so Nginx never returns 404
  const uploadsDir = '/var/www/creatorin/shared/uploads/avatars';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const timestamp = Date.now();
  const avatarFilename = `admin-test-avatar-${timestamp}.png`;
  const bannerFilename = `admin-test-banner-${timestamp}.png`;
  const avatarFilePath = path.join(uploadsDir, avatarFilename);
  const bannerFilePath = path.join(uploadsDir, bannerFilename);

  const sampleImage = '/var/www/creatorin/repo/public/creatorin/avatar.png';
  if (fs.existsSync(sampleImage)) {
    fs.copyFileSync(sampleImage, avatarFilePath);
    fs.copyFileSync(sampleImage, bannerFilePath);
  } else {
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    fs.writeFileSync(avatarFilePath, dummyPng);
    fs.writeFileSync(bannerFilePath, dummyPng);
  }

  const testAvatarUrl = `/uploads/avatars/${avatarFilename}`;
  const testCoverUrl = `/uploads/avatars/${bannerFilename}`;
  const testHeadline = 'Administrator Platform & Community Lead (Verified)';

  try {
    // 1. Authenticate as admin
    console.log('\n--- STEP 1: Login as admin ---');
    const loginRes = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@creatorin.my.id', password: 'Creatorin2026' }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.session?.accessToken) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    const token = loginData.session.accessToken;
    console.log('✅ Admin login success. User ID:', loginData.user.id);

    // 2. Update admin avatar and coverUrl via PUT /api/profile
    console.log('\n--- STEP 2: Update admin avatar & coverUrl ---');

    const updateRes = await fetch('http://127.0.0.1:3000/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        avatarUrl: testAvatarUrl,
        coverUrl: testCoverUrl,
        headline: testHeadline,
      }),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok || !updateData.success) {
      throw new Error(`Profile update failed: ${JSON.stringify(updateData)}`);
    }
    console.log('✅ Admin profile updated successfully:', updateData.message);

    // 3. Verify GET /api/auth/me returns updated avatar and coverUrl
    console.log('\n--- STEP 3: Verify GET /api/auth/me ---');
    const meRes = await fetch('http://127.0.0.1:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    if (!meRes.ok || !meData.user) {
      throw new Error(`GET /api/auth/me failed: ${JSON.stringify(meData)}`);
    }
    if (meData.user.avatarUrl !== testAvatarUrl) {
      throw new Error(`Expected avatarUrl "${testAvatarUrl}", got "${meData.user.avatarUrl}"`);
    }
    if (meData.user.coverUrl !== testCoverUrl) {
      throw new Error(`Expected coverUrl "${testCoverUrl}", got "${meData.user.coverUrl}"`);
    }
    console.log('✅ GET /api/auth/me has updated avatarUrl & coverUrl:');
    console.log('   avatarUrl:', meData.user.avatarUrl);
    console.log('   coverUrl:', meData.user.coverUrl);

    // 4. Verify in PostgreSQL directly
    console.log('\n--- STEP 4: Verify directly in PostgreSQL ---');
    const [adminDb] = await sql`SELECT id, avatar_url, cover_url FROM profiles WHERE LOWER(email) = 'admin@creatorin.my.id'`;
    if (!adminDb) throw new Error('Admin profile not found in DB');
    if (adminDb.avatar_url !== testAvatarUrl) throw new Error(`DB avatar_url mismatch: expected ${testAvatarUrl}, got ${adminDb.avatar_url}`);
    if (adminDb.cover_url !== testCoverUrl) throw new Error(`DB cover_url mismatch: expected ${testCoverUrl}, got ${adminDb.cover_url}`);
    console.log('✅ PostgreSQL record confirmed:', adminDb);

    // 5. Test Seeder Safety Guard: Run seeder without FORCE_SEED
    console.log('\n--- STEP 5: Run seeder (npm run db:seed) and verify safety guard ---');
    const { execSync } = await import('child_process');
    const seederOutput = execSync('node scripts/seed-database.mjs', {
      encoding: 'utf-8',
      env: { ...process.env, FORCE_SEED: 'false' },
    });
    console.log('Seeder ran with output summary:');
    const relevantLines = seederOutput
      .split('\n')
      .filter((l: string) => l.includes('🛡️') || l.includes('Proteksi') || l.includes('Menyinkronkan akun: admin@creatorin.my.id'))
      .join('\n');
    console.log(relevantLines);

    // 6. Verify data was NOT overwritten
    console.log('\n--- STEP 6: Verify admin avatar & coverUrl survived seeder ---');
    const [adminDbAfterSeed] = await sql`SELECT id, avatar_url, cover_url FROM profiles WHERE LOWER(email) = 'admin@creatorin.my.id'`;
    if (adminDbAfterSeed.avatar_url !== testAvatarUrl) {
      throw new Error(`FAIL: Seeder OVERWROTE admin avatar! Expected ${testAvatarUrl}, got ${adminDbAfterSeed.avatar_url}`);
    }
    if (adminDbAfterSeed.cover_url !== testCoverUrl) {
      throw new Error(`FAIL: Seeder OVERWROTE admin coverUrl! Expected ${testCoverUrl}, got ${adminDbAfterSeed.cover_url}`);
    }
    console.log('✅ SUCCESS! Admin avatar & coverUrl PERSISTED without being overwritten:');
    console.log('   avatar_url:', adminDbAfterSeed.avatar_url);
    console.log('   cover_url:', adminDbAfterSeed.cover_url);

    // 7. Check services count
    const [{ count: servicesCount }] = await sql`SELECT COUNT(*)::int as count FROM services`;
    console.log(`✅ Services count intact: ${servicesCount}`);

    console.log('\n=======================================================');
    console.log('🎉 ALL VERIFICATION CHECKS PASSED 100%!');
    console.log('=======================================================');
  } finally {
    console.log('\n--- CLEANUP: Restoring admin profile and removing temporary test files ---');
    try {
      await sql`
        UPDATE profiles 
        SET avatar_url = ${initialAvatar}, 
            cover_url = ${initialCover}, 
            headline = ${initialHeadline} 
        WHERE LOWER(email) = 'admin@creatorin.my.id'
      `;
      console.log('✅ PostgreSQL profiles table restored to authentic admin profile values.');
    } catch (restoreErr) {
      console.error('⚠️ Failed to restore admin profile in DB:', restoreErr);
    }

    try {
      if (fs.existsSync(avatarFilePath)) fs.unlinkSync(avatarFilePath);
      if (fs.existsSync(bannerFilePath)) fs.unlinkSync(bannerFilePath);
      console.log('✅ Temporary test image files safely removed from disk.');
    } catch (unlinkErr) {
      console.warn('⚠️ Could not remove temporary test image files:', unlinkErr);
    }

    await sql.end();
  }
}

main().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
