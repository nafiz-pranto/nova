import { AdvertiserViewModel, AdViewModel, ResearchJobModel, ReviewItemModel } from '../types';

// ============================================================================
// 1. PHASE 11 -> PHASE 12 TRACEABILITY MATRIX
// ============================================================================

export interface Phase11TraceabilityEntry {
  contractId: string;
  sourceContract: string;
  newUxCapability: string;
  requiredApiReadModel: string;
  uiComponent: string;
  testSuite: string;
}

export const PHASE_11_TRACEABILITY: Phase11TraceabilityEntry[] = [
  {
    contractId: 'TRC-1201',
    sourceContract: 'canonical_advertiser + ad_observation (P07/P10)',
    newUxCapability: 'Global Search with multi-index fuzzy matching and entity grouping',
    requiredApiReadModel: 'GET /api/v2/search?q={query}&types=advertiser,ad,domain,business',
    uiComponent: 'GlobalSearchModal, CommandPaletteModal',
    testSuite: 'test/p12_global_search.test.ts',
  },
  {
    contractId: 'TRC-1202',
    sourceContract: 'job_execution + audit_log (P07/P09)',
    newUxCapability: 'Keyboard-first Command Palette for permission-governed navigation',
    requiredApiReadModel: 'GET /api/v2/user/commands, POST /api/v2/jobs',
    uiComponent: 'CommandPaletteModal',
    testSuite: 'test/p12_command_palette.test.ts',
  },
  {
    contractId: 'TRC-1203',
    sourceContract: 'verification_claim + raw_dom_token (P04/P05)',
    newUxCapability: 'Factual Evidence Inspector with 9 strict confidence/provenance states',
    requiredApiReadModel: 'GET /api/v2/entities/:id/evidence/:claimId',
    uiComponent: 'EvidenceInspectorModal, EvidenceStateBadge',
    testSuite: 'test/p12_evidence_inspector.test.ts',
  },
  {
    contractId: 'TRC-1204',
    sourceContract: 'v_lead_research_current + observation_delta (P07)',
    newUxCapability: 'What Changed? Delta analysis with Before/After and array diff',
    requiredApiReadModel: 'GET /api/v2/entities/:id/deltas?window=30d',
    uiComponent: 'ChangeAnalysisView, EntityDiffViewer',
    testSuite: 'test/p12_change_diff.test.ts',
  },
  {
    contractId: 'TRC-1205',
    sourceContract: 'research_session + investigation_ledger (P07/P08)',
    newUxCapability: 'Investigation Mode #2048 with checklist, internal notes, target focus',
    requiredApiReadModel: 'GET/POST /api/v2/investigations/:id',
    uiComponent: 'InvestigationWorkspace, InvestigationChecklist',
    testSuite: 'test/p12_investigation_mode.test.ts',
  },
  {
    contractId: 'TRC-1206',
    sourceContract: 'registered_business_entity + state_sos_filing (P04)',
    newUxCapability: 'Business Entity vs Advertiser vs Destination 3-way architectural separation',
    requiredApiReadModel: 'GET /api/v2/businesses, GET /api/v2/businesses/:id/relationships',
    uiComponent: 'BusinessEntityWorkspace, EntityTriadInspector',
    testSuite: 'test/p12_business_entity_separation.test.ts',
  },
  {
    contractId: 'TRC-1207',
    sourceContract: 'watchlist_membership + event_alert (P08)',
    newUxCapability: 'Watchlist Management with automated delta alerts (New Ad, Domain Change)',
    requiredApiReadModel: 'GET/POST /api/v2/watchlists, GET /api/v2/watchlists/:id/activity',
    uiComponent: 'WatchlistWorkspace, WatchlistAlertCard',
    testSuite: 'test/p12_watchlist_activity.test.ts',
  },
  {
    contractId: 'TRC-1208',
    sourceContract: 'qualification_score_breakdown (P06)',
    newUxCapability: '"Why?" & "Why not qualified?" explainers with missing signals and blockers',
    requiredApiReadModel: 'GET /api/v2/entities/:id/qualification/explainability',
    uiComponent: 'QualificationExplainabilityView, WhyNotQualifiedPanel',
    testSuite: 'test/p12_qualification_explainability.test.ts',
  },
  {
    contractId: 'TRC-1209',
    sourceContract: 'system_anomaly_stream + circuit_breaker (P09/P10)',
    newUxCapability: 'Operational Anomaly Inbox with rule-based remediation pathways',
    requiredApiReadModel: 'GET /api/v2/anomalies?status=unresolved',
    uiComponent: 'AnomalyInboxWorkspace, AnomalyTriageCard',
    testSuite: 'test/p12_anomaly_inbox.test.ts',
  },
  {
    contractId: 'TRC-1210',
    sourceContract: 'ad_creative_asset + creative_feature_vector (P03/P08)',
    newUxCapability: 'Side-by-side Ad-to-Ad comparator with verbatim copy diffing',
    requiredApiReadModel: 'GET /api/v2/ads/compare?id1={ad1}&id2={ad2}',
    uiComponent: 'AdToAdComparator, CreativeDiffInspector',
    testSuite: 'test/p12_ad_comparator.test.ts',
  },
];

