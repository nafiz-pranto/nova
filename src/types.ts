export interface SectionItem {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: 'core' | 'architecture' | 'data' | 'security' | 'operations' | 'handoff';
  contentMarkdown?: string;
}

export type JobState =
  | 'CREATED'
  | 'QUEUED'
  | 'STARTING'
  | 'NAVIGATING'
  | 'COLLECTING'
  | 'VALIDATING'
  | 'CHECKPOINTING'
  | 'PAUSED'
  | 'BLOCKED'
  | 'CHALLENGED'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED'
  | 'CANCELLED';

export interface StateTransition {
  from: JobState;
  to: JobState;
  trigger: string;
  guard?: string;
  isTerminal?: boolean;
}

export interface ContractDefinition {
  name: string;
  purpose: string;
  version: string;
  idempotency: string;
  requestSchema: Record<string, unknown>;
  responseSchema: Record<string, unknown>;
  errorBehavior: string;
}

export interface DatabaseTable {
  name: string;
  description: string;
  primaryKey: string;
  columns: {
    name: string;
    type: string;
    constraints: string;
    classification: string;
    description: string;
  }[];
  indices: string[];
}

export type PageState =
  | 'UNKNOWN'
  | 'NAVIGATING'
  | 'LOADING'
  | 'READY_FOR_SEARCH'
  | 'SEARCHING'
  | 'RESULTS_LOADING'
  | 'RESULTS_READY'
  | 'RESULTS_STABILIZING'
  | 'END_OF_RESULTS'
  | 'LOGIN_REQUIRED'
  | 'CHALLENGE_DETECTED'
  | 'BLOCKED'
  | 'UI_CHANGED'
  | 'ERROR'
  | 'CLOSED';

export interface PageStateEvidence {
  selectorMatched?: string;
  urlObserved: string;
  domIndicators: string[];
  absentIndicators: string[];
  httpStatus?: number;
  screenshotHash?: string;
}

export interface PageStateReport {
  state: PageState;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: PageStateEvidence;
  detectedAt: string;
  adapterVersion: string;
}

export type SelectorStrategy =
  | 'SEMANTIC_ROLE'
  | 'SEMANTIC_TEXT'
  | 'TEST_ID'
  | 'LABEL_RELATION'
  | 'STRUCTURAL_ARIA'
  | 'SCOPED_CSS'
  | 'VERIFIED_FALLBACK';

export interface SelectorDefinition {
  id: string;
  name: string;
  purpose: string;
  strategy: SelectorStrategy;
  primaryLocator: string;
  fallbacks: string[];
  expectedState: string;
  confidence: number;
  introducedIn: string;
  lastValidated: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'SYNTHETIC';
}

export type WorkerEventType =
  | 'WORKER_STARTED'
  | 'BROWSER_STARTED'
  | 'CONTEXT_CREATED'
  | 'PAGE_CREATED'
  | 'NAVIGATION_STARTED'
  | 'NAVIGATION_COMPLETED'
  | 'SEARCH_STARTED'
  | 'SEARCH_READY'
  | 'RESULTS_LOADING'
  | 'RESULTS_READY'
  | 'RESULTS_STABILIZED'
  | 'EXTRACTION_STARTED'
  | 'EXTRACTION_COMPLETED'
  | 'CHECKPOINT_SAVED'
  | 'RESULTS_ADVANCE_STARTED'
  | 'RESULTS_ADVANCE_COMPLETED'
  | 'END_OF_RESULTS'
  | 'LOGIN_REQUIRED'
  | 'CHALLENGE_DETECTED'
  | 'BLOCK_DETECTED'
  | 'UI_CHANGE_DETECTED'
  | 'RETRY_STARTED'
  | 'RETRY_EXHAUSTED'
  | 'JOB_CANCELLED'
  | 'BROWSER_CRASHED'
  | 'WORKER_STOPPING'
  | 'WORKER_STOPPED'
  | 'RUN_COMPLETED'
  | 'RUN_FAILED';

export interface WorkerEvent {
  eventId: string;
  type: WorkerEventType;
  jobId: string;
  runId: string;
  workerId: string;
  timestamp: string;
  sequence: number;
  payload: Record<string, unknown>;
  pageState?: PageState;
}

export interface WorkerCheckpoint {
  runId: string;
  jobId: string;
  sequenceNumber: number;
  scrollOffset: number;
  itemsCollected: number;
  lastSuccessfulAdLibraryId?: string;
  adapterVersion: string;
  schemaVersion: string;
  timestamp: string;
  idempotencyHash: string;
}

export interface TestFixture {
  id: string;
  name: string;
  file: string;
  category: 'SEARCH' | 'RESULTS' | 'EMPTY' | 'PAGINATION' | 'CHALLENGE' | 'BLOCK' | 'UI_CHANGE' | 'LOGIN';
  expectedState: PageState;
  expectedCardCount: number;
  description: string;
}

// ==========================================
// PHASE 03 DATA EXTRACTION & PROVENANCE TYPES
// ==========================================

export type ExtractionPipelineStage =
  | 'INGESTION'
  | 'PARSING'
  | 'PROVENANCE_MAPPING'
  | 'NORMALIZATION'
  | 'VALIDATION'
  | 'EMISSION';

export type PipelineProcessingState =
  | 'RAW_CAPTURED'
  | 'PARSED'
  | 'PROVENANCE_MAPPED'
  | 'NORMALIZED'
  | 'VALIDATED'
  | 'COMMITTED'
  | 'REJECTED';

export interface ProvenanceNode {
  field: string;
  value: unknown;
  rawSnippet: string;
  sourceLocator: string;
  strategy: SelectorStrategy | 'SYNTHETIC_DERIVATION' | 'REGEX_EXTRACTION';
  captureTimestamp: string;
  transformations: string[];
  confidenceScore: number; // 0.00 - 1.00
  confidenceRationale: string;
  domEvidenceHash: string;
}

export interface RawCardObservation {
  observationId: string;
  jobId: string;
  runId: string;
  batchSequence: number;
  cardIndex: number;
  capturedAt: string;
  rawOuterHtml: string;
  rawTextContent: string;
  snapshotHash: string;
  boundingClientRect: { x: number; y: number; width: number; height: number };
  observedAttributes: Record<string, string>;
}

export type CtaNormalizedCategory =
  | 'LEARN_MORE'
  | 'SIGN_UP'
  | 'CONTACT_US'
  | 'APPLY_NOW'
  | 'GET_QUOTE'
  | 'BOOK_NOW'
  | 'DOWNLOAD'
  | 'SEND_MESSAGE'
  | 'SHOP_NOW'
  | 'SUBSCRIBE'
  | 'OTHER';

export type CreativeMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'TEXT_ONLY' | 'DHTML';

