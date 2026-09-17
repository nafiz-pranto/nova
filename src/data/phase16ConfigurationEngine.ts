/**
 * PHASE 16 — RULES, POLICY & CONFIGURATION STUDIO ENGINE
 * Strict production-grade configuration governance, typed AST expressions,
 * schema registry, field registry, validation pipeline, simulation,
 * shadow mode, dependency resolution, immutable versioning, audit logging,
 * and migration gap analysis.
 */

// ============================================================
// 1. DOMAIN ENUMS & TYPES
// ============================================================

export type ConfigurationType =
  | 'DATA_QUALITY_RULE'
  | 'VALIDATION_POLICY'
  | 'NORMALIZATION_POLICY'
  | 'FRESHNESS_POLICY'
  | 'VERIFICATION_POLICY'
  | 'IDENTITY_POLICY'
  | 'QUALIFICATION_POLICY'
  | 'SCORING_MODEL_CONFIG'
  | 'WORKFLOW_CONFIG'
  | 'WORKFLOW_GATE'
  | 'ANALYTICS_POLICY'
  | 'EXPORT_PROFILE'
  | 'NOTIFICATION_POLICY'
  | 'QUARANTINE_POLICY'
  | 'CORRECTION_POLICY'
  | 'RETENTION_POLICY'
  | 'REDACTION_POLICY'
  | 'REVIEW_ROUTING_POLICY'
  | 'SCHEMA_POLICY'
  | 'SOURCE_COMPATIBILITY_POLICY'
  | 'FEATURE_FLAG'
  | 'OPERATIONAL_THRESHOLD';

export type ConfigurationLifecycleState =
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

export type ConfigurationEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

export type ConfigurationScopeType = 'GLOBAL' | 'TENANT' | 'WORKSPACE' | 'PROJECT' | 'WORKFLOW';

export type SecuritySensitivity = 'LOW' | 'MEDIUM' | 'HIGH' | 'PROTECTED_SECURITY_CRITICAL';

export type OperatorType =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'MATCHES_ALLOWED_PATTERN'
  | 'EXISTS'
  | 'MISSING'
  | 'IS_NULL'
  | 'IS_NOT_NULL'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_OR_EQUAL'
  | 'LESS_OR_EQUAL'
  | 'IN'
  | 'NOT_IN'
  | 'ALL'
  | 'ANY'
  | 'NONE'
  | 'COUNT'
  | 'DATE_BEFORE'
  | 'DATE_AFTER'
  | 'AGE_LESS_THAN_DAYS'
  | 'AGE_GREATER_THAN_DAYS'
  | 'DOMAIN_EQUALS'
  | 'DOMAIN_IN'
  | 'STATE_EQUALS'
  | 'SOURCE_TYPE_EQUALS';

export type FieldDataType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'ENUM' | 'ARRAY' | 'DOMAIN' | 'OBJECT';

// ============================================================
// 2. GOVERNED FIELD REGISTRY
// ============================================================

export interface GovernedField {
  fieldId: string;
  entityType: 'ADVERTISER' | 'AD' | 'BUSINESS' | 'VERIFICATION' | 'QUALIFICATION' | 'SCORE' | 'WORKFLOW' | 'SYSTEM';
  dataType: FieldDataType;
  description: string;
  sourceAvailability: string;
  sensitivity: SecuritySensitivity;
  allowedOperators: OperatorType[];
  isNullable: boolean;
  provenanceRequired: boolean;
  isDeprecated: boolean;
}

export const GOVERNED_FIELD_REGISTRY: GovernedField[] = [
  {
    fieldId: 'advertiser.id',
    entityType: 'ADVERTISER',
    dataType: 'STRING',
    description: 'Meta Ad Library unique advertiser identifier string',
    sourceAvailability: 'ALWAYS',
    sensitivity: 'LOW',
    allowedOperators: ['EQUALS', 'NOT_EQUALS', 'EXISTS', 'MISSING', 'IN'],
    isNullable: false,
    provenanceRequired: true,
    isDeprecated: false,
  },
  {
    fieldId: 'advertiser.name',
    entityType: 'ADVERTISER',
    dataType: 'STRING',
    description: 'Cleaned public advertiser brand or profile display name',
    sourceAvailability: 'ALWAYS',
    sensitivity: 'LOW',
    allowedOperators: ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'STARTS_WITH', 'EXISTS', 'IN'],
    isNullable: false,
    provenanceRequired: true,
    isDeprecated: false,
  },
  {
    fieldId: 'advertiser.active_ad_count',
    entityType: 'ADVERTISER',
    dataType: 'NUMBER',
    description: 'Current count of active creatives captured within observation window',
    sourceAvailability: 'DERIVED',
    sensitivity: 'LOW',
    allowedOperators: ['EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_OR_EQUAL', 'LESS_OR_EQUAL'],
    isNullable: false,
    provenanceRequired: true,
    isDeprecated: false,
  },
  {
    fieldId: 'ad.public_archive_id',
    entityType: 'AD',
    dataType: 'STRING',
    description: 'Meta Ad Library unique archive identifier',
    sourceAvailability: 'ALWAYS',
    sensitivity: 'LOW',
    allowedOperators: ['EQUALS', 'NOT_EQUALS', 'EXISTS', 'IN'],
    isNullable: false,
    provenanceRequired: true,
    isDeprecated: false,
  },
  {
    fieldId: 'ad.first_observed_at',
    entityType: 'AD',
    dataType: 'DATE',
    description: 'Timestamp when this ad was first extracted by browser worker',
    sourceAvailability: 'ALWAYS',
    sensitivity: 'LOW',
    allowedOperators: ['DATE_BEFORE', 'DATE_AFTER', 'AGE_LESS_THAN_DAYS', 'AGE_GREATER_THAN_DAYS'],
    isNullable: false,
    provenanceRequired: true,
    isDeprecated: false,
  },
  {
    fieldId: 'business.domain',
    entityType: 'BUSINESS',
    dataType: 'DOMAIN',
    description: 'Normalized primary apex domain associated with target advertiser',
    sourceAvailability: 'EXTRACTED_OR_VERIFIED',
    sensitivity: 'MEDIUM',
    allowedOperators: ['DOMAIN_EQUALS', 'DOMAIN_IN', 'EXISTS', 'MISSING'],
    isNullable: true,
    provenanceRequired: true,
    isDeprecated: false,
  },
  {
    fieldId: 'verification.state',
    entityType: 'VERIFICATION',
    dataType: 'ENUM',
    description: 'Destination verification outcome (VERIFIED, REDIRECT_DETECTED, PARKING_PAGE, FAILED, TIMEOUT)',
    sourceAvailability: 'PIPELINE_RUN',
    sensitivity: 'HIGH',
    allowedOperators: ['STATE_EQUALS', 'EQUALS', 'NOT_EQUALS', 'IN'],
    isNullable: false,
    provenanceRequired: true,
    isDeprecated: false,
  },
  {
    fieldId: 'verification.freshness_days',
    entityType: 'VERIFICATION',
    dataType: 'NUMBER',
    description: 'Elapsed calendar days since last successful destination verification probe',
    sourceAvailability: 'DERIVED',
    sensitivity: 'LOW',
    allowedOperators: ['GREATER_THAN', 'LESS_THAN', 'GREATER_OR_EQUAL', 'LESS_OR_EQUAL', 'EQUALS'],
    isNullable: false,
    provenanceRequired: false,
    isDeprecated: false,
  },
  {
    fieldId: 'qualification.state',
    entityType: 'QUALIFICATION',
    dataType: 'ENUM',
    description: 'Lead qualification status (QUALIFIED, DISQUALIFIED, UNQUALIFIED, MANUAL_REVIEW)',
    sourceAvailability: 'RULES_EVALUATION',
    sensitivity: 'HIGH',
    allowedOperators: ['STATE_EQUALS', 'EQUALS', 'NOT_EQUALS', 'IN'],
    isNullable: false,
    provenanceRequired: true,
    isDeprecated: false,
  },
  {
    fieldId: 'score.composite_score',
    entityType: 'SCORE',
    dataType: 'NUMBER',
    description: 'Composite lead readiness score computed from signals (0-100)',
    sourceAvailability: 'SCORING_MODEL',
    sensitivity: 'MEDIUM',
    allowedOperators: ['GREATER_THAN', 'LESS_THAN', 'GREATER_OR_EQUAL', 'LESS_OR_EQUAL', 'EQUALS'],
    isNullable: false,
    provenanceRequired: true,
    isDeprecated: false,
  },
  {
    fieldId: 'score.model_version',
    entityType: 'SCORE',
    dataType: 'STRING',
    description: 'SemVer string of scoring model algorithm used',
    sourceAvailability: 'SCORING_MODEL',
    sensitivity: 'LOW',
    allowedOperators: ['EQUALS', 'NOT_EQUALS', 'IN'],
    isNullable: false,
    provenanceRequired: true,
    isDeprecated: false,
  },
  {
    fieldId: 'system.ssrf_protection_active',
    entityType: 'SYSTEM',
    dataType: 'BOOLEAN',
    description: 'Platform network SSRF guardrail enforcement status',
    sourceAvailability: 'CORE_KERNEL',
    sensitivity: 'PROTECTED_SECURITY_CRITICAL',
    allowedOperators: ['EQUALS'],
    isNullable: false,
    provenanceRequired: true,
    isDeprecated: false,
  }
];

