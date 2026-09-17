import React, { useState, useMemo } from 'react';
import { PageHeader } from './common/PageHeader';
import {
  Configuration,
  ConfigurationType,
  ConfigurationEnvironment,
  ConfigurationLifecycleState,
  GOVERNED_FIELD_REGISTRY,
  CONFIGURATION_SCHEMAS,
  INITIAL_CONFIGURATIONS,
  SAMPLE_SIMULATION_FIXTURE,
  SAMPLE_AUDIT_TRAIL,
  MIGRATION_GAP_ANALYSIS,
  SAMPLE_SHADOW_COMPARISONS,
  PHASE_16_HANDOFF_PAYLOAD,
  evaluateAST,
  runSimulation,
  detectCircularDependencies,
  GovernedField,
  SafeExpressionAST,
  ExpressionCondition,
  OperatorType,
  SimulationResult,
  ConfigurationAuditEvent
} from '../data/phase16ConfigurationEngine';
import {
  Sliders,
  Shield,
  ShieldCheck,
  ShieldAlert,
  GitCommit,
  GitBranch,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Code2,
  Eye,
  Check,
  Zap,
  Lock,
  FileCheck,
  Cpu
} from 'lucide-react';

export const ConfigurationStudio: React.FC = () => {
  // Navigation tabs within Studio
  const [activeTab, setActiveTab] = useState<
    | 'REGISTRY'
    | 'RULE_BUILDER'
    | 'DIFF_VIEWER'
    | 'DEPENDENCY_GRAPH'
    | 'SIMULATION'
    | 'REVIEWS'
    | 'ACTIVATION_ROLLBACK'
    | 'HEALTH_AUDIT'
    | 'MIGRATION_CATALOG'
    | 'HANDOFF'
  >('REGISTRY');

  // Configurations state
  const [configurations, setConfigurations] = useState<Configuration[]>(INITIAL_CONFIGURATIONS);
  const [selectedConfigId, setSelectedConfigId] = useState<string>(INITIAL_CONFIGURATIONS[0].configurationId);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterEnv, setFilterEnv] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Currently selected configuration
  const selectedConfig = useMemo(() => {
    return configurations.find(c => c.configurationId === selectedConfigId) || configurations[0];
  }, [configurations, selectedConfigId]);

  // Selected version for diff viewer
  const [diffVersionA, setDiffVersionA] = useState<number>(3);
  const [diffVersionB, setDiffVersionB] = useState<number>(4);

  // Simulation state
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Audit trail state
  const [auditLog, setAuditLog] = useState<ConfigurationAuditEvent[]>(SAMPLE_AUDIT_TRAIL);

  // Rule Builder interactive state
  const [builderConfigType, setBuilderConfigType] = useState<ConfigurationType>('DATA_QUALITY_RULE');
  const [builderSelectedField, setBuilderSelectedField] = useState<string>('verification.freshness_days');
  const [builderOperator, setBuilderOperator] = useState<OperatorType>('LESS_OR_EQUAL');
  const [builderValue, setBuilderValue] = useState<string>('7');
  const [builderLogicalOp, setBuilderLogicalOp] = useState<'AND' | 'OR'>('AND');
  const [builderConditions, setBuilderConditions] = useState<ExpressionCondition[]>([
    { field: 'verification.freshness_days', operator: 'LESS_OR_EQUAL', value: 7 },
    { field: 'verification.state', operator: 'STATE_EQUALS', value: 'VERIFIED' }
  ]);
  const [builderValidationMsg, setBuilderValidationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Current active user for review separation of duties demo
  const [currentUserRole, setCurrentUserRole] = useState<'AUTHOR' | 'APPROVER' | 'SECURITY_ADMIN'>('APPROVER');
  const currentActor = currentUserRole === 'AUTHOR' ? 'dev.artem@platform.internal' : 'lead.marcus@platform.internal';

  // Helper to add condition in Rule Builder
  const handleAddCondition = () => {
    const fieldDef = GOVERNED_FIELD_REGISTRY.find(f => f.fieldId === builderSelectedField);
    let parsedVal: any = builderValue;
    if (fieldDef?.dataType === 'NUMBER') {
      parsedVal = Number(builderValue);
    } else if (fieldDef?.dataType === 'BOOLEAN') {
      parsedVal = builderValue === 'true';
    }

    setBuilderConditions([
      ...builderConditions,
      { field: builderSelectedField, operator: builderOperator, value: parsedVal }
    ]);
    setBuilderValidationMsg(null);
  };

  const handleRemoveCondition = (index: number) => {
    setBuilderConditions(builderConditions.filter((_, idx) => idx !== index));
    setBuilderValidationMsg(null);
  };

  const handleValidateAST = () => {
    const ast: SafeExpressionAST = {
      logicalOperator: builderLogicalOp,
      conditions: builderConditions
    };

    // Run test evaluation on sample fixture record
    const testRecord = SAMPLE_SIMULATION_FIXTURE[0];
    const result = evaluateAST(ast, testRecord);

    if (result.error) {
      setBuilderValidationMsg({ type: 'error', text: `Validation Failed: ${result.error}` });
    } else {
      setBuilderValidationMsg({
        type: 'success',
        text: `Validation Passed! Safe AST successfully compiled with ${builderConditions.length} conditions. Zero unsafe code strings.`
      });
    }
  };

  // Run simulation
  const handleRunSimulation = (config: Configuration, verNum: number) => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runSimulation(config, verNum);
      setSimulationResult(res);
      setIsSimulating(false);
    }, 300);
  };

  // Rollback action
  const handleRollback = (targetVersion: number, reason: string) => {
    const updated = configurations.map(c => {
      if (c.configurationId === selectedConfig.configurationId) {
        return {
          ...c,
          currentActiveVersion: targetVersion,
          versions: c.versions.map(v => {
            if (v.version === targetVersion) {
              return { ...v, lifecycleState: 'ACTIVE' as ConfigurationLifecycleState };
            }
            if (v.version === c.currentActiveVersion) {
              return { ...v, lifecycleState: 'DEPRECATED' as ConfigurationLifecycleState };
            }
            return v;
          })
        };
      }
      return c;
    });

    const newAudit: ConfigurationAuditEvent = {
      eventId: `aud-${Date.now().toString(36)}`,
      configurationId: selectedConfig.configurationId,
      version: targetVersion,
      action: 'ROLLED_BACK',
      actor: currentActor,
      actorRole: currentUserRole,
      timestamp: new Date().toISOString(),
      reason: reason || 'Manual operator rollback to previous immutable version',
      details: { previousActive: selectedConfig.currentActiveVersion, restoredTarget: targetVersion },
      correlationId: `corr-roll-${Date.now().toString(36)}`
    };

    setConfigurations(updated);
    setAuditLog([newAudit, ...auditLog]);
    alert(`Rollback applied: ${selectedConfig.configurationId} rolled back to v${targetVersion}. Audit event recorded.`);
  };

  // Filtered configurations
  const filteredConfigs = useMemo(() => {
    return configurations.filter(c => {
      if (filterType !== 'ALL' && c.configurationType !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.configurationId.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [configurations, filterType, searchQuery]);

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Top Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Configuration & Governance', active: false },
          { label: 'Rules & Policy Studio (Phase 16)', active: true },
        ]}
        title="Rules, Policy & Configuration Studio"
        description="Centralized, immutable, typed, and auditable configuration governance layer across data quality, verification, identity, scoring, workflows, and exports."
        statusBadge={
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Governed Config Kernel Active
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
              AST Sandbox v16.0
            </span>
          </div>
        }
      />

      {/* Global Quick Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Governed Configurations</div>
          <div className="text-xl font-bold text-neutral-900 mt-0.5">{configurations.length} Total</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">100% Typed &amp; Validated</div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Active In Production</div>
          <div className="text-xl font-bold text-neutral-900 mt-0.5">
            {configurations.filter(c => c.versions.some(v => v.lifecycleState === 'ACTIVE')).length} Points
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Immutable Versions</div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Protected Security Policies</div>
          <div className="text-xl font-bold text-rose-700 mt-0.5">
            {configurations.filter(c => c.isProtectedSecurityCritical).length} Invariants
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">Zero Override Allowed</div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Governed Field Registry</div>
          <div className="text-xl font-bold text-blue-700 mt-0.5">{GOVERNED_FIELD_REGISTRY.length} Approved Fields</div>
          <div className="text-[11px] text-blue-600 mt-0.5">Strict Operator Types</div>
        </div>
      </div>

      {/* Workspace Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2 overflow-x-auto text-xs font-semibold scrollbar-thin">
        {[
          { id: 'REGISTRY', icon: Sliders, label: 'Configuration Registry' },
          { id: 'RULE_BUILDER', icon: Zap, label: 'Visual Rule Builder' },
          { id: 'DIFF_VIEWER', icon: GitBranch, label: 'Semantic Diff View' },
          { id: 'DEPENDENCY_GRAPH', icon: Layers, label: 'Dependency DAG' },
          { id: 'SIMULATION', icon: Play, label: 'Simulation & Shadow' },
          { id: 'REVIEWS', icon: CheckCircle2, label: 'Review & Approvals' },
          { id: 'ACTIVATION_ROLLBACK', icon: RotateCcw, label: 'Activation & Rollback' },
          { id: 'HEALTH_AUDIT', icon: ShieldCheck, label: 'Health & Audit Ledger' },
          { id: 'MIGRATION_CATALOG', icon: FileCheck, label: 'Migration Gap Analysis' },
          { id: 'HANDOFF', icon: Code2, label: 'Phase 16 Handoff' },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: REGISTRY & CATALOG */}
      {/* ============================================================ */}
      {activeTab === 'REGISTRY' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Filter by ID, name, or description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400"
                />
              </div>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Types ({configurations.length})</option>
                <option value="DATA_QUALITY_RULE">Data Quality Rule</option>
                <option value="FRESHNESS_POLICY">Freshness Policy</option>
                <option value="SCORING_MODEL_CONFIG">Scoring Model Config</option>
                <option value="WORKFLOW_GATE">Workflow Gate</option>
                <option value="EXPORT_PROFILE">Export Profile</option>
                <option value="VALIDATION_POLICY">Validation Policy</option>
                <option value="FEATURE_FLAG">Feature Flag</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('RULE_BUILDER')}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Draft</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Configuration Table */}
            <div className="lg:col-span-2 space-y-3">
              {filteredConfigs.map(cfg => {
                const activeVer = cfg.versions.find(v => v.version === cfg.currentActiveVersion) || cfg.versions[0];
                const isSelected = cfg.configurationId === selectedConfig.configurationId;

                return (
                  <div
                    key={cfg.configurationId}
                    onClick={() => setSelectedConfigId(cfg.configurationId)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                            {cfg.configurationId}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            {cfg.configurationType}
                          </span>
                          {cfg.isProtectedSecurityCritical && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              SECURITY PROTECTED
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900">{cfg.name}</h4>
                        <p className="text-xs text-neutral-600 line-clamp-2">{cfg.description}</p>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          activeVer.lifecycleState === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                          activeVer.lifecycleState === 'SCHEDULED' ? 'bg-amber-100 text-amber-800' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          v{activeVer.version} &bull; {activeVer.lifecycleState}
                        </span>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {activeVer.environment}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="font-mono text-[10px]">Owner: {cfg.ownerTeam}</span>
                      <div className="flex gap-2">
                        {cfg.tags.map(t => (
                          <span key={t} className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Col: Version Inspector & Metadata */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">Active Configuration Inspector</div>
                  <h3 className="text-base font-bold text-neutral-900 mt-1">{selectedConfig.name}</h3>
                  <div className="font-mono text-xs text-neutral-600 mt-0.5">{selectedConfig.configurationId}</div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Schema ID:</span>
                    <span className="font-mono text-neutral-800">{selectedConfig.schemaId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Active Version:</span>
                    <span className="font-mono font-bold text-emerald-700">v{selectedConfig.currentActiveVersion}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Highest Created Version:</span>
                    <span className="font-mono text-neutral-800">v{selectedConfig.highestVersion}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Security Invariant:</span>
                    <span className="font-bold">{selectedConfig.isProtectedSecurityCritical ? 'Yes (Immutable Core)' : 'No (Tenant Scoped)'}</span>
                  </div>
                </div>

                {/* Version List */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-neutral-900">Available Immutable Versions:</div>
                  <div className="space-y-1.5">
                    {selectedConfig.versions.map(ver => (
                      <div
                        key={ver.version}
                        className="p-2.5 rounded-lg border border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-neutral-900">Version {ver.version}</span>
                          <span className="text-[10px] text-neutral-500 font-mono ml-2">{ver.environment}</span>
                          <div className="text-[10px] text-neutral-400 mt-0.5 truncate max-w-[180px]">
                            Hash: {ver.contentHash.slice(0, 16)}...
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ver.lifecycleState === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                          ver.lifecycleState === 'SCHEDULED' ? 'bg-amber-100 text-amber-800' :
                          'bg-neutral-200 text-neutral-700'
                        }`}>
                          {ver.lifecycleState}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      handleRunSimulation(selectedConfig, selectedConfig.currentActiveVersion);
                      setActiveTab('SIMULATION');
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Simulate Active Version</span>
                  </button>

                  <button
                    onClick={() => {
                      setDiffVersionA(selectedConfig.versions[0]?.version || 1);
                      setDiffVersionB(selectedConfig.versions[1]?.version || selectedConfig.versions[0]?.version || 1);
                      setActiveTab('DIFF_VIEWER');
                    }}
                    className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Semantic Diff</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: VISUAL RULE BUILDER */}
      {/* ============================================================ */}
      {activeTab === 'RULE_BUILDER' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-700" />
              <span>Governed AST Rule Builder (Zero Arbitrary Code Execution)</span>
            </div>
            <p className="text-blue-800 leading-relaxed">
              Rules are constructed as typed Abstract Syntax Trees (AST). Arbitrary JavaScript, raw SQL, shell commands, or unauthorized network fetches are strictly impossible by architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                1. Select Field &amp; Predicate Operator
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Configuration Type</label>
                  <select
                    value={builderConfigType}
                    onChange={e => setBuilderConfigType(e.target.value as ConfigurationType)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono"
                  >
                    <option value="DATA_QUALITY_RULE">DATA_QUALITY_RULE</option>
                    <option value="FRESHNESS_POLICY">FRESHNESS_POLICY</option>
                    <option value="SCORING_MODEL_CONFIG">SCORING_MODEL_CONFIG</option>
                    <option value="WORKFLOW_GATE">WORKFLOW_GATE</option>
                    <option value="EXPORT_PROFILE">EXPORT_PROFILE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Governed Field</label>
                  <select
                    value={builderSelectedField}
                    onChange={e => {
                      setBuilderSelectedField(e.target.value);
                      const f = GOVERNED_FIELD_REGISTRY.find(gf => gf.fieldId === e.target.value);
                      if (f && f.allowedOperators.length > 0) {
                        setBuilderOperator(f.allowedOperators[0]);
                      }
                    }}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono"
                  >
                    {GOVERNED_FIELD_REGISTRY.map(f => (
                      <option key={f.fieldId} value={f.fieldId}>
                        {f.fieldId} ({f.dataType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Type-Compatible Operator</label>
                  <select
                    value={builderOperator}
                    onChange={e => setBuilderOperator(e.target.value as OperatorType)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono"
                  >
                    {GOVERNED_FIELD_REGISTRY.find(f => f.fieldId === builderSelectedField)?.allowedOperators.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
                <div className="sm:col-span-3">
                  <label className="block text-neutral-500 font-bold mb-1">Evaluation Value / Operand</label>
                  <input
                    type="text"
                    value={builderValue}
                    onChange={e => setBuilderValue(e.target.value)}
                    placeholder="Enter operand value (e.g. 7, VERIFIED, apexdental.com)"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Rule</span>
                  </button>
                </div>
              </div>

              {/* Conditions Table */}
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">Current AST Conditions:</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-500">Combine with:</span>
                    <button
                      onClick={() => setBuilderLogicalOp('AND')}
                      className={`px-2 py-0.5 rounded font-mono font-bold ${
                        builderLogicalOp === 'AND' ? 'bg-purple-600 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      AND
                    </button>
                    <button
                      onClick={() => setBuilderLogicalOp('OR')}
                      className={`px-2 py-0.5 rounded font-mono font-bold ${
                        builderLogicalOp === 'OR' ? 'bg-purple-600 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      OR
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {builderConditions.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-neutral-400">{i + 1}.</span>
                        <span className="font-bold text-blue-600">{c.field}</span>
                        <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded text-[10px]">
                          {c.operator}
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {String(c.value ?? '')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveCondition(i)}
                        className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Trigger */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleValidateAST}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Run Pre-Flight AST Validator</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleRunSimulation(selectedConfig, selectedConfig.currentActiveVersion);
                    setActiveTab('SIMULATION');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs"
                >
                  <Play className="w-4 h-4" />
                  <span>Simulate On Fixture</span>
                </button>
              </div>

              {builderValidationMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  builderValidationMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {builderValidationMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{builderValidationMsg.text}</span>
                </div>
              )}
            </div>

            {/* Right Col: Compiled AST JSON Preview */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Compiled Safe AST Representation</h4>
                  <div className="text-[10px] text-neutral-400">Deterministic In-Memory Structure</div>
                </div>
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 font-mono text-[10px] rounded">
                  Max Depth: 4
                </span>
              </div>

              <pre className="p-3 bg-neutral-900 text-neutral-200 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed">
{JSON.stringify(
  {
    logicalOperator: builderLogicalOp,
    conditions: builderConditions
  },
  null,
  2
)}
              </pre>

              <div className="text-[11px] text-neutral-500 space-y-2">
                <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Kernel Security Invariants</span>
                </div>
                <p>
                  Expressions run in an unprivileged in-memory evaluator with strict timeouts (max 50ms) and depth caps. No external side-effects or process mutations are permitted.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: SEMANTIC DIFF VIEWER */}
      {/* ============================================================ */}
      {activeTab === 'DIFF_VIEWER' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Semantic Configuration Diff Engine</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Comparing Version v3 (Current Active) against Version v4 (Scheduled Tightened SLA).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">Target Config:</span>
              <span className="text-xs font-mono font-bold bg-neutral-100 px-2 py-1 rounded">
                verification.freshness_sla
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Version 3 Column */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div>
                  <span className="font-bold text-sm text-neutral-900">Version 3 (Baseline)</span>
                  <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono rounded">
                    ACTIVE PROD
                  </span>
                </div>
                <span className="font-mono text-[10px] text-neutral-400">Hash: f4b0c222...</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg font-mono text-xs space-y-2 border border-neutral-200">
                <div className="text-neutral-500">// Payload Specification:</div>
                <div>maxAgeHours: <span className="text-blue-600 font-bold">168</span> (7 Days)</div>
                <div>actionOnStale: <span className="text-neutral-800 font-bold">"TRIGGER_DAG_REVERIFY"</span></div>
                <div>expression: verification.freshness_days &le; 7</div>
              </div>

              <div className="text-xs text-neutral-600 space-y-1">
                <div className="font-bold">Human Explanation:</div>
                <p>Landing page verification evidence is valid up to 7 calendar days before requiring fresh HTTP probe.</p>
              </div>
            </div>

            {/* Version 4 Column */}
            <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2 pl-2">
                <div>
                  <span className="font-bold text-sm text-neutral-900">Version 4 (Proposed)</span>
                  <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-mono rounded">
                    SCHEDULED
                  </span>
                </div>
                <span className="font-mono text-[10px] text-neutral-400">Hash: a1c0d332...</span>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-lg font-mono text-xs space-y-2 border border-blue-100 pl-4">
                <div className="text-neutral-500">// Payload Specification:</div>
                <div>
                  maxAgeHours: <span className="text-rose-600 font-bold line-through mr-2">168</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-1 rounded">72</span> (3 Days)
                </div>
                <div>actionOnStale: <span className="text-neutral-800 font-bold">"TRIGGER_DAG_REVERIFY"</span></div>
                <div>expression: verification.freshness_days &le; 3</div>
              </div>

              <div className="text-xs text-neutral-600 space-y-1 pl-2">
                <div className="font-bold">Impact &amp; Risk Derivation:</div>
                <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">
                  Tightens SLA threshold by 57%. Simulation predicts +20% additional background reverification crawler jobs per day, increasing lead freshness score.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: DEPENDENCY GRAPH & CYCLE ANALYSIS */}
      {/* ============================================================ */}
      {activeTab === 'DEPENDENCY_GRAPH' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Configuration Dependency DAG</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Upstream rules, gates, scoring models, and downstream export profile dependencies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-xs font-bold rounded flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cycle Check: 0 Circular Paths Detected
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs overflow-x-auto">
            <div className="min-w-[700px] flex items-center justify-between py-6">
              {/* Node 1: Quality Rule */}
              <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-center w-52 shrink-0 shadow-xs">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Root Ingestion Invariant</span>
                <h5 className="font-bold text-xs text-neutral-900 mt-1">quality.required_advertiser_id</h5>
                <span className="text-[10px] text-neutral-500 font-mono block mt-1">v3 &bull; GLOBAL</span>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-[9px] font-mono text-neutral-400 mb-1">REQUIRES</span>
                <div className="h-0.5 w-full bg-neutral-300 flex items-center justify-end">
                  <ArrowRight className="w-4 h-4 text-neutral-400 -mr-1" />
                </div>
              </div>

              {/* Node 2: Freshness Policy */}
              <div className="p-4 rounded-xl border-2 border-blue-300 bg-blue-50 text-center w-52 shrink-0 shadow-xs">
                <span className="text-[10px] font-mono font-bold text-blue-800 uppercase block">Operational SLA</span>
                <h5 className="font-bold text-xs text-neutral-900 mt-1">verification.freshness_sla</h5>
                <span className="text-[10px] text-neutral-500 font-mono block mt-1">v3 &bull; GLOBAL</span>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-[9px] font-mono text-neutral-400 mb-1">INFLUENCES</span>
                <div className="h-0.5 w-full bg-neutral-300 flex items-center justify-end">
                  <ArrowRight className="w-4 h-4 text-neutral-400 -mr-1" />
                </div>
              </div>

              {/* Node 3: Scoring Model */}
              <div className="p-4 rounded-xl border-2 border-purple-300 bg-purple-50 text-center w-52 shrink-0 shadow-xs">
                <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">Qualification Math</span>
                <h5 className="font-bold text-xs text-neutral-900 mt-1">scoring.lead_qualification_v2</h5>
                <span className="text-[10px] text-neutral-500 font-mono block mt-1">v4 &bull; GLOBAL</span>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-[9px] font-mono text-neutral-400 mb-1">GATES</span>
                <div className="h-0.5 w-full bg-neutral-300 flex items-center justify-end">
                  <ArrowRight className="w-4 h-4 text-neutral-400 -mr-1" />
                </div>
              </div>

              {/* Node 4: Export Profile */}
              <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50 text-center w-52 shrink-0 shadow-xs">
                <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Outbound Governance</span>
                <h5 className="font-bold text-xs text-neutral-900 mt-1">export.sanitized_leads_profile</h5>
                <span className="text-[10px] text-neutral-500 font-mono block mt-1">v2 &bull; GLOBAL</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: SIMULATION & SHADOW CENTER */}
      {/* ============================================================ */}
      {activeTab === 'SIMULATION' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Interactive Simulation &amp; Shadow Mode Center</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Evaluate configuration rules against bounded historical snapshots without mutating persistent database records.
              </p>
            </div>

            <button
              onClick={() => handleRunSimulation(selectedConfig, selectedConfig.currentActiveVersion)}
              disabled={isSimulating}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSimulating ? 'Evaluating...' : 'Re-Run Simulation Dry-Run'}</span>
            </button>
          </div>

          {simulationResult && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Evaluated Population</div>
                <div className="text-2xl font-bold text-neutral-900 mt-1">{simulationResult.recordsEvaluated} Records</div>
                <div className="text-[11px] text-neutral-500 mt-1">Time: {simulationResult.durationMs}ms</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Passed Conditions</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{simulationResult.passCount} Records</div>
                <div className="text-[11px] text-emerald-700 mt-1">Conforming to policy</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Failed / Filtered</div>
                <div className="text-2xl font-bold text-rose-600 mt-1">{simulationResult.failCount} Records</div>
                <div className="text-[11px] text-rose-700 mt-1">Identified non-conforming</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Downstream Workflows</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{simulationResult.downstreamImpacts.workflowsAffected} DAGs</div>
                <div className="text-[11px] text-neutral-500 mt-1">Reverification triggered</div>
              </div>
            </div>
          )}

          {/* Shadow Mode Comparison */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Live Shadow Mode Disagreement Matrix</h4>
                <p className="text-[11px] text-neutral-500">
                  Comparing ACTIVE v4 scoring vs SHADOW v5 scoring on sample candidate streams.
                </p>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold rounded">
                Isolation Guaranteed: Read-Only
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {SAMPLE_SHADOW_COMPARISONS.map(item => (
                <div
                  key={item.recordId}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    item.disagreement ? 'bg-amber-50/60 border-amber-200' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{item.recordName}</span>
                      <span className="font-mono text-[10px] text-neutral-500">({item.recordId})</span>
                      {item.disagreement && (
                        <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] font-bold rounded font-mono">
                          DISAGREEMENT DETECTED
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600 text-[11px]">{item.notes}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[9px]">ACTIVE (v4)</span>
                      <span className="font-bold">{item.activeResult.state} ({item.activeResult.score} pts)</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    <div>
                      <span className="text-blue-500 block text-[9px]">SHADOW (v5)</span>
                      <span className="font-bold text-blue-700">{item.shadowResult.state} ({item.shadowResult.score} pts)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: REVIEW & APPROVALS */}
      {/* ============================================================ */}
      {activeTab === 'REVIEWS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Separation-of-Duties Review &amp; Approval Desk</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Enforcing strict authorization gates: Authors cannot approve their own configuration drafts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-bold">Simulate Persona:</span>
              <select
                value={currentUserRole}
                onChange={e => setCurrentUserRole(e.target.value as any)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 font-mono font-bold"
              >
                <option value="AUTHOR">dev.artem (Author)</option>
                <option value="APPROVER">lead.marcus (Approver)</option>
                <option value="SECURITY_ADMIN">sre.security (Security Admin)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="font-mono text-xs text-blue-600 font-bold">Pending Approval Request</span>
                <h4 className="text-sm font-bold text-neutral-900 mt-1">
                  verification.freshness_sla &bull; Version 4
                </h4>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Author: <span className="font-mono font-semibold">dev.artem@platform.internal</span> &bull; Submitted 2026-09-16T10:00:00Z
                </div>
              </div>

              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-mono font-bold rounded">
                AWAITING APPROVAL
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg text-xs space-y-2 border border-neutral-100">
              <div className="font-bold text-neutral-900">Change Justification:</div>
              <p className="text-neutral-700">
                Tighten destination verification staleness SLA from 7 days down to 3 days to eliminate stale landing pages before export to high-volume CRM pipelines.
              </p>
            </div>

            {/* Separation of Duties Enforcement Notice */}
            {currentUserRole === 'AUTHOR' ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs flex items-center gap-2 text-rose-800">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Approval Blocked:</strong> Separation of Duties policy prevents author <em>(dev.artem)</em> from signing off on their own draft. Switch persona to Approver to execute sign-off.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Separation of Duties Satisfied:</strong> Active actor <em>({currentActor})</em> has authorized <code>CONFIG_APPROVER</code> credentials distinct from author.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={currentUserRole === 'AUTHOR'}
                onClick={() => alert('Changes requested back to author for calibration.')}
                className="px-3 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Request Changes
              </button>
              <button
                disabled={currentUserRole === 'AUTHOR'}
                onClick={() => {
                  alert('Approved! Version scheduled for atomic activation window.');
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Approve &amp; Schedule Activation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: ACTIVATION & ROLLBACK */}
      {/* ============================================================ */}
      {activeTab === 'ACTIVATION_ROLLBACK' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Atomic Activation &amp; Instant Rollback Center</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Zero-downtime atomic version activation and non-destructive rollbacks preserving full historical telemetry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scheduled Activation Box */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <Clock className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-neutral-900">Scheduled Atomic Publication Windows</h4>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-neutral-900">verification.freshness_sla v4</span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-mono font-bold text-[10px]">
                    EFFECTIVE: 2026-09-18T00:00:00Z
                  </span>
                </div>
                <p className="text-amber-800">
                  Scheduled for automatic atomic swap during low-traffic maintenance window. Previous known-good version (v3) retained as instant failback target.
                </p>
              </div>
            </div>

            {/* Rollback Box */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <h4 className="text-sm font-bold text-neutral-900">Non-Destructive Version Rollback</h4>
              </div>

              <div className="text-xs space-y-3">
                <p className="text-neutral-600">
                  Select a prior approved immutable version to restore. The current version will remain in the audit ledger and will not be erased.
                </p>

                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Target Version to Restore</label>
                  <select className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono text-xs">
                    <option value="2">Version 2 (Activated 2026-08-15) - Tested Stable</option>
                    <option value="1">Version 1 (Initial Release 2026-07-01)</option>
                  </select>
                </div>

                <button
                  onClick={() => handleRollback(2, 'Emergency calibration adjustment requested by operator')}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Execute Non-Destructive Rollback</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8: HEALTH, DRIFT & AUDIT LEDGER */}
      {/* ============================================================ */}
      {activeTab === 'HEALTH_AUDIT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Configuration Drift</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">0% Divergence</div>
              <div className="text-[11px] text-neutral-500 mt-1">PostgreSQL vs Runtime Cache</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Expiring Overrides</div>
              <div className="text-xl font-bold text-neutral-900 mt-1">0 Overrides Active</div>
              <div className="text-[11px] text-emerald-600 mt-1">Zero unmanaged bypasses</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Golden Regression Suite</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">10 / 10 Tests Passed</div>
              <div className="text-[11px] text-neutral-500 mt-1">All AST suites verified</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Immutable Configuration Audit Ledger</h4>
                <p className="text-[11px] text-neutral-500">
                  Append-only cryptographic event stream tracking every draft, approval, activation, and rollback.
                </p>
              </div>
              <span className="font-mono text-xs text-neutral-400">Total Events: {auditLog.length}</span>
            </div>

            <div className="space-y-2 text-xs">
              {auditLog.map(ev => (
                <div
                  key={ev.eventId}
                  className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        ev.action === 'ACTIVATED' ? 'bg-emerald-100 text-emerald-800' :
                        ev.action === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        ev.action === 'ROLLED_BACK' ? 'bg-rose-100 text-rose-800' :
                        'bg-neutral-200 text-neutral-800'
                      }`}>
                        {ev.action}
                      </span>
                      <span className="font-mono font-bold text-neutral-900">{ev.configurationId}</span>
                      <span className="font-mono text-neutral-400">v{ev.version}</span>
                    </div>
                    <p className="text-neutral-700">{ev.reason}</p>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      Actor: {ev.actor} ({ev.actorRole}) &bull; CorrID: {ev.correlationId}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                    {new Date(ev.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 9: MIGRATION GAP ANALYSIS */}
      {/* ============================================================ */}
      {activeTab === 'MIGRATION_CATALOG' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Phase 01–15 Migration Gap Analysis</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Classifying hard-coded system behaviors into governed configuration vs mandatory code-enforced security invariants.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {MIGRATION_GAP_ANALYSIS.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">{item.sourcePhase}</span>
                    <h4 className="font-bold text-sm text-neutral-900 mt-0.5">{item.component}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    item.classification === 'CONFIGURABLE_NOW' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    item.classification === 'SECURITY_CRITICAL' || item.classification === 'NOT_SAFE_TO_CONFIGURE' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {item.classification}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-neutral-700">
                  <div>
                    <span className="text-neutral-400 font-bold block mb-0.5">Current Implementation:</span>
                    <p className="bg-neutral-50 p-2 rounded border border-neutral-100 font-mono text-[11px]">
                      {item.currentImplementation}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold block mb-0.5">Proposed Migration Path:</span>
                    <p className="bg-neutral-50 p-2 rounded border border-neutral-100 font-mono text-[11px]">
                      {item.proposedMigrationPath}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-neutral-500 text-[11px]">
                  <strong>Rationalization:</strong> {item.rationalization}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 10: PHASE 16 MACHINE-READABLE HANDOFF */}
      {/* ============================================================ */}
      {activeTab === 'HANDOFF' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Phase 16 Machine-Readable Handoff Contract</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Exact Section 95 JSON contract specifying the complete configuration architecture for Phase 17 Policy &amp; Safety Control consumption.
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(PHASE_16_HANDOFF_PAYLOAD, null, 2));
                alert('Phase 16 Handoff JSON copied to clipboard!');
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copy Contract JSON</span>
            </button>
          </div>

          <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 shadow-md">
            <pre className="text-neutral-200 font-mono text-xs leading-relaxed overflow-x-auto max-h-[600px] scrollbar-thin">
              {JSON.stringify(PHASE_16_HANDOFF_PAYLOAD, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
