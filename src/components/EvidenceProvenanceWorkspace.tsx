import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  FileText,
  Layers,
  GitBranch,
  Clock,
  Database,
  Hash,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ArrowRight,
  History,
  Download,
  Box,
  Key,
  RefreshCw,
  Lock,
  Eye,
  Tag,
  Filter,
  FileCheck,
  AlertCircle,
  ChevronRight,
  Share2
} from 'lucide-react';

import {
  SAMPLE_TENANTS,
  SAMPLE_USERS,
  SAMPLE_MEMBERSHIPS,
  TenantContext
} from '../data/phase18MultiTenantEngine';

import {
  SourceRecord,
  ObservationRecord,
  RawArtifactRecord,
  EvidenceRecord,
  ClaimRecord,
  ResearchSnapshot,
  ResearchRun,
  ResearchReplay,
  EvidencePackageManifest,
  SAMPLE_SOURCES,
  SAMPLE_ARTIFACTS,
  SAMPLE_OBSERVATIONS,
  SAMPLE_EVIDENCE,
  SAMPLE_CLAIMS,
  SAMPLE_PROVENANCE_EDGES,
  SAMPLE_SNAPSHOTS,
  SAMPLE_RESEARCH_RUNS,
  SAMPLE_RESEARCH_REPLAYS,
  SAMPLE_PACKAGES,
  verifyPhase21Invariants,
  reconstructSnapshot,
  verifyPackageIntegrity,
  SnapshotReconstructionResult,
  EvidencePackageVerificationResult
} from '../data/phase21EvidenceEngine';

type ActiveViewTab = 
  | 'evidence-inspector'
  | 'lineage-graph'
  | 'claims-conflicts'
  | 'snapshots'
  | 'replays'
  | 'packages'
  | 'invariants';

