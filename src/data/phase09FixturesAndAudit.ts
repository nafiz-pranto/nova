import {
  WorkerLeaseModel,
  CircuitBreakerModel,
  ChaosScenario,
  FieldPresenceMetric,
  ReconciliationResult,
  RunbookModel,
  AlertRuleModel,
  CandidateSLOModel,
  Phase09AuditCriterion,
  FailureCategory
} from '../types';

// ============================================================================
// 1. PHASE-08 TRACEABILITY MATRIX
// ============================================================================

export interface Phase08TraceabilityEntry {
  phase08Dependency: string;
  phase09Mechanism: string;
  failureModeProtected: string;
  testVerification: string;
}

export const PHASE_08_TRACEABILITY_MATRIX: Phase08TraceabilityEntry[] = [
  {
    phase08Dependency: 'Job Creation Form (POST /api/v1/jobs/research with idempotencyKey)',
    phase09Mechanism: 'Distributed Idempotency Cache & State Machine Lock',
    failureModeProtected: 'Duplicate job dispatch on network retry or double-click',
    testVerification: 'p9_idempotency_duplicate_dispatch_test.ts'
  },
  {
    phase08Dependency: 'Real-time Run SSE Stream (GET /api/v1/jobs/:id/events)',
    phase09Mechanism: 'Transactional Outbox with Monotonic Sequence Numbers',
    failureModeProtected: 'Out-of-order state updates or lost progress events',
    testVerification: 'p9_outbox_sse_sequence_test.ts'
  },
  {
    phase08Dependency: 'Operator Cooperative Pause (POST /api/v1/jobs/:id/pause)',
    phase09Mechanism: 'Two-Phase Cooperative Pause with In-Flight Batch Flush',
    failureModeProtected: 'Half-written card batch and uncheckpointed DOM observations',
    testVerification: 'p9_cooperative_pause_drain_test.ts'
  },
  {
    phase08Dependency: 'Job Cancellation Command (POST /api/v1/jobs/:id/cancel)',
    phase09Mechanism: 'Idempotent Terminal Cancellation Guard & Context Purge',
    failureModeProtected: 'Late worker activity continuing after operator cancellation',
    testVerification: 'p9_cancel_worker_fencing_test.ts'
  },
  {
    phase08Dependency: 'Lead Dossier Ad Creative & Verification Inspector',
    phase09Mechanism: 'SSRF Fail-Closed Circuit Breaker & DNS Resolver Timeout',
    failureModeProtected: 'Verification hang causing lead dossier rendering stall',
    testVerification: 'p9_verification_isolation_test.ts'
  },
  {
    phase08Dependency: 'Tri-Queue Manual Reviews (Identity / Verification / Qualification)',
    phase09Mechanism: 'Optimistic Entity Locking & Non-Repudiation Audit Ledger',
    failureModeProtected: 'Concurrent operator split/merge collisions and lost audit trail',
    testVerification: 'p9_review_queue_concurrency_test.ts'
  },
  {
    phase08Dependency: 'Chrome MV3 Extension Action Dispatch',
    phase09Mechanism: 'Queue Backpressure Governor & Rate Limiting Token Bucket',
    failureModeProtected: 'Extension dispatch storm overloading worker pool capacity',
    testVerification: 'p9_extension_backpressure_test.ts'
  },
  {
    phase08Dependency: 'Export Pipeline (POST /api/v1/exports/generate - Safe CSV/JSON)',
    phase09Mechanism: 'Streaming Cursor Pagination & Memory Ceiling (512MB)',
    failureModeProtected: 'OOM crash on massive exports and partial file generation',
    testVerification: 'p9_export_cursor_streaming_test.ts'
  }
];

// ============================================================================
// 2. RELIABILITY OBJECTIVES (Correctness vs Availability)
// ============================================================================

export interface ReliabilityObjective {
  domain: string;
  correctnessTarget: string;
  availabilityTarget: string;
  conflictResolution: string;
}

export const RELIABILITY_OBJECTIVES: ReliabilityObjective[] = [
  {
    domain: 'DOM Extraction & Lead Parsing',
    correctnessTarget: 'Zero unobserved or hallucinated records; zero uncontained DOM drift.',
    availabilityTarget: 'Continuous extraction availability > 99.0%.',
    conflictResolution: 'CORRECTNESS WINS: If DOM selectors drift, pause job immediately; do not output empty/garbage rows.'
  },
  {
    domain: 'Job Lifecycle State Advancement',
    correctnessTarget: 'Strictly linear transitions; terminal states are permanently immutable.',
    availabilityTarget: 'Instantaneous state query response < 50ms.',
    conflictResolution: 'CORRECTNESS WINS: Lock state transition atomically; reject ambiguous concurrent writes.'
  },
  {
    domain: 'Worker Lease & State Mutation',
    correctnessTarget: 'Zero split-brain writes; zombie worker writes rejected by monotonic tokens.',
    availabilityTarget: 'Automatic failover to new worker within 30 seconds.',
    conflictResolution: 'CORRECTNESS WINS: If lease ownership is in doubt, isolate suspect worker and wait for lease expiry.'
  },
  {
    domain: 'Lead Verification & Scoring',
    correctnessTarget: 'Every verified claim requires a valid 64-char SHA-256 evidence digest.',
    availabilityTarget: 'Real-time DNS & TLS verification throughput > 50 leads/min.',
    conflictResolution: 'CORRECTNESS WINS: If external website resolver hangs, quarantine lead as UNVERIFIED; never fabricate verification.'
  },
  {
    domain: 'Export Artifact Generation',
    correctnessTarget: 'Exported row count must match database query count with formula injection neutralization.',
    availabilityTarget: 'Export download generation under 30 seconds for 10,000 rows.',
    conflictResolution: 'CORRECTNESS WINS: If export file count fails reconciliation, fail the download rather than serving partial data.'
  }
];

// ============================================================================
// 3. SERVICE FAILURE MATRIX (All 13 Components)
// ============================================================================

export interface ServiceFailureMatrixEntry {
  component: string;
  failureModes: string[];
  detectionMechanism: string;
  blastRadius: string;
  retryPolicy: string;
  containment: string;
  recoveryMethod: string;
  terminalFallback: string;
  operatorVisibility: string;
  testMethod: string;
}

