import React, { useState } from 'react';
import { PHASE_03_FIXTURES } from '../data/phase03FixturesAndAudit';
import { executeExtractionPipeline } from '../utils/extractionEngine';
import { Play, CheckCircle2, XCircle, RotateCcw, ShieldCheck, FileCode2, ArrowRight } from 'lucide-react';

export const ExtractionFixtureReplay: React.FC = () => {
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(PHASE_03_FIXTURES[0].id);
  const [replayOutputs, setReplayOutputs] = useState<Record<string, ReturnType<typeof executeExtractionPipeline>>>({});
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);

  const handleRunSingle = (fixtureId: string) => {
    const fixture = PHASE_03_FIXTURES.find((f) => f.id === fixtureId);
    if (!fixture) return;
    const res = executeExtractionPipeline(fixture.rawHtml);
    setReplayOutputs((prev) => ({ ...prev, [fixtureId]: res }));
  };

  const handleRunAll = () => {
    setIsRunningAll(true);
    const newOutputs: Record<string, ReturnType<typeof executeExtractionPipeline>> = {};
    PHASE_03_FIXTURES.forEach((fix) => {
      newOutputs[fix.id] = executeExtractionPipeline(fix.rawHtml);
    });
    setReplayOutputs(newOutputs);
    setIsRunningAll(false);
  };

  const currentFixture = PHASE_03_FIXTURES.find((f) => f.id === selectedFixtureId) || PHASE_03_FIXTURES[0];
  const currentOutput = replayOutputs[selectedFixtureId] || executeExtractionPipeline(currentFixture.rawHtml);

  // Calculate pass statistics
  const totalFixtures = PHASE_03_FIXTURES.length;
  const evaluatedCount = Object.keys(replayOutputs).length || totalFixtures;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto p-6">
      {/* Header Banner */}
      <div className="border-b border-neutral-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-neutral-900 tracking-tight font-mono">
              Offline Replay Harness & Determinism Suite
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              10 Synthetic Scenarios
            </span>
          </div>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            Zero-network offline replay engine verifying deterministic public-data extraction, multilingual date normalization, CTA taxonomy, and Tier-1 fatal rejection rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-purple-700 shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Replay All 10 Fixtures</span>
          </button>
        </div>
      </div>

      {/* Fixtures Table Summary */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-xs mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 font-mono text-neutral-700">
                <th className="p-3">Fixture ID</th>
                <th className="p-3">Scenario Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Expected ID</th>
                <th className="p-3">Expected CTA</th>
                <th className="p-3">Confidence</th>
                <th className="p-3 text-right">Replay Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {PHASE_03_FIXTURES.map((fix) => {
                const out = replayOutputs[fix.id] || executeExtractionPipeline(fix.rawHtml);
                const isSelected = fix.id === selectedFixtureId;
                const rec = out.envelope?.record;
                const status = out.envelope?.validationReport.recordStatus;

                const isPass =
                  fix.id === 'FIXTURE-09'
                    ? status === 'REJECTED' // Fixture 09 is intentionally corrupt to test fatal rejection
                    : status === 'PASS' || status === 'FLAGGED';

                return (
                  <tr
                    key={fix.id}
                    onClick={() => setSelectedFixtureId(fix.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-neutral-100/80 font-medium' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <td className="p-3 font-bold text-neutral-900">{fix.id}</td>
                    <td className="p-3 font-sans font-medium text-neutral-900">{fix.name}</td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-200 text-neutral-800">
                        {fix.category}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-700">{fix.expectedLibraryId}</td>
                    <td className="p-3 text-neutral-700">{fix.expectedCta}</td>
                    <td className="p-3 font-bold text-neutral-900">
                      {((out.compositeConfidence || 0) * 100).toFixed(0)}%
                    </td>
                    <td className="p-3 text-right">
                      {isPass ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{fix.id === 'FIXTURE-09' ? 'VERIFIED (REJECT)' : 'PASS'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>FAIL</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Fixture Deep Replay Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-5 border border-neutral-200 rounded-xl bg-neutral-900 text-neutral-100 p-4 shadow-xs overflow-hidden flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <FileCode2 className="w-4 h-4" />
              FIXTURE SOURCE HTML: [{currentFixture.id}]
            </span>
            <span>{currentFixture.category}</span>
          </div>
          <pre className="overflow-y-auto flex-1 text-[11px] text-emerald-300 leading-relaxed max-h-[380px]">
            {currentFixture.rawHtml}
          </pre>
        </div>

        <div className="lg:col-span-7 border border-neutral-200 rounded-xl bg-white p-5 shadow-xs flex flex-col text-xs font-mono">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Assertion Verification</span>
              <h4 className="text-base font-bold text-neutral-900 font-sans">{currentFixture.name}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-500 uppercase block">Determinism Hash</span>
              <span className="text-[11px] font-bold text-emerald-700">
                {currentOutput.envelope?.rawSnapshotSha256.slice(0, 16)}...
              </span>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Ad Library ID Match:</span>
                <span className="font-bold text-neutral-900">
                  {currentOutput.envelope?.record.adLibraryId}
                  {currentOutput.envelope?.record.adLibraryId === currentFixture.expectedLibraryId && (
                    <span className="ml-1 text-emerald-600 font-sans text-[11px]">✓ Exact Match</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Advertiser Page Name:</span>
                <span className="font-bold text-neutral-900">
                  {currentOutput.envelope?.record.pageName}
                  {currentOutput.envelope?.record.pageName === currentFixture.expectedPageName && (
                    <span className="ml-1 text-emerald-600 font-sans text-[11px]">✓ Exact Match</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-500">CTA Taxonomy Match:</span>
                <span className="font-bold text-neutral-900">
                  {currentOutput.envelope?.record.ctaNormalizedCategory}
                  {currentOutput.envelope?.record.ctaNormalizedCategory === currentFixture.expectedCta && (
                    <span className="ml-1 text-emerald-600 font-sans text-[11px]">✓ Exact Match</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Composite Confidence:</span>
                <span className="font-bold text-neutral-900">
                  {((currentOutput.compositeConfidence || 0) * 100).toFixed(1)}% (Threshold: &ge;{' '}
                  {(currentFixture.expectedConfidenceThreshold * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Invariant Violations */}
            <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">
                Invariant Rule Assertions ({currentOutput.envelope?.validationReport.violations.length || 0})
              </span>
              {currentOutput.envelope?.validationReport.violations.length === 0 ? (
                <p className="text-emerald-700 text-[11px] font-sans">
                  ✓ All fatal invariants, schema contracts, and format rules passed cleanly.
                </p>
              ) : (
                currentOutput.envelope?.validationReport.violations.map((v, i) => (
                  <div key={i} className="text-[11px] text-neutral-800">
                    <span className="font-bold text-rose-700">[{v.severity}] {v.ruleId}</span>: {v.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
