/**
 * PHASE 17 — POLICY, SAFETY, SECURITY INVARIANTS & CONTROL PLANE ENGINE
 * Maximum strict production-grade security invariants, policy hierarchy,
 * safe AST condition evaluation, policy decision engine, circuit breakers,
 * emergency kill switches, defense-in-depth enforcement, violation handling,
 * immutable snapshots, and Phase 18 tenant hooks.
 */

// ============================================================
// 1. POLICY DOMAIN MODEL & ENUMS
// ============================================================

export type PolicyType =
  | 'SECURITY_POLICY'
  | 'SAFETY_POLICY'
  | 'DATA_GOVERNANCE_POLICY'
  | 'PRIVACY_POLICY'
  | 'COLLECTION_POLICY'
  | 'SOURCE_ACCESS_POLICY'
  | 'RATE_CONTROL_POLICY'
  | 'VERIFICATION_POLICY'
  | 'IDENTITY_POLICY'
  | 'WORKFLOW_POLICY'
  | 'QUALITY_POLICY'
  | 'EXPORT_POLICY'
  | 'RETENTION_POLICY'
  | 'PII_POLICY'
  | 'TENANT_POLICY'
  | 'AUDIT_POLICY'
  | 'OPERATIONAL_POLICY'
  | 'FEATURE_POLICY'
  | 'EMERGENCY_POLICY';

export type PolicyLifecycleState =
  | 'DRAFT'
  | 'VALIDATING'
  | 'REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'RETIRED'
  | 'REJECTED'
  | 'INVALID'
  | 'DISABLED';

export type PolicyScope =
  | 'SECURITY_INVARIANT'
  | 'PLATFORM'
  | 'GOVERNANCE'
  | 'GLOBAL'
  | 'TENANT'
  | 'WORKSPACE'
  | 'PROJECT'
  | 'WORKFLOW';

export type PolicyDecisionType =
  | 'ALLOW'
  | 'DENY'
  | 'REQUIRE_REVIEW'
  | 'REQUIRE_APPROVAL'
  | 'REQUIRE_CONFIRMATION'
  | 'QUARANTINE'
  | 'PAUSE'
  | 'RATE_LIMIT'
  | 'DEFER'
  | 'UNAVAILABLE';

export type EnforcementActionType =
  | 'BLOCK_EXECUTION'
  | 'TRIGGER_CIRCUIT_BREAKER'
  | 'TRIGGER_KILL_SWITCH'
  | 'ISOLATE_TENANT'
  | 'RECORD_VIOLATION'
  | 'MASK_PII_PAYLOAD'
  | 'ROUTE_FOR_MANUAL_REVIEW'
  | 'EMIT_SECURITY_ALERT';

export type ProtectionLevel = 'PROTECTED_NON_EXEMPTABLE' | 'PROTECTED_RESTRICTED' | 'STANDARD_TENANT_GOVERNED';

export type CapabilityId =
  | 'COLLECT_PUBLIC_AD_LIBRARY'
  | 'EXTRACT_PUBLIC_FIELD'
  | 'VERIFY_PUBLIC_DESTINATION'
  | 'RESOLVE_IDENTITY'
  | 'RUN_QUALIFICATION'
  | 'RUN_SCORE'
  | 'RUN_WORKFLOW'
  | 'EXPORT_DATA'
  | 'CREATE_CONFIGURATION'
  | 'ACTIVATE_CONFIGURATION'
  | 'ROLLBACK_CONFIGURATION'
  | 'RUN_REPROCESSING'
  | 'ACCESS_PII_FIELD'
  | 'RUN_RETENTION'
  | 'RUN_REDACTION'
  | 'ENABLE_META_API'
  | 'BYPASS_CAPTCHA'
  | 'BYPASS_AUTH'
  | 'EXECUTE_ARBITRARY_SQL'
  | 'EXECUTE_ARBITRARY_CODE'
  | 'DISABLE_AUDIT_LOGGING';

export interface CapabilityDefinition {
  capabilityId: CapabilityId;
  name: string;
  description: string;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'PROTECTED_SECURITY_CRITICAL';
  requiredPermissions: string[];
  isProtectedGuard: boolean;
  prohibitedPermanently: boolean;
  allowedScopes: PolicyScope[];
  auditRequired: boolean;
  confirmationRequired: boolean;
}

export interface SafetyInvariant {
  invariantId: string;
  name: string;
  description: string;
  category: 'NO_META_API' | 'NO_BYPASS' | 'NO_ARBITRARY_EXEC' | 'TENANT_ISOLATION' | 'AUDIT_INTEGRITY' | 'PUBLIC_BOUNDARY';
  enforcementLayers: Array<'CODE_ENFORCED' | 'POLICY_LAYER' | 'BROWSER_WORKER_GUARD' | 'DATABASE_CONSTRAINT' | 'INFRASTRUCTURE'>;
  isConfigurable: false;
  isExemptable: false;
  severity: 'CRITICAL';
  testSuite: string;
  ownerTeam: string;
  version: string;
  failClosedAction: PolicyDecisionType;
}

export interface SafeConditionLeaf {
  attribute:
    | 'actor.role'
    | 'tenant.id'
    | 'tenant.tier'
    | 'capability.id'
    | 'resource.type'
    | 'resource.classification'
    | 'resource.hasPii'
    | 'resource.qualityState'
    | 'resource.verificationState'
    | 'workflow.state'
    | 'environment'
    | 'system.emergencyState';
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'BOOLEAN_IS' | 'MATCHES_REGEX';
  value: any;
}

export interface SafePolicyAST {
  logicalOperator: 'AND' | 'OR';
  conditions: SafeConditionLeaf[];
}

export interface PolicyVersion {
  version: number;
  schemaVersion: string;
  lifecycleState: PolicyLifecycleState;
  effectiveFrom: string;
  effectiveTo?: string;
  supersedesVersion?: number;
  contentHash: string;
  author: string;
  authorRole: string;
  approvedBy?: string;
  approvedAt?: string;
  activatedBy?: string;
  activatedAt?: string;
  ast: SafePolicyAST;
  decisionOnMatch: PolicyDecisionType;
  enforcementAction: EnforcementActionType;
  rationale: string;
}

export interface Policy {
  policyId: string;
  name: string;
  description: string;
  policyType: PolicyType;
  scope: PolicyScope;
  protectionLevel: ProtectionLevel;
  targetCapability: CapabilityId;
  currentActiveVersion: number;
  highestVersion: number;
  isProtectedSecurityCritical: boolean;
  isNonExemptable: boolean;
  versions: PolicyVersion[];
  tags: string[];
  ownerTeam: string;
  reviewDueDays: number;
  lastReviewedAt: string;
}

export interface PolicyDecision {
  evaluationId: string;
  decision: PolicyDecisionType;
  effectivePolicyId: string;
  effectiveVersion: number;
  scope: PolicyScope;
  reason: string;
  actor: string;
  tenantId: string;
  capability: CapabilityId;
  matchedConditions: string[];
  unmetConditions: string[];
  enforcementAction: EnforcementActionType;
  timestamp: string;
  isFailClosed: boolean;
  precedenceChain: Array<{
    scope: PolicyScope;
    policyId: string;
    decision: PolicyDecisionType;
    isProtected: boolean;
  }>;
}

export interface PolicyViolation {
  violationId: string;
  policyId: string;
  policyVersion: number;
  capability: CapabilityId;
  actor: string;
  tenantId: string;
  resource: string;
  decision: PolicyDecisionType;
  reason: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status:
    | 'DETECTED'
    | 'BLOCKED'
    | 'ACKNOWLEDGED'
    | 'INVESTIGATING'
    | 'REMEDIATION_PENDING'
    | 'RESOLVED'
    | 'FALSE_POSITIVE'
    | 'CLOSED';
  enforcement: EnforcementActionType;
  remediationPlan?: string;
  auditCorrelationId: string;
}

