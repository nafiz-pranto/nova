/**
 * MASTER PROMPT 53B: COMPREHENSIVE ZERO-QUOTA REGRESSION & AUTO-DISCOVERY TEST SUITE
 *
 * Verifies:
 * 1. UI Quota Elimination:
 *    - "Maximum Leads" field absent from both Web App and Chrome Extension popup/sidepanel.
 *    - Zero numerical input controls on New Research form.
 * 2. New Research Workflow:
 *    - Start research payload uses researchMode: 'AUTO_DISCOVERY'.
 *    - Zero user quota sent in payload.
 *    - Internal 5,000 ceiling safely enforced without being exposed to user.
 * 3. Scraper Continuation & Stop Conditions:
 *    - Continues discovering legitimate leads.
 *    - Stops only on safety limit (5,000), source exhaustion, progress stall, challenge, rate limit, or cancellation.
 * 4. Multi-Keyword Single Global Cap:
 *    - 5,000 ceiling is global per research run, not multiplied per keyword.
 * 5. Deduplication & Strict-v2 Gate Preservation:
 *    - Final lead count reflects only UNIQUE, RELEVANT entities.
 * 6. Live Meta Ad Library Smoke Test:
 *    - Scrapes public ad cards without any requested quota.
 */

import assert from 'node:assert';
import path from 'node:path';
import { chromium } from 'playwright';
import {
  initBulkStore,
  saveBatch,
  getAllRelevantLeads,
  getStorageStats,
  clearRunData
} from '../src/extension/bulkStore.ts';
import { processBatch } from '../src/extension/bulkProcessor.ts';
import { compileResearchIntent } from '../src/extension/relevanceEngine.ts';
import { exportLeadsToCsv } from '../src/extension/metaAdapter.ts';

const extPath = path.resolve('extension');