export const SERVICE_FAILURE_MATRIX: ServiceFailureMatrixEntry[] = [
  {
    component: '1. Dashboard (React UI)',
    failureModes: ['SSE disconnect', 'Stale local cache', 'Browser tab OOM'],
    detectionMechanism: 'SSE heartbeat missed (10s), Window error handler',
    blastRadius: 'Single operator browser tab',
    retryPolicy: 'Exponential backoff reconnect (2s, 4s, 8s, max 30s)',
    containment: 'Graceful toast notification, read-only UI fallback',
    recoveryMethod: 'Automatic reconnect and full state re-fetch',
    terminalFallback: 'Prompt operator to refresh tab',
    operatorVisibility: 'Top-bar "Connection Reconnecting..." banner',
    testMethod: 'p9_ui_sse_reconnect_test.ts'
  },
  {
    component: '2. BFF / API Gateway',
    failureModes: ['Node event loop lag', 'Upstream DB timeout', 'Rate limit saturation'],
    detectionMechanism: 'Prometheus event_loop_lag_seconds, /health/readiness probe',
    blastRadius: 'Incoming HTTP requests, new job submissions',
    retryPolicy: 'HTTP 503 with Retry-After: 5',
    containment: 'Load balancer stops routing new requests to degraded pod',
    recoveryMethod: 'Kubernetes pod rolling restart after 3 failed probes',
    terminalFallback: 'Failover to secondary API gateway replica',
    operatorVisibility: 'HTTP 503 error rate alert in Grafana',
    testMethod: 'p9_api_gateway_overload_test.ts'
  },
  {
    component: '3. Orchestrator',
    failureModes: ['Leader election loss', 'Lease sweeper stall', 'Queue disconnect'],
    detectionMechanism: 'PostgreSQL advisory lock heartbeats, Prometheus orchestrator_lag',
    blastRadius: 'Job dispatch delayed; active workers continue via existing lease',
    retryPolicy: 'Acquire leader lock every 5s with 15s TTL',
    containment: 'Standby orchestrator assumes leadership on lock expiration',
    recoveryMethod: 'Standby reconciles all active worker leases from DB',
    terminalFallback: 'Manual failover trigger via CLI',
    operatorVisibility: 'CRITICAL alert: OrchestratorLeaderMissing',
    testMethod: 'p9_orchestrator_failover_test.ts'
  },
  {
    component: '4. Work Queue (Redis / BullMQ)',
    failureModes: ['Broker network partition', 'Memory full', 'Consumer redelivery storm'],
    detectionMechanism: 'Redis PING timeout > 2s, Queue depth metric',
    blastRadius: 'New job dispatches delayed',
    retryPolicy: 'Publisher retries 3 times with local disk buffer',
    containment: 'Halt new job acceptance; spill incoming jobs to PostgreSQL outbox',
    recoveryMethod: 'Re-establish Redis connection; replay outbox spool',
    terminalFallback: 'Failover to direct PostgreSQL polling queue',
    operatorVisibility: 'HIGH alert: QueueBrokerUnreachable',
    testMethod: 'p9_queue_partition_recovery_test.ts'
  },
  {
    component: '5. Browser Worker',
    failureModes: ['Node.js OOM panic', 'Unhandled promise rejection', 'Lost host network'],
    detectionMechanism: 'Missed worker heartbeat (15s), Lease expiry',
    blastRadius: 'Single assigned research job',
    retryPolicy: 'Zero worker-side retries; orchestrator reclaims job',
    containment: 'Mark worker status = SUSPECT; revoke fencing token',
    recoveryMethod: 'Reassign job to healthy worker with next fencing token',
    terminalFallback: 'Move job to RECOVERING, resume from last checkpoint',
    operatorVisibility: 'Worker status turns red "OFFLINE" in Cockpit',
    testMethod: 'p9_worker_sigkill_reclaim_test.ts'
  },
  {
    component: '6. Chromium Process',
    failureModes: ['Target.crashed', 'GPU process hang', 'Renderer memory exhaustion (>1GB)'],
    detectionMechanism: 'Playwright disconnected event, /proc/<pid>/stat RSS monitor',
    blastRadius: 'Active browser context on single worker',
    retryPolicy: 'Single in-process restart if within job time budget',
    containment: 'SIGKILL entire browser process tree; close IPC handles',
    recoveryMethod: 'Relaunch headless Chromium with clean user data directory',
    terminalFallback: 'Release worker lease and trigger job reclaim',
    operatorVisibility: 'Metric: meta_browser_crashes_total incremented',
    testMethod: 'p9_chromium_crash_recovery_test.ts'
  },
  {
    component: '7. Extraction Adapter',
    failureModes: ['DOM selector drift', 'Field presence drop', 'Zero-result anomaly'],
    detectionMechanism: 'Selector fallback counter, Field presence ratio < 50%',
    blastRadius: 'Source extraction batch',
    retryPolicy: 'Zero retries on structural failure (non-transient)',
    containment: 'Batch quarantined; job transitioned to PAUSED (UI_CHANGE)',
    recoveryMethod: 'Hot-deploy updated selector configuration registry',
    terminalFallback: 'Operator manual investigation via DOM snapshot',
    operatorVisibility: 'HIGH alert: MetaUiChangeDetected on Slack/PagerDuty',
    testMethod: 'p9_dom_drift_pause_test.ts'
  },
  {
    component: '8. Verification Service',
    failureModes: ['DNS resolver timeout', 'Target TLS 1.3 failure', 'Target rate limit (429)'],
    detectionMechanism: 'HTTP timeout > 5,000ms, TLS handshake error tracker',
    blastRadius: 'Lead verification queue (Scraping completely isolated)',
    retryPolicy: '2 retries with 5s exponential backoff; no retry on SSRF block',
    containment: 'Fail closed; tag lead as QUALIFIED_UNVERIFIED',
    recoveryMethod: 'Circuit breaker trips to HALF_OPEN after 30s cooldown',
    terminalFallback: 'Retain lead in verification queue for manual review',
    operatorVisibility: 'Metric: meta_verification_errors_total',
    testMethod: 'p9_verification_circuit_breaker_test.ts'
  },
  {
    component: '9. PostgreSQL Database',
    failureModes: ['Connection pool saturation', 'Primary crash', 'Disk space > 90%'],
    detectionMechanism: 'Pool checkout timeout > 3s, Disk alert probe',
    blastRadius: 'Entire platform state writes',
    retryPolicy: 'Workers pause queries, retry with decorrelated jitter',
    containment: 'Cooperative pause signal broadcast to workers; read-only replica fallback',
    recoveryMethod: 'Patroni / Multi-AZ primary failover; reconnect pool',
    terminalFallback: 'Workers spool checkpoints to encrypted local NVMe',
    operatorVisibility: 'CRITICAL alert: DatabaseConnectionPoolExhausted',
    testMethod: 'p9_database_failover_pause_test.ts'
  },
  {
    component: '10. Object Storage (S3 / GCS)',
    failureModes: ['Storage service 503', 'Authentication token expiry', 'Network egress stall'],
    detectionMechanism: 'SDK upload timeout > 30s, HTTP 500/503 status',
    blastRadius: 'Export download file delivery, creative snapshots',
    retryPolicy: '3 retries with exponential backoff (2s, 4s, 8s)',
    containment: 'Retain generated export CSV in worker /tmp directory',
    recoveryMethod: 'Re-authenticate credentials and re-upload artifact',
    terminalFallback: 'Mark export job as EXPORT_STORAGE_UNAVAILABLE (no fake complete)',
    operatorVisibility: 'HIGH alert: ExportStorageUnavailable',
    testMethod: 'p9_storage_outage_retention_test.ts'
  },
  {
    component: '11. Event Publisher',
    failureModes: ['Outbox polling lag', 'Message broker reject', 'Sequence gap'],
    detectionMechanism: 'Outbox lag monitor (un-published events > 5m)',
    blastRadius: 'Real-time UI notifications, external webhooks',
    retryPolicy: 'Continuous polling retry with monotonic sequence order',
    containment: 'Outbox records remain durably in PostgreSQL until acknowledged',
    recoveryMethod: 'Replay from last successfully acknowledged sequence number',
    terminalFallback: 'Client performs full REST polling synchronization',
    operatorVisibility: 'Metric: meta_outbox_lag_seconds',
    testMethod: 'p9_event_outbox_replay_test.ts'
  },
  {
    component: '12. Notification Subsystem',
    failureModes: ['Slack webhook 500', 'PagerDuty rate limit', 'SMTP connection timeout'],
    detectionMechanism: 'HTTP response status != 200, Webhook retry queue exhaustion',
    blastRadius: 'Human operator alerting channels',
    retryPolicy: '3 attempts with backoff; fallback to alternate provider',
    containment: 'Spill failed alerts to local security audit log file',
    recoveryMethod: 'Secondary notification channel (SMS / Email) invoked',
    terminalFallback: 'Local system audit ledger maintains full incident record',
    operatorVisibility: 'Dashboard system alert banner: "Alert Delivery Degraded"',
    testMethod: 'p9_notification_fallback_test.ts'
  },
  {
    component: '13. Export Subsystem',
    failureModes: ['CSV formula injection vector', 'Worker OOM on 100k query', 'Disk full'],
    detectionMechanism: 'Formula injection sanitizer validator, Memory watcher',
    blastRadius: 'Single export download artifact',
    retryPolicy: 'Zero retry on formula injection (neutralize and sanitize)',
    containment: 'Stream export through database cursor in 1,000-row chunks',
    recoveryMethod: 'Recycle export worker; allocate fresh scratch disk',
    terminalFallback: 'Fail export job with status EXPORT_GENERATION_FAILED',
    operatorVisibility: 'Export job status updated in UI with exact error code',
    testMethod: 'p9_export_formula_injection_defense_test.ts'
  }
];

// ============================================================================
// 4. STANDARDIZED FAILURE CATEGORIES (Taxonomy)
// ============================================================================

export interface FailureCategorySpec {
  category: FailureCategory;
  description: string;
  isRetryable: boolean;
  maxAttempts: number;
  backoffType: 'EXPONENTIAL' | 'DECORRELATED_JITTER' | 'NONE';
  operatorAction: string;
}

export const FAILURE_CATEGORIES_SPEC: FailureCategorySpec[] = [
  {
    category: 'TRANSIENT',
    description: 'Temporary network disconnect, socket reset, TLS handshake timeout < 3s.',
    isRetryable: true,
    maxAttempts: 3,
    backoffType: 'EXPONENTIAL',
    operatorAction: 'Automated retry within time budget; no human intervention needed.'
  },
  {
    category: 'RETRYABLE',
    description: 'Database row lock contention, transient queue redelivery.',
    isRetryable: true,
    maxAttempts: 3,
    backoffType: 'DECORRELATED_JITTER',
    operatorAction: 'System self-heals; monitored via retry metrics.'
  },
  {
    category: 'NON_RETRYABLE',
    description: 'Malformed job parameter, invalid country code, unsupported date filter.',
    isRetryable: false,
    maxAttempts: 0,
    backoffType: 'NONE',
    operatorAction: 'Operator must correct configuration before recreating job.'
  },
  {
    category: 'BLOCKED',
    description: 'Explicit HTTP 403 Forbidden with platform perimeter notice.',
    isRetryable: false,
    maxAttempts: 0,
    backoffType: 'NONE',
    operatorAction: 'IMMEDIATE STOP. Engage cooldown; notify compliance. Do NOT rotate proxies.'
  },
  {
    category: 'CHALLENGED',
    description: 'Bot challenge, CAPTCHA, or verification checkpoint screen detected.',
    isRetryable: false,
    maxAttempts: 0,
    backoffType: 'NONE',
    operatorAction: 'IMMEDIATE STOP. Freeze job. Zero automated retries. Human clearance required.'
  },
  {
    category: 'DATA_CORRUPTION_RISK',
    description: 'Checkpoint checksum mismatch, broken cryptographic DOM token, illegal score.',
    isRetryable: false,
    maxAttempts: 0,
    backoffType: 'NONE',
    operatorAction: 'Quarantine affected batch; trigger SRE investigation immediately.'
  },
  {
    category: 'UI_CHANGE',
    description: 'Expected DOM selector missing, field presence dropped below 50%.',
    isRetryable: false,
    maxAttempts: 0,
    backoffType: 'NONE',
    operatorAction: 'Pause job; inspect DOM fixture; hot-deploy updated selector registry.'
  },
  {
    category: 'RESOURCE_EXHAUSTION',
    description: 'Worker memory > 90%, Chromium RSS > 1024MB, disk space < 10%.',
    isRetryable: true,
    maxAttempts: 2,
    backoffType: 'EXPONENTIAL',
    operatorAction: 'Safely checkpoint, terminate browser process tree, recycle worker container.'
  },
  {
    category: 'DEPENDENCY_OUTAGE',
    description: 'PostgreSQL primary down, Redis queue partition, Object storage 503.',
    isRetryable: true,
    maxAttempts: 3,
    backoffType: 'DECORRELATED_JITTER',
    operatorAction: 'Cooperative worker pause; wait for failover to complete.'
  },
  {
    category: 'CONFIGURATION_ERROR',
    description: 'Missing required environment variable, unsupported migration checksum.',
    isRetryable: false,
    maxAttempts: 0,
    backoffType: 'NONE',
    operatorAction: 'Fix environment configuration and restart service (fail fast).'
  },
  {
    category: 'AUTHORIZATION_ERROR',
    description: 'Invalid tenant token, expired operator session, unauthorized tenant access.',
    isRetryable: false,
    maxAttempts: 0,
    backoffType: 'NONE',
    operatorAction: 'Log security audit event; reject request with HTTP 401/403.'
  },
  {
    category: 'SYSTEM_ERROR',
    description: 'Kernel panic, unhandled SIGSEGV, hardware fault.',
    isRetryable: false,
    maxAttempts: 0,
    backoffType: 'NONE',
    operatorAction: 'Kubernetes node eviction; orchestrator reclaims worker lease.'
  }
];

