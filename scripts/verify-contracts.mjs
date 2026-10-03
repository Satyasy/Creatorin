import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'http://127.0.0.1:3000';
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

    await page.goto(`${baseUrl}/contracts`, { waitUntil: 'networkidle' });
    await page.locator('aside[aria-label="Sidebar kreator"]').waitFor();
    await page.getByRole('link', { name: 'Contracts' }).waitFor();
    if (await page.getByRole('link', { name: 'Opportunities' }).count()) {
      throw new Error(`Opportunities masih tampil pada ${viewport.width}px`);
    }

    await page.getByRole('heading', { name: 'Brief yang sedang kamu lamar.' }).waitFor();
    await page.getByRole('button', { name: 'Accepted' }).click();
    await page.getByText('Accepted').first().waitFor();
    await page.getByRole('button', { name: 'Menunggu' }).click();
    await page.getByText('Menunggu review').first().waitFor();

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (hasOverflow) throw new Error(`Halaman contracts overflow horizontal pada ${viewport.width}px`);
    await page.close();
  }

  const removedPage = await browser.newPage();
  const response = await removedPage.goto(`${baseUrl}/collaboration`, { waitUntil: 'domcontentloaded' });
  if (response?.status() !== 404) throw new Error(`/collaboration belum 404, status ${response?.status()}`);
  await removedPage.close();

  console.log('Contracts verification passed at 1440x900 and 390x844.');
} finally {
  await browser.close();
}
