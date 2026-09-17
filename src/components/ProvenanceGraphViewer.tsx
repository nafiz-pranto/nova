import React, { useState } from 'react';
import { PHASE_03_FIXTURES } from '../data/phase03FixturesAndAudit';
import { executeExtractionPipeline } from '../utils/extractionEngine';
import { ProvenanceNode } from '../types';
import {
  Layers,
  Search,
  CheckCircle2,
  HelpCircle,
  Hash,
  ShieldCheck,
  Calculator,
  ArrowDown,
  GitBranch,
  FileSearch,
  Sparkles
} from 'lucide-react';

export const ProvenanceGraphViewer: React.FC = () => {
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(PHASE_03_FIXTURES[0].id);
  const [selectedField, setSelectedField] = useState<string>('startDateIso');

  // Interactive confidence penalty toggles
  const [penaltyRoleMissing, setPenaltyRoleMissing] = useState<boolean>(false);
  const [penaltyTruncated, setPenaltyTruncated] = useState<boolean>(false);
  const [penaltyFallbackLocator, setPenaltyFallbackLocator] = useState<boolean>(false);

  const currentFixture = PHASE_03_FIXTURES.find((f) => f.id === selectedFixtureId) || PHASE_03_FIXTURES[0];
  const result = executeExtractionPipeline(currentFixture.rawHtml);
  const env = result.envelope;
  const graph = env?.provenanceGraph || {};
  const activeNode: ProvenanceNode | undefined = graph[selectedField] || Object.values(graph)[0];

  // Mathematical confidence calculator
  const baseScore = activeNode ? activeNode.confidenceScore : 0.95;
  let dynamicScore = baseScore;
  if (penaltyRoleMissing) dynamicScore -= 0.10;
  if (penaltyTruncated) dynamicScore -= 0.05;
  if (penaltyFallbackLocator) dynamicScore -= 0.15;
  dynamicScore = Math.max(0, Math.min(1, +dynamicScore.toFixed(3)));

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto p-6">
      {/* Header Banner */}
      <div className="border-b border-neutral-200 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-neutral-900 tracking-tight font-mono">
            Provenance Graph & Field-Level Lineage DAG
          </h2>
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
            4 Cardinal Lineage Questions
          </span>
        </div>
        <p className="text-sm text-neutral-600 mt-1 max-w-3xl">
          Every field emitted by the Phase 03 extraction pipeline answers: (1) What is the value?, (2) Where did it come from?, (3) How was it transformed?, and (4) How certain are we?
        </p>
      </div>

      {/* Top Controls: Card Fixture Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-mono font-medium text-neutral-700 mb-1">
            SOURCE AD FIXTURE FOR LINEAGE INSPECTION:
          </label>
          <select
            value={selectedFixtureId}
            onChange={(e) => setSelectedFixtureId(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-neutral-300 rounded-lg p-2 text-neutral-900 shadow-xs"
          >
            {PHASE_03_FIXTURES.map((f) => (
              <option key={f.id} value={f.id}>
                [{f.id}] {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white px-3 py-2 rounded-lg border border-neutral-200 text-right shadow-xs">
            <span className="text-[10px] font-mono text-neutral-500 block">Composite Confidence</span>
            <span className="text-base font-bold font-mono text-emerald-700">
              {((env?.compositeConfidence || 0.95) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Field Tree on Left, Cardinal Lineage Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Traceable Fields Catalog */}
        <div className="lg:col-span-4 border border-neutral-200 rounded-xl bg-white shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 border-b border-neutral-200 bg-neutral-50">
            <span className="text-xs font-mono font-semibold text-neutral-700">
              EXTRACTED FIELDS IN PROVENANCE DAG ({Object.keys(graph).length})
            </span>
          </div>
          <div className="p-2 overflow-y-auto flex-1 space-y-1">
            {Object.entries(graph).map(([field, node]) => {
              const isSelected = field === selectedField;
              return (
                <button
                  key={field}
                  onClick={() => setSelectedField(field)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-xs font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="block truncate">{field}</span>
                    <span className={`text-[10px] block truncate font-normal ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {node.sourceLocator}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                      isSelected ? 'bg-neutral-800 text-emerald-300' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {(node.confidenceScore * 100).toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: 4 Cardinal Questions Deep Inspector */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {activeNode ? (
            <div className="border border-neutral-200 rounded-xl bg-white shadow-xs p-6 space-y-6">
              <div className="border-b border-neutral-200 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Lineage Node Verified
                  </span>
                  <h3 className="text-xl font-bold font-mono text-neutral-900 mt-1">
                    Field: <span className="text-neutral-900">{activeNode.field}</span>
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-neutral-500 uppercase block">Node Confidence</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    {(activeNode.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* The 4 Cardinal Questions Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Question 1: What is the Value? */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    <h4 className="text-xs font-mono font-bold text-neutral-800 uppercase">
                      What is the value?
                    </h4>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-neutral-200 font-mono text-xs text-neutral-900 break-all font-semibold shadow-2xs">
                    {String(activeNode.value) || '<null>'}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1.5 leading-tight">
                    Final canonical output value passed to downstream validation and emission.
                  </p>
                </div>

                {/* Question 2: Where did it come from? */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    <h4 className="text-xs font-mono font-bold text-neutral-800 uppercase">
                      Where did it come from?
                    </h4>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-neutral-200 font-mono text-xs text-neutral-900 shadow-2xs">
                    <div className="text-[10px] text-neutral-400">Source Selector:</div>
                    <div className="font-semibold text-neutral-900 truncate">{activeNode.sourceLocator}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">Strategy:</div>
                    <div className="font-semibold text-emerald-700">{activeNode.strategy}</div>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1.5 leading-tight">
                    DOM selector path & selector strategy tier used to capture the node.
                  </p>
                </div>

                {/* Question 3: How was it transformed? */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    <h4 className="text-xs font-mono font-bold text-neutral-800 uppercase">
                      How was it transformed?
                    </h4>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-neutral-200 font-mono text-xs text-neutral-800 shadow-2xs space-y-1">
                    {activeNode.transformations.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-neutral-400 font-bold">{idx + 1}.</span>
                        <span className="text-neutral-900">{t}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1.5 leading-tight">
                    Deterministic normalization sequence applied between raw capture and output.
                  </p>
                </div>

                {/* Question 4: How certain are we? */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                      4
                    </span>
                    <h4 className="text-xs font-mono font-bold text-neutral-800 uppercase">
                      How certain are we?
                    </h4>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-neutral-200 font-mono text-xs text-neutral-900 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-neutral-700">Confidence Score:</span>
                      <span className="font-bold text-neutral-900">{(activeNode.confidenceScore * 100).toFixed(1)}%</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1 font-sans">
                      {activeNode.confidenceRationale}
                    </p>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1.5 leading-tight">
                    Deterministic score derived from locator quality and format validation.
                  </p>
                </div>
              </div>

              {/* Cryptographic Evidence Fingerprint */}
              <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Hash className="w-4 h-4" />
                    CRYPTOGRAPHIC DOM EVIDENCE DIGEST
                  </span>
                  <span className="text-neutral-400 text-[10px]">Algorithm: SHA-256</span>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 text-[11px] text-neutral-300 break-all">
                  domEvidenceHash: {activeNode.domEvidenceHash}
                </div>
                <div className="mt-2 text-[11px] text-neutral-400 truncate">
                  Raw Snippet: "{activeNode.rawSnippet}"
                </div>
              </div>

              {/* Interactive Confidence Penalty Calculator */}
              <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-neutral-800 flex items-center gap-1.5 uppercase">
                    <Calculator className="w-4 h-4 text-neutral-600" />
                    Confidence Penalty Sensitivity Simulator
                  </span>
                  <span className="font-mono text-xs font-bold text-neutral-900">
                    Simulated Score: <span className={dynamicScore >= 0.8 ? 'text-emerald-700' : dynamicScore >= 0.6 ? 'text-amber-700' : 'text-rose-700'}>{(dynamicScore * 100).toFixed(1)}%</span>
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mb-3">
                  Test how DOM anomalies affect mathematical gating thresholds:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-neutral-200 cursor-pointer hover:bg-neutral-100">
                    <input
                      type="checkbox"
                      checked={penaltyRoleMissing}
                      onChange={(e) => setPenaltyRoleMissing(e.target.checked)}
                      className="rounded text-neutral-900 focus:ring-0"
                    />
                    <span>Missing role="article" (-10%)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-neutral-200 cursor-pointer hover:bg-neutral-100">
                    <input
                      type="checkbox"
                      checked={penaltyTruncated}
                      onChange={(e) => setPenaltyTruncated(e.target.checked)}
                      className="rounded text-neutral-900 focus:ring-0"
                    />
                    <span>Truncated copy unexpanded (-5%)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-neutral-200 cursor-pointer hover:bg-neutral-100">
                    <input
                      type="checkbox"
                      checked={penaltyFallbackLocator}
                      onChange={(e) => setPenaltyFallbackLocator(e.target.checked)}
                      className="rounded text-neutral-900 focus:ring-0"
                    />
                    <span>Tier-2 fallback used (-15%)</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-neutral-500">
              Select a field to inspect its provenance lineage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
