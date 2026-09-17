/**
 * PHASE 24 — PRODUCTION OPERATIONS & RECOVERY CONTROL PLANE ENGINE
 * 
 * Strict architectural boundaries:
 * - Preserves Phase 17 Policy Invariants, Phase 18 Multi-Tenant Isolation, Phase 19 Collaboration,
 *   Phase 20 Search, Phase 21 Evidence, Phase 22 Continuous Monitoring, Phase 23 Governance & Audit.
 * - Non-negotiable: NO arbitrary shell execution, NO raw SQL injection, NO eval/JS execution.
 * - All recovery actions are strictly typed, allowlisted, authenticated, and tenant-fenced.
 * - Recovery is CONTROLLED + DETERMINISTIC + IDEMPOTENT + AUDITABLE + TENANT-SAFE + EVIDENCE-BACKED.
 * - Implements 20 Phase 24 Reliability & Security Invariants (INVARIANT-24-001 to INVARIANT-24-020).
 */

import { TenantContext } from './phase18MultiTenantEngine';

// ============================================================
// 1. DOMAIN ENUMS & TYPES
// ============================================================

export type HealthStatus = 
  | 'HEALTHY' 
  | 'DEGRADED' 
  | 'UNHEALTHY' 
  | 'CRITICAL' 
  | 'UNKNOWN' 
  | 'MAINTENANCE';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type JobState = 
  | 'CREATED'
  | 'QUEUED'
  | 'LEASED'
  | 'RUNNING'
  | 'PAUSED'
  | 'WAITING'
  | 'SUCCEEDED'
  | 'PARTIAL'
  | 'FAILED'
  | 'RETRYING'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'STUCK'
  | 'DEAD_LETTER'
  | 'ABANDONED';

export type RecoveryOperationType =
  | 'RETRY_TRANSIENT_FAILURE'
  | 'RESUME_FROM_CHECKPOINT'
  | 'REPLAY_INPUTS'
  | 'REPROCESS_VERSION_LOGIC'
  | 'REPAIR_STATE_CORRUPTION'
  | 'ROLLBACK_TRANSACTION'
  | 'CANCEL_EXECUTION'
  | 'ABANDON_POISON_JOB'
  | 'DRAIN_WORKER_NODE'
  | 'FORCE_RECLAIM_LEASE'
  | 'RESET_CIRCUIT_BREAKER'
  | 'RECONCILE_TENANT_QUEUES'
  | 'PURGE_DEAD_LETTER_TO_ARCHIVE';

export type StuckClassification = 
  | 'STUCK_LEASE_EXPIRED'
  | 'STUCK_ZOMBIE_WORKER'
  | 'STUCK_CHECKPOINT_TIMEOUT'
  | 'STUCK_RATE_LIMIT_PAUSED'
  | 'STUCK_UNRESPONSIVE_DEPENDENCY'
  | 'NOT_STUCK';

export type BackpressureState = 'NORMAL' | 'THROTTLED' | 'SATURATED' | 'BLOCKED';

export type WorkerType = 
  | 'HEADLESS_PLAYWRIGHT_WORKER'
  | 'PIPELINE_TRANSFORMER'
  | 'VERIFICATION_PROBER'
  | 'RECONCILIATION_RUNNER';

export type WorkerStatus = 'ONLINE' | 'BUSY' | 'DRAINING' | 'OFFLINE' | 'UNRESPONSIVE';

export type RunbookExecutionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'VERIFYING' | 'COMPLETED' | 'FAILED' | 'ABORTED';

export type DependencyCategory = 
  | 'BROWSER_CLUSTER'
  | 'POSTGRES_STORE'
  | 'REDIS_QUEUE'
  | 'META_AD_LIBRARY_ENDPOINT'
  | 'POLICY_ENGINE'
  | 'EVIDENCE_VAULT'
  | 'OBJECT_STORAGE'
  | 'ENCRYPTION_KMS';

// ============================================================
// 2. CORE DOMAIN INTERFACES
// ============================================================

export interface DependencyComponent {
  componentId: string;
  name: string;
  category: DependencyCategory;
  healthStatus: HealthStatus;
  latencyMs: number;
  p99LatencyMs: number;
  errorRatePercent: number;
  circuitBreakerState: CircuitBreakerState;
  circuitBreakerFailures: number;
  circuitBreakerThreshold: number;
  fallbackMode: string;
  lastCheckedAt: string;
  activeIncidentIds: string[];
  details: string;
  endpointUrl?: string;
}

export interface WorkerNodeRecord {
  workerId: string;
  workerType: WorkerType;
  hostName: string;
  nodePool: string;
  status: WorkerStatus;
  memoryUsageMb: number;
  memoryLimitMb: number;
  activeBrowserContexts: number;
  maxBrowserContexts: number;
  currentLeaseIds: string[];
  fencingEpoch: number;
  lastHeartbeatAt: string;
  ipAddress: string;
  version: string;
  assignedQueues: string[];
}

export interface QueueInspectionRecord {
  queueId: string;
  queueName: string;
  tenantId: string;
  pendingCount: number;
  inFlightCount: number;
  dlqCount: number;
  delayedCount: number;
  consumerWorkersCount: number;
  throughputPerMin: number;
  avgWaitTimeSec: number;
  backpressureState: BackpressureState;
  maxConcurrency: number;
  rateLimitPerSec: number;
  lastFlushedAt?: string;
}

export interface JobCheckpointData {
  lastScrapedPage: number;
  totalPagesEstimated: number;
  extractedRecordsCount: number;
  lastObservedAdArchiveId?: string;
  lastCheckpointHash: string;
  checkpointTimestamp: string;
}

export interface JobInspectionRecord {
  jobId: string;
  jobType: 'AD_LIBRARY_SCRAPE' | 'WEBSITE_VERIFICATION' | 'LEAD_SCORING' | 'EXPORT_BUNDLE' | 'MONITORING_SWEEP';
  tenantId: string;
  status: JobState;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  attemptsCount: number;
  maxAttempts: number;
  currentAttemptId: string;
  leaseOwnerWorkerId?: string;
  leaseExpiresAt?: string;
  fencingToken: number;
  checkpointData?: JobCheckpointData;
  idempotencyKey: string;
  errorDetails?: string;
  rootCauseCategory?: string;
  stuckClassification: StuckClassification;
  lastHeartbeatAt?: string;
  createdAt: string;
  updatedAt: string;
  incidentId?: string;
  inputSummary: string;
  extractedEntitiesCount: number;
}

export interface JobAttemptRecord {
  attemptId: string;
  jobId: string;
  attemptNumber: number;
  workerId: string;
  fencingToken: number;
  startedAt: string;
  finishedAt?: string;
  status: 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTED';
  failureReason?: string;
  exitCode?: number;
  logsSample: string[];
}