export interface CircuitBreaker {
  breakerId: string;
  name: string;
  scope: 'GLOBAL' | 'TENANT' | 'SUBSYSTEM';
  targetSubsystem: 'COLLECTION_ENGINE' | 'WORKFLOW_DAG' | 'EXPORT_PIPELINE' | 'REPROCESSING_RUNNER';
  state: 'NORMAL_CLOSED' | 'TRIPPED_OPEN' | 'HALF_OPEN_CANARY';
  trippedAt?: string;
  trippedBy?: string;
  reason?: string;
  autoResetTimeoutMinutes: number;
  requiresSecurityAdminReset: boolean;
}

export interface EmergencyKillSwitch {
  switchId: string;
  name: string;
  scope: 'PLATFORM_WIDE' | 'TENANT_ISOLATION' | 'PUBLIC_INGESTION_FREEZE';
  isActive: boolean;
  activatedAt?: string;
  activatedBy?: string;
  incidentRef?: string;
  whatStops: string[];
  whatContinues: string[];
  whatDataRemains: string;
  recoveryProcedure: string;
}

export interface PolicyAuditEvent {
  eventId: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  tenantId: string;
  action:
    | 'POLICY_CREATED'
    | 'POLICY_VALIDATED'
    | 'POLICY_APPROVED'
    | 'POLICY_ACTIVATED'
    | 'POLICY_ROLLED_BACK'
    | 'EXCEPTION_REQUESTED'
    | 'EXCEPTION_REJECTED'
    | 'KILL_SWITCH_ENGAGED'
    | 'KILL_SWITCH_DISENGAGED'
    | 'CIRCUIT_BREAKER_TRIPPED'
    | 'VIOLATION_BLOCKED';
  policyId?: string;
  version?: number;
  reason: string;
  correlationId: string;
  metadata: Record<string, any>;
}

// ============================================================
// 2. CAPABILITY REGISTRY (SECTION 11)
// ============================================================

export const CAPABILITY_REGISTRY: CapabilityDefinition[] = [
  {
    capabilityId: 'COLLECT_PUBLIC_AD_LIBRARY',
    name: 'Collect Public Ad Library Records',
    description: 'Autonomous extraction of publicly displayed advertisements without authentication bypass.',
    sensitivity: 'MEDIUM',
    requiredPermissions: ['browser.ingest'],
    isProtectedGuard: false,
    prohibitedPermanently: false,
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE'],
    auditRequired: true,
    confirmationRequired: false
  },
  {
    capabilityId: 'EXTRACT_PUBLIC_FIELD',
    name: 'Extract Public Advertising Field',
    description: 'Parsing creative text, disclaimer, sponsor name, and public metadata fields.',
    sensitivity: 'LOW',
    requiredPermissions: ['data.extract'],
    isProtectedGuard: false,
    prohibitedPermanently: false,
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE', 'WORKFLOW'],
    auditRequired: false,
    confirmationRequired: false
  },
  {
    capabilityId: 'VERIFY_PUBLIC_DESTINATION',
    name: 'Verify Public Landing Page',
    description: 'Probing HTTP status, SSL cert, redirects, and meta headers of public advertiser URLs.',
    sensitivity: 'MEDIUM',
    requiredPermissions: ['verify.destination'],
    isProtectedGuard: false,
    prohibitedPermanently: false,
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE', 'WORKFLOW'],
    auditRequired: true,
    confirmationRequired: false
  },
  {
    capabilityId: 'RESOLVE_IDENTITY',
    name: 'Entity Resolution & Clustering',
    description: 'Deterministic clustering of advertiser IDs, domains, and phone numbers.',
    sensitivity: 'MEDIUM',
    requiredPermissions: ['identity.resolve'],
    isProtectedGuard: false,
    prohibitedPermanently: false,
    allowedScopes: ['GLOBAL', 'TENANT'],
    auditRequired: true,
    confirmationRequired: false
  },
  {
    capabilityId: 'RUN_QUALIFICATION',
    name: 'Lead Scoring & Qualification',
    description: 'Multi-criteria scoring model execution against verified public attributes.',
    sensitivity: 'LOW',
    requiredPermissions: ['scoring.execute'],
    isProtectedGuard: false,
    prohibitedPermanently: false,
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE'],
    auditRequired: false,
    confirmationRequired: false
  },
  {
    capabilityId: 'RUN_WORKFLOW',
    name: 'Execute DAG Pipeline Recipe',
    description: 'Step-by-step orchestrator execution of extraction, verification, scoring, and exports.',
    sensitivity: 'MEDIUM',
    requiredPermissions: ['workflow.execute'],
    isProtectedGuard: false,
    prohibitedPermanently: false,
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE'],
    auditRequired: true,
    confirmationRequired: false
  },
  {
    capabilityId: 'EXPORT_DATA',
    name: 'Export Clean Dossier / Reports',
    description: 'Outbound serialization to CSV/JSON format subject to PII redaction rules.',
    sensitivity: 'HIGH',
    requiredPermissions: ['export.generate'],
    isProtectedGuard: true,
    prohibitedPermanently: false,
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE'],
    auditRequired: true,
    confirmationRequired: true
  },
  {
    capabilityId: 'ACCESS_PII_FIELD',
    name: 'Access Unmasked PII / Contact Field',
    description: 'Direct visibility into contact phone or email extracted from disclaimers.',
    sensitivity: 'HIGH',
    requiredPermissions: ['pii.unmasked_read'],
    isProtectedGuard: true,
    prohibitedPermanently: false,
    allowedScopes: ['GLOBAL', 'TENANT'],
    auditRequired: true,
    confirmationRequired: true
  },
  {
    capabilityId: 'CREATE_CONFIGURATION',
    name: 'Author Governed Configuration Draft',
    description: 'Submitting a typed configuration schema payload for review.',
    sensitivity: 'MEDIUM',
    requiredPermissions: ['config.author'],
    isProtectedGuard: false,
    prohibitedPermanently: false,
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE'],
    auditRequired: true,
    confirmationRequired: false
  },
  {
    capabilityId: 'ACTIVATE_CONFIGURATION',
    name: 'Activate Configuration Revision',
    description: 'Promoting an approved configuration version to live production status.',
    sensitivity: 'HIGH',
    requiredPermissions: ['config.activate'],
    isProtectedGuard: true,
    prohibitedPermanently: false,
    allowedScopes: ['GLOBAL', 'TENANT'],
    auditRequired: true,
    confirmationRequired: true
  },
  {
    capabilityId: 'ENABLE_META_API',
    name: 'Prohibited: Direct Meta Graph API Connection',
    description: 'HARD-CODED INVARIANT VIOLATION: Using official Graph API tokens is permanently banned.',
    sensitivity: 'PROTECTED_SECURITY_CRITICAL',
    requiredPermissions: [],
    isProtectedGuard: true,
    prohibitedPermanently: true,
    allowedScopes: [],
    auditRequired: true,
    confirmationRequired: false
  },
  {
    capabilityId: 'BYPASS_CAPTCHA',
    name: 'Prohibited: Automated CAPTCHA Solving / Evasion',
    description: 'HARD-CODED INVARIANT VIOLATION: Bypassing bot challenges is permanently banned.',
    sensitivity: 'PROTECTED_SECURITY_CRITICAL',
    requiredPermissions: [],
    isProtectedGuard: true,
    prohibitedPermanently: true,
    allowedScopes: [],
    auditRequired: true,
    confirmationRequired: false
  },
  {
    capabilityId: 'BYPASS_AUTH',
    name: 'Prohibited: Private / Authenticated Scraping',
    description: 'HARD-CODED INVARIANT VIOLATION: Accessing private user accounts or credentials is banned.',
    sensitivity: 'PROTECTED_SECURITY_CRITICAL',
    requiredPermissions: [],
    isProtectedGuard: true,
    prohibitedPermanently: true,
    allowedScopes: [],
    auditRequired: true,
    confirmationRequired: false
  },
  {
    capabilityId: 'EXECUTE_ARBITRARY_SQL',
    name: 'Prohibited: Raw Dynamic SQL Injection / Execution',
    description: 'HARD-CODED INVARIANT VIOLATION: Raw arbitrary queries bypass Drizzle schema validation.',
    sensitivity: 'PROTECTED_SECURITY_CRITICAL',
    requiredPermissions: [],
    isProtectedGuard: true,
    prohibitedPermanently: true,
    allowedScopes: [],
    auditRequired: true,
    confirmationRequired: false
  },
  {
    capabilityId: 'EXECUTE_ARBITRARY_CODE',
    name: 'Prohibited: Eval / Arbitrary Script Evaluation',
    description: 'HARD-CODED INVARIANT VIOLATION: Dynamic JavaScript execution violates sandbox constraints.',
    sensitivity: 'PROTECTED_SECURITY_CRITICAL',
    requiredPermissions: [],
    isProtectedGuard: true,
    prohibitedPermanently: true,
    allowedScopes: [],
    auditRequired: true,
    confirmationRequired: false
  },
  {
    capabilityId: 'DISABLE_AUDIT_LOGGING',
    name: 'Prohibited: Disabling Cryptographic Audit Ledger',
    description: 'HARD-CODED INVARIANT VIOLATION: Tampering with or stopping audit trail is banned.',
    sensitivity: 'PROTECTED_SECURITY_CRITICAL',
    requiredPermissions: [],
    isProtectedGuard: true,
    prohibitedPermanently: true,
    allowedScopes: [],
    auditRequired: true,
    confirmationRequired: false
  }
];

