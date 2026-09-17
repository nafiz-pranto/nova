import { Phase07AuditCriterion, LeadResearchReadModel, ProvenanceLineageGraph } from '../types';

export const PHASE_07_AUDIT_CRITERIA: Phase07AuditCriterion[] = [
  {
    id: 'audit-01',
    code: 'TRACE-01',
    title: 'Phase-06 Traceability Coverage',
    category: 'TRACEABILITY',
    requirement: 'Every upstream qualification state, category cap, scoring signal, and rule version must map directly to an authoritative PostgreSQL table column or constraint.',
    verificationEvidence: 'Mapped in Section 01 and materialized in scoring_result, scoring_contribution, and scoring_model.',
    testCoverage: 'TestSuite_01_Traceability_Mapping'
  },
  {
    id: 'audit-02',
    code: 'TRACE-02',
    title: 'PostgreSQL Relational Primitives',
    category: 'TRACEABILITY',
    requirement: 'PostgreSQL 16+ engine selected with explicit relational schemas, transactional DDL, ACID serializability, and foreign key cascades.',
    verificationEvidence: 'Documented in Section 02; migrations wrapped in transactional DDL with strict ON DELETE rules.',
    testCoverage: 'TestSuite_02_Engine_Configuration'
  },
  {
    id: 'audit-03',
    code: 'IMMUT-01',
    title: 'Immutable Raw Observation Preservation',
    category: 'IMMUTABILITY',
    requirement: 'Source web extractions and ad library cards must be append-only and never updated or overwritten in place.',
    verificationEvidence: 'source_observation and raw_observation_field tables have no UPDATE triggers or application update paths.',
    testCoverage: 'TestSuite_03_Immutable_Observations'
  },
  {
    id: 'audit-04',
    code: 'IMMUT-02',
    title: 'Raw Value & CSS Selector Auditing',
    category: 'IMMUTABILITY',
    requirement: 'Individual extracted DOM text tokens must preserve original raw strings, CSS selectors, extraction methods, and confidence values.',
    verificationEvidence: 'raw_observation_field stores selector path, raw string, extraction type, and normalized confidence.',
    testCoverage: 'TestSuite_04_Token_Provenance'
  },
  {
    id: 'audit-05',
    code: 'IMMUT-03',
    title: 'Canonical Entity Provenance Pointers',
    category: 'IMMUTABILITY',
    requirement: 'Every canonical entity (advertiser, advertisement, destination) must maintain explicit foreign key pointers back to anchoring observations.',
    verificationEvidence: 'ad_observation and advertiser_name_history strictly reference source_observation_id with ON DELETE RESTRICT.',
    testCoverage: 'TestSuite_05_Provenance_Pointers'
  },
  {
    id: 'audit-06',
    code: 'IMMUT-04',
    title: 'Temporal Verification Preservation',
    category: 'IMMUTABILITY',
    requirement: 'Historical HTTP status codes, TLS certificate chains, and DNS results must never be overwritten by newer verification runs.',
    verificationEvidence: 'verification_run is an append-only versioned fact ledger; read models query latest via timestamp ordering.',
    testCoverage: 'TestSuite_06_Verification_History'
  },
  {
    id: 'audit-07',
    code: 'IMMUT-05',
    title: 'Frozen Scoring Evidence Snapshots',
    category: 'IMMUTABILITY',
    requirement: 'Qualification and scoring calculations must freeze their input payloads in content-addressable JSONB snapshots to prevent calculation drift.',
    verificationEvidence: 'scoring_evidence_snapshot enforces unique SHA-256 snapshot_hash; referenced by scoring_result.',
    testCoverage: 'TestSuite_07_Frozen_Snapshots'
  },
  {
    id: 'audit-08',
    code: 'IMMUT-06',
    title: 'Append-Only Manual Overrides',
    category: 'IMMUTABILITY',
    requirement: 'Human reviewer adjustments must never mutate historical scoring results directly, but append immutable manual_override records.',
    verificationEvidence: 'manual_override records reviewer ID, reason code, and justification without altering scoring_result.',
    testCoverage: 'TestSuite_08_Manual_Overrides'
  },
  {
    id: 'audit-09',
    code: 'INTEG-01',
    title: 'Restricted Cascading Deletions',
    category: 'INTEGRITY',
    requirement: 'Core domain and observation tables must use ON DELETE RESTRICT to eliminate accidental cascading data destruction.',
    verificationEvidence: 'Foreign keys between observation, advertiser, and verification runs strictly enforce RESTRICT.',
    testCoverage: 'TestSuite_09_Restrict_Cascades'
  },
  {
    id: 'audit-10',
    code: 'INTEG-02',
    title: 'Active Identity Partial Uniqueness',
    category: 'INTEGRITY',
    requirement: 'An advertiser must map to at most one active business entity at any single point in time via partial unique indexing.',
    verificationEvidence: 'advertiser_identity_link has UNIQUE INDEX on (source_advertiser_id) WHERE is_active = true.',
    testCoverage: 'TestSuite_10_Partial_Unique_Index'
  },
  {
    id: 'audit-11',
    code: 'INTEG-03',
    title: 'Idempotency Natural Composite Keys',
    category: 'INTEGRITY',
    requirement: 'Duplicate observation ingestion must be rejected at the database level via composite natural keys.',
    verificationEvidence: 'source_observation enforces uq_source_obs_idempotency on (source_system_id, source_ad_library_id, batch_identifier).',
    testCoverage: 'TestSuite_11_Idempotency_Constraints'
  },
  {
    id: 'audit-12',
    code: 'INTEG-04',
    title: 'Score Range Check Constraints',
    category: 'INTEGRITY',
    requirement: 'Scoring results must be mathematically constrained between 0.00 and 100.00 at the database engine level.',
    verificationEvidence: 'scoring_result has CHECK (total_score >= 0.00 AND total_score <= 100.00).',
    testCoverage: 'TestSuite_12_Score_Check_Constraints'
  },
  {
    id: 'audit-13',
    code: 'INTEG-05',
    title: 'Temporal Ordering Check Constraints',
    category: 'INTEGRITY',
    requirement: 'Temporal causality must be strictly enforced: last_seen_at must be greater than or equal to first_seen_at.',
    verificationEvidence: 'advertiser table check constraint chk_adv_dates enforces last_seen_at >= first_seen_at.',
    testCoverage: 'TestSuite_13_Temporal_Check_Constraints'
  },
  {
    id: 'audit-14',
    code: 'INTEG-06',
    title: 'Self-Merge Prevention Invariant',
    category: 'INTEGRITY',
    requirement: 'An entity must never be permitted to merge into itself.',
    verificationEvidence: 'identity_merge_event check constraint chk_no_self_merge enforces primary_entity_id <> merged_entity_id.',
    testCoverage: 'TestSuite_14_Self_Merge_Constraint'
  },
  {
    id: 'audit-15',
    code: 'INTEG-07',
    title: 'Positive Latency Check Constraint',
    category: 'INTEGRITY',
    requirement: 'Network round-trip latency must be non-negative.',
    verificationEvidence: 'verification_run check constraint chk_verif_latency enforces latency_ms >= 0.',
    testCoverage: 'TestSuite_15_Latency_Constraint'
  },
  {
    id: 'audit-16',
    code: 'TRANS-01',
    title: 'Atomic Ingestion Transaction Boundary',
    category: 'TRANSACTIONS',
    requirement: 'Observation insertion, token field batching, and ad canonicalization must succeed or fail as a single atomic transaction.',
    verificationEvidence: 'Simulated and executed inside atomic BEGIN ... COMMIT blocks with rollback on validation error.',
    testCoverage: 'TestSuite_16_Atomic_Ingestion'
  },
  {
    id: 'audit-17',
    code: 'TRANS-02',
    title: 'Atomic Identity Merge Transaction',
    category: 'TRANSACTIONS',
    requirement: 'Merging entities requires acquiring row-level locks, deactivating old links, inserting merge events, and emitting audit logs atomically.',
    verificationEvidence: 'Atomic merge algorithm validated in databaseEngine with full rollback protection.',
    testCoverage: 'TestSuite_17_Atomic_Merge'
  },
  {
    id: 'audit-18',
    code: 'TRANS-03',
    title: 'Reversible Identity Split Transaction',
    category: 'TRANSACTIONS',
    requirement: 'Splitting mistakenly merged entities must restore independent status and create audit logs without losing history.',
    verificationEvidence: 'identity_split_event restores entity status and deactivates merged identity links atomically.',
    testCoverage: 'TestSuite_18_Atomic_Split'
  },
  {
    id: 'audit-19',
    code: 'CONCUR-01',
    title: 'Row-Level Locking Concurrency Protection',
    category: 'CONCURRENCY',
    requirement: 'Concurrent workers attempting to merge or update the same entity must acquire SELECT ... FOR UPDATE locks.',
    verificationEvidence: 'Row-level locking pattern documented in Section 16 and enforced in transaction simulator.',
    testCoverage: 'TestSuite_19_Row_Level_Locking'
  },
  {
    id: 'audit-20',
    code: 'CONCUR-02',
    title: 'Optimistic Versioning for Human Review',
    category: 'CONCURRENCY',
    requirement: 'Human reviewers modifying lead qualification must verify updated_at tokens to prevent overwriting concurrent updates.',
    verificationEvidence: 'Optimistic locking checks updated_at token before committing manual overrides.',
    testCoverage: 'TestSuite_20_Optimistic_Concurrency'
  },
  {
    id: 'audit-21',
    code: 'PROV-01',
    title: 'End-to-End Lineage Graph Reconstructibility',
    category: 'PROVENANCE',
    requirement: 'Any lead score must be completely traceable back through verification, canonicalization, and raw HTML tokens.',
    verificationEvidence: 'Provenance graph engine traverses result -> snapshot -> verification_claim -> canonical -> source_observation.',
    testCoverage: 'TestSuite_21_Lineage_Graph'
  },
  {
    id: 'audit-22',
    code: 'PROV-02',
    title: 'System-Wide Tamper-Evident Audit Ledger',
    category: 'PROVENANCE',
    requirement: 'Every state mutation must log actor, action, previous state diff, and correlation ID in audit_event.',
    verificationEvidence: 'audit_event table captures before/after JSONB diffs for 100% of mutations.',
    testCoverage: 'TestSuite_22_Audit_Event_Completeness'
  },
  {
    id: 'audit-23',
    code: 'PROV-03',
    title: 'Model Version Immutability in Registry',
    category: 'PROVENANCE',
    requirement: 'Active scoring models must never be altered in place; rule modifications require a new versioned row.',
    verificationEvidence: 'Unique constraint on (id, version) and ACTIVE/SHADOW/RETIRED status lifecycle.',
    testCoverage: 'TestSuite_23_Model_Immutability'
  },
  {
    id: 'audit-24',
    code: 'SEC-01',
    title: 'Least-Privilege Database Roles',
    category: 'SECURITY_PRIVACY',
    requirement: 'Database access must be segregated across lead_migration_admin, lead_app_worker, and lead_read_reporter roles.',
    verificationEvidence: 'Documented in Section 23 with explicit DDL grant matrix.',
    testCoverage: 'TestSuite_24_Role_Privileges'
  },
  {
    id: 'audit-25',
    code: 'SEC-02',
    title: 'Consumer PII Redaction & Data Minimization',
    category: 'SECURITY_PRIVACY',
    requirement: 'Consumer webmail addresses extracted from footers must be neutralized to REDACTED_CONSUMER_EMAIL.',
    verificationEvidence: 'Documented in Section 24; enforced during Layer A canonicalization.',
    testCoverage: 'TestSuite_25_PII_Redaction'
  },
  {
    id: 'audit-26',
    code: 'SEC-03',
    title: 'SSRF Audit & Network Egress Logging',
    category: 'SECURITY_PRIVACY',
    requirement: 'Verification runs must validate destination IPs against private/reserved CIDRs and record network traces.',
    verificationEvidence: 'verification_run stores is_ssrf_safe boolean and network_audit_log JSONB.',
    testCoverage: 'TestSuite_26_SSRF_Audit_Logging'
  },
  {
    id: 'audit-27',
    code: 'MIG-01',
    title: 'Sequential Migration Chain From Zero',
    category: 'MIGRATION_RESTORE',
    requirement: 'Complete database schema must be buildable from empty PostgreSQL instance via migrations 001 through 008.',
    verificationEvidence: '8 sequential DDL scripts defined in phase07SchemaAndMigrations and executable in runner.',
    testCoverage: 'TestSuite_27_Clean_Schema_Build'
  },
  {
    id: 'audit-28',
    code: 'MIG-02',
    title: 'Reversible Migration Down Scripts',
    category: 'MIGRATION_RESTORE',
    requirement: 'Every migration must provide a tested downSql script that completely and cleanly unwinds changes.',
    verificationEvidence: '100% of migrations specify exact downSql scripts with zero orphaned dependencies.',
    testCoverage: 'TestSuite_28_Migration_Rollback'
  },
  {
    id: 'audit-29',
    code: 'MIG-03',
    title: 'Zero-Downtime Expand/Contract Migration Safety',
    category: 'MIGRATION_RESTORE',
    requirement: 'Migrations on active tables must follow expand/contract patterns with explicit lock timeouts.',
    verificationEvidence: 'Documented in Section 22 with lock_timeout = 2000ms guardrails.',
    testCoverage: 'TestSuite_29_Zero_Downtime_Patterns'
  },
  {
    id: 'audit-30',
    code: 'MIG-04',
    title: 'Point-in-Time Recovery (PITR) RPO/RTO',
    category: 'MIGRATION_RESTORE',
    requirement: 'Disaster recovery must achieve RPO <= 5 minutes and RTO <= 60 minutes via WAL archiving and daily base backups.',
    verificationEvidence: 'Documented in Section 21 with weekly automated restore test automation.',
    testCoverage: 'TestSuite_30_Disaster_Recovery_Drill'
  },
  {
    id: 'audit-31',
    code: 'MIG-05',
    title: 'Tiered Data Retention & Archival Policies',
    category: 'MIGRATION_RESTORE',
    requirement: 'Tables must be classified into Permanent, 7-Year, 90-Day, and 30-Day retention tiers with automated lifecycle handling.',
    verificationEvidence: 'All 32 tables assigned explicit retention tier in ALL_TABLE_SPECIFICATIONS.',
    testCoverage: 'TestSuite_31_Retention_Lifecycle'
  },
  {
    id: 'audit-32',
    code: 'READ-01',
    title: 'Decoupled Current-State Read Model Views',
    category: 'TRACEABILITY',
    requirement: 'Reporting and export queries must query high-performance views without altering or locking historical ledgers.',
    verificationEvidence: 'v_lead_research_current joins domain state and latest scoring without locking underlying tables.',
    testCoverage: 'TestSuite_32_Read_Model_View'
  },
  {
    id: 'audit-33',
    code: 'READ-02',
    title: 'Phase-08 Machine-Readable Handoff Contract',
    category: 'TRACEABILITY',
    requirement: 'Deliver a complete, validated machine-readable JSON specification defining schemas, read views, and interfaces for Phase 08.',
    verificationEvidence: 'Phase07HandoffViewer and export payload validated against downstream reporting requirements.',
    testCoverage: 'TestSuite_33_Handoff_Contract_Validation'
  }
];

