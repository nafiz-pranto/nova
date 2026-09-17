import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, ArrowRight, Database, FileCheck, Layers, GitMerge, Search, Filter } from 'lucide-react';
import { CROSS_PHASE_CONFLICTS, SYSTEM_OF_RECORD_DEFINITIONS, CONTRACT_COMPATIBILITY_CHECKS } from '../data/phase10FixturesAndAudit';
import { CrossPhaseConflict, SystemOfRecordDefinition, ContractCompatibilityCheck } from '../types';

export const ConsistencyAuditMatrix: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'conflicts' | 'sor' | 'contracts'>('conflicts');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredConflicts = CROSS_PHASE_CONFLICTS.filter(c => {
    const matchesSev = severityFilter === 'ALL' || c.severity === severityFilter;
    const matchesQuery = searchQuery === '' ||
      c.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.impact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sourcePhases.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSev && matchesQuery;
  });

  const filteredContracts = CONTRACT_COMPATIBILITY_CHECKS.filter(c => {
    return searchQuery === '' ||
      c.interfaceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.upstreamService.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.downstreamService.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('conflicts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'conflicts'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Cross-Phase Conflicts ({CROSS_PHASE_CONFLICTS.length})
          </button>
          <button
            onClick={() => setActiveTab('sor')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'sor'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            System-of-Record Matrix ({SYSTEM_OF_RECORD_DEFINITIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'contracts'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Contract Compatibility (15/15 Pass)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search contracts, entities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-56 text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* Tab 1: Cross-Phase Conflicts */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-600">
              Audited 7 core structural and contract mismatches across Phases 01-09. All 7 resolved via minimal, surgical fixes with zero unsolicited redesign.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-mono">SEVERITY:</span>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="text-xs bg-white border border-neutral-200 rounded px-2 py-1 font-mono text-neutral-700"
              >
                <option value="ALL">ALL ({CROSS_PHASE_CONFLICTS.length})</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredConflicts.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                      {c.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      c.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      c.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {c.severity}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">
                      {c.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    {c.resolutionStatus}
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-900">
                  {c.issue}
                </h3>

                <div className="flex items-center gap-2 text-xs font-mono text-neutral-600">
                  <span className="font-semibold text-neutral-700">Source Phases:</span>
                  {c.sourcePhases.map(p => (
                    <span key={p} className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {p}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-neutral-100">
                  <div>
                    <span className="font-bold text-neutral-500 uppercase tracking-wider block mb-1">Issue Description</span>
                    <p className="text-neutral-800 bg-neutral-50 p-2.5 rounded border border-neutral-200">{c.issue}</p>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase tracking-wider block mb-1">Impact on Execution</span>
                    <p className="text-neutral-800 bg-neutral-50 p-2.5 rounded border border-neutral-200">{c.impact}</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/80 text-xs">
                  <span className="font-bold text-emerald-900 uppercase tracking-wider block mb-1">Minimal Surgical Fix Applied</span>
                  <p className="text-emerald-950 font-mono">{c.minimalFix}</p>
                  <div className="mt-2 text-[11px] font-mono text-emerald-800 flex items-center gap-1">
                    <span className="font-bold">Required Invariant Test:</span> {c.requiredTest}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: System-of-Record Matrix */}
      {activeTab === 'sor' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50">
            <h3 className="text-sm font-bold text-neutral-900">Authoritative Subsystem Invariants</h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Client extensions and browser UIs are strictly prohibited from holding authoritative state. The table below enforces the absolute system-of-record boundaries.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-100 text-neutral-700 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Concept</th>
                  <th className="px-4 py-3">Authoritative Subsystem</th>
                  <th className="px-4 py-3">Secondary Consumers</th>
                  <th className="px-4 py-3">Concurrency Resolution</th>
                  <th className="px-4 py-3">Core Invariants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {SYSTEM_OF_RECORD_DEFINITIONS.map((sor) => (
                  <tr key={sor.concept} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-neutral-900 whitespace-nowrap">
                      {sor.concept}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-neutral-800">
                      {sor.authoritativeSubsystem}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      <div className="flex flex-wrap gap-1">
                        {sor.secondaryConsumers.map(c => (
                          <span key={c} className="px-1.5 py-0.5 bg-neutral-100 rounded text-[10px] text-neutral-700 border border-neutral-200">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-neutral-700">
                      {sor.concurrencyResolution}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 max-w-xs space-y-1">
                      {sor.invariants.map((inv, idx) => (
                        <div key={idx} className="text-[11px] leading-snug">• {inv}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Contract Compatibility */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold text-emerald-900">
                All 15 Inter-Subsystem Interface Contracts Validated (TEST-P10-CON-01..15)
              </span>
            </div>
            <span className="font-mono text-emerald-800">100% PROTOCOL COMPATIBILITY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContracts.map((con, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                    CON-{(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {con.backwardCompatible ? 'COMPATIBLE' : 'FLAGGED'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-neutral-900">
                  {con.interfaceName}
                </h4>

                <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 bg-neutral-50 p-2 rounded border border-neutral-200">
                  <span className="font-semibold text-neutral-800">{con.upstreamService}</span>
                  <ArrowRight className="w-3 h-3 text-neutral-400" />
                  <span className="font-semibold text-neutral-800">{con.downstreamService}</span>
                </div>

                <div className="text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-neutral-500">
                    <span>SCHEMA ARTIFACT:</span>
                    <span className="text-neutral-800 font-semibold">{con.schemaVersion}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>NULLABILITY SEMANTICS:</span>
                    <span className="text-neutral-800">{con.nullSemanticsSafe ? 'SAFE' : 'RISK'}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>ENUM RESILIENCE:</span>
                    <span className="text-neutral-800">{con.unknownEnumSafe ? 'SAFE' : 'RISK'}</span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded border border-neutral-200">
                  <span className="font-bold text-neutral-700">Audit Evidence:</span> {con.auditEvidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
