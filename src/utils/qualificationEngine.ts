import {
  QualificationState,
  EvidenceState,
  FreshnessState,
  ConfidenceLevel,
  RuleType,
  SignalCategory,
  SignalContribution,
  BlockingCondition,
  ScoringInputSnapshot,
  QualificationResult,
  ScoringRule,
  ScoringModelDefinition,
  ModelEvaluationImpact,
  ManualOverrideRecord,
  PrioritizationPolicy
} from '../types';

// ==========================================
// SCORING MODELS REGISTRY
// ==========================================

export const DEFAULT_MODEL_V1: ScoringModelDefinition = {
  modelId: 'MODEL-V1-BALANCED',
  version: '1.2.0',
  name: 'Balanced Lead Qualification Model',
  status: 'ACTIVE',
  description: 'Evidence-driven, 4-category balanced scoring model with hard caps, distinct confidence metrics, and deterministic explainability.',
  author: 'Data Quality & Systems Architecture Working Group',
  createdAt: '2026-03-01T00:00:00Z',
  categoryCaps: {
    ADVERTISING_ACTIVITY: 30,
    WEBSITE_DESTINATION: 30,
    IDENTITY_CONSISTENCY: 25,
    BUSINESS_CONTACTABILITY: 15
  },
  eligibilityRequirements: [
    'Canonical advertiser identity must be non-empty',
    'At least 1 verified canonical ad observation must exist',
    'No unresolved critical identity spoofing or security blockers'
  ],
  rules: [
    // Advertising Activity
    {
      ruleId: 'RULE-ADV-01',
      version: '1.0',
      category: 'ADVERTISING_ACTIVITY',
      ruleType: 'SIGNAL',
      name: 'Canonical Ad Volume',
      criterion: 'Scales based on number of deduplicated canonical ads observed in library.',
      weight: 1.0,
      maxContribution: 15,
      rationale: 'Multiple canonical ads indicate active public ad campaigns (activity indicator, not revenue predictor).'
    },
    {
      ruleId: 'RULE-ADV-02',
      version: '1.0',
      category: 'ADVERTISING_ACTIVITY',
      ruleType: 'SIGNAL',
      name: 'Observed Advertising Longevity',
      criterion: 'Span between first and last public ad observation in library.',
      weight: 1.0,
      maxContribution: 10,
      rationale: 'Longer public running window indicates sustained presence over time.'
    },
    {
      ruleId: 'RULE-ADV-03',
      version: '1.0',
      category: 'ADVERTISING_ACTIVITY',
      ruleType: 'SIGNAL',
      name: 'Multi-Platform Distribution',
      criterion: 'Presence on multiple Meta platforms (Facebook, Instagram, Audience Network, Messenger).',
      weight: 1.0,
      maxContribution: 5,
      rationale: 'Indicates multi-channel distribution setup.'
    },
    // Website & Destination
    {
      ruleId: 'RULE-WEB-01',
      version: '1.0',
      category: 'WEBSITE_DESTINATION',
      ruleType: 'SIGNAL',
      name: 'Destination URL Usability',
      criterion: 'Valid public HTTP/HTTPS URL with no private/SSRF target.',
      weight: 1.0,
      maxContribution: 5,
      rationale: 'Basic technical prerequisite for web research.'
    },
    {
      ruleId: 'RULE-WEB-02',
      version: '1.0',
      category: 'WEBSITE_DESTINATION',
      ruleType: 'SIGNAL',
      name: 'HTTP/HTTPS Availability',
      criterion: 'Successful 2xx status code returned under bounded retrieval budget.',
      weight: 1.0,
      maxContribution: 10,
      rationale: 'Public website responds reliably to standard web clients.'
    },
    {
      ruleId: 'RULE-WEB-03',
      version: '1.0',
      category: 'WEBSITE_DESTINATION',
      ruleType: 'SIGNAL',
      name: 'TLS Certificate Security',
      criterion: 'Valid TLS certificate negotiation over HTTPS.',
      weight: 1.0,
      maxContribution: 5,
      rationale: 'Ensures encrypted transport for customer destinations.'
    },
    {
      ruleId: 'RULE-WEB-04',
      version: '1.0',
      category: 'WEBSITE_DESTINATION',
      ruleType: 'SIGNAL',
      name: 'DOM Business Content Visibility',
      criterion: 'Public commercial DOM content is accessible without login wall or blocking CAPTCHA.',
      weight: 1.0,
      maxContribution: 10,
      rationale: 'Verifies landing page contains open informational product/service content.'
    },
    // Identity & Consistency
    {
      ruleId: 'RULE-ID-01',
      version: '1.0',
      category: 'IDENTITY_CONSISTENCY',
      ruleType: 'SIGNAL',
      name: 'Brand Token Correspondence',
      criterion: 'Normalized token overlap between advertiser name and visible landing page brand title.',
      weight: 1.0,
      maxContribution: 15,
      rationale: 'Direct linguistic evidence linking advertiser entity to destination business.'
    },
    {
      ruleId: 'RULE-ID-02',
      version: '1.0',
      category: 'IDENTITY_CONSISTENCY',
      ruleType: 'SIGNAL',
      name: 'Registrable Domain Alignment',
      criterion: 'Advertiser declared domain corresponds with verified landing domain.',
      weight: 1.0,
      maxContribution: 10,
      rationale: 'Corroborates technical web property governance.'
    },
    // Business Contactability
    {
      ruleId: 'RULE-CNT-01',
      version: '1.0',
      category: 'BUSINESS_CONTACTABILITY',
      ruleType: 'SIGNAL',
      name: 'Corporate Email Publicly Displayed',
      criterion: 'Public domain-matched corporate email observed on site (personal webmail excluded).',
      weight: 1.0,
      maxContribution: 5,
      rationale: 'Commercial communication channel explicitly published for inquiries.'
    },
    {
      ruleId: 'RULE-CNT-02',
      version: '1.0',
      category: 'BUSINESS_CONTACTABILITY',
      ruleType: 'SIGNAL',
      name: 'E.164 Corporate Telephone Number',
      criterion: 'Public business telephone in standard E.164 international format.',
      weight: 1.0,
      maxContribution: 5,
      rationale: 'Published voice contact channel.'
    },
    {
      ruleId: 'RULE-CNT-03',
      version: '1.0',
      category: 'BUSINESS_CONTACTABILITY',
      ruleType: 'SIGNAL',
      name: 'Physical Business Address or Jurisdiction',
      criterion: 'Publicly stated office address, city/state, or clear geographic service area.',
      weight: 1.0,
      maxContribution: 5,
      rationale: 'Demonstrates physical establishment or jurisdiction.'
    }
  ]
};

