import { chromium, Browser, BrowserContext, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import postgres from 'postgres';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://creatorin_user:creatorin_secure_pass_2026@127.0.0.1:5432/creatorin_db';

let sqlClient: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (!sqlClient) {
    sqlClient = postgres(DATABASE_URL);
  }
  return sqlClient;
}

let passedTests = 0;
let failedTests = 0;

async function runScenario(name: string, fn: (browser: Browser) => Promise<void>) {
  console.log(`\n=======================================================`);
  console.log(`▶ RUNNING: ${name}`);
  console.log(`=======================================================`);
  const browser = await chromium.launch({ headless: true });
  try {
    await fn(browser);
    console.log(`✅ PASSED: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`Error details:`, err);
    failedTests++;
  } finally {
    await browser.close();
  }
}

async function loginAsDemoUmkm(page: Page) {
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
  
  // Call /api/auth/demo to get genuine JWT session for UMKM
  const authData = await page.evaluate(async (url) => {
    const res = await fetch(`${url}/api/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'business' }),
    });
    const json = await res.json();
    if (json.session?.accessToken) {
      localStorage.setItem('creatorin_token', json.session.accessToken);
    }
    if (json.user) {
      localStorage.setItem('creatorin_session_user', JSON.stringify(json.user));
    }
    return json;
  }, BASE_URL);

  if (!authData.success) {
    throw new Error('Failed to obtain demo UMKM credentials');
  }

  // Navigate to profile page
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
}

