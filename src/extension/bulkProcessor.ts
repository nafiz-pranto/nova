/**
 * Bulk Processing Engine for LeadNoria (Phase 2)
 *
 * Implements bounded extraction batch processing:
 * 1. Filter out duplicate ads via seenAdLibraryIds
 * 2. Resolve stable entity identity (canonical name, page ID, domain)
 * 3. Evaluate new entities against Strict Relevance Gate v2
 * 4. Entity-level anti-inflation (1 advertiser with 100 ads = 1 entity)
 * 5. Global 5,000 unique relevant leads safety cap
 * 6. Return batch persistence payload and updated truthful counters
 */

import { MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH } from './types.ts';
import type {
  ScrapedAdCandidate,
  ExtensionLead,
  RunCounters,
  StructuredEvidence
} from './types.ts';
import { LeadRelevanceEngine } from './relevanceEngine.ts';
import type { ResearchIntent } from './relevanceEngine.ts';

export interface BatchProcessOptions {
  runId: string;
  countryCode: string;
  locationName: string;
  currentKeyword: string;
  intent?: ResearchIntent;
  effectiveCeiling: number; // Internal safety ceiling (up to 5,000)
}

export interface BatchProcessResult {
  processedAds: ScrapedAdCandidate[];
  updatedEntities: ExtensionLead[];
  newEvidence: Array<{ canonicalKey: string; evidence: any }>;
  newAdIdsAdded: string[];
  newEntityKeysAdded: string[];
  counters: RunCounters;
  safetyLimitReached: boolean;
  newUniqueRelevantLeadsCount: number;
}

/**
 * Normalizes advertiser name to clean, canonical display form
 */
export function normalizeAdvertiserName(rawName: string): string {
  let name = (rawName || '').trim();
  if (!name || name === 'Unknown Advertiser') return 'Unknown Advertiser';

  // Strip trailing metadata or boilerplate
  name = name.replace(/\s*·\s*Sponsored.*$/i, '');
  name = name.replace(/\s*Sponsored.*$/i, '');
  name = name.replace(/\s+page$/i, '');
  name = name.replace(/\s*\(official\)$/i, '');

  return name.trim();
}

/**
 * Derives deterministic entity identity key
 */
export function getCanonicalEntityKey(pageName: string, fbPageId?: string): string {
  const clean = normalizeAdvertiserName(pageName).toLowerCase();
  if (fbPageId && fbPageId.length > 4) {
    return `fb_${fbPageId}`;
  }
  return `name_${clean.replace(/[^a-z0-9]/g, '_')}`;
}

/**
 * Processes a bounded batch of scraped ad candidates
 */