export interface NormalizedAdRecord {
  adLibraryId: string;
  adStatus: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
  pageName: string;
  pageProfileUrl?: string;
  pageLikesCount?: number;
  advertiserCategory?: string;
  startDateIso: string; // YYYY-MM-DD
  endDateIso?: string;
  bodyText: string;
  truncatedTextExpanded: boolean;
  ctaText?: string;
  ctaNormalizedCategory: CtaNormalizedCategory;
  destinationUrl?: string;
  cleanDestinationDomain?: string;
  creativeMediaCount: number;
  creativeMediaType: CreativeMediaType;
  platforms: ('FACEBOOK' | 'INSTAGRAM' | 'AUDIENCE_NETWORK' | 'MESSENGER')[];
  disclaimerText?: string;
  spendRangeEstimated?: { min: number; max: number; currency: string };
  impressionsRangeEstimated?: { min: number; max: number };
  leadGenIndicators: {
    hasFormLeadHook: boolean;
    hasDirectContactInfo: boolean;
    extractedEmails: string[];
    extractedPhoneE164: string[];
    identifiedIntentSignals: string[];
  };
}

export interface ValidationViolation {
  ruleId: string;
  field: string;
  message: string;
  severity: 'WARNING' | 'ERROR' | 'FATAL';
}

export interface ValidationReport {
  isValid: boolean;
  recordStatus: 'PASS' | 'FLAGGED' | 'REJECTED';
  overallConfidenceScore: number;
  violations: ValidationViolation[];
  validatedAt: string;
  rulesEvaluatedCount: number;
}

export interface CanonicalAdEnvelope {
  schemaVersion: '3.0.0-PROD';
  pipelineRunId: string;
  observationId: string;
  adLibraryId: string;
  compositeConfidence: number;
  record: NormalizedAdRecord;
  provenanceGraph: Record<string, ProvenanceNode>;
  validationReport: ValidationReport;
  rawSnapshotSha256: string;
  emittedAt: string;
}

export interface ExtractionCardFixture {
  id: string;
  name: string;
  category: 'STANDARD' | 'CAROUSEL' | 'LEAD_GEN' | 'DISCLAIMER' | 'EU_LOCALE' | 'TRUNCATED' | 'ANOMALOUS';
  description: string;
  rawHtml: string;
  expectedLibraryId: string;
  expectedPageName: string;
  expectedCta: CtaNormalizedCategory;
  expectedConfidenceThreshold: number;
}

export interface Phase03AuditCriterion {
  id: string;
  code: string;
  title: string;
  category:
    | 'TRACEABILITY'
    | 'OBSERVABILITY'
    | 'PIPELINE_ARCHITECTURE'
    | 'PROVENANCE_LINEAGE'
    | 'NORMALIZATION'
    | 'VALIDATION_RULES'
    | 'ANOMALY_HANDLING'
    | 'PERFORMANCE'
    | 'NON_GOALS';
  invariantRule: string;
  verificationEvidence: string;
  testCoverage: string;
}

// ==========================================
// PHASE 04 IDENTITY RESOLUTION & DEDUPLICATION TYPES
// ==========================================

export type EntityTier = 'OBSERVATION' | 'AD_ENTITY' | 'ADVERTISER_ENTITY' | 'BUSINESS_ENTITY';

export type MatchSignalType =
  | 'EXACT_AD_LIBRARY_ID'
  | 'EXACT_PAGE_PROFILE_URL'
  | 'EXACT_PAGE_NAME'
  | 'NORMALIZED_PAGE_NAME_SIMILARITY'
  | 'EXACT_DESTINATION_DOMAIN'
  | 'CANONICAL_DESTINATION_URL'
  | 'EXACT_PHONE_E164'
  | 'EXACT_EMAIL'
  | 'EXACT_DISCLAIMER_LEGAL_ENTITY'
  | 'GENERIC_DOMAIN_PENALTY'
  | 'CONFLICTING_DOMAIN_BLOCK'
  | 'CREATIVE_HASH_EXACT'
  | 'MANUAL_OPERATOR_OVERRIDE';

export type MatchDecision =
  | 'AUTOMATIC_CONFIRMED'
  | 'PROVISIONAL_REVIEW'
  | 'UNLINKED_DISTINCT'
  | 'CONFLICT_QUARANTINE'
  | 'MANUAL_MERGED'
  | 'MANUAL_SPLIT';

export interface AdEntityRecord {
  adEntityId: string;
  adLibraryId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
  observationCount: number;
  observationIds: string[];
  pageName: string;
  pageProfileUrl?: string;
  cleanDestinationDomain?: string;
  destinationUrl?: string;
  creativeMediaCount: number;
  creativeMediaType: CreativeMediaType;
  ctaNormalizedCategory: CtaNormalizedCategory;
  phones: string[];
  emails: string[];
  disclaimerText?: string;
  snapshotSha256: string;
}

export interface AdvertiserEntityRecord {
  advertiserId: string;
  canonicalPageName: string;
  normalizedNameKey: string;
  pageProfileUrl?: string;
  adCount: number;
  adEntityIds: string[];
  associatedDomains: string[];
  associatedPhones: string[];
  associatedEmails: string[];
  disclaimerTexts: string[];
  firstSeenAt: string;
  lastSeenAt: string;
  businessEntityId?: string;
}

export interface MatchSignalEvidence {
  signalType: MatchSignalType;
  weight: number;
  rawScore: number;
  contributedScore: number;
  rationale: string;
  evidenceA: string;
  evidenceB: string;
  isAnchor: boolean;
}

export interface CandidatePairEvaluation {
  pairId: string;
  candidateIdA: string;
  candidateNameA: string;
  candidateIdB: string;
  candidateNameB: string;
  matchScore: number;
  decision: MatchDecision;
  primaryAnchorSignal?: MatchSignalType;
  signals: MatchEvidenceSignalItem[];
  blockingRulesTriggered: string[];
  conflictReasons: string[];
  evaluatedAt: string;
}

export interface MatchEvidenceSignalItem {
  signalType: MatchSignalType;
  weight: number;
  rawScore: number;
  contributedScore: number;
  rationale: string;
  evidenceA: string;
  evidenceB: string;
  isAnchor: boolean;
}

export interface MergeLedgerEntry {
  mergeId: string;
  timestamp: string;
  operator: 'SYSTEM_DETERMINISTIC_ENGINE' | 'HUMAN_OPERATOR';
  action: 'AUTO_MERGE' | 'MANUAL_MERGE' | 'MANUAL_UNMERGE' | 'QUARANTINE_FLAG';
  sourceEntityId: string;
  sourceEntityName: string;
  targetClusterId: string;
  targetClusterName: string;
  matchScore: number;
  primarySignal: string;
  isReversible: boolean;
  isReversed: boolean;
  reversedAt?: string;
  reversalReason?: string;
  evidenceHash: string;
}

