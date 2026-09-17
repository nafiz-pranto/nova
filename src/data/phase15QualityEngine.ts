/**
 * PHASE 15 — DATA QUALITY, GOVERNANCE, LINEAGE & CORRECTION DATA LAYER
 * Enforces field-level quality rules, quarantine, reproducible lineage, 
 * schema drift tracking, and immutable corrections.
 */

export type QualityDimension =
  | 'COMPLETENESS'
  | 'VALIDITY'
  | 'CONSISTENCY'
  | 'EVIDENCE_AGREEMENT'
  | 'FRESHNESS'
  | 'UNIQUENESS'
  | 'PROVENANCE_COVERAGE'
  | 'SCHEMA_COMPATIBILITY'
  | 'AVAILABILITY';

export type QualitySeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'BLOCKING';

export type ValueState =
  | 'OBSERVED'
  | 'NORMALIZED'
  | 'DERIVED'
  | 'INFERRED'
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'UNKNOWN'
  | 'MISSING'
  | 'NOT_APPLICABLE'
  | 'INVALID'
  | 'CONFLICTED'
  | 'STALE'
  | 'QUARANTINED'
  | 'CORRECTED'
  | 'SUPERSEDED'
  | 'REDACTED';

export interface DataQualityRule {
  ruleId: string;
  version: string;
  name: string;
  description: string;
  dimension: QualityDimension;
  severity: QualitySeverity;
  targetEntity: string;
  targetField: string;
  quarantinePolicy: 'NONE' | 'REVIEW_REQUIRED' | 'AUTO_QUARANTINE';
  isActive: boolean;
}

export interface DataQualityIncident {
  incidentId: string;
  ruleId: string;
  entityId: string;
  entityType: string;
  field: string;
  observedValue: any;
  severity: QualitySeverity;
  detectedAt: string;
  status: 'OPEN' | 'INVESTIGATING' | 'REPAIR_PENDING' | 'RESOLVED' | 'IGNORED';
  resolution?: string;
  downstreamImpact: string[];
}

export interface QuarantineRecord {
  quarantineId: string;
  entityId: string;
  entityType: string;
  reason: string;
  failedRules: string[];
  severity: QualitySeverity;
  detectedAt: string;
  originalPayloadRef: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'REPAIR_PENDING' | 'REPROCESSING' | 'RESOLVED' | 'REJECTED' | 'EXPIRED';
  repairEligibility: 'MANUAL_ONLY' | 'DETERMINISTIC_SAFE' | 'NOT_REPAIRABLE';
}

export interface CorrectionRecord {
  correctionId: string;
  entityId: string;
  field: string;
  originalValueRef: string;
  originalValue: any;
  proposedValue: any;
  reason: string;
  evidenceRef: string;
  actor: string;
  timestamp: string;
  status: 'PROPOSED' | 'VALIDATING' | 'APPROVED' | 'APPLIED' | 'REJECTED';
  version: number;
}

export interface DataLineageNode {
  nodeId: string;
  nodeType: 'RAW_OBSERVATION' | 'EXTRACTED_FIELD' | 'NORMALIZED_FIELD' | 'CANONICAL_ENTITY' | 'VERIFICATION_RESULT' | 'ANALYTICS_METRIC' | 'EXPORT_ARTIFACT';
  label: string;
  version: string;
  timestamp: string;
  provenanceStatus: 'COMPLETE' | 'PARTIAL' | 'MISSING';
  qualityState: ValueState[];
}

export interface DataLineageEdge {
  sourceId: string;
  targetId: string;
  transformationRule: string;
}

export interface SchemaDefinition {
  schemaId: string;
  version: string;
  entityName: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'DEPRECATED' | 'RETIRED';
  fields: Array<{ name: string; type: string; isNullable: boolean; isSensitive: boolean }>;
  compatibility: 'NON_BREAKING' | 'RISKY' | 'BREAKING' | 'UNKNOWN';
  effectiveDate: string;
}

