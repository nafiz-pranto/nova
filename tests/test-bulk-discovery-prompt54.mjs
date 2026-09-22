/**
 * Master Prompt 54 Test Suite:
 * LEADNORIA BULK DISCOVERY ENGINE + STREAMING EXTRACTION + CHUNKED PROCESSING
 * + 5,000 FINAL-LEAD SAFETY CAP + CRASH-RESISTANT RESUMABLE RESEARCH
 */

import assert from 'assert';
import {
  initBulkStore,
  saveBatch,
  saveRunRecord,
  getAllRelevantLeads,
  getSeenAdIds,
  getSeenEntityKeys,
  getLatestCheckpoint
} from '../src/extension/bulkStore.ts';
import { processBatch } from '../src/extension/bulkProcessor.ts';
import { compileResearchIntent } from '../src/extension/relevanceEngine.ts';
import { MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH } from '../src/extension/types.ts';

console.log('================================================================');
console.log('MASTER PROMPT 54: BULK DISCOVERY ENGINE TEST SUITE');
console.log('================================================================');

async function runTests() {
  const runId = `test_bulk_${Date.now()}`;
  const countryCode = 'US';
  const locationName = 'United States';
  const keywords = ['Furniture', 'Modern Sofa'];
  const currentKeyword = 'Furniture';
  const intent = compileResearchIntent('CUSTOM', keywords, undefined, countryCode);

  // 1. Initial verification of bulk store
  console.log('\n--- TEST 1: Storage Layer Initialization & Isolation ---');
  await initBulkStore();
  const initialSeenAds = await getSeenAdIds(runId);
  const initialSeenEntities = await getSeenEntityKeys(runId);
  assert.strictEqual(initialSeenAds.size, 0, 'Initial seen ads must be empty');
  assert.strictEqual(initialSeenEntities.size, 0, 'Initial seen entities must be empty');
  console.log('✓ [PASS] 1. Bulk storage initialized cleanly with isolated run ID');

  // 2. Batch Processing & Deduplication
  console.log('\n--- TEST 2: Chunked Batch Processing & Multi-Card Deduplication ---');
  const existingEntitiesMap = new Map();
  const seenAdLibraryIds = new Set();
  const seenEntityKeys = new Set();
  const counters = {
    rawAds: 0,
    normalizedCandidates: 0,
    relevantCandidates: 0,
    uncertainCandidates: 0,
    notRelevantCandidates: 0,
    duplicatesRemoved: 0,
    finalUniqueLeads: 0,
    uniqueEntitiesObserved: 0,
    relevantEntities: 0,
    uncertainEntities: 0,
    notRelevantEntities: 0,
    keywordsCompleted: 0,
    keywordsTotal: 2,
    finalUniqueRelevantLeads: 0,
    reasonCodes: {}
  };

  // Batch 1: 3 ads, two from same furniture advertiser "Aesthetic Woodcraft Furniture", one sports contradiction
  const batch1 = [
    {
      libraryId: 'ad_101',
      pageName: 'Aesthetic Woodcraft Furniture',
      bodyCopy: 'Handcrafted solid oak dining tables, modern sofa sets, and bedroom furniture. Free shipping.',
      destinationUrl: 'https://aestheticwoodcraft.com/tables',
      destinationDomain: 'aestheticwoodcraft.com',
      ctaText: 'Shop Now',
      adSnapshotUrl: 'https://facebook.com/ads/library/?id=101',
      isActive: true,
      startDate: '2026-03-01'
    },
    {
      libraryId: 'ad_102',
      pageName: 'Aesthetic Woodcraft Furniture', // Same advertiser
      bodyCopy: 'Special 20% off on all living room furniture and wooden chairs this weekend.',
      destinationUrl: 'https://aestheticwoodcraft.com/chairs',
      destinationDomain: 'aestheticwoodcraft.com',
      ctaText: 'Shop Now',
      adSnapshotUrl: 'https://facebook.com/ads/library/?id=102',
      isActive: true,
      startDate: '2026-03-02'
    },
    {
      libraryId: 'ad_103',
      pageName: 'Premier Football League', // Contradiction
      bodyCopy: 'Seats and chairs available for upcoming championship soccer game! Get your tickets now.',
      destinationUrl: 'https://tickets.premierfootball.com',
      destinationDomain: 'premierfootball.com',
      ctaText: 'Get Tickets',
      adSnapshotUrl: 'https://facebook.com/ads/library/?id=103',
      isActive: true,
      startDate: '2026-03-01'
    }
  ];

  const res1 = await processBatch(
    batch1,
    existingEntitiesMap,
    seenAdLibraryIds,
    seenEntityKeys,
    counters,
    {
      runId,
      countryCode,
      locationName,
      currentKeyword,
      intent,
      effectiveCeiling: 5000
    }
  );

  console.log('res1.counters:', res1.counters);
  assert.strictEqual(res1.counters.rawAds, 3, 'Counters rawAds should be 3');
  assert.strictEqual(res1.counters.duplicatesRemoved, 1, 'One duplicate ad from same advertiser merged');
  assert.strictEqual(res1.counters.finalUniqueRelevantLeads, 1, 'Only 1 relevant entity discovered');
  assert.strictEqual(existingEntitiesMap.size, 1, 'Entity map should contain Aesthetic Woodcraft Furniture');

  const aestheticWoodcraft = existingEntitiesMap.get('name_aesthetic_woodcraft_furniture');
  assert.ok(aestheticWoodcraft, 'Aesthetic Woodcraft Furniture must exist in entity map');
  assert.strictEqual(aestheticWoodcraft.adCount, 2, 'Ad count for merged advertiser must be 2');
  assert.strictEqual(aestheticWoodcraft.status, 'QUALIFIED');
  console.log('✓ [PASS] 2. Batch 1 processed: Deduplication and relevance gate correctly evaluated');

  // Save Batch 1 into bulkStore
  await saveBatch(runId, {
    batchIndex: 1,
    ads: res1.processedAds,
    entities: res1.updatedEntities,
    evidence: res1.newEvidence,
    checkpoint: {
      runId,
      batchIndex: 1,
      timestamp: new Date().toISOString(),
      activeKeywordIndex: 0,
      currentKeyword: 'Furniture',
      rawAdsCount: res1.counters.rawAds,
      normalizedCandidatesCount: res1.counters.normalizedCandidates,
      uniqueEntitiesCount: res1.counters.uniqueEntitiesObserved || 0,
      relevantEntitiesCount: res1.counters.relevantEntities || 0,
      uncertainEntitiesCount: res1.counters.uncertainEntities || 0,
      notRelevantEntitiesCount: res1.counters.notRelevantEntities || 0,
      duplicatesRemovedCount: res1.counters.duplicatesRemoved,
      finalUniqueRelevantLeads: res1.counters.finalUniqueRelevantLeads,
      seenLibraryIdsCount: seenAdLibraryIds.size,
      seenEntityKeysCount: seenEntityKeys.size
    }
  });

  // Verify persistence of Batch 1
  const storedLeads1 = await getAllRelevantLeads(runId);
  assert.strictEqual(storedLeads1.length, 1, 'bulkStore must return 1 lead');
  assert.strictEqual(storedLeads1[0].name, 'Aesthetic Woodcraft Furniture');
  console.log('✓ [PASS] 3. Batch 1 atomically persisted to bulkStore and retrieved');

  // 3. Batch 2: Resuming with new unique furniture lead + duplicate of previously seen ad
  console.log('\n--- TEST 3: Cross-Batch Deduplication & Checkpointing ---');
  const batch2 = [
    {
      libraryId: 'ad_101', // Already seen in Batch 1! Must be ignored
      pageName: 'Aesthetic Woodcraft Furniture',
      bodyCopy: 'Handcrafted solid oak dining tables.',
      adSnapshotUrl: 'https://facebook.com/ads/library/?id=101',
      isActive: true
    },
    {
      libraryId: 'ad_201', // New valid furniture lead
      pageName: 'Urban Nordic Living Furniture',
      bodyCopy: 'Minimalist Scandinavian sofas, coffee tables, and storage furniture crafted in Copenhagen.',
      destinationUrl: 'https://urbannordic.com',
      destinationDomain: 'urbannordic.com',
      ctaText: 'Shop Now',
      adSnapshotUrl: 'https://facebook.com/ads/library/?id=201',
      isActive: true
    }
  ];

  const res2 = await processBatch(
    batch2,
    existingEntitiesMap,
    seenAdLibraryIds,
    seenEntityKeys,
    res1.counters,
    {
      runId,
      countryCode,
      locationName,
      currentKeyword,
      intent,
      effectiveCeiling: 5000
    }
  );

  // ad_101 was skipped because it was already seen
  assert.strictEqual(res2.counters.rawAds, 4, 'Raw ads incremented only for novel ad 201 (now 4)');
  assert.strictEqual(res2.counters.finalUniqueRelevantLeads, 2, 'Total relevant leads now 2');
  assert.strictEqual(existingEntitiesMap.size, 2, '2 total unique relevant businesses');
  console.log('✓ [PASS] 4. Cross-batch deduplication avoided re-processing existing library ID');

  // 4. Safety Ceiling Enforcement (5,000)
  console.log('\n--- TEST 4: 5,000 Lead Global Safety Cap ---');
  assert.strictEqual(MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH, 5000);

  // Simulate ceiling trigger
  const ceilingTestMap = new Map();
  for (let i = 0; i < 5000; i++) {
    ceilingTestMap.set(`business_${i}`, { id: `b_${i}`, name: `Business ${i}` });
  }

  const overflowBatch = [
    {
      libraryId: 'ad_9999',
      pageName: 'Extra Furniture Corp',
      bodyCopy: 'Sofas and chairs for bedroom and living room.',
      adSnapshotUrl: 'https://facebook.com/ads/library/?id=9999',
      isActive: true
    }
  ];

  const overflowRes = await processBatch(
    overflowBatch,
    ceilingTestMap,
    new Set(),
    new Set(),
    { ...counters, finalUniqueRelevantLeads: 5000 },
    {
      runId: 'ceiling_test_run',
      countryCode,
      locationName,
      currentKeyword,
      intent,
      effectiveCeiling: 5000
    }
  );

  assert.strictEqual(overflowRes.safetyLimitReached, true, 'Safety limit flag must be true at 5,000 leads');
  console.log('✓ [PASS] 5. 5,000 global safety ceiling enforced strictly');

  // 5. Checkpoint & Resumability State
  console.log('\n--- TEST 5: Keyword Frontier Checkpoint & Resumability ---');
  const checkpoint = await getLatestCheckpoint(runId);
  assert.ok(checkpoint, 'Checkpoint must be saved');
  assert.strictEqual(checkpoint.activeKeywordIndex, 0);
  assert.strictEqual(checkpoint.currentKeyword, 'Furniture');
  assert.strictEqual(checkpoint.batchIndex, 1);
  console.log('✓ [PASS] 6. Keyword frontier state correctly captures progress for crash-resistant recovery');

  console.log('\n================================================================');
  console.log('ALL MASTER PROMPT 54 BULK ENGINE TESTS PASSED CLEANLY!');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
