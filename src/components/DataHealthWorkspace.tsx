import React, { useState } from 'react';
import { PageHeader } from './common/PageHeader';
import {
  SAMPLE_HEALTH_METRICS,
  SAMPLE_QUALITY_INCIDENTS,
  SAMPLE_QUARANTINE_RECORDS,
  SAMPLE_CORRECTIONS,
  SAMPLE_SCHEMA_DRIFT_EVENTS,
  SAMPLE_LINEAGE_NODES,
  SAMPLE_LINEAGE_EDGES,
  DataQualityIncident,
  QuarantineRecord,
  CorrectionRecord
} from '../data/phase15QualityEngine';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertOctagon,
  GitCommit,
  Layers,
  Database,
  Lock,
  Search,
  CheckCircle,
  Clock,
  ArrowRight,
  GitPullRequest
} from 'lucide-react';

export const DataHealthWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HEALTH' | 'INCIDENTS' | 'QUARANTINE' | 'CORRECTIONS' | 'SCHEMA' | 'LINEAGE'>('HEALTH');

  const renderHealth = () => (
    <div className="space-y-6">
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
        <div className="font-bold text-emerald-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Platform Data Health Overview</span>
        </div>
        <p className="text-emerald-800 leading-relaxed">
          Measuring structured quality dimensions across the data lifecycle. A quality score is metadata about the dataset state, not a claim about underlying business truth.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SAMPLE_HEALTH_METRICS.map(metric => (
          <div key={metric.metricId} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 line-clamp-1" title={metric.name}>
                {metric.name}
              </span>
              <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                metric.rate >= 95 ? 'bg-emerald-100 text-emerald-800' : 
                metric.rate >= 90 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {metric.dimension}
              </span>
            </div>
            
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-neutral-900">
                {metric.rate.toFixed(1)}%
              </div>
            </div>
            
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
              <span className="font-mono">{metric.numerator.toLocaleString()} / {metric.denominator.toLocaleString()}</span>
              <span>Trend: {metric.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIncidents = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Quality Incidents</h3>
          <p className="text-xs text-neutral-500 mt-1">Operational view of structural rule violations and consistency failures.</p>
        </div>
      </div>

      <div className="space-y-4">
        {SAMPLE_QUALITY_INCIDENTS.map(incident => (
          <div key={incident.incidentId} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className={`w-4 h-4 ${
                  incident.severity === 'BLOCKING' || incident.severity === 'CRITICAL' ? 'text-rose-600' :
                  incident.severity === 'ERROR' ? 'text-amber-600' : 'text-blue-600'
                }`} />
                <span className="font-bold text-sm text-neutral-900">{incident.incidentId}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-neutral-100 text-neutral-700">
                {incident.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neutral-500 block mb-1">Entity / Field</span>
                <span className="font-mono text-neutral-900 bg-neutral-50 px-1 py-0.5 rounded border border-neutral-100">
                  {incident.entityType}.{incident.field}
                </span>
                <div className="text-neutral-500 mt-1">ID: {incident.entityId}</div>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Failed Rule</span>
                <span className="font-mono text-blue-600">{incident.ruleId}</span>
                <div className="text-neutral-500 mt-1">Detected: {new Date(incident.detectedAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Downstream Impact</span>
              <div className="flex gap-2">
                {incident.downstreamImpact.map((impact, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-100 font-mono">
                    {impact}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuarantine = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Quarantine &amp; Repairs</h3>
          <p className="text-xs text-neutral-500 mt-1">Records held back from trusted read models due to severe quality failures.</p>
        </div>
      </div>
      <div className="space-y-4">
        {SAMPLE_QUARANTINE_RECORDS.map(q => (
          <div key={q.quarantineId} className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <div className="flex justify-between items-start pl-2">
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">Quarantine: {q.quarantineId}</h4>
                <p className="text-xs text-neutral-600 mt-1">{q.reason}</p>
              </div>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-mono font-bold rounded">
                {q.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs pl-2">
              <div>
                <span className="text-neutral-500 block mb-1">Payload Reference</span>
                <span className="font-mono text-neutral-800 text-[10px]">{q.originalPayloadRef}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Repair Eligibility</span>
                <span className="font-mono font-bold text-emerald-700">{q.repairEligibility}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCorrections = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Immutable Corrections</h3>
          <p className="text-xs text-neutral-500 mt-1">Corrections create new versions; history is never silently overwritten.</p>
        </div>
      </div>
      <div className="space-y-4">
        {SAMPLE_CORRECTIONS.map(corr => (
          <div key={corr.correctionId} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="font-mono text-[10px] text-blue-600 font-bold">{corr.correctionId}</span>
                <h4 className="font-bold text-neutral-900 text-sm mt-1">{corr.entityId} &bull; {corr.field}</h4>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold rounded">
                {corr.status} &bull; v{corr.version}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs py-3 border-b border-neutral-100">
              <div>
                <span className="text-rose-500 font-bold block mb-1">Original Value (Superseded)</span>
                <div className="font-mono bg-rose-50 text-rose-900 p-2 rounded border border-rose-100 break-all">
                  {corr.originalValue}
                </div>
              </div>
              <div>
                <span className="text-emerald-600 font-bold block mb-1">Proposed Corrected Value</span>
                <div className="font-mono bg-emerald-50 text-emerald-900 p-2 rounded border border-emerald-100 break-all">
                  {corr.proposedValue}
                </div>
              </div>
            </div>

            <div className="pt-3 text-xs text-neutral-600 flex justify-between items-center">
              <div>
                <span className="font-bold">Reason:</span> {corr.reason}
              </div>
              <div className="font-mono text-[10px] text-neutral-400">
                Actor: {corr.actor}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSchema = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Schema Drift &amp; Governance</h3>
          <p className="text-xs text-neutral-500 mt-1">Detecting structural changes in acquisition targets or UI sources.</p>
        </div>
      </div>
      <div className="space-y-4">
        {SAMPLE_SCHEMA_DRIFT_EVENTS.map(ev => (
          <div key={ev.eventId} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-neutral-900 text-sm">Source UI Drift Detected</h4>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold rounded">
                {ev.impactAssessment}
              </span>
            </div>
            <div className="py-3 text-xs space-y-2 text-neutral-700">
              <div className="flex justify-between">
                <span className="font-bold">Target:</span>
                <span>{ev.sourceTarget}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Drift Type:</span>
                <span className="font-mono">{ev.driftType}</span>
              </div>
              <div>
                <span className="font-bold block mb-1">Description:</span>
                <p className="bg-neutral-50 p-2 rounded border border-neutral-100">{ev.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLineage = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Data Provenance &amp; Lineage</h3>
          <p className="text-xs text-neutral-500 mt-1">Graph traversal showing how derived values trace back to raw observations.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs overflow-x-auto">
        <div className="min-w-[600px] flex items-center justify-between">
          {SAMPLE_LINEAGE_NODES.map((node, i) => (
            <React.Fragment key={node.nodeId}>
              <div className="flex flex-col items-center gap-2 w-48 text-center shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${
                  node.provenanceStatus === 'COMPLETE' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'
                }`}>
                  <GitCommit className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-neutral-900">{node.label}</div>
                  <div className="font-mono text-[9px] text-neutral-500 mt-0.5">{node.nodeType} &bull; {node.version}</div>
                  <div className="flex gap-1 justify-center mt-2 flex-wrap">
                    {node.qualityState.map(s => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 text-[8px] font-bold font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {i < SAMPLE_LINEAGE_NODES.length - 1 && (
                <div className="flex-1 flex flex-col items-center shrink-0 px-2">
                  <div className="text-[9px] font-mono text-blue-600 mb-1 text-center truncate max-w-[120px]">
                    {SAMPLE_LINEAGE_EDGES.find(e => e.sourceId === node.nodeId)?.transformationRule}
                  </div>
                  <div className="h-0.5 w-full bg-neutral-200 flex items-center justify-end">
                    <ArrowRight className="w-3 h-3 text-neutral-300 -mr-1.5" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Engineering & Admin', active: false },
          { label: 'Data Quality & Health (Phase 15)', active: true },
        ]}
        title="Data Health Control Center"
        description="Production governance layer enforcing field-level quality rules, quarantine logic, deterministic repairs, schema drift detection, and immutable corrections."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Platform Quality Engine Active
          </span>
        }
      />

      {/* Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'HEALTH', icon: Activity, label: 'Overall Health' },
          { id: 'INCIDENTS', icon: ShieldAlert, label: 'Incidents' },
          { id: 'QUARANTINE', icon: Lock, label: 'Quarantine' },
          { id: 'CORRECTIONS', icon: CheckCircle, label: 'Corrections' },
          { id: 'LINEAGE', icon: GitCommit, label: 'Provenance Lineage' },
          { id: 'SCHEMA', icon: Database, label: 'Schema Drift' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'HEALTH' && renderHealth()}
      {activeTab === 'INCIDENTS' && renderIncidents()}
      {activeTab === 'QUARANTINE' && renderQuarantine()}
      {activeTab === 'CORRECTIONS' && renderCorrections()}
      {activeTab === 'LINEAGE' && renderLineage()}
      {activeTab === 'SCHEMA' && renderSchema()}
    </div>
  );
};
