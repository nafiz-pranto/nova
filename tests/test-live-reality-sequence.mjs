import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { exportLeadsToCsv } from '../src/extension/metaAdapter.ts';

console.log('================================================================');
console.log('MASTER PROMPT 44 — FINAL LIVE REALITY TEST (5 → 10 → 25 → 50 → 100 → 500)');
console.log('REAL CHROME EXTENSION + REAL META AD LIBRARY + REAL DATA ONLY');
console.log('================================================================');

const extPath = path.resolve('./extension');

async function runRealityTestSequence() {
  const browserContext = await chromium.launchPersistentContext('', {
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

  // 1. Verify Service Worker
  let serviceWorker = null;
  for (const sw of browserContext.serviceWorkers()) {
    if (sw.url().includes('chrome-extension://')) {
      serviceWorker = sw;
      break;
    }
  }
  if (!serviceWorker) {
    serviceWorker = await browserContext.waitForEvent('serviceworker', { timeout: 10000 });
  }

  const extId = new URL(serviceWorker.url()).hostname;
  console.log(`[REALITY TEST SETUP] Extension loaded successfully with ID: ${extId}`);

  // Open extension sidepanel UI
  const panelPage = await browserContext.newPage();
  await panelPage.goto(`chrome-extension://${extId}/sidepanel.html`);
  await panelPage.waitForSelector('text=LeadNoria', { timeout: 8000 });
  console.log('[REALITY TEST SETUP] Extension Sidepanel UI active and responsive');

  const stagedQuotas = [5, 10, 25, 50, 100, 500];
  const stageResults = [];

  for (const quota of stagedQuotas) {
    console.log(`\n================================================================`);
    console.log(`>>> EXECUTING LIVE STAGE: QUOTA = ${quota} LEADS <<<`);
    console.log(`Query: "Furniture" | Location: BD (Bangladesh)`);
    console.log(`================================================================`);

    const stageStart = Date.now();
    const searchUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q=Furniture`;

    // Dispatch START_RESEARCH via extension runtime message
    const startRes = await panelPage.evaluate(async (maxResults) => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'START_RESEARCH',
          payload: {
            mode: 'CUSTOM',
            keywords: ['Furniture'],
            countryCode: 'BD',
            locationName: 'Bangladesh',
            maxResults,
            researchName: `Live Stage ${maxResults}: Furniture in Bangladesh`
          }
        }, (res) => resolve(res));
      });
    }, quota);

    console.log(`[Stage ${quota}] Start Response:`, JSON.stringify(startRes));

    // Monitor live progress until completion
    let completed = false;
    let finalState = null;
    const maxPolls = quota <= 25 ? 40 : quota <= 100 ? 60 : 80;

    for (let poll = 0; poll < maxPolls; poll++) {
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
        const elapsed = ((Date.now() - stageStart) / 1000).toFixed(1);
        if (poll % 3 === 0 || state.status === 'COMPLETED' || state.status === 'BLOCKED') {
          console.log(
            `[Stage ${quota} @ ${elapsed}s] Status: ${state.status} | StopReason: ${state.stopReason || 'none'} | Raw Ads: ${state.totalAdsInspected || 0} | Leads: ${state.leads?.length || 0} | Irrelevant: ${state.rejectedLeadsCount || 0}`
          );
        }

        if (state.status === 'COMPLETED' || state.status === 'PARTIAL' || state.status === 'FAILED' || state.status === 'BLOCKED' || state.status === 'CANCELLED' || state.status === 'RATE_LIMITED' || state.status === 'CHALLENGED') {
          completed = true;
          break;
        }
      }
    }

    const stageElapsed = ((Date.now() - stageStart) / 1000).toFixed(1);
    const finalLeads = finalState?.leads || [];
    const totalAds = finalState?.totalAdsInspected || 0;
    const rejectedCount = finalState?.rejectedLeadsCount || 0;
    const uncertainCount = finalState?.uncertainLeadsCount || 0;
    const stopReason = finalState?.stopReason || (finalState?.status === 'COMPLETED' ? (finalLeads.length >= quota ? 'TARGET_REACHED' : 'SOURCE_EXHAUSTED') : finalState?.status);

    // Determine status
    let stageStatus = 'FAIL';
    if (finalState?.status === 'BLOCKED') {
      stageStatus = 'BLOCKED';
    } else if (finalLeads.length >= quota) {
      stageStatus = 'PASS';
    } else if (finalLeads.length > 0 && (stopReason === 'SOURCE_EXHAUSTED' || stopReason === 'NO_NEW_RESULTS' || finalState?.status === 'PARTIAL')) {
      stageStatus = 'PARTIAL';
    }

    const stageSummary = {
      test: `Live ${quota}`,
      requested: quota,
      final: finalLeads.length,
      rawAds: totalAds,
      relevant: finalLeads.length,
      irrelevant: rejectedCount,
      uncertain: uncertainCount,
      duplicates: Math.max(0, totalAds - rejectedCount - uncertainCount - finalLeads.length),
      stopReason,
      status: stageStatus,
      elapsed: `${stageElapsed}s`,
      searchUrl,
      leadsSample: finalLeads.slice(0, 5).map(l => ({
        name: l.name,
        activeAds: l.activeAdCount,
        website: l.destinationUrl || 'not_found',
        websiteState: l.websiteState,
        pageUrl: l.facebookPageUrl || 'not_found',
        pageState: l.facebookPageState,
        relevanceDecision: l.relevanceDecision,
        relevanceScore: l.relevanceScore,
        confidence: l.relevanceConfidence
      }))
    };

    stageResults.push(stageSummary);

    console.log(`\n[Stage ${quota} SUMMARY]:`);
    console.log(`Requested: ${quota} | Final Unique Relevant Leads: ${finalLeads.length} | Raw Ads: ${totalAds} | Irrelevant Filtered: ${rejectedCount} | Stop Reason: ${stopReason} | Status: ${stageStatus} | Elapsed: ${stageElapsed}s`);

    // Verify CSV export for stage
    const csvContent = exportLeadsToCsv(finalLeads);
    const csvLines = csvContent.trim().split('\n');
    console.log(`[Stage ${quota} EXPORT CHECK] CSV lines: ${csvLines.length} (header + ${csvLines.length - 1} data rows)`);

    // Small pause between stages to let tabs settle
    await panelPage.waitForTimeout(3000);
  }

  await browserContext.close();

  console.log('\n\n================================================================');
  console.log('FINAL LIVE REALITY TEST SEQUENCE RESULTS TABLE:');
  console.log('================================================================');
  console.log('| Test | Requested | Final | Raw Ads | Relevant | Irrelevant | Uncertain | Stop Reason | Status | Elapsed |');
  console.log('|------|-----------|-------|---------|----------|------------|-----------|-------------|--------|---------|');
  for (const r of stageResults) {
    console.log(`| ${r.test} | ${r.requested} | ${r.final} | ${r.rawAds} | ${r.relevant} | ${r.irrelevant} | ${r.uncertain} | ${r.stopReason} | ${r.status} | ${r.elapsed} |`);
  }

  // Write results JSON to disk for audit
  fs.writeFileSync('tests/live-reality-test-results.json', JSON.stringify(stageResults, null, 2));
  console.log('\n[Saved full audit results to tests/live-reality-test-results.json]');
}

runRealityTestSequence().catch(err => {
  console.error('Fatal reality test error:', err);
  process.exit(1);
});
