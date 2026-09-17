import React, { useState, useMemo } from 'react';
import {
  MODEL_REGISTRY,
  DEFAULT_MODEL_V1,
  STRICT_MODEL_V2,
  QualificationEngine
} from '../utils/qualificationEngine';
import { GOLDEN_SCORING_DATASETS } from '../data/phase06FixturesAndAudit';
import { ScoringModelDefinition, ModelEvaluationImpact } from '../types';
import {
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Scale,
  GitCompare,
  Sliders
} from 'lucide-react';

export const ModelRegistryAndImpactViewer: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ScoringModelDefinition>(DEFAULT_MODEL_V1);
  const [candidateModel, setCandidateModel] = useState<ScoringModelDefinition>(STRICT_MODEL_V2);

  const engine = useMemo(() => new QualificationEngine(), []);

  // Compute shadow-mode impact analysis across all golden test datasets
  const impactAnalysis: ModelEvaluationImpact = useMemo(() => {
    const snapshots = GOLDEN_SCORING_DATASETS.map(d => d.inputSnapshot);
    return engine.evaluateImpact(DEFAULT_MODEL_V1, candidateModel, snapshots);
  }, [engine, candidateModel]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'SHADOW':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300';
      case 'RETIRED':
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Governance & Registry
            </span>
            <span className="text-xs font-mono text-neutral-500">
              Scoring Model Registry & Shadow Mode Evaluation
            </span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">
            Model Registry & Impact Analysis
          </h1>
        </div>
      </div>

      {/* Model Registry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODEL_REGISTRY.map(m => {
          const isSelected = selectedModel.modelId === m.modelId;
          return (
            <div
              key={m.modelId}
              onClick={() => setSelectedModel(m)}
              className={`p-5 rounded-xl border cursor-pointer transition-all bg-white shadow-xs ${
                isSelected ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-neutral-500">{m.modelId}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(m.status)}`}>
                  {m.status}
                </span>
              </div>
              <div className="text-sm font-bold text-neutral-900 mt-2">{m.name}</div>
              <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">{m.description}</p>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>v{m.version}</span>
                <span>{m.rules.length} Rules</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shadow Mode Impact Analysis Box */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-neutral-900">
              Shadow-Mode Impact Analysis (Active vs Candidate)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500">Active:</span>
            <span className="font-bold text-neutral-900">MODEL-V1-BALANCED (1.2.0)</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-500">Candidate:</span>
            <span className="font-bold text-indigo-700">MODEL-V2-STRICT (2.0.0-rc1)</span>
          </div>
        </div>

        {/* High-level metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div className="text-[10px] uppercase font-mono font-bold text-neutral-500">Evaluated Entities</div>
            <div className="text-2xl font-black font-mono text-neutral-900 mt-1">{impactAnalysis.evaluatedEntitiesCount}</div>
            <div className="text-[11px] text-neutral-500">Golden test scenarios</div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div className="text-[10px] uppercase font-mono font-bold text-neutral-500">Active Mean Score</div>
            <div className="text-2xl font-black font-mono text-neutral-900 mt-1">{impactAnalysis.meanScoreActive}</div>
            <div className="text-[11px] text-neutral-500">Model V1 average</div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div className="text-[10px] uppercase font-mono font-bold text-neutral-500">Candidate Mean Score</div>
            <div className="text-2xl font-black font-mono text-indigo-700 mt-1">{impactAnalysis.meanScoreCandidate}</div>
            <div className="text-[11px] text-neutral-500">
              Delta: <span className={impactAnalysis.scoreDelta >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                {impactAnalysis.scoreDelta >= 0 ? `+${impactAnalysis.scoreDelta}` : impactAnalysis.scoreDelta} pts
              </span>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div className="text-[10px] uppercase font-mono font-bold text-neutral-500">Distribution Shift</div>
            <div className="text-2xl font-black font-mono text-amber-700 mt-1">{impactAnalysis.distributionShiftPercent}%</div>
            <div className="text-[11px] text-neutral-500">Status transition drift</div>
          </div>
        </div>

        {/* Transition matrix */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Qualification Status Transitions
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(impactAnalysis.statusTransitions).map(([trans, count]) => {
              const [from, to] = trans.split(' -> ');
              const changed = from !== to;
              return (
                <div
                  key={trans}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between font-mono ${
                    changed ? 'bg-amber-50/60 border-amber-200 text-amber-900' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold">{from}</span>
                    <ArrowRight className="w-3 h-3 shrink-0 text-neutral-400" />
                    <span className="font-semibold">{to}</span>
                  </div>
                  <span className="font-bold px-2 py-0.5 rounded bg-white border border-neutral-200 shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Model Details & Rules Inspector */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Rules Catalog & Category Caps for {selectedModel.name}
            </h2>
            <p className="text-xs text-neutral-500 font-mono">
              Model ID: {selectedModel.modelId} • Version: {selectedModel.version}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500">Total Rules:</span>
            <span className="font-bold text-neutral-900">{selectedModel.rules.length}</span>
          </div>
        </div>

        {/* Category Caps Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(selectedModel.categoryCaps).map(([cat, cap]) => (
            <div key={cat} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <div className="text-[10px] text-neutral-500 font-mono uppercase truncate">{cat}</div>
              <div className="text-base font-bold font-mono text-neutral-900 mt-1">Cap: {cap} pts</div>
            </div>
          ))}
        </div>

        {/* Rules List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-mono text-[10px] uppercase border-b border-neutral-200">
              <tr>
                <th className="px-3 py-2">Rule ID</th>
                <th className="px-3 py-2">Name & Category</th>
                <th className="px-3 py-2">Criterion</th>
                <th className="px-3 py-2">Max Contribution</th>
                <th className="px-3 py-2">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {selectedModel.rules.map(r => (
                <tr key={r.ruleId} className="hover:bg-neutral-50/50">
                  <td className="px-3 py-2.5 font-mono text-neutral-600 font-semibold">{r.ruleId}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-neutral-900">{r.name}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">{r.category}</div>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">{r.criterion}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-neutral-900">+{r.maxContribution} pts</td>
                  <td className="px-3 py-2.5 text-neutral-500 text-[11px] max-w-xs">{r.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
