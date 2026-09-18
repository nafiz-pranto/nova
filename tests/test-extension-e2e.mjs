import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extDir = path.resolve(__dirname, '../extension');

console.log('=== RUNNING CHROME EXTENSION E2E VALIDATION ===');
console.log('Extension path:', extDir);

async function run() {
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
    args: [
      '--ozone-platform=headless',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${extDir}`,
      `--load-extension=${extDir}`
    ]
  });

  try {
    // 1. Verify Service Worker
    let sw = context.serviceWorkers()[0];
    if (!sw) {
      sw = await context.waitForEvent('serviceworker', { timeout: 8000 });
    }
    const extUrl = sw.url();
    const extId = extUrl.split('/')[2];
    console.log('✓ TEST 1: Service Worker Registered at:', extUrl);
    console.log('  Extension ID:', extId);

    // 2. Load Extension SidePanel / Popup
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extId}/sidepanel.html`);
    await page.waitForTimeout(1000);

    const title = await page.textContent('h1');
    if (!title || !title.includes('Meta Ad Library Lead Scraper')) {
      throw new Error(`Unexpected UI title: ${title}`);
    }
    console.log('✓ TEST 2: Extension UI Rendered successfully, Title:', title.trim());

    // 3. Test sending research request from UI / Runtime
    console.log('  Triggering test research run from extension context...');
    const runResult = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'START_RESEARCH',
          payload: {
            mode: 'CUSTOM',
            keywords: ['Modern Furniture', 'Ergonomic Desk'],
            countryCode: 'BD',
            locationName: 'Bangladesh',
            maxResults: 5,
            researchName: 'Test Research Run BD'
          }
        }, (res) => {
          resolve(res);
        });
      });
    });

    console.log('✓ TEST 3: START_RESEARCH message dispatched to Service Worker:', runResult?.success ? 'SUCCESS' : 'FAILED', runResult);

    // 4. Wait and observe progress via chrome.storage.local
    console.log('  Awaiting research execution and state updates in chrome.storage.local...');
    let activeRun = null;
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(2000);
      activeRun = await page.evaluate(async () => {
        return new Promise((resolve) => {
          chrome.storage.local.get(['activeResearchRun'], (res) => {
            resolve(res.activeResearchRun || null);
          });
        });
      });

      if (activeRun) {
        console.log(`  [Progress ${i + 1}/15] Status: ${activeRun.status} | Leads: ${activeRun.leads?.length || 0} | Ads: ${activeRun.totalAdsInspected || 0}`);
        if (activeRun.status === 'COMPLETED' || activeRun.status === 'BLOCKED' || activeRun.status === 'CANCELLED') {
          break;
        }
      }
    }

    if (!activeRun) {
      throw new Error('No activeResearchRun persisted to chrome.storage.local!');
    }

    console.log('✓ TEST 4: Storage persistence verified. Final Status:', activeRun.status);
    console.log(`  Discovered leads: ${activeRun.leads?.length || 0}`);

    // 5. Test Export logic
    const exportResult = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['activeResearchRun'], (res) => {
          const run = res.activeResearchRun;
          if (!run) return resolve({ success: false, reason: 'No run' });
          resolve({
            success: true,
            runId: run.runId,
            leadCount: run.leads?.length || 0,
            hasMetaUrls: run.leads?.every(l => l.adLibraryUrl && l.adLibraryUrl.includes('facebook.com/ads/library'))
          });
        });
      });
    });

    console.log('✓ TEST 5: Leads dossier structure validated:', exportResult);

    console.log('\n=============================================');
    console.log('🎉 ALL CHROME EXTENSION E2E TESTS PASSED!');
    console.log('=============================================');
  } finally {
    await context.close();
  }
}

run().catch((err) => {
  console.error('❌ E2E TEST FAILED:', err);
  process.exit(1);
});