export async function processBatch(
  candidates: ScrapedAdCandidate[],
  existingEntitiesMap: Map<string, ExtensionLead>,
  seenAdLibraryIds: Set<string>,
  seenEntityKeys: Set<string>,
  currentCounters: RunCounters,
  options: BatchProcessOptions
): Promise<BatchProcessResult> {
  const {
    runId,
    countryCode,
    locationName,
    currentKeyword,
    intent,
    effectiveCeiling
  } = options;

  const processedAds: ScrapedAdCandidate[] = [];
  const updatedEntities: ExtensionLead[] = [];
  const newEvidence: Array<{ canonicalKey: string; evidence: any }> = [];
  const newAdIdsAdded: string[] = [];
  const newEntityKeysAdded: string[] = [];

  const counters: RunCounters = {
    rawAds: currentCounters.rawAds,
    normalizedCandidates: currentCounters.normalizedCandidates,
    relevantCandidates: currentCounters.relevantCandidates,
    uncertainCandidates: currentCounters.uncertainCandidates,
    notRelevantCandidates: currentCounters.notRelevantCandidates,
    duplicatesRemoved: currentCounters.duplicatesRemoved,
    finalUniqueLeads: currentCounters.finalUniqueLeads,
    uniqueEntitiesObserved: currentCounters.uniqueEntitiesObserved ?? currentCounters.finalUniqueLeads,
    relevantEntities: currentCounters.relevantEntities ?? currentCounters.finalUniqueLeads,
    uncertainEntities: currentCounters.uncertainEntities ?? currentCounters.uncertainCandidates,
    notRelevantEntities: currentCounters.notRelevantEntities ?? currentCounters.notRelevantCandidates,
    keywordsCompleted: currentCounters.keywordsCompleted ?? 0,
    keywordsTotal: currentCounters.keywordsTotal ?? 1,
    finalUniqueRelevantLeads: currentCounters.finalUniqueRelevantLeads ?? currentCounters.finalUniqueLeads,
    reasonCodes: { ...(currentCounters.reasonCodes || {}) }
  };

  let safetyLimitReached = (counters.finalUniqueRelevantLeads || counters.finalUniqueLeads) >= effectiveCeiling;
  let newUniqueRelevantLeadsCount = 0;

  for (const cand of candidates) {
    // 1. Duplicate ad protection
    if (seenAdLibraryIds.has(cand.libraryId)) {
      counters.duplicatesRemoved++;
      continue;
    }

    seenAdLibraryIds.add(cand.libraryId);
    newAdIdsAdded.push(cand.libraryId);
    counters.rawAds++;
    counters.normalizedCandidates++;
    processedAds.push(cand);

    const cleanName = normalizeAdvertiserName(cand.pageName);
    const entityKey = getCanonicalEntityKey(cleanName, cand.facebookPageId);

    // 2. Check if entity already exists in this research run
    const existingEntity = existingEntitiesMap.get(entityKey);

    if (existingEntity) {
      // Entity already observed: merge ad signals, do NOT inflate lead count!
      counters.duplicatesRemoved++;
      existingEntity.activeAdCount++;
      existingEntity.adCount = (existingEntity.adCount || 0) + 1;
      if (!existingEntity.adLibraryIds.includes(cand.libraryId)) {
        existingEntity.adLibraryIds.push(cand.libraryId);
      }
      if (currentKeyword && !existingEntity.matchedKeywords.includes(currentKeyword)) {
        existingEntity.matchedKeywords.push(currentKeyword);
      }
      if (!existingEntity.destinationUrl && cand.destinationUrl) {
        existingEntity.destinationUrl = cand.destinationUrl;
        existingEntity.destinationDomain = cand.destinationDomain;
        existingEntity.websiteState = 'found';
      }
      if (!existingEntity.facebookPageUrl && cand.facebookPageUrl) {
        existingEntity.facebookPageUrl = cand.facebookPageUrl;
        existingEntity.facebookPageState = 'found';
      }
      if (!existingEntity.sampleCopy && cand.bodyCopy) {
        existingEntity.sampleCopy = cand.bodyCopy;
      }
      if (!existingEntity.sampleCta && cand.ctaText) {
        existingEntity.sampleCta = cand.ctaText;
      }

      // Mark entity as updated in this batch
      if (!updatedEntities.some(e => e.id === existingEntity.id)) {
        updatedEntities.push(existingEntity);
      }
      continue;
    }

    // 3. New entity observed
    counters.uniqueEntitiesObserved = (counters.uniqueEntitiesObserved || 0) + 1;
    seenEntityKeys.add(entityKey);
    newEntityKeysAdded.push(entityKey);

    // 4. Strict Relevance Gate v2 Evaluation
    let evalResult: any = null;
    if (intent) {
      evalResult = LeadRelevanceEngine.evaluateCandidate(cand, intent);

      if (evalResult.reasonCodes && Array.isArray(evalResult.reasonCodes)) {
        for (const code of evalResult.reasonCodes) {
          counters.reasonCodes![code] = (counters.reasonCodes![code] || 0) + 1;
        }
      }

      if (evalResult.decision === 'NOT_RELEVANT') {
        counters.notRelevantCandidates++;
        counters.notRelevantEntities = (counters.notRelevantEntities || 0) + 1;
        // Non-relevant entity is recorded for audit/stats but not added to active leads
        continue;
      }

      if (evalResult.decision === 'UNCERTAIN') {
        counters.uncertainCandidates++;
        counters.uncertainEntities = (counters.uncertainEntities || 0) + 1;
        // Uncertain entity is excluded from qualified leads per Strict Relevance Gate v2
        continue;
      }
    }

    // 5. Qualified relevant entity
    counters.relevantCandidates++;
    counters.relevantEntities = (counters.relevantEntities || 0) + 1;

    // 6. Global safety ceiling check (MAX 5,000)
    const currentLeadCount = counters.finalUniqueRelevantLeads || counters.finalUniqueLeads;
    if (currentLeadCount >= effectiveCeiling) {
      safetyLimitReached = true;
      break;
    }

    // Construct unified ExtensionLead
    const webState = cand.destinationUrl ? 'found' : 'not_found';
    const fbState = cand.facebookPageUrl ? 'found' : 'not_found';

    const newLead: ExtensionLead = {
      id: `lead_${runId}_${entityKey}`,
      name: cleanName,
      canonicalName: cleanName,
      facebookPageName: cleanName,
      facebookPageUrl: cand.facebookPageUrl,
      facebookPageState: fbState,
      destinationUrl: cand.destinationUrl,
      destinationDomain: cand.destinationDomain,
      websiteState: webState,
      adCount: 1,
      activeAdCount: 1,
      adLibraryIds: [cand.libraryId],
      adLibraryUrl: `https://www.facebook.com/ads/library/?id=${cand.libraryId}`,
      matchedKeywords: currentKeyword ? [currentKeyword] : (intent?.primaryKeywords?.slice(0, 1) || []),
      locationCode: countryCode,
      locationName: locationName,
      status: webState === 'found' ? 'QUALIFIED' : 'REVIEW_REQUIRED',
      discoveredAt: new Date().toISOString(),
      sampleCopy: cand.bodyCopy,
      sampleCta: cand.ctaText,
      relevanceScore: evalResult?.score,
      relevanceDecision: evalResult?.decision || 'RELEVANT',
      relevanceConfidence: evalResult?.confidence,
      relevanceReasons: evalResult?.reasons,
      relevanceMatchedTerms: evalResult?.matchedTerms,
      relevanceEvidence: evalResult?.evidence,
      relevanceStrategyVersion: evalResult?.strategyVersion,
      engineVersion: evalResult?.engineVersion,
      presetVersion: evalResult?.presetVersion
    };

    existingEntitiesMap.set(entityKey, newLead);
    updatedEntities.push(newLead);

    if (evalResult?.evidence) {
      newEvidence.push({
        canonicalKey: entityKey,
        evidence: evalResult.evidence
      });
    }

    counters.finalUniqueLeads++;
    counters.finalUniqueRelevantLeads = counters.finalUniqueLeads;
    newUniqueRelevantLeadsCount++;

    if (counters.finalUniqueLeads >= effectiveCeiling) {
      safetyLimitReached = true;
      break;
    }
  }

  // Mutate currentCounters in-place so caller state stays in sync across sequential batches
  Object.assign(currentCounters, counters);

  return {
    processedAds,
    updatedEntities,
    newEvidence,
    newAdIdsAdded,
    newEntityKeysAdded,
    counters,
    safetyLimitReached,
    newUniqueRelevantLeadsCount
  };
}