// ============================================================================
// 2. EVIDENCE STATES & EVIDENCE MODELS (Section 16, 17)
// ============================================================================

export type EvidenceClassification =
  | 'OBSERVED'
  | 'NORMALIZED'
  | 'DERIVED'
  | 'INFERRED'
  | 'VERIFIED'
  | 'UNKNOWN'
  | 'UNAVAILABLE'
  | 'FAILED'
  | 'CONFLICTING';

export interface EvidenceItemModel {
  evidenceId: string;
  claimOrField: string;
  observedValue: string;
  source: string;
  sourceUrl?: string;
  observedAt: string;
  classification: EvidenceClassification;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  normalizedValue?: string;
  version: string;
  relatedEntity: string;
  rawPayloadHash: string;
  historyLog: Array<{ value: string; timestamp: string; source: string }>;
  whyExplanation: string;
  ruleCitation?: string;
}

export const SAMPLE_EVIDENCE_ITEMS: EvidenceItemModel[] = [
  {
    evidenceId: 'ev_tx_091_name',
    claimOrField: 'Advertiser Legal Entity Name',
    observedValue: 'SolarFlow Energy Solutions LLC',
    source: 'Meta Ad Library Page Disclaimer Header',
    sourceUrl: 'https://www.facebook.com/ads/library/?id=284910294810294',
    observedAt: '2026-09-15T18:22:10Z',
    classification: 'OBSERVED',
    confidence: 'HIGH',
    normalizedValue: 'SOLARFLOW ENERGY SOLUTIONS LLC',
    version: 'extractor-v10.2.1',
    relatedEntity: 'adv_tx_solar_01',
    rawPayloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    historyLog: [
      { value: 'SolarFlow Energy Solutions LLC', timestamp: '2026-09-15T18:22:10Z', source: 'Meta Ad Library DOM selector' },
      { value: 'SolarFlow Texas Corp', timestamp: '2026-07-12T10:14:02Z', source: 'Historical run #812' },
    ],
    whyExplanation: 'Directly extracted from raw DOM token at XPath //div[@role="region"]//span[contains(@class,"x1lliihq")]. Exact match against Secretary of State legal corporate entity filings.',
    ruleCitation: 'IDENT-RULE-001 (Verbatim Disclaimer Extraction)',
  },
  {
    evidenceId: 'ev_tx_092_phone',
    claimOrField: 'Direct Sales Contact Telephone',
    observedValue: '+1 (512) 555-0199',
    source: 'Landing Page Footer microdata / tel: link',
    sourceUrl: 'https://solarflow-texas.com/quote-calculator',
    observedAt: '2026-09-15T19:04:12Z',
    classification: 'VERIFIED',
    confidence: 'HIGH',
    normalizedValue: '+15125550199 (E.164 NANP)',
    version: 'verifier-v4.1.0',
    relatedEntity: 'adv_tx_solar_01',
    rawPayloadHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    historyLog: [
      { value: '+1 (512) 555-0199', timestamp: '2026-09-15T19:04:12Z', source: 'HTTP probe 200 via headless crawler' },
    ],
    whyExplanation: 'Telephone parsed in landing page microdata schema.org/LocalBusiness, confirmed matching Meta Ad Library page contact listing.',
    ruleCitation: 'VERIF-RULE-004 (Contact Multi-Source Agreement)',
  },
  {
    evidenceId: 'ev_tx_093_tls',
    claimOrField: 'Destination SSL/TLS Protocol Version',
    observedValue: 'TLS 1.3 / ECDHE-RSA-AES256-GCM-SHA384',
    source: 'Network Socket Handshake Probe',
    sourceUrl: 'https://solarflow-texas.com',
    observedAt: '2026-09-15T19:04:14Z',
    classification: 'VERIFIED',
    confidence: 'HIGH',
    normalizedValue: 'TLSv1.3 (Valid Cert: Let\'s Encrypt E6, Expiry: 2026-12-01)',
    version: 'netprobe-v2.8.0',
    relatedEntity: 'adv_tx_solar_01',
    rawPayloadHash: '9b73c93d96132486fc73b9347d61f1e5d73f488698b943aec4d0f11446c0576b',
    historyLog: [
      { value: 'TLS 1.3', timestamp: '2026-09-15T19:04:14Z', source: 'Direct TCP socket probe' },
    ],
    whyExplanation: 'Destination responds with compliant TLS 1.3 certificate chaining to trusted CA root. SSRF validation checked against RFC 1918 private ranges.',
    ruleCitation: 'SEC-RULE-009 (SSRF & Transport Security Invariant)',
  },
  {
    evidenceId: 'ev_apex_041_state',
    claimOrField: 'Florida SOS Licensing Verification',
    observedValue: 'CCC1331892 (Active Commercial Roofing Contractor)',
    source: 'Florida DBPR / Sunbiz Registry Probe',
    sourceUrl: 'https://www.myfloridalicense.com/wl11.asp?lic=CCC1331892',
    observedAt: '2026-09-15T14:10:00Z',
    classification: 'VERIFIED',
    confidence: 'HIGH',
    normalizedValue: 'FL_CCC_1331892_ACTIVE',
    version: 'sos-connector-v1.4.0',
    relatedEntity: 'adv_fl_roof_02',
    rawPayloadHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    historyLog: [
      { value: 'CCC1331892 Active', timestamp: '2026-09-15T14:10:00Z', source: 'State DBPR public query' },
    ],
    whyExplanation: 'Contractor license confirmed active in Florida state regulatory records under canonical name Apex Roofing & Waterproofing LLC.',
    ruleCitation: 'QUAL-RULE-002 (State Contractor License Proof)',
  },
  {
    evidenceId: 'ev_crypto_099_blocker',
    claimOrField: 'Destination Reachability & Protocol Status',
    observedValue: 'HTTP 502 Bad Gateway / Cloudflare Error 521',
    source: 'HTTP Socket Probe',
    sourceUrl: 'https://quantum-yields.crypto-app.xyz',
    observedAt: '2026-09-15T21:00:00Z',
    classification: 'FAILED',
    confidence: 'HIGH',
    normalizedValue: 'HTTP_STATUS_502_UNREACHABLE',
    version: 'netprobe-v2.8.0',
    relatedEntity: 'adv_crypto_bot_03',
    rawPayloadHash: 'beefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
    historyLog: [
      { value: 'HTTP 200 OK', timestamp: '2026-09-14T10:00:00Z', source: 'Probe #102' },
      { value: 'HTTP 502 Bad Gateway', timestamp: '2026-09-15T21:00:00Z', source: 'Probe #109' },
    ],
    whyExplanation: 'Host origin server rejected incoming connection. Destination landing page is down or actively quarantined.',
    ruleCitation: 'BLOCKER-RULE-001 (Destination Down / Non-Negotiable Disqualification)',
  },
];

