/**
 * PHASE 13 — ADVANCED WORKFLOW AUTOMATION & SAFE ORCHESTRATION DATA LAYER
 * Strict non-bypassable orchestrator contracts, DAG validation, condition evaluator,
 * checkpointing, approvals, recipes, scheduling, and golden test fixtures.
 */

export type WorkflowStatus = 'DRAFT' | 'VALIDATING' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'RETIRED';

export type StepType =
  | 'COLLECT'
  | 'VALIDATE'
  | 'NORMALIZE'
  | 'RESOLVE_IDENTITY'
  | 'VERIFY'
  | 'QUALIFY'
  | 'CREATE_REVIEW'
  | 'WAIT_FOR_REVIEW'
  | 'EXPORT'
  | 'NOTIFY'
  | 'SNAPSHOT'
  | 'STOP'
  | 'WAIT';

export type WorkflowRunStatus =
  | 'CREATED'
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING'
  | 'PAUSED'
  | 'BLOCKED'
  | 'REVIEW_REQUIRED'
  | 'PARTIAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'DEAD_LETTERED';

export type StepRunStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'
  | 'RETRYING';

export type ApprovalPolicy = 'NONE' | 'OPTIONAL' | 'REQUIRED' | 'MULTI_APPROVER';
export type OverlapPolicy = 'ALLOW' | 'QUEUE' | 'SKIP' | 'COALESCE';
export type MissedSchedulePolicy = 'SKIP' | 'RUN_NEXT' | 'CATCH_UP_LIMITED';
export type FailurePolicy = 'FAIL_FAST' | 'CONTINUE' | 'CONTINUE_WITH_THRESHOLD';

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'notEquals' | 'in' | 'notIn' | 'exists' | 'missing' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface ConditionExpression {
  logic: 'AND' | 'OR';
  rules: ConditionRule[];
}

export interface WorkflowStep {
  stepId: string;
  name: string;
  type: StepType;
  version: string;
  dependsOn: string[];
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  retryPolicy: {
    maxAttempts: number;
    backoffMs: number;
    budgetMultiplierLimit: number;
  };
  timeoutPolicy: {
    stepTimeoutMs: number;
  };
  condition?: ConditionExpression;
  approvalPolicy: ApprovalPolicy;
  concurrencyPolicy: {
    maxParallelItems: number;
  };
  position?: { x: number; y: number };
}

export interface WorkflowPolicySet {
  maxWorkflowDurationMs: number;
  totalRetryBudget: number;
  failurePolicy: FailurePolicy;
  failureThresholdPercentage: number;
  requireTenantBoundary: boolean;
  scoringModelVersion: string;
  exportProfile: string;
}

export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  description: string;
  version: string;
  status: WorkflowStatus;
  owner: string;
  tenantId: string;
  trigger: 'MANUAL' | 'SCHEDULED' | 'EVENT' | 'WEBHOOK';
  inputs: Record<string, { type: string; required: boolean; description: string; defaultValue?: any }>;
  steps: WorkflowStep[];
  policies: WorkflowPolicySet;
  outputs: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowCheckpoint {
  checkpointId: string;
  runId: string;
  stepId: string;
  completedSteps: string[];
  pendingSteps: string[];
  activeStepId: string | null;
  durableOutputRefs: Record<string, string>;
  savedAt: string;
  stateHash: string;
}

export interface ApprovalRequest {
  approvalId: string;
  workflowRunId: string;
  stepRunId: string;
  stepName: string;
  requestedBy: string;
  approver?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  timestamp: string;
  resolvedAt?: string;
}