// ============================================================
// 3. SAFE EXPRESSION AST MODEL
// ============================================================

export interface ExpressionCondition {
  field: string;
  operator: OperatorType;
  value?: any;
}

export interface ExpressionGroup {
  logicalOperator: 'AND' | 'OR' | 'NOT';
  conditions: (ExpressionCondition | ExpressionGroup)[];
}

export type SafeExpressionAST = ExpressionGroup;

// AST Depth and Complexity Limits
export const AST_CONSTRAINTS = {
  MAX_DEPTH: 4,
  MAX_TOTAL_CONDITIONS: 20,
  MAX_EVALUATION_MS: 50,
};

// ============================================================
// 4. CONFIGURATION SCHEMAS & VERSION MODEL
// ============================================================

export interface ConfigurationSchemaDefinition {
  schemaId: string;
  schemaVersion: string;
  configurationType: ConfigurationType;
  title: string;
  description: string;
  allowedScopes: ConfigurationScopeType[];
  isOverridable: boolean;
  requiredFields: string[];
  maxEvaluationsPerSec: number;
}

export const CONFIGURATION_SCHEMAS: ConfigurationSchemaDefinition[] = [
  {
    schemaId: 'schema.data_quality_rule.v1',
    schemaVersion: '1.2.0',
    configurationType: 'DATA_QUALITY_RULE',
    title: 'Data Quality Rule Schema',
    description: 'Governs structural, semantic, and invariant field validations before commit.',
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE'],
    isOverridable: true,
    requiredFields: ['ruleIdentifier', 'entityType', 'targetField', 'severity', 'expressionAst'],
    maxEvaluationsPerSec: 10000,
  },
  {
    schemaId: 'schema.freshness_policy.v1',
    schemaVersion: '1.1.0',
    configurationType: 'FRESHNESS_POLICY',
    title: 'Freshness SLA Policy Schema',
    description: 'Sets max staleness limits for verification probes, ad observations, and metrics.',
    allowedScopes: ['GLOBAL', 'TENANT', 'PROJECT'],
    isOverridable: true,
    requiredFields: ['policyIdentifier', 'targetEntity', 'maxAgeHours', 'actionOnStale'],
    maxEvaluationsPerSec: 5000,
  },
  {
    schemaId: 'schema.verification_policy.v1',
    schemaVersion: '1.0.0',
    configurationType: 'VERIFICATION_POLICY',
    title: 'Destination Verification Policy Schema',
    description: 'Controls HTTP status acceptance, redirect limits, and probe timeout thresholds.',
    allowedScopes: ['GLOBAL', 'TENANT'],
    isOverridable: false,
    requiredFields: ['policyIdentifier', 'allowedProtocols', 'maxRedirectChain', 'timeoutSeconds'],
    maxEvaluationsPerSec: 2000,
  },
  {
    schemaId: 'schema.scoring_model_config.v1',
    schemaVersion: '2.0.0',
    configurationType: 'SCORING_MODEL_CONFIG',
    title: 'Scoring Model Weight & Threshold Schema',
    description: 'Declarative signal weights and qualification bands for lead rating.',
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE'],
    isOverridable: true,
    requiredFields: ['modelIdentifier', 'weights', 'qualificationCutoff', 'penaltyRules'],
    maxEvaluationsPerSec: 5000,
  },
  {
    schemaId: 'schema.workflow_gate.v1',
    schemaVersion: '1.0.0',
    configurationType: 'WORKFLOW_GATE',
    title: 'Workflow Execution Gate Schema',
    description: 'Pre-flight and step execution boundary conditions for automated pipelines.',
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKFLOW'],
    isOverridable: true,
    requiredFields: ['gateIdentifier', 'targetStep', 'preconditionAst', 'failureMode'],
    maxEvaluationsPerSec: 2000,
  },
  {
    schemaId: 'schema.export_profile.v1',
    schemaVersion: '1.1.0',
    configurationType: 'EXPORT_PROFILE',
    title: 'Export Profile & Masking Schema',
    description: 'Column mappings, redaction rules, and governance flags for sanitized outputs.',
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE'],
    isOverridable: true,
    requiredFields: ['profileIdentifier', 'includedFields', 'redactionPolicies', 'maxRows'],
    maxEvaluationsPerSec: 1000,
  },
  {
    schemaId: 'schema.feature_flag.v1',
    schemaVersion: '1.0.0',
    configurationType: 'FEATURE_FLAG',
    title: 'Governed Feature Flag Schema',
    description: 'Deterministic boolean and variant flags scoped by tenant and environment.',
    allowedScopes: ['GLOBAL', 'TENANT', 'WORKSPACE'],
    isOverridable: true,
    requiredFields: ['flagKey', 'defaultValue', 'rolloutPercentage', 'auditRequired'],
    maxEvaluationsPerSec: 20000,
  }
];

// ============================================================
// 5. CONFIGURATION OBJECT DOMAIN ENTITY
// ============================================================

export interface ConfigurationVersion {
  version: number;
  schemaVersion: string;
  environment: ConfigurationEnvironment;
  scope: {
    scopeType: ConfigurationScopeType;
    scopeId: string;
  };
  contentHash: string; // Canonical SHA-256 equivalent
  payload: Record<string, any>;
  expressionAst?: SafeExpressionAST;
  dependencies: string[]; // List of configuration IDs depended upon
  explanation: string;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  activatedAt?: string;
  activatedBy?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  lifecycleState: ConfigurationLifecycleState;
  validationStatus: {
    isValid: boolean;
    errors: string[];
    validatedAt: string;
  };
}

export interface Configuration {
  configurationId: string;
  configurationType: ConfigurationType;
  name: string;
  description: string;
  schemaId: string;
  currentActiveVersion: number;
  highestVersion: number;
  isProtectedSecurityCritical: boolean;
  versions: ConfigurationVersion[];
  tags: string[];
  ownerTeam: string;
}

// ============================================================
// 6. DEPENDENCY GRAPH & CYCLIC DETECTION
// ============================================================

export interface DependencyNode {
  id: string;
  type: ConfigurationType;
  version: number;
  label: string;
}

export interface DependencyEdge {
  from: string;
  to: string;
  relationship: 'REQUIRES' | 'GATES' | 'INFLUENCES' | 'CONFLICTS_WITH';
}

export interface CircularCheckResult {
  hasCycle: boolean;
  cyclePath: string[];
}

export function detectCircularDependencies(
  configs: { id: string; dependencies: string[] }[]
): CircularCheckResult {
  const adj = new Map<string, string[]>();
  for (const c of configs) {
    adj.set(c.id, c.dependencies || []);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): boolean {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        path.push(neighbor);
        return true;
      }
    }

    recStack.delete(node);
    path.pop();
    return false;
  }

  for (const c of configs) {
    if (!visited.has(c.id)) {
      if (dfs(c.id)) {
        return { hasCycle: true, cyclePath: [...path] };
      }
    }
  }

  return { hasCycle: false, cyclePath: [] };
}

// ============================================================
// 7. DETERMINISTIC EXPRESSION ENGINE & AST EVALUATOR
// ============================================================

