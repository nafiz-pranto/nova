/**
 * PHASE 25 — PRODUCT TELEMETRY, USAGE INTELLIGENCE, INSTRUMENTATION GOVERNANCE,
 * PRODUCT ANALYTICS & CAPACITY INTELLIGENCE ENGINE
 * 
 * Strict architectural boundaries:
 * - Preserves Phase 14 Research Analytics, Phase 17 Policy Invariants, Phase 18 Multi-Tenant Isolation,
 *   Phase 19 Collaboration, Phase 20 Search Discovery, Phase 21 Evidence & Reproducibility,
 *   Phase 22 Continuous Monitoring, Phase 23 Governance & Audit, Phase 24 Production Operations.
 * - Non-negotiables:
 *   - NEVER treats product telemetry as security audit or legal evidence.
 *   - NEVER bypasses tenant isolation; client-supplied tenant context is never trusted.
 *   - NEVER collects passwords, tokens, API keys, cookies, private notes, or raw keystrokes.
 *   - Search telemetry stores query type/filter usage/result counts, never sensitive raw queries.
 *   - Individual telemetry NEVER becomes employee ranking or behavioral grading.
 *   - Missing telemetry is NEVER treated as zero usage (ZERO_ACTIVITY vs NO_DATA).
 *   - Implements 18 Phase 25 Reliability, Security & Privacy Invariants (INVARIANT-25-001 to INVARIANT-25-018).
 */

import { TenantContext } from './phase18MultiTenantEngine';

// ============================================================
// 1. DOMAIN ENUMS & TYPES
// ============================================================

export type TelemetrySource = 
  | 'WEB_APP' 
  | 'BROWSER_EXTENSION' 
  | 'BACKEND_API' 
  | 'WORKFLOW_ENGINE' 
  | 'BROWSER_WORKER' 
  | 'SYSTEM_SERVICE';

export type ActorType = 'USER' | 'SERVICE' | 'SYSTEM' | 'WORKFLOW' | 'AUTOMATION';

export type EventClassification = 
  | 'PUBLIC_PRODUCT_METRIC' 
  | 'TENANT_INTERNAL' 
  | 'USER_ACTIVITY' 
  | 'OPERATIONAL_BRIDGE' 
  | 'PRIVACY_SENSITIVE';

export type DeliveryGuarantee = 'AT_MOST_ONCE' | 'AT_LEAST_ONCE' | 'EFFECTIVELY_ONCE';

export type EventImportance = 'BEST_EFFORT' | 'IMPORTANT' | 'CRITICAL';

export type DataAvailabilityStatus = 
  | 'AVAILABLE' 
  | 'ZERO_ACTIVITY' 
  | 'NO_DATA' 
  | 'DATA_LAGGING' 
  | 'CALCULATION_FAILED' 
  | 'NOT_AVAILABLE';

export type FeatureLifecycle = 
  | 'PLANNED' 
  | 'DEVELOPING' 
  | 'EXPERIMENTAL' 
  | 'ACTIVE' 
  | 'DEPRECATED' 
  | 'RETIRED';

export type FunnelWindowType = 
  | 'SAME_SESSION' 
  | 'SAME_DAY' 
  | 'SEVEN_DAYS' 
  | 'THIRTY_DAYS' 
  | 'SAME_RESEARCH_SESSION';

export type TelemetryIncidentType = 
  | 'TELEMETRY_INGESTION_FAILURE'
  | 'SCHEMA_REGRESSION'
  | 'EVENT_LOSS'
  | 'DUPLICATE_EVENT_SPIKE'
  | 'EVENT_SPOOFING'
  | 'ANALYTICS_LAG'
  | 'METRIC_CORRUPTION'
  | 'PRIVACY_VIOLATION'
  | 'CROSS_TENANT_ANALYTICS_LEAK';

// ============================================================
// 2. CANONICAL PRODUCT EVENT & CONTEXT
// ============================================================

export interface ActorContext {
  actorId: string; // Opaque pseudonymized identifier
  actorType: ActorType;
  organizationId: string;
  tenantId: string;
  workspaceId?: string;
  projectId?: string;
  teamId?: string;
  role: string;
}

export interface SessionContext {
  sessionId: string; // Opaque product session ID (not auth token)
  sessionStartedAt: string;
  deviceClass: 'DESKTOP' | 'TABLET' | 'MOBILE' | 'HEADLESS_AGENT';
  clientVersion: string;
  appVersion: string;
  locale: string;
}

export interface EntityContext {
  entityType?: 'ADVERTISER' | 'AD' | 'CAMPAIGN' | 'WATCHLIST' | 'RESEARCH_SESSION' | 'TASK' | 'WORKFLOW' | 'EXPORT';
  entityIdMasked?: string; // Hashed or opaque identifier
}

export interface FeatureContext {
  featureId: string;
  featureFlagKey?: string;
  featureVersion: string;
  variant?: string;
}

export interface ProductEvent {
  eventId: string; // UUID v4 for idempotent deduplication
  eventName: string; // e.g. 'search.executed', 'workflow.completed'
  eventVersion: string; // semver e.g. '1.0.0'
  schemaVersion: string; // schema registry format version
  occurredAt: string; // Client/source timestamp (ISO-8601)
  receivedAt: string; // Ingestion pipeline receipt timestamp (ISO-8601)
  processedAt?: string; // Aggregator ingestion timestamp
  source: TelemetrySource;
  importance: EventImportance;
  actorContext: ActorContext;
  tenantContext: {
    tenantId: string;
    organizationId: string;
    environment: 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
    isAuthoritative: boolean; // Server-validated tenant match
  };
  sessionContext: SessionContext;
  surface: string; // e.g. '/research/search', '/workflows/dag', '/exports'
  entityContext?: EntityContext;
  featureContext?: FeatureContext;
  properties: Record<string, string | number | boolean | null>;
  correlationId?: string;
  requestId?: string;
  sampleRate: number; // 1.0 = 100%, 0.1 = 10%
}

// ============================================================
// 3. SCHEMA REGISTRY & INSTRUMENTATION CATALOG
// ============================================================