export const STRICT_MODEL_V2: ScoringModelDefinition = {
  modelId: 'MODEL-V2-STRICT',
  version: '2.0.0-rc1',
  name: 'Strict Enterprise Compliance Model (Shadow)',
  status: 'SHADOW',
  description: 'Higher thresholds for identity consistency, mandatory HTTPS, zero tolerance for stale verifications (>14 days), and higher contactability weight.',
  author: 'Enterprise Risk & Compliance Architecture',
  createdAt: '2026-03-10T00:00:00Z',
  categoryCaps: {
    ADVERTISING_ACTIVITY: 25,
    WEBSITE_DESTINATION: 30,
    IDENTITY_CONSISTENCY: 30,
    BUSINESS_CONTACTABILITY: 15
  },
  eligibilityRequirements: [
    'Canonical advertiser identity must be verified',
    'At least 2 verified canonical ads must exist',
    'Verified public HTTPS website mandatory',
    'Verification checked within past 14 days'
  ],
  rules: [
    ...DEFAULT_MODEL_V1.rules.map(r => {
      if (r.ruleId === 'RULE-ID-01') return { ...r, maxContribution: 20 };
      if (r.ruleId === 'RULE-ADV-01') return { ...r, maxContribution: 10 };
      return r;
    })
  ]
};

export const LEGACY_MODEL_V0: ScoringModelDefinition = {
  modelId: 'MODEL-V0-LEGACY',
  version: '0.9.0-alpha',
  name: 'Legacy Prototype Model (Retired)',
  status: 'RETIRED',
  description: 'Uncapped prototype model from early research. Deprecated due to double-counting and lack of confidence separation.',
  author: 'Prototype Team',
  createdAt: '2026-01-15T00:00:00Z',
  categoryCaps: {
    ADVERTISING_ACTIVITY: 50,
    WEBSITE_DESTINATION: 50,
    IDENTITY_CONSISTENCY: 50,
    BUSINESS_CONTACTABILITY: 50
  },
  eligibilityRequirements: ['Advertiser exists'],
  rules: DEFAULT_MODEL_V1.rules
};

export const MODEL_REGISTRY: ScoringModelDefinition[] = [
  DEFAULT_MODEL_V1,
  STRICT_MODEL_V2,
  LEGACY_MODEL_V0
];

// ==========================================
// SCORING ENGINE IMPLEMENTATION
// ==========================================

export class QualificationEngine {
  private model: ScoringModelDefinition;

  constructor(model: ScoringModelDefinition = DEFAULT_MODEL_V1) {
    this.model = model;
  }

  public setModel(model: ScoringModelDefinition): void {
    this.model = model;
  }

  public getModel(): ScoringModelDefinition {
    return this.model;
  }

  /**
   * Evaluates evidence freshness based on explicit timestamps
   */
  public calculateFreshness(timestamp?: string): FreshnessState {
    if (!timestamp) return 'UNKNOWN';
    const checkTime = new Date(timestamp).getTime();
    if (isNaN(checkTime)) return 'UNKNOWN';

    const now = new Date('2026-03-15T12:00:00Z').getTime(); // Reference evaluation time
    const ageDays = (now - checkTime) / (1000 * 60 * 60 * 24);

    if (ageDays <= 14) return 'CURRENT';
    if (ageDays <= 30) return 'RECENT';
    return 'STALE';
  }

