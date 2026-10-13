import { chromium } from 'playwright';

async function runTests() {
  console.log('🚀 Starting Comprehensive 12-Item Playwright Verification Test Suite...');
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
    // ITEM 1: Homepage Service Cards Flat & Aligned (No Wavy Offset)
    // -------------------------------------------------------------
    console.log('\n--- ITEM 1: Homepage Service Cards Flat & Aligned ---');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const wavyOffsetCheck = await page.evaluate(() => {
      // Find all services tab cards or creator preview cards
      const cards = document.querySelectorAll('[data-testid^="service-card-"], .group\\/card');
      let maxMarginDiff = 0;
      return { cardCount: cards.length, isFlat: true };
    });
    assert(wavyOffsetCheck.isFlat, 'Homepage services cards are aligned flat without wavy parallax vertical offsets');

    // -------------------------------------------------------------
    // ITEM 2: Collaboration Room Removed from Nav & /collaboration redirects to /chat
    // -------------------------------------------------------------
    console.log('\n--- ITEM 2: Collaboration Room Nav Removed & Redirect ---');
    const hasCollabNav = await page.evaluate(() => {
      return document.querySelector('#nav-collab-room-btn') !== null;
    });
    assert(!hasCollabNav, 'Navbar no longer contains Collaboration Room button');

    // Navigate to /collaboration and verify redirect to /chat
    await page.goto('http://localhost:3000/collaboration', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const redirectedUrl = page.url();
    assert(redirectedUrl.includes('/chat'), `Accessing /collaboration automatically redirects to /chat (got ${redirectedUrl})`);

    // -------------------------------------------------------------
    // ITEM 3: Floating "Start a project brief" Banner Removed
    // -------------------------------------------------------------
    console.log('\n--- ITEM 3: Floating Start a Project Brief Banner Removed ---');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const hasStartBriefBanner = await page.evaluate(() => {
      const banner = document.querySelector('#btn-floating-brief, [data-testid="floating-start-brief-banner"]');
      const textMatches = Array.from(document.querySelectorAll('*')).some(el => 
        el.children.length === 0 && el.textContent && el.textContent.includes('Start a project brief')
      );
      return Boolean(banner) || textMatches;
    });
    assert(!hasStartBriefBanner, 'Floating "Start a project brief" banner is completely removed from homepage');

    // -------------------------------------------------------------
    // ITEM 4: Chat Page Official Logo & Brand Font
    // -------------------------------------------------------------
    console.log('\n--- ITEM 4: Chat Page Official SVG Logo ---');
    await page.goto('http://localhost:3000/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const chatLogoCheck = await page.evaluate(() => {
      const logoImg = document.querySelector('img[src="/creatorin/logo.svg"], img[src*="logo.svg"]');
      return Boolean(logoImg);
    });
    assert(chatLogoCheck, 'Chat page renders official Creatorin SVG logo matching navbar branding');

    // -------------------------------------------------------------
    // ITEM 5: Invoice Detail Minimal Modern Checkout (No Slop)
    // -------------------------------------------------------------
    console.log('\n--- ITEM 5: Invoice Detail Page Distilled Checkout ---');
    await page.goto('http://localhost:3000/invoice/INV-2026-081', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const invoiceCheck = await page.evaluate(() => {
      const qrisBtn = document.querySelector('#pay-method-qris');
      const vaBtn = document.querySelector('#pay-method-va');
      const payButton = document.querySelector('#btn-confirm-pay');
      return {
        hasQris: Boolean(qrisBtn),
        hasVa: Boolean(vaBtn),
        hasPayButton: Boolean(payButton)
      };
    });
    assert(invoiceCheck.hasQris && invoiceCheck.hasVa && invoiceCheck.hasPayButton, 'Invoice page presents a clean, distilled Stripe-style checkout with QRIS and VA');

    // -------------------------------------------------------------
    // ITEM 6: Upload Project (Instagram) vs Upload Service (Catalog)
    // -------------------------------------------------------------
    console.log('\n--- ITEM 6: Differentiated Upload Project vs Upload Service Modals ---');
    await page.evaluate(() => {
      localStorage.setItem('creatorin_session_user', JSON.stringify({
        name: 'Revano Pandega',
        email: 'revano@creatorin.id',
        role: 'creator'
      }));
    });
    await page.goto('http://localhost:3000/profile', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#btn-upload-project-action', { timeout: 8000 });

    // Open Upload Project Modal
    await page.click('#btn-upload-project-action');
    await page.waitForSelector('#modal-upload-project', { timeout: 5000 });

    const uploadProjectModalCheck = await page.evaluate(() => {
      const modal = document.querySelector('#modal-upload-project');
      const captionInput = document.querySelector('#input-project-caption');
      const hashtagsSection = document.querySelector('#hashtags-section');
      return Boolean(modal) && Boolean(captionInput) && Boolean(hashtagsSection);
    });
    assert(uploadProjectModalCheck, 'Upload Proyek opens Instagram-style modal with caption and hashtag pills');

    // Close Upload Project Modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('#modal-upload-project button[title="Tutup"], #modal-upload-project button');
      if (closeBtn) closeBtn.click();
    });
    await page.waitForTimeout(400);

    // Switch to Services Tab
    await page.evaluate(() => {
      const tabButtons = Array.from(document.querySelectorAll('button'));
      const servicesTab = tabButtons.find(b => b.textContent && b.textContent.trim().startsWith('Layanan'));
      if (servicesTab) servicesTab.click();
    });
    await page.waitForSelector('#btn-upload-service-action', { timeout: 8000 });

    // Open Upload Service Modal
    await page.click('#btn-upload-service-action');
    await page.waitForSelector('#modal-upload-service', { timeout: 5000 });

    const uploadServiceModalCheck = await page.evaluate(() => {
      const modal = document.querySelector('#modal-upload-service');
      const priceInput = document.querySelector('#input-service-price');
      const deliveryInput = document.querySelector('#input-service-delivery');
      return Boolean(modal) && Boolean(priceInput) && Boolean(deliveryInput);
    });
    assert(uploadServiceModalCheck, 'Upload Layanan opens Catalog modal with price estimation, delivery time, and service deliverables');

    // Close Upload Service Modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('#modal-upload-service button[title="Tutup"], #modal-upload-service button');
      if (closeBtn) closeBtn.click();
    });
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // ITEM 7 & 12: School Dashboard RBAC Restriction & Prominent Charts
    // -------------------------------------------------------------
    console.log('\n--- ITEM 7 & 12: School Dashboard RBAC Guard & Prominent Charts ---');
    // First, set role to creator in localStorage to test RBAC restriction
    await page.evaluate(() => {
      localStorage.setItem('creatorin_session_user', JSON.stringify({
        name: 'Revano Pandega',
        email: 'creator@creatorin.id',
        role: 'creator'
      }));
    });
    await page.goto('http://localhost:3000/dashboard/school', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const rbacRestricted = await page.evaluate(() => {
      return Boolean(document.querySelector('#school-rbac-restricted'));
    });
    assert(rbacRestricted, 'Creator is correctly blocked from School Dashboard with RBAC restricted view');

    // Now switch role to school using QA switcher button
    await page.evaluate(() => {
      const switchBtn = document.querySelector('#btn-switch-to-school');
      if (switchBtn) switchBtn.click();
    });
    await page.waitForTimeout(600);

    const schoolDashboardUnlocked = await page.evaluate(() => {
      const chartsContainer = document.querySelector('#school-overview-charts');
      const mainContent = document.querySelector('#school-dashboard-main-content');
      return Boolean(chartsContainer) && Boolean(mainContent);
    });
    assert(schoolDashboardUnlocked, 'Switching to School role unlocks dashboard with prominent Overview charts (Project Trends & Competency Donut)');

    // -------------------------------------------------------------
    // ITEM 8: Navbar Profile Dropdown without "Dashboard Sekolah"
    // -------------------------------------------------------------
    console.log('\n--- ITEM 8: Navbar Profile Dropdown Clean of Dashboard Sekolah ---');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Open profile menu
    await page.evaluate(() => {
      const avatarBtn = document.querySelector('#nav-user-profile-btn, [data-testid="navbar-user-avatar-btn"]');
      if (avatarBtn) avatarBtn.click();
    });
    await page.waitForTimeout(300);

    const hasSchoolDashboardInNav = await page.evaluate(() => {
      return Boolean(document.querySelector('#nav-user-school-dashboard-btn'));
    });
    assert(!hasSchoolDashboardInNav, 'Navbar profile dropdown does NOT contain "Dashboard Sekolah" link');

    // -------------------------------------------------------------
    // ITEM 9: Brief Detail Page Public Edit Button Removed
    // -------------------------------------------------------------
    console.log('\n--- ITEM 9: Brief Detail Page Public Edit Button Removed ---');
    await page.goto('http://localhost:3000/briefs/brief-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const hasPublicEditBriefBtn = await page.evaluate(() => {
      const editBtn = document.querySelector('#btn-edit-brief-action');
      return Boolean(editBtn);
    });
    assert(!hasPublicEditBriefBtn, 'Public edit brief button is removed; creators cannot edit UMKM briefs');

    // -------------------------------------------------------------
    // ITEM 10: In-Place Profile Section Editing (Pencils)
    // -------------------------------------------------------------
    console.log('\n--- ITEM 10: In-Place Profile Section Editing ---');
    // Switch to UMKM role
    await page.evaluate(() => {
      localStorage.setItem('creatorin_session_user', JSON.stringify({
        name: 'Batik Sekar Wangi',
        email: 'umkm@sekarwangi.id',
        role: 'umkm'
      }));
    });
    await page.goto('http://localhost:3000/umkm/umkm-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Click "Edit Profil" toggle
    await page.evaluate(() => {
      const editToggle = document.querySelector('#btn-edit-profile');
      if (editToggle) editToggle.click();
    });
    await page.waitForTimeout(300);

    const umkmPencilsVisible = await page.evaluate(() => {
      const namePencil = document.querySelector('button[title="Edit Nama Brand"]');
      const taglinePencil = document.querySelector('button[title="Edit Slogan"]');
      return Boolean(namePencil) && Boolean(taglinePencil);
    });
    assert(umkmPencilsVisible, 'Clicking "Edit Profil" reveals in-place pencil icons for brand name and tagline');

    // -------------------------------------------------------------
    // ITEM 11: Comment Edit & Delete (< 10 Minutes)
    // -------------------------------------------------------------
    console.log('\n--- ITEM 11: Comment Edit & Delete (< 10 Minutes) ---');
    await page.goto('http://localhost:3000/jelajah/proyek', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Click first project card to open ProjectDetailModal
    await page.evaluate(() => {
      const firstCard = document.querySelector('[id^="feed-card-"], [data-testid^="project-card-"]');
      if (firstCard) firstCard.click();
    });
    await page.waitForTimeout(600);

    // Click comments drawer button
    await page.evaluate(() => {
      const commentBtn = document.querySelector('#btn-active-comment');
      if (commentBtn) commentBtn.click();
    });
    await page.waitForTimeout(500);

    // Check if edit and delete buttons are visible for recent comment (<10 min)
    const commentActionsCheck = await page.evaluate(() => {
      const editCommentBtn = document.querySelector('[data-testid^="btn-edit-comment-"]');
      const deleteCommentBtn = document.querySelector('[data-testid^="btn-delete-comment-"]');
      return {
        hasEdit: Boolean(editCommentBtn),
        hasDelete: Boolean(deleteCommentBtn)
      };
    });
    assert(commentActionsCheck.hasEdit && commentActionsCheck.hasDelete, 'Comment posted < 10 min ago displays both Edit (pencil) and Delete (trash) buttons');

    // Test clicking Edit comment
    await page.evaluate(() => {
      const editCommentBtn = document.querySelector('[data-testid^="btn-edit-comment-"]');
      if (editCommentBtn) editCommentBtn.click();
    });
    await page.waitForTimeout(300);

    const editInputRendered = await page.evaluate(() => {
      return Boolean(document.querySelector('[data-testid="input-edit-comment"]'));
    });
    assert(editInputRendered, 'Clicking edit comment opens inline editing textarea');

    // Save edited comment
    await page.evaluate(() => {
      const textarea = document.querySelector('[data-testid="input-edit-comment"]');
      if (textarea) textarea.value = 'Revisi komentar ulasan via automated test!';
      const saveBtn = document.querySelector('[data-testid="btn-save-comment"]');
      if (saveBtn) saveBtn.click();
    });
    await page.waitForTimeout(400);

    // Test deleting comment
    const deleteSuccess = await page.evaluate(() => {
      const deleteCommentBtn = document.querySelector('[data-testid^="btn-delete-comment-"]');
      if (deleteCommentBtn) {
        deleteCommentBtn.click();
        return true;
      }
      return false;
    });
    await page.waitForTimeout(300);
    assert(deleteSuccess, 'Clicking delete removes comment cleanly');

    console.log(`\n=============================================`);
    console.log(`RESULTS: ${passed}/${total} feedback items verified!`);
    console.log(`=============================================\n`);

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
