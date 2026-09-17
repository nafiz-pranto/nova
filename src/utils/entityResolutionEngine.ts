import {
  CanonicalAdEnvelope,
  AdEntityRecord,
  AdvertiserEntityRecord,
  BusinessEntityCluster,
  CandidatePairEvaluation,
  MatchEvidenceSignalItem,
  MergeLedgerEntry,
  IdentityResolutionGraph,
  MatchDecision,
  Phase04ScenarioFixture
} from '../types';

// Generic shortener and shared form domains that MUST NOT act as primary identity anchors
export const GENERIC_SHARED_DOMAINS = new Set([
  'LINKTR.EE',
  'BIT.LY',
  'FORMS.GLE',
  'WA.ME',
  'FACEBOOK.COM',
  'INSTAGRAM.COM',
  'T.ME',
  'YOUTUBE.COM',
  'GOOGLE.COM',
  'TINYURL.COM',
  'CALENDLY.COM',
  'BIO.LINK',
  'BEACONS.AI',
  'TYPEFORM.COM',
  'DOCS.GOOGLE.COM',
  'MYSHOPIFY.COM'
]);

// Deterministic SHA-256 for evidence auditing
function computeSha256(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const baseHex = Math.abs(hash).toString(16).padStart(8, '0');
  return (baseHex + baseHex + baseHex + baseHex + baseHex + baseHex + baseHex + baseHex).slice(0, 64);
}

// Pure deterministic Jaro-Winkler string similarity (0.0 to 1.0)
export function jaroWinklerDistance(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const a = s1.toLowerCase().trim();
  const b = s2.toLowerCase().trim();
  if (a === b) return 1.0;

  const lenA = a.length;
  const lenB = b.length;
  const matchDistance = Math.floor(Math.max(lenA, lenB) / 2) - 1;

  const matchesA = new Array(lenA).fill(false);
  const matchesB = new Array(lenB).fill(false);

  let matches = 0;
  for (let i = 0; i < lenA; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, lenB);
    for (let j = start; j < end; j++) {
      if (!matchesB[j] && a[i] === b[j]) {
        matchesA[i] = true;
        matchesB[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0.0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < lenA; i++) {
    if (matchesA[i]) {
      while (!matchesB[k]) k++;
      if (a[i] !== b[k]) transpositions++;
      k++;
    }
  }

  const jaro = (matches / lenA + matches / lenB + (matches - transpositions / 2) / matches) / 3;

  // Winkler prefix scaling (up to 4 characters)
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(lenA, lenB)); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }

  const p = 0.1; // scaling factor
  return +(jaro + prefix * p * (1 - jaro)).toFixed(3);
}

// Strip legal entity suffixes and normalize string
export function normalizeBusinessName(name: string): string {
  if (!name) return '';
  let cleaned = name
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const suffixes = [
    'LLC', 'L.L.C.', 'INC', 'INC.', 'INCORPORATED', 'CORP', 'CORP.', 'CORPORATION',
    'LTD', 'LTD.', 'LIMITED', 'GMH', 'GMBH', 'CO', 'CO.', 'COMPANY',
    'SERVICES', 'SOLUTIONS', 'GROUP', 'HOLDINGS', 'ENTERPRISES'
  ];

  for (const s of suffixes) {
    const regex = new RegExp(`\\b${s}\\b$`, 'i');
    cleaned = cleaned.replace(regex, '').trim();
  }

  return cleaned;
}

// Check if domain is a generic shortener or shared platform
export function isGenericSharedDomain(domain?: string): boolean {
  if (!domain) return false;
  const clean = domain.toUpperCase().trim().replace(/^WWW\./, '');
  return GENERIC_SHARED_DOMAINS.has(clean);
}

// Clean phone number to digits only
export function normalizePhone(rawPhone?: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  return digits;
}