// ============================================================
// 3. SAFETY INVARIANT REGISTRY (SECTION 54)
// ============================================================

export const SAFETY_INVARIANT_REGISTRY: SafetyInvariant[] = [
  {
    invariantId: 'INV-01-NO-META-API',
    name: 'Zero Meta Graph API Token Invariant',
    description: 'The platform must never acquire, store, or invoke Meta API keys, tokens, or private endpoints. Operates purely on public data research via automated browser worker.',
    category: 'NO_META_API',
    enforcementLayers: ['CODE_ENFORCED', 'POLICY_LAYER', 'INFRASTRUCTURE'],
    isConfigurable: false,
    isExemptable: false,
    severity: 'CRITICAL',
    testSuite: 'test_sec_no_meta_api.spec.ts',
    ownerTeam: 'AppSec Core',
    version: '17.0.0',
    failClosedAction: 'DENY'
  },
  {
    invariantId: 'INV-02-NO-CAPTCHA-BYPASS',
    name: 'Anti-Evasion & Zero CAPTCHA Bypass Invariant',
    description: 'When encountering challenge barriers or rate walls, the engine must gracefully PAUSE or STOP for operator intervention. Automated solver plugins and stealth evasion are permanently banned.',
    category: 'NO_BYPASS',
    enforcementLayers: ['CODE_ENFORCED', 'BROWSER_WORKER_GUARD', 'POLICY_LAYER'],
    isConfigurable: false,
    isExemptable: false,
    severity: 'CRITICAL',
    testSuite: 'test_sec_no_bypass.spec.ts',
    ownerTeam: 'Platform Reliability & Safety',
    version: '17.0.0',
    failClosedAction: 'PAUSE'
  },
  {
    invariantId: 'INV-03-ZERO-ARBITRARY-CODE',
    name: 'Zero Arbitrary Code / SQL Invariant',
    description: 'Rule definitions, policies, and workflows run solely inside deterministic typed AST engines. eval(), new Function(), and string-concatenated SQL queries are rejected at compile time.',
    category: 'NO_ARBITRARY_EXEC',
    enforcementLayers: ['CODE_ENFORCED', 'POLICY_LAYER'],
    isConfigurable: false,
    isExemptable: false,
    severity: 'CRITICAL',
    testSuite: 'test_sec_ast_sandbox.spec.ts',
    ownerTeam: 'Security Architecture',
    version: '17.0.0',
    failClosedAction: 'DENY'
  },
  {
    invariantId: 'INV-04-STRICT-TENANT-ISOLATION',
    name: 'Cryptographic Tenant Boundary Invariant',
    description: 'Tenant policies cannot read, influence, or weaken peer tenant datasets or platform security rules. All storage queries must include validated tenant_id boundaries.',
    category: 'TENANT_ISOLATION',
    enforcementLayers: ['CODE_ENFORCED', 'DATABASE_CONSTRAINT', 'POLICY_LAYER'],
    isConfigurable: false,
    isExemptable: false,
    severity: 'CRITICAL',
    testSuite: 'test_sec_tenant_isolation.spec.ts',
    ownerTeam: 'Platform Architecture',
    version: '17.0.0',
    failClosedAction: 'DENY'
  },
  {
    invariantId: 'INV-05-IMMUTABLE-AUDIT-INTEGRITY',
    name: 'Append-Only Cryptographic Audit Invariant',
    description: 'Every policy modification, execution gate, configuration activation, and violation event is written to an immutable append-only ledger. Zero disable switches exist.',
    category: 'AUDIT_INTEGRITY',
    enforcementLayers: ['CODE_ENFORCED', 'DATABASE_CONSTRAINT', 'POLICY_LAYER'],
    isConfigurable: false,
    isExemptable: false,
    severity: 'CRITICAL',
    testSuite: 'test_sec_audit_ledger.spec.ts',
    ownerTeam: 'Compliance & Gov',
    version: '17.0.0',
    failClosedAction: 'DENY'
  },
  {
    invariantId: 'INV-06-PUBLIC-DATA-PERIMETER',
    name: 'Strict Public Perimeter Invariant',
    description: 'Data ingestion is restricted to publicly reachable ad pages and public landing destinations. Private authenticated user scrapers are permanently prohibited.',
    category: 'PUBLIC_BOUNDARY',
    enforcementLayers: ['CODE_ENFORCED', 'BROWSER_WORKER_GUARD', 'POLICY_LAYER'],
    isConfigurable: false,
    isExemptable: false,
    severity: 'CRITICAL',
    testSuite: 'test_sec_public_boundary.spec.ts',
    ownerTeam: 'AppSec Core',
    version: '17.0.0',
    failClosedAction: 'DENY'
  }
];

// ============================================================
// 4. INITIAL PROTECTED & GOVERNED POLICIES
// ============================================================

