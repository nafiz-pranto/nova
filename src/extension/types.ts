/**
 * Chrome MV3 Meta Ad Library Scraper Extension Types
 */

export type ResearchMode = 'CUSTOM' | 'PRESET';

export type JobStatus =
  | 'IDLE'
  | 'STARTING'
  | 'NAVIGATING'
  | 'COLLECTING'
  | 'NORMALIZING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'CANCELLED'
  | 'BLOCKED'
  | 'FAILED'
  | 'RECOVERY_REQUIRED'
  | 'BROWSER_TAB_CLOSED'
  | 'BROWSER_INTERRUPTED'
  | 'RATE_LIMITED'
  | 'CHALLENGED';

export type ResearchStopReason =
  | 'TARGET_REACHED'
  | 'SOURCE_EXHAUSTED'
  | 'SOURCE_EXHAUSTED_VERIFIED'
  | 'SOURCE_PROGRESS_STALLED'
  | 'NO_NEW_RESULTS_OBSERVED'
  | 'USER_CANCELLED'
  | 'BROWSER_INTERRUPTED'
  | 'BROWSER_TAB_CLOSED'
  | 'RATE_LIMITED'
  | 'CHALLENGED'
  | 'CHALLENGE_DETECTED'
  | 'STALE_JOB_TIMEOUT'
  | 'FAILED'
  | 'FATAL_ERROR';

export type RelevanceDecision = 'RELEVANT' | 'UNCERTAIN' | 'NOT_RELEVANT';
export type RelevanceConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type EvidenceStrength = 'STRONG' | 'MODERATE' | 'WEAK';

export type EvidenceType =
  | 'ENTITY_IDENTITY'
  | 'CATEGORY_MATCH'
  | 'COMMERCIAL_INTENT'
  | 'NEGATIVE_CATEGORY'
  | 'CONTRADICTION';

export type EvidenceSource =
  | 'advertiser_name'
  | 'ad_text'
  | 'destination_url'
  | 'destination_domain'
  | 'facebook_page'
  | 'cta_text'
  | 'entity_aggregation';

export interface StructuredEvidence {
  type: EvidenceType;
  strength: EvidenceStrength;
  source: EvidenceSource;
  reason: string;
  matchedSignal?: string;
  reasonCode?: string;
}

export interface RunCounters {
  rawAds: number;
  normalizedCandidates: number;
  relevantCandidates: number;
  uncertainCandidates: number;
  notRelevantCandidates: number;
  duplicatesRemoved: number;
  finalUniqueLeads: number;
  reasonCodes?: Record<string, number>;
}

export interface ScrapedAdCandidate {
  libraryId: string;
  pageName: string;
  facebookPageUrl?: string;
  facebookPageId?: string;
  destinationUrl?: string;
  destinationDomain?: string;
  isActive: boolean;
  startedRunning?: string;
  hasMultipleVersions?: boolean;
  bodyCopy?: string;
  ctaText?: string;
  observedKeyword?: string;
  rawText?: string;
}

export interface ExtensionLead {
  id: string;
  name: string;
  canonicalName: string;
  facebookPageName: string;
  facebookPageUrl?: string;
  facebookPageState: 'found' | 'not_found' | 'unknown';
  destinationUrl?: string;
  destinationDomain?: string;
  websiteState: 'found' | 'not_found' | 'unknown';
  activeAdCount: number;
  adLibraryIds: string[];
  adLibraryUrl?: string;
  matchedKeywords: string[];
  locationCode: string;
  locationName: string;
  status: 'QUALIFIED' | 'REVIEW_REQUIRED' | 'NEEDS_DATA';
  discoveredAt: string;
  sampleCopy?: string;
  sampleCta?: string;
  // Relevance evaluation fields
  relevanceScore?: number;
  relevanceDecision?: RelevanceDecision;
  relevanceConfidence?: RelevanceConfidence;
  relevanceReasons?: string[];
  relevanceMatchedTerms?: string[];
  relevanceEvidence?: StructuredEvidence[];
  relevanceStrategyVersion?: number;
  engineVersion?: string;
  presetVersion?: string;
}

export interface ExtensionResearchRun {
  runId: string;
  researchName: string;
  mode: ResearchMode;
  presetId?: string;
  presetName?: string;
  keywords: string[];
  countryCode: string;
  locationName: string;
  maxResults: number;
  status: JobStatus;
  stopReason?: string;
  challengeReason?: string;
  leads: ExtensionLead[];
  rejectedLeadsCount?: number;
  uncertainLeadsCount?: number;
  relevanceStrategyVersion?: number;
  engineVersion?: string;
  counters?: RunCounters;
  logs: Array<{
    timestamp: string;
    message: string;
    stage: string;
  }>;
  startedAt: string;
  completedAt?: string;
  lastUpdatedAt: string;
  schemaVersion: number;
  totalAdsInspected: number;
  allCandidates?: ScrapedAdCandidate[];
  targetLeadCount: number;
  activeKeywordIndex?: number;
}

export interface StartResearchPayload {
  mode: ResearchMode;
  presetId?: string;
  presetName?: string;
  keywords: string[];
  countryCode: string;
  locationName: string;
  maxResults: number;
  researchName?: string;
}

export interface ExtensionMessage {
  type:
    | 'START_RESEARCH'
    | 'STOP_RESEARCH'
    | 'CANCEL_RESEARCH'
    | 'GET_STATE'
    | 'GET_HISTORY'
    | 'CLEAR_HISTORY'
    | 'RESEARCH_PROGRESS'
    | 'RESEARCH_COMPLETED'
    | 'SCAN_AND_EXTRACT'
    | 'CANDIDATES_COLLECTED'
    | 'CHALLENGE_DETECTED'
    | 'CONTENT_SCRIPT_READY';
  payload?: any;
}
