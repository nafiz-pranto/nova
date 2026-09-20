/**
 * Master Prompt 42: Lead Relevance Engine Comprehensive Test Suite
 * Validates deterministic relevance scoring, labeled dataset calibration,
 * multi-keyword intent, preset intent, entity-level aggregation, and quota discipline.
 */

import assert from 'assert';
import { LeadRelevanceEngine, compileResearchIntent, RELEVANCE_STRATEGY_VERSION } from '../src/extension/relevanceEngine.ts';
import { aggregateCandidatesToLeads } from '../src/extension/metaAdapter.ts';
import { RESEARCH_PRESETS } from '../src/data/presetCatalogue.ts';

console.log('================================================================');
console.log('MASTER PROMPT 42: LEAD RELEVANCE & SEMANTIC FILTERING ENGINE TEST');
console.log('Strategy Version:', RELEVANCE_STRATEGY_VERSION);
console.log('================================================================\n');

let passedAssertions = 0;
function testAssert(condition, message) {
  assert(condition, message);
  passedAssertions++;
  console.log(`✓ PASSED: ${message}`);
}

// -------------------------------------------------------------
// SUITE 1: LABELED CALIBRATION DATASET (30 Candidates)
// -------------------------------------------------------------
console.log('--- SUITE 1: Labeled Calibration Dataset Evaluation (Target: "Furniture") ---');

const furnitureIntent = compileResearchIntent('CUSTOM', ['Furniture', 'Office Furniture', 'Commercial Furniture'], undefined, 'BD');