export interface EventSchema {
  schemaId: string;
  eventName: string;
  version: string;
  owner: 'SEARCH' | 'RESEARCH' | 'WORKFLOW' | 'MONITORING' | 'COLLABORATION' | 'EXPORT' | 'PLATFORM';
  purpose: string;
  classification: EventClassification;
  requiredProperties: string[];
  optionalProperties: string[];
  prohibitedProperties: string[];
  retentionDays: number;
  defaultSampleRate: number;
  isActive: boolean;
  killSwitchActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstrumentationCatalogEntry {
  catalogId: string;
  featureName: string;
  userAction: string;
  eventName: string;
  schemaVersion: string;
  source: TelemetrySource;
  destinationDashboard: string;
  governanceApproved: boolean;
  coverageStatus: 'VERIFIED' | 'PARTIAL' | 'UNINSTRUMENTED' | 'REGRESSED';
  emittedPerDayEstimate: number;
  lastObservedAt: string;
}

// ============================================================
// 4. FEATURE LIFECYCLE & ADOPTION
// ============================================================

export interface FeatureRecord {
  featureId: string;
  name: string;
  owner: string;
  lifecycle: FeatureLifecycle;
  rolloutPercentage: number;
  eligibleTenantsCount: number;
  exposedTenantsCount: number;
  activelyUsingTenantsCount: number;
  eligibleUsersCount: number;
  exposedUsersCount: number;
  activelyUsingUsersCount: number;
  adoptionRate: number; // activelyUsing / eligible
  exposureRate: number; // exposed / eligible
  usageIntensity: number; // avg events per active user/week
  primaryEvent: string;
  documentationUrl: string;
}

// ============================================================
// 5. FUNNEL ARCHITECTURE
// ============================================================

export interface FunnelStep {
  stepIndex: number;
  stepName: string;
  requiredEvent: string;
  stepFilter?: Record<string, string | number | boolean>;
  conversionCount: number;
  dropOffCount: number;
  conversionRateFromPrevious: number;
  conversionRateFromStart: number;
  medianDurationFromPreviousSec: number;
}

export interface FunnelDefinition {
  funnelId: string;
  name: string;
  version: string;
  windowType: FunnelWindowType;
  windowDurationSec: number;
  targetPopulation: string;
  steps: FunnelStep[];
  overallConversionRate: number;
  totalStarted: number;
  totalCompleted: number;
}

// ============================================================
// 6. METRIC DEFINITIONS & AGGREGATES
// ============================================================

export interface MetricDefinition {
  metricId: string;
  name: string;
  version: string;
  category: 'USAGE' | 'ADOPTION' | 'PERFORMANCE' | 'CAPACITY' | 'DATA_QUALITY';
  description: string;
  sourceEvents: string[];
  population: string;
  numeratorDescription: string;
  denominatorDescription?: string;
  aggregationType: 'COUNT' | 'DISTINCT_COUNT' | 'SUM' | 'AVG' | 'PERCENTILE_95' | 'RATE';
  timeWindow: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  scope: 'PLATFORM' | 'TENANT' | 'WORKSPACE' | 'USER_OWN';
  samplingAdjustmentApplied: boolean;
  freshnessSlaMinutes: number;
}

export interface MetricAggregate {
  aggregateId: string;
  metricId: string;
  metricVersion: string;
  periodStart: string;
  periodEnd: string;
  tenantId?: string; // If null, platform-wide aggregate
  workspaceId?: string;
  calculatedValue: number;
  status: DataAvailabilityStatus;
  sampleCount: number;
  effectiveSampleRate: number;
  calculatedAt: string;
  isPreliminary: boolean; // True if late-arrival backfill pending
}

// ============================================================
// 7. CAPACITY INTELLIGENCE & QUOTA
// ============================================================

export interface CapacityMetric {
  resourceDimension: 'BROWSER_WORKER_DEMAND' | 'STORAGE_GROWTH_GB' | 'SEARCH_THROUGHPUT_QPS' | 'QUEUE_BACKLOG' | 'EXPORT_PIPELINE_LOAD' | 'TELEMETRY_INGESTION_RATE';
  currentObserved: number;
  unit: string;
  historicalP95: number;
  peakHistorical: number;
  dailyGrowthRatePercent: number;
  capacityThreshold: number;
  projectedDaysToThreshold: number; // Based on observed linear trend
  confidenceIntervalPercent: number;
  status: 'OPTIMAL' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  assumptions: string;
}

// ============================================================
// 8. TELEMETRY QUALITY & QUARANTINE
// ============================================================

export interface TelemetryRejection {
  rejectionId: string;
  timestamp: string;
  source: TelemetrySource;
  tenantIdAttempted?: string;
  reason: 
    | 'UNKNOWN_EVENT_SCHEMA' 
    | 'UNSUPPORTED_VERSION' 
    | 'MISSING_REQUIRED_PROPERTY' 
    | 'PROHIBITED_SENSITIVE_PROPERTY' 
    | 'TENANT_MISMATCH' 
    | 'INVALID_TIMESTAMP' 
    | 'OVERSIZED_PAYLOAD'
    | 'KILL_SWITCH_ACTIVE';
  details: string;
  rawPayloadSnippet: string;
  quarantined: boolean;
}

export interface TelemetryIncidentRecord {
  incidentId: string;
  incidentType: TelemetryIncidentType;
  severity: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  detectedAt: string;
  status: 'INVESTIGATING' | 'CONTAINED' | 'MITIGATED' | 'RESOLVED';
  affectedFeatureOrEvent: string;
  rootCauseSummary: string;
  containmentAction: string;
  reconciliationRequired: boolean;
}

// ============================================================
// 9. PHASE 25 SECURITY & PRIVACY INVARIANTS
// ============================================================

export interface TelemetryInvariantStatus {
  id: string;
  title: string;
  description: string;
  category: 'PRIVACY' | 'SECURITY' | 'DATA_INTEGRITY' | 'TENANT_ISOLATION' | 'BOUNDARIES';
  isEnforced: boolean;
  auditEvidence: string;
}

export const PLATFORM_INVARIANTS_25: TelemetryInvariantStatus[] = [
  {
    id: 'INVARIANT-25-001',
    title: 'Non-Authoritative Authorization Source',
    description: 'Product telemetry is not a security authorization source. Telemetry presence or absence cannot grant permissions.',
    category: 'SECURITY',
    isEnforced: true,
    auditEvidence: 'Auth policies evaluate database RBAC/TenantContext exclusively; telemetry records are write-only to auth engines.'
  },
  {
    id: 'INVARIANT-25-002',
    title: 'Tenant Isolation Immutability',
    description: 'Product telemetry does not bypass tenant isolation. Cross-tenant raw event queries are strictly rejected by query router.',
    category: 'TENANT_ISOLATION',
    isEnforced: true,
    auditEvidence: 'All analytics queries enforce WHERE tenant_id = context.tenant_id with prepared statements and row-level filtering.'
  },
  {
    id: 'INVARIANT-25-003',
    title: 'Untrusted Client Context',
    description: 'Client-provided tenant context is never trusted. Ingestion layer resolves authoritative tenant context from server session.',
    category: 'SECURITY',
    isEnforced: true,
    auditEvidence: 'Ingestion pipeline overwrites payload tenant_id with verified JWT/session token claims before database write.'
  },
  {
    id: 'INVARIANT-25-004',
    title: 'Secret Collection Blockade',
    description: 'Secrets (passwords, tokens, cookies, auth headers, private keys) are never intentionally collected; proactively rejected.',
    category: 'PRIVACY',
    isEnforced: true,
    auditEvidence: 'Sensitive property scanner rejects payloads matching regex patterns for JWT, Bearer, Passwords, API Keys.'
  },
  {
    id: 'INVARIANT-25-005',
    title: 'No Raw User Content by Default',
    description: 'Raw private user content (notes, comments, hypotheses, evidence text) is not collected by default; only action metadata.',
    category: 'PRIVACY',
    isEnforced: true,
    auditEvidence: 'Payload schema restricts inputs to boolean/numeric dimensions and enum codes; freeform string bodies are prohibited.'
  },
  {
    id: 'INVARIANT-25-006',
    title: 'Search Query Privacy',
    description: 'Search telemetry does not become covert search-history surveillance. Only query mode, filter count, latency, and bucketed counts are stored.',
    category: 'PRIVACY',
    isEnforced: true,
    auditEvidence: 'search.executed schema omits raw search terms; records only search_type, filters_count, result_count_bucket, and latency_ms.'
  },
  {
    id: 'INVARIANT-25-007',
    title: 'No Individual Employee Performance Scoring',
    description: 'Individual telemetry is never automatically converted into employee rankings, productivity grades, or worker surveillance scores.',
    category: 'PRIVACY',
    isEnforced: true,
    auditEvidence: 'Platform analytics views aggregate user activity by team or workspace; no individual velocity/ranking metrics exist.'
  },
  {
    id: 'INVARIANT-25-008',
    title: 'No Fabricated Business Outcome Claims',
    description: 'Telemetry measures observed UI interactions and does not claim business outcome causation, revenue generation, or intent.',
    category: 'DATA_INTEGRITY',
    isEnforced: true,
    auditEvidence: 'Dashboards use descriptive terminology (Observed Actions, Drop-offs) and include explicit methodology disclaimers.'
  },
  {
    id: 'INVARIANT-25-009',
    title: 'Explicit Metric Semantics',
    description: 'Every metric must define its population, time window, scope, numerator, and denominator. Ambiguous metrics are banned.',
    category: 'DATA_INTEGRITY',
    isEnforced: true,
    auditEvidence: 'MetricCatalog enforces typed definitions with mandatory population and denominator contracts before publishing.'
  },
  {
    id: 'INVARIANT-25-010',
    title: 'Distinct Zero vs No-Data Semantics',
    description: 'Missing telemetry is never treated as zero usage. The system explicitly distinguishes ZERO_ACTIVITY from NO_DATA / LAG.',
    category: 'DATA_INTEGRITY',
    isEnforced: true,
    auditEvidence: 'Metric aggregates store typed status enum; missing collection intervals display "NO_DATA (Pipeline Lag)" in UI.'
  },
  {
    id: 'INVARIANT-25-011',
    title: 'Sampling Transparency',
    description: 'Sampled data must be explicitly marked as sampled with recorded sample rates. Calculations normalize denominators accordingly.',
    category: 'DATA_INTEGRITY',
    isEnforced: true,
    auditEvidence: 'Aggregate records preserve effective_sample_rate; charts display sampling badges when rate < 1.0.'
  },
  {
    id: 'INVARIANT-25-012',
    title: 'Versioned Metric Semantics',
    description: 'Historical metric definitions remain versioned. Metric changes increment version and preserve historical interpretability.',
    category: 'DATA_INTEGRITY',
    isEnforced: true,
    auditEvidence: 'Metric aggregates reference metric_version; schema updates do not retroactively rewrite historical calculation records.'
  },
  {
    id: 'INVARIANT-25-013',
    title: 'Cross-Tenant Analytics Block',
    description: 'Cross-tenant analytics queries are denied unless initiated under platform admin privilege with aggregated k-anonymity (>=5).',
    category: 'TENANT_ISOLATION',
    isEnforced: true,
    auditEvidence: 'Platform-level aggregates enforce k-anonymity threshold (minimum 5 tenants per cohort) to prevent inferential leakage.'
  },
  {
    id: 'INVARIANT-25-014',
    title: 'Restricted Raw Telemetry Access',
    description: 'Raw telemetry access requires elevated developer/admin authorization and explicit purpose justification beyond standard dashboards.',
    category: 'SECURITY',
    isEnforced: true,
    auditEvidence: 'Raw event inspector is gated by P25_RAW_TELEMETRY_INSPECT permission; query actions emit Phase 23 audit log entries.'
  },
  {
    id: 'INVARIANT-25-015',
    title: 'Non-Blocking Telemetry Ingestion',
    description: 'Telemetry pipeline failures or network latency cannot corrupt or block core user workflows or database transactions.',
    category: 'BOUNDARIES',
    isEnforced: true,
    auditEvidence: 'Frontend SDK uses navigator.sendBeacon and asynchronous in-memory queues with retry limits; failures fail silently to user.'
  },
  {
    id: 'INVARIANT-25-016',
    title: 'Schema Registry Governance',
    description: 'All emitted events must be registered in the EventSchema Registry. Unregistered event names are quarantined immediately.',
    category: 'DATA_INTEGRITY',
    isEnforced: true,
    auditEvidence: 'Ingestion pipeline validates eventName against active SchemaRegistry table; unknown events route to quarantine queue.'
  },
  {
    id: 'INVARIANT-25-017',
    title: 'Immutable Security & Safety Invariants',
    description: 'Telemetry configuration or experimentation hooks cannot disable Phase 17/18/19/21/23 safety controls or Meta access bounds.',
    category: 'SECURITY',
    isEnforced: true,
    auditEvidence: 'Experiment framework enforces safety invariant checks; variant assignments cannot override auth or rate-limiting guards.'
  },
  {
    id: 'INVARIANT-25-018',
    title: 'Strict Observability Separation',
    description: 'Product telemetry is completely separate from security audit logs (P23) and system operational telemetry (P24).',
    category: 'BOUNDARIES',
    isEnforced: true,
    auditEvidence: 'Separate storage tables (product_events vs audit_events vs system_metrics); distinct retention and access models.'
  }
];

// ============================================================
// 10. INITIAL SEED FIXTURES: SCHEMAS, CATALOG, FEATURES, METRICS
// ============================================================

export const INITIAL_EVENT_SCHEMAS: EventSchema[] = [
  {
    schemaId: 'sch-001',
    eventName: 'search.executed',
    version: '1.2.0',
    owner: 'SEARCH',
    purpose: 'Measures search execution frequency, query mode, filter count, and latency for performance correlation.',
    classification: 'TENANT_INTERNAL',
    requiredProperties: ['search_mode', 'filters_applied_count', 'latency_ms', 'result_count_bucket'],
    optionalProperties: ['has_date_filter', 'has_country_filter', 'entity_type_target'],
    prohibitedProperties: ['raw_query_text', 'user_email', 'auth_token'],
    retentionDays: 90,
    defaultSampleRate: 1.0,
    isActive: true,
    killSwitchActive: false,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z'
  },
  {
    schemaId: 'sch-002',
    eventName: 'research.session.created',
    version: '1.0.0',
    owner: 'RESEARCH',
    purpose: 'Tracks initiation of research investigations and lead qualification workflows.',
    classification: 'TENANT_INTERNAL',
    requiredProperties: ['investigation_type', 'initial_entity_type'],
    optionalProperties: ['origin_surface', 'source_search_id'],
    prohibitedProperties: ['hypothesis_text', 'private_notes'],
    retentionDays: 180,
    defaultSampleRate: 1.0,
    isActive: true,
    killSwitchActive: false,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    schemaId: 'sch-003',
    eventName: 'workflow.completed',
    version: '1.1.0',
    owner: 'WORKFLOW',
    purpose: 'Records successful completion of multi-step extraction, verification, or scoring workflows.',
    classification: 'TENANT_INTERNAL',
    requiredProperties: ['workflow_type', 'duration_ms', 'step_count', 'terminal_status'],
    optionalProperties: ['retry_count', 'parallel_branch_count'],
    prohibitedProperties: ['scraped_raw_html', 'credentials'],
    retentionDays: 180,
    defaultSampleRate: 1.0,
    isActive: true,
    killSwitchActive: false,
    createdAt: '2026-03-05T00:00:00Z',
    updatedAt: '2026-07-20T00:00:00Z'
  },
  {
    schemaId: 'sch-004',
    eventName: 'monitoring.watch.created',
    version: '1.0.0',
    owner: 'MONITORING',
    purpose: 'Measures continuous monitoring adoption and advertiser tracking intensity.',
    classification: 'TENANT_INTERNAL',
    requiredProperties: ['frequency_hours', 'alert_channel_type', 'criteria_mode'],
    optionalProperties: ['has_creative_hash_rule', 'has_spend_spike_rule'],
    prohibitedProperties: ['webhook_secret', 'slack_token'],
    retentionDays: 180,
    defaultSampleRate: 1.0,
    isActive: true,
    killSwitchActive: false,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z'
  },
  {
    schemaId: 'sch-005',
    eventName: 'export.downloaded',
    version: '1.0.0',
    owner: 'EXPORT',
    purpose: 'Tracks data export formats, generation latency, and payload size buckets.',
    classification: 'TENANT_INTERNAL',
    requiredProperties: ['export_format', 'row_count_bucket', 'generation_duration_ms'],
    optionalProperties: ['sanitization_applied', 'compression_used'],
    prohibitedProperties: ['file_content', 'download_url_with_token'],
    retentionDays: 90,
    defaultSampleRate: 1.0,
    isActive: true,
    killSwitchActive: false,
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z'
  },
  {
    schemaId: 'sch-006',
    eventName: 'task.completed',
    version: '1.0.0',
    owner: 'COLLABORATION',
    purpose: 'Measures team collaboration task throughput without worker ranking.',
    classification: 'TENANT_INTERNAL',
    requiredProperties: ['task_type', 'duration_open_hours_bucket', 'had_review_step'],
    optionalProperties: ['priority_level', 'attachment_count'],
    prohibitedProperties: ['comment_body', 'worker_rating'],
    retentionDays: 180,
    defaultSampleRate: 1.0,
    isActive: true,
    killSwitchActive: false,
    createdAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-04-15T00:00:00Z'
  },
  {
    schemaId: 'sch-007',
    eventName: 'feature.interacted',
    version: '1.0.0',
    owner: 'PLATFORM',
    purpose: 'Standard feature exposure and adoption event emitted upon intentional user interactions.',
    classification: 'TENANT_INTERNAL',
    requiredProperties: ['feature_id', 'interaction_type'],
    optionalProperties: ['surface_section', 'time_on_page_sec'],
    prohibitedProperties: ['input_values', 'keystrokes'],
    retentionDays: 60,
    defaultSampleRate: 0.5,
    isActive: true,
    killSwitchActive: false,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  }
];

export const INITIAL_INSTRUMENTATION_CATALOG: InstrumentationCatalogEntry[] = [
  {
    catalogId: 'cat-01',
    featureName: 'Advanced Search & Discovery',
    userAction: 'Executes boolean / faceted search in Query Studio',
    eventName: 'search.executed',
    schemaVersion: '1.2.0',
    source: 'WEB_APP',
    destinationDashboard: 'Search Usage & Latency Dashboard',
    governanceApproved: true,
    coverageStatus: 'VERIFIED',
    emittedPerDayEstimate: 14200,
    lastObservedAt: '2026-09-17T04:58:12Z'
  },
  {
    catalogId: 'cat-02',
    featureName: 'Investigation Dossier',
    userAction: 'Initializes new investigation session from lead candidate',
    eventName: 'research.session.created',
    schemaVersion: '1.0.0',
    source: 'WEB_APP',
    destinationDashboard: 'Research Funnel & Activation Dashboard',
    governanceApproved: true,
    coverageStatus: 'VERIFIED',
    emittedPerDayEstimate: 1850,
    lastObservedAt: '2026-09-17T05:01:44Z'
  },
  {
    catalogId: 'cat-03',
    featureName: 'Automated DAG Pipeline',
    userAction: 'Background pipeline completes extraction, verification and scoring',
    eventName: 'workflow.completed',
    schemaVersion: '1.1.0',
    source: 'WORKFLOW_ENGINE',
    destinationDashboard: 'Workflow Reliability & Drop-off Dashboard',
    governanceApproved: true,
    coverageStatus: 'VERIFIED',
    emittedPerDayEstimate: 4300,
    lastObservedAt: '2026-09-17T05:03:02Z'
  },
  {
    catalogId: 'cat-04',
    featureName: 'Continuous Monitoring Watchlists',
    userAction: 'Creates recurring anomaly detection watch for brand/entity',
    eventName: 'monitoring.watch.created',
    schemaVersion: '1.0.0',
    source: 'WEB_APP',
    destinationDashboard: 'Continuous Monitoring Adoption Dashboard',
    governanceApproved: true,
    coverageStatus: 'VERIFIED',
    emittedPerDayEstimate: 320,
    lastObservedAt: '2026-09-17T04:45:10Z'
  },
  {
    catalogId: 'cat-05',
    featureName: 'Sanitized Export Studio',
    userAction: 'Downloads sanitized CSV, Parquet, or JSON archive',
    eventName: 'export.downloaded',
    schemaVersion: '1.0.0',
    source: 'WEB_APP',
    destinationDashboard: 'Export Pipeline & Data Output Dashboard',
    governanceApproved: true,
    coverageStatus: 'VERIFIED',
    emittedPerDayEstimate: 980,
    lastObservedAt: '2026-09-17T04:52:19Z'
  },
  {
    catalogId: 'cat-06',
    featureName: 'Evidence Vault Inspector',
    userAction: 'Views cryptographic provenance hash or snapshot manifest',
    eventName: 'feature.interacted',
    schemaVersion: '1.0.0',
    source: 'WEB_APP',
    destinationDashboard: 'Governance & Evidence Inspection Dashboard',
    governanceApproved: true,
    coverageStatus: 'PARTIAL',
    emittedPerDayEstimate: 650,
    lastObservedAt: '2026-09-17T03:30:15Z'
  }
];

export const INITIAL_FEATURES: FeatureRecord[] = [
  {
    featureId: 'feat-discovery-search',
    name: 'Advanced Search & Cross-Entity Discovery',
    owner: 'Search & Indexing Pod',
    lifecycle: 'ACTIVE',
    rolloutPercentage: 100,
    eligibleTenantsCount: 48,
    exposedTenantsCount: 48,
    activelyUsingTenantsCount: 44,
    eligibleUsersCount: 320,
    exposedUsersCount: 310,
    activelyUsingUsersCount: 265,
    adoptionRate: 0.828,
    exposureRate: 0.968,
    usageIntensity: 53.6,
    primaryEvent: 'search.executed',
    documentationUrl: '/docs/features/search-discovery'
  },
  {
    featureId: 'feat-monitoring-watchlists',
    name: 'Continuous Change Intelligence & Watchlists',
    owner: 'Monitoring & Event Pod',
    lifecycle: 'ACTIVE',
    rolloutPercentage: 100,
    eligibleTenantsCount: 48,
    exposedTenantsCount: 46,
    activelyUsingTenantsCount: 38,
    eligibleUsersCount: 320,
    exposedUsersCount: 280,
    activelyUsingUsersCount: 195,
    adoptionRate: 0.609,
    exposureRate: 0.875,
    usageIntensity: 12.4,
    primaryEvent: 'monitoring.watch.created',
    documentationUrl: '/docs/features/continuous-monitoring'
  },
  {
    featureId: 'feat-workflow-automation',
    name: 'Multi-Step DAG Research Workflows',
    owner: 'Workflow Engine Pod',
    lifecycle: 'ACTIVE',
    rolloutPercentage: 100,
    eligibleTenantsCount: 48,
    exposedTenantsCount: 45,
    activelyUsingTenantsCount: 41,
    eligibleUsersCount: 320,
    exposedUsersCount: 295,
    activelyUsingUsersCount: 220,
    adoptionRate: 0.687,
    exposureRate: 0.921,
    usageIntensity: 19.5,
    primaryEvent: 'workflow.completed',
    documentationUrl: '/docs/features/workflow-dag'
  },
  {
    featureId: 'feat-evidence-provenance',
    name: 'Reproducible Research & Evidence Vault',
    owner: 'Security & Trust Pod',
    lifecycle: 'ACTIVE',
    rolloutPercentage: 100,
    eligibleTenantsCount: 48,
    exposedTenantsCount: 42,
    activelyUsingTenantsCount: 29,
    eligibleUsersCount: 320,
    exposedUsersCount: 210,
    activelyUsingUsersCount: 135,
    adoptionRate: 0.421,
    exposureRate: 0.656,
    usageIntensity: 4.8,
    primaryEvent: 'feature.interacted',
    documentationUrl: '/docs/features/evidence-vault'
  },
  {
    featureId: 'feat-smart-scoring-v2',
    name: 'Multi-Attribute Qualification Scorer V2',
    owner: 'Data Science Pod',
    lifecycle: 'EXPERIMENTAL',
    rolloutPercentage: 35,
    eligibleTenantsCount: 48,
    exposedTenantsCount: 17,
    activelyUsingTenantsCount: 12,
    eligibleUsersCount: 320,
    exposedUsersCount: 112,
    activelyUsingUsersCount: 78,
    adoptionRate: 0.243,
    exposureRate: 0.350,
    usageIntensity: 15.2,
    primaryEvent: 'feature.interacted',
    documentationUrl: '/docs/features/scoring-v2'
  }
];

export const INITIAL_RESEARCH_FUNNEL: FunnelDefinition = {
  funnelId: 'fnl-research-to-export',
  name: 'Core Lead Qualification to Export Funnel',
  version: '2.1.0',
  windowType: 'SAME_RESEARCH_SESSION',
  windowDurationSec: 86400,
  targetPopulation: 'All authenticated research users with active project leases',
  totalStarted: 1250,
  totalCompleted: 685,
  overallConversionRate: 0.548,
  steps: [
    {
      stepIndex: 1,
      stepName: '1. Execute Search Query',
      requiredEvent: 'search.executed',
      conversionCount: 1250,
      dropOffCount: 115,
      conversionRateFromPrevious: 1.0,
      conversionRateFromStart: 1.0,
      medianDurationFromPreviousSec: 0
    },
    {
      stepIndex: 2,
      stepName: '2. Open Entity Dossier',
      requiredEvent: 'feature.interacted',
      stepFilter: { interaction_type: 'OPEN_DOSSIER' },
      conversionCount: 1135,
      dropOffCount: 180,
      conversionRateFromPrevious: 0.908,
      conversionRateFromStart: 0.908,
      medianDurationFromPreviousSec: 42
    },
    {
      stepIndex: 3,
      stepName: '3. Initialize Research Session',
      requiredEvent: 'research.session.created',
      conversionCount: 955,
      dropOffCount: 110,
      conversionRateFromPrevious: 0.841,
      conversionRateFromStart: 0.764,
      medianDurationFromPreviousSec: 128
    },
    {
      stepIndex: 4,
      stepName: '4. Complete Qualification Workflow',
      requiredEvent: 'workflow.completed',
      conversionCount: 845,
      dropOffCount: 90,
      conversionRateFromPrevious: 0.885,
      conversionRateFromStart: 0.676,
      medianDurationFromPreviousSec: 310
    },
    {
      stepIndex: 5,
      stepName: '5. Complete Review & Sign-off',
      requiredEvent: 'task.completed',
      stepFilter: { task_type: 'LEAD_REVIEW' },
      conversionCount: 755,
      dropOffCount: 70,
      conversionRateFromPrevious: 0.893,
      conversionRateFromStart: 0.604,
      medianDurationFromPreviousSec: 480
    },
    {
      stepIndex: 6,
      stepName: '6. Download Sanitized Export',
      requiredEvent: 'export.downloaded',
      conversionCount: 685,
      dropOffCount: 0,
      conversionRateFromPrevious: 0.907,
      conversionRateFromStart: 0.548,
      medianDurationFromPreviousSec: 185
    }
  ]
};

export const INITIAL_CAPACITY_METRICS: CapacityMetric[] = [
  {
    resourceDimension: 'BROWSER_WORKER_DEMAND',
    currentObserved: 18.4,
    unit: 'concurrent headless worker instances',
    historicalP95: 28.0,
    peakHistorical: 34.0,
    dailyGrowthRatePercent: 1.4,
    capacityThreshold: 45.0,
    projectedDaysToThreshold: 62,
    confidenceIntervalPercent: 92,
    status: 'OPTIMAL',
    assumptions: 'Based on rolling 30-day scheduled crawl cadence and current tenant job quotas.'
  },
  {
    resourceDimension: 'SEARCH_THROUGHPUT_QPS',
    currentObserved: 42.6,
    unit: 'queries per second',
    historicalP95: 78.5,
    peakHistorical: 112.0,
    dailyGrowthRatePercent: 2.1,
    capacityThreshold: 150.0,
    projectedDaysToThreshold: 48,
    confidenceIntervalPercent: 88,
    status: 'OPTIMAL',
    assumptions: 'PostgreSQL trigram & GIN index capacity with 4 read-replicas.'
  },
  {
    resourceDimension: 'STORAGE_GROWTH_GB',
    currentObserved: 642.0,
    unit: 'gigabytes stored',
    historicalP95: 610.0,
    peakHistorical: 642.0,
    dailyGrowthRatePercent: 0.8,
    capacityThreshold: 1200.0,
    projectedDaysToThreshold: 85,
    confidenceIntervalPercent: 95,
    status: 'OPTIMAL',
    assumptions: 'Reflects JSONB snapshot deduplication with 90-day cold-tier tiering.'
  },
  {
    resourceDimension: 'TELEMETRY_INGESTION_RATE',
    currentObserved: 285.0,
    unit: 'events / minute',
    historicalP95: 580.0,
    peakHistorical: 820.0,
    dailyGrowthRatePercent: 3.2,
    capacityThreshold: 3000.0,
    projectedDaysToThreshold: 110,
    confidenceIntervalPercent: 90,
    status: 'OPTIMAL',
    assumptions: 'Ingestion pipeline with micro-batching buffer and asynchronous worker pool.'
  }
];

export const INITIAL_METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    metricId: 'met-dau-tenant',
    name: 'Daily Active Research Users (DAU)',
    version: '1.0.0',
    category: 'USAGE',
    description: 'Count of unique authenticated users with at least 1 intentional research event within a calendar day UTC.',
    sourceEvents: ['search.executed', 'research.session.created', 'task.completed', 'export.downloaded'],
    population: 'All authenticated tenant members',
    numeratorDescription: 'Unique pseudonymous actor IDs with recorded interaction events in period',
    denominatorDescription: 'Not applicable (Count metric)',
    aggregationType: 'DISTINCT_COUNT',
    timeWindow: 'DAILY',
    scope: 'TENANT',
    samplingAdjustmentApplied: false,
    freshnessSlaMinutes: 15
  },
  {
    metricId: 'met-search-zero-result-rate',
    name: 'Search Zero-Result Rate',
    version: '1.1.0',
    category: 'PERFORMANCE',
    description: 'Proportion of search executions yielding zero results, indicating keyword mismatch or indexing delay.',
    sourceEvents: ['search.executed'],
    population: 'All executed searches in Query Studio',
    numeratorDescription: 'Count of search.executed events where result_count_bucket == "0"',
    denominatorDescription: 'Total search.executed events in period',
    aggregationType: 'RATE',
    timeWindow: 'HOURLY',
    scope: 'PLATFORM',
    samplingAdjustmentApplied: false,
    freshnessSlaMinutes: 5
  },
  {
    metricId: 'met-workflow-completion-rate',
    name: 'Workflow Pipeline Completion Rate',
    version: '1.0.0',
    category: 'ADOPTION',
    description: 'Percentage of initiated research workflows reaching SUCCEEDED terminal state within SLA.',
    sourceEvents: ['workflow.completed'],
    population: 'All initiated workflow jobs',
    numeratorDescription: 'workflow.completed events with terminal_status == "SUCCEEDED"',
    denominatorDescription: 'Total workflow runs dispatched',
    aggregationType: 'RATE',
    timeWindow: 'DAILY',
    scope: 'TENANT',
    samplingAdjustmentApplied: false,
    freshnessSlaMinutes: 10
  }
];

