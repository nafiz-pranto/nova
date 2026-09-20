/**
 * Strict Relevance Gate v2 Comprehensive Test Suite
 * Validates the multi-stage deterministic pipeline, evidence sufficiency rules,
 * false-positive regressions, false-negative protections, multi-category taxonomy,
 * multi-card deduplication, quota discipline, and auditable structured evidence.
 */

import assert from 'assert';
import {
  LeadRelevanceEngine,
  compileResearchIntent,
  RELEVANCE_STRATEGY_VERSION,
  RELEVANCE_ENGINE_VERSION
} from '../src/extension/relevanceEngine.ts';
import { aggregateCandidatesToLeads, exportLeadsToCsv, sanitizeCsvField } from '../src/extension/metaAdapter.ts';

console.log('================================================================');
console.log('STRICT RELEVANCE GATE V2 COMPREHENSIVE VERIFICATION SUITE');
console.log('Engine Version:', RELEVANCE_ENGINE_VERSION);
console.log('Strategy Version:', RELEVANCE_STRATEGY_VERSION);
console.log('================================================================\n');

let passedTests = 0;
function testAssert(condition, message) {
  assert(condition, message);
  passedTests++;
  console.log(`✓ [PASS] ${message}`);
}

// -------------------------------------------------------------
// TEST SUITE 1: Evidence Object & Pipeline Traceability
// -------------------------------------------------------------
console.log('--- TEST SUITE 1: Evidence Object & Pipeline Traceability ---');

const testIntent = compileResearchIntent('CUSTOM', ['Furniture', 'Office Furniture'], undefined, 'US');

const rflEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'RFL Furniture',
  adText: 'Shop solid wooden dining tables, ergonomic office chairs, and executive desks.',
  destinationUrl: 'https://othoba.com/rfl-furniture/dining-tables',
  destinationDomain: 'othoba.com',
  facebookPageName: 'RFL Furniture Official',
  facebookPageUrl: 'https://facebook.com/rflfurniture',
  ctaText: 'Shop Now',
  matchedKeyword: 'Furniture'
}, testIntent);

testAssert(rflEval.decision === 'RELEVANT', 'Valid furniture advertiser classified as RELEVANT');
testAssert(rflEval.confidence === 'HIGH', 'Confidence is HIGH for strong entity and category evidence');
testAssert(rflEval.engineVersion === 'strict-v2', 'Engine version correctly tagged as strict-v2');
testAssert(rflEval.strategyVersion === 2, 'Strategy version is 2');
testAssert(Array.isArray(rflEval.evidence) && rflEval.evidence.length >= 3, 'Evidence array contains multiple structured signals');
testAssert(rflEval.evidence.some(e => e.type === 'ENTITY_IDENTITY' && e.strength === 'STRONG'), 'Strong entity identity evidence recorded');
testAssert(rflEval.evidence.some(e => e.type === 'CATEGORY_MATCH'), 'Category match evidence recorded');
testAssert(rflEval.evidence.some(e => e.type === 'COMMERCIAL_INTENT'), 'Commercial intent evidence recorded');
testAssert(rflEval.conflicts.length === 0, 'No conflicts detected for legitimate advertiser');
testAssert(rflEval.reasonCode === 'ACCEPT_STRONG_ENTITY_MATCH', 'Reason code is ACCEPT_STRONG_ENTITY_MATCH');

// -------------------------------------------------------------
// TEST SUITE 2: Hard Contradiction & False-Positive Regressions
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Hard Contradiction & False-Positive Regressions ---');

// Case A: Sports Club mentioning furniture/seating in passing
const sportsEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'Manchester United',
  adText: 'Exclusive behind-the-scenes view of the stadium lounge chairs and corporate boxes at Old Trafford. United Snapdragon.',
  destinationUrl: 'https://manutd.com/stadium-boxes',
  destinationDomain: 'manutd.com',
  ctaText: 'Learn More',
  matchedKeyword: 'Furniture'
}, testIntent);

testAssert(sportsEval.decision === 'NOT_RELEVANT', 'Sports entity mentioning chairs is strictly NOT_RELEVANT');
testAssert(sportsEval.conflicts.length > 0, 'Conflict evidence captured for sports entity');
testAssert(sportsEval.conflicts.some(c => c.type === 'CONTRADICTION'), 'CONTRADICTION signal recorded');
testAssert(sportsEval.reasonCode === 'REJECT_CONTRADICTION_IDENTITY', 'Reason code reflects contradiction identity');

// Case B: Healthcare support / Clinic mentioning sitting or chair
const clinicEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'American Health Support Community',
  adText: 'She was seventy-nine, sitting alone in the clinic waiting area. Help fight cancer and disease.',
  destinationUrl: 'https://healthsupport.example.org/stories',
  destinationDomain: 'healthsupport.example.org',
  ctaText: 'Donate',
  matchedKeyword: 'Furniture'
}, testIntent);