export interface BusinessEntityCluster {
  clusterId: string;
  canonicalName: string;
  brandAliases: string[];
  primaryDomain?: string;
  associatedDomains: string[];
  associatedPhones: string[];
  associatedEmails: string[];
  advertiserIds: string[];
  adLibraryIds: string[];
  observationCount: number;
  confidenceScore: number;
  status: 'ACTIVE' | 'FLAGGED_CONFLICT' | 'IN_REVIEW' | 'ARCHIVED';
  isManuallyMerged?: boolean;
  createdAt: string;
  updatedAt: string;
  mergeHistory: MergeLedgerEntry[];
}

export interface IdentityResolutionGraph {
  observations: CanonicalAdEnvelope[];
  adEntities: AdEntityRecord[];
  advertiserEntities: AdvertiserEntityRecord[];
  businessEntities: BusinessEntityCluster[];
  candidateEvaluations: CandidatePairEvaluation[];
  mergeLedger: MergeLedgerEntry[];
  metrics: {
    totalObservations: number;
    distinctAds: number;
    distinctAdvertisers: number;
    distinctBusinessEntities: number;
    deduplicationRatio: number;
    autoConfirmedMerges: number;
    provisionalReviews: number;
    conflictsQuarantined: number;
    processingTimeMs: number;
  };
}

export interface Phase04AuditCriterion {
  id: string;
  code: string;
  title: string;
  category:
    | 'IDENTITY_HIERARCHY'
    | 'MATCH_SIGNALS'
    | 'BLOCKING_RULES'
    | 'REVERSIBILITY'
    | 'CONFLICT_RESOLUTION'
    | 'AUDITABILITY'
    | 'PERFORMANCE_INTEGRITY'
    | 'NON_GOALS';
  requirement: string;
  verificationEvidence: string;
  testCoverage: string;
}

export interface Phase04ScenarioFixture {
  id: string;
  name: string;
  category:
    | 'SAME_AD_MULTI_OBSERVATION'
    | 'SAME_ADVERTISER_MULTI_AD'
    | 'FRANCHISE_REGIONAL_PAGES'
    | 'AGENCY_MULTI_CLIENT_CONFLICT'
    | 'AFFILIATE_GENERIC_DOMAIN_BLOCK'
    | 'NAME_TYPO_SIMILARITY'
    | 'DISCLAIMER_LEGAL_PARENT'
    | 'PHONE_COLLISION_DIFFERENT_BRANDS'
    | 'CO_MARKETING_LEAD_FORM'
    | 'REVERSIBLE_UNMERGE_SPLIT';
  description: string;
  rawInputCount: number;
  expectedAdCount: number;
  expectedAdvertiserCount: number;
  expectedBusinessEntityCount: number;
  expectedConflictCount: number;
  expectedPrimaryDecision: MatchDecision;
}

// ==========================================
// PHASE 05 VERIFICATION & SSRF SAFETY TYPES
// ==========================================

export type VerificationTargetType =
  | 'AD_DESTINATION_URL'
  | 'LANDING_PAGE'
  | 'DOMAIN_HOSTNAME'
  | 'ADVERTISER_IDENTITY'
  | 'BUSINESS_ENTITY'
  | 'ADVERTISER_DESTINATION_RELATIONSHIP'
  | 'PUBLIC_BUSINESS_INFO'
  | 'WEBSITE_HEALTH';

export type VerificationClaimType =
  | 'URL_SAFE'
  | 'DOMAIN_RESOLVES'
  | 'HTTPS_AVAILABLE'
  | 'PAGE_REACHABLE'
  | 'PAGE_CONTENT_ACCESSIBLE'
  | 'BUSINESS_NAME_VISIBLE'
  | 'LEGAL_NAME_DISPLAYED'
  | 'CONTACT_INFO_PRESENT'
  | 'EMAIL_DOMAIN_CONSISTENT'
  | 'PHONE_NUMBER_PUBLIC'
  | 'ADDRESS_PUBLIC'
  | 'SERVICE_CATEGORY_CONSISTENT'
  | 'PUBLIC_PROFILE_LINK_PRESENT'
  | 'DESTINATION_MATCHES_ADVERTISER_NAME'
  | 'ADVERTISER_DESTINATION_CONSISTENT';

export type VerificationState =
  | 'NOT_CHECKED'
  | 'VERIFIED_PUBLIC_URL'
  | 'VERIFIED_DOMAIN_REACHABILITY'
  | 'VERIFIED_BUSINESS_IDENTITY_EVIDENCE'
  | 'VERIFIED_ADVERTISER_DESTINATION_CONSISTENCY'
  | 'PARTIALLY_VERIFIED'
  | 'CONFLICTING_EVIDENCE'
  | 'INCONCLUSIVE'
  | 'UNAVAILABLE'
  | 'BLOCKED'
  | 'ERROR';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCERTAIN' | 'UNKNOWN';

export type VerificationErrorCode =
  | 'INVALID_URL'
  | 'UNSUPPORTED_SCHEME'
  | 'SSRF_BLOCKED'
  | 'DNS_FAILURE'
  | 'CONNECTION_FAILURE'
  | 'TLS_FAILURE'
  | 'TIMEOUT'
  | 'HTTP_ACCESS_DENIED'
  | 'HTTP_NOT_FOUND'
  | 'HTTP_RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'LOGIN_REQUIRED'
  | 'CAPTCHA_DETECTED'
  | 'BOT_CHALLENGE'
  | 'CONTENT_PARSE_ERROR'
  | 'CONTENT_TOO_LARGE'
  | 'REDIRECT_LIMIT'
  | 'DOMAIN_BOUNDARY_VIOLATION'
  | 'VERIFICATION_CONFLICT'
  | 'INSUFFICIENT_EVIDENCE'
  | 'POLICY_RESTRICTION'
  | 'UNKNOWN';

export interface VerificationEvidence {
  evidenceId: string;
  targetType: VerificationTargetType;
  targetId: string;
  claimType: VerificationClaimType;
  sourceUrl: string;
  sourceDomain: string;
  observedValue: string | number | boolean | Record<string, unknown>;
  evidenceSnippet: string;
  extractionMethod:
    | 'HTTP_DOM_PARSER'
    | 'BROWSER_PAGE_EVAL'
    | 'DNS_QUERY'
    | 'TLS_HANDSHAKE'
    | 'HTTP_HEADER'
    | 'META_TAG';
  observedAt: string;
  retrievalStatus: number | string;
  confidence: ConfidenceLevel;
  classification:
    | 'ANCHOR_EVIDENCE'
    | 'CORROBORATING_EVIDENCE'
    | 'TECHNICAL_SIGNAL'
    | 'DISCOVERY_SIGNAL';
  verificationVersion: string;
}

export interface VerificationClaim {
  claimType: VerificationClaimType;
  isSupported: boolean;
  confidence: ConfidenceLevel;
  evidenceIds: string[];
  evaluatedAt: string;
  explanation: string;
}

