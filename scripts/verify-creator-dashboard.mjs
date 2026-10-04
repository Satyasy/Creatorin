import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
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

    if (layout.contentWidth > layout.viewportWidth) throw new Error(`${viewport.name}: horizontal overflow ${layout.contentWidth - layout.viewportWidth}px`);
    if (layout.navLabels.join(' ') !== 'Search Home Messages Contracts Finances Uma Notifikasi Pengaturan Bantuan') throw new Error(`${viewport.name}: creator navigation is incomplete (${JSON.stringify(layout.navLabels)})`);

    await page.getByRole('button', { name: 'Simpan brief' }).first().click();
    await page.getByRole('tab', { name: /Tersimpan/ }).click();
    if (await page.locator('article').count() !== 1) throw new Error(`${viewport.name}: saved brief tab did not show the saved item`);

    await page.getByRole('tab', { name: 'Rekomendasi' }).click();
    await page.getByLabel('Cari brief proyek').fill('kata-kunci-yang-tidak-ada');
    await page.getByRole('heading', { name: 'Brief tidak ditemukan' }).waitFor();
    await page.getByRole('button', { name: 'Hapus pencarian' }).click();

    await page.screenshot({ path: `.qa-creator-${viewport.name}.png`, fullPage: false });
    await page.close();
  }

  console.log('Creator dashboard responsive check passed at 1440x900 and 390x844.');
} finally {
  await browser.close();
}