testAssert(clinicEval.decision === 'NOT_RELEVANT', 'Healthcare community mentioning sitting is strictly NOT_RELEVANT');
testAssert(clinicEval.conflicts.some(c => c.reasonCode === 'REJECT_CONTRADICTION_IDENTITY'), 'Healthcare contradiction detected');

// Case C: Political campaign
const politicalEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'Citizens for Clean Governance',
  adText: 'Support transparency in government. Join our committee at the round table for democratic reform.',
  destinationUrl: 'https://cleangov.example.org/reform',
  destinationDomain: 'cleangov.example.org',
  ctaText: 'Sign Up',
  matchedKeyword: 'Furniture'
}, testIntent);

testAssert(politicalEval.decision === 'NOT_RELEVANT', 'Political campaign mentioning round table is strictly NOT_RELEVANT');

// Case D: Casino / Betting mentioning table
const casinoEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'Vegas Royale Casino',
  adText: 'Play live blackjack and poker tables with 100% deposit bonus. Spin the wheel now!',
  destinationUrl: 'https://vegasroyale.example.com',
  destinationDomain: 'vegasroyale.example.com',
  ctaText: 'Play Now',
  matchedKeyword: 'Furniture'
}, testIntent);

testAssert(casinoEval.decision === 'NOT_RELEVANT', 'Casino mentioning table is strictly NOT_RELEVANT');

// -------------------------------------------------------------
// TEST SUITE 3: Weak Ad Copy Alone & Meta Keyword Inclusion
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Weak Ad Copy Alone & Meta Inclusion Rejection ---');

// A generic business mentioning "furniture" once in ad copy with zero catalog or business identity
const weakCopyEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'Global Cloud Systems Ltd',
  adText: 'We build enterprise software solutions for modern offices, including desk and furniture company inventory tracking.',
  destinationUrl: 'https://globalcloud.example.com/solutions',
  destinationDomain: 'globalcloud.example.com',
  ctaText: 'Contact Us',
  matchedKeyword: 'Furniture'
}, testIntent);

testAssert(weakCopyEval.decision !== 'RELEVANT', 'Generic software mentioning furniture in passing is NEVER RELEVANT');
testAssert(weakCopyEval.decision === 'UNCERTAIN' || weakCopyEval.decision === 'NOT_RELEVANT', 'Classified as UNCERTAIN or NOT_RELEVANT');

// A candidate with no evidence except broad keyword
const emptyAdEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'Acme Holding Group',
  adText: 'Empowering communities through shared initiatives.',
  destinationUrl: 'https://acmeholding.example.com',
  destinationDomain: 'acmeholding.example.com',
  ctaText: 'Learn More',
  matchedKeyword: 'Furniture'
}, testIntent);

testAssert(emptyAdEval.decision === 'NOT_RELEVANT', 'Empty ad copy with no entity/category match is NOT_RELEVANT');
testAssert(emptyAdEval.reasonCode === 'REJECT_INSUFFICIENT_EVIDENCE', 'Reason code is REJECT_INSUFFICIENT_EVIDENCE');

// -------------------------------------------------------------
// TEST SUITE 4: False-Negative Protection (Name Lacks Literal Query)
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 4: False-Negative Protection (Rich Catalog, Non-Literal Name) ---');

// "Modern Living Interiors" has no "furniture" in name, but sells tables, beds, wardrobes, chairs
const richCatalogEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'Modern Living Interiors',
  adText: 'Solid wood dining tables, bedroom sets, wardrobes, and ergonomic office chairs with 5-year warranty.',
  destinationUrl: 'https://modernliving.com/products/wood-dining-tables',
  destinationDomain: 'modernliving.com',
  facebookPageName: 'Modern Living Interiors',
  ctaText: 'Shop Now',
  matchedKeyword: 'Furniture'
}, testIntent);

testAssert(richCatalogEval.decision === 'RELEVANT', 'Legitimate furniture retailer with non-literal name accepted via product catalog');
testAssert(richCatalogEval.confidence === 'HIGH', 'High confidence due to catalog + commercial corroboration');
testAssert(richCatalogEval.evidence.some(e => e.reasonCode === 'SIGNAL_COPY_PRODUCT_CATALOG'), 'SIGNAL_COPY_PRODUCT_CATALOG recognized');

// -------------------------------------------------------------
// TEST SUITE 5: Generalizable Multi-Category Taxonomy
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 5: Generalizable Multi-Category Taxonomy ---');