export interface VerificationConflict {
  conflictId: string;
  conflictType:
    | 'NAME_MISMATCH'
    | 'DOMAIN_MISMATCH'
    | 'CONTENT_IRRELEVANT'
    | 'MULTIPLE_INCONSISTENT_NAMES'
    | 'SUSPICIOUS_REDIRECT'
    | 'TEMPORAL_CHANGE';
  severity: 'CRITICAL' | 'MODERATE' | 'LOW';
  description: string;
  evidenceA: string;
  evidenceB: string;
  detectedAt: string;
  resolutionStatus: 'UNRESOLVED' | 'OPERATOR_REVIEWED' | 'DISMISSED';
}

export interface VerificationSummary {
  targetId: string;
  targetType: VerificationTargetType;
  targetUrl: string;
  advertiserName: string;
  status: VerificationState;
  claims: VerificationClaim[];
  evidence: VerificationEvidence[];
  conflicts: VerificationConflict[];
  warnings: string[];
  checkedAt: string;
  verificationVersion: string;
  retrievalMode: 'HTTP_SAFE' | 'BROWSER_RENDERED';
  metrics: {
    dnsTimeMs: number;
    connectionTimeMs: number;
    tlsTimeMs: number;
    parseTimeMs: number;
    bytesRetrieved: number;
    pagesChecked: number;
    totalDurationMs: number;
  };
}

export interface SsrfSecurityVector {
  id: string;
  inputUrl: string;
  attackClass:
    | 'LOOPBACK'
    | 'PRIVATE_RFC1918'
    | 'LINK_LOCAL_METADATA'
    | 'IPV6_LOCAL'
    | 'DNS_REBINDING'
    | 'UNSUPPORTED_SCHEME'
    | 'OCTAL_HEX_ENCODING'
    | 'REDIRECT_TO_PRIVATE'
    | 'CREDENTIALS_IN_URL'
    | 'PORT_SCAN_PROHIBITED';
  expectedOutcome: 'BLOCKED' | 'ALLOWED';
  blockedReason: string;
  testDescription: string;
}

export interface WebsiteFixture {
  id: string;
  fixtureNumber: number;
  name: string;
  url: string;
  advertiserName: string;
  category:
    | 'VALID_BUSINESS'
    | 'UNREACHABLE'
    | 'HTTP_404'
    | 'HTTP_403'
    | 'REDIRECT_PUBLIC'
    | 'REDIRECT_SSRF'
    | 'LOGIN_WALL'
    | 'CAPTCHA'
    | 'BOT_CHALLENGE'
    | 'NAME_VISIBLE'
    | 'NAME_ABSENT'
    | 'NAME_CONFLICT'
    | 'UNRELATED_LANDING'
    | 'NAME_EXACT'
    | 'DIFF_BRAND_SAME_DOMAIN'
    | 'CONTACT_PAGE'
    | 'SOCIAL_LINKS'
    | 'OVERSIZED'
    | 'MALFORMED_HTML'
    | 'JS_RENDERED'
    | 'EMPTY_PAGE';
  description: string;
  expectedStatus: VerificationState;
  expectedErrorCode?: VerificationErrorCode;
  expectedClaimsSupported: VerificationClaimType[];
  expectedClaimsUnsupported: VerificationClaimType[];
  semanticInvariantChecked: string;
}

export interface Phase05AuditCriterion {
  id: string;
  code: string;
  title: string;
  category:
    | 'TRACEABILITY'
    | 'SSRF_SECURITY'
    | 'RETRIEVAL_BOUNDS'
    | 'CLAIM_DECOMPOSITION'
    | 'IDENTITY_CONSISTENCY'
    | 'FAILURE_SEMANTICS'
    | 'TEMPORAL_AUDIT'
    | 'NON_GOALS';
  requirement: string;
  verificationEvidence: string;
  testCoverage: string;
}

// ==========================================
// PHASE 06 — LEAD QUALIFICATION, SCORING & EXPLAINABILITY TYPES
// ==========================================

export type QualificationState =
  | 'NOT_ELIGIBLE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'QUALIFIED'
  | 'REVIEW_REQUIRED'
  | 'VERIFIED_FOR_WORKFLOW'
  | 'EXPIRED'
  | 'REJECTED_BY_RULE';

export type EvidenceState =
  | 'PRESENT'
  | 'ABSENT'
  | 'UNKNOWN'
  | 'UNAVAILABLE'
  | 'FAILED'
  | 'NOT_APPLICABLE';

export type FreshnessState =
  | 'CURRENT'
  | 'RECENT'
  | 'STALE'
  | 'UNKNOWN';

export type RuleType = 'BLOCKER' | 'SIGNAL' | 'INFORMATIONAL';

export type SignalCategory =
  | 'ADVERTISING_ACTIVITY'
  | 'WEBSITE_DESTINATION'
  | 'IDENTITY_CONSISTENCY'
  | 'BUSINESS_CONTACTABILITY';

export type PrioritizationPolicy =
  | 'BALANCED_SCORE_DESCENDING'
  | 'HIGH_CONFIDENCE_FIRST'
  | 'COMPLETE_EVIDENCE_FIRST'
  | 'RECENT_ACTIVITY_FIRST'
  | 'REVIEW_QUEUE_FIRST';

export type ScoringModelStatus =
  | 'DRAFT'
  | 'TESTING'
  | 'SHADOW'
  | 'ACTIVE'
  | 'RETIRED';

export interface SignalContribution {
  signalId: string;
  signalName: string;
  category: SignalCategory;
  ruleId: string;
  evidenceState: EvidenceState;
  freshness: FreshnessState;
  pointsAwarded: number;
  maxPoints: number;
  weight: number;
  cappedContribution: number;
  confidenceWeight: number;
  evidenceReferences: string[];
  rationale: string;
}

export interface BlockingCondition {
  blockerId: string;
  name: string;
  severity: 'CRITICAL_BLOCKER' | 'CONDITIONAL_BLOCKER';
  triggered: boolean;
  triggerReason?: string;
  evidenceReference?: string;
}

export interface ScoringInputSnapshot {
  snapshotId: string;
  entityId: string;
  advertiserName: string;
  canonicalAdCount: number;
  firstObservedAt: string;
  lastObservedAt: string;
  creativeSignaturesCount: number;
  platforms: string[];
  destinationUrl?: string;
  landingReachable?: boolean;
  httpsAvailable?: boolean;
  verificationCheckedAt?: string;
  verificationStatus?: string;
  verificationClaimsSupported?: string[];
  identityConsistencyState?: 'CONSISTENT' | 'PARTIALLY_CONSISTENT' | 'DIFFERENT' | 'CONFLICTING' | 'INCONCLUSIVE';
  publicBusinessEmail?: string;
  publicBusinessPhone?: string;
  publicAddress?: string;
  industryClass?: string;
  hasCriticalConflict: boolean;
  conflictSummary?: string;
  capturedAt: string;
  verificationRuleVersion: string;
}