export const SAMPLE_RAW_PRODUCT_EVENTS: ProductEvent[] = [
  {
    eventId: 'evt-9a81-001',
    eventName: 'search.executed',
    eventVersion: '1.2.0',
    schemaVersion: '1.0.0',
    occurredAt: '2026-09-17T05:01:10.120Z',
    receivedAt: '2026-09-17T05:01:10.350Z',
    source: 'WEB_APP',
    importance: 'IMPORTANT',
    actorContext: {
      actorId: 'usr-hash-88f2',
      actorType: 'USER',
      organizationId: 'org-acme-corp',
      tenantId: 'tenant-apex-analytics',
      workspaceId: 'ws-fintech-eur',
      role: 'SENIOR_RESEARCHER'
    },
    tenantContext: {
      tenantId: 'tenant-apex-analytics',
      organizationId: 'org-acme-corp',
      environment: 'PRODUCTION',
      isAuthoritative: true
    },
    sessionContext: {
      sessionId: 'ses-48a0-bb21',
      sessionStartedAt: '2026-09-17T04:30:00.000Z',
      deviceClass: 'DESKTOP',
      clientVersion: '2.4.0',
      appVersion: '16.0.0',
      locale: 'en-US'
    },
    surface: '/research/search',
    properties: {
      search_mode: 'FACETED_BOOLEAN',
      filters_applied_count: 3,
      latency_ms: 184,
      result_count_bucket: '50_TO_200',
      has_country_filter: true
    },
    correlationId: 'cor-search-88214',
    sampleRate: 1.0
  },
  {
    eventId: 'evt-9a81-002',
    eventName: 'research.session.created',
    eventVersion: '1.0.0',
    schemaVersion: '1.0.0',
    occurredAt: '2026-09-17T05:02:18.410Z',
    receivedAt: '2026-09-17T05:02:18.620Z',
    source: 'WEB_APP',
    importance: 'IMPORTANT',
    actorContext: {
      actorId: 'usr-hash-88f2',
      actorType: 'USER',
      organizationId: 'org-acme-corp',
      tenantId: 'tenant-apex-analytics',
      workspaceId: 'ws-fintech-eur',
      role: 'SENIOR_RESEARCHER'
    },
    tenantContext: {
      tenantId: 'tenant-apex-analytics',
      organizationId: 'org-acme-corp',
      environment: 'PRODUCTION',
      isAuthoritative: true
    },
    sessionContext: {
      sessionId: 'ses-48a0-bb21',
      sessionStartedAt: '2026-09-17T04:30:00.000Z',
      deviceClass: 'DESKTOP',
      clientVersion: '2.4.0',
      appVersion: '16.0.0',
      locale: 'en-US'
    },
    surface: '/research/advertisers',
    properties: {
      investigation_type: 'DEEP_LEAD_QUALIFICATION',
      initial_entity_type: 'ADVERTISER'
    },
    correlationId: 'cor-sess-99104',
    sampleRate: 1.0
  },
  {
    eventId: 'evt-9a81-003',
    eventName: 'workflow.completed',
    eventVersion: '1.1.0',
    schemaVersion: '1.0.0',
    occurredAt: '2026-09-17T05:03:00.000Z',
    receivedAt: '2026-09-17T05:03:00.120Z',
    source: 'WORKFLOW_ENGINE',
    importance: 'CRITICAL',
    actorContext: {
      actorId: 'svc-workflow-daemon',
      actorType: 'WORKFLOW',
      organizationId: 'org-acme-corp',
      tenantId: 'tenant-apex-analytics',
      workspaceId: 'ws-fintech-eur',
      role: 'SYSTEM_DAEMON'
    },
    tenantContext: {
      tenantId: 'tenant-apex-analytics',
      organizationId: 'org-acme-corp',
      environment: 'PRODUCTION',
      isAuthoritative: true
    },
    sessionContext: {
      sessionId: 'ses-sys-workflow-daemon',
      sessionStartedAt: '2026-09-17T00:00:00.000Z',
      deviceClass: 'HEADLESS_AGENT',
      clientVersion: '1.0.0',
      appVersion: '16.0.0',
      locale: 'en-US'
    },
    surface: '/engine/dag',
    properties: {
      workflow_type: 'FULL_VERIFICATION_AND_SCORE',
      duration_ms: 1420,
      step_count: 4,
      terminal_status: 'SUCCEEDED',
      retry_count: 0
    },
    correlationId: 'cor-wf-55210',
    sampleRate: 1.0
  },
  {
    eventId: 'evt-9a81-004',
    eventName: 'monitoring.watch.created',
    eventVersion: '1.0.0',
    schemaVersion: '1.0.0',
    occurredAt: '2026-09-17T05:03:45.890Z',
    receivedAt: '2026-09-17T05:03:46.105Z',
    source: 'WEB_APP',
    importance: 'IMPORTANT',
    actorContext: {
      actorId: 'usr-hash-33c9',
      actorType: 'USER',
      organizationId: 'org-beacon-group',
      tenantId: 'tenant-beacon-research',
      workspaceId: 'ws-ecommerce-us',
      role: 'LEAD_INVESTIGATOR'
    },
    tenantContext: {
      tenantId: 'tenant-beacon-research',
      organizationId: 'org-beacon-group',
      environment: 'PRODUCTION',
      isAuthoritative: true
    },
    sessionContext: {
      sessionId: 'ses-99d1-aa34',
      sessionStartedAt: '2026-09-17T04:10:00.000Z',
      deviceClass: 'DESKTOP',
      clientVersion: '2.4.0',
      appVersion: '16.0.0',
      locale: 'en-US'
    },
    surface: '/monitoring/watchlists',
    properties: {
      frequency_hours: 6,
      alert_channel_type: 'IN_APP_AND_EMAIL',
      criteria_mode: 'NEW_CREATIVE_DETECTED'
    },
    correlationId: 'cor-mon-12001',
    sampleRate: 1.0
  },
  {
    eventId: 'evt-9a81-005',
    eventName: 'export.downloaded',
    eventVersion: '1.0.0',
    schemaVersion: '1.0.0',
    occurredAt: '2026-09-17T05:04:12.300Z',
    receivedAt: '2026-09-17T05:04:12.510Z',
    source: 'WEB_APP',
    importance: 'IMPORTANT',
    actorContext: {
      actorId: 'usr-hash-88f2',
      actorType: 'USER',
      organizationId: 'org-acme-corp',
      tenantId: 'tenant-apex-analytics',
      workspaceId: 'ws-fintech-eur',
      role: 'SENIOR_RESEARCHER'
    },
    tenantContext: {
      tenantId: 'tenant-apex-analytics',
      organizationId: 'org-acme-corp',
      environment: 'PRODUCTION',
      isAuthoritative: true
    },
    sessionContext: {
      sessionId: 'ses-48a0-bb21',
      sessionStartedAt: '2026-09-17T04:30:00.000Z',
      deviceClass: 'DESKTOP',
      clientVersion: '2.4.0',
      appVersion: '16.0.0',
      locale: 'en-US'
    },
    surface: '/exports',
    properties: {
      export_format: 'PARQUET_SANITIZED',
      row_count_bucket: '1K_TO_5K',
      generation_duration_ms: 840
    },
    correlationId: 'cor-exp-33890',
    sampleRate: 1.0
  }
];