// ============================================================================
// 3. FACTUAL DELTA & WHAT CHANGED? MODULE (Section 12, 13, 14)
// ============================================================================

export interface EntityDeltaRecord {
  deltaId: string;
  entityId: string;
  entityName: string;
  field: string;
  changeType: 'MODIFIED' | 'ADDED' | 'REMOVED' | 'STATUS_CHANGE';
  previousValue: string;
  currentValue: string;
  previousObservedAt: string;
  currentObservedAt: string;
  evidenceSource: string;
  provenanceHash: string;
}

export const SAMPLE_DELTAS: EntityDeltaRecord[] = [
  {
    deltaId: 'delta_01',
    entityId: 'adv_tx_solar_01',
    entityName: 'SolarFlow Energy Solutions LLC',
    field: 'Active Ads Volume',
    changeType: 'ADDED',
    previousValue: '14 Active Ads',
    currentValue: '15 Active Ads (+1: Texas Rebate Incentives Campaign)',
    previousObservedAt: '2026-09-14T12:00:00Z',
    currentObservedAt: '2026-09-15T18:22:10Z',
    evidenceSource: 'Meta Ad Library Crawler Run #892',
    provenanceHash: 'sha256:7a8b9c...e1f2',
  },
  {
    deltaId: 'delta_02',
    entityId: 'adv_tx_solar_01',
    entityName: 'SolarFlow Energy Solutions LLC',
    field: 'Observed CTA Text',
    changeType: 'MODIFIED',
    previousValue: 'Learn More',
    currentValue: 'Book Free Solar Audit',
    previousObservedAt: '2026-09-10T09:15:00Z',
    currentObservedAt: '2026-09-15T18:22:10Z',
    evidenceSource: 'Ad Observation #ad_meta_001_tx',
    provenanceHash: 'sha256:1a2b3c...4d5e',
  },
  {
    deltaId: 'delta_03',
    entityId: 'adv_tx_solar_01',
    entityName: 'SolarFlow Energy Solutions LLC',
    field: 'Landing Page Destination Host',
    changeType: 'MODIFIED',
    previousValue: 'solarflow.io',
    currentValue: 'solarflow-texas.com',
    previousObservedAt: '2026-08-30T10:00:00Z',
    currentObservedAt: '2026-09-15T18:22:10Z',
    evidenceSource: 'Ad Link URL Extractor',
    provenanceHash: 'sha256:3c4d5e...6f7a',
  },
  {
    deltaId: 'delta_04',
    entityId: 'adv_fl_roof_02',
    entityName: 'Apex Roofing & Waterproofing LLC',
    field: 'Qualification Score',
    changeType: 'STATUS_CHANGE',
    previousValue: '52.0 (Needs Review)',
    currentValue: '58.5 (+6.5 pts: Florida Sunbiz active license CCC1331892 verified)',
    previousObservedAt: '2026-09-14T08:00:00Z',
    currentObservedAt: '2026-09-15T14:10:00Z',
    evidenceSource: 'Qualification Engine Run #q_8819',
    provenanceHash: 'sha256:5e6f7a...8b9c',
  },
  {
    deltaId: 'delta_05',
    entityId: 'adv_crypto_bot_03',
    entityName: 'Quantum Crypto Yields Bot',
    field: 'Destination Health',
    changeType: 'STATUS_CHANGE',
    previousValue: 'HTTP 200 (Reachable)',
    currentValue: 'HTTP 502 Bad Gateway (Unreachable/Quarantined)',
    previousObservedAt: '2026-09-14T10:00:00Z',
    currentObservedAt: '2026-09-15T21:00:00Z',
    evidenceSource: 'SSRF & NetProbe Worker #03',
    provenanceHash: 'sha256:beef...0011',
  },
];

