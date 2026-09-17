import React, { useState } from 'react';
import { dbSimulator } from '../utils/databaseEngine';
import { SimulatedTransactionResult, LeadResearchReadModel } from '../types';
import { 
  GitMerge, 
  GitPullRequest, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Play, 
  UserCheck, 
  Lock
} from 'lucide-react';

export const TransactionSimulator: React.FC = () => {
  const [readModels, setReadModels] = useState<LeadResearchReadModel[]>(dbSimulator.getReadModels());
  const [txHistory, setTxHistory] = useState<SimulatedTransactionResult[]>(dbSimulator.getTransactionHistory());
  const [activeTxTab, setActiveTxTab] = useState<'MERGE' | 'SPLIT' | 'OVERRIDE'>('MERGE');

  // Merge form state
  const [primaryId, setPrimaryId] = useState<string>('adv-001-apex');
  const [mergedId, setMergedId] = useState<string>('adv-003-omni');
  const [mergeReviewer, setMergeReviewer] = useState<string>('lead_architect_sarah');
  const [mergeJustification, setMergeJustification] = useState<string>('Commercial website and registration domain confirm shared legal ownership structure.');
  const [simulateFailureStep, setSimulateFailureStep] = useState<number>(0);

  // Split form state
  const [splitTargetId, setSplitTargetId] = useState<string>('adv-003-omni');
  const [splitReviewer, setSplitReviewer] = useState<string>('lead_reviewer_david');
  const [splitJustification, setSplitJustification] = useState<string>('Separate legal entities discovered upon corporate registry disclosure.');

  // Override form state
  const [overrideTargetId, setOverrideTargetId] = useState<string>('adv-003-omni');
  const [overrideState, setOverrideState] = useState<'QUALIFIED' | 'DISQUALIFIED' | 'NEEDS_REVIEW' | 'BLOCKED'>('QUALIFIED');
  const [overrideScore, setOverrideScore] = useState<number>(78.5);
  const [overrideReviewer, setOverrideReviewer] = useState<string>('compliance_lead_mark');
  const [overrideReason, setOverrideReason] = useState<string>('COMMERCIAL_INSPECTION_PASSED');
  const [overrideJustification, setOverrideJustification] = useState<string>('Direct phone and storefront inspection verified commercial activity.');

  const [lastExecutedTx, setLastExecutedTx] = useState<SimulatedTransactionResult | null>(null);

  const handleRunMerge = () => {
    const result = dbSimulator.executeAtomicMerge(
      primaryId,
      mergedId,
      mergeReviewer,
      mergeJustification,
      simulateFailureStep > 0 ? simulateFailureStep : undefined
    );
    setLastExecutedTx(result);
    setReadModels(dbSimulator.getReadModels());
    setTxHistory(dbSimulator.getTransactionHistory());
  };

  const handleRunSplit = () => {
    const result = dbSimulator.executeAtomicSplit(
      splitTargetId,
      splitReviewer,
      splitJustification
    );
    setLastExecutedTx(result);
    setReadModels(dbSimulator.getReadModels());
    setTxHistory(dbSimulator.getTransactionHistory());
  };

  const handleRunOverride = () => {
    const result = dbSimulator.executeManualOverride(
      overrideTargetId,
      overrideState,
      overrideScore,
      overrideReviewer,
      overrideReason,
      overrideJustification
    );
    setLastExecutedTx(result);
    setReadModels(dbSimulator.getReadModels());
    setTxHistory(dbSimulator.getTransactionHistory());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                ACID TRANSACTION SIMULATOR
              </span>
              <span className="text-xs text-slate-400">Section 16 & Section 17 Invariants</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Transaction Boundaries, Concurrency & Rollback Runner
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Simulate multi-step atomic operations: Identity Merges, Identity Splits, and Manual Overrides. 
              Observe row-level locks, constraint validations, rollback triggers, and non-destructive historical preservation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">Engine Active</span>
          </div>
        </div>
      </div>

      {/* Transaction Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Action Configuration */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Action Tabs */}
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 mb-5">
              <button
                onClick={() => setActiveTxTab('MERGE')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTxTab === 'MERGE'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>Atomic Merge</span>
              </button>
              <button
                onClick={() => setActiveTxTab('SPLIT')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTxTab === 'SPLIT'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Atomic Split</span>
              </button>
              <button
                onClick={() => setActiveTxTab('OVERRIDE')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTxTab === 'OVERRIDE'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Manual Override</span>
              </button>
            </div>

            {/* MERGE FORM */}
            {activeTxTab === 'MERGE' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Surviving Entity
                  </label>
                  <select
                    value={primaryId}
                    onChange={(e) => setPrimaryId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                  >
                    {readModels.map(rm => (
                      <option key={rm.advertiserId} value={rm.advertiserId}>
                        {rm.canonicalName} ({rm.advertiserId}) — {rm.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Entity To Merge (Absorbed)
                  </label>
                  <select
                    value={mergedId}
                    onChange={(e) => setMergedId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                  >
                    {readModels.map(rm => (
                      <option key={rm.advertiserId} value={rm.advertiserId}>
                        {rm.canonicalName} ({rm.advertiserId}) — {rm.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Authorizing Reviewer
                    </label>
                    <input
                      type="text"
                      value={mergeReviewer}
                      onChange={(e) => setMergeReviewer(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Inject Crash / Failure
                    </label>
                    <select
                      value={simulateFailureStep}
                      onChange={(e) => setSimulateFailureStep(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                    >
                      <option value={0}>None (Clean Commit)</option>
                      <option value={1}>Step 1 (Row Lock Timeout)</option>
                      <option value={3}>Step 3 (Merge Ledger Write Crash)</option>
                      <option value={4}>Step 4 (Deadlock on Unique Index)</option>
                      <option value={5}>Step 5 (Disk Full on Entity Update)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Audit Justification
                  </label>
                  <textarea
                    rows={2}
                    value={mergeJustification}
                    onChange={(e) => setMergeJustification(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            {/* SPLIT FORM */}
            {activeTxTab === 'SPLIT' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Merged Entity to Restore
                  </label>
                  <select
                    value={splitTargetId}
                    onChange={(e) => setSplitTargetId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                  >
                    {readModels.map(rm => (
                      <option key={rm.advertiserId} value={rm.advertiserId}>
                        {rm.canonicalName} ({rm.advertiserId}) — STATUS: {rm.status}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    (Must be in MERGED status to split. If none, run a Merge transaction first.)
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reviewer ID
                  </label>
                  <input
                    type="text"
                    value={splitReviewer}
                    onChange={(e) => setSplitReviewer(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Split Justification
                  </label>
                  <textarea
                    rows={2}
                    value={splitJustification}
                    onChange={(e) => setSplitJustification(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            {/* OVERRIDE FORM */}
            {activeTxTab === 'OVERRIDE' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Advertiser
                  </label>
                  <select
                    value={overrideTargetId}
                    onChange={(e) => setOverrideTargetId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                  >
                    {readModels.map(rm => (
                      <option key={rm.advertiserId} value={rm.advertiserId}>
                        {rm.canonicalName} (Current: {rm.qualificationState} - {rm.score} pts)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Qualification State
                    </label>
                    <select
                      value={overrideState}
                      onChange={(e: any) => setOverrideState(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                    >
                      <option value="QUALIFIED">QUALIFIED</option>
                      <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                      <option value="DISQUALIFIED">DISQUALIFIED</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Adjusted Score (0-100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reviewer Username
                    </label>
                    <input
                      type="text"
                      value={overrideReviewer}
                      onChange={(e) => setOverrideReviewer(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reason Code
                    </label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Audit Justification
                  </label>
                  <textarea
                    rows={2}
                    value={overrideJustification}
                    onChange={(e) => setOverrideJustification(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            {activeTxTab === 'MERGE' && (
              <button
                onClick={handleRunMerge}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>Execute Atomic Merge Transaction</span>
              </button>
            )}

            {activeTxTab === 'SPLIT' && (
              <button
                onClick={handleRunSplit}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Execute Atomic Split Transaction</span>
              </button>
            )}

            {activeTxTab === 'OVERRIDE' && (
              <button
                onClick={handleRunOverride}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>Append Manual Override & Emit Audit Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Real-time Transaction Ledger & Step Logs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[580px] overflow-hidden">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Transaction Execution Log</span>
              </h2>
              <span className="text-[11px] text-slate-500">
                Step-by-step ACID progression with rollback verification
              </span>
            </div>

            {lastExecutedTx && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
                lastExecutedTx.status === 'COMMITTED'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
              }`}>
                {lastExecutedTx.status === 'COMMITTED' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{lastExecutedTx.status}</span>
              </span>
            )}
          </div>

          {/* Step Log Viewer */}
          <div className="overflow-y-auto flex-1 pr-2 space-y-3">
            {!lastExecutedTx ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Clock className="w-8 h-8 mb-2 stroke-1" />
                <p className="text-xs">No transaction executed yet in this session.</p>
                <p className="text-[11px] text-slate-500 mt-1">Configure parameters on the left and click execute.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Meta details */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tx ID:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{lastExecutedTx.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Correlation ID:</span>
                    <span className="text-purple-600 dark:text-purple-400">{lastExecutedTx.correlationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Affected Tables:</span>
                    <span className="text-slate-700 dark:text-slate-300">{lastExecutedTx.affectedTables.join(', ')}</span>
                  </div>
                  {lastExecutedTx.rollbackReason && (
                    <div className="pt-1 mt-1 border-t border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-sans">
                      <span className="font-bold">Rollback Reason:</span> {lastExecutedTx.rollbackReason}
                    </div>
                  )}
                </div>

                {/* Step List */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Execution Steps ({lastExecutedTx.stepLogs.length})
                  </div>
                  {lastExecutedTx.stepLogs.map(step => (
                    <div
                      key={step.step}
                      className={`p-3 rounded-lg border text-xs ${
                        step.status === 'COMMITTED'
                          ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40'
                          : 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                            {step.step}
                          </span>
                          <span>{step.operation}</span>
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          step.status === 'COMMITTED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        {step.details}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        Target Table: <span className="text-slate-600 dark:text-slate-300">{step.table}</span> ({step.action})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Read Model State Table (Reflecting Updates Immediately) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Live Read Model View: <span className="font-mono text-emerald-600 dark:text-emerald-400">v_lead_research_current</span>
            </h2>
            <p className="text-xs text-slate-500">
              Downstream reporting view automatically reflecting committed transactions without table locks
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Phase 08 Integration Target
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Advertiser Name</th>
                <th className="py-2.5 px-3">Entity Status</th>
                <th className="py-2.5 px-3">Domain & Reachability</th>
                <th className="py-2.5 px-3">Qualification State</th>
                <th className="py-2.5 px-3">Score (0-100)</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Audit Trails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {readModels.map(rm => (
                <tr key={rm.advertiserId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{rm.canonicalName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{rm.advertiserId}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      rm.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                    }`}>
                      {rm.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    <div>{rm.registrableDomain}</div>
                    <div className="text-[10px] text-slate-400">HTTP {rm.verificationStatus}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rm.qualificationState === 'QUALIFIED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : rm.qualificationState === 'NEEDS_REVIEW'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}>
                      {rm.qualificationState}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {rm.score.toFixed(1)} / 100.0
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {rm.confidence}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    {rm.auditTrailCount} events
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