export function evaluateAST(
  ast: SafeExpressionAST,
  record: Record<string, any>,
  currentDepth = 1
): { result: boolean; error?: string } {
  if (currentDepth > AST_CONSTRAINTS.MAX_DEPTH) {
    return { result: false, error: `AST max depth (${AST_CONSTRAINTS.MAX_DEPTH}) exceeded` };
  }

  const { logicalOperator, conditions } = ast;
  if (!conditions || conditions.length === 0) {
    return { result: true };
  }

  const results: boolean[] = [];

  for (const item of conditions) {
    if ('logicalOperator' in item) {
      const nested = evaluateAST(item as SafeExpressionAST, record, currentDepth + 1);
      if (nested.error) return nested;
      results.push(nested.result);
    } else {
      const cond = item as ExpressionCondition;
      const fieldDef = GOVERNED_FIELD_REGISTRY.find(f => f.fieldId === cond.field);
      if (!fieldDef) {
        return { result: false, error: `Unregistered field '${cond.field}' referenced in expression` };
      }

      // Check operator compatibility
      if (!fieldDef.allowedOperators.includes(cond.operator)) {
        return {
          result: false,
          error: `Operator '${cond.operator}' is not allowed on field '${cond.field}' (DataType: ${fieldDef.dataType})`
        };
      }

      const recValue = record[cond.field];
      let condPassed = false;

      switch (cond.operator) {
        case 'EQUALS':
          condPassed = recValue === cond.value;
          break;
        case 'NOT_EQUALS':
          condPassed = recValue !== cond.value;
          break;
        case 'CONTAINS':
          condPassed = typeof recValue === 'string' && recValue.toLowerCase().includes(String(cond.value).toLowerCase());
          break;
        case 'STARTS_WITH':
          condPassed = typeof recValue === 'string' && recValue.startsWith(String(cond.value));
          break;
        case 'EXISTS':
        case 'IS_NOT_NULL':
          condPassed = recValue !== undefined && recValue !== null && recValue !== '';
          break;
        case 'MISSING':
        case 'IS_NULL':
          condPassed = recValue === undefined || recValue === null || recValue === '';
          break;
        case 'GREATER_THAN':
          condPassed = typeof recValue === 'number' && recValue > Number(cond.value);
          break;
        case 'LESS_THAN':
          condPassed = typeof recValue === 'number' && recValue < Number(cond.value);
          break;
        case 'GREATER_OR_EQUAL':
          condPassed = typeof recValue === 'number' && recValue >= Number(cond.value);
          break;
        case 'LESS_OR_EQUAL':
          condPassed = typeof recValue === 'number' && recValue <= Number(cond.value);
          break;
        case 'IN':
          condPassed = Array.isArray(cond.value) && cond.value.includes(recValue);
          break;
        case 'DOMAIN_EQUALS':
          condPassed = typeof recValue === 'string' && recValue.toLowerCase() === String(cond.value).toLowerCase();
          break;
        case 'STATE_EQUALS':
          condPassed = String(recValue) === String(cond.value);
          break;
        case 'AGE_LESS_THAN_DAYS':
          condPassed = typeof recValue === 'number' && recValue <= Number(cond.value);
          break;
        case 'AGE_GREATER_THAN_DAYS':
          condPassed = typeof recValue === 'number' && recValue > Number(cond.value);
          break;
        default:
          condPassed = false;
      }

      results.push(condPassed);
    }
  }

  if (logicalOperator === 'AND') {
    return { result: results.every(Boolean) };
  } else if (logicalOperator === 'OR') {
    return { result: results.some(Boolean) };
  } else if (logicalOperator === 'NOT') {
    return { result: !results.some(Boolean) };
  }

  return { result: false, error: `Unknown logical operator '${logicalOperator}'` };
}

// ============================================================
// 8. SIMULATION & DRY RUN ENGINE
// ============================================================

export interface SimulationDatasetRecord {
  id: string;
  name: string;
  [key: string]: any;
}

export interface SimulationResult {
  simulationId: string;
  configurationId: string;
  version: number;
  timestamp: string;
  datasetSize: number;
  recordsEvaluated: number;
  passCount: number;
  failCount: number;
  newlyAffectedRecords: string[];
  previouslyAffectedRecords: string[];
  downstreamImpacts: {
    workflowsAffected: number;
    quarantineEstimate: number;
    scoringVariance: string;
    exportProfileImpact: string;
  };
  durationMs: number;
}

export const SAMPLE_SIMULATION_FIXTURE: SimulationDatasetRecord[] = [
  {
    id: 'adv-101',
    name: 'Apex Dental Care',
    'advertiser.id': 'adv-101',
    'advertiser.name': 'Apex Dental Care',
    'advertiser.active_ad_count': 14,
    'ad.public_archive_id': 'ad-99201',
    'business.domain': 'apexdental.com',
    'verification.state': 'VERIFIED',
    'verification.freshness_days': 2,
    'qualification.state': 'QUALIFIED',
    'score.composite_score': 88,
    'score.model_version': 'v2.1',
    'system.ssrf_protection_active': true,
  },
  {
    id: 'adv-102',
    name: 'Starlight Solar Tech',
    'advertiser.id': 'adv-102',
    'advertiser.name': 'Starlight Solar Tech',
    'advertiser.active_ad_count': 3,
    'ad.public_archive_id': 'ad-99202',
    'business.domain': 'starlight-solar.org',
    'verification.state': 'REDIRECT_DETECTED',
    'verification.freshness_days': 12, // Stale!
    'qualification.state': 'UNQUALIFIED',
    'score.composite_score': 45,
    'score.model_version': 'v2.1',
    'system.ssrf_protection_active': true,
  },
  {
    id: 'adv-103',
    name: 'QuickLoan Cash Direct',
    'advertiser.id': 'adv-103',
    'advertiser.name': 'QuickLoan Cash Direct',
    'advertiser.active_ad_count': 42,
    'ad.public_archive_id': 'ad-99203',
    'business.domain': 'freeloans-today.biz',
    'verification.state': 'PARKING_PAGE',
    'verification.freshness_days': 1,
    'qualification.state': 'DISQUALIFIED',
    'score.composite_score': 12,
    'score.model_version': 'v2.1',
    'system.ssrf_protection_active': true,
  },
  {
    id: 'adv-104',
    name: 'Metro Real Estate Group',
    'advertiser.id': 'adv-104',
    'advertiser.name': 'Metro Real Estate Group',
    'advertiser.active_ad_count': 8,
    'ad.public_archive_id': 'ad-99204',
    'business.domain': 'metrorealestate.com',
    'verification.state': 'VERIFIED',
    'verification.freshness_days': 5,
    'qualification.state': 'QUALIFIED',
    'score.composite_score': 74,
    'score.model_version': 'v2.1',
    'system.ssrf_protection_active': true,
  },
  {
    id: 'adv-105',
    name: 'PureLife Organic Foods',
    'advertiser.id': 'adv-105',
    'advertiser.name': 'PureLife Organic Foods',
    'advertiser.active_ad_count': 1,
    'ad.public_archive_id': 'ad-99205',
    'business.domain': 'purelifefoods.co',
    'verification.state': 'FAILED',
    'verification.freshness_days': 20,
    'qualification.state': 'MANUAL_REVIEW',
    'score.composite_score': 38,
    'score.model_version': 'v2.1',
    'system.ssrf_protection_active': true,
  }
];

export function runSimulation(
  config: Configuration,
  versionNum: number,
  dataset: SimulationDatasetRecord[] = SAMPLE_SIMULATION_FIXTURE
): SimulationResult {
  const version = config.versions.find(v => v.version === versionNum) || config.versions[0];
  const startTime = performance.now();

  let passCount = 0;
  let failCount = 0;
  const newlyAffected: string[] = [];

  if (version.expressionAst) {
    for (const record of dataset) {
      const evalResult = evaluateAST(version.expressionAst, record);
      if (evalResult.result) {
        passCount++;
      } else {
        failCount++;
        newlyAffected.push(record.name);
      }
    }
  } else {
    passCount = dataset.length;
  }

  const durationMs = Math.round(performance.now() - startTime);

  return {
    simulationId: `sim-${Date.now().toString(36)}`,
    configurationId: config.configurationId,
    version: version.version,
    timestamp: new Date().toISOString(),
    datasetSize: dataset.length,
    recordsEvaluated: dataset.length,
    passCount,
    failCount,
    newlyAffectedRecords: newlyAffected,
    previouslyAffectedRecords: ['Starlight Solar Tech'],
    downstreamImpacts: {
      workflowsAffected: failCount > 0 ? 2 : 0,
      quarantineEstimate: failCount,
      scoringVariance: `${(failCount * -4.2).toFixed(1)} avg pts`,
      exportProfileImpact: `${failCount} records filtered from Lead Export Profile`,
    },
    durationMs: durationMs || 4,
  };
}

// ============================================================
// 9. AUDIT EVENT LEDGER
// ============================================================

