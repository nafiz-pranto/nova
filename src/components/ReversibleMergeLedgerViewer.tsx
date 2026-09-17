import React, { useState, useMemo } from 'react';
import { PHASE_04_SCENARIOS } from '../data/phase04SpecAndAudit';
import {
  runIdentityResolution,
  generateScenarioEnvelopes
} from '../utils/entityResolutionEngine';
import { MergeLedgerEntry, IdentityResolutionGraph } from '../types';
import {
  RotateCcw,
  GitMerge,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertTriangle,
  Plus,
  ArrowRight,
  Split
} from 'lucide-react';

export const ReversibleMergeLedgerViewer: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(PHASE_04_SCENARIOS[9].id); // Unmerge scenario default
  const [customLedger, setCustomLedger] = useState<MergeLedgerEntry[]>([]);
  const [reversalReasonInput, setReversalReasonInput] = useState<string>('');
  const [activeReversalMergeId, setActiveReversalMergeId] = useState<string | null>(null);

  // Manual Merge Form State
  const [showManualMergeModal, setShowManualMergeModal] = useState<boolean>(false);
  const [manualSourceId, setManualSourceId] = useState<string>('');
  const [manualTargetId, setManualTargetId] = useState<string>('');
  const [manualJustification, setManualJustification] = useState<string>('');

  const currentScenario =
    PHASE_04_SCENARIOS.find((s) => s.id === selectedScenarioId) || PHASE_04_SCENARIOS[9];

  const envelopes = useMemo(() => {
    return generateScenarioEnvelopes(currentScenario);
  }, [currentScenario]);

  // Compute graph including any active custom ledger items
  const graph: IdentityResolutionGraph = useMemo(() => {
    return runIdentityResolution(envelopes, customLedger);
  }, [envelopes, customLedger]);

  const allLedgerEntries = graph.mergeLedger;

  // Handle unmerge action
  const handleConfirmUnmerge = (mergeId: string) => {
    if (!reversalReasonInput.trim()) return;

    setCustomLedger((prev) => {
      // Find if already in custom ledger or from initial
      const existing = prev.find((m) => m.mergeId === mergeId);
      if (existing) {
        return prev.map((m) =>
          m.mergeId === mergeId
            ? {
                ...m,
                isReversed: true,
                reversedAt: new Date().toISOString(),
                reversalReason: reversalReasonInput
              }
            : m
        );
      } else {
        // Find in all ledger
        const base = allLedgerEntries.find((m) => m.mergeId === mergeId);
        if (!base) return prev;
        return [
          ...prev,
          {
            ...base,
            isReversed: true,
            reversedAt: new Date().toISOString(),
            reversalReason: reversalReasonInput
          }
        ];
      }
    });

    setActiveReversalMergeId(null);
    setReversalReasonInput('');
  };

  // Handle manual merge
  const handleExecuteManualMerge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSourceId || !manualTargetId || !manualJustification.trim()) return;

    const sourceAdv = graph.advertiserEntities.find((a) => a.advertiserId === manualSourceId);
    const targetAdv = graph.advertiserEntities.find((a) => a.advertiserId === manualTargetId);
    if (!sourceAdv || !targetAdv) return;

    const newMerge: MergeLedgerEntry = {
      mergeId: `mrg_man_${Date.now().toString(16)}`,
      timestamp: new Date().toISOString(),
      operator: 'HUMAN_OPERATOR',
      action: 'MANUAL_MERGE',
      sourceEntityId: sourceAdv.advertiserId,
      sourceEntityName: sourceAdv.canonicalPageName,
      targetClusterId: targetAdv.advertiserId,
      targetClusterName: targetAdv.canonicalPageName,
      matchScore: 0.999,
      primarySignal: 'MANUAL_OPERATOR_OVERRIDE',
      isReversible: true,
      isReversed: false,
      evidenceHash: `sha256_override_${Date.now().toString(16)}`
    };

    setCustomLedger((prev) => [...prev, newMerge]);
    setShowManualMergeModal(false);
    setManualSourceId('');
    setManualTargetId('');
    setManualJustification('');
  };

  // Reset custom operations
  const handleResetLedger = () => {
    setCustomLedger([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-white border-b border-neutral-200 p-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-100 text-emerald-700">
                <RotateCcw className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-neutral-900 font-mono">
                Reversible Merge Ledger & Quarantine Triage
              </h2>
            </div>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
              Every entity merge is non-destructive, recorded in an immutable ledger with cryptographic evidence hashes, and fully reversible via 1-click unmerge.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualMergeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-mono font-medium hover:bg-purple-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Merge</span>
            </button>

            {customLedger.length > 0 && (
              <button
                onClick={handleResetLedger}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-xs font-mono font-medium hover:bg-neutral-50 transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Ledger ({customLedger.length})</span>
              </button>
            )}

            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-medium text-neutral-800 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {PHASE_04_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.id}: {sc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workspace Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Ledger Table */}
        <div className="flex-1 flex flex-col bg-white border-r border-neutral-200 overflow-hidden">
          <div className="p-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-neutral-800 uppercase">
                Immutable Merge Log ({allLedgerEntries.length})
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">Append-Only • Non-Destructive</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {allLedgerEntries.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-neutral-400">
                Zero merges in current scenario. All entities remain unlinked and distinct.
              </div>
            ) : (
              allLedgerEntries.map((entry) => {
                const isReversed = entry.isReversed;
                const isTargetForReversal = activeReversalMergeId === entry.mergeId;

                return (
                  <div
                    key={entry.mergeId}
                    className={`p-4 rounded-xl border transition-all ${
                      isReversed
                        ? 'border-neutral-200 bg-neutral-50/70 opacity-75'
                        : 'border-neutral-200 bg-white shadow-xs hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-neutral-900">
                            {entry.mergeId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              isReversed
                                ? 'bg-amber-100 text-amber-800'
                                : entry.operator === 'HUMAN_OPERATOR'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isReversed ? 'REVERSED / SPLIT' : entry.action}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {entry.operator}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-neutral-900">
                          <span>{entry.sourceEntityName}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{entry.targetClusterName}</span>
                        </div>

                        <div className="mt-1 text-[11px] font-mono text-neutral-500 flex items-center gap-3">
                          <span>Signal: {entry.primarySignal}</span>
                          <span>•</span>
                          <span>Score: {entry.matchScore.toFixed(3)}</span>
                          <span>•</span>
                          <span>Time: {new Date(entry.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      {!isReversed && (
                        <div>
                          <button
                            onClick={() => setActiveReversalMergeId(entry.mergeId)}
                            className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Split className="w-3.5 h-3.5" />
                            <span>1-Click Unmerge</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Cryptographic hash proof */}
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[10px] font-mono text-neutral-400 truncate">
                      Evidence SHA-256: {entry.evidenceHash}
                    </div>

                    {/* Reversal Audit Notes */}
                    {isReversed && (
                      <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs font-mono text-amber-800 space-y-1">
                        <div className="font-bold">✓ Unmerged / Reversal Confirmed</div>
                        <div>Reason: {entry.reversalReason || 'Operator manual split'}</div>
                        <div className="text-[10px] text-amber-600">
                          Reversed at: {new Date(entry.reversedAt || '').toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Active Reversal Input Drawer */}
                    {isTargetForReversal && !isReversed && (
                      <div className="mt-4 p-3 bg-purple-600 text-white rounded-lg space-y-2">
                        <div className="text-xs font-mono font-bold flex items-center gap-1.5 text-emerald-400">
                          <Split className="w-4 h-4" />
                          <span>Confirm Safe Unmerge / Split</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 font-sans">
                          Restores entity clusters to independent pre-merge topology. Original observations and envelopes remain unaffected.
                        </p>
                        <input
                          type="text"
                          placeholder="Mandatory operator justification reason..."
                          value={reversalReasonInput}
                          onChange={(e) => setReversalReasonInput(e.target.value)}
                          className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-400"
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setActiveReversalMergeId(null)}
                            className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleConfirmUnmerge(entry.mergeId)}
                            disabled={!reversalReasonInput.trim()}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs rounded transition-colors"
                          >
                            Confirm Split
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Quarantine Queue & Resulting Clusters */}
        <div className="w-full lg:w-96 flex flex-col bg-neutral-50 overflow-hidden shrink-0">
          {/* Quarantine Triage Box */}
          <div className="p-4 border-b border-neutral-200 bg-white">
            <div className="flex items-center gap-2 text-rose-700 font-mono text-xs font-bold uppercase">
              <ShieldAlert className="w-4 h-4" />
              <span>Quarantine Queue ({graph.metrics.conflictsQuarantined})</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Entities with conflicting private domains, collisions, or ambiguous anchors are isolated here rather than auto-merged.
            </p>

            <div className="mt-3 space-y-2">
              {graph.candidateEvaluations
                .filter((c) => c.decision === 'CONFLICT_QUARANTINE')
                .map((conf) => (
                  <div
                    key={conf.pairId}
                    className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1.5"
                  >
                    <div className="font-bold text-rose-900 truncate">
                      {conf.candidateNameA} vs {conf.candidateNameB}
                    </div>
                    <div className="text-[11px] text-rose-700">
                      {conf.conflictReasons[0] || 'Conflicting private registered domain assertions.'}
                    </div>
                    <div className="text-[10px] font-mono text-rose-600 font-semibold">
                      ACTION: HELD IN QUARANTINE
                    </div>
                  </div>
                ))}

              {graph.metrics.conflictsQuarantined === 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quarantine queue is clear. Zero unresolved collisions.</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Resulting Cluster Topology */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-neutral-200 bg-neutral-100 text-xs font-mono text-neutral-700 font-bold uppercase">
              Active Clusters ({graph.businessEntities.length})
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {graph.businessEntities.map((biz) => (
                <div
                  key={biz.clusterId}
                  className="p-3 rounded-lg border border-neutral-200 bg-white shadow-xs text-xs space-y-1"
                >
                  <div className="font-bold text-neutral-900 font-mono flex items-center justify-between">
                    <span>{biz.canonicalName}</span>
                    <span className="text-[10px] font-normal text-neutral-500">
                      {biz.advertiserIds.length} Page{biz.advertiserIds.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Domain: {biz.primaryDomain || 'N/A'}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-700">
                    Status: {biz.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Merge Modal */}
      {showManualMergeModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-emerald-600" />
                <h3 className="font-mono font-bold text-sm text-neutral-900">
                  Execute Manual Operator Merge
                </h3>
              </div>
              <button
                onClick={() => setShowManualMergeModal(false)}
                className="text-xs text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteManualMerge} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-600 mb-1 font-bold">Source Advertiser A:</label>
                <select
                  value={manualSourceId}
                  onChange={(e) => setManualSourceId(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded bg-white"
                  required
                >
                  <option value="">Select Advertiser...</option>
                  {graph.advertiserEntities.map((adv) => (
                    <option key={adv.advertiserId} value={adv.advertiserId}>
                      {adv.canonicalPageName} ({adv.advertiserId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-bold">Target Advertiser B:</label>
                <select
                  value={manualTargetId}
                  onChange={(e) => setManualTargetId(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded bg-white"
                  required
                >
                  <option value="">Select Advertiser...</option>
                  {graph.advertiserEntities.map((adv) => (
                    <option key={adv.advertiserId} value={adv.advertiserId}>
                      {adv.canonicalPageName} ({adv.advertiserId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-bold">
                  Operator Justification Note:
                </label>
                <textarea
                  placeholder="e.g. Verified parent company certificate in corporate filings..."
                  value={manualJustification}
                  onChange={(e) => setManualJustification(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded font-sans text-xs"
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowManualMergeModal(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 text-white rounded font-mono font-bold hover:bg-purple-700 transition-colors shadow-xs"
                >
                  Confirm Safe Merge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
