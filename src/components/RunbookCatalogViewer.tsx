import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy
} from 'lucide-react';
import { RunbookModel } from '../types';
import { PRODUCTION_RUNBOOK_CATALOG } from '../data/phase09FixturesAndAudit';

interface RunbookCatalogViewerProps {
  onNotify?: (msg: string) => void;
}

export const RunbookCatalogViewer: React.FC<RunbookCatalogViewerProps> = ({ onNotify }) => {
  const [runbooks] = useState<RunbookModel[]>(PRODUCTION_RUNBOOK_CATALOG);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [expandedRunbookId, setExpandedRunbookId] = useState<string>('RB-01');

  const filteredRunbooks = runbooks.filter(rb => {
    const matchesSev = selectedSeverity === 'ALL' || rb.severity === selectedSeverity;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      rb.title.toLowerCase().includes(q) ||
      rb.id.toLowerCase().includes(q) ||
      rb.trigger.toLowerCase().includes(q) ||
      rb.diagnosis.toLowerCase().includes(q);
    return matchesSev && matchesSearch;
  });

  const handleCopyRunbook = (rb: RunbookModel) => {
    const text = `RUNBOOK: [${rb.id}] ${rb.title} (${rb.severity})\nTRIGGER: ${rb.trigger}\nCONTAINMENT: ${rb.immediateContainment}\nRECOVERY: ${rb.recovery}\nEXIT CRITERIA: ${rb.exitCriteria}`;
    navigator.clipboard.writeText(text);
    if (onNotify) {
      onNotify(`Copied runbook ${rb.id} to clipboard.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 mb-4 gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neutral-800" />
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Production Operations Runbook Catalog</h2>
              <p className="text-xs text-neutral-500">
                10 verified operational incident response procedures with deterministic containment & recovery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search runbooks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs w-56 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1">
              {['ALL', 'SEV-1', 'SEV-2', 'SEV-3'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2 py-1 rounded text-xs font-mono font-medium ${
                    selectedSeverity === sev
                      ? 'bg-purple-600 text-white font-semibold shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Runbook List */}
        <div className="space-y-3">
          {filteredRunbooks.map(rb => {
            const isExpanded = expandedRunbookId === rb.id;
            return (
              <div
                key={rb.id}
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? 'bg-white border-neutral-300 shadow-md ring-1 ring-neutral-200'
                    : 'bg-neutral-50/70 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedRunbookId(isExpanded ? '' : rb.id)}
                  className="p-4 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded">
                      {rb.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      rb.severity === 'SEV-1'
                        ? 'bg-rose-100 text-rose-800'
                        : rb.severity === 'SEV-2'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rb.severity}
                    </span>
                    <h3 className="font-semibold text-neutral-900 text-xs sm:text-sm">{rb.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleCopyRunbook(rb);
                      }}
                      className="p-1 text-neutral-400 hover:text-neutral-700 rounded hover:bg-neutral-200/50"
                      title="Copy Runbook Summary"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-neutral-100 text-xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="font-bold text-neutral-700 text-[11px] uppercase font-mono mb-1">
                          1. Triggering Condition
                        </div>
                        <p className="text-neutral-800">{rb.trigger}</p>
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="font-bold text-neutral-700 text-[11px] uppercase font-mono mb-1">
                          2. Detection Mechanism
                        </div>
                        <p className="text-neutral-800">{rb.detection}</p>
                      </div>

                      <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-200">
                        <div className="font-bold text-rose-800 text-[11px] uppercase font-mono mb-1">
                          3. Immediate Containment
                        </div>
                        <p className="text-rose-950 font-medium">{rb.immediateContainment}</p>
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="font-bold text-neutral-700 text-[11px] uppercase font-mono mb-1">
                          4. Root-Cause Diagnosis
                        </div>
                        <p className="text-neutral-800">{rb.diagnosis}</p>
                      </div>

                      <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                        <div className="font-bold text-emerald-800 text-[11px] uppercase font-mono mb-1">
                          5. Recovery Execution
                        </div>
                        <p className="text-emerald-950">{rb.recovery}</p>
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="font-bold text-neutral-700 text-[11px] uppercase font-mono mb-1">
                          6. Validation & Confirmation
                        </div>
                        <p className="text-neutral-800">{rb.validation}</p>
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="font-bold text-neutral-700 text-[11px] uppercase font-mono mb-1">
                          7. Rollback Safety Plan
                        </div>
                        <p className="text-neutral-800">{rb.rollbackPlan}</p>
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="font-bold text-neutral-700 text-[11px] uppercase font-mono mb-1">
                          8. Audit & Compliance
                        </div>
                        <p className="text-neutral-800">{rb.auditRequirements}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-600 text-white rounded-lg flex items-center justify-between font-mono text-[11px]">
                      <span>Exit Criteria: {rb.exitCriteria}</span>
                      <span className="text-emerald-400 font-bold">VERIFIED PROCEDURE</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