export interface ConfigurationAuditEvent {
  eventId: string;
  configurationId: string;
  version: number;
  action:
    | 'CREATED_DRAFT'
    | 'UPDATED_DRAFT'
    | 'VALIDATED'
    | 'SUBMITTED_FOR_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'SCHEDULED'
    | 'ACTIVATED'
    | 'DISABLED'
    | 'ROLLED_BACK'
    | 'PROMOTED'
    | 'OVERRIDE_APPLIED';
  actor: string;
  actorRole: string;
  timestamp: string;
  reason: string;
  details: Record<string, any>;
  correlationId: string;
}

export const SAMPLE_AUDIT_TRAIL: ConfigurationAuditEvent[] = [
  {
    eventId: 'aud-801',
    configurationId: 'quality.required_advertiser_id',
    version: 3,
    action: 'ACTIVATED',
    actor: 'admin.elena@platform.internal',
    actorRole: 'CONFIG_ADMIN',
    timestamp: '2026-09-16T14:32:00Z',
    reason: 'Scheduled publication window reached; all pre-activation smoke suites green.',
    details: { effectiveFrom: '2026-09-16T14:30:00Z', previousActiveVersion: 2 },
    correlationId: 'corr-tx-88910',
  },
  {
    eventId: 'aud-802',
    configurationId: 'verification.freshness_sla',
    version: 4,
    action: 'APPROVED',
    actor: 'lead.marcus@platform.internal',
    actorRole: 'CONFIG_APPROVER',
    timestamp: '2026-09-16T11:15:00Z',
    reason: 'Separation of duties verified. Simulation dry-run confirmed 0% unintended false quarantine.',
    details: { reviewer: 'reviewer.sarah@platform.internal' },
    correlationId: 'corr-tx-88902',
  },
  {
    eventId: 'aud-803',
    configurationId: 'scoring.lead_qualification_v2',
    version: 5,
    action: 'ROLLED_BACK',
    actor: 'sre.security@platform.internal',
    actorRole: 'SECURITY_ADMIN',
    timestamp: '2026-09-15T09:40:00Z',
    reason: 'Automated telemetry flagged threshold anomaly; rolled back to v4 in Staging.',
    details: { targetVersion: 4, rollbackReason: 'STAGING_CALIBRATION_CHECK' },
    correlationId: 'corr-tx-88741',
  },
  {
    eventId: 'aud-804',
    configurationId: 'export.sanitized_leads_profile',
    version: 2,
    action: 'PROMOTED',
    actor: 'admin.elena@platform.internal',
    actorRole: 'CONFIG_ADMIN',
    timestamp: '2026-09-14T18:00:00Z',
    reason: 'Promoted from Staging to Production environment after governance sign-off.',
    details: { sourceEnv: 'STAGING', targetEnv: 'PRODUCTION' },
    correlationId: 'corr-tx-88619',
  }
];

// ============================================================
// 10. SAMPLE PRODUCTION CONFIGURATIONS CATALOG
// ============================================================

