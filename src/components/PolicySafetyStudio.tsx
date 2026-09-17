import React, { useState, useMemo } from 'react';
import { PageHeader } from './common/PageHeader';
import {
  Policy,
  PolicyType,
  PolicyScope,
  PolicyDecisionType,
  CapabilityId,
  CAPABILITY_REGISTRY,
  SAFETY_INVARIANT_REGISTRY,
  INITIAL_POLICIES,
  INITIAL_CIRCUIT_BREAKERS,
  INITIAL_KILL_SWITCHES,
  SAMPLE_POLICY_AUDIT_LOG,
  INITIAL_POLICY_VIOLATIONS,
  CONTROL_MATRIX,
  PHASE_17_HANDOFF_PAYLOAD,
  evaluatePolicy,
  EvaluationContext,
  PolicyDecision,
  CircuitBreaker,
  EmergencyKillSwitch,
  PolicyViolation
} from '../data/phase17PolicySafetyEngine';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Zap,
  Power,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  ArrowRight,
  Search,
  Filter,
  Code2,
  FileCheck,
  Eye,
  Sliders,
  History,
  Activity,
  AlertOctagon,
  Key,
  Users,
  Terminal,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const PolicySafetyStudio: React.FC = () => {
  // Navigation tabs within Policy & Safety Studio
  const [activeTab, setActiveTab] = useState<
    | 'REGISTRY'
    | 'INVARIANTS'
    | 'EVALUATOR_TRACE'
    | 'CIRCUIT_BREAKERS'
    | 'VIOLATIONS'
    | 'CONTROL_MATRIX'
    | 'AUDIT_LEDGER'
    | 'RUNBOOKS'
    | 'HANDOFF'
  >('REGISTRY');

  // Policies state
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(INITIAL_POLICIES[0].policyId);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterScope, setFilterScope] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Circuit breakers & Kill switches state
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreaker[]>(INITIAL_CIRCUIT_BREAKERS);
  const [killSwitches, setKillSwitches] = useState<EmergencyKillSwitch[]>(INITIAL_KILL_SWITCHES);

  // Violations state
  const [violations, setViolations] = useState<PolicyViolation[]>(INITIAL_POLICY_VIOLATIONS);

  // Selected policy
  const selectedPolicy = useMemo(() => {
    return policies.find(p => p.policyId === selectedPolicyId) || policies[0];
  }, [policies, selectedPolicyId]);

  // Interactive Policy Evaluator State
  const [evalActorRole, setEvalActorRole] = useState<string>('RESEARCH_ANALYST');
  const [evalTenantTier, setEvalTenantTier] = useState<string>('ENTERPRISE_PRO');
  const [evalCapability, setEvalCapability] = useState<CapabilityId>('EXPORT_DATA');
  const [evalResourcePii, setEvalResourcePii] = useState<boolean>(true);
  const [evalQualityState, setEvalQualityState] = useState<string>('PASSED_VERIFIED');
  const [evalEnvironment, setEvalEnvironment] = useState<'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'>('PRODUCTION');
  const [lastEvaluationDecision, setLastEvaluationDecision] = useState<PolicyDecision | null>(null);

  // Check if system emergency state is triggered
  const isEmergencyActive = useMemo(() => {
    return killSwitches.some(k => k.isActive);
  }, [killSwitches]);

  // Handle Interactive Evaluation
  const handleRunEvaluation = () => {
    const ctx: EvaluationContext = {
      actor: {
        id: 'usr-interactive-evaluator@session',
        role: evalActorRole,
        permissions:
          evalActorRole === 'SECURITY_ADMIN'
            ? ['browser.ingest', 'data.extract', 'verify.destination', 'identity.resolve', 'export.generate', 'pii.unmasked_read', 'config.activate']
            : evalActorRole === 'POLICY_ADMIN'
            ? ['browser.ingest', 'data.extract', 'verify.destination', 'export.generate', 'config.author']
            : ['browser.ingest', 'data.extract', 'export.generate']
      },
      tenant: {
        id: 'tenant-active-context',
        tier: evalTenantTier
      },
      capability: evalCapability,
      resource: {
        type: 'AD_DATASET',
        classification: evalResourcePii ? 'CONFIDENTIAL_PII' : 'PUBLIC_METADATA',
        hasPii: evalResourcePii,
        qualityState: evalQualityState,
        verificationState: evalQualityState === 'PASSED_VERIFIED' ? 'VERIFIED' : 'UNVERIFIED'
      },
      environment: evalEnvironment,
      systemEmergencyState: isEmergencyActive
    };

    const decision = evaluatePolicy(ctx, policies);
    setLastEvaluationDecision(decision);
  };

  // Toggle Kill Switch Handler
  const handleToggleKillSwitch = (switchId: string) => {
    const target = killSwitches.find(k => k.switchId === switchId);
    if (!target) return;

    const willBeActive = !target.isActive;
    const confirmMsg = willBeActive
      ? `EMERGENCY ALERT: You are about to ENGAGE "${target.name}". This will immediately pause all active crawling sessions and freeze public ad ingestion. Confirm?`
      : `SECURITY SIGN-OFF: You are disengaging "${target.name}". Confirm controlled operational resumption?`;

    if (window.confirm(confirmMsg)) {
      setKillSwitches(
        killSwitches.map(k => (k.switchId === switchId ? { ...k, isActive: willBeActive, activatedAt: new Date().toISOString() } : k))
      );
    }
  };

  // Toggle Circuit Breaker Handler
  const handleTripCircuitBreaker = (breakerId: string) => {
    setCircuitBreakers(
      circuitBreakers.map(cb => {
        if (cb.breakerId === breakerId) {
          const nextState = cb.state === 'NORMAL_CLOSED' ? 'TRIPPED_OPEN' : 'NORMAL_CLOSED';
          return { ...cb, state: nextState, trippedAt: nextState === 'TRIPPED_OPEN' ? new Date().toISOString() : undefined };
        }
        return cb;
      })
    );
  };

  // Filtered policies
  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      if (filterType !== 'ALL' && p.policyType !== filterType) return false;
      if (filterScope !== 'ALL' && p.scope !== filterScope) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.policyId.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [policies, filterType, filterScope, searchQuery]);

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Top Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Security & Governance', active: false },
          { label: 'Policy & Safety Control Plane (Phase 17)', active: true },
        ]}
        title="Policy, Safety, Security Invariants & Control Plane"
        description="Centralized authority defining what the system is permitted to do, prohibited capabilities, precedence hierarchy, fail-closed enforcement, and emergency kill switches."
        statusBadge={
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 ${
              isEmergencyActive
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isEmergencyActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
              {isEmergencyActive ? 'EMERGENCY FREEZE ENGAGED' : 'Policy Control Plane Active'}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
              Precedence Engine v17.0
            </span>
          </div>
        }
      />

      {/* Emergency Alert Banner if Active */}
      {isEmergencyActive && (
        <div className="p-4 bg-rose-600 text-white rounded-xl shadow-md flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-bold text-sm">CRITICAL PLATFORM EMERGENCY STATE ACTIVE</div>
              <div className="text-xs text-rose-100">
                Public ingestion sessions and extraction dispatches have been forcefully halted by an active emergency kill switch.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('CIRCUIT_BREAKERS')}
            className="px-3 py-1.5 bg-white text-rose-700 font-bold rounded-lg text-xs hover:bg-rose-50 transition-colors shrink-0"
          >
            Review Emergency Controls
          </button>
        </div>
      )}

      {/* Quick Invariants & Health Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Active Policy Rules</div>
          <div className="text-xl font-bold text-neutral-900 mt-0.5">{policies.length} Policies</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">100% Deterministic AST</div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Protected Safety Invariants</div>
          <div className="text-xl font-bold text-rose-700 mt-0.5">{SAFETY_INVARIANT_REGISTRY.length} Invariants</div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">Non-Exemptable &bull; Immutable</div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Governed Capabilities</div>
          <div className="text-xl font-bold text-blue-700 mt-0.5">{CAPABILITY_REGISTRY.length} Capabilities</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Fail-Closed Boundary</div>
        </div>
        <div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Blocked Violations</div>
          <div className="text-xl font-bold text-amber-700 mt-0.5">{violations.length} Incidents</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Zero Bypass Permitted</div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2 overflow-x-auto text-xs font-semibold scrollbar-thin">
        {[
          { id: 'REGISTRY', icon: Shield, label: 'Policy Registry' },
          { id: 'INVARIANTS', icon: Lock, label: 'Safety Invariants' },
          { id: 'EVALUATOR_TRACE', icon: Terminal, label: 'Interactive Decision Evaluator' },
          { id: 'CIRCUIT_BREAKERS', icon: Power, label: 'Emergency & Kill Switches' },
          { id: 'VIOLATIONS', icon: ShieldAlert, label: 'Violations & Incidents' },
          { id: 'CONTROL_MATRIX', icon: Layers, label: 'Code vs Policy Matrix' },
          { id: 'AUDIT_LEDGER', icon: History, label: 'Immutable Audit Ledger' },
          { id: 'RUNBOOKS', icon: FileCheck, label: 'Emergency Runbooks' },
          { id: 'HANDOFF', icon: Code2, label: 'Phase 17 Handoff' },
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
      {/* TAB 1: POLICY REGISTRY */}
      {/* ============================================================ */}
      {activeTab === 'REGISTRY' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Filter by policy ID, name, or description..."
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
                <option value="ALL">All Types ({policies.length})</option>
                <option value="SECURITY_POLICY">SECURITY_POLICY</option>
                <option value="SAFETY_POLICY">SAFETY_POLICY</option>
                <option value="PII_POLICY">PII_POLICY</option>
                <option value="DATA_GOVERNANCE_POLICY">DATA_GOVERNANCE_POLICY</option>
                <option value="RATE_CONTROL_POLICY">RATE_CONTROL_POLICY</option>
              </select>

              <select
                value={filterScope}
                onChange={e => setFilterScope(e.target.value)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Scopes</option>
                <option value="SECURITY_INVARIANT">SECURITY_INVARIANT (Rank 100)</option>
                <option value="PLATFORM">PLATFORM (Rank 80)</option>
                <option value="GOVERNANCE">GOVERNANCE (Rank 60)</option>
                <option value="TENANT">TENANT (Rank 40)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Policies List */}
            <div className="lg:col-span-2 space-y-3">
              {filteredPolicies.map(pol => {
                const activeVer = pol.versions.find(v => v.version === pol.currentActiveVersion) || pol.versions[0];
                const isSelected = pol.policyId === selectedPolicy.policyId;

                return (
                  <div
                    key={pol.policyId}
                    onClick={() => setSelectedPolicyId(pol.policyId)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                            {pol.policyId}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            {pol.scope}
                          </span>
                          {pol.isProtectedSecurityCritical && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              PROTECTED INVARIANT
                            </span>
                          )}
                          {pol.isNonExemptable && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              NON-EXEMPTABLE
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900">{pol.name}</h4>
                        <p className="text-xs text-neutral-600 line-clamp-2">{pol.description}</p>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          activeVer.decisionOnMatch === 'DENY' ? 'bg-rose-100 text-rose-800' :
                          activeVer.decisionOnMatch === 'PAUSE' ? 'bg-amber-100 text-amber-800' :
                          activeVer.decisionOnMatch === 'REQUIRE_APPROVAL' ? 'bg-purple-100 text-purple-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {activeVer.decisionOnMatch}
                        </span>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          v{activeVer.version} &bull; {activeVer.lifecycleState}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="font-mono text-[10px]">Target Capability: {pol.targetCapability}</span>
                      <div className="flex gap-1.5">
                        {pol.tags.map(t => (
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

            {/* Right Col: Policy Inspector & AST */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">Policy Inspector</div>
                  <h3 className="text-base font-bold text-neutral-900 mt-1">{selectedPolicy.name}</h3>
                  <div className="font-mono text-xs text-neutral-600 mt-0.5">{selectedPolicy.policyId}</div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Precedence Scope:</span>
                    <span className="font-mono font-bold text-neutral-800">{selectedPolicy.scope}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Protection Level:</span>
                    <span className="font-bold text-rose-700">{selectedPolicy.protectionLevel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Target Capability:</span>
                    <span className="font-mono text-neutral-800">{selectedPolicy.targetCapability}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Owner Team:</span>
                    <span className="text-neutral-800">{selectedPolicy.ownerTeam}</span>
                  </div>
                </div>

                {/* AST Condition Viewer */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                    <span>Safe AST Conditions:</span>
                    <span className="font-mono text-[10px] bg-neutral-100 px-1.5 py-0.2 rounded">
                      Logic: {selectedPolicy.versions[0]?.ast.logicalOperator}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-900 text-neutral-200 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed">
{JSON.stringify(selectedPolicy.versions[0]?.ast, null, 2)}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-neutral-900">Enforcement Action:</div>
                  <div className="font-mono text-blue-700 font-semibold">{selectedPolicy.versions[0]?.enforcementAction}</div>
                  <p className="text-neutral-600 mt-1">{selectedPolicy.versions[0]?.rationale}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SAFETY INVARIANTS */}
      {/* ============================================================ */}
      {activeTab === 'INVARIANTS' && (
        <div className="space-y-6">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-rose-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-700" />
              <span>Immutable Safety Invariants (Strict Defense-In-Depth)</span>
            </div>
            <p className="text-rose-800 leading-relaxed">
              These six core platform invariants are hard-coded into the architecture. They sit above ordinary tenant configurations and cannot be weakened, bypassed, or disabled through any API or user preference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAFETY_INVARIANT_REGISTRY.map(inv => (
              <div key={inv.invariantId} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    {inv.invariantId}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-600 text-white font-mono text-[10px] rounded font-bold">
                    NON-EXEMPTABLE
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-neutral-900">{inv.name}</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{inv.description}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs">
                  <div className="text-[11px] font-bold text-neutral-500">Enforcement Layers:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {inv.enforcementLayers.map(layer => (
                      <span key={layer} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 font-mono text-[10px] rounded border border-neutral-200">
                        {layer}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-2">
                  <span>Fail-Closed Action: {inv.failClosedAction}</span>
                  <span>Test: {inv.testSuite}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: INTERACTIVE DECISION EVALUATOR & TRACE */}
      {/* ============================================================ */}
      {activeTab === 'EVALUATOR_TRACE' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-700" />
              <span>Deterministic Precedence Evaluator (Zero Arbitrary Execution)</span>
            </div>
            <p className="text-blue-800 leading-relaxed">
              Test hypothetical actor, tenant, capability, and resource contexts against active platform policies. Observe the full precedence chain and mathematical conflict resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form Column */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                1. Context Parameters
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Actor Role</label>
                  <select
                    value={evalActorRole}
                    onChange={e => setEvalActorRole(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono"
                  >
                    <option value="RESEARCH_ANALYST">RESEARCH_ANALYST</option>
                    <option value="POLICY_AUTHOR">POLICY_AUTHOR</option>
                    <option value="POLICY_ADMIN">POLICY_ADMIN</option>
                    <option value="SECURITY_ADMIN">SECURITY_ADMIN</option>
                    <option value="CHIEF_COMPLIANCE_OFFICER">CHIEF_COMPLIANCE_OFFICER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Tenant Tier</label>
                  <select
                    value={evalTenantTier}
                    onChange={e => setEvalTenantTier(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono"
                  >
                    <option value="ENTERPRISE_PRO">ENTERPRISE_PRO</option>
                    <option value="TEAM_GROWTH">TEAM_GROWTH</option>
                    <option value="FREE_EXPLORER">FREE_EXPLORER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Requested Capability</label>
                  <select
                    value={evalCapability}
                    onChange={e => setEvalCapability(e.target.value as CapabilityId)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono"
                  >
                    {CAPABILITY_REGISTRY.map(c => (
                      <option key={c.capabilityId} value={c.capabilityId}>
                        {c.capabilityId} {c.prohibitedPermanently ? '(PERMANENTLY PROHIBITED)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Resource Contains Unmasked PII?</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEvalResourcePii(true)}
                      className={`flex-1 py-1.5 rounded text-xs font-mono font-bold ${
                        evalResourcePii ? 'bg-purple-600 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      True (Phone/Email Present)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEvalResourcePii(false)}
                      className={`flex-1 py-1.5 rounded text-xs font-mono font-bold ${
                        !evalResourcePii ? 'bg-purple-600 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      False (Public Data Only)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Resource Verification Quality State</label>
                  <select
                    value={evalQualityState}
                    onChange={e => setEvalQualityState(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 font-mono"
                  >
                    <option value="PASSED_VERIFIED">PASSED_VERIFIED (HTTP 200 / SSL Valid)</option>
                    <option value="FAILED_UNVERIFIED">FAILED_UNVERIFIED (Ghost / Dead Link)</option>
                    <option value="PENDING_CRAWLER">PENDING_CRAWLER</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRunEvaluation}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Run Pure Decision Evaluation</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Decision Trace Column */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                2. Decision Output &amp; Precedence Trace
              </h3>

              {lastEvaluationDecision ? (
                <div className="space-y-4">
                  {/* Decision Banner */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    lastEvaluationDecision.decision === 'ALLOW' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                    lastEvaluationDecision.decision === 'REQUIRE_APPROVAL' ? 'bg-purple-50 border-purple-200 text-purple-900' :
                    lastEvaluationDecision.decision === 'PAUSE' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                    'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      {lastEvaluationDecision.decision === 'ALLOW' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-mono font-bold tracking-wider uppercase">Effective Decision</div>
                        <div className="text-xl font-bold">{lastEvaluationDecision.decision}</div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <div>Scope: <span className="font-bold">{lastEvaluationDecision.scope}</span></div>
                      <div className="text-[10px] text-neutral-500">Eval ID: {lastEvaluationDecision.evaluationId.slice(0, 12)}...</div>
                    </div>
                  </div>

                  {/* Reason & Enforcement */}
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-neutral-700">Reason:</span>
                      <p className="text-neutral-900 mt-0.5">{lastEvaluationDecision.reason}</p>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-700">Enforcement Action:</span>
                      <span className="ml-2 font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {lastEvaluationDecision.enforcementAction}
                      </span>
                    </div>
                  </div>

                  {/* Precedence Hierarchy Chain */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-neutral-900">Precedence Chain Evaluated:</div>
                    <div className="space-y-1.5">
                      {lastEvaluationDecision.precedenceChain.map((pc, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-400 font-bold">{idx + 1}.</span>
                            <span className="px-1.5 py-0.2 bg-neutral-200 text-neutral-800 rounded text-[10px] font-bold">
                              {pc.scope}
                            </span>
                            <span className="text-neutral-700 truncate max-w-[240px]">{pc.policyId}</span>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pc.decision === 'ALLOW' ? 'bg-emerald-100 text-emerald-800' :
                            pc.decision === 'PAUSE' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {pc.decision}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-400 text-xs space-y-2">
                  <Terminal className="w-8 h-8 mx-auto text-neutral-300" />
                  <p>Select context attributes on the left and click "Run Pure Decision Evaluation".</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: CIRCUIT BREAKERS & EMERGENCY KILL SWITCHES */}
      {/* ============================================================ */}
      {activeTab === 'CIRCUIT_BREAKERS' && (
        <div className="space-y-6">
          {/* Kill Switches */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Platform Emergency Kill Switches (Section 41)</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Forces immediate halt of automated browser sessions or isolates compromised tenant partitions without deleting data.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200 font-bold">
                ELEVATED ADMIN ONLY
              </span>
            </div>

            <div className="space-y-3">
              {killSwitches.map(k => (
                <div
                  key={k.switchId}
                  className={`p-4 rounded-xl border transition-all ${
                    k.isActive ? 'bg-rose-50/70 border-rose-300' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">{k.name}</span>
                        <span className="font-mono text-[10px] px-2 py-0.2 rounded bg-neutral-200 text-neutral-700">
                          {k.scope}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">
                        <span className="font-bold text-neutral-800">What Stops: </span>
                        {k.whatStops.join('; ')}
                      </div>
                      <div className="text-xs text-neutral-600">
                        <span className="font-bold text-emerald-800">What Continues: </span>
                        {k.whatContinues.join('; ')}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => handleToggleKillSwitch(k.switchId)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs ${
                          k.isActive
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{k.isActive ? 'Disengage Kill Switch' : 'Engage Emergency Freeze'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Circuit Breakers */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">Automated Subsystem Circuit Breakers (Section 40)</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Automatically tripped upon rate anomalies, downstream challenge responses, or memory pressure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {circuitBreakers.map(cb => (
                <div key={cb.breakerId} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-500">{cb.breakerId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      cb.state === 'NORMAL_CLOSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {cb.state}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs text-neutral-900">{cb.name}</h5>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Target: {cb.targetSubsystem}</div>
                  </div>

                  <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">Auto-Reset: {cb.autoResetTimeoutMinutes}m</span>
                    <button
                      onClick={() => handleTripCircuitBreaker(cb.breakerId)}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      {cb.state === 'NORMAL_CLOSED' ? 'Test Trip' : 'Reset'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: VIOLATIONS & INCIDENTS */}
      {/* ============================================================ */}
      {activeTab === 'VIOLATIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Policy Violation &amp; Incident Center</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Active security and policy enforcement blocks requiring review or remediation.
              </p>
            </div>
            <span className="text-xs font-mono bg-neutral-100 px-2.5 py-1 rounded font-bold">
              {violations.length} Active Records
            </span>
          </div>

          <div className="space-y-3">
            {violations.map(vio => (
              <div key={vio.violationId} className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {vio.violationId}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        vio.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {vio.severity}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Policy: {vio.policyId}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-neutral-900 mt-1">{vio.reason}</div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700">
                    {vio.status}
                  </span>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg text-xs space-y-1">
                  <div className="text-neutral-500 font-mono">Resource: {vio.resource}</div>
                  <div className="text-neutral-500 font-mono">Actor: {vio.actor} &bull; Tenant: {vio.tenantId}</div>
                  {vio.remediationPlan && (
                    <div className="text-emerald-800 font-medium mt-1">
                      <span className="font-bold">Remediation: </span>
                      {vio.remediationPlan}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: CONTROL MATRIX (CODE VS POLICY VS INFRASTRUCTURE) */}
      {/* ============================================================ */}
      {activeTab === 'CONTROL_MATRIX' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900">Code vs Policy vs Infrastructure Enforcement Matrix (Section 101)</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Definitive classification of platform security behaviors into non-configurable code, policy gates, and infrastructure limits.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold text-neutral-600">
                  <th className="p-3">Domain &amp; Control</th>
                  <th className="p-3">Code Enforced</th>
                  <th className="p-3">Policy Controlled</th>
                  <th className="p-3">Configuration Controlled</th>
                  <th className="p-3">Infrastructure Enforced</th>
                  <th className="p-3">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {CONTROL_MATRIX.map(c => (
                  <tr key={c.controlId} className="hover:bg-neutral-50/60">
                    <td className="p-3 space-y-0.5 max-w-[200px]">
                      <span className="font-mono text-[10px] text-neutral-400">{c.controlId}</span>
                      <div className="font-bold text-neutral-900">{c.securityDomain}</div>
                      <div className="text-neutral-500 text-[11px]">{c.controlDescription}</div>
                    </td>
                    <td className="p-3 text-neutral-700 font-mono text-[11px] max-w-[180px]">{c.codeEnforced}</td>
                    <td className="p-3 text-blue-700 font-mono text-[11px] max-w-[180px]">{c.policyControlled}</td>
                    <td className="p-3 text-neutral-600 font-mono text-[11px] max-w-[160px]">{c.configControlled}</td>
                    <td className="p-3 text-neutral-600 font-mono text-[11px] max-w-[160px]">{c.infrastructureEnforced}</td>
                    <td className="p-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap ${
                        c.classification === 'NON_CONFIGURABLE' ? 'bg-rose-100 text-rose-800' :
                        c.classification === 'POLICY_CONTROLLED' ? 'bg-blue-100 text-blue-800' :
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {c.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: AUDIT LEDGER */}
      {/* ============================================================ */}
      {activeTab === 'AUDIT_LEDGER' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Cryptographic Policy Audit Ledger</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Append-only immutable event stream of policy activations, exception requests, and blocked executions.
              </p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-xs font-bold rounded">
              Zero Tamper Switch
            </span>
          </div>

          <div className="space-y-2">
            {SAMPLE_POLICY_AUDIT_LOG.map(evt => (
              <div key={evt.eventId} className="p-3.5 bg-white rounded-xl border border-neutral-200 text-xs flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900">{evt.action}</span>
                    <span className="font-mono text-[10px] text-neutral-400">({evt.eventId})</span>
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-mono">
                      {evt.actorRole}
                    </span>
                  </div>
                  <p className="text-neutral-600">{evt.reason}</p>
                </div>

                <div className="text-right shrink-0 font-mono text-[10px] text-neutral-400">
                  <div>{evt.timestamp}</div>
                  <div>Actor: {evt.actor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8: RUNBOOKS */}
      {/* ============================================================ */}
      {activeTab === 'RUNBOOKS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900">Incident &amp; Operational Safety Runbooks (Section 97)</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Standard operating procedures for policy engine outage, emergency kill switch recovery, and unauthorized change containment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">RB-01</span>
              <h4 className="font-bold text-sm text-neutral-900">Policy Engine Outage &amp; Fail-Closed Response</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                If the policy evaluation service becomes unreachable, all runtime capability gates automatically fail closed (yielding DENY). Verify PostgreSQL node health, restart cached snapshot daemon, and check alert channels.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-2">
              <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">RB-02</span>
              <h4 className="font-bold text-sm text-neutral-900">Emergency Kill Switch Resumption Procedure</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Disengaging the public ingestion freeze requires dual sign-off from Security Admin and SRE Lead. Run pre-flight health checks, confirm zero stealth solver hooks remain, and resume workers with canary rate limit.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-2">
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">RB-03</span>
              <h4 className="font-bold text-sm text-neutral-900">Investigating Critical Invariant Violations</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Upon violation of INV-01 (Meta API) or INV-02 (Anti-bot evasion), the offending tenant partition is quarantined immediately. SecOps reviews incoming payload and permanently blacklists bad configurations.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-2">
              <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">RB-04</span>
              <h4 className="font-bold text-sm text-neutral-900">Non-Destructive Policy Rollback</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                In the event of an erroneous policy publication, roll back atomically to the target immutable version. History is 100% preserved; a superseding activation audit record is logged.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 9: MACHINE-READABLE HANDOFF */}
      {/* ============================================================ */}
      {activeTab === 'HANDOFF' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Phase 17 Machine-Readable Handoff Contract</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Exact Section 104 specification payload ready for Phase 18 Multi-Tenant &amp; Organization Architecture.
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(PHASE_17_HANDOFF_PAYLOAD, null, 2));
                alert('Phase 17 handoff JSON payload copied to clipboard!');
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy JSON Payload</span>
            </button>
          </div>

          <pre className="p-4 bg-neutral-900 text-neutral-200 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-neutral-800">
{JSON.stringify(PHASE_17_HANDOFF_PAYLOAD, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