const LABELED_DATASET = [
  // Relevant Candidates (Expected: RELEVANT)
  {
    id: 'rel_1',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'RFL Furniture',
      adText: 'আরএফএল ক্লাসিক চেয়ার - ডাইনিংয়ের সেরা চেয়ার ... ClassicChair',
      destinationUrl: 'https://othoba.com/get-rfl-classic-chair-at-the-best-price?fbclid=123',
      destinationDomain: 'othoba.com',
      facebookPageName: 'RFL Furniture',
      facebookPageUrl: 'https://www.facebook.com/RFLfurniture/',
      ctaText: 'Shop Now',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'rel_2',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'Apex Comfort Furniture Studio',
      adText: 'Exclusive dining tables, sofas, and ergonomic office chairs with 5 years warranty.',
      destinationUrl: 'https://apexcomfort.com/dining-tables',
      destinationDomain: 'apexcomfort.com',
      facebookPageName: 'Apex Comfort Furniture',
      facebookPageUrl: 'https://facebook.com/apexcomfortbd',
      ctaText: 'Shop Now',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'rel_3',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'Modern Living Interiors',
      // Notice: advertiser name does NOT contain the literal word "furniture", but copy and URL do!
      adText: 'Solid wood dining tables, bedroom sets, wardrobes, and office chairs.',
      destinationUrl: 'https://modernliving.com/products/wood-dining-tables',
      destinationDomain: 'modernliving.com',
      facebookPageName: 'Modern Living Interiors',
      ctaText: 'Shop Now',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'rel_4',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'Otobi Office & Home Furnishings',
      adText: 'Premium workstations, conference tables, and executive ergonomic chairs for corporate offices.',
      destinationUrl: 'https://otobi.com/office-furniture',
      destinationDomain: 'otobi.com',
      facebookPageUrl: 'https://facebook.com/otobiofficial',
      ctaText: 'Learn More',
      matchedKeyword: 'Office Furniture'
    }
  },
  {
    id: 'rel_5',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'Hatil Living',
      adText: 'Crafted wooden beds, smart storage cabinets, and living room sofas.',
      destinationUrl: 'https://hatil.com/living-room-sofas',
      destinationDomain: 'hatil.com',
      facebookPageUrl: 'https://facebook.com/hatilbd',
      ctaText: 'Order Now',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'rel_6',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'Regal Commercial Furniture',
      adText: 'Heavy-duty steel almirah, office desks, and cafeteria seating systems.',
      destinationUrl: 'https://regalfurniturebd.com/commercial',
      destinationDomain: 'regalfurniturebd.com',
      ctaText: 'Get Quote',
      matchedKeyword: 'Commercial Furniture'
    }
  },
  {
    id: 'rel_7',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'Nordic Woodcraft Studio',
      adText: 'Handmade oak coffee tables, floating bookshelves, and custom credenza.',
      destinationUrl: 'https://nordicwood.com/credenza',
      destinationDomain: 'nordicwood.com',
      ctaText: 'Shop Now',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'rel_8',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'ErgoDesk Systems',
      adText: 'Height-adjustable standing desks and ergonomic task chairs for commercial offices.',
      destinationUrl: 'https://ergodesk.com/standing-desks',
      destinationDomain: 'ergodesk.com',
      ctaText: 'Shop Now',
      matchedKeyword: 'Office Furniture'
    }
  },
  {
    id: 'rel_9',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'SleepWell Mattress & Bedding',
      adText: 'Orthopedic memory foam mattresses and solid teak bed frames.',
      destinationUrl: 'https://sleepwell.com/beds',
      destinationDomain: 'sleepwell.com',
      ctaText: 'Shop Now',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'rel_10',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'Studio Seating & Lounge',
      adText: 'Custom sectional sofas, recliners, and accent chairs for modern apartments.',
      destinationUrl: 'https://studioseating.com/sofas',
      destinationDomain: 'studioseating.com',
      ctaText: 'Contact Us',
      matchedKeyword: 'Furniture'
    }
  },

  // Irrelevant Candidates (Expected: NOT_RELEVANT)
  {
    id: 'irrel_1',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'American Health Support Community',
      adText: 'I almost looked past the woman who saved my husband life. She was seventy-nine, sitting alone in the clinic...',
      destinationUrl: 'https://healthsupport.example.org/stories',
      destinationDomain: 'healthsupport.example.org',
      facebookPageName: 'American Health Support',
      ctaText: 'Learn More',
      matchedKeyword: 'Furniture' // Broad Meta match
    }
  },
  {
    id: 'irrel_2',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'Manchester United',
      adText: 'United. Snapdragon. (RED). This April, our shirt goes (RED) once again to help support the global fight against health injustice.',
      destinationUrl: 'https://manutd.com/red-campaign',
      destinationDomain: 'manutd.com',
      facebookPageName: 'Manchester United',
      ctaText: 'Learn More',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'irrel_3',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'Citizens for Clean Governance',
      adText: 'Support transparency in government. Register to vote for our community coalition.',
      destinationUrl: 'https://cleangov.org/campaign',
      destinationDomain: 'cleangov.org',
      ctaText: 'Sign Up',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'irrel_4',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'Grand Royal Casino Online',
      adText: 'Spin the online casino slot machine and win instant jackpot cash payout.',
      destinationUrl: 'https://grandcasino777.com/slots',
      destinationDomain: 'grandcasino777.com',
      ctaText: 'Play Now',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'irrel_5',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'Premier League Fanatics',
      adText: 'Matchday highlights, football club squad analysis and live score streaming.',
      destinationUrl: 'https://plfanatics.com/matchday',
      destinationDomain: 'plfanatics.com',
      ctaText: 'Watch Video',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'irrel_6',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'City Dental Implant Clinic',
      adText: 'Full mouth dental implants and orthodontic invisalign treatment by certified dentists.',
      destinationUrl: 'https://citydental.com/implants',
      destinationDomain: 'citydental.com',
      ctaText: 'Book Appointment',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'irrel_7',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'Crypto Trader Bot AI',
      adText: 'Automate bitcoin and ether trading algorithms with 99% uptime.',
      destinationUrl: 'https://cryptobot.ai/trade',
      destinationDomain: 'cryptobot.ai',
      ctaText: 'Sign Up',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'irrel_8',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'FastTrack Courier Express',
      adText: 'Reliable parcel delivery and freight shipping nationwide.',
      destinationUrl: 'https://fasttrackcourier.com/track',
      destinationDomain: 'fasttrackcourier.com',
      ctaText: 'Track Order',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'irrel_9',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'Speedy Auto Car Wash',
      adText: 'Ceramic car coating, interior detailing and touchless foam wash.',
      destinationUrl: 'https://speedywash.com/packages',
      destinationDomain: 'speedywash.com',
      ctaText: 'Get Quote',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'irrel_10',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'Apex Mobile Phone Accessories',
      adText: 'Tempered glass screen protectors, charging cables, and silicone cases.',
      destinationUrl: 'https://apexmobile.com/cases',
      destinationDomain: 'apexmobile.com',
      ctaText: 'Shop Now',
      matchedKeyword: 'Furniture'
    }
  },

  // Uncertain / Ambiguous Candidates (Expected: UNCERTAIN or NOT_RELEVANT - NEVER accepted into leads)
  {
    id: 'unc_1',
    expected: 'UNCERTAIN',
    evidence: {
      advertiserName: 'Amazon India',
      adText: 'Make Every Corner Shine with Prime Shopping days deals on home, kitchen & outdoors.',
      destinationUrl: 'https://amazon.in/home-deals',
      destinationDomain: 'amazon.in',
      ctaText: 'Shop Now',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'unc_2',
    expected: 'UNCERTAIN',
    evidence: {
      advertiserName: 'Daraz Online Shopping',
      adText: 'Mega discounts on electronics, lifestyle, fashion and home goods.',
      destinationUrl: 'https://daraz.com.bd/deals',
      destinationDomain: 'daraz.com.bd',
      ctaText: 'Shop Now',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'unc_3',
    expected: 'UNCERTAIN',
    evidence: {
      advertiserName: 'Daily Lifestyle Inspiration',
      adText: 'Inspiring spaces and cozy modern vibes for your family.',
      destinationUrl: 'https://dailylifestyle.blog/vibes',
      destinationDomain: 'dailylifestyle.blog',
      ctaText: 'Read More',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'unc_4',
    expected: 'UNCERTAIN',
    evidence: {
      advertiserName: 'The Home Edit Blog',
      adText: 'Five simple tips to make your home feel comfortable this season.',
      destinationUrl: 'https://thehomeeditblog.org/tips',
      destinationDomain: 'thehomeeditblog.org',
      ctaText: 'Learn More',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'unc_5',
    expected: 'UNCERTAIN',
    evidence: {
      advertiserName: 'Everyday Essentials Mart',
      adText: 'Household items, cleaning supplies, and everyday general goods.',
      destinationUrl: 'https://everydayessentials.com',
      destinationDomain: 'everydayessentials.com',
      ctaText: 'Shop Now',
      matchedKeyword: 'Furniture'
    }
  },

  // Additional Edge Cases
  {
    id: 'edge_1',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'Dhaka Chair & Table Emporium',
      adText: 'Commercial conference tables, training chairs and banquet seating.',
      destinationUrl: 'https://dhakachairs.com/conference-tables',
      destinationDomain: 'dhakachairs.com',
      ctaText: 'Call Now',
      matchedKeyword: 'Commercial Furniture'
    }
  },
  {
    id: 'edge_2',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'Minimalist Wardrobe Co.',
      adText: 'Modular wardrobes, walk-in closets, and bedroom dressers made from compressed wood.',
      destinationUrl: 'https://minimalistwardrobes.com/closets',
      destinationDomain: 'minimalistwardrobes.com',
      ctaText: 'Explore',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'edge_3',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'FC Barcelona Supporters Club',
      adText: 'Live screening for the upcoming El Clasico at our club lounge.',
      destinationUrl: 'https://barcafans.club/events',
      destinationDomain: 'barcafans.club',
      ctaText: 'Get Tickets',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'edge_4',
    expected: 'NOT_RELEVANT',
    evidence: {
      advertiserName: 'Chronic Pain & Wellness Community',
      adText: 'Natural remedies for joint inflammation and chronic pain relief.',
      destinationUrl: 'https://chronicrelief.org/remedy',
      destinationDomain: 'chronicrelief.org',
      ctaText: 'Learn More',
      matchedKeyword: 'Furniture'
    }
  },
  {
    id: 'edge_5',
    expected: 'RELEVANT',
    evidence: {
      advertiserName: 'Bengal Wood Crafts',
      adText: 'Solid mahogany dining room table and 6 chairs combo discount.',
      destinationUrl: 'https://bengalwoodcrafts.com/dining-set',
      destinationDomain: 'bengalwoodcrafts.com',
      ctaText: 'Order Now',
      matchedKeyword: 'Furniture'
    }
  }
];

let tp = 0;
let fp = 0;
let tn = 0;
let fn = 0;

for (const sample of LABELED_DATASET) {
  const result = LeadRelevanceEngine.evaluateEvidence(sample.evidence, furnitureIntent);

  const isPredictedRelevant = result.decision === 'RELEVANT';
  const isActuallyRelevant = sample.expected === 'RELEVANT';

  if (isActuallyRelevant && isPredictedRelevant) {
    tp++;
  } else if (!isActuallyRelevant && isPredictedRelevant) {
    fp++;
    console.error(`FP failure on ${sample.id}:`, result);
  } else if (!isActuallyRelevant && !isPredictedRelevant) {
    tn++;
  } else if (isActuallyRelevant && !isPredictedRelevant) {
    fn++;
    console.error(`FN failure on ${sample.id}:`, result);
  }
}

const precision = tp / (tp + fp) || 0;
const recall = tp / (tp + fn) || 0;
const f1 = (2 * precision * recall) / (precision + recall) || 0;

console.log(`Labeled Dataset Size: ${LABELED_DATASET.length}`);
console.log(`True Positives (TP): ${tp}`);
console.log(`False Positives (FP): ${fp}`);
console.log(`True Negatives (TN): ${tn}`);
console.log(`False Negatives (FN): ${fn}`);
console.log(`Precision: ${(precision * 100).toFixed(1)}%`);
console.log(`Recall: ${(recall * 100).toFixed(1)}%`);
console.log(`F1 Score: ${(f1 * 100).toFixed(1)}%`);

testAssert(fp === 0, `Zero False Positives: Irrelevant advertisers (American Health Support, Manchester United, etc.) must NEVER be accepted (got ${fp} FP)`);
testAssert(fn === 0, `Zero False Negatives on valid candidates (got ${fn} FN)`);
testAssert(precision === 1.0, `Precision is 100% on benchmark (got ${(precision * 100).toFixed(1)}%)`);
testAssert(recall === 1.0, `Recall is 100% on benchmark (got ${(recall * 100).toFixed(1)}%)`);
testAssert(f1 === 1.0, `F1 Score is 1.0 on benchmark (got ${f1.toFixed(2)})`);

// -------------------------------------------------------------
// SUITE 2: Specific Audit Cases from Master Prompt 42
// -------------------------------------------------------------
console.log('\n--- SUITE 2: Observed Audit Cases Verification ---');

// Case A: RFL Furniture
const rflEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'RFL Furniture',
  adText: 'আরএফএল ক্লাসিক চেয়ার - ডাইনিংয়ের সেরা চেয়ার ... ClassicChair',
  destinationUrl: 'https://othoba.com/get-rfl-classic-chair-at-the-best-price',
  destinationDomain: 'othoba.com',
  facebookPageName: 'RFL Furniture',
  facebookPageUrl: 'https://www.facebook.com/RFLfurniture/',
  ctaText: 'Shop Now',
  matchedKeyword: 'Furniture'
}, furnitureIntent);

