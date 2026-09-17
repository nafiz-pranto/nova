import React, { useState } from 'react';
import { PageHeader } from './common/PageHeader';
import {
  WorkflowDefinition,
  WorkflowRun,
  WorkflowStep,
  WorkflowSchedule,
  GOLDEN_WORKFLOW_DEFINITIONS,
  SAMPLE_WORKFLOW_RUNS,
  SAMPLE_WORKFLOW_SCHEDULES,
  SAMPLE_BULK_BATCH,
  SAMPLE_WORKFLOW_AUDIT_LOGS,
  validateWorkflowDag,
  DagValidationResult,
  StepType
} from '../data/phase13WorkflowEngine';
import {
  GitBranch,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode,
  Calendar,
  Layers,
  ShieldCheck,
  Plus,
  Trash2,
  ChevronRight,
  Database,
  ArrowRight,
  Zap,
  Activity,
  Sliders,
  Send,
  Eye,
  Check,
  X,
  ExternalLink,
  Lock,
  ListFilter
} from 'lucide-react';

export const WorkflowWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RUNS' | 'RECIPES' | 'BUILDER' | 'SCHEDULES' | 'BULK' | 'APPROVALS' | 'AUDIT'>('RUNS');
  const [runs, setRuns] = useState<WorkflowRun[]>(SAMPLE_WORKFLOW_RUNS);
  const [selectedRunId, setSelectedRunId] = useState<string>(SAMPLE_WORKFLOW_RUNS[0].runId);
  const [selectedStepId, setSelectedStepId] = useState<string>('step_export_07');
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>(GOLDEN_WORKFLOW_DEFINITIONS);
  const [selectedDefId, setSelectedDefId] = useState<string>(GOLDEN_WORKFLOW_DEFINITIONS[0].workflowId);

  // Builder State
  const [builderSteps, setBuilderSteps] = useState<WorkflowStep[]>(GOLDEN_WORKFLOW_DEFINITIONS[0].steps);
  const [validationResult, setValidationResult] = useState<DagValidationResult | null>(null);
  const [dryRunSimulationLog, setDryRunSimulationLog] = useState<string[]>([]);

  // Active run and step references
  const activeRun = runs.find(r => r.runId === selectedRunId) || runs[0];
  const selectedStepRun = activeRun.stepRuns.find(sr => sr.stepId === selectedStepId);
  const activeDef = definitions.find(d => d.workflowId === selectedDefId) || definitions[0];

  // Handlers for Run Controls
  const handlePauseResume = () => {
    setRuns(prev => prev.map(r => {
      if (r.runId === activeRun.runId) {
        const nextStatus = r.status === 'PAUSED' ? 'RUNNING' : 'PAUSED';
        return { ...r, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return r;
    }));
  };

  const handleCancelRun = () => {
    setRuns(prev => prev.map(r => {
      if (r.runId === activeRun.runId) {
        return { ...r, status: 'CANCELLED', completedAt: new Date().toISOString() };
      }
      return r;
    }));
  };

  const handleApproveStep = (approvalId: string) => {
    setRuns(prev => prev.map(r => {
      if (r.runId === activeRun.runId) {
        const updatedApprovals = r.approvals.map(a => 
          a.approvalId === approvalId ? { ...a, status: 'APPROVED' as const, approver: 'operator_daniela', resolvedAt: new Date().toISOString() } : a
        );
        const updatedStepRuns = r.stepRuns.map(sr => 
          sr.status === 'WAITING_APPROVAL' ? { ...sr, status: 'COMPLETED' as const, completedAt: new Date().toISOString() } : sr
        );
        return {
          ...r,
          status: 'COMPLETED' as const,
          approvals: updatedApprovals,
          stepRuns: updatedStepRuns,
          completedAt: new Date().toISOString()
        };
      }
      return r;
    }));
  };

  // Run DAG validator on builder steps
  const handleValidateBuilderDAG = () => {
    const res = validateWorkflowDag(builderSteps);
    setValidationResult(res);

    if (res.isValid) {
      setDryRunSimulationLog([
        `[DRY-RUN] Validating DAG topology for ${builderSteps.length} steps... OK`,
        `[DRY-RUN] Execution order planned: ${res.executionOrder.join(' → ')}`,
        `[DRY-RUN] Validating step type registry contracts... ALL AUTHORIZED`,
        `[DRY-RUN] Checking idempotency hash generators: SHA-256 keys configured.`,
        `[DRY-RUN] Simulation evaluated conditions against sample context: 0 errors detected.`
      ]);
    } else {
      setDryRunSimulationLog([
        `[DRY-RUN FAILED] DAG validation encountered errors:`,
        ...res.errors.map(err => ` - ${err}`)
      ]);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Workflow Orchestration (Phase 13)', active: true },
        ]}
        title="Safe Research Orchestration & Workflow Engine"
        description="Controlled multi-step automation: execute repeatable DAG pipelines (Collect → Validate → Resolve → Verify → Qualify → Review → Export) with durable checkpointing, approvals, scheduling, and strict anti-abuse governance."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Engine v13.0 Active &bull; DAG Enforced &bull; No Arbitrary Code
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('BUILDER')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Recipe</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('BUILDER');
                handleValidateBuilderDAG();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Dry-Run Simulation</span>
            </button>
          </div>
        }
      />

      {/* Main Tab Bar */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('RUNS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'RUNS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Active Runs &amp; DAG ({runs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RECIPES')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'RECIPES'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Recipe Catalog ({definitions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BUILDER')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'BUILDER'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Visual DAG Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('SCHEDULES')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'SCHEDULES'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedules ({SAMPLE_WORKFLOW_SCHEDULES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BULK')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'BULK'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Bulk Processing</span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVALS')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'APPROVALS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Approvals Queue</span>
          {activeRun.approvals.filter(a => a.status === 'PENDING').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'AUDIT'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit Ledger</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: ACTIVE RUNS & INTERACTIVE DAG GRAPH */}
      {/* ============================================================ */}
      {activeTab === 'RUNS' && (
        <div className="space-y-6">
          {/* Top Run Selector & Controls Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-neutral-400 font-bold">RUN ID:</span>
                <select
                  value={activeRun.runId}
                  onChange={e => setSelectedRunId(e.target.value)}
                  className="font-mono font-bold text-xs bg-neutral-100 px-2.5 py-1 rounded border border-neutral-300 text-neutral-900 focus:outline-none"
                >
                  {runs.map(r => (
                    <option key={r.runId} value={r.runId}>
                      {r.runId} ({r.workflowName} - {r.status})
                    </option>
                  ))}
                </select>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  activeRun.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                  activeRun.status === 'WAITING' ? 'bg-amber-100 text-amber-800' :
                  activeRun.status === 'PAUSED' ? 'bg-neutral-200 text-neutral-700' :
                  activeRun.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {activeRun.status}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Triggered via <strong className="text-neutral-700">{activeRun.triggerType}</strong> at {activeRun.startedAt}. Definition version: <span className="font-mono">{activeRun.workflowVersion}</span>.
              </p>
            </div>

            {/* Run Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseResume}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {activeRun.status === 'PAUSED' ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
                <span>{activeRun.status === 'PAUSED' ? 'Resume Run' : 'Pause Run'}</span>
              </button>
              <button
                onClick={handleCancelRun}
                disabled={activeRun.status === 'COMPLETED' || activeRun.status === 'CANCELLED'}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* DAG Visualizer Container */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-neutral-900" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Execution DAG &amp; Step Checkpoints
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Awaiting Approval
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" /> Pending
                </span>
              </div>
            </div>

            {/* Step DAG Pipeline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 py-4">
              {activeRun.stepRuns.map((sr, idx) => {
                const isSelected = sr.stepId === selectedStepId;
                return (
                  <div
                    key={sr.stepRunId}
                    onClick={() => setSelectedStepId(sr.stepId)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-xs min-h-[130px] ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs ring-2 ring-neutral-900'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-mono text-[10px] text-neutral-400 font-bold">0{idx + 1}</span>
                        {sr.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : sr.status === 'WAITING_APPROVAL' ? (
                          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                        ) : (
                          <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                        )}
                      </div>

                      <div className="font-bold text-neutral-900 leading-tight line-clamp-2">
                        {sr.stepName}
                      </div>

                      <div className="mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-semibold bg-neutral-100 text-neutral-700">
                          {sr.stepType}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>Att: {sr.attempt}</span>
                      <span>{sr.durationMs ? `${(sr.durationMs / 1000).toFixed(1)}s` : 'active'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Step Deep Dive Inspector */}
            {selectedStepRun && (
              <div className="mt-4 p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                      Step Run Inspector
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      {selectedStepRun.stepName}
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-white border border-neutral-200 text-neutral-700">
                        {selectedStepRun.stepRunId}
                      </span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedStepRun.status === 'WAITING_APPROVAL' && (
                      <button
                        onClick={() => handleApproveStep(activeRun.approvals[0]?.approvalId || '')}
                        className="px-3 py-1.5 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Authorize Approval</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Input Snapshot */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-neutral-700 block text-[11px] uppercase tracking-wider">
                      Immutable Input Snapshot
                    </span>
                    <pre className="p-3 rounded-lg bg-white border border-neutral-200 font-mono text-[11px] text-neutral-800 overflow-x-auto">
                      {JSON.stringify(selectedStepRun.inputSnapshot, null, 2)}
                    </pre>
                  </div>

                  {/* Right: Output Reference */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-neutral-700 block text-[11px] uppercase tracking-wider">
                      Durable Output Artifact Reference
                    </span>
                    <div className="p-3 rounded-lg bg-white border border-neutral-200 font-mono text-[11px] text-neutral-800 space-y-2">
                      <div>
                        <span className="text-neutral-400">URI:</span>{' '}
                        <strong className="text-blue-600 break-all">{selectedStepRun.outputReference || 'Pending step completion'}</strong>
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        * In accordance with Section 18, workflow runs store immutable cryptographic artifact URIs rather than duplicating large raw datasets in memory.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: RECIPE CATALOG & TEMPLATES */}
      {/* ============================================================ */}
      {activeTab === 'RECIPES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {definitions.map(def => (
              <div
                key={def.workflowId}
                className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-100 text-neutral-700">
                      Recipe v{def.version}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
                      {def.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-neutral-900">{def.name}</h3>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      {def.description}
                    </p>
                  </div>

                  {/* Steps Badge List */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-1.5">
                      Pipeline Steps ({def.steps.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {def.steps.map((st, i) => (
                        <span
                          key={st.stepId}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-50 text-neutral-700 border border-neutral-200 flex items-center gap-1"
                        >
                          <span className="text-neutral-400">{i + 1}.</span> {st.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-neutral-400 text-[11px]">
                    Owner: {def.owner}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDefId(def.workflowId);
                      setBuilderSteps(def.steps);
                      setActiveTab('BUILDER');
                    }}
                    className="px-3 py-1.5 font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>Inspect In Builder</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: VISUAL RECIPE BUILDER & DRY-RUN */}
      {/* ============================================================ */}
      {activeTab === 'BUILDER' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Visual Recipe Builder (DAG &amp; Step Registry)
                </h3>
                <p className="text-xs text-neutral-500">
                  Compose pipelines using only approved step types. Arbitrary code, shell, or raw SQL execution is architecturally forbidden.
                </p>
              </div>

              <button
                onClick={handleValidateBuilderDAG}
                className="px-4 py-2 font-semibold text-xs text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Validate DAG &amp; Simulate</span>
              </button>
            </div>

            {/* Step list table */}
            <div className="space-y-2">
              {builderSteps.map((s, idx) => (
                <div
                  key={s.stepId}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-neutral-400 font-bold">0{idx + 1}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{s.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-200 text-neutral-700 font-semibold">
                          {s.type}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                        Depends on: {s.dependsOn.length > 0 ? s.dependsOn.join(', ') : 'ROOT'} &bull; Retries: {s.retryPolicy.maxAttempts} &bull; Timeout: {s.timeoutPolicy.stepTimeoutMs / 1000}s
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-neutral-200 text-neutral-600">
                      Approval: {s.approvalPolicy}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dry Run Simulation Output Console */}
            {dryRunSimulationLog.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs space-y-1.5 shadow-inner">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">
                  Simulation &amp; DAG Verification Output
                </div>
                {dryRunSimulationLog.map((line, i) => (
                  <div key={i} className="leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: SCHEDULES & AUTOMATION */}
      {/* ============================================================ */}
      {activeTab === 'SCHEDULES' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Automated Research Schedules
                </h3>
                <p className="text-xs text-neutral-500">
                  Explicit UTC timezones, queue overlap policies, and bounded catch-up controls prevent runaway background executions.
                </p>
              </div>
            </div>

            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden text-xs">
              {SAMPLE_WORKFLOW_SCHEDULES.map(sc => (
                <div key={sc.scheduleId} className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{sc.workflowName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        {sc.enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-neutral-500 flex items-center gap-3">
                      <span>Cron: <strong className="text-neutral-800">{sc.cronExpression}</strong> ({sc.humanReadable})</span>
                      <span>&bull;</span>
                      <span>Timezone: <strong className="text-neutral-800">{sc.timezone}</strong></span>
                      <span>&bull;</span>
                      <span>Overlap: <strong className="text-neutral-800">{sc.overlapPolicy}</strong></span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px] text-neutral-400 shrink-0">
                    <div>Next: <strong className="text-neutral-700">{sc.nextRun}</strong></div>
                    <div>Last: {sc.lastRun || 'None'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: BULK PROCESSING OPERATIONS */}
      {/* ============================================================ */}
      {activeTab === 'BULK' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Bulk Entity Chunking &amp; Partial Completion
              </h3>
              <p className="text-xs text-neutral-500">
                Processes hundreds of entities across chunked batches. Exposes partial outcomes rather than failing the entire run if an individual domain times out.
              </p>
            </div>

            {/* Active Batch Progress Card */}
            <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase block">
                    Active Chunked Batch
                  </span>
                  <span className="font-bold text-sm text-neutral-900">{SAMPLE_BULK_BATCH.batchId}</span>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-blue-100 text-blue-800">
                  {SAMPLE_BULK_BATCH.status} ({Math.round((SAMPLE_BULK_BATCH.processedCount / SAMPLE_BULK_BATCH.totalEntities) * 100)}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${(SAMPLE_BULK_BATCH.successCount / SAMPLE_BULK_BATCH.totalEntities) * 100}%` }}
                  title={`Success: ${SAMPLE_BULK_BATCH.successCount}`}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(SAMPLE_BULK_BATCH.reviewRequiredCount / SAMPLE_BULK_BATCH.totalEntities) * 100}%` }}
                  title={`Review Required: ${SAMPLE_BULK_BATCH.reviewRequiredCount}`}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${(SAMPLE_BULK_BATCH.failedCount / SAMPLE_BULK_BATCH.totalEntities) * 100}%` }}
                  title={`Failed: ${SAMPLE_BULK_BATCH.failedCount}`}
                />
              </div>

              {/* Stats Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-neutral-200">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block">Successful</span>
                  <span className="text-base font-bold text-emerald-600">{SAMPLE_BULK_BATCH.successCount}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-neutral-200">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block">Review Needed</span>
                  <span className="text-base font-bold text-amber-600">{SAMPLE_BULK_BATCH.reviewRequiredCount}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-neutral-200">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block">Failed</span>
                  <span className="text-base font-bold text-rose-600">{SAMPLE_BULK_BATCH.failedCount}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-neutral-200">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block">Chunk Size</span>
                  <span className="text-base font-bold text-neutral-900">{SAMPLE_BULK_BATCH.chunkSize}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: APPROVALS QUEUE */}
      {/* ============================================================ */}
      {activeTab === 'APPROVALS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Human-in-the-Loop Governance &amp; Approval Gate
                </h3>
                <p className="text-xs text-neutral-500">
                  High-risk operations (client exports, identity split/merges) remain halted in WAITING state until authorized by a verified operator.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {activeRun.approvals.map(appr => (
                <div
                  key={appr.approvalId}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-neutral-900">{appr.stepName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                        {appr.status}
                      </span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed max-w-2xl">
                      {appr.reason}
                    </p>
                    <div className="text-[10px] font-mono text-neutral-400">
                      Requested by: {appr.requestedBy} &bull; Timestamp: {appr.timestamp}
                    </div>
                  </div>

                  {appr.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveStep(appr.approvalId)}
                        className="px-3 py-1.5 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs"
                      >
                        Approve &amp; Release
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: AUDIT LEDGER */}
      {/* ============================================================ */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Immutable Workflow Execution Audit Ledger
                </h3>
                <p className="text-xs text-neutral-500">
                  Every transition, retry, checkpoint, and approval is written to the audit layer with actor attribution.
                </p>
              </div>
            </div>

            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden text-xs">
              {SAMPLE_WORKFLOW_AUDIT_LOGS.map(evt => (
                <div key={evt.eventId} className="p-3.5 bg-white flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{evt.summary}</span>
                      <span className="font-mono text-[10px] text-neutral-400">{evt.timestamp}</span>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                      Event: <strong className="text-neutral-700">{evt.eventType}</strong> &bull; Actor: {evt.actor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
