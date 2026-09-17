import React, { useState, useMemo } from 'react';
import {
  QualificationEngine,
  DEFAULT_MODEL_V1,
  STRICT_MODEL_V2
} from '../utils/qualificationEngine';
import { GOLDEN_SCORING_DATASETS } from '../data/phase06FixturesAndAudit';
import {
  ScoringInputSnapshot,
  QualificationResult,
  ManualOverrideRecord,
  QualificationState
} from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Sparkles,
  Info,
  Scale,
  RotateCcw,
  Sliders,
  UserCheck,
  Building2,
  Globe,
  Radio,
  Clock,
  FileCheck
} from 'lucide-react';

export const QualificationSimulator: React.FC = () => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(GOLDEN_SCORING_DATASETS[0].id);
  const [selectedModelId, setSelectedModelId] = useState<'MODEL-V1-BALANCED' | 'MODEL-V2-STRICT'>('MODEL-V1-BALANCED');
  const [override, setOverride] = useState<ManualOverrideRecord | undefined>(undefined);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<QualificationState>('QUALIFIED');
  const [overrideReason, setOverrideReason] = useState('Senior analyst verified business state via state registry.');
  const [overrideReviewer, setOverrideReviewer] = useState('Analyst-Lead-402');

  const engine = useMemo(() => {
    return new QualificationEngine(selectedModelId === 'MODEL-V1-BALANCED' ? DEFAULT_MODEL_V1 : STRICT_MODEL_V2);
  }, [selectedModelId]);

  const currentDataset = useMemo(() => {
    return GOLDEN_SCORING_DATASETS.find(d => d.id === selectedDatasetId) || GOLDEN_SCORING_DATASETS[0];
  }, [selectedDatasetId]);

  const result: QualificationResult = useMemo(() => {
    return engine.evaluate(currentDataset.inputSnapshot, override);
  }, [engine, currentDataset, override]);

  const handleApplyOverride = () => {
    setOverride({
      overrideId: `OVR-${Date.now()}`,
      entityId: currentDataset.inputSnapshot.entityId,
      previousStatus: result.status,
      newStatus: overrideStatus,
      previousScore: result.score,
      reason: overrideReason,
      reviewer: overrideReviewer,
      appliedAt: new Date().toISOString(),
      policyVersion: '2026.03.R1'
    });
    setShowOverrideModal(false);
  };

  const handleClearOverride = () => {
    setOverride(undefined);
  };

  const getStatusBadge = (status: QualificationState) => {
    switch (status) {
      case 'VERIFIED_FOR_WORKFLOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'QUALIFIED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REVIEW_REQUIRED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'INSUFFICIENT_EVIDENCE':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
      case 'NOT_ELIGIBLE':
      case 'REJECTED_BY_RULE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 space-y-6">
      {/* Top Header & Scenario Selector */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Phase 06 Engine
              </span>
              <span className="text-xs font-mono text-neutral-500">
                Layered Qualification & Scoring Simulator
              </span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mt-1">
              Evidence-Driven Qualification Pipeline
            </h1>
          </div>

          {/* Model & Dataset Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg border border-neutral-200 text-xs">
              <span className="text-neutral-500 font-medium px-2">Model:</span>
              <button
                onClick={() => setSelectedModelId('MODEL-V1-BALANCED')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedModelId === 'MODEL-V1-BALANCED'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Model V1 (Balanced)
              </button>
              <button
                onClick={() => setSelectedModelId('MODEL-V2-STRICT')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedModelId === 'MODEL-V2-STRICT'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Model V2 (Strict Shadow)
              </button>
            </div>

            <button
              onClick={() => setShowOverrideModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>{override ? 'Edit Override' : 'Manual Override'}</span>
            </button>

            {override && (
              <button
                onClick={handleClearOverride}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Override</span>
              </button>
            )}
          </div>
        </div>

        {/* Dataset Quick Selection Grid */}
        <div className="space-y-1.5 border-t border-neutral-100 pt-3">
          <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Select Test Entity / Golden Scenario:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {GOLDEN_SCORING_DATASETS.map(d => {
              const isSelected = d.id === selectedDatasetId;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDatasetId(d.id);
                    setOverride(undefined);
                  }}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white border-neutral-900 shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-75">{d.id}</div>
                  <div className="text-xs font-semibold truncate mt-0.5">{d.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Score & Decision Banner */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-500">{result.entityId}</span>
            <span className="text-neutral-300">•</span>
            <span className="text-sm font-bold text-neutral-900">
              {currentDataset.inputSnapshot.advertiserName || '(Empty Advertiser)'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border font-mono ${getStatusBadge(
                result.status
              )}`}
            >
              {result.status}
            </span>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full border border-neutral-200 text-xs font-mono">
              <span className="text-neutral-500">Confidence:</span>
              <span
                className={`font-bold ${
                  result.confidence === 'HIGH'
                    ? 'text-emerald-700'
                    : result.confidence === 'MEDIUM'
                    ? 'text-blue-700'
                    : 'text-amber-700'
                }`}
              >
                {result.confidence} ({Math.round(result.confidenceScore * 100)}%)
              </span>
            </div>

            {override && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                <UserCheck className="w-3 h-3" />
                OVERRIDDEN
              </span>
            )}
          </div>
        </div>

        {/* Big Score Dial */}
        <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200 shrink-0">
          <div className="text-right">
            <div className="text-[11px] uppercase font-bold text-neutral-400">Total Bounded Score</div>
            <div className="text-xs text-neutral-500 font-mono">Max 100 pts (Capped)</div>
          </div>
          <div className="w-16 h-16 rounded-xl bg-purple-600 text-white flex flex-col items-center justify-center shadow-sm">
            <span className="text-2xl font-black font-mono leading-none">{result.score}</span>
            <span className="text-[9px] font-mono text-neutral-400 mt-0.5">/ 100</span>
          </div>
        </div>
      </div>

      {/* Hard Blockers Alert if any triggered */}
      {result.blockingConditions.some(b => b.triggered) && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>CRITICAL BLOCKING CONDITIONS ACTIVE</span>
          </div>
          <div className="space-y-1">
            {result.blockingConditions
              .filter(b => b.triggered)
              .map(b => (
                <div key={b.blockerId} className="text-xs text-rose-700 flex items-start gap-2">
                  <span className="font-mono font-bold shrink-0">[{b.blockerId}]:</span>
                  <span>{b.triggerReason}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4 Category Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category 1 */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
              <Radio className="w-3.5 h-3.5 text-indigo-600" />
              <span>Advertising Activity</span>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-700">
              {result.categoryScores.ADVERTISING_ACTIVITY.capped} / {result.categoryScores.ADVERTISING_ACTIVITY.max}
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (result.categoryScores.ADVERTISING_ACTIVITY.capped / result.categoryScores.ADVERTISING_ACTIVITY.max) * 100)}%`
              }}
            />
          </div>
          <div className="space-y-1 text-[11px] text-neutral-600">
            <div>Ads: <span className="font-semibold text-neutral-900">{currentDataset.inputSnapshot.canonicalAdCount} canonical</span></div>
            <div>Platforms: <span className="font-semibold text-neutral-900">{(currentDataset.inputSnapshot.platforms || []).join(', ') || 'None'}</span></div>
          </div>
        </div>

        {/* Category 2 */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Website & Destination</span>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-700">
              {result.categoryScores.WEBSITE_DESTINATION.capped} / {result.categoryScores.WEBSITE_DESTINATION.max}
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (result.categoryScores.WEBSITE_DESTINATION.capped / result.categoryScores.WEBSITE_DESTINATION.max) * 100)}%`
              }}
            />
          </div>
          <div className="space-y-1 text-[11px] text-neutral-600">
            <div>HTTP Reachable: <span className="font-semibold text-neutral-900">{currentDataset.inputSnapshot.landingReachable ? 'Yes (200 OK)' : 'No / Not Checked'}</span></div>
            <div>HTTPS TLS: <span className="font-semibold text-neutral-900">{currentDataset.inputSnapshot.httpsAvailable ? 'Active TLS' : 'Missing / Insecure'}</span></div>
          </div>
        </div>

        {/* Category 3 */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Identity Consistency</span>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-700">
              {result.categoryScores.IDENTITY_CONSISTENCY.capped} / {result.categoryScores.IDENTITY_CONSISTENCY.max}
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (result.categoryScores.IDENTITY_CONSISTENCY.capped / result.categoryScores.IDENTITY_CONSISTENCY.max) * 100)}%`
              }}
            />
          </div>
          <div className="space-y-1 text-[11px] text-neutral-600">
            <div>Consistency: <span className="font-semibold text-neutral-900">{currentDataset.inputSnapshot.identityConsistencyState || 'UNKNOWN'}</span></div>
            <div>Conflict: <span className="font-semibold text-neutral-900">{currentDataset.inputSnapshot.hasCriticalConflict ? 'Conflict Detected' : 'None'}</span></div>
          </div>
        </div>

        {/* Category 4 */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Commercial Contact</span>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-700">
              {result.categoryScores.BUSINESS_CONTACTABILITY.capped} / {result.categoryScores.BUSINESS_CONTACTABILITY.max}
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-600 h-1.5 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (result.categoryScores.BUSINESS_CONTACTABILITY.capped / result.categoryScores.BUSINESS_CONTACTABILITY.max) * 100)}%`
              }}
            />
          </div>
          <div className="space-y-1 text-[11px] text-neutral-600">
            <div>Email: <span className="font-semibold text-neutral-900">{currentDataset.inputSnapshot.publicBusinessEmail || 'None'}</span></div>
            <div>Phone: <span className="font-semibold text-neutral-900">{currentDataset.inputSnapshot.publicBusinessPhone || 'None'}</span></div>
          </div>
        </div>
      </div>

      {/* Factual Natural-Language Explanation Box */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 uppercase tracking-wider">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>Deterministic Audit Explanation</span>
        </div>
        <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-mono bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          {result.explanation}
        </div>
      </div>

      {/* Granular Signal Contributions Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Granular Signal Contributions ({result.signalContributions.length} Rules Evaluated)
          </span>
          <span className="text-[11px] font-mono text-neutral-500">Traceable to Evidence Snapshot</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-mono text-[10px] uppercase border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2">Signal ID</th>
                <th className="px-4 py-2">Name & Category</th>
                <th className="px-4 py-2">Evidence State</th>
                <th className="px-4 py-2">Freshness</th>
                <th className="px-4 py-2">Contribution</th>
                <th className="px-4 py-2">Rationale & Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {result.signalContributions.map(c => (
                <tr key={c.signalId} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-neutral-600 font-semibold">{c.signalId}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-neutral-900">{c.signalName}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{c.category}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                        c.evidenceState === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.evidenceState === 'ABSENT'
                          ? 'bg-neutral-100 text-neutral-600'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {c.evidenceState}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-neutral-600">{c.freshness}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-neutral-900">
                    +{c.pointsAwarded} <span className="text-[10px] text-neutral-400 font-normal">/ {c.maxPoints}</span>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600 text-[11px] max-w-xs truncate">
                    {c.rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-neutral-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Auditable Manual Override</h2>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">Target Qualification State:</label>
                <select
                  value={overrideStatus}
                  onChange={e => setOverrideStatus(e.target.value as QualificationState)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md font-mono"
                >
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="VERIFIED_FOR_WORKFLOW">VERIFIED_FOR_WORKFLOW</option>
                  <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
                  <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
                  <option value="REJECTED_BY_RULE">REJECTED_BY_RULE</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Reviewer ID:</label>
                <input
                  type="text"
                  value={overrideReviewer}
                  onChange={e => setOverrideReviewer(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Justification / Audit Reason:</label>
                <textarea
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  rows={3}
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md"
                />
              </div>

              <div className="p-2.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200 text-[11px]">
                Note: Overrides are strictly non-destructive. Raw evidence is preserved and this event is logged in the permanent audit trail.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyOverride}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md"
              >
                Save Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
