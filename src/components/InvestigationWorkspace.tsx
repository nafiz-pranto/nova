import React, { useState } from 'react';
import { 
  FolderOpen, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Globe, 
  User, 
  Edit3, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Download,
  Share2,
  HelpCircle,
  Database,
  ArrowRight,
  Calendar,
  Check
} from 'lucide-react';
import { 
  SAMPLE_INVESTIGATION, 
  InvestigationModel, 
  InvestigationChecklistItem, 
  InternalResearchNote,
  SAMPLE_RESEARCH_SESSIONS,
  SAMPLE_EVIDENCE_ITEMS
} from '../data/phase12FixturesAndStore';
import { SAMPLE_ADVERTISERS } from '../data/phase08FixturesAndAudit';
import { AdvertiserViewModel } from '../types';
import { PageHeader } from './common/PageHeader';
import { StatusBadge } from './common/StatusBadge';
import { EvidenceInspectorModal } from './EvidenceInspectorModal';

interface InvestigationWorkspaceProps {
  onSelectAdvertiser: (adv: AdvertiserViewModel) => void;
  onOpenExportSnapshot?: () => void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  onSelectAdvertiser,
  onOpenExportSnapshot,
}) => {
  const [investigation, setInvestigation] = useState<InvestigationModel>(SAMPLE_INVESTIGATION);
  const [selectedEvidenceForModal, setSelectedEvidenceForModal] = useState<any>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'CHECKLIST' | 'NOTES' | 'GRAPH' | 'SESSIONS'>('CHECKLIST');

  // New Note Form State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('daniela_rodriguez');
  const [copiedLink, setCopiedLink] = useState(false);

  const targetAdvertiser = SAMPLE_ADVERTISERS.find(a => a.advertiserId === investigation.targetEntityId) || SAMPLE_ADVERTISERS[0];

  const handleToggleChecklist = (chkId: string) => {
    setInvestigation(prev => ({
      ...prev,
      checklist: prev.checklist.map(chk => {
        if (chk.id === chkId) {
          const nextCompleted = !chk.completed;
          return {
            ...chk,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
            completedBy: nextCompleted ? noteAuthor : undefined,
          };
        }
        return chk;
      }),
    }));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const newNote: InternalResearchNote = {
      id: `note_${Date.now().toString(36)}`,
      author: noteAuthor,
      createdAt: new Date().toISOString(),
      content: newNoteContent.trim(),
      linkedEntityId: investigation.targetEntityId,
      isInternalOnly: true,
    };

    setInvestigation(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes],
      summaryCounts: {
        ...prev.summaryCounts,
        notes: prev.summaryCounts.notes + 1,
      },
    }));

    setNewNoteContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    setInvestigation(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== noteId),
      summaryCounts: {
        ...prev.summaryCounts,
        notes: Math.max(0, prev.summaryCounts.notes - 1),
      },
    }));
  };

  const handleCopySnapshotLink = () => {
    navigator.clipboard.writeText(`https://app.metaleadresearch.internal/investigations/${investigation.investigationId}?snapshot=true`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const completedChecklistCount = investigation.checklist.filter(c => c.completed).length;
  const checklistProgressPct = Math.round((completedChecklistCount / investigation.checklist.length) * 100);

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Evidence Inspector Modal */}
      <EvidenceInspectorModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        evidenceItem={selectedEvidenceForModal}
        entityName={investigation.targetEntityName}
      />

      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Investigation Workspace', active: true },
        ]}
        title={`Investigation #${investigation.caseNumber}: ${investigation.targetEntityName}`}
        description={`Target Domain: ${investigation.targetDomain} • Priority: ${investigation.priority} • Lead Investigator: ${investigation.leadInvestigator}`}
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {investigation.status}
          </span>
        }
        secondaryActions={[
          {
            label: copiedLink ? 'Snapshot Link Copied' : 'Share Read-Only Snapshot',
            icon: copiedLink ? Check : Share2,
            onClick: handleCopySnapshotLink,
          },
          {
            label: 'View Canonical Lead Dossier',
            icon: ExternalLink,
            onClick: () => onSelectAdvertiser(targetAdvertiser),
          },
        ]}
        primaryAction={{
          label: 'Export Investigation Dossier',
          icon: Download,
          onClick: onOpenExportSnapshot || (() => {}),
        }}
      />

      {/* Target Summary Snapshot Row (Section 22: Target Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
            Identity Evidence
          </span>
          <div className="text-xl font-mono font-bold text-neutral-900 mt-1">
            {investigation.summaryCounts.identityEvidence}
          </div>
          <span className="text-[10px] text-neutral-500">SOS filings, disclaimers</span>
        </div>

        <div className="p-3 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
            Observed Ads
          </span>
          <div className="text-xl font-mono font-bold text-neutral-900 mt-1">
            {investigation.summaryCounts.ads}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">100% extracted</span>
        </div>

        <div className="p-3 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
            Destinations
          </span>
          <div className="text-xl font-mono font-bold text-neutral-900 mt-1">
            {investigation.summaryCounts.destinations}
          </div>
          <span className="text-[10px] text-neutral-500">TLS 1.3 verified</span>
        </div>

        <div className="p-3 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
            Verification Claims
          </span>
          <div className="text-xl font-mono font-bold text-neutral-900 mt-1">
            {investigation.summaryCounts.verificationClaims}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">6 Valid probes</span>
        </div>

        <div className="p-3 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
            Conflicts / Ambiguities
          </span>
          <div className="text-xl font-mono font-bold text-neutral-900 mt-1">
            {investigation.summaryCounts.conflicts}
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">Zero conflicts</span>
        </div>

        <div className="p-3 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
            Review Items
          </span>
          <div className="text-xl font-mono font-bold text-amber-700 mt-1">
            {investigation.summaryCounts.reviews}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">1 In triage</span>
        </div>

        <div className="p-3 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
            Internal Notes
          </span>
          <div className="text-xl font-mono font-bold text-neutral-900 mt-1">
            {investigation.summaryCounts.notes}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">Non-source records</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-xl border border-neutral-200 p-1 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveSubTab('CHECKLIST')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'CHECKLIST'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Investigation Checklist ({completedChecklistCount}/{investigation.checklist.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('NOTES')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'NOTES'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Internal Research Notes ({investigation.notes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('GRAPH')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'GRAPH'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Evidence Graph Visualization</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SESSIONS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'SESSIONS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Saved Research Sessions ({SAMPLE_RESEARCH_SESSIONS.length})</span>
        </button>
      </div>

      {/* TAB 1: INVESTIGATION CHECKLIST (Section 23) */}
      {activeSubTab === 'CHECKLIST' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Structured Verification &amp; Review Checklist
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Checklist state is an operator workflow aid and does not overwrite source evidence ground truth.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-500">Progress: {checklistProgressPct}%</span>
                <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${checklistProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-neutral-100">
              {investigation.checklist.map(item => (
                <div 
                  key={item.id}
                  className="py-3.5 flex items-start gap-3 transition-colors hover:bg-neutral-50/60 rounded-xl px-2 -mx-2"
                >
                  <button
                    onClick={() => handleToggleChecklist(item.id)}
                    className="mt-0.5 shrink-0 focus:outline-none"
                    aria-label={`Toggle ${item.label}`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-300 hover:text-neutral-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${item.completed ? 'text-neutral-900 line-through text-neutral-400' : 'text-neutral-800'}`}>
                        {item.label}
                      </span>
                      {item.completed && (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                          Completed by {item.completedBy}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <div className="mt-1 text-[11px] font-mono text-neutral-600 bg-neutral-50 p-2 rounded-lg border border-neutral-200/70">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERNAL RESEARCH NOTES (Section 24) */}
      {activeSubTab === 'NOTES' && (
        <div className="space-y-4">
          {/* Note Banner */}
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>STRICT ARCHITECTURAL INVARIANT:</strong> Internal notes are subjective operator commentary and are <strong>NOT source evidence</strong>. They will never alter canonical values or qualification formulas.
              </span>
            </div>
          </div>

          {/* New Note Form */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-neutral-900 block">
              Add Internal Investigation Note
            </span>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={newNoteContent}
                onChange={e => setNewNoteContent(e.target.value)}
                placeholder="Log internal finding, regulatory registry check, or discrepancy observation..."
                rows={3}
                className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500">
                  <span>Author:</span>
                  <select
                    value={noteAuthor}
                    onChange={e => setNoteAuthor(e.target.value)}
                    className="px-2 py-1 rounded border border-neutral-200 text-neutral-800 bg-neutral-50"
                  >
                    <option value="daniela_rodriguez">Daniela Rodriguez (Lead Analyst)</option>
                    <option value="marcus_ops">Marcus Vance (Ops Engineer)</option>
                    <option value="sarah_compliance">Sarah Chen (Compliance Officer)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!newNoteContent.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-40 transition-colors shadow-xs"
                >
                  Save Internal Note
                </button>
              </div>
            </form>
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            {investigation.notes.map(note => (
              <div 
                key={note.id}
                className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      INTERNAL NOTE &bull; NON-EVIDENCE
                    </span>
                    <span className="font-semibold text-neutral-900">{note.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-neutral-400">{note.createdAt}</span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete internal note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-800 leading-relaxed font-sans">
                  {note.content}
                </p>

                {note.linkedEvidenceId && (
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 text-[11px] font-mono text-neutral-500">
                    <span>Linked Evidence Claim: <strong>{note.linkedEvidenceId}</strong></span>
                    <button
                      onClick={() => {
                        const ev = SAMPLE_EVIDENCE_ITEMS.find(e => e.evidenceId === note.linkedEvidenceId);
                        if (ev) {
                          setSelectedEvidenceForModal(ev);
                          setIsEvidenceModalOpen(true);
                        }
                      }}
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Inspect Evidence</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE GRAPH VISUALIZATION (Section 15) */}
      {activeSubTab === 'GRAPH' && (
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Entity Relationship &amp; Evidence Provenance Graph
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Click any node to inspect raw observations, network probes, and validation rules.
              </p>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Deterministic Multi-Hop Graph</span>
          </div>

          {/* Interactive Graph Diagram */}
          <div className="p-6 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col items-center gap-4 overflow-x-auto">
            {/* Level 1: Root Canonical Advertiser */}
            <div 
              onClick={() => {
                setSelectedEvidenceForModal(SAMPLE_EVIDENCE_ITEMS[0]);
                setIsEvidenceModalOpen(true);
              }}
              className="px-5 py-3 rounded-xl border-2 border-neutral-900 bg-white shadow-md text-center cursor-pointer hover:border-emerald-600 transition-all min-w-[280px]"
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                [NODE: CANONICAL ADVERTISER]
              </span>
              <div className="font-bold text-sm text-neutral-900 mt-0.5">
                {investigation.targetEntityName}
              </div>
              <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                Ad Library ID: {targetAdvertiser.adLibraryId}
              </div>
            </div>

            <div className="w-0.5 h-6 bg-neutral-300" />

            {/* Level 2: Ad Observations & Destination Domain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
              {/* Branch A: Ads */}
              <div className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => onSelectAdvertiser(targetAdvertiser)}
                  className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50 text-center cursor-pointer hover:bg-blue-100/70 transition-colors shadow-2xs"
                >
                  <span className="text-[10px] font-mono text-blue-700 font-bold uppercase block">
                    [NODE: AD OBSERVATIONS]
                  </span>
                  <div className="text-xs font-semibold text-blue-900 mt-0.5">
                    15 Active Ad Creatives Observed
                  </div>
                  <div className="text-[10px] font-mono text-blue-600 mt-0.5">
                    Relationship: OWNER_OF_ADS (100% confidence)
                  </div>
                </div>
              </div>

              {/* Branch B: Destination Domain */}
              <div className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => {
                    setSelectedEvidenceForModal(SAMPLE_EVIDENCE_ITEMS[2]);
                    setIsEvidenceModalOpen(true);
                  }}
                  className="w-full p-3 rounded-xl border border-indigo-200 bg-indigo-50 text-center cursor-pointer hover:bg-indigo-100/70 transition-colors shadow-2xs"
                >
                  <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase block">
                    [NODE: DESTINATION DOMAIN]
                  </span>
                  <div className="text-xs font-semibold text-indigo-900 mt-0.5">
                    {investigation.targetDomain}
                  </div>
                  <div className="text-[10px] font-mono text-indigo-600 mt-0.5">
                    Relationship: PROBED_DESTINATION (TLS 1.3 Valid)
                  </div>
                </div>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-neutral-300" />

            {/* Level 3: Verification & Registered Business Entity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
              <div 
                onClick={() => {
                  setSelectedEvidenceForModal(SAMPLE_EVIDENCE_ITEMS[1]);
                  setIsEvidenceModalOpen(true);
                }}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-center cursor-pointer hover:bg-emerald-100/70 transition-colors shadow-2xs"
              >
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase block">
                  [NODE: NETWORK PROBES &amp; CLAIMS]
                </span>
                <div className="text-xs font-semibold text-emerald-900 mt-0.5">
                  HTTP 200 &bull; SSL/TLS 1.3 &bull; Phone Match
                </div>
                <div className="text-[10px] font-mono text-emerald-600 mt-0.5">
                  Status: VERIFIED (SSRF Invariant Passed)
                </div>
              </div>

              <div 
                onClick={() => {
                  setSelectedEvidenceForModal(SAMPLE_EVIDENCE_ITEMS[0]);
                  setIsEvidenceModalOpen(true);
                }}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-center cursor-pointer hover:bg-amber-100/70 transition-colors shadow-2xs"
              >
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase block">
                  [NODE: REGISTERED BUSINESS ENTITY]
                </span>
                <div className="text-xs font-semibold text-amber-900 mt-0.5">
                  Texas SOS Filing #080344912
                </div>
                <div className="text-[10px] font-mono text-amber-700 mt-0.5">
                  Status: ACTIVE (Austin, TX)
                </div>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-neutral-300" />

            {/* Level 4: Final Qualification */}
            <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-center shadow-xs min-w-[280px]">
              <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block">
                [NODE: QUALIFICATION CONCLUSION]
              </span>
              <div className="text-base font-bold text-emerald-950 mt-0.5">
                QUALIFIED &bull; Score: {targetAdvertiser.qualificationScore.toFixed(1)} / 100
              </div>
              <div className="text-[11px] font-mono text-emerald-800 mt-0.5">
                Deterministic Model: {targetAdvertiser.scoringModelVersion}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SAVED RESEARCH SESSIONS (Section 21) */}
      {activeSubTab === 'SESSIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Persistent Research Sessions
              </h3>
              <p className="text-xs text-neutral-500">
                Resume investigation context, selected ad creative sets, and saved evidence queries.
              </p>
            </div>
            <button
              onClick={() => alert('New session created and persisted to database.')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Session</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_RESEARCH_SESSIONS.map(session => (
              <div
                key={session.sessionId}
                className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                      Session ID: {session.sessionId}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 mt-0.5">
                      {session.title}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 shrink-0">
                    {session.selectedEntityIds.length} Entities
                  </span>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {session.description}
                </p>

                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] font-mono text-neutral-700 space-y-1">
                  <div>Criteria: <span className="text-neutral-900 font-semibold">{JSON.stringify(session.searchCriteria)}</span></div>
                  <div>Saved Evidence: <span className="text-neutral-900 font-semibold">{session.savedEvidenceIds.length} items</span></div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px] font-mono text-neutral-400">
                  <span>Updated: {session.updatedAt.substring(0, 10)}</span>
                  <button
                    onClick={() => {
                      alert(`Resuming session ${session.sessionId}`);
                    }}
                    className="px-3 py-1 rounded text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center gap-1"
                  >
                    <span>Resume Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