export const SAMPLE_QUARANTINED_REJECTIONS: TelemetryRejection[] = [
  {
    rejectionId: 'rej-2026-09-01',
    timestamp: '2026-09-17T04:12:33Z',
    source: 'WEB_APP',
    tenantIdAttempted: 'tenant-apex-analytics',
    reason: 'PROHIBITED_SENSITIVE_PROPERTY',
    details: 'Payload contained prohibited key "password" or "auth_token". Blocked by PII/Secret Scanner.',
    rawPayloadSnippet: '{"eventName":"user.login","properties":{"token":"ey...redacted"}}',
    quarantined: true
  },
  {
    rejectionId: 'rej-2026-09-02',
    timestamp: '2026-09-17T04:25:10Z',
    source: 'BROWSER_EXTENSION',
    tenantIdAttempted: 'tenant-unauthorized-01',
    reason: 'TENANT_MISMATCH',
    details: 'Client attempted to declare tenant_id differing from authoritative session token claim.',
    rawPayloadSnippet: '{"declared_tenant":"tenant-apex-analytics","authoritative":"tenant-unauthorized-01"}',
    quarantined: true
  },
  {
    rejectionId: 'rej-2026-09-03',
    timestamp: '2026-09-17T04:40:02Z',
    source: 'WEB_APP',
    tenantIdAttempted: 'tenant-beacon-research',
    reason: 'UNKNOWN_EVENT_SCHEMA',
    details: 'Event "user.keystroke.captured" is not registered in Schema Registry. Banned telemetry pattern.',
    rawPayloadSnippet: '{"eventName":"user.keystroke.captured","properties":{"key":"enter"}}',
    quarantined: true
  }
];