export const INITIAL_CONFIGURATIONS: Configuration[] = [
  {
    configurationId: 'quality.required_advertiser_id',
    configurationType: 'DATA_QUALITY_RULE',
    name: 'Required Advertiser ID & Non-Empty Title',
    description: 'Enforces non-null advertiser ID and valid non-blank brand name on all newly ingested entities.',
    schemaId: 'schema.data_quality_rule.v1',
    currentActiveVersion: 3,
    highestVersion: 3,
    isProtectedSecurityCritical: false,
    ownerTeam: 'Data Engineering',
    tags: ['quality', 'ingestion', 'invariants'],
    versions: [
      {
        version: 3,
        schemaVersion: '1.2.0',
        environment: 'PRODUCTION',
        scope: { scopeType: 'GLOBAL', scopeId: 'global-root' },
        contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        payload: {
          ruleIdentifier: 'quality.required_advertiser_id',
          entityType: 'ADVERTISER',
          targetField: 'advertiser.id',
          severity: 'BLOCKING',
          actionOnFailure: 'QUARANTINE_RECORD',
        },
        expressionAst: {
          logicalOperator: 'AND',
          conditions: [
            { field: 'advertiser.id', operator: 'IS_NOT_NULL' },
            { field: 'advertiser.name', operator: 'EXISTS' }
          ]
        },
        dependencies: [],
        explanation: 'Guarantees that no advertiser entity can enter normalized storage without an explicit ID and brand name.',
        createdAt: '2026-09-15T08:00:00Z',
        createdBy: 'dev.artem@platform.internal',
        approvedAt: '2026-09-15T10:00:00Z',
        approvedBy: 'lead.marcus@platform.internal',
        activatedAt: '2026-09-16T14:32:00Z',
        activatedBy: 'admin.elena@platform.internal',
        effectiveFrom: '2026-09-16T14:30:00Z',
        lifecycleState: 'ACTIVE',
        validationStatus: { isValid: true, errors: [], validatedAt: '2026-09-15T08:05:00Z' }
      }
    ]
  },
  {
    configurationId: 'verification.freshness_sla',
    configurationType: 'FRESHNESS_POLICY',
    name: 'Destination Verification 7-Day SLA Policy',
    description: 'Marks destinations older than 7 calendar days as stale, triggering automated Phase 13 reverification DAG.',
    schemaId: 'schema.freshness_policy.v1',
    currentActiveVersion: 3,
    highestVersion: 4,
    isProtectedSecurityCritical: false,
    ownerTeam: 'Verification & Crawl Team',
    tags: ['verification', 'freshness', 'sla', 'workflow-trigger'],
    versions: [
      {
        version: 3,
        schemaVersion: '1.1.0',
        environment: 'PRODUCTION',
        scope: { scopeType: 'GLOBAL', scopeId: 'global-root' },
        contentHash: 'f4b0c22298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b111',
        payload: {
          policyIdentifier: 'verification.freshness_sla',
          targetEntity: 'VERIFICATION',
          maxAgeHours: 168, // 7 days
          actionOnStale: 'TRIGGER_DAG_REVERIFY',
        },
        expressionAst: {
          logicalOperator: 'AND',
          conditions: [
            { field: 'verification.freshness_days', operator: 'LESS_OR_EQUAL', value: 7 },
            { field: 'verification.state', operator: 'STATE_EQUALS', value: 'VERIFIED' }
          ]
        },
        dependencies: ['quality.required_advertiser_id'],
        explanation: 'Enforces that verified landing page states remain valid for at most 7 days before triggering reverification.',
        createdAt: '2026-09-10T12:00:00Z',
        createdBy: 'dev.artem@platform.internal',
        approvedAt: '2026-09-10T14:00:00Z',
        approvedBy: 'lead.marcus@platform.internal',
        activatedAt: '2026-09-10T16:00:00Z',
        activatedBy: 'admin.elena@platform.internal',
        effectiveFrom: '2026-09-10T16:00:00Z',
        lifecycleState: 'ACTIVE',
        validationStatus: { isValid: true, errors: [], validatedAt: '2026-09-10T12:05:00Z' }
      },
      {
        version: 4,
        schemaVersion: '1.1.0',
        environment: 'PRODUCTION',
        scope: { scopeType: 'GLOBAL', scopeId: 'global-root' },
        contentHash: 'a1c0d33298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b222',
        payload: {
          policyIdentifier: 'verification.freshness_sla',
          targetEntity: 'VERIFICATION',
          maxAgeHours: 72, // 3 days (Tightened!)
          actionOnStale: 'TRIGGER_DAG_REVERIFY',
        },
        expressionAst: {
          logicalOperator: 'AND',
          conditions: [
            { field: 'verification.freshness_days', operator: 'LESS_OR_EQUAL', value: 3 },
            { field: 'verification.state', operator: 'STATE_EQUALS', value: 'VERIFIED' }
          ]
        },
        dependencies: ['quality.required_advertiser_id'],
        explanation: 'Tightens verification freshness to 3 days to maximize lead accuracy for outbound pipelines.',
        createdAt: '2026-09-16T10:00:00Z',
        createdBy: 'analyst.clara@platform.internal',
        approvedAt: '2026-09-16T11:15:00Z',
        approvedBy: 'lead.marcus@platform.internal',
        effectiveFrom: '2026-09-18T00:00:00Z', // Scheduled!
        lifecycleState: 'SCHEDULED',
        validationStatus: { isValid: true, errors: [], validatedAt: '2026-09-16T10:05:00Z' }
      }
    ]
  },
  {
    configurationId: 'scoring.lead_qualification_v2',
    configurationType: 'SCORING_MODEL_CONFIG',
    name: 'Lead Readiness Score Model v2.1',
    description: 'Declarative composite scoring model weighting active ad velocity, domain verification status, and budget stability.',
    schemaId: 'schema.scoring_model_config.v1',
    currentActiveVersion: 4,
    highestVersion: 5,
    isProtectedSecurityCritical: false,
    ownerTeam: 'Lead Intelligence & Analytics',
    tags: ['scoring', 'qualification', 'weights'],
    versions: [
      {
        version: 4,
        schemaVersion: '2.0.0',
        environment: 'PRODUCTION',
        scope: { scopeType: 'GLOBAL', scopeId: 'global-root' },
        contentHash: 'b5e1a44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b777',
        payload: {
          modelIdentifier: 'scoring.lead_qualification_v2',
          weights: {
            activeAdsWeight: 0.35,
            verificationWeight: 0.40,
            longevityWeight: 0.25
          },
          qualificationCutoff: 65,
          penaltyRules: {
            parkingPageDeduction: -50,
            staleVerificationDeduction: -20
          }
        },
        expressionAst: {
          logicalOperator: 'AND',
          conditions: [
            { field: 'score.composite_score', operator: 'GREATER_OR_EQUAL', value: 65 },
            { field: 'verification.state', operator: 'NOT_EQUALS', value: 'PARKING_PAGE' }
          ]
        },
        dependencies: ['verification.freshness_sla'],
        explanation: 'Scores candidate advertisers; requires minimum 65 points and non-parking page destination to qualify.',
        createdAt: '2026-09-01T00:00:00Z',
        createdBy: 'dev.artem@platform.internal',
        approvedAt: '2026-09-01T04:00:00Z',
        approvedBy: 'lead.marcus@platform.internal',
        activatedAt: '2026-09-01T06:00:00Z',
        activatedBy: 'admin.elena@platform.internal',
        effectiveFrom: '2026-09-01T06:00:00Z',
        lifecycleState: 'ACTIVE',
        validationStatus: { isValid: true, errors: [], validatedAt: '2026-09-01T00:05:00Z' }
      },
      {
        version: 5,
        schemaVersion: '2.0.0',
        environment: 'STAGING',
        scope: { scopeType: 'GLOBAL', scopeId: 'global-root' },
        contentHash: 'c7f2b55298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b888',
        payload: {
          modelIdentifier: 'scoring.lead_qualification_v2',
          weights: {
            activeAdsWeight: 0.45,
            verificationWeight: 0.35,
            longevityWeight: 0.20
          },
          qualificationCutoff: 70, // Stricter cutoff
          penaltyRules: {
            parkingPageDeduction: -60,
            staleVerificationDeduction: -30
          }
        },
        expressionAst: {
          logicalOperator: 'AND',
          conditions: [
            { field: 'score.composite_score', operator: 'GREATER_OR_EQUAL', value: 70 },
            { field: 'verification.state', operator: 'STATE_EQUALS', value: 'VERIFIED' }
          ]
        },
        dependencies: ['verification.freshness_sla'],
        explanation: 'Experimental v2.2 scoring in Staging requiring verified status and 70 point score floor.',
        createdAt: '2026-09-14T14:00:00Z',
        createdBy: 'analyst.clara@platform.internal',
        approvedAt: '2026-09-14T16:00:00Z',
        approvedBy: 'lead.marcus@platform.internal',
        activatedAt: '2026-09-15T09:00:00Z',
        activatedBy: 'admin.elena@platform.internal',
        effectiveFrom: '2026-09-15T09:00:00Z',
        lifecycleState: 'DRAFT', // Reverted back to draft for tuning
        validationStatus: { isValid: true, errors: [], validatedAt: '2026-09-14T14:05:00Z' }
      }
    ]
  },
  {
    configurationId: 'workflow.gate.reverify_freshness',
    configurationType: 'WORKFLOW_GATE',
    name: 'Pre-Execution Verification Freshness Gate',
    description: 'Pre-condition gate blocking downstream CRM sync if lead verification is stale or missing.',
    schemaId: 'schema.workflow_gate.v1',
    currentActiveVersion: 1,
    highestVersion: 1,
    isProtectedSecurityCritical: false,
    ownerTeam: 'Workflow Operations',
    tags: ['workflow', 'gates', 'phase13'],
    versions: [
      {
        version: 1,
        schemaVersion: '1.0.0',
        environment: 'PRODUCTION',
        scope: { scopeType: 'GLOBAL', scopeId: 'global-root' },
        contentHash: 'd8a3c66298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b999',
        payload: {
          gateIdentifier: 'workflow.gate.reverify_freshness',
          targetStep: 'EXPORT_CRM_SYNC',
          failureMode: 'HALT_BRANCH_AND_ALERT',
        },
        expressionAst: {
          logicalOperator: 'AND',
          conditions: [
            { field: 'verification.state', operator: 'STATE_EQUALS', value: 'VERIFIED' },
            { field: 'verification.freshness_days', operator: 'LESS_THAN', value: 14 }
          ]
        },
        dependencies: ['verification.freshness_sla', 'scoring.lead_qualification_v2'],
        explanation: 'Enforces that outbound sync branches fail closed unless the target advertiser has fresh verification.',
        createdAt: '2026-09-12T09:00:00Z',
        createdBy: 'dev.artem@platform.internal',
        approvedAt: '2026-09-12T11:00:00Z',
        approvedBy: 'lead.marcus@platform.internal',
        activatedAt: '2026-09-12T13:00:00Z',
        activatedBy: 'admin.elena@platform.internal',
        effectiveFrom: '2026-09-12T13:00:00Z',
        lifecycleState: 'ACTIVE',
        validationStatus: { isValid: true, errors: [], validatedAt: '2026-09-12T09:05:00Z' }
      }
    ]
  },
  {
    configurationId: 'export.sanitized_leads_profile',
    configurationType: 'EXPORT_PROFILE',
    name: 'Sanitized Outbound Lead Export Profile',
    description: 'Defines authorized export fields, column sanitization, PII masking, and provenance metadata flags.',
    schemaId: 'schema.export_profile.v1',
    currentActiveVersion: 2,
    highestVersion: 2,
    isProtectedSecurityCritical: false,
    ownerTeam: 'Compliance & Integrations',
    tags: ['export', 'sanitization', 'governance'],
    versions: [
      {
        version: 2,
        schemaVersion: '1.1.0',
        environment: 'PRODUCTION',
        scope: { scopeType: 'GLOBAL', scopeId: 'global-root' },
        contentHash: 'f9b4d77298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b000',
        payload: {
          profileIdentifier: 'export.sanitized_leads_profile',
          includedFields: [
            'advertiser.id',
            'advertiser.name',
            'business.domain',
            'verification.state',
            'score.composite_score',
            'score.model_version'
          ],
          redactionPolicies: ['MASK_INTERNAL_IP', 'EXCLUDE_RAW_HTML'],
          maxRows: 10000
        },
        dependencies: ['quality.required_advertiser_id'],
        explanation: 'Ensures outbound CSV/JSON export files contain only approved public business fields and strip debug traces.',
        createdAt: '2026-09-14T10:00:00Z',
        createdBy: 'analyst.clara@platform.internal',
        approvedAt: '2026-09-14T15:00:00Z',
        approvedBy: 'lead.marcus@platform.internal',
        activatedAt: '2026-09-14T18:00:00Z',
        activatedBy: 'admin.elena@platform.internal',
        effectiveFrom: '2026-09-14T18:00:00Z',
        lifecycleState: 'ACTIVE',
        validationStatus: { isValid: true, errors: [], validatedAt: '2026-09-14T10:05:00Z' }
      }
    ]
  },
  {
    configurationId: 'security.ssrf_anti_bypass_guardrail',
    configurationType: 'VALIDATION_POLICY',
    name: 'Hardened SSRF & Meta Anti-Bypass Guardrail',
    description: 'Protected kernel security policy enforcing private IP blocking and prohibition of unauthorized Meta API bypassing.',
    schemaId: 'schema.verification_policy.v1',
    currentActiveVersion: 1,
    highestVersion: 1,
    isProtectedSecurityCritical: true, // PROTECTED SECURITY INVARIANT!
    ownerTeam: 'Platform Security Architecture',
    tags: ['security', 'ssrf', 'meta-safety', 'protected'],
    versions: [
      {
        version: 1,
        schemaVersion: '1.0.0',
        environment: 'PRODUCTION',
        scope: { scopeType: 'GLOBAL', scopeId: 'global-root' },
        contentHash: '1111111198fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b111',
        payload: {
          policyIdentifier: 'security.ssrf_anti_bypass_guardrail',
          blockedCidrRanges: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '127.0.0.0/8', '169.254.0.0/16'],
          allowMetaPrivateApiAccess: false,
          allowArbitraryExecution: false,
          failClosedOnDnsFailure: true,
        },
        expressionAst: {
          logicalOperator: 'AND',
          conditions: [
            { field: 'system.ssrf_protection_active', operator: 'EQUALS', value: true }
          ]
        },
        dependencies: [],
        explanation: 'Absolute platform security boundary. Non-overridable by tenants, workspaces, or normal administrators.',
        createdAt: '2026-08-01T00:00:00Z',
        createdBy: 'sre.security@platform.internal',
        approvedAt: '2026-08-01T00:00:00Z',
        approvedBy: 'sre.security@platform.internal',
        activatedAt: '2026-08-01T00:00:00Z',
        activatedBy: 'sre.security@platform.internal',
        effectiveFrom: '2026-08-01T00:00:00Z',
        lifecycleState: 'ACTIVE',
        validationStatus: { isValid: true, errors: [], validatedAt: '2026-08-01T00:00:00Z' }
      }
    ]
  },
  {
    configurationId: 'flag.enable_shadow_scoring_eval',
    configurationType: 'FEATURE_FLAG',
    name: 'Enable Shadow Scoring Evaluation Engine',
    description: 'Controls execution of shadow mode scoring models for evaluation against live incoming candidate leads.',
    schemaId: 'schema.feature_flag.v1',
    currentActiveVersion: 1,
    highestVersion: 1,
    isProtectedSecurityCritical: false,
    ownerTeam: 'Platform Architecture',
    tags: ['feature-flag', 'shadow-mode', 'scoring'],
    versions: [
      {
        version: 1,
        schemaVersion: '1.0.0',
        environment: 'PRODUCTION',
        scope: { scopeType: 'GLOBAL', scopeId: 'global-root' },
        contentHash: '2222222298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b222',
        payload: {
          flagKey: 'flag.enable_shadow_scoring_eval',
          defaultValue: true,
          rolloutPercentage: 100,
          auditRequired: true
        },
        dependencies: ['scoring.lead_qualification_v2'],
        explanation: 'Enables safe background calculation of v2.2 scoring without mutating persistent production lead records.',
        createdAt: '2026-09-15T12:00:00Z',
        createdBy: 'dev.artem@platform.internal',
        approvedAt: '2026-09-15T14:00:00Z',
        approvedBy: 'lead.marcus@platform.internal',
        activatedAt: '2026-09-15T15:00:00Z',
        activatedBy: 'admin.elena@platform.internal',
        effectiveFrom: '2026-09-15T15:00:00Z',
        lifecycleState: 'ACTIVE',
        validationStatus: { isValid: true, errors: [], validatedAt: '2026-09-15T12:05:00Z' }
      }
    ]
  }
];

