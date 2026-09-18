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
  | 'FAILED';

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
  logs: Array<{
    timestamp: string;
    message: string;
    stage: string;
  }>;
  startedAt: string;
  completedAt?: string;
  totalAdsInspected: number;
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