export const SAMPLE_READ_MODELS: LeadResearchReadModel[] = [
  {
    advertiserId: 'adv-001-apex',
    canonicalName: 'Apex Legal Partners LLC',
    status: 'ACTIVE',
    externalAdLibraryId: 'meta-ad-9823411',
    activeAdCount: 8,
    observedDaysCount: 42,
    primaryDestinationUrl: 'https://apexlegalpartners.com/commercial-litigation',
    registrableDomain: 'apexlegalpartners.com',
    verificationStatus: 'SUCCESS',
    verificationEvidenceCount: 6,
    hasSsl: true,
    hasOpenDom: true,
    qualificationState: 'QUALIFIED',
    score: 87.5,
    confidence: 'HIGH',
    activeBlockers: [],
    scoringModelVersion: 'MODEL-V1-BALANCED',
    lastCalculatedAt: '2026-09-16T01:30:00Z',
    auditTrailCount: 14,
    provenanceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    advertiserId: 'adv-002-solaris',
    canonicalName: 'Solaris Home Energy Group',
    status: 'ACTIVE',
    externalAdLibraryId: 'meta-ad-7741290',
    activeAdCount: 14,
    observedDaysCount: 90,
    primaryDestinationUrl: 'https://solarishomeenergy.com/rebate-calculator',
    registrableDomain: 'solarishomeenergy.com',
    verificationStatus: 'SUCCESS',
    verificationEvidenceCount: 5,
    hasSsl: true,
    hasOpenDom: true,
    qualificationState: 'QUALIFIED',
    score: 91.0,
    confidence: 'HIGH',
    activeBlockers: [],
    scoringModelVersion: 'MODEL-V1-BALANCED',
    lastCalculatedAt: '2026-09-16T01:45:00Z',
    auditTrailCount: 22,
    provenanceHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  },
  {
    advertiserId: 'adv-003-omni',
    canonicalName: 'OmniChannel Direct B2B',
    status: 'ACTIVE',
    externalAdLibraryId: 'meta-ad-4410294',
    activeAdCount: 3,
    observedDaysCount: 12,
    primaryDestinationUrl: 'https://omnichannelb2b.io/catalog',
    registrableDomain: 'omnichannelb2b.io',
    verificationStatus: 'SUCCESS',
    verificationEvidenceCount: 3,
    hasSsl: true,
    hasOpenDom: true,
    qualificationState: 'NEEDS_REVIEW',
    score: 54.0,
    confidence: 'MEDIUM',
    activeBlockers: [],
    scoringModelVersion: 'MODEL-V1-BALANCED',
    lastCalculatedAt: '2026-09-16T02:00:00Z',
    auditTrailCount: 8,
    provenanceHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
  },
  {
    advertiserId: 'adv-004-rapid',
    canonicalName: 'RapidCash 247 Loans',
    status: 'ACTIVE',
    externalAdLibraryId: 'meta-ad-1192843',
    activeAdCount: 2,
    observedDaysCount: 4,
    primaryDestinationUrl: 'http://rapidcash247.ru/apply',
    registrableDomain: 'rapidcash247.ru',
    verificationStatus: 'FAILED',
    verificationEvidenceCount: 2,
    hasSsl: false,
    hasOpenDom: false,
    qualificationState: 'BLOCKED',
    score: 0.0,
    confidence: 'HIGH',
    activeBlockers: ['BLOCKER-02-NO-TLS', 'BLOCKER-05-SECURITY-FLAG'],
    scoringModelVersion: 'MODEL-V1-BALANCED',
    lastCalculatedAt: '2026-09-16T02:10:00Z',
    auditTrailCount: 6,
    provenanceHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
  }
];

