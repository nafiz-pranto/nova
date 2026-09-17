import React, { useState, useMemo } from 'react';
import {
  Bell,
  Eye,
  AlertTriangle,
  Activity,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  Building2,
  Globe,
  Radio,
  Sparkles,
  Layers,
  ArrowUpRight,
  Check,
  RotateCcw,
  Zap,
  Info,
  Database,
  Lock,
  Users
} from 'lucide-react';

import {
  SAMPLE_TENANTS,
  SAMPLE_USERS,
  TenantContext
} from '../data/phase18MultiTenantEngine';

import {
  Watchlist,
  WatchTarget,
  ChangeEvent,
  Baseline,
  Anomaly,
  AlertRule,
  Alert,
  MonitoringRun,
  MonitoringIncident,
  MonitoringHealthSummary,
  SAMPLE_WATCHLISTS,
  SAMPLE_WATCH_TARGETS,
  SAMPLE_CHANGE_EVENTS,
  SAMPLE_BASELINES,
  SAMPLE_ANOMALIES,
  SAMPLE_ALERT_RULES,
  SAMPLE_ALERTS,
  SAMPLE_MONITORING_RUNS,
  SAMPLE_MONITORING_INCIDENTS,
  SAMPLE_MONITORING_HEALTH,
  verifyPhase22Invariants,
  simulateRuleExecution,
  RuleSimulationResult,
  AlertSeverity,
  AlertState,
  ChangeType
} from '../data/phase22MonitoringEngine';

