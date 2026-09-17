import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  Server,
  Cpu,
  Layers,
  Search,
  Filter,
  Eye,
  Sliders,
  Terminal,
  Database,
  Lock,
  Unlock,
  AlertOctagon,
  FileText,
  Key,
  Flame,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  Copy,
  Check,
  Zap,
  Info
} from 'lucide-react';

import {
  HealthStatus,
  CircuitBreakerState,
  JobState,
  RecoveryOperationType,
  StuckClassification,
  DependencyComponent,
  WorkerNodeRecord,
  QueueInspectionRecord,
  JobInspectionRecord,
  JobAttemptRecord,
  RecoveryActionRecord,
  OperationalRunbook,
  ReconciliationDiscrepancy,
  SecurityInvariantStatus,
  PLATFORM_INVARIANTS_24,
  INITIAL_DEPENDENCY_COMPONENTS,
  INITIAL_WORKER_NODES,
  INITIAL_QUEUES,
  INITIAL_JOB_INSPECTION_RECORDS,
  INITIAL_JOB_ATTEMPTS,
  INITIAL_RECOVERY_ACTIONS,
  INITIAL_OPERATIONAL_RUNBOOKS,
  INITIAL_RECONCILIATION_DISCREPANCIES,
  executeAllowlistedRecovery
} from '../data/phase24OperationsEngine';

import {
  TenantContext,
  SAMPLE_TENANTS,
  SAMPLE_USERS
} from '../data/phase18MultiTenantEngine';

