import React, { useState } from 'react';
import { STATE_TRANSITIONS } from '../data/specificationData';
import { JobState } from '../types';
import { Play, AlertTriangle, ShieldAlert, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

const ALL_STATES: JobState[] = [
  'CREATED',
  'QUEUED',
  'STARTING',
  'NAVIGATING',
  'COLLECTING',
  'VALIDATING',
  'CHECKPOINTING',
  'PAUSED',
  'BLOCKED',
  'CHALLENGED',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
  'CANCELLED'
];

export const StateMachineVisualizer: React.FC = () => {
  const [currentState, setCurrentState] = useState<JobState>('CREATED');
  const [history, setHistory] = useState<{ from: JobState; to: JobState; trigger: string }[]>([]);

  const availableTransitions = STATE_TRANSITIONS.filter((t) => t.from === currentState);

  const handleTransition = (to: JobState, trigger: string) => {
    setHistory((prev) => [...prev, { from: currentState, to, trigger }]);
    setCurrentState(to);
  };

  const handleReset = () => {
    setCurrentState('CREATED');
    setHistory([]);
  };

  const isTerminal = ['COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED'].includes(currentState);
  const isHalted = ['BLOCKED', 'CHALLENGED'].includes(currentState);

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto p-6">
      <div className="border-b border-neutral-200 pb-4 mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-neutral-900 tracking-tight font-mono">Job & Run FSM Engine</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
              14 Discrete States
            </span>
          </div>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            Deterministic Finite State Machine governing the execution lifecycle. Explicit guards prevent automated retries on anti-bot challenges and platform blocks.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset FSM Simulator</span>
        </button>
      </div>

      {/* Interactive Status & Alert Bar */}
      {isHalted && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900 font-mono">
              NON-CIRCUMVENTION PROTOCOL ACTIVATED ({currentState})
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Automated scraping is immediately frozen. The current DOM cursor and batch checkpoint are committed to Postgres. Automated retry or proxy-cycling is strictly prohibited by architectural rule. Operator review is required to unpause or archive this job.
            </p>
          </div>
        </div>
      )}

      {isTerminal && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-emerald-900 font-mono">TERMINAL STATE REACHED ({currentState})</h4>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              The run has terminated deterministically. All collected records have been verified and indexed. No further transitions are permitted for this run ID.
            </p>
          </div>
        </div>
      )}

      {/* Current State Indicator & Transition Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-1">Active State</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-lg font-mono font-bold text-neutral-900">{currentState}</span>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-3 font-normal">
            Step {history.length + 1} of execution lifecycle
          </p>
        </div>

        <div className="md:col-span-2 p-4 rounded-lg border border-neutral-200 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-2">
            Permitted State Transitions ({availableTransitions.length})
          </span>
          {availableTransitions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableTransitions.map((t) => (
                <button
                  key={`${t.from}-${t.to}-${t.trigger}`}
                  onClick={() => handleTransition(t.to, t.trigger)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 text-left transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                      <span className="font-mono text-xs font-semibold text-neutral-900">{t.to}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{t.trigger}</p>
                    {t.guard && <span className="text-[10px] text-neutral-400 italic">Guard: {t.guard}</span>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-neutral-500 italic py-2">
              No further transitions possible from terminal state {currentState}.
            </div>
          )}
        </div>
      </div>

      {/* State Grid Map */}
      <div className="border border-neutral-200 rounded-lg p-5 mb-8 bg-neutral-50/40">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-700 mb-3">
          Comprehensive State Graph Matrix
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {ALL_STATES.map((st) => {
            const isActive = st === currentState;
            const isTerminalSt = ['COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED'].includes(st);
            const isDangerSt = ['BLOCKED', 'CHALLENGED'].includes(st);

            return (
              <div
                key={st}
                className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white border-neutral-900 ring-2 ring-neutral-900 ring-offset-2 font-semibold'
                    : isDangerSt
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : isTerminalSt
                    ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    : 'bg-white text-neutral-800 border-neutral-200'
                }`}
              >
                {st}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transition Audit Log */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="bg-neutral-100 px-4 py-2.5 border-b border-neutral-200 font-mono text-xs font-semibold text-neutral-700">
          State Transition Audit Trail ({history.length})
        </div>
        <div className="divide-y divide-neutral-200 max-h-48 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-4 text-xs text-neutral-400 italic">No transitions executed yet. Trigger a state transition above.</div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="p-3 text-xs flex items-center justify-between hover:bg-neutral-50">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-neutral-400">#{i + 1}</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800">{h.from}</span>
                  <ArrowRight className="w-3 h-3 text-neutral-400" />
                  <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white">{h.to}</span>
                </div>
                <span className="text-neutral-500 text-[11px]">{h.trigger}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
