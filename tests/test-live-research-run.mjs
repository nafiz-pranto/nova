import { chromium } from 'playwright';
import path from 'path';

async function runLiveTest() {
  console.log('====================================================');
  console.log('MASTER PROMPT 41: LIVE META AD LIBRARY SCRAPER AUDIT');
  console.log('====================================================');

  const extPath = path.resolve('./extension');
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
    args: [
      '--ozone-platform=headless',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`
    ]
  });

  // 1. Locate Service Worker
  let serviceWorker = null;
  for (const sw of context.serviceWorkers()) {
    if (sw.url().includes('chrome-extension://')) {
      serviceWorker = sw;
      break;
    }
  }

  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker', { timeout: 10000 });
  }

  const extId = new URL(serviceWorker.url()).hostname;
  console.log(`[Extension ID]: ${extId}`);

  // 2. Open Extension Sidepanel
  const panelPage = await context.newPage();
  await panelPage.goto(`chrome-extension://${extId}/sidepanel.html`);
  await panelPage.waitForTimeout(1500);

  // 3. Initiate Live Research Run: "Furniture" in Bangladesh (BD), max 5 leads
  console.log('\n[Initiating Live Research Run]...');
  console.log('Query: "Furniture" | Location: BD (Bangladesh) | Max Leads: 5');

  const startResponse = await panelPage.evaluate(async () => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'START_RESEARCH',
        payload: {
          mode: 'CUSTOM',
          keywords: ['Furniture'],
          countryCode: 'BD',
          locationName: 'Bangladesh',
          maxResults: 5,
          researchName: 'Live Audit: Furniture in BD'
        }
      }, (res) => resolve(res));
    });
  });

  console.log('Start Response:', JSON.stringify(startResponse));

  // 4. Monitor Progress for up to 60 seconds
  console.log('\n[Monitoring Live Scraper Pipeline Execution]...');
  let completed = false;
  let finalState = null;
  const startTime = Date.now();

  for (let poll = 0; poll < 30; poll++) {
    await panelPage.waitForTimeout(2000);
    const state = await panelPage.evaluate(async () => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['activeResearchRun'], (res) => {
          resolve(res.activeResearchRun);
        });
      });
    });

    if (state) {
      finalState = state;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(
        `[${elapsed}s] Status: ${state.status} | StopReason: ${state.stopReason || 'none'} | Leads: ${state.leads?.length || 0} | Ads: ${state.totalAdsInspected || 0}`
      );

      if (state.status === 'COMPLETED' || state.status === 'FAILED' || state.status === 'BLOCKED' || state.status === 'CANCELLED') {
        completed = true;
        break;
      }
    }
  }

  console.log('\n[Final Run Outcome]:');
  console.log(`Final Status: ${finalState?.status}`);
  console.log(`Stop Reason: ${finalState?.stopReason}`);
  console.log(`Total Ads Inspected: ${finalState?.totalAdsInspected}`);
  console.log(`Total Leads Produced: ${finalState?.leads?.length}`);

  if (finalState?.leads && finalState.leads.length > 0) {
    console.log('\n[Extracted Live Leads Summary]:');
    finalState.leads.forEach((lead, i) => {
      console.log(`\n--- Lead ${i + 1} ---`);
      console.log(`Name: ${lead.name}`);
      console.log(`Page: ${lead.facebookPageUrl || 'not_found'} (${lead.facebookPageState})`);
      console.log(`Website: ${lead.destinationUrl || 'not_found'} (${lead.websiteState})`);
      console.log(`Domain: ${lead.destinationDomain || 'none'}`);
      console.log(`Active Ads: ${lead.activeAdCount}`);
      console.log(`Ad Library IDs: ${lead.adLibraryIds?.join(', ')}`);
      console.log(`Sample Copy: ${lead.sampleCopy?.substring(0, 100) || 'none'}`);
    });
  }

  await context.close();
}

runLiveTest().catch(err => {
  console.error('Fatal live test error:', err);
  process.exit(1);
});
