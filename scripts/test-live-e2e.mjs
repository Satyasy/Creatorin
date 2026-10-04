import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Testing Guest Landing Hero Option A (shapes, no photos, no dots)...');
  await page.goto('https://api.creatorin.my.id/');
  await page.waitForTimeout(2000);
  
  // Verify hero SVG waveform exists
  const svgGraph = page.locator('svg line, svg path');
  console.log('Hero SVG elements count:', await svgGraph.count());
  
  // Verify NO pulse or ping dots exist on page
  const liveDots = page.locator('.animate-pulse, .animate-ping');
  console.log('Live pulse/ping dots on landing page:', await liveDots.count());

  // Verify Stage pills
  const stagePills = page.locator('text=Brief Sah');
  console.log('Brief Sah stage pill visible:', await stagePills.count());

  console.log('\n2. Testing Admin Login and Logout flow...');
  await page.goto('https://api.creatorin.my.id/admin/login');
  await page.fill('input[type="email"]', 'admin@creatorin.my.id');
  await page.fill('input[type="password"]', 'Creatorin2026');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 10000 });
  console.log('Logged in to admin, URL:', page.url());

  // Click logout
  console.log('Clicking admin logout button...');
  const logoutBtn = page.locator('button[title="Logout"]').first();
  await logoutBtn.click();
  await page.waitForURL('**/admin/login', { timeout: 10000 });
  console.log('Redirected to login after logout, URL:', page.url());

  // Reload page
  console.log('Reloading /admin/login...');
  await page.reload();
  await page.waitForTimeout(1000);

  // Attempt direct navigation back to /admin
  console.log('Attempting direct navigation back to /admin...');
  await page.goto('https://api.creatorin.my.id/admin');
  await page.waitForTimeout(2000);
  console.log('URL after attempting to access /admin:', page.url());
  if (page.url().includes('/admin/login')) {
    console.log('✅ Admin is successfully locked out after logout!');
  } else {
    console.log('❌ Still on /admin!');
  }

  console.log('\n3. Testing UMKM User Login and Logout on Navbar...');
  await page.goto('https://api.creatorin.my.id/sign-in');
  await page.fill('input[type="email"]', 'umkm@creatorin.my.id');
  await page.fill('input[type="password"]', 'Creatorin2026');
  await page.click('button:has-text("Masuk ke Akun"), button[type="submit"]');
  await page.waitForTimeout(4000);
  console.log('UMKM signed in, URL:', page.url());

  const userMenuBtn = page.locator('#nav-user-profile-logo-btn');
  if (await userMenuBtn.count() > 0) {
    await userMenuBtn.click();
    await page.waitForTimeout(500);
    const navLogout = page.locator('#nav-user-logout-btn');
    console.log('Clicking Keluar in navbar...');
    await navLogout.click();
    await page.waitForTimeout(3000);
    console.log('URL after navbar logout:', page.url());

    // Reload
    console.log('Reloading home page...');
    await page.reload();
    await page.waitForTimeout(2000);

    const signinBtn = page.locator('#nav-signin-btn');
    const avatarBtn = page.locator('#nav-user-profile-logo-btn');
    console.log('Sign in button count after reload:', await signinBtn.count());
    console.log('Avatar button count after reload:', await avatarBtn.count());

    if (await signinBtn.count() > 0 && (await avatarBtn.count() === 0)) {
      console.log('✅ UMKM user is successfully logged out completely across reloads!');
    } else {
      console.log('❌ UMKM session still detected on reload!');
    }
  }

  console.log('\n4. Testing Creator User Login and Logout on CreatorSidebar...');
  await page.goto('https://api.creatorin.my.id/sign-in');
  await page.fill('input[type="email"]', 'creator@creatorin.my.id');
  await page.fill('input[type="password"]', 'Creatorin2026');
  await page.click('button:has-text("Masuk ke Akun"), button[type="submit"]');
  await page.waitForTimeout(4000);
  console.log('Creator signed in, URL:', page.url());

  const creatorLogoutBtn = page.locator('aside[aria-label="Sidebar kreator"] button[aria-label="Logout"]');
  if (await creatorLogoutBtn.count() > 0) {
    console.log('Clicking Logout in Creator sidebar...');
    await creatorLogoutBtn.click();
    await page.waitForTimeout(3000);
    console.log('URL after creator sidebar logout:', page.url());

    // Reload
    console.log('Reloading home page...');
    await page.reload();
    await page.waitForTimeout(2000);

    const signinBtn = page.locator('#nav-signin-btn');
    const sidebar = page.locator('aside[aria-label="Sidebar kreator"]');
    console.log('Sign in button count after reload:', await signinBtn.count());
    console.log('Creator sidebar count after reload:', await sidebar.count());

    if (await signinBtn.count() > 0 && (await sidebar.count() === 0)) {
      console.log('✅ Creator user is successfully logged out completely across reloads!');
    } else {
      console.log('❌ Creator session still detected on reload!');
    }
  }

  await browser.close();
}

run().catch(console.error);
