import { chromium } from 'playwright';

async function runTests() {
  console.log('🚀 Starting Playwright verification test suite...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Navbar Shrink on Scroll (80px -> 64px)
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Dynamic Shrinking Sticky Navbar ---');
    await page.goto('http://localhost:3000', { waitUntil: 'load' });
    await page.waitForTimeout(500);

    const initialNavHeight = await page.evaluate(() => {
      const header = document.querySelector('header#main-header');
      return header ? Math.round(header.getBoundingClientRect().height) : null;
    });
    console.log(`Initial header height at scrollY=0: ${initialNavHeight}px`);
    assert(initialNavHeight !== null && initialNavHeight >= 78, `Initial header is h-20 (~80px), got ${initialNavHeight}px`);

    // Scroll down 250px
    await page.evaluate(() => window.scrollTo(0, 250));
    await page.waitForTimeout(500);

    const scrolledNavHeight = await page.evaluate(() => {
      const header = document.querySelector('header#main-header');
      return header ? Math.round(header.getBoundingClientRect().height) : null;
    });
    console.log(`Scrolled header height at scrollY=250: ${scrolledNavHeight}px`);
    assert(scrolledNavHeight !== null && scrolledNavHeight <= 66 && scrolledNavHeight < initialNavHeight, `Scrolled header shrinks to h-16 (~64px), got ${scrolledNavHeight}px`);

    // -------------------------------------------------------------
    // TEST 2: Scroll Reveal Entrance Animation
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Scroll Reveal Animation Elements ---');
    const revealsCount = await page.evaluate(() => {
      return document.querySelectorAll('.will-change-transform').length;
    });
    console.log(`Found ${revealsCount} scroll reveal / animated elements`);
    assert(revealsCount > 5, `ScrollReveal elements are present (found ${revealsCount})`);

    // Scroll further down to reveal showcase cards
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(600);

    const visibleElementsCount = await page.evaluate(() => {
      let count = 0;
      document.querySelectorAll('.will-change-transform').forEach(el => {
        const style = window.getComputedStyle(el);
        if (parseFloat(style.opacity) > 0.8) count++;
      });
      return count;
    });
    console.log(`Visible elements after scroll reveal: ${visibleElementsCount}`);
    assert(visibleElementsCount > 0, `Items smoothly rise and reveal (opacity > 0.8)`);

    // -------------------------------------------------------------
    // TEST 3: School Dashboard Profile Management Scrolling
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: School Dashboard Profile Management Scroll ---');
    await page.goto('http://localhost:3000/dashboard/school', { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    // Click Profil Management tab if available
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const profileBtn = buttons.find(b => b.textContent && b.textContent.includes('Profil Sekolah'));
      if (profileBtn) profileBtn.click();
    });
    await page.waitForTimeout(500);

    const scrollCheck = await page.evaluate(() => {
      const initialScrollY = window.scrollY;
      const initialScrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      // Try scrolling down
      window.scrollTo(0, 800);
      const newScrollY = window.scrollY;

      return {
        initialScrollY,
        newScrollY,
        initialScrollHeight,
        viewportHeight,
        canScroll: initialScrollHeight > viewportHeight
      };
    });

    console.log(`School dashboard scrollHeight: ${scrollCheck.initialScrollHeight}px, viewport: ${scrollCheck.viewportHeight}px, scrolledTo: ${scrollCheck.newScrollY}px`);
    assert(scrollCheck.canScroll, `School Dashboard content is taller than viewport and scrollable (${scrollCheck.initialScrollHeight}px > ${scrollCheck.viewportHeight}px)`);
    assert(scrollCheck.newScrollY > 0, `School Dashboard scrolls smoothly (scrolled to ${scrollCheck.newScrollY}px)`);

    // -------------------------------------------------------------
    // TEST 4: Mobile Viewport Optimization (375x667)
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Mobile View Optimization (375x667) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'load' });
    await mobilePage.waitForTimeout(600);

    const mobileScrollWidth = await mobilePage.evaluate(() => {
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    console.log(`Mobile clientWidth: ${mobileScrollWidth.clientWidth}px, scrollWidth: ${mobileScrollWidth.scrollWidth}px`);
    assert(!mobileScrollWidth.hasHorizontalOverflow, `No horizontal scrollbar on mobile (scrollWidth <= clientWidth)`);

    // Check banner bottom offset on mobile
    const bannerStyle = await mobilePage.evaluate(() => {
      const banner = document.querySelector('.bottom-20');
      return banner ? window.getComputedStyle(banner).bottom : null;
    });
    console.log(`Floating banner bottom on mobile: ${bannerStyle}`);
    assert(bannerStyle === '80px', `Floating banner positioned at bottom-20 (80px) on mobile to clear chatbot button`);

    await mobileContext.close();

    console.log(`\n=============================================`);
    console.log(`RESULTS: ${passed}/${total} tests passed!`);
    console.log(`=============================================\n`);

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