export interface SchemaDriftEvent {
  eventId: string;
  detectedAt: string;
  sourceTarget: string;
  driftType: 'SELECTOR_CHANGE' | 'FIELD_MISSING' | 'FORMAT_CHANGE' | 'PAGINATION_CHANGE';
  description: string;
  impactAssessment: 'PENDING' | 'ADAPTER_UPDATE_REQUIRED' | 'NON_BREAKING';
}

export interface DataHealthMetric {
  metricId: string;
  name: string;
  numerator: number;
  denominator: number;
  rate: number;
  dimension: QualityDimension;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// ============================================================
// FIXTURES
// ============================================================

export const SAMPLE_QUALITY_RULES: DataQualityRule[] = [
  {
    ruleId: 'qr_adv_domain_001',
    version: '1.2.0',
    name: 'Canonical Domain Format Verification',
    description: 'Ensures advertiser landing URL resolves to a valid second-level domain without tracking parameters.',
    dimension: 'VALIDITY',
    severity: 'ERROR',
    targetEntity: 'Advertiser',
    targetField: 'landing_url',
    quarantinePolicy: 'AUTO_QUARANTINE',
    isActive: true
  },
  {
    ruleId: 'qr_adv_id_002',
    version: '1.0.0',
    name: 'Source ID Immutability Check',
    description: 'Source advertiser IDs must never change across sequential observations.',
    dimension: 'CONSISTENCY',
    severity: 'CRITICAL',
    targetEntity: 'Advertiser',
    targetField: 'source_advertiser_id',
    quarantinePolicy: 'REVIEW_REQUIRED',
    isActive: true
  },
  {
    ruleId: 'qr_prov_003',
    version: '2.1.0',
    name: 'Provenance Coverage Enforcement',
    description: 'Derived metrics must link back to at least one valid raw observation ID.',
    dimension: 'PROVENANCE_COVERAGE',
    severity: 'BLOCKING',
    targetEntity: 'AnalyticsMetric',
    targetField: 'provenance_refs',
    quarantinePolicy: 'AUTO_QUARANTINE',
    isActive: true
  }
];

export const SAMPLE_QUALITY_INCIDENTS: DataQualityIncident[] = [
  {
    incidentId: 'inc_20260916_001',
    ruleId: 'qr_adv_domain_001',
    entityId: 'adv_solar_apex_tx',
    entityType: 'Advertiser',
    field: 'landing_url',
    observedValue: 'https://apex-solar.com/tracker?ref=meta&clickid=null',
    severity: 'ERROR',
    detectedAt: '2026-09-16T08:14:00Z',
    status: 'OPEN',
    downstreamImpact: ['verification_queue_blocked', 'qualification_stalled']
  },
  {
    incidentId: 'inc_20260915_042',
    ruleId: 'qr_prov_003',
    entityId: 'metric_daily_ads',
    entityType: 'AnalyticsMetric',
    field: 'provenance_refs',
    observedValue: '[]',
    severity: 'BLOCKING',
    detectedAt: '2026-09-15T23:59:00Z',
    status: 'REPAIR_PENDING',
    downstreamImpact: ['daily_dashboard_export']
  }
];

export const SAMPLE_QUARANTINE_RECORDS: QuarantineRecord[] = [
  {
    quarantineId: 'qtz_88291',
    entityId: 'adv_solar_apex_tx',
    entityType: 'Advertiser',
    reason: 'Malformed destination domain prevents safe TLS/SSRF probing',
    failedRules: ['qr_adv_domain_001'],
    severity: 'ERROR',
    detectedAt: '2026-09-16T08:14:05Z',
    originalPayloadRef: 'blob://raw_obs/batch_991/obs_82',
    status: 'OPEN',
    repairEligibility: 'DETERMINISTIC_SAFE'
  }
];

export const SAMPLE_CORRECTIONS: CorrectionRecord[] = [
  {
    correctionId: 'corr_5519',
    entityId: 'adv_solar_apex_tx',
    field: 'landing_url',
    originalValueRef: 'blob://raw_obs/batch_991/obs_82#landing_url',
    originalValue: 'https://apex-solar.com/tracker?ref=meta&clickid=null',
    proposedValue: 'https://apex-solar.com',
    reason: 'Deterministic parameter stripping via canonicalization policy P-04',
    evidenceRef: 'policy_doc://normalization/P-04',
    actor: 'system:normalization_daemon',
    timestamp: '2026-09-16T08:20:00Z',
    status: 'PROPOSED',
    version: 1
  }
];

export const SAMPLE_SCHEMA_DRIFT_EVENTS: SchemaDriftEvent[] = [
  {
    eventId: 'sde_meta_ui_0915',
    detectedAt: '2026-09-15T14:30:00Z',
    sourceTarget: 'Meta Ad Library - Advertiser Info Card',
    driftType: 'SELECTOR_CHANGE',
    description: 'CSS selector for "About this Page" section changed from .x193iq5w to .x2b8uid. Location metadata missing in 40% of observations.',
    impactAssessment: 'ADAPTER_UPDATE_REQUIRED'
  }
];

export const SAMPLE_HEALTH_METRICS: DataHealthMetric[] = [
  { metricId: 'hm_complete', name: 'Field Completeness Rate', numerator: 48900, denominator: 50000, rate: 97.8, dimension: 'COMPLETENESS', trend: 'STABLE' },
  { metricId: 'hm_valid', name: 'Validation Pass Rate', numerator: 47500, denominator: 50000, rate: 95.0, dimension: 'VALIDITY', trend: 'DOWN' },
  { metricId: 'hm_prov', name: 'Provenance Coverage', numerator: 50000, denominator: 50000, rate: 100.0, dimension: 'PROVENANCE_COVERAGE', trend: 'STABLE' },
  { metricId: 'hm_fresh', name: 'Freshness SLA Compliance', numerator: 45000, denominator: 50000, rate: 90.0, dimension: 'FRESHNESS', trend: 'UP' }
];

export const SAMPLE_LINEAGE_NODES: DataLineageNode[] = [
  { nodeId: 'node_raw_110', nodeType: 'RAW_OBSERVATION', label: 'Raw Ad Library Payload', version: 'v1', timestamp: '2026-09-16T08:00:00Z', provenanceStatus: 'COMPLETE', qualityState: ['OBSERVED'] },
  { nodeId: 'node_ext_110', nodeType: 'EXTRACTED_FIELD', label: 'Extracted URL String', version: 'v1', timestamp: '2026-09-16T08:00:05Z', provenanceStatus: 'COMPLETE', qualityState: ['INVALID', 'QUARANTINED'] },
  { nodeId: 'node_norm_110', nodeType: 'NORMALIZED_FIELD', label: 'Cleaned Domain URL', version: 'v2', timestamp: '2026-09-16T08:22:00Z', provenanceStatus: 'COMPLETE', qualityState: ['NORMALIZED', 'CORRECTED'] },
  { nodeId: 'node_can_110', nodeType: 'CANONICAL_ENTITY', label: 'Canonical Advertiser Identity', version: 'v3', timestamp: '2026-09-16T08:22:05Z', provenanceStatus: 'COMPLETE', qualityState: ['VERIFIED'] }
];

export const SAMPLE_LINEAGE_EDGES: DataLineageEdge[] = [
  { sourceId: 'node_raw_110', targetId: 'node_ext_110', transformationRule: 'Phase03_RegexExtractor_v1.2' },
  { sourceId: 'node_ext_110', targetId: 'node_norm_110', transformationRule: 'Phase15_Correction_corr_5519' },
  { sourceId: 'node_norm_110', targetId: 'node_can_110', transformationRule: 'Phase04_IdentityResolution_v2.0' }
];
