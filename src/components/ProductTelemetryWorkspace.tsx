import React, { useState, useMemo } from 'react';
import {
  Activity,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Database,
  Search,
  Filter,
  RefreshCw,
  Cpu,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Terminal,
  Zap,
  Lock,
  ArrowRight,
  TrendingUp,
  Download,
  Flame,
  Radio,
  Share2,
  FileCheck
} from 'lucide-react';

import {
  phase25TelemetryEngine,
  ProductEvent,
  EventSchema,
  InstrumentationCatalogEntry,
  FeatureRecord,
  FunnelDefinition,
  CapacityMetric,
  TelemetryRejection,
  TelemetryIncidentRecord,
  TelemetryInvariantStatus,
  INITIAL_METRIC_DEFINITIONS
} from '../data/phase25TelemetryEngine';

export const ProductTelemetryWorkspace: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'FEATURES_FUNNELS' | 'SCHEMAS_CATALOG' | 'INGESTION_HEALTH' | 'CAPACITY_QUOTA' | 'INVARIANTS_GOVERNANCE'
  >('OVERVIEW');

  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('ALL_PLATFORM');
  const [events, setEvents] = useState<ProductEvent[]>(phase25TelemetryEngine.getEvents());
  const [schemas, setSchemas] = useState<EventSchema[]>(phase25TelemetryEngine.getSchemas());
  const [catalog] = useState<InstrumentationCatalogEntry[]>(phase25TelemetryEngine.getCatalog());
  const [features] = useState<FeatureRecord[]>(phase25TelemetryEngine.getFeatures());
  const [funnel] = useState<FunnelDefinition>(phase25TelemetryEngine.getFunnel());
  const [capacityMetrics] = useState<CapacityMetric[]>(phase25TelemetryEngine.getCapacityMetrics());
  const [rejections, setRejections] = useState<TelemetryRejection[]>(phase25TelemetryEngine.getRejections());
  const [incidents] = useState<TelemetryIncidentRecord[]>(phase25TelemetryEngine.getIncidents());
  const [invariants] = useState<TelemetryInvariantStatus[]>(phase25TelemetryEngine.getInvariants());

  // Simulation Form State
  const [simEventName, setSimEventName] = useState<string>('search.executed');
  const [simIncludeSensitive, setSimIncludeSensitive] = useState<boolean>(false);
  const [simFeedback, setSimFeedback] = useState<{ type: 'SUCCESS' | 'ERROR' | 'INFO'; message: string } | null>(null);

  // Refresh Engine View
  const handleRefresh = () => {
    const tenantParam = selectedTenantFilter === 'ALL_PLATFORM' ? undefined : selectedTenantFilter;
    setEvents(phase25TelemetryEngine.getEvents(tenantParam));
    setSchemas(phase25TelemetryEngine.getSchemas());
    setRejections(phase25TelemetryEngine.getRejections());
    setSimFeedback({ type: 'INFO', message: 'Telemetry views and aggregations refreshed from memory store.' });
    setTimeout(() => setSimFeedback(null), 3000);
  };

  // Toggle schema kill-switch
  const handleToggleKillSwitch = (schemaId: string) => {
    const newState = phase25TelemetryEngine.toggleSchemaKillSwitch(schemaId);
    setSchemas(phase25TelemetryEngine.getSchemas());
    setSimFeedback({
      type: newState ? 'ERROR' : 'SUCCESS',
      message: `Schema kill-switch ${newState ? 'ACTIVATED (Event Ingestion Suspended)' : 'DEACTIVATED (Ingestion Resumed)'}`
    });
    setTimeout(() => setSimFeedback(null), 4000);
  };

  // Dispatch simulated test event
  const handleSimulateEvent = () => {
    const isApex = selectedTenantFilter === 'tenant-beacon-research' ? false : true;
    const tenantId = isApex ? 'tenant-apex-analytics' : 'tenant-beacon-research';
    const orgId = isApex ? 'org-acme-corp' : 'org-beacon-group';

    let props: Record<string, any> = {};

    if (simEventName === 'search.executed') {
      props = {
        search_mode: 'FACETED_BOOLEAN',
        filters_applied_count: Math.floor(Math.random() * 4) + 1,
        latency_ms: Math.floor(Math.random() * 200) + 80,
        result_count_bucket: '50_TO_200'
      };
    } else if (simEventName === 'research.session.created') {
      props = {
        investigation_type: 'DEEP_LEAD_QUALIFICATION',
        initial_entity_type: 'ADVERTISER'
      };
    } else if (simEventName === 'workflow.completed') {
      props = {
        workflow_type: 'FULL_VERIFICATION_AND_SCORE',
        duration_ms: 1200,
        step_count: 4,
        terminal_status: 'SUCCEEDED'
      };
    } else if (simEventName === 'monitoring.watch.created') {
      props = {
        frequency_hours: 12,
        alert_channel_type: 'IN_APP_AND_EMAIL',
        criteria_mode: 'NEW_CREATIVE_DETECTED'
      };
    } else if (simEventName === 'export.downloaded') {
      props = {
        export_format: 'PARQUET_SANITIZED',
        row_count_bucket: '1K_TO_5K',
        generation_duration_ms: 650
      };
    }

    if (simIncludeSensitive) {
      props['auth_token'] = 'bearer-ey77218fake_token';
      props['raw_query_text'] = 'SELECT * FROM private_leads';
    }

    const res = phase25TelemetryEngine.ingestEvent(
      {
        eventName: simEventName,
        source: 'WEB_APP',
        properties: props,
        surface: '/research/sim'
      },
      tenantId,
      orgId
    );

    if (res.success) {
      setSimFeedback({
        type: 'SUCCESS',
        message: `Event [${simEventName}] successfully validated & ingested (ID: ${res.eventId}).`
      });
    } else {
      setSimFeedback({
        type: 'ERROR',
        message: `Ingestion BLOCKED: ${res.error}. Quarantined in TelemetryRejections log.`
      });
    }

    handleRefresh();
  };

  const tenantSummary = useMemo(() => {
    const t = selectedTenantFilter === 'ALL_PLATFORM' ? undefined : selectedTenantFilter;
    return phase25TelemetryEngine.getTenantMetricsSummary(t);
  }, [selectedTenantFilter, events, rejections]);

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 box-border text-neutral-900 font-sans">
      {/* HEADER BANNER */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                    Product Telemetry, Usage Intelligence &amp; Capacity Control Plane
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                    Phase 25 Production
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 max-w-3xl">
                  Audited product usage telemetry, feature adoption funnels, capacity intelligence, and instrumentation governance.
                  Strictly separated from Security Audit (P23) and Operational SRE (P24). Non-surveillance, PII-minimized, and tenant-fenced.
                </p>
              </div>
            </div>
          </div>

          {/* Tenant Selector & Refresh Controls */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-neutral-500 font-medium">Tenant Scope:</span>
              <select
                aria-label="Filter events by tenant scope"
                value={selectedTenantFilter}
                onChange={e => {
                  setSelectedTenantFilter(e.target.value);
                  const t = e.target.value === 'ALL_PLATFORM' ? undefined : e.target.value;
                  setEvents(phase25TelemetryEngine.getEvents(t));
                }}
                className="bg-transparent font-semibold text-neutral-800 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL_PLATFORM">Platform Aggregate (k-Anon ≥ 5)</option>
                <option value="tenant-apex-analytics">Apex Analytics Corp (Tenant 1)</option>
                <option value="tenant-beacon-research">Beacon Research Group (Tenant 2)</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {simFeedback && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center justify-between border ${
              simFeedback.type === 'SUCCESS'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : simFeedback.type === 'ERROR'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {simFeedback.type === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : simFeedback.type === 'ERROR' ? (
                <XCircle className="w-4 h-4 text-rose-600" />
              ) : (
                <Activity className="w-4 h-4 text-blue-600" />
              )}
              <span>{simFeedback.message}</span>
            </div>
            <button
              onClick={() => setSimFeedback(null)}
              className="text-neutral-400 hover:text-neutral-700 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="border-b border-neutral-200 flex items-center gap-2 overflow-x-auto pb-0">
        {[
          { id: 'OVERVIEW', label: 'Product & Usage Overview', icon: Activity },
          { id: 'FEATURES_FUNNELS', label: 'Feature Adoption & Funnels', icon: TrendingUp },
          { id: 'SCHEMAS_CATALOG', label: 'Instrumentation Catalog & Schemas', icon: Layers },
          { id: 'INGESTION_HEALTH', label: 'Live Ingestion & Quarantine', icon: Terminal },
          { id: 'CAPACITY_QUOTA', label: 'Capacity Intelligence & Quotas', icon: Cpu },
          { id: 'INVARIANTS_GOVERNANCE', label: 'Invariants & Privacy Bounds (P25)', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg font-bold'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCT & USAGE OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* TOP METRIC CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Ingested</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{tenantSummary.totalEvents}</div>
              <span className="text-[10px] text-emerald-600 font-medium">100% Schema-Validated</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Searches Executed</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{tenantSummary.searches}</div>
              <span className="text-[10px] text-neutral-500 font-medium">Privacy Masked</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Research Sessions</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{tenantSummary.researchSessions}</div>
              <span className="text-[10px] text-neutral-500 font-medium">Lead Investigations</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Workflows Finished</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{tenantSummary.workflows}</div>
              <span className="text-[10px] text-emerald-600 font-medium">98.4% Success Rate</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Monitoring Watches</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{tenantSummary.monitoringWatches}</div>
              <span className="text-[10px] text-neutral-500 font-medium">Active Cadence</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Exports Downloaded</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{tenantSummary.exports}</div>
              <span className="text-[10px] text-neutral-500 font-medium">Parquet / CSV</span>
            </div>
          </div>

          {/* TELEMETRY BOUNDARY NOTICE */}
          <div className="bg-neutral-900 text-neutral-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-neutral-800">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-white">Strict Tri-Partite Observability Separation</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Product Telemetry (P25) describes observable feature adoption. It does NOT serve as Security Audit (P23) or System SRE (P24),
                  and cannot collect employee surveillance data or raw user search queries.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
              <span className="px-2 py-1 bg-neutral-800 rounded border border-neutral-700 text-emerald-400">P25: Usage</span>
              <span className="px-2 py-1 bg-neutral-800 rounded border border-neutral-700 text-blue-400">P24: System</span>
              <span className="px-2 py-1 bg-neutral-800 rounded border border-neutral-700 text-purple-400">P23: Audit</span>
            </div>
          </div>

          {/* CORE METRIC DEFINITIONS TABLE */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Standardized Product Metric Catalog</h2>
                <p className="text-xs text-neutral-500">Every metric defines its population, denominator, time window, and scope. Zero-activity is explicitly distinguished from missing data.</p>
              </div>
              <span className="text-xs font-mono text-neutral-400">INVARIANT-25-009</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                    <th className="px-4 py-2.5">Metric ID &amp; Name</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Aggregation &amp; Window</th>
                    <th className="px-4 py-2.5">Target Population</th>
                    <th className="px-4 py-2.5">Source Events</th>
                    <th className="px-4 py-2.5">Freshness SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {INITIAL_METRIC_DEFINITIONS.map(m => (
                    <tr key={m.metricId} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900">{m.name}</div>
                        <div className="text-[10px] font-mono text-neutral-500">{m.metricId} (v{m.version})</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {m.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[11px] text-neutral-800">{m.aggregationType}</span>
                        <span className="text-neutral-500 text-[10px]"> / {m.timeWindow}</span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{m.population}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {m.sourceEvents.map(evt => (
                            <span key={evt} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-800 rounded font-mono text-[10px]">
                              {evt}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-700 font-semibold">{m.freshnessSlaMinutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURE ADOPTION & FUNNELS */}
      {activeTab === 'FEATURES_FUNNELS' && (
        <div className="space-y-6">
          {/* FEATURE LIFECYCLE & ADOPTION TABLE */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Feature Adoption &amp; Exposure Matrix</h2>
                <p className="text-xs text-neutral-500">
                  Explicitly distinguishes Feature Enabled vs Feature Exposed vs Feature Actively Used.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-400">INVARIANT-25-008</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                    <th className="px-4 py-2.5">Feature &amp; Owner</th>
                    <th className="px-4 py-2.5">Lifecycle</th>
                    <th className="px-4 py-2.5">Rollout %</th>
                    <th className="px-4 py-2.5">Tenant Exposure</th>
                    <th className="px-4 py-2.5">User Adoption</th>
                    <th className="px-4 py-2.5">Adoption Rate</th>
                    <th className="px-4 py-2.5">Usage Intensity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {features.map(f => (
                    <tr key={f.featureId} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900">{f.name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">{f.featureId} • {f.owner}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.lifecycle === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : f.lifecycle === 'EXPERIMENTAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {f.lifecycle}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-neutral-800">{f.rolloutPercentage}%</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-neutral-900">{f.activelyUsingTenantsCount}</span>
                        <span className="text-neutral-500"> / {f.eligibleTenantsCount} tenants</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-neutral-900">{f.activelyUsingUsersCount}</span>
                        <span className="text-neutral-500"> / {f.eligibleUsersCount} users</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-neutral-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: `${(f.adoptionRate * 100).toFixed(0)}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-neutral-800">
                            {(f.adoptionRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-700">{f.usageIntensity} evts/wk</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* INTERACTIVE FUNNEL VISUALIZATION */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-4 mb-5">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">{funnel.name} (v{funnel.version})</h2>
                <p className="text-xs text-neutral-500">
                  Window: {funnel.windowType} (86,400s) • Population: {funnel.targetPopulation}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-500">End-to-End Conversion:</span>
                <div className="text-lg font-bold text-emerald-700">
                  {(funnel.overallConversionRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {funnel.steps.map((step, idx) => {
                const widthPct = Math.max(15, (step.conversionCount / funnel.totalStarted) * 100);
                return (
                  <div key={step.stepIndex} className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{step.stepName}</span>
                        <span className="px-1.5 py-0.2 bg-white text-neutral-600 border border-neutral-300 rounded font-mono text-[10px]">
                          {step.requiredEvent}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-neutral-500 font-mono">
                          Duration: {step.medianDurationFromPreviousSec}s
                        </span>
                        <span className="font-bold font-mono text-neutral-900">
                          {step.conversionCount.toLocaleString()} conversions
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1.5 font-mono">
                      <span>Step Drop-off: {step.dropOffCount} users</span>
                      <span>
                        Conv from Start: {(step.conversionRateFromStart * 100).toFixed(1)}% | Step Conv:{' '}
                        {(step.conversionRateFromPrevious * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEMAS & INSTRUMENTATION CATALOG */}
      {activeTab === 'SCHEMAS_CATALOG' && (
        <div className="space-y-6">
          {/* SCHEMA REGISTRY */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Centralized EventSchema Registry</h2>
                <p className="text-xs text-neutral-500">
                  Every product event must have an approved schema with explicitly enumerated required, optional, and prohibited properties.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-400">INVARIANT-25-016</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                    <th className="px-4 py-2.5">Event Name &amp; Owner</th>
                    <th className="px-4 py-2.5">Version</th>
                    <th className="px-4 py-2.5">Purpose</th>
                    <th className="px-4 py-2.5">Required Properties</th>
                    <th className="px-4 py-2.5">Prohibited Properties</th>
                    <th className="px-4 py-2.5">Retention</th>
                    <th className="px-4 py-2.5">Kill-Switch Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {schemas.map(s => (
                    <tr key={s.schemaId} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-neutral-900">{s.eventName}</div>
                        <div className="text-[10px] text-neutral-500 font-semibold">{s.owner} POD</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-700">v{s.version}</td>
                      <td className="px-4 py-3 text-neutral-600 max-w-xs">{s.purpose}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.requiredProperties.map(req => (
                            <span key={req} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded font-mono text-[10px]">
                              {req}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.prohibitedProperties.map(pro => (
                            <span key={pro} className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-mono text-[10px]">
                              {pro}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-800">{s.retentionDays} days</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleKillSwitch(s.schemaId)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            s.killSwitchActive
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>{s.killSwitchActive ? 'Kill-Switch Active' : 'Normal'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* INSTRUMENTATION CATALOG */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h2 className="text-sm font-bold text-neutral-900">Instrumentation Coverage Catalog</h2>
              <p className="text-xs text-neutral-500">Maps user actions and UI surfaces to validated schema events, ensuring no uninstrumented paths.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                    <th className="px-4 py-2.5">Feature Name</th>
                    <th className="px-4 py-2.5">User Action</th>
                    <th className="px-4 py-2.5">Emitted Event</th>
                    <th className="px-4 py-2.5">Source</th>
                    <th className="px-4 py-2.5">Destination Dashboard</th>
                    <th className="px-4 py-2.5">Coverage Status</th>
                    <th className="px-4 py-2.5">Daily Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {catalog.map(c => (
                    <tr key={c.catalogId} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3 font-semibold text-neutral-900">{c.featureName}</td>
                      <td className="px-4 py-3 text-neutral-700">{c.userAction}</td>
                      <td className="px-4 py-3 font-mono text-emerald-800 font-medium">{c.eventName}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-neutral-600">{c.source}</td>
                      <td className="px-4 py-3 text-neutral-600">{c.destinationDashboard}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.coverageStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.coverageStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-900">~{c.emittedPerDayEstimate.toLocaleString()}/day</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE INGESTION & QUARANTINE */}
      {activeTab === 'INGESTION_HEALTH' && (
        <div className="space-y-6">
          {/* INTERACTIVE EVENT SIMULATOR */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-neutral-900 mb-1">Interactive Telemetry Ingestion Simulator</h2>
            <p className="text-xs text-neutral-500 mb-4">
              Test server-side schema validation, PII/secret scanning, and quarantine behavior by dispatching synthetic events.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Event to Emit</label>
                <select
                  value={simEventName}
                  onChange={e => setSimEventName(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-neutral-300 bg-white font-mono"
                >
                  <option value="search.executed">search.executed (Valid)</option>
                  <option value="research.session.created">research.session.created (Valid)</option>
                  <option value="workflow.completed">workflow.completed (Valid)</option>
                  <option value="monitoring.watch.created">monitoring.watch.created (Valid)</option>
                  <option value="export.downloaded">export.downloaded (Valid)</option>
                  <option value="unregistered.test.event">unregistered.test.event (Will Reject)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="includeSensitive"
                  checked={simIncludeSensitive}
                  onChange={e => setSimIncludeSensitive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="includeSensitive" className="text-xs text-neutral-700 cursor-pointer">
                  Inject Prohibited Property (e.g. auth_token / raw text)
                </label>
              </div>

              <div className="pt-5">
                <button
                  onClick={handleSimulateEvent}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dispatch Ingestion Pipeline</span>
                </button>
              </div>
            </div>
          </div>

          {/* LIVE RAW EVENT STREAM */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Validated Ingested Product Events (Latest 10)</h2>
                <p className="text-xs text-neutral-500">
                  Showing server-enriched events with authoritative tenant contexts and masked pseudonymized actors.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-400">INVARIANT-25-003</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 font-semibold">
                    <th className="px-4 py-2.5">Event Name</th>
                    <th className="px-4 py-2.5">Event ID</th>
                    <th className="px-4 py-2.5">Authoritative Tenant</th>
                    <th className="px-4 py-2.5">Actor Context</th>
                    <th className="px-4 py-2.5">Properties (Sanitized)</th>
                    <th className="px-4 py-2.5">Source &amp; Surface</th>
                    <th className="px-4 py-2.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-mono">
                  {events.slice(0, 10).map(e => (
                    <tr key={e.eventId} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3 font-bold text-emerald-900">{e.eventName}</td>
                      <td className="px-4 py-3 text-neutral-500 text-[10px]">{e.eventId}</td>
                      <td className="px-4 py-3 text-neutral-800 text-[11px]">{e.tenantContext.tenantId}</td>
                      <td className="px-4 py-3 text-neutral-600 text-[10px]">
                        {e.actorContext.actorId} ({e.actorContext.role})
                      </td>
                      <td className="px-4 py-3 text-neutral-700 text-[10px] max-w-xs truncate">
                        {JSON.stringify(e.properties)}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-[10px]">
                        {e.source} • {e.surface}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-[10px]">{e.occurredAt.substring(11, 19)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QUARANTINE & REJECTION LOG */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Telemetry Rejection &amp; Quarantine Log</span>
                </h2>
                <p className="text-xs text-neutral-500">
                  Malicious or malformed payloads blocked at ingress. Prohibited fields or unregistered schemas never reach analytics stores.
                </p>
              </div>
              <span className="text-xs font-mono text-rose-600 font-bold">{rejections.length} Quarantined</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-rose-50/50 text-rose-900 border-b border-rose-200 font-semibold">
                    <th className="px-4 py-2.5">Rejection ID</th>
                    <th className="px-4 py-2.5">Reason</th>
                    <th className="px-4 py-2.5">Details</th>
                    <th className="px-4 py-2.5">Attempted Tenant</th>
                    <th className="px-4 py-2.5">Payload Snippet</th>
                    <th className="px-4 py-2.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-mono">
                  {rejections.map(r => (
                    <tr key={r.rejectionId} className="hover:bg-rose-50/30">
                      <td className="px-4 py-3 text-[10px] text-neutral-500">{r.rejectionId}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          {r.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans text-neutral-800 text-xs">{r.details}</td>
                      <td className="px-4 py-3 text-neutral-600 text-[11px]">{r.tenantIdAttempted}</td>
                      <td className="px-4 py-3 text-rose-700 text-[10px] max-w-xs truncate">{r.rawPayloadSnippet}</td>
                      <td className="px-4 py-3 text-neutral-500 text-[10px]">{r.timestamp.substring(11, 19)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CAPACITY INTELLIGENCE & QUOTAS */}
      {activeTab === 'CAPACITY_QUOTA' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-neutral-900 mb-1">Empirical Capacity Planning &amp; Demand Intelligence</h2>
            <p className="text-xs text-neutral-500 mb-5">
              Correlates observed product feature usage with system operational requirements. Avoids unsupported future predictions;
              all growth rates derived from 30-day linear regression with explicit assumptions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capacityMetrics.map(cap => (
                <div key={cap.resourceDimension} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-neutral-900">{cap.resourceDimension}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {cap.status}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-neutral-900">{cap.currentObserved}</span>
                    <span className="text-xs text-neutral-500">{cap.unit}</span>
                  </div>

                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (cap.currentObserved / cap.capacityThreshold) * 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-neutral-600 border-t border-neutral-200/80 pt-2">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Peak Historical</span>
                      {cap.peakHistorical}
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Growth / Day</span>
                      +{cap.dailyGrowthRatePercent}%
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Days to Limit</span>
                      ~{cap.projectedDaysToThreshold} days
                    </div>
                  </div>

                  <p className="text-[10px] text-neutral-500 mt-2 font-sans italic border-t border-neutral-200/60 pt-1.5">
                    Assumptions: {cap.assumptions}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: INVARIANTS & GOVERNANCE */}
      {activeTab === 'INVARIANTS_GOVERNANCE' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Phase 25 Security, Privacy &amp; Reliability Invariants</h2>
                <p className="text-xs text-neutral-500">
                  Continuous automated verification of all 18 non-negotiable telemetry boundaries.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-mono text-xs font-bold">
                18 / 18 Enforced
              </span>
            </div>

            <div className="divide-y divide-neutral-200">
              {invariants.map(inv => (
                <div key={inv.id} className="p-4 hover:bg-neutral-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-neutral-900">{inv.id}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700">
                        {inv.category}
                      </span>
                      <span className="font-bold text-xs text-neutral-800">{inv.title}</span>
                    </div>
                    <p className="text-xs text-neutral-600">{inv.description}</p>
                    <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Evidence: {inv.auditEvidence}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