export const EvidenceProvenanceWorkspace: React.FC = () => {
  // 1. Tenant & Context State
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant_apex_growth');
  const [activeUserId, setActiveUserId] = useState<string>('usr_sarah_chen');
  const [activeTab, setActiveTab] = useState<ActiveViewTab>('evidence-inspector');

  const activeTenant = useMemo(() => {
    return SAMPLE_TENANTS.find(t => t.tenantId === activeTenantId) || SAMPLE_TENANTS[0];
  }, [activeTenantId]);

  const activeUser = useMemo(() => {
    return SAMPLE_USERS.find(u => u.userId === activeUserId) || SAMPLE_USERS[0];
  }, [activeUserId]);

  const activeMembership = useMemo(() => {
    return SAMPLE_MEMBERSHIPS.find(m => m.userId === activeUserId && m.tenantId === activeTenantId) || SAMPLE_MEMBERSHIPS[0];
  }, [activeUserId, activeTenantId]);

  const tenantContext: TenantContext = useMemo(() => ({
    orgId: activeTenant.orgId,
    tenantId: activeTenant.tenantId,
    workspaceId: activeMembership?.workspaceAssignments[0] || 'ws_apex_solar_enterprise',
    userId: activeUser.userId,
    role: activeMembership?.assignedRole || 'RESEARCH_LEAD',
    permissions: ['research:view_dossier', 'research:review_approve', 'workflow:execute'],
    correlationId: `cor_p21_${Date.now()}`,
    requestId: `req_p21_${Date.now()}`,
    sourceIp: activeUser.lastLoginIp,
    dataResidency: 'US_EAST',
    isolationLevel: activeTenant.isolationLevel,
    sessionAuthenticatedAt: new Date().toISOString(),
    mfaVerified: true
  }), [activeTenant, activeUser, activeMembership]);

  // 2. Selection States
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(SAMPLE_EVIDENCE[0].evidenceId);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(SAMPLE_SNAPSHOTS[0].snapshotId);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(SAMPLE_PACKAGES[0].packageId);
  const [reconstructionResult, setReconstructionResult] = useState<SnapshotReconstructionResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<EvidencePackageVerificationResult | null>(null);
  const [activeFilterStatus, setActiveFilterStatus] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Selected Evidence Item
  const selectedEvidence = useMemo(() => {
    return SAMPLE_EVIDENCE.find(e => e.evidenceId === selectedEvidenceId) || SAMPLE_EVIDENCE[0];
  }, [selectedEvidenceId]);

  const selectedObservation = useMemo(() => {
    return SAMPLE_OBSERVATIONS.find(o => o.id === selectedEvidence.observationId);
  }, [selectedEvidence]);

  const selectedSource = useMemo(() => {
    return SAMPLE_SOURCES.find(s => s.sourceId === selectedEvidence.sourceId);
  }, [selectedEvidence]);

  const selectedArtifact = useMemo(() => {
    return SAMPLE_ARTIFACTS.find(a => a.artifactId === selectedEvidence.artifactId);
  }, [selectedEvidence]);

  // Filtered Evidence list
  const filteredEvidence = useMemo(() => {
    return SAMPLE_EVIDENCE.filter(e => {
      // Tenant boundary
      if (e.tenantId !== tenantContext.tenantId && tenantContext.role !== 'ORG_OWNER') {
        return false;
      }
      if (activeFilterStatus !== 'ALL' && e.status !== activeFilterStatus) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          e.evidenceId.toLowerCase().includes(q) ||
          e.rawRepresentation.toLowerCase().includes(q) ||
          e.normalizedRepresentation.toLowerCase().includes(q) ||
          (e.fieldPath && e.fieldPath.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tenantContext, activeFilterStatus, searchFilter]);

  // Invariants
  const invariants = useMemo(() => {
    return verifyPhase21Invariants(tenantContext);
  }, [tenantContext]);

  // Actions
  const handleReconstructSnapshot = (snapId: string) => {
    const res = reconstructSnapshot(snapId, tenantContext);
    setReconstructionResult(res);
  };

  const handleVerifyPackage = (pkgId: string) => {
    const pkg = SAMPLE_PACKAGES.find(p => p.packageId === pkgId) || SAMPLE_PACKAGES[0];
    const res = verifyPackageIntegrity(pkg, tenantContext);
    setVerificationResult(res);
  };

  return (
    <div className="flex flex-col w-full min-w-0 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Bar with Tenant Context and Cryptographic Invariant Badges */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Evidence, Provenance & Reproducible Research Engine
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Phase 21
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  Cryptographic SHA-256 CAS Artifacts, Strict Conceptual Model, Point-in-Time Reconstruction & Lineage Traversal
                </p>
              </div>
            </div>
          </div>

          {/* Context Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tenant Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400">Tenant:</span>
              <select
                value={activeTenantId}
                onChange={e => setActiveTenantId(e.target.value)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {SAMPLE_TENANTS.map(t => (
                  <option key={t.tenantId} value={t.tenantId} className="bg-slate-900 text-slate-200">
                    {t.name} ({t.isolationLevel})
                  </option>
                ))}
              </select>
            </div>

            {/* User Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400">Actor:</span>
              <select
                value={activeUserId}
                onChange={e => setActiveUserId(e.target.value)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {SAMPLE_USERS.map(u => {
                  const mem = SAMPLE_MEMBERSHIPS.find(m => m.userId === u.userId && m.tenantId === activeTenantId);
                  return (
                    <option key={u.userId} value={u.userId} className="bg-slate-900 text-slate-200">
                      {u.displayName} ({mem?.assignedRole || u.globalSystemRole})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Quick Security Status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-800/70 text-emerald-400 rounded-lg text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>CAS: SHA-256 VERIFIED</span>
            </div>
          </div>
        </div>

        {/* System Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-800/80 pt-4 overflow-x-auto">
          {[
            { id: 'evidence-inspector', label: 'Evidence Inspector', icon: FileText, badge: filteredEvidence.length },
            { id: 'lineage-graph', label: 'Lineage & Provenance Graph', icon: GitBranch },
            { id: 'claims-conflicts', label: 'Claims & Conflicts', icon: AlertTriangle, badge: SAMPLE_CLAIMS.length },
            { id: 'snapshots', label: 'Research Snapshots', icon: Clock, badge: SAMPLE_SNAPSHOTS.length },
            { id: 'replays', label: 'Run Replay & Diff Studio', icon: RefreshCw, badge: SAMPLE_RESEARCH_REPLAYS.length },
            { id: 'packages', label: 'Evidence Packages & Verifier', icon: Box, badge: SAMPLE_PACKAGES.length },
            { id: 'invariants', label: 'Invariants & Compliance (16)', icon: ShieldCheck, badge: invariants.filter(i => i.passed).length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveViewTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Tab View Content */}
      <div className="w-full min-w-0">
        {/* VIEW 1: EVIDENCE INSPECTOR */}
        {activeTab === 'evidence-inspector' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Evidence List */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col h-[740px]">
              <div className="p-4 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Captured Evidence Ledger
                  </h3>
                  <span className="text-xs text-neutral-500 font-mono">
                    {filteredEvidence.length} authorized items
                  </span>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Filter by ID, value, or field..."
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={activeFilterStatus}
                    onChange={e => setActiveFilterStatus(e.target.value)}
                    className="text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="VALIDATED">Validated</option>
                    <option value="CONTRADICTED">Contradicted</option>
                    <option value="STALE">Stale</option>
                  </select>
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-2">
                {filteredEvidence.map(ev => {
                  const isSelected = ev.evidenceId === selectedEvidenceId;
                  return (
                    <div
                      key={ev.evidenceId}
                      onClick={() => setSelectedEvidenceId(ev.evidenceId)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-50 border border-emerald-300 shadow-xs' 
                          : 'hover:bg-neutral-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-neutral-900 truncate">
                          {ev.evidenceId}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                          ev.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ev.status === 'CONTRADICTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ev.status}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-600 truncate mb-2">
                        Field: <span className="font-mono text-neutral-800">{ev.fieldPath || 'root'}</span>
                      </div>

                      <div className="bg-neutral-100/70 p-2 rounded text-[11px] font-mono text-neutral-700 truncate mb-2">
                        {ev.normalizedRepresentation}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ev.observedAt.slice(0, 16).replace('T', ' ')}
                        </span>
                        <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded font-mono">
                          {ev.evidenceType}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Deep Evidence Detail & Conceptual Model */}
            <div className="lg:col-span-7 space-y-6">
              {/* Evidence Inspector Card */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-neutral-900">
                        Evidence Record: {selectedEvidence.evidenceId}
                      </h2>
                      <span className="px-2 py-0.5 text-xs font-mono bg-neutral-100 text-neutral-700 rounded border border-neutral-300">
                        v{selectedEvidence.version}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Target Entity: {selectedEvidence.subjectEntityType} ({selectedEvidence.subjectEntityId})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {selectedEvidence.quality.verificationState}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                      {selectedEvidence.freshness}
                    </span>
                  </div>
                </div>

                {/* Conceptual Model Flow for this Evidence */}
                <div className="mb-5 bg-slate-900 rounded-lg p-4 text-white">
                  <div className="text-xs font-mono text-emerald-400 font-bold mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Conceptual Chain of Custody & Derivation
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">1. Source</div>
                      <div className="font-semibold text-slate-200 truncate mt-0.5" title={selectedSource?.title}>
                        {selectedSource?.sourceType || 'UNKNOWN'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">
                        {selectedSource?.domain}
                      </div>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">2. Observation</div>
                      <div className="font-semibold text-slate-200 truncate mt-0.5">
                        {selectedObservation?.id || 'OBSERVED'}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-1">
                        HTTP {selectedObservation?.environmentMetadata.httpStatusCode}
                      </div>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">3. Raw Artifact</div>
                      <div className="font-semibold text-slate-200 truncate mt-0.5">
                        {selectedArtifact?.artifactId || 'CAS-OBJECT'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                        {selectedArtifact?.contentHash.slice(0, 10)}...
                      </div>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">4. Evidence</div>
                      <div className="font-semibold text-emerald-400 truncate mt-0.5">
                        {selectedEvidence.evidenceType}
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono mt-1">
                        {selectedEvidence.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raw vs Normalized Representation */}
                <div className="space-y-4 mb-5">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-neutral-500" />
                        Raw Extracted Payload (Immutable Raw Artifact Ref)
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        Hash: {selectedArtifact?.contentHash.slice(0, 16)}...
                      </span>
                    </div>
                    <pre className="bg-neutral-900 text-neutral-200 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-neutral-700">
                      {selectedEvidence.rawRepresentation}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Normalized Canonical Representation
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 font-medium">
                        Extractor: {selectedObservation?.extractionVersion || 'v2.4.1'}
                      </span>
                    </div>
                    <div className="bg-emerald-50/60 text-emerald-950 p-3 rounded-lg text-xs font-mono border border-emerald-200 font-medium">
                      {selectedEvidence.normalizedRepresentation}
                    </div>
                  </div>
                </div>

                {/* Quality Dimensions Breakdown */}
                <div className="border-t border-neutral-200 pt-4 mb-5">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase font-mono mb-3">
                    Multi-Dimensional Evidence Quality Assessment
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                      <div className="text-[10px] text-neutral-500">Source Reliability</div>
                      <div className="text-xs font-semibold text-neutral-900 mt-0.5">
                        {selectedEvidence.quality.sourceReliability}
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                      <div className="text-[10px] text-neutral-500">Directness</div>
                      <div className="text-xs font-semibold text-neutral-900 mt-0.5">
                        {selectedEvidence.quality.directness}
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                      <div className="text-[10px] text-neutral-500">Consistency</div>
                      <div className="text-xs font-semibold text-neutral-900 mt-0.5">
                        {selectedEvidence.quality.consistency}
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                      <div className="text-[10px] text-neutral-500">Lineage Integrity</div>
                      <div className="text-xs font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {selectedEvidence.quality.provenanceIntegrity}
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                      <div className="text-[10px] text-neutral-500">Hours Since Observation</div>
                      <div className="text-xs font-semibold text-neutral-900 mt-0.5 font-mono">
                        {selectedEvidence.quality.hoursSinceObserved} hrs
                      </div>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                      <div className="text-[10px] text-neutral-500">Completeness</div>
                      <div className="text-xs font-semibold text-neutral-900 mt-0.5">
                        {selectedEvidence.quality.completeness}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Annotations Layer (Isolated from raw evidence content) */}
                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase font-mono flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-neutral-500" />
                      Isolated Researcher Annotations ({selectedEvidence.annotations.length})
                    </h4>
                    <span className="text-[10px] text-neutral-500 italic">
                      Private to tenant team &bull; Never baked into raw source
                    </span>
                  </div>

                  {selectedEvidence.annotations.length === 0 ? (
                    <div className="text-xs text-neutral-400 italic p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      No private researcher annotations recorded for this evidence item.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedEvidence.annotations.map(ann => (
                        <div key={ann.annotationId} className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                            <span className="font-semibold text-neutral-800">
                              {ann.authorUserId} ({ann.authorRole})
                            </span>
                            <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded text-[10px] font-mono">
                              {ann.visibility}
                            </span>
                          </div>
                          <p className="text-neutral-800">{ann.noteText}</p>
                          {ann.highlightExcerpt && (
                            <div className="mt-1.5 text-[11px] font-mono bg-neutral-200/60 p-1.5 rounded text-neutral-700">
                              Highlight: &ldquo;{ann.highlightExcerpt}&rdquo;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: LINEAGE & PROVENANCE GRAPH */}
        {activeTab === 'lineage-graph' && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <div>
                <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-emerald-600" />
                  Visual Multi-Tier Provenance & Lineage Graph
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Full deterministic traversal from Public Source to Automated Observation, CAS Artifact, Extraction, Qualification, and Final Decision
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Acyclic Verified (0 Cycles)
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-mono font-medium rounded-lg border border-blue-200">
                  Max Depth: 6 Hops
                </span>
              </div>
            </div>

            {/* Visual Node Diagram */}
            <div className="bg-slate-900 rounded-xl p-6 text-white overflow-x-auto">
              <div className="min-w-[700px] flex flex-col space-y-6">
                {/* Tier 1: Source */}
                <div className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-xs font-mono text-emerald-400 font-bold uppercase">
                    1. Source
                  </div>
                  <div className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Meta Ad Library Public Page</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        facebook.com/ads/library/?view_all_page_id=108392817492019
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                      PUBLIC_ACCESSIBLE
                    </span>
                  </div>
                </div>

                <div className="flex justify-center text-slate-600 pl-36">
                  <ArrowRight className="w-5 h-5 rotate-90 text-slate-500" />
                </div>

                {/* Tier 2: Observation */}
                <div className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-xs font-mono text-emerald-400 font-bold uppercase">
                    2. Observation
                  </div>
                  <div className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Playwright Worker US-East Crawl Run #42</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Observed: 2026-08-10 14:20:05 UTC &bull; HTTP 200 &bull; TLS 1.3
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 rounded">
                      STATUS_SUCCESS
                    </span>
                  </div>
                </div>

                <div className="flex justify-center text-slate-600 pl-36">
                  <ArrowRight className="w-5 h-5 rotate-90 text-slate-500" />
                </div>

                {/* Tier 3: CAS Raw Artifact */}
                <div className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-xs font-mono text-emerald-400 font-bold uppercase">
                    3. Raw Artifact
                  </div>
                  <div className="flex-1 bg-slate-800 border border-emerald-500/50 p-3 rounded-lg flex items-center justify-between bg-emerald-950/20">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Immutable HTML DOM Snapshot (245 KB)</span>
                        <span className="px-1.5 py-0.5 text-[10px] bg-emerald-900/60 text-emerald-300 rounded font-mono">
                          IMMUTABLE
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                        SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded">
                      cas://sha256/e3b0c4...
                    </span>
                  </div>
                </div>

                <div className="flex justify-center text-slate-600 pl-36">
                  <ArrowRight className="w-5 h-5 rotate-90 text-slate-500" />
                </div>

                {/* Tier 4: Extraction & Normalization */}
                <div className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-xs font-mono text-emerald-400 font-bold uppercase">
                    4. Extraction
                  </div>
                  <div className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">DOM Parser v2.4.1 Extraction</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Extracted: activeAdCount = 142 &bull; LandingPage = us.sunpower.com
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 rounded">
                      SCHEMA_ADLIB_V3
                    </span>
                  </div>
                </div>

                <div className="flex justify-center text-slate-600 pl-36">
                  <ArrowRight className="w-5 h-5 rotate-90 text-slate-500" />
                </div>

                {/* Tier 5: Verification & Qualification */}
                <div className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-xs font-mono text-emerald-400 font-bold uppercase">
                    5. Verification
                  </div>
                  <div className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">DNS & TLS Handshake Probe (Phase 5)</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Domain Verified: sunpower.com &bull; DNS A/AAAA match &bull; TLS SAN confirmed
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                      VERIFIED_PRIMARY
                    </span>
                  </div>
                </div>

                <div className="flex justify-center text-slate-600 pl-36">
                  <ArrowRight className="w-5 h-5 rotate-90 text-slate-500" />
                </div>

                {/* Tier 6: Lead Qualification Decision */}
                <div className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-xs font-mono text-emerald-400 font-bold uppercase">
                    6. Decision
                  </div>
                  <div className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Qualified Enterprise Lead (Score: 92/100)</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Scoring Model v4.2 &bull; Decision By: usr_sarah_chen (2026-08-10 15:30:00 UTC)
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                      DECISION_APPROVED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edge Inspection Ledger */}
            <div className="mt-6 border-t border-neutral-200 pt-5">
              <h3 className="text-xs font-bold text-neutral-900 uppercase font-mono mb-3">
                Graph Edge Inventory & Tenant Scope
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Edge ID</th>
                      <th className="py-2 px-3 font-semibold">Source Node</th>
                      <th className="py-2 px-3 font-semibold">Relation</th>
                      <th className="py-2 px-3 font-semibold">Target Node</th>
                      <th className="py-2 px-3 font-semibold">Actor / Component</th>
                      <th className="py-2 px-3 font-semibold">Tenant Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {SAMPLE_PROVENANCE_EDGES.map(edge => (
                      <tr key={edge.edgeId} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-mono font-medium text-neutral-900">{edge.edgeId}</td>
                        <td className="py-2 px-3 font-mono text-neutral-600">{edge.sourceNodeId}</td>
                        <td className="py-2 px-3 font-mono text-emerald-600 font-semibold">{edge.edgeType}</td>
                        <td className="py-2 px-3 font-mono text-neutral-600">{edge.targetNodeId}</td>
                        <td className="py-2 px-3 text-neutral-700">{edge.actorOrSystem}</td>
                        <td className="py-2 px-3 font-mono text-neutral-500">{edge.tenantScope}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CLAIMS & CONFLICTS */}
        {activeTab === 'claims-conflicts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
                <div>
                  <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Claims & Evidence Support Graph
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Explicit classification of assertions (FACT, INFERENCE, HYPOTHESIS) with supporting vs contradicting evidence citations
                  </p>
                </div>

                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200">
                  1 Conflict Requiring Investigation
                </span>
              </div>

              {/* Claims List */}
              <div className="space-y-4">
                {SAMPLE_CLAIMS.map(claim => {
                  const isConflict = claim.status === 'UNRESOLVED_CONFLICT' || claim.contradictingEvidenceIds.length > 0;
                  return (
                    <div
                      key={claim.claimId}
                      className={`p-5 rounded-xl border transition-all ${
                        isConflict
                          ? 'bg-amber-50/40 border-amber-300'
                          : 'bg-neutral-50/60 border-neutral-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-neutral-900">
                            {claim.claimId}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            claim.classification === 'FACT' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {claim.classification}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          claim.status === 'SUPPORTED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {claim.status}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-neutral-900 mb-4">
                        &ldquo;{claim.claimText}&rdquo;
                      </p>

                      {/* Evidence Citations Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Supporting Evidence */}
                        <div className="bg-white p-3.5 rounded-lg border border-neutral-200">
                          <div className="font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Supporting Evidence ({claim.supportingEvidenceIds.length})
                          </div>
                          {claim.supportingEvidenceIds.length === 0 ? (
                            <div className="text-neutral-400 italic">No supporting evidence items linked.</div>
                          ) : (
                            <ul className="space-y-1.5">
                              {claim.supportingEvidenceIds.map(evId => (
                                <li key={evId} className="flex items-center justify-between font-mono bg-emerald-50/80 px-2 py-1 rounded text-emerald-950">
                                  <span>{evId}</span>
                                  <span className="text-[10px] text-emerald-700">VERIFIED</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Contradicting Evidence */}
                        <div className="bg-white p-3.5 rounded-lg border border-neutral-200">
                          <div className="font-bold text-rose-700 mb-2 flex items-center gap-1.5">
                            <XCircle className="w-4 h-4" />
                            Contradicting Evidence ({claim.contradictingEvidenceIds.length})
                          </div>
                          {claim.contradictingEvidenceIds.length === 0 ? (
                            <div className="text-neutral-400 italic">No contradictions detected.</div>
                          ) : (
                            <ul className="space-y-1.5">
                              {claim.contradictingEvidenceIds.map(evId => (
                                <li key={evId} className="flex items-center justify-between font-mono bg-rose-50 px-2 py-1 rounded text-rose-950">
                                  <span>{evId}</span>
                                  <span className="text-[10px] text-rose-700 font-bold">CONTRADICTED</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Resolution Note if conflict */}
                      {claim.resolutionNote && (
                        <div className="mt-4 p-3 bg-amber-100/60 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Investigator Resolution Note:</span> {claim.resolutionNote}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: RESEARCH SNAPSHOTS & RECONSTRUCTION */}
        {activeTab === 'snapshots' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Snapshots List */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Research Snapshots Inventory
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {SAMPLE_SNAPSHOTS.length} Snapshots
                </span>
              </div>

              <div className="space-y-3">
                {SAMPLE_SNAPSHOTS.map(snap => {
                  const isSelected = snap.snapshotId === selectedSnapshotId;
                  return (
                    <div
                      key={snap.snapshotId}
                      onClick={() => setSelectedSnapshotId(snap.snapshotId)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-300 shadow-xs' 
                          : 'bg-neutral-50/60 border-neutral-200 hover:bg-neutral-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-neutral-900 truncate">
                          {snap.name}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                          {snap.completeness}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-2 mb-2">
                        {snap.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                        <span>{snap.createdAt.slice(0, 10)}</span>
                        <span>{snap.reproducibilityLevel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Point-in-Time Reconstruction Workbench */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-5">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">
                      Point-in-Time Historical Reconstruction
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Selected: <span className="font-mono font-medium text-neutral-800">{selectedSnapshotId}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleReconstructSnapshot(selectedSnapshotId)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reconstruct Historical State
                  </button>
                </div>

                {/* Manifest Metadata */}
                {(() => {
                  const snap = SAMPLE_SNAPSHOTS.find(s => s.snapshotId === selectedSnapshotId);
                  if (!snap) return null;
                  return (
                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 text-xs mb-5 space-y-2">
                      <div className="flex items-center justify-between font-mono text-neutral-600">
                        <span>Manifest SHA-256:</span>
                        <span className="text-neutral-900 font-bold">{snap.manifestHash}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-200 font-mono text-[11px]">
                        <div>Config: {snap.configurationVersion}</div>
                        <div>Policy: {snap.policyVersion}</div>
                        <div>Scoring: {snap.scoringModelVersion}</div>
                        <div>Index: {snap.searchIndexVersion}</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Reconstruction Execution Output */}
                {reconstructionResult ? (
                  <div className="bg-slate-900 rounded-xl p-5 text-white animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-bold text-white">Historical State Successfully Reconstructed</h4>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {reconstructionResult.reconstructedAt.slice(0, 19).replace('T', ' ')} UTC
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs font-mono">
                      <div className="bg-slate-800 p-2.5 rounded">
                        <div className="text-slate-400 text-[10px]">EVIDENCE ITEMS</div>
                        <div className="text-emerald-400 font-bold text-sm mt-0.5">{reconstructionResult.evidenceCount}</div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded">
                        <div className="text-slate-400 text-[10px]">CLAIMS</div>
                        <div className="text-emerald-400 font-bold text-sm mt-0.5">{reconstructionResult.claimsCount}</div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded">
                        <div className="text-slate-400 text-[10px]">SOURCES ONLINE</div>
                        <div className="text-blue-400 font-bold text-sm mt-0.5">{reconstructionResult.sourcesAvailable}</div>
                      </div>
                      <div className="bg-slate-800 p-2.5 rounded">
                        <div className="text-slate-400 text-[10px]">SOURCES OFFLINE</div>
                        <div className="text-amber-400 font-bold text-sm mt-0.5">{reconstructionResult.sourcesOffline}</div>
                      </div>
                    </div>

                    {/* Reconstructed Entities */}
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-slate-400 uppercase">
                        Historical Entities at Snapshot Point:
                      </div>
                      {reconstructionResult.entities.map(ent => (
                        <div key={ent.entityId} className="bg-slate-800/80 p-3 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white">{ent.canonicalName}</span>
                            <span className="text-slate-400 font-mono ml-2">({ent.domain})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-emerald-400 font-bold">
                              Lead Score: {ent.reconstructedScore}/100
                            </span>
                            <span className="px-2 py-0.5 bg-slate-700 text-slate-200 text-[10px] rounded font-mono">
                              {ent.qualificationState}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {reconstructionResult.divergenceWarnings.length > 0 && (
                      <div className="mt-4 p-3 bg-amber-950/60 border border-amber-800/60 text-amber-300 rounded-lg text-xs">
                        <span className="font-bold">Temporal Divergence Notice:</span> {reconstructionResult.divergenceWarnings[0]}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-400 text-xs border border-dashed border-neutral-300 rounded-xl">
                    Click &ldquo;Reconstruct Historical State&rdquo; to execute deterministic point-in-time state assembly from stored CAS artifacts.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: RUN REPLAY & DIFF STUDIO */}
        {activeTab === 'replays' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
                <div>
                  <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-emerald-600" />
                    Research Run Replay & Automated Diff Engine
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Execute deterministic replay runs over historical inputs to isolate pipeline version drift from live source drift
                  </p>
                </div>

                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-mono font-medium rounded-lg border border-purple-200">
                  Invariant: Original Run Immutability Guaranteed
                </span>
              </div>

              {/* Sample Replay Diff Result */}
              {SAMPLE_RESEARCH_REPLAYS.map(replay => (
                <div key={replay.replayId} className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">{replay.replayId}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-100 text-amber-800 rounded font-bold">
                          {replay.status}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 font-mono mt-0.5">
                        Original: {replay.originalRunId} &rarr; Replay Run: {replay.replayRunId}
                      </div>
                    </div>

                    <div className="text-xs text-neutral-600">
                      Executed By: <span className="font-semibold text-neutral-900">{replay.executedByUserId}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-800 bg-white p-3 rounded-lg border border-neutral-200">
                    {replay.summary}
                  </p>

                  {/* Diff Table */}
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 uppercase font-mono mb-2">
                      Field-Level Replay Variance Matrix
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white rounded-lg border border-neutral-200">
                        <thead className="bg-neutral-100 text-neutral-600 border-b border-neutral-200">
                          <tr>
                            <th className="py-2 px-3 font-semibold">Field / Entity</th>
                            <th className="py-2 px-3 font-semibold">Original Run</th>
                            <th className="py-2 px-3 font-semibold">Replay Run</th>
                            <th className="py-2 px-3 font-semibold">Classification</th>
                            <th className="py-2 px-3 font-semibold">Explanation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {replay.differences.map((diff, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50/60">
                              <td className="py-2 px-3 font-mono font-medium text-neutral-900">{diff.fieldOrEntity}</td>
                              <td className="py-2 px-3 font-mono text-neutral-700">{String(diff.originalValue)}</td>
                              <td className="py-2 px-3 font-mono text-emerald-700 font-bold">{String(diff.replayedValue)}</td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                                  diff.classification === 'EXPECTED' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-purple-100 text-purple-800 font-bold'
                                }`}>
                                  {diff.classification}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-neutral-600">{diff.explanation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: EVIDENCE PACKAGES & VERIFIER */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Packages List */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Box className="w-4 h-4 text-emerald-600" />
                  Evidence Packages Catalog
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {SAMPLE_PACKAGES.length} Package
                </span>
              </div>

              <div className="space-y-3">
                {SAMPLE_PACKAGES.map(pkg => {
                  const isSelected = pkg.packageId === selectedPackageId;
                  return (
                    <div
                      key={pkg.packageId}
                      onClick={() => setSelectedPackageId(pkg.packageId)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-300 shadow-xs' 
                          : 'bg-neutral-50/60 border-neutral-200 hover:bg-neutral-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-neutral-900 truncate">
                          {pkg.name}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                          v{pkg.packageVersion}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-2 mb-2">
                        {pkg.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                        <span>Tenant: {pkg.tenantScope}</span>
                        <span>{pkg.artifactCount} Artifacts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Package Verifier Workbench */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-5">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">
                      Package Verification & Audit Center
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Target: <span className="font-mono font-medium text-neutral-800">{selectedPackageId}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleVerifyPackage(selectedPackageId)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Verify Package Hashes & Signatures
                  </button>
                </div>

                {/* Package Manifest Specifications */}
                {(() => {
                  const pkg = SAMPLE_PACKAGES.find(p => p.packageId === selectedPackageId);
                  if (!pkg) return null;
                  return (
                    <div className="space-y-4 mb-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                          <div className="text-[10px] text-neutral-500">MANIFEST SHA-256</div>
                          <div className="text-neutral-900 font-bold truncate mt-0.5">{pkg.manifestChecksum.slice(0, 12)}...</div>
                        </div>
                        <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                          <div className="text-[10px] text-neutral-500">PACKAGE SHA-256</div>
                          <div className="text-neutral-900 font-bold truncate mt-0.5">{pkg.packageChecksum.slice(0, 12)}...</div>
                        </div>
                        <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                          <div className="text-[10px] text-neutral-500">DIGITAL SIGNATURE</div>
                          <div className="text-emerald-700 font-bold truncate mt-0.5">{pkg.digitalSignature?.algorithm || 'NONE'}</div>
                        </div>
                        <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                          <div className="text-[10px] text-neutral-500">REDACTIONS</div>
                          <div className="text-neutral-900 font-bold mt-0.5">{pkg.redactionsCount} Items</div>
                        </div>
                      </div>

                      {/* Deterministic Packaging Structure */}
                      <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs space-y-1">
                        <div className="text-emerald-400 font-bold text-[11px] mb-1">
                          Canonical ZIP/Archive Structure:
                        </div>
                        <div>├── manifest.json (SHA-256: {pkg.manifestChecksum.slice(0, 12)}...)</div>
                        <div>├── sources/ ({pkg.sourceCount} records)</div>
                        <div>├── observations/ ({pkg.observationCount} records)</div>
                        <div>├── artifacts/ ({pkg.artifactCount} CAS SHA-256 payloads)</div>
                        <div>├── evidence/ ({pkg.evidenceCount} items)</div>
                        <div>├── claims/ ({pkg.claimCount} claims)</div>
                        <div>├── checksums/ (SHA-256 verification manifest)</div>
                        <div>└── signature.bin (RSA-SHA256 KMS signed)</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Verification Results Panel */}
                {verificationResult ? (
                  <div className="bg-slate-900 rounded-xl p-5 text-white animate-in fade-in duration-200 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-bold text-white">Verification Status: {verificationResult.status}</h4>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        Verifier: {verificationResult.verifierVersion}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {verificationResult.checks.map((chk, idx) => (
                        <div key={idx} className="bg-slate-800/80 p-3 rounded-lg flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            {chk.pass ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <div>
                              <div className="font-bold text-white">{chk.checkName}</div>
                              <div className="text-slate-400 text-[11px] mt-0.5">{chk.detail}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                            chk.pass ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                          }`}>
                            {chk.pass ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-neutral-400 text-xs border border-dashed border-neutral-300 rounded-xl">
                    Click &ldquo;Verify Package Hashes & Signatures&rdquo; to execute full package integrity audit against stored CAS blocks.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: INVARIANTS & COMPLIANCE */}
        {activeTab === 'invariants' && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Phase 21 Security, Provenance & Evidence Invariants Test Runner
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  16 non-negotiable architectural invariants mathematically validated across active research fixtures
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200">
                  {invariants.filter(i => i.passed).length} / {invariants.length} PASSED (100%)
                </span>
              </div>
            </div>

            {/* Invariants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invariants.map(inv => (
                <div
                  key={inv.code}
                  className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {inv.code}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-neutral-200 text-neutral-700 rounded">
                        {inv.category}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-neutral-800 mb-1">
                      {inv.name}
                    </div>
                    <p className="text-xs text-neutral-600">
                      {inv.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-200/80 text-[11px] font-mono text-emerald-800 bg-emerald-50/60 p-2 rounded">
                    {inv.telemetry}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