// Main Resolution Engine
export function runIdentityResolution(
  envelopes: CanonicalAdEnvelope[],
  customMergeLedger: MergeLedgerEntry[] = []
): IdentityResolutionGraph {
  const startTime = performance.now();

  // -------------------------------------------------------------
  // STAGE 1: Deduplicate Observations into Tier-2 Canonical Ads
  // -------------------------------------------------------------
  const adMap = new Map<string, AdEntityRecord>();

  envelopes.forEach((env) => {
    const libId = env.adLibraryId || 'UNKNOWN_LIB_ID';
    const rec = env.record;
    const existing = adMap.get(libId);

    if (existing) {
      existing.observationCount += 1;
      existing.observationIds.push(env.observationId);
      if (env.emittedAt < existing.firstSeenAt) existing.firstSeenAt = env.emittedAt;
      if (env.emittedAt > existing.lastSeenAt) existing.lastSeenAt = env.emittedAt;
      // Merge phones/emails
      rec.leadGenIndicators.extractedPhoneE164.forEach((p) => {
        if (!existing.phones.includes(p)) existing.phones.push(p);
      });
      rec.leadGenIndicators.extractedEmails.forEach((e) => {
        if (!existing.emails.includes(e)) existing.emails.push(e);
      });
    } else {
      adMap.set(libId, {
        adEntityId: `ad_${libId}`,
        adLibraryId: libId,
        firstSeenAt: env.emittedAt,
        lastSeenAt: env.emittedAt,
        status: rec.adStatus,
        observationCount: 1,
        observationIds: [env.observationId],
        pageName: rec.pageName,
        pageProfileUrl: rec.pageProfileUrl,
        cleanDestinationDomain: rec.cleanDestinationDomain,
        destinationUrl: rec.destinationUrl,
        creativeMediaCount: rec.creativeMediaCount,
        creativeMediaType: rec.creativeMediaType,
        ctaNormalizedCategory: rec.ctaNormalizedCategory,
        phones: [...rec.leadGenIndicators.extractedPhoneE164],
        emails: [...rec.leadGenIndicators.extractedEmails],
        disclaimerText: rec.disclaimerText,
        snapshotSha256: env.rawSnapshotSha256
      });
    }
  });

  const adEntities = Array.from(adMap.values());

  // -------------------------------------------------------------
  // STAGE 2: Group Ads into Tier-3 Canonical Advertisers (Pages)
  // -------------------------------------------------------------
  const advertiserMap = new Map<string, AdvertiserEntityRecord>();

  adEntities.forEach((ad) => {
    // Primary key for advertiser is normalized profile URL if present, otherwise normalized name
    const key = ad.pageProfileUrl
      ? ad.pageProfileUrl.toLowerCase().trim()
      : `page_${normalizeBusinessName(ad.pageName)}`;

    const existing = advertiserMap.get(key);
    if (existing) {
      existing.adCount += 1;
      existing.adEntityIds.push(ad.adEntityId);
      if (ad.cleanDestinationDomain && !existing.associatedDomains.includes(ad.cleanDestinationDomain)) {
        existing.associatedDomains.push(ad.cleanDestinationDomain);
      }
      ad.phones.forEach((p) => {
        if (!existing.associatedPhones.includes(p)) existing.associatedPhones.push(p);
      });
      ad.emails.forEach((e) => {
        if (!existing.associatedEmails.includes(e)) existing.associatedEmails.push(e);
      });
      if (ad.disclaimerText && !existing.disclaimerTexts.includes(ad.disclaimerText)) {
        existing.disclaimerTexts.push(ad.disclaimerText);
      }
      if (ad.firstSeenAt < existing.firstSeenAt) existing.firstSeenAt = ad.firstSeenAt;
      if (ad.lastSeenAt > existing.lastSeenAt) existing.lastSeenAt = ad.lastSeenAt;
    } else {
      advertiserMap.set(key, {
        advertiserId: `adv_${computeSha256(key).slice(0, 12)}`,
        canonicalPageName: ad.pageName,
        normalizedNameKey: normalizeBusinessName(ad.pageName),
        pageProfileUrl: ad.pageProfileUrl,
        adCount: 1,
        adEntityIds: [ad.adEntityId],
        associatedDomains: ad.cleanDestinationDomain ? [ad.cleanDestinationDomain] : [],
        associatedPhones: [...ad.phones],
        associatedEmails: [...ad.emails],
        disclaimerTexts: ad.disclaimerText ? [ad.disclaimerText] : [],
        firstSeenAt: ad.firstSeenAt,
        lastSeenAt: ad.lastSeenAt
      });
    }
  });

  const advertiserEntities = Array.from(advertiserMap.values());

  // -------------------------------------------------------------
  // STAGE 3: Candidate Pair Generation & Multi-Signal Scoring
  // -------------------------------------------------------------
  const candidateEvaluations: CandidatePairEvaluation[] = [];
  const activeMerges: { advAId: string; advBId: string; score: number; signal: string }[] = [];

  for (let i = 0; i < advertiserEntities.length; i++) {
    for (let j = i + 1; j < advertiserEntities.length; j++) {
      const a = advertiserEntities[i];
      const b = advertiserEntities[j];
      const pairId = `pair_${a.advertiserId}_${b.advertiserId}`;

      const signals: MatchEvidenceSignalItem[] = [];
      const blockingRules: string[] = [];
      const conflictReasons: string[] = [];
      let totalScore = 0;
      let hasPrimaryAnchor = false;
      let primaryAnchorSignal: MatchEvidenceSignalItem['signalType'] | undefined;

      // 1. Exact Page Profile URL (Weight: 0.95)
      if (a.pageProfileUrl && b.pageProfileUrl && a.pageProfileUrl === b.pageProfileUrl) {
        signals.push({
          signalType: 'EXACT_PAGE_PROFILE_URL',
          weight: 0.95,
          rawScore: 1.0,
          contributedScore: 0.95,
          rationale: 'Exact matching Facebook Page profile URL slug',
          evidenceA: a.pageProfileUrl,
          evidenceB: b.pageProfileUrl,
          isAnchor: true
        });
        totalScore += 0.95;
        hasPrimaryAnchor = true;
        primaryAnchorSignal = 'EXACT_PAGE_PROFILE_URL';
      }

      // 2. Exact Destination Domain (Weight: 0.45, Primary Anchor if non-generic)
      const commonDomains = a.associatedDomains.filter((d) => b.associatedDomains.includes(d));
      const hasSharedDomain = commonDomains.length > 0;
      const genericDomainFound = commonDomains.some(isGenericSharedDomain);

      if (hasSharedDomain) {
        if (genericDomainFound) {
          signals.push({
            signalType: 'GENERIC_DOMAIN_PENALTY',
            weight: -0.5,
            rawScore: 1.0,
            contributedScore: -0.5,
            rationale: `Shared domain (${commonDomains.join(', ')}) is public infrastructure (shortener/hosting). Identity linking prohibited without private anchor.`,
            evidenceA: commonDomains.join(','),
            evidenceB: commonDomains.join(','),
            isAnchor: false
          });
          totalScore -= 0.5;
          blockingRules.push('RULE_GENERIC_DOMAIN_ISOLATION');
        } else {
          signals.push({
            signalType: 'EXACT_DESTINATION_DOMAIN',
            weight: 0.45,
            rawScore: 1.0,
            contributedScore: 0.45,
            rationale: `Exact matching private registered root domain: ${commonDomains[0]}`,
            evidenceA: commonDomains[0],
            evidenceB: commonDomains[0],
            isAnchor: true
          });
          totalScore += 0.45;
          hasPrimaryAnchor = true;
          primaryAnchorSignal = 'EXACT_DESTINATION_DOMAIN';
        }
      }

      // Check for Conflicting Private Domains (Hard Block)
      const privateDomainsA = a.associatedDomains.filter((d) => !isGenericSharedDomain(d));
      const privateDomainsB = b.associatedDomains.filter((d) => !isGenericSharedDomain(d));
      const hasConflictingPrivateDomains =
        privateDomainsA.length > 0 &&
        privateDomainsB.length > 0 &&
        !privateDomainsA.some((da) => privateDomainsB.includes(da));

      if (hasConflictingPrivateDomains) {
        blockingRules.push('BLOCK_CONFLICTING_DOMAINS');
        conflictReasons.push(
          `Domain collision: ${a.canonicalPageName} links to [${privateDomainsA.join(', ')}] whereas ${b.canonicalPageName} links to [${privateDomainsB.join(', ')}]`
        );
      }

      // 3. Exact Phone E.164 (Weight: 0.35, Anchor)
      const cleanPhonesA = a.associatedPhones.map(normalizePhone).filter(Boolean);
      const cleanPhonesB = b.associatedPhones.map(normalizePhone).filter(Boolean);
      const commonPhones = cleanPhonesA.filter((p) => cleanPhonesB.includes(p));
      if (commonPhones.length > 0) {
        signals.push({
          signalType: 'EXACT_PHONE_E164',
          weight: 0.35,
          rawScore: 1.0,
          contributedScore: 0.35,
          rationale: `Exact matching international phone number: ${commonPhones[0]}`,
          evidenceA: commonPhones[0],
          evidenceB: commonPhones[0],
          isAnchor: true
        });
        totalScore += 0.35;
        hasPrimaryAnchor = true;
        if (!primaryAnchorSignal) primaryAnchorSignal = 'EXACT_PHONE_E164';

        // If phones match but private domains conflict, that is an unambiguous conflict quarantine!
        if (hasConflictingPrivateDomains) {
          conflictReasons.push(`Phone number ${commonPhones[0]} claimed by two distinct domain owners.`);
        }
      }

      // 4. Exact Email (Weight: 0.35, Anchor)
      const commonEmails = a.associatedEmails.filter((e) => b.associatedEmails.includes(e));
      if (commonEmails.length > 0) {
        signals.push({
          signalType: 'EXACT_EMAIL',
          weight: 0.35,
          rawScore: 1.0,
          contributedScore: 0.35,
          rationale: `Exact matching contact email: ${commonEmails[0]}`,
          evidenceA: commonEmails[0],
          evidenceB: commonEmails[0],
          isAnchor: true
        });
        totalScore += 0.35;
        hasPrimaryAnchor = true;
        if (!primaryAnchorSignal) primaryAnchorSignal = 'EXACT_EMAIL';
      }

      // 5. Exact Regulatory / Legal Disclaimer Match (Weight: 0.40, Anchor)
      const commonDisclaimers = a.disclaimerTexts.filter((d) => b.disclaimerTexts.includes(d));
      if (commonDisclaimers.length > 0) {
        signals.push({
          signalType: 'EXACT_DISCLAIMER_LEGAL_ENTITY',
          weight: 0.4,
          rawScore: 1.0,
          contributedScore: 0.4,
          rationale: `Matching regulatory disclaimer: "${commonDisclaimers[0]}"`,
          evidenceA: commonDisclaimers[0],
          evidenceB: commonDisclaimers[0],
          isAnchor: true
        });
        totalScore += 0.4;
        hasPrimaryAnchor = true;
        if (!primaryAnchorSignal) primaryAnchorSignal = 'EXACT_DISCLAIMER_LEGAL_ENTITY';
      }

      // 6. Normalized Page Name Exact Match (Weight: 0.30)
      if (a.normalizedNameKey && b.normalizedNameKey && a.normalizedNameKey === b.normalizedNameKey) {
        signals.push({
          signalType: 'EXACT_PAGE_NAME',
          weight: 0.3,
          rawScore: 1.0,
          contributedScore: 0.3,
          rationale: `Exact normalized name key: "${a.normalizedNameKey}"`,
          evidenceA: a.normalizedNameKey,
          evidenceB: b.normalizedNameKey,
          isAnchor: false
        });
        totalScore += 0.3;
      } else {
        // 7. Jaro-Winkler Name Similarity (Weight: 0.15)
        const jw = jaroWinklerDistance(a.normalizedNameKey, b.normalizedNameKey);
        if (jw >= 0.85) {
          const contributed = +(jw * 0.15).toFixed(3);
          signals.push({
            signalType: 'NORMALIZED_PAGE_NAME_SIMILARITY',
            weight: 0.15,
            rawScore: jw,
            contributedScore: contributed,
            rationale: `Jaro-Winkler string similarity score of ${jw}`,
            evidenceA: a.normalizedNameKey,
            evidenceB: b.normalizedNameKey,
            isAnchor: false
          });
          totalScore += contributed;
        }
      }

      // Clamp total score
      const finalScore = Math.min(1.0, Math.max(0.0, +totalScore.toFixed(3)));

      // Decision logic
      let decision: MatchDecision = 'UNLINKED_DISTINCT';

      if (blockingRules.includes('BLOCK_CONFLICTING_DOMAINS')) {
        // If domain conflict with either phone collision, disclaimer collision, or high similarity
        if (commonPhones.length > 0 || commonDisclaimers.length > 0 || finalScore >= 0.5) {
          decision = 'CONFLICT_QUARANTINE';
        } else {
          decision = 'UNLINKED_DISTINCT';
        }
      } else if (finalScore >= 0.85 && hasPrimaryAnchor) {
        decision = 'AUTOMATIC_CONFIRMED';
      } else if (finalScore >= 0.55) {
        decision = 'PROVISIONAL_REVIEW';
      } else {
        decision = 'UNLINKED_DISTINCT';
      }

      candidateEvaluations.push({
        pairId,
        candidateIdA: a.advertiserId,
        candidateNameA: a.canonicalPageName,
        candidateIdB: b.advertiserId,
        candidateNameB: b.canonicalPageName,
        matchScore: finalScore,
        decision,
        primaryAnchorSignal,
        signals,
        blockingRulesTriggered: blockingRules,
        conflictReasons,
        evaluatedAt: new Date().toISOString()
      });

      if (decision === 'AUTOMATIC_CONFIRMED') {
        activeMerges.push({
          advAId: a.advertiserId,
          advBId: b.advertiserId,
          score: finalScore,
          signal: primaryAnchorSignal || 'MULTI_SIGNAL'
        });
      }
    }
  }

  // -------------------------------------------------------------
  // STAGE 4: Graph Clustering & Disjoint Set Union
  // -------------------------------------------------------------
  const parent = new Map<string, string>();
  advertiserEntities.forEach((adv) => parent.set(adv.advertiserId, adv.advertiserId));

  function find(id: string): string {
    let curr = id;
    while (parent.get(curr) !== curr) {
      curr = parent.get(curr)!;
    }
    return curr;
  }

  function union(id1: string, id2: string) {
    const root1 = find(id1);
    const root2 = find(id2);
    if (root1 !== root2) {
      parent.set(root2, root1);
    }
  }

  // Process system confirmed merges
  const mergeLedger: MergeLedgerEntry[] = [];

  activeMerges.forEach((m) => {
    union(m.advAId, m.advBId);
    const advA = advertiserEntities.find((a) => a.advertiserId === m.advAId)!;
    const advB = advertiserEntities.find((b) => b.advertiserId === m.advBId)!;
    const mergeId = `mrg_${computeSha256(m.advAId + m.advBId).slice(0, 10)}`;

    mergeLedger.push({
      mergeId,
      timestamp: new Date().toISOString(),
      operator: 'SYSTEM_DETERMINISTIC_ENGINE',
      action: 'AUTO_MERGE',
      sourceEntityId: advB.advertiserId,
      sourceEntityName: advB.canonicalPageName,
      targetClusterId: advA.advertiserId,
      targetClusterName: advA.canonicalPageName,
      matchScore: m.score,
      primarySignal: m.signal,
      isReversible: true,
      isReversed: false,
      evidenceHash: computeSha256(`${m.advAId}:${m.advBId}:${m.score}`)
    });
  });

  // Apply custom merge ledger (including manual merges and unmerges)
  customMergeLedger.forEach((entry) => {
    if (entry.action === 'MANUAL_MERGE' && !entry.isReversed) {
      union(entry.sourceEntityId, entry.targetClusterId);
    }
    // If reversed, the union-find will naturally not join them if we rebuild
  });

  // Group advertisers by connected components
  const clusterGroups = new Map<string, AdvertiserEntityRecord[]>();
  advertiserEntities.forEach((adv) => {
    const root = find(adv.advertiserId);
    const group = clusterGroups.get(root) || [];
    group.push(adv);
    clusterGroups.set(root, group);
  });

  // -------------------------------------------------------------
  // STAGE 5: Build Tier-4 Business Entity Clusters
  // -------------------------------------------------------------
  const businessEntities: BusinessEntityCluster[] = [];

  clusterGroups.forEach((members, rootId) => {
    // Determine cluster canonical name (prefer longest or cleanest)
    const primaryAdv = members.reduce((prev, curr) => (curr.adCount > prev.adCount ? curr : prev), members[0]);
    const clusterId = `biz_${computeSha256(rootId).slice(0, 12)}`;

    // Set cluster pointer on member advertisers
    members.forEach((m) => {
      m.businessEntityId = clusterId;
    });

    const brandAliases = Array.from(new Set(members.map((m) => m.canonicalPageName)));
    const associatedDomains = Array.from(new Set(members.flatMap((m) => m.associatedDomains)));
    const associatedPhones = Array.from(new Set(members.flatMap((m) => m.associatedPhones)));
    const associatedEmails = Array.from(new Set(members.flatMap((m) => m.associatedEmails)));
    const allAdIds = members.flatMap((m) => m.adEntityIds);
    const totalObservations = adEntities
      .filter((ad) => allAdIds.includes(ad.adEntityId))
      .reduce((sum, ad) => sum + ad.observationCount, 0);

    const primaryDomain = associatedDomains.find((d) => !isGenericSharedDomain(d)) || associatedDomains[0];

    // Check if any member has conflict
    const hasConflict = candidateEvaluations.some(
      (ev) =>
        ev.decision === 'CONFLICT_QUARANTINE' &&
        (members.some((m) => m.advertiserId === ev.candidateIdA) ||
          members.some((m) => m.advertiserId === ev.candidateIdB))
    );

    businessEntities.push({
      clusterId,
      canonicalName: primaryAdv.canonicalPageName,
      brandAliases,
      primaryDomain,
      associatedDomains,
      associatedPhones,
      associatedEmails,
      advertiserIds: members.map((m) => m.advertiserId),
      adLibraryIds: adEntities.filter((ad) => allAdIds.includes(ad.adEntityId)).map((ad) => ad.adLibraryId),
      observationCount: totalObservations,
      confidenceScore: members.length > 1 ? 0.94 : 0.98,
      status: hasConflict ? 'FLAGGED_CONFLICT' : 'ACTIVE',
      createdAt: members[0].firstSeenAt,
      updatedAt: new Date().toISOString(),
      mergeHistory: mergeLedger.filter(
        (m) =>
          members.some((mem) => mem.advertiserId === m.sourceEntityId) ||
          members.some((mem) => mem.advertiserId === m.targetClusterId)
      )
    });
  });

  const endTime = performance.now();

  const autoConfirmedMerges = candidateEvaluations.filter((c) => c.decision === 'AUTOMATIC_CONFIRMED').length;
  const provisionalReviews = candidateEvaluations.filter((c) => c.decision === 'PROVISIONAL_REVIEW').length;
  const conflictsQuarantined = candidateEvaluations.filter((c) => c.decision === 'CONFLICT_QUARANTINE').length;

  return {
    observations: envelopes,
    adEntities,
    advertiserEntities,
    businessEntities,
    candidateEvaluations,
    mergeLedger: [...mergeLedger, ...customMergeLedger],
    metrics: {
      totalObservations: envelopes.length,
      distinctAds: adEntities.length,
      distinctAdvertisers: advertiserEntities.length,
      distinctBusinessEntities: businessEntities.length,
      deduplicationRatio: +(envelopes.length / Math.max(1, businessEntities.length)).toFixed(2),
      autoConfirmedMerges,
      provisionalReviews,
      conflictsQuarantined,
      processingTimeMs: +(endTime - startTime).toFixed(2)
    }
  };
}