export interface ManualOverrideRecord {
  overrideId: string;
  entityId: string;
  previousStatus: QualificationState;
  newStatus: QualificationState;
  previousScore: number;
  newScore?: number;
  reason: string;
  reviewer: string;
  appliedAt: string;
  policyVersion: string;
}

export interface QualificationResult {
  qualificationId: string;
  entityId: string;
  status: QualificationState;
  score: number;
  scoreRange: { min: number; max: number };
  categoryScores: Record<SignalCategory, { raw: number; capped: number; max: number }>;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  modelId: string;
  modelVersion: string;
  ruleSetVersion: string;
  signalContributions: SignalContribution[];
  positiveEvidence: string[];
  negativeEvidence: string[];
  missingEvidence: string[];
  conflicts: string[];
  blockingConditions: BlockingCondition[];
  explanation: string;
  calculatedAt: string;
  snapshotId: string;
  manualOverride?: ManualOverrideRecord;
}

export interface ScoringRule {
  ruleId: string;
  version: string;
  category: SignalCategory;
  ruleType: RuleType;
  name: string;
  criterion: string;
  weight: number;
  maxContribution: number;
  rationale: string;
}

export interface ScoringModelDefinition {
  modelId: string;
  version: string;
  name: string;
  status: ScoringModelStatus;
  description: string;
  author: string;
  createdAt: string;
  categoryCaps: Record<SignalCategory, number>;
  rules: ScoringRule[];
  eligibilityRequirements: string[];
}

export interface ModelEvaluationImpact {
  evaluationId: string;
  activeModelId: string;
  activeModelVersion: string;
  candidateModelId: string;
  candidateModelVersion: string;
  evaluatedEntitiesCount: number;
  meanScoreActive: number;
  meanScoreCandidate: number;
  scoreDelta: number;
  statusTransitions: Record<string, number>;
  newlyQualified: string[];
  newlyDisqualified: string[];
  distributionShiftPercent: number;
  evaluatedAt: string;
}

export interface GoldenScoringDataset {
  id: string;
  name: string;
  description: string;
  inputSnapshot: ScoringInputSnapshot;
  expectedStatus: QualificationState;
  expectedScoreMin: number;
  expectedScoreMax: number;
  expectedConfidence: ConfidenceLevel;
  expectedBlockers: string[];
  semanticInvariants: string[];
}

export interface Phase06AuditCriterion {
  id: string;
  code: string;
  title: string;
  category:
    | 'TRACEABILITY'
    | 'SEPARATION'
    | 'BLOCKERS'
    | 'DOUBLE_COUNTING'
    | 'CONFIDENCE'
    | 'EXPLAINABILITY'
    | 'AUDIT_OVERRIDE'
    | 'SAFETY_PRIVACY'
    | 'REGRESSION';
  requirement: string;
  verificationEvidence: string;
  testCoverage: string;
}

// ============================================================
// PHASE 07: POSTGRESQL PERSISTENCE & AUDITABILITY TYPES
// ============================================================

export type DatabaseLayer =
  | 'A_OBSERVATION'
  | 'B_CANONICAL'
  | 'C_IDENTITY'
  | 'D_VERIFICATION'
  | 'E_QUALIFICATION'
  | 'F_EXECUTION'
  | 'G_AUDIT'
  | 'H_EXPORT';

export type TableMutability =
  | 'IMMUTABLE'
  | 'VERSIONED_FACT'
  | 'CURRENT_STATE'
  | 'REFERENCE_CONFIG';

export type RetentionTier =
  | 'PERMANENT'
  | 'HIGH_RETENTION_7YR'
  | 'OPERATIONAL_90D'
  | 'TRANSIENT_30D';

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  description: string;
}

export interface ForeignKeyDefinition {
  column: string;
  referencesTable: string;
  referencesColumn: string;
  onDelete: 'RESTRICT' | 'NO ACTION' | 'CASCADE';
  justification: string;
}

export interface UniqueConstraintDefinition {
  name: string;
  columns: string[];
  isPartial?: boolean;
  whereClause?: string;
  justification: string;
}

export interface CheckConstraintDefinition {
  name: string;
  expression: string;
  invariantDescription: string;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  type: 'BTREE' | 'GIN' | 'HASH';
  isUnique?: boolean;
  whereClause?: string;
  querySupported: string;
  cardinality: 'HIGH' | 'MEDIUM' | 'LOW';
  writeCost: 'LOW' | 'MEDIUM' | 'HIGH';
  justification: string;
}

export interface TableSpecification {
  name: string;
  layer: DatabaseLayer;
  mutability: TableMutability;
  retention: RetentionTier;
  primaryKey: string;
  primaryKeyType: 'UUIDv7' | 'BIGINT_IDENTITY' | 'VARCHAR';
  columns: ColumnDefinition[];
  foreignKeys: ForeignKeyDefinition[];
  uniqueConstraints: UniqueConstraintDefinition[];
  checkConstraints: CheckConstraintDefinition[];
  indexes: IndexDefinition[];
  provenanceRule: string;
  description: string;
}

export interface DatabaseMigration {
  version: string;
  name: string;
  layer: DatabaseLayer;
  tablesCreated: string[];
  upSql: string;
  downSql: string;
  zeroDowntimeSafety: string;
  rollbackPlan: string;
}

export type TransactionType =
  | 'OBSERVATION_INGESTION'
  | 'IDENTITY_MERGE'
  | 'IDENTITY_SPLIT'
  | 'VERIFICATION_PERSIST'
  | 'SCORING_PERSIST'
  | 'MANUAL_OVERRIDE'
  | 'MODEL_ACTIVATION';

export interface TransactionStepLog {
  step: number;
  operation: string;
  table: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'VALIDATE' | 'AUDIT';
  status: 'COMMITTED' | 'ROLLED_BACK' | 'PENDING';
  details: string;
}

export interface SimulatedTransactionResult {
  transactionId: string;
  transactionType: TransactionType;
  startedAt: string;
  completedAt: string;
  status: 'COMMITTED' | 'ROLLED_BACK';
  rollbackReason?: string;
  affectedTables: string[];
  stepLogs: TransactionStepLog[];
  auditEventId?: string;
  correlationId: string;
}

export interface DatabaseLineageNode {
  id: string;
  label: string;
  layer: DatabaseLayer;
  table: string;
  timestamp: string;
  summary: string;
  status: 'VALID' | 'DEPRECATED' | 'OVERRIDDEN' | 'CONFLICT';
  details: Record<string, any>;
}

export interface DatabaseLineageEdge {
  fromId: string;
  toId: string;
  relationshipType: string;
  ruleVersion?: string;
  confidence?: string;
}

export interface ProvenanceLineageGraph {
  rootObservationId: string;
  advertiserId: string;
  nodes: DatabaseLineageNode[];
  edges: DatabaseLineageEdge[];
}

