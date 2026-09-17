import React, { useState } from 'react';
import { PAGE_STATE_DEFINITIONS } from '../data/phase02Data';
import { PageState } from '../types';
import { Play, RotateCcw, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, Eye, ShieldCheck } from 'lucide-react';

export const PageStateSimulator: React.FC = () => {
  const [currentState, setCurrentState] = useState<PageState>('UNKNOWN');
  const [history, setHistory] = useState<{ from: PageState; to: PageState; trigger: string }[]>([]);

  const currentDef = PAGE_STATE_DEFINITIONS.find((d) => d.state === currentState) || PAGE_STATE_DEFINITIONS[0];

  const handleTransition = (to: PageState) => {
    setHistory((prev) => [...prev, { from: currentState, to, trigger: `User simulated trigger to ${to}` }]);
    setCurrentState(to);
  };

  const handleReset = () => {
    setCurrentState('UNKNOWN');
    setHistory([]);
  };

  const isHalted = ['CHALLENGE_DETECTED', 'BLOCKED', 'LOGIN_REQUIRED', 'UI_CHANGED'].includes(currentState);
  const isTerminal = ['CLOSED', 'END_OF_RESULTS'].includes(currentState);

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto p-6">
      <div className="border-b border-neutral-200 pb-4 mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-neutral-900 tracking-tight font-mono">Page State Machine Simulator</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
              15 Discrete States
            </span>
          </div>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            Simulates the Page State Machine governing the Meta Ad Library browser automation lifecycle. Every state is guarded by explicit DOM evidence.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Simulator</span>
        </button>
      </div>

      {/* Defensive Alert Banner */}
      {isHalted && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900 font-mono">
              DEFENSIVE SAFETY INVARIANT TRIGGERED ({currentState})
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Automated actions are frozen immediately. The current scroll cursor and batch checkpoint are committed to the orchestrator. Automated retry, proxy cycling, or stealth evasion is strictly prohibited by specification. Operator review is required to resume.
            </p>
          </div>
        </div>
      )}

      {/* Active State Card and Allowed Transitions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-1">Active Page State</span>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isHalted ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="text-lg font-mono font-bold text-neutral-900">{currentState}</span>
            </div>
            <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
              CATEGORY: {currentDef.category}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">Required Evidence:</span>
            <ul className="text-xs text-neutral-700 list-disc pl-4 space-y-1">
              {currentDef.requiredEvidence.map((ev, i) => (
                <li key={i}>{ev}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 p-4 rounded-lg border border-neutral-200 bg-white flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-1">
              Permitted Next Transitions ({currentDef.allowedTransitions.length})
            </span>
            <p className="text-xs text-neutral-600 mb-3">{currentDef.description}</p>
          </div>

          {currentDef.allowedTransitions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentDef.allowedTransitions.map((target) => (
                <button
                  key={target}
                  onClick={() => handleTransition(target)}
                  className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                    <span className="font-mono text-xs font-semibold text-neutral-900">{target}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                    Advance
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-neutral-500 italic py-4">
              Terminal state reached ({currentState}). No further transitions allowed.
            </div>
          )}
        </div>
      </div>

      {/* Full 15-State Grid */}
      <div className="border border-neutral-200 rounded-lg p-5 mb-8 bg-neutral-50/40">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-700 mb-3">
          Comprehensive Page State Grid
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PAGE_STATE_DEFINITIONS.map((def) => {
            const isActive = def.state === currentState;
            const isDanger = ['CHALLENGE_DETECTED', 'BLOCKED', 'LOGIN_REQUIRED', 'UI_CHANGED'].includes(def.state);
            const isTerm = ['CLOSED', 'END_OF_RESULTS'].includes(def.state);

            return (
              <div
                key={def.state}
                className={`p-3 rounded-lg border text-center font-mono text-xs transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white border-neutral-900 ring-2 ring-neutral-900 ring-offset-2 font-semibold'
                    : isDanger
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : isTerm
                    ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    : 'bg-white text-neutral-800 border-neutral-200'
                }`}
              >
                <div className="font-bold">{def.state}</div>
                <div className="text-[10px] opacity-75 mt-1">{def.category}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transition Audit Trail */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="bg-neutral-100 px-4 py-2.5 border-b border-neutral-200 font-mono text-xs font-semibold text-neutral-700">
          Simulation Transition Log ({history.length})
        </div>
        <div className="divide-y divide-neutral-200 max-h-48 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-4 text-xs text-neutral-400 italic">No transitions yet. Advance from the options above.</div>
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
