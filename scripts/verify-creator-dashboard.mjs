import { chromium } from 'playwright';

const launchOptions = { headless: true };
if (process.env.CHROME_PATH) {
  launchOptions.executablePath = process.env.CHROME_PATH;
} else if (process.platform === 'win32') {
  launchOptions.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}
const browser = await chromium.launch(launchOptions);
const user = { name: 'Revano Pandega', email: 'revano@creatorin.id', role: 'creator' };

try {
  for (const viewport of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    await page.addInitScript((sessionUser) => localStorage.setItem('creatorin_session_user', JSON.stringify(sessionUser)), user);
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForSelector('nav[aria-label="Navigasi kreator"]', { timeout: 8000 });

    const layout = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      contentWidth: document.documentElement.scrollWidth,
      navLabels: [...document.querySelectorAll('nav[aria-label="Navigasi kreator"] a')].map((link) => link.getAttribute('aria-label')),
    }));

    const expectedNav = ['Home', 'Messages', 'Contracts', 'Layanan', 'Proyek', 'Finances', 'Notifikasi', 'Pengaturan'];
    if (layout.navLabels.join(' ') !== expectedNav.join(' ')) throw new Error(`${viewport.name}: creator navigation mismatch (${JSON.stringify(layout.navLabels)})`);

    // Verify search input
    const searchInput = page.getByPlaceholder('Cari proyek, keahlian, atau kata kunci');
    await searchInput.waitFor();
    await searchInput.fill('TikTok');
    
    // Verify category header
    await page.getByRole('heading', { name: 'Cari Proyek berdasarkan Kategori' }).waitFor();
    
    // Clear search
    await searchInput.fill('');

    await page.screenshot({ path: `.qa-creator-${viewport.name}.png`, fullPage: false });
    await page.close();
  }

  console.log('Creator dashboard responsive check passed at 1440x900 and 390x844.');
} finally {
  await browser.close();
}