// Category: Restaurant
const restaurantIntent = compileResearchIntent('CUSTOM', ['Restaurant', 'Fine Dining'], undefined, 'US');
const bistroEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'Le Petit Bistro & Kitchen',
  adText: 'Experience authentic French cuisine crafted by our executive chef. Reserve your dinner table or order catering.',
  destinationUrl: 'https://lepetitbistro.example.com/menu',
  destinationDomain: 'lepetitbistro.example.com',
  ctaText: 'Book Now',
  matchedKeyword: 'Restaurant'
}, restaurantIntent);

testAssert(bistroEval.decision === 'RELEVANT', 'Bistro correctly recognized under Restaurant taxonomy');

// Category: Dental
const dentalIntent = compileResearchIntent('CUSTOM', ['Dental Clinic', 'Dentist'], undefined, 'US');
const dentalEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'BrightSmile Family Dentistry',
  adText: 'Comprehensive dental exams, teeth whitening, clear invisalign aligners, and dental implants.',
  destinationUrl: 'https://brightsmiledental.example.com',
  destinationDomain: 'brightsmiledental.example.com',
  ctaText: 'Contact Us',
  matchedKeyword: 'Dental Clinic'
}, dentalIntent);

testAssert(dentalEval.decision === 'RELEVANT', 'Dental clinic correctly recognized under Dental taxonomy');

// Category: Roofing
const roofingIntent = compileResearchIntent('CUSTOM', ['Roofing Contractor', 'Roof Repair'], undefined, 'US');
const roofingEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'Summit Roofing & Exteriors',
  adText: 'Licensed roofing specialists. Shingle replacement, metal roof installation, and emergency leak repair.',
  destinationUrl: 'https://summitroofing.example.com/services',
  destinationDomain: 'summitroofing.example.com',
  ctaText: 'Get Quote',
  matchedKeyword: 'Roofing Contractor'
}, roofingIntent);

testAssert(roofingEval.decision === 'RELEVANT', 'Roofing contractor correctly recognized under Roofing taxonomy');

// -------------------------------------------------------------
// TEST SUITE 6: Multi-Card Deduplication & Anti-Inflation
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 6: Multi-Card Deduplication & Anti-Inflation ---');

// Case A: 3 identical ads from same advertiser should NOT inflate score
const duplicateCards = [
  {
    libraryId: 'ad_101',
    pageName: 'Urban Living Studio',
    bodyCopy: 'Modern dining tables, bedroom sets, and ergonomic chairs for sale.',
    destinationUrl: 'https://urbanliving.com/dining-tables',
    destinationDomain: 'urbanliving.com',
    ctaText: 'Shop Now',
    isActive: true,
    observedKeyword: 'Furniture'
  },
  {
    libraryId: 'ad_102',
    pageName: 'Urban Living Studio',
    bodyCopy: 'Modern dining tables, bedroom sets, and ergonomic chairs for sale.', // Duplicate copy
    destinationUrl: 'https://urbanliving.com/dining-tables',
    destinationDomain: 'urbanliving.com',
    ctaText: 'Shop Now',
    isActive: true,
    observedKeyword: 'Furniture'
  },
  {
    libraryId: 'ad_103',
    pageName: 'Urban Living Studio',
    bodyCopy: 'Modern dining tables, bedroom sets, and ergonomic chairs for sale.', // Duplicate copy
    destinationUrl: 'https://urbanliving.com/dining-tables',
    destinationDomain: 'urbanliving.com',
    ctaText: 'Shop Now',
    isActive: true,
    observedKeyword: 'Furniture'
  }
];

const singleEval = LeadRelevanceEngine.evaluateCandidate(duplicateCards[0], testIntent);
const multiEval = LeadRelevanceEngine.evaluateEntity('Urban Living Studio', duplicateCards, testIntent);

testAssert(multiEval.decision === 'RELEVANT', 'Advertiser with duplicate ads classified as RELEVANT');
testAssert(
  Math.abs(multiEval.score - singleEval.score) <= 0.05,
  `Identical ad copies do not inflate score (single: ${singleEval.score}, multi: ${multiEval.score})`
);

// Case B: Contradiction in any ad disqualifies entity
const mixedCards = [
  {
    libraryId: 'ad_201',
    pageName: 'Metro Club United',
    bodyCopy: 'Office seating available in hospitality suites.',
    isActive: true,
    observedKeyword: 'Furniture'
  },
  {
    libraryId: 'ad_202',
    pageName: 'Metro Club United',
    bodyCopy: 'Matchday tickets now available for the Premier League clash!',
    isActive: true,
    observedKeyword: 'Furniture'
  }
];

const mixedEntityEval = LeadRelevanceEngine.evaluateEntity('Metro Club United', mixedCards, testIntent);
testAssert(mixedEntityEval.decision === 'NOT_RELEVANT', 'Entity with sports contradiction in any ad is strictly disqualified');