// ============================================================================
// 5. CANDIDATE SLOS (Service Level Objectives)
// ============================================================================

export const CANDIDATE_SLOS: CandidateSLOModel[] = [
  {
    sloName: 'Job Acceptance Latency',
    measurement: 'Time from HTTP POST /jobs/research to 201 Created with job_id',
    population: 'All valid job dispatch requests across all tenants',
    window: '30-day rolling',
    target: '99.5% < 500ms',
    exclusions: 'Requests failing authentication or tenant rate limits',
    dataSource: 'meta_http_request_duration_seconds{endpoint="/api/v1/jobs/research"}',
    alertingThreshold: 'p99 > 1,000ms for 5 consecutive minutes'
  },
  {
    sloName: 'Job Start Latency',
    measurement: 'Time from CREATED to worker assignment (first heartbeat in RUNNING)',
    population: 'All queued jobs within system concurrency limits',
    window: '30-day rolling',
    target: '95.0% < 15 seconds',
    exclusions: 'Jobs submitted during system PAUSED or BACKPRESSURE_WARNING modes',
    dataSource: 'meta_job_queue_duration_seconds',
    alertingThreshold: 'p90 > 45 seconds for 10 minutes'
  },
  {
    sloName: 'Checkpoint Durability',
    measurement: 'Ratio of committed checkpoints with valid SHA-256 integrity digests',
    population: 'All checkpoints written across all active jobs',
    window: '30-day rolling',
    target: '99.999% valid checksums',
    exclusions: 'None (absolute correctness requirement)',
    dataSource: 'meta_checkpoint_verification_total{status="valid"}',
    alertingThreshold: 'Single checksum failure (> 0 failures)'
  },
  {
    sloName: 'Zero Uncontained Challenge Loops',
    measurement: 'Rate of automated retries following CHALLENGED or BLOCKED states',
    population: 'All jobs encountering platform challenges or HTTP 403',
    window: '30-day rolling',
    target: '0.00% (Strict Zero Tolerance)',
    exclusions: 'None',
    dataSource: 'meta_uncontained_challenge_retries_total',
    alertingThreshold: '> 0 retry attempts (Immediate SEV-1 PagerDuty)'
  },
  {
    sloName: 'API Availability',
    measurement: 'Ratio of successful (non-5xx) responses on /api/v1/* endpoints',
    population: 'All incoming operator dashboard and MV3 extension requests',
    window: '30-day rolling',
    target: '99.9% successful',
    exclusions: 'Maintenance windows declared > 24 hours in advance',
    dataSource: 'meta_http_requests_total{status!~"5.."}',
    alertingThreshold: 'Availability < 99.0% over 5-minute window'
  },
  {
    sloName: 'Export Generation Integrity',
    measurement: 'Exported artifact line count matches database queried record count',
    population: 'All generated CSV and JSON export files',
    window: '30-day rolling',
    target: '100.0% count reconciliation',
    exclusions: 'Exports cancelled by operator before completion',
    dataSource: 'meta_export_reconciliation_total{status="matched"}',
    alertingThreshold: '> 0 mismatched export record counts'
  }
];

// ============================================================================
// 6. CIRCUIT BREAKERS
// ============================================================================

export const INITIAL_CIRCUIT_BREAKERS: CircuitBreakerModel[] = [
  {
    name: 'Website Verification DNS & TLS Resolver',
    dependency: 'Public Domain Verification Service',
    state: 'CLOSED',
    failureThresholdPct: 40,
    consecutiveFailures: 0,
    openTimeoutSec: 30,
    lastStateChange: '2026-09-16T09:00:00Z',
    totalCalls: 1420,
    failedCalls: 12
  },
  {
    name: 'Corporate Registry & Secretary of State Lookup',
    dependency: 'External Filing Identity Verification API',
    state: 'CLOSED',
    failureThresholdPct: 50,
    consecutiveFailures: 0,
    openTimeoutSec: 60,
    lastStateChange: '2026-09-16T08:30:00Z',
    totalCalls: 680,
    failedCalls: 8
  },
  {
    name: 'Object Storage Export Uploader',
    dependency: 'S3 / Cloud Storage Artifact Store',
    state: 'CLOSED',
    failureThresholdPct: 30,
    consecutiveFailures: 0,
    openTimeoutSec: 45,
    lastStateChange: '2026-09-16T07:15:00Z',
    totalCalls: 195,
    failedCalls: 1
  }
];

// ============================================================================
// 7. SAMPLE WORKER FLEET (With Monotonic Fencing Tokens)
// ============================================================================

export const SAMPLE_WORKER_FLEET: WorkerLeaseModel[] = [
  {
    workerId: 'worker-us-east-01',
    leaseId: 'lease-0191f6a1-7c9b-7312-8801-9988aabbcc01',
    fencingToken: 142,
    leaseStart: '2026-09-16T09:35:00Z',
    leaseExpiry: '2026-09-16T09:45:00Z',
    lastHeartbeat: '2026-09-16T09:41:58Z',
    status: 'ACTIVE',
    activeJobId: 'job-0191f6a0-5b12-7001-9911-223344556601',
    activeRunId: 'run-01',
    missedHeartbeats: 0,
    memoryMb: 412,
    browserPids: [18420, 18422],
    hostNode: 'k8s-node-worker-pool-a-01'
  },
  {
    workerId: 'worker-us-east-02',
    leaseId: 'lease-0191f6a1-7c9b-7312-8801-9988aabbcc02',
    fencingToken: 88,
    leaseStart: '2026-09-16T09:30:00Z',
    leaseExpiry: '2026-09-16T09:44:00Z',
    lastHeartbeat: '2026-09-16T09:41:55Z',
    status: 'ACTIVE',
    activeJobId: 'job-0191f6a0-5b12-7001-9911-223344556602',
    activeRunId: 'run-02',
    missedHeartbeats: 0,
    memoryMb: 524,
    browserPids: [19012, 19014],
    hostNode: 'k8s-node-worker-pool-a-02'
  },
  {
    workerId: 'worker-us-east-03',
    leaseId: 'lease-0191f6a1-7c9b-7312-8801-9988aabbcc03',
    fencingToken: 94,
    leaseStart: '2026-09-16T09:20:00Z',
    leaseExpiry: '2026-09-16T09:41:40Z',
    lastHeartbeat: '2026-09-16T09:41:35Z',
    status: 'SUSPECT',
    activeJobId: 'job-0191f6a0-5b12-7001-9911-223344556603',
    activeRunId: 'run-01',
    missedHeartbeats: 4,
    memoryMb: 890,
    browserPids: [19550],
    hostNode: 'k8s-node-worker-pool-a-03'
  },
  {
    workerId: 'worker-us-east-04-zombie',
    leaseId: 'lease-0191f6a1-7c9b-7312-8801-9988aabbcc04',
    fencingToken: 73,
    leaseStart: '2026-09-16T08:50:00Z',
    leaseExpiry: '2026-09-16T09:00:00Z',
    lastHeartbeat: '2026-09-16T08:59:50Z',
    status: 'FENCED',
    activeJobId: 'job-0191f6a0-5b12-7001-9911-223344556604',
    activeRunId: 'run-01',
    missedHeartbeats: 28,
    memoryMb: 940,
    browserPids: [16200],
    hostNode: 'k8s-node-worker-pool-b-01'
  }
];

// ============================================================================
// 8. CHAOS SCENARIOS (Automated Failure Injection)
// ============================================================================