export const SAMPLE_PROVENANCE_GRAPH: ProvenanceLineageGraph = {
  rootObservationId: 'obs-9812-raw-dom',
  advertiserId: 'adv-001-apex',
  nodes: [
    {
      id: 'obs-9812-raw-dom',
      label: 'Meta Ad Library Observation',
      layer: 'A_OBSERVATION',
      table: 'source_observation',
      timestamp: '2026-09-15T18:24:12Z',
      summary: 'Raw public HTML card extracted for Meta ID 9823411',
      status: 'VALID',
      details: {
        workerId: 'worker-node-us-east-04',
        adapterVersion: 'v2.4.0',
        rawPayloadHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        validationStatus: 'VALID'
      }
    },
    {
      id: 'field-101-title',
      label: 'Token: Advertiser Name',
      layer: 'A_OBSERVATION',
      table: 'raw_observation_field',
      timestamp: '2026-09-15T18:24:12Z',
      summary: 'CSS: div[role="heading"] -> "Apex Legal Partners LLC"',
      status: 'VALID',
      details: {
        rawString: 'Apex Legal Partners LLC',
        confidence: 0.995,
        selector: 'div[role="heading"] > span'
      }
    },
    {
      id: 'field-102-url',
      label: 'Token: Destination URL',
      layer: 'A_OBSERVATION',
      table: 'raw_observation_field',
      timestamp: '2026-09-15T18:24:12Z',
      summary: 'CSS: a[data-lynx-mode] -> "https://apexlegalpartners.com/commercial"',
      status: 'VALID',
      details: {
        rawString: 'https://apexlegalpartners.com/commercial',
        confidence: 0.98,
        selector: 'a[target="_blank"][rel*="nofollow"]'
      }
    },
    {
      id: 'canon-obs-501',
      label: 'Canonical Observation',
      layer: 'A_OBSERVATION',
      table: 'canonical_observation',
      timestamp: '2026-09-15T18:24:13Z',
      summary: 'Normalized brand "apex legal partners" & domain "apexlegalpartners.com"',
      status: 'VALID',
      details: {
        normalizationVersion: 'norm-v1.8',
        registrableDomain: 'apexlegalpartners.com',
        hostname: 'apexlegalpartners.com'
      }
    },
    {
      id: 'adv-001-apex',
      label: 'Canonical Advertiser',
      layer: 'B_CANONICAL',
      table: 'advertiser',
      timestamp: '2026-09-15T18:24:14Z',
      summary: 'Authoritative Entity: Apex Legal Partners LLC (ACTIVE)',
      status: 'VALID',
      details: {
        resolutionVersion: 'res-v2.1',
        firstSeenAt: '2026-08-04T12:00:00Z',
        lastSeenAt: '2026-09-15T18:24:14Z'
      }
    },
    {
      id: 'ident-link-88',
      label: 'Active Identity Link',
      layer: 'C_IDENTITY',
      table: 'advertiser_identity_link',
      timestamp: '2026-09-15T18:24:15Z',
      summary: 'Linked to Corporate Entity "Apex Legal Group Holding"',
      status: 'VALID',
      details: {
        confidenceScore: 0.965,
        relationshipType: 'DIRECT_OWNERSHIP',
        ruleVersion: 'rule-id-v3'
      }
    },
    {
      id: 'verif-run-902',
      label: 'Verification Probe Run',
      layer: 'D_VERIFICATION',
      table: 'verification_run',
      timestamp: '2026-09-15T18:25:01Z',
      summary: 'HTTP 200 OK, TLS 1.3 Active, SSRF Safe, Latency 182ms',
      status: 'VALID',
      details: {
        statusCode: 200,
        tlsVersion: 'TLSv1.3',
        isSsrfSafe: true,
        egressIp: '34.120.44.19',
        dnsResolvedIps: ['104.21.72.191', '172.67.188.42']
      }
    },
    {
      id: 'snap-4001',
      label: 'Evidence Snapshot (Frozen)',
      layer: 'E_QUALIFICATION',
      table: 'scoring_evidence_snapshot',
      timestamp: '2026-09-16T01:29:58Z',
      summary: 'Content-addressable JSON payload frozen at calculation time',
      status: 'VALID',
      details: {
        snapshotHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        activeAds: 8,
        domainVerified: true
      }
    },
    {
      id: 'score-res-772',
      label: 'Scoring Result & Qualification',
      layer: 'E_QUALIFICATION',
      table: 'scoring_result',
      timestamp: '2026-09-16T01:30:00Z',
      summary: 'QUALIFIED | Score: 87.5 / 100.0 | Confidence: HIGH',
      status: 'VALID',
      details: {
        modelVersion: 'MODEL-V1-BALANCED',
        activeBlockers: [],
        totalScore: 87.5,
        confidence: 'HIGH'
      }
    }
  ],
  edges: [
    { fromId: 'obs-9812-raw-dom', toId: 'field-101-title', relationshipType: 'EXTRACTED_FIELD' },
    { fromId: 'obs-9812-raw-dom', toId: 'field-102-url', relationshipType: 'EXTRACTED_FIELD' },
    { fromId: 'obs-9812-raw-dom', toId: 'canon-obs-501', relationshipType: 'NORMALIZED_INTO', ruleVersion: 'norm-v1.8' },
    { fromId: 'canon-obs-501', toId: 'adv-001-apex', relationshipType: 'RESOLVED_ENTITY', ruleVersion: 'res-v2.1' },
    { fromId: 'adv-001-apex', toId: 'ident-link-88', relationshipType: 'IDENTITY_MAPPED', confidence: '0.965' },
    { fromId: 'canon-obs-501', toId: 'verif-run-902', relationshipType: 'PROBED_DESTINATION' },
    { fromId: 'verif-run-902', toId: 'snap-4001', relationshipType: 'INCORPORATED_EVIDENCE' },
    { fromId: 'adv-001-apex', toId: 'snap-4001', relationshipType: 'FROZEN_ATTRIBUTES' },
    { fromId: 'snap-4001', toId: 'score-res-772', relationshipType: 'EVALUATED_SCORE', ruleVersion: 'MODEL-V1-BALANCED' }
  ]
};