// -------------------------------------------------------------
// TEST SUITE 7: Quota Discipline & Aggregation
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 7: Quota Discipline & Run Counters ---');

const mixedBatch = [
  // 2 Valid Furniture advertisers (3 ads total)
  {
    libraryId: 'm1',
    pageName: 'Hatil Living',
    bodyCopy: 'Wooden beds, smart storage cabinets, and living room sofas.',
    destinationUrl: 'https://hatil.com/products/sofas',
    destinationDomain: 'hatil.com',
    ctaText: 'Shop Now',
    isActive: true,
    observedKeyword: 'Furniture'
  },
  {
    libraryId: 'm2',
    pageName: 'Hatil Living',
    bodyCopy: 'Ergonomic chairs and executive desks.',
    destinationUrl: 'https://hatil.com/products/desks',
    destinationDomain: 'hatil.com',
    ctaText: 'Shop Now',
    isActive: true,
    observedKeyword: 'Furniture'
  },
  {
    libraryId: 'm3',
    pageName: 'Otobi Furnishings',
    bodyCopy: 'Modern office workstations, conference tables, and chairs.',
    destinationUrl: 'https://otobi.com/office-workstations',
    destinationDomain: 'otobi.com',
    ctaText: 'Shop Now',
    isActive: true,
    observedKeyword: 'Office Furniture'
  },
  // 2 Irrelevant advertisers
  {
    libraryId: 'm4',
    pageName: 'Manchester United',
    bodyCopy: 'Official merchandise and matchday hospitality.',
    isActive: true,
    observedKeyword: 'Furniture'
  },
  {
    libraryId: 'm5',
    pageName: 'Health Support Community',
    bodyCopy: 'Patient care and clinical research stories.',
    isActive: true,
    observedKeyword: 'Furniture'
  },
  // 1 Uncertain advertiser (keyword in passing, no entity proof)
  {
    libraryId: 'm6',
    pageName: 'Global Cloud Systems',
    bodyCopy: 'Software tools for managing modern business furniture inventories.',
    isActive: true,
    observedKeyword: 'Furniture'
  }
];

const targetQuota = 100; // Requested high quota!
const aggResult = aggregateCandidatesToLeads(mixedBatch, 'BD', 'Bangladesh', targetQuota, [], testIntent);

testAssert(aggResult.leads.length === 2, `Strict quota discipline: Exactly 2 relevant leads returned, not inflated to ${targetQuota} (got ${aggResult.leads.length})`);
testAssert(aggResult.rejectedCount === 2, `Rejected count is 2 (got ${aggResult.rejectedCount})`);
testAssert(aggResult.uncertainCount === 1, `Uncertain count is 1 (got ${aggResult.uncertainCount})`);
testAssert(aggResult.counters.rawAds === 6, `Raw ads counter is 6 (got ${aggResult.counters.rawAds})`);
testAssert(aggResult.counters.finalUniqueLeads === 2, `Final unique leads counter is 2 (got ${aggResult.counters.finalUniqueLeads})`);
testAssert(aggResult.counters.duplicatesRemoved === 4, `Duplicates removed counter is 4 (got ${aggResult.counters.duplicatesRemoved})`);

// -------------------------------------------------------------
// TEST SUITE 8: CSV Export Transparency & Formula Safety
// -------------------------------------------------------------
console.log('\n--- TEST SUITE 8: CSV Export Transparency & Formula Safety ---');

const testLead = aggResult.leads[0];
const csvOutput = exportLeadsToCsv([testLead]);

testAssert(csvOutput.includes('Relevance Decision'), 'CSV contains Relevance Decision header');
testAssert(csvOutput.includes('Relevance Score'), 'CSV contains Relevance Score header');
testAssert(csvOutput.includes('Relevance Confidence'), 'CSV contains Relevance Confidence header');
testAssert(csvOutput.includes('Relevance Matched Terms'), 'CSV contains Relevance Matched Terms header');
testAssert(csvOutput.includes('Relevance Explanation'), 'CSV contains Relevance Explanation header');
testAssert(csvOutput.includes('Engine Version'), 'CSV contains Engine Version header');
testAssert(csvOutput.includes('strict-v2'), 'CSV rows include strict-v2 engine version');

// Formula injection protection check
const maliciousInput = '=cmd|"/C calc"!A0';
const sanitized = sanitizeCsvField(maliciousInput);
testAssert(sanitized.startsWith(`"'=`), `Formula injection is escaped with leading single-quote (got ${sanitized})`);

console.log('\n================================================================');
console.log(`STRICT RELEVANCE GATE V2 VERIFICATION COMPLETE!`);
console.log(`All ${passedTests} assertions passed cleanly.`);
console.log('================================================================');