export const CHAOS_SCENARIOS: ChaosScenario[] = [
  {
    id: 'chaos-01',
    name: 'Abrupt Worker Process Termination (SIGKILL 9)',
    category: 'WORKER',
    description: 'Simulates abrupt container eviction or host kernel panic while parsing ad cards.',
    faultInjected: 'Execute kill -9 on worker container process during active DOM batch collection.',
    expectedDetection: 'Orchestrator detects 3 missed heartbeats at T+15s; lease expires at T+30s.',
    containmentAction: 'Worker marked SUSPECT; fencing token incremented from 142 to 143.',
    recoveryVerification: 'New worker claims job at token 143, verifies checkpoint checksum, resumes parsing.',
    lifecycleTransitions: ['RUNNING', 'SUSPECT', 'RECOVERING', 'ASSIGNED', 'RUNNING'],
    passStatus: true
  },
  {
    id: 'chaos-02',
    name: 'Headless Chromium Renderer Crash (Target.crashed)',
    category: 'BROWSER',
    description: 'Simulates Chromium GPU hang or memory exhaustion inside container sandbox.',
    faultInjected: 'Trigger Target.crash DevTools protocol command during page scroll.',
    expectedDetection: 'Playwright Page.on("crash") event fires within 120ms.',
    containmentAction: 'Worker kills entire browser process tree; pauses batch advancement.',
    recoveryVerification: 'Clean Chromium context launched in 1.4s; page navigated back to target URL.',
    lifecycleTransitions: ['RUNNING', 'DEGRADED', 'TERMINATING', 'HEALTHY', 'RUNNING'],
    passStatus: true
  },
  {
    id: 'chaos-03',
    name: 'Database TCP Connection Partition (TCP RST)',
    category: 'DATABASE',
    description: 'Simulates transient network switch failure or PostgreSQL primary restart.',
    faultInjected: 'Inject iptables DROP on port 5432 for 10 seconds.',
    expectedDetection: 'PostgreSQL connection pool checkout timeout (> 3s).',
    containmentAction: 'Worker cooperatively pauses active batch; writes checkpoint to local NVMe buffer.',
    recoveryVerification: 'DB reconnects; NVMe buffer committed in atomic transaction; zero data lost.',
    lifecycleTransitions: ['RUNNING', 'PAUSING', 'PAUSED', 'RUNNING'],
    passStatus: true
  },
  {
    id: 'chaos-04',
    name: 'Duplicate Event & Sequence Desynchronization',
    category: 'EVENT',
    description: 'Simulates broker network retransmission delivering event E2 after E3.',
    faultInjected: 'Inject duplicate outbox event E2 with sequence_num = 2 when client is at sequence 3.',
    expectedDetection: 'Client event deduplicator detects sequence_num <= last_processed_sequence.',
    containmentAction: 'Duplicate event dropped; warning logged with correlation.eventId.',
    recoveryVerification: 'Client UI state remains at sequence 3; zero state rollback or visual jitter.',
    lifecycleTransitions: ['IDLE', 'SEQUENCE_VALIDATED', 'DUPLICATE_DROPPED'],
    passStatus: true
  },
  {
    id: 'chaos-05',
    name: 'Cryptographic Checkpoint Corruption',
    category: 'CHECKPOINT',
    description: 'Simulates storage bit rot or tampered cursor JSON in checkpoint record.',
    faultInjected: 'Alter single character in checkpoint cursor_state JSON prior to resume.',
    expectedDetection: 'SHA-256 digest validation fails on checkpoint load.',
    containmentAction: 'Mark checkpoint sequence N as CORRUPTED; trigger operator alert.',
    recoveryVerification: 'Worker falls back to sequence N-1; re-executes safe batch boundary cleanly.',
    lifecycleTransitions: ['ASSIGNED', 'CHECKPOINT_CORRUPT', 'FALLBACK_PREVIOUS', 'RUNNING'],
    passStatus: true
  },
  {
    id: 'chaos-06',
    name: 'Meta DOM Wrapper Class Mutation (UI Drift)',
    category: 'SCHEMA_DRIFT',
    description: 'Simulates Meta Ad Library deploying new obfuscated CSS class names.',
    faultInjected: 'Mutate mock HTML feed container class from _7jwy to _x99z_new.',
    expectedDetection: 'Primary card selector fails; field presence drops to 0%.',
    containmentAction: 'Trip UI_CHANGE_DETECTED alert; transition job to PAUSED immediately.',
    recoveryVerification: 'Zero empty leads saved; DOM snapshot saved in diagnostics; operator alerted.',
    lifecycleTransitions: ['RUNNING', 'UI_CHANGE_DETECTED', 'BATCH_QUARANTINED', 'PAUSED'],
    passStatus: true
  }
];

// ============================================================================
// 9. FIELD PRESENCE METRICS (Anomaly Detection)
// ============================================================================

export const FIELD_PRESENCE_METRICS: FieldPresenceMetric[] = [
  {
    field: 'destination_url',
    adapterVersion: 'v8.4.2',
    baselineRatePct: 86.4,
    currentRatePct: 85.8,
    anomalyThresholdPct: 40.0,
    status: 'NORMAL',
    samplesEvaluated: 1250
  },
  {
    field: 'ad_creative_body_text',
    adapterVersion: 'v8.4.2',
    baselineRatePct: 98.2,
    currentRatePct: 97.9,
    anomalyThresholdPct: 50.0,
    status: 'NORMAL',
    samplesEvaluated: 1250
  },
  {
    field: 'advertiser_page_name',
    adapterVersion: 'v8.4.2',
    baselineRatePct: 99.8,
    currentRatePct: 99.7,
    anomalyThresholdPct: 70.0,
    status: 'NORMAL',
    samplesEvaluated: 1250
  },
  {
    field: 'call_to_action_label',
    adapterVersion: 'v8.4.2',
    baselineRatePct: 74.0,
    currentRatePct: 73.1,
    anomalyThresholdPct: 35.0,
    status: 'NORMAL',
    samplesEvaluated: 1250
  },
  {
    field: 'meta_ad_id_token',
    adapterVersion: 'v8.4.2',
    baselineRatePct: 100.0,
    currentRatePct: 100.0,
    anomalyThresholdPct: 95.0,
    status: 'NORMAL',
    samplesEvaluated: 1250
  }
];

// ============================================================================
// 10. ALERT RULES
// ============================================================================

export const ALERT_RULES_CATALOG: AlertRuleModel[] = [
  {
    alertName: 'DataCorruptionDetected',
    severity: 'CRITICAL',
    condition: 'meta_integrity_violations_total > 0',
    window: '1 minute',
    threshold: '> 0 violations',
    labels: { service: 'reconciliation-engine', team: 'sre-data' },
    suppressionRules: 'Never suppressed. Immediate page.',
    runbookId: 'RB-04',
    expectedOperatorAction: 'Inspect integrity query output; quarantine affected lead entities; halt exports.'
  },
  {
    alertName: 'DatabaseConnectionPoolExhausted',
    severity: 'CRITICAL',
    condition: 'meta_db_pool_active_connections / meta_db_pool_max_connections > 0.95',
    window: '2 minutes',
    threshold: '> 95% utilization for 2m',
    labels: { service: 'postgresql-gateway', team: 'sre-core' },
    suppressionRules: 'Suppressed if primary failover alert is already active.',
    runbookId: 'RB-04',
    expectedOperatorAction: 'Check for long-running transactions; terminate rogue queries; scale pool if needed.'
  },
  {
    alertName: 'MetaUiChangeDetected',
    severity: 'HIGH',
    condition: 'rate(meta_extraction_selector_failures_total[5m]) > 0.30',
    window: '5 minutes',
    threshold: '> 30% selector failure rate',
    labels: { service: 'browser-worker', team: 'sre-scraping' },
    suppressionRules: 'Grouped by adapter_version and region over 15-minute window.',
    runbookId: 'RB-01',
    expectedOperatorAction: 'Inspect preserved DOM snapshot; update selector registry; run canary tests.'
  },
  {
    alertName: 'ChallengeOrBlockSpike',
    severity: 'HIGH',
    condition: 'sum(increase(meta_jobs_challenged_total[10m])) > 3',
    window: '10 minutes',
    threshold: '> 3 challenged/blocked jobs',
    labels: { service: 'orchestrator', team: 'sre-compliance' },
    suppressionRules: 'Inhibits worker retry alerts.',
    runbookId: 'RB-02',
    expectedOperatorAction: 'Engage COLLECTION_DISABLED kill switch; verify zero automated retries; notify legal/ops.'
  },
  {
    alertName: 'WorkerCrashLooping',
    severity: 'HIGH',
    condition: 'increase(meta_browser_crashes_total[15m]) > 5',
    window: '15 minutes',
    threshold: '> 5 browser crashes in 15m',
    labels: { service: 'worker-pool', team: 'sre-core' },
    suppressionRules: 'Grouped by host_node.',
    runbookId: 'RB-03',
    expectedOperatorAction: 'Inspect Chromium coredumps and host RSS; recycle suspect worker nodes.'
  },
  {
    alertName: 'VerificationQueueBacklog',
    severity: 'MEDIUM',
    condition: 'meta_queue_depth{queue="verification"} > 200',
    window: '15 minutes',
    threshold: '> 200 items for 15m',
    labels: { service: 'verifier', team: 'ops-lead-qual' },
    suppressionRules: 'Suppressed outside business hours.',
    runbookId: 'RB-09',
    expectedOperatorAction: 'Check upstream DNS resolver latency; verify SSRF circuit breaker status.'
  }
];

// ============================================================================
// 11. PRODUCTION RUNBOOK CATALOG (10 Detailed Runbooks)
// ============================================================================

