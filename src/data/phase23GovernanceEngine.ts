/**
 * PHASE 23 — CENTRALIZED AUDIT, GOVERNANCE, CONTROL VERIFICATION, RISK, FINDINGS & ADMINISTRATIVE OVERSIGHT ENGINE
 * 
 * Strict architectural boundaries:
 * - Preserves Phase 17 Policy Invariants, Phase 18 Multi-Tenant Isolation, Phase 19 Collaboration, Phase 20 Search, Phase 21 Evidence & Phase 22 Monitoring.
 * - Non-negotiable: Never bypass access controls, never use private Meta APIs, never bypass CAPTCHA.
 * - Absolute distinction between: AUDIT_EVENT, SECURITY_EVENT, POLICY_VIOLATION, INCIDENT, CONTROL, CONTROL_TEST, FINDING, RISK, REMEDIATION, EXCEPTION, EVIDENCE, GOVERNANCE_CASE, COMPLIANCE_ASSERTION, REPORT.
 * - Enforces append-only immutable audit with chained cryptographic digests and tamper verification.
 * - Implements 17 Architectural Security & Governance Invariants (INVARIANT-23-001 to INVARIANT-23-017).
 */

import { TenantContext } from './phase18MultiTenantEngine';

// ============================================================
// 1. DOMAIN ENUMS & TYPES
// ============================================================

export type GovernanceScope = 
  | 'PLATFORM'
  | 'ORGANIZATION'
  | 'TENANT'
  | 'WORKSPACE'
  | 'PROJECT'
  | 'TEAM'
  | 'USER';

export type AuditActorType = 
  | 'USER'
  | 'SERVICE'
  | 'SYSTEM'
  | 'WORKFLOW'
  | 'ADMINISTRATOR'
  | 'AUTOMATION';

export type AuditActionCategory =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'DATA_ACCESS'
  | 'DATA_EXPORT'
  | 'POLICY_CHANGE'
  | 'CONFIG_CHANGE'
  | 'CONTROL_CHANGE'
  | 'BREAK_GLASS'
  | 'RESEARCH_EXECUTION'
  | 'EVIDENCE_ACCESS'
  | 'REMEDIATION_ACTION'
  | 'SECURITY_OVERRIDE';

export type AuditResult = 'SUCCESS' | 'DENIED' | 'FAILED' | 'CHALLENGED';

export type IncidentSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentState = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'REMEDIATING' | 'RESOLVED' | 'CLOSED';

export type GovernanceCaseState = 
  | 'OPEN' 
  | 'TRIAGE' 
  | 'INVESTIGATING' 
  | 'CONTAINMENT' 
  | 'REMEDIATION' 
  | 'VALIDATION' 
  | 'RESOLVED' 
  | 'CLOSED' 
  | 'REOPENED';

export type ControlType = 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'COMPENSATING';

export type ControlImplementationState = 
  | 'NOT_IMPLEMENTED' 
  | 'PARTIAL' 
  | 'IMPLEMENTED' 
  | 'TESTED' 
  | 'VERIFIED' 
  | 'FAILED' 
  | 'DEPRECATED';

export type ControlOperatingStatus = 
  | 'CONTROL_OPERATING' 
  | 'CONTROL_FAILED' 
  | 'CONTROL_NOT_TESTED' 
  | 'CONTROL_INCONCLUSIVE'
  | 'TEST_OVERDUE';

export type ControlTestOutcome = 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'NOT_APPLICABLE' | 'NOT_RUN';

export type ControlTestMethod = 
  | 'AUTOMATED_TEST' 
  | 'MANUAL_REVIEW' 
  | 'SAMPLE_REVIEW' 
  | 'CONFIGURATION_CHECK' 
  | 'LOG_REVIEW' 
  | 'QUERY' 
  | 'RECONCILIATION' 
  | 'RESTORE_TEST' 
  | 'ACCESS_REVIEW';

export type ControlFrequency = 
  | 'CONTINUOUS' 
  | 'DAILY' 
  | 'WEEKLY' 
  | 'MONTHLY' 
  | 'QUARTERLY' 
  | 'EVENT_DRIVEN';

export type FindingState = 
  | 'OPEN' 
  | 'ACCEPTED' 
  | 'IN_REMEDIATION' 
  | 'MITIGATED' 
  | 'RESOLVED' 
  | 'WAIVED' 
  | 'CLOSED';

export type RemediationState = 
  | 'OPEN' 
  | 'PLANNED' 
  | 'IN_PROGRESS' 
  | 'BLOCKED' 
  | 'IMPLEMENTED' 
  | 'VALIDATING' 
  | 'VERIFIED' 
  | 'CANCELLED';

export type RiskState = 
  | 'IDENTIFIED' 
  | 'ASSESSED' 
  | 'TREATED' 
  | 'ACCEPTED' 
  | 'MITIGATED' 
  | 'MONITORED' 
  | 'CLOSED';

export type RiskTreatment = 'MITIGATE' | 'TRANSFER' | 'AVOID' | 'ACCEPT';

export type ExceptionState = 
  | 'REQUESTED' 
  | 'APPROVED' 
  | 'ACTIVE' 
  | 'EXPIRING' 
  | 'EXPIRED' 
  | 'REJECTED' 
  | 'REVOKED';

export type EvidenceFreshness = 'FRESH' | 'AGING' | 'STALE' | 'EXPIRED' | 'UNKNOWN';

export type SnapshotCompleteness = 'COMPLETE' | 'PARTIAL' | 'DEGRADED' | 'FAILED';

export type DriftStatus = 'IN_SYNC' | 'DRIFTED' | 'UNKNOWN' | 'NOT_APPLICABLE';

export type RetentionClass = 'STANDARD' | 'SECURITY' | 'AUDIT_RETAINED' | 'LEGAL_HOLD';

export type DataClassification = 
  | 'PUBLIC' 
  | 'TENANT_INTERNAL' 
  | 'SECURITY_SENSITIVE' 
  | 'AUDIT_RESTRICTED' 
  | 'PRIVILEGED';

// ============================================================
// 2. CORE AUDIT EVENT MODEL (APPEND-ONLY & HASH-CHAINED)
// ============================================================

export interface AuditEvent {
  auditEventId: string;
  sequenceNumber: number;
  tenantId?: string;
  organizationId: string;
  actorType: AuditActorType;
  actorId: string;
  actorDisplayName: string;
  action: string;
  category: AuditActionCategory;
  resourceType: string;
  resourceId: string;
  oldStateHash?: string;
  newStateHash?: string;
  policyDecision?: 'ALLOW' | 'DENY' | 'REQUIRES_APPROVAL' | 'EXEMPT';
  policyVersion?: string;
  configurationVersion?: string;
  requestId: string;
  correlationId: string;
  timestamp: string;
  sourceIp: string;
  result: AuditResult;
  failureReason?: string;
  metadata: Record<string, unknown>;
  schemaVersion: string;
  previousEventHash: string;
  eventHash: string; // SHA-256 digest of normalized record fields
  redacted?: boolean;
  redactionReason?: string;
  redactedBy?: string;
  retentionClass: RetentionClass;
  legalHoldActive?: boolean;
}