// ============================================================================
// 4. INVESTIGATION MODE & RESEARCH SESSIONS (Section 21, 22, 23, 24)
// ============================================================================

export interface InvestigationChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface InternalResearchNote {
  id: string;
  author: string;
  createdAt: string;
  content: string;
  linkedEntityId: string;
  linkedEvidenceId?: string;
  isInternalOnly: true; // Strict non-source flag
}

export interface InvestigationModel {
  investigationId: string;
  caseNumber: number;
  title: string;
  targetEntityId: string;
  targetEntityName: string;
  targetDomain: string;
  status: 'ACTIVE' | 'CONCLUDED' | 'PAUSED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  updatedAt: string;
  leadInvestigator: string;
  summaryCounts: {
    identityEvidence: number;
    ads: number;
    destinations: number;
    verificationClaims: number;
    conflicts: number;
    reviews: number;
    notes: number;
  };
  checklist: InvestigationChecklistItem[];
  notes: InternalResearchNote[];
}

export const SAMPLE_INVESTIGATION: InvestigationModel = {
  investigationId: 'inv_case_2048',
  caseNumber: 2048,
  title: 'Comprehensive Verification: SolarFlow Energy Solutions LLC',
  targetEntityId: 'adv_tx_solar_01',
  targetEntityName: 'SolarFlow Energy Solutions LLC',
  targetDomain: 'solarflow-texas.com',
  status: 'ACTIVE',
  priority: 'HIGH',
  createdAt: '2026-09-15T09:30:00Z',
  updatedAt: '2026-09-15T20:15:00Z',
  leadInvestigator: 'Daniela Rodriguez (Senior Lead Analyst)',
  summaryCounts: {
    identityEvidence: 8,
    ads: 15,
    destinations: 2,
    verificationClaims: 6,
    conflicts: 0,
    reviews: 1,
    notes: 3,
  },
  checklist: [
    {
      id: 'chk_1',
      label: 'Identity reviewed against Texas Secretary of State public registry',
      completed: true,
      completedAt: '2026-09-15T11:04:00Z',
      completedBy: 'daniela_rodriguez',
      notes: 'SOS Filing #080344912 confirms Active status, Registered Agent in Austin, TX.',
    },
    {
      id: 'chk_2',
      label: 'Observed public ads verified for active residential solar campaigns',
      completed: true,
      completedAt: '2026-09-15T12:30:00Z',
      completedBy: 'daniela_rodriguez',
      notes: '15 creative variations inspected; all drive to quote calculator funnel.',
    },
    {
      id: 'chk_3',
      label: 'Destination landing domain inspected for TLS 1.3 & DNS consistency',
      completed: true,
      completedAt: '2026-09-15T14:15:00Z',
      completedBy: 'daniela_rodriguez',
      notes: 'TLS 1.3 valid, Cloudflare CDN with origin IP binding verified safe from RFC1918.',
    },
    {
      id: 'chk_4',
      label: 'Verification probe claims inspected for footer disclaimer agreement',
      completed: true,
      completedAt: '2026-09-15T16:00:00Z',
      completedBy: 'daniela_rodriguez',
      notes: 'Footer copyright matches exact Ad Library page disclaimer string.',
    },
    {
      id: 'chk_5',
      label: 'Qualification score explanation rules & weights inspected',
      completed: false,
      notes: 'Pending review of phone number E.164 verification contribution (+15 pts).',
    },
    {
      id: 'chk_6',
      label: 'Identity ambiguities and cross-brand conflicts resolved/deferred',
      completed: false,
      notes: 'Need to verify if SolarFlow Austin is a branch or separate legal entity.',
    },
  ],
  notes: [
    {
      id: 'note_01',
      author: 'daniela_rodriguez',
      createdAt: '2026-09-15T10:15:00Z',
      content: 'INTERNAL NOTE: Verified Texas Secretary of State filing #080344912. Filing date is March 2021. Primary address matches destination contact page.',
      linkedEntityId: 'adv_tx_solar_01',
      linkedEvidenceId: 'ev_tx_091_name',
      isInternalOnly: true,
    },
    {
      id: 'note_02',
      author: 'daniela_rodriguez',
      createdAt: '2026-09-15T13:40:00Z',
      content: 'INTERNAL NOTE: Compared recent creative #ad_meta_001_tx with previous month. CTA shifted from generic "Learn More" to high-intent "Book Free Solar Audit".',
      linkedEntityId: 'adv_tx_solar_01',
      isInternalOnly: true,
    },
    {
      id: 'note_03',
      author: 'marcus_ops',
      createdAt: '2026-09-15T18:00:00Z',
      content: 'INTERNAL NOTE: Re-ran network probe via egress-worker-02. SSL certificate renewed September 1st, valid for 90 days. Zero DNS rebinding threats detected.',
      linkedEntityId: 'adv_tx_solar_01',
      linkedEvidenceId: 'ev_tx_093_tls',
      isInternalOnly: true,
    },
  ],
};