export const PRODUCTION_RUNBOOK_CATALOG: RunbookModel[] = [
  {
    id: 'RB-01',
    title: 'Meta UI / Selector Drift Resolution',
    severity: 'SEV-2',
    trigger: 'Alert MetaUiChangeDetected fires (field presence < 50% or selector failures > 30%).',
    detection: 'Structured logs indicate ERR_CARD_SELECTOR_NOT_FOUND; job transitioned to PAUSED.',
    immediateContainment: 'Verify affected jobs are in PAUSED state. Engage Scoped Kill Switch: SOURCE_ADAPTER.',
    diagnosis: 'Download diagnostic DOM snapshot artifact from S3. Compare feed element attributes against selector registry.',
    recovery: 'Update src/data/selectors.json in staging branch. Run p9_dom_drift_pause_test.ts regression suite. Deploy hotfix.',
    validation: 'Resume paused job with 5-ad test batch. Verify field presence ratio returns to > 85%.',
    rollbackPlan: 'If hotfix fails, revert selector commit and keep SOURCE_ADAPTER disabled.',
    auditRequirements: 'Document selector changes and affected job IDs in Jira INC-DOM-XXXX.',
    exitCriteria: 'Active jobs resume cleanly; zero selector errors over 30-minute observation window.'
  },
  {
    id: 'RB-02',
    title: 'Challenge / Perimeter Block Incident Response',
    severity: 'SEV-2',
    trigger: 'Alert ChallengeOrBlockSpike fires (HTTP 403 or CAPTCHA detected).',
    detection: 'Job state set to CHALLENGED or BLOCKED. Worker logs contain ERR_SECURITY_PERIMETER_REACHED.',
    immediateContainment: 'VERIFY ZERO AUTOMATED RETRIES OCCUR. Engage GLOBAL_COLLECTION kill switch.',
    diagnosis: 'Inspect public Ad Library URL manually from isolated diagnostic machine. Check Meta status page.',
    recovery: 'Await 2-hour platform cooldown. DO NOT rotate proxies or spoof fingerprints. Obtain human clearance.',
    validation: 'Execute single manual probe with test query. Verify standard public ad feed renders.',
    rollbackPlan: 'If challenge persists, extend cooldown by 4 hours.',
    auditRequirements: 'Record incident in security compliance log; notify operations lead.',
    exitCriteria: 'Probe succeeds without challenge; kill switch disengaged with human sign-off.'
  },
  {
    id: 'RB-03',
    title: 'Worker Crash Loop Remediation',
    severity: 'SEV-2',
    trigger: 'Alert WorkerCrashLooping fires (> 5 crashes in 15m).',
    detection: 'Worker container restarts repeatedly; Prometheus meta_browser_crashes_total climbing.',
    immediateContainment: 'Drain suspect Kubernetes worker node: kubectl cordon <node-name>.',
    diagnosis: 'Inspect container stderr for SIGSEGV or out-of-memory killer (OOMKilled: true). Check Chromium shared memory /dev/shm.',
    recovery: 'Increase /dev/shm size to 2GB in deployment manifest. Terminate orphan browser processes: pkill -f chrome.',
    validation: 'Launch worker pod in isolation. Execute 24-ad test batch while monitoring memory RSS.',
    rollbackPlan: 'Revert worker deployment image to previous release tag.',
    auditRequirements: 'Log memory profile and node drain event in SRE incident tracker.',
    exitCriteria: 'Worker runs continuously for 30 minutes with RSS memory stable under 600MB.'
  },
  {
    id: 'RB-04',
    title: 'PostgreSQL Primary Outage & Failover Recovery',
    severity: 'SEV-1',
    trigger: 'Alert DatabaseConnectionPoolExhausted or DB connection timeout > 5s.',
    detection: 'API returns HTTP 503; worker logs show ERR_DB_CONNECTION_LOST.',
    immediateContainment: 'Workers automatically enter cooperative pause; write operations buffer locally.',
    diagnosis: 'Check PostgreSQL cluster status via patronictl list or RDS console. Identify failed primary node.',
    recovery: 'Promote hot standby replica to primary. Re-point connection pooler (PgBouncer) to new primary.',
    validation: 'Execute SELECT COUNT(*) FROM job_orchestration_state. Verify write latency < 10ms.',
    rollbackPlan: 'If promotion fails, restore latest hourly base backup and replay WAL archive.',
    auditRequirements: 'Execute full database reconciliation sweeper post-failover; record report.',
    exitCriteria: 'All services report /health/readiness HTTP 200; in-flight jobs resume without data loss.'
  },
  {
    id: 'RB-05',
    title: 'Work Queue Backlog & Partition Recovery',
    severity: 'SEV-3',
    trigger: 'Queue depth exceeds 100 pending jobs for > 15 minutes.',
    detection: 'Prometheus meta_queue_depth > 100; dashboard displays BACKPRESSURE_WARNING.',
    immediateContainment: 'Engage temporary throttle on new non-priority job creation.',
    diagnosis: 'Check active worker count: are workers paused or offline? Inspect for poison pill jobs blocking consumers.',
    recovery: 'Scale worker pool to maximum capacity (16 pods). Move stuck poison pill messages to DLQ.',
    validation: 'Monitor queue drain rate: should exceed 10 jobs/minute.',
    rollbackPlan: 'If workers stall, recycle worker pool pods in batches of 4.',
    auditRequirements: 'Document queue depth timeline and identified poison pill message IDs.',
    exitCriteria: 'Queue depth returns to normal baseline (< 20 jobs); throttle disengaged.'
  },
  {
    id: 'RB-06',
    title: 'Stale Lease & Zombie Worker Reclamation',
    severity: 'SEV-3',
    trigger: 'Worker registry indicates worker status = SUSPECT for > 5 minutes.',
    detection: 'Job remains in RUNNING state but last_heartbeat is > 60s in the past.',
    immediateContainment: 'Orchestrator revokes worker lease and increments fencing token: token = token + 1.',
    diagnosis: 'SSH to worker host; check if worker node is experiencing severe CPU throttling or network split.',
    recovery: 'Run administrative reconciliation procedure: SELECT * FROM reclaim_orphaned_leases(). Restart worker container.',
    validation: 'Verify orphaned job is picked up by healthy worker and resumes from last valid checkpoint.',
    rollbackPlan: 'If worker continues to hang, evict node from cluster.',
    auditRequirements: 'Record worker lease eviction and fencing token update in worker audit log.',
    exitCriteria: 'No workers remain in SUSPECT status; job advances to COMPLETED.'
  },
  {
    id: 'RB-07',
    title: 'Dead-Letter Queue Triage & Safe Replay',
    severity: 'SEV-3',
    trigger: 'Job transitioned to DEAD_LETTERED after exhausting 3 retry attempts.',
    detection: 'Dashboard DLQ counter increments; Slack notification in #ops-alerts.',
    immediateContainment: 'Job is safely isolated in DLQ table; zero automated reprocessing occurs.',
    diagnosis: 'Inspect dlq_payload, error_history, and last_safe_checkpoint_id via Dashboard DLQ Viewer.',
    recovery: 'If root cause was resolved (e.g. transient DB outage), operator clicks "Approve Manual Replay".',
    validation: 'Job enters RECOVERING state with new attempt budget; resumes from last valid checkpoint.',
    rollbackPlan: 'If replay fails again, mark job permanently as FAILED_ARCHIVED with operator notes.',
    auditRequirements: 'Mandatory operator reason code logged in dlq_replay_audit_log.',
    exitCriteria: 'Job finishes successfully or is cleanly archived with operator approval.'
  },
  {
    id: 'RB-08',
    title: 'Export File Count Mismatch Resolution',
    severity: 'SEV-2',
    trigger: 'Export reconciliation query detects mismatch between requested and generated rows.',
    detection: 'Export status marked EXPORT_RECONCILIATION_FAILED; download blocked.',
    immediateContainment: 'Download token is invalidated; partial artifact is quarantined.',
    diagnosis: 'Inspect PostgreSQL query logs; check for concurrent record deletion during export generation.',
    recovery: 'Re-run export generation using repeatable read isolation level: SET TRANSACTION ISOLATION LEVEL REPEATABLE READ.',
    validation: 'Verify exact row count match: requested_rows == generated_rows == line_count.',
    rollbackPlan: 'If mismatch persists, inspect database table for corrupt null values.',
    auditRequirements: 'Log reconciliation audit record with row count delta.',
    exitCriteria: 'Regenerated export passes validation; valid download token issued to operator.'
  },
  {
    id: 'RB-09',
    title: 'SSRF & Verification Timeout Surge Remediation',
    severity: 'SEV-3',
    trigger: 'Website verification circuit breaker trips to OPEN (failure rate > 40%).',
    detection: 'Prometheus meta_verification_ssrf_blocks_total or timeout count spikes.',
    immediateContainment: 'Circuit breaker automatically opens; leads flagged QUALIFIED_UNVERIFIED.',
    diagnosis: 'Check if target domains are resolving to private RFC 1918 IP addresses or DNS resolver is blocked.',
    recovery: 'Flush internal DNS resolver cache. If external DNS provider is failing, switch to secondary DNS.',
    validation: 'Test verification of 3 known-good public domains. Circuit breaker transitions to HALF_OPEN.',
    rollbackPlan: 'Engage VERIFICATION_DISABLED pause mode if upstream network is completely down.',
    auditRequirements: 'Document SSRF security log and DNS resolution latency metrics.',
    exitCriteria: 'Circuit breaker returns to CLOSED state; verification queue drains.'
  },
  {
    id: 'RB-10',
    title: 'Emergency Global System Stop (Kill Switch)',
    severity: 'SEV-1',
    trigger: 'Critical platform-wide compliance anomaly, widespread data corruption, or severe security breach.',
    detection: 'Multiple SEV-1 alerts or direct directive from SRE / Legal leadership.',
    immediateContainment: 'Engage EMERGENCY_STOP mode via Operational Cockpit or meta-ctl emergency-stop.',
    diagnosis: 'All job dispatch halts immediately; active browser workers receive SIGKILL; DB enters read-only.',
    recovery: 'Perform full forensic audit of logs and database tables. Resolve root cause in staging.',
    validation: 'Transition to MAINTENANCE mode; execute full reconciliation suite across all 32 tables.',
    rollbackPlan: 'Remain in EMERGENCY_STOP until two senior engineering leads approve disengagement.',
    auditRequirements: 'Non-repudiable audit entry created with operator signature, timestamp, and justification.',
    exitCriteria: 'System verified clean; transition to NORMAL mode approved and executed.'
  }
];

// ============================================================================
// 12. SYSTEM PAUSE MODES & KILL SWITCH SCOPES
// ============================================================================

export interface SystemPauseModeSpec {
  mode: string;
  allowNewJobs: boolean;
  activeScraping: 'ACTIVE' | 'DRAIN' | 'FROZEN' | 'STOPPED' | 'KILLED';
  verificationAndExports: 'ACTIVE' | 'FROZEN' | 'STOPPED' | 'READ_ONLY';
  description: string;
}