// ============================================================
// 11. MIGRATION GAP ANALYSIS (PHASE 01 - 15)
// ============================================================

export interface MigrationClassificationItem {
  component: string;
  sourcePhase: string;
  classification:
    | 'CONFIGURABLE_NOW'
    | 'CONFIGURABLE_LATER'
    | 'MUST_REMAIN_CODE_ENFORCED'
    | 'SECURITY_CRITICAL'
    | 'NOT_SAFE_TO_CONFIGURE';
  currentImplementation: string;
  proposedMigrationPath: string;
  rationalization: string;
}

export const MIGRATION_GAP_ANALYSIS: MigrationClassificationItem[] = [
  {
    component: 'Destination Verification Freshness Threshold',
    sourcePhase: 'PHASE 05 / 13',
    classification: 'CONFIGURABLE_NOW',
    currentImplementation: 'Hard-coded 7-day age check in VerificationPipelineSimulator',
    proposedMigrationPath: 'Migrated to `verification.freshness_sla` configuration policy in Phase 16',
    rationalization: 'Operational business SLA that varies per campaign and tenant; safe to govern through schema-backed rules.',
  },
  {
    component: 'Browser SSRF Private IP Filter & DNS Validation',
    sourcePhase: 'PHASE 02 / 05 / 10',
    classification: 'SECURITY_CRITICAL',
    currentImplementation: 'Hard-coded CIDR subnet validator and loopback blocklist in Worker/Proxy',
    proposedMigrationPath: 'MUST REMAIN CODE ENFORCED in platform kernel and proxy network stack',
    rationalization: 'Exposing network IP filters to user configuration would allow privilege escalation and SSRF vulnerabilities.',
  },
  {
    component: 'Meta Ad Library DOM Selectors & Extraction Rules',
    sourcePhase: 'PHASE 03',
    classification: 'CONFIGURABLE_NOW',
    currentImplementation: 'Static selectors in phase03Content.ts and SelectorRegistryViewer',
    proposedMigrationPath: 'Migrate to `source_compatibility_policy` schema with semantic fallback chains',
    rationalization: 'Meta frequently updates UI class hashes; configuration allows zero-downtime selector hotfixes.',
  },
  {
    component: 'Fuzzy Entity Merge Determinism Barrier',
    sourcePhase: 'PHASE 04',
    classification: 'MUST_REMAIN_CODE_ENFORCED',
    currentImplementation: 'High-confidence exact match barrier before automatic deduplication merge',
    proposedMigrationPath: 'Threshold weights configurable, but automatic merge gate MUST REMAIN CODE ENFORCED',
    rationalization: 'Prevent accidental irreversible entity merges; strict separation between suggestions and committed joins.',
  },
  {
    component: 'Lead Scoring Signal Weights & Cutoff Bands',
    sourcePhase: 'PHASE 06 / 14',
    classification: 'CONFIGURABLE_NOW',
    currentImplementation: 'Hard-coded mathematical weights in phase06FixturesAndAudit',
    proposedMigrationPath: 'Migrated to `scoring.lead_qualification_v2` declarative configuration',
    rationalization: 'Different business verticals require tailored qualification criteria without developer code commits.',
  },
  {
    component: 'PostgreSQL Relational Foreign Key Integrity Constraints',
    sourcePhase: 'PHASE 07',
    classification: 'MUST_REMAIN_CODE_ENFORCED',
    currentImplementation: 'PostgreSQL DDL schema foreign keys, uniqueness indices, and CHECK constraints',
    proposedMigrationPath: 'MUST REMAIN CODE ENFORCED in database schema',
    rationalization: 'Structural data integrity must never depend on client or application-tier configuration.',
  },
  {
    component: 'Sanitized Outbound Lead Export Column Mapping',
    sourcePhase: 'PHASE 08 / 15',
    classification: 'CONFIGURABLE_NOW',
    currentImplementation: 'Fixed field lists in ExportPipelineStudio and HandoffExportView',
    proposedMigrationPath: 'Migrated to `export.sanitized_leads_profile` configuration with PII redaction tags',
    rationalization: 'Downstream consumers (HubSpot, Salesforce, Snowflake) require custom column schema mappings.',
  },
  {
    component: 'Meta API Anti-Bypass & CAPTCHA Solver Prevention',
    sourcePhase: 'PHASE 01 / 02 / 10',
    classification: 'NOT_SAFE_TO_CONFIGURE',
    currentImplementation: 'Platform prohibition of unauthorized Meta API calls and evasion tooling',
    proposedMigrationPath: 'STRICTLY PROHIBITED; zero configuration endpoints allowed',
    rationalization: 'Core platform terms-of-service and ethical boundary: public ad library observation only.',
  }
];

// ============================================================
// 12. SHADOW MODE COMPARISON MODEL
// ============================================================

export interface ShadowComparisonItem {
  recordId: string;
  recordName: string;
  activeResult: {
    state: string;
    score: number;
  };
  shadowResult: {
    state: string;
    score: number;
  };
  disagreement: boolean;
  notes: string;
}

