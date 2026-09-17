import React, { useState, useMemo } from 'react';
import { PHASE_04_SCENARIOS } from '../data/phase04SpecAndAudit';
import {
  runIdentityResolution,
  generateScenarioEnvelopes
} from '../utils/entityResolutionEngine';
import { CandidatePairEvaluation, MatchDecision } from '../types';
import {
  Sliders,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Info,
  Layers,
  Search
} from 'lucide-react';

export const CandidateScoringMatrixViewer: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(PHASE_04_SCENARIOS[2].id); // Franchise default
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');

  const currentScenario =
    PHASE_04_SCENARIOS.find((s) => s.id === selectedScenarioId) || PHASE_04_SCENARIOS[2];

  const envelopes = useMemo(() => {
    return generateScenarioEnvelopes(currentScenario);
  }, [currentScenario]);

  const graph = useMemo(() => {
    return runIdentityResolution(envelopes);
  }, [envelopes]);

  const candidatePairs = graph.candidateEvaluations;

  const filteredPairs = useMemo(() => {
    if (decisionFilter === 'ALL') return candidatePairs;
    return candidatePairs.filter((p) => p.decision === decisionFilter);
  }, [candidatePairs, decisionFilter]);

  const activePair = candidatePairs.find((p) => p.pairId === selectedPairId) || filteredPairs[0] || candidatePairs[0];

  const getDecisionBadge = (decision: MatchDecision) => {
    switch (decision) {
      case 'AUTOMATIC_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>CONFIRMED MERGE</span>
          </span>
        );
      case 'PROVISIONAL_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="w-3 h-3" />
            <span>PROVISIONAL REVIEW</span>
          </span>
        );
      case 'CONFLICT_QUARANTINE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3" />
            <span>CONFLICT QUARANTINE</span>
          </span>
        );
      case 'UNLINKED_DISTINCT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
            <XCircle className="w-3 h-3" />
            <span>UNLINKED DISTINCT</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Header Bar */}
      <div className="border-b border-neutral-200 p-4 bg-neutral-50 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-100 text-emerald-700">
                <Sliders className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-neutral-900 font-mono">
                Match Signal Matrix & Candidate Inspector
              </h2>
            </div>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
              Inspect pairwise entity comparisons, mathematical scoring weights, primary anchors, generic domain penalties, and blocking rule triggers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedScenarioId}
              onChange={(e) => {
                setSelectedScenarioId(e.target.value);
                setSelectedPairId(null);
              }}
              className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-medium text-neutral-800 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {PHASE_04_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.id}: {sc.name}
                </option>
              ))}
            </select>

            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono text-neutral-700 shadow-xs"
            >
              <option value="ALL">All Decisions ({candidatePairs.length})</option>
              <option value="AUTOMATIC_CONFIRMED">Confirmed Only</option>
              <option value="PROVISIONAL_REVIEW">Provisional Only</option>
              <option value="CONFLICT_QUARANTINE">Quarantine Only</option>
              <option value="UNLINKED_DISTINCT">Unlinked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Candidate Pair List */}
        <div className="w-full lg:w-96 border-r border-neutral-200 flex flex-col bg-white overflow-hidden shrink-0">
          <div className="p-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-500 uppercase font-semibold">
              Evaluated Pairs ({filteredPairs.length})
            </span>
            <span className="text-[11px] text-neutral-400">Score Range: 0.00 - 1.00</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredPairs.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 font-mono">
                No candidate pairs match the current filter.
              </div>
            ) : (
              filteredPairs.map((pair) => {
                const isSelected = activePair?.pairId === pair.pairId;
                return (
                  <div
                    key={pair.pairId}
                    onClick={() => setSelectedPairId(pair.pairId)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      {getDecisionBadge(pair.decision)}
                      <span className="font-mono text-xs font-bold text-neutral-900">
                        {(pair.matchScore * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-neutral-900 truncate">
                        A: {pair.candidateNameA}
                      </div>
                      <div className="font-semibold text-neutral-900 truncate">
                        B: {pair.candidateNameB}
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="mt-3 w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          pair.decision === 'AUTOMATIC_CONFIRMED'
                            ? 'bg-emerald-600'
                            : pair.decision === 'PROVISIONAL_REVIEW'
                            ? 'bg-amber-500'
                            : pair.decision === 'CONFLICT_QUARANTINE'
                            ? 'bg-rose-500'
                            : 'bg-neutral-400'
                        }`}
                        style={{ width: `${Math.max(5, pair.matchScore * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Pair Evidence Breakdown */}
        <div className="flex-1 flex flex-col bg-neutral-50 overflow-y-auto p-6">
          {activePair ? (
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {/* Pair Banner Card */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold tracking-wider">
                      Pairwise Comparison Audit
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 font-mono mt-0.5">
                      {activePair.candidateNameA} <span className="text-neutral-400">vs</span> {activePair.candidateNameB}
                    </h3>
                  </div>
                  <div>{getDecisionBadge(activePair.decision)}</div>
                </div>

                {/* Score & Anchor Stat Block */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold">
                      Calculated Composite Score
                    </span>
                    <div className="text-2xl font-bold font-mono text-neutral-900 mt-0.5">
                      {activePair.matchScore.toFixed(3)}
                    </div>
                    <span className="text-[11px] text-neutral-500">Threshold for Auto: 0.850</span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold">
                      Primary Anchor
                    </span>
                    <div className="text-xs font-mono font-bold text-emerald-700 mt-1 truncate">
                      {activePair.primaryAnchorSignal || 'NONE (Review Required)'}
                    </div>
                    <span className="text-[11px] text-neutral-500">Must be Domain/Phone/Legal</span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold">
                      Signals Evaluated
                    </span>
                    <div className="text-2xl font-bold font-mono text-neutral-900 mt-0.5">
                      {activePair.signals.length}
                    </div>
                    <span className="text-[11px] text-neutral-500">Deterministic Weights</span>
                  </div>
                </div>

                {/* Blocking Rules Alerts */}
                {activePair.blockingRulesTriggered.length > 0 && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-800 font-mono">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>HARD BLOCKING RULES TRIGGERED ({activePair.blockingRulesTriggered.length})</span>
                    </div>
                    <ul className="text-xs text-rose-700 space-y-1 font-mono list-disc list-inside">
                      {activePair.blockingRulesTriggered.map((rule, idx) => (
                        <li key={idx}>
                          <strong>{rule}</strong>
                        </li>
                      ))}
                    </ul>
                    {activePair.conflictReasons.length > 0 && (
                      <div className="pt-2 border-t border-rose-200 text-xs text-rose-800">
                        {activePair.conflictReasons.map((reason, idx) => (
                          <div key={idx} className="mt-1">
                            ⚠️ {reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contributing Signal Ledger Table */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase font-mono text-neutral-700">
                      Itemized Signal Weight Breakdown
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">
                    Total Contributed: {activePair.matchScore.toFixed(3)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-mono text-[11px]">
                      <tr>
                        <th className="p-3">Signal Type</th>
                        <th className="p-3">Weight</th>
                        <th className="p-3">Raw Score</th>
                        <th className="p-3">Contributed</th>
                        <th className="p-3">Anchor?</th>
                        <th className="p-3">Evidence & Rationale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 font-mono text-xs">
                      {activePair.signals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-neutral-400">
                            Zero matching signals found between this candidate pair.
                          </td>
                        </tr>
                      ) : (
                        activePair.signals.map((sig, i) => (
                          <tr key={i} className="hover:bg-neutral-50 transition-colors">
                            <td className="p-3 font-semibold text-neutral-900">
                              {sig.signalType}
                            </td>
                            <td className="p-3 text-neutral-600">{sig.weight > 0 ? `+${sig.weight}` : sig.weight}</td>
                            <td className="p-3 text-neutral-600">{sig.rawScore.toFixed(2)}</td>
                            <td
                              className={`p-3 font-bold ${
                                sig.contributedScore > 0
                                  ? 'text-emerald-700'
                                  : sig.contributedScore < 0
                                  ? 'text-rose-600'
                                  : 'text-neutral-500'
                              }`}
                            >
                              {sig.contributedScore > 0
                                ? `+${sig.contributedScore.toFixed(3)}`
                                : sig.contributedScore.toFixed(3)}
                            </td>
                            <td className="p-3">
                              {sig.isAnchor ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                                  PRIMARY
                                </span>
                              ) : (
                                <span className="text-neutral-400 text-[10px]">No</span>
                              )}
                            </td>
                            <td className="p-3 text-neutral-700 font-sans max-w-xs text-xs">
                              <div>{sig.rationale}</div>
                              <div className="text-[11px] font-mono text-neutral-500 mt-1">
                                A: {sig.evidenceA} | B: {sig.evidenceB}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-400 text-xs font-mono">
              No candidate pair selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