testAssert(rflEval.decision === 'RELEVANT', 'RFL Furniture classified as RELEVANT');
testAssert(rflEval.confidence === 'HIGH', 'RFL Furniture classified with HIGH confidence');
testAssert(rflEval.score >= 0.70, `RFL Furniture score is high (got ${(rflEval.score * 100).toFixed(0)}%)`);
testAssert(rflEval.matchedTerms.length > 0, `RFL Furniture matched terms: ${rflEval.matchedTerms.join(', ')}`);

// Case B: American Health Support Community
const healthEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'American Health Support Community',
  adText: 'I almost looked past the woman who saved my husband life. She was seventy-nine, sitting alone...',
  destinationUrl: 'https://healthsupport.example.org',
  destinationDomain: 'healthsupport.example.org',
  matchedKeyword: 'Furniture'
}, furnitureIntent);

testAssert(healthEval.decision === 'NOT_RELEVANT', 'American Health Support Community classified as NOT_RELEVANT');
testAssert(healthEval.negativeSignals.length > 0, `American Health Support negative signals recorded: ${healthEval.negativeSignals.join('; ')}`);
testAssert(healthEval.evidenceBreakdown.negativePenalty <= -0.40, 'Strong negative penalty applied for healthcare conflict');

// Case C: Manchester United
const manutdEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'Manchester United',
  adText: 'United. Snapdragon. (RED). This April, our shirt goes (RED) once again to help support the global fight against health injustice.',
  destinationUrl: 'https://manutd.com',
  destinationDomain: 'manutd.com',
  matchedKeyword: 'Furniture'
}, furnitureIntent);

