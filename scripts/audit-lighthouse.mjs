#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const reportsDir = path.join(rootDir, 'lighthouse-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const args = process.argv.slice(2);
const modeArg = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'all';
const urlArg = args.find(a => a.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000/';

const configs = [];
if (modeArg === 'all' || modeArg === 'desktop') {
  configs.push({
    name: 'Desktop',
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
  });
}

if (modeArg === 'all' || modeArg === 'mobile') {
  configs.push({
    name: 'Mobile',
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 823,
      deviceScaleFactor: 1.75,
      disabled: false,
    },
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
  });
}

console.log('===============================================================');
console.log('⚡ CREATORIN LIGHTHOUSE SPEED, ACCESSIBILITY, BEST-PRACTICES & SEO');
console.log(`🎯 Target URL  : ${urlArg}`);
console.log(`🖥️  Modes       : ${configs.map(c => c.name).join(', ')}`);
console.log('===============================================================\n');

let allPassed = true;
const summary = [];

for (const config of configs) {
  console.log(`🚀 Launching Playwright Chromium for ${config.name} audit...`);
  const port = 9222;
  const browser = await chromium.launch({
    headless: true,
    args: [`--remote-debugging-port=${port}`, '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    const flags = {
      port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: config.formFactor,
      screenEmulation: config.screenEmulation,
      throttling: config.throttling,
      logLevel: 'error',
    };

    console.log(`⏱️  Running Lighthouse audit on ${urlArg} [${config.name}]...`);
    const runnerResult = await lighthouse(urlArg, flags);
    const lhr = runnerResult.lhr;

    const outputPath = path.join(reportsDir, `lighthouse-${config.name.toLowerCase()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(lhr, null, 2));

    const categories = lhr.categories || {};
    const scores = {
      Mode: config.name,
      Performance: Math.round((categories.performance?.score || 0) * 100),
      Accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      BestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      SEO: Math.round((categories.seo?.score || 0) * 100),
      FCP: lhr.audits['first-contentful-paint']?.displayValue || 'N/A',
      LCP: lhr.audits['largest-contentful-paint']?.displayValue || 'N/A',
      TBT: lhr.audits['total-blocking-time']?.displayValue || 'N/A',
      CLS: lhr.audits['cumulative-layout-shift']?.displayValue || 'N/A',
    };

    summary.push(scores);

    console.log(`\n📊 [${config.name.toUpperCase()}] AUDIT SCORES:`);
    console.log(`  • Performance   : ${scores.Performance >= 95 ? '🟢' : scores.Performance >= 80 ? '🟡' : '🔴'} ${scores.Performance}/100 (FCP: ${scores.FCP}, LCP: ${scores.LCP}, TBT: ${scores.TBT}, CLS: ${scores.CLS})`);
    console.log(`  • Accessibility : ${scores.Accessibility >= 95 ? '🟢' : scores.Accessibility >= 80 ? '🟡' : '🔴'} ${scores.Accessibility}/100`);
    console.log(`  • Best Practices: ${scores.BestPractices >= 95 ? '🟢' : scores.BestPractices >= 80 ? '🟡' : '🔴'} ${scores.BestPractices}/100`);
    console.log(`  • SEO           : ${scores.SEO >= 95 ? '🟢' : scores.SEO >= 80 ? '🟡' : '🔴'} ${scores.SEO}/100\n`);

    // Top improvements if any category < 95
    const failedAudits = Object.values(lhr.audits || {})
      .filter(a => a.score !== null && a.score < 0.9 && a.title && a.scoreDisplayMode !== 'notApplicable' && a.scoreDisplayMode !== 'informative')
      .slice(0, 5);

    if (failedAudits.length > 0 && (scores.Performance < 95 || scores.Accessibility < 95 || scores.SEO < 95)) {
      console.log(`  ⚠️ Top Improvement Opportunities for ${config.name}:`);
      for (const audit of failedAudits) {
        console.log(`    - [${audit.title}]: ${audit.displayValue || (audit.score * 100) + '%'}`);
      }
      console.log('');
    }

    if (scores.Performance < 80 || scores.SEO < 90) {
      allPassed = false;
    }
  } catch (err) {
    console.error(`❌ Audit error for ${config.name}:`, err);
    allPassed = false;
  } finally {
    await browser.close();
  }
}

console.log('===============================================================');
console.log('📋 AUDIT SUMMARY TABLE');
console.log('===============================================================');
console.table(summary);

if (allPassed) {
  console.log('\n🎉 ALL LIGHTHOUSE BENCHMARK TARGETS SATISFIED!');
  process.exit(0);
} else {
  console.log('\n⚡ Notice: Some benchmarks need optimization.');
  process.exit(1);
}
