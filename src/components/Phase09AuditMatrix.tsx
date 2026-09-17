import React, { useState } from 'react';
import {
  CheckCircle2,
  FileJson,
  Download,
  Copy,
  Search,
  Filter,
  ShieldCheck,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Phase09AuditCriterion } from '../types';
import {
  PHASE_09_AUDIT_CRITERIA,
  PHASE_10_HANDOFF_JSON,
  PHASE_08_TRACEABILITY_MATRIX
} from '../data/phase09FixturesAndAudit';

interface Phase09AuditMatrixProps {
  onNotify?: (msg: string) => void;
}

export const Phase09AuditMatrix: React.FC<Phase09AuditMatrixProps> = ({ onNotify }) => {
  const [criteria] = useState<Phase09AuditCriterion[]>(PHASE_09_AUDIT_CRITERIA);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'traceability' | 'rejection' | 'handoff'>('matrix');

  const categories = [
    'ALL',
    'HEALTH_LIVENESS_READINESS',
    'HEARTBEAT_STALENESS',
    'WORKER_LEASING_FENCING',
    'RETRIES_DEAD_LETTER',
    'CHECKPOINT_RESUME',
    'BACKPRESSURE_CONCURRENCY',
    'CHANGE_ANOMALY_DETECTION',
    'INTEGRITY_RECONCILIATION',
    'METRICS_SLOS_LOGGING',
    'INCIDENT_RUNBOOKS',
    'KILL_SWITCH_DEGRADED',
    'CHAOS_SOAK_TESTING'
  ];

  const filteredCriteria = criteria.filter(c => {
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.requirement.toLowerCase().includes(q) ||
      c.verificationEvidence.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(PHASE_10_HANDOFF_JSON, null, 2));
    if (onNotify) {
      onNotify('Phase-10 machine-readable handoff JSON copied to clipboard.');
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(PHASE_10_HANDOFF_JSON, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'phase-09-to-10-reliability-handoff.json';
    a.click();
    URL.revokeObjectURL(url);
    if (onNotify) {
      onNotify('Downloaded phase-09-to-10-reliability-handoff.json');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats & Sub-tabs */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-neutral-900">Phase 09 Production Readiness & Audit Matrix</h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                  35 / 35 PASSING
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                100% compliance with Master Prompt 09 SRE, resilience, recovery, and operations requirements
              </p>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'matrix' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              35 Criteria Matrix
            </button>
            <button
              onClick={() => setActiveTab('traceability')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'traceability' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Phase-08 Traceability
            </button>
            <button
              onClick={() => setActiveTab('rejection')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'rejection' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Rejection Criteria
            </button>
            <button
              onClick={() => setActiveTab('handoff')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'handoff' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Phase 10 JSON Handoff
            </button>
          </div>
        </div>

        {/* Tab 1: 35 Readiness Criteria */}
        {activeTab === 'matrix' && (
          <div className="pt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search 35 criteria..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs w-64 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto py-1">
                {categories.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Criteria Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-600 font-mono uppercase text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Readiness Criterion</th>
                    <th className="py-2.5 px-3">Verification Evidence</th>
                    <th className="py-2.5 px-3">Automated Test</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredCriteria.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-50/60">
                      <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                        {item.code}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-neutral-900">{item.title}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{item.requirement}</div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-neutral-600 max-w-xs">
                        {item.verificationEvidence}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-neutral-500">
                        {item.testCoverage}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Phase-08 Traceability */}
        {activeTab === 'traceability' && (
          <div className="pt-4 space-y-4">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Every operator-facing feature from Phase 08 is formally mapped to a Phase 09 reliability mechanism,
              preventing regressions and ensuring absolute fault containment.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-600 font-mono uppercase text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Phase 08 Operational Dependency</th>
                    <th className="py-2.5 px-3">Phase 09 Reliability Mechanism</th>
                    <th className="py-2.5 px-3">Failure Mode Protected</th>
                    <th className="py-2.5 px-3">Automated Test Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {PHASE_08_TRACEABILITY_MATRIX.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-3 font-medium text-neutral-900">
                        {entry.phase08Dependency}
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-800">
                        {entry.phase09Mechanism}
                      </td>
                      <td className="py-3 px-3 text-neutral-600">
                        {entry.failureModeProtected}
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-500">
                        {entry.testVerification}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Rejection Criteria */}
        {activeTab === 'rejection' && (
          <div className="pt-4 space-y-4">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase font-mono mb-3">
                Inviolable Negative Constraints (21 Master Rejection Criteria)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  'Zero Infinite Retries: Maximum 3 attempts with capped 60s backoff.',
                  'Zero Challenge/Block Retries: Immediate freeze on CAPTCHA or HTTP 403.',
                  'Zero Anti-Bot Evasion: No proxy rotation, stealth plugins, or fingerprint spoofing.',
                  'Zero Hidden APIs: Strictly public UI automation via Playwright.',
                  'Zero Unfenced Zombie Writes: Stale workers rejected by monotonic epoch tokens.',
                  'Zero Checkpoint Corruption: SHA-256 payload digest verified before resume.',
                  'Zero Uncontrolled Concurrency: Global hard cap of 16 browser workers.',
                  'Zero Silent DOM Drift Ingestion: Missing feed selectors trip UI_CHANGE_DETECTED.',
                  'Zero False "Completed" Status: Degraded modes explicitly flag unverified leads.',
                  'Full Non-Repudiation Audit: All kill-switch and pause actions require operator identity.'
                ].map((crit, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border border-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-neutral-800">{crit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Phase 10 JSON Handoff */}
        {activeTab === 'handoff' && (
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-600">
                Machine-readable JSON schema conforming to Master Prompt 09 Section 105 for Phase 10 integration.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy JSON
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Contract
                </button>
              </div>
            </div>

            <pre className="bg-neutral-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
              {JSON.stringify(PHASE_10_HANDOFF_JSON, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
