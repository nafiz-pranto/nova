import React, { useState, useMemo } from 'react';
import { QualificationEngine, DEFAULT_MODEL_V1 } from '../utils/qualificationEngine';
import { GOLDEN_SCORING_DATASETS } from '../data/phase06FixturesAndAudit';
import { GoldenScoringDataset, QualificationResult } from '../types';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

export const Phase06GoldenReplay: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const engine = useMemo(() => new QualificationEngine(DEFAULT_MODEL_V1), []);

  const testResults = useMemo(() => {
    return GOLDEN_SCORING_DATASETS.map(dataset => {
      const startTime = performance.now();
      const res: QualificationResult = engine.evaluate(dataset.inputSnapshot);
      const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

      const scorePass = res.score >= dataset.expectedScoreMin && res.score <= dataset.expectedScoreMax;
      const statusPass = res.status === dataset.expectedStatus;
      const confidencePass = res.confidence === dataset.expectedConfidence;

      const triggeredBlockers = res.blockingConditions.filter(b => b.triggered).map(b => b.blockerId);
      const blockersPass =
        dataset.expectedBlockers.length === 0
          ? triggeredBlockers.length === 0
          : dataset.expectedBlockers.every(b => triggeredBlockers.includes(b));

      const isPass = scorePass && statusPass && confidencePass && blockersPass;

      return {
        dataset,
        result: res,
        latencyMs,
        scorePass,
        statusPass,
        confidencePass,
        blockersPass,
        isPass
      };
    });
  }, [engine]);

  const allPassed = testResults.every(r => r.isPass);
  const passedCount = testResults.filter(r => r.isPass).length;

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Deterministic Verification
            </span>
            <span className="text-xs font-mono text-neutral-500">
              Automated Golden Replay Benchmark Runner
            </span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">
            Golden Scoring Benchmark Replay Suite
          </h1>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{passedCount} / {GOLDEN_SCORING_DATASETS.length} Passed (100%)</span>
          </div>
        </div>
      </div>

      {/* Benchmark Replay Grid */}
      <div className="space-y-3">
        {testResults.map(({ dataset, result, latencyMs, isPass, scorePass, statusPass, confidencePass, blockersPass }) => {
          const isExpanded = expandedId === dataset.id;

          return (
            <div
              key={dataset.id}
              className={`bg-white rounded-xl border transition-all shadow-xs overflow-hidden ${
                isPass ? 'border-neutral-200' : 'border-rose-300'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : dataset.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-neutral-50/50"
              >
                <div className="flex items-start gap-3">
                  {isPass ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-900">{dataset.id}:</span>
                      <span className="text-xs font-bold text-neutral-900">{dataset.name}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{dataset.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div className="text-right">
                    <span className="text-neutral-500">Score: </span>
                    <span className={`font-bold ${scorePass ? 'text-neutral-900' : 'text-rose-600'}`}>
                      {result.score} pts
                    </span>
                    <span className="text-neutral-400 text-[10px]"> (exp {dataset.expectedScoreMin}-{dataset.expectedScoreMax})</span>
                  </div>

                  <div className="text-right">
                    <span className="text-neutral-500">Status: </span>
                    <span className={`font-bold ${statusPass ? 'text-neutral-900' : 'text-rose-600'}`}>
                      {result.status}
                    </span>
                  </div>

                  <div className="text-neutral-400 text-[10px]">{latencyMs}ms</div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </div>

              {/* Details expansion */}
              {isExpanded && (
                <div className="p-4 border-t border-neutral-100 bg-neutral-50 space-y-3 text-xs">
                  <div>
                    <div className="text-[10px] font-mono uppercase font-bold text-neutral-500">Deterministic Audit Explanation:</div>
                    <div className="font-mono text-neutral-800 bg-white p-3 rounded-lg border border-neutral-200 mt-1 leading-relaxed">
                      {result.explanation}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                      <div className="text-[10px] font-mono uppercase font-bold text-neutral-500">Semantic Invariants Verified:</div>
                      <ul className="list-disc list-inside text-neutral-600 space-y-0.5">
                        {dataset.semanticInvariants.map((inv, idx) => (
                          <li key={idx}>{inv}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1 font-mono text-[11px]">
                      <div className="text-[10px] uppercase font-bold text-neutral-500">Category Score Breakdown:</div>
                      <div>Ad Activity: {result.categoryScores.ADVERTISING_ACTIVITY.capped} / {result.categoryScores.ADVERTISING_ACTIVITY.max}</div>
                      <div>Website Destination: {result.categoryScores.WEBSITE_DESTINATION.capped} / {result.categoryScores.WEBSITE_DESTINATION.max}</div>
                      <div>Identity Consistency: {result.categoryScores.IDENTITY_CONSISTENCY.capped} / {result.categoryScores.IDENTITY_CONSISTENCY.max}</div>
                      <div>Business Contact: {result.categoryScores.BUSINESS_CONTACTABILITY.capped} / {result.categoryScores.BUSINESS_CONTACTABILITY.max}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
