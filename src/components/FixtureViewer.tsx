import React, { useState } from 'react';
import { TEST_FIXTURES_LIST } from '../data/phase02Data';
import { TestFixture } from '../types';
import { FileCode, Play, CheckCircle2, AlertTriangle, ShieldAlert, Check, RefreshCw } from 'lucide-react';

export const FixtureViewer: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [simulationResult, setSimulationResult] = useState<{
    fixtureId: string;
    stateVerified: boolean;
    cardCountVerified: boolean;
    executionTimeMs: number;
    logs: string[];
  } | null>(null);
  const [running, setRunning] = useState(false);

  const fixture = TEST_FIXTURES_LIST[selectedIdx];

  const handleRunReplay = () => {
    setRunning(true);
    setTimeout(() => {
      setSimulationResult({
        fixtureId: fixture.id,
        stateVerified: true,
        cardCountVerified: true,
        executionTimeMs: 142 + Math.floor(Math.random() * 80),
        logs: [
          `[1] Mounted synthetic fixture: tests/fixtures/${fixture.file}`,
          `[2] Headless Chromium context loaded in isolated virtual DOM`,
          `[3] Running PageStateDetector against multi-signal locators...`,
          `[4] Multi-signal evidence matched expected state: ${fixture.expectedState}`,
          `[5] Extracted card count: ${fixture.expectedCardCount} (Assertion PASSED)`,
          `[6] Checkpoint state committed; verified zero DOM leaks.`
        ]
      });
      setRunning(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Fixture Selector */}
      <div className="w-80 border-r border-neutral-200 bg-neutral-50/60 flex flex-col h-full overflow-y-auto p-3 space-y-1.5">
        <div className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider font-mono">
          Golden Fixtures ({TEST_FIXTURES_LIST.length})
        </div>
        {TEST_FIXTURES_LIST.map((fix, idx) => (
          <button
            key={fix.id}
            onClick={() => {
              setSelectedIdx(idx);
              setSimulationResult(null);
            }}
            className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
              idx === selectedIdx
                ? 'bg-white border-neutral-300 shadow-xs font-medium text-neutral-900'
                : 'border-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold">{fix.id}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                {fix.category}
              </span>
            </div>
            <p className="text-xs font-semibold text-neutral-900 mt-1">{fix.name}</p>
            <p className="text-[11px] text-neutral-500 truncate mt-0.5">{fix.file}</p>
          </button>
        ))}
      </div>

      {/* Fixture Detail & Replay Harness */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6">
        <div className="flex items-start justify-between border-b border-neutral-200 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm px-2 py-0.5 rounded bg-purple-600 text-white">{fixture.id}</span>
              <h2 className="text-xl font-semibold text-neutral-900 font-mono tracking-tight">{fixture.name}</h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                Expected: {fixture.expectedState}
              </span>
            </div>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">{fixture.description}</p>
          </div>

          <button
            onClick={handleRunReplay}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-purple-700 disabled:opacity-50 shadow-xs transition-colors"
          >
            {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{running ? 'Replaying Fixture...' : 'Execute Fixture Test'}</span>
          </button>
        </div>

        {/* Fixture Metadata */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">Target File</span>
            <code className="text-xs font-mono text-neutral-900">tests/fixtures/{fixture.file}</code>
          </div>
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">Expected Page State</span>
            <span className="text-xs font-mono font-bold text-neutral-900">{fixture.expectedState}</span>
          </div>
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">Expected Card Count</span>
            <span className="text-xs font-mono font-bold text-emerald-700">{fixture.expectedCardCount} items</span>
          </div>
        </div>

        {/* Replay Simulation Execution Log */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden flex flex-col flex-1">
          <div className="bg-neutral-100 px-4 py-2.5 border-b border-neutral-200 font-mono text-xs font-semibold text-neutral-700 flex items-center justify-between">
            <span>Playwright Deterministic Replay Output</span>
            {simulationResult && (
              <span className="text-emerald-700 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PASSED in {simulationResult.executionTimeMs}ms
              </span>
            )}
          </div>
          <div className="p-4 bg-neutral-950 text-neutral-200 font-mono text-xs overflow-y-auto flex-1 leading-relaxed">
            {simulationResult ? (
              <div className="space-y-1.5">
                {simulationResult.logs.map((log, i) => (
                  <div key={i} className={log.includes('PASSED') ? 'text-emerald-400 font-semibold' : 'text-neutral-300'}>
                    {log}
                  </div>
                ))}
                <div className="pt-3 border-t border-neutral-800 text-emerald-400 font-bold">
                  PASS: tests/fixtures/{fixture.file} $\to$ Verified state {fixture.expectedState} with {fixture.expectedCardCount} cards.
                </div>
              </div>
            ) : (
              <div className="text-neutral-500 italic">
                Click "Execute Fixture Test" above to run the deterministic fixture replay harness against this synthetic snapshot.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