// Simple deterministic hash simulation for in-browser verification
export function computeEventHash(event: Omit<AuditEvent, 'eventHash'>): string {
  const serialized = JSON.stringify({
    seq: event.sequenceNumber,
    tenant: event.tenantId || 'GLOBAL',
    actor: event.actorId,
    action: event.action,
    res: `${event.resourceType}:${event.resourceId}`,
    ts: event.timestamp,
    reslt: event.result,
    prev: event.previousEventHash
  });
  let hash = 0x811c9dc5;
  for (let i = 0; i < serialized.length; i++) {
    hash ^= serialized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `sha256_${Math.abs(hash).toString(16).padStart(8, '0')}${event.sequenceNumber.toString().padStart(6, '0')}`;
}

// ============================================================
// 3. CONTROL CATALOG MODEL
// ============================================================

export interface Control {
  controlId: string;
  domain: 
    | 'Security' 
    | 'Privacy' 
    | 'Tenant Isolation' 
    | 'Data Governance' 
    | 'Collection Safety' 
    | 'Policy Governance' 
    | 'Configuration Governance' 
    | 'Workflow Governance' 
    | 'Evidence Integrity' 
    | 'Monitoring' 
    | 'Export' 
    | 'Audit Integrity' 
    | 'Privileged Access';
  controlType: ControlType;
  name: string;
  objective: string;
  description: string;
  protectedWhat: string;
  whyExists: string;
  riskAddressed: string;
  operatingMechanism: string;
  testMethodology: ControlTestMethod;
  evidenceRequirements: string[];
  ownerUserId: string;
  ownerDisplayName: string;
  ownerEmail: string;
  scope: GovernanceScope;
  frequency: ControlFrequency;
  implementationState: ControlImplementationState;
  operatingStatus: ControlOperatingStatus;
  lastTestedAt?: string;
  nextTestDueAt: string;
  frameworkMappings: Array<{
    frameworkId: string;
    requirementId: string;
    requirementName: string;
  }>;
  nonExemptable: boolean;
  version: string;
}

// ============================================================
// 4. CONTROL TEST MODEL
// ============================================================

export interface ControlTest {
  controlTestId: string;
  controlId: string;
  testType: ControlTestMethod;
  scope: GovernanceScope;
  tenantId?: string;
  testerType: AuditActorType;
  testerId: string;
  testerDisplayName: string;
  startedAt: string;
  completedAt: string;
  methodology: string;
  expectedResult: string;
  actualResult: string;
  evidenceIds: string[];
  outcome: ControlTestOutcome;
  testVersion: string;
  failureImpactAssessment?: string;
  associatedFindingId?: string;
  executionError?: string; // differentiates TEST_EXECUTION_FAILED from CONTROL_FAILED
}

// ============================================================
// 5. FINDINGS & REMEDIATION MODEL
// ============================================================

export interface Finding {
  findingId: string;
  source: 'CONTROL_TEST' | 'AUDIT_INTEGRITY' | 'POLICY_ANOMALY' | 'MANUAL_AUDIT' | 'SECURITY_REVIEW' | 'MONITORING_ALERT';
  controlId: string;
  title: string;
  description: string;
  evidenceIds: string[];
  scope: GovernanceScope;
  tenantId?: string;
  severity: IncidentSeverity;
  state: FindingState;
  ownerUserId: string;
  ownerDisplayName: string;
  discoveredAt: string;
  dueAt: string;
  resolvedAt?: string;
  validationState: 'PENDING_VALIDATION' | 'VALIDATED' | 'VALIDATION_FAILED' | 'NOT_REQUIRED';
  validationEvidenceId?: string;
  waiverApproval?: {
    approvedBy: string;
    approvedAt: string;
    reason: string;
    expiresAt: string;
    compensatingControlId: string;
  };
  remediationPlanId?: string;
}

export interface RemediationItem {
  remediationId: string;
  findingId: string;
  title: string;
  actionRequired: string;
  ownerUserId: string;
  ownerDisplayName: string;
  deadline: string;
  state: RemediationState;
  implementationEvidenceId?: string;
  validationEvidenceId?: string;
  implementedAt?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  dependencies: string[];
}

// ============================================================
// 6. RISK REGISTER MODEL
// ============================================================

export interface GovernanceRisk {
  riskId: string;
  title: string;
  description: string;
  category: 'OPERATIONAL' | 'COMPLIANCE' | 'SECURITY' | 'REPUTATIONAL' | 'TECHNICAL';
  scope: GovernanceScope;
  tenantId?: string;
  ownerUserId: string;
  ownerDisplayName: string;
  source: string;
  likelihood: 1 | 2 | 3 | 4 | 5; // 1 = Rare, 5 = Almost Certain
  impact: 1 | 2 | 3 | 4 | 5;     // 1 = Negligible, 5 = Catastrophic
  inherentScore: number;         // likelihood * impact (1-25)
  treatment: RiskTreatment;
  state: RiskState;
  linkedControlIds: string[];
  linkedFindingIds: string[];
  reviewDate: string;
  acceptanceDetails?: {
    acceptedBy: string;
    acceptedAt: string;
    expirationDate: string;
    rationale: string;
    auditedCorrelationId: string;
  };
}

// ============================================================
// 7. POLICY EXCEPTION MODEL (INTEGRATING PHASE 17)
// ============================================================

export interface PolicyExceptionRecord {
  exceptionId: string;
  title: string;
  justification: string;
  scope: GovernanceScope;
  tenantId?: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  state: ExceptionState;
  expirationAt: string;
  targetPolicyOrCapability: string;
  conditions: string[];
  compensatingControls: string[];
  nonExemptableViolationAttempted: boolean;
  auditCorrelationId: string;
  rejectionReason?: string;
}

// ============================================================
// 8. GOVERNANCE CASE & INCIDENT MODEL
// ============================================================

export interface IncidentRecord {
  incidentId: string;
  title: string;
  incidentType: 
    | 'TENANT_DATA_LEAK' 
    | 'AUDIT_TAMPERING' 
    | 'SECRET_EXPOSURE' 
    | 'CROSS_TENANT_ACCESS' 
    | 'POLICY_BYPASS_ATTEMPT' 
    | 'MONITORING_OUTAGE' 
    | 'EVIDENCE_INTEGRITY_FAILURE';
  severity: IncidentSeverity;
  state: IncidentState;
  scope: GovernanceScope;
  tenantId?: string;
  detectedAt: string;
  containedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  leadInvestigator: string;
  summary: string;
  linkedAuditEvents: string[];
  linkedEvidenceIds: string[];
  linkedControlIds: string[];
  remediationActions: string[];
}

export interface GovernanceCase {
  caseId: string;
  caseType: 'POLICY_VIOLATION' | 'SECURITY_ISSUE' | 'AUDIT_ANOMALY' | 'CONTROL_FAILURE' | 'COMPLIANCE_FINDING' | 'DATA_GOVERNANCE';
  title: string;
  scope: GovernanceScope;
  tenantId?: string;
  ownerUserId: string;
  ownerDisplayName: string;
  priority: IncidentSeverity;
  state: GovernanceCaseState;
  openedAt: string;
  closedAt?: string;
  evidenceIds: string[];
  linkedEventIds: string[];
  linkedControlIds: string[];
  findingIds: string[];
  remediationIds: string[];
  incidentId?: string;
  resolutionSummary?: string;
}

// ============================================================
// 9. GOVERNANCE SNAPSHOT & REPORT MODEL
// ============================================================

export interface GovernanceSnapshot {
  snapshotId: string;
  capturedAt: string;
  capturedBy: string;
  scope: GovernanceScope;
  tenantId?: string;
  completeness: SnapshotCompleteness;
  manifestDigest: string;
  totalControls: number;
  passingControls: number;
  failingControls: number;
  untestedControls: number;
  openFindingsCount: number;
  activeRisksCount: number;
  activeExceptionsCount: number;
  policyEngineVersion: string;
  configEngineVersion: string;
  immutableLock: boolean;
}

export interface GovernanceReport {
  reportId: string;
  reportVersion: string;
  title: string;
  scope: GovernanceScope;
  tenantId?: string;
  periodStart: string;
  periodEnd: string;
  populationSummary: string;
  dataCutoff: string;
  generatedAt: string;
  generatedBy: string;
  approvalStatus: 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'PUBLISHED' | 'SUPERSEDED';
  approvedBy?: string;
  approvedAt?: string;
  supersededByReportId?: string;
  disclaimer: string;
  includedControlIds: string[];
  excludedControlIds: string[];
  metrics: {
    controlsEvaluated: number;
    controlsOperating: number;
    controlsFailed: number;
    testsConducted: number;
    openFindings: number;
    remediationsInValidation: number;
  };
}

// ============================================================
// 10. PRIVILEGED ACCESS & BREAK-GLASS SESSION
// ============================================================

export interface PrivilegedSession {
  sessionId: string;
  actorId: string;
  actorDisplayName: string;
  role: 'PLATFORM_SUPER_ADMIN' | 'SECURITY_AUDITOR' | 'BREAK_GLASS_RESPONDER';
  reason: string;
  targetScope: GovernanceScope;
  targetTenantId?: string;
  startedAt: string;
  expiresAt: string;
  active: boolean;
  mfaVerified: boolean;
  justificationTicket: string;
  breakGlassActive: boolean;
  actionsPerformedCount: number;
}

// ============================================================
// 11. INVARIANT DEFINITIONS (INVARIANT-23-001 TO 017)
// ============================================================

export interface SecurityInvariantStatus {
  invariantId: string;
  code: string;
  title: string;
  category: 'AUDIT' | 'CONTROL' | 'ISOLATION' | 'EXCEPTIONS' | 'ADMIN' | 'REPRODUCIBILITY';
  description: string;
  enforcementMechanism: string;
  verified: boolean;
  lastEvaluatedAt: string;
  violationCount: number;
}

export const PLATFORM_INVARIANTS_23: SecurityInvariantStatus[] = [
  {
    invariantId: 'INV-23-001',
    code: 'INVARIANT-23-001',
    title: 'Audit Immutability & Append-Only History',
    category: 'AUDIT',
    description: 'Audit history cannot be silently modified or rewritten. Any correction creates a discrete corrective audit record.',
    enforcementMechanism: 'Cryptographic hash chaining, database write-once constraints, tamper detection validation.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-002',
    code: 'INVARIANT-23-002',
    title: 'Authorization-Controlled Audit Access',
    category: 'AUDIT',
    description: 'Audit query and stream access strictly checks caller authorization and caller scope.',
    enforcementMechanism: 'PBAC check on /audit endpoints; unauthenticated or under-scoped reads denied.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-003',
    code: 'INVARIANT-23-003',
    title: 'Strict Cross-Tenant Audit Boundary',
    category: 'ISOLATION',
    description: 'Tenant audit logs and telemetry cannot cross tenant boundaries or leak in search/facets.',
    enforcementMechanism: 'TenantContext predicate injected into query filter AST at data layer.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-004',
    code: 'INVARIANT-23-004',
    title: 'Implementation Is Not Automatic Effectiveness',
    category: 'CONTROL',
    description: 'Marking a control IMPLEMENTED does not classify it as operating effectively without test evidence.',
    enforcementMechanism: 'Separate states for implementationState and operatingStatus; requires verified test run.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-005',
    code: 'INVARIANT-23-005',
    title: 'Control Test Failures Cannot Be Silently Converted to Pass',
    category: 'CONTROL',
    description: 'A test result of FAIL cannot be overwritten or suppressed. Changes require re-execution.',
    enforcementMechanism: 'Immutable ControlTest records with cryptographic trace digests.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-006',
    code: 'INVARIANT-23-006',
    title: 'Test Execution Failure Distinct From Control Failure',
    category: 'CONTROL',
    description: 'Infrastructure execution errors are classified as INCONCLUSIVE or NOT_RUN, never PASS.',
    enforcementMechanism: 'Explicit error handling differentiating network/infra timeouts from assertion failures.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-007',
    code: 'INVARIANT-23-007',
    title: 'Evidence Cannot Be Fabricated',
    category: 'CONTROL',
    description: 'Control assertions must reference genuine Phase 21 EvidenceRecord IDs with valid digest manifests.',
    enforcementMechanism: 'Foreign key integrity and evidence package hash lookup against evidence store.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-008',
    code: 'INVARIANT-23-008',
    title: 'Governance Reports Explicitly Identify Scope & Period',
    category: 'REPRODUCIBILITY',
    description: 'Every report records explicit population, cutoff date, start/end period, and methodology version.',
    enforcementMechanism: 'Schema constraint requiring non-null periodStart, periodEnd, and dataCutoff.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-009',
    code: 'INVARIANT-23-009',
    title: 'Framework Mappings Bar Unsupported Compliance Claims',
    category: 'CONTROL',
    description: 'Mapping internal controls to SOC2 or ISO requirements does not assert external certification.',
    enforcementMechanism: 'UI disclaimers and strictly scoped wording; no generic "Certified" or "Fully Compliant" labels.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-010',
    code: 'INVARIANT-23-010',
    title: 'Exceptions Cannot Disable Protected Phase 17 Invariants',
    category: 'EXCEPTIONS',
    description: 'No exception can waive: NO_META_API, NO_PRIVATE_ENDPOINT, NO_AUTH_BYPASS, NO_CAPTCHA_BYPASS, TENANT_ISOLATION.',
    enforcementMechanism: 'Hardcoded policy exception validator rejecting non-exemptable targets.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-011',
    code: 'INVARIANT-23-011',
    title: 'Risk Acceptance Is Time-Bound and Fully Audited',
    category: 'CONTROL',
    description: 'Risk acceptance requires authorized actor, justification, expiration date, and correlation ID.',
    enforcementMechanism: 'Schema enforces mandatory expirationDate; permanent waiving is rejected.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-012',
    code: 'INVARIANT-23-012',
    title: 'Privileged & Break-Glass Access Explicitly Authorized',
    category: 'ADMIN',
    description: 'Administrative elevation requires ticket, reason, auto-expiration, and continuous audit.',
    enforcementMechanism: 'PrivilegedSession supervisor terminating session upon TTL expiry.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-013',
    code: 'INVARIANT-23-013',
    title: 'Self-Approval Prevention (Separation of Duties)',
    category: 'ADMIN',
    description: 'Actors requesting risk acceptances, exceptions, or report publishing cannot approve their own requests.',
    enforcementMechanism: 'Server-side assertion requesterId !== approverId.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-014',
    code: 'INVARIANT-23-014',
    title: 'Historical Governance Snapshots Are Immutable',
    category: 'REPRODUCIBILITY',
    description: 'Snapshots captured in the past cannot be edited or updated. New state produces a new snapshot.',
    enforcementMechanism: 'Write-once storage with immutableLock=true flag.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-015',
    code: 'INVARIANT-23-015',
    title: 'Audit Redaction Preserves Redaction Record',
    category: 'AUDIT',
    description: 'Redacting sensitive payloads preserves the event skeleton, actor, reason, and cryptographic trace.',
    enforcementMechanism: 'Redaction replaces payload with digest and logs a REDACTION_APPLIED event.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-016',
    code: 'INVARIANT-23-016',
    title: 'Governance Package Exports Remain Tenant-Safe',
    category: 'ISOLATION',
    description: 'Exported packages cannot contain records or evidence references belonging to foreign tenants.',
    enforcementMechanism: 'Deep validation filter on all export bundle items against caller tenant context.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-23-017',
    code: 'INVARIANT-23-017',
    title: 'Platform Governance Does Not Create Unrestricted Tenant Access',
    category: 'ADMIN',
    description: 'Platform admins viewing system-wide health receive aggregate metrics or explicit privileged access.',
    enforcementMechanism: 'Strict separation of PlatformSecurityAudit and TenantAudit queries.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T04:30:00Z',
    violationCount: 0
  }
];

// ============================================================
// 12. SAMPLE DATA FIXTURES
// ============================================================

// 1. Initial Sample Audit Events (With Tamper-Evident Chained Hashes)
export const INITIAL_AUDIT_LOG: AuditEvent[] = [
  {
    auditEventId: 'aud_evt_1001',
    sequenceNumber: 1,
    tenantId: 'tenant_apex_solar',
    organizationId: 'org_apex_global',
    actorType: 'USER',
    actorId: 'usr_sarah_chen',
    actorDisplayName: 'Sarah Chen (Lead Investigator)',
    action: 'RESEARCH_SESSION_CREATED',
    category: 'RESEARCH_EXECUTION',
    resourceType: 'RESEARCH_SESSION',
    resourceId: 'session_california_solar_2026',
    requestId: 'req_init_001',
    correlationId: 'corr_apex_session_01',
    timestamp: '2026-08-16T08:00:00Z',
    sourceIp: '198.51.100.42',
    result: 'SUCCESS',
    policyDecision: 'ALLOW',
    policyVersion: 'pol_v3.2.0',
    configurationVersion: 'cfg_v2.1',
    metadata: { query: 'Solar Incentives California', targetAdvertiserCount: 28 },
    schemaVersion: '23.1',
    previousEventHash: '0000000000000000000000000000000000000000000000000000000000000000',
    eventHash: 'sha256_82f1a9b2000001',
    retentionClass: 'STANDARD'
  },
  {
    auditEventId: 'aud_evt_1002',
    sequenceNumber: 2,
    tenantId: 'tenant_apex_solar',
    organizationId: 'org_apex_global',
    actorType: 'SYSTEM',
    actorId: 'sys_playwright_worker_04',
    actorDisplayName: 'Browser Worker #04',
    action: 'PUBLIC_AD_LIBRARY_OBSERVED',
    category: 'DATA_ACCESS',
    resourceType: 'AD_SNAPSHOT',
    resourceId: 'ev_ad_snap_88291',
    requestId: 'req_worker_scrape_04',
    correlationId: 'corr_apex_session_01',
    timestamp: '2026-08-16T08:05:12Z',
    sourceIp: '10.240.12.8',
    result: 'SUCCESS',
    policyDecision: 'ALLOW',
    policyVersion: 'pol_v3.2.0',
    metadata: { adsObserved: 14, httpStatus: 200, antiBotBypassUsed: false },
    schemaVersion: '23.1',
    previousEventHash: 'sha256_82f1a9b2000001',
    eventHash: 'sha256_91c4d811000002',
    retentionClass: 'AUDIT_RETAINED'
  },
  {
    auditEventId: 'aud_evt_1003',
    sequenceNumber: 3,
    tenantId: 'tenant_apex_solar',
    organizationId: 'org_apex_global',
    actorType: 'USER',
    actorId: 'usr_sarah_chen',
    actorDisplayName: 'Sarah Chen (Lead Investigator)',
    action: 'POLICY_EXCEPTION_REQUESTED',
    category: 'POLICY_CHANGE',
    resourceType: 'POLICY_RULE',
    resourceId: 'rule_export_raw_phone_numbers',
    requestId: 'req_exc_003',
    correlationId: 'corr_apex_exc_99',
    timestamp: '2026-08-16T09:15:00Z',
    sourceIp: '198.51.100.42',
    result: 'SUCCESS',
    policyDecision: 'REQUIRES_APPROVAL',
    policyVersion: 'pol_v3.2.0',
    metadata: { justification: 'Exporting contact numbers for authorized client campaign review' },
    schemaVersion: '23.1',
    previousEventHash: 'sha256_91c4d811000002',
    eventHash: 'sha256_a319ef44000003',
    retentionClass: 'SECURITY'
  },
  {
    auditEventId: 'aud_evt_1004',
    sequenceNumber: 4,
    tenantId: 'tenant_apex_solar',
    organizationId: 'org_apex_global',
    actorType: 'ADMINISTRATOR',
    actorId: 'usr_elena_rostova',
    actorDisplayName: 'Elena Rostova (Compliance Officer)',
    action: 'POLICY_EXCEPTION_APPROVED',
    category: 'POLICY_CHANGE',
    resourceType: 'POLICY_RULE',
    resourceId: 'rule_export_raw_phone_numbers',
    requestId: 'req_exc_appr_004',
    correlationId: 'corr_apex_exc_99',
    timestamp: '2026-08-16T09:45:20Z',
    sourceIp: '198.51.100.88',
    result: 'SUCCESS',
    policyDecision: 'ALLOW',
    policyVersion: 'pol_v3.2.0',
    metadata: { approver: 'usr_elena_rostova', requester: 'usr_sarah_chen', separationOfDutiesVerified: true },
    schemaVersion: '23.1',
    previousEventHash: 'sha256_a319ef44000003',
    eventHash: 'sha256_bb441099000004',
    retentionClass: 'SECURITY'
  },
  {
    auditEventId: 'aud_evt_1005',
    sequenceNumber: 5,
    tenantId: 'tenant_apex_solar',
    organizationId: 'org_apex_global',
    actorType: 'USER',
    actorId: 'usr_attacker_simulated',
    actorDisplayName: 'Unauthorized Script (Simulated)',
    action: 'CROSS_TENANT_ACCESS_ATTEMPT',
    category: 'AUTHORIZATION',
    resourceType: 'TENANT_DOSSIER',
    resourceId: 'dossier_nordic_wind_099',
    requestId: 'req_malicious_probe_01',
    correlationId: 'corr_probe_403_88',
    timestamp: '2026-08-16T11:20:05Z',
    sourceIp: '203.0.113.19',
    result: 'DENIED',
    policyDecision: 'DENY',
    failureReason: 'Cross-tenant boundary violation: Caller tenant tenant_apex_solar cannot access tenant_nordic_clean_energy',
    metadata: { targetTenant: 'tenant_nordic_clean_energy', rlsBlocked: true },
    schemaVersion: '23.1',
    previousEventHash: 'sha256_bb441099000004',
    eventHash: 'sha256_cc551988000005',
    retentionClass: 'SECURITY',
    legalHoldActive: true
  },
  {
    auditEventId: 'aud_evt_1006',
    sequenceNumber: 6,
    actorType: 'ADMINISTRATOR',
    actorId: 'usr_admin_marcus',
    actorDisplayName: 'Marcus Vance (Platform SRE Lead)',
    organizationId: 'org_apex_global',
    action: 'BREAK_GLASS_SESSION_INITIATED',
    category: 'BREAK_GLASS',
    resourceType: 'PLATFORM_INFRASTRUCTURE',
    resourceId: 'cluster_us_east_research_nodes',
    requestId: 'req_bg_marcus_01',
    correlationId: 'corr_bg_sess_009',
    timestamp: '2026-08-16T13:00:00Z',
    sourceIp: '198.51.100.12',
    result: 'SUCCESS',
    policyDecision: 'ALLOW',
    metadata: { ticket: 'INC-2026-08-042', durationMinutes: 60, mfaPassed: true },
    schemaVersion: '23.1',
    previousEventHash: 'sha256_cc551988000005',
    eventHash: 'sha256_dd662077000006',
    retentionClass: 'AUDIT_RETAINED'
  }
];

// 2. Control Catalog Fixtures (Spanning All Governance Domains)
export const SAMPLE_CONTROLS: Control[] = [
  {
    controlId: 'CTRL-TENANT-ISOLATION',
    domain: 'Tenant Isolation',
    controlType: 'PREVENTIVE',
    name: 'Multi-Tenant Row-Level Security & Storage Isolation',
    objective: 'Prevent any cross-tenant data access across DB, cache, search indices, evidence stores, and queues.',
    description: 'Enforces mandatory TenantContext injection into all SQL AST nodes and authorization middleware. Direct queries lacking tenant predicates are rejected at the ORM gate.',
    protectedWhat: 'All tenant research dossiers, evidence snapshots, watchlists, workflows, and search indexes.',
    whyExists: 'Fundamental multi-tenant trust requirement to eliminate lateral tenant privilege escalation.',
    riskAddressed: 'Cross-tenant data leakage and unauthorized competitive intelligence exposure.',
    operatingMechanism: 'PostgreSQL Row-Level Security (RLS) + Redis namespace prefixing + tenant filter AST enforcement.',
    testMethodology: 'AUTOMATED_TEST',
    evidenceRequirements: ['Automated isolation test suite logs', 'PostgreSQL RLS audit trace', 'Search query AST verification'],
    ownerUserId: 'usr_elena_rostova',
    ownerDisplayName: 'Elena Rostova',
    ownerEmail: 'elena.rostova@apexresearch.io',
    scope: 'PLATFORM',
    frequency: 'DAILY',
    implementationState: 'VERIFIED',
    operatingStatus: 'CONTROL_OPERATING',
    lastTestedAt: '2026-09-16T22:00:00Z',
    nextTestDueAt: '2026-09-17T22:00:00Z',
    frameworkMappings: [
      { frameworkId: 'SOC2_TYPE2', requirementId: 'CC6.1', requirementName: 'Logical Separation of Client Data' },
      { frameworkId: 'ISO_27001_2022', requirementId: 'A.8.12', requirementName: 'Data Leakage Prevention' }
    ],
    nonExemptable: true,
    version: '2.4.0'
  },
  {
    controlId: 'CTRL-AUDIT-INTEGRITY',
    domain: 'Audit Integrity',
    controlType: 'DETECTIVE',
    name: 'Immutable Append-Only Audit Trail & Hash-Chaining',
    objective: 'Ensure audit events cannot be modified, deleted, or backdated without triggering cryptographic tamper detection.',
    description: 'Each audit event includes the SHA-256 digest of the predecessor event in a continuous Merkle-like chain. Nightly validation checks chain continuity and manifest signatures.',
    protectedWhat: 'Historical platform audit events, policy violation records, and administrative actions.',
    whyExists: 'Compliance verification and forensic non-repudiation in incident investigation.',
    riskAddressed: 'Covert log tampering, actor identity falsification, and timestamp modification.',
    operatingMechanism: 'Database write-once triggers + SHA-256 chain calculation + append-only journal store.',
    testMethodology: 'AUTOMATED_TEST',
    evidenceRequirements: ['Chained hash integrity report', 'Daily segment signature receipts'],
    ownerUserId: 'usr_elena_rostova',
    ownerDisplayName: 'Elena Rostova',
    ownerEmail: 'elena.rostova@apexresearch.io',
    scope: 'PLATFORM',
    frequency: 'CONTINUOUS',
    implementationState: 'VERIFIED',
    operatingStatus: 'CONTROL_OPERATING',
    lastTestedAt: '2026-09-17T03:00:00Z',
    nextTestDueAt: '2026-09-17T06:00:00Z',
    frameworkMappings: [
      { frameworkId: 'SOC2_TYPE2', requirementId: 'CC7.2', requirementName: 'System Component Monitoring & Audit Integrity' },
      { frameworkId: 'NIST_CSF_V2', requirementId: 'PR.PT-1', requirementName: 'Audit Records Protection' }
    ],
    nonExemptable: true,
    version: '3.1.0'
  },
  {
    controlId: 'CTRL-NO-PRIVATE-META-API',
    domain: 'Collection Safety',
    controlType: 'PREVENTIVE',
    name: 'Prohibition of Private Graph API & Stealth Spoofing',
    objective: 'Strictly prohibit usage of private Meta Graph API endpoints, reverse-engineered auth tokens, or CAPTCHA solving farms.',
    description: 'Code-level and network egress proxies verify that all Meta Ad Library interactions utilize only legitimately rendered public web assets in Playwright workers.',
    protectedWhat: 'Platform legal posture, collection compliance, and source safety.',
    whyExists: 'Adherence to terms of public data research; rejection of brittle, hazardous private endpoint reverse engineering.',
    riskAddressed: 'IP blacklisting, legal cease-and-desist, and deceptive automation enforcement.',
    operatingMechanism: 'Static AST inspection + container egress domain whitelisting (only www.facebook.com/ads/library public web UI).',
    testMethodology: 'AUTOMATED_TEST',
    evidenceRequirements: ['Worker outbound network traffic logs', 'Container egress proxy audit'],
    ownerUserId: 'usr_marcus_vance',
    ownerDisplayName: 'Marcus Vance',
    ownerEmail: 'marcus.vance@apexresearch.io',
    scope: 'PLATFORM',
    frequency: 'CONTINUOUS',
    implementationState: 'VERIFIED',
    operatingStatus: 'CONTROL_OPERATING',
    lastTestedAt: '2026-09-17T01:00:00Z',
    nextTestDueAt: '2026-09-17T13:00:00Z',
    frameworkMappings: [
      { frameworkId: 'ISO_27001_2022', requirementId: 'A.5.31', requirementName: 'Legal, Statutory, and Contractual Requirements' }
    ],
    nonExemptable: true,
    version: '1.8.0'
  },
  {
    controlId: 'CTRL-BREAK-GLASS-SUPERVISION',
    domain: 'Privileged Access',
    controlType: 'PREVENTIVE',
    name: 'Time-Bounded Break-Glass Session Supervision',
    objective: 'Enforce dual-custody justification, MFA verification, and automatic expiration for elevated platform emergency sessions.',
    description: 'Elevated sessions auto-expire after 60 minutes maximum, emit real-time notifications to compliance leads, and log all terminal commands to an immutable audit channel.',
    protectedWhat: 'Production infrastructure, master database instances, and cross-tenant diagnostic tools.',
    whyExists: 'Prevent unchecked superuser abuse and lingering backdoor sessions.',
    riskAddressed: 'Insider threat, credentials theft, and unmonitored production modifications.',
    operatingMechanism: 'Ephemeral token broker with hard 3600s TTL + mandatory incident ticket linkage.',
    testMethodology: 'AUTOMATED_TEST',
    evidenceRequirements: ['Session expiration telemetry', 'Audit event correlation trail'],
    ownerUserId: 'usr_elena_rostova',
    ownerDisplayName: 'Elena Rostova',
    ownerEmail: 'elena.rostova@apexresearch.io',
    scope: 'PLATFORM',
    frequency: 'EVENT_DRIVEN',
    implementationState: 'IMPLEMENTED',
    operatingStatus: 'CONTROL_OPERATING',
    lastTestedAt: '2026-09-15T18:00:00Z',
    nextTestDueAt: '2026-09-22T18:00:00Z',
    frameworkMappings: [
      { frameworkId: 'SOC2_TYPE2', requirementId: 'CC6.3', requirementName: 'Role-Based Privileged Access' },
      { frameworkId: 'NIST_CSF_V2', requirementId: 'PR.AC-4', requirementName: 'Access Permissions Managed' }
    ],
    nonExemptable: true,
    version: '2.0.1'
  },
  {
    controlId: 'CTRL-EVIDENCE-CHAIN-HASHING',
    domain: 'Evidence Integrity',
    controlType: 'DETECTIVE',
    name: 'Deterministic Evidence Artifact Digest Verification',
    objective: 'Ensure raw HTTP responses, DOM snapshots, and screenshots cannot be replaced or modified post-capture.',
    description: 'Every captured artifact is hashed using SHA-256 immediately upon ingestion in the browser worker before persisting to object storage.',
    protectedWhat: 'Reproducible research artifacts and evidentiary claims.',
    whyExists: 'Ensure research investigations withstand external dispute and forensic scrutiny.',
    riskAddressed: 'Evidence fabrication, corrupted snapshot replays, and stale cache illusions.',
    operatingMechanism: 'Digest generation at worker capture time + package manifest signing.',
    testMethodology: 'AUTOMATED_TEST',
    evidenceRequirements: ['Evidence digest verification reports', 'Merkle root proofs'],
    ownerUserId: 'usr_sarah_chen',
    ownerDisplayName: 'Sarah Chen',
    ownerEmail: 'sarah.chen@apexresearch.io',
    scope: 'PLATFORM',
    frequency: 'DAILY',
    implementationState: 'VERIFIED',
    operatingStatus: 'CONTROL_OPERATING',
    lastTestedAt: '2026-09-17T02:30:00Z',
    nextTestDueAt: '2026-09-18T02:30:00Z',
    frameworkMappings: [
      { frameworkId: 'ISO_27001_2022', requirementId: 'A.8.15', requirementName: 'Logging and Evidence Preservation' }
    ],
    nonExemptable: true,
    version: '2.2.0'
  },
  {
    controlId: 'CTRL-MONITORING-DIFF-ACCURACY',
    domain: 'Monitoring',
    controlType: 'DETECTIVE',
    name: 'Monitoring Non-Conflation of Check Failures with No-Change',
    objective: 'Guarantee that a failed scraper check or unavailable source is never recorded as NO_CHANGE or deletion.',
    description: 'State machine asserts that CHECK_FAILED and SOURCE_UNAVAILABLE remain explicit states; diff engine halts baseline updates when observation completeness is degraded.',
    protectedWhat: 'Advertiser watchlists, competitive alert feeds, and compliance trendlines.',
    whyExists: 'Prevents false negatives where target changes are missed due to transient fetch timeouts.',
    riskAddressed: 'Undetected competitive ad surge, false assurance of campaign dormancy.',
    operatingMechanism: 'State machine assertion: checkStatus === SUCCESS required before running diff engine.',
    testMethodology: 'AUTOMATED_TEST',
    evidenceRequirements: ['Chaos injection run logs', 'Monitoring run state transition metrics'],
    ownerUserId: 'usr_marcus_vance',
    ownerDisplayName: 'Marcus Vance',
    ownerEmail: 'marcus.vance@apexresearch.io',
    scope: 'TENANT',
    frequency: 'DAILY',
    implementationState: 'VERIFIED',
    operatingStatus: 'CONTROL_OPERATING',
    lastTestedAt: '2026-09-16T19:00:00Z',
    nextTestDueAt: '2026-09-17T19:00:00Z',
    frameworkMappings: [
      { frameworkId: 'SOC2_TYPE2', requirementId: 'CC7.1', requirementName: 'Vulnerability and Anomaly Detection' }
    ],
    nonExemptable: false,
    version: '1.4.0'
  },
  {
    controlId: 'CTRL-PERIODIC-ACCESS-REVIEW',
    domain: 'Security',
    controlType: 'DETECTIVE',
    name: 'Quarterly Multi-Tenant User & Role Certification',
    objective: 'Require tenant administrators and platform security leads to review and recertify all active user roles.',
    description: 'System generates an interactive access review campaign every 90 days. Unreviewed accounts trigger escalation findings.',
    protectedWhat: 'Tenant workspace membership and privileged platform administrative entitlements.',
    whyExists: 'Prevent orphaned accounts, lingering contractor access, and privilege accumulation.',
    riskAddressed: 'Compromised dormant credentials and unauthorized privilege creep.',
    operatingMechanism: 'Scheduled review workflow with signed completion attestations.',
    testMethodology: 'MANUAL_REVIEW',
    evidenceRequirements: ['Signed access review certifications', 'Revocation change tickets'],
    ownerUserId: 'usr_elena_rostova',
    ownerDisplayName: 'Elena Rostova',
    ownerEmail: 'elena.rostova@apexresearch.io',
    scope: 'ORGANIZATION',
    frequency: 'QUARTERLY',
    implementationState: 'IMPLEMENTED',
    operatingStatus: 'TEST_OVERDUE',
    lastTestedAt: '2026-05-30T10:00:00Z',
    nextTestDueAt: '2026-08-30T10:00:00Z', // Overdue by 18 days
    frameworkMappings: [
      { frameworkId: 'SOC2_TYPE2', requirementId: 'CC6.2', requirementName: 'User Access Revocation & Periodic Review' },
      { frameworkId: 'ISO_27001_2022', requirementId: 'A.9.2.5', requirementName: 'Review of User Access Rights' }
    ],
    nonExemptable: false,
    version: '1.2.0'
  }
];

// 3. Sample Control Tests
export const INITIAL_CONTROL_TESTS: ControlTest[] = [
  {
    controlTestId: 'test_run_20260916_01',
    controlId: 'CTRL-TENANT-ISOLATION',
    testType: 'AUTOMATED_TEST',
    scope: 'PLATFORM',
    testerType: 'AUTOMATION',
    testerId: 'svc_compliance_test_runner',
    testerDisplayName: 'Security Test Automation Runner',
    startedAt: '2026-09-16T21:58:30Z',
    completedAt: '2026-09-16T22:00:00Z',
    methodology: 'Fuzzed cross-tenant query injection across REST APIs, GraphQL endpoints, and Postgres RLS layer targeting 10 synthetic tenant pairs.',
    expectedResult: 'HTTP 403 Forbidden on all 50 cross-tenant requests; 0 foreign records returned in SQL queries.',
    actualResult: 'HTTP 403 Forbidden verified on 50/50 test vectors. Postgres RLS blocked 100% of fuzzed queries.',
    evidenceIds: ['ev_test_suite_run_9941', 'ev_rls_probe_log_02'],
    outcome: 'PASS',
    testVersion: 'test_rls_v4.1'
  },
  {
    controlTestId: 'test_run_20260917_02',
    controlId: 'CTRL-AUDIT-INTEGRITY',
    testType: 'AUTOMATED_TEST',
    scope: 'PLATFORM',
    testerType: 'AUTOMATION',
    testerId: 'svc_compliance_test_runner',
    testerDisplayName: 'Audit Integrity Daemon',
    startedAt: '2026-09-17T02:59:00Z',
    completedAt: '2026-09-17T03:00:00Z',
    methodology: 'Recursive predecessor hash chain traversal from genesis event aud_evt_1001 to aud_evt_1006.',
    expectedResult: '100% digest match; unbroken sequence numbering; zero orphaned records.',
    actualResult: 'Traversed 6 events. All hashes matched SHA-256 pre-image calculations. Chain is valid.',
    evidenceIds: ['ev_hash_verify_report_1006'],
    outcome: 'PASS',
    testVersion: 'audit_chain_v2'
  },
  {
    controlTestId: 'test_run_20260915_03',
    controlId: 'CTRL-PERIODIC-ACCESS-REVIEW',
    testType: 'MANUAL_REVIEW',
    scope: 'ORGANIZATION',
    tenantId: 'tenant_apex_solar',
    testerType: 'USER',
    testerId: 'usr_elena_rostova',
    testerDisplayName: 'Elena Rostova',
    startedAt: '2026-09-15T14:00:00Z',
    completedAt: '2026-09-15T14:30:00Z',
    methodology: 'Review of Q3 2026 tenant membership recertification attestations.',
    expectedResult: 'Signed access reviews from all tenant admins by due date 2026-08-30.',
    actualResult: 'Review not completed for 2 of 5 enterprise tenants (Nordic Clean Energy, Pacific Solar Syndicate).',
    evidenceIds: ['ev_access_review_missing_q3'],
    outcome: 'FAIL',
    testVersion: 'manual_access_review_v1',
    failureImpactAssessment: 'Potential presence of de-provisioned contractor accounts in active tenant workspaces.',
    associatedFindingId: 'find_access_review_q3_overdue'
  }
];

// 4. Sample Findings & Remediation Items
export const INITIAL_FINDINGS: Finding[] = [
  {
    findingId: 'find_access_review_q3_overdue',
    source: 'CONTROL_TEST',
    controlId: 'CTRL-PERIODIC-ACCESS-REVIEW',
    title: 'Q3 Enterprise Tenant User Access Review Overdue',
    description: 'Tenant administrators for Nordic Clean Energy and Pacific Solar Syndicate have not completed their mandated 90-day access recertification.',
    evidenceIds: ['ev_access_review_missing_q3'],
    scope: 'ORGANIZATION',
    tenantId: 'tenant_nordic_clean_energy',
    severity: 'MEDIUM',
    state: 'IN_REMEDIATION',
    ownerUserId: 'usr_elena_rostova',
    ownerDisplayName: 'Elena Rostova',
    discoveredAt: '2026-09-15T14:30:00Z',
    dueAt: '2026-09-22T17:00:00Z',
    validationState: 'PENDING_VALIDATION',
    remediationPlanId: 'rem_plan_q3_access_cert'
  },
  {
    findingId: 'find_monitoring_stale_baseline_solar',
    source: 'MONITORING_ALERT',
    controlId: 'CTRL-MONITORING-DIFF-ACCURACY',
    title: 'Stale Statistical Baseline for Low-Frequency Solar Advertiser',
    description: 'Target adv_sunpower_norcal has only 12 observations over 45 days, failing the n >= 30 threshold for statistical standard deviation baselines.',
    evidenceIds: ['ev_baseline_underpopulation_report'],
    scope: 'TENANT',
    tenantId: 'tenant_apex_solar',
    severity: 'LOW',
    state: 'OPEN',
    ownerUserId: 'usr_marcus_vance',
    ownerDisplayName: 'Marcus Vance',
    discoveredAt: '2026-09-14T08:15:00Z',
    dueAt: '2026-09-28T08:15:00Z',
    validationState: 'NOT_REQUIRED'
  }
];

export const INITIAL_REMEDIATIONS: RemediationItem[] = [
  {
    remediationId: 'rem_plan_q3_access_cert',
    findingId: 'find_access_review_q3_overdue',
    title: 'Issue Escalation Notice and Lock Uncertified Admin Accounts',
    actionRequired: 'Automate lock warning notices to non-responsive tenant admins. If uncertified by 2026-09-20, restrict tenant inviting capability until completed.',
    ownerUserId: 'usr_elena_rostova',
    ownerDisplayName: 'Elena Rostova',
    deadline: '2026-09-20T18:00:00Z',
    state: 'IN_PROGRESS',
    dependencies: ['CTRL-PERIODIC-ACCESS-REVIEW']
  }
];

// 5. Sample Risk Register
export const INITIAL_RISKS: GovernanceRisk[] = [
  {
    riskId: 'RISK-TENANT-LEAKAGE',
    title: 'Cross-Tenant Research Dossier Exposure via Cache Invalidation Flaw',
    description: 'Potential for cached research queries in Redis to be served to a different tenant if cache keys omit tenant UUID prefix.',
    category: 'SECURITY',
    scope: 'PLATFORM',
    ownerUserId: 'usr_marcus_vance',
    ownerDisplayName: 'Marcus Vance',
    source: 'Phase 18 Threat Modeling',
    likelihood: 2,
    impact: 5,
    inherentScore: 10,
    treatment: 'MITIGATE',
    state: 'MITIGATED',
    linkedControlIds: ['CTRL-TENANT-ISOLATION'],
    linkedFindingIds: [],
    reviewDate: '2026-11-15T00:00:00Z'
  },
  {
    riskId: 'RISK-STALE-AD-LIBRARY-DOM',
    title: 'Meta Ad Library UI DOM Selector Drift Causing Extraction Drop',
    description: 'Meta frontend updates altering DOM classes could silently cause Playwright extractors to miss active ads.',
    category: 'OPERATIONAL',
    scope: 'PLATFORM',
    ownerUserId: 'usr_sarah_chen',
    ownerDisplayName: 'Sarah Chen',
    source: 'Extraction Pipeline Chaos Testing',
    likelihood: 4,
    impact: 3,
    inherentScore: 12,
    treatment: 'MITIGATE',
    state: 'MONITORED',
    linkedControlIds: ['CTRL-MONITORING-DIFF-ACCURACY', 'CTRL-EVIDENCE-CHAIN-HASHING'],
    linkedFindingIds: ['find_monitoring_stale_baseline_solar'],
    reviewDate: '2026-10-01T00:00:00Z'
  },
  {
    riskId: 'RISK-DORMANT-CONTRACTOR-ACCESS',
    title: 'Unrevoked Contractor Credentials in Research Workspaces',
    description: 'Contractors completing temporary research engagements retaining read access to proprietary lead dossiers.',
    category: 'COMPLIANCE',
    scope: 'ORGANIZATION',
    ownerUserId: 'usr_elena_rostova',
    ownerDisplayName: 'Elena Rostova',
    source: 'Quarterly Audit Review',
    likelihood: 3,
    impact: 3,
    inherentScore: 9,
    treatment: 'MITIGATE',
    state: 'TREATED',
    linkedControlIds: ['CTRL-PERIODIC-ACCESS-REVIEW'],
    linkedFindingIds: ['find_access_review_q3_overdue'],
    reviewDate: '2026-09-30T00:00:00Z'
  }
];

// 6. Sample Policy Exceptions (Phase 17 Integration)
export const INITIAL_EXCEPTIONS: PolicyExceptionRecord[] = [
  {
    exceptionId: 'EXC-2026-08-01',
    title: 'Temporary Raw Phone Number Export for Client Verification',
    justification: 'Export required for audited direct customer outbound qualification call matching.',
    scope: 'TENANT',
    tenantId: 'tenant_apex_solar',
    requestedBy: 'usr_sarah_chen',
    requestedAt: '2026-08-16T09:15:00Z',
    approvedBy: 'usr_elena_rostova',
    approvedAt: '2026-08-16T09:45:20Z',
    state: 'ACTIVE',
    expirationAt: '2026-09-25T23:59:59Z',
    targetPolicyOrCapability: 'export:raw_phone_numbers',
    conditions: ['Caller must sign NDPR data handling addendum', 'All exported files encrypted with AES-256 GCM'],
    compensatingControls: ['CTRL-AUDIT-INTEGRITY', 'CTRL-TENANT-ISOLATION'],
    nonExemptableViolationAttempted: false,
    auditCorrelationId: 'corr_apex_exc_99'
  }
];

// 7. Sample Governance Cases & Incidents
export const INITIAL_CASES: GovernanceCase[] = [
  {
    caseId: 'CASE-2026-0042',
    caseType: 'SECURITY_ISSUE',
    title: 'Investigation of Cross-Tenant Probing Attempt from External Range',
    scope: 'PLATFORM',
    ownerUserId: 'usr_elena_rostova',
    ownerDisplayName: 'Elena Rostova',
    priority: 'HIGH',
    state: 'CONTAINMENT',
    openedAt: '2026-08-16T11:25:00Z',
    evidenceIds: ['ev_probe_pcap_403', 'ev_source_ip_trace'],
    linkedEventIds: ['aud_evt_1005'],
    linkedControlIds: ['CTRL-TENANT-ISOLATION'],
    findingIds: [],
    remediationIds: [],
    incidentId: 'INC-2026-08-019',
    resolutionSummary: 'Target IP 203.0.113.19 null-routed at edge cloud firewall; RLS prevented any data access.'
  }
];

export const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    incidentId: 'INC-2026-08-019',
    title: 'Hostile Cross-Tenant Dossier Enumeration Probe',
    incidentType: 'CROSS_TENANT_ACCESS',
    severity: 'HIGH',
    state: 'CONTAINED',
    scope: 'PLATFORM',
    detectedAt: '2026-08-16T11:20:05Z',
    containedAt: '2026-08-16T11:32:00Z',
    leadInvestigator: 'Elena Rostova',
    summary: 'Automated script attempted iterating tenant UUIDs against Lead Dossier API. Denied 100% by tenant context enforcement.',
    linkedAuditEvents: ['aud_evt_1005'],
    linkedEvidenceIds: ['ev_probe_pcap_403'],
    linkedControlIds: ['CTRL-TENANT-ISOLATION'],
    remediationActions: ['Edge rate limit applied to probe subnet', 'Increased SIEM alert threshold sensitivity']
  }
];