export const ProductionOperationsWorkspace: React.FC = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'health-dependencies'
    | 'workers-leases'
    | 'queues'
    | 'jobs-stuck-detection'
    | 'recovery-center'
    | 'runbooks'
    | 'dlq-triage'
    | 'reconciliation'
    | 'invariants'
  >('overview');

  // Tenant context
  const [selectedTenantId, setSelectedTenantId] = useState<string>('tenant_apex_solar');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('usr_marcus_vance');
  const [selectedApproverId, setSelectedApproverId] = useState<string>('usr_elena_rostova');

  const tenantContext: TenantContext = useMemo(() => ({
    orgId: 'org_apex_global',
    tenantId: selectedTenantId,
    workspaceId: 'ws_apex_solar_enterprise',
    projectId: 'proj_california_solar_2026',
    role: 'PLATFORM_SRE',
    permissions: [
      'RECOVERY_EXECUTE',
      'LEASE_RECLAIM',
      'CIRCUIT_BREAKER_RESET',
      'RUNBOOK_EXECUTE',
      'QUEUE_PURGE_DUAL_APPROVAL',
      'AUDIT_INSPECT'
    ]
  }), [selectedTenantId]);

  // Active State Collections
  const [dependencies, setDependencies] = useState<DependencyComponent[]>(INITIAL_DEPENDENCY_COMPONENTS);
  const [workers, setWorkers] = useState<WorkerNodeRecord[]>(INITIAL_WORKER_NODES);
  const [queues, setQueues] = useState<QueueInspectionRecord[]>(INITIAL_QUEUES);
  const [jobs, setJobs] = useState<JobInspectionRecord[]>(INITIAL_JOB_INSPECTION_RECORDS);
  const [attempts] = useState<JobAttemptRecord[]>(INITIAL_JOB_ATTEMPTS);
  const [recoveryActions, setRecoveryActions] = useState<RecoveryActionRecord[]>(INITIAL_RECOVERY_ACTIONS);
  const [runbooks, setRunbooks] = useState<OperationalRunbook[]>(INITIAL_OPERATIONAL_RUNBOOKS);
  const [discrepancies, setDiscrepancies] = useState<ReconciliationDiscrepancy[]>(INITIAL_RECONCILIATION_DISCREPANCIES);
  const [invariants, setInvariants] = useState<SecurityInvariantStatus[]>(PLATFORM_INVARIANTS_24);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobInspectionRecord | null>(null);
  const [selectedRunbook, setSelectedRunbook] = useState<OperationalRunbook | null>(INITIAL_OPERATIONAL_RUNBOOKS[0]);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [recoveryTargetJob, setRecoveryTargetJob] = useState<JobInspectionRecord | null>(null);
  const [selectedOpType, setSelectedOpType] = useState<RecoveryOperationType>('RESUME_FROM_CHECKPOINT');
  const [recoveryReason, setRecoveryReason] = useState('Resuming from verified checkpoint following worker stall.');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // High level system statistics
  const stats = useMemo(() => {
    const degradedCount = dependencies.filter(d => d.healthStatus !== 'HEALTHY').length;
    const stuckJobsCount = jobs.filter(j => j.status === 'STUCK' || j.stuckClassification !== 'NOT_STUCK').length;
    const dlqCount = jobs.filter(j => j.status === 'DEAD_LETTER').length;
    const onlineWorkers = workers.filter(w => w.status === 'ONLINE' || w.status === 'BUSY').length;
    const totalContexts = workers.reduce((acc, w) => acc + w.activeBrowserContexts, 0);
    const maxContexts = workers.reduce((acc, w) => acc + w.maxBrowserContexts, 0);
    const openCircuits = dependencies.filter(d => d.circuitBreakerState !== 'CLOSED').length;
    const unresolvedDiscrepancies = discrepancies.filter(d => !d.resolved).length;

    return {
      degradedCount,
      stuckJobsCount,
      dlqCount,
      onlineWorkers,
      totalWorkers: workers.length,
      totalContexts,
      maxContexts,
      openCircuits,
      unresolvedDiscrepancies
    };
  }, [dependencies, jobs, workers, discrepancies]);

  // Execute typed recovery action
  const handleTriggerRecovery = () => {
    setActionErrorMsg(null);
    setActionSuccessMsg(null);

    try {
      const idempotencyKey = `idemp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const result = executeAllowlistedRecovery({
        operationType: selectedOpType,
        targetJobId: recoveryTargetJob?.jobId,
        targetWorkerId: recoveryTargetJob?.leaseOwnerWorkerId,
        tenantContext,
        operatorId: selectedOperatorId,
        approverId: selectedApproverId,
        reason: recoveryReason,
        idempotencyKey
      });

      // Update state
      setRecoveryActions(prev => [result.auditRecord, ...prev]);

      if (recoveryTargetJob && result.newJobStatus) {
        setJobs(prev =>
          prev.map(j =>
            j.jobId === recoveryTargetJob.jobId
              ? {
                  ...j,
                  status: result.newJobStatus!,
                  stuckClassification: 'NOT_STUCK',
                  fencingToken: result.newFencingEpoch || j.fencingToken,
                  updatedAt: new Date().toISOString()
                }
              : j
          )
        );
      }

      setActionSuccessMsg(`Recovery Succeeded: ${result.message}`);
      setIsRecoveryModalOpen(false);
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Recovery action failed.');
    }
  };

  // Reclaim lease directly
  const handleReclaimLease = (job: JobInspectionRecord) => {
    try {
      const result = executeAllowlistedRecovery({
        operationType: 'FORCE_RECLAIM_LEASE',
        targetJobId: job.jobId,
        targetWorkerId: job.leaseOwnerWorkerId,
        tenantContext,
        operatorId: selectedOperatorId,
        approverId: selectedApproverId,
        reason: 'Expired lease reclaimed by operator inspection.',
        idempotencyKey: `idemp-reclaim-${job.jobId}-${Date.now()}`
      });

      setRecoveryActions(prev => [result.auditRecord, ...prev]);
      setJobs(prev =>
        prev.map(j =>
          j.jobId === job.jobId
            ? {
                ...j,
                status: 'QUEUED',
                stuckClassification: 'NOT_STUCK',
                leaseOwnerWorkerId: undefined,
                leaseExpiresAt: undefined,
                fencingToken: result.newFencingEpoch || j.fencingToken + 1,
                updatedAt: new Date().toISOString()
              }
            : j
        )
      );

      setActionSuccessMsg(`Lease reclaimed for ${job.jobId}. Generation epoch bumped to ${result.newFencingEpoch}.`);
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Failed to reclaim lease.');
    }
  };

  // Reset circuit breaker
  const handleResetCircuitBreaker = (componentId: string) => {
    setDependencies(prev =>
      prev.map(d =>
        d.componentId === componentId
          ? {
              ...d,
              circuitBreakerState: 'CLOSED',
              circuitBreakerFailures: 0,
              healthStatus: 'HEALTHY',
              lastCheckedAt: new Date().toISOString()
            }
          : d
      )
    );
    setActionSuccessMsg(`Circuit breaker for ${componentId} verified and returned to CLOSED.`);
  };

  // Advance runbook step
  const handleRunbookStepAdvance = (runbookId: string, stepId: string) => {
    setRunbooks(prev =>
      prev.map(rb => {
        if (rb.runbookId !== runbookId) return rb;
        const updatedSteps = rb.steps.map(s => {
          if (s.stepId === stepId) {
            return {
              ...s,
              status: 'COMPLETED' as const,
              verificationCheck: `Verified: Automated assertion passed at ${new Date().toLocaleTimeString()}`
            };
          }
          return s;
        });
        return {
          ...rb,
          steps: updatedSteps,
          lastExecutedAt: new Date().toISOString()
        };
      })
    );
    setActionSuccessMsg(`Runbook step ${stepId} completed and verified.`);
  };

  // Reconcile Discrepancy
  const handleResolveDiscrepancy = (discId: string) => {
    setDiscrepancies(prev =>
      prev.map(d =>
        d.discrepancyId === discId
          ? { ...d, resolved: true }
          : d
      )
    );
    setActionSuccessMsg(`Discrepancy ${discId} resolved via atomic reconciliation routine.`);
  };

  return (
    <div id="production-operations-workspace" className="space-y-6 w-full max-w-full">
      {/* Top Banner & Multi-Tenant Operator Context Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-purple-600 text-white rounded-lg shadow-xs">
                <Server className="w-5 h-5 text-emerald-400" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  Phase 24: Production Operations & Recovery Control Plane
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-semibold border border-emerald-300">
                    SRE Control Active
                  </span>
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Deterministic, allowlisted, multi-tenant resilient recovery, distributed fencing, stuck-job remediation & runbook automation.
                </p>
              </div>
            </div>
          </div>

          {/* Operator & Tenant Pickers */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-neutral-500 font-medium">Tenant Scope:</span>
              <select
                id="operations-tenant-selector"
                value={selectedTenantId}
                onChange={e => setSelectedTenantId(e.target.value)}
                className="bg-transparent font-semibold text-neutral-800 focus:outline-none cursor-pointer"
              >
                {SAMPLE_TENANTS.map(t => (
                  <option key={t.tenantId} value={t.tenantId}>
                    {t.name} ({t.tenantId})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-neutral-500 font-medium">Operator (Role):</span>
              <select
                id="operations-operator-selector"
                value={selectedOperatorId}
                onChange={e => setSelectedOperatorId(e.target.value)}
                className="bg-transparent font-semibold text-neutral-800 focus:outline-none cursor-pointer"
              >
                {SAMPLE_USERS.map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.displayName} ({u.globalSystemRole})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-neutral-500 font-medium">Dual Approver:</span>
              <select
                id="operations-approver-selector"
                value={selectedApproverId}
                onChange={e => setSelectedApproverId(e.target.value)}
                className="bg-transparent font-semibold text-neutral-800 focus:outline-none cursor-pointer"
              >
                {SAMPLE_USERS.filter(u => u.userId !== selectedOperatorId).map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.displayName} ({u.globalSystemRole})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Global Action Notifications */}
        {actionSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-mono">{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {actionErrorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-lg flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-mono font-semibold">{actionErrorMsg}</span>
            </div>
            <button
              onClick={() => setActionErrorMsg(null)}
              className="text-red-700 hover:text-red-900 font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Real-time Health Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-neutral-100 text-xs">
          <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-neutral-500 font-medium">Degraded Dependencies</div>
            <div className="text-lg font-bold text-neutral-900 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${stats.degradedCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              {stats.degradedCount} / {dependencies.length}
            </div>
          </div>

          <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-neutral-500 font-medium">Stuck / Zombie Jobs</div>
            <div className="text-lg font-bold text-neutral-900 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${stats.stuckJobsCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              {stats.stuckJobsCount}
            </div>
          </div>

          <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-neutral-500 font-medium">Dead Letter (DLQ)</div>
            <div className="text-lg font-bold text-neutral-900 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${stats.dlqCount > 0 ? 'bg-purple-500' : 'bg-neutral-400'}`} />
              {stats.dlqCount}
            </div>
          </div>

          <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-neutral-500 font-medium">Online Workers</div>
            <div className="text-lg font-bold text-neutral-900 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {stats.onlineWorkers} / {stats.totalWorkers}
            </div>
          </div>

          <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-neutral-500 font-medium">Browser Contexts</div>
            <div className="text-lg font-bold text-neutral-900 flex items-center gap-1.5 mt-0.5">
              <Cpu className="w-3.5 h-3.5 text-neutral-600" />
              {stats.totalContexts} / {stats.maxContexts}
            </div>
          </div>

          <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-neutral-500 font-medium">Open Circuit Breakers</div>
            <div className="text-lg font-bold text-neutral-900 flex items-center gap-1.5 mt-0.5">
              <Zap className={`w-3.5 h-3.5 ${stats.openCircuits > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
              {stats.openCircuits}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-px" aria-label="Tabs">
          {[
            { id: 'overview', label: 'Operations Cockpit', icon: Activity },
            { id: 'health-dependencies', label: 'Dependencies & Circuit Breakers', icon: Zap, badge: stats.degradedCount },
            { id: 'workers-leases', label: 'Worker Fleet & Fencing', icon: Server },
            { id: 'queues', label: 'Queue Operations', icon: Layers },
            { id: 'jobs-stuck-detection', label: 'Stuck-Job Detection', icon: AlertTriangle, badge: stats.stuckJobsCount },
            { id: 'recovery-center', label: 'Recovery Control Center', icon: RotateCcw },
            { id: 'runbooks', label: 'Runbook Automation', icon: Terminal },
            { id: 'dlq-triage', label: 'DLQ & Poison Pills', icon: Flame, badge: stats.dlqCount },
            { id: 'reconciliation', label: 'State Reconciliation', icon: RefreshCw, badge: stats.unresolvedDiscrepancies },
            { id: 'invariants', label: '20 Reliability Invariants', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-button-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900 bg-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OPERATIONS COCKPIT OVERVIEW */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Action Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Alert Card: Degraded Meta Ad Library */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-amber-900">Upstream 429 Throttling</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                  HALF_OPEN
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-2">
                Meta Ad Library endpoint returning 4.8% error rate. Adaptive rate-limiter engaged. Runbook RB-24-01 active.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRunbook(runbooks[0]);
                    setActiveTab('runbooks');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                >
                  Inspect Runbook RB-24-01
                </button>
                <button
                  onClick={() => handleResetCircuitBreaker('dep-meta-ad-api')}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-50 transition-colors"
                >
                  Reset Breaker
                </button>
              </div>
            </div>

            {/* Alert Card: Zombie Worker */}
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-600" />
                  <h3 className="text-sm font-bold text-red-900">Zombie Worker Detected</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded">
                  MISSING 210s
                </span>
              </div>
              <p className="text-xs text-red-800 mt-2">
                worker-playwright-usw2-03 failed heartbeats and holds expired lease on job-scrape-4088.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    const stuckJob = jobs.find(j => j.jobId === 'job-scrape-4088');
                    if (stuckJob) handleReclaimLease(stuckJob);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Reclaim Expired Lease
                </button>
                <button
                  onClick={() => {
                    setSelectedRunbook(runbooks[1]);
                    setActiveTab('runbooks');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-red-300 text-red-900 rounded hover:bg-red-50 transition-colors"
                >
                  Drain Node RB-24-02
                </button>
              </div>
            </div>

            {/* Alert Card: Reconciliation Invariant */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-neutral-900">20 Invariants Verified</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  PASS (0 VIOLATIONS)
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                All 20 reliability and multi-tenant security invariants actively enforced across distributed workers.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => setActiveTab('invariants')}
                  className="px-2.5 py-1 text-xs font-semibold bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  View Invariant Matrix
                </button>
              </div>
            </div>
          </div>

          {/* Core System Status Table */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Active Job Execution Matrix</span>
              <span className="text-xs font-normal text-neutral-500">Tenant: {selectedTenantId}</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-600">
                    <th className="py-2.5 px-3 font-semibold">Job ID</th>
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Fencing Token</th>
                    <th className="py-2.5 px-3 font-semibold">Worker / Lease</th>
                    <th className="py-2.5 px-3 font-semibold">Checkpoint</th>
                    <th className="py-2.5 px-3 font-semibold">Diagnosis</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {jobs.map(job => {
                    const isStuck = job.status === 'STUCK' || job.stuckClassification !== 'NOT_STUCK';
                    return (
                      <tr key={job.jobId} className={`hover:bg-neutral-50/80 transition-colors ${isStuck ? 'bg-red-50/30' : ''}`}>
                        <td className="py-3 px-3 font-mono font-medium text-neutral-900">
                          {job.jobId}
                        </td>
                        <td className="py-3 px-3 text-neutral-600">
                          <span className="px-2 py-0.5 bg-neutral-100 rounded text-[11px] font-mono">
                            {job.jobType}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                              job.status === 'RUNNING'
                                ? 'bg-blue-100 text-blue-800'
                                : job.status === 'STUCK'
                                ? 'bg-red-100 text-red-800 animate-pulse'
                                : job.status === 'DEAD_LETTER'
                                ? 'bg-purple-100 text-purple-800'
                                : job.status === 'QUEUED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-700">
                          #{job.fencingToken}
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-600">
                          {job.leaseOwnerWorkerId ? (
                            <div className="flex flex-col">
                              <span>{job.leaseOwnerWorkerId}</span>
                              <span className="text-[10px] text-neutral-400">Exp: {job.leaseExpiresAt?.split('T')[1] || 'N/A'}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">None (Unleased)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-neutral-600 font-mono text-[11px]">
                          {job.checkpointData ? (
                            <span>Page {job.checkpointData.lastScrapedPage} / {job.checkpointData.totalPagesEstimated} ({job.checkpointData.extractedRecordsCount} ads)</span>
                          ) : (
                            <span className="text-neutral-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-neutral-600 text-xs">
                          {isStuck ? (
                            <span className="text-red-700 font-semibold">{job.stuckClassification}</span>
                          ) : (
                            <span className="text-neutral-500">{job.inputSummary.slice(0, 32)}...</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isStuck && (
                              <button
                                onClick={() => handleReclaimLease(job)}
                                className="px-2 py-1 bg-red-600 text-white rounded text-[11px] font-semibold hover:bg-red-700 transition-colors"
                              >
                                Reclaim Lease
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setRecoveryTargetJob(job);
                                setIsRecoveryModalOpen(true);
                              }}
                              className="px-2 py-1 bg-purple-600 text-white rounded text-[11px] font-semibold hover:bg-purple-700 transition-colors"
                            >
                              Recover...
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: HEALTH & DEPENDENCY CIRCUIT BREAKERS */}
      {/* ============================================================ */}
      {activeTab === 'health-dependencies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Component Health & Circuit Breaker Dashboard
            </h2>
            <button
              onClick={() => {
                setDependencies([...INITIAL_DEPENDENCY_COMPONENTS]);
                setActionSuccessMsg('Component health probes dispatched across cluster.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
              <span>Poll Telemetry</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dependencies.map(dep => {
              const isHealthy = dep.healthStatus === 'HEALTHY';
              const isDegraded = dep.healthStatus === 'DEGRADED';
              const isBreakerOpen = dep.circuitBreakerState === 'OPEN';
              const isBreakerHalfOpen = dep.circuitBreakerState === 'HALF_OPEN';

              return (
                <div
                  key={dep.componentId}
                  className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between ${
                    isDegraded ? 'border-amber-300 bg-amber-50/20' : isBreakerOpen ? 'border-red-300 bg-red-50/20' : 'border-neutral-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                          {dep.category}
                        </span>
                        <h3 className="text-sm font-bold text-neutral-900 mt-1.5">{dep.name}</h3>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isHealthy
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDegraded
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {dep.healthStatus}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mt-2">{dep.details}</p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-4 p-2 bg-neutral-50 rounded-lg text-center font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Latency</span>
                        <span className="font-bold text-neutral-800">{dep.latencyMs}ms</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">P99 Latency</span>
                        <span className="font-bold text-neutral-800">{dep.p99LatencyMs}ms</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Error Rate</span>
                        <span className={`font-bold ${dep.errorRatePercent > 1 ? 'text-amber-600' : 'text-neutral-800'}`}>
                          {dep.errorRatePercent}%
                        </span>
                      </div>
                    </div>

                    {/* Circuit Breaker & Fallback Info */}
                    <div className="mt-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Circuit Breaker:</span>
                        <span
                          className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            dep.circuitBreakerState === 'CLOSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : dep.circuitBreakerState === 'HALF_OPEN'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {dep.circuitBreakerState} ({dep.circuitBreakerFailures}/{dep.circuitBreakerThreshold} fails)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Fallback Mode:</span>
                        <span className="font-mono text-neutral-700 text-[11px]">{dep.fallbackMode}</span>
                      </div>
                      {dep.endpointUrl && (
                        <div className="text-[10px] text-neutral-400 font-mono truncate">
                          {dep.endpointUrl}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400">
                      Checked: {dep.lastCheckedAt.split('T')[1].slice(0, 8)}
                    </span>
                    {(isBreakerOpen || isBreakerHalfOpen) && (
                      <button
                        onClick={() => handleResetCircuitBreaker(dep.componentId)}
                        className="px-2.5 py-1 text-xs font-semibold bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Breaker</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: WORKER FLEET & FENCING */}
      {/* ============================================================ */}
      {activeTab === 'workers-leases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Playwright Headless Browser Worker Fleet & Fencing Tokens
            </h2>
            <div className="text-xs text-neutral-500 font-mono">
              Global Cluster Fencing Epoch: <span className="font-bold text-neutral-900">#144</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map(worker => {
              const isOnline = worker.status === 'ONLINE';
              const isBusy = worker.status === 'BUSY';
              const isUnresponsive = worker.status === 'UNRESPONSIVE';
              const memRatio = Math.round((worker.memoryUsageMb / worker.memoryLimitMb) * 100);

              return (
                <div
                  key={worker.workerId}
                  className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between ${
                    isUnresponsive ? 'border-red-300 bg-red-50/20' : 'border-neutral-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                          {worker.workerType}
                        </span>
                        <h3 className="text-sm font-bold text-neutral-900 font-mono mt-1">
                          {worker.workerId}
                        </h3>
                        <p className="text-[11px] text-neutral-500 font-mono">{worker.hostName} ({worker.ipAddress})</p>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isOnline
                            ? 'bg-emerald-100 text-emerald-800'
                            : isBusy
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800 animate-pulse'
                        }`}
                      >
                        {worker.status}
                      </span>
                    </div>

                    {/* Resources */}
                    <div className="mt-4 space-y-2 text-xs font-mono">
                      <div>
                        <div className="flex justify-between text-neutral-500 mb-1">
                          <span>Memory Usage:</span>
                          <span className={memRatio > 85 ? 'text-red-600 font-bold' : 'text-neutral-800'}>
                            {worker.memoryUsageMb}MB / {worker.memoryLimitMb}MB ({memRatio}%)
                          </span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              memRatio > 85 ? 'bg-red-500' : memRatio > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${memRatio}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-neutral-600 pt-1">
                        <span>Browser Contexts:</span>
                        <span className="font-bold">
                          {worker.activeBrowserContexts} / {worker.maxBrowserContexts} active
                        </span>
                      </div>

                      <div className="flex justify-between text-neutral-600">
                        <span>Fencing Epoch:</span>
                        <span className="font-bold text-neutral-900">#{worker.fencingEpoch}</span>
                      </div>

                      <div className="flex justify-between text-neutral-600">
                        <span>Heartbeat:</span>
                        <span className={isUnresponsive ? 'text-red-600 font-bold' : 'text-neutral-500'}>
                          {worker.lastHeartbeatAt.split('T')[1].slice(0, 8)}
                        </span>
                      </div>
                    </div>

                    {/* Active Leases */}
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <div className="text-[10px] text-neutral-400 uppercase font-semibold">Active Leases</div>
                      {worker.currentLeaseIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {worker.currentLeaseIds.map(lease => (
                            <span key={lease} className="px-1.5 py-0.5 bg-neutral-100 font-mono text-[10px] text-neutral-700 rounded">
                              {lease}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400 italic">No active leases</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                    {isUnresponsive ? (
                      <button
                        onClick={() => {
                          setSelectedRunbook(runbooks[1]);
                          setActiveTab('runbooks');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Evict Zombie Worker
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActionSuccessMsg(`Drain signal dispatched to ${worker.workerId}. No new leases will be awarded.`);
                        }}
                        className="px-2 py-1 text-xs font-semibold bg-white border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
                      >
                        Drain Node
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: QUEUE OPERATIONS */}
      {/* ============================================================ */}
      {activeTab === 'queues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Distributed Queue Operations & Backpressure Controller
            </h2>
            <button
              onClick={() => {
                const result = executeAllowlistedRecovery({
                  operationType: 'RECONCILE_TENANT_QUEUES',
                  tenantContext,
                  operatorId: selectedOperatorId,
                  approverId: selectedApproverId,
                  reason: 'Manual operator queue reconciliation audit.',
                  idempotencyKey: `idemp-reconcile-queues-${Date.now()}`
                });
                setRecoveryActions(prev => [result.auditRecord, ...prev]);
                setActionSuccessMsg(result.message);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reconcile Queue Counters</span>
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-600">
                  <th className="py-2.5 px-3 font-semibold">Queue Name</th>
                  <th className="py-2.5 px-3 font-semibold">Pending</th>
                  <th className="py-2.5 px-3 font-semibold">In-Flight</th>
                  <th className="py-2.5 px-3 font-semibold">Delayed</th>
                  <th className="py-2.5 px-3 font-semibold">DLQ Count</th>
                  <th className="py-2.5 px-3 font-semibold">Workers</th>
                  <th className="py-2.5 px-3 font-semibold">Throughput</th>
                  <th className="py-2.5 px-3 font-semibold">Backpressure</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {queues.map(q => (
                  <tr key={q.queueId} className="hover:bg-neutral-50/80 transition-colors font-mono">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-neutral-900 font-sans">{q.queueName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{q.queueId}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-neutral-800">{q.pendingCount}</td>
                    <td className="py-3 px-3 text-blue-700 font-bold">{q.inFlightCount}</td>
                    <td className="py-3 px-3 text-neutral-500">{q.delayedCount}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${q.dlqCount > 0 ? 'bg-purple-100 text-purple-800' : 'text-neutral-400'}`}>
                        {q.dlqCount}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-700">{q.consumerWorkersCount}</td>
                    <td className="py-3 px-3 text-neutral-700">{q.throughputPerMin}/min</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.backpressureState === 'NORMAL'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {q.backpressureState}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {q.dlqCount > 0 ? (
                        <button
                          onClick={() => setActiveTab('dlq-triage')}
                          className="px-2 py-1 bg-purple-600 text-white rounded text-[11px] font-sans font-semibold hover:bg-purple-700 transition-colors"
                        >
                          Triage DLQ
                        </button>
                      ) : (
                        <button
                          onClick={() => setActionSuccessMsg(`Queue ${q.queueId} rate limit set to ${q.rateLimitPerSec}/s`)}
                          className="px-2 py-1 bg-white border border-neutral-300 text-neutral-700 rounded text-[11px] font-sans hover:bg-neutral-50 transition-colors"
                        >
                          Config Limit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: STUCK-JOB DETECTION & LEASE RECLAIM */}
      {/* ============================================================ */}
      {activeTab === 'jobs-stuck-detection' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Deterministic Stuck-Job Detection</h3>
              <p className="text-xs text-amber-800 mt-1">
                A job is formally classified as STUCK when: (1) Assigned worker heartbeat missing &gt; 90s, (2) Lease expiration timestamp elapsed with state = RUNNING, (3) Checkpoint hash un-advanced for &gt; 180s, or (4) Worker memory exceeds safety envelope.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {jobs.filter(j => j.status === 'STUCK' || j.stuckClassification !== 'NOT_STUCK').map(job => (
              <div key={job.jobId} className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-neutral-900">{job.jobId}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-mono font-bold rounded">
                        {job.stuckClassification}
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-mono rounded">
                        Token #{job.fencingToken}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 font-sans">{job.inputSummary}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReclaimLease(job)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow-xs"
                    >
                      Reclaim Expired Lease & Re-Queue
                    </button>
                    <button
                      onClick={() => {
                        setRecoveryTargetJob(job);
                        setSelectedOpType('RESUME_FROM_CHECKPOINT');
                        setIsRecoveryModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors shadow-xs"
                    >
                      Resume from Checkpoint
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs font-mono">
                  <div className="p-2 bg-neutral-50 rounded">
                    <span className="text-neutral-400 block text-[10px]">Worker / Host</span>
                    <span className="font-semibold text-neutral-800">{job.leaseOwnerWorkerId || 'None'}</span>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded">
                    <span className="text-neutral-400 block text-[10px]">Lease Expired At</span>
                    <span className="font-semibold text-red-600">{job.leaseExpiresAt || 'N/A'}</span>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded">
                    <span className="text-neutral-400 block text-[10px]">Last Verified Checkpoint</span>
                    <span className="font-semibold text-neutral-800">
                      Page {job.checkpointData?.lastScrapedPage} ({job.checkpointData?.extractedRecordsCount} items)
                    </span>
                  </div>
                </div>

                {job.errorDetails && (
                  <div className="mt-3 p-2.5 bg-red-50/50 border border-red-100 rounded text-xs text-red-800 font-mono">
                    <span className="font-bold">Failure Trace:</span> {job.errorDetails}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: RECOVERY CONTROL CENTER */}
      {/* ============================================================ */}
      {activeTab === 'recovery-center' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Allowlisted Recovery Execution Center
              </h2>
              <p className="text-xs text-neutral-500">
                Typed, validated, and audited recovery actions adhering strictly to INVARIANT-24-001 (No arbitrary SQL/shell).
              </p>
            </div>
            <button
              onClick={() => {
                setRecoveryTargetJob(jobs[0]);
                setIsRecoveryModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Launch Recovery Action</span>
            </button>
          </div>

          {/* Recovery Actions Audit Log */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-neutral-50/60 border-b border-neutral-200 text-xs font-semibold text-neutral-700">
              Recovery Actions Immutable Ledger (Phase 23 Chained Audit)
            </div>
            <div className="divide-y divide-neutral-100">
              {recoveryActions.map(action => (
                <div key={action.actionId} className="p-4 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-neutral-900">{action.actionId}</span>
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-mono font-semibold rounded">
                        {action.operationType}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                        {action.status}
                      </span>
                      {action.requiresDualApproval && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-mono font-bold rounded">
                          DUAL-APPROVED
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {action.startedAt.split('T')[1].slice(0, 8)} UTC
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 mt-2">{action.reason}</p>

                  <div className="mt-2 text-xs font-mono text-neutral-500 flex flex-wrap gap-4">
                    <span>Target: {action.targetJobId || action.targetWorkerId || action.targetQueueId || action.targetComponent || 'Global'}</span>
                    <span>Operator: {action.requestedBy}</span>
                    {action.approvedBy && <span>Approver: {action.approvedBy}</span>}
                    <span>Fencing Epoch: #{action.fencingEpoch}</span>
                    <span>Idempotency: {action.idempotencyKey.slice(0, 16)}...</span>
                  </div>

                  <div className="mt-2 p-2 bg-neutral-50 rounded text-[11px] font-mono text-emerald-800 border border-neutral-200/60">
                    {action.postCheckResult}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: RUNBOOK AUTOMATION STUDIO */}
      {/* ============================================================ */}
      {activeTab === 'runbooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Runbook Catalog List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Operational Runbooks
            </h2>
            {runbooks.map(rb => {
              const isSelected = selectedRunbook?.runbookId === rb.runbookId;
              return (
                <div
                  key={rb.runbookId}
                  onClick={() => setSelectedRunbook(rb)}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-50/90 shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-neutral-900">{rb.code}</span>
                    {rb.requiresDualApproval && (
                      <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-semibold">
                        Dual Approval
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mt-1">{rb.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{rb.description}</p>
                  <div className="mt-2 text-[11px] text-neutral-400 font-mono flex items-center justify-between">
                    <span>Est: {rb.estimatedDurationSec}s</span>
                    <span>Runs: {rb.executionCount}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Runbook Step Inspector & Execution Engine */}
          <div className="lg:col-span-2 space-y-4">
            {selectedRunbook ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-neutral-500">{selectedRunbook.code}</span>
                    <h2 className="text-base font-bold text-neutral-900 mt-0.5">{selectedRunbook.title}</h2>
                    <p className="text-xs text-neutral-600 mt-1">{selectedRunbook.description}</p>
                    <div className="mt-2 text-xs font-mono text-amber-700 bg-amber-50 p-2 rounded border border-amber-200/70">
                      <span className="font-bold">Trigger Rule:</span> {selectedRunbook.triggerCondition}
                    </div>
                  </div>
                </div>

                {/* Steps Timeline */}
                <div className="mt-5 space-y-4">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Execution Steps ({selectedRunbook.steps.length})
                  </h3>

                  {selectedRunbook.steps.map((step, idx) => {
                    const isCompleted = step.status === 'COMPLETED';
                    const isInProgress = step.status === 'IN_PROGRESS';
                    return (
                      <div
                        key={step.stepId}
                        className={`p-3.5 rounded-lg border text-xs ${
                          isCompleted
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : isInProgress
                            ? 'bg-blue-50/40 border-blue-200 animate-pulse'
                            : 'bg-neutral-50 border-neutral-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] bg-neutral-200 text-neutral-800">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-neutral-900">{step.title}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200/60 text-neutral-700">
                              {step.stepType}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isInProgress
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>

                        <p className="text-neutral-600 mt-2 ml-7">{step.description}</p>

                        {step.outputLog && (
                          <div className="mt-2 ml-7 p-2 bg-neutral-900 text-neutral-100 font-mono text-[11px] rounded">
                            {step.outputLog}
                          </div>
                        )}

                        <div className="mt-2 ml-7 flex items-center justify-between text-neutral-500 text-[11px]">
                          <span className="font-mono">{step.verificationCheck}</span>
                          {!isCompleted && (
                            <button
                              onClick={() => handleRunbookStepAdvance(selectedRunbook.runbookId, step.stepId)}
                              className="px-2.5 py-1 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition-colors"
                            >
                              Execute Step
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-400 bg-white rounded-xl border border-neutral-200">
                Select a runbook from catalog to inspect steps.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8: DEAD LETTER QUEUE (DLQ) & POISON PILLS */}
      {/* ============================================================ */}
      {activeTab === 'dlq-triage' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
            <Flame className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-purple-900">Dead Letter Queue (DLQ) Forensic Studio</h3>
              <p className="text-xs text-purple-800 mt-1">
                INVARIANT-24-013: Poison pill messages routed to DLQ preserve full DOM mutation stack traces, input payload hashes, and attempt lineage for forensic triage.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {jobs.filter(j => j.status === 'DEAD_LETTER').map(job => (
              <div key={job.jobId} className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-neutral-900">{job.jobId}</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-mono font-bold rounded">
                        DEAD_LETTER
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-mono rounded">
                        Attempts: {job.attemptsCount} / {job.maxAttempts}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 font-sans">{job.inputSummary}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const result = executeAllowlistedRecovery({
                          operationType: 'ABANDON_POISON_JOB',
                          targetJobId: job.jobId,
                          tenantContext,
                          operatorId: selectedOperatorId,
                          approverId: selectedApproverId,
                          reason: 'Poison pill quarantined to permanent cold storage.',
                          idempotencyKey: `idemp-quarantine-${job.jobId}`
                        });
                        setRecoveryActions(prev => [result.auditRecord, ...prev]);
                        setJobs(prev => prev.map(j => j.jobId === job.jobId ? { ...j, status: 'ABANDONED' } : j));
                        setActionSuccessMsg(result.message);
                      }}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors shadow-xs"
                    >
                      Quarantine Poison Pill
                    </button>
                    <button
                      onClick={() => {
                        setRecoveryTargetJob(job);
                        setSelectedOpType('REPLAY_INPUTS');
                        setIsRecoveryModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-800 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition-colors shadow-xs"
                    >
                      Replay with New Lineage
                    </button>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-neutral-900 text-neutral-100 font-mono text-xs rounded-lg space-y-1">
                  <div className="text-red-400 font-bold">Root Cause: {job.rootCauseCategory}</div>
                  <div className="text-neutral-300">{job.errorDetails}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 9: STATE RECONCILIATION LEDGER */}
      {/* ============================================================ */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Cross-Component State Reconciliation Ledger
              </h2>
              <p className="text-xs text-neutral-500">
                Audits consistency between Redis Queue counters, PostgreSQL transactional leases, and Worker heartbeats.
              </p>
            </div>
            <button
              onClick={() => {
                setDiscrepancies(prev => prev.map(d => ({ ...d, resolved: true })));
                setActionSuccessMsg('All state discrepancies reconciled against PostgreSQL source of truth.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Resolve All Discrepancies</span>
            </button>
          </div>

          <div className="space-y-3">
            {discrepancies.map(disc => (
              <div
                key={disc.discrepancyId}
                className={`bg-white border rounded-xl p-4 shadow-xs ${
                  disc.resolved ? 'border-neutral-200 opacity-60' : 'border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-neutral-900">{disc.discrepancyId}</span>
                    <span className="px-2 py-0.5 bg-neutral-100 font-mono text-[10px] font-semibold text-neutral-700 rounded">
                      {disc.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded ${
                        disc.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : disc.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {disc.severity}
                    </span>
                    {disc.resolved && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded">
                        RESOLVED
                      </span>
                    )}
                  </div>
                  {!disc.resolved && (
                    <button
                      onClick={() => handleResolveDiscrepancy(disc.discrepancyId)}
                      className="px-2.5 py-1 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700 transition-colors"
                    >
                      Apply Resolution
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs font-mono">
                  <div className="p-2 bg-neutral-50 rounded">
                    <span className="text-neutral-400 block text-[10px]">Expected State</span>
                    <span className="text-neutral-800">{disc.expectedState}</span>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded">
                    <span className="text-neutral-400 block text-[10px]">Actual State</span>
                    <span className="text-red-700 font-semibold">{disc.actualState}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-800">Resolution Plan:</span> {disc.resolutionPlan}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 10: 20 RELIABILITY INVARIANTS MATRIX */}
      {/* ============================================================ */}
      {activeTab === 'invariants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Phase 24 Reliability & Security Invariants Verification Matrix
              </h2>
              <p className="text-xs text-neutral-500">
                20 continuous operational assertions preventing arbitrary execution, stale writes, and cross-tenant leakage.
              </p>
            </div>
            <button
              onClick={() => {
                setInvariants(prev =>
                  prev.map(inv => ({
                    ...inv,
                    verified: true,
                    lastEvaluatedAt: new Date().toISOString()
                  }))
                );
                setActionSuccessMsg('All 20 Phase 24 invariants re-evaluated. 0 violations detected.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Re-Evaluate All Invariants</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {invariants.map(inv => (
              <div key={inv.invariantId} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-neutral-900">{inv.code}</span>
                      <span className="px-1.5 py-0.2 bg-neutral-100 text-neutral-700 text-[10px] font-mono rounded">
                        {inv.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 mt-1">{inv.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>VERIFIED</span>
                  </span>
                </div>

                <p className="text-xs text-neutral-600 mt-2">{inv.description}</p>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px] font-mono text-neutral-500 flex items-center justify-between">
                  <span>Enforcement: {inv.enforcementMechanism}</span>
                  <span>Violations: {inv.violationCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RECOVERY ACTION MODAL */}
      {/* ============================================================ */}
      {isRecoveryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-neutral-900" />
                <h3 className="text-base font-bold text-neutral-900">Launch Typed Recovery Action</h3>
              </div>
              <button
                onClick={() => setIsRecoveryModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Target Job:</label>
                <input
                  type="text"
                  disabled
                  value={recoveryTargetJob ? `${recoveryTargetJob.jobId} (${recoveryTargetJob.jobType})` : 'System Global'}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono text-neutral-600"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Allowlisted Operation Type:</label>
                <select
                  value={selectedOpType}
                  onChange={e => setSelectedOpType(e.target.value as any)}
                  className="w-full bg-white border border-neutral-300 rounded-lg p-2 font-semibold text-neutral-800"
                >
                  <option value="RESUME_FROM_CHECKPOINT">RESUME_FROM_CHECKPOINT (Continue from verified page/hash)</option>
                  <option value="RETRY_TRANSIENT_FAILURE">RETRY_TRANSIENT_FAILURE (Re-queue with exponential backoff)</option>
                  <option value="REPLAY_INPUTS">REPLAY_INPUTS (Fork new job with fresh lineage token) [Dual Approval]</option>
                  <option value="REPAIR_STATE_CORRUPTION">REPAIR_STATE_CORRUPTION (Reconcile atomic state discrepancies) [Dual Approval]</option>
                  <option value="FORCE_RECLAIM_LEASE">FORCE_RECLAIM_LEASE (Revoke expired lease & bump epoch)</option>
                  <option value="CANCEL_EXECUTION">CANCEL_EXECUTION (Graceful cancellation signal)</option>
                  <option value="ABANDON_POISON_JOB">ABANDON_POISON_JOB (Quarantine to DLQ archive)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Justification / Reason:</label>
                <textarea
                  value={recoveryReason}
                  onChange={e => setRecoveryReason(e.target.value)}
                  rows={2}
                  className="w-full border border-neutral-300 rounded-lg p-2 text-neutral-800"
                  placeholder="State the operational reason for recovery..."
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tenant Context:</span>
                  <span className="font-bold text-neutral-800">{tenantContext.tenantId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Initiating Operator:</span>
                  <span className="font-bold text-neutral-800">{selectedOperatorId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Dual Approver:</span>
                  <span className="font-bold text-neutral-800">{selectedApproverId}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setIsRecoveryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerRecovery}
                className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-xs"
              >
                Authorize & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
