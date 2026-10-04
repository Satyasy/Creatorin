import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('--- TEST 1: ADMIN LOGOUT ON api.creatorin.my.id ---');
  await page.goto('https://api.creatorin.my.id/admin/login');
  await page.fill('input[type="email"]', 'admin@creatorin.my.id');
  await page.fill('input[type="password"]', 'Creatorin2026');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 10000 });
  console.log('Logged in to admin, URL:', page.url());

  const cookiesBefore = await context.cookies();
  console.log('Cookies before logout:', cookiesBefore.map(c => ({ name: c.name, domain: c.domain, path: c.path, expires: c.expires })));
  const lsBefore = await page.evaluate(() => Object.keys(localStorage).map(k => ({ key: k, val: localStorage.getItem(k)?.slice(0, 30) })));
  console.log('LocalStorage before logout:', lsBefore);

  console.log('Clicking logout button in admin...');
  const logoutBtn = await page.locator('button:has-text("Keluar")').first();
  await logoutBtn.click();
  await page.waitForTimeout(2000);
  console.log('URL after clicking logout:', page.url());

  const cookiesAfterClick = await context.cookies();
  console.log('Cookies after logout click:', cookiesAfterClick.map(c => ({ name: c.name, domain: c.domain, path: c.path, expires: c.expires })));
  const lsAfterClick = await page.evaluate(() => Object.keys(localStorage).map(k => ({ key: k, val: localStorage.getItem(k)?.slice(0, 30) })));
  console.log('LocalStorage after logout click:', lsAfterClick);

  console.log('Reloading /admin/login page...');
  await page.reload();
  await page.waitForTimeout(2000);
  console.log('URL after reload:', page.url());

  console.log('Navigating directly to /admin...');
  await page.goto('https://api.creatorin.my.id/admin');
  await page.waitForTimeout(2000);
  console.log('URL after going to /admin:', page.url());

  console.log('\n--- TEST 2: MAIN SITE LOGOUT ON https://creatorin.my.id OR api.creatorin.my.id ---');
  await page.goto('https://api.creatorin.my.id/sign-in');
  await page.fill('input[type="email"]', 'creator@creatorin.my.id');
  await page.fill('input[type="password"]', 'Creatorin2026');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('Logged in to main site, URL:', page.url());

  const userMenuBtn = page.locator('#nav-user-menu-btn, button:has(img[alt="Avatar"])');
  if (await userMenuBtn.count() > 0) {
    console.log('Found user menu button, clicking...');
    await userMenuBtn.first().click();
    await page.waitForTimeout(500);
    const navLogout = page.locator('#nav-user-logout-btn, button:has-text("Keluar")');
    if (await navLogout.count() > 0) {
      console.log('Clicking Keluar in navbar...');
      await navLogout.first().click();
      await page.waitForTimeout(2000);
      console.log('URL after navbar logout:', page.url());

      console.log('Reloading page...');
      await page.reload();
      await page.waitForTimeout(2000);

      const navSignin = page.locator('#nav-signin-btn, a[href*="sign-in"], button:has-text("Masuk")');
      console.log('Sign in button count after reload:', await navSignin.count());
      const avatarAfter = page.locator('#nav-user-menu-btn');
      console.log('Avatar button count after reload:', await avatarAfter.count());
    } else {
      console.log('Nav logout button not found');
    }
  } else {
    console.log('User menu button not found, checking current state:', page.url());
  }

  await browser.close();
}

run().catch(console.error);