export interface WorkflowStepRun {
  stepRunId: string;
  workflowRunId: string;
  stepId: string;
  stepName: string;
  stepType: StepType;
  attempt: number;
  status: StepRunStatus;
  inputSnapshot: Record<string, any>;
  outputReference?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

export interface WorkflowRun {
  runId: string;
  workflowId: string;
  workflowName: string;
  workflowVersion: string;
  triggerType: 'MANUAL' | 'SCHEDULED' | 'EVENT';
  tenantId: string;
  inputSnapshot: Record<string, any>;
  status: WorkflowRunStatus;
  currentStepId: string | null;
  stepRuns: WorkflowStepRun[];
  checkpoints: WorkflowCheckpoint[];
  approvals: ApprovalRequest[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
  resourceUsage: {
    browserJobs: number;
    verificationRequests: number;
    entitiesProcessed: number;
    exportRows: number;
  };
}

export interface WorkflowSchedule {
  scheduleId: string;
  workflowId: string;
  workflowName: string;
  cronExpression: string;
  humanReadable: string;
  timezone: string;
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
  overlapPolicy: OverlapPolicy;
  missedSchedulePolicy: MissedSchedulePolicy;
  maxCatchUpRuns: number;
}

export interface BulkProcessingBatch {
  batchId: string;
  workflowRunId: string;
  totalEntities: number;
  chunkSize: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  reviewRequiredCount: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  startedAt: string;
  estimatedCompletionAt?: string;
}

export interface WorkflowAuditEvent {
  eventId: string;
  workflowRunId: string;
  eventType: string;
  actor: string;
  stepId?: string;
  summary: string;
  details: Record<string, any>;
  timestamp: string;
}

// ============================================================
// PHASE 13: GOLDEN RECIPES & SYSTEM DEFINITIONS
// ============================================================

export const GOLDEN_WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
  {
    workflowId: 'wf_def_weekly_solar_leads',
    name: 'Weekly Clean Energy Lead Discovery & Verification',
    description: 'Autonomous research recipe: Collects Texas solar ads, validates extraction schema, resolves business entities, executes TLS/SSRF verification probes, qualifies lead scores, and generates review items if conflicts emerge.',
    version: '1.2.0',
    status: 'ACTIVE',
    owner: 'operator_daniela_leadops',
    tenantId: 'tenant_enterprise_cleanenergy',
    trigger: 'SCHEDULED',
    inputs: {
      searchQuery: { type: 'string', required: true, description: 'Meta Ad Library search query string', defaultValue: 'residential solar Texas' },
      maxAdLimit: { type: 'number', required: true, description: 'Collection threshold boundary', defaultValue: 50 },
      verificationPolicy: { type: 'string', required: true, description: 'Probe policy tier', defaultValue: 'FULL_NETWORK_AND_IDENTITY' },
      qualificationModelVersion: { type: 'string', required: true, description: 'Target scoring model', defaultValue: 'v2.4-enterprise-strict' }
    },
    steps: [
      {
        stepId: 'step_collect_01',
        name: 'Collect Meta Public Ads',
        type: 'COLLECT',
        version: '1.0.0',
        dependsOn: [],
        inputMapping: { query: 'inputs.searchQuery', limit: 'inputs.maxAdLimit' },
        outputMapping: { observationBatchId: 'outputs.batchId' },
        retryPolicy: { maxAttempts: 2, backoffMs: 5000, budgetMultiplierLimit: 2 },
        timeoutPolicy: { stepTimeoutMs: 120000 },
        approvalPolicy: 'NONE',
        concurrencyPolicy: { maxParallelItems: 1 },
        position: { x: 50, y: 120 }
      },
      {
        stepId: 'step_validate_02',
        name: 'Validate & Normalize Observations',
        type: 'VALIDATE',
        version: '1.0.0',
        dependsOn: ['step_collect_01'],
        inputMapping: { batchId: 'steps.step_collect_01.observationBatchId' },
        outputMapping: { normalizedEntityRefs: 'outputs.entityRefs' },
        retryPolicy: { maxAttempts: 1, backoffMs: 2000, budgetMultiplierLimit: 1 },
        timeoutPolicy: { stepTimeoutMs: 30000 },
        approvalPolicy: 'NONE',
        concurrencyPolicy: { maxParallelItems: 10 },
        position: { x: 250, y: 120 }
      },
      {
        stepId: 'step_resolve_03',
        name: 'Resolve Identity & Match Registry',
        type: 'RESOLVE_IDENTITY',
        version: '1.1.0',
        dependsOn: ['step_validate_02'],
        inputMapping: { entityRefs: 'steps.step_validate_02.normalizedEntityRefs' },
        outputMapping: { canonicalAdvertiserIds: 'outputs.advertiserIds' },
        retryPolicy: { maxAttempts: 2, backoffMs: 3000, budgetMultiplierLimit: 2 },
        timeoutPolicy: { stepTimeoutMs: 45000 },
        approvalPolicy: 'NONE',
        concurrencyPolicy: { maxParallelItems: 5 },
        position: { x: 450, y: 120 }
      },
      {
        stepId: 'step_verify_04',
        name: 'Probe Destination & TLS Certificate',
        type: 'VERIFY',
        version: '1.2.0',
        dependsOn: ['step_resolve_03'],
        inputMapping: { advertiserIds: 'steps.step_resolve_03.canonicalAdvertiserIds' },
        outputMapping: { verificationResultRefs: 'outputs.verificationRefs' },
        retryPolicy: { maxAttempts: 2, backoffMs: 5000, budgetMultiplierLimit: 2 },
        timeoutPolicy: { stepTimeoutMs: 60000 },
        approvalPolicy: 'NONE',
        concurrencyPolicy: { maxParallelItems: 4 },
        position: { x: 650, y: 60 }
      },
      {
        stepId: 'step_qualify_05',
        name: 'Calculate Lead Qualification Score',
        type: 'QUALIFY',
        version: '2.4.0',
        dependsOn: ['step_verify_04'],
        inputMapping: { verificationRefs: 'steps.step_verify_04.verificationResultRefs' },
        outputMapping: { qualificationLedger: 'outputs.ledgerRef' },
        retryPolicy: { maxAttempts: 1, backoffMs: 2000, budgetMultiplierLimit: 1 },
        timeoutPolicy: { stepTimeoutMs: 30000 },
        approvalPolicy: 'NONE',
        concurrencyPolicy: { maxParallelItems: 10 },
        position: { x: 850, y: 60 }
      },
      {
        stepId: 'step_cond_review_06',
        name: 'Triage Ambiguous Findings to Review Queue',
        type: 'CREATE_REVIEW',
        version: '1.0.0',
        dependsOn: ['step_qualify_05'],
        condition: {
          logic: 'OR',
          rules: [
            { field: 'qualificationState', operator: 'equals', value: 'REVIEW_REQUIRED' },
            { field: 'identityReviewState', operator: 'equals', value: 'FLAGGED_CONFLICT' }
          ]
        },
        inputMapping: { entities: 'steps.step_qualify_05.qualificationLedger' },
        outputMapping: { reviewQueueItemIds: 'outputs.reviewItems' },
        retryPolicy: { maxAttempts: 1, backoffMs: 2000, budgetMultiplierLimit: 1 },
        timeoutPolicy: { stepTimeoutMs: 20000 },
        approvalPolicy: 'NONE',
        concurrencyPolicy: { maxParallelItems: 5 },
        position: { x: 850, y: 200 }
      },
      {
        stepId: 'step_export_07',
        name: 'Generate Sanitized Handoff Export',
        type: 'EXPORT',
        version: '1.0.0',
        dependsOn: ['step_qualify_05'],
        inputMapping: { ledger: 'steps.step_qualify_05.qualificationLedger' },
        outputMapping: { exportArtifactUri: 'outputs.exportUri' },
        retryPolicy: { maxAttempts: 1, backoffMs: 5000, budgetMultiplierLimit: 1 },
        timeoutPolicy: { stepTimeoutMs: 45000 },
        approvalPolicy: 'REQUIRED',
        concurrencyPolicy: { maxParallelItems: 1 },
        position: { x: 1050, y: 120 }
      }
    ],
    policies: {
      maxWorkflowDurationMs: 600000,
      totalRetryBudget: 5,
      failurePolicy: 'CONTINUE_WITH_THRESHOLD',
      failureThresholdPercentage: 15,
      requireTenantBoundary: true,
      scoringModelVersion: 'v2.4-enterprise-strict',
      exportProfile: 'SAFE_BUSINESS_AND_PROVENANCE'
    },
    outputs: {
      summaryReportRef: 'step_qualify_05.qualificationLedger',
      exportDownloadUrl: 'step_export_07.exportArtifactUri'
    },
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-09-15T16:30:00Z'
  },
  {
    workflowId: 'wf_def_destination_probes',
    name: 'Bulk Infrastructure & SSL Re-Verification Suite',
    description: 'Targeted probe pipeline for re-checking HTTP reachability, SSL certificate validity, and DNS resolution on 500+ active domains without re-scraping creative copy.',
    version: '2.0.1',
    status: 'ACTIVE',
    owner: 'sre_jordan_ops',
    tenantId: 'tenant_enterprise_cleanenergy',
    trigger: 'EVENT',
    inputs: {
      targetCohort: { type: 'string', required: true, description: 'Named cohort of domains to re-verify', defaultValue: 'watched_solar_installers' },
      maxParallelProbes: { type: 'number', required: true, description: 'SSRF-bounded concurrency limit', defaultValue: 8 }
    },
    steps: [
      {
        stepId: 'step_probe_01',
        name: 'Execute TLS & SSRF Probes',
        type: 'VERIFY',
        version: '1.2.0',
        dependsOn: [],
        inputMapping: { cohort: 'inputs.targetCohort' },
        outputMapping: { probeResults: 'outputs.results' },
        retryPolicy: { maxAttempts: 2, backoffMs: 3000, budgetMultiplierLimit: 2 },
        timeoutPolicy: { stepTimeoutMs: 180000 },
        approvalPolicy: 'NONE',
        concurrencyPolicy: { maxParallelItems: 8 },
        position: { x: 100, y: 100 }
      },
      {
        stepId: 'step_snapshot_02',
        name: 'Record Network Health Snapshot',
        type: 'SNAPSHOT',
        version: '1.0.0',
        dependsOn: ['step_probe_01'],
        inputMapping: { data: 'steps.step_probe_01.probeResults' },
        outputMapping: { snapshotId: 'outputs.snapshotId' },
        retryPolicy: { maxAttempts: 1, backoffMs: 1000, budgetMultiplierLimit: 1 },
        timeoutPolicy: { stepTimeoutMs: 15000 },
        approvalPolicy: 'NONE',
        concurrencyPolicy: { maxParallelItems: 1 },
        position: { x: 350, y: 100 }
      }
    ],
    policies: {
      maxWorkflowDurationMs: 300000,
      totalRetryBudget: 3,
      failurePolicy: 'CONTINUE',
      failureThresholdPercentage: 5,
      requireTenantBoundary: true,
      scoringModelVersion: 'v2.4-enterprise-strict',
      exportProfile: 'AUDIT_EXPORT'
    },
    outputs: {
      snapshotRef: 'step_snapshot_02.snapshotId'
    },
    createdAt: '2026-09-12T09:00:00Z',
    updatedAt: '2026-09-14T14:15:00Z'
  }
];

export const SAMPLE_WORKFLOW_RUNS: WorkflowRun[] = [
  {
    runId: 'run_wk_20260916_001',
    workflowId: 'wf_def_weekly_solar_leads',
    workflowName: 'Weekly Clean Energy Lead Discovery & Verification',
    workflowVersion: '1.2.0',
    triggerType: 'SCHEDULED',
    tenantId: 'tenant_enterprise_cleanenergy',
    inputSnapshot: {
      searchQuery: 'residential solar Texas',
      maxAdLimit: 50,
      verificationPolicy: 'FULL_NETWORK_AND_IDENTITY',
      qualificationModelVersion: 'v2.4-enterprise-strict'
    },
    status: 'WAITING',
    currentStepId: 'step_export_07',
    stepRuns: [
      {
        stepRunId: 'sr_01_c',
        workflowRunId: 'run_wk_20260916_001',
        stepId: 'step_collect_01',
        stepName: 'Collect Meta Public Ads',
        stepType: 'COLLECT',
        attempt: 1,
        status: 'COMPLETED',
        inputSnapshot: { query: 'residential solar Texas', limit: 50 },
        outputReference: 'durable_ref://batch_01j7p8_texas_solar',
        startedAt: '2026-09-16T08:00:02Z',
        completedAt: '2026-09-16T08:02:14Z',
        durationMs: 132000
      },
      {
        stepRunId: 'sr_02_v',
        workflowRunId: 'run_wk_20260916_001',
        stepId: 'step_validate_02',
        stepName: 'Validate & Normalize Observations',
        stepType: 'VALIDATE',
        attempt: 1,
        status: 'COMPLETED',
        inputSnapshot: { batchId: 'durable_ref://batch_01j7p8_texas_solar' },
        outputReference: 'durable_ref://norm_entities_48_valid',
        startedAt: '2026-09-16T08:02:15Z',
        completedAt: '2026-09-16T08:02:40Z',
        durationMs: 25000
      },
      {
        stepRunId: 'sr_03_r',
        workflowRunId: 'run_wk_20260916_001',
        stepId: 'step_resolve_03',
        stepName: 'Resolve Identity & Match Registry',
        stepType: 'RESOLVE_IDENTITY',
        attempt: 1,
        status: 'COMPLETED',
        inputSnapshot: { entityRefs: 'durable_ref://norm_entities_48_valid' },
        outputReference: 'durable_ref://canonical_adv_44_resolved',
        startedAt: '2026-09-16T08:02:41Z',
        completedAt: '2026-09-16T08:03:19Z',
        durationMs: 38000
      },
      {
        stepRunId: 'sr_04_vp',
        workflowRunId: 'run_wk_20260916_001',
        stepId: 'step_verify_04',
        stepName: 'Probe Destination & TLS Certificate',
        stepType: 'VERIFY',
        attempt: 1,
        status: 'COMPLETED',
        inputSnapshot: { advertiserIds: 'durable_ref://canonical_adv_44_resolved' },
        outputReference: 'durable_ref://verification_probes_44_done',
        startedAt: '2026-09-16T08:03:20Z',
        completedAt: '2026-09-16T08:04:12Z',
        durationMs: 52000
      },
      {
        stepRunId: 'sr_05_q',
        workflowRunId: 'run_wk_20260916_001',
        stepId: 'step_qualify_05',
        stepName: 'Calculate Lead Qualification Score',
        stepType: 'QUALIFY',
        attempt: 1,
        status: 'COMPLETED',
        inputSnapshot: { verificationRefs: 'durable_ref://verification_probes_44_done' },
        outputReference: 'durable_ref://lead_scores_v24_output',
        startedAt: '2026-09-16T08:04:13Z',
        completedAt: '2026-09-16T08:04:31Z',
        durationMs: 18000
      },
      {
        stepRunId: 'sr_06_cr',
        workflowRunId: 'run_wk_20260916_001',
        stepId: 'step_cond_review_06',
        stepName: 'Triage Ambiguous Findings to Review Queue',
        stepType: 'CREATE_REVIEW',
        attempt: 1,
        status: 'COMPLETED',
        inputSnapshot: { entities: 'durable_ref://lead_scores_v24_output' },
        outputReference: 'durable_ref://review_item_rev_01j7p8_apexroof',
        startedAt: '2026-09-16T08:04:32Z',
        completedAt: '2026-09-16T08:04:39Z',
        durationMs: 7000
      },
      {
        stepRunId: 'sr_07_e',
        workflowRunId: 'run_wk_20260916_001',
        stepId: 'step_export_07',
        stepName: 'Generate Sanitized Handoff Export',
        stepType: 'EXPORT',
        attempt: 1,
        status: 'WAITING_APPROVAL',
        inputSnapshot: { ledger: 'durable_ref://lead_scores_v24_output' },
        startedAt: '2026-09-16T08:04:40Z'
      }
    ],
    checkpoints: [
      {
        checkpointId: 'chk_001_initial',
        runId: 'run_wk_20260916_001',
        stepId: 'step_collect_01',
        completedSteps: ['step_collect_01'],
        pendingSteps: ['step_validate_02', 'step_resolve_03', 'step_verify_04', 'step_qualify_05', 'step_cond_review_06', 'step_export_07'],
        activeStepId: 'step_validate_02',
        durableOutputRefs: { batchId: 'durable_ref://batch_01j7p8_texas_solar' },
        savedAt: '2026-09-16T08:02:14Z',
        stateHash: 'sha256:7f3a80e129bcae912440'
      },
      {
        checkpointId: 'chk_002_qualified',
        runId: 'run_wk_20260916_001',
        stepId: 'step_qualify_05',
        completedSteps: ['step_collect_01', 'step_validate_02', 'step_resolve_03', 'step_verify_04', 'step_qualify_05', 'step_cond_review_06'],
        pendingSteps: ['step_export_07'],
        activeStepId: 'step_export_07',
        durableOutputRefs: { ledgerRef: 'durable_ref://lead_scores_v24_output' },
        savedAt: '2026-09-16T08:04:39Z',
        stateHash: 'sha256:4b11f00a98ed23bc61a0'
      }
    ],
    approvals: [
      {
        approvalId: 'appr_req_9921',
        workflowRunId: 'run_wk_20260916_001',
        stepRunId: 'sr_07_e',
        stepName: 'Generate Sanitized Handoff Export',
        requestedBy: 'orchestrator_daemon',
        reason: 'Sensitive client export generation requires operator sign-off in accordance with SAFE_BUSINESS_AND_PROVENANCE profile.',
        status: 'PENDING',
        timestamp: '2026-09-16T08:04:40Z'
      }
    ],
    startedAt: '2026-09-16T08:00:00Z',
    updatedAt: '2026-09-16T08:05:00Z',
    resourceUsage: {
      browserJobs: 1,
      verificationRequests: 44,
      entitiesProcessed: 48,
      exportRows: 0
    }
  },
  {
    runId: 'run_wk_20260915_002',
    workflowId: 'wf_def_destination_probes',
    workflowName: 'Bulk Infrastructure & SSL Re-Verification Suite',
    workflowVersion: '2.0.1',
    triggerType: 'EVENT',
    tenantId: 'tenant_enterprise_cleanenergy',
    inputSnapshot: {
      targetCohort: 'watched_solar_installers',
      maxParallelProbes: 8
    },
    status: 'COMPLETED',
    currentStepId: null,
    stepRuns: [
      {
        stepRunId: 'sr_01_dp',
        workflowRunId: 'run_wk_20260915_002',
        stepId: 'step_probe_01',
        stepName: 'Execute TLS & SSRF Probes',
        stepType: 'VERIFY',
        attempt: 1,
        status: 'COMPLETED',
        inputSnapshot: { cohort: 'watched_solar_installers' },
        outputReference: 'durable_ref://probe_results_cohort_21_ok',
        startedAt: '2026-09-15T14:00:00Z',
        completedAt: '2026-09-15T14:02:18Z',
        durationMs: 138000
      },
      {
        stepRunId: 'sr_02_ds',
        workflowRunId: 'run_wk_20260915_002',
        stepId: 'step_snapshot_02',
        stepName: 'Record Network Health Snapshot',
        stepType: 'SNAPSHOT',
        attempt: 1,
        status: 'COMPLETED',
        inputSnapshot: { data: 'durable_ref://probe_results_cohort_21_ok' },
        outputReference: 'durable_ref://snapshot_20260915_nethealth',
        startedAt: '2026-09-15T14:02:19Z',
        completedAt: '2026-09-15T14:02:26Z',
        durationMs: 7000
      }
    ],
    checkpoints: [],
    approvals: [],
    startedAt: '2026-09-15T14:00:00Z',
    updatedAt: '2026-09-15T14:02:30Z',
    completedAt: '2026-09-15T14:02:26Z',
    resourceUsage: {
      browserJobs: 0,
      verificationRequests: 21,
      entitiesProcessed: 21,
      exportRows: 0
    }
  }
];

export const SAMPLE_WORKFLOW_SCHEDULES: WorkflowSchedule[] = [
  {
    scheduleId: 'sched_weekly_solar_mondays',
    workflowId: 'wf_def_weekly_solar_leads',
    workflowName: 'Weekly Clean Energy Lead Discovery & Verification',
    cronExpression: '0 8 * * 1',
    humanReadable: 'Every Monday at 08:00 UTC',
    timezone: 'UTC',
    enabled: true,
    nextRun: '2026-09-22T08:00:00Z',
    lastRun: '2026-09-15T08:00:00Z',
    overlapPolicy: 'QUEUE',
    missedSchedulePolicy: 'RUN_NEXT',
    maxCatchUpRuns: 1
  },
  {
    scheduleId: 'sched_nightly_domain_probes',
    workflowId: 'wf_def_destination_probes',
    workflowName: 'Bulk Infrastructure & SSL Re-Verification Suite',
    cronExpression: '0 2 * * *',
    humanReadable: 'Every day at 02:00 UTC',
    timezone: 'UTC',
    enabled: true,
    nextRun: '2026-09-17T02:00:00Z',
    lastRun: '2026-09-16T02:00:00Z',
    overlapPolicy: 'SKIP',
    missedSchedulePolicy: 'SKIP',
    maxCatchUpRuns: 0
  }
];

export const SAMPLE_BULK_BATCH: BulkProcessingBatch = {
  batchId: 'batch_chunk_solar_500',
  workflowRunId: 'run_wk_20260916_001',
  totalEntities: 500,
  chunkSize: 50,
  processedCount: 350,
  successCount: 318,
  failedCount: 14,
  skippedCount: 10,
  reviewRequiredCount: 8,
  status: 'PROCESSING',
  startedAt: '2026-09-16T08:00:00Z',
  estimatedCompletionAt: '2026-09-16T08:20:00Z'
};

export const SAMPLE_WORKFLOW_AUDIT_LOGS: WorkflowAuditEvent[] = [
  {
    eventId: 'evt_wf_001',
    workflowRunId: 'run_wk_20260916_001',
    eventType: 'WORKFLOW_STARTED',
    actor: 'system:cron_scheduler',
    summary: 'Workflow triggered by cron schedule sched_weekly_solar_mondays',
    details: { cron: '0 8 * * 1', timezone: 'UTC', targetLimit: 50 },
    timestamp: '2026-09-16T08:00:00Z'
  },
  {
    eventId: 'evt_wf_002',
    workflowRunId: 'run_wk_20260916_001',
    eventType: 'STEP_COMPLETED',
    actor: 'worker:browser_01',
    stepId: 'step_collect_01',
    summary: 'Public Meta Ad collection completed: 48 ad records observed',
    details: { durationMs: 132000, batchHash: 'sha256:7f3a80e129bcae91' },
    timestamp: '2026-09-16T08:02:14Z'
  },
  {
    eventId: 'evt_wf_003',
    workflowRunId: 'run_wk_20260916_001',
    eventType: 'CHECKPOINT_SAVED',
    actor: 'orchestrator_daemon',
    stepId: 'step_collect_01',
    summary: 'Durable checkpoint chk_001_initial persisted to PostgreSQL audit layer',
    details: { completedSteps: ['step_collect_01'] },
    timestamp: '2026-09-16T08:02:14Z'
  },
  {
    eventId: 'evt_wf_004',
    workflowRunId: 'run_wk_20260916_001',
    eventType: 'APPROVAL_REQUESTED',
    actor: 'orchestrator_daemon',
    stepId: 'step_export_07',
    summary: 'Human operator approval requested for sanitized export release',
    details: { approvalPolicy: 'REQUIRED', requestedBy: 'orchestrator_daemon' },
    timestamp: '2026-09-16T08:04:40Z'
  }
];

// ============================================================
// DAG VALIDATOR & TOPOLOGICAL SORTER
// ============================================================

export interface DagValidationResult {
  isValid: boolean;
  errors: string[];
  executionOrder: string[];
}

export function validateWorkflowDag(steps: WorkflowStep[]): DagValidationResult {
  const stepIds = new Set(steps.map(s => s.stepId));
  const errors: string[] = [];

  // Check unique IDs
  if (stepIds.size !== steps.length) {
    errors.push('Workflow steps must have strictly unique stepId identifiers.');
  }

  // Check valid step types
  const validTypes = new Set<StepType>([
    'COLLECT', 'VALIDATE', 'NORMALIZE', 'RESOLVE_IDENTITY', 'VERIFY',
    'QUALIFY', 'CREATE_REVIEW', 'WAIT_FOR_REVIEW', 'EXPORT', 'NOTIFY',
    'SNAPSHOT', 'STOP', 'WAIT'
  ]);

  for (const step of steps) {
    if (!validTypes.has(step.type)) {
      errors.push(`Step '${step.stepId}' uses unauthorized step type: '${step.type}'.`);
    }

    // Check dependencies exist
    for (const dep of step.dependsOn) {
      if (!stepIds.has(dep)) {
        errors.push(`Step '${step.stepId}' references non-existent dependency: '${dep}'.`);
      }
      if (dep === step.stepId) {
        errors.push(`Step '${step.stepId}' cannot depend on itself (self-cycle).`);
      }
    }
  }

  // Cycle detection via Kahn's Algorithm (Topological Sort)
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  steps.forEach(s => {
    inDegree[s.stepId] = s.dependsOn.length;
    adj[s.stepId] = [];
  });

  steps.forEach(s => {
    s.dependsOn.forEach(dep => {
      if (adj[dep]) {
        adj[dep].push(s.stepId);
      }
    });
  });

  const queue: string[] = Object.keys(inDegree).filter(id => inDegree[id] === 0);
  const executionOrder: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    executionOrder.push(curr);

    const neighbors = adj[curr] || [];
    for (const neighbor of neighbors) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (executionOrder.length !== steps.length) {
    errors.push('Workflow graph contains circular dependencies or cycles (DAG violation).');
  }

  return {
    isValid: errors.length === 0,
    errors,
    executionOrder
  };
}

// ============================================================
// RESTRICTED CONDITION EVALUATOR
// Safe, no-eval, typed expression parser
// ============================================================

export function evaluateCondition(condition: ConditionExpression, context: Record<string, any>): boolean {
  if (!condition || !condition.rules || condition.rules.length === 0) {
    return true;
  }

  const results = condition.rules.map(rule => {
    const actual = context[rule.field];
    switch (rule.operator) {
      case 'equals':
        return actual === rule.value;
      case 'notEquals':
        return actual !== rule.value;
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(actual);
      case 'notIn':
        return Array.isArray(rule.value) && !rule.value.includes(actual);
      case 'exists':
        return actual !== undefined && actual !== null && actual !== '';
      case 'missing':
        return actual === undefined || actual === null || actual === '';
      case 'greaterThan':
        return typeof actual === 'number' && actual > rule.value;
      case 'lessThan':
        return typeof actual === 'number' && actual < rule.value;
      default:
        return false;
    }
  });

  if (condition.logic === 'OR') {
    return results.some(Boolean);
  }
  return results.every(Boolean);
}