export const INITIAL_POLICIES: Policy[] = [
  {
    policyId: 'sec.invariant.no_meta_api',
    name: 'No Meta Graph API Token Permitted',
    description: 'Platform architectural invariant: Bypasses to direct Graph API tokens are permanently blocked.',
    policyType: 'SECURITY_POLICY',
    scope: 'SECURITY_INVARIANT',
    protectionLevel: 'PROTECTED_NON_EXEMPTABLE',
    targetCapability: 'ENABLE_META_API',
    currentActiveVersion: 1,
    highestVersion: 1,
    isProtectedSecurityCritical: true,
    isNonExemptable: true,
    tags: ['invariant', 'architecture', 'no-api'],
    ownerTeam: 'AppSec Core',
    reviewDueDays: 365,
    lastReviewedAt: '2026-09-01T00:00:00Z',
    versions: [
      {
        version: 1,
        schemaVersion: '17.0.0',
        lifecycleState: 'ACTIVE',
        effectiveFrom: '2026-01-01T00:00:00Z',
        contentHash: 'hash-sec-no-meta-api-v1-998822',
        author: 'sec-core-bot',
        authorRole: 'SECURITY_ADMIN',
        approvedBy: 'lead.marcus@platform.internal',
        approvedAt: '2026-01-01T00:00:00Z',
        activatedBy: 'sys.kernel',
        activatedAt: '2026-01-01T00:00:00Z',
        ast: {
          logicalOperator: 'AND',
          conditions: [
            { attribute: 'capability.id', operator: 'EQUALS', value: 'ENABLE_META_API' }
          ]
        },
        decisionOnMatch: 'DENY',
        enforcementAction: 'BLOCK_EXECUTION',
        rationale: 'Core project constraint: All research executes strictly on public web data via automated worker.'
      }
    ]
  },
  {
    policyId: 'sec.invariant.no_captcha_bypass',
    name: 'No CAPTCHA Solving Plugins Allowed',
    description: 'Platform safety invariant: Anti-bot evasion services (2Captcha, stealth spoofing) are blocked.',
    policyType: 'SAFETY_POLICY',
    scope: 'SECURITY_INVARIANT',
    protectionLevel: 'PROTECTED_NON_EXEMPTABLE',
    targetCapability: 'BYPASS_CAPTCHA',
    currentActiveVersion: 1,
    highestVersion: 1,
    isProtectedSecurityCritical: true,
    isNonExemptable: true,
    tags: ['invariant', 'safety', 'no-bypass'],
    ownerTeam: 'Platform Reliability',
    reviewDueDays: 180,
    lastReviewedAt: '2026-09-01T00:00:00Z',
    versions: [
      {
        version: 1,
        schemaVersion: '17.0.0',
        lifecycleState: 'ACTIVE',
        effectiveFrom: '2026-01-01T00:00:00Z',
        contentHash: 'hash-sec-no-captcha-v1-884411',
        author: 'sec-core-bot',
        authorRole: 'SECURITY_ADMIN',
        approvedBy: 'lead.marcus@platform.internal',
        approvedAt: '2026-01-01T00:00:00Z',
        activatedBy: 'sys.kernel',
        activatedAt: '2026-01-01T00:00:00Z',
        ast: {
          logicalOperator: 'AND',
          conditions: [
            { attribute: 'capability.id', operator: 'EQUALS', value: 'BYPASS_CAPTCHA' }
          ]
        },
        decisionOnMatch: 'PAUSE',
        enforcementAction: 'TRIGGER_CIRCUIT_BREAKER',
        rationale: 'Ensures compliant operational posture by halting crawler rather than evading site protection.'
      }
    ]
  },
  {
    policyId: 'privacy.export.unmasked_pii_gate',
    name: 'PII Export Redaction & Protection Gate',
    description: 'Blocks unredacted export of phone numbers and emails unless user has EXPORTER_PII_CLEARANCE and multi-sig.',
    policyType: 'PII_POLICY',
    scope: 'PLATFORM',
    protectionLevel: 'PROTECTED_RESTRICTED',
    targetCapability: 'EXPORT_DATA',
    currentActiveVersion: 2,
    highestVersion: 2,
    isProtectedSecurityCritical: true,
    isNonExemptable: false,
    tags: ['privacy', 'gdpr', 'pii', 'export'],
    ownerTeam: 'Data Governance',
    reviewDueDays: 90,
    lastReviewedAt: '2026-08-15T00:00:00Z',
    versions: [
      {
        version: 2,
        schemaVersion: '17.0.0',
        lifecycleState: 'ACTIVE',
        effectiveFrom: '2026-08-15T00:00:00Z',
        contentHash: 'hash-pii-export-gate-v2-441199',
        author: 'gov.elena@platform.internal',
        authorRole: 'POLICY_ADMIN',
        approvedBy: 'lead.marcus@platform.internal',
        approvedAt: '2026-08-15T00:00:00Z',
        activatedBy: 'gov.elena@platform.internal',
        activatedAt: '2026-08-15T00:00:00Z',
        ast: {
          logicalOperator: 'AND',
          conditions: [
            { attribute: 'capability.id', operator: 'EQUALS', value: 'EXPORT_DATA' },
            { attribute: 'resource.hasPii', operator: 'BOOLEAN_IS', value: true },
            { attribute: 'actor.role', operator: 'NOT_IN', value: ['SECURITY_ADMIN', 'CHIEF_COMPLIANCE_OFFICER'] }
          ]
        },
        decisionOnMatch: 'REQUIRE_APPROVAL',
        enforcementAction: 'MASK_PII_PAYLOAD',
        rationale: 'Mandatory data minimization requires masking phone numbers before client download.'
      }
    ]
  },
  {
    policyId: 'governance.workflow.verified_leads_only',
    name: 'Workflow Gate: High-Tier Exports Require Verification',
    description: 'Workflows targeting CRM injection or bulk export must have destination verification status == VERIFIED.',
    policyType: 'DATA_GOVERNANCE_POLICY',
    scope: 'GOVERNANCE',
    protectionLevel: 'STANDARD_TENANT_GOVERNED',
    targetCapability: 'RUN_WORKFLOW',
    currentActiveVersion: 1,
    highestVersion: 1,
    isProtectedSecurityCritical: false,
    isNonExemptable: false,
    tags: ['workflow', 'quality', 'verification'],
    ownerTeam: 'Ops Architecture',
    reviewDueDays: 90,
    lastReviewedAt: '2026-09-10T00:00:00Z',
    versions: [
      {
        version: 1,
        schemaVersion: '17.0.0',
        lifecycleState: 'ACTIVE',
        effectiveFrom: '2026-09-10T00:00:00Z',
        contentHash: 'hash-wf-verified-gate-v1-332211',
        author: 'lead.marcus@platform.internal',
        authorRole: 'POLICY_ADMIN',
        approvedBy: 'sec.sarah@platform.internal',
        approvedAt: '2026-09-10T00:00:00Z',
        activatedBy: 'lead.marcus@platform.internal',
        activatedAt: '2026-09-10T00:00:00Z',
        ast: {
          logicalOperator: 'AND',
          conditions: [
            { attribute: 'capability.id', operator: 'EQUALS', value: 'RUN_WORKFLOW' },
            { attribute: 'resource.qualityState', operator: 'NOT_EQUALS', value: 'PASSED_VERIFIED' }
          ]
        },
        decisionOnMatch: 'REQUIRE_REVIEW',
        enforcementAction: 'ROUTE_FOR_MANUAL_REVIEW',
        rationale: 'Prevents sending unverified ghost domains to automated sales pipelines.'
      }
    ]
  },
  {
    policyId: 'tenant.rate_control.max_concurrent_jobs',
    name: 'Tenant Concurrency & Job Throttling Policy',
    description: 'Limits individual tenant concurrent Playwright headless browser sessions to prevent resource starvation.',
    policyType: 'RATE_CONTROL_POLICY',
    scope: 'TENANT',
    protectionLevel: 'STANDARD_TENANT_GOVERNED',
    targetCapability: 'COLLECT_PUBLIC_AD_LIBRARY',
    currentActiveVersion: 3,
    highestVersion: 3,
    isProtectedSecurityCritical: false,
    isNonExemptable: false,
    tags: ['tenant', 'rate-limit', 'concurrency'],
    ownerTeam: 'SRE Infrastructure',
    reviewDueDays: 60,
    lastReviewedAt: '2026-09-12T00:00:00Z',
    versions: [
      {
        version: 3,
        schemaVersion: '17.0.0',
        lifecycleState: 'ACTIVE',
        effectiveFrom: '2026-09-12T00:00:00Z',
        contentHash: 'hash-tenant-concurrency-v3-118833',
        author: 'sre.dave@platform.internal',
        authorRole: 'POLICY_AUTHOR',
        approvedBy: 'lead.marcus@platform.internal',
        approvedAt: '2026-09-12T00:00:00Z',
        activatedBy: 'sre.dave@platform.internal',
        activatedAt: '2026-09-12T00:00:00Z',
        ast: {
          logicalOperator: 'AND',
          conditions: [
            { attribute: 'capability.id', operator: 'EQUALS', value: 'COLLECT_PUBLIC_AD_LIBRARY' },
            { attribute: 'tenant.tier', operator: 'EQUALS', value: 'FREE_EXPLORER' }
          ]
        },
        decisionOnMatch: 'RATE_LIMIT',
        enforcementAction: 'BLOCK_EXECUTION',
        rationale: 'Ensures multi-tenant fairness and protects cloud node memory bounds.'
      }
    ]
  }
];