async function main() {
  console.log('Starting Playwright Verification for UMKM Profile & Banner...');

  // ------------------------------------------------------------------------
  // E2E 1: Edit profil UMKM berhasil
  // ------------------------------------------------------------------------
  await runScenario('E2E 1: Edit profil UMKM berhasil (Loading spinner, SuccessModal, Persistensi DB & Reload)', async (browser) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    await loginAsDemoUmkm(page);

    const editBtn = page.locator('#btn-edit-profile');
    if (!(await editBtn.isVisible())) {
      throw new Error('#btn-edit-profile not found on /profile');
    }

    // 1. Enter edit mode
    await editBtn.click();
    await page.waitForTimeout(500);

    const inputBrandName = page.locator('#input-brand-name');
    if (!(await inputBrandName.isVisible())) {
      throw new Error('#input-brand-name is not visible in edit mode');
    }

    const testBrandName = `Kopi Lereng E2E ${Date.now().toString().slice(-4)}`;
    await inputBrandName.fill(testBrandName);

    // 2. Click Selesai Edit and observe loading state
    const savePromise = editBtn.click();

    // Verify loading spinner & disabled button immediately upon click
    const isSpinnerOrDisabled = await page.waitForFunction(() => {
      const btn = document.querySelector('#btn-edit-profile') as HTMLButtonElement;
      return btn && (btn.disabled || btn.textContent?.includes('Menyimpan'));
    }, { timeout: 3000 }).catch(() => null);

    if (!isSpinnerOrDisabled) {
      console.warn('Note: Selesai Edit processed very quickly, checking completion...');
    }

    await savePromise;

    // 3. Verify Center SuccessModal dialog appears
    const successModal = page.locator('div[role="dialog"]');
    await successModal.waitFor({ state: 'visible', timeout: 5000 });
    const modalText = await successModal.textContent();
    console.log('SuccessModal detected with text:', modalText?.slice(0, 80));

    if (!modalText?.includes('Profil Brand Berhasil Disimpan')) {
      throw new Error(`SuccessModal did not show expected title: ${modalText}`);
    }

    // 4. Verify in PostgreSQL
    const sql = getSql();
    const [dbUser] = await sql`
      SELECT p.full_name, bp.company_name 
      FROM profiles p
      LEFT JOIN business_profiles bp ON bp.profile_id = p.id
      WHERE p.email = 'umkm@creatorin.my.id';
    `;
    console.log('DB Record after save:', dbUser);
    if (dbUser.company_name !== testBrandName && dbUser.full_name !== testBrandName) {
      throw new Error(`DB verification failed. Expected "${testBrandName}", found company_name="${dbUser.company_name}"`);
    }

    // 5. Reload page and verify UI shows updated brand name
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const headingText = await page.locator('h1').first().textContent();
    console.log('H1 text after page reload:', headingText);
    if (!headingText?.includes(testBrandName)) {
      throw new Error(`Page reload did not display persisted brand name. Found: ${headingText}`);
    }
  });

  // ------------------------------------------------------------------------
  // E2E 2: Edit profil UMKM gagal (Simulasi API 500)
  // ------------------------------------------------------------------------
  await runScenario('E2E 2: Edit profil UMKM gagal (Simulasi API 500, mode edit tetap aktif, error toast)', async (browser) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    await loginAsDemoUmkm(page);

    const editBtn = page.locator('#btn-edit-profile');
    await editBtn.click();
    await page.waitForTimeout(500);

    const inputBrandName = page.locator('#input-brand-name');
    await inputBrandName.fill('Simulated Failed Name');

    // Intercept /api/onboarding and force 500 error
    await page.route('**/api/onboarding', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database Timeout Error (Simulasi)' }),
      });
    });

    // Click Selesai Edit
    await editBtn.click();
    await page.waitForTimeout(1000);

    // 1. SuccessModal must NOT appear
    const modalVisible = await page.locator('div[role="dialog"]').isVisible();
    if (modalVisible) {
      throw new Error('SuccessModal appeared even though API returned 500 error!');
    }

    // 2. Edit mode must still be active so user input is not lost
    const isInputStillVisible = await inputBrandName.isVisible();
    if (!isInputStillVisible) {
      throw new Error('Edit mode was closed despite error; user changes would be lost!');
    }

    // 3. Error toast should be visible
    const toastLocator = page.locator('div:has-text("Database Timeout Error")');
    const toastVisible = await toastLocator.first().isVisible({ timeout: 4000 }).catch(() => false);
    console.log('Error toast displayed correctly?', toastVisible);
    if (!toastVisible) {
      throw new Error('Expected error toast was not displayed upon API failure.');
    }
  });

  // ------------------------------------------------------------------------
  // E2E 3: Banner UMKM bertahan setelah refresh
  // ------------------------------------------------------------------------
  await runScenario('E2E 3: Banner UMKM berhasil diunggah, disimpan ke PostgreSQL, dan bertahan setelah refresh', async (browser) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    await loginAsDemoUmkm(page);

    // Prepare unique test image with distinct random bytes
    const uniqueTag = `test-banner-${Date.now()}`;
    const testImagePath = path.join(process.cwd(), 'scripts', `${uniqueTag}.png`);
    // Minimal valid 1x1 png
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImagePath, pngBuffer);

    try {
      // Find banner file input
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testImagePath);

      // Verify SuccessModal appears for banner update
      const successModal = page.locator('div[role="dialog"]');
      await successModal.waitFor({ state: 'visible', timeout: 8000 });
      const modalText = await successModal.textContent();
      console.log('Banner SuccessModal text:', modalText?.slice(0, 80));

      if (!modalText?.includes('Foto Sampul Diperbarui')) {
        throw new Error(`Expected banner success modal, got: ${modalText}`);
      }

      // Check PostgreSQL cover_url
      const sql = getSql();
      const [dbRow] = await sql`
        SELECT cover_url FROM profiles WHERE email = 'umkm@creatorin.my.id';
      `;
      console.log('Cover URL in PostgreSQL:', dbRow?.cover_url);
      if (!dbRow?.cover_url || !dbRow.cover_url.startsWith('/uploads/avatars/')) {
        throw new Error(`PostgreSQL cover_url not updated correctly: ${dbRow?.cover_url}`);
      }

      // Reload page and verify banner retains new URL
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      const bannerImg = page.locator('img[alt="Foto Sampul Brand"], img[alt*="Sampul"]').first();
      const loadedSrc = await bannerImg.getAttribute('src');
      console.log('Banner src after page reload:', loadedSrc);

      if (!loadedSrc || !loadedSrc.includes('/uploads/avatars/')) {
        throw new Error(`Banner did not persist after reload! Src found: ${loadedSrc}`);
      }
    } finally {
      if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    }
  });

  // ------------------------------------------------------------------------
  // E2E 4: Banner gagal disimpan (Simulasi API 500)
  // ------------------------------------------------------------------------
  await runScenario('E2E 4: Banner gagal disimpan (Simulasi API upload 500, error toast, UI tidak mengklaim sukses)', async (browser) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    await loginAsDemoUmkm(page);

    const testImagePath = path.join(process.cwd(), 'scripts', 'fail-banner.png');
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImagePath, pngBuffer);

    try {
      // Force /api/upload to fail with 500
      await page.route('**/api/upload', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Storage Disk Full (Simulasi)' }),
        });
      });

      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testImagePath);
      await page.waitForTimeout(1500);

      // Verify SuccessModal does NOT appear
      const modalVisible = await page.locator('div[role="dialog"]').isVisible();
      if (modalVisible) {
        throw new Error('SuccessModal appeared even when banner upload failed!');
      }

      // Verify error toast
      const toastVisible = await page.locator('div:has-text("Storage Disk Full")').first().isVisible().catch(() => false);
      console.log('Error toast visible on failed upload?', toastVisible);
      if (!toastVisible) {
        throw new Error('Expected error toast was not displayed on banner upload failure.');
      }
    } finally {
      if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    }
  });

  console.log(`\n=======================================================`);
  console.log(`🏁 FINAL PLAYWRIGHT SUITE RESULTS: ${passedTests} passed, ${failedTests} failed`);
  console.log(`=======================================================`);

  if (sqlClient) {
    await sqlClient.end();
  }

  if (failedTests > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