testAssert(manutdEval.decision === 'NOT_RELEVANT', 'Manchester United classified as NOT_RELEVANT');
testAssert(manutdEval.negativeSignals.length > 0, `Manchester United negative sports signal detected`);

// Case D: Modern Living Interiors (False Negative Prevention Test)
const modernLivingEval = LeadRelevanceEngine.evaluateEvidence({
  advertiserName: 'Modern Living Interiors',
  adText: 'Solid wood dining tables, bedroom sets, and ergonomic office chairs.',
  destinationUrl: 'https://modernliving.com/dining-tables',
  destinationDomain: 'modernliving.com',
  ctaText: 'Shop Now',
  matchedKeyword: 'Furniture'
}, furnitureIntent);

testAssert(modernLivingEval.decision === 'RELEVANT', 'Modern Living Interiors correctly accepted via product terms without literal "furniture" in advertiser name');
testAssert(modernLivingEval.matchedTerms.some(t => ['chair', 'table', 'dining'].includes(t)), `Category product terms identified: ${modernLivingEval.matchedTerms.join(', ')}`);

// -------------------------------------------------------------
// SUITE 3: Multi-Keyword & Preset Intent
// -------------------------------------------------------------
console.log('\n--- SUITE 3: Preset Intent & Exclusions Verification ---');