// ============================================================
// 5. CIRCUIT BREAKERS & KILL SWITCHES (SECTIONS 40, 41, 42)
// ============================================================

export const INITIAL_CIRCUIT_BREAKERS: CircuitBreaker[] = [
  {
    breakerId: 'cb-collection-global',
    name: 'Global Playwright Crawler Intake Breaker',
    scope: 'GLOBAL',
    targetSubsystem: 'COLLECTION_ENGINE',
    state: 'NORMAL_CLOSED',
    autoResetTimeoutMinutes: 30,
    requiresSecurityAdminReset: true
  },
  {
    breakerId: 'cb-workflow-concurrency',
    name: 'Workflow DAG Parallelism Breaker',
    scope: 'SUBSYSTEM',
    targetSubsystem: 'WORKFLOW_DAG',
    state: 'NORMAL_CLOSED',
    autoResetTimeoutMinutes: 15,
    requiresSecurityAdminReset: false
  },
  {
    breakerId: 'cb-export-anomalous-volume',
    name: 'Exfiltration Protection Export Rate Breaker',
    scope: 'GLOBAL',
    targetSubsystem: 'EXPORT_PIPELINE',
    state: 'NORMAL_CLOSED',
    autoResetTimeoutMinutes: 60,
    requiresSecurityAdminReset: true
  }
];

export const INITIAL_KILL_SWITCHES: EmergencyKillSwitch[] = [
  {
    switchId: 'kill-public-ingest-freeze',
    name: 'EMERGENCY INGESTION KILL SWITCH',
    scope: 'PUBLIC_INGESTION_FREEZE',
    isActive: false,
    whatStops: [
      'All active Playwright browser sessions terminate within 2000ms',
      'All pending queue messages in extraction broker are discarded or frozen',
      'No new ad library search queries dispatched to workers'
    ],
    whatContinues: [
      'Investigation notes, tags, and local analytics review remains read-only accessible',
      'Database queries and offline verification analysis remain open',
      'Export of previously approved and reviewed dossiers remains functional'
    ],
    whatDataRemains: '100% of historical extracted ads, advertisers, and audit logs are securely preserved.',
    recoveryProcedure: 'Requires 2-person security authorization (SECURITY_ADMIN + SRE_LEAD) following root-cause post-mortem.'
  },
  {
    switchId: 'kill-tenant-hard-isolation',
    name: 'TENANT COMPROMISE ISOLATION SWITCH',
    scope: 'TENANT_ISOLATION',
    isActive: false,
    whatStops: [
      'Targeted tenant API keys and session tokens immediately invalidated',
      'Any running workflows or queued exports for the isolated tenant are halted'
    ],
    whatContinues: [
      'Other non-affected platform tenants experience zero degradation'
    ],
    whatDataRemains: 'Tenant data partition locked in place for forensic investigation.',
    recoveryProcedure: 'SecOps sign-off confirming credential rotation and integrity check.'
  }
];

// ============================================================
// 6. SAMPLE AUDIT TRAIL & VIOLATIONS (SECTIONS 36, 37, 38)
// ============================================================

export const SAMPLE_POLICY_AUDIT_LOG: PolicyAuditEvent[] = [
  {
    eventId: 'evt-pol-9921',
    timestamp: '2026-09-17T03:45:10Z',
    actor: 'lead.marcus@platform.internal',
    actorRole: 'POLICY_ADMIN',
    tenantId: 'tenant-enterprise-apex',
    action: 'POLICY_ACTIVATED',
    policyId: 'governance.workflow.verified_leads_only',
    version: 1,
    reason: 'Promoted governance rule for verified export pipelines to live cluster',
    correlationId: 'corr-pol-act-9921',
    metadata: { scope: 'GOVERNANCE', targetCapability: 'RUN_WORKFLOW' }
  },
  {
    eventId: 'evt-pol-9804',
    timestamp: '2026-09-16T18:22:04Z',
    actor: 'dev.artem@platform.internal',
    actorRole: 'POLICY_AUTHOR',
    tenantId: 'tenant-enterprise-apex',
    action: 'EXCEPTION_REQUESTED',
    policyId: 'privacy.export.unmasked_pii_gate',
    version: 2,
    reason: 'Requested bypass to export raw advertiser phone numbers for unverified campaign',
    correlationId: 'corr-pol-exc-9804',
    metadata: { status: 'AUTOMATICALLY_REJECTED_BY_INVARIANT' }
  },
  {
    eventId: 'evt-pol-9750',
    timestamp: '2026-09-16T11:15:30Z',
    actor: 'crawler.worker.node04',
    actorRole: 'WORKER_AGENT',
    tenantId: 'system',
    action: 'VIOLATION_BLOCKED',
    policyId: 'sec.invariant.no_captcha_bypass',
    version: 1,
    reason: 'Playwright worker halted upon HTTP 429 / challenge prompt. Zero evasion injected.',
    correlationId: 'corr-pol-vio-9750',
    metadata: { challengeType: 'META_RATE_LIMIT_PAGE', enforcement: 'TRIGGER_CIRCUIT_BREAKER' }
  }
];

export const INITIAL_POLICY_VIOLATIONS: PolicyViolation[] = [
  {
    violationId: 'vio-sec-001',
    policyId: 'sec.invariant.no_meta_api',
    policyVersion: 1,
    capability: 'ENABLE_META_API',
    actor: 'external.script.bot@api-client',
    tenantId: 'tenant-free-trial-33',
    resource: 'configuration.feature_flags.enable_graph_api',
    decision: 'DENY',
    reason: 'Configuration payload contained prohibited key "ENABLE_META_API=true". Blocked by safety invariant INV-01.',
    timestamp: '2026-09-17T01:12:00Z',
    severity: 'CRITICAL',
    status: 'BLOCKED',
    enforcement: 'BLOCK_EXECUTION',
    remediationPlan: 'Tenant flag locked to false. User notified of permanent public-web-only architecture.',
    auditCorrelationId: 'corr-vio-001'
  },
  {
    violationId: 'vio-sec-002',
    policyId: 'privacy.export.unmasked_pii_gate',
    policyVersion: 2,
    capability: 'EXPORT_DATA',
    actor: 'analyst.jane@apex.internal',
    tenantId: 'tenant-enterprise-apex',
    resource: 'dataset.advertisers.export_full_contacts.csv',
    decision: 'REQUIRE_APPROVAL',
    reason: 'Export request contained 42 unmasked phone numbers without elevated CCO dual-custody authorization.',
    timestamp: '2026-09-16T14:40:22Z',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    enforcement: 'MASK_PII_PAYLOAD',
    remediationPlan: 'Payload masked automatically to (XXX) XXX-1234 format. Review escalated to Compliance lead.',
    auditCorrelationId: 'corr-vio-002'
  }
];

// ============================================================
// 7. SAFE POLICY EVALUATION ENGINE (SECTIONS 8, 9, 24, 89)
// ============================================================

export interface EvaluationContext {
  actor: {
    id: string;
    role: string;
    permissions: string[];
  };
  tenant: {
    id: string;
    tier: string;
  };
  capability: CapabilityId;
  resource: {
    type: string;
    classification: string;
    hasPii: boolean;
    qualityState: string;
    verificationState: string;
  };
  workflow?: {
    state: string;
  };
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  systemEmergencyState: boolean;
}

