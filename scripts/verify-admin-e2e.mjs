import { chromium } from 'playwright';

async function run() {
  console.log('🚀 Menjalankan Playwright Headless Browser Test untuk Admin Dashboard...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    console.log('1. Membuka https://api.creatorin.my.id/admin/login...');
    await page.goto('https://api.creatorin.my.id/admin/login', { waitUntil: 'networkidle' });
    console.log('Title:', await page.title());

    console.log('2. Mengisi form login Admin...');
    await page.fill('input[type="email"]', 'admin@creatorin.my.id');
    await page.fill('input[type="password"]', 'Creatorin2026');
    await page.click('button[type="submit"]');

    console.log('3. Menunggu navigasi ke /admin...');
    await page.waitForURL('**/admin', { timeout: 15000 });
    console.log('Berhasil redirect ke:', page.url());

    console.log('4. Memverifikasi elemen-elemen Filament...');
    await page.waitForSelector('text=Dashboard Overview', { timeout: 10000 });
    console.log('✅ Sidebar Dashboard Overview tampil.');

    await page.waitForSelector('text=Total Pengguna', { timeout: 10000 });
    console.log('✅ Stat Widget Total Pengguna tampil.');

    await page.waitForSelector('text=Distribusi Pengguna', { timeout: 10000 });
    console.log('✅ Visualisasi Chart Distribusi Pengguna tampil.');

    await page.screenshot({ path: 'scratch_admin_dashboard.png', fullPage: true });
    console.log('📸 Screenshot tersimpan: scratch_admin_dashboard.png');

    console.log('\n🎉 PLAYWRIGHT E2E BROWSER TEST SELESAI DENGAN SUKSES 100%!');
  } catch (err) {
    console.error('❌ Playwright Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