export interface ResearchSessionModel {
  sessionId: string;
  title: string;
  description: string;
  searchCriteria: Record<string, any>;
  selectedEntityIds: string[];
  selectedAdIds: string[];
  savedEvidenceIds: string[];
  createdAt: string;
  updatedAt: string;
  notesCount: number;
}

export const SAMPLE_RESEARCH_SESSIONS: ResearchSessionModel[] = [
  {
    sessionId: 'session_q3_solar_tx',
    title: 'Q3 Texas Residential Solar Commercial Intelligence',
    description: 'Investigation across Austin and Dallas-Fort Worth high-velocity Meta solar lead generators.',
    searchCriteria: { state: 'TX', category: 'Solar', minAds: 5, verification: 'VERIFIED' },
    selectedEntityIds: ['adv_tx_solar_01'],
    selectedAdIds: ['ad_meta_001_tx', 'ad_meta_002_tx'],
    savedEvidenceIds: ['ev_tx_091_name', 'ev_tx_092_phone', 'ev_tx_093_tls'],
    createdAt: '2026-09-14T08:00:00Z',
    updatedAt: '2026-09-15T20:15:00Z',
    notesCount: 3,
  },
  {
    sessionId: 'session_fl_roofing_audit',
    title: 'Florida Roofing Contractor Compliance Triage',
    description: 'Reviewing licensed contractors vs lead generation broker pages in South Florida.',
    searchCriteria: { state: 'FL', category: 'Roofing', scoreMin: 50 },
    selectedEntityIds: ['adv_fl_roof_02'],
    selectedAdIds: ['ad_meta_003_roof'],
    savedEvidenceIds: ['ev_apex_041_state'],
    createdAt: '2026-09-12T14:30:00Z',
    updatedAt: '2026-09-15T15:00:00Z',
    notesCount: 2,
  },
];

// ============================================================================
// 5. BUSINESS ENTITY VS ADVERTISER VS DESTINATION (Section 32)
// ============================================================================

export interface BusinessEntityModel {
  businessId: string;
  legalName: string;
  tradeNameDba: string;
  registrationNumber: string; // SOS / EIN
  stateOfIncorporation: string;
  filingStatus: 'ACTIVE' | 'INACTIVE' | 'DISSOLVED' | 'PENDING';
  registeredAgent: string;
  principalAddress: string;
  primaryDomain: string;
  matchedAdvertiserIds: string[];
  evidencePointers: string[];
  lastAuditedAt: string;
}