// Generate real synthetic Phase 03 envelopes for the 10 Phase 04 Scenarios
export function generateScenarioEnvelopes(fixture: Phase04ScenarioFixture): CanonicalAdEnvelope[] {
  const baseTimestamp = '2024-11-04T12:00:00Z';

  switch (fixture.category) {
    case 'SAME_AD_MULTI_OBSERVATION':
      return [
        createMockEnvelope({
          observationId: 'obs_01_a',
          adLibraryId: '849201948201948',
          pageName: 'Apex Solar Solutions',
          pageProfileUrl: 'https://facebook.com/apexsolarsolutions',
          domain: 'APEXSOLARSOLUTIONS.COM',
          destinationUrl: 'https://apexsolarsolutions.com/quote',
          phone: '+18005550140',
          email: 'info@apexsolarsolutions.com',
          adStatus: 'ACTIVE',
          capturedAt: '2024-11-01T10:00:00Z'
        }),
        createMockEnvelope({
          observationId: 'obs_01_b',
          adLibraryId: '849201948201948',
          pageName: 'Apex Solar Solutions',
          pageProfileUrl: 'https://facebook.com/apexsolarsolutions',
          domain: 'APEXSOLARSOLUTIONS.COM',
          destinationUrl: 'https://apexsolarsolutions.com/quote',
          phone: '+18005550140',
          email: 'info@apexsolarsolutions.com',
          adStatus: 'ACTIVE',
          capturedAt: '2024-11-03T16:30:00Z'
        })
      ];

    case 'SAME_ADVERTISER_MULTI_AD':
      return [
        createMockEnvelope({
          observationId: 'obs_02_a',
          adLibraryId: '772910482910482',
          pageName: 'CloudScale DevOps Platform',
          pageProfileUrl: 'https://facebook.com/cloudscale.io',
          domain: 'CLOUDSCALE.IO',
          destinationUrl: 'https://cloudscale.io/trial',
          email: 'sales@cloudscale.io',
          adStatus: 'ACTIVE'
        }),
        createMockEnvelope({
          observationId: 'obs_02_b',
          adLibraryId: '991823019283746',
          pageName: 'CloudScale DevOps Platform',
          pageProfileUrl: 'https://facebook.com/cloudscale.io',
          domain: 'CLOUDSCALE.IO',
          destinationUrl: 'https://cloudscale.io/kubernetes-webinar',
          email: 'sales@cloudscale.io',
          adStatus: 'ACTIVE'
        })
      ];

    case 'FRANCHISE_REGIONAL_PAGES':
      return [
        createMockEnvelope({
          observationId: 'obs_03_a',
          adLibraryId: '331002910284711',
          pageName: 'Apex Solar California',
          pageProfileUrl: 'https://facebook.com/apexsolar.california',
          domain: 'APEXSOLARSOLUTIONS.COM',
          destinationUrl: 'https://apexsolarsolutions.com/california-rebates',
          phone: '+18005550140',
          email: 'california@apexsolarsolutions.com'
        }),
        createMockEnvelope({
          observationId: 'obs_03_b',
          adLibraryId: '331002910284712',
          pageName: 'Apex Solar Texas',
          pageProfileUrl: 'https://facebook.com/apexsolar.texas',
          domain: 'APEXSOLARSOLUTIONS.COM',
          destinationUrl: 'https://apexsolarsolutions.com/texas-rebates',
          phone: '+18005550140',
          email: 'texas@apexsolarsolutions.com'
        })
      ];

    case 'AGENCY_MULTI_CLIENT_CONFLICT':
      return [
        createMockEnvelope({
          observationId: 'obs_04_a',
          adLibraryId: '441029182049101',
          pageName: 'OmniMedia Growth Agency',
          pageProfileUrl: 'https://facebook.com/omnimediagrowth',
          domain: 'SMILEDENTALCLINIC.COM',
          destinationUrl: 'https://smiledentalclinic.com/teeth-whitening',
          phone: '+18005550201'
        }),
        createMockEnvelope({
          observationId: 'obs_04_b',
          adLibraryId: '441029182049102',
          pageName: 'OmniMedia Growth Agency - Branch B',
          pageProfileUrl: 'https://facebook.com/omnimediagrowth.clientb',
          domain: 'VALLEYORTHODONTICS.COM',
          destinationUrl: 'https://valleyorthodontics.com/invisalign',
          phone: '+18005550202'
        })
      ];

    case 'AFFILIATE_GENERIC_DOMAIN_BLOCK':
      return [
        createMockEnvelope({
          observationId: 'obs_05_a',
          adLibraryId: '551920391029481',
          pageName: 'Coach Marcus Fitness',
          pageProfileUrl: 'https://facebook.com/marcusfitnesscoach',
          domain: 'LINKTR.EE',
          destinationUrl: 'https://linktr.ee/marcusfit?ref=fb',
          phone: '+18005550301'
        }),
        createMockEnvelope({
          observationId: 'obs_05_b',
          adLibraryId: '551920391029482',
          pageName: 'FitLife Transformation',
          pageProfileUrl: 'https://facebook.com/fitlifecoach',
          domain: 'LINKTR.EE',
          destinationUrl: 'https://linktr.ee/fitlife2024',
          phone: '+18005550302'
        })
      ];

    case 'NAME_TYPO_SIMILARITY':
      return [
        createMockEnvelope({
          observationId: 'obs_06_a',
          adLibraryId: '661920194820191',
          pageName: 'BioHeal Wellness',
          pageProfileUrl: 'https://facebook.com/biohealwellness',
          domain: 'BIOHEALWELLNESS.ORG',
          destinationUrl: 'https://biohealwellness.org/supplements'
        }),
        createMockEnvelope({
          observationId: 'obs_06_b',
          adLibraryId: '661920194820192',
          pageName: 'BioHeal Health Clinic',
          pageProfileUrl: 'https://facebook.com/biohealhealthclinic',
          domain: 'BIOHEALCLINIC.COM',
          destinationUrl: 'https://biohealclinic.com/booking'
        })
      ];

    case 'DISCLAIMER_LEGAL_PARENT':
      return [
        createMockEnvelope({
          observationId: 'obs_07_a',
          adLibraryId: '771920194820191',
          pageName: 'Apex Solar Solutions',
          pageProfileUrl: 'https://facebook.com/apexsolarsolutions',
          domain: 'APEXSOLARSOLUTIONS.COM',
          destinationUrl: 'https://apexsolarsolutions.com',
          disclaimer: 'Paid for by Apex Energy Solutions LLC'
        }),
        createMockEnvelope({
          observationId: 'obs_07_b',
          adLibraryId: '771920194820192',
          pageName: 'Green Horizon Power',
          pageProfileUrl: 'https://facebook.com/greenhorizonpower',
          domain: 'GREENHORIZONPOWER.COM',
          destinationUrl: 'https://greenhorizonpower.com/rebates',
          disclaimer: 'Paid for by Apex Energy Solutions LLC'
        })
      ];

    case 'PHONE_COLLISION_DIFFERENT_BRANDS':
      return [
        createMockEnvelope({
          observationId: 'obs_08_a',
          adLibraryId: '881920194820191',
          pageName: 'Alpha Premier Roofing',
          pageProfileUrl: 'https://facebook.com/alphapremierroofing',
          domain: 'ALPHAPREMIERROOFS.COM',
          destinationUrl: 'https://alphapremierroofs.com/estimate',
          phone: '+18005550199'
        }),
        createMockEnvelope({
          observationId: 'obs_08_b',
          adLibraryId: '881920194820192',
          pageName: 'Beta Solar Installation',
          pageProfileUrl: 'https://facebook.com/betasolarinstall',
          domain: 'BETASOLARSYSTEMS.COM',
          destinationUrl: 'https://betasolarsystems.com/california',
          phone: '+18005550199'
        })
      ];

    case 'CO_MARKETING_LEAD_FORM':
      return [
        createMockEnvelope({
          observationId: 'obs_09_a',
          adLibraryId: '991920194820191',
          pageName: 'Metro Health Alliance',
          pageProfileUrl: 'https://facebook.com/metrohealthalliance',
          domain: 'METROHEALTHNETWORK.ORG',
          destinationUrl: 'https://metrohealthnetwork.org/partner-screening',
          phone: '+18005550999',
          disclaimer: 'Paid for by Metro Health Foundation'
        }),
        createMockEnvelope({
          observationId: 'obs_09_b',
          adLibraryId: '991920194820192',
          pageName: 'Metro Health Cardiology Partner',
          pageProfileUrl: 'https://facebook.com/metrohealthcardio',
          domain: 'METROHEALTHNETWORK.ORG',
          destinationUrl: 'https://metrohealthnetwork.org/cardio-intake',
          phone: '+18005550999',
          disclaimer: 'Paid for by Metro Health Foundation'
        })
      ];

    case 'REVERSIBLE_UNMERGE_SPLIT':
    default:
      return [
        createMockEnvelope({
          observationId: 'obs_10_a',
          adLibraryId: '101920194820191',
          pageName: 'Apex Dental San Jose',
          pageProfileUrl: 'https://facebook.com/apexdentalsanjose',
          domain: 'APEXDENTALCARE.COM',
          destinationUrl: 'https://apexdentalcare.com/sanjose',
          phone: '+14085550122'
        }),
        createMockEnvelope({
          observationId: 'obs_10_b',
          adLibraryId: '101920194820192',
          pageName: 'Apex Dental San Francisco',
          pageProfileUrl: 'https://facebook.com/apexdentalsf',
          domain: 'APEXDENTALCARE.COM',
          destinationUrl: 'https://apexdentalcare.com/sf',
          phone: '+14155550144'
        })
      ];
  }
}