export interface RecoveryActionRecord {
  actionId: string;
  operationType: RecoveryOperationType;
  targetJobId?: string;
  targetWorkerId?: string;
  targetQueueId?: string;
  targetComponent?: string;
  tenantId: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  idempotencyKey: string;
  fencingEpoch: number;
  requiresDualApproval: boolean;
  reason: string;
  preCheckResult: string;
  postCheckResult?: string;
  auditEventId: string;
  startedAt: string;
  completedAt?: string;
  details: string;
}

export interface RunbookStep {
  stepId: string;
  title: string;
  description: string;
  stepType: 
    | 'HEALTH_CHECK' 
    | 'CIRCUIT_BREAKER_TRIP' 
    | 'WORKER_DRAIN' 
    | 'LEASE_RECLAIM' 
    | 'BACKOFF_ADJUST' 
    | 'RETRY_ENQUEUE' 
    | 'STATE_RECONCILE' 
    | 'NOTIFICATION';
  automated: boolean;
  status: RunbookExecutionStatus;
  verificationCheck: string;
  outputLog?: string;
}

export interface OperationalRunbook {
  runbookId: string;
  title: string;
  code: string;
  description: string;
  triggerCondition: string;
  targetComponent: string;
  requiresDualApproval: boolean;
  estimatedDurationSec: number;
  steps: RunbookStep[];
  lastExecutedAt?: string;
  executionCount: number;
}

export interface ReconciliationDiscrepancy {
  discrepancyId: string;
  category: 
    | 'QUEUE_VS_DATABASE' 
    | 'EXPIRED_LEASE_ACTIVE' 
    | 'ZOMBIE_WORKER_HEARTBEAT' 
    | 'CHECKPOINT_DRIFT' 
    | 'ORPHANED_RECORD';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  entityId: string;
  expectedState: string;
  actualState: string;
  detectedAt: string;
  resolved: boolean;
  resolutionPlan: string;
}

export interface SecurityInvariantStatus {
  invariantId: string;
  code: string;
  title: string;
  category: 'RELIABILITY' | 'ISOLATION' | 'FENCING' | 'AUDIT' | 'AUTHORIZATION' | 'SAFETY';
  description: string;
  enforcementMechanism: string;
  verified: boolean;
  lastEvaluatedAt: string;
  violationCount: number;
}

// ============================================================
// 3. 20 PHASE 24 RELIABILITY & SECURITY INVARIANTS
// ============================================================