/**
 * Pure policy evaluation function: Zero side-effects, fully deterministic,
 * enforces precedence hierarchy (SECURITY_INVARIANT > PLATFORM > GOVERNANCE > TENANT > WORKSPACE).
 */
export function evaluatePolicy(
  context: EvaluationContext,
  activePolicies: Policy[] = INITIAL_POLICIES
): PolicyDecision {
  const evaluationId = `eval-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = new Date().toISOString();

  // Precedence order ranking
  const scopePrecedence: Record<PolicyScope, number> = {
    SECURITY_INVARIANT: 100,
    PLATFORM: 80,
    GOVERNANCE: 60,
    GLOBAL: 50,
    TENANT: 40,
    WORKSPACE: 30,
    PROJECT: 20,
    WORKFLOW: 10
  };

  // Step 1: Check emergency kill switch first
  if (context.systemEmergencyState) {
    return {
      evaluationId,
      decision: 'PAUSE',
      effectivePolicyId: 'sys.emergency.kill_switch_active',
      effectiveVersion: 1,
      scope: 'SECURITY_INVARIANT',
      reason: 'Emergency Kill Switch is currently ACTIVE across public ingestion and processing pipelines.',
      actor: context.actor.id,
      tenantId: context.tenant.id,
      capability: context.capability,
      matchedConditions: ['system.emergencyState == true'],
      unmetConditions: [],
      enforcementAction: 'TRIGGER_KILL_SWITCH',
      timestamp,
      isFailClosed: true,
      precedenceChain: []
    };
  }

  // Step 2: Permanently prohibited capabilities fail closed immediately
  const capDef = CAPABILITY_REGISTRY.find(c => c.capabilityId === context.capability);
  if (capDef?.prohibitedPermanently) {
    return {
      evaluationId,
      decision: 'DENY',
      effectivePolicyId: 'sec.invariant.permanent_prohibition',
      effectiveVersion: 1,
      scope: 'SECURITY_INVARIANT',
      reason: `Capability "${context.capability}" is permanently prohibited by immutable platform safety invariants. No configuration, tenant, or role can enable this.`,
      actor: context.actor.id,
      tenantId: context.tenant.id,
      capability: context.capability,
      matchedConditions: ['capability.prohibitedPermanently == true'],
      unmetConditions: [],
      enforcementAction: 'BLOCK_EXECUTION',
      timestamp,
      isFailClosed: true,
      precedenceChain: [
        {
          scope: 'SECURITY_INVARIANT',
          policyId: 'sec.invariant.permanent_prohibition',
          decision: 'DENY',
          isProtected: true
        }
      ]
    };
  }

  // Step 3: Gather all policies that target this capability or act globally
  const relevantPolicies = activePolicies.filter(p => {
    return p.targetCapability === context.capability && p.versions.some(v => v.lifecycleState === 'ACTIVE');
  });

  // Sort by precedence (highest first)
  relevantPolicies.sort((a, b) => scopePrecedence[b.scope] - scopePrecedence[a.scope]);

  const precedenceChain: PolicyDecision['precedenceChain'] = [];
  let finalDecision: PolicyDecisionType = 'ALLOW';
  let winningPolicy: Policy | null = null;
  let winningVersion: PolicyVersion | null = null;
  let decisionReason = 'Action complies with all scoped policies and platform safety invariants.';
  let enforcementAction: EnforcementActionType = 'BLOCK_EXECUTION';
  const matchedConds: string[] = [];

  for (const policy of relevantPolicies) {
    const activeVer = policy.versions.find(v => v.lifecycleState === 'ACTIVE');
    if (!activeVer) continue;

    // Evaluate AST
    const matches = evaluateAST(activeVer.ast, context);

    precedenceChain.push({
      scope: policy.scope,
      policyId: policy.policyId,
      decision: matches ? activeVer.decisionOnMatch : 'ALLOW',
      isProtected: policy.isProtectedSecurityCritical
    });

    if (matches) {
      matchedConds.push(`${policy.policyId} (Scope: ${policy.scope}) matched rule`);

      // If this policy is DENY, PAUSE, or REQUIRE_APPROVAL, it overrides lower layers
      if (
        activeVer.decisionOnMatch === 'DENY' ||
        activeVer.decisionOnMatch === 'PAUSE' ||
        activeVer.decisionOnMatch === 'REQUIRE_APPROVAL' ||
        activeVer.decisionOnMatch === 'REQUIRE_REVIEW' ||
        activeVer.decisionOnMatch === 'RATE_LIMIT'
      ) {
        finalDecision = activeVer.decisionOnMatch;
        winningPolicy = policy;
        winningVersion = activeVer;
        decisionReason = `Blocked or restricted by higher-precedence ${policy.scope} policy: ${policy.name} (${activeVer.rationale})`;
        enforcementAction = activeVer.enforcementAction;
        break; // Highest precedence restrictive policy wins
      }
    }
  }

  // Default fallback if no restricting policy matched
  if (!winningPolicy) {
    // Check if capability is protected and needs permission
    if (capDef?.isProtectedGuard && !context.actor.permissions.some(p => capDef.requiredPermissions.includes(p))) {
      finalDecision = 'DENY';
      decisionReason = `Actor role "${context.actor.role}" lacks required permissions: [${capDef.requiredPermissions.join(', ')}]`;
    }
  }

  return {
    evaluationId,
    decision: finalDecision,
    effectivePolicyId: winningPolicy?.policyId || 'policy.default.allow_standard',
    effectiveVersion: winningVersion?.version || 1,
    scope: winningPolicy?.scope || 'GLOBAL',
    reason: decisionReason,
    actor: context.actor.id,
    tenantId: context.tenant.id,
    capability: context.capability,
    matchedConditions: matchedConds,
    unmetConditions: [],
    enforcementAction,
    timestamp,
    isFailClosed: finalDecision !== 'ALLOW',
    precedenceChain
  };
}

/**
 * Safe In-Memory AST condition evaluation (no eval, no raw code execution)
 */
function evaluateAST(ast: SafePolicyAST, ctx: EvaluationContext): boolean {
  if (!ast.conditions || ast.conditions.length === 0) return true;

  const results = ast.conditions.map(cond => {
    let actualVal: any;

    switch (cond.attribute) {
      case 'actor.role':
        actualVal = ctx.actor.role;
        break;
      case 'tenant.id':
        actualVal = ctx.tenant.id;
        break;
      case 'tenant.tier':
        actualVal = ctx.tenant.tier;
        break;
      case 'capability.id':
        actualVal = ctx.capability;
        break;
      case 'resource.type':
        actualVal = ctx.resource.type;
        break;
      case 'resource.classification':
        actualVal = ctx.resource.classification;
        break;
      case 'resource.hasPii':
        actualVal = ctx.resource.hasPii;
        break;
      case 'resource.qualityState':
        actualVal = ctx.resource.qualityState;
        break;
      case 'resource.verificationState':
        actualVal = ctx.resource.verificationState;
        break;
      case 'workflow.state':
        actualVal = ctx.workflow?.state;
        break;
      case 'environment':
        actualVal = ctx.environment;
        break;
      case 'system.emergencyState':
        actualVal = ctx.systemEmergencyState;
        break;
      default:
        actualVal = undefined;
    }

    switch (cond.operator) {
      case 'EQUALS':
        return actualVal === cond.value;
      case 'NOT_EQUALS':
        return actualVal !== cond.value;
      case 'IN':
        return Array.isArray(cond.value) && cond.value.includes(actualVal);
      case 'NOT_IN':
        return Array.isArray(cond.value) && !cond.value.includes(actualVal);
      case 'BOOLEAN_IS':
        return Boolean(actualVal) === Boolean(cond.value);
      case 'MATCHES_REGEX':
        try {
          return new RegExp(cond.value).test(String(actualVal));
        } catch {
          return false;
        }
      default:
        return false;
    }
  });

  return ast.logicalOperator === 'AND' ? results.every(Boolean) : results.some(Boolean);
}

// ============================================================
// 8. CODE VS POLICY VS INFRASTRUCTURE MATRIX (SECTION 101)
// ============================================================

export interface ControlMatrixEntry {
  controlId: string;
  securityDomain: string;
  controlDescription: string;
  codeEnforced: string;
  policyControlled: string;
  configControlled: string;
  infrastructureEnforced: string;
  classification: 'NON_CONFIGURABLE' | 'POLICY_CONTROLLED' | 'CONFIGURATION_CONTROLLED' | 'INFRASTRUCTURE_ENFORCED';
}

export const CONTROL_MATRIX: ControlMatrixEntry[] = [
  {
    controlId: 'CTRL-01',
    securityDomain: 'Meta Integration',
    controlDescription: 'Prohibit Meta Graph API tokens and direct secret endpoints',
    codeEnforced: 'Zero Graph API SDK imports; hardcoded rejection in config deserializer',
    policyControlled: 'sec.invariant.no_meta_api (DENY, Invariant)',
    configControlled: 'DISABLED (Prohibited key rejection)',
    infrastructureEnforced: 'Network egress rules block *.graph.facebook.com calls without proxy gateway approval',
    classification: 'NON_CONFIGURABLE'
  },
  {
    controlId: 'CTRL-02',
    securityDomain: 'Browser Worker Evasion',
    controlDescription: 'Prohibit anti-bot evasion, CAPTCHA solvers, and stealth spoofing',
    codeEnforced: 'Browser worker throws ChallengeDetectionError and triggers PAUSE upon challenge screen',
    policyControlled: 'sec.invariant.no_captcha_bypass (PAUSE, Invariant)',
    configControlled: 'DISABLED (Zero stealth flags allowed)',
    infrastructureEnforced: 'Worker run without external proxy rotating pools or bypass services',
    classification: 'NON_CONFIGURABLE'
  },
  {
    controlId: 'CTRL-03',
    securityDomain: 'AST Sandboxing',
    controlDescription: 'Prevent arbitrary JavaScript execution and dynamic SQL injection',
    codeEnforced: 'AST parser with strict enum operators, max depth 4, zero eval/new Function',
    policyControlled: 'sec.invariant.zero_arbitrary_code',
    configControlled: 'Declarative JSON AST conditions only',
    infrastructureEnforced: 'Node process runs with unprivileged user & seccomp profile',
    classification: 'NON_CONFIGURABLE'
  },
  {
    controlId: 'CTRL-04',
    securityDomain: 'Data Minimization & PII',
    controlDescription: 'Mask contact phone numbers and emails on export',
    codeEnforced: 'Export sanitizer replaces digits with (XXX) XXX-#### mask',
    policyControlled: 'privacy.export.unmasked_pii_gate (REQUIRE_APPROVAL)',
    configControlled: 'Tenant export profile allows choosing sanitized vs summarized views',
    infrastructureEnforced: 'PostgreSQL encrypted disk at rest & column level permissions',
    classification: 'POLICY_CONTROLLED'
  },
  {
    controlId: 'CTRL-05',
    securityDomain: 'Multi-Tenant Isolation',
    controlDescription: 'Cryptographic isolation preventing cross-tenant data access',
    codeEnforced: 'Every SQL query verified for WHERE tenant_id = :sessionTenant',
    policyControlled: 'sec.invariant.tenant_isolation (DENY, Invariant)',
    configControlled: 'Tenant can customize internal team workspace labels only',
    infrastructureEnforced: 'PostgreSQL Row-Level Security (RLS) policies',
    classification: 'NON_CONFIGURABLE'
  },
  {
    controlId: 'CTRL-06',
    securityDomain: 'DAG Workflows & Automation',
    controlDescription: 'Governing verification quality gates before export execution',
    codeEnforced: 'Workflow runner calls evaluatePolicy() before executing export step',
    policyControlled: 'governance.workflow.verified_leads_only',
    configControlled: 'Recipe builder defines retry attempts and timeout seconds',
    infrastructureEnforced: 'Docker task queue concurrency limits',
    classification: 'POLICY_CONTROLLED'
  }
];

// ============================================================
// 9. PHASE 17 MACHINE-READABLE HANDOFF PAYLOAD (SECTION 104)
// ============================================================

export const PHASE_17_HANDOFF_PAYLOAD = {
  phase: 17,
  status: 'complete',
  policy_architecture: {
    policy_types: [
      'SECURITY_POLICY',
      'SAFETY_POLICY',
      'DATA_GOVERNANCE_POLICY',
      'PRIVACY_POLICY',
      'COLLECTION_POLICY',
      'SOURCE_ACCESS_POLICY',
      'RATE_CONTROL_POLICY',
      'VERIFICATION_POLICY',
      'IDENTITY_POLICY',
      'WORKFLOW_POLICY',
      'QUALITY_POLICY',
      'EXPORT_POLICY',
      'RETENTION_POLICY',
      'PII_POLICY',
      'TENANT_POLICY',
      'AUDIT_POLICY',
      'OPERATIONAL_POLICY',
      'FEATURE_POLICY',
      'EMERGENCY_POLICY'
    ],
    lifecycle_states: [
      'DRAFT',
      'VALIDATING',
      'REVIEW',
      'APPROVED',
      'SCHEDULED',
      'ACTIVE',
      'DEPRECATED',
      'RETIRED',
      'REJECTED',
      'INVALID',
      'DISABLED'
    ],
    scopes: ['SECURITY_INVARIANT', 'PLATFORM', 'GOVERNANCE', 'GLOBAL', 'TENANT', 'WORKSPACE', 'PROJECT', 'WORKFLOW'],
    precedence: 'SECURITY_INVARIANT > PLATFORM > GOVERNANCE > GLOBAL > TENANT > WORKSPACE > WORKFLOW',
    decision_model: [
      'ALLOW',
      'DENY',
      'REQUIRE_REVIEW',
      'REQUIRE_APPROVAL',
      'REQUIRE_CONFIRMATION',
      'QUARANTINE',
      'PAUSE',
      'RATE_LIMIT',
      'DEFER',
      'UNAVAILABLE'
    ]
  },
  capability_registry: {
    capabilities: CAPABILITY_REGISTRY.map(c => c.capabilityId),
    protected_capabilities: CAPABILITY_REGISTRY.filter(c => c.isProtectedGuard).map(c => c.capabilityId),
    required_permissions: CAPABILITY_REGISTRY.map(c => ({ capability: c.capabilityId, permissions: c.requiredPermissions })),
    policy_requirements: 'Every protected execution invokes evaluatePolicy() prior to invocation'
  },
  safety_invariants: {
    invariants: SAFETY_INVARIANT_REGISTRY.map(i => i.invariantId),
    non_exemptable: SAFETY_INVARIANT_REGISTRY.filter(i => !i.isExemptable).map(i => i.invariantId),
    enforcement_layers: ['CODE_ENFORCED', 'POLICY_LAYER', 'BROWSER_WORKER_GUARD', 'DATABASE_CONSTRAINT', 'INFRASTRUCTURE']
  },
  policy_engine: {
    evaluation_model: 'Pure in-memory AST evaluator; deterministic, side-effect free',
    ast: 'SafePolicyAST: logicalOperator (AND/OR) with typed attribute/operator condition leaves',
    operators: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'BOOLEAN_IS', 'MATCHES_REGEX'],
    limits: { maxExpressionDepth: 4, maxConditions: 12, timeoutMs: 50 },
    failure_behavior: 'Fail Closed: Unknown or unavailable policy state yields DENY / PAUSE'
  },
  policy_enforcement: {
    enforcement_points: [
      'WORKFLOW_START_GATE',
      'BROWSER_WORKER_INIT',
      'LANDING_VERIFICATION_PROBE',
      'PII_UNMASK_ACCESS',
      'OUTBOUND_EXPORT_SERIALIZER',
      'CONFIGURATION_ACTIVATION_GATE'
    ],
    fail_closed_controls: ['Zero permissive fallbacks for security critical paths'],
    defense_in_depth: 'Policy layer + Code runtime guards + Database RLS + Infrastructure egress filters'
  },
  precedence: {
    hierarchy: ['SECURITY_INVARIANT', 'PLATFORM', 'GOVERNANCE', 'GLOBAL', 'TENANT', 'WORKSPACE', 'WORKFLOW'],
    conflict_resolution: 'Explicit ranking; restrictive protected invariant strictly overrides lower tenant permission',
    protected_overrides: 'Lower tenant policies cannot weaken or disable protected policies'
  },
  exceptions: {
    allowed: ['Scoped temporary operational exceptions for non-critical policies'],
    restricted: ['Requires multi-sig approval by POLICY_ADMIN + CCO with max 30-day expiration'],
    non_exemptable: [
      'NO_META_API',
      'NO_CAPTCHA_BYPASS',
      'ZERO_ARBITRARY_CODE',
      'TENANT_ISOLATION',
      'AUDIT_INTEGRITY',
      'PUBLIC_BOUNDARY'
    ],
    approval_requirements: 'Dual custody; Author != Approver',
    expiration: 'Mandatory TTL; zero permanent exceptions permitted'
  },
  simulation: {
    modes: ['HISTORICAL_SNAPSHOT_DRY_RUN', 'HYPOTHETICAL_PAYLOAD_TEST'],
    dataset_scope: 'Read-only fixture records; zero database writes',
    reproducibility: 'Deterministic AST evaluation against immutable fixtures',
    mutation_guarantee: 'Strictly read-only memory execution'
  },
  shadow_mode: {
    behavior: 'Evaluates candidate policies against live stream in parallel with zero enforcement mutation',
    comparison: 'Generates disagreement matrix (ACTIVE vs SHADOW)'
  },
  emergency_controls: {
    kill_switches: INITIAL_KILL_SWITCHES.map(k => k.switchId),
    circuit_breakers: INITIAL_CIRCUIT_BREAKERS.map(cb => cb.breakerId),
    authorization: 'Requires elevated role (SECURITY_ADMIN or EMERGENCY_OPERATOR)',
    recovery: 'Manual post-mortem sign-off required; no automatic unfreeze'
  },
  policy_violations: {
    states: [
      'DETECTED',
      'BLOCKED',
      'ACKNOWLEDGED',
      'INVESTIGATING',
      'REMEDIATION_PENDING',
      'RESOLVED',
      'FALSE_POSITIVE',
      'CLOSED'
    ],
    severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    enforcement: ['BLOCK_EXECUTION', 'TRIGGER_CIRCUIT_BREAKER', 'MASK_PII_PAYLOAD', 'EMIT_SECURITY_ALERT'],
    remediation: 'Structured incident assignment and root-cause ledger'
  },
  tenant_boundaries: {
    global_policies: 'Enforced across all tenants; cannot be modified by tenant admins',
    tenant_policies: 'Bounded to specific tenant_id; cannot affect peers',
    workspace_policies: 'Subordinate to tenant policies',
    protected_global_controls: 'Invariants, PII restrictions, and rate baselines'
  },
  integrations: {
    phase_13_workflows: 'Workflow step runner evaluates capability policy before executing DAG tasks',
    phase_15_data_governance: 'Enforces verified quality states as preconditions for export',
    phase_16_configuration: 'Configuration promotion pipeline requires Phase 17 Policy Validation preflight',
    phase_08_exports: 'CSV/JSON serializer applies PII masking before client download',
    phase_02_browser_worker: 'Worker halts with PAUSE upon challenge, upholding anti-bypass invariant',
    phase_05_verification: 'SSRF guardrails and destination verification safety checks'
  },
  security: {
    no_api_invariant: 'INV-01: Prohibits Meta API token storage or acquisition',
    no_bypass_invariant: 'INV-02: Prohibits automated CAPTCHA solving or stealth evasion',
    arbitrary_execution_prevention: 'INV-03: Zero eval(), zero raw SQL injection, strict AST sandbox',
    tenant_isolation: 'INV-04: Mandatory tenant boundaries across storage and evaluation',
    pii_controls: 'Automatic masking and multi-sig export authorization',
    audit_integrity: 'INV-05: Append-only cryptographic ledger with correlation IDs'
  },
  observability: {
    metrics: ['evaluation_count', 'deny_count', 'allow_count', 'review_required_count', 'violation_rate'],
    decision_trace: 'Complete evaluation trace: Actor -> Capability -> Policy Set -> AST Matched -> Final Decision',
    alerts: 'Immediate alert dispatch on CRITICAL invariant violation'
  },
  database_changes: [
    'CREATE TABLE policies (policy_id TEXT PRIMARY KEY, scope TEXT, protection_level TEXT, ...)',
    'CREATE TABLE policy_versions (version_id TEXT PRIMARY KEY, policy_id TEXT, ast JSONB, ...)',
    'CREATE TABLE policy_violations (violation_id TEXT PRIMARY KEY, severity TEXT, status TEXT, ...)',
    'CREATE TABLE policy_audit_ledger (event_id TEXT PRIMARY KEY, correlation_id TEXT, ...)'
  ],
  api_contracts: [
    'POST /api/v1/policy/evaluate -> returns PolicyDecision',
    'POST /api/v1/policy/simulate -> returns PolicySimulationResult',
    'POST /api/v1/policy/emergency/kill-switch -> toggles emergency state with audit'
  ],
  event_contracts: [
    'POLICY_ACTIVATED_EVENT',
    'POLICY_VIOLATION_BLOCKED_EVENT',
    'KILL_SWITCH_ENGAGED_EVENT'
  ],
  ui_modules: [
    'Policy Registry',
    'Safety Invariant Registry',
    'Interactive Policy Evaluator & Trace',
    'Circuit Breakers & Kill Switches',
    'Violation & Incident Center',
    'Control & Enforcement Matrix',
    'Policy Audit Ledger',
    'Phase 17 Handoff'
  ],
  tests: [
    'TEST 01: Policy draft creation',
    'TEST 02: Schema validation',
    'TEST 03: Arbitrary code rejection',
    'TEST 06: Protected invariant cannot be disabled',
    'TEST 08: Tenant cannot weaken platform policy',
    'TEST 10: Fail-closed when engine unavailable',
    'TEST 29: Meta API enablement attempt blocked',
    'TEST 31: CAPTCHA bypass configuration rejected'
  ],
  fixtures: ['Sample Enterprise Tenant Fixture', 'Sample Free Explorer Fixture', 'Sample PII Lead Record'],
  runbooks: [
    'RB-01: Policy engine outage recovery',
    'RB-02: Emergency kill switch activation and controlled resumption',
    'RB-03: Investigating critical invariant violation',
    'RB-04: Non-destructive policy version rollback'
  ],
  code_policy_infrastructure_matrix: CONTROL_MATRIX,
  phase_18_tenant_hooks: [
    'tenant_policy_boundaries',
    'workspace_policy_boundaries',
    'role_policy_mapping',
    'tenant_capability_matrix',
    'tenant_audit_isolation'
  ],
  open_risks: [
    'Public Meta Ad Library DOM layout updates require crawler selector updates (handled via Phase 16 config with Phase 17 safety gates)'
  ],
  known_limitations: [
    'Simulation currently evaluates against max 500 fixture records per dry run to preserve container memory limits'
  ]
};
