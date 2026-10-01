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
    // TEST 1: Navbar Shrink on Scroll (80px -> 64px) on Home Page
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Dynamic Shrinking Sticky Navbar ---');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
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
    // TEST 3: School Dashboard Fixed Left Sidebar & Independent Center Scroll
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: School Dashboard Fixed Sidebar & Center Scroll ---');
    await page.goto('http://localhost:3000/dashboard/school', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#school-dashboard-main-content', { timeout: 10000 });
    await page.waitForTimeout(400);

    // Switch to Profile tab inside aside nav
    await page.evaluate(() => {
      const asideButtons = Array.from(document.querySelectorAll('aside nav button'));
      const profileBtn = asideButtons.find(b => b.textContent && b.textContent.trim().includes('Profile'));
      if (profileBtn) profileBtn.click();
    });
    await page.waitForTimeout(500);

    const dashboardCheck = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      const asideRect = aside ? aside.getBoundingClientRect() : null;
      const mainContent = document.querySelector('#school-dashboard-main-content');
      
      const initialAsideTop = asideRect ? Math.round(asideRect.top) : null;
      const initialAsideHeight = asideRect ? Math.round(asideRect.height) : null;
      
      const contentScrollHeight = mainContent ? mainContent.scrollHeight : 0;
      const contentClientHeight = mainContent ? mainContent.clientHeight : 0;
      
      // Scroll inside center content
      if (mainContent) {
        mainContent.scrollTop = 600;
      }
      
      const afterScrollAsideRect = aside ? aside.getBoundingClientRect() : null;
      const afterScrollAsideTop = afterScrollAsideRect ? Math.round(afterScrollAsideRect.top) : null;
      const contentScrollTop = mainContent ? mainContent.scrollTop : 0;
      const windowScrollY = window.scrollY;

      return {
        asidePresent: Boolean(aside),
        initialAsideTop,
        initialAsideHeight,
        afterScrollAsideTop,
        asideRemainsFixed: initialAsideTop === afterScrollAsideTop,
        contentScrollHeight,
        contentClientHeight,
        contentIsScrollable: contentScrollHeight > contentClientHeight,
        contentScrollTop,
        windowScrollY
      };
    });

    console.log(`Sidebar top before scroll: ${dashboardCheck.initialAsideTop}px, after scroll: ${dashboardCheck.afterScrollAsideTop}px, height: ${dashboardCheck.initialAsideHeight}px`);
    console.log(`Center content scrollHeight: ${dashboardCheck.contentScrollHeight}px, clientHeight: ${dashboardCheck.contentClientHeight}px, scrollTop: ${dashboardCheck.contentScrollTop}px, windowScrollY: ${dashboardCheck.windowScrollY}px`);
    
    assert(dashboardCheck.asidePresent && dashboardCheck.asideRemainsFixed, `Sidebar stays 100% fixed at top: ${dashboardCheck.initialAsideTop}px and does not move`);
    assert(dashboardCheck.contentIsScrollable, `Center content is scrollable (${dashboardCheck.contentScrollHeight}px > ${dashboardCheck.contentClientHeight}px)`);
    assert(dashboardCheck.contentScrollTop > 0 && dashboardCheck.windowScrollY === 0, `Only center content scrolls (scrollTop: ${dashboardCheck.contentScrollTop}px, windowScrollY: ${dashboardCheck.windowScrollY}px)`);

    // -------------------------------------------------------------
    // TEST 4: Mobile View Optimization (375x667)
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Mobile View Optimization (375x667) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
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

    // -------------------------------------------------------------
    // TEST 5: School Dashboard on Mobile View (Horizontal Sticky Tabs)
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: School Dashboard on Mobile (375x667) ---');
    await mobilePage.goto('http://localhost:3000/dashboard/school', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(600);

    const mobileDashboardCheck = await mobilePage.evaluate(() => {
      const desktopAside = document.querySelector('aside');
      const desktopAsideVisible = desktopAside ? window.getComputedStyle(desktopAside).display !== 'none' : false;
      const mobileNav = document.querySelector('.md\\:hidden');
      const mobileNavVisible = mobileNav ? window.getComputedStyle(mobileNav).display !== 'none' : false;
      const hasOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

      return {
        desktopAsideVisible,
        mobileNavVisible,
        hasOverflow
      };
    });

    console.log(`Mobile: desktop aside hidden: ${!mobileDashboardCheck.desktopAsideVisible}, mobile tabs visible: ${mobileDashboardCheck.mobileNavVisible}`);
    assert(!mobileDashboardCheck.desktopAsideVisible && mobileDashboardCheck.mobileNavVisible, `On mobile, desktop sidebar is hidden and horizontal sticky tab bar is active`);
    assert(!mobileDashboardCheck.hasOverflow, `No horizontal overflow on school dashboard mobile`);

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
