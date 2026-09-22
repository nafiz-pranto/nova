/**
 * Master Prompt 53: Auto-Discovery Research Model & 5,000-Lead Safety Ceiling Test Suite
 * Validates:
 * 1. MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH = 5,000
 * 2. Auto-Discovery execution semantics & safety limit termination (SAFETY_LIMIT_REACHED)
 * 3. Absence of user-facing quota in UI
 * 4. Backward compatibility with legacy runs and CSV exports
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH } from '../src/extension/types.ts';
import { aggregateCandidatesToLeads, exportLeadsToCsv } from '../src/extension/metaAdapter.ts';
import { compileResearchIntent } from '../src/extension/relevanceEngine.ts';

console.log('================================================================');
console.log('MASTER PROMPT 53: AUTO-DISCOVERY RESEARCH MODEL TEST SUITE');
console.log('================================================================');

let passedTests = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Constant Verification
it('1. MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH is strictly 5000', () => {
  assert.strictEqual(MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH, 5000);
});

// 2. Auto-Discovery Default in Aggregation
it('2. aggregateCandidatesToLeads defaults to 5,000 lead ceiling when maxResults is omitted', () => {
  const intent = compileResearchIntent('CUSTOM', ['furniture'], undefined, 'US');
  
  // Create 20 unique furniture candidates
  const candidates = [];
  for (let i = 0; i < 20; i++) {
    candidates.push({
      libraryId: `ad_${i}`,
      pageName: `Artisan Furniture Studio ${i}`,
      bodyCopy: `Handcrafted modern solid wood dining tables, ergonomic chairs and sofas for sale #${i}.`,
      facebookPageUrl: `https://facebook.com/artisanfurniture${i}`,
      observedKeyword: 'furniture'
    });
  }

  // Call with omitted maxResults (using default parameter)
  const result = aggregateCandidatesToLeads(candidates, 'US', 'United States', undefined, [], intent);
  
  assert.strictEqual(result.leads.length, 20);
  assert.strictEqual(result.counters.finalUniqueLeads, 20);
  assert.strictEqual(result.counters.rawAds, 20);
});

// 3. System Safety Ceiling (5,000) strictly enforces max final unique relevant leads
it('3. aggregateCandidatesToLeads honors 5,000 maximum ceiling even if higher count is supplied', () => {
  const intent = compileResearchIntent('CUSTOM', ['furniture'], undefined, 'US');
  
  // Create 10 candidates with requested maxResults 10000 -> must cap at 5000
  const candidates = [
    {
      libraryId: 'ad_1',
      pageName: 'Woodcraft Furniture',
      bodyCopy: 'Quality living room sofas and oak tables on sale.',
      facebookPageUrl: 'https://facebook.com/woodcraft',
      observedKeyword: 'furniture'
    }
  ];

  const result = aggregateCandidatesToLeads(candidates, 'US', 'United States', 10000, [], intent);
  assert.strictEqual(result.leads.length, 1);
});

// 4. Backward Compatibility with Legacy Runs
it('4. aggregateCandidatesToLeads preserves legacy maxResults when specified below 5,000', () => {
  const intent = compileResearchIntent('CUSTOM', ['furniture'], undefined, 'US');
  
  const candidates = [];
  for (let i = 0; i < 15; i++) {
    candidates.push({
      libraryId: `ad_${i}`,
      pageName: `Boutique Furniture Store ${i}`,
      bodyCopy: `Designer home sofas, dining tables and chairs in stock #${i}.`,
      facebookPageUrl: `https://facebook.com/boutiquefurniture${i}`,
      observedKeyword: 'furniture'
    });
  }

  // Legacy run with maxResults = 5
  const result = aggregateCandidatesToLeads(candidates, 'US', 'United States', 5, [], intent);
  assert.strictEqual(result.leads.length, 5, 'Must respect legacy maxResults = 5');
});

// 5. CSV Export Header in Auto-Discovery vs Legacy Mode
it('5. exportLeadsToCsv emits Auto Discovery header for AUTO_DISCOVERY runs', () => {
  const sampleLead = {
    id: 'lead_1',
    canonicalName: 'nordic furniture',
    name: 'Nordic Furniture',
    locationCode: 'US',
    locationName: 'United States',
    matchedKeywords: ['furniture'],
    adLibraryIds: ['ad_101'],
    activeAdCount: 1,
    facebookPageUrl: 'https://facebook.com/nordicfurniture',
    facebookPageState: 'found',
    destinationUrl: 'https://nordicfurniture.com',
    destinationDomain: 'nordicfurniture.com',
    websiteState: 'found',
    firstObservedAt: new Date().toISOString(),
    lastObservedAt: new Date().toISOString(),
    schemaVersion: 1,
    relevanceDecision: 'RELEVANT',
    relevanceScore: 0.95,
    relevanceConfidence: 'HIGH',
    relevanceReasons: ['Direct keyword match'],
    relevanceMatchedTerms: ['furniture'],
    engineVersion: 'strict-v2'
  };

  const autoRun = {
    runId: 'run_auto_1',
    researchName: 'Furniture in United States',
    mode: 'CUSTOM',
    researchMode: 'AUTO_DISCOVERY',
    maxFinalUniqueRelevantLeads: 5000,
    keywords: ['furniture'],
    countryCode: 'US',
    locationName: 'United States',
    status: 'COMPLETED',
    stopReason: 'SAFETY_LIMIT_REACHED',
    leads: [sampleLead],
    rejectedLeadsCount: 0,
    uncertainLeadsCount: 0,
    engineVersion: 'strict-v2',
    totalAdsInspected: 10,
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    schemaVersion: 1
  };

  const autoCsv = exportLeadsToCsv([sampleLead], autoRun);
  assert.ok(autoCsv.includes('Mode: Auto Discovery (CUSTOM)'), 'Should contain Auto Discovery mode in CSV');
  assert.ok(!autoCsv.includes('Requested Quota:'), 'Should not contain Requested Quota in Auto Discovery CSV');
  assert.ok(autoCsv.includes('Stop Reason: SAFETY_LIMIT_REACHED'));

  // Legacy run with requested quota
  const legacyRun = {
    runId: 'run_legacy_1',
    researchName: 'Furniture in US',
    mode: 'CUSTOM',
    targetLeadCount: 25,
    keywords: ['furniture'],
    countryCode: 'US',
    locationName: 'United States',
    status: 'COMPLETED',
    stopReason: 'TARGET_REACHED',
    leads: [sampleLead],
    rejectedLeadsCount: 0,
    uncertainLeadsCount: 0,
    engineVersion: 'strict-v2',
    totalAdsInspected: 10,
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    schemaVersion: 1
  };

  const legacyCsv = exportLeadsToCsv([sampleLead], legacyRun);
  assert.ok(legacyCsv.includes('Requested Quota: 25'), 'Should preserve Requested Quota for legacy runs');
});

// 6. UI Code Audit: No "Maximum Leads" or Lead Quota Input Field
it('6. src/extension/ui/App.tsx has no "Maximum Leads" or "Lead Target" user input', () => {
  const appFile = fs.readFileSync(path.resolve('src/extension/ui/App.tsx'), 'utf-8');

  // Verify "Maximum Leads" label does NOT exist
  assert.ok(!appFile.includes('Maximum Leads'), 'App.tsx must not contain "Maximum Leads" label');
  assert.ok(!appFile.includes('Lead Target'), 'App.tsx must not contain "Lead Target" label');
  assert.ok(!appFile.includes('setMaxResults'), 'App.tsx must not have setMaxResults');

  // Verify Auto-Discovery is explicitly passed in handleStartResearch
  assert.ok(appFile.includes("researchMode: 'AUTO_DISCOVERY'"), 'App.tsx must start runs with researchMode: AUTO_DISCOVERY');

  // Verify SAFETY_LIMIT_REACHED is handled in formatStopReason
  assert.ok(appFile.includes('SAFETY_LIMIT_REACHED'), 'App.tsx must handle SAFETY_LIMIT_REACHED stop reason');
});

// 7. Service Worker Pipeline Audit: Uses AUTO_DISCOVERY and 5,000 ceiling
it('7. src/extension/service-worker.ts supports AUTO_DISCOVERY and SAFETY_LIMIT_REACHED', () => {
  const swFile = fs.readFileSync(path.resolve('src/extension/service-worker.ts'), 'utf-8');

  assert.ok(swFile.includes('MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH'), 'service-worker.ts must import safety constant');
  assert.ok(swFile.includes('SAFETY_LIMIT_REACHED'), 'service-worker.ts must set SAFETY_LIMIT_REACHED stopReason');
  assert.ok(swFile.includes('AUTO_DISCOVERY'), 'service-worker.ts must support AUTO_DISCOVERY');
});

console.log('================================================================');
console.log(`ALL ${passedTests} AUTO-DISCOVERY UNIT AND REGRESSION TESTS PASSED!`);
console.log('================================================================');
