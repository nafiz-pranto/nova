import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extDir = path.resolve(__dirname, '../extension');

console.log('=== RUNNING CHROME EXTENSION PRESET & DEDUPLICATION TEST ===');

async function testPreset() {
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
    let sw = context.serviceWorkers()[0];
    if (!sw) {
      sw = await context.waitForEvent('serviceworker', { timeout: 8000 });
    }
    const extUrl = sw.url();
    const extId = extUrl.split('/')[2];

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extId}/sidepanel.html`);
    await page.waitForTimeout(1000);

    console.log('  Testing PRESET mode: gyms_fitness in UK (GB)...');
    const presetResult = await page.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'START_RESEARCH',
          payload: {
            mode: 'PRESET',
            presetId: 'gyms_fitness',
            presetName: 'Gyms, Personal Trainers & Fitness Studios',
            keywords: ['CrossFit gym', 'Personal Trainer', 'Fitness Bootcamp'],
            countryCode: 'GB',
            locationName: 'United Kingdom',
            maxResults: 3,
            researchName: 'Gyms & Fitness UK'
          }
        }, (res) => {
          resolve(res);
        });
      });
    });

    console.log('✓ Preset research initiated:', presetResult?.success);

    // Wait for completion
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

      if (activeRun && (activeRun.status === 'COMPLETED' || activeRun.status === 'BLOCKED')) {
        break;
      }
    }

    if (!activeRun) {
      throw new Error('Active run missing from storage');
    }

    console.log('✓ Run status:', activeRun.status);
    console.log(`✓ Leads discovered: ${activeRun.leads.length} / ${activeRun.maxResults}`);
    console.log(`✓ Ads inspected: ${activeRun.totalAdsInspected}`);

    // Verify limit constraint
    if (activeRun.leads.length > activeRun.maxResults) {
      throw new Error(`Leads count (${activeRun.leads.length}) exceeded maxResults (${activeRun.maxResults})!`);
    }

    // Verify uniqueness (no duplicate names)
    const names = activeRun.leads.map(l => l.name.toLowerCase().trim());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      throw new Error(`Duplicate leads detected in results: ${names.join(', ')}`);
    }
    console.log('✓ Strict deduplication verified: All leads are unique entities.');

    // Verify each lead has page detection state
    for (const lead of activeRun.leads) {
      console.log(`  Lead: "${lead.name}" | Page: ${lead.facebookPageState} | Website: ${lead.websiteState} | Ads: ${lead.activeAdCount}`);
      if (!lead.facebookPageState || !lead.websiteState) {
        throw new Error(`Lead ${lead.name} missing page or website state flags`);
      }
    }

    console.log('\n=============================================');
    console.log('🎉 PRESET & DEDUPLICATION TESTS PASSED!');
    console.log('=============================================');
  } finally {
    await context.close();
  }
}

testPreset().catch((err) => {
  console.error('❌ PRESET TEST FAILED:', err);
  process.exit(1);
});
