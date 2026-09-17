import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Radio,
  Server,
  Activity,
  Zap,
  RotateCcw,
  CheckCircle2,
  Clock,
  Lock,
  Cpu,
  RefreshCw,
  Eye,
  Send,
  Power
} from 'lucide-react';
import {
  WorkerLeaseModel,
  CircuitBreakerModel,
  SystemPauseMode,
  KillSwitchScope
} from '../types';
import {
  SAMPLE_WORKER_FLEET,
  INITIAL_CIRCUIT_BREAKERS,
  SYSTEM_PAUSE_MODES
} from '../data/phase09FixturesAndAudit';

interface OperationalCockpitProps {
  onNotify?: (msg: string) => void;
}

export const OperationalCockpit: React.FC<OperationalCockpitProps> = ({ onNotify }) => {
  // Operational state
  const [currentMode, setCurrentMode] = useState<SystemPauseMode>('NORMAL');
  const [pendingMode, setPendingMode] = useState<SystemPauseMode | null>(null);
  const [pauseReason, setPauseReason] = useState<string>('');
  const [operatorId, setOperatorId] = useState<string>('sre-lead-01');

  // Kill switches
  const [killSwitches, setKillSwitches] = useState<{
    id: string;
    scope: KillSwitchScope;
    target: string;
    engaged: boolean;
    reason: string;
  }[]>([
    { id: 'ks-01', scope: 'GLOBAL_COLLECTION', target: 'All Browser Workers', engaged: false, reason: '' },
    { id: 'ks-02', scope: 'SOURCE_ADAPTER', target: 'meta_ad_library_v1', engaged: false, reason: '' },
    { id: 'ks-03', scope: 'JOB_TYPE', target: 'HEURISTIC_SWEEP', engaged: false, reason: '' },
    { id: 'ks-04', scope: 'WORKER_POOL', target: 'worker-pool-us-east', engaged: false, reason: '' },
    { id: 'ks-05', scope: 'SCHEDULE', target: 'CRON_NIGHTLY_AUDIT', engaged: false, reason: '' }
  ]);

  // Worker fleet
  const [workers, setWorkers] = useState<WorkerLeaseModel[]>(SAMPLE_WORKER_FLEET);

  // Circuit breakers
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreakerModel[]>(INITIAL_CIRCUIT_BREAKERS);

  // DLQ items
  const [dlqItems, setDlqItems] = useState([
    {
      dlqId: 'dlq-0191f6b0-811a-7001-9922-334455667788',
      jobId: 'job-0191f6a0-5b12-7001-9911-223344556604',
      runId: 'run-01',
      searchTarget: 'HVAC Dallas Commercial',
      failureCategory: 'RESOURCE_EXHAUSTION',
      exhaustedAttempts: 3,
      lastError: 'ERR_CHROMIUM_OOM: Memory limit 1024MB exceeded during scroll depth 14',
      lastSafeCheckpoint: 'chk-0191f6a0-6211-7444-aa00-112233445566 (Seq #12)',
      replayed: false
    }
  ]);

  const [selectedDlq, setSelectedDlq] = useState<typeof dlqItems[0] | null>(null);
  const [replayReason, setReplayReason] = useState('');

  // Mode change confirmation
  const handleApplyModeChange = () => {
    if (!pendingMode) return;
    setCurrentMode(pendingMode);
    setPendingMode(null);
    if (onNotify) {
      onNotify(`System shifted to mode: ${pendingMode} by ${operatorId}. Reason: ${pauseReason || 'Routine SRE action'}`);
    }
    setPauseReason('');
  };

  const handleToggleKillSwitch = (id: string) => {
    setKillSwitches(prev =>
      prev.map(ks => {
        if (ks.id === id) {
          const nextState = !ks.engaged;
          if (onNotify) {
            onNotify(`Kill Switch [${ks.scope}] ${nextState ? 'ENGAGED' : 'DISENGAGED'} on target ${ks.target}`);
          }
          return { ...ks, engaged: nextState };
        }
        return ks;
      })
    );
  };

  const handleReclaimWorker = (workerId: string) => {
    setWorkers(prev =>
      prev.map(w => {
        if (w.workerId === workerId) {
          return {
            ...w,
            status: 'ACTIVE',
            fencingToken: w.fencingToken + 1,
            missedHeartbeats: 0,
            lastHeartbeat: new Date().toISOString()
          };
        }
        return w;
      })
    );
    if (onNotify) {
      onNotify(`Worker ${workerId} lease reclaimed & fencing token incremented.`);
    }
  };

  const handleTripCircuitBreaker = (name: string) => {
    setCircuitBreakers(prev =>
      prev.map(cb => {
        if (cb.name === name) {
          const nextState = cb.state === 'CLOSED' ? 'OPEN' : 'CLOSED';
          return {
            ...cb,
            state: nextState,
            consecutiveFailures: nextState === 'OPEN' ? 5 : 0,
            lastStateChange: new Date().toISOString()
          };
        }
        return cb;
      })
    );
  };

  const handleApproveReplay = (dlqId: string) => {
    setDlqItems(prev =>
      prev.map(item => (item.dlqId === dlqId ? { ...item, replayed: true } : item))
    );
    setSelectedDlq(null);
    setReplayReason('');
    if (onNotify) {
      onNotify(`DLQ Item ${dlqId} manually approved for replay from checkpoint Seq #12.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with System Status */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        currentMode === 'NORMAL'
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : currentMode === 'EMERGENCY_STOP'
          ? 'bg-rose-50 border-rose-300 text-rose-950'
          : 'bg-amber-50/80 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
            currentMode === 'NORMAL' ? 'bg-emerald-600' : currentMode === 'EMERGENCY_STOP' ? 'bg-rose-600' : 'bg-amber-600'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-base tracking-tight">System Operational Mode:</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                currentMode === 'NORMAL'
                  ? 'bg-emerald-200/60 text-emerald-900'
                  : currentMode === 'EMERGENCY_STOP'
                  ? 'bg-rose-200 text-rose-900'
                  : 'bg-amber-200 text-amber-900'
              }`}>
                {currentMode}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              Governance: Detect &rarr; Classify &rarr; Contain &rarr; Recover &rarr; Verify &rarr; Audit. Correctness &gt; Throughput.
            </p>
          </div>
        </div>

        {/* Global Concurrency Meter */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div>
            <div className="opacity-70 text-[10px]">WORKER LEASES</div>
            <div className="font-bold text-sm">3 / 16 ACTIVE</div>
          </div>
          <div>
            <div className="opacity-70 text-[10px]">QUEUE BACKPRESSURE</div>
            <div className="font-bold text-sm text-emerald-700">12 (NORMAL &lt; 50)</div>
          </div>
          <div>
            <div className="opacity-70 text-[10px]">DB WRITE POOL</div>
            <div className="font-bold text-sm">8 / 40 CONNS</div>
          </div>
        </div>
      </div>

      {/* Grid: Pause Modes & Scoped Kill Switches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Multi-Tier System Pause Modes */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-neutral-700" />
              <h3 className="font-semibold text-neutral-900 text-sm">System Pause Modes</h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">8 Tiered States</span>
          </div>

          <p className="text-xs text-neutral-600 mb-4">
            Switch operating modes without stopping the API or dropping operator dashboard access:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {SYSTEM_PAUSE_MODES.map(modeSpec => {
              const isSelected = currentMode === modeSpec.mode;
              const isPending = pendingMode === modeSpec.mode;
              return (
                <button
                  key={modeSpec.mode}
                  onClick={() => setPendingMode(modeSpec.mode as SystemPauseMode)}
                  className={`px-2.5 py-2 rounded-lg border text-left transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-600 text-white border-neutral-900 shadow-xs'
                      : isPending
                      ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300'
                      : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <span className="font-mono font-bold text-[11px] truncate block">{modeSpec.mode}</span>
                  <span className={`text-[10px] mt-1 line-clamp-1 opacity-75`}>
                    {modeSpec.activeScraping === 'ACTIVE' ? 'Scraping ON' : modeSpec.activeScraping}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pending Mode Change Confirmation Box */}
          {pendingMode && pendingMode !== currentMode && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Confirm Shift to Mode: <span className="font-mono">{pendingMode}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-neutral-700">Operator ID</label>
                  <input
                    type="text"
                    value={operatorId}
                    onChange={e => setOperatorId(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-neutral-700">Mandatory Justification</label>
                  <input
                    type="text"
                    placeholder="e.g., Cooldown on challenge detection"
                    value={pauseReason}
                    onChange={e => setPauseReason(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setPendingMode(null)}
                  className="px-3 py-1 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyModeChange}
                  disabled={!pauseReason}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded text-xs font-medium"
                >
                  Apply Mode Shift
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Scoped Kill Switches */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-rose-600" />
              <h3 className="font-semibold text-neutral-900 text-sm">Scoped Kill Switches</h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">Surgical Isolation</span>
          </div>

          <p className="text-xs text-neutral-600 mb-3">
            Isolate broken adapters or problematic worker pools without terminating unaffected jobs:
          </p>

          <div className="space-y-2.5">
            {killSwitches.map(ks => (
              <div
                key={ks.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                  ks.engaged
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold">{ks.scope}</span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-white border text-neutral-600">
                      {ks.target}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    {ks.engaged ? 'ENGAGED — Subsystem halted' : 'DISENGAGED — Subsystem operational'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleKillSwitch(ks.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold font-mono transition-colors ${
                    ks.engaged
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                      : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                  }`}
                >
                  {ks.engaged ? 'ENGAGED (HALT)' : 'DISENGAGED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel 3: Live Worker Fleet & Monotonic Fencing Tokens */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-neutral-700" />
            <h3 className="font-semibold text-neutral-900 text-sm">Worker Fleet & Fencing Token Registry</h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            Epoch Fencing Tokens &bull; 5s Heartbeat &bull; Stale Sweeper (10s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-600 font-mono uppercase text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-2 px-3">Worker ID & Node</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Fencing Token</th>
                <th className="py-2 px-3">Active Job / Run</th>
                <th className="py-2 px-3">Memory (RSS)</th>
                <th className="py-2 px-3">Heartbeat / Lease</th>
                <th className="py-2 px-3 text-right">Recovery Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {workers.map(w => (
                <tr key={w.workerId} className={w.status === 'FENCED' ? 'bg-rose-50/30' : w.status === 'SUSPECT' ? 'bg-amber-50/40' : ''}>
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-semibold text-neutral-900">{w.workerId}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">{w.hostNode}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      w.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : w.status === 'SUSPECT'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-neutral-800">
                    #{w.fencingToken}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-600">
                    <div className="truncate max-w-[160px]">{w.activeJobId}</div>
                    <div className="text-[10px] text-neutral-400">{w.activeRunId}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{w.memoryMb} MB</span>
                      <span className={`text-[10px] ${w.memoryMb > 800 ? 'text-rose-600 font-bold' : 'text-neutral-400'}`}>
                        ({Math.round((w.memoryMb / 1024) * 100)}%)
                      </span>
                    </div>
                    <div className="w-20 bg-neutral-100 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${w.memoryMb > 800 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (w.memoryMb / 1024) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] font-mono text-neutral-500">
                    <div>Missed: {w.missedHeartbeats} / 3</div>
                    <div className="text-[10px] text-neutral-400">Exp: {new Date(w.leaseExpiry).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {w.status !== 'ACTIVE' ? (
                      <button
                        onClick={() => handleReclaimWorker(w.workerId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-medium"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reclaim Lease
                      </button>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-mono">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Circuit Breakers & Dead-Letter Queue (DLQ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 4: Circuit Breakers */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-neutral-900 text-sm">External Dependency Circuit Breakers</h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">Fail-Closed SSRF Guard</span>
          </div>

          <div className="space-y-3">
            {circuitBreakers.map(cb => (
              <div key={cb.name} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-neutral-900">{cb.name}</h4>
                    <p className="text-[11px] text-neutral-500">{cb.dependency}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    cb.state === 'CLOSED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : cb.state === 'OPEN'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cb.state}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mt-2.5 pt-2 border-t border-neutral-200">
                  <span>Failures: {cb.failedCalls} / {cb.totalCalls} ({Math.round((cb.failedCalls / cb.totalCalls) * 100)}%)</span>
                  <button
                    onClick={() => handleTripCircuitBreaker(cb.name)}
                    className="text-[11px] text-neutral-700 hover:text-neutral-900 font-medium underline"
                  >
                    Simulate Trip ({cb.state === 'CLOSED' ? 'Open' : 'Close'})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 5: Dead-Letter Queue (DLQ) Triage */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <h3 className="font-semibold text-neutral-900 text-sm">Dead-Letter Queue (DLQ)</h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">Exhausted Retry Budget</span>
          </div>

          <div className="space-y-3">
            {dlqItems.map(item => (
              <div
                key={item.dlqId}
                className={`p-3 rounded-lg border text-xs ${
                  item.replayed
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{item.searchTarget}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    item.replayed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.replayed ? 'REPLAY_APPROVED' : 'DEAD_LETTERED'}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-600 font-mono mt-1.5">{item.lastError}</p>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2 font-mono">
                  <span>Safe Checkpoint: {item.lastSafeCheckpoint}</span>
                  {!item.replayed ? (
                    <button
                      onClick={() => setSelectedDlq(item)}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-sans font-semibold"
                    >
                      Triage & Replay
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-semibold font-sans">Replaying from Seq #12</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DLQ Replay Modal */}
      {selectedDlq && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-neutral-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-neutral-900 text-sm">Approve Manual DLQ Replay</h3>
              <button onClick={() => setSelectedDlq(null)} className="text-neutral-400 hover:text-neutral-600 text-xs">✕</button>
            </div>
            <div className="text-xs space-y-2 text-neutral-600">
              <p>
                <strong>Job ID:</strong> <span className="font-mono">{selectedDlq.jobId}</span>
              </p>
              <p>
                <strong>Safe Checkpoint:</strong> <span className="font-mono">{selectedDlq.lastSafeCheckpoint}</span>
              </p>
              <p className="text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                Resumption will replay strictly from the verified checkpoint payload. Zero hallucinated data will be injected.
              </p>
              <div>
                <label className="font-medium text-neutral-700">Reason for manual clearance:</label>
                <input
                  type="text"
                  placeholder="e.g., Worker memory limit doubled in k8s deployment"
                  value={replayReason}
                  onChange={e => setReplayReason(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 border border-neutral-300 rounded text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDlq(null)}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveReplay(selectedDlq.dlqId)}
                disabled={!replayReason}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-xs font-semibold"
              >
                Authorize Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