export const SYSTEM_PAUSE_MODES: SystemPauseModeSpec[] = [
  {
    mode: 'NORMAL',
    allowNewJobs: true,
    activeScraping: 'ACTIVE',
    verificationAndExports: 'ACTIVE',
    description: 'Standard production operation. All subsystems fully operational.'
  },
  {
    mode: 'DRAINING',
    allowNewJobs: false,
    activeScraping: 'DRAIN',
    verificationAndExports: 'ACTIVE',
    description: 'No new jobs accepted. In-flight jobs complete their active batch and cleanly checkpoint.'
  },
  {
    mode: 'PAUSED',
    allowNewJobs: false,
    activeScraping: 'FROZEN',
    verificationAndExports: 'FROZEN',
    description: 'Active workers freeze execution; state remains in-memory awaiting unpause.'
  },
  {
    mode: 'COLLECTION_DISABLED',
    allowNewJobs: false,
    activeScraping: 'STOPPED',
    verificationAndExports: 'ACTIVE',
    description: 'Meta scraping is halted (e.g. during challenge cooldown); verification and exports continue.'
  },
  {
    mode: 'VERIFICATION_DISABLED',
    allowNewJobs: true,
    activeScraping: 'ACTIVE',
    verificationAndExports: 'STOPPED',
    description: 'Scraping continues normally; leads are badged UNVERIFIED; verification queue paused.'
  },
  {
    mode: 'EXPORT_ONLY',
    allowNewJobs: false,
    activeScraping: 'STOPPED',
    verificationAndExports: 'ACTIVE',
    description: 'System dedicated to generating data exports; all collection is stopped.'
  },
  {
    mode: 'MAINTENANCE',
    allowNewJobs: false,
    activeScraping: 'STOPPED',
    verificationAndExports: 'READ_ONLY',
    description: 'Database migrations or infrastructure maintenance; read-only UI access.'
  },
  {
    mode: 'EMERGENCY_STOP',
    allowNewJobs: false,
    activeScraping: 'KILLED',
    verificationAndExports: 'STOPPED',
    description: 'Immediate hard shutdown; SIGKILL sent to all browser processes; API returns 503.'
  }
];

// ============================================================================
// 13. RECONCILIATION CHECKS
// ============================================================================

export const RECONCILIATION_CHECKS: ReconciliationResult[] = [
  {
    id: 'rec-01',
    name: 'Orphaned Observation Integrity Check',
    targetDomain: 'DATABASE',
    recordsAudited: 24500,
    anomaliesFound: 0,
    status: 'CLEAN',
    lastRunTimestamp: '2026-09-16T09:00:00Z',
    repairAuditLog: 'Verified 0 orphaned raw observations across all jobs.'
  },
  {
    id: 'rec-02',
    name: 'Job State Machine Consistency Sweeper',
    targetDomain: 'JOB_STATE',
    recordsAudited: 312,
    anomaliesFound: 1,
    status: 'RECONCILED',
    lastRunTimestamp: '2026-09-16T09:00:00Z',
    repairAuditLog: 'Reclaimed 1 stale job (job-0191f6a0-5b12-7001-9911-223344556604) with expired lease; state reset to RECOVERING.'
  },
  {
    id: 'rec-03',
    name: 'Worker Lease Fencing Token Verification',
    targetDomain: 'WORKER_LEASE',
    recordsAudited: 16,
    anomaliesFound: 0,
    status: 'CLEAN',
    lastRunTimestamp: '2026-09-16T09:00:00Z',
    repairAuditLog: 'All active leases have monotonic tokens and recent heartbeats.'
  },
  {
    id: 'rec-04',
    name: 'Checkpoint SHA-256 Digest Continuity',
    targetDomain: 'CHECKPOINTS',
    recordsAudited: 1240,
    anomaliesFound: 0,
    status: 'CLEAN',
    lastRunTimestamp: '2026-09-16T09:00:00Z',
    repairAuditLog: 'Verified 1,240 checkpoint SHA-256 digests; zero checksum corruption.'
  },
  {
    id: 'rec-05',
    name: 'Export Artifact Record Count Reconciliation',
    targetDomain: 'EXPORTS',
    recordsAudited: 84,
    anomaliesFound: 0,
    status: 'CLEAN',
    lastRunTimestamp: '2026-09-16T09:00:00Z',
    repairAuditLog: 'All completed export files match database query line counts.'
  },
  {
    id: 'rec-06',
    name: 'Cryptographic Provenance Token Audit',
    targetDomain: 'PROVENANCE',
    recordsAudited: 8200,
    anomaliesFound: 0,
    status: 'CLEAN',
    lastRunTimestamp: '2026-09-16T09:00:00Z',
    repairAuditLog: 'All candidate advertisers possess valid root observation hashes.'
  }
];

// ============================================================================
// 14. 35/35 PHASE 09 PRODUCTION READINESS AUDIT CRITERIA
// ============================================================================