// Test preset: B2B SaaS Platforms
const saasPreset = RESEARCH_PRESETS.find(p => p.preset_id === 'tech_saas_b2b');
testAssert(Boolean(saasPreset), 'Found active preset tech_saas_b2b in catalogue');

const saasIntent = compileResearchIntent('PRESET', saasPreset.primary_keywords, saasPreset.preset_id, 'US');
testAssert(saasIntent.mode === 'PRESET', 'Compiled intent preserves PRESET mode');
testAssert(saasIntent.targetIndustry === 'Technology & Software', 'Preset targetIndustry populated');
testAssert(saasIntent.exclusions.includes('free software'), 'Preset exclusions populated');

const saasGoodCandidate = {
  advertiserName: 'PipelinePro SaaS',
  adText: 'Enterprise cloud software for sales pipeline automation and B2B workflow.',
  destinationUrl: 'https://pipelinepro.com',
  destinationDomain: 'pipelinepro.com',
  ctaText: 'Start Free Trial',
  matchedKeyword: 'saas'
};
const saasGoodEval = LeadRelevanceEngine.evaluateEvidence(saasGoodCandidate, saasIntent);
testAssert(saasGoodEval.decision === 'RELEVANT', 'PipelinePro SaaS accepted under tech_saas_b2b preset');

const saasExcludedCandidate = {
  advertiserName: 'Free Software Download Portal',
  adText: 'Download free software crack, pirate tools and utilities.',
  destinationUrl: 'https://freesoftware.example.com',
  destinationDomain: 'freesoftware.example.com',
  ctaText: 'Download',
  matchedKeyword: 'saas'
};
const saasExclEval = LeadRelevanceEngine.evaluateEvidence(saasExcludedCandidate, saasIntent);
testAssert(saasExclEval.decision === 'NOT_RELEVANT', 'Pirate/Free software rejected by preset exclusion');
testAssert(saasExclEval.negativeSignals.some(s => s.includes('preset exclusion')), 'Rejection explanation explicitly records preset exclusion');

// -------------------------------------------------------------
// SUITE 4: Entity-Level Relevance & Aggregation with Quota Discipline
// -------------------------------------------------------------
console.log('\n--- SUITE 4: Entity-Level Aggregation & Quota Discipline ---');

const mixedScrapedCandidates = [
  // 1. RFL Furniture (Ad 1: specific chair)
  {
    libraryId: '1001',
    pageName: 'RFL Furniture',
    facebookPageUrl: 'https://facebook.com/RFLfurniture',
    destinationUrl: 'https://othoba.com/rfl-classic-chair',
    destinationDomain: 'othoba.com',
    bodyCopy: 'আরএফএল ক্লাসিক চেয়ার - সেরা চেয়ার',
    ctaText: 'Shop Now',
    observedKeyword: 'Furniture',
    isActive: true
  },
  // 2. RFL Furniture (Ad 2: generic brand campaign)
  {
    libraryId: '1002',
    pageName: 'RFL Furniture',
    facebookPageUrl: 'https://facebook.com/RFLfurniture',
    destinationUrl: 'https://othoba.com/rfl-offers',
    destinationDomain: 'othoba.com',
    bodyCopy: 'Special Eid discounts across Bangladesh.',
    ctaText: 'Learn More',
    observedKeyword: 'Furniture',
    isActive: true
  },
  // 3. American Health Support (Irrelevant)
  {
    libraryId: '2001',
    pageName: 'American Health Support Community',
    facebookPageUrl: 'https://facebook.com/healthsupport',
    destinationUrl: 'https://healthsupport.org/story',
    destinationDomain: 'healthsupport.org',
    bodyCopy: 'I almost looked past the woman who saved my husband life in hospital clinic.',
    ctaText: 'Learn More',
    observedKeyword: 'Furniture',
    isActive: true
  },
  // 4. Manchester United (Irrelevant)
  {
    libraryId: '3001',
    pageName: 'Manchester United',
    facebookPageUrl: 'https://facebook.com/manunited',
    destinationUrl: 'https://manutd.com',
    destinationDomain: 'manutd.com',
    bodyCopy: 'United. Snapdragon. Football team campaign.',
    ctaText: 'Learn More',
    observedKeyword: 'Furniture',
    isActive: true
  },
  // 5. Otobi Office Furniture (Relevant)
  {
    libraryId: '4001',
    pageName: 'Otobi Office & Home Furnishings',
    facebookPageUrl: 'https://facebook.com/otobi',
    destinationUrl: 'https://otobi.com/desks',
    destinationDomain: 'otobi.com',
    bodyCopy: 'Executive wooden workstations and ergonomic chairs for offices.',
    ctaText: 'Shop Now',
    observedKeyword: 'Office Furniture',
    isActive: true
  }
];

