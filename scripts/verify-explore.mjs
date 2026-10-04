import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', (error) => console.error('PAGE ERROR:', error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') console.error('BROWSER ERROR:', message.text());
    });
    await page.addInitScript(() => {
      localStorage.setItem('creatorin_session_user', JSON.stringify({
        name: 'Kreator Demo',
        email: 'creator@creatorin.id',
        role: 'creator',
      }));
    });
    await page.goto(`${process.argv[2] || 'http://127.0.0.1:3000'}/explore`, { waitUntil: 'networkidle' });

    await page.locator('aside[aria-label="Sidebar kreator"]').waitFor();
    await page.getByRole('navigation', { name: 'Navigasi kreator' }).waitFor();
    await page.getByRole('link', { name: 'Search' }).waitFor();
    if (await page.getByRole('navigation', { name: 'Navigasi utama' }).count()) {
      throw new Error(`Navbar UMKM tampil pada ${viewport.width}px`);
    }
    await page.getByRole('button', { name: 'Video kreator' }).click();
    await page.getByRole('heading', { name: 'Video dari kreator' }).waitFor();
    await page.getByPlaceholder('Cari video, kategori, atau kreator').fill('coffee');
    await page.getByText('Artisan Coffee Pouring ASMR Reel').waitFor();

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (hasOverflow) throw new Error(`Halaman overflow horizontal pada ${viewport.width}px`);
    await page.close();
  }

  console.log('Explore verification passed at 1440x900 and 390x844.');
} finally {
  await browser.close();
}