export const INITIAL_TELEMETRY_INCIDENTS: TelemetryIncidentRecord[] = [
  {
    incidentId: 'inc-tel-01',
    incidentType: 'SCHEMA_REGRESSION',
    severity: 'P3_MEDIUM',
    detectedAt: '2026-09-15T11:20:00Z',
    status: 'RESOLVED',
    affectedFeatureOrEvent: 'search.executed (v1.1 -> v1.2)',
    rootCauseSummary: 'Frontend release 2.3.9 omitted required property "latency_ms" on initial mount.',
    containmentAction: 'Patched frontend SDK to guarantee latency measurement fallback; backfilled missing bucket values.',
    reconciliationRequired: false
  },
  {
    incidentId: 'inc-tel-02',
    incidentType: 'DUPLICATE_EVENT_SPIKE',
    severity: 'P4_LOW',
    detectedAt: '2026-09-16T08:15:00Z',
    status: 'RESOLVED',
    affectedFeatureOrEvent: 'export.downloaded',
    rootCauseSummary: 'Double click on download button without frontend button debounce emitted twin event IDs.',
    containmentAction: 'Idempotency deduplicator filtered 14 duplicates by eventId; added button lock in UI.',
    reconciliationRequired: false
  }
];

// ============================================================
// 11. IN-MEMORY TELEMETRY CONTROLLER & CLIENT SDK SIMULATOR
// ============================================================