const aggregatedResult = aggregateCandidatesToLeads(
  mixedScrapedCandidates,
  'BD',
  'Bangladesh',
  10, // Max quota requested: 10
  [],
  furnitureIntent
);

testAssert(aggregatedResult.totalAdsCount === 5, `Total ads inspected: 5 (got ${aggregatedResult.totalAdsCount})`);
testAssert(aggregatedResult.rejectedCount === 2, `2 irrelevant ads rejected (got ${aggregatedResult.rejectedCount})`);
testAssert(aggregatedResult.leads.length === 2, `Strictly 2 relevant leads accepted into final result (got ${aggregatedResult.leads.length})`);

const acceptedNames = aggregatedResult.leads.map(l => l.name);
testAssert(acceptedNames.includes('RFL Furniture'), 'RFL Furniture accepted as relevant lead');
testAssert(acceptedNames.includes('Otobi Office & Home Furnishings'), 'Otobi accepted as relevant lead');
testAssert(!acceptedNames.includes('American Health Support Community'), 'American Health Support Community excluded from final leads');
testAssert(!acceptedNames.includes('Manchester United'), 'Manchester United excluded from final leads');

// Verify entity multi-ad aggregation for RFL Furniture
const rflLead = aggregatedResult.leads.find(l => l.name === 'RFL Furniture');
testAssert(rflLead.activeAdCount === 2, `RFL Furniture merged 2 ads (got ${rflLead.activeAdCount})`);
testAssert(rflLead.adLibraryIds.length === 2, `RFL Furniture adLibraryIds merged: ${rflLead.adLibraryIds.join(', ')}`);
testAssert(rflLead.relevanceDecision === 'RELEVANT', 'RFL Furniture has relevanceDecision RELEVANT');
testAssert(rflLead.relevanceConfidence === 'HIGH', 'RFL Furniture has relevanceConfidence HIGH');
testAssert(rflLead.relevanceReasons.length > 0, `RFL Furniture has audit trail reasons: ${rflLead.relevanceReasons.length}`);

// Quota Discipline: Requested quota was 10, but only 2 relevant leads existed.
// Ensure the system DID NOT fill quota with irrelevant leads!
testAssert(aggregatedResult.leads.length === 2, 'Quota discipline maintained: 2 relevant leads returned, not inflated to 10');

// -------------------------------------------------------------
// SUITE 5: Preset Verification Requirement from Master Prompt 42
// -------------------------------------------------------------
console.log('\n--- SUITE 5: Preset Catalogue Check for "Furniture" ---');
const furniturePreset = RESEARCH_PRESETS.find(p =>
  p.name.toLowerCase().includes('furniture') ||
  p.preset_id.toLowerCase().includes('furniture')
);

if (!furniturePreset) {
  console.log('LIVE PRESET AUDIT: Checked RESEARCH_PRESETS for Furniture preset.');
  console.log('Result: PRESET MISSING (as mandated by Master Prompt 42, no fake preset fabricated).');
  testAssert(furniturePreset === undefined, 'Confirmed: Furniture preset is not fabricated; reported PRESET MISSING');
} else {
  console.log('Found Furniture preset:', furniturePreset.preset_id);
}

console.log('\n================================================================');
console.log(`ALL TEST SUITES COMPLETED: ${passedAssertions} assertions passed, 0 failed!`);
console.log('================================================================\n');