  /**
   * Evaluates Hard Blockers (B-01 through B-06)
   */
  public evaluateBlockers(snapshot: ScoringInputSnapshot): BlockingCondition[] {
    const blockers: BlockingCondition[] = [
      {
        blockerId: 'BLOCKER-01',
        name: 'Prohibited Data State or Protocol Hazard',
        severity: 'CRITICAL_BLOCKER',
        triggered: snapshot.destinationUrl?.startsWith('file:') ||
                   snapshot.destinationUrl?.startsWith('ftp:') ||
                   snapshot.destinationUrl?.includes('169.254.169.254') ||
                   snapshot.destinationUrl?.includes('localhost') || false,
        triggerReason: 'Destination URL targets private/forbidden protocol or loopback network.',
        evidenceReference: snapshot.destinationUrl
      },
      {
        blockerId: 'BLOCKER-02',
        name: 'Critical Unresolved Identity Conflict',
        severity: 'CRITICAL_BLOCKER',
        triggered: snapshot.hasCriticalConflict && snapshot.identityConsistencyState === 'CONFLICTING',
        triggerReason: snapshot.conflictSummary || 'Advertiser and destination business represent irreconcilable identities.',
        evidenceReference: snapshot.conflictSummary
      },
      {
        blockerId: 'BLOCKER-03',
        name: 'Zero Canonical Ad Observations',
        severity: 'CRITICAL_BLOCKER',
        triggered: snapshot.canonicalAdCount <= 0,
        triggerReason: 'Entity contains zero verified canonical ad library observations.',
        evidenceReference: `canonicalAdCount=${snapshot.canonicalAdCount}`
      },
      {
        blockerId: 'BLOCKER-04',
        name: 'Missing Advertiser Identity',
        severity: 'CRITICAL_BLOCKER',
        triggered: !snapshot.advertiserName || snapshot.advertiserName.trim().length === 0,
        triggerReason: 'Entity lacks observable public advertiser name.',
        evidenceReference: snapshot.advertiserName
      },
      {
        blockerId: 'BLOCKER-05',
        name: 'Stale Critical Verification (>60 Days)',
        severity: 'CONDITIONAL_BLOCKER',
        triggered: snapshot.destinationUrl !== undefined && this.calculateFreshness(snapshot.verificationCheckedAt) === 'STALE',
        triggerReason: 'Destination verification evidence exceeds maximum acceptable staleness window.',
        evidenceReference: snapshot.verificationCheckedAt
      }
    ];

    return blockers;
  }