export interface LeadResearchReadModel {
  advertiserId: string;
  canonicalName: string;
  status: string;
  externalAdLibraryId: string;
  activeAdCount: number;
  observedDaysCount: number;
  primaryDestinationUrl: string;
  registrableDomain: string;
  verificationStatus: string;
  verificationEvidenceCount: number;
  hasSsl: boolean;
  hasOpenDom: boolean;
  qualificationState: string;
  score: number;
  confidence: string;
  activeBlockers: string[];
  scoringModelVersion: string;
  lastCalculatedAt: string;
  auditTrailCount: number;
  provenanceHash: string;
}

export interface Phase07AuditCriterion {
  id: string;
  code: string;
  title: string;
  category:
    | 'TRACEABILITY'
    | 'IMMUTABILITY'
    | 'INTEGRITY'
    | 'TRANSACTIONS'
    | 'CONCURRENCY'
    | 'PROVENANCE'
    | 'SECURITY_PRIVACY'
    | 'MIGRATION_RESTORE';
  requirement: string;
  verificationEvidence: string;
  testCoverage: string;
}

// ============================================================================
// PHASE 08 CONTRACTS & UI TYPES
// ============================================================================

export type ExportFormat = 'CSV' | 'JSON' | 'XLSX';

export interface JobCreationFormModel {
  idempotencyKey: string;
  query: string;
  countryCode: string;
  adActiveStatus: 'ACTIVE' | 'ALL';
  mediaType: 'ALL' | 'IMAGE' | 'MEME' | 'VIDEO';
  maxResults: number;
  executionTimeoutSeconds: number;
  tenantId: string;
}

export type ResearchMode = 'PRESET' | 'CUSTOM';

export interface ResearchJobModel {
  jobId: string;
  idempotencyKey: string;
  query: string;
  countryCode: string;
  locationName?: string;
  locationCatalogueVersion?: string;
  mode?: ResearchMode;
  presetId?: string;
  presetVersion?: string;
  websiteRequired?: boolean;
  state: JobState;
  progressPercent: number;
  processedCount: number;
  totalExpectedLimit: number;
  stopReason?: string;
  lastCheckpointToken?: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  isPartial: boolean;
  challengeReason?: string;
  workerId: string;
  batchId: string;
  tenantId: string;
}

export interface ScoreSignalExplanation {
  signal: string;
  ruleId: string;
  ruleVersion: string;
  contribution: number;
  evidence: string;
  explanation: string;
}

export interface AdvertiserViewModel {
  advertiserId: string;
  canonicalName: string;
  facebookPageName?: string;
  facebookPageUrl?: string;
  facebookPageState?: 'found' | 'not_found' | 'unknown';
  locationCode?: string;
  historicalNames: { name: string; observedAt: string; sourceTokenId: string }[];
  adLibraryId: string;
  activeAdCount: number;
  destinationDomain: string;
  destinationUrl: string;
  websiteState?: 'found' | 'not_found' | 'unknown';
  matchedKeywords?: string[];
  sourcePresetId?: string;
  websiteReachable: boolean;
  businessIdentitySupported: boolean;
  verificationFreshness: string;
  verificationStatusCode: number;
  tlsVersion: string;
  ssrfValidated: boolean;
  qualificationState: 'QUALIFIED' | 'DISQUALIFIED' | 'REVIEW_REQUIRED' | 'NEEDS_DATA';
  qualificationScore: number;
  scoreConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  scoringModelVersion: string;
  scoreExplanation: ScoreSignalExplanation[];
  positiveSignals: string[];
  negativeEvidence: string[];
  missingEvidence: string[];
  activeBlockers: string[];
  identityReviewState: 'CONFIRMED' | 'PENDING_REVIEW' | 'FLAGGED_CONFLICT';
  hasActiveManualOverride: boolean;
  overrideDetails?: {
    originalScore: number;
    overrideScore: number;
    reasonCode: string;
    notes: string;
    reviewerId: string;
    appliedAt: string;
  };
  provenanceSummary: {
    source: string;
    observedAt: string;
    adapterVersion: string;
    extractionVersion: string;
    normalizationVersion: string;
    identityResolutionVersion: string;
    verificationVersion: string;
    scoringVersion: string;
    rawPayloadHash: string;
  };
  lastCalculatedAt: string;
  dataState: 'OBSERVED' | 'NORMALIZED' | 'DERIVED' | 'INFERRED' | 'VERIFIED' | 'CONFLICTING';
}

export interface AdViewModel {
  adId: string;
  advertiserId: string;
  adLibraryId: string;
  observedText: string;
  headline: string;
  ctaText: string;
  startDate: string;
  platforms: string[];
  destinationUrl: string;
  creativeType: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'UNKNOWN';
  extractionStatus: 'SUCCESS' | 'NOT_OBSERVED' | 'EXTRACTION_FAILED' | 'PARTIAL';
  provenanceHash: string;
}

export type ReviewQueueType = 'IDENTITY_AMBIGUITY' | 'VERIFICATION_CONFLICT' | 'QUALIFICATION_REVIEW' | 'MANUAL_OVERRIDE';

export interface ReviewItemModel {
  id: string;
  type: ReviewQueueType;
  entityId: string;
  entityName: string;
  issueDescription: string;
  evidenceDetails: Record<string, any>;
  status: 'PENDING' | 'RESOLVED' | 'DEFERRED';
  createdAt: string;
  schemaVersion: string;
  allowedActions: string[];
}

export interface IdentityReviewPairModel {
  pairId: string;
  entityA: { id: string; name: string; domain: string; adCount: number; observedAt: string };
  entityB: { id: string; name: string; domain: string; adCount: number; observedAt: string };
  matchingSignals: string[];
  conflictingSignals: string[];
  confidenceScore: number;
  proposedRelationship: 'SAME_BUSINESS' | 'AGENCY_CLIENT' | 'DISTINCT';
  sourceEvidence: string[];
}

export interface ManualOverrideSubmission {
  entityId: string;
  currentScore: number;
  currentQualificationState: string;
  overrideScore: number;
  overrideState: 'QUALIFIED' | 'DISQUALIFIED' | 'REVIEW_REQUIRED';
  reasonCode: 'EXTERNAL_BUSINESS_PROOF' | 'FALSE_POSITIVE_KEYWORD' | 'MANUAL_COMPLIANCE_CLEARANCE' | 'RE_EVALUATION_REQUEST';
  reasonNotes: string;
  reviewerId: string;
  tenantId: string;
}

export type ExportProfileType =
  | 'BASIC_LEAD_EXPORT'
  | 'DETAILED_RESEARCH_EXPORT'
  | 'AUDIT_EXPORT'
  | 'QUALIFICATION_EXPORT';

export type ExportFieldClassification =
  | 'SAFE_BUSINESS'
  | 'PROVENANCE_METADATA'
  | 'INTERNAL_REDACTED'
  | 'PROHIBITED';

export interface ExportColumnDef {
  key: string;
  label: string;
  classification: ExportFieldClassification;
  sanitization: 'FORMULA_ESCAPE' | 'EXACT' | 'REDACT';
  description: string;
}