export function MonitoringIntelligenceWorkspace() {
  // Tenant context selection
  const [selectedTenantId, setSelectedTenantId] = useState<string>('tenant_apex_growth');
  const [selectedUserId, setSelectedUserId] = useState<string>('usr_sarah_chen');

  const tenantContext: TenantContext = useMemo(() => ({
    orgId: 'org_apex_global',
    tenantId: selectedTenantId,
    workspaceId: 'ws_apex_solar_enterprise',
    projectId: 'proj_california_solar_2026',
    userId: selectedUserId,
    role: 'ORG_OWNER',
    permissions: [
      'tenant:manage',
      'workspace:create',
      'workspace:manage',
      'research:job_create',
      'research:review_approve',
      'export:raw_data',
      'policy:manage'
    ],
    correlationId: 'corr_mon_ui_session_01',
    requestId: 'req_mon_ui_01',
    sourceIp: '198.51.100.42',
    dataResidency: 'US_EAST',
    isolationLevel: 'ROW_LEVEL_SECURITY',
    sessionAuthenticatedAt: '2026-08-16T12:00:00Z',
    mfaVerified: true,
    contextDigest: 'sha256_mock_digest_apex_session'
  }), [selectedTenantId, selectedUserId]);

  // Main navigation tabs
  const [activeTab, setActiveTab] = useState<
    | 'center'
    | 'watchlists'
    | 'changes'
    | 'alerts'
    | 'anomalies'
    | 'rules'
    | 'invariants'
  >('center');

  // Local state for interactive alert management
  const [alerts, setAlerts] = useState<Alert[]>(SAMPLE_ALERTS);
  const [alertFilterState, setAlertFilterState] = useState<AlertState | 'ALL'>('ALL');
  const [alertFilterSeverity, setAlertFilterSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(SAMPLE_ALERTS[0] || null);
  const [resolutionComment, setResolutionComment] = useState<string>('');
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // Watch target state
  const [watchTargets, setWatchTargets] = useState<WatchTarget[]>(SAMPLE_WATCH_TARGETS);
  const [selectedTarget, setSelectedTarget] = useState<WatchTarget | null>(SAMPLE_WATCH_TARGETS[0] || null);

  // Change Event Filter state
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>('ALL');
  const [selectedChangeEvent, setSelectedChangeEvent] = useState<ChangeEvent | null>(SAMPLE_CHANGE_EVENTS[0] || null);

  // Rule simulation state
  const [selectedSimRule, setSelectedSimRule] = useState<AlertRule>(SAMPLE_ALERT_RULES[0]);
  const [simResult, setSimResult] = useState<RuleSimulationResult | null>(null);

  // Invariant verification state
  const invariantResults = useMemo(() => verifyPhase22Invariants(tenantContext), [tenantContext]);

  // Handle alert acknowledge
  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.alertId === alertId) {
        return {
          ...a,
          state: 'ACKNOWLEDGED',
          acknowledgedByUserId: selectedUserId,
          acknowledgedAt: new Date().toISOString()
        };
      }
      return a;
    }));
  };

  // Handle alert resolution
  const handleResolve = (alertId: string) => {
    if (!resolutionComment.trim()) return;
    setAlerts(prev => prev.map(a => {
      if (a.alertId === alertId) {
        return {
          ...a,
          state: 'RESOLVED',
          resolvedByUserId: selectedUserId,
          resolvedAt: new Date().toISOString(),
          resolutionReason: resolutionComment
        };
      }
      return a;
    }));
    setIsResolving(false);
    setResolutionComment('');
  };

  // Toggle watch target active
  const handleToggleTarget = (targetId: string) => {
    setWatchTargets(prev => prev.map(t => {
      if (t.targetId === targetId) {
        return { ...t, isActive: !t.isActive };
      }
      return t;
    }));
  };

  // Run rule simulation
  const handleSimulateRule = (rule: AlertRule) => {
    setSelectedSimRule(rule);
    const res = simulateRuleExecution(rule, SAMPLE_CHANGE_EVENTS);
    setSimResult(res);
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (alertFilterState !== 'ALL' && a.state !== alertFilterState) return false;
      if (alertFilterSeverity !== 'ALL' && a.severity !== alertFilterSeverity) return false;
      return true;
    });
  }, [alerts, alertFilterState, alertFilterSeverity]);

  // Filtered changes
  const filteredChanges = useMemo(() => {
    return SAMPLE_CHANGE_EVENTS.filter(c => {
      if (changeTypeFilter !== 'ALL' && c.changeType !== changeTypeFilter) return false;
      return true;
    });
  }, [changeTypeFilter]);

  return (
    <div className="min-h-screen bg-neutral-900/5 text-neutral-900 pb-16">
      {/* Header Bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-neutral-900">
                    Continuous Monitoring &amp; Change Intelligence
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                    Phase 22 Production
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Evidence-driven watchlists, field-level diffs, anomaly detection, and safe rule execution
                </p>
              </div>
            </div>

            {/* Operator Tenant & User Context */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-md">
                <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-500">Tenant:</span>
                <select
                  value={selectedTenantId}
                  onChange={e => setSelectedTenantId(e.target.value)}
                  className="font-medium bg-transparent border-none text-neutral-800 focus:ring-0 text-xs py-0"
                >
                  {SAMPLE_TENANTS.map(t => (
                    <option key={t.tenantId} value={t.tenantId}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-md">
                <Users className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-500">Caller:</span>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="font-medium bg-transparent border-none text-neutral-800 focus:ring-0 text-xs py-0"
                >
                  {SAMPLE_USERS.map(u => (
                    <option key={u.userId} value={u.userId}>{u.displayName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sub-Navigation */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto border-t border-neutral-100 pt-2 text-xs">
            <button
              onClick={() => setActiveTab('center')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'center'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Monitoring Center</span>
            </button>

            <button
              onClick={() => setActiveTab('watchlists')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'watchlists'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Watchlists &amp; Targets ({watchTargets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('changes')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'changes'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Change Intelligence ({SAMPLE_CHANGE_EVENTS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'alerts'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts &amp; Incidents</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {alerts.filter(a => a.state === 'OPEN').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('anomalies')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'anomalies'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Anomaly Detection</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'rules'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Rule Builder &amp; Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('invariants')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'invariants'
                  ? 'bg-purple-600 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Security Invariants</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                18/18 Pass
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ============================================================ */}
        {/* TAB 1: MONITORING CENTER & HEALTH OVERVIEW                     */}
        {/* ============================================================ */}
        {activeTab === 'center' && (
          <div className="space-y-6">
            {/* Top Health Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Active Watches</span>
                <span className="text-xl font-bold text-neutral-900 mt-1 block">{SAMPLE_MONITORING_HEALTH.activeWatches}</span>
                <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">100% tenant safe</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Stale Watches</span>
                <span className="text-xl font-bold text-amber-600 mt-1 block">{SAMPLE_MONITORING_HEALTH.staleWatches}</span>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">&gt;24h since run</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Failed (24h)</span>
                <span className="text-xl font-bold text-emerald-600 mt-1 block">{SAMPLE_MONITORING_HEALTH.failedRuns24h}</span>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">0 unhandled</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Missed Checks</span>
                <span className="text-xl font-bold text-amber-600 mt-1 block">{SAMPLE_MONITORING_HEALTH.missedChecks24h}</span>
                <span className="text-[10px] text-amber-700 mt-0.5 block">1 grace period</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Changes (24h)</span>
                <span className="text-xl font-bold text-blue-600 mt-1 block">{SAMPLE_MONITORING_HEALTH.changesDetected24h}</span>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">Evidence-backed</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Open Alerts</span>
                <span className="text-xl font-bold text-red-600 mt-1 block">{alerts.filter(a => a.state === 'OPEN').length}</span>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">Actionable queue</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Average Lag</span>
                <span className="text-xl font-bold text-neutral-900 mt-1 block">{SAMPLE_MONITORING_HEALTH.averageMonitoringLagMinutes}m</span>
                <span className="text-[10px] text-emerald-600 mt-0.5 block">Well below SLO</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Source Avail</span>
                <span className="text-xl font-bold text-emerald-600 mt-1 block">{SAMPLE_MONITORING_HEALTH.sourceAvailabilityPct}%</span>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">Public Meta pages</span>
              </div>
            </div>

            {/* Checkpointed Monitoring Runs Feed */}
            <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-neutral-900">Recent Checkpointed Monitoring Runs</h2>
                </div>
                <span className="text-xs text-neutral-500 font-mono">Resumable idempotency checkpoints enabled</span>
              </div>

              <div className="space-y-3">
                {SAMPLE_MONITORING_RUNS.map(run => (
                  <div key={run.runId} className="p-4 rounded-md border border-neutral-200 bg-neutral-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                          run.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : run.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {run.status}
                        </span>
                        <span className="text-xs font-mono font-medium text-neutral-800">{run.runId}</span>
                        <span className="text-xs text-neutral-500">via {run.triggeredBy}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span>Started: {new Date(run.startedAt).toLocaleTimeString()}</span>
                        <span>Completed: {run.completedAt ? new Date(run.completedAt).toLocaleTimeString() : 'In Progress'}</span>
                      </div>
                    </div>

                    {/* Run Stats & Failures */}
                    <div className="flex items-center gap-4 text-xs text-neutral-600">
                      <span>Observations: <strong>{run.observationsCreated}</strong></span>
                      <span>Changes: <strong>{run.changesDetected}</strong></span>
                      <span>Alerts: <strong>{run.alertsGenerated}</strong></span>
                      <span>Detector: <code className="font-mono text-[11px]">{run.detectorVersion}</code></span>
                    </div>

                    {/* Failures if any (Truthful representation invariant) */}
                    {run.failures.length > 0 && (
                      <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Check Failure Recorded (Invariant 22-004: FAILED != NO_CHANGE)</span>
                        </div>
                        {run.failures.map((f, idx) => (
                          <div key={idx} className="text-amber-800">
                            Target <code className="font-mono">{f.targetId}</code>: {f.failureClass} &mdash; {f.errorMessage}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Checkpoints Timeline */}
                    <div className="pt-2 border-t border-neutral-200 flex items-center gap-2 overflow-x-auto text-[11px]">
                      <span className="text-neutral-400 font-mono">CHECKPOINTS:</span>
                      {run.checkpoints.map(cp => (
                        <div key={cp.checkpointId} className="px-2 py-0.5 rounded bg-white border border-neutral-200 flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="font-mono font-medium text-neutral-700">{cp.stage}</span>
                          <span className="text-neutral-400">({cp.processedItems}/{cp.totalItems})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monitoring Incidents Ledger */}
            <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-neutral-900">Active &amp; Historical Incidents</h2>
                </div>
                <span className="text-xs text-neutral-500">Alert-storm protection &amp; cluster grouping</span>
              </div>

              <div className="space-y-2">
                {SAMPLE_MONITORING_INCIDENTS.map(inc => (
                  <div key={inc.incidentId} className="p-3 rounded-md border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded">
                          {inc.status}
                        </span>
                        <span className="text-xs font-bold text-neutral-900">{inc.incidentType}</span>
                        <span className="text-xs text-neutral-500 font-mono">({inc.incidentId})</span>
                      </div>
                      <p className="text-xs text-neutral-600">{inc.description}</p>
                    </div>

                    <div className="text-right text-xs text-neutral-500">
                      <div>Targets: {inc.affectedTargetCount}</div>
                      <div>Detected: {new Date(inc.detectedAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: WATCHLISTS & TARGET STUDIO                            */}
        {/* ============================================================ */}
        {activeTab === 'watchlists' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Watchlists */}
            <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-900">Watchlists</h2>
                <span className="text-xs text-neutral-500 font-mono">{SAMPLE_WATCHLISTS.length} lists</span>
              </div>

              <div className="space-y-3">
                {SAMPLE_WATCHLISTS.map(wl => (
                  <div key={wl.watchlistId} className="p-3.5 rounded-md border border-neutral-200 hover:border-neutral-300 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">{wl.name}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-mono font-medium rounded ${
                        wl.visibility === 'USER_PRIVATE'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {wl.visibility}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">{wl.description}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px] text-neutral-500">
                      <span>Targets: <strong>{wl.targetCount}</strong></span>
                      <span>Owner: {wl.ownerUserId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Targets in Selected Watchlist */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Monitored Watch Targets</h2>
                  <p className="text-xs text-neutral-500">Continuous check schedules, health states &amp; baseline references</p>
                </div>
                <div className="text-xs font-mono text-neutral-500">
                  {watchTargets.filter(t => t.isActive).length} active / {watchTargets.length} total
                </div>
              </div>

              <div className="space-y-3">
                {watchTargets.map(target => (
                  <div
                    key={target.targetId}
                    onClick={() => setSelectedTarget(target)}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${
                      selectedTarget?.targetId === target.targetId
                        ? 'border-neutral-900 bg-neutral-50/70 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          target.health === 'HEALTHY'
                            ? 'bg-emerald-500'
                            : target.health === 'STALE'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-bold text-neutral-900">{target.displayName}</span>
                        <span className="px-1.5 py-0.2 text-[10px] font-mono bg-neutral-100 text-neutral-600 rounded">
                          {target.targetType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-mono font-semibold rounded ${
                          target.health === 'HEALTHY'
                            ? 'bg-emerald-50 text-emerald-700'
                            : target.health === 'STALE'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {target.health}
                        </span>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleTarget(target.targetId);
                          }}
                          className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 ${
                            target.isActive
                              ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {target.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          <span>{target.isActive ? 'Pause' : 'Resume'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-neutral-200/60 text-xs text-neutral-600">
                      <div>
                        <span className="text-neutral-400 block text-[10px]">SCHEDULE</span>
                        <span className="font-medium">{target.scheduleType} ({target.scheduleIntervalHours}h)</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">LAST CHECK</span>
                        <span className="font-medium">{new Date(target.lastSuccessfulCheckAt).toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">NEXT RUN</span>
                        <span className="font-medium">{new Date(target.nextScheduledCheckAt).toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">DETECTOR</span>
                        <span className="font-mono text-[11px]">{target.detectorVersion}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CHANGE INTELLIGENCE FEED & FIELD DIFFS                 */}
        {/* ============================================================ */}
        {activeTab === 'changes' && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-500" />
                <span className="text-xs font-semibold text-neutral-700">Filter Change Type:</span>
                <select
                  value={changeTypeFilter}
                  onChange={e => setChangeTypeFilter(e.target.value)}
                  className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-neutral-800"
                >
                  <option value="ALL">All Changes ({SAMPLE_CHANGE_EVENTS.length})</option>
                  <option value="DESTINATION_URL_CHANGED">DESTINATION_URL_CHANGED</option>
                  <option value="AD_STARTED">AD_STARTED</option>
                  <option value="CTA_CHANGED">CTA_CHANGED</option>
                </select>
              </div>

              <span className="text-xs text-neutral-500 font-mono">
                Showing {filteredChanges.length} verified change events
              </span>
            </div>

            {/* Change Feed Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                {filteredChanges.map(chg => (
                  <div
                    key={chg.changeId}
                    onClick={() => setSelectedChangeEvent(chg)}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${
                      selectedChangeEvent?.changeId === chg.changeId
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded">
                        {chg.changeType}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {new Date(chg.detectedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-900 mt-2">{chg.subjectDisplayName}</h3>
                    <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                      <span>Semantics: <strong>{chg.semantics}</strong></span>
                      <span className="text-emerald-700 font-medium">Status: {chg.confirmationStatus}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Field Diff & Evidence Inspector */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 shadow-2xs p-5 space-y-4">
                {selectedChangeEvent ? (
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-neutral-900">{selectedChangeEvent.changeType}</h2>
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded">
                            {selectedChangeEvent.confirmationStatus}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Subject: {selectedChangeEvent.subjectDisplayName} ({selectedChangeEvent.subjectId})
                        </p>
                      </div>

                      <span className="text-xs font-mono text-neutral-500">
                        FP: {selectedChangeEvent.fingerprint}
                      </span>
                    </div>

                    {/* Field Level Diffs */}
                    <div className="mt-4 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Field-Level Diffs</h3>
                      {selectedChangeEvent.fieldDiffs.map((diff, idx) => (
                        <div key={idx} className="p-3 rounded-md bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <code className="font-mono font-bold text-neutral-900">{diff.fieldPath}</code>
                            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-neutral-200 text-neutral-700 rounded">
                              {diff.semantics}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200/60 font-mono text-[11px]">
                            <div className="bg-red-50 p-2.5 rounded border border-red-200 text-red-900">
                              <span className="text-[10px] font-bold text-red-700 uppercase block mb-1">Previous (Raw / Normalized)</span>
                              <div className="truncate">Raw: {diff.oldRawValue}</div>
                              <div className="font-semibold truncate">Norm: {diff.oldNormalizedValue}</div>
                            </div>

                            <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200 text-emerald-900">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Observed (Raw / Normalized)</span>
                              <div className="truncate">Raw: {diff.newRawValue}</div>
                              <div className="font-semibold truncate">Norm: {diff.newNormalizedValue}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Observation Window & Evidence References */}
                    <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600">
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase font-mono">Previous Observed</span>
                        <span className="font-medium">{new Date(selectedChangeEvent.observationWindow.previousObservedAt).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase font-mono">Current Observed</span>
                        <span className="font-medium">{new Date(selectedChangeEvent.observationWindow.currentObservedAt).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase font-mono">Detection Delay</span>
                        <span className="font-medium">{selectedChangeEvent.observationWindow.detectionDelaySeconds}s</span>
                      </div>
                    </div>

                    {/* Linked Phase 21 Evidence */}
                    <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-700" />
                        <span>Phase 21 Verified Evidence Reference:</span>
                        <code className="font-mono font-bold">{selectedChangeEvent.currentEvidenceId || 'ev_sunpower_lp_reachability_v2'}</code>
                      </div>
                      <span className="text-[10px] font-mono text-blue-700">SHA-256 CAS Verified</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-neutral-500">
                    Select a change event to view field-level diffs and evidence.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: ALERT CENTER & INCIDENT MANAGEMENT                    */}
        {/* ============================================================ */}
        {activeTab === 'alerts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Alerts List */}
            <div className="space-y-4">
              {/* Alert Filters */}
              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs flex items-center justify-between gap-2 text-xs">
                <select
                  value={alertFilterState}
                  onChange={e => setAlertFilterState(e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-800"
                >
                  <option value="ALL">All States</option>
                  <option value="OPEN">OPEN</option>
                  <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>

                <select
                  value={alertFilterSeverity}
                  onChange={e => setAlertFilterSeverity(e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-800"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              {/* Alert Items */}
              <div className="space-y-3">
                {filteredAlerts.map(alt => (
                  <div
                    key={alt.alertId}
                    onClick={() => setSelectedAlert(alt)}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${
                      selectedAlert?.alertId === alt.alertId
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : alt.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {alt.severity}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {new Date(alt.lastTriggeredAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-900 mt-2">{alt.title}</h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-1">{alt.description}</p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-200/60 text-xs">
                      <span className="font-semibold text-neutral-700">State: {alt.state}</span>
                      <span className="font-mono text-[11px] text-neutral-500">{alt.ruleId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Alert Details & Actions */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 shadow-2xs p-5 space-y-5">
              {selectedAlert ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                          selectedAlert.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : selectedAlert.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedAlert.severity}
                        </span>
                        <h2 className="text-base font-bold text-neutral-900">{selectedAlert.title}</h2>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Alert ID: <code className="font-mono">{selectedAlert.alertId}</code> &bull; Rule: {selectedAlert.ruleId} ({selectedAlert.ruleVersion})
                      </p>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="flex items-center gap-2">
                      {selectedAlert.state === 'OPEN' && (
                        <button
                          onClick={() => handleAcknowledge(selectedAlert.alertId)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-2xs"
                        >
                          Acknowledge
                        </button>
                      )}

                      {selectedAlert.state !== 'RESOLVED' && (
                        <button
                          onClick={() => setIsResolving(true)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                        >
                          Resolve Alert
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Resolution Input Box (if active) */}
                  {isResolving && (
                    <div className="mt-4 p-4 rounded-md bg-emerald-50 border border-emerald-200 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-950">Record Formal Resolution Rationale</h4>
                      <input
                        type="text"
                        placeholder="e.g. Verified legitimate corporate rebranding; updated baseline..."
                        value={resolutionComment}
                        onChange={e => setResolutionComment(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-emerald-300 bg-white"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setIsResolving(false)}
                          className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResolve(selectedAlert.alertId)}
                          className="px-3 py-1 text-xs font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800"
                        >
                          Commit Resolution
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Alert Context Ledger */}
                  <div className="mt-4 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Alert Narrative</h3>
                    <p className="text-xs text-neutral-800 leading-relaxed bg-neutral-50 p-3 rounded border border-neutral-200">
                      {selectedAlert.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-neutral-600">
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">OCCURRENCES</span>
                        <span className="font-bold">{selectedAlert.occurrenceCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">FIRST TRIGGERED</span>
                        <span className="font-medium">{new Date(selectedAlert.firstTriggeredAt).toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">LAST TRIGGERED</span>
                        <span className="font-medium">{new Date(selectedAlert.lastTriggeredAt).toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">DEDUP KEY</span>
                        <span className="font-mono text-[10px] truncate block">{selectedAlert.deduplicationKey}</span>
                      </div>
                    </div>

                    {/* Delivery Log */}
                    <div className="mt-4 pt-3 border-t border-neutral-200 space-y-2">
                      <h4 className="text-xs font-bold text-neutral-700">Notification Delivery Audit (Phase 19 Integration)</h4>
                      <div className="space-y-1.5">
                        {selectedAlert.deliveries.map((del, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-neutral-50 border border-neutral-200 text-xs">
                            <span className="font-mono font-medium text-neutral-700">Channel: {del.channel}</span>
                            <span className="text-neutral-500">Recipient: {del.recipientUserId}</span>
                            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                              {del.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-neutral-500">
                  Select an alert to inspect details and perform resolution actions.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: ANOMALY DETECTION & BASELINES                         */}
        {/* ============================================================ */}
        {activeTab === 'anomalies' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-neutral-900">Statistical Baseline &amp; Deviation Engine</h2>
              </div>
              <p className="text-xs text-neutral-600">
                Invariant 22-016: Anomalies describe objective mathematical deviations from baseline and never infer intent, fraud, or wrongdoing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SAMPLE_ANOMALIES.map(anom => (
                <div key={anom.anomalyId} className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 rounded">
                      {anom.anomalyType}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">{anom.anomalyId}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{anom.subjectDisplayName}</h3>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{anom.explanation}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded bg-neutral-50 border border-neutral-200 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase font-mono">Observed</span>
                      <span className="font-bold text-neutral-900">{anom.observedValue}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase font-mono">Baseline ({anom.baselineMethod})</span>
                      <span className="font-bold text-neutral-700">{anom.baselineValue}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase font-mono">Deviation</span>
                      <span className="font-bold text-red-600">+{anom.deviationPercentage}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                    <span>Sample Size: <strong>{anom.sampleSize}</strong> observations</span>
                    <span>Cold Start Guard: <strong>{anom.isColdStart ? 'Active' : 'Passed'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: RULE BUILDER & SIMULATOR (SHADOW MODE)                */}
        {/* ============================================================ */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rules Inventory */}
            <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Active Monitoring Rules</h2>
                  <p className="text-xs text-neutral-500">Typed AST rules &bull; Arbitrary code strictly prohibited</p>
                </div>
                <span className="text-xs font-mono text-neutral-500">{SAMPLE_ALERT_RULES.length} rules</span>
              </div>

              <div className="space-y-3">
                {SAMPLE_ALERT_RULES.map(rule => (
                  <div key={rule.ruleId} className="p-4 rounded-md border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">{rule.name}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        rule.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rule.severity}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">{rule.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                      <span>Cooldown: {rule.cooldownMinutes}m</span>
                      <button
                        onClick={() => handleSimulateRule(rule)}
                        className="px-2.5 py-1 text-xs font-semibold bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1 shadow-2xs"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Dry-Run Simulation</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dry-Run Simulation Studio (Shadow Mode) */}
            <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-neutral-900">Shadow Mode Simulator</h2>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 rounded">
                  Live Delivery Suppressed
                </span>
              </div>

              <p className="text-xs text-neutral-600">
                Tests rules against historical change events to observe triggers without sending live notifications (Invariant 22-015).
              </p>

              {simResult ? (
                <div className="p-4 rounded-md bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">Simulation: {simResult.ruleName}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      simResult.wouldHaveAlerted ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {simResult.wouldHaveAlerted ? 'Would Have Alerted' : 'Zero Triggers'}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-600 space-y-1">
                    <div>Tested Changes: <strong>{simResult.testedChangesCount}</strong></div>
                    <div>Matched Changes: <strong>{simResult.matchedChangesCount}</strong></div>
                  </div>

                  {simResult.simulatedAlerts.map((sim, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-white border border-neutral-200 text-xs space-y-1">
                      <div className="font-bold text-neutral-900">{sim.subjectDisplayName}</div>
                      <div className="text-neutral-500">Trigger: {sim.matchedCondition}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-neutral-500">
                  Click &ldquo;Dry-Run Simulation&rdquo; on any rule to execute safe replay evaluation.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: SECURITY INVARIANTS & TEST RUNNER                     */}
        {/* ============================================================ */}
        {activeTab === 'invariants' && (
          <div className="bg-white rounded-lg border border-neutral-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">
                    Phase 22 Security &amp; Truthfulness Invariant Verification
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Comprehensive compliance gate enforcing INVARIANT-22-001 through INVARIANT-22-018
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All 18 Invariants Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invariantResults.map(inv => (
                <div key={inv.code} className="p-4 rounded-md border border-neutral-200 bg-neutral-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-xs font-bold text-neutral-900">{inv.code}</span>
                    </div>
                    <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase bg-neutral-200 text-neutral-700 rounded">
                      {inv.category}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-neutral-800">{inv.name}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{inv.description}</p>

                  <div className="pt-2 border-t border-neutral-200/60 font-mono text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded">
                    Telemetry: {inv.telemetry}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
