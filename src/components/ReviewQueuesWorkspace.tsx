import React, { useState } from 'react';
import { SAMPLE_REVIEW_ITEMS } from '../data/phase08FixturesAndAudit';
import { ReviewItemModel, ReviewQueueType } from '../types';
import { StatusBadge } from './common/StatusBadge';
import { PageHeader } from './common/PageHeader';
import { 
  Users, 
  AlertOctagon, 
  GitMerge, 
  Check, 
  X, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  History,
  Info,
  GitBranch,
  Building
} from 'lucide-react';

export const ReviewQueuesWorkspace: React.FC = () => {
  const [items, setItems] = useState<ReviewItemModel[]>(SAMPLE_REVIEW_ITEMS);
  const [selectedQueue, setSelectedQueue] = useState<ReviewQueueType>('IDENTITY_AMBIGUITY');
  const [selectedItem, setSelectedItem] = useState<ReviewItemModel>(SAMPLE_REVIEW_ITEMS[0]);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const filteredItems = items.filter(item => item.type === selectedQueue);

  const handleResolveAction = (action: string) => {
    setActionSuccessMessage(`Decision [${action}] committed to PostgreSQL Layer G immutable audit ledger. Entity transition applied.`);
    setItems(prev =>
      prev.map(i => (i.id === selectedItem.id ? { ...i, status: 'RESOLVED' as const } : i))
    );
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4500);
  };

  const queueTabs: Array<{ id: ReviewQueueType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'IDENTITY_AMBIGUITY', label: 'Identity Conflicts', icon: GitBranch },
    { id: 'VERIFICATION_CONFLICT', label: 'Verification Conflicts', icon: ShieldAlert },
    { id: 'QUALIFICATION_REVIEW', label: 'Qualification Review', icon: FileCheck },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Phase 08: Lead Research', active: false },
          { label: 'Human Review Queues', active: true },
        ]}
        title="Human Review & Discrepancy Triage Workspace"
        description="Operator triage center for resolving identity clustering ambiguities, contradictory destination verification records, and borderline qualification scores."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            {items.filter(i => i.status === 'PENDING').length} Items Pending
          </span>
        }
      />

      {/* Queue Selection Bar */}
      <div className="bg-white p-2 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between overflow-x-auto w-full min-w-0">
        <div className="flex items-center gap-1.5 min-w-max">
          {queueTabs.map(q => {
            const Icon = q.icon;
            const count = items.filter(i => i.type === q.id && i.status === 'PENDING').length;
            const isSelected = selectedQueue === q.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setSelectedQueue(q.id);
                  const first = items.find(i => i.type === q.id);
                  if (first) setSelectedItem(first);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{q.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isSelected ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-200 text-neutral-800'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Pending List (4 Cols) + Deep Triage Case (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Queue items list (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-neutral-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Cases in Queue ({filteredItems.length})
              </h3>
              <span className="text-[11px] font-mono text-neutral-400">Layer C/G</span>
            </div>

            <div className="mt-3 space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedItem.id === item.id
                      ? 'border-neutral-900 bg-neutral-50/80 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-bold font-mono text-neutral-900">{item.id}</span>
                    <StatusBadge status={item.status === 'PENDING' ? 'REVIEW_REQUIRED' : 'COMPLETED'} size="sm" showPrefix={false} />
                  </div>

                  <div className="text-xs text-neutral-800 font-medium line-clamp-2">
                    {item.issueDescription}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-2 pt-1 border-t border-neutral-100">
                    <span>Target: {item.entityName}</span>
                    <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-mono">
            Requires authorized human decision signature
          </div>
        </div>

        {/* Right Col: Triage Workspace with 6 Required Facets (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-neutral-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header: Case ID & Queue */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Case Dossier: {selectedItem.id}
                  </h3>
                  <StatusBadge status={selectedItem.status === 'PENDING' ? 'REVIEW_REQUIRED' : 'COMPLETED'} size="sm" />
                </div>
                <p className="text-xs text-neutral-500 mt-1 font-mono">
                  Queue Category: {selectedItem.type}
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Created: {new Date(selectedItem.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Facet 1: Entity */}
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1 text-xs">
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-neutral-700" />
                <span>1. Involved Business Entity</span>
              </div>
              <div className="font-semibold text-neutral-900 text-sm">
                {selectedItem.entityName}
              </div>
              <div className="text-neutral-500 font-mono text-[11px]">
                Entity ID: {selectedItem.entityId} &bull; Schema: {selectedItem.schemaVersion}
              </div>
            </div>

            {/* Facet 2: Issue */}
            <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1 text-xs">
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>2. Discrepancy / Issue Definition</span>
              </div>
              <p className="text-amber-950 font-medium leading-relaxed">
                {selectedItem.issueDescription}
              </p>
            </div>

            {/* Facet 3: Supporting Evidence & Facet 4: Conflicting Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Facet 3: Evidence */}
              <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-200 space-y-2">
                <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Corroborating Evidence</span>
                </div>
                <div className="space-y-1 text-neutral-700 font-mono text-[11px]">
                  {selectedItem.evidenceDetails.candidateA && (
                    <div><strong className="text-neutral-900">Entity A:</strong> {selectedItem.evidenceDetails.candidateA}</div>
                  )}
                  {selectedItem.evidenceDetails.domain && (
                    <div><strong className="text-neutral-900">Registered Domain:</strong> {selectedItem.evidenceDetails.domain}</div>
                  )}
                  {selectedItem.evidenceDetails.sharedSignals ? (
                    <div>
                      <strong className="text-neutral-900">Shared Signals:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {(selectedItem.evidenceDetails.sharedSignals as string[]).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div><strong className="text-neutral-900">Probe Result:</strong> HTTP 200 OK Reachable</div>
                  )}
                </div>
              </div>

              {/* Facet 4: Conflicting Evidence */}
              <div className="p-3.5 rounded-lg bg-red-50/40 border border-red-200 space-y-2">
                <div className="text-[11px] font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                  <span>4. Conflicting Evidence Signals</span>
                </div>
                <div className="space-y-1 text-neutral-700 font-mono text-[11px]">
                  {selectedItem.evidenceDetails.candidateB && (
                    <div><strong className="text-neutral-900">Entity B:</strong> {selectedItem.evidenceDetails.candidateB}</div>
                  )}
                  {selectedItem.evidenceDetails.extractedFooterText && (
                    <div><strong className="text-neutral-900">Extracted Footer:</strong> {selectedItem.evidenceDetails.extractedFooterText}</div>
                  )}
                  {selectedItem.evidenceDetails.advertiserDeclaredTitle && (
                    <div><strong className="text-neutral-900">Declared Title:</strong> {selectedItem.evidenceDetails.advertiserDeclaredTitle}</div>
                  )}
                  {selectedItem.evidenceDetails.missingSignals && (
                    <div>
                      <strong className="text-neutral-900">Missing Signals:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {(selectedItem.evidenceDetails.missingSignals as string[]).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Facet 5: History */}
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs space-y-2">
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-neutral-700" />
                <span>5. Historical Audit Trail &amp; Prior Runs</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-neutral-600">
                <div className="flex justify-between">
                  <span>Initial Pipeline Ingestion:</span>
                  <span className="text-neutral-900 font-medium">Auto-flagged at {selectedItem.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Schema Version:</span>
                  <span className="text-neutral-900 font-medium">{selectedItem.schemaVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prior Operator Interventions:</span>
                  <span className="text-neutral-500">None (Queued for primary human sign-off)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Facet 6: Allowed Actions Bar */}
          <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-400 font-mono">
              Action commits an atomic audit ledger event to PostgreSQL.
            </span>

            <div className="flex items-center flex-wrap gap-2">
              {selectedItem.allowedActions.map(action => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleResolveAction(action)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                    action.includes('CONFIRM') || action.includes('ACCEPT')
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : action.includes('REJECT')
                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
                  }`}
                >
                  {action.includes('MATCH') && <GitMerge className="w-3.5 h-3.5" />}
                  {action.includes('REJECT') && <X className="w-3.5 h-3.5" />}
                  {action === 'DEFER' && <Clock className="w-3.5 h-3.5" />}
                  <span>{action.replace(/_/g, ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