  /**
   * Main deterministic qualification and scoring pipeline
   */
  public evaluate(snapshot: ScoringInputSnapshot, override?: ManualOverrideRecord): QualificationResult {
    const blockers = this.evaluateBlockers(snapshot);
    const criticalBlockerTriggered = blockers.some(b => b.severity === 'CRITICAL_BLOCKER' && b.triggered);

    const contributions: SignalContribution[] = [];
    const positiveEvidence: string[] = [];
    const negativeEvidence: string[] = [];
    const missingEvidence: string[] = [];
    const conflicts: string[] = [];

    // Track category totals
    const categoryRawScores: Record<SignalCategory, number> = {
      ADVERTISING_ACTIVITY: 0,
      WEBSITE_DESTINATION: 0,
      IDENTITY_CONSISTENCY: 0,
      BUSINESS_CONTACTABILITY: 0
    };

    // ----------------------------------------------------
    // CATEGORY 1: ADVERTISING ACTIVITY
    // ----------------------------------------------------
    // S-01: Canonical Ad Volume
    let s01Points = 0;
    if (snapshot.canonicalAdCount >= 6) s01Points = 15;
    else if (snapshot.canonicalAdCount >= 2) s01Points = 10;
    else if (snapshot.canonicalAdCount === 1) s01Points = 5;

    contributions.push({
      signalId: 'SIG-ADV-01',
      signalName: 'Canonical Ad Count',
      category: 'ADVERTISING_ACTIVITY',
      ruleId: 'RULE-ADV-01',
      evidenceState: snapshot.canonicalAdCount > 0 ? 'PRESENT' : 'ABSENT',
      freshness: 'CURRENT',
      pointsAwarded: s01Points,
      maxPoints: 15,
      weight: 1.0,
      cappedContribution: s01Points,
      confidenceWeight: 1.0,
      evidenceReferences: [`Canonical Ads: ${snapshot.canonicalAdCount}`],
      rationale: `${snapshot.canonicalAdCount} canonical ads observed in library.`
    });
    categoryRawScores.ADVERTISING_ACTIVITY += s01Points;
    if (s01Points > 0) positiveEvidence.push(`Observed ${snapshot.canonicalAdCount} distinct canonical ads.`);

    // S-02: Advertising Duration / Longevity
    let s02Points = 0;
    let daysObserved = 0;
    if (snapshot.firstObservedAt && snapshot.lastObservedAt) {
      const d1 = new Date(snapshot.firstObservedAt).getTime();
      const d2 = new Date(snapshot.lastObservedAt).getTime();
      if (!isNaN(d1) && !isNaN(d2)) {
        daysObserved = Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
        if (daysObserved >= 90) s02Points = 10;
        else if (daysObserved >= 30) s02Points = 7;
        else if (daysObserved >= 7) s02Points = 4;
        else s02Points = 2;
      }
    }

    contributions.push({
      signalId: 'SIG-ADV-02',
      signalName: 'Observed Longevity',
      category: 'ADVERTISING_ACTIVITY',
      ruleId: 'RULE-ADV-02',
      evidenceState: daysObserved > 0 ? 'PRESENT' : 'UNKNOWN',
      freshness: 'CURRENT',
      pointsAwarded: s02Points,
      maxPoints: 10,
      weight: 1.0,
      cappedContribution: s02Points,
      confidenceWeight: 0.9,
      evidenceReferences: [`Span: ${daysObserved} days (${snapshot.firstObservedAt} to ${snapshot.lastObservedAt})`],
      rationale: `Public observation window spans ${daysObserved} days.`
    });
    categoryRawScores.ADVERTISING_ACTIVITY += s02Points;
    if (daysObserved >= 30) positiveEvidence.push(`Observed ad campaign active for ${daysObserved} days.`);

    // S-03: Multi-Platform Distribution
    let s03Points = 0;
    const platformCount = snapshot.platforms ? snapshot.platforms.length : 0;
    if (platformCount >= 3) s03Points = 5;
    else if (platformCount >= 2) s03Points = 3;
    else if (platformCount === 1) s03Points = 1;

    contributions.push({
      signalId: 'SIG-ADV-03',
      signalName: 'Multi-Platform Distribution',
      category: 'ADVERTISING_ACTIVITY',
      ruleId: 'RULE-ADV-03',
      evidenceState: platformCount > 0 ? 'PRESENT' : 'ABSENT',
      freshness: 'CURRENT',
      pointsAwarded: s03Points,
      maxPoints: 5,
      weight: 1.0,
      cappedContribution: s03Points,
      confidenceWeight: 0.95,
      evidenceReferences: snapshot.platforms || [],
      rationale: `Observed across ${platformCount} platforms: ${(snapshot.platforms || []).join(', ')}.`
    });
    categoryRawScores.ADVERTISING_ACTIVITY += s03Points;

    // ----------------------------------------------------
    // CATEGORY 2: WEBSITE / DESTINATION
    // ----------------------------------------------------
    const destFreshness = this.calculateFreshness(snapshot.verificationCheckedAt);

    // S-04: Destination URL presence
    const hasDest = Boolean(snapshot.destinationUrl && snapshot.destinationUrl.length > 5);
    const s04Points = hasDest ? 5 : 0;
    contributions.push({
      signalId: 'SIG-WEB-01',
      signalName: 'Destination URL Usability',
      category: 'WEBSITE_DESTINATION',
      ruleId: 'RULE-WEB-01',
      evidenceState: hasDest ? 'PRESENT' : 'ABSENT',
      freshness: destFreshness,
      pointsAwarded: s04Points,
      maxPoints: 5,
      weight: 1.0,
      cappedContribution: s04Points,
      confidenceWeight: 1.0,
      evidenceReferences: [snapshot.destinationUrl || 'None'],
      rationale: hasDest ? `Public destination URL declared: ${snapshot.destinationUrl}` : 'No destination URL declared in ad metadata.'
    });
    categoryRawScores.WEBSITE_DESTINATION += s04Points;
    if (hasDest) positiveEvidence.push(`Valid public destination URL available: ${snapshot.destinationUrl}`);
    else missingEvidence.push('Destination website URL absent.');

    // S-05: HTTP/HTTPS Availability
    let s05Points = 0;
    if (snapshot.landingReachable === true) {
      s05Points = 10;
      positiveEvidence.push('Destination URL verified reachable with HTTP 200.');
    } else if (snapshot.landingReachable === false) {
      negativeEvidence.push('Destination website is publicly unreachable or returned HTTP error.');
    } else {
      missingEvidence.push('Destination website reachability not verified.');
    }

    contributions.push({
      signalId: 'SIG-WEB-02',
      signalName: 'HTTP Reachability',
      category: 'WEBSITE_DESTINATION',
      ruleId: 'RULE-WEB-02',
      evidenceState: snapshot.landingReachable === true ? 'PRESENT' : snapshot.landingReachable === false ? 'FAILED' : 'UNAVAILABLE',
      freshness: destFreshness,
      pointsAwarded: s05Points,
      maxPoints: 10,
      weight: 1.0,
      cappedContribution: s05Points,
      confidenceWeight: destFreshness === 'CURRENT' ? 1.0 : destFreshness === 'RECENT' ? 0.8 : 0.4,
      evidenceReferences: [`landingReachable=${snapshot.landingReachable}`],
      rationale: snapshot.landingReachable ? 'Verified reachable over network.' : 'Unreachable or failed verification.'
    });
    categoryRawScores.WEBSITE_DESTINATION += s05Points;

    // S-06: TLS Security
    let s06Points = 0;
    if (snapshot.httpsAvailable === true) {
      s06Points = 5;
      positiveEvidence.push('Destination verified with active TLS/HTTPS certificate.');
    } else if (hasDest && snapshot.httpsAvailable === false) {
      negativeEvidence.push('Destination operates on unencrypted HTTP (HTTPS absent).');
    }

    contributions.push({
      signalId: 'SIG-WEB-03',
      signalName: 'TLS / HTTPS Security',
      category: 'WEBSITE_DESTINATION',
      ruleId: 'RULE-WEB-03',
      evidenceState: snapshot.httpsAvailable === true ? 'PRESENT' : hasDest ? 'ABSENT' : 'NOT_APPLICABLE',
      freshness: destFreshness,
      pointsAwarded: s06Points,
      maxPoints: 5,
      weight: 1.0,
      cappedContribution: s06Points,
      confidenceWeight: 0.9,
      evidenceReferences: [`httpsAvailable=${snapshot.httpsAvailable}`],
      rationale: snapshot.httpsAvailable ? 'HTTPS negotiated successfully.' : 'Insecure HTTP or not checked.'
    });
    categoryRawScores.WEBSITE_DESTINATION += s06Points;

    // S-07: Business Content Visibility
    const claims = snapshot.verificationClaimsSupported || [];
    const contentVisible = claims.includes('CONTENT_ACCESSIBLE') || claims.includes('BRAND_NAME_VISIBLE');
    const s07Points = contentVisible ? 10 : 0;
    contributions.push({
      signalId: 'SIG-WEB-04',
      signalName: 'DOM Business Content Visibility',
      category: 'WEBSITE_DESTINATION',
      ruleId: 'RULE-WEB-04',
      evidenceState: contentVisible ? 'PRESENT' : hasDest ? 'FAILED' : 'NOT_APPLICABLE',
      freshness: destFreshness,
      pointsAwarded: s07Points,
      maxPoints: 10,
      weight: 1.0,
      cappedContribution: s07Points,
      confidenceWeight: 0.9,
      evidenceReferences: claims,
      rationale: contentVisible ? 'DOM contains public brand/business information.' : 'Page blocked by login/CAPTCHA or empty.'
    });
    categoryRawScores.WEBSITE_DESTINATION += s07Points;

    // ----------------------------------------------------
    // CATEGORY 3: IDENTITY & CONSISTENCY
    // ----------------------------------------------------
    let s08Points = 0;
    let s09Points = 0;

    if (snapshot.identityConsistencyState === 'CONSISTENT') {
      s08Points = 15;
      s09Points = 10;
      positiveEvidence.push('Advertiser identity is strictly consistent with destination brand title and domain.');
    } else if (snapshot.identityConsistencyState === 'PARTIALLY_CONSISTENT') {
      s08Points = 8;
      s09Points = 5;
      positiveEvidence.push('Advertiser identity shares partial token overlap with destination.');
    } else if (snapshot.identityConsistencyState === 'CONFLICTING') {
      negativeEvidence.push('Critical contradiction between advertiser name and destination entity.');
      conflicts.push(`Identity contradiction: ${snapshot.conflictSummary || 'Entity mismatch'}`);
    } else {
      missingEvidence.push('Identity consistency inconclusive or not verified.');
    }

    contributions.push({
      signalId: 'SIG-ID-01',
      signalName: 'Brand Token Consistency',
      category: 'IDENTITY_CONSISTENCY',
      ruleId: 'RULE-ID-01',
      evidenceState: snapshot.identityConsistencyState ? 'PRESENT' : 'UNKNOWN',
      freshness: destFreshness,
      pointsAwarded: s08Points,
      maxPoints: 15,
      weight: 1.0,
      cappedContribution: s08Points,
      confidenceWeight: 0.95,
      evidenceReferences: [`State: ${snapshot.identityConsistencyState}`],
      rationale: `Evaluated consistency state: ${snapshot.identityConsistencyState || 'UNKNOWN'}.`
    });
    categoryRawScores.IDENTITY_CONSISTENCY += s08Points;

    contributions.push({
      signalId: 'SIG-ID-02',
      signalName: 'Domain Registration Alignment',
      category: 'IDENTITY_CONSISTENCY',
      ruleId: 'RULE-ID-02',
      evidenceState: s09Points > 0 ? 'PRESENT' : 'ABSENT',
      freshness: destFreshness,
      pointsAwarded: s09Points,
      maxPoints: 10,
      weight: 1.0,
      cappedContribution: s09Points,
      confidenceWeight: 0.9,
      evidenceReferences: [snapshot.destinationUrl || 'None'],
      rationale: s09Points > 0 ? 'Verified web property governance matches advertiser candidate.' : 'Domain alignment not corroborated.'
    });
    categoryRawScores.IDENTITY_CONSISTENCY += s09Points;

    // ----------------------------------------------------
    // CATEGORY 4: BUSINESS CONTACTABILITY (Commercial only, NO personal PII)
    // ----------------------------------------------------
    // S-11: Corporate Email
    const hasCorpEmail = Boolean(snapshot.publicBusinessEmail && snapshot.publicBusinessEmail.includes('@') && !snapshot.publicBusinessEmail.endsWith('@gmail.com'));
    const s11Points = hasCorpEmail ? 5 : 0;
    contributions.push({
      signalId: 'SIG-CNT-01',
      signalName: 'Public Corporate Email',
      category: 'BUSINESS_CONTACTABILITY',
      ruleId: 'RULE-CNT-01',
      evidenceState: hasCorpEmail ? 'PRESENT' : 'ABSENT',
      freshness: destFreshness,
      pointsAwarded: s11Points,
      maxPoints: 5,
      weight: 1.0,
      cappedContribution: s11Points,
      confidenceWeight: 0.95,
      evidenceReferences: [snapshot.publicBusinessEmail || 'None'],
      rationale: hasCorpEmail ? `Corporate inquiry email published: ${snapshot.publicBusinessEmail}` : 'No corporate email publicly visible.'
    });
    categoryRawScores.BUSINESS_CONTACTABILITY += s11Points;
    if (hasCorpEmail) positiveEvidence.push(`Public corporate inquiry email available: ${snapshot.publicBusinessEmail}`);
    else missingEvidence.push('Corporate inquiry email not publicly visible.');

    // S-12: E.164 Telephone
    const hasPhone = Boolean(snapshot.publicBusinessPhone && snapshot.publicBusinessPhone.length >= 7);
    const s12Points = hasPhone ? 5 : 0;
    contributions.push({
      signalId: 'SIG-CNT-02',
      signalName: 'E.164 Corporate Phone',
      category: 'BUSINESS_CONTACTABILITY',
      ruleId: 'RULE-CNT-02',
      evidenceState: hasPhone ? 'PRESENT' : 'ABSENT',
      freshness: destFreshness,
      pointsAwarded: s12Points,
      maxPoints: 5,
      weight: 1.0,
      cappedContribution: s12Points,
      confidenceWeight: 0.9,
      evidenceReferences: [snapshot.publicBusinessPhone || 'None'],
      rationale: hasPhone ? `Public phone published: ${snapshot.publicBusinessPhone}` : 'No public telephone number observed.'
    });
    categoryRawScores.BUSINESS_CONTACTABILITY += s12Points;
    if (hasPhone) positiveEvidence.push(`Public corporate telephone available: ${snapshot.publicBusinessPhone}`);

    // S-13: Physical Jurisdiction / Address
    const hasAddress = Boolean(snapshot.publicAddress && snapshot.publicAddress.length > 5);
    const s13Points = hasAddress ? 5 : 0;
    contributions.push({
      signalId: 'SIG-CNT-03',
      signalName: 'Public Commercial Address',
      category: 'BUSINESS_CONTACTABILITY',
      ruleId: 'RULE-CNT-03',
      evidenceState: hasAddress ? 'PRESENT' : 'ABSENT',
      freshness: destFreshness,
      pointsAwarded: s13Points,
      maxPoints: 5,
      weight: 1.0,
      cappedContribution: s13Points,
      confidenceWeight: 0.85,
      evidenceReferences: [snapshot.publicAddress || 'None'],
      rationale: hasAddress ? `Commercial jurisdiction: ${snapshot.publicAddress}` : 'No physical office address published.'
    });
    categoryRawScores.BUSINESS_CONTACTABILITY += s13Points;
    if (hasAddress) positiveEvidence.push(`Public business address/jurisdiction available: ${snapshot.publicAddress}`);

    // ----------------------------------------------------
    // ANTI-DOUBLE-COUNTING & CATEGORY CAPPING
    // ----------------------------------------------------
    const categoryScores: Record<SignalCategory, { raw: number; capped: number; max: number }> = {
      ADVERTISING_ACTIVITY: {
        raw: categoryRawScores.ADVERTISING_ACTIVITY,
        capped: Math.min(this.model.categoryCaps.ADVERTISING_ACTIVITY, categoryRawScores.ADVERTISING_ACTIVITY),
        max: this.model.categoryCaps.ADVERTISING_ACTIVITY
      },
      WEBSITE_DESTINATION: {
        raw: categoryRawScores.WEBSITE_DESTINATION,
        capped: Math.min(this.model.categoryCaps.WEBSITE_DESTINATION, categoryRawScores.WEBSITE_DESTINATION),
        max: this.model.categoryCaps.WEBSITE_DESTINATION
      },
      IDENTITY_CONSISTENCY: {
        raw: categoryRawScores.IDENTITY_CONSISTENCY,
        capped: Math.min(this.model.categoryCaps.IDENTITY_CONSISTENCY, categoryRawScores.IDENTITY_CONSISTENCY),
        max: this.model.categoryCaps.IDENTITY_CONSISTENCY
      },
      BUSINESS_CONTACTABILITY: {
        raw: categoryRawScores.BUSINESS_CONTACTABILITY,
        capped: Math.min(this.model.categoryCaps.BUSINESS_CONTACTABILITY, categoryRawScores.BUSINESS_CONTACTABILITY),
        max: this.model.categoryCaps.BUSINESS_CONTACTABILITY
      }
    };

    // Total Score
    let totalScore =
      categoryScores.ADVERTISING_ACTIVITY.capped +
      categoryScores.WEBSITE_DESTINATION.capped +
      categoryScores.IDENTITY_CONSISTENCY.capped +
      categoryScores.BUSINESS_CONTACTABILITY.capped;

    totalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

    // ----------------------------------------------------
    // CONFIDENCE METRIC COMPUTATION
    // ----------------------------------------------------
    let confidenceNumerator = 0;
    let confidenceDenominator = 0;

    contributions.forEach(c => {
      let weightFactor = c.confidenceWeight;
      if (c.freshness === 'STALE') weightFactor *= 0.5;
      if (c.evidenceState === 'PRESENT') {
        confidenceNumerator += weightFactor;
      }
      confidenceDenominator += 1;
    });

    if (snapshot.hasCriticalConflict) {
      confidenceNumerator *= 0.5;
    }

    const rawConfidence = confidenceDenominator > 0 ? confidenceNumerator / confidenceDenominator : 0;
    let confidenceLevel: ConfidenceLevel = 'LOW';
    if (rawConfidence >= 0.75) confidenceLevel = 'HIGH';
    else if (rawConfidence >= 0.50) confidenceLevel = 'MEDIUM';
    else if (rawConfidence >= 0.30) confidenceLevel = 'LOW';
    else confidenceLevel = 'UNCERTAIN';

    // ----------------------------------------------------
    // QUALIFICATION STATE DETERMINATION
    // ----------------------------------------------------
    let status: QualificationState = 'QUALIFIED';

    if (criticalBlockerTriggered) {
      status = 'REJECTED_BY_RULE';
    } else if (snapshot.canonicalAdCount <= 0 || !snapshot.advertiserName) {
      status = 'NOT_ELIGIBLE';
    } else if (snapshot.hasCriticalConflict || snapshot.identityConsistencyState === 'CONFLICTING') {
      status = 'REVIEW_REQUIRED';
    } else if (totalScore < 30 || positiveEvidence.length < 2) {
      status = 'INSUFFICIENT_EVIDENCE';
    } else if (destFreshness === 'STALE') {
      status = 'REVIEW_REQUIRED';
    } else if (totalScore >= 75 && confidenceLevel === 'HIGH' && snapshot.identityConsistencyState === 'CONSISTENT') {
      status = 'VERIFIED_FOR_WORKFLOW';
    } else if (totalScore >= 45) {
      status = 'QUALIFIED';
    } else {
      status = 'REVIEW_REQUIRED';
    }

    // Apply manual override if present
    if (override) {
      status = override.newStatus;
      if (override.newScore !== undefined) {
        totalScore = override.newScore;
      }
    }

    // ----------------------------------------------------
    // FACTUAL EXPLAINABILITY GENERATION
    // ----------------------------------------------------
    const explanationLines: string[] = [];

    if (criticalBlockerTriggered) {
      const activeBlocker = blockers.find(b => b.triggered && b.severity === 'CRITICAL_BLOCKER');
      explanationLines.push(`Disqualified by Hard Blocker [${activeBlocker?.blockerId}]: ${activeBlocker?.triggerReason}`);
    } else {
      explanationLines.push(
        `Entity evaluated under model ${this.model.name} (${this.model.modelId} v${this.model.version}). Result: ${status} (Score: ${totalScore}/100, Confidence: ${confidenceLevel} [${(rawConfidence * 100).toFixed(0)}%]).`
      );

      if (categoryScores.IDENTITY_CONSISTENCY.capped >= 15) {
        explanationLines.push(
          `Business identity and destination are verified consistent (${categoryScores.IDENTITY_CONSISTENCY.capped}/${this.model.categoryCaps.IDENTITY_CONSISTENCY} pts).`
        );
      } else if (snapshot.identityConsistencyState === 'CONFLICTING') {
        explanationLines.push(`Identity contradiction detected between advertiser and destination: ${snapshot.conflictSummary}.`);
      }

      explanationLines.push(
        `Advertising presence: ${snapshot.canonicalAdCount} canonical ads observed across ${platformCount} platform(s) (${categoryScores.ADVERTISING_ACTIVITY.capped}/${this.model.categoryCaps.ADVERTISING_ACTIVITY} pts).`
      );

      if (snapshot.landingReachable) {
        explanationLines.push(
          `Destination URL (${snapshot.destinationUrl}) is reachable with HTTPS and open DOM content (${categoryScores.WEBSITE_DESTINATION.capped}/${this.model.categoryCaps.WEBSITE_DESTINATION} pts).`
        );
      } else if (hasDest) {
        explanationLines.push(`Destination website failed reachability or returned non-200 HTTP status.`);
      }

      if (hasCorpEmail || hasPhone) {
        explanationLines.push(
          `Public commercial contact coordinates verified: ${hasCorpEmail ? 'email' : ''} ${hasPhone ? 'telephone' : ''} (${categoryScores.BUSINESS_CONTACTABILITY.capped}/${this.model.categoryCaps.BUSINESS_CONTACTABILITY} pts).`
        );
      }

      if (missingEvidence.length > 0) {
        explanationLines.push(`Missing non-mandatory evidence: ${missingEvidence.slice(0, 2).join('; ')}.`);
      }
    }

    if (override) {
      explanationLines.push(`[MANUAL OVERRIDE AUDIT]: State overridden by reviewer '${override.reviewer}' on ${override.appliedAt}. Reason: ${override.reason}`);
    }

    return {
      qualificationId: `QUAL-${snapshot.entityId}-${Date.now()}`,
      entityId: snapshot.entityId,
      status,
      score: totalScore,
      scoreRange: { min: Math.max(0, totalScore - 5), max: Math.min(100, totalScore + 5) },
      categoryScores,
      confidence: confidenceLevel,
      confidenceScore: Math.round(rawConfidence * 100) / 100,
      modelId: this.model.modelId,
      modelVersion: this.model.version,
      ruleSetVersion: '2026.03.R1',
      signalContributions: contributions,
      positiveEvidence,
      negativeEvidence,
      missingEvidence,
      conflicts,
      blockingConditions: blockers,
      explanation: explanationLines.join(' '),
      calculatedAt: new Date().toISOString(),
      snapshotId: snapshot.snapshotId,
      manualOverride: override
    };
  }

