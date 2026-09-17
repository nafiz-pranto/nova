import React from 'react';
import { PageHeader } from './common/PageHeader';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ShieldCheck, 
  Server, 
  Database, 
  Cpu, 
  Activity,
  FileCheck,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

export const DataQualityWorkspace: React.FC = () => {
  const qualityMetrics = [
    {
      metric: 'Field Presence & Completeness',
      rate: '99.4%',
      status: 'HEALTHY',
      description: 'Percentage of mandatory schema fields present across normalized observation envelopes.',
      details: 'Evaluated on 432 canonical envelopes.'
    },
    {
      metric: 'DAG Provenance Completeness',
      rate: '100.0%',
      status: 'HEALTHY',
      description: 'Every persisted record contains immutable SHA-256 link to raw DOM snapshot and adapter token.',
      details: 'Zero orphan records in PostgreSQL Layer G.'
    },
    {
      metric: 'Validation Pass Rate',
      rate: '96.2%',
      status: 'HEALTHY',
      description: 'Normalized ads satisfying Phase 03 syntactic schema constraints without fatal quarantine violations.',
      details: '16 records quarantined for malformed currency bounds.'
    },
    {
      metric: 'SSRF Boundary Defense Compliance',
      rate: '100.0%',
      status: 'HEALTHY',
      description: 'Zero outbound requests allowed to private IP space, AWS metadata endpoints, or localhost.',
      details: '15/15 security test vectors active.'
    },
    {
      metric: 'Identity Ambiguity Triage Rate',
      rate: '88.5%',
      status: 'ATTENTION',
      description: 'Pending human operator resolution rate in Phase 04 identity clustering queue.',
      details: '7 cases awaiting manual operator decision.'
    },
    {
      metric: 'DOM Selector Drift Events',
      rate: '0 Detected',
      status: 'HEALTHY',
      description: 'Automated selector canary probes verifying Meta Ad Library card layout stability.',
      details: 'Canary probe ran 12 mins ago.'
    }
  ];

  const sourceHealth = [
    { name: 'Meta Ad Library Adapter (v4.2.1)', status: 'OPERATIONAL', latency: '340ms', uptime: '99.98%' },
    { name: 'Playwright Worker Pool (US East & West)', status: 'OPERATIONAL', latency: '1,120ms', uptime: '99.95%' },
    { name: 'Quad-9 DNS-over-HTTPS Resolver', status: 'OPERATIONAL', latency: '42ms', uptime: '100.0%' },
    { name: 'PostgreSQL Layer G (32 Tables)', status: 'HEALTHY', latency: '4ms', uptime: '100.0%' },
    { name: 'Scoring Model Registry (v2.4.0)', status: 'ACTIVE', latency: '8ms', uptime: '100.0%' }
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Data Quality & Source Health', active: true },
        ]}
        title="Data Quality & Pipeline Health Center"
        description="Transparent observability into schema completeness, verification integrity, SSRF compliance, and selector drift status across all ingestion layers."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Pipeline Layer Health: 100%
          </span>
        }
      />

      {/* Quality Metrics Grid */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Data Integrity &amp; Provenance Metrics
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qualityMetrics.map((qm, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">{qm.metric}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  qm.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {qm.status}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
                {qm.rate}
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {qm.description}
              </p>
              <div className="pt-2 border-t border-neutral-100 text-[11px] font-mono text-neutral-400">
                {qm.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source & Worker Infrastructure */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h4 className="text-sm font-bold text-neutral-900">Source Health &amp; Subsystem Connectivity</h4>
            <p className="text-xs text-neutral-500 mt-0.5">Automated telemetry monitoring adapters, network probes, and persistence stores.</p>
          </div>
          <span className="text-xs font-mono text-neutral-400">Layer I SRE Telemetry</span>
        </div>

        <div className="divide-y divide-neutral-100">
          {sourceHealth.map((sh, idx) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold text-neutral-900">{sh.name}</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-neutral-500">
                <span>Latency: {sh.latency}</span>
                <span>Uptime: {sh.uptime}</span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-bold text-[10px]">
                  {sh.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
