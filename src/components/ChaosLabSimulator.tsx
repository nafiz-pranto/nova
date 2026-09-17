import React, { useState } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Server,
  Terminal,
  Activity
} from 'lucide-react';
import { ChaosScenario } from '../types';
import { CHAOS_SCENARIOS } from '../data/phase09FixturesAndAudit';

interface ChaosLabSimulatorProps {
  onNotify?: (msg: string) => void;
}

export const ChaosLabSimulator: React.FC<ChaosLabSimulatorProps> = ({ onNotify }) => {
  const [selectedScenario, setSelectedScenario] = useState<ChaosScenario>(CHAOS_SCENARIOS[0]);
  const [simulationState, setSimulationState] = useState<'IDLE' | 'INJECTING' | 'DETECTING' | 'CONTAINING' | 'RECOVERING' | 'VERIFYING' | 'COMPLETED'>('IDLE');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);

  const loopSteps = [
    { name: 'DETECT', desc: 'Detect anomaly via probe, timeout, or checksum' },
    { name: 'CLASSIFY', desc: 'Map failure to 1 of 12 standard categories' },
    { name: 'CONTAIN', desc: 'Isolate failure; freeze state; engage guard' },
    { name: 'RECOVER', desc: 'Execute automated runbook or checkpoint restore' },
    { name: 'VERIFY', desc: 'Validate payload integrity and SHA-256 digest' },
    { name: 'AUDIT', desc: 'Commit non-repudiation record in compliance ledger' }
  ];

  const handleRunSimulation = (scenario: ChaosScenario) => {
    setSelectedScenario(scenario);
    setSimulationState('INJECTING');
    setActiveStepIndex(0);
    setAuditLogs([
      `[${new Date().toISOString()}] [CHAOS-INJECT] Starting scenario: ${scenario.name}`,
      `[${new Date().toISOString()}] [FAULT] Injected: "${scenario.faultInjected}"`
    ]);

    // Step 1: Detect
    setTimeout(() => {
      setActiveStepIndex(1);
      setSimulationState('DETECTING');
      setAuditLogs(prev => [
        ...prev,
        `[${new Date().toISOString()}] [DETECT] ${scenario.expectedDetection}`
      ]);

      // Step 2: Contain
      setTimeout(() => {
        setActiveStepIndex(2);
        setSimulationState('CONTAINING');
        setAuditLogs(prev => [
          ...prev,
          `[${new Date().toISOString()}] [CONTAIN] ${scenario.containmentAction}`
        ]);

        // Step 3: Recover
        setTimeout(() => {
          setActiveStepIndex(3);
          setSimulationState('RECOVERING');
          setAuditLogs(prev => [
            ...prev,
            `[${new Date().toISOString()}] [RECOVER] Initiating recovery sequence...`,
            `[${new Date().toISOString()}] [RECOVER] Lifecycle Transitions: ${scenario.lifecycleTransitions.join(' -> ')}`
          ]);

          // Step 4: Verify
          setTimeout(() => {
            setActiveStepIndex(4);
            setSimulationState('VERIFYING');
            setAuditLogs(prev => [
              ...prev,
              `[${new Date().toISOString()}] [VERIFY] ${scenario.recoveryVerification}`
            ]);

            // Step 5: Audit & Complete
            setTimeout(() => {
              setActiveStepIndex(5);
              setSimulationState('COMPLETED');
              setAuditLogs(prev => [
                ...prev,
                `[${new Date().toISOString()}] [AUDIT] Invariant Verified: Zero silent corruption; Zero evasion tactics used.`,
                `[${new Date().toISOString()}] [STATUS] Experiment ${scenario.id} PASSED.`
              ]);
              if (onNotify) {
                onNotify(`Chaos test ${scenario.id} completed successfully with verified recovery.`);
              }
            }, 800);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Chaos Engineering & Failure Injection Lab</h2>
              <p className="text-xs text-neutral-500">
                Automated failure injection testing the DETECT &rarr; CLASSIFY &rarr; CONTAIN &rarr; RECOVER &rarr; VERIFY &rarr; AUDIT loop
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            STAGING CLUSTER ENVIRONMENT
          </span>
        </div>

        {/* Operating Loop Visualization */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1">
          {loopSteps.map((step, idx) => {
            const isCurrent = activeStepIndex === idx && simulationState !== 'IDLE';
            const isPassed = activeStepIndex > idx || simulationState === 'COMPLETED';

            return (
              <div
                key={step.name}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 text-amber-950 font-bold'
                    : isPassed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-xs font-mono mb-1">
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px]">0{idx + 1}.</span>}
                  <span>{step.name}</span>
                </div>
                <div className="text-[10px] line-clamp-2 leading-tight opacity-75">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Scenario Selector & Live Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenarios List */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-semibold text-neutral-900 uppercase font-mono">6 Chaos Scenarios</h3>
            <span className="text-[10px] font-mono text-neutral-500">Continuous CI Tests</span>
          </div>

          <div className="space-y-2">
            {CHAOS_SCENARIOS.map(sc => {
              const isSelected = selectedScenario.id === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white border-neutral-900 shadow-xs'
                      : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px]">{sc.id.toUpperCase()}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {sc.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs mt-1">{sc.name}</h4>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {sc.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Scenario Runner & Trace Inspector */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selected Scenario Details */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    {selectedScenario.id.toUpperCase()}
                  </span>
                  <h3 className="font-semibold text-neutral-900 text-sm">{selectedScenario.name}</h3>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{selectedScenario.description}</p>
              </div>

              <button
                onClick={() => handleRunSimulation(selectedScenario)}
                disabled={simulationState !== 'IDLE' && simulationState !== 'COMPLETED'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Inject & Run Test
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-neutral-500 font-medium text-[11px] mb-1">Fault Injected:</div>
                <div className="font-mono text-neutral-800 text-xs">{selectedScenario.faultInjected}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-neutral-500 font-medium text-[11px] mb-1">Detection Mechanism:</div>
                <div className="text-neutral-800 text-xs">{selectedScenario.expectedDetection}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-neutral-500 font-medium text-[11px] mb-1">Containment Action:</div>
                <div className="text-neutral-800 text-xs">{selectedScenario.containmentAction}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-neutral-500 font-medium text-[11px] mb-1">Recovery Verification:</div>
                <div className="text-neutral-800 text-xs">{selectedScenario.recoveryVerification}</div>
              </div>
            </div>

            {/* Lifecycle State Transitions */}
            <div className="mt-4 pt-3 border-t border-neutral-100">
              <div className="text-[11px] font-mono text-neutral-500 mb-2">Verified Lifecycle State Path:</div>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {selectedScenario.lifecycleTransitions.map((st, i) => (
                  <React.Fragment key={st + i}>
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-800 rounded font-mono font-bold text-xs">
                      {st}
                    </span>
                    {i < selectedScenario.lifecycleTransitions.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="bg-neutral-900 text-neutral-200 rounded-xl p-4 font-mono text-xs shadow-md">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-neutral-300 font-semibold text-[11px]">Chaos Execution Stream</span>
              </div>
              <span className="text-[10px] text-neutral-500">W3C Trace Carrier Active</span>
            </div>

            <div className="space-y-1 max-h-52 overflow-y-auto font-mono text-[11px] leading-relaxed">
              {auditLogs.length === 0 ? (
                <div className="text-neutral-500 py-6 text-center">
                  Select a scenario above and click &quot;Inject & Run Test&quot; to execute live failure simulation.
                </div>
              ) : (
                auditLogs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes('[FAULT]')
                        ? 'text-rose-400'
                        : log.includes('[DETECT]')
                        ? 'text-amber-400'
                        : log.includes('[VERIFY]')
                        ? 'text-sky-400'
                        : log.includes('[AUDIT]') || log.includes('[STATUS]')
                        ? 'text-emerald-400 font-bold'
                        : 'text-neutral-300'
                    }
                  >
                    {log}
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