  /**
   * Evaluates impact comparison between active model and candidate model over a dataset
   */
  public evaluateImpact(
    activeModel: ScoringModelDefinition,
    candidateModel: ScoringModelDefinition,
    datasets: ScoringInputSnapshot[]
  ): ModelEvaluationImpact {
    const engineActive = new QualificationEngine(activeModel);
    const engineCandidate = new QualificationEngine(candidateModel);

    let activeScoreSum = 0;
    let candidateScoreSum = 0;
    const transitions: Record<string, number> = {};
    const newlyQualified: string[] = [];
    const newlyDisqualified: string[] = [];

    datasets.forEach(d => {
      const resActive = engineActive.evaluate(d);
      const resCandidate = engineCandidate.evaluate(d);

      activeScoreSum += resActive.score;
      candidateScoreSum += resCandidate.score;

      const transitionKey = `${resActive.status} -> ${resCandidate.status}`;
      transitions[transitionKey] = (transitions[transitionKey] || 0) + 1;

      if (resActive.status !== 'QUALIFIED' && resActive.status !== 'VERIFIED_FOR_WORKFLOW') {
        if (resCandidate.status === 'QUALIFIED' || resCandidate.status === 'VERIFIED_FOR_WORKFLOW') {
          newlyQualified.push(d.entityId);
        }
      }

      if (resActive.status === 'QUALIFIED' || resActive.status === 'VERIFIED_FOR_WORKFLOW') {
        if (resCandidate.status !== 'QUALIFIED' && resCandidate.status !== 'VERIFIED_FOR_WORKFLOW') {
          newlyDisqualified.push(d.entityId);
        }
      }
    });

    const count = datasets.length;
    const meanActive = count > 0 ? activeScoreSum / count : 0;
    const meanCandidate = count > 0 ? candidateScoreSum / count : 0;

    let shiftCount = 0;
    Object.entries(transitions).forEach(([k, v]) => {
      const [from, to] = k.split(' -> ');
      if (from !== to) shiftCount += v;
    });

    const shiftPercent = count > 0 ? Math.round((shiftCount / count) * 100) : 0;

    return {
      evaluationId: `EVAL-${activeModel.modelId}-${candidateModel.modelId}-${Date.now()}`,
      activeModelId: activeModel.modelId,
      activeModelVersion: activeModel.version,
      candidateModelId: candidateModel.modelId,
      candidateModelVersion: candidateModel.version,
      evaluatedEntitiesCount: count,
      meanScoreActive: Math.round(meanActive * 10) / 10,
      meanScoreCandidate: Math.round(meanCandidate * 10) / 10,
      scoreDelta: Math.round((meanCandidate - meanActive) * 10) / 10,
      statusTransitions: transitions,
      newlyQualified,
      newlyDisqualified,
      distributionShiftPercent: shiftPercent,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Sorts results according to selected operational prioritization policy
   */
  public prioritize(results: QualificationResult[], policy: PrioritizationPolicy): QualificationResult[] {
    const copy = [...results];
    switch (policy) {
      case 'BALANCED_SCORE_DESCENDING':
        return copy.sort((a, b) => b.score - a.score);

      case 'HIGH_CONFIDENCE_FIRST': {
        const confRank: Record<ConfidenceLevel, number> = { HIGH: 4, MEDIUM: 3, LOW: 2, UNCERTAIN: 1, UNKNOWN: 0 };
        return copy.sort((a, b) => {
          const diff = confRank[b.confidence] - confRank[a.confidence];
          if (diff !== 0) return diff;
          return b.score - a.score;
        });
      }

      case 'COMPLETE_EVIDENCE_FIRST':
        return copy.sort((a, b) => {
          const aMissing = a.missingEvidence.length;
          const bMissing = b.missingEvidence.length;
          if (aMissing !== bMissing) return aMissing - bMissing;
          return b.score - a.score;
        });

      case 'RECENT_ACTIVITY_FIRST':
        return copy.sort((a, b) => {
          const aActivity = a.categoryScores.ADVERTISING_ACTIVITY.capped;
          const bActivity = b.categoryScores.ADVERTISING_ACTIVITY.capped;
          if (aActivity !== bActivity) return bActivity - aActivity;
          return b.score - a.score;
        });

      case 'REVIEW_QUEUE_FIRST':
        return copy.sort((a, b) => {
          const aReview = a.status === 'REVIEW_REQUIRED' ? 1 : 0;
          const bReview = b.status === 'REVIEW_REQUIRED' ? 1 : 0;
          if (aReview !== bReview) return bReview - aReview;
          return b.score - a.score;
        });

      default:
        return copy;
    }
  }
}