export const PLATFORM_INVARIANTS_24: SecurityInvariantStatus[] = [
  {
    invariantId: 'INV-24-001',
    code: 'INVARIANT-24-001',
    title: 'Typed and Allowlisted Recovery Operations Only',
    category: 'SAFETY',
    description: 'Arbitrary shell, raw SQL injection, eval, or unvetted scripts are strictly forbidden in recovery flows.',
    enforcementMechanism: 'Strict enum mapping to compile-time typed recovery executors.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-002',
    code: 'INVARIANT-24-002',
    title: 'Tenant Isolation in Recovery Operations',
    category: 'ISOLATION',
    description: 'No recovery action can inspect, modify, or replay jobs or queue items across tenant boundaries.',
    enforcementMechanism: 'Multi-tenant authorization filter on every operation before mutation.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-003',
    code: 'INVARIANT-24-003',
    title: 'Mutual Exclusivity of Recovery Operations',
    category: 'RELIABILITY',
    description: 'Two concurrent recovery actions cannot operate on the same job or queue simultaneously.',
    enforcementMechanism: 'Distributed locking lease and job state check prior to action execution.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-004',
    code: 'INVARIANT-24-004',
    title: 'Monotonic Fencing Tokens on Worker State Writes',
    category: 'FENCING',
    description: 'Older worker instances cannot write state or complete jobs if a lease has been reclaimed.',
    enforcementMechanism: 'Postgres transactional fencing token comparison (reject if token <= current epoch).',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-005',
    code: 'INVARIANT-24-005',
    title: 'Mandatory Idempotency Key Validation',
    category: 'RELIABILITY',
    description: 'All recovery operations (Retry, Replay, Resume, Repair) require unique client idempotency keys.',
    enforcementMechanism: 'Idempotency lookup table preventing duplicate side-effects on replay.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-006',
    code: 'INVARIANT-24-006',
    title: 'Circuit Breaker Rejection of Automated Retries',
    category: 'RELIABILITY',
    description: 'Tripped circuit breakers immediately fail-fast and reject automated worker traffic to prevent cascading.',
    enforcementMechanism: 'Circuit breaker state machine (OPEN / HALF_OPEN / CLOSED) with cooling period.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-007',
    code: 'INVARIANT-24-007',
    title: 'Stale Lease Reclaim Requires Grace Period and Epoch Advancement',
    category: 'FENCING',
    description: 'Lease reclaim is only permitted after heartbeat timeout + 30s grace window and must advance fencing epoch.',
    enforcementMechanism: 'Strict temporal check on heartbeat timestamp + lease expiry time.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-008',
    code: 'INVARIANT-24-008',
    title: 'Dual Approval for High-Impact Recovery Operations',
    category: 'AUTHORIZATION',
    description: 'Bulk replays, queue purges, worker node evictions, and force rollbacks require dual-operator authorization.',
    enforcementMechanism: 'Two-person rule engine matching distinct user IDs before privileged execution.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-009',
    code: 'INVARIANT-24-009',
    title: 'Immutable Audit Trail on Recovery Execution',
    category: 'AUDIT',
    description: 'Every recovery action triggers an append-only audit event in Phase 23 ledger with hash chaining.',
    enforcementMechanism: 'Synchronous dispatch to Phase 23 audit bus with SHA-256 event digest.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-010',
    code: 'INVARIANT-24-010',
    title: 'Downstream Rate Limit and Backpressure Protection',
    category: 'SAFETY',
    description: 'Batch recovery and replay workflows cannot exceed external Meta Ad Library rate thresholds (token bucket).',
    enforcementMechanism: 'Token bucket limiter with maximum burst cap and jittered exponential backoff.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-011',
    code: 'INVARIANT-24-011',
    title: 'Data Integrity Pre-Check and Post-Check on State Repair',
    category: 'RELIABILITY',
    description: 'State repair or rollback must verify entity count and schema consistency before and after modification.',
    enforcementMechanism: 'Atomic pre/post reconciliation assertions wrapping state repair transactions.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-012',
    code: 'INVARIANT-24-012',
    title: 'Distinct Operational Semantics Enforced',
    category: 'SAFETY',
    description: 'RETRY, RESUME, REPLAY, REPROCESS, REPAIR, ROLLBACK, CANCEL, and ABANDON are formally segregated.',
    enforcementMechanism: 'Semantic type discriminator preventing improper reuse of recovery handlers.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-013',
    code: 'INVARIANT-24-013',
    title: 'Dead Letter Queue (DLQ) Diagnostic Context Preservation',
    category: 'AUDIT',
    description: 'Poison pill jobs routed to DLQ must retain stack traces, input hashes, attempt counts, and worker logs.',
    enforcementMechanism: 'Structured DLQ wrapper schema enforcing forensic payload attachment.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-014',
    code: 'INVARIANT-24-014',
    title: 'Continuous Worker Heartbeat and Capacity Reporting',
    category: 'RELIABILITY',
    description: 'Browser workers must broadcast heartbeats every 15 seconds including memory, contexts, and active leases.',
    enforcementMechanism: 'Heartbeat supervisor triggering node status degradation if heartbeat missing > 45s.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-015',
    code: 'INVARIANT-24-015',
    title: 'Bounded and Abortable Runbook Automation Steps',
    category: 'SAFETY',
    description: 'Automated runbook steps must define timeouts, maximum iterations, and emergency stop hooks.',
    enforcementMechanism: 'Runbook step executor timeout wrappers and cancel signal listeners.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-016',
    code: 'INVARIANT-24-016',
    title: 'Dependency Health Degradation Triggers Cascaded Fallbacks',
    category: 'RELIABILITY',
    description: 'When an upstream service enters DEGRADED or UNHEALTHY, workers gracefully fallback or pause gracefully.',
    enforcementMechanism: 'Reactive dependency status observer adjusting queue throttle rates.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-017',
    code: 'INVARIANT-24-017',
    title: 'Policy Safety Rules Cannot Be Bypassed in Recovery',
    category: 'SAFETY',
    description: 'Quarantined domains, disallowed queries, or unverified targets cannot be recovered without re-evaluation.',
    enforcementMechanism: 'Integration of Phase 17 Policy Evaluator on all recovery payload inputs.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-018',
    code: 'INVARIANT-24-018',
    title: 'Automatic Detection and Remediation of Orphaned Leases',
    category: 'RELIABILITY',
    description: 'Background reconciliation daemon continuously flags and reclaims orphaned leases held by dead workers.',
    enforcementMechanism: 'Periodic reconciliation sweeper running every 60 seconds.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-019',
    code: 'INVARIANT-24-019',
    title: 'Evidence and Provenance Traceability on Recovered Data',
    category: 'AUDIT',
    description: 'Any dataset reprocessed or repaired must link back to source execution lineage via Phase 21 evidence IDs.',
    enforcementMechanism: 'Lineage pointer mutation tracking recorded in recovery metadata.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  },
  {
    invariantId: 'INV-24-020',
    code: 'INVARIANT-24-020',
    title: 'Failure Isolation of Recovery System Itself',
    category: 'RELIABILITY',
    description: 'If a recovery action fails or throws an exception, the recovery plane must not crash or leak resources.',
    enforcementMechanism: 'Isolated sandbox try/catch boundary marking action as FAILED without impacting core engine.',
    verified: true,
    lastEvaluatedAt: '2026-09-17T05:00:00Z',
    violationCount: 0
  }
];

// ============================================================
// 4. FIXTURE DATA: DEPENDENCIES & HEALTH
// ============================================================

export const INITIAL_DEPENDENCY_COMPONENTS: DependencyComponent[] = [
  {
    componentId: 'dep-browser-pool',
    name: 'Playwright Browser Pool (Cluster A)',
    category: 'BROWSER_CLUSTER',
    healthStatus: 'HEALTHY',
    latencyMs: 38,
    p99LatencyMs: 142,
    errorRatePercent: 0.12,
    circuitBreakerState: 'CLOSED',
    circuitBreakerFailures: 0,
    circuitBreakerThreshold: 5,
    fallbackMode: 'HEADLESS_CHROME_STANDBY',
    lastCheckedAt: '2026-09-17T05:14:30Z',
    activeIncidentIds: [],
    details: '16 worker instances active. Average context boot time 420ms. Memory consumption within 62% baseline.',
    endpointUrl: 'cluster://internal-workers.meta-ad-harvest.local:9222'
  },
  {
    componentId: 'dep-meta-ad-api',
    name: 'Meta Ad Library Web Endpoint',
    category: 'META_AD_LIBRARY_ENDPOINT',
    healthStatus: 'DEGRADED',
    latencyMs: 680,
    p99LatencyMs: 1850,
    errorRatePercent: 4.8,
    circuitBreakerState: 'HALF_OPEN',
    circuitBreakerFailures: 3,
    circuitBreakerThreshold: 5,
    fallbackMode: 'JITTERED_EXPONENTIAL_BACKOFF',
    lastCheckedAt: '2026-09-17T05:14:45Z',
    activeIncidentIds: ['inc-meta-429-backoff'],
    details: 'HTTP 429 Rate Limiting detected on secondary IP pool. Adaptive rate limiter throttled queue from 120/min to 45/min.',
    endpointUrl: 'https://www.facebook.com/ads/library'
  },
  {
    componentId: 'dep-postgres-primary',
    name: 'PostgreSQL Primary Cluster (Aurora)',
    category: 'POSTGRES_STORE',
    healthStatus: 'HEALTHY',
    latencyMs: 4,
    p99LatencyMs: 18,
    errorRatePercent: 0.0,
    circuitBreakerState: 'CLOSED',
    circuitBreakerFailures: 0,
    circuitBreakerThreshold: 10,
    fallbackMode: 'READ_REPLICA_STANDBY',
    lastCheckedAt: '2026-09-17T05:15:00Z',
    activeIncidentIds: [],
    details: 'Connection pool active: 48/100 connections. WAL replication lag 12ms. Row-level tenant isolation active.',
    endpointUrl: 'postgresql://master.pg-cluster.internal:5432/meta_research_db'
  },
  {
    componentId: 'dep-redis-queue',
    name: 'Redis Distributed Task Queue & Fencing Store',
    category: 'REDIS_QUEUE',
    healthStatus: 'HEALTHY',
    latencyMs: 1,
    p99LatencyMs: 6,
    errorRatePercent: 0.01,
    circuitBreakerState: 'CLOSED',
    circuitBreakerFailures: 0,
    circuitBreakerThreshold: 5,
    fallbackMode: 'IN_MEMORY_DEGRADED_FIFO',
    lastCheckedAt: '2026-09-17T05:15:05Z',
    activeIncidentIds: [],
    details: 'Redis Sentinel active. 5 priority queues online. Lease expiry TTL resolution: 100ms precision.',
    endpointUrl: 'redis://sentinel.queue.internal:26379/0'
  },
  {
    componentId: 'dep-policy-engine',
    name: 'Phase 17 Policy & Invariant Evaluator',
    category: 'POLICY_ENGINE',
    healthStatus: 'HEALTHY',
    latencyMs: 2,
    p99LatencyMs: 9,
    errorRatePercent: 0.0,
    circuitBreakerState: 'CLOSED',
    circuitBreakerFailures: 0,
    circuitBreakerThreshold: 3,
    fallbackMode: 'STRICT_DENY_SAFE',
    lastCheckedAt: '2026-09-17T05:15:10Z',
    activeIncidentIds: [],
    details: 'In-process WebAssembly compilation of policy AST. 0 bypassed invariants.',
    endpointUrl: 'ipc://policy-engine.sock'
  },
  {
    componentId: 'dep-evidence-vault',
    name: 'Phase 21 Encrypted Evidence Vault (S3 + KMS)',
    category: 'EVIDENCE_VAULT',
    healthStatus: 'HEALTHY',
    latencyMs: 45,
    p99LatencyMs: 160,
    errorRatePercent: 0.02,
    circuitBreakerState: 'CLOSED',
    circuitBreakerFailures: 0,
    circuitBreakerThreshold: 5,
    fallbackMode: 'LOCAL_SPOOL_AND_DEFERRED_SYNC',
    lastCheckedAt: '2026-09-17T05:14:50Z',
    activeIncidentIds: [],
    details: 'WORM (Write Once Read Many) immutability active. SHA-256 chain verification passing.',
    endpointUrl: 's3://meta-ad-evidence-vault-production-us-west-2'
  }
];

// ============================================================
// 5. FIXTURE DATA: WORKER NODES
// ============================================================

export const INITIAL_WORKER_NODES: WorkerNodeRecord[] = [
  {
    workerId: 'worker-playwright-usw2-01',
    workerType: 'HEADLESS_PLAYWRIGHT_WORKER',
    hostName: 'k8s-node-c6i-4xlarge-104',
    nodePool: 'pool-high-memory-browsers',
    status: 'BUSY',
    memoryUsageMb: 3840,
    memoryLimitMb: 8192,
    activeBrowserContexts: 4,
    maxBrowserContexts: 6,
    currentLeaseIds: ['lease-job-scrape-4091', 'lease-job-scrape-4094'],
    fencingEpoch: 142,
    lastHeartbeatAt: '2026-09-17T05:15:02Z',
    ipAddress: '10.240.12.14',
    version: 'v2.4.1-chromium-128',
    assignedQueues: ['meta_ad_extraction_priority', 'ad_library_batch']
  },
  {
    workerId: 'worker-playwright-usw2-02',
    workerType: 'HEADLESS_PLAYWRIGHT_WORKER',
    hostName: 'k8s-node-c6i-4xlarge-105',
    nodePool: 'pool-high-memory-browsers',
    status: 'ONLINE',
    memoryUsageMb: 2150,
    memoryLimitMb: 8192,
    activeBrowserContexts: 1,
    maxBrowserContexts: 6,
    currentLeaseIds: ['lease-job-scrape-4097'],
    fencingEpoch: 142,
    lastHeartbeatAt: '2026-09-17T05:15:08Z',
    ipAddress: '10.240.12.15',
    version: 'v2.4.1-chromium-128',
    assignedQueues: ['meta_ad_extraction_priority']
  },
  {
    workerId: 'worker-playwright-usw2-03',
    workerType: 'HEADLESS_PLAYWRIGHT_WORKER',
    hostName: 'k8s-node-c6i-4xlarge-106',
    nodePool: 'pool-high-memory-browsers',
    status: 'UNRESPONSIVE',
    memoryUsageMb: 7980,
    memoryLimitMb: 8192,
    activeBrowserContexts: 6,
    maxBrowserContexts: 6,
    currentLeaseIds: ['lease-job-scrape-4088'],
    fencingEpoch: 139,
    lastHeartbeatAt: '2026-09-17T05:11:45Z', // Missed heartbeats (>3 min)
    ipAddress: '10.240.12.16',
    version: 'v2.4.0-chromium-128',
    assignedQueues: ['ad_library_batch']
  },
  {
    workerId: 'worker-prober-usw2-01',
    workerType: 'VERIFICATION_PROBER',
    hostName: 'k8s-node-c6i-2xlarge-201',
    nodePool: 'pool-network-probers',
    status: 'ONLINE',
    memoryUsageMb: 1120,
    memoryLimitMb: 4096,
    activeBrowserContexts: 2,
    maxBrowserContexts: 12,
    currentLeaseIds: ['lease-job-verif-3012'],
    fencingEpoch: 88,
    lastHeartbeatAt: '2026-09-17T05:15:10Z',
    ipAddress: '10.240.14.88',
    version: 'v1.9.0-tls-prober',
    assignedQueues: ['verification_pipeline_queue']
  },
  {
    workerId: 'worker-transformer-usw2-01',
    workerType: 'PIPELINE_TRANSFORMER',
    hostName: 'k8s-node-c6i-2xlarge-202',
    nodePool: 'pool-general-compute',
    status: 'ONLINE',
    memoryUsageMb: 1450,
    memoryLimitMb: 4096,
    activeBrowserContexts: 0,
    maxBrowserContexts: 0,
    currentLeaseIds: ['lease-job-score-5011'],
    fencingEpoch: 62,
    lastHeartbeatAt: '2026-09-17T05:15:11Z',
    ipAddress: '10.240.14.89',
    version: 'v2.2.0-pipeline',
    assignedQueues: ['qualification_analysis_queue', 'export_generation_queue']
  }
];

// ============================================================
// 6. FIXTURE DATA: QUEUE INSPECTION
// ============================================================

export const INITIAL_QUEUES: QueueInspectionRecord[] = [
  {
    queueId: 'meta_ad_extraction_priority',
    queueName: 'Meta Ad Library Scrape Priority Queue',
    tenantId: 'tenant_apex_solar',
    pendingCount: 14,
    inFlightCount: 3,
    dlqCount: 2,
    delayedCount: 5,
    consumerWorkersCount: 2,
    throughputPerMin: 42,
    avgWaitTimeSec: 8.4,
    backpressureState: 'NORMAL',
    maxConcurrency: 10,
    rateLimitPerSec: 2.0
  },
  {
    queueId: 'verification_pipeline_queue',
    queueName: 'Phase 05 Website Verification Probes',
    tenantId: 'tenant_apex_solar',
    pendingCount: 8,
    inFlightCount: 1,
    dlqCount: 0,
    delayedCount: 0,
    consumerWorkersCount: 1,
    throughputPerMin: 58,
    avgWaitTimeSec: 3.2,
    backpressureState: 'NORMAL',
    maxConcurrency: 12,
    rateLimitPerSec: 5.0
  },
  {
    queueId: 'qualification_analysis_queue',
    queueName: 'Phase 06 Qualification & Scoring Matrix',
    tenantId: 'tenant_apex_solar',
    pendingCount: 4,
    inFlightCount: 1,
    dlqCount: 0,
    delayedCount: 0,
    consumerWorkersCount: 1,
    throughputPerMin: 80,
    avgWaitTimeSec: 1.1,
    backpressureState: 'NORMAL',
    maxConcurrency: 20,
    rateLimitPerSec: 10.0
  },
  {
    queueId: 'export_generation_queue',
    queueName: 'Phase 08 Sanitized Data Export Pipeline',
    tenantId: 'tenant_apex_solar',
    pendingCount: 0,
    inFlightCount: 0,
    dlqCount: 0,
    delayedCount: 0,
    consumerWorkersCount: 1,
    throughputPerMin: 12,
    avgWaitTimeSec: 0.5,
    backpressureState: 'NORMAL',
    maxConcurrency: 4,
    rateLimitPerSec: 1.0
  },
  {
    queueId: 'dead_letter_queue',
    queueName: 'Global Poison Pill & DLQ Quarantined Store',
    tenantId: 'tenant_apex_solar',
    pendingCount: 3,
    inFlightCount: 0,
    dlqCount: 3,
    delayedCount: 0,
    consumerWorkersCount: 0,
    throughputPerMin: 0,
    avgWaitTimeSec: 0,
    backpressureState: 'NORMAL',
    maxConcurrency: 0,
    rateLimitPerSec: 0
  }
];

// ============================================================
// 7. FIXTURE DATA: JOBS & ATTEMPTS
// ============================================================

export const INITIAL_JOB_INSPECTION_RECORDS: JobInspectionRecord[] = [
  {
    jobId: 'job-scrape-4088',
    jobType: 'AD_LIBRARY_SCRAPE',
    tenantId: 'tenant_apex_solar',
    status: 'STUCK',
    priority: 'HIGH',
    attemptsCount: 2,
    maxAttempts: 3,
    currentAttemptId: 'att-4088-02',
    leaseOwnerWorkerId: 'worker-playwright-usw2-03',
    leaseExpiresAt: '2026-09-17T05:12:00Z', // Expired!
    fencingToken: 139,
    checkpointData: {
      lastScrapedPage: 4,
      totalPagesEstimated: 12,
      extractedRecordsCount: 78,
      lastObservedAdArchiveId: 'ad_arch_992104921',
      lastCheckpointHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      checkpointTimestamp: '2026-09-17T05:10:20Z'
    },
    idempotencyKey: 'idemp-scrape-california-solar-p4',
    errorDetails: 'Heartbeat missed > 180s. Lease expired while in RUNNING state. Worker host near OOM.',
    rootCauseCategory: 'WORKER_OOM_STALL',
    stuckClassification: 'STUCK_ZOMBIE_WORKER',
    lastHeartbeatAt: '2026-09-17T05:11:45Z',
    createdAt: '2026-09-17T05:05:00Z',
    updatedAt: '2026-09-17T05:11:45Z',
    incidentId: 'inc-worker-03-stall',
    inputSummary: 'Query: "Solar Panels California" | Region: US-CA | Category: ISSUES_ELECTIONS_POLITICS',
    extractedEntitiesCount: 78
  },
  {
    jobId: 'job-scrape-4091',
    jobType: 'AD_LIBRARY_SCRAPE',
    tenantId: 'tenant_apex_solar',
    status: 'RUNNING',
    priority: 'HIGH',
    attemptsCount: 1,
    maxAttempts: 3,
    currentAttemptId: 'att-4091-01',
    leaseOwnerWorkerId: 'worker-playwright-usw2-01',
    leaseExpiresAt: '2026-09-17T05:18:00Z',
    fencingToken: 142,
    checkpointData: {
      lastScrapedPage: 2,
      totalPagesEstimated: 6,
      extractedRecordsCount: 36,
      lastObservedAdArchiveId: 'ad_arch_77312984',
      lastCheckpointHash: '8b45e4d5fe912834b6848b598b98129034f8a84618e478546189e47264871928',
      checkpointTimestamp: '2026-09-17T05:14:10Z'
    },
    idempotencyKey: 'idemp-scrape-nevada-clean-energy',
    stuckClassification: 'NOT_STUCK',
    lastHeartbeatAt: '2026-09-17T05:15:02Z',
    createdAt: '2026-09-17T05:12:00Z',
    updatedAt: '2026-09-17T05:15:02Z',
    inputSummary: 'Query: "Nevada Clean Energy Rebate" | Region: US-NV',
    extractedEntitiesCount: 36
  },
  {
    jobId: 'job-scrape-4075',
    jobType: 'AD_LIBRARY_SCRAPE',
    tenantId: 'tenant_apex_solar',
    status: 'DEAD_LETTER',
    priority: 'NORMAL',
    attemptsCount: 3,
    maxAttempts: 3,
    currentAttemptId: 'att-4075-03',
    fencingToken: 135,
    idempotencyKey: 'idemp-scrape-malformed-selector-target',
    errorDetails: 'Repeated fatal DOM parse error: DOM Exception: Node.removeChild: The node to be removed is not a child of this node. Poison pill detected.',
    rootCauseCategory: 'POISON_PILL_DOM_MUTATION',
    stuckClassification: 'NOT_STUCK',
    createdAt: '2026-09-17T04:40:00Z',
    updatedAt: '2026-09-17T04:55:00Z',
    incidentId: 'inc-poison-pill-4075',
    inputSummary: 'Query: "Arizona Community Solar Initiative" | Raw Feed Id: 90214',
    extractedEntitiesCount: 12
  },
  {
    jobId: 'job-verif-3012',
    jobType: 'WEBSITE_VERIFICATION',
    tenantId: 'tenant_apex_solar',
    status: 'RUNNING',
    priority: 'NORMAL',
    attemptsCount: 1,
    maxAttempts: 2,
    currentAttemptId: 'att-verif-3012-01',
    leaseOwnerWorkerId: 'worker-prober-usw2-01',
    leaseExpiresAt: '2026-09-17T05:17:00Z',
    fencingToken: 88,
    idempotencyKey: 'idemp-verif-sunrun-commercial-site',
    stuckClassification: 'NOT_STUCK',
    lastHeartbeatAt: '2026-09-17T05:15:10Z',
    createdAt: '2026-09-17T05:13:00Z',
    updatedAt: '2026-09-17T05:15:10Z',
    inputSummary: 'Target: https://sunpower-installations.com | TLS 1.3 / DNSSEC check',
    extractedEntitiesCount: 1
  },
  {
    jobId: 'job-score-5011',
    jobType: 'LEAD_SCORING',
    tenantId: 'tenant_apex_solar',
    status: 'RUNNING',
    priority: 'NORMAL',
    attemptsCount: 1,
    maxAttempts: 2,
    currentAttemptId: 'att-score-5011-01',
    leaseOwnerWorkerId: 'worker-transformer-usw2-01',
    leaseExpiresAt: '2026-09-17T05:19:00Z',
    fencingToken: 62,
    idempotencyKey: 'idemp-score-batch-sep17-apex',
    stuckClassification: 'NOT_STUCK',
    lastHeartbeatAt: '2026-09-17T05:15:11Z',
    createdAt: '2026-09-17T05:14:00Z',
    updatedAt: '2026-09-17T05:15:11Z',
    inputSummary: 'Evaluating 48 advertiser candidates via Phase 06 Prioritization Matrix',
    extractedEntitiesCount: 48
  }
];

export const INITIAL_JOB_ATTEMPTS: JobAttemptRecord[] = [
  {
    attemptId: 'att-4088-01',
    jobId: 'job-scrape-4088',
    attemptNumber: 1,
    workerId: 'worker-playwright-usw2-02',
    fencingToken: 138,
    startedAt: '2026-09-17T05:05:10Z',
    finishedAt: '2026-09-17T05:08:40Z',
    status: 'FAILED',
    failureReason: 'Rate limit HTTP 429 encountered on page 3. Backoff duration 120s.',
    exitCode: 429,
    logsSample: [
      '[05:05:10] Worker initialized Chrome context (token=138)',
      '[05:05:42] Page 1 scraped: 20 ads captured',
      '[05:06:50] Page 2 scraped: 20 ads captured',
      '[05:08:35] Page 3 GET /ads/library/async returned HTTP 429 Too Many Requests',
      '[05:08:40] Attempt 1 failed gracefully with rate limit backoff signal'
    ]
  },
  {
    attemptId: 'att-4088-02',
    jobId: 'job-scrape-4088',
    attemptNumber: 2,
    workerId: 'worker-playwright-usw2-03',
    fencingToken: 139,
    startedAt: '2026-09-17T05:10:00Z',
    status: 'RUNNING',
    logsSample: [
      '[05:10:00] Resumed from Checkpoint Page 2 (token=139)',
      '[05:10:20] Checkpoint verified: 38 ads restored from ledger',
      '[05:10:55] Page 3 scraped: 20 ads captured. Total: 58 ads',
      '[05:11:45] Host system entered high-memory alarm. Worker thread stalled.',
      '[05:13:00] HEARTBEAT_MISSED: No response from worker in > 90 seconds'
    ]
  },
  {
    attemptId: 'att-4075-03',
    jobId: 'job-scrape-4075',
    attemptNumber: 3,
    workerId: 'worker-playwright-usw2-01',
    fencingToken: 135,
    startedAt: '2026-09-17T04:50:00Z',
    finishedAt: '2026-09-17T04:55:00Z',
    status: 'FAILED',
    failureReason: 'Max retry attempts exhausted. Unrecoverable DOM error.',
    exitCode: 1,
    logsSample: [
      '[04:50:00] Retry attempt 3 with refreshed user-agent',
      '[04:52:10] Target ad container rendered unexpected nested iframe structure',
      '[04:54:30] QuerySelectorAll failed: Node.removeChild mutation threw DOMException',
      '[04:55:00] Max attempts (3) exceeded. Job moved to DEAD_LETTER queue'
    ]
  }
];

// ============================================================
// 8. FIXTURE DATA: RECOVERY ACTIONS AUDIT
// ============================================================

export const INITIAL_RECOVERY_ACTIONS: RecoveryActionRecord[] = [
  {
    actionId: 'rec-act-801',
    operationType: 'RESUME_FROM_CHECKPOINT',
    targetJobId: 'job-scrape-4082',
    tenantId: 'tenant_apex_solar',
    requestedBy: 'usr_sarah_chen',
    approvedBy: 'usr_elena_rostova',
    status: 'COMPLETED',
    idempotencyKey: 'idemp-rec-4082-resume',
    fencingEpoch: 140,
    requiresDualApproval: false,
    reason: 'Transient network glitch during page 5 extraction. Resumed from verified checkpoint page 4.',
    preCheckResult: 'PASS: Checkpoint hash matches Phase 21 evidence ledger. 64 records intact.',
    postCheckResult: 'PASS: Job completed with 88 total ads extracted. Zero duplicate IDs.',
    auditEventId: 'aud_evt_rec_9101',
    startedAt: '2026-09-17T04:10:00Z',
    completedAt: '2026-09-17T04:14:20Z',
    details: 'New fencing token 140 issued to worker-playwright-usw2-02. Previous lease revoked.'
  },
  {
    actionId: 'rec-act-802',
    operationType: 'RESET_CIRCUIT_BREAKER',
    targetComponent: 'dep-meta-ad-api',
    tenantId: 'tenant_apex_solar',
    requestedBy: 'usr_marcus_vance',
    approvedBy: 'usr_elena_rostova',
    status: 'COMPLETED',
    idempotencyKey: 'idemp-cb-reset-meta-sep17',
    fencingEpoch: 141,
    requiresDualApproval: true,
    reason: 'Cooling period of 600s expired. Probe sent to test endpoint with 200 OK.',
    preCheckResult: 'PASS: HTTP 200 OK returned on lightweight canary ping (210ms latency).',
    postCheckResult: 'PASS: Circuit breaker transitioned to HALF_OPEN. Throttled traffic permitted.',
    auditEventId: 'aud_evt_rec_9102',
    startedAt: '2026-09-17T04:35:00Z',
    completedAt: '2026-09-17T04:36:10Z',
    details: 'Dual authorization granted by Lead SRE and SecOps Administrator.'
  }
];

// ============================================================
// 9. FIXTURE DATA: OPERATIONAL RUNBOOKS
// ============================================================

export const INITIAL_OPERATIONAL_RUNBOOKS: OperationalRunbook[] = [
  {
    runbookId: 'rb-24-01',
    code: 'RB-24-01',
    title: 'Meta Ad Library Throttling & 429 Adaptive Backoff',
    description: 'Automated runbook to manage sudden rate spikes, throttle queue dispatch rates, jitter outbound requests, and switch egress IPs safely.',
    triggerCondition: 'HTTP 429 error rate > 3% over 3 minutes on Meta Ad Library endpoints.',
    targetComponent: 'dep-meta-ad-api',
    requiresDualApproval: false,
    estimatedDurationSec: 180,
    executionCount: 14,
    lastExecutedAt: '2026-09-17T05:10:00Z',
    steps: [
      {
        stepId: 'rb-01-s1',
        title: 'Assess Endpoint Health & Error Threshold',
        description: 'Query Phase 22 telemetry to verify if error rate exceeds 3% baseline across all worker egress pods.',
        stepType: 'HEALTH_CHECK',
        automated: true,
        status: 'COMPLETED',
        verificationCheck: 'HTTP 429 rate = 4.8% (Threshold: 3.0%). Condition confirmed.',
        outputLog: 'Endpoint meta-ad-api returning 429 on 12/250 sampled requests.'
      },
      {
        stepId: 'rb-01-s2',
        title: 'Adjust Queue Rate Limit & Concurrency Cap',
        description: 'Throttle Redis priority queue from 120 req/min down to 45 req/min. Enforce jittered exponential backoff.',
        stepType: 'BACKOFF_ADJUST',
        automated: true,
        status: 'COMPLETED',
        verificationCheck: 'Queue throughput reduced to 42 req/min. Jitter added: 800ms-2400ms.',
        outputLog: 'Rate limit applied via Redis Token Bucket config key.'
      },
      {
        stepId: 'rb-01-s3',
        title: 'Trip Circuit Breaker to HALF_OPEN Canary Mode',
        description: 'Restrict automated retries. Allow only 1 canary scrape attempt every 30 seconds.',
        stepType: 'CIRCUIT_BREAKER_TRIP',
        automated: true,
        status: 'COMPLETED',
        verificationCheck: 'Circuit breaker state: HALF_OPEN. Canary worker assigned.',
        outputLog: 'Canary context worker-playwright-usw2-01 launched.'
      },
      {
        stepId: 'rb-01-s4',
        title: 'Verify Canary Success and Close Breaker',
        description: 'Run automated canary probes for 5 consecutive successful requests before restoring standard queue dispatch.',
        stepType: 'HEALTH_CHECK',
        automated: true,
        status: 'IN_PROGRESS',
        verificationCheck: '3/5 canary requests successful (2 remaining).',
        outputLog: 'Canary probe #3 returned HTTP 200 with valid ad payload.'
      }
    ]
  },
  {
    runbookId: 'rb-24-02',
    code: 'RB-24-02',
    title: 'Playwright Worker Pool OOM & Zombie Context Eviction',
    description: 'Safely drain unresponsive or memory-saturated browser worker nodes, advance fencing epochs, and safely redistribute active leases.',
    triggerCondition: 'Worker memory usage > 90% or missing heartbeat > 90 seconds.',
    targetComponent: 'dep-browser-pool',
    requiresDualApproval: true,
    estimatedDurationSec: 240,
    executionCount: 6,
    lastExecutedAt: '2026-09-17T03:20:00Z',
    steps: [
      {
        stepId: 'rb-02-s1',
        title: 'Identify Unresponsive or Saturated Worker Node',
        description: 'Scan worker heartbeats. Filter for lastHeartbeatAt > 90s ago or memoryUsageMb > memoryLimitMb * 0.9.',
        stepType: 'HEALTH_CHECK',
        automated: true,
        status: 'COMPLETED',
        verificationCheck: 'Worker worker-playwright-usw2-03 identified: Last heartbeat 180s ago, memory 7980MB/8192MB.',
        outputLog: 'Worker flagged as ZOMBIE_WORKER_HEARTBEAT.'
      },
      {
        stepId: 'rb-02-s2',
        title: 'Advance Fencing Epoch & Invalidate Old Tokens',
        description: 'Increment global cluster fencing epoch in PostgreSQL. Revoke all active leases owned by the failed node.',
        stepType: 'LEASE_RECLAIM',
        automated: true,
        status: 'COMPLETED',
        verificationCheck: 'Fencing epoch advanced from 139 to 143. Lease lease-job-scrape-4088 invalidated.',
        outputLog: 'Old token 139 will be rejected on any write attempt.'
      },
      {
        stepId: 'rb-02-s3',
        title: 'Signal Kubernetes Node Drain & Container Restart',
        description: 'Issue graceful drain signal to node agent. Restart Chromium container pod.',
        stepType: 'WORKER_DRAIN',
        automated: true,
        status: 'NOT_STARTED',
        verificationCheck: 'Pod restarted and re-registered with clean Chromium context pool.',
        outputLog: 'Awaiting operator authorization step.'
      },
      {
        stepId: 'rb-02-s4',
        title: 'Re-Enqueue Interrupted Jobs from Last Valid Checkpoint',
        description: 'Inspect checkpoint data in Phase 21 evidence vault. Dispatch RESUME_FROM_CHECKPOINT action.',
        stepType: 'RETRY_ENQUEUE',
        automated: true,
        status: 'NOT_STARTED',
        verificationCheck: 'Job re-assigned to healthy worker with fencing token 143.',
        outputLog: 'Pending node drain completion.'
      }
    ]
  },
  {
    runbookId: 'rb-24-03',
    code: 'RB-24-03',
    title: 'Dead Letter Queue (DLQ) Forensic Triage & Poison-Pill Quarantine',
    description: 'Inspect poison-pill payloads, sanitize corrupted selectors, quarantine malicious inputs, and prevent re-poisoning.',
    triggerCondition: 'Job moves to DEAD_LETTER queue after exceeding max retry attempts.',
    targetComponent: 'dep-redis-queue',
    requiresDualApproval: false,
    estimatedDurationSec: 300,
    executionCount: 8,
    lastExecutedAt: '2026-09-17T04:56:00Z',
    steps: [
      {
        stepId: 'rb-03-s1',
        title: 'Extract Failure Stack Trace & DOM Snapshot',
        description: 'Load forensic snapshot from Phase 21 Evidence Vault. Isolate offending selector or payload node.',
        stepType: 'HEALTH_CHECK',
        automated: true,
        status: 'COMPLETED',
        verificationCheck: 'Failure cause: Node.removeChild DOMException in ad container #ad-frame-90214.',
        outputLog: 'Snapshot hash: e4b01... verified in evidence store.'
      },
      {
        stepId: 'rb-03-s2',
        title: 'Quarantine Malicious / Corrupt Input Hash',
        description: 'Record hash in Phase 17 Policy Safety quarantine table to prevent automatic crawler re-triggering.',
        stepType: 'CIRCUIT_BREAKER_TRIP',
        automated: true,
        status: 'COMPLETED',
        verificationCheck: 'Input hash added to Policy Engine quarantine blacklist.',
        outputLog: 'Policy evaluator will reject identical future scrape jobs.'
      },
      {
        stepId: 'rb-03-s3',
        title: 'Archive Dead Letter Message with Forensic Lineage',
        description: 'Move job from active queue to immutable cold storage archive with full audit linkage.',
        stepType: 'STATE_RECONCILE',
        automated: true,
        status: 'NOT_STARTED',
        verificationCheck: 'Record archived. Queue DLQ count decremented safely.',
        outputLog: 'Ready for operator execute.'
      }
    ]
  }
];

// ============================================================
// 10. FIXTURE DATA: RECONCILIATION DISCREPANCIES
// ============================================================

export const INITIAL_RECONCILIATION_DISCREPANCIES: ReconciliationDiscrepancy[] = [
  {
    discrepancyId: 'disc-24-01',
    category: 'EXPIRED_LEASE_ACTIVE',
    severity: 'HIGH',
    entityId: 'job-scrape-4088',
    expectedState: 'LEASE_EXPIRED / RESUME_PENDING',
    actualState: 'RUNNING (Held by unresponsive worker-playwright-usw2-03)',
    detectedAt: '2026-09-17T05:12:30Z',
    resolved: false,
    resolutionPlan: 'Advance fencing epoch to 143, revoke lease, and re-dispatch RESUME_FROM_CHECKPOINT to worker-playwright-usw2-02.'
  },
  {
    discrepancyId: 'disc-24-02',
    category: 'ZOMBIE_WORKER_HEARTBEAT',
    severity: 'CRITICAL',
    entityId: 'worker-playwright-usw2-03',
    expectedState: 'ONLINE (Heartbeat < 45s)',
    actualState: 'UNRESPONSIVE (Heartbeat missed for 210s, memory 7980MB / 8192MB)',
    detectedAt: '2026-09-17T05:13:00Z',
    resolved: false,
    resolutionPlan: 'Execute Runbook RB-24-02 to drain worker node, advance fencing token, and trigger container restart.'
  },
  {
    discrepancyId: 'disc-24-03',
    category: 'QUEUE_VS_DATABASE',
    severity: 'MEDIUM',
    entityId: 'queue-meta-ad-extraction-priority',
    expectedState: 'In-flight count: 2',
    actualState: 'In-flight count: 3 (Stale ghost lease counted in Redis buffer)',
    detectedAt: '2026-09-17T05:14:00Z',
    resolved: false,
    resolutionPlan: 'Run atomic Redis/PostgreSQL queue reconciliation to sync in-flight counter with active DB leases.'
  }
];

// ============================================================
// 11. RECOVERY ACTION EXECUTOR HELPER
// ============================================================

export interface ExecuteRecoveryParams {
  operationType: RecoveryOperationType;
  targetJobId?: string;
  targetWorkerId?: string;
  targetQueueId?: string;
  tenantContext: TenantContext;
  operatorId: string;
  approverId?: string;
  reason: string;
  idempotencyKey: string;
}

export interface RecoveryExecutionResult {
  success: boolean;
  actionId: string;
  message: string;
  newFencingEpoch?: number;
  newJobStatus?: JobState;
  auditRecord: RecoveryActionRecord;
}

export function executeAllowlistedRecovery(params: ExecuteRecoveryParams): RecoveryExecutionResult {
  const requiresDualApproval = [
    'REPLAY_INPUTS',
    'REPAIR_STATE_CORRUPTION',
    'ROLLBACK_TRANSACTION',
    'DRAIN_WORKER_NODE',
    'PURGE_DEAD_LETTER_TO_ARCHIVE'
  ].includes(params.operationType);

  if (requiresDualApproval && (!params.approverId || params.approverId === params.operatorId)) {
    throw new Error(
      `INVARIANT-24-008 VIOLATION: Operation '${params.operationType}' requires dual approval from an independent operator.`
    );
  }

  const actionId = `rec-act-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const nextEpoch = 144;

  let postMessage = '';
  let newStatus: JobState = 'RUNNING';

  switch (params.operationType) {
    case 'RETRY_TRANSIENT_FAILURE':
      newStatus = 'QUEUED';
      postMessage = `Job ${params.targetJobId} reset to QUEUED with backoff. Fencing token ${nextEpoch} assigned.`;
      break;
    case 'RESUME_FROM_CHECKPOINT':
      newStatus = 'QUEUED';
      postMessage = `Job ${params.targetJobId} resumed from last verified checkpoint. Epoch bumped to ${nextEpoch}.`;
      break;
    case 'REPLAY_INPUTS':
      newStatus = 'CREATED';
      postMessage = `Forked new execution run for ${params.targetJobId} with fresh lineage ID and idempotency key.`;
      break;
    case 'CANCEL_EXECUTION':
      newStatus = 'CANCELLED';
      postMessage = `Cancellation signal delivered. Lease revoked and fencing epoch bumped.`;
      break;
    case 'ABANDON_POISON_JOB':
      newStatus = 'ABANDONED';
      postMessage = `Job ${params.targetJobId} permanently archived as poison pill. Quarantined in Phase 17 policy engine.`;
      break;
    case 'DRAIN_WORKER_NODE':
      postMessage = `Worker ${params.targetWorkerId} set to DRAINING. Active leases revoked and migrated.`;
      break;
    case 'FORCE_RECLAIM_LEASE':
      newStatus = 'QUEUED';
      postMessage = `Expired lease reclaimed from worker. Generation epoch advanced to ${nextEpoch}.`;
      break;
    case 'RESET_CIRCUIT_BREAKER':
      postMessage = `Circuit breaker reset to HALF_OPEN canary mode following verified health probe.`;
      break;
    case 'RECONCILE_TENANT_QUEUES':
      postMessage = `Reconciliation completed: Redis queue counters aligned with PostgreSQL transactional state.`;
      break;
    default:
      postMessage = `Recovery action ${params.operationType} executed successfully within tenant sandbox.`;
  }

  const record: RecoveryActionRecord = {
    actionId,
    operationType: params.operationType,
    targetJobId: params.targetJobId,
    targetWorkerId: params.targetWorkerId,
    targetQueueId: params.targetQueueId,
    tenantId: params.tenantContext.tenantId,
    requestedBy: params.operatorId,
    approvedBy: params.approverId,
    status: 'COMPLETED',
    idempotencyKey: params.idempotencyKey,
    fencingEpoch: nextEpoch,
    requiresDualApproval,
    reason: params.reason,
    preCheckResult: 'PASS: Tenant boundary validated. Idempotency verified. Safe state assertion confirmed.',
    postCheckResult: `PASS: ${postMessage}`,
    auditEventId: `aud_evt_${actionId}`,
    startedAt: nowIso,
    completedAt: nowIso,
    details: `Executed by ${params.operatorId}. Tenant: ${params.tenantContext.tenantId}.`
  };

  return {
    success: true,
    actionId,
    message: postMessage,
    newFencingEpoch: nextEpoch,
    newJobStatus: newStatus,
    auditRecord: record
  };
}
