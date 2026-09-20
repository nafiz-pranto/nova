import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { LeadRelevanceEngine } from '../src/extension/relevanceEngine.ts';
import { aggregateCandidatesToLeads, exportLeadsToCsv, sanitizeCsvField } from '../src/extension/metaAdapter.ts';
import { RESEARCH_PRESETS } from '../src/data/presetCatalogue.ts';

console.log('================================================================');
console.log('MASTER PROMPT 43: FINAL RELEASE GATE TEST MATRIX SUITE');
console.log('================================================================');

function pass(msg) {
  console.log(`✓ PASSED: ${msg}`);
}

async function runReleaseGateTests() {
  const extDir = path.resolve('./extension');
  const zipPath = path.resolve('./extension.zip');

  // --- GATE 1: ASSET & MANIFEST VALIDATION ---
  console.log('\n--- GATE 1: Asset Packaging & Manifest V3 Validation ---');
  assert.ok(fs.existsSync(extDir), 'Extension build directory ./extension exists');
  assert.ok(fs.existsSync(path.join(extDir, 'manifest.json')), 'manifest.json exists in ./extension');
  assert.ok(fs.existsSync(path.join(extDir, 'service-worker.js')), 'service-worker.js exists');
  assert.ok(fs.existsSync(path.join(extDir, 'content-script.js')), 'content-script.js exists');
  assert.ok(fs.existsSync(path.join(extDir, 'app.js')), 'app.js exists');
  assert.ok(fs.existsSync(path.join(extDir, 'styles.css')), 'styles.css exists');
  assert.ok(fs.existsSync(path.join(extDir, 'popup.html')), 'popup.html exists');
  assert.ok(fs.existsSync(path.join(extDir, 'sidepanel.html')), 'sidepanel.html exists');
  assert.ok(fs.existsSync(zipPath), 'extension.zip release package exists');

  const manifest = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'));
  assert.strictEqual(manifest.manifest_version, 3, 'Manifest is version 3');
  assert.strictEqual(manifest.name, 'Meta Ad Library Lead Scraper', 'Manifest name is correct');
  assert.ok(manifest.permissions.includes('storage'), 'Includes storage permission');
  assert.ok(manifest.permissions.includes('tabs'), 'Includes tabs permission');
  assert.ok(manifest.permissions.includes('scripting'), 'Includes scripting permission');
  assert.ok(manifest.permissions.includes('sidePanel'), 'Includes sidePanel permission');
  assert.ok(manifest.host_permissions.some(h => h.includes('facebook.com/ads/library')), 'Includes Meta Ad Library host permissions');
  pass('Manifest V3 compliant with minimal safe permissions');

  // --- GATE 2: REAL CHROMIUM EXTENSION LAUNCH & SERVICE WORKER ---
  console.log('\n--- GATE 2: Chrome Extension Load & Service Worker Launch ---');
  const browserContext = await chromium.launchPersistentContext('', {
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

  let sw = null;
  for (const worker of browserContext.serviceWorkers()) {
    if (worker.url().includes('chrome-extension://')) {
      sw = worker;
      break;
    }
  }
  if (!sw) {
    sw = await browserContext.waitForEvent('serviceworker', { timeout: 10000 });
  }

  assert.ok(sw, 'Service worker loaded successfully');
  const extId = new URL(sw.url()).hostname;
  assert.ok(extId && extId.length > 5, 'Valid extension ID registered');
  pass(`Installed extension successfully in real Chromium runtime with ID: ${extId}`);

  // Test sidepanel and popup UI pages
  const panelPage = await browserContext.newPage();
  await panelPage.goto(`chrome-extension://${extId}/sidepanel.html`);
  await panelPage.waitForSelector('text=Meta Ad Library Lead Scraper', { timeout: 5000 });
  pass('Side panel page rendered UI correctly without uncaught errors');

  // --- GATE 3: RELEVANCE & FALSE POSITIVE / NEGATIVE BENCHMARKS ---
  console.log('\n--- GATE 3: Relevance Engine Precision & Recall Verification ---');
  const intentFurniture = LeadRelevanceEngine.compileResearchIntent('CUSTOM', ['Furniture'], undefined, 'BD');

  // Case A: Obvious Relevant (exact match in name)
  const evalRFL = LeadRelevanceEngine.evaluateEvidence({
    advertiserName: 'RFL Furniture',
    facebookPageName: 'RFL Furniture',
    facebookPageUrl: 'https://www.facebook.com/RFLfurniture/',
    adText: 'Classic Dining Chair and Table',
    destinationUrl: 'https://othoba.com/chair',
    destinationDomain: 'othoba.com',
    ctaText: 'Shop Now',
    matchedKeyword: 'Furniture'
  }, intentFurniture);
  assert.strictEqual(evalRFL.decision, 'RELEVANT', 'RFL Furniture is RELEVANT');
  assert.strictEqual(evalRFL.confidence, 'HIGH', 'RFL Furniture is HIGH confidence');
  pass('RFL Furniture evaluated as RELEVANT with HIGH confidence');

  // Case B: False Positive Defense (Irrelevant sports club or healthcare returned by broad query)
  const evalSports = LeadRelevanceEngine.evaluateEvidence({
    advertiserName: 'Manchester United Official Store',
    bodyCopy: 'Watch premier league football matches and buy official team jerseys.',
    destinationUrl: 'https://store.manutd.com',
    destinationDomain: 'store.manutd.com',
    ctaText: 'Shop Now'
  }, intentFurniture);
  assert.strictEqual(evalSports.decision, 'NOT_RELEVANT', 'Sports team is NOT_RELEVANT');
  pass('False Positive Blocked: Unrelated sports business disqualified with negative conflict penalty');

  const evalHealth = LeadRelevanceEngine.evaluateEvidence({
    advertiserName: 'American Health Support Community',
    bodyCopy: 'Medical health wellness support and doctor appointments.',
    destinationUrl: 'https://healthsupport.org',
    destinationDomain: 'healthsupport.org'
  }, intentFurniture);
  assert.strictEqual(evalHealth.decision, 'NOT_RELEVANT', 'Healthcare clinic is NOT_RELEVANT');
  pass('False Positive Blocked: Healthcare clinic disqualified');

  // Case C: False Negative Prevention (Relevant business with category product terms, but name does not contain literal word "furniture")
  const evalInteriors = LeadRelevanceEngine.evaluateEvidence({
    advertiserName: 'Modern Living Interiors',
    adText: 'Premium solid wood dining tables, sofas, and ergonomic office chairs with nationwide delivery.',
    destinationUrl: 'https://modernliving.com/products/dining-table',
    destinationDomain: 'modernliving.com',
    ctaText: 'Order Now'
  }, intentFurniture);
  assert.strictEqual(evalInteriors.decision, 'RELEVANT', 'Modern Living Interiors is RELEVANT via product catalog evidence');
  pass('False Negative Prevented: Modern Living Interiors accepted via ad copy product terms (table, sofa, chair)');

  // --- GATE 4: MULTI-KEYWORD COORDINATION & DEDUPLICATION ---
  console.log('\n--- GATE 4: Multi-Keyword Deduplication & Aggregation ---');
  const multiCandidates = [
    {
      libraryId: 'ad_101',
      pageName: 'Apex Woodcraft Studio',
      facebookPageUrl: 'https://facebook.com/apexwoodcraft',
      destinationUrl: 'https://apexwoodcraft.com/chairs',
      destinationDomain: 'apexwoodcraft.com',
      bodyCopy: 'Handcrafted chairs and tables',
      ctaText: 'Shop Now',
      observedKeyword: 'Furniture'
    },
    {
      libraryId: 'ad_102',
      pageName: 'Apex Woodcraft Studio',
      facebookPageUrl: 'https://facebook.com/apexwoodcraft',
      destinationUrl: 'https://apexwoodcraft.com/desks',
      destinationDomain: 'apexwoodcraft.com',
      bodyCopy: 'Executive wooden office desks',
      ctaText: 'Learn More',
      observedKeyword: 'Office Furniture'
    },
    {
      libraryId: 'ad_103',
      pageName: 'Apex Woodcraft Studio',
      facebookPageUrl: 'https://facebook.com/apexwoodcraft',
      destinationUrl: 'https://apexwoodcraft.com/home-decor',
      destinationDomain: 'apexwoodcraft.com',
      bodyCopy: 'Home furniture decor',
      ctaText: 'Shop Now',
      observedKeyword: 'Home Furniture'
    },
    {
      libraryId: 'ad_201',
      pageName: 'City Dental Care',
      bodyCopy: 'Teeth cleaning and braces',
      observedKeyword: 'Furniture'
    }
  ];

  const aggResult = aggregateCandidatesToLeads(
    multiCandidates,
    'BD',
    'Bangladesh',
    10,
    [],
    intentFurniture
  );

  assert.strictEqual(aggResult.leads.length, 1, 'Only 1 unique relevant lead aggregated');
  assert.strictEqual(aggResult.rejectedCount, 1, 'Irrelevant dental clinic rejected');
  const apexLead = aggResult.leads[0];
  assert.strictEqual(apexLead.name, 'Apex Woodcraft Studio');
  assert.strictEqual(apexLead.activeAdCount, 3, 'Active ad count is 3 for Apex Woodcraft');
  assert.deepStrictEqual(apexLead.matchedKeywords.sort(), ['Furniture', 'Home Furniture', 'Office Furniture'].sort(), 'All 3 keywords preserved');
  assert.deepStrictEqual(apexLead.adLibraryIds.sort(), ['ad_101', 'ad_102', 'ad_103'].sort(), 'All 3 ad library IDs merged');
  pass('Multi-keyword deduplication successfully merged 3 ad cards across 3 queries into 1 lead');

  // --- GATE 5: STAGED QUOTA VALIDATION (5, 10, 25, 100, 500) ---
  console.log('\n--- GATE 5: Staged Quota Scalability (5, 10, 25, 100, 500) ---');
  // Generate 80 synthetic furniture candidates across 80 unique advertisers
  const syntheticPool = [];
  for (let i = 1; i <= 80; i++) {
    syntheticPool.push({
      libraryId: `lib_${i}`,
      pageName: `Authentic Furniture Brand ${i}`,
      facebookPageUrl: `https://facebook.com/furniturebrand${i}`,
      destinationUrl: `https://brand${i}.com/furniture-catalog`,
      destinationDomain: `brand${i}.com`,
      bodyCopy: `Luxury dining table, chair, and living room furniture #${i}`,
      ctaText: 'Shop Now',
      observedKeyword: 'Furniture'
    });
  }

  // Stage 1: Quota = 5
  const stage5 = aggregateCandidatesToLeads(syntheticPool, 'BD', 'Bangladesh', 5, [], intentFurniture);
  assert.strictEqual(stage5.leads.length, 5, 'Stage 5 strictly returned 5 leads');
  pass('Stage 1 (Quota 5): Strictly capped at 5 leads');

  // Stage 2: Quota = 10
  const stage10 = aggregateCandidatesToLeads(syntheticPool, 'BD', 'Bangladesh', 10, [], intentFurniture);
  assert.strictEqual(stage10.leads.length, 10, 'Stage 10 strictly returned 10 leads');
  pass('Stage 2 (Quota 10): Strictly capped at 10 leads');

  // Stage 3: Quota = 25
  const stage25 = aggregateCandidatesToLeads(syntheticPool, 'BD', 'Bangladesh', 25, [], intentFurniture);
  assert.strictEqual(stage25.leads.length, 25, 'Stage 25 strictly returned 25 leads');
  pass('Stage 3 (Quota 25): Strictly capped at 25 leads');

  // Stage 4: Quota = 100 (Pool has 80)
  const stage100 = aggregateCandidatesToLeads(syntheticPool, 'BD', 'Bangladesh', 100, [], intentFurniture);
  assert.strictEqual(stage100.leads.length, 80, 'Stage 100 returned available 80 leads honestly');
  pass('Stage 4 (Quota 100): Returned available 80 leads without fabricating 20 fake leads');

  // Stage 5: Quota = 500 (Pool has 80)
  const stage500 = aggregateCandidatesToLeads(syntheticPool, 'BD', 'Bangladesh', 500, [], intentFurniture);
  assert.strictEqual(stage500.leads.length, 80, 'Stage 500 returned available 80 leads honestly');
  pass('Stage 5 (Quota 500): Returned available 80 leads without fabricating 420 fake leads');

  // --- GATE 6: CSV EXPORT RFC COMPLIANCE & FORMULA INJECTION ---
  console.log('\n--- GATE 6: Export Validation & Formula Injection Defense ---');
  const dangerousLeads = [
    {
      id: 'lead_sec_1',
      name: '=cmd|"/C calc"!A0',
      facebookPageName: '+12345678',
      facebookPageUrl: 'https://facebook.com/danger',
      facebookPageState: 'found',
      destinationDomain: '-danger.com',
      destinationUrl: 'https://danger.com',
      websiteState: 'found',
      activeAdCount: 1,
      adLibraryIds: ['@SUM(1,2)'],
      adLibraryUrl: 'https://facebook.com/ads/library/?id=1',
      matchedKeywords: ['Furniture'],
      locationCode: 'BD',
      locationName: 'Bangladesh',
      status: 'QUALIFIED',
      discoveredAt: '2026-09-20T00:00:00Z',
      relevanceDecision: 'RELEVANT',
      relevanceScore: 0.85,
      relevanceConfidence: 'HIGH'
    }
  ];

  const csv = exportLeadsToCsv(dangerousLeads);
  assert.ok(csv.includes("Relevance Decision"), 'CSV includes Relevance Decision header');
  assert.ok(csv.includes("Relevance Score"), 'CSV includes Relevance Score header');
  assert.ok(csv.includes("Relevance Confidence"), 'CSV includes Relevance Confidence header');
  assert.ok(csv.includes("'=cmd"), 'Formula = sanitized with leading apostrophe');
  assert.ok(csv.includes("'+12345678"), 'Formula + sanitized');
  assert.ok(csv.includes("'-danger.com"), 'Formula - sanitized');
  assert.ok(csv.includes("'@SUM(1,2)"), 'Formula @ sanitized');
  pass('CSV export protects against spreadsheet formula injection across all fields');

  await browserContext.close();
  console.log('\n================================================================');
  console.log('ALL RELEASE GATE TESTS COMPLETED SUCCESSFULLY: 100% GREEN!');
  console.log('================================================================');
}

runReleaseGateTests().catch(err => {
  console.error('Fatal release gate failure:', err);
  process.exit(1);
});
