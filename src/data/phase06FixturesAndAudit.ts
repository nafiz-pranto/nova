import {
  GoldenScoringDataset,
  Phase06AuditCriterion,
  ScoringInputSnapshot
} from '../types';

export const GOLDEN_SCORING_DATASETS: GoldenScoringDataset[] = [
  {
    id: 'GOLDEN-01',
    name: 'Prime Enterprise Cloud Software',
    description: 'High-volume advertiser with verified multi-platform campaigns, HTTPS destination, brand identity match, and public corporate inquiry channels.',
    inputSnapshot: {
      snapshotId: 'SNAP-ENT-001',
      entityId: 'ENT-CORP-49102',
      advertiserName: 'Apex Cloud Systems Corp',
      canonicalAdCount: 14,
      firstObservedAt: '2025-09-01T00:00:00Z',
      lastObservedAt: '2026-03-14T00:00:00Z',
      creativeSignaturesCount: 8,
      platforms: ['facebook', 'instagram', 'audience_network', 'messenger'],
      destinationUrl: 'https://apexcloudsystems.io/enterprise',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-12T10:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE', 'CONTENT_ACCESSIBLE', 'BRAND_NAME_VISIBLE', 'CORPORATE_EMAIL_MATCH'],
      identityConsistencyState: 'CONSISTENT',
      publicBusinessEmail: 'inquiries@apexcloudsystems.io',
      publicBusinessPhone: '+1-800-555-0199',
      publicAddress: '100 Tech Blvd, Suite 400, Austin, TX 78701',
      industryClass: 'Enterprise Software & Cloud Infrastructure',
      hasCriticalConflict: false,
      capturedAt: '2026-03-14T12:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'VERIFIED_FOR_WORKFLOW',
    expectedScoreMin: 85,
    expectedScoreMax: 100,
    expectedConfidence: 'HIGH',
    expectedBlockers: [],
    semanticInvariants: [
      'Category caps respected',
      'High confidence due to multiple corroborated evidence channels',
      'No personal data rewarded'
    ]
  },
  {
    id: 'GOLDEN-02',
    name: 'Active Regional HVAC Services',
    description: 'Established local commercial HVAC contractor with 4 canonical ads, verified website, commercial phone and physical address.',
    inputSnapshot: {
      snapshotId: 'SNAP-LOC-002',
      entityId: 'ENT-HVAC-33012',
      advertiserName: 'Blue Ridge Heating & Air',
      canonicalAdCount: 4,
      firstObservedAt: '2025-11-15T00:00:00Z',
      lastObservedAt: '2026-03-10T00:00:00Z',
      creativeSignaturesCount: 3,
      platforms: ['facebook', 'instagram'],
      destinationUrl: 'https://blueridgehvac.com/schedule',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-11T14:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE', 'CONTENT_ACCESSIBLE', 'BRAND_NAME_VISIBLE'],
      identityConsistencyState: 'CONSISTENT',
      publicBusinessEmail: 'service@blueridgehvac.com',
      publicBusinessPhone: '+1-540-555-0144',
      publicAddress: '42 Industrial Park Rd, Roanoke, VA 24018',
      industryClass: 'Home Services & Commercial HVAC',
      hasCriticalConflict: false,
      capturedAt: '2026-03-12T10:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'QUALIFIED',
    expectedScoreMin: 70,
    expectedScoreMax: 90,
    expectedConfidence: 'HIGH',
    expectedBlockers: [],
    semanticInvariants: [
      'Qualifies with high confidence on established regional presence',
      'No punitive penalties for modest ad volume'
    ]
  },
  {
    id: 'GOLDEN-03',
    name: 'Walk-In Local Retailer (No Website)',
    description: 'Physical brick-and-mortar storefront running local Meta lead ads without an external website. Demonstrates fair missing-data handling.',
    inputSnapshot: {
      snapshotId: 'SNAP-NOWEB-003',
      entityId: 'ENT-RETAIL-1094',
      advertiserName: 'Highland Vintage Books',
      canonicalAdCount: 3,
      firstObservedAt: '2026-01-10T00:00:00Z',
      lastObservedAt: '2026-03-11T00:00:00Z',
      creativeSignaturesCount: 2,
      platforms: ['facebook', 'instagram'],
      destinationUrl: undefined,
      landingReachable: undefined,
      httpsAvailable: undefined,
      verificationCheckedAt: undefined,
      verificationStatus: undefined,
      verificationClaimsSupported: [],
      identityConsistencyState: 'INCONCLUSIVE',
      publicBusinessEmail: undefined,
      publicBusinessPhone: '+1-206-555-0182',
      publicAddress: '1422 1st Ave, Seattle, WA 98101',
      industryClass: 'Retail / Specialty Bookstore',
      hasCriticalConflict: false,
      capturedAt: '2026-03-12T10:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'INSUFFICIENT_EVIDENCE',
    expectedScoreMin: 20,
    expectedScoreMax: 35,
    expectedConfidence: 'LOW',
    expectedBlockers: [],
    semanticInvariants: [
      'Missing website is treated as ABSENT, not as negative proof of fraud',
      'Entity receives points for ad longevity and public phone'
    ]
  },
  {
    id: 'GOLDEN-04',
    name: 'Broken / Unreachable Destination (HTTP 404)',
    description: 'Advertiser specifies a landing page URL that returns HTTP 404 Not Found. Engine records 0 website points without fabricating business fraud accusations.',
    inputSnapshot: {
      snapshotId: 'SNAP-404-004',
      entityId: 'ENT-FAIL-8821',
      advertiserName: 'QuickFix Tools Direct',
      canonicalAdCount: 2,
      firstObservedAt: '2026-02-01T00:00:00Z',
      lastObservedAt: '2026-03-01T00:00:00Z',
      creativeSignaturesCount: 1,
      platforms: ['facebook'],
      destinationUrl: 'https://quickfixhardware.shop/spring-promo',
      landingReachable: false,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-10T08:00:00Z',
      verificationStatus: 'UNAVAILABLE',
      verificationClaimsSupported: [],
      identityConsistencyState: 'INCONCLUSIVE',
      publicBusinessEmail: undefined,
      publicBusinessPhone: undefined,
      hasCriticalConflict: false,
      capturedAt: '2026-03-11T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'INSUFFICIENT_EVIDENCE',
    expectedScoreMin: 15,
    expectedScoreMax: 30,
    expectedConfidence: 'LOW',
    expectedBlockers: [],
    semanticInvariants: [
      'HTTP 404 is mapped to UNAVAILABLE, not labeled fraudulent',
      'Score remains bounded within ad activity points'
    ]
  },
  {
    id: 'GOLDEN-05',
    name: 'Malicious Destination Protocol Hazard (SSRF Blocker)',
    description: 'Destination URL targets cloud metadata IP (169.254.169.254). Triggers critical Hard Blocker BLOCKER-01.',
    inputSnapshot: {
      snapshotId: 'SNAP-SSRF-005',
      entityId: 'ENT-MAL-0091',
      advertiserName: 'Suspect Cloud Proxy Services',
      canonicalAdCount: 1,
      firstObservedAt: '2026-03-01T00:00:00Z',
      lastObservedAt: '2026-03-05T00:00:00Z',
      creativeSignaturesCount: 1,
      platforms: ['facebook'],
      destinationUrl: 'http://169.254.169.254/latest/meta-data/',
      landingReachable: false,
      httpsAvailable: false,
      verificationCheckedAt: '2026-03-05T12:00:00Z',
      verificationStatus: 'BLOCKED_BY_RULE',
      verificationClaimsSupported: [],
      identityConsistencyState: 'INCONCLUSIVE',
      hasCriticalConflict: true,
      conflictSummary: 'SSRF target detected: private link-local cloud metadata address.',
      capturedAt: '2026-03-06T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'REJECTED_BY_RULE',
    expectedScoreMin: 0,
    expectedScoreMax: 10,
    expectedConfidence: 'UNCERTAIN',
    expectedBlockers: ['BLOCKER-01'],
    semanticInvariants: [
      'Hard blocker overrides all soft signals',
      'Entity marked REJECTED_BY_RULE immediately'
    ]
  },
  {
    id: 'GOLDEN-06',
    name: 'Critical Identity Contradiction',
    description: 'Advertiser promotes insurance services, but destination redirects to an unrelated crypto casino. Triggers BLOCKER-02 routing to REVIEW_REQUIRED.',
    inputSnapshot: {
      snapshotId: 'SNAP-CONF-006',
      entityId: 'ENT-CONF-6621',
      advertiserName: 'SafeHarbor Mutual Insurance',
      canonicalAdCount: 3,
      firstObservedAt: '2026-02-10T00:00:00Z',
      lastObservedAt: '2026-03-10T00:00:00Z',
      creativeSignaturesCount: 2,
      platforms: ['facebook', 'instagram'],
      destinationUrl: 'https://safeharborinsure.com/quote',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-11T09:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE'],
      identityConsistencyState: 'CONFLICTING',
      publicBusinessEmail: 'support@cryptospinwin.xyz',
      publicBusinessPhone: '+44-20-7946-0120',
      hasCriticalConflict: true,
      conflictSummary: 'Landing brand resolves to CryptoSpinWin Casino, entirely contradictory to Mutual Insurance.',
      capturedAt: '2026-03-12T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'REVIEW_REQUIRED',
    expectedScoreMin: 30,
    expectedScoreMax: 55,
    expectedConfidence: 'LOW',
    expectedBlockers: ['BLOCKER-02'],
    semanticInvariants: [
      'Identity conflict severely penalizes confidence',
      'Entity routed to human review queue without silent approval'
    ]
  },
  {
    id: 'GOLDEN-07',
    name: 'Stale Verification (>60 Days Expired)',
    description: 'Verification check was conducted 75 days ago. Triggers conditional staleness blocker requiring re-verification.',
    inputSnapshot: {
      snapshotId: 'SNAP-STALE-007',
      entityId: 'ENT-STALE-4190',
      advertiserName: 'Old Mill Furniture Co',
      canonicalAdCount: 5,
      firstObservedAt: '2025-08-01T00:00:00Z',
      lastObservedAt: '2026-03-01T00:00:00Z',
      creativeSignaturesCount: 3,
      platforms: ['facebook', 'instagram'],
      destinationUrl: 'https://oldmillfurniture.com/showroom',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2025-12-20T00:00:00Z', // 85 days old
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE', 'BRAND_NAME_VISIBLE'],
      identityConsistencyState: 'CONSISTENT',
      publicBusinessEmail: 'info@oldmillfurniture.com',
      hasCriticalConflict: false,
      capturedAt: '2026-03-14T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'REVIEW_REQUIRED',
    expectedScoreMin: 50,
    expectedScoreMax: 75,
    expectedConfidence: 'MEDIUM',
    expectedBlockers: ['BLOCKER-05'],
    semanticInvariants: [
      'Stale evidence dampens confidence multiplier by 50%',
      'Triggers re-verification queue'
    ]
  },
  {
    id: 'GOLDEN-08',
    name: 'Newly Launched Single-Ad Campaign',
    description: 'New advertiser with only 1 ad observed yesterday. Does not satisfy minimum evidence threshold for automated qualification.',
    inputSnapshot: {
      snapshotId: 'SNAP-NEW-008',
      entityId: 'ENT-NEW-1102',
      advertiserName: 'Lumina Digital Media',
      canonicalAdCount: 1,
      firstObservedAt: '2026-03-14T00:00:00Z',
      lastObservedAt: '2026-03-14T18:00:00Z',
      creativeSignaturesCount: 1,
      platforms: ['facebook'],
      destinationUrl: 'https://luminamedia.agency',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-14T20:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE'],
      identityConsistencyState: 'PARTIALLY_CONSISTENT',
      publicBusinessEmail: undefined,
      publicBusinessPhone: undefined,
      hasCriticalConflict: false,
      capturedAt: '2026-03-15T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'INSUFFICIENT_EVIDENCE',
    expectedScoreMin: 25,
    expectedScoreMax: 45,
    expectedConfidence: 'MEDIUM',
    expectedBlockers: [],
    semanticInvariants: [
      'Single-day presence receives low longevity contribution',
      'Placed in INSUFFICIENT_EVIDENCE pending campaign evolution'
    ]
  },
  {
    id: 'GOLDEN-09',
    name: 'Long-Running Multi-Channel Brand',
    description: 'Multi-channel brand with 18 canonical ads active over 200 days across Facebook, Instagram, Audience Network and Messenger.',
    inputSnapshot: {
      snapshotId: 'SNAP-BRAND-009',
      entityId: 'ENT-BRAND-99210',
      advertiserName: 'Nordic Clean Living ApS',
      canonicalAdCount: 18,
      firstObservedAt: '2025-08-01T00:00:00Z',
      lastObservedAt: '2026-03-14T00:00:00Z',
      creativeSignaturesCount: 10,
      platforms: ['facebook', 'instagram', 'audience_network', 'messenger'],
      destinationUrl: 'https://nordiccleanliving.dk/shop',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-12T00:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE', 'CONTENT_ACCESSIBLE', 'BRAND_NAME_VISIBLE', 'CORPORATE_EMAIL_MATCH'],
      identityConsistencyState: 'CONSISTENT',
      publicBusinessEmail: 'kontakt@nordiccleanliving.dk',
      publicBusinessPhone: '+45-33-55-01-22',
      publicAddress: 'Vesterbrogade 44, Copenhagen, Denmark',
      industryClass: 'Consumer Goods & Sustainable Living',
      hasCriticalConflict: false,
      capturedAt: '2026-03-14T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'VERIFIED_FOR_WORKFLOW',
    expectedScoreMin: 85,
    expectedScoreMax: 100,
    expectedConfidence: 'HIGH',
    expectedBlockers: [],
    semanticInvariants: [
      'Hits full category caps in Advertising and Website',
      'All 4 categories contribute maximum compliant points'
    ]
  },
  {
    id: 'GOLDEN-10',
    name: 'Personal Free Webmail Lead (PII Neutralization)',
    description: 'Advertiser listing personal Gmail address (@gmail.com). System awards 0 points for email to avoid rewarding personal contact data.',
    inputSnapshot: {
      snapshotId: 'SNAP-PII-010',
      entityId: 'ENT-SOLO-7712',
      advertiserName: 'Freelance Fitness Coach Dave',
      canonicalAdCount: 2,
      firstObservedAt: '2026-01-15T00:00:00Z',
      lastObservedAt: '2026-03-10T00:00:00Z',
      creativeSignaturesCount: 2,
      platforms: ['instagram'],
      destinationUrl: 'https://davefitcoaching.com',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-11T00:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE'],
      identityConsistencyState: 'CONSISTENT',
      publicBusinessEmail: 'davefitcoaching1988@gmail.com', // Personal webmail
      publicBusinessPhone: undefined,
      hasCriticalConflict: false,
      capturedAt: '2026-03-12T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'QUALIFIED',
    expectedScoreMin: 45,
    expectedScoreMax: 65,
    expectedConfidence: 'MEDIUM',
    expectedBlockers: [],
    semanticInvariants: [
      'SIG-CNT-01 awards exactly 0 points for personal webmail',
      'Personal data is not an implicit score booster'
    ]
  },
  {
    id: 'GOLDEN-11',
    name: 'High Score / Moderate Confidence (Missing Contact Fields)',
    description: 'High advertising and website presence, but corporate telephone and physical address are unknown.',
    inputSnapshot: {
      snapshotId: 'SNAP-CONFMOD-011',
      entityId: 'ENT-GROWTH-552',
      advertiserName: 'Streamline AI Marketing',
      canonicalAdCount: 8,
      firstObservedAt: '2025-10-01T00:00:00Z',
      lastObservedAt: '2026-03-14T00:00:00Z',
      creativeSignaturesCount: 5,
      platforms: ['facebook', 'instagram'],
      destinationUrl: 'https://streamlinegrowth.ai',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-13T00:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE', 'BRAND_NAME_VISIBLE'],
      identityConsistencyState: 'CONSISTENT',
      publicBusinessEmail: 'hello@streamlinegrowth.ai',
      publicBusinessPhone: undefined, // Missing
      publicAddress: undefined, // Missing
      hasCriticalConflict: false,
      capturedAt: '2026-03-14T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'QUALIFIED',
    expectedScoreMin: 70,
    expectedScoreMax: 85,
    expectedConfidence: 'MEDIUM',
    expectedBlockers: [],
    semanticInvariants: [
      'Decoupled score (high) and confidence (medium) accurately reported',
      'Missing contact coordinates explicitly listed in missingEvidence'
    ]
  },
  {
    id: 'GOLDEN-12',
    name: 'Missing Advertiser Identity (Eligibility Failure)',
    description: 'Entity record contains zero advertiser identity string. Triggers BLOCKER-04 assigning NOT_ELIGIBLE.',
    inputSnapshot: {
      snapshotId: 'SNAP-NOID-012',
      entityId: 'ENT-EMPTY-000',
      advertiserName: '',
      canonicalAdCount: 1,
      firstObservedAt: '2026-03-01T00:00:00Z',
      lastObservedAt: '2026-03-02T00:00:00Z',
      creativeSignaturesCount: 1,
      platforms: ['facebook'],
      destinationUrl: 'https://example.com',
      hasCriticalConflict: false,
      capturedAt: '2026-03-03T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'NOT_ELIGIBLE',
    expectedScoreMin: 0,
    expectedScoreMax: 0,
    expectedConfidence: 'UNCERTAIN',
    expectedBlockers: ['BLOCKER-04'],
    semanticInvariants: [
      'Fails initial Layer A eligibility',
      'Produces Score 0 and NOT_ELIGIBLE state'
    ]
  },
  {
    id: 'GOLDEN-13',
    name: 'Insecure Non-TLS Destination (HTTP Only)',
    description: 'Destination responds with HTTP 200, but fails HTTPS TLS handshake. Receives reachability points but 0 TLS points.',
    inputSnapshot: {
      snapshotId: 'SNAP-NOTLS-013',
      entityId: 'ENT-HTTP-331',
      advertiserName: 'Rustic Country Woodcraft',
      canonicalAdCount: 3,
      firstObservedAt: '2026-01-01T00:00:00Z',
      lastObservedAt: '2026-03-10T00:00:00Z',
      creativeSignaturesCount: 2,
      platforms: ['facebook'],
      destinationUrl: 'http://rusticwoodcraft.net',
      landingReachable: true,
      httpsAvailable: false, // Insecure
      verificationCheckedAt: '2026-03-11T00:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK'],
      identityConsistencyState: 'CONSISTENT',
      publicBusinessEmail: 'orders@rusticwoodcraft.net',
      hasCriticalConflict: false,
      capturedAt: '2026-03-12T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'QUALIFIED',
    expectedScoreMin: 45,
    expectedScoreMax: 65,
    expectedConfidence: 'MEDIUM',
    expectedBlockers: [],
    semanticInvariants: [
      'SIG-WEB-03 awards exactly 0 points for missing HTTPS',
      'Negative evidence notes insecure transport'
    ]
  },
  {
    id: 'GOLDEN-14',
    name: 'Category Cap Saturation Test',
    description: 'Advertiser with 50 canonical ads and 3 years running. Tests that category cap clamps raw ad points at 30, preventing runaway scoring.',
    inputSnapshot: {
      snapshotId: 'SNAP-MEGA-014',
      entityId: 'ENT-MEGA-999',
      advertiserName: 'Global Megastore Direct',
      canonicalAdCount: 50,
      firstObservedAt: '2023-01-01T00:00:00Z',
      lastObservedAt: '2026-03-14T00:00:00Z',
      creativeSignaturesCount: 30,
      platforms: ['facebook', 'instagram', 'audience_network', 'messenger'],
      destinationUrl: 'https://megastoredirect.com',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-13T00:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE', 'CONTENT_ACCESSIBLE', 'BRAND_NAME_VISIBLE'],
      identityConsistencyState: 'CONSISTENT',
      publicBusinessEmail: 'help@megastoredirect.com',
      publicBusinessPhone: '+1-888-555-0900',
      hasCriticalConflict: false,
      capturedAt: '2026-03-14T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'VERIFIED_FOR_WORKFLOW',
    expectedScoreMin: 85,
    expectedScoreMax: 100,
    expectedConfidence: 'HIGH',
    expectedBlockers: [],
    semanticInvariants: [
      'Ad activity raw score clamped precisely at 30',
      'Total score cannot exceed 100 points'
    ]
  },
  {
    id: 'GOLDEN-15',
    name: 'Login-Wall Protected Destination',
    description: 'Website returns HTTP 200, but public DOM content is locked behind a mandatory login wall. Content visibility points withheld.',
    inputSnapshot: {
      snapshotId: 'SNAP-WALL-015',
      entityId: 'ENT-GATE-440',
      advertiserName: 'Private Members Club X',
      canonicalAdCount: 4,
      firstObservedAt: '2026-01-10T00:00:00Z',
      lastObservedAt: '2026-03-12T00:00:00Z',
      creativeSignaturesCount: 2,
      platforms: ['facebook', 'instagram'],
      destinationUrl: 'https://membersclubx.com/portal/login',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-13T00:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE'], // CONTENT_ACCESSIBLE absent
      identityConsistencyState: 'PARTIALLY_CONSISTENT',
      hasCriticalConflict: false,
      capturedAt: '2026-03-14T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'REVIEW_REQUIRED',
    expectedScoreMin: 40,
    expectedScoreMax: 60,
    expectedConfidence: 'MEDIUM',
    expectedBlockers: [],
    semanticInvariants: [
      'SIG-WEB-04 awards 0 points due to login barrier',
      'Engine respects access walls without attempting bypass'
    ]
  },
  {
    id: 'GOLDEN-16',
    name: 'Audited Human Manual Override',
    description: 'Entity initially routed to REVIEW_REQUIRED due to identity ambiguity. A senior reviewer manually upgrades status to QUALIFIED with logged reason.',
    inputSnapshot: {
      snapshotId: 'SNAP-OVR-016',
      entityId: 'ENT-OVR-1928',
      advertiserName: 'Cascade Valley Dental Group',
      canonicalAdCount: 4,
      firstObservedAt: '2025-10-01T00:00:00Z',
      lastObservedAt: '2026-03-10T00:00:00Z',
      creativeSignaturesCount: 3,
      platforms: ['facebook', 'instagram'],
      destinationUrl: 'https://cascadevalleydental.org',
      landingReachable: true,
      httpsAvailable: true,
      verificationCheckedAt: '2026-03-11T00:00:00Z',
      verificationStatus: 'VERIFIED',
      verificationClaimsSupported: ['HTTP_200_OK', 'TLS_ACTIVE', 'BRAND_NAME_VISIBLE'],
      identityConsistencyState: 'PARTIALLY_CONSISTENT',
      publicBusinessEmail: 'reception@cascadevalleydental.org',
      publicBusinessPhone: '+1-509-555-0177',
      hasCriticalConflict: false,
      capturedAt: '2026-03-12T00:00:00Z',
      verificationRuleVersion: '2026.03.R1'
    },
    expectedStatus: 'QUALIFIED',
    expectedScoreMin: 60,
    expectedScoreMax: 80,
    expectedConfidence: 'HIGH',
    expectedBlockers: [],
    semanticInvariants: [
      'Manual override is non-destructive to raw evidence',
      'Audit log tracks reviewer ID, timestamp, and justification'
    ]
  }
];

export const PHASE_06_AUDIT_CRITERIA: Phase06AuditCriterion[] = [
  {
    id: 'P6-AUD-01',
    code: 'PHASE_05_TRACEABILITY',
    title: 'Strict Lineage to Phase 05 Verification Claims',
    category: 'TRACEABILITY',
    requirement: 'Every score signal, blocker, and natural-language explanation must reference a verified Phase 05 claim or artifact.',
    verificationEvidence: 'QualificationEngine maps Phase 05 claims directly into SignalContribution evidenceReferences.',
    testCoverage: 'Tested in GOLDEN-01 through GOLDEN-16.'
  },
  {
    id: 'P6-AUD-02',
    code: 'QUALIFICATION_VS_SCORING',
    title: 'Separation of Qualification, Scoring, and Prioritization',
    category: 'SEPARATION',
    requirement: 'Qualification (boolean gatekeeper), Scoring (0–100 metric), and Prioritization (workflow sorting) must remain decoupled.',
    verificationEvidence: 'Separate status enum, score integer, and prioritize() function in qualificationEngine.ts.',
    testCoverage: 'Verified in QualificationSimulator and PrioritizationMatrixViewer.'
  },
  {
    id: 'P6-AUD-03',
    code: 'TARGET_ENTITY_CLUSTERING',
    title: 'Explicit Scored Entity Anchoring',
    category: 'SEPARATION',
    requirement: 'The score must anchor to the canonical Business Candidate / Advertiser cluster, not individual ad records.',
    verificationEvidence: 'ScoringInputSnapshot anchors to entityId; canonicalAdCount is an aggregate property.',
    testCoverage: 'Tested in GOLDEN-01 and GOLDEN-09.'
  },
  {
    id: 'P6-AUD-04',
    code: 'HARD_BLOCKERS_ENFORCEMENT',
    title: 'Automated Hard Blocker Enforcement',
    category: 'BLOCKERS',
    requirement: 'Severe protocol hazards, identity spoofing, and zero-ad states must immediately halt qualification without score bypass.',
    verificationEvidence: 'evaluateBlockers() enforces BLOCKER-01 through BLOCKER-05 before score synthesis.',
    testCoverage: 'Verified in GOLDEN-05, GOLDEN-06, and GOLDEN-12.'
  },
  {
    id: 'P6-AUD-05',
    code: 'MISSING_DATA_FAIRNESS',
    title: 'Non-Punitive Missing Data Policy',
    category: 'DOUBLE_COUNTING',
    requirement: 'Missing evidence must never be treated as affirmative proof of fraud or poor business quality.',
    verificationEvidence: 'Signals classify missing data as ABSENT or UNKNOWN with 0 penalty, preserving fairness.',
    testCoverage: 'Verified in GOLDEN-03 (No-Website Retailer) and GOLDEN-04 (HTTP 404).'
  },
  {
    id: 'P6-AUD-06',
    code: 'FRESHNESS_TIME_DECAY',
    title: 'Explicit Verification Evidence Freshness Windows',
    category: 'CONFIDENCE',
    requirement: 'Evidence >14 days must receive reduced confidence, and evidence >60 days must trigger re-verification.',
    verificationEvidence: 'calculateFreshness() evaluates CURRENT (<=14d), RECENT (<=30d), and STALE (>30d).',
    testCoverage: 'Verified in GOLDEN-07 (Stale Verification).'
  },
  {
    id: 'P6-AUD-07',
    code: 'ANTI_DOUBLE_COUNTING_CAPS',
    title: 'Category Caps & Anti-Double-Counting Architecture',
    category: 'DOUBLE_COUNTING',
    requirement: 'Related signals within a domain must be clamped by explicit category caps to prevent score inflation.',
    verificationEvidence: 'Category caps enforced: Ad Activity (30), Website (30), Identity (25), Contact (15).',
    testCoverage: 'Verified in GOLDEN-14 (Category Cap Saturation).'
  },
  {
    id: 'P6-AUD-08',
    code: 'INDEPENDENT_CONFIDENCE_METRIC',
    title: 'Decoupled Confidence Metric',
    category: 'CONFIDENCE',
    requirement: 'Confidence must reflect evidence completeness and freshness independently of the numerical score.',
    verificationEvidence: 'ConfidenceScore is calculated independently and mapped to HIGH, MEDIUM, LOW, UNCERTAIN.',
    testCoverage: 'Verified in GOLDEN-11 (High Score, Moderate Confidence).'
  },
  {
    id: 'P6-AUD-09',
    code: 'FACTUAL_EXPLAINABILITY',
    title: 'Deterministic Factual Explanations',
    category: 'EXPLAINABILITY',
    requirement: 'Every qualification decision must emit an unambiguous, evidence-backed narrative without generic marketing hype.',
    verificationEvidence: 'QualificationResult.explanation synthesizes applied rules, point values, and missing fields.',
    testCoverage: 'Verified across all 16 golden datasets.'
  },
  {
    id: 'P6-AUD-10',
    code: 'AUDITABLE_MANUAL_OVERRIDES',
    title: 'Non-Destructive Manual Overrides',
    category: 'AUDIT_OVERRIDE',
    requirement: 'Human operators may override decisions, but the underlying verification facts and audit trail must remain immutable.',
    verificationEvidence: 'ManualOverrideRecord preserves original status, score, reviewer ID, timestamp, and policy version.',
    testCoverage: 'Verified in GOLDEN-16 and QualificationSimulator override dialog.'
  },
  {
    id: 'P6-AUD-11',
    code: 'MODEL_REGISTRY_LIFECYCLE',
    title: 'Scoring Model Registry & Lifecycle Management',
    category: 'AUDIT_OVERRIDE',
    requirement: 'Models must support versioned lifecycles: DRAFT, TESTING, SHADOW, ACTIVE, and RETIRED.',
    verificationEvidence: 'MODEL_REGISTRY contains MODEL-V1-BALANCED, MODEL-V2-STRICT, and MODEL-V0-LEGACY.',
    testCoverage: 'Verified in ModelRegistryAndImpactViewer.'
  },
  {
    id: 'P6-AUD-12',
    code: 'SHADOW_MODE_IMPACT_ANALYSIS',
    title: 'Shadow-Mode Execution & Impact Analysis',
    category: 'AUDIT_OVERRIDE',
    requirement: 'Before model activation, candidate models must run in shadow mode to analyze distribution shift and transitions.',
    verificationEvidence: 'evaluateImpact() calculates mean score deltas, newly qualified, and shift percentages.',
    testCoverage: 'Verified in ModelRegistryAndImpactViewer.'
  },
  {
    id: 'P6-AUD-13',
    code: 'PII_NEUTRALIZATION',
    title: 'Prohibition on Personal PII Scoring & Bias',
    category: 'SAFETY_PRIVACY',
    requirement: 'Scoring must never ingest sensitive personal demographics, and personal free webmail must receive 0 points.',
    verificationEvidence: 'SIG-CNT-01 strictly requires corporate domain-matched emails and excludes @gmail/@yahoo.',
    testCoverage: 'Verified in GOLDEN-10 (Personal Webmail Lead).'
  },
  {
    id: 'P6-AUD-14',
    code: 'NO_CONVERSION_CLAIMS',
    title: 'Prohibition of Unvalidated Conversion Claims',
    category: 'SAFETY_PRIVACY',
    requirement: 'System must never present score as a conversion probability, revenue prediction, or objective business quality truth.',
    verificationEvidence: 'Documentation and UI explicitly define score as an internal evidence-conformance index.',
    testCoverage: 'Verified in Section 1, 10, and Header annotations.'
  },
  {
    id: 'P6-AUD-15',
    code: 'IDEMPOTENT_RECALCULATION',
    title: 'Idempotent Score Recalculation',
    category: 'REGRESSION',
    requirement: 'Evaluating the same snapshot against the same model version must produce bit-for-bit identical results.',
    verificationEvidence: 'Pure deterministic evaluation functions with zero hidden random seeds.',
    testCoverage: 'Verified in Phase06GoldenReplay benchmark runner.'
  },
  {
    id: 'P6-AUD-16',
    code: 'BOUNDED_MATHEMATICAL_RANGE',
    title: 'Strict Score Clamping (0 <= S <= 100)',
    category: 'REGRESSION',
    requirement: 'The final score must never exceed 100 or fall below 0 under any combination of extreme input signals.',
    verificationEvidence: 'Math.min(100, Math.max(0, ...)) applied after category cap summation.',
    testCoverage: 'Verified in GOLDEN-14 and Property Testing suite.'
  },
  {
    id: 'P6-AUD-17',
    code: 'PHASE_07_PERSISTENCE_CONTRACT',
    title: 'Durable Persistence Handoff Contract',
    category: 'TRACEABILITY',
    requirement: 'System must produce machine-readable JSON schema contracts for Phase 07 database schema implementation.',
    verificationEvidence: 'PHASE_06_HANDOFF_PAYLOAD specifies full SQL and JSON-LD persistence requirements.',
    testCoverage: 'Verified in Phase06HandoffViewer.'
  }
];

export const PHASE_06_HANDOFF_PAYLOAD = {
  phase: 6,
  status: 'COMPLETED_ACCEPTED',
  specificationTitle: 'Maximum Strict Evidence-Driven Lead Qualification, Scoring, Prioritization & Explainability',
  qualificationSchemaVersion: '6.0.0-PROD',
  scoringModelId: 'MODEL-V1-BALANCED',
  scoringModelVersion: '1.2.0',
  ruleSetVersion: '2026.03.R1',
  author: 'Data Quality, Systems Architecture & Decision Systems Working Group',
  evaluatedAt: '2026-03-15T12:00:00Z',

  qualificationStates: [
    'NOT_ELIGIBLE',
    'INSUFFICIENT_EVIDENCE',
    'QUALIFIED',
    'REVIEW_REQUIRED',
    'VERIFIED_FOR_WORKFLOW',
    'EXPIRED',
    'REJECTED_BY_RULE'
  ],

  categoryCaps: {
    ADVERTISING_ACTIVITY: 30,
    WEBSITE_DESTINATION: 30,
    IDENTITY_CONSISTENCY: 25,
    BUSINESS_CONTACTABILITY: 15
  },

  signalDefinitions: [
    { id: 'SIG-ADV-01', name: 'Canonical Ad Volume', category: 'ADVERTISING_ACTIVITY', maxPoints: 15 },
    { id: 'SIG-ADV-02', name: 'Observed Longevity', category: 'ADVERTISING_ACTIVITY', maxPoints: 10 },
    { id: 'SIG-ADV-03', name: 'Multi-Platform Reach', category: 'ADVERTISING_ACTIVITY', maxPoints: 5 },
    { id: 'SIG-WEB-01', name: 'Destination URL Usability', category: 'WEBSITE_DESTINATION', maxPoints: 5 },
    { id: 'SIG-WEB-02', name: 'HTTP Reachability', category: 'WEBSITE_DESTINATION', maxPoints: 10 },
    { id: 'SIG-WEB-03', name: 'TLS / HTTPS Security', category: 'WEBSITE_DESTINATION', maxPoints: 5 },
    { id: 'SIG-WEB-04', name: 'DOM Business Content Visibility', category: 'WEBSITE_DESTINATION', maxPoints: 10 },
    { id: 'SIG-ID-01', name: 'Brand Token Overlap', category: 'IDENTITY_CONSISTENCY', maxPoints: 15 },
    { id: 'SIG-ID-02', name: 'Domain Registration Alignment', category: 'IDENTITY_CONSISTENCY', maxPoints: 10 },
    { id: 'SIG-CNT-01', name: 'Public Corporate Email', category: 'BUSINESS_CONTACTABILITY', maxPoints: 5 },
    { id: 'SIG-CNT-02', name: 'E.164 Corporate Telephone', category: 'BUSINESS_CONTACTABILITY', maxPoints: 5 },
    { id: 'SIG-CNT-03', name: 'Commercial Address / Jurisdiction', category: 'BUSINESS_CONTACTABILITY', maxPoints: 5 }
  ],

  blockerDefinitions: [
    { id: 'BLOCKER-01', name: 'Protocol Hazard or SSRF Attempt', severity: 'CRITICAL' },
    { id: 'BLOCKER-02', name: 'Critical Identity Contradiction', severity: 'CRITICAL' },
    { id: 'BLOCKER-03', name: 'Zero Observable Canonical Ads', severity: 'CRITICAL' },
    { id: 'BLOCKER-04', name: 'Missing Advertiser Identity', severity: 'CRITICAL' },
    { id: 'BLOCKER-05', name: 'Stale Critical Verification (>60 Days)', severity: 'CONDITIONAL' }
  ],

  phase7PersistenceRequirements: {
    tables: [
      {
        name: 'qualification_results',
        description: 'Point-in-time qualification and score snapshots.',
        primaryKey: 'qualification_id',
        indices: ['entity_id', 'calculated_at', 'status', 'score']
      },
      {
        name: 'signal_contributions',
        description: 'Atomic score contributions per signal rule.',
        primaryKey: 'contribution_id',
        indices: ['qualification_id', 'signal_id', 'category']
      },
      {
        name: 'manual_overrides',
        description: 'Auditable record of human review decisions.',
        primaryKey: 'override_id',
        indices: ['entity_id', 'applied_at', 'reviewer']
      },
      {
        name: 'scoring_models',
        description: 'Immutable versioned registry of scoring models.',
        primaryKey: 'model_id_version',
        indices: ['status', 'created_at']
      }
    ]
  }
};