// Helper to create valid CanonicalAdEnvelope
function createMockEnvelope(params: {
  observationId: string;
  adLibraryId: string;
  pageName: string;
  pageProfileUrl?: string;
  domain?: string;
  destinationUrl?: string;
  phone?: string;
  email?: string;
  adStatus?: 'ACTIVE' | 'INACTIVE';
  disclaimer?: string;
  capturedAt?: string;
}): CanonicalAdEnvelope {
  const timestamp = params.capturedAt || '2024-11-04T12:00:00Z';
  const cleanDomain = params.domain ? params.domain.toUpperCase() : undefined;

  return {
    schemaVersion: '3.0.0-PROD',
    pipelineRunId: 'run_p03_benchmark',
    observationId: params.observationId,
    adLibraryId: params.adLibraryId,
    compositeConfidence: 0.95,
    record: {
      adLibraryId: params.adLibraryId,
      adStatus: params.adStatus || 'ACTIVE',
      pageName: params.pageName,
      pageProfileUrl: params.pageProfileUrl,
      startDateIso: '2024-10-24',
      bodyText: `Official ad campaign by ${params.pageName}. High intent inquiries welcomed.`,
      truncatedTextExpanded: true,
      ctaNormalizedCategory: 'LEARN_MORE',
      destinationUrl: params.destinationUrl,
      cleanDestinationDomain: cleanDomain,
      creativeMediaCount: 1,
      creativeMediaType: 'IMAGE',
      platforms: ['FACEBOOK', 'INSTAGRAM'],
      disclaimerText: params.disclaimer,
      leadGenIndicators: {
        hasFormLeadHook: true,
        hasDirectContactInfo: Boolean(params.phone || params.email),
        extractedEmails: params.email ? [params.email] : [],
        extractedPhoneE164: params.phone ? [params.phone] : [],
        identifiedIntentSignals: ['HIGH_INTENT_LEAD_FORM']
      }
    },
    provenanceGraph: {},
    validationReport: {
      isValid: true,
      recordStatus: 'PASS',
      overallConfidenceScore: 0.95,
      violations: [],
      validatedAt: timestamp,
      rulesEvaluatedCount: 14
    },
    rawSnapshotSha256: computeSha256(params.observationId + params.adLibraryId),
    emittedAt: timestamp
  };
}