export const SAMPLE_BUSINESS_ENTITIES: BusinessEntityModel[] = [
  {
    businessId: 'biz_sos_tx_080344912',
    legalName: 'SOLARFLOW ENERGY SOLUTIONS LLC',
    tradeNameDba: 'SolarFlow Texas',
    registrationNumber: 'TX-SOS-080344912',
    stateOfIncorporation: 'Texas',
    filingStatus: 'ACTIVE',
    registeredAgent: 'Capitol Corporate Services, Inc.',
    principalAddress: '1400 Congress Ave, Ste 400, Austin, TX 78701',
    primaryDomain: 'solarflow-texas.com',
    matchedAdvertiserIds: ['adv_tx_solar_01'],
    evidencePointers: ['ev_tx_091_name', 'ev_tx_092_phone'],
    lastAuditedAt: '2026-09-15T18:00:00Z',
  },
  {
    businessId: 'biz_sos_fl_l190002812',
    legalName: 'APEX ROOFING & WATERPROOFING INC',
    tradeNameDba: 'Apex Roofing Florida',
    registrationNumber: 'FL-DOS-L190002812',
    stateOfIncorporation: 'Florida',
    filingStatus: 'ACTIVE',
    registeredAgent: 'Florida Registered Agent LLC',
    principalAddress: '2400 E Commercial Blvd, Fort Lauderdale, FL 33308',
    primaryDomain: 'apexroofing-florida.com',
    matchedAdvertiserIds: ['adv_fl_roof_02'],
    evidencePointers: ['ev_apex_041_state'],
    lastAuditedAt: '2026-09-15T14:10:00Z',
  },
  {
    businessId: 'biz_unknown_crypto_phantom',
    legalName: 'UNKNOWN / UNREGISTERED FOREIGN ENTITY',
    tradeNameDba: 'Quantum Crypto Yields',
    registrationNumber: 'UNVERIFIED',
    stateOfIncorporation: 'Seychelles / Off-shore',
    filingStatus: 'PENDING',
    registeredAgent: 'None Disclosed',
    principalAddress: 'Digital / P.O. Box 412, Victoria, Mahe',
    primaryDomain: 'quantum-yields.crypto-app.xyz',
    matchedAdvertiserIds: ['adv_crypto_bot_03'],
    evidencePointers: ['ev_crypto_099_blocker'],
    lastAuditedAt: '2026-09-15T21:00:00Z',
  },
];

// ============================================================================
// 6. OPERATIONAL & RESEARCH ANOMALY INBOX (Section 37)
// ============================================================================

export interface AnomalyItemModel {
  id: string;
  source: string;
  detectedAt: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  entityId: string;
  entityName: string;
  anomalyType:
    | 'FIELD_DISAPPEARANCE'
    | 'IDENTITY_CONFLICT'
    | 'DESTINATION_CHANGE'
    | 'STALE_VERIFICATION'
    | 'SCORE_JUMP'
    | 'EXTRACTION_ANOMALY'
    | 'SCHEMA_DRIFT';
  evidenceSummary: string;
  recommendedAction: string; // Strictly rule-based!
  status: 'UNRESOLVED' | 'ACKNOWLEDGED' | 'DISMISSED';
}

export const SAMPLE_ANOMALIES: AnomalyItemModel[] = [
  {
    id: 'anom_01',
    source: 'SSRF & NetProbe Worker #03',
    detectedAt: '2026-09-15T21:00:00Z',
    severity: 'CRITICAL',
    title: 'Destination Outage / HTTP 502 Bad Gateway',
    entityId: 'adv_crypto_bot_03',
    entityName: 'Quantum Crypto Yields Bot',
    anomalyType: 'DESTINATION_CHANGE',
    evidenceSummary: 'Previous probe returned HTTP 200; current probe failed with HTTP 502 Cloudflare origin timeout.',
    recommendedAction: 'Apply non-negotiable blocker BLOCKER-RULE-001; downgrade qualification state to DISQUALIFIED; notify active watchers.',
    status: 'UNRESOLVED',
  },
  {
    id: 'anom_02',
    source: 'Normalization Engine v4.2',
    detectedAt: '2026-09-15T17:45:00Z',
    severity: 'HIGH',
    title: 'Telephone Microdata Disappeared from Landing Page',
    entityId: 'adv_fl_roof_02',
    entityName: 'Apex Roofing & Waterproofing LLC',
    anomalyType: 'FIELD_DISAPPEARANCE',
    evidenceSummary: 'Previously observed phone number "+1 (954) 555-0188" missing in recent extraction DOM snapshot.',
    recommendedAction: 'Trigger targeted verification probe on contact-us page; check if phone moved to click-to-call modal.',
    status: 'UNRESOLVED',
  },
  {
    id: 'anom_03',
    source: 'Identity Resolution Engine v3.1',
    detectedAt: '2026-09-15T15:10:00Z',
    severity: 'MEDIUM',
    title: 'Cross-Domain Canonical Name Conflict',
    entityId: 'adv_tx_solar_01',
    entityName: 'SolarFlow Energy Solutions LLC',
    anomalyType: 'IDENTITY_CONFLICT',
    evidenceSummary: 'Observed two distinct domains (solarflow.io and solarflow-texas.com) claiming identical corporate name.',
    recommendedAction: 'Route to Human Review Queue [IDENTITY_AMBIGUITY]; verify if domains represent regional redirect or distinct entities.',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'anom_04',
    source: 'Data Quality Sentinel v2.0',
    detectedAt: '2026-09-15T11:20:00Z',
    severity: 'LOW',
    title: 'Verification Stale (>30 Days Elapsed)',
    entityId: 'adv_dental_care_04',
    entityName: 'Metro Family Dental Care',
    anomalyType: 'STALE_VERIFICATION',
    evidenceSummary: 'Last verified DNS and TLS probe timestamp is 34 days old, exceeding SLA threshold of 30 days.',
    recommendedAction: 'Dispatch automated background reverification probe via Egress Worker pool.',
    status: 'UNRESOLVED',
  },
];