export interface ExportJobModel {
  exportId: string;
  profile: ExportProfileType;
  format: 'CSV' | 'JSON' | 'XLSX';
  recordCount: number;
  status: 'QUEUED' | 'GENERATING' | 'VALIDATING' | 'COMPLETED' | 'EXPORT_FAILED';
  createdAt: string;
  completedAt?: string;
  filtersApplied: Record<string, any>;
  sanitizationApplied: boolean;
  sha256Checksum?: string;
  downloadToken?: string;
  tokenExpiresAt?: string;
  errorMessage?: string;
  tenantId: string;
}

export interface ChromeMV3PermissionEntry {
  permission: string;
  purpose: string;
  featureUsingIt: string;
  whyRequired: string;
  securityRisk: string;
  alternativeConsidered: string;
  granted: boolean;
}

export interface Phase08AuditCriterion {
  id: string;
  code: string;
  title: string;
  category:
    | 'TRACEABILITY'
    | 'SEPARATION'
    | 'JOB_CONTROL'
    | 'OBSERVABILITY'
    | 'VERIFICATION_QUALIFICATION'
    | 'REVIEW_AUDIT'
    | 'EXPORT_INTEGRITY'
    | 'MV3_SECURITY';
  requirement: string;
  verificationEvidence: string;
  testCoverage: string;
}

// ============================================================================
// PHASE 09 RELIABILITY, RECOVERY & OPERATIONAL SPECIFICATION TYPES
// ============================================================================

export type FailureCategory =
  | 'TRANSIENT'
  | 'RETRYABLE'
  | 'NON_RETRYABLE'
  | 'BLOCKED'
  | 'CHALLENGED'
  | 'DATA_CORRUPTION_RISK'
  | 'UI_CHANGE'
  | 'RESOURCE_EXHAUSTION'
  | 'DEPENDENCY_OUTAGE'
  | 'CONFIGURATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'SYSTEM_ERROR';

export type SystemPauseMode =
  | 'NORMAL'
  | 'DRAINING'
  | 'PAUSED'
  | 'COLLECTION_DISABLED'
  | 'VERIFICATION_DISABLED'
  | 'EXPORT_ONLY'
  | 'MAINTENANCE'
  | 'EMERGENCY_STOP';

export type KillSwitchScope =
  | 'GLOBAL_COLLECTION'
  | 'SOURCE_ADAPTER'
  | 'JOB_TYPE'
  | 'WORKER_POOL'
  | 'SCHEDULE';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type BrowserHealthState =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'UNRESPONSIVE'
  | 'CRASHED'
  | 'TERMINATING';

export type ScheduleOverlapPolicy = 'SKIP' | 'QUEUE' | 'COALESCE' | 'ALLOW';

export type IncidentSeverity = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';

export interface WorkerLeaseModel {
  workerId: string;
  leaseId: string;
  fencingToken: number;
  leaseStart: string;
  leaseExpiry: string;
  lastHeartbeat: string;
  status: 'ACTIVE' | 'SUSPECT' | 'EXPIRED' | 'FENCED';
  activeJobId?: string;
  activeRunId?: string;
  missedHeartbeats: number;
  memoryMb: number;
  browserPids: number[];
  hostNode: string;
}

export interface CircuitBreakerModel {
  name: string;
  dependency: string;
  state: CircuitBreakerState;
  failureThresholdPct: number;
  consecutiveFailures: number;
  openTimeoutSec: number;
  lastStateChange: string;
  totalCalls: number;
  failedCalls: number;
}

export interface ChaosScenario {
  id: string;
  name: string;
  category: 'BROWSER' | 'WORKER' | 'DATABASE' | 'QUEUE' | 'SCHEMA_DRIFT' | 'CHECKPOINT' | 'EVENT';
  description: string;
  faultInjected: string;
  expectedDetection: string;
  containmentAction: string;
  recoveryVerification: string;
  lifecycleTransitions: string[];
  passStatus: boolean;
}

export interface FieldPresenceMetric {
  field: string;
  adapterVersion: string;
  baselineRatePct: number;
  currentRatePct: number;
  anomalyThresholdPct: number;
  status: 'NORMAL' | 'ANOMALOUS';
  samplesEvaluated: number;
}

export interface ReconciliationResult {
  id: string;
  name: string;
  targetDomain: 'DATABASE' | 'JOB_STATE' | 'WORKER_LEASE' | 'CHECKPOINTS' | 'EXPORTS' | 'PROVENANCE';
  recordsAudited: number;
  anomaliesFound: number;
  status: 'CLEAN' | 'RECONCILED' | 'MANUAL_ATTENTION_REQUIRED';
  lastRunTimestamp: string;
  repairAuditLog: string;
}

export interface RunbookModel {
  id: string;
  title: string;
  severity: IncidentSeverity;
  trigger: string;
  detection: string;
  immediateContainment: string;
  diagnosis: string;
  recovery: string;
  validation: string;
  rollbackPlan: string;
  auditRequirements: string;
  exitCriteria: string;
}

export interface AlertRuleModel {
  alertName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  condition: string;
  window: string;
  threshold: string;
  labels: Record<string, string>;
  suppressionRules: string;
  runbookId: string;
  expectedOperatorAction: string;
}

export interface CandidateSLOModel {
  sloName: string;
  measurement: string;
  population: string;
  window: string;
  target: string;
  exclusions: string;
  dataSource: string;
  alertingThreshold: string;
}

export interface Phase09AuditCriterion {
  id: string;
  code: string;
  title: string;
  category:
    | 'RELIABILITY_OBJECTIVES'
    | 'FAILURE_MATRIX'
    | 'WORKER_LEASING_FENCING'
    | 'HEARTBEAT_STALENESS'
    | 'BROWSER_HEALTH'
    | 'RETRIES_DEAD_LETTER'
    | 'CHECKPOINT_RESUME'
    | 'BACKPRESSURE_CONCURRENCY'
    | 'HEALTH_LIVENESS_READINESS'
    | 'CHANGE_ANOMALY_DETECTION'
    | 'INTEGRITY_RECONCILIATION'
    | 'METRICS_SLOS_LOGGING'
    | 'INCIDENT_RUNBOOKS'
    | 'KILL_SWITCH_DEGRADED'
    | 'CHAOS_SOAK_TESTING';
  requirement: string;
  verificationEvidence: string;
  testCoverage: string;
}

// ==========================================
// Phase 10: Full-System Integration & Acceptance Types
// ==========================================

export interface Phase10AuditCriterion {
  id: string;
  code: string;
  title: string;
  category:
    | 'SYSTEM_CONSISTENCY'
    | 'CONTRACT_COMPATIBILITY'
    | 'LIFECYCLE_LINEAGE'
    | 'FAILURE_RECOVERY'
    | 'SECURITY_SSRF'
    | 'APPLICATION_SECURITY'
    | 'DATA_INTEGRITY'
    | 'PERFORMANCE_LOAD'
    | 'OBSERVABILITY_DRILLS'
    | 'GO_LIVE_GATE';
  sourcePhase: string;
  implementationComponent: string;
  testCoverage: string;
  result: 'PASS' | 'FAIL' | 'BLOCKED';
  evidence: string;
  status: 'VERIFIED' | 'MONITORED';
}