export class Phase25TelemetryEngine {
  private events: ProductEvent[] = [...SAMPLE_RAW_PRODUCT_EVENTS];
  private schemas: EventSchema[] = [...INITIAL_EVENT_SCHEMAS];
  private catalog: InstrumentationCatalogEntry[] = [...INITIAL_INSTRUMENTATION_CATALOG];
  private features: FeatureRecord[] = [...INITIAL_FEATURES];
  private funnels: FunnelDefinition[] = [{ ...INITIAL_RESEARCH_FUNNEL }];
  private capacityMetrics: CapacityMetric[] = [...INITIAL_CAPACITY_METRICS];
  private rejections: TelemetryRejection[] = [...SAMPLE_QUARANTINED_REJECTIONS];
  private incidents: TelemetryIncidentRecord[] = [...INITIAL_TELEMETRY_INCIDENTS];
  private invariants: TelemetryInvariantStatus[] = [...PLATFORM_INVARIANTS_25];
  private deduplicationCache = new Set<string>();

  constructor() {
    this.events.forEach(e => this.deduplicationCache.add(e.eventId));
  }

  // Authoritative server-side ingestion pipeline
  public ingestEvent(
    rawEvent: Partial<ProductEvent>,
    authoritativeTenant: string,
    authoritativeOrg: string
  ): { success: boolean; eventId?: string; error?: string } {
    const eventName = rawEvent.eventName;
    if (!eventName) {
      this.recordRejection('UNKNOWN_EVENT_SCHEMA', 'Missing eventName', rawEvent);
      return { success: false, error: 'Missing eventName' };
    }

    // 1. Schema check
    const schema = this.schemas.find(s => s.eventName === eventName);
    if (!schema) {
      this.recordRejection('UNKNOWN_EVENT_SCHEMA', `Event ${eventName} not in Schema Registry`, rawEvent);
      return { success: false, error: `Event ${eventName} is unregistered` };
    }

    // 2. Kill switch check
    if (schema.killSwitchActive || !schema.isActive) {
      this.recordRejection('KILL_SWITCH_ACTIVE', `Event ${eventName} kill-switch is active`, rawEvent);
      return { success: false, error: 'Event kill-switch active' };
    }

    // 3. Prohibited property check (Secrets / PII / Raw text)
    const props = rawEvent.properties || {};
    const prohibitedFound = Object.keys(props).find(key => 
      schema.prohibitedProperties.includes(key) ||
      ['password', 'token', 'auth', 'cookie', 'secret', 'keystroke', 'raw_query_text', 'private_notes'].some(bad => key.toLowerCase().includes(bad))
    );

    if (prohibitedFound) {
      this.recordRejection(
        'PROHIBITED_SENSITIVE_PROPERTY',
        `Prohibited sensitive property detected: ${prohibitedFound}`,
        rawEvent
      );
      return { success: false, error: `Prohibited property: ${prohibitedFound}` };
    }

    // 4. Required property check
    for (const reqProp of schema.requiredProperties) {
      if (props[reqProp] === undefined || props[reqProp] === null) {
        this.recordRejection('MISSING_REQUIRED_PROPERTY', `Missing required property: ${reqProp}`, rawEvent);
        return { success: false, error: `Missing required property: ${reqProp}` };
      }
    }

    // 5. Idempotent Deduplication Check
    const eventId = rawEvent.eventId || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    if (this.deduplicationCache.has(eventId)) {
      return { success: true, eventId, error: 'Duplicate event discarded silently' };
    }

    // 6. Overwrite with Authoritative Tenant Context (INVARIANT-25-003)
    const validatedEvent: ProductEvent = {
      eventId,
      eventName,
      eventVersion: schema.version,
      schemaVersion: '1.0.0',
      occurredAt: rawEvent.occurredAt || new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      source: rawEvent.source || 'WEB_APP',
      importance: rawEvent.importance || 'IMPORTANT',
      actorContext: {
        actorId: rawEvent.actorContext?.actorId || 'usr-anon-sim',
        actorType: rawEvent.actorContext?.actorType || 'USER',
        organizationId: authoritativeOrg,
        tenantId: authoritativeTenant,
        workspaceId: rawEvent.actorContext?.workspaceId || 'ws-default',
        role: rawEvent.actorContext?.role || 'RESEARCHER'
      },
      tenantContext: {
        tenantId: authoritativeTenant,
        organizationId: authoritativeOrg,
        environment: 'PRODUCTION',
        isAuthoritative: true
      },
      sessionContext: {
        sessionId: rawEvent.sessionContext?.sessionId || `ses-sim-${Date.now()}`,
        sessionStartedAt: new Date().toISOString(),
        deviceClass: 'DESKTOP',
        clientVersion: '2.4.0',
        appVersion: '16.0.0',
        locale: 'en-US'
      },
      surface: rawEvent.surface || '/research',
      properties: props,
      sampleRate: schema.defaultSampleRate
    };

    this.deduplicationCache.add(eventId);
    this.events.unshift(validatedEvent);
    if (this.events.length > 200) this.events.pop();

    return { success: true, eventId };
  }