export const PHASE_09_AUDIT_CRITERIA: Phase09AuditCriterion[] = [
  {
    id: 'crit-01',
    code: 'REL-01',
    title: 'Service Health & Readiness Probes',
    category: 'HEALTH_LIVENESS_READINESS',
    requirement: 'All services expose distinct /health/liveness and /health/readiness probes with dependency breakdown.',
    verificationEvidence: 'Implemented endpoints with granular checks for DB, Queue, Chromium, and Storage in Sec 14.',
    testCoverage: 'p9_health_readiness_test.ts'
  },
  {
    id: 'crit-02',
    code: 'REL-02',
    title: 'Worker Heartbeat Protocol',
    category: 'HEARTBEAT_STALENESS',
    requirement: 'Workers publish bounded 5-second heartbeats with memory, page count, and current operation.',
    verificationEvidence: 'Heartbeat payload schema defined in Sec 07; 3 missed heartbeats marks worker SUSPECT.',
    testCoverage: 'p9_worker_heartbeat_test.ts'
  },
  {
    id: 'crit-03',
    code: 'REL-03',
    title: 'Worker Lease Fencing Tokens',
    category: 'WORKER_LEASING_FENCING',
    requirement: 'Every lease grant increments an integer fencing token; stale writes are rejected by database triggers.',
    verificationEvidence: 'Monotonic fencing token contract defined in Sec 06 with trg_enforce_fencing_token.',
    testCoverage: 'p9_fencing_token_rejection_test.ts'
  },
  {
    id: 'crit-04',
    code: 'REL-04',
    title: 'Strictly Bounded Retry Budgets',
    category: 'RETRIES_DEAD_LETTER',
    requirement: 'Max 3 attempts with 60-second capped exponential backoff; infinite retries strictly prohibited.',
    verificationEvidence: 'Retry formula defined in Sec 09 with total time budget of 180 seconds.',
    testCoverage: 'p9_retry_budget_test.ts'
  },
  {
    id: 'crit-05',
    code: 'REL-05',
    title: 'Zero Challenge / Block Retries',
    category: 'RETRIES_DEAD_LETTER',
    requirement: 'CHALLENGED and BLOCKED states zero the retry budget immediately; zero automated retries.',
    verificationEvidence: 'ErrorClassifier forces attempts to infinity on challenge signature in Sec 04 & 09.',
    testCoverage: 'p9_challenge_zero_retry_test.ts'
  },
  {
    id: 'crit-06',
    code: 'REL-06',
    title: 'Durable Cryptographic Checkpoints',
    category: 'CHECKPOINT_RESUME',
    requirement: 'Checkpoints committed in atomic DB transactions with SHA-256 payload integrity digests.',
    verificationEvidence: 'Checkpoint model in Sec 10 requires payload_checksum matching canonical JSON digest.',
    testCoverage: 'p9_checkpoint_checksum_test.ts'
  },
  {
    id: 'crit-07',
    code: 'REL-07',
    title: 'Safe Checkpoint Resumption Protocol',
    category: 'CHECKPOINT_RESUME',
    requirement: 'Worker crash recovery verifies latest checkpoint digest and falls back to sequence N-1 on corruption.',
    verificationEvidence: 'Resumption algorithm specified in Sec 10; tested via Chaos Experiment CH-05.',
    testCoverage: 'p9_checkpoint_resume_test.ts'
  },
  {
    id: 'crit-08',
    code: 'REL-08',
    title: 'Dead-Letter Queue (DLQ) Schema',
    category: 'RETRIES_DEAD_LETTER',
    requirement: 'Exhausted or corrupted jobs retain original payload, full error history, and require manual approval.',
    verificationEvidence: 'job_dead_letter_queue schema and DLQ inspection UI implemented in Sec 09 & Cockpit.',
    testCoverage: 'p9_dlq_retention_test.ts'
  },
  {
    id: 'crit-09',
    code: 'REL-09',
    title: 'Centralized Concurrency Governance',
    category: 'BACKPRESSURE_CONCURRENCY',
    requirement: 'Global limit of 16 browser workers and 1 browser context per worker; strictly bounded.',
    verificationEvidence: 'Concurrency limits codified in Sec 12; verified via load testing suite.',
    testCoverage: 'p9_concurrency_governor_test.ts'
  },
  {
    id: 'crit-10',
    code: 'REL-10',
    title: 'Queue Depth Backpressure Throttling',
    category: 'BACKPRESSURE_CONCURRENCY',
    requirement: 'Queue depth > 50 triggers BACKPRESSURE_WARNING; depth > 100 pauses non-admin job creation.',
    verificationEvidence: 'Backpressure state machine defined in Sec 12 and reflected in Chrome MV3 popup.',
    testCoverage: 'p9_backpressure_throttle_test.ts'
  },
  {
    id: 'crit-11',
    code: 'REL-11',
    title: 'Stale Worker & Orphan Reclaim Sweeper',
    category: 'HEARTBEAT_STALENESS',
    requirement: 'Background daemon reclaims orphaned jobs within 30 seconds and transitions them to RECOVERING.',
    verificationEvidence: 'Sweeper SQL query in Sec 07; verified via Chaos Experiment CH-01.',
    testCoverage: 'p9_stale_worker_sweeper_test.ts'
  },
  {
    id: 'crit-12',
    code: 'REL-12',
    title: 'Browser Health & Process Tree Hygiene',
    category: 'BROWSER_HEALTH',
    requirement: 'Renderer crashes and OOM conditions trigger process group SIGKILL and clean context relaunch.',
    verificationEvidence: 'Browser state machine and PGID termination script documented in Sec 08.',
    testCoverage: 'p9_browser_tree_hygiene_test.ts'
  },
  {
    id: 'crit-13',
    code: 'REL-13',
    title: 'Database Outage Cooperative Pause',
    category: 'FAILURE_MATRIX',
    requirement: 'Workers enter cooperative pause and local NVMe buffer when PostgreSQL connectivity drops.',
    verificationEvidence: 'Protocol specified in Sec 03 & Sec 33; validated in Chaos Experiment CH-03.',
    testCoverage: 'p9_db_pause_recovery_test.ts'
  },
  {
    id: 'crit-14',
    code: 'REL-14',
    title: 'Transactional Outbox Pattern',
    category: 'RELIABILITY_OBJECTIVES',
    requirement: 'State mutations and event publishing share the exact same ACID database transaction.',
    verificationEvidence: 'Transactional outbox table and publisher polling loop documented in Sec 11.',
    testCoverage: 'p9_transactional_outbox_test.ts'
  },
  {
    id: 'crit-15',
    code: 'REL-15',
    title: 'Monotonic Event Ordering & Deduplication',
    category: 'RELIABILITY_OBJECTIVES',
    requirement: 'Consumers detect and drop duplicate events based on monotonic sequence numbers.',
    verificationEvidence: 'Sequence validation contract in Sec 11; tested in Chaos Experiment CH-04.',
    testCoverage: 'p9_event_idempotency_test.ts'
  },
  {
    id: 'crit-16',
    code: 'REL-16',
    title: 'DOM Selector Drift Detection',
    category: 'CHANGE_ANOMALY_DETECTION',
    requirement: 'Missing feed selectors trigger UI_CHANGE_DETECTED, batch quarantine, and job pause.',
    verificationEvidence: 'Selector failure monitoring and pause trigger codified in Sec 17.',
    testCoverage: 'p9_selector_drift_test.ts'
  },
  {
    id: 'crit-17',
    code: 'REL-17',
    title: 'Field Presence Collapse Guard',
    category: 'CHANGE_ANOMALY_DETECTION',
    requirement: 'Field presence ratio dropping below 40% immediately flags SUSPECT_DOM_DRIFT and pauses job.',
    verificationEvidence: 'Continuous rolling field presence calculator implemented in Sec 17 & Drift Center.',
    testCoverage: 'p9_field_presence_guard_test.ts'
  },
  {
    id: 'crit-18',
    code: 'REL-18',
    title: 'Zero-Result Anomaly Detection',
    category: 'CHANGE_ANOMALY_DETECTION',
    requirement: 'Sudden empty results cross-referenced with page-state signatures to prevent empty dossier ingestion.',
    verificationEvidence: 'Zero-result anomaly detection logic defined in Sec 17.',
    testCoverage: 'p9_zero_result_anomaly_test.ts'
  },
  {
    id: 'crit-19',
    code: 'REL-19',
    title: 'Automated Integrity Reconciliation Sweepers',
    category: 'INTEGRITY_RECONCILIATION',
    requirement: 'Hourly scheduled sweepers check for orphaned observations, broken provenance, and out-of-bounds scores.',
    verificationEvidence: 'Six automated sweepers defined in Sec 19 and Reconciliation Ledger.',
    testCoverage: 'p9_reconciliation_sweeper_test.ts'
  },
  {
    id: 'crit-20',
    code: 'REL-20',
    title: 'Export Record Count Reconciliation',
    category: 'INTEGRITY_RECONCILIATION',
    requirement: 'Export downloads blocked if generated file row count does not exactly match database query count.',
    verificationEvidence: 'Export count reconciliation rule codified in Sec 19 and Runbook RB-08.',
    testCoverage: 'p9_export_reconciliation_test.ts'
  },
  {
    id: 'crit-21',
    code: 'REL-21',
    title: 'Prometheus Metrics & Cardinality Defense',
    category: 'METRICS_SLOS_LOGGING',
    requirement: '30+ production metrics exposed without unbounded labels (no raw URLs or freeform text).',
    verificationEvidence: 'Prometheus metrics catalog and cardinality rules defined in Sec 21.',
    testCoverage: 'p9_metric_cardinality_test.ts'
  },
  {
    id: 'crit-22',
    code: 'REL-22',
    title: 'Structured JSON Logging with PII Redaction',
    category: 'METRICS_SLOS_LOGGING',
    requirement: 'Single-line JSON logs with correlation IDs and automated regex redaction of auth tokens and PII.',
    verificationEvidence: 'Structured log schema and PII redaction engine documented in Sec 22.',
    testCoverage: 'p9_log_redaction_test.ts'
  },
  {
    id: 'crit-23',
    code: 'REL-23',
    title: 'Distributed Tracing Context Propagation',
    category: 'METRICS_SLOS_LOGGING',
    requirement: 'Standard W3C traceparent header propagated across all UI, API, Orchestrator, and Worker spans.',
    verificationEvidence: 'Distributed tracing architecture and 100% error sampling specified in Sec 23.',
    testCoverage: 'p9_trace_propagation_test.ts'
  },
  {
    id: 'crit-24',
    code: 'REL-24',
    title: 'Alerting Matrix & Deduplication Engine',
    category: 'METRICS_SLOS_LOGGING',
    requirement: 'CRITICAL, HIGH, and MEDIUM alerts with 15-minute grouping windows and root-cause inhibition.',
    verificationEvidence: 'Alert rules catalog and suppression logic implemented in Sec 24.',
    testCoverage: 'p9_alert_dedup_test.ts'
  },
  {
    id: 'crit-25',
    code: 'REL-25',
    title: 'Incident Response Severity SLAs',
    category: 'INCIDENT_RUNBOOKS',
    requirement: 'SEV-1 (< 5m ack, < 15m containment) down to SEV-4 with mandatory post-mortems within 48 hours.',
    verificationEvidence: 'Incident response framework and severity matrix codified in Sec 25.',
    testCoverage: 'p9_incident_sla_test.ts'
  },
  {
    id: 'crit-26',
    code: 'REL-26',
    title: 'Production Runbook Catalog (10 Runbooks)',
    category: 'INCIDENT_RUNBOOKS',
    requirement: 'Comprehensive, step-by-step runbooks for all 10 critical operational incident types.',
    verificationEvidence: 'All 10 runbooks with Trigger, Containment, Recovery, and Validation in Sec 26 & Viewer.',
    testCoverage: 'p9_runbook_completeness_test.ts'
  },
  {
    id: 'crit-27',
    code: 'REL-27',
    title: 'Multi-Tier System Pause Modes',
    category: 'KILL_SWITCH_DEGRADED',
    requirement: 'Eight distinct operational modes (NORMAL to EMERGENCY_STOP) allowing fine-grained control.',
    verificationEvidence: 'Pause modes defined in Sec 27 and interactive console in Cockpit.',
    testCoverage: 'p9_pause_modes_test.ts'
  },
  {
    id: 'crit-28',
    code: 'REL-28',
    title: 'Surgical Scoped Kill Switches',
    category: 'KILL_SWITCH_DEGRADED',
    requirement: 'Kill switches operable at Global, Adapter, Job Type, Worker Pool, and Schedule levels.',
    verificationEvidence: 'Scoped kill switch commands and operator audit logs defined in Sec 27.',
    testCoverage: 'p9_kill_switch_test.ts'
  },
  {
    id: 'crit-29',
    code: 'REL-29',
    title: 'Graceful Degraded Modes',
    category: 'KILL_SWITCH_DEGRADED',
    requirement: 'Verification or scoring outages isolate gracefully with leads clearly badged UNVERIFIED.',
    verificationEvidence: 'Degraded mode rules and UI badge specifications codified in Sec 28.',
    testCoverage: 'p9_degraded_mode_test.ts'
  },
  {
    id: 'crit-30',
    code: 'REL-30',
    title: 'Graceful Shutdown & 30s Drain Window',
    category: 'HEALTH_LIVENESS_READINESS',
    requirement: 'SIGTERM triggers 8-step shutdown sequence committing active checkpoints within 30 seconds.',
    verificationEvidence: 'Graceful shutdown sequence and context drain protocol defined in Sec 15.',
    testCoverage: 'p9_graceful_shutdown_test.ts'
  },
  {
    id: 'crit-31',
    code: 'REL-31',
    title: 'Additive Rolling Deployments & Canary Gates',
    category: 'HEALTH_LIVENESS_READINESS',
    requirement: 'Zero breaking DB migrations during rollouts; 15-minute canary soak window with automated rollback.',
    verificationEvidence: 'Version compatibility matrix and canary gates documented in Sec 16.',
    testCoverage: 'p9_canary_deployment_test.ts'
  },
  {
    id: 'crit-32',
    code: 'REL-32',
    title: 'Disaster Recovery RTO < 30m, RPO < 5m',
    category: 'INTEGRITY_RECONCILIATION',
    requirement: 'Proven failover recovery targets backed by automated 30-day restore exercises.',
    verificationEvidence: 'RTO/RPO targets and scheduled restore drill protocols specified in Sec 29.',
    testCoverage: 'p9_dr_restore_drill_test.ts'
  },
  {
    id: 'crit-33',
    code: 'REL-33',
    title: 'Automated Chaos Testing Suite (6 Scenarios)',
    category: 'CHAOS_SOAK_TESTING',
    requirement: 'Continuous staging chaos tests for worker kill, browser crash, DB drop, duplicate event, and DOM drift.',
    verificationEvidence: 'Chaos test matrix and recovery assertions defined in Sec 30 & Chaos Lab.',
    testCoverage: 'p9_chaos_suite_test.ts'
  },
  {
    id: 'crit-34',
    code: 'REL-34',
    title: '24-Hour Soak & Resource Leak Verification',
    category: 'CHAOS_SOAK_TESTING',
    requirement: 'Long-duration testing proves memory RSS growth < 100MB over 24 hours with zero zombie processes.',
    verificationEvidence: 'Soak test metrics and memory ceiling specifications defined in Sec 31.',
    testCoverage: 'p9_soak_test.ts'
  },
  {
    id: 'crit-35',
    code: 'REL-35',
    title: 'Phase-10 Machine-Readable Handoff Contract',
    category: 'RELIABILITY_OBJECTIVES',
    requirement: 'Complete, structured JSON handoff contract matching Section 105 schema for automated Phase 10 ingestion.',
    verificationEvidence: 'Machine-readable JSON schema validated in Sec 36 and Phase 10 Handoff Inspector.',
    testCoverage: 'p9_phase10_handoff_contract_test.ts'
  }
];