export const PHASE_08_HANDOFF_PAYLOAD = {
  phase: 'PHASE_07',
  targetConsumerPhase: 'PHASE_08',
  title: 'PostgreSQL Persistence, Data Model, Provenance, and Auditability Specification Handoff',
  generatedAt: '2026-09-16T02:25:00Z',
  status: 'AUDITED_AND_VERIFIED',
  auditSummary: {
    totalCriteria: 33,
    passedCriteria: 33,
    compliancePercentage: 100.0,
    zeroSilentOverwrites: true,
    immutableLedgersEnforced: true,
    referentialIntegrityEnforced: true,
    reversibilityVerified: true
  },
  databaseTopology: {
    engine: 'PostgreSQL 16+',
    totalLayers: 8,
    totalTables: 32,
    layerDistribution: {
      A_OBSERVATION: 4,
      B_CANONICAL: 6,
      C_IDENTITY: 5,
      D_VERIFICATION: 4,
      E_QUALIFICATION: 7,
      F_EXECUTION: 6,
      G_AUDIT: 2,
      H_EXPORT: 2
    },
    primaryKeyStrategy: 'UUIDv7 for domain/ledger tables; BIGINT GENERATED ALWAYS AS IDENTITY for high-density child tables',
    concurrencyControl: 'Row-level locking (SELECT FOR UPDATE) + Optimistic updated_at revision tokens',
    idempotencyModel: 'Domain-specific natural composite keys with ON CONFLICT DO NOTHING / UPDATE'
  },
  migrationManifest: [
    '001_foundation_and_enums',
    '002_source_observations',
    '003_canonical_entities',
    '004_identity_and_relationships',
    '005_verification_evidence',
    '006_qualification_and_scoring',
    '007_execution_and_checkpoints',
    '008_audit_views_and_reporting'
  ],
  authoritativeReadViews: [
    {
      viewName: 'v_lead_research_current',
      purpose: 'Flattened current-state lead research records for Phase 08 UI and export pipelines',
      readModelInterface: 'LeadResearchReadModel',
      performanceProfile: 'Indexed via idx_scoring_latest_state and idx_verif_run_domain_recent'
    }
  ],
  consumerGuarantees: [
    'Phase 08 can safely stream millions of rows from v_lead_research_current with zero lock contention against active scrapers.',
    'Every lead record exposes a cryptographic provenance hash enabling instant 1-click drilldown into raw HTML evidence tokens.',
    'Any historical score modification is auditable through append-only manual_override records with reviewer identity.',
    'Entity splits preserve complete observation and verification histories without data loss.'
  ]
};