// ============================================================================
// 7. GLOBAL ACTIVITY FEED (Section 43)
// ============================================================================

export interface ActivityEventModel {
  id: string;
  timestamp: string;
  eventType:
    | 'JOB_COMPLETED'
    | 'VERIFICATION_REFRESHED'
    | 'NEW_AD_OBSERVED'
    | 'QUALIFICATION_UPDATED'
    | 'MANUAL_OVERRIDE'
    | 'WATCHLIST_ALERT'
    | 'REVIEW_RESOLVED';
  targetName: string;
  targetId: string;
  actor: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  description: string;
  provenanceHash: string;
}

export const SAMPLE_ACTIVITY_EVENTS: ActivityEventModel[] = [
  {
    id: 'act_01',
    timestamp: '2026-09-15T21:00:00Z',
    eventType: 'VERIFICATION_REFRESHED',
    targetName: 'Quantum Crypto Yields Bot',
    targetId: 'adv_crypto_bot_03',
    actor: 'system:netprobe-worker-03',
    status: 'ERROR',
    description: 'Probe failed: Destination server returned HTTP 502 Bad Gateway.',
    provenanceHash: 'sha256:beef00112233',
  },
  {
    id: 'act_02',
    timestamp: '2026-09-15T19:04:14Z',
    eventType: 'VERIFICATION_REFRESHED',
    targetName: 'SolarFlow Energy Solutions LLC',
    targetId: 'adv_tx_solar_01',
    actor: 'system:egress-worker-02',
    status: 'SUCCESS',
    description: 'SSL/TLS 1.3 handshake verified; valid Let\'s Encrypt certificate chain inspected.',
    provenanceHash: 'sha256:9b73c93d9613',
  },
  {
    id: 'act_03',
    timestamp: '2026-09-15T18:22:10Z',
    eventType: 'NEW_AD_OBSERVED',
    targetName: 'SolarFlow Energy Solutions LLC',
    targetId: 'adv_tx_solar_01',
    actor: 'crawler:job_tx_solar_892',
    status: 'INFO',
    description: 'Observed 1 new ad creative: "Texas Solar Incentives Expiring" (ad_meta_001_tx).',
    provenanceHash: 'sha256:7a8b9ce1f234',
  },
  {
    id: 'act_04',
    timestamp: '2026-09-15T14:10:00Z',
    eventType: 'QUALIFICATION_UPDATED',
    targetName: 'Apex Roofing & Waterproofing LLC',
    targetId: 'adv_fl_roof_02',
    actor: 'engine:qualification-v2.1',
    status: 'SUCCESS',
    description: 'Score re-evaluated from 52.0 to 58.5 (+6.5 pts for Florida SOS license verification).',
    provenanceHash: 'sha256:5e6f7a8b9c01',
  },
  {
    id: 'act_05',
    timestamp: '2026-09-15T11:45:00Z',
    eventType: 'REVIEW_RESOLVED',
    targetName: 'Metro Family Dental Care',
    targetId: 'adv_dental_care_04',
    actor: 'daniela_rodriguez (Operator)',
    status: 'SUCCESS',
    description: 'Identity disambiguation confirmed distinct from Metro Dental Lab LLC.',
    provenanceHash: 'sha256:4a5b6c7d8e9f',
  },
];

// ============================================================================
// 8. WATCHLISTS WITH AUTOMATED DELTA ALERTS (Section 25, 26)
// ============================================================================

export interface WatchlistAlertModel {
  id: string;
  entityId: string;
  entityName: string;
  alertType: 'NEW_AD' | 'DESTINATION_CHANGE' | 'VERIFICATION_CHANGE' | 'IDENTITY_CHANGE' | 'QUALIFICATION_CHANGE';
  timestamp: string;
  summary: string;
}

export interface WatchlistRecord {
  id: string;
  name: string;
  description: string;
  entityIds: string[];
  createdAt: string;
  alertCount: number;
  alerts: WatchlistAlertModel[];
}

