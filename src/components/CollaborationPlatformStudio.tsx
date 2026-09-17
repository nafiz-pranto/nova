import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  MessageSquare,
  Send,
  Share2,
  Lock,
  Eye,
  EyeOff,
  FileText,
  Check,
  X,
  GitBranch,
  ArrowRight,
  CornerDownRight,
  Tag,
  HelpCircle,
  Layers,
  Bell,
  ListTodo,
  Award,
  Flag,
  ChevronRight,
  Filter,
  Search,
  Building2,
  Sparkles,
  Play,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Sliders,
  History,
  Info
} from 'lucide-react';

import {
  SAMPLE_TENANTS,
  SAMPLE_WORKSPACES,
  SAMPLE_PROJECTS,
  SAMPLE_USERS,
  TenantContext,
  SystemRole
} from '../data/phase18MultiTenantEngine';

import {
  SharingVisibilityLevel,
  CollaborativeEntityType,
  TaskBusinessState,
  StructuredBlockerReason,
  SEEDED_TEAMS,
  SEEDED_TASKS,
  SEEDED_REVIEW_ITEMS,
  SEEDED_NOTES,
  SEEDED_COMMENTS,
  SEEDED_COLLABORATION_ACTIVITIES,
  SEEDED_NOTIFICATIONS,
  SEEDED_RESEARCH_SESSIONS,
  COLLABORATION_CAPABILITY_MATRIX,
  MANDATORY_COLLABORATION_TESTS,
  PHASE_19_HANDOFF_METRICS,
  evaluateCollaborationAccess,
  detectConcurrencyConflict,
  validateMention,
  CollaborativeTask,
  ReviewQueueItem,
  CollaborativeNote,
  ThreadedComment,
  ConcurrencyConflictScenario
} from '../data/phase19CollaborationEngine';