export interface CrossPhaseConflict {
  id: string;
  type:
    | 'CONTRACT_CONFLICT'
    | 'SCHEMA_CONFLICT'
    | 'STATE_CONFLICT'
    | 'VERSION_CONFLICT'
    | 'RESPONSIBILITY_CONFLICT'
    | 'SECURITY_CONFLICT'
    | 'DATA-PROVENANCE_CONFLICT';
  issue: string;
  sourcePhases: string[];
  impact: string;
  severity: 'BLOCKER' | 'CRITICAL' | 'HIGH' | 'MEDIUM';
  minimalFix: string;
  requiredTest: string;
  resolutionStatus: 'RESOLVED_AND_TESTED' | 'APPLIED_AND_VERIFIED';
}

export interface SystemOfRecordDefinition {
  concept: string;
  authoritativeSubsystem: string;
  secondaryConsumers: string[];
  invariants: string[];
  concurrencyResolution: string;
}

export interface ContractCompatibilityCheck {
  interfaceName: string;
  upstreamService: string;
  downstreamService: string;
  protocol: string;
  schemaVersion: string;
  nullSemanticsSafe: boolean;
  unknownEnumSafe: boolean;
  backwardCompatible: boolean;
  errorMappingStandardized: boolean;
  auditEvidence: string;
}

export interface GoldenLineageRecord {
  step: number;
  stageName: string;
  subsystem: string;
  entityOrRecordId: string;
  hashOrSignature: string;
  payloadSnippet: Record<string, unknown>;
  provenanceVerified: boolean;
  transitionState: string;
  notes: string;
}

export interface FailureInjectionTestCase {
  id: string;
  pointNumber: number;
  targetSubsystem: string;
  faultScenario: string;
  expectedState: string;
  expectedRetryPolicy: string;
  expectedCheckpointAction: string;
  expectedOperatorVisibility: string;
  actualObservedResult: string;
  passStatus: boolean;
}

export interface SsrfValidationTest {
  id: string;
  targetPayload: string;
  vectorClassification:
    | 'LOOPBACK'
    | 'PRIVATE_IPV4'
    | 'PRIVATE_IPV6'
    | 'LINK_LOCAL'
    | 'CLOUD_METADATA'
    | 'DNS_REBINDING'
    | 'MALICIOUS_REDIRECT'
    | 'UNSUPPORTED_PROTOCOL'
    | 'REDIRECT_CHAIN'
    | 'OVERSIZED_RESPONSE'
    | 'SOCKET_TIMEOUT';
  enforcementLayer: 'DNS_RESOLVER' | 'SOCKET_HOOK' | 'PROTOCOL_FILTER' | 'RESPONSE_STREAM';
  blockedResponse: string;
  passStatus: boolean;
  auditNotes: string;
}

export interface ZeroResultSafetyScenario {
  caseId: 'CASE_A' | 'CASE_B' | 'CASE_C' | 'CASE_D' | 'CASE_E';
  name: string;
  condition: string;
  expectedState: 'VALID_EMPTY_RESULT' | 'SELECTOR_FALLBACK_FAILED' | 'RESULTS_UNSTABILIZED' | 'CHALLENGE_DETECTED' | 'UI_CHANGE_DETECTED';
  isSuccessState: boolean;
  operatorAlert: string;
  passStatus: boolean;
}

export interface PerformanceLoadMetric {
  tier: 'LEVEL_1_NORMAL' | 'LEVEL_2_SUSTAINED' | 'LEVEL_3_PEAK' | 'LEVEL_4_OVERLOAD';
  concurrencyRps: number;
  subsystem: string;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  cpuPct: number;
  memoryMb: number;
  dbPoolSaturationPct: number;
  backpressureEngaged: boolean;
  dataCorruptionCount: number;
  status: 'PASS' | 'DEGRADED_SAFE';
}

export interface KnownLimitationItem {
  id: string;
  limitation: string;
  component: string;
  userImpact: string;
  operationalImpact: string;
  workaround: string;
  plannedResolution: string;
  riskRating: 'LOW' | 'MEDIUM';
}

export interface OpenRiskItem {
  id: string;
  risk: string;
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectionMethod: string;
  mitigationStrategy: string;
  owner: string;
  releaseStatus: 'ACCEPTED_CONTROLLED' | 'MITIGATED_MONITORED';
}

export interface GoLiveChecklistItem {
  id: string;
  category: 'ARCHITECTURE' | 'SECURITY' | 'DATA' | 'BROWSER' | 'RELIABILITY' | 'OPERATIONS' | 'DEPLOYMENT' | 'CLIENT' | 'EXPORT';
  item: string;
  invariantRequirement: string;
  verifiedEvidence: string;
  signedOff: boolean;
}

export interface Phase10HandoffContract {
  phase: number;
  status: string;
  releaseStatus: 'RELEASE BLOCKED' | 'CONDITIONAL RELEASE' | 'RELEASE CANDIDATE' | 'READY FOR CONTROLLED GO-LIVE';
  systemVersion: string;
  components: string[];
  contractVersions: Record<string, string>;
  databaseVersion: string;
  adapterVersion: string;
  extractionSchemaVersion: string;
  normalizationVersion: string;
  identityResolutionVersion: string;
  verificationVersion: string;
  qualificationModelVersion: string;
  apiVersion: string;
  extensionVersion: string;
  testSummary: {
    unit: { total: number; passed: number; failed: number };
    integration: { total: number; passed: number; failed: number };
    e2e: { total: number; passed: number; failed: number };
    security: { total: number; passed: number; failed: number };
    performance: { total: number; passed: number; failed: number };
    recovery: { total: number; passed: number; failed: number };
    accessibility: { total: number; passed: number; failed: number };
    migration: { total: number; passed: number; failed: number };
  };
  releaseBlockers: Array<{
    id: string;
    description: string;
    status: 'RESOLVED' | 'OPEN';
    resolutionProof: string;
  }>;
  knownLimitations: KnownLimitationItem[];
  openRisks: OpenRiskItem[];
  approvedExceptions: Array<{
    id: string;
    requirement: string;
    reason: string;
    scope: string;
    compensatingControl: string;
    expirationDate: string;
    approvedBy: string;
  }>;
  deploymentChecks: string[];
  rollbackConditions: string[];
  goLiveChecklist: GoLiveChecklistItem[];
  operationalRunbooks: string[];
  postLaunchMonitoring: string[];
  phase10FinalEvidence: Array<{
    category: string;
    artifactHash: string;
    description: string;
    timestamp: string;
  }>;
}