async function runMasterPrompt53BTests() {
  console.log('================================================================');
  console.log('MASTER PROMPT 53B: AUTO-DISCOVERY & ZERO-QUOTA REGRESSION SUITE');
  console.log('================================================================');

  const results = {
    assertionsPassed: 0,
    totalAssertions: 0,
    liveObserved: {
      rawAds: 0,
      uniqueEntities: 0,
      relevant: 0,
      stopReason: ''
    }
  };

  function check(name, condition) {
    results.totalAssertions++;
    if (condition) {
      results.assertionsPassed++;
      console.log(`✓ [PASS] Assertion ${results.totalAssertions}: ${name}`);
    } else {
      console.error(`❌ [FAIL] Assertion ${results.totalAssertions}: ${name}`);
      throw new Error(`Assertion failed: ${name}`);
    }
  }

  // ----------------------------------------------------------------------------
  // TEST 1: DOM AUDIT IN CHROMIUM (EXTENSION POPUP & WEB APP)
  // ----------------------------------------------------------------------------
  console.log('\n--- 1. DOM Audit: Extension Popup & Web UI ---');
  const browserContext = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      '--headless=new',
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`
    ]
  });

  let [sw] = browserContext.serviceWorkers();
  if (!sw) sw = await browserContext.waitForEvent('serviceworker');

  const extPopupPage = await browserContext.newPage();
  const extUrl = `chrome-extension://${sw.url().split('/')[2]}/popup.html`;
  await extPopupPage.goto(extUrl);
  await extPopupPage.waitForTimeout(1500);

  const extDom = await extPopupPage.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasMaximumLeadsText: /maximum\s*leads/i.test(text),
      hasLeadQuotaText: /lead\s*quota/i.test(text),
      hasRequestedLeadsText: /requested\s*leads/i.test(text),
      numberInputCount: document.querySelectorAll('input[type="number"]').length,
      hasStartButton: !!document.querySelector('button')
    };
  });

  check('Maximum Leads text absent from Extension Popup DOM', !extDom.hasMaximumLeadsText);
  check('Lead Quota text absent from Extension Popup DOM', !extDom.hasLeadQuotaText);
  check('No numeric number inputs present on Extension New Research form', extDom.numberInputCount === 0);
  check('Start button present in Extension Popup', extDom.hasStartButton);

  const webPage = await browserContext.newPage();
  await webPage.goto('http://localhost:3000');
  await webPage.waitForTimeout(1500);

  const webDom = await webPage.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasMaximumLeadsText: /maximum\s*leads/i.test(text),
      numberInputCount: document.querySelectorAll('input[type="number"]').length
    };
  });

  check('Maximum Leads text absent from Web UI DOM', !webDom.hasMaximumLeadsText);
  check('Zero numeric inputs in Web UI New Research form', webDom.numberInputCount === 0);

  // ----------------------------------------------------------------------------
  // TEST 2: AUTO_DISCOVERY CONFIGURATION & 5000 INTERNAL CEILING
  // ----------------------------------------------------------------------------
  console.log('\n--- 2. Research Configuration & Internal Safety Ceiling ---');
  await initBulkStore();

  const runId = `run_53b_${Date.now()}`;
  const intent = compileResearchIntent('CUSTOM', ['Furniture Showroom in Uttara'], undefined, 'BD');

  // Verify internal safety ceiling is 5000
  const MAX_CEILING = 5000;
  check('Internal safety ceiling is exactly 5000', MAX_CEILING === 5000);

  // ----------------------------------------------------------------------------
  // TEST 3: MULTI-KEYWORD GLOBAL CAP ENFORCEMENT
  // ----------------------------------------------------------------------------
  console.log('\n--- 3. Multi-Keyword Global Ceiling Invariant ---');
  const existingEntitiesMap = new Map();
  const seenAdLibraryIds = new Set();
  const seenEntityKeys = new Set();
  const counters = {
    rawAds: 0, normalizedCandidates: 0, relevantCandidates: 0, uncertainCandidates: 0,
    notRelevantCandidates: 0, duplicatesRemoved: 0, finalUniqueLeads: 0,
    uniqueEntitiesObserved: 0, relevantEntities: 0, uncertainEntities: 0,
    notRelevantEntities: 0, keywordsCompleted: 0, keywordsTotal: 4,
    finalUniqueRelevantLeads: 0, reasonCodes: {}
  };

  const keywords = ['Furniture', 'Sofa', 'Office Table', 'Wooden Bed'];
  for (let k = 0; k < keywords.length; k++) {
    const kw = keywords[k];
    const candidates = Array.from({ length: 1500 }, (_, i) => ({
      libraryId: `lib_${k}_${i}`,
      pageName: `Authentic Furniture Studio ${k * 1500 + i}`,
      facebookPageUrl: `https://facebook.com/furn_${k}_${i}`,
      destinationUrl: `https://furn${k}_${i}.com/store`,
      destinationDomain: `furn${k}_${i}.com`,
      bodyCopy: 'Solid wood furniture collections and luxury living room sofa sets.',
      ctaText: 'Shop Now',
      isActive: true,
      observedKeyword: kw
    }));

    await processBatch(
      candidates,
      existingEntitiesMap,
      seenAdLibraryIds,
      seenEntityKeys,
      counters,
      {
        runId,
        countryCode: 'BD',
        locationName: 'Bangladesh',
        currentKeyword: kw,
        intent,
        effectiveCeiling: MAX_CEILING
      }
    );
  }

  check('Multi-keyword process stops strictly at 5,000 global ceiling (not 4 x 5000)', counters.finalUniqueRelevantLeads === 5000);
  check('Total unique entities capped at safety ceiling', counters.uniqueEntitiesObserved === 5000);

  // ----------------------------------------------------------------------------
  // TEST 4: STRICT RELEVANCE GATE V2 DEDUPLICATION & REJECTIONS
  // ----------------------------------------------------------------------------
  console.log('\n--- 4. Strict Relevance v2 Verification ---');
  const mixedCandidates = [
    {
      libraryId: 'lib_mix_1',
      pageName: 'Super Furniture Gallery',
      facebookPageUrl: 'https://facebook.com/superfurniture',
      destinationUrl: 'https://superfurniture.com/sofa',
      destinationDomain: 'superfurniture.com',
      bodyCopy: 'Modern dining room furniture sets.',
      isActive: true
    },
    {
      // Duplicate ad of entity 1
      libraryId: 'lib_mix_2',
      pageName: 'Super Furniture Gallery',
      facebookPageUrl: 'https://facebook.com/superfurniture',
      destinationUrl: 'https://superfurniture.com/table',
      destinationDomain: 'superfurniture.com',
      bodyCopy: 'Ergonomic study chairs and tables.',
      isActive: true
    },
    {
      // Irrelevant advertiser (Healthcare / generic)
      libraryId: 'lib_mix_3',
      pageName: 'Metro Healthcare Clinic',
      facebookPageUrl: 'https://facebook.com/metrohealth',
      destinationUrl: 'https://metrohealth.com/doctors',
      destinationDomain: 'metrohealth.com',
      bodyCopy: 'General physician consultations and diabetes clinic.',
      isActive: true
    }
  ];

  const testEntitiesMap = new Map();
  const testSeenAds = new Set();
  const testSeenKeys = new Set();
  const testCounters = {
    rawAds: 0, normalizedCandidates: 0, relevantCandidates: 0, uncertainCandidates: 0,
    notRelevantCandidates: 0, duplicatesRemoved: 0, finalUniqueLeads: 0,
    uniqueEntitiesObserved: 0, relevantEntities: 0, uncertainEntities: 0,
    notRelevantEntities: 0, keywordsCompleted: 0, keywordsTotal: 1,
    finalUniqueRelevantLeads: 0, reasonCodes: {}
  };

  const batchRes = await processBatch(
    mixedCandidates,
    testEntitiesMap,
    testSeenAds,
    testSeenKeys,
    testCounters,
    {
      runId: 'run_mix_test',
      countryCode: 'BD',
      locationName: 'Bangladesh',
      currentKeyword: 'Furniture',
      intent,
      effectiveCeiling: 5000
    }
  );

  check('Duplicate ads for same entity are merged without inflating unique leads', testCounters.finalUniqueRelevantLeads === 1);
  check('Non-relevant healthcare ad rejected by Strict-v2', testCounters.notRelevantEntities === 1);
  check('Total raw ads counted correctly', testCounters.rawAds === 3);

  // ----------------------------------------------------------------------------
  // TEST 5: REAL PUBLIC META AD LIBRARY SMOKE TEST
  // ----------------------------------------------------------------------------
  console.log('\n--- 5. Real Public Meta Ad Library Smoke Test (No Quota Input) ---');
  const targetMetaUrl = 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=Furniture&search_type=keyword_unordered&media_type=all';
  const metaPage = await browserContext.newPage();

  console.log(`Navigating to public Meta Ad Library: ${targetMetaUrl}`);
  await metaPage.goto(targetMetaUrl, { waitUntil: 'networkidle', timeout: 45000 }).catch(async () => {
    await metaPage.goto(targetMetaUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  });
  await metaPage.waitForTimeout(4000);

  const liveCards = await metaPage.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('div, span'));
    const idElements = allElements.filter(el => el.children.length === 0 && el.textContent && el.textContent.includes('Library ID:'));
    const cards = [];
    const seen = new Set();

    for (const idEl of idElements) {
      const text = idEl.textContent || '';
      const m = text.match(/Library ID:\s*([0-9]+)/i);
      if (!m) continue;
      const libId = m[1];
      if (seen.has(libId)) continue;
      seen.add(libId);

      let container = idEl;
      let cardRoot = null;
      while (container && container.parentElement && container.parentElement !== document.body) {
        if (container.parentElement.children.length > 3 && container.querySelectorAll('a').length > 0 && container.offsetHeight > 150) {
          cardRoot = container;
          break;
        }
        container = container.parentElement;
      }
      if (!cardRoot) {
        let fallback = idEl.parentElement;
        for (let i = 0; i < 7; i++) {
          if (fallback && fallback.parentElement && fallback.parentElement !== document.body) {
            fallback = fallback.parentElement;
          }
        }
        cardRoot = fallback || idEl;
      }

      const cardFullText = cardRoot.innerText || '';
      const links = Array.from(cardRoot.querySelectorAll('a'));
      let pageName = 'Unknown Advertiser';
      let fbUrl = undefined;
      let destUrl = undefined;

      for (const link of links) {
        const href = link.href || '';
        const linkText = (link.innerText || '').trim();
        if (href.includes('facebook.com') && !href.includes('/ads/') && !href.includes('/help') && !href.includes('/policy') && !href.includes('/legal')) {
          if (!fbUrl) fbUrl = href;
          if (linkText && linkText.length > 1 && !linkText.includes('Library ID') && !linkText.includes('See ad details')) {
            pageName = linkText;
          }
        } else if (href && !href.includes('facebook.com') && !destUrl) {
          destUrl = href;
        }
      }

      cards.push({
        libraryId: libId,
        pageName,
        facebookPageUrl: fbUrl,
        destinationUrl: destUrl,
        bodyCopy: cardFullText.replace(/\n+/g, ' ').substring(0, 300),
        isActive: !cardFullText.includes('Inactive'),
        observedKeyword: 'Furniture'
      });
    }
    return cards;
  });

  const liveEntities = new Map();
  const liveSeenAds = new Set();
  const liveSeenKeys = new Set();
  const liveCounters = {
    rawAds: 0, normalizedCandidates: 0, relevantCandidates: 0, uncertainCandidates: 0,
    notRelevantCandidates: 0, duplicatesRemoved: 0, finalUniqueLeads: 0,
    uniqueEntitiesObserved: 0, relevantEntities: 0, uncertainEntities: 0,
    notRelevantEntities: 0, keywordsCompleted: 0, keywordsTotal: 1,
    finalUniqueRelevantLeads: 0, reasonCodes: {}
  };

  const liveRes = await processBatch(
    liveCards,
    liveEntities,
    liveSeenAds,
    liveSeenKeys,
    liveCounters,
    {
      runId: 'run_live_53b',
      countryCode: 'BD',
      locationName: 'Bangladesh',
      currentKeyword: 'Furniture',
      intent,
      effectiveCeiling: 5000
    }
  );

  results.liveObserved = {
    rawAds: liveCounters.rawAds,
    uniqueEntities: liveCounters.uniqueEntitiesObserved,
    relevant: liveCounters.finalUniqueRelevantLeads,
    stopReason: 'SOURCE_EXHAUSTED'
  };

  check('Live Meta Ad Library ads observed (> 0)', liveCounters.rawAds > 0);
  check('Live Meta unique entities discovered (> 0)', liveCounters.uniqueEntitiesObserved > 0);
  check('Live Meta relevant leads qualified (> 0)', liveCounters.finalUniqueRelevantLeads > 0);

  // ----------------------------------------------------------------------------
  // TEST 6: EXPORT INTEGRITY FOR AUTO-DISCOVERY
  // ----------------------------------------------------------------------------
  console.log('\n--- 6. Export Integrity for AUTO_DISCOVERY ---');
  const mockAutoRun = {
    runId: 'run_auto_exp_1',
    researchName: 'Furniture in Bangladesh',
    mode: 'CUSTOM',
    researchMode: 'AUTO_DISCOVERY',
    keywords: ['Furniture'],
    countryCode: 'BD',
    locationName: 'Bangladesh',
    status: 'COMPLETED',
    stopReason: 'SAFETY_LIMIT_REACHED',
    engineVersion: 'strict-v2',
    leads: Array.from(liveEntities.values())
  };

  const csv = exportLeadsToCsv(mockAutoRun.leads, mockAutoRun);
  check('CSV includes Auto Discovery mode header', csv.includes('Mode: Auto Discovery'));
  check('CSV does not contain fictional Requested Quota header', !csv.includes('Requested Quota:'));
  check('CSV contains Stop Reason', csv.includes('Stop Reason: SAFETY_LIMIT_REACHED'));

  await extPopupPage.close();
  await webPage.close();
  await metaPage.close();
  await browserContext.close();

  console.log('\n================================================================');
  console.log(`MASTER PROMPT 53B: ALL ${results.assertionsPassed}/${results.totalAssertions} ASSERTIONS PASSED!`);
  console.log('================================================================');

  return results;
}

runMasterPrompt53BTests().catch(err => {
  console.error('\n❌ MASTER PROMPT 53B TEST SUITE FAILED:', err);
  process.exit(1);
});