export const SAMPLE_WATCHLISTS_P12: WatchlistRecord[] = [
  {
    id: 'wl_high_value_solar',
    name: 'Texas High-Velocity Solar Advertisers',
    description: 'Monitored cohort of verified commercial and residential solar installers in ERCOT territory.',
    entityIds: ['adv_tx_solar_01'],
    createdAt: '2026-09-01T10:00:00Z',
    alertCount: 2,
    alerts: [
      {
        id: 'al_01',
        entityId: 'adv_tx_solar_01',
        entityName: 'SolarFlow Energy Solutions LLC',
        alertType: 'NEW_AD',
        timestamp: '2026-09-15T18:22:10Z',
        summary: '+1 New Ad observed in Meta Ad Library targeting Austin/Dallas region.',
      },
      {
        id: 'al_02',
        entityId: 'adv_tx_solar_01',
        entityName: 'SolarFlow Energy Solutions LLC',
        alertType: 'DESTINATION_CHANGE',
        timestamp: '2026-09-15T18:22:10Z',
        summary: 'Landing funnel shifted primary destination host to solarflow-texas.com.',
      },
    ],
  },
  {
    id: 'wl_contractors_needs_audit',
    name: 'Roofing & Waterproofing Triage',
    description: 'Contractors undergoing manual state licensing audit or border qualification review.',
    entityIds: ['adv_fl_roof_02'],
    createdAt: '2026-09-05T12:00:00Z',
    alertCount: 1,
    alerts: [
      {
        id: 'al_03',
        entityId: 'adv_fl_roof_02',
        entityName: 'Apex Roofing & Waterproofing LLC',
        alertType: 'QUALIFICATION_CHANGE',
        timestamp: '2026-09-15T14:10:00Z',
        summary: 'Qualification score increased to 58.5 following Sunbiz contractor license verification.',
      },
    ],
  },
  {
    id: 'wl_compliance_quarantine',
    name: 'Compliance Blockers & Quarantined Pages',
    description: 'Entities flagged with severe network failures, deceptive disclaimers, or unreachable domains.',
    entityIds: ['adv_crypto_bot_03'],
    createdAt: '2026-09-10T15:00:00Z',
    alertCount: 1,
    alerts: [
      {
        id: 'al_04',
        entityId: 'adv_crypto_bot_03',
        entityName: 'Quantum Crypto Yields Bot',
        alertType: 'VERIFICATION_CHANGE',
        timestamp: '2026-09-15T21:00:00Z',
        summary: 'Critical failure: HTTP 502 Bad Gateway triggered automatic disqualification.',
      },
    ],
  },
];

// ============================================================================
// 9. SAVED VIEWS & QUERY BUILDER PRESETS (Section 27, 28, 29)
// ============================================================================

export interface SavedViewDefinition {
  id: string;
  name: string;
  description: string;
  filters: {
    minAds?: number;
    qualificationState?: string;
    verificationFreshness?: string;
    hasDomain?: boolean;
    searchKeyword?: string;
  };
  sortField: string;
  sortDirection: 'asc' | 'desc';
  visibleColumns: string[];
  createdAt: string;
}

export const SAMPLE_SAVED_VIEWS: SavedViewDefinition[] = [
  {
    id: 'view_recently_observed',
    name: 'Recently Observed Active Advertisers',
    description: 'Entities observed within last 48 hours with active ads running.',
    filters: { minAds: 1, hasDomain: true },
    sortField: 'lastObserved',
    sortDirection: 'desc',
    visibleColumns: ['canonicalName', 'activeAdCount', 'destinationDomain', 'verificationFreshness', 'qualificationState'],
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'view_needs_review',
    name: 'Pending Operator Review Backlog',
    description: 'Borderline leads with qualification state REVIEW_REQUIRED or pending identity triage.',
    filters: { qualificationState: 'REVIEW_REQUIRED' },
    sortField: 'qualificationScore',
    sortDirection: 'desc',
    visibleColumns: ['canonicalName', 'qualificationScore', 'identityReviewState', 'destinationDomain'],
    createdAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'view_verification_stale',
    name: 'Stale Verification (>30 Days)',
    description: 'Entities requiring immediate network probe re-check to maintain SLA compliance.',
    filters: { verificationFreshness: 'STALE' },
    sortField: 'lastObserved',
    sortDirection: 'asc',
    visibleColumns: ['canonicalName', 'verificationFreshness', 'destinationDomain'],
    createdAt: '2026-09-08T00:00:00Z',
  },
  {
    id: 'view_identity_conflicts',
    name: 'Identity & Disambiguation Conflicts',
    description: 'Entities with unresolved cluster merges or contradictory legal entity names.',
    filters: { qualificationState: 'REVIEW_REQUIRED' },
    sortField: 'canonicalName',
    sortDirection: 'asc',
    visibleColumns: ['canonicalName', 'identityReviewState', 'historicalNames'],
    createdAt: '2026-09-10T00:00:00Z',
  },
];