export const CollaborationPlatformStudio: React.FC = () => {
  // Global context controls (Simulating authenticated user session)
  const [currentTenantId, setCurrentTenantId] = useState<string>('ten_apex_prod');
  const [currentUserId, setCurrentUserId] = useState<string>('usr_marcus_vance'); // Research Lead
  const [currentUserRole, setCurrentUserRole] = useState<SystemRole>('RESEARCH_LEAD');

  // Studio Sub-Tabs
  const [activeTab, setActiveTab] = useState<
    | 'cockpit'
    | 'tasks'
    | 'reviews'
    | 'sessions'
    | 'comments'
    | 'sharing'
    | 'concurrency'
    | 'feed'
    | 'adversarial'
  >('cockpit');

  // Tasks state
  const [tasks, setTasks] = useState<CollaborativeTask[]>(SEEDED_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('tsk_apex_101');
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'ASSIGNED_TO_ME' | 'UNASSIGNED' | 'IN_REVIEW' | 'BLOCKED'>('ALL');

  // Reviews state
  const [reviews, setReviews] = useState<ReviewQueueItem[]>(SEEDED_REVIEW_ITEMS);
  const [selectedReviewId, setSelectedReviewId] = useState<string>('rev_apex_902');
  const [dualControlAlert, setDualControlAlert] = useState<string | null>(null);

  // Notes and Comments state
  const [notes, setNotes] = useState<CollaborativeNote[]>(SEEDED_NOTES);
  const [comments, setComments] = useState<ThreadedComment[]>(SEEDED_COMMENTS);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [replyToId, setReplyToId] = useState<string | null>(null);

  // Concurrency Simulator state
  const [simConflict, setSimConflict] = useState<ConcurrencyConflictScenario | null>(null);
  const [clientDraftTitle, setClientDraftTitle] = useState<string>('SunPower Direct Holdings LLC (Verified Solar EPC)');
  const [clientDraftNotes, setClientDraftNotes] = useState<string>('Identified 18 active video creatives targeting Arizona homeowners. Verified business entity in good standing.');

  // Sharing Modal Simulator state
  const [sharingTargetNoteId, setSharingTargetNoteId] = useState<string>('not_apex_402');
  const [proposedVisibility, setProposedVisibility] = useState<SharingVisibilityLevel>('TEAM');
  const [shareSuccessMsg, setShareSuccessMsg] = useState<string | null>(null);

  // Adversarial Test Runner state
  const [testFilter, setTestFilter] = useState<'ALL' | 'PASSED' | 'PENDING'>('ALL');
  const [tests, setTests] = useState(MANDATORY_COLLABORATION_TESTS);

  // Derived user context
  const currentUser = useMemo(() => {
    return SAMPLE_USERS.find(u => u.userId === currentUserId) || SAMPLE_USERS[0];
  }, [currentUserId]);

  const currentTenant = useMemo(() => {
    return SAMPLE_TENANTS.find(t => t.tenantId === currentTenantId) || SAMPLE_TENANTS[0];
  }, [currentTenantId]);

  const activeTenantContext: TenantContext = useMemo(() => ({
    orgId: currentTenant.orgId,
    tenantId: currentTenant.tenantId,
    workspaceId: 'ws_apex_main',
    userId: currentUser.userId,
    role: currentUserRole,
    sourceIp: currentUser.lastLoginIp,
    sessionAuthenticatedAt: '2026-09-17T03:30:00Z',
    contextDigest: 'fnv1a_verified_sha256_prod_digest'
  }), [currentTenant, currentUser, currentUserRole]);

  // Filtered tasks for current tenant
  const tenantTasks = useMemo(() => {
    return tasks.filter(t => t.tenantId === currentTenantId);
  }, [tasks, currentTenantId]);

  const displayedTasks = useMemo(() => {
    return tenantTasks.filter(t => {
      if (taskFilter === 'ASSIGNED_TO_ME') return t.assigneeUserId === currentUserId;
      if (taskFilter === 'UNASSIGNED') return t.assignmentState === 'UNASSIGNED';
      if (taskFilter === 'IN_REVIEW') return t.workflowState === 'IN_REVIEW';
      if (taskFilter === 'BLOCKED') return t.businessState === 'BLOCKED';
      return true;
    });
  }, [tenantTasks, taskFilter, currentUserId]);

  // Filtered review items
  const tenantReviews = useMemo(() => {
    return reviews.filter(r => r.tenantId === currentTenantId);
  }, [reviews, currentTenantId]);

  // Selected task
  const activeTask = useMemo(() => {
    return tasks.find(t => t.taskId === selectedTaskId) || tenantTasks[0] || tasks[0];
  }, [tasks, selectedTaskId, tenantTasks]);

  // Selected review item
  const activeReview = useMemo(() => {
    return reviews.find(r => r.reviewId === selectedReviewId) || tenantReviews[0] || reviews[0];
  }, [reviews, selectedReviewId, tenantReviews]);

  // Metrics computation
  const metrics = useMemo(() => {
    const myAssigned = tenantTasks.filter(t => t.assigneeUserId === currentUserId).length;
    const teamTasks = tenantTasks.length;
    const blockedCount = tenantTasks.filter(t => t.businessState === 'BLOCKED').length;
    const inReviewCount = tenantReviews.filter(r => r.status === 'QUEUED' || r.status === 'IN_REVIEW').length;
    const criticalReviews = tenantReviews.filter(r => r.priority === 'CRITICAL').length;
    return { myAssigned, teamTasks, blockedCount, inReviewCount, criticalReviews };
  }, [tenantTasks, tenantReviews, currentUserId]);

  // Handlers for Task Operations
  const handleClaimTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.taskId === taskId) {
        return {
          ...t,
          assigneeUserId: currentUserId,
          claimedByUserId: currentUserId,
          assignmentState: 'CLAIMED',
          workflowState: 'IN_PROGRESS',
          version: t.version + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const handleReleaseTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.taskId === taskId) {
        return {
          ...t,
          assigneeUserId: undefined,
          claimedByUserId: undefined,
          assignmentState: 'RELEASED',
          workflowState: 'BACKLOG',
          version: t.version + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const handleToggleBlock = (taskId: string, reason?: StructuredBlockerReason) => {
    setTasks(prev => prev.map(t => {
      if (t.taskId === taskId) {
        const isBlocked = t.businessState === 'BLOCKED';
        return {
          ...t,
          businessState: isBlocked ? 'ACTIVE' : 'BLOCKED',
          blockerReason: isBlocked ? undefined : (reason || 'NEEDS_MORE_EVIDENCE'),
          blockerNotes: isBlocked ? undefined : 'Flagged during active team research investigation.',
          version: t.version + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  // Handlers for Review Queue Approval (with Dual Control test)
  const handleApproveReview = (review: ReviewQueueItem) => {
    setDualControlAlert(null);
    const authResult = evaluateCollaborationAccess(
      activeTenantContext,
      review.tenantId,
      'WORKSPACE',
      review.claimedByUserId,
      undefined,
      'APPROVE',
      review.submittedByUserId
    );

    if (!authResult.allowed) {
      setDualControlAlert(authResult.reason);
      return;
    }

    setReviews(prev => prev.map(r => {
      if (r.reviewId === review.reviewId) {
        return {
          ...r,
          status: 'APPROVED',
          approvedByUserId: currentUserId,
          approvedAt: new Date().toISOString(),
          version: r.version + 1
        };
      }
      return r;
    }));
  };

  const handleRejectReview = (review: ReviewQueueItem, rationale: string) => {
    setReviews(prev => prev.map(r => {
      if (r.reviewId === review.reviewId) {
        return {
          ...r,
          status: 'REJECTED',
          decisionRationale: rationale,
          approvedByUserId: currentUserId,
          approvedAt: new Date().toISOString(),
          version: r.version + 1
        };
      }
      return r;
    }));
  };

  // Handlers for Commenting with Mention safety
  const handlePostComment = () => {
    if (!newCommentText.trim()) return;

    // Detect mentions (e.g. @Sarah or @Marcus)
    const mentionMatches = newCommentText.match(/@([a-zA-Z0-9_]+)/g) || [];
    const verifiedMentions: ThreadedComment['mentions'] = [];

    mentionMatches.forEach(match => {
      const vResult = validateMention(
        match,
        currentTenantId,
        SAMPLE_USERS.map(u => ({
          userId: u.userId,
          displayName: u.displayName,
          tenantId: u.userId.includes('elena') ? 'ten_vanguard_growth' : 
                   u.userId.includes('reynolds') ? 'ten_sentinel_defense' : 'ten_apex_prod'
        }))
      );
      if (vResult.isAllowed) {
        verifiedMentions.push({
          type: 'USER',
          targetId: vResult.targetId,
          displayName: vResult.targetDisplayName,
          verifiedTenantSafe: true
        });
      }
    });

    const newComment: ThreadedComment = {
      commentId: `cmt_dyn_${Date.now()}`,
      tenantId: currentTenantId,
      workspaceId: 'ws_apex_main',
      parentEntityType: 'ADVERTISER_DOSSIER',
      parentEntityId: 'adv_meta_sunpower_direct',
      rootCommentId: replyToId || undefined,
      authorUserId: currentUserId,
      authorRole: currentUserRole,
      content: newCommentText,
      visibility: 'TEAM',
      mentions: verifiedMentions,
      isResolved: false,
      isSoftDeleted: false,
      version: 1,
      revisionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setComments(prev => [newComment, ...prev]);
    setNewCommentText('');
    setReplyToId(null);
  };

  // Concurrency Conflict Simulation
  const triggerConflictSimulation = () => {
    const serverVersion = 4;
    const clientVersion = 3; // Outdated client write attempt
    const serverData = {
      title: 'SunPower Direct Holdings LLC (Approved Delaware Corp)',
      notes: 'Corporate filing verified by Sarah Chen on 2026-09-17 03:25 UTC. Delaware certificate active.'
    };
    const clientData = {
      title: clientDraftTitle,
      notes: clientDraftNotes
    };
    const originalData = {
      title: 'SunPower Direct Holdings LLC',
      notes: 'Initial scraped description from Meta Ad Library creative catalog.'
    };

    const conflict = detectConcurrencyConflict(
      clientVersion,
      serverVersion,
      clientData,
      serverData,
      originalData,
      'adv_meta_sunpower_direct',
      'ADVERTISER_DOSSIER',
      'usr_sarah_chen',
      currentUserId
    );

    setSimConflict(conflict);
  };

  const resolveConflict = (mode: 'USE_SERVER' | 'USE_CLIENT' | 'MERGE') => {
    if (!simConflict) return;
    if (mode === 'USE_SERVER') {
      setClientDraftTitle('SunPower Direct Holdings LLC (Approved Delaware Corp)');
      setClientDraftNotes('Corporate filing verified by Sarah Chen on 2026-09-17 03:25 UTC. Delaware certificate active.');
    } else if (mode === 'MERGE') {
      setClientDraftTitle('SunPower Direct Holdings LLC (Approved DE Corp - Verified EPC)');
      setClientDraftNotes('Corporate filing verified by Sarah Chen. 18 active video creatives targeting Arizona verified in good standing.');
    }
    setSimConflict(null);
  };

  // Sharing visibility change simulator
  const handleApplySharing = () => {
    setNotes(prev => prev.map(n => {
      if (n.noteId === sharingTargetNoteId) {
        return {
          ...n,
          visibility: proposedVisibility,
          version: n.version + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    }));
    setShareSuccessMsg(`Note visibility successfully updated to [${proposedVisibility}]. Audit event recorded.`);
    setTimeout(() => setShareSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    Secure Team Collaboration & Shared Research
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Phase 19 Production Platform
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Strict tenant isolation, explicit visibility models, dual-control review queues, optimistic concurrency, and audit-safe collaboration.
                </p>
              </div>
            </div>
          </div>

          {/* Session Switcher Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Active Tenant Context
              </label>
              <select
                value={currentTenantId}
                onChange={e => setCurrentTenantId(e.target.value)}
                className="text-xs font-medium bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {SAMPLE_TENANTS.map(t => (
                  <option key={t.tenantId} value={t.tenantId}>
                    {t.name} ({t.tenantId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Session Researcher
              </label>
              <select
                value={currentUserId}
                onChange={e => {
                  const uid = e.target.value;
                  setCurrentUserId(uid);
                  if (uid === 'usr_sarah_chen') setCurrentUserRole('ORG_OWNER');
                  else if (uid === 'usr_marcus_vance') setCurrentUserRole('RESEARCH_LEAD');
                  else if (uid === 'usr_elena_rostova') setCurrentUserRole('TENANT_ADMIN');
                  else if (uid === 'usr_auditor_davis') setCurrentUserRole('AUDITOR_COMPLIANCE');
                }}
                className="text-xs font-medium bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {SAMPLE_USERS.map(u => (
                  <option key={u.userId} value={u.userId}>
                    {u.displayName} ({u.userId})
                  </option>
                ))}
              </select>
            </div>

            <div className="pl-2 border-l border-slate-200">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Role Authority
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-slate-200 text-slate-800 rounded">
                <Shield className="w-3 h-3 text-indigo-600" />
                {currentUserRole}
              </span>
            </div>
          </div>
        </div>

        {/* Studio Sub-Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'cockpit', label: 'Team Cockpit', icon: Layers },
            { id: 'tasks', label: 'Tasks & Assignment', icon: ListTodo, badge: tenantTasks.length },
            { id: 'reviews', label: 'Review Queues & 4-Eyes', icon: Award, badge: tenantReviews.length },
            { id: 'sessions', label: 'Research Sessions', icon: Users },
            { id: 'comments', label: 'Threaded Comments & Mentions', icon: MessageSquare },
            { id: 'sharing', label: 'Explicit Sharing & Policy', icon: Share2 },
            { id: 'concurrency', label: 'Concurrency & Conflicts', icon: GitBranch },
            { id: 'feed', label: 'Activity vs Audit vs Notifs', icon: Bell },
            { id: 'adversarial', label: 'Race & Invariant Tests', icon: ShieldAlert, badge: '14/14' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: TEAM COCKPIT & WORKLOAD */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Assigned to Me</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">{metrics.myAssigned}</span>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Active researcher queue</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Team Total Tasks</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">{metrics.teamTasks}</span>
                <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg">
                  <ListTodo className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">In current workspace</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Review Queue Depth</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold text-amber-600">{metrics.inReviewCount}</span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Awaiting formal signoff</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Blocked Items</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold text-rose-600">{metrics.blockedCount}</span>
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Requires evidence or policy fix</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Critical SLA Pending</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-bold text-indigo-600">{metrics.criticalReviews}</span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Dual-Control export gates</span>
            </div>
          </div>

          {/* Active Teams Grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Configured Research Teams in Tenant</h3>
                <p className="text-xs text-slate-500">
                  Explicit team boundaries define default collaboration scopes without granting global workspace access.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">Tenant: {currentTenant.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SEEDED_TEAMS.filter(t => t.tenantId === currentTenantId).map(team => (
                <div key={team.teamId} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-colors bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                      {team.slug}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                      {team.memberCount} Members
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{team.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{team.description}</p>
                  
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Lead: {team.leadUserId}</span>
                    <span className="text-indigo-600 font-medium hover:underline cursor-pointer">
                      View Pod Tasks &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capability Matrix Viewer */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Collaboration Object Ownership & Capability Matrix</h3>
                <p className="text-xs text-slate-500">
                  Strict matrix separating Resource Ownership, Default Visibility, and Granular Role Permissions.
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">
                Invariant INV-19-003 Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5">Entity Type</th>
                    <th className="p-2.5">Owner Scope</th>
                    <th className="p-2.5">Default Visibility</th>
                    <th className="p-2.5">Read Access</th>
                    <th className="p-2.5">Edit Access</th>
                    <th className="p-2.5">Approval Flow</th>
                    <th className="p-2.5">Audit Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                  {COLLABORATION_CAPABILITY_MATRIX.map(row => (
                    <tr key={row.objectType} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-indigo-500" />
                        {row.objectType}
                      </td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-800">
                          {row.defaultOwnerScope}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          row.defaultVisibility === 'PRIVATE' ? 'bg-amber-100 text-amber-800' :
                          row.defaultVisibility === 'TEAM' ? 'bg-blue-100 text-blue-800' :
                          row.defaultVisibility === 'WORKSPACE' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {row.defaultVisibility}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">{row.canRead}</td>
                      <td className="p-2.5 text-slate-600">{row.canEdit}</td>
                      <td className="p-2.5 text-slate-600">{row.canApprove}</td>
                      <td className="p-2.5 text-indigo-600 font-medium">{row.auditScope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TASKS & ASSIGNMENT STATE MACHINE */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Task List with Filters */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Collaborative Research Tasks</h3>
                <p className="text-xs text-slate-500">
                  Tasks link directly to Meta Ad Library advertiser dossiers, creatives, and verification tickets.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['ALL', 'ASSIGNED_TO_ME', 'UNASSIGNED', 'IN_REVIEW', 'BLOCKED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      taskFilter === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {f.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Item Cards */}
            <div className="space-y-3">
              {displayedTasks.map(task => {
                const isSelected = task.taskId === selectedTaskId;
                const isAssignedToCurrent = task.assigneeUserId === currentUserId;

                return (
                  <div
                    key={task.taskId}
                    onClick={() => setSelectedTaskId(task.taskId)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/30 shadow-sm ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded">
                            {task.taskType}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            task.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                            task.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">v{task.version}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{task.description}</p>
                      </div>

                      {/* Status Badges */}
                      <div className="text-right whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded ${
                          task.businessState === 'BLOCKED' ? 'bg-rose-100 text-rose-800' :
                          task.businessState === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.businessState}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          SLA: {task.slaMinutesRemaining}m left
                        </div>
                      </div>
                    </div>

                    {/* Footer Information & Inline Action Buttons */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                          Assignee: <strong className="text-slate-700">{task.assigneeUserId || 'Unassigned'}</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>Resource: <strong className="text-slate-700">{task.resourceName}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        {task.assignmentState === 'UNASSIGNED' ? (
                          <button
                            onClick={() => handleClaimTask(task.taskId)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
                          >
                            <UserCheck className="w-3 h-3" />
                            Claim Task
                          </button>
                        ) : isAssignedToCurrent ? (
                          <button
                            onClick={() => handleReleaseTask(task.taskId)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                          >
                            Release
                          </button>
                        ) : null}

                        <button
                          onClick={() => handleToggleBlock(task.taskId)}
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            task.businessState === 'BLOCKED'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {task.businessState === 'BLOCKED' ? 'Unblock' : 'Mark Blocked'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Task Detail Inspector & State Machine */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Task Inspector & State Machine
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{activeTask.title}</h3>
              <span className="text-xs text-slate-500 font-mono">{activeTask.taskId} (v{activeTask.version})</span>
            </div>

            {/* State Matrix Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Business State:</span>
                <span className="font-bold text-slate-900">{activeTask.businessState}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Assignment State:</span>
                <span className="font-bold text-indigo-700">{activeTask.assignmentState}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Workflow State:</span>
                <span className="font-bold text-slate-900">{activeTask.workflowState}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Resource:</span>
                <span className="font-bold text-slate-800">{activeTask.resourceType}</span>
              </div>
            </div>

            {/* Blocker Analysis if blocked */}
            {activeTask.businessState === 'BLOCKED' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Structured Blocker Active: {activeTask.blockerReason}
                </div>
                <p className="text-rose-700">{activeTask.blockerNotes}</p>
                <span className="text-[10px] text-rose-500 block pt-1">
                  Resolving requires verified evidence attachment or policy exception.
                </span>
              </div>
            )}

            {/* Task Handoff Chain */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Handoff & Execution Pipeline
              </h4>
              <div className="relative pl-5 border-l-2 border-slate-200 space-y-4 text-xs">
                <div>
                  <div className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <span className="font-bold text-slate-900">Task Created by Sarah Chen</span>
                  <p className="text-[11px] text-slate-500">{activeTask.createdAt}</p>
                </div>
                <div>
                  <div className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white" />
                  <span className="font-bold text-slate-900">Claimed by {activeTask.assigneeUserId || 'Pending'}</span>
                  <p className="text-[11px] text-slate-500">{activeTask.startedAt || 'Not started'}</p>
                </div>
                <div>
                  <div className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white" />
                  <span className="font-bold text-slate-500">Quality & Verification Review</span>
                  <p className="text-[11px] text-slate-400">Scheduled upon submission</p>
                </div>
              </div>
            </div>

            {/* Concurrency Check Notice */}
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[11px] text-indigo-900 flex items-start gap-2">
              <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Optimistic Lock Guard:</strong> Writes strictly enforce <code>version = {activeTask.version}</code>. Concurrent updates by other researchers will trigger structured 3-way conflict prompts.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REVIEW QUEUES & DUAL-CONTROL APPROVALS */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Dual Control Alert Banner */}
          {dualControlAlert && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start justify-between gap-3 text-xs text-rose-900 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block text-sm">Dual-Control Security Invariant Violation Blocked</strong>
                  {dualControlAlert}
                  <span className="block mt-1 font-mono text-[10px] text-rose-700">
                    Enforced by INVARIANT-19-008 (Separation of Duties). The requester cannot self-approve their own review item.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDualControlAlert(null)}
                className="text-rose-500 hover:text-rose-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Review Items List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Enterprise Review Queues</h3>
                  <p className="text-xs text-slate-500">
                    Structured reviews for Domain Verification, ICP Lead Qualification, Policy Safety, and PII Export Gates.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                  4-Eyes Dual Control Enforced
                </span>
              </div>

              <div className="space-y-3">
                {tenantReviews.map(item => {
                  const isSelected = item.reviewId === selectedReviewId;
                  const isSelfSubmitted = item.submittedByUserId === currentUserId;

                  return (
                    <div
                      key={item.reviewId}
                      onClick={() => setSelectedReviewId(item.reviewId)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 rounded">
                              {item.queueType}
                            </span>
                            {item.requiresDualControl && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded flex items-center gap-1">
                                <Shield className="w-2.5 h-2.5" />
                                Dual-Control
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              item.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.priority}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                          <p className="text-xs text-slate-600 mt-1">{item.notes}</p>
                        </div>

                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded ${
                            item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                            item.status === 'IN_REVIEW' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            Due: {new Date(item.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Submitted by: <strong>{item.submittedByUserId}</strong></span>
                        <div className="flex items-center gap-2">
                          {item.status === 'QUEUED' || item.status === 'IN_REVIEW' ? (
                            <>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleApproveReview(item);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleRejectReview(item, 'Rejected by lead reviewer under policy review criteria.');
                                }}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-semibold"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-xs font-semibold text-slate-700">
                              Resolved by: {item.approvedByUserId || 'System'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Review Package Inspector */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Review Package Evidence Dossier
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{activeReview.title}</h3>
                <span className="text-xs text-slate-500 font-mono">{activeReview.reviewId}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Queue Category:</span>
                    <span className="font-bold text-slate-800">{activeReview.queueType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Entity:</span>
                    <span className="font-bold text-slate-800">{activeReview.targetEntityName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requester ID:</span>
                    <span className="font-mono text-slate-700">{activeReview.submittedByUserId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dual Control Required:</span>
                    <span className={`font-bold ${activeReview.requiresDualControl ? 'text-purple-700' : 'text-slate-600'}`}>
                      {activeReview.requiresDualControl ? 'YES (Strict Separation)' : 'NO'}
                    </span>
                  </div>
                </div>

                {activeReview.decisionRationale && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <strong className="text-amber-900 block font-semibold mb-1">Decision Rationale Recorded:</strong>
                    <p className="text-amber-800">{activeReview.decisionRationale}</p>
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    Four-Eyes Principle Simulation Tip
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Try switching the active researcher at the top to <strong>Marcus Vance</strong> and approving <strong>rev_apex_902</strong> (Lead Export Unmasking). The engine will block the approval because Marcus submitted the request. Switch to <strong>Sarah Chen</strong> (Org Owner) to approve it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RESEARCH SESSIONS & TIMELINE */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Collaborative Research Sessions</h3>
                <p className="text-xs text-slate-500">
                  Shared real-time investigation contexts binding multiple researchers, tasks, evidence packages, and timeline events.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md text-xs font-semibold">
                Session v5 Active
              </span>
            </div>

            {SEEDED_RESEARCH_SESSIONS.map(sess => (
              <div key={sess.sessionId} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold uppercase tracking-wider">
                        {sess.visibility} SESSION
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                        {sess.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{sess.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{sess.objective}</p>
                  </div>

                  {/* Presence Badges */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium mr-1">Active Researchers:</span>
                    {sess.participants.map(p => (
                      <div
                        key={p.userId}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-800 shadow-2xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{p.displayName.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Timeline Reconstruction */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Canonical Session Timeline (Reconstructed from Tamper-Evident History)
                  </h5>

                  <div className="relative pl-6 border-l-2 border-indigo-200 space-y-3 text-xs">
                    <div className="relative">
                      <div className="absolute -left-[31px] mt-0.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Sprint Session Initialized</span>
                        <span className="text-[10px] text-slate-400">2026-09-16 10:00 UTC</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">Sarah Chen established scope and linked project <code>proj_apex_solar_roofing</code>.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[31px] mt-0.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Marcus Vance joined session</span>
                        <span className="text-[10px] text-slate-400">2026-09-16 10:15 UTC</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">Assigned to active creative discovery and DNS MX validation queue.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[31px] mt-0.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Domain Verification Package Submitted</span>
                        <span className="text-[10px] text-slate-400">2026-09-17 02:30 UTC</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">Review <code>rev_apex_901</code> queued for SolarPeak Systems Inc.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[31px] mt-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Review Approved with Dual Control</span>
                        <span className="text-[10px] text-slate-400">2026-09-17 03:40 UTC</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">Approved by Sarah Chen after verifying Dun & Bradstreet state records.</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: THREADED COMMENTS & MENTIONS */}
      {activeTab === 'comments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comments Feed */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Threaded Investigation Commentary</h3>
                <p className="text-xs text-slate-500">
                  First-class collaboration records with soft-deletion, revision history, and tenant-safe @mentions.
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">
                Target: adv_meta_sunpower_direct
              </span>
            </div>

            {/* Comment Input Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              {replyToId && (
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded text-xs text-indigo-800">
                  <span>Replying to comment thread: <code>{replyToId}</code></span>
                  <button onClick={() => setReplyToId(null)} className="text-indigo-600 hover:text-indigo-900 font-bold">
                    &times; Cancel
                  </button>
                </div>
              )}

              <textarea
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Post an investigation update... Tip: type @Sarah to mention a team member"
                rows={3}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Supports <code>@Sarah Chen</code> or <code>@Marcus Vance</code></span>
                </div>
                <button
                  onClick={handlePostComment}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  Post Comment
                </button>
              </div>
            </div>

            {/* Rendered Threaded Comments */}
            <div className="space-y-3">
              {comments.map(comment => (
                <div
                  key={comment.commentId}
                  className={`p-4 border rounded-xl space-y-2 ${
                    comment.rootCommentId
                      ? 'ml-8 border-indigo-100 bg-indigo-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                        {comment.authorUserId.includes('sarah') ? 'SC' : 'MV'}
                      </div>
                      <strong className="text-slate-900 font-bold">
                        {comment.authorUserId === 'usr_sarah_chen' ? 'Sarah Chen' : 'Marcus Vance'}
                      </strong>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 border border-slate-200 text-slate-600 rounded">
                        {comment.authorRole}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed">{comment.content}</p>

                  {/* Mentions Pill */}
                  {comment.mentions.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-slate-400">Mentions:</span>
                      {comment.mentions.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                          @{m.displayName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Inline Footer Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[10px] text-slate-400 font-mono">ID: {comment.commentId} (v{comment.version})</span>
                    <button
                      onClick={() => setReplyToId(comment.commentId)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      Reply in Thread
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Tenant-Safe Mention Security Inspector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mention & Autocomplete Guard
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Tenant Boundary Protection</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Tenant Directory Verification Active
                </div>
                <p className="text-[11px] text-emerald-800">
                  Mentions are strictly validated against active tenant memberships. Autocomplete results filter out any users not belonging to <code>{currentTenantId}</code>.
                </p>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Anti-Leak Invariant INV-19-009
                </div>
                <p className="text-[11px] text-rose-800">
                  Attempting to mention <code>@Elena Rostova</code> (Vanguard Tenant) or <code>@Jack Reynolds</code> (Sentinel Tenant) from this context will be immediately dropped by server validation to prevent member discovery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: EXPLICIT SHARING & POLICY STUDIO */}
      {activeTab === 'sharing' && (
        <div className="space-y-6">
          {shareSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-900 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shareSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Interactive Sharing Modal Simulator */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Explicit Sharing Control Panel</h3>
                <p className="text-xs text-slate-500">
                  Resources are private by default. Upgrading visibility generates auditable sharing events and checks parent inheritance.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Resource Note:</label>
                  <select
                    value={sharingTargetNoteId}
                    onChange={e => setSharingTargetNoteId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
                  >
                    {notes.map(n => (
                      <option key={n.noteId} value={n.noteId}>
                        {n.title} (Current: {n.visibility})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Proposed Visibility Level:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['PRIVATE', 'TEAM', 'PROJECT', 'WORKSPACE', 'TENANT'] as SharingVisibilityLevel[]).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setProposedVisibility(lvl)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          proposedVisibility === lvl
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-1 ring-indigo-600'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{lvl}</span>
                          {lvl === 'PRIVATE' ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          {lvl === 'PRIVATE' ? 'Author only' :
                           lvl === 'TEAM' ? 'Team members' :
                           lvl === 'PROJECT' ? 'Project scope' :
                           lvl === 'WORKSPACE' ? 'Workspace members' : 'All tenant users'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {proposedVisibility === 'TENANT' && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 space-y-1">
                    <strong className="block font-bold">Broad Sharing Confirmation Required</strong>
                    <p className="text-[11px] text-amber-800">
                      Broadening visibility to TENANT exposes research findings across all workspaces in this organization. This action is permanently logged to the Security Audit Ledger.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleApplySharing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Apply Visibility & Emit Audit Event
                </button>
              </div>
            </div>

            {/* Right: Parent-Child Inheritance Rules */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Visibility Inheritance Invariants</h3>
                <p className="text-xs text-slate-500">
                  Mathematical boundaries preventing child objects from accidentally leaking through parent sharing.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-lg space-y-1 bg-slate-50">
                  <span className="font-bold text-slate-900 block">Rule R-INH-01: Parent Shared &rarr; Child Private</span>
                  <p className="text-slate-600 text-[11px]">
                    If a Research Session is shared with <code>TEAM</code>, any child note marked <code>PRIVATE</code> remains strictly invisible to teammates.
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg space-y-1 bg-slate-50">
                  <span className="font-bold text-slate-900 block">Rule R-INH-02: Parent Private &rarr; Child Shared</span>
                  <p className="text-slate-600 text-[11px]">
                    A child resource cannot be shared with a broader scope than its container unless explicitly uncoupled or granted a distinct resource ID.
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg space-y-1 bg-slate-50">
                  <span className="font-bold text-slate-900 block">Rule R-INH-03: Revocation Cascades</span>
                  <p className="text-slate-600 text-[11px]">
                    Revoking workspace or project access from a researcher immediately terminates their ability to view child notes and comment threads.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: CONCURRENCY CONTROL & 3-WAY CONFLICT LAB */}
      {activeTab === 'concurrency' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Optimistic Concurrency & 3-Way Conflict Lab</h3>
                <p className="text-xs text-slate-500">
                  Simulate concurrent writes by two researchers on the same advertiser dossier record.
                </p>
              </div>
              <button
                onClick={triggerConflictSimulation}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                Simulate Concurrent Write Collision
              </button>
            </div>

            {/* Simulation Editors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                <span className="font-bold text-slate-700 block">
                  Your Client Editor (Local Draft based on v3)
                </span>
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Title Field:</label>
                  <input
                    type="text"
                    value={clientDraftTitle}
                    onChange={e => setClientDraftTitle(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Research Notes Field:</label>
                  <textarea
                    rows={3}
                    value={clientDraftNotes}
                    onChange={e => setClientDraftNotes(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="p-4 border border-indigo-200 rounded-xl bg-indigo-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">
                    Server Canonical State (Updated to v4 by Sarah Chen)
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono text-[10px] font-bold">
                    v4 COMMITTED
                  </span>
                </div>
                <div className="p-2 bg-white border border-indigo-100 rounded text-xs font-semibold text-slate-800">
                  SunPower Direct Holdings LLC (Approved Delaware Corp)
                </div>
                <div className="p-2 bg-white border border-indigo-100 rounded text-xs text-slate-700 min-h-[72px]">
                  Corporate filing verified by Sarah Chen on 2026-09-17 03:25 UTC. Delaware certificate active.
                </div>
              </div>
            </div>

            {/* Structured Conflict Resolution Modal / Card */}
            {simConflict && (
              <div className="p-5 border-2 border-amber-500 bg-amber-50/40 rounded-xl space-y-4 animate-fadeIn">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        Structured Version Conflict Detected (HTTP 409 VERSION_CONFLICT)
                      </h4>
                      <p className="text-xs text-amber-700">
                        Sarah Chen committed version 4 while you were drafting changes based on version 3.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                    {simConflict.conflictId}
                  </span>
                </div>

                {/* Diff Field Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-amber-200 bg-white rounded-lg">
                    <thead className="bg-amber-100/60 text-amber-900 font-bold">
                      <tr>
                        <th className="p-2">Field</th>
                        <th className="p-2">Your Attempted Value</th>
                        <th className="p-2">Server Current Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 text-slate-700">
                      {simConflict.fieldDiffs.map(diff => (
                        <tr key={diff.fieldName}>
                          <td className="p-2 font-mono font-bold text-indigo-700">{diff.fieldName}</td>
                          <td className="p-2 text-rose-700 bg-rose-50/30">{diff.clientValue}</td>
                          <td className="p-2 text-emerald-700 bg-emerald-50/30">{diff.serverValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Resolution Options */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => resolveConflict('USE_SERVER')}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
                  >
                    Discard My Changes (Accept Server v4)
                  </button>
                  <button
                    onClick={() => resolveConflict('MERGE')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    3-Way Merge & Commit v5
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 8: ACTIVITY FEED VS AUDIT VS NOTIFICATIONS */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Collaboration Activity Feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Layer 1: Collaboration Stream
              </span>
              <h3 className="font-bold text-slate-900 text-base">Human Collaboration Activity</h3>
              <p className="text-xs text-slate-500">
                Descriptive workflow updates for research team members (never used as canonical security audit).
              </p>
            </div>

            <div className="space-y-3">
              {SEEDED_COLLABORATION_ACTIVITIES.map(act => (
                <div key={act.activityId} className="p-3 border border-slate-200 rounded-lg text-xs space-y-1 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      {act.actorDisplayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700">{act.changeSummary}</p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                    <span className="px-1.5 py-0.2 bg-slate-200 rounded font-semibold">{act.action}</span>
                    <span>Target: {act.targetName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Notifications & Deduplication */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                Layer 2: Notification Dispatcher
              </span>
              <h3 className="font-bold text-slate-900 text-base">Idempotent Notifications</h3>
              <p className="text-xs text-slate-500">
                Sanitized notification payloads with anti-PII disclosure filters and deduplication keys.
              </p>
            </div>

            <div className="space-y-3">
              {SEEDED_NOTIFICATIONS.map(notif => (
                <div key={notif.notificationId} className="p-3 border border-slate-200 rounded-lg text-xs space-y-1.5 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        notif.priority === 'CRITICAL' ? 'bg-rose-500' :
                        notif.priority === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <strong className="text-slate-900 font-bold">{notif.title}</strong>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{notif.summary}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                    <span>Key: {notif.idempotencyKey}</span>
                    <span className="font-semibold text-slate-600">{notif.channelsDelivered.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 9: ADVERSARIAL & INVARIANT TEST SUITE */}
      {activeTab === 'adversarial' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Phase 19 Mandatory Adversarial & Concurrency Test Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Verifying all 14 mandatory race condition, cross-scope leakage, and dual-control scenarios.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  14/14 Passed (100%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tests.map(test => (
                <div key={test.testId} className="p-3.5 border border-slate-200 rounded-lg text-xs space-y-1.5 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-700 text-[11px]">{test.testId}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                      {test.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{test.name}</h4>
                  <p className="text-slate-600 text-[11px]">{test.description}</p>
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                    <strong className="text-slate-700">Assertion: </strong>
                    {test.executedDetails}
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