  private recordRejection(reason: TelemetryRejection['reason'], details: string, payload: any) {
    const rej: TelemetryRejection = {
      rejectionId: `rej-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      source: payload.source || 'WEB_APP',
      tenantIdAttempted: payload.tenantContext?.tenantId || 'unknown',
      reason,
      details,
      rawPayloadSnippet: JSON.stringify(payload).substring(0, 150),
      quarantined: true
    };
    this.rejections.unshift(rej);
    if (this.rejections.length > 50) this.rejections.pop();
  }

  // Toggle schema kill switch
  public toggleSchemaKillSwitch(schemaId: string): boolean {
    const sch = this.schemas.find(s => s.schemaId === schemaId);
    if (sch) {
      sch.killSwitchActive = !sch.killSwitchActive;
      return sch.killSwitchActive;
    }
    return false;
  }

  // Public accessors
  public getEvents(tenantId?: string): ProductEvent[] {
    if (tenantId) {
      return this.events.filter(e => e.tenantContext.tenantId === tenantId);
    }
    return [...this.events];
  }

  public getSchemas(): EventSchema[] {
    return [...this.schemas];
  }

  public getCatalog(): InstrumentationCatalogEntry[] {
    return [...this.catalog];
  }

  public getFeatures(): FeatureRecord[] {
    return [...this.features];
  }

  public getFunnel(): FunnelDefinition {
    return { ...this.funnels[0] };
  }

  public getCapacityMetrics(): CapacityMetric[] {
    return [...this.capacityMetrics];
  }

  public getRejections(): TelemetryRejection[] {
    return [...this.rejections];
  }

  public getIncidents(): TelemetryIncidentRecord[] {
    return [...this.incidents];
  }

  public getInvariants(): TelemetryInvariantStatus[] {
    return [...this.invariants];
  }

  public getTenantMetricsSummary(tenantId?: string) {
    const evts = this.getEvents(tenantId);
    const searches = evts.filter(e => e.eventName === 'search.executed').length;
    const researchSessions = evts.filter(e => e.eventName === 'research.session.created').length;
    const workflows = evts.filter(e => e.eventName === 'workflow.completed').length;
    const monitoringWatches = evts.filter(e => e.eventName === 'monitoring.watch.created').length;
    const exports = evts.filter(e => e.eventName === 'export.downloaded').length;

    return {
      totalEvents: evts.length,
      searches,
      researchSessions,
      workflows,
      monitoringWatches,
      exports,
      uniqueUsers: new Set(evts.map(e => e.actorContext.actorId)).size,
      rejectionRatePercent: this.rejections.length > 0 ? ((this.rejections.length / (evts.length + this.rejections.length)) * 100).toFixed(1) : '0.0'
    };
  }
}

// Global Singleton for Phase 25 Control Plane Engine
export const phase25TelemetryEngine = new Phase25TelemetryEngine();