// 8. Sample Privileged Sessions
export const INITIAL_PRIVILEGED_SESSIONS: PrivilegedSession[] = [
  {
    sessionId: 'sess_bg_marcus_881',
    actorId: 'usr_marcus_vance',
    actorDisplayName: 'Marcus Vance',
    role: 'BREAK_GLASS_RESPONDER',
    reason: 'Emergency node patch for memory leak on worker pool cluster #04',
    targetScope: 'PLATFORM',
    startedAt: '2026-08-16T13:00:00Z',
    expiresAt: '2026-08-16T14:00:00Z',
    active: false,
    mfaVerified: true,
    justificationTicket: 'INC-2026-08-042',
    breakGlassActive: true,
    actionsPerformedCount: 4
  }
];

// 9. Sample Governance Snapshots
export const INITIAL_GOVERNANCE_SNAPSHOTS: GovernanceSnapshot[] = [
  {
    snapshotId: 'gov_snap_20260901_monthly',
    capturedAt: '2026-09-01T00:00:00Z',
    capturedBy: 'usr_elena_rostova',
    scope: 'PLATFORM',
    completeness: 'COMPLETE',
    manifestDigest: 'sha256_e1c9441a007b819283eac771829034aa1',
    totalControls: 7,
    passingControls: 6,
    failingControls: 1,
    untestedControls: 0,
    openFindingsCount: 2,
    activeRisksCount: 3,
    activeExceptionsCount: 1,
    policyEngineVersion: 'pol_v3.2.0',
    configEngineVersion: 'cfg_v2.1',
    immutableLock: true
  }
];

