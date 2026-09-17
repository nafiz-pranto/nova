import React, { useState, useMemo } from 'react';
import {
  Shield,
  Users,
  Building,
  FolderTree,
  Key,
  Server,
  Database,
  Cpu,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Trash2,
  Download,
  Terminal,
  RefreshCw,
  Layers,
  ArrowRight,
  Sparkles,
  Sliders,
  Eye,
  EyeOff,
  Clock,
  Globe,
  Radio,
  Share2,
  Search,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import {
  Organization,
  Tenant,
  Workspace,
  Project,
  TenantUser,
  TenantMembership,
  SystemRole,
  PermissionKey,
  TenantContext,
  SecureResource,
  AccessDecision,
  generateContextDigest,
  evaluateAccess,
  POSTGRES_RLS_POLICIES,
  generatePostgresRlsDdl,
  INITIAL_WORKER_ALLOCATIONS,
  TenantWorkerAllocation,
  TenantPurgeAttestation,
  MultiTenantAuditEvent,
  INITIAL_MULTI_TENANT_AUDIT_LOGS,
  ROLE_PERMISSIONS,
  SAMPLE_ORGANIZATIONS,
  SAMPLE_TENANTS,
  SAMPLE_WORKSPACES,
  SAMPLE_PROJECTS,
  SAMPLE_USERS,
  SAMPLE_MEMBERSHIPS,
  PHASE_18_HANDOFF_METRICS
} from '../data/phase18MultiTenantEngine';

export const MultiTenantPlatformStudio: React.FC = () => {
  // Active Context State
  const [selectedOrgId, setSelectedOrgId] = useState<string>(SAMPLE_ORGANIZATIONS[0].orgId);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(SAMPLE_TENANTS[0].tenantId);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(SAMPLE_WORKSPACES[0].workspaceId);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(SAMPLE_PROJECTS[0].projectId);
  const [selectedUserId, setSelectedUserId] = useState<string>(SAMPLE_USERS[0].userId);

  // Active Studio Sub-tab
  const [activeTab, setActiveTab] = useState<
    'HIERARCHY' | 'ACCESS_SIMULATOR' | 'DATABASE_ISOLATION' | 'WORKER_QUEUES' | 'AUDIT_ISOLATION' | 'LIFECYCLE_PURGE' | 'HANDOFF'
  >('HIERARCHY');

  // Simulator State
  const [simTargetResourceType, setSimTargetResourceType] = useState<SecureResource['resourceType']>('LEAD_DOSSIER');
  const [simTargetTenantId, setSimTargetTenantId] = useState<string>(SAMPLE_TENANTS[0].tenantId);
  const [simTargetConfidentiality, setSimTargetConfidentiality] = useState<SecureResource['confidentiality']>('CONFIDENTIAL');
  const [simContainsPii, setSimContainsPii] = useState<boolean>(true);
  const [simAction, setSimAction] = useState<PermissionKey>('research:view_dossier');
  const [accessResult, setAccessResult] = useState<AccessDecision | null>(null);

  // Database Isolation Test State
  const [crossTenantSqlSimulationResult, setCrossTenantSqlSimulationResult] = useState<{
    attemptedQuery: string;
    executedAsTenant: string;
    targetTenant: string;
    rowsReturned: number;
    rlsEnforced: boolean;
    auditStatus: string;
  } | null>(null);

  // Worker Queue State
  const [workerAllocations, setWorkerAllocations] = useState<TenantWorkerAllocation[]>(INITIAL_WORKER_ALLOCATIONS);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  // Purge Attestation State
  const [activePurgeAttestation, setActivePurgeAttestation] = useState<TenantPurgeAttestation | null>(null);
  const [isPurging, setIsPurging] = useState<boolean>(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<MultiTenantAuditEvent[]>(INITIAL_MULTI_TENANT_AUDIT_LOGS);

  // Resolved active objects
  const activeOrg = useMemo(() => 
    SAMPLE_ORGANIZATIONS.find(o => o.orgId === selectedOrgId) || SAMPLE_ORGANIZATIONS[0],
    [selectedOrgId]
  );

  const availableTenants = useMemo(() => 
    SAMPLE_TENANTS.filter(t => t.orgId === selectedOrgId),
    [selectedOrgId]
  );

  const activeTenant = useMemo(() => 
    availableTenants.find(t => t.tenantId === selectedTenantId) || availableTenants[0] || SAMPLE_TENANTS[0],
    [availableTenants, selectedTenantId]
  );

  const availableWorkspaces = useMemo(() => 
    SAMPLE_WORKSPACES.filter(w => w.tenantId === activeTenant.tenantId),
    [activeTenant.tenantId]
  );

  const activeWorkspace = useMemo(() => 
    availableWorkspaces.find(w => w.workspaceId === selectedWorkspaceId) || availableWorkspaces[0] || SAMPLE_WORKSPACES[0],
    [availableWorkspaces, selectedWorkspaceId]
  );

  const availableProjects = useMemo(() => 
    SAMPLE_PROJECTS.filter(p => p.workspaceId === activeWorkspace.workspaceId),
    [activeWorkspace.workspaceId]
  );

  const activeProject = useMemo(() => 
    availableProjects.find(p => p.projectId === selectedProjectId) || availableProjects[0] || SAMPLE_PROJECTS[0],
    [availableProjects, selectedProjectId]
  );

  const activeUser = useMemo(() => 
    SAMPLE_USERS.find(u => u.userId === selectedUserId) || SAMPLE_USERS[0],
    [selectedUserId]
  );

  const activeMembership = useMemo(() => 
    SAMPLE_MEMBERSHIPS.find(m => m.userId === activeUser.userId && m.tenantId === activeTenant.tenantId) || {
      membershipId: `mem_${activeUser.userId}_default`,
      userId: activeUser.userId,
      tenantId: activeTenant.tenantId,
      orgId: activeOrg.orgId,
      assignedRole: (activeUser.userId === 'usr_sarah_chen' ? 'ORG_OWNER' : 'RESEARCH_OPERATOR') as SystemRole,
      workspaceAssignments: [activeWorkspace.workspaceId],
      projectAssignments: [activeProject.projectId],
      joinedAt: '2025-01-01T00:00:00Z',
      invitedBy: 'SYSTEM'
    },
    [activeUser.userId, activeTenant.tenantId, activeOrg.orgId, activeWorkspace.workspaceId, activeProject.projectId]
  );

  // Server-Side Derived & Cryptographically Verified TenantContext
  const activeTenantContext: TenantContext = useMemo(() => {
    const rawContext: Omit<TenantContext, 'contextDigest'> = {
      orgId: activeOrg.orgId,
      tenantId: activeTenant.tenantId,
      workspaceId: activeWorkspace.workspaceId,
      projectId: activeProject?.projectId,
      userId: activeUser.userId,
      role: activeMembership.assignedRole,
      permissions: ROLE_PERMISSIONS[activeMembership.assignedRole] || [],
      correlationId: `corr_ctx_${Date.now().toString(36)}`,
      requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
      sourceIp: activeUser.lastLoginIp,
      dataResidency: activeOrg.dataResidency,
      isolationLevel: activeTenant.isolationLevel,
      sessionAuthenticatedAt: activeUser.lastLoginAt,
      mfaVerified: activeUser.mfaActive
    };

    return {
      ...rawContext,
      contextDigest: generateContextDigest(rawContext)
    };
  }, [activeOrg, activeTenant, activeWorkspace, activeProject, activeUser, activeMembership]);

  // Handle Organization Change
  const handleOrgChange = (newOrgId: string) => {
    setSelectedOrgId(newOrgId);
    const tenantsForOrg = SAMPLE_TENANTS.filter(t => t.orgId === newOrgId);
    if (tenantsForOrg.length > 0) {
      const firstTenant = tenantsForOrg[0];
      setSelectedTenantId(firstTenant.tenantId);
      const wsForTenant = SAMPLE_WORKSPACES.filter(w => w.tenantId === firstTenant.tenantId);
      if (wsForTenant.length > 0) {
        setSelectedWorkspaceId(wsForTenant[0].workspaceId);
        const projForWs = SAMPLE_PROJECTS.filter(p => p.workspaceId === wsForTenant[0].workspaceId);
        if (projForWs.length > 0) {
          setSelectedProjectId(projForWs[0].projectId);
        }
      }
    }
  };

  // Handle Tenant Change
  const handleTenantChange = (newTenantId: string) => {
    setSelectedTenantId(newTenantId);
    const wsForTenant = SAMPLE_WORKSPACES.filter(w => w.tenantId === newTenantId);
    if (wsForTenant.length > 0) {
      setSelectedWorkspaceId(wsForTenant[0].workspaceId);
      const projForWs = SAMPLE_PROJECTS.filter(p => p.workspaceId === wsForTenant[0].workspaceId);
      if (projForWs.length > 0) {
        setSelectedProjectId(projForWs[0].projectId);
      }
    }
  };

  // Run Access Simulator Test
  const handleRunAccessSimulation = () => {
    const targetResource: SecureResource = {
      resourceType: simTargetResourceType,
      resourceId: `res_${simTargetResourceType.toLowerCase()}_992`,
      tenantId: simTargetTenantId,
      workspaceId: activeWorkspace.workspaceId,
      projectId: activeProject?.projectId,
      confidentiality: simTargetConfidentiality,
      containsPii: simContainsPii,
      createdByUserId: 'usr_sarah_chen'
    };

    const decision = evaluateAccess(activeTenantContext, targetResource, simAction);
    setAccessResult(decision);

    // Record audit event for the simulation
    const newAuditEvent: MultiTenantAuditEvent = {
      eventId: `evt_sim_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      tenantId: activeTenantContext.tenantId,
      orgId: activeTenantContext.orgId,
      workspaceId: activeTenantContext.workspaceId,
      actorUserId: activeTenantContext.userId,
      actorRole: activeTenantContext.role,
      action: simAction,
      resourceType: simTargetResourceType,
      resourceId: targetResource.resourceId,
      status: decision.allowed ? 'SUCCESS' : (decision.enforcedInvariants.includes('INV-04-STRICT-TENANT-ISOLATION') && !decision.rbacPassed ? 'VIOLATION_BLOCKED' : 'DENIED'),
      sourceIp: activeTenantContext.sourceIp,
      details: decision.reason
    };

    setAuditLogs(prev => [newAuditEvent, ...prev]);
  };

  // Run Cross-Tenant SQL Injection Simulation
  const handleRunSqlIsolationTest = () => {
    // Attempting to query another tenant's advertisers table
    const targetOtherTenant = SAMPLE_TENANTS.find(t => t.tenantId !== activeTenant.tenantId) || SAMPLE_TENANTS[1];
    const sql = `SELECT * FROM advertisers WHERE tenant_id = '${targetOtherTenant.tenantId}' LIMIT 5;`;

    setCrossTenantSqlSimulationResult({
      attemptedQuery: sql,
      executedAsTenant: activeTenant.tenantId,
      targetTenant: targetOtherTenant.tenantId,
      rowsReturned: 0,
      rlsEnforced: true,
      auditStatus: 'POSTGRES_RLS_ZERO_ROW_RETURNED'
    });
  };

  // Simulate Fair-Share Worker Dispatch
  const handleDispatchJob = () => {
    setDispatchStatus('Calculating Deficit Round-Robin concurrency slot...');
    setTimeout(() => {
      setWorkerAllocations(prev =>
        prev.map(alloc => {
          if (alloc.tenantId === activeTenant.tenantId) {
            if (alloc.allocatedSlots < alloc.maxSlots) {
              return {
                ...alloc,
                allocatedSlots: alloc.allocatedSlots + 1,
                lastJobDispatchedAt: new Date().toISOString()
              };
            }
          }
          return alloc;
        })
      );
      setDispatchStatus(`Dispatched 1 isolated browser worker for [${activeTenant.name}] on proxy [${activeTenant.proxyPoolTag}].`);
      setTimeout(() => setDispatchStatus(null), 4000);
    }, 600);
  };

  // Simulate Tenant Cryptographic Purge Attestation
  const handleInitiatePurge = () => {
    setIsPurging(true);
    setTimeout(() => {
      const cert: TenantPurgeAttestation = {
        certificateId: `CERT-PURGE-${Date.now().toString(36).toUpperCase()}-SOC2`,
        tenantId: activeTenant.tenantId,
        tenantName: activeTenant.name,
        orgId: activeOrg.orgId,
        purgeInitiatedBy: activeUser.email,
        purgeApprovedBy: 'sec-compliance@apexintel.com',
        requestedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date().toISOString(),
        recordsPurged: {
          advertisers: 1420,
          ads: 8940,
          leadDossiers: 612,
          researchJobs: 184,
          auditRecordsRetainedForCompliance: 342
        },
        storagePurgeProof: {
          s3BucketPrefixPurged: `s3://meta-research-vault/${activeTenant.tenantId}/* (Crypto-shredded 256-bit AES-GCM)`,
          browserCacheDirectoryPurged: `/tmp/workers/${activeTenant.tenantId}/ (Zero-filled and deleted)`,
          postgresSchemaDropped: true,
          kmsKeyRevoked: true
        },
        cryptographicSignature: `SHA256-RSA-SIG:4f8e9b110c7a2d6e3f4a5c6b7e8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f`,
        complianceAuditorNote: 'All operational records permanently zeroed. Immutable audit log retained under SOC 2 Section CC6.6 for 7 years.'
      };
      setActivePurgeAttestation(cert);
      setIsPurging(false);
    }, 1200);
  };

  // Filter audit logs for active tenant context (strict isolation)
  const tenantScopedAuditLogs = useMemo(() => {
    return auditLogs.filter(log => log.tenantId === activeTenant.tenantId);
  }, [auditLogs, activeTenant.tenantId]);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      {/* Header Banner */}
      <div className="bg-purple-600 text-white rounded-xl p-5 border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PHASE 18 SPECIFICATION
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono text-neutral-400 bg-neutral-800 border border-neutral-700">
                STRICT SERVER-SIDE ISOLATION
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-emerald-400" />
              Secure Multi-Tenant Platform &amp; Organization Hierarchy
            </h1>
            <p className="text-sm text-neutral-300 mt-1 max-w-3xl">
              Strict multi-tenant architecture enforcing canonical boundaries (Org → Tenant → Workspace → Project → Team),
              server-derived cryptographic <code className="text-emerald-300 font-mono text-xs">TenantContext</code>, PostgreSQL Row-Level Security,
              and fair-share browser worker scheduling.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-2 rounded-lg bg-neutral-800/80 border border-neutral-700 text-right">
              <div className="text-[10px] uppercase font-mono text-neutral-400">Enforced Invariant</div>
              <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                INV-04 STRICT-TENANT-ISOLATION
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Context Control Bar (The Canonical Server-Side Identity Switcher) */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
              Active Server-Side Tenant Context &amp; Identity
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-mono">Digest:</span>
            <span className="font-mono text-[11px] bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 border border-neutral-200 truncate max-w-xs" title={activeTenantContext.contextDigest}>
              {activeTenantContext.contextDigest.substring(0, 24)}...
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Organization Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1">
              1. Organization
            </label>
            <select
              value={selectedOrgId}
              onChange={e => handleOrgChange(e.target.value)}
              aria-label="Select Organization"
              className="w-full text-xs font-medium border border-neutral-300 rounded-lg p-2 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-900 focus:outline-none truncate"
            >
              {SAMPLE_ORGANIZATIONS.map(org => (
                <option key={org.orgId} value={org.orgId}>
                  {org.name} ({org.tier})
                </option>
              ))}
            </select>
            <div className="text-[10px] text-neutral-400 mt-1 font-mono">
              Tier: {activeOrg.complianceTier} • {activeOrg.dataResidency}
            </div>
          </div>

          {/* Tenant Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1">
              2. Tenant Boundary
            </label>
            <select
              value={activeTenant.tenantId}
              onChange={e => handleTenantChange(e.target.value)}
              aria-label="Select Tenant Boundary"
              className="w-full text-xs font-medium border border-neutral-300 rounded-lg p-2 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-900 focus:outline-none truncate"
            >
              {availableTenants.map(t => (
                <option key={t.tenantId} value={t.tenantId}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="text-[10px] text-neutral-400 mt-1 font-mono truncate">
              {activeTenant.isolationLevel}
            </div>
          </div>

          {/* Workspace Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1">
              3. Workspace
            </label>
            <select
              value={activeWorkspace.workspaceId}
              onChange={e => setSelectedWorkspaceId(e.target.value)}
              aria-label="Select Workspace"
              className="w-full text-xs font-medium border border-neutral-300 rounded-lg p-2 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-900 focus:outline-none truncate"
            >
              {availableWorkspaces.map(w => (
                <option key={w.workspaceId} value={w.workspaceId}>
                  {w.name} ({w.environment})
                </option>
              ))}
            </select>
            <div className="text-[10px] text-neutral-400 mt-1 font-mono">
              Class: {activeWorkspace.dataClassification}
            </div>
          </div>

          {/* Project Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1">
              4. Active Project
            </label>
            <select
              value={activeProject?.projectId || ''}
              onChange={e => setSelectedProjectId(e.target.value)}
              aria-label="Select Active Project"
              className="w-full text-xs font-medium border border-neutral-300 rounded-lg p-2 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-900 focus:outline-none truncate"
            >
              {availableProjects.map(p => (
                <option key={p.projectId} value={p.projectId}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="text-[10px] text-neutral-400 mt-1 font-mono truncate">
              Target: {activeProject?.leadTargetSector}
            </div>
          </div>

          {/* Simulated Actor / Persona */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1">
              5. Actor Persona &amp; Role
            </label>
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              aria-label="Select Actor Persona and Role"
              className="w-full text-xs font-medium border border-neutral-300 rounded-lg p-2 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-900 focus:outline-none truncate"
            >
              {SAMPLE_USERS.map(u => (
                <option key={u.userId} value={u.userId}>
                  {u.displayName}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono mt-1 font-semibold">
              <span>Role: {activeMembership.assignedRole}</span>
              {activeUser.mfaActive && <span className="text-[9px] bg-emerald-100 px-1 rounded">MFA ✓</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 overflow-x-auto pb-px">
        {[
          { id: 'HIERARCHY', label: 'Hierarchy & Directory', icon: FolderTree },
          { id: 'ACCESS_SIMULATOR', label: 'RBAC / ABAC Testbench', icon: Lock },
          { id: 'DATABASE_ISOLATION', label: 'Database & RLS Isolation', icon: Database },
          { id: 'WORKER_QUEUES', label: 'Worker Queues & Fair-Share', icon: Cpu },
          { id: 'AUDIT_ISOLATION', label: 'Audit Isolation Ledger', icon: FileText },
          { id: 'LIFECYCLE_PURGE', label: 'Quotas & Crypto Purge', icon: Trash2 },
          { id: 'HANDOFF', label: 'Phase 18 Contracts & Specs', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-neutral-900 text-neutral-900 bg-white font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: HIERARCHY & DIRECTORY */}
      {activeTab === 'HIERARCHY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Metric 1: Org Tiers */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs text-neutral-500 font-medium">Organization Tier</div>
              <div className="text-lg font-bold text-neutral-900 mt-1">{activeOrg.tier}</div>
              <div className="text-xs text-emerald-600 mt-1 font-mono font-medium">
                {activeOrg.complianceTier} Certified
              </div>
            </div>

            {/* Metric 2: Active Tenants */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs text-neutral-500 font-medium">Tenants in Organization</div>
              <div className="text-lg font-bold text-neutral-900 mt-1">{availableTenants.length} Tenants</div>
              <div className="text-xs text-neutral-500 mt-1 font-mono">
                Active: {activeTenant.slug}
              </div>
            </div>

            {/* Metric 3: Workspace Confinement */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs text-neutral-500 font-medium">Workspaces in Tenant</div>
              <div className="text-lg font-bold text-neutral-900 mt-1">{availableWorkspaces.length} Workspaces</div>
              <div className="text-xs text-blue-600 mt-1 font-mono">
                Environment: {activeWorkspace.environment}
              </div>
            </div>

            {/* Metric 4: Dedicated Worker Pool */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="text-xs text-neutral-500 font-medium">Worker Allocation Pool</div>
              <div className="text-lg font-bold text-neutral-900 mt-1">
                {activeTenant.usage.activeWorkers} / {activeTenant.quotas.maxConcurrentWorkers} Slots
              </div>
              <div className="text-xs text-neutral-500 mt-1 font-mono truncate">
                Proxy: {activeTenant.proxyPoolTag}
              </div>
            </div>
          </div>

          {/* Interactive Hierarchy Visualizer */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-4">
              <FolderTree className="w-4 h-4 text-emerald-600" />
              Canonical Multi-Tenant Hierarchy Visualizer
            </h3>

            <div className="space-y-4 font-mono text-xs">
              {/* Level 1: Organization */}
              <div className="p-3 bg-purple-600 text-white rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">ORG:</span>
                  <span>{activeOrg.name}</span>
                  <span className="text-[10px] text-neutral-400">({activeOrg.orgId})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-neutral-800 rounded text-[10px] text-emerald-400">
                    Residency: {activeOrg.dataResidency}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-300">
                    SSO: {activeOrg.ssoEnforced ? activeOrg.ssoProvider : 'Password + MFA'}
                  </span>
                </div>
              </div>

              {/* Level 2: Tenant */}
              <div className="ml-6 p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-neutral-700">TENANT:</span>
                  <span className="text-neutral-900 font-semibold">{activeTenant.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">({activeTenant.tenantId})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded text-[10px]">
                    {activeTenant.isolationLevel}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded text-[10px]">
                    Schema: {activeTenant.databaseSchema}
                  </span>
                </div>
              </div>

              {/* Level 3: Workspaces */}
              <div className="ml-12 space-y-2">
                {availableWorkspaces.map(ws => (
                  <div
                    key={ws.workspaceId}
                    onClick={() => setSelectedWorkspaceId(ws.workspaceId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      ws.workspaceId === activeWorkspace.workspaceId
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-neutral-500" />
                      <span>WORKSPACE:</span>
                      <span>{ws.name}</span>
                      <span className="text-[10px] text-neutral-400">({ws.workspaceId})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200">
                        {ws.environment}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-600">
                        Class: {ws.dataClassification}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Level 4: Projects */}
              <div className="ml-18 space-y-2">
                {availableProjects.map(proj => (
                  <div
                    key={proj.projectId}
                    onClick={() => setSelectedProjectId(proj.projectId)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      proj.projectId === activeProject.projectId
                        ? 'bg-blue-50/70 border-blue-300 text-blue-950 font-semibold'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-neutral-400" />
                      <span>PROJECT:</span>
                      <span>{proj.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">({proj.projectId})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200">
                        {proj.leadCount} Verified Leads
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200">
                        {proj.activeWorkflowCount} DAGs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: ACCESS SIMULATOR TESTBENCH */}
      {activeTab === 'ACCESS_SIMULATOR' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Live RBAC + ABAC Authorization Evaluator
            </h3>
            <p className="text-xs text-neutral-600 mb-4">
              Simulates real-time evaluation of an incoming action against target resource attributes and active
              cryptographically verified actor context. Enforces Invariant INV-04 (Strict Tenant Isolation), role permissions,
              confidentiality clearance, and step-up MFA.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Test Configuration */}
              <div className="lg:col-span-1 space-y-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider font-mono">
                  1. Target Resource Setup
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Resource Type
                  </label>
                  <select
                    value={simTargetResourceType}
                    onChange={e => setSimTargetResourceType(e.target.value as any)}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 bg-white"
                  >
                    <option value="LEAD_DOSSIER">LEAD_DOSSIER (Advertiser Profile)</option>
                    <option value="AD_CREATIVE">AD_CREATIVE (Observed Creatives)</option>
                    <option value="WORKFLOW_DAG">WORKFLOW_DAG (Autonomous Job)</option>
                    <option value="EXPORT_DATA">EXPORT_DATA (Raw Leads CSV)</option>
                    <option value="AUDIT_LOG">AUDIT_LOG (Security Ledger)</option>
                    <option value="TENANT_SETTINGS">TENANT_SETTINGS (Quotas &amp; Config)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Resource Tenant Ownership
                  </label>
                  <select
                    value={simTargetTenantId}
                    onChange={e => setSimTargetTenantId(e.target.value)}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 bg-white"
                  >
                    {SAMPLE_TENANTS.map(t => (
                      <option key={t.tenantId} value={t.tenantId}>
                        {t.name} {t.tenantId === activeTenant.tenantId ? '(SAME TENANT)' : '(CROSS-TENANT ⚠️)'}
                      </option>
                    ))}
                  </select>
                  {simTargetTenantId !== activeTenant.tenantId && (
                    <div className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Testing cross-tenant boundary breach scenario!
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Confidentiality Classification
                  </label>
                  <select
                    value={simTargetConfidentiality}
                    onChange={e => setSimTargetConfidentiality(e.target.value as any)}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 bg-white"
                  >
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="INTERNAL">INTERNAL</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="STRICT_RESTRICTED">STRICT_RESTRICTED (High Clearance)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-neutral-700">Contains PII Fields</span>
                  <input
                    type="checkbox"
                    checked={simContainsPii}
                    onChange={e => setSimContainsPii(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </div>

                <div className="border-t border-neutral-200 pt-3">
                  <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider font-mono mb-2">
                    2. Requested Action
                  </div>
                  <select
                    value={simAction}
                    onChange={e => setSimAction(e.target.value as any)}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2 bg-white font-mono"
                  >
                    <option value="research:view_dossier">research:view_dossier</option>
                    <option value="research:edit_dossier">research:edit_dossier</option>
                    <option value="research:job_create">research:job_create</option>
                    <option value="research:review_approve">research:review_approve</option>
                    <option value="export:raw_data">export:raw_data</option>
                    <option value="export:pii_unmasked">export:pii_unmasked</option>
                    <option value="workflow:execute">workflow:execute</option>
                    <option value="tenant:quota_edit">tenant:quota_edit</option>
                    <option value="emergency:kill_switch">emergency:kill_switch</option>
                  </select>
                </div>

                <button
                  onClick={handleRunAccessSimulation}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Evaluate Access Decision
                </button>
              </div>

              {/* Right Column: Execution Output & Trace */}
              <div className="lg:col-span-2 space-y-4">
                {accessResult ? (
                  <div className="space-y-4">
                    {/* Top Decision Banner */}
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        accessResult.allowed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {accessResult.allowed ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                        )}
                        <div>
                          <div className="text-base font-bold flex items-center gap-2">
                            <span>DECISION: {accessResult.decision}</span>
                            <span className="text-xs px-2 py-0.5 rounded font-mono font-normal bg-white/80 border">
                              {accessResult.rbacPassed ? 'RBAC Passed' : 'RBAC Failed'} • {accessResult.abacPassed ? 'ABAC Passed' : 'ABAC Denied'}
                            </span>
                          </div>
                          <div className="text-xs mt-0.5 opacity-90">{accessResult.reason}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono opacity-70">
                        {new Date(accessResult.evaluatedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Step-by-Step Security Trace */}
                    <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4">
                      <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider font-mono mb-3">
                        Authorization Check Trace
                      </div>
                      <div className="space-y-2">
                        {accessResult.checksEvaluated.map((check, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                              check.passed ? 'bg-white border-neutral-200' : 'bg-rose-50/50 border-rose-200'
                            }`}
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              {check.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              )}
                              <div className="min-w-0">
                                <div className="font-mono font-bold text-neutral-900">
                                  {check.checkName}
                                </div>
                                <div className="text-neutral-600 mt-0.5 break-words">
                                  {check.detail}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                                check.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {check.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center text-neutral-500">
                    <Shield className="w-10 h-10 text-neutral-300 mb-2" />
                    <p className="text-sm font-medium text-neutral-700">Simulator Ready</p>
                    <p className="text-xs text-neutral-500 max-w-sm mt-1">
                      Configure target resource parameters on the left and click &quot;Evaluate Access Decision&quot; to inspect the multi-tenant policy trace.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: DATABASE ISOLATION & RLS */}
      {activeTab === 'DATABASE_ISOLATION' && (
        <div className="space-y-6">
          {/* Top Explainer */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-emerald-600" />
              PostgreSQL Row-Level Security (RLS) &amp; Schema Isolation
            </h3>
            <p className="text-xs text-neutral-600 mb-4">
              All tables in the research persistence layer (<code className="font-mono text-emerald-700">advertisers</code>, <code className="font-mono text-emerald-700">ads</code>, <code className="font-mono text-emerald-700">lead_dossiers</code>, etc.)
              have mandatory <code className="font-mono text-neutral-800 font-bold">FORCE ROW LEVEL SECURITY</code> enabled.
              Connection pool checkouts set session variable <code className="font-mono text-neutral-800 font-bold">SET LOCAL app.current_tenant_id = &apos;{activeTenant.tenantId}&apos;</code>, guaranteeing zero cross-tenant query leakage at the database engine level.
            </p>

            {/* RLS Policy Table */}
            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-mono">
                    <th className="p-2.5">Table</th>
                    <th className="p-2.5">Policy Name</th>
                    <th className="p-2.5">Command</th>
                    <th className="p-2.5">USING Clause</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {POSTGRES_RLS_POLICIES.map((p, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="p-2.5 font-mono font-bold text-neutral-900">{p.tableName}</td>
                      <td className="p-2.5 font-mono text-neutral-700">{p.policyName}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[10px] font-semibold text-neutral-800">
                          {p.command}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-neutral-600 max-w-xs truncate" title={p.usingClause}>
                        {p.usingClause}
                      </td>
                      <td className="p-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> RESTRICTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive SQL DDL Preview & Cross-Tenant Attack Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Generated DDL */}
            <div className="bg-neutral-950 text-neutral-200 rounded-xl p-4 border border-neutral-800 font-mono text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2 text-neutral-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PostgreSQL RLS Migration Script</span>
                </div>
                <span className="text-[10px] text-emerald-400">Generated for {activeTenant.tenantId}</span>
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed max-h-96 text-neutral-300">
                {generatePostgresRlsDdl(activeTenant.tenantId)}
              </pre>
            </div>

            {/* Right: Attack Simulator */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                Cross-Tenant SQL Boundary Injection Probe
              </h4>
              <p className="text-xs text-neutral-600">
                Dispatches a simulated rogue SQL query attempting to read rows belonging to an external tenant
                under the current connection pool context.
              </p>

              <button
                onClick={handleRunSqlIsolationTest}
                className="w-full py-2.5 px-4 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
                Trigger Cross-Tenant SQL Read Attempt
              </button>

              {crossTenantSqlSimulationResult && (
                <div className="p-4 bg-purple-600 text-white rounded-lg font-mono text-xs space-y-2 border border-neutral-800">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ISOLATION BARRIER HELD (0 Rows Leaked)
                  </div>
                  <div className="text-neutral-400 text-[11px]">
                    <span className="text-neutral-500">Attempted: </span>
                    <span className="text-rose-300">{crossTenantSqlSimulationResult.attemptedQuery}</span>
                  </div>
                  <div className="text-neutral-300 text-[11px] pt-1 border-t border-neutral-800">
                    Active Session Tenant: <span className="text-emerald-300">{crossTenantSqlSimulationResult.executedAsTenant}</span><br />
                    Target Rogue Tenant: <span className="text-rose-300">{crossTenantSqlSimulationResult.targetTenant}</span><br />
                    Result: <span className="text-emerald-400 font-bold">0 records returned (RLS Filter Filtered Query to empty set)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: WORKER QUEUES & FAIR-SHARE CONCURRENCY */}
      {activeTab === 'WORKER_QUEUES' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  Tenant-Aware Browser Worker &amp; Deficit Round Robin Concurrency
                </h3>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Playwright browser workers execute in strictly sandboxed contexts with dedicated proxy pools and isolated
                  temporary disk spaces (<code className="font-mono text-neutral-800">/tmp/workers/{activeTenant.tenantId}/</code>)
                  to eliminate cross-tenant cookie or cache pollution.
                </p>
              </div>

              <button
                onClick={handleDispatchJob}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Dispatch Worker Task
              </button>
            </div>

            {dispatchStatus && (
              <div className="mb-4 p-3 bg-neutral-900 text-emerald-400 rounded-lg text-xs font-mono flex items-center gap-2 border border-neutral-800">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>{dispatchStatus}</span>
              </div>
            )}

            {/* Tenant Allocations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workerAllocations.map(alloc => (
                <div
                  key={alloc.tenantId}
                  className={`p-4 rounded-xl border ${
                    alloc.tenantId === activeTenant.tenantId
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900 truncate">
                      {alloc.tenantName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {alloc.browserSandboxState}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs text-neutral-600 mb-1 font-mono">
                        <span>Slots in Use</span>
                        <span className="font-bold text-neutral-900">{alloc.allocatedSlots} / {alloc.maxSlots}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${(alloc.allocatedSlots / alloc.maxSlots) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-500 font-mono space-y-0.5 pt-2 border-t border-neutral-100">
                      <div>DRR Deficit Weight: <span className="font-bold text-neutral-800">{alloc.deficitWeight}</span></div>
                      <div className="truncate" title={alloc.proxyPool}>Proxy: <span className="text-neutral-700">{alloc.proxyPool}</span></div>
                      <div>Last Dispatched: <span className="text-neutral-700">{new Date(alloc.lastJobDispatchedAt).toLocaleTimeString()}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: AUDIT ISOLATION LEDGER */}
      {activeTab === 'AUDIT_ISOLATION' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Multi-Tenant Isolated Audit Ledger
                </h3>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Filtered strictly to Tenant Context <code className="font-mono text-emerald-700 font-bold">{activeTenant.name} ({activeTenant.tenantId})</code>.
                  In accordance with Invariant INV-05, compliance auditors for this tenant cannot view entries from other tenants.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-mono font-bold border border-emerald-200 shrink-0">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                RLS Scoped: {tenantScopedAuditLogs.length} Events Visible
              </div>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-mono">
                    <th className="p-2.5">Event ID</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Actor &amp; Role</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Target Resource</th>
                    <th className="p-2.5">Result</th>
                    <th className="p-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {tenantScopedAuditLogs.map(evt => (
                    <tr key={evt.eventId} className="hover:bg-neutral-50/50">
                      <td className="p-2.5 font-mono text-[11px] text-neutral-700">{evt.eventId}</td>
                      <td className="p-2.5 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2.5 font-mono">
                        <div className="font-bold text-neutral-900">{evt.actorUserId}</div>
                        <div className="text-[10px] text-neutral-500">{evt.actorRole}</div>
                      </td>
                      <td className="p-2.5 font-mono text-emerald-700 font-semibold">{evt.action}</td>
                      <td className="p-2.5 font-mono text-[11px] text-neutral-600">{evt.resourceId}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            evt.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : evt.status === 'VIOLATION_BLOCKED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-neutral-600 max-w-xs truncate" title={evt.details}>
                        {evt.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: QUOTAS & CRYPTO PURGE */}
      {activeTab === 'LIFECYCLE_PURGE' && (
        <div className="space-y-6">
          {/* Quotas & Usage */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Tenant Quota Governance &amp; Usage Consumption
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Daily Ad Cap */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium">Daily Ad Collection Budget</div>
                <div className="text-lg font-bold text-neutral-900 mt-1">
                  {activeTenant.usage.adsCollectedToday.toLocaleString()} / {activeTenant.quotas.dailyAdCollectionBudget.toLocaleString()}
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (activeTenant.usage.adsCollectedToday / activeTenant.quotas.dailyAdCollectionBudget) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Monthly Export Rows */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium">Monthly Export Row Limit</div>
                <div className="text-lg font-bold text-neutral-900 mt-1">
                  {activeTenant.usage.exportRowsThisMonth.toLocaleString()} / {activeTenant.quotas.monthlyExportRowCount.toLocaleString()}
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (activeTenant.usage.exportRowsThisMonth / activeTenant.quotas.monthlyExportRowCount) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Storage Quota */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium">Storage Retention Policy</div>
                <div className="text-lg font-bold text-neutral-900 mt-1">
                  {(activeTenant.usage.storageUsedBytes / 1e9).toFixed(2)} GB Used
                </div>
                <div className="text-xs text-neutral-500 mt-1 font-mono">
                  Retention Window: {activeTenant.quotas.storageRetentionDays} Days
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Decommissioning & Cryptographic Purge Attestation */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  Tenant Offboarding &amp; Cryptographic Purge Attestation
                </h3>
                <p className="text-xs text-neutral-600 mt-0.5">
                  GDPR Article 17 (&apos;Right to be Forgotten&apos;) and SOC 2 CC6.6 compliant decommissioning workflow:
                  soft-delete, grace period, PostgreSQL schema drop, S3 crypto-shredding, and verifiable certificate issuance.
                </p>
              </div>

              <button
                onClick={handleInitiatePurge}
                disabled={isPurging}
                className="px-3 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isPurging ? 'Purging Tenant Data...' : 'Simulate Tenant Decommission & Purge'}
              </button>
            </div>

            {activePurgeAttestation && (
              <div className="p-4 bg-neutral-950 text-neutral-200 rounded-xl border border-neutral-800 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    CRYPTOGRAPHIC PURGE ATTESTATION CERTIFICATE ISSUED
                  </div>
                  <span className="text-[10px] text-neutral-400">{activePurgeAttestation.certificateId}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-neutral-500">Tenant: </span>
                    <span className="text-white font-bold">{activePurgeAttestation.tenantName} ({activePurgeAttestation.tenantId})</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Initiated By: </span>
                    <span className="text-neutral-300">{activePurgeAttestation.purgeInitiatedBy}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Advertisers Purged: </span>
                    <span className="text-emerald-400">{activePurgeAttestation.recordsPurged.advertisers.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Ads Shreaded: </span>
                    <span className="text-emerald-400">{activePurgeAttestation.recordsPurged.ads.toLocaleString()}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-neutral-500">S3 Vault Shred: </span>
                    <span className="text-neutral-300">{activePurgeAttestation.storagePurgeProof.s3BucketPrefixPurged}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-neutral-500">Crypto Signature: </span>
                    <span className="text-amber-300 break-all">{activePurgeAttestation.cryptographicSignature}</span>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 pt-2 border-t border-neutral-800 italic">
                  Note: {activePurgeAttestation.complianceAuditorNote}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: PHASE 18 HANDOFF & SPECS */}
      {activeTab === 'HANDOFF' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Phase 18 Production Architecture Contracts &amp; Security Invariants
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-900 uppercase font-mono tracking-wider">
                  Enforced Isolation Standards
                </div>
                <ul className="space-y-1 text-neutral-600 list-disc list-inside">
                  {PHASE_18_HANDOFF_METRICS.isolationStandards.map((std, i) => (
                    <li key={i}>{std}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-900 uppercase font-mono tracking-wider">
                  Security Invariants Guarded
                </div>
                <ul className="space-y-1 text-neutral-600 list-disc list-inside">
                  {PHASE_18_HANDOFF_METRICS.securityInvariantsEnforced.map((inv, i) => (
                    <li key={i} className="font-mono text-[11px] text-neutral-800 font-semibold">{inv}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-purple-600 text-white rounded-xl font-mono text-xs space-y-2">
              <div className="text-emerald-400 font-bold">API Header Specification:</div>
              <div className="text-neutral-300 text-[11px] space-y-1">
                <div><span className="text-neutral-500">Authorization:</span> Bearer &lt;signed_jwt_with_tenant_claims&gt;</div>
                <div><span className="text-neutral-500">X-Correlation-Id:</span> corr_ctx_18... (Distributed Tracing)</div>
                <div><span className="text-neutral-500">X-Tenant-Context-Digest:</span> sha256:ctx_... (Server validated digest)</div>
                <div><span className="text-neutral-500">Invariant Rule:</span> Server strictly rejects any request where client claims conflict with database verified membership.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