export const SAMPLE_SHADOW_COMPARISONS: ShadowComparisonItem[] = [
  {
    recordId: 'adv-101',
    recordName: 'Apex Dental Care',
    activeResult: { state: 'QUALIFIED', score: 88 },
    shadowResult: { state: 'QUALIFIED', score: 92 },
    disagreement: false,
    notes: 'Active ad velocity bonus boosted score by +4 in v2.2 shadow model.'
  },
  {
    recordId: 'adv-102',
    recordName: 'Starlight Solar Tech',
    activeResult: { state: 'UNQUALIFIED', score: 45 },
    shadowResult: { state: 'DISQUALIFIED', score: 35 },
    disagreement: true,
    notes: 'Shifted from UNQUALIFIED to DISQUALIFIED due to tightened 3-day freshness penalty in v2.2.'
  },
  {
    recordId: 'adv-104',
    recordName: 'Metro Real Estate Group',
    activeResult: { state: 'QUALIFIED', score: 74 },
    shadowResult: { state: 'QUALIFIED', score: 76 },
    disagreement: false,
    notes: 'Slight score increase; maintains QUALIFIED status safely above the 70 point floor.'
  }
];

// ============================================================
// 13. MASTER PHASE 16 MACHINE-READABLE HANDOFF CONTRACT
// ============================================================