// ============================================================================
// 15. MACHINE-READABLE PHASE 10 HANDOFF CONTRACT (Section 105 Schema)
// ============================================================================

export const PHASE_10_HANDOFF_JSON = {
  phase: 9,
  status: "COMPLETE",
  reliabilityVersion: "v9.0.0-PROD",
  jobStateMachine: [
    "CREATED",
    "QUEUED",
    "ASSIGNED",
    "RUNNING",
    "PAUSING",
    "PAUSED",
    "BLOCKED",
    "CHALLENGED",
    "RECOVERING",
    "PARTIAL",
    "COMPLETED",
    "FAILED",
    "DEAD_LETTERED",
    "CANCELLED"
  ],
  workerLeaseContract: {
    leaseDurationSeconds: 30,
    fencingTokenStrategy: "MONOTONIC_INTEGER_EPOCH",
    missedHeartbeatsBeforeSuspect: 3,
    leaseSweeperIntervalSeconds: 10,
    zombieWorkerRejectionCode: "ERR_WORKER_FENCED_OUT"
  },
  heartbeatContract: {
    intervalSeconds: 5,
    payloadFields: [
      "workerId",
      "leaseId",
      "fencingToken",
      "jobId",
      "runId",
      "state",
      "currentOperation",
      "timestamp",
      "lastCheckpointId",
      "metrics"
    ],
    maxAcceptableAgeSeconds: 15
  },
  recoveryPolicies: [
    {
      failureCategory: "WORKER_CRASH",
      action: "RECLAIM_AND_RESUME",
      checkpointStrategy: "VERIFY_CHECKSUM_AND_RESUME_FROM_LATEST",
      fallbackOnCorruption: "ROLLBACK_TO_SEQUENCE_MINUS_ONE"
    },
    {
      failureCategory: "BROWSER_CRASH",
      action: "PROCESS_TREE_KILL_AND_RELAUNCH",
      maxInProcessRestarts: 1
    },
    {
      failureCategory: "DATABASE_OUTAGE",
      action: "COOPERATIVE_PAUSE_WITH_LOCAL_BUFFER"
    }
  ],
  retryPolicies: [
    {
      category: "TRANSIENT",
      maxAttempts: 3,
      backoff: "EXPONENTIAL_CAPPED_60S",
      jitter: "INFRA_ONLY_MAX_500MS"
    },
    {
      category: "RETRYABLE",
      maxAttempts: 3,
      backoff: "DECORRELATED_JITTER_CAPPED_30S"
    },
    {
      category: "CHALLENGED",
      maxAttempts: 0,
      backoff: "NONE_STOP_IMMEDIATELY"
    },
    {
      category: "BLOCKED",
      maxAttempts: 0,
      backoff: "NONE_STOP_IMMEDIATELY"
    },
    {
      category: "UI_CHANGE",
      maxAttempts: 0,
      backoff: "NONE_PAUSE_FOR_OPERATOR"
    }
  ],
  deadLetterPolicy: {
    tableName: "job_dead_letter_queue",
    maxRetentionDays: 90,
    requiresManualApprovalForReplay: true,
    storedFields: [
      "dlqId",
      "jobId",
      "runId",
      "originalPayload",
      "exhaustedAttempts",
      "failureCategory",
      "errorHistory",
      "lastSafeCheckpointId",
      "serviceVersion"
    ]
  },
  checkpointPolicy: {
    tableName: "job_checkpoints",
    atomicWithBatchCommit: true,
    verificationAlgorithm: "SHA256_CANONICAL_JSON_DIGEST",
    continuityEnforcement: "STRICT_MONOTONIC_SEQUENCE"
  },
  eventReliability: {
    delivery: "TRANSACTIONAL_OUTBOX_AT_LEAST_ONCE",
    idempotency: "CONSUMER_SEQUENCE_FILTERING_AND_DEDUPLICATION_CACHE",
    ordering: "MONOTONIC_PER_AGGREGATE_SEQUENCE_NUMBERS",
    replay: "OUTBOX_OFFSET_RESUMPTION_WITHOUT_DESTRUCTIVE_SIDE_EFFECTS"
  },
  concurrencyPolicy: {
    maxGlobalWorkers: 16,
    maxContextsPerWorker: 1,
    maxVerificationHttpConcurrency: 8,
    maxExportConcurrency: 4,
    backpressureWarningThreshold: 50,
    queueSaturationThreshold: 100
  },
  schedulingPolicy: {
    timezone: "UTC",
    overlapPolicy: "SKIP",
    missedSchedulePolicy: "NEXT_RUN_ONLY",
    concurrencyIsolation: "ISOLATED_BY_SEARCH_TARGET"
  },
  healthContracts: {
    livenessEndpoint: "/health/liveness",
    readinessEndpoint: "/health/readiness",
    detailedEndpoint: "/health/detailed",
    readinessTimeoutSeconds: 3
  },
  deploymentCompatibility: {
    strategy: "ROLLING_WITH_10PCT_CANARY",
    canarySoakDurationMinutes: 15,
    maxPermittedCanaryZeroResultAnomalyRate: 0.01,
    databaseMigrationContract: "STRICTLY_ADDITIVE_BACKWARD_COMPATIBLE"
  },
  changeDetection: {
    selectorHealth: [
      { selector: "[role='feed']", fallback: "div[data-testid='ad-library-feed']" },
      { selector: "div.x1plvlek", fallback: "div[data-card-type='ad']" }
    ],
    schemaDrift: {
      fieldPresenceThresholdPct: 40.0,
      monitoredFields: ["destination_url", "ad_creative_body_text", "advertiser_page_name"]
    },
    zeroResultAnomalies: {
      crossReferencePageState: true,
      triggerInvestigationThreshold: 3
    },
    uiChangeStates: ["UI_CHANGE_DETECTED", "SUSPECT_DOM_DRIFT", "PAUSED"]
  },
  reconciliation: [
    "rec-01-orphaned-observations",
    "rec-02-job-state-consistency",
    "rec-03-worker-lease-fencing",
    "rec-04-checkpoint-checksums",
    "rec-05-export-line-counts",
    "rec-06-provenance-digests"
  ],
  metrics: [
    "meta_jobs_created_total",
    "meta_jobs_completed_total",
    "meta_jobs_failed_total",
    "meta_worker_heartbeat_age_seconds",
    "meta_browser_crashes_total",
    "meta_extraction_field_presence_ratio",
    "meta_extraction_selector_failures_total",
    "meta_extraction_zero_result_anomalies_total"
  ],
  alerts: [
    "DataCorruptionDetected",
    "DatabaseConnectionPoolExhausted",
    "MetaUiChangeDetected",
    "ChallengeOrBlockSpike",
    "WorkerCrashLooping",
    "VerificationQueueBacklog"
  ],
  runbooks: [
    "RB-01: Meta UI / Selector Drift Resolution",
    "RB-02: Challenge / Perimeter Block Incident Response",
    "RB-03: Worker Crash Loop Remediation",
    "RB-04: PostgreSQL Primary Outage & Failover Recovery",
    "RB-05: Work Queue Backlog & Partition Recovery",
    "RB-06: Stale Lease & Zombie Worker Reclamation",
    "RB-07: Dead-Letter Queue Triage & Safe Replay",
    "RB-08: Export File Count Mismatch Resolution",
    "RB-09: SSRF & Verification Timeout Surge Remediation",
    "RB-10: Emergency Global System Stop (Kill Switch)"
  ],
  killSwitches: [
    "GLOBAL_COLLECTION",
    "SOURCE_ADAPTER",
    "JOB_TYPE",
    "WORKER_POOL",
    "SCHEDULE"
  ],
  degradedModes: [
    "COLLECTION_DISABLED",
    "VERIFICATION_DISABLED",
    "EXPORT_ONLY",
    "MAINTENANCE"
  ],
  disasterRecovery: {
    rtoMinutes: 30,
    rpoMinutes: 5,
    restoreDrillFrequencyDays: 30,
    multiRegionReplication: "SYNCHRONOUS_PRIMARY_ASYNC_CROSS_REGION"
  },
  failureInjectionTests: [
    "CH-01: Worker SIGKILL 9",
    "CH-02: Chromium Target.crashed",
    "CH-03: DB TCP RST Drop",
    "CH-04: Duplicate Event Sequence",
    "CH-05: Corrupt Checkpoint Payload",
    "CH-06: DOM Wrapper Class Mutation"
  ],
  loadTests: [
    "24-Hour Continuous Worker Soak Test",
    "50-Job Burst Concurrency Test",
    "1,000-Ad Batch Chunking Test",
    "100,000-Row Streamed Export Test"
  ],
  soakTests: [
    "Memory RSS Leak Verification (< 100MB growth / 24h)",
    "File Descriptor Leak Verification",
    "Chromium Zombie Process Sweep Verification"
  ],
  securityOperations: [
    "Mandatory Tenant ID Filter Verification",
    "Real-Time Secret & Credential Regex Scanner",
    "Immutable Non-Repudiation Operator Audit Ledger"
  ],
  phase10AcceptanceInputs: [
    "Full integration test harness bindings",
    "Pre-configured mock and live-site staging targets",
    "End-to-end chaos recovery validation triggers",
    "Final cross-component compliance checklist"
  ],
  knownUnknowns: [
    "Frequency of unannounced Meta frontend framework migrations",
    "Regional variations in Ad Library DOM wrapper attributes"
  ],
  risks: [
    {
      risk: "Sudden nationwide IP perimeter enforcement",
      mitigation: "Strict non-evasion policy; automatic cooldown pause; zero retry storm."
    },
    {
      risk: "Transient upstream DNS infrastructure degradation",
      mitigation: "Isolated verification circuit breakers; leads gracefully badged UNVERIFIED."
    }
  ]
};