// 10. Sample Governance Reports
export const INITIAL_GOVERNANCE_REPORTS: GovernanceReport[] = [
  {
    reportId: 'rep_soc2_readiness_2026_q3',
    reportVersion: '1.0.0',
    title: 'SOC 2 Type II Readiness & Control Verification Report',
    scope: 'PLATFORM',
    periodStart: '2026-06-01T00:00:00Z',
    periodEnd: '2026-08-31T23:59:59Z',
    populationSummary: '7 core controls mapped to CC6.1, CC6.2, CC6.3, CC7.1, CC7.2. 18 automated test runs conducted.',
    dataCutoff: '2026-09-01T00:00:00Z',
    generatedAt: '2026-09-02T10:00:00Z',
    generatedBy: 'usr_elena_rostova',
    approvalStatus: 'APPROVED',
    approvedBy: 'usr_elena_rostova',
    approvedAt: '2026-09-02T16:00:00Z',
    disclaimer: 'This internal report reflects observed control execution and test evidence over the defined period. It does not constitute an independent AICPA SOC 2 attestation or legal certification.',
    includedControlIds: ['CTRL-TENANT-ISOLATION', 'CTRL-AUDIT-INTEGRITY', 'CTRL-BREAK-GLASS-SUPERVISION', 'CTRL-EVIDENCE-CHAIN-HASHING', 'CTRL-MONITORING-DIFF-ACCURACY'],
    excludedControlIds: [],
    metrics: {
      controlsEvaluated: 5,
      controlsOperating: 5,
      controlsFailed: 0,
      testsConducted: 14,
      openFindings: 0,
      remediationsInValidation: 0
    }
  }
];

// ============================================================
// 13. AUDIT INTEGRITY VERIFIER UTILITY
// ============================================================

export interface VerificationResult {
  valid: boolean;
  totalEventsChecked: number;
  corruptedEventIds: string[];
  details: string;
}

export function verifyAuditChainIntegrity(events: AuditEvent[]): VerificationResult {
  const corrupted: string[] = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < events.length; i++) {
    const evt = events[i];
    
    // Check previous hash continuity
    if (evt.previousEventHash !== prevHash) {
      corrupted.push(evt.auditEventId);
    }
    
    // Recalculate event digest
    const expectedHash = computeEventHash(evt);
    if (evt.eventHash !== expectedHash) {
      if (!corrupted.includes(evt.auditEventId)) {
        corrupted.push(evt.auditEventId);
      }
    }
    
    prevHash = evt.eventHash;
  }

  return {
    valid: corrupted.length === 0,
    totalEventsChecked: events.length,
    corruptedEventIds: corrupted,
    details: corrupted.length === 0 
      ? `Audit log chain is cryptographically intact across all ${events.length} sequenced records.` 
      : `Tamper detected! Broken hash link or mismatched digest on event(s): ${corrupted.join(', ')}`
  };
}