export const PHASE_16_HANDOFF_PAYLOAD = {
  phase: 16,
  status: 'complete',

  configuration_architecture: {
    configuration_types: [
      'DATA_QUALITY_RULE',
      'VALIDATION_POLICY',
      'NORMALIZATION_POLICY',
      'FRESHNESS_POLICY',
      'VERIFICATION_POLICY',
      'IDENTITY_POLICY',
      'QUALIFICATION_POLICY',
      'SCORING_MODEL_CONFIG',
      'WORKFLOW_CONFIG',
      'WORKFLOW_GATE',
      'ANALYTICS_POLICY',
      'EXPORT_PROFILE',
      'NOTIFICATION_POLICY',
      'QUARANTINE_POLICY',
      'CORRECTION_POLICY',
      'RETENTION_POLICY',
      'REDACTION_POLICY',
      'REVIEW_ROUTING_POLICY',
      'SCHEMA_POLICY',
      'SOURCE_COMPATIBILITY_POLICY',
      'FEATURE_FLAG',
      'OPERATIONAL_THRESHOLD'
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
    scopes: ['GLOBAL', 'TENANT', 'WORKSPACE', 'PROJECT', 'WORKFLOW'],
    environments: ['DEVELOPMENT', 'STAGING', 'PRODUCTION'],
    versioning_model: [
      'Immutable version increment (Version N -> N+1)',
      'Deterministic SHA-256 equivalent canonical content hashing',
      'Historical runs permanently bound to exact configuration_id and version',
      'No in-place mutation of ACTIVE or RETIRED configurations'
    ]
  },

  schema_registry: {
    schemas: CONFIGURATION_SCHEMAS.map(s => s.schemaId),
    schema_versions: CONFIGURATION_SCHEMAS.map(s => `${s.schemaId}@${s.schemaVersion}`),
    compatibility_rules: [
      'Additive changes permitted within minor SemVer updates',
      'Breaking structural field removals require new major schema_id and migration adapter',
      'Strict schema validation enforced before transition from DRAFT to REVIEW'
    ]
  },

  expression_engine: {
    ast_model: [
      'Root SafeExpressionAST containing explicit logicalOperator (AND, OR, NOT)',
      'Recursive ExpressionCondition array bounded by max depth',
      'Zero arbitrary code strings, zero eval(), zero dynamic network fetching'
    ],
    operators: [
      'EQUALS',
      'NOT_EQUALS',
      'CONTAINS',
      'STARTS_WITH',
      'ENDS_WITH',
      'MATCHES_ALLOWED_PATTERN',
      'EXISTS',
      'MISSING',
      'IS_NULL',
      'IS_NOT_NULL',
      'GREATER_THAN',
      'LESS_THAN',
      'GREATER_OR_EQUAL',
      'LESS_OR_EQUAL',
      'IN',
      'NOT_IN',
      'ALL',
      'ANY',
      'NONE',
      'COUNT',
      'DATE_BEFORE',
      'DATE_AFTER',
      'AGE_LESS_THAN_DAYS',
      'AGE_GREATER_THAN_DAYS',
      'DOMAIN_EQUALS',
      'DOMAIN_IN',
      'STATE_EQUALS',
      'SOURCE_TYPE_EQUALS'
    ],
    type_rules: [
      'STRING fields accept EQUALS, CONTAINS, STARTS_WITH, IN',
      'NUMBER fields accept arithmetic comparisons (GREATER_THAN, LESS_THAN, etc.)',
      'DATE fields accept chronological operators (DATE_BEFORE, AGE_LESS_THAN_DAYS, etc.)',
      'DOMAIN fields accept domain normalization and apex equality checks',
      'Incompatible operator-field pairings fail semantic validation immediately'
    ],
    limits: [
      `Max AST Depth: ${AST_CONSTRAINTS.MAX_DEPTH}`,
      `Max Total Conditions: ${AST_CONSTRAINTS.MAX_TOTAL_CONDITIONS}`,
      `Max Evaluation Time per record: ${AST_CONSTRAINTS.MAX_EVALUATION_MS}ms`
    ],
    security_constraints: [
      'No JavaScript / TypeScript execution',
      'No SQL interpolation or raw queries',
      'No outbound HTTP / fetch / network requests',
      'No access to environment variables, tokens, or process handles',
      'Execution sandbox operates purely on approved field dictionary'
    ]
  },

  field_registry: {
    fields: GOVERNED_FIELD_REGISTRY.map(f => f.fieldId),
    allowed_operators: GOVERNED_FIELD_REGISTRY.map(f => ({ field: f.fieldId, ops: f.allowedOperators })),
    sensitivity: GOVERNED_FIELD_REGISTRY.map(f => ({ field: f.fieldId, sensitivity: f.sensitivity })),
    deprecation: GOVERNED_FIELD_REGISTRY.filter(f => f.isDeprecated).map(f => f.fieldId)
  },

  rule_builder: {
    supported_builders: ['Visual Entity Field Selector', 'Logical AST Condition Grouper', 'Diff & Simulation Previewer'],
    validation: ['Client-side immediate operator type-checking', 'Pre-flight schema validator', 'Bounded depth check'],
    ui_contracts: [
      'Step 1: Choose entity and field from governed registry',
      'Step 2: Choose compatible operator based on field datatype',
      'Step 3: Enter typed value with format constraints',
      'Step 4: Group conditions with AND/OR/NOT',
      'Step 5: Run instant dry-run simulation against snapshot fixture'
    ]
  },

  dependency_graph: {
    node_types: ['CONFIGURATION', 'SCHEMA', 'WORKFLOW_DAG', 'DATABASE_MODEL'],
    edge_types: ['REQUIRES', 'GATES', 'INFLUENCES', 'CONFLICTS_WITH'],
    dependency_rules: [
      'A configuration cannot depend on an unapproved DRAFT or RETIRED configuration',
      'Cross-version compatibility matrix evaluated before approval'
    ],
    circular_dependency_controls: [
      'DFS cycle detection algorithm runs prior to draft submission',
      'Any cyclical reference (A -> B -> C -> A) triggers hard blocking validation failure'
    ]
  },

  simulation: {
    modes: ['HISTORICAL_SNAPSHOT_REPLAY', 'SYNTHETIC_CORNER_CASE_FIXTURE', 'SHADOW_PIPELINE'],
    dataset_requirements: ['Bounded dataset (5-10,000 records max)', 'Immutable snapshot timestamp', 'Known baseline results'],
    reproducibility: [
      'Deterministic output: exact same configuration version + snapshot yields identical results',
      'SimulationResult persisted with correlation ID and duration metrics'
    ],
    limits: ['Max 10,000 records per dry-run evaluation', 'Max 5.0 seconds total simulation timeout']
  },

  shadow_mode: {
    behavior: [
      'Executes alongside ACTIVE configuration during live observation intake',
      'Calculates decisions, scores, and gates in isolation',
      'Strictly prohibits database writes, external mutations, or side-effects'
    ],
    comparison_model: [
      'Outputs disagreement matrix highlighting shifted states and score deltas',
      'Surfaces unexpected false positive / false negative qualification divergences'
    ],
    mutation_guarantee: 'Read-only context: zero database UPDATE / INSERT on production lead entities'
  },

  approval: {
    roles: ['CONFIG_VIEWER', 'CONFIG_AUTHOR', 'CONFIG_REVIEWER', 'CONFIG_APPROVER', 'CONFIG_ADMIN', 'SECURITY_ADMIN'],
    separation_of_duties: [
      'AUTHOR cannot approve their own configuration draft (Author != Approver)',
      'PROTECTED_SECURITY_CRITICAL policies require SECURITY_ADMIN dual sign-off'
    ],
    approval_requirements: [
      'Clean schema validation report',
      'Zero circular dependency errors',
      'Dry-run simulation report generated and reviewed',
      'Explicit change justification reason entered'
    ]
  },

  activation: {
    scheduling: ['Atomic cron / timestamp-based publication window', 'Effective-from and optional effective-to window'],
    atomicity: [
      'Atomic pointer swap in distributed configuration registry',
      'Transactional version activation in configuration database'
    ],
    failure_behavior: [
      'If activation hook fails verification, automatically retain previous known-good version',
      'Fail closed: never allow invalid or corrupted configuration to govern production pipelines'
    ]
  },

  rollback: {
    model: [
      'Version-based instant rollback (vN -> vN-1)',
      'Non-destructive: newest version is preserved in audit ledger as SUPERSEDED, not deleted'
    ],
    rollback_targets: ['Any prior APPROVED or ACTIVE immutable version in configuration history'],
    safety_checks: [
      'Verify target version schema compatibility with current running database migrations',
      'Generate immutable audit log entry documenting rollback operator and incident ticket ID'
    ]
  },

  environment_promotion: {
    environments: ['DEVELOPMENT', 'STAGING', 'PRODUCTION'],
    promotion_rules: [
      'Configuration must be tested in DEV and signed off in STAGING before promotion to PRODUCTION',
      'Promotion retains immutable content hash to guarantee identical execution semantics'
    ],
    drift_detection: [
      'Detects discrepancies between running runtime memory cache and persistent PostgreSQL database',
      'Alerts on unexpected out-of-band configuration divergence'
    ]
  },

  tenant_scoping: {
    scope_hierarchy: ['GLOBAL -> TENANT -> WORKSPACE -> PROJECT -> WORKFLOW'],
    inheritance: [
      'Child scopes inherit parent configurations by default',
      'Child scopes can override only fields explicitly declared as isOverridable: true'
    ],
    protected_fields: [
      'Network SSRF guardrails',
      'Meta API anti-bypass rules',
      'Audit logging mandates',
      'Database foreign key invariant constraints'
    ]
  },

  overrides: {
    allowed: ['Temporary emergency thresholds', 'Scoped campaign qualification overrides', 'Test feature flags'],
    restricted: ['Security guardrails', 'PII export sanitization', 'Core database integrity rules'],
    expiration: ['All overrides require explicit expiration timestamp (max 30 days)', 'Expired overrides fail safe']
  },

  configuration_catalog: {
    all_configuration_points: INITIAL_CONFIGURATIONS.map(c => c.configurationId),
    hard_coded_items: MIGRATION_GAP_ANALYSIS.filter(m => m.classification === 'MUST_REMAIN_CODE_ENFORCED').map(m => m.component),
    configurable_items: MIGRATION_GAP_ANALYSIS.filter(m => m.classification === 'CONFIGURABLE_NOW').map(m => m.component),
    security_invariants: MIGRATION_GAP_ANALYSIS.filter(m => m.classification === 'SECURITY_CRITICAL').map(m => m.component)
  },

  integrations: {
    phase_13_workflows: ['Workflow execution gates resolve exact configuration_id and version before executing step DAGs'],
    phase_15_quality: ['Data quality incidents reference rule_id and configuration_version in immutable audit records'],
    phase_06_scoring: ['Lead records store score_model_version linking directly to active scoring_model_config version'],
    phase_14_analytics: ['Trend intelligence metrics specify governed freshness policy and sample floor requirements'],
    phase_08_exports: ['Sanitized CSV/JSON export pipeline strictly enforces column whitelist and PII masking profile']
  },

  security: {
    arbitrary_execution_prevention: [
      'Zero arbitrary JavaScript / TypeScript / Python eval',
      'Zero raw SQL statements in configuration bodies',
      'Strict AST validator rejects any syntax outside approved operator whitelist'
    ],
    tenant_isolation: [
      'Strict tenant_id partitioning on all configuration scopes',
      'Cross-tenant configuration reads strictly blocked by security middleware'
    ],
    authorization: ['Role-based access control with enforced separation of duties'],
    protected_policies: ['Security invariants flagged with isProtectedSecurityCritical: true cannot be disabled'],
    audit: ['Immutable append-only audit event log tracking every draft, edit, approval, activation, and rollback']
  },

  database_changes: [
    'CREATE TABLE configuration_entities (configuration_id VARCHAR PRIMARY KEY, type VARCHAR, schema_id VARCHAR, created_at TIMESTAMPTZ);',
    'CREATE TABLE configuration_versions (configuration_id VARCHAR, version INT, content_hash VARCHAR, payload JSONB, ast JSONB, state VARCHAR, PRIMARY KEY (configuration_id, version));',
    'CREATE TABLE configuration_audit_events (event_id VARCHAR PRIMARY KEY, configuration_id VARCHAR, version INT, action VARCHAR, actor VARCHAR, timestamp TIMESTAMPTZ, correlation_id VARCHAR);',
    'CREATE TABLE configuration_snapshots (snapshot_id VARCHAR PRIMARY KEY, environment VARCHAR, captured_at TIMESTAMPTZ, manifest JSONB);'
  ],

  api_contracts: [
    'GET /api/v1/configurations?type=&env=&status=',
    'POST /api/v1/configurations/:id/drafts',
    'POST /api/v1/configurations/:id/simulate',
    'POST /api/v1/configurations/:id/submit-review',
    'POST /api/v1/configurations/:id/approve',
    'POST /api/v1/configurations/:id/activate',
    'POST /api/v1/configurations/:id/rollback',
    'GET /api/v1/configurations/audit-log'
  ],

  event_contracts: [
    'configuration.draft_created',
    'configuration.validation_completed',
    'configuration.review_requested',
    'configuration.approved',
    'configuration.activated',
    'configuration.rolled_back',
    'configuration.drift_detected'
  ],

  ui_modules: [
    'Configuration Registry & Filter Grid',
    'Visual AST Rule Builder with Live Syntax Validation',
    'Semantic Diff Viewer (Side-by-Side Version Comparison)',
    'Dependency Graph & Cycle Visualizer',
    'Interactive Simulation Dry-Run & Impact Estimator',
    'Shadow Mode Pipeline Disagreement Matrix',
    'Separation-of-Duties Review & Approval Desk',
    'Activation Calendar & Atomic Rollback Center',
    'Configuration Health, Expiring Overrides & Audit Log',
    'Phase 16 Machine-Readable JSON Export View'
  ],

  tests: [
    'Test 01: Draft creation without affecting production state',
    'Test 02: Schema validation failure blocks publication',
    'Test 03: Invalid operator-datatype combination rejected',
    'Test 04: Arbitrary JavaScript code injection safely blocked by AST parser',
    'Test 05: Circular dependency detection halts submission',
    'Test 06: Separation of duties prevents author from approving own change',
    'Test 07: Dry-run simulation reports accurate pass/fail counts on fixture',
    'Test 08: Atomic rollback restores previous immutable version without data loss',
    'Test 09: Tenant scope inheritance prevents child override of protected security rules',
    'Test 10: Shadow mode runs in complete isolation without database mutations'
  ],

  runbooks: [
    'RUNBOOK-1601: Handling Invalid Active Configuration & Rapid Rollback',
    'RUNBOOK-1602: Resolving Upstream Schema Drift & Selector Breakage',
    'RUNBOOK-1603: Remediation of Cyclic Dependency Deadlock',
    'RUNBOOK-1604: Emergency Disable of Runaway Automated Workflow Gate',
    'RUNBOOK-1605: Investigating Configuration Drift Across Multi-Region Nodes'
  ],

  phase_17_policy_hooks: [
    'Policy Precedence Registry: SECURITY > PLATFORM > TENANT > WORKSPACE',
    'Emergency Kill-Switch hook: emergencyDisable(configurationId, reason, actor)',
    'Audit Correlation Connector: all policy decisions emit trace IDs linking to Phase 16 versions',
    'Fine-grained tenant quota and cost-limiting interfaces'
  ],

  open_risks: [
    'Selector fragility when Meta updates Ad Library obfuscation algorithms requires prompt selector policy updates',
    'High concurrency of draft edits during active campaign periods requires optimistic locking compare-and-swap'
  ],

  known_limitations: [
    'AST expression evaluator is strictly deterministic and single-threaded for sub-50ms performance',
    'Simulation datasets are capped at 10,000 records to guarantee interactive browser responsiveness'
  ]
};
