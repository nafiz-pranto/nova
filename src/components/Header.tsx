import React from 'react';
import { Shield, Download, Bot, Layers, CheckCircle2, FileJson, Sliders, PlayCircle } from 'lucide-react';

export type ActivePhase = 'phase10' | 'phase09' | 'phase08' | 'phase07' | 'phase06' | 'phase05' | 'phase04' | 'phase03' | 'phase02' | 'phase01';
export type ActiveTab =
  | 'p10-gate'
  | 'p10-lineage'
  | 'p10-consistency'
  | 'p10-security'
  | 'p10-chaos'
  | 'p10-performance'
  | 'p10-spec'
  | 'p10-contract'
  | 'p9-cockpit'
  | 'p9-chaos'
  | 'p9-drift'
  | 'p9-metrics'
  | 'p9-reconciliation'
  | 'p9-runbooks'
  | 'p9-spec'
  | 'p9-audit'
  | 'p8-dashboard'
  | 'p8-workspace'
  | 'p8-dossier'
  | 'p8-reviews'
  | 'p8-chrome-mv3'
  | 'p8-export'
  | 'p8-spec'
  | 'p8-audit'
  | 'p7-schema'
  | 'p7-transactions'
  | 'p7-lineage'
  | 'p7-migrations'
  | 'p7-spec'
  | 'p7-audit'
  | 'p7-handoff'
  | 'p6-simulator'
  | 'p6-matrix'
  | 'p6-models'
  | 'p6-replay'
  | 'p6-spec'
  | 'p6-audit'
  | 'p6-handoff'
  | 'p5-pipeline'
  | 'p5-ssrf'
  | 'p5-evidence'
  | 'p5-fixtures'
  | 'p5-spec'
  | 'p5-audit'
  | 'p5-handoff'
  | 'p4-spec'
  | 'p4-engine'
  | 'p4-matrix'
  | 'p4-ledger'
  | 'p4-fixtures'
  | 'p4-audit'
  | 'p4-handoff'
  | 'p3-spec'
  | 'p3-pipeline'
  | 'p3-provenance'
  | 'p3-fixtures'
  | 'p3-audit'
  | 'p3-handoff'
  | 'p2-spec'
  | 'p2-fsm'
  | 'p2-selectors'
  | 'p2-fixtures'
  | 'p2-audit'
  | 'p2-handoff'
  | 'p1-spec'
  | 'p1-fsm'
  | 'p1-contracts'
  | 'p1-db'
  | 'p1-audit'
  | 'p1-handoff';

interface HeaderProps {
  activePhase: ActivePhase;
  setActivePhase: (phase: ActivePhase) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onExportJson: () => void;
}

interface PhaseItemConfig {
  id: ActivePhase;
  num: string;
  name: string;
  badge: string;
  version: string;
  desc: string;
  defaultTab: ActiveTab;
}

const PHASES_CONFIG: PhaseItemConfig[] = [
  {
    id: 'phase10',
    num: 'Phase 10',
    name: 'Acceptance & Release',
    badge: 'PHASE 10 PRODUCTION ACCEPTANCE',
    version: 'v10.0.0-PROD-ACCEPTED',
    desc: 'Maximum Strict Full-System Integration, End-to-End Validation, Security Assurance & Production Acceptance',
    defaultTab: 'p10-gate',
  },
  {
    id: 'phase09',
    num: 'Phase 09',
    name: 'SRE & Resilience',
    badge: 'PHASE 09 SRE & RESILIENCE',
    version: 'v9.0.0-PROD',
    desc: 'Reliability, Recovery, Observability, Scheduling, Health Monitoring, Change Detection & Production Operations',
    defaultTab: 'p9-cockpit',
  },
  {
    id: 'phase08',
    num: 'Phase 08',
    name: 'Dashboard & MV3',
    badge: 'PHASE 08 DASHBOARD & MV3',
    version: 'v8.0.0-PROD',
    desc: 'Operator Dashboard, Research Workspace, Chrome Manifest V3 Extension & Formula-Hardened Export',
    defaultTab: 'p8-dashboard',
  },
  {
    id: 'phase07',
    num: 'Phase 07',
    name: 'Database & Schema',
    badge: 'PHASE 07 DATABASE',
    version: 'v7.0.0-PROD',
    desc: 'PostgreSQL Persistence, Data Model, Provenance, History, Auditability & Database Integrity',
    defaultTab: 'p7-schema',
  },
  {
    id: 'phase06',
    num: 'Phase 06',
    name: 'Scoring & Models',
    badge: 'PHASE 06 SCORING',
    version: 'v6.0.0-PROD',
    desc: 'Evidence-Driven Lead Qualification, Scoring, Prioritization & Explainability',
    defaultTab: 'p6-simulator',
  },
  {
    id: 'phase05',
    num: 'Phase 05',
    name: 'Verification & SSRF',
    badge: 'PHASE 05 VERIFICATION',
    version: 'v5.0.0-PROD',
    desc: 'Advertiser, Landing-Page, Website & Business Verification Specification (SSRF Defenses)',
    defaultTab: 'p5-pipeline',
  },
  {
    id: 'phase04',
    num: 'Phase 04',
    name: 'Identity & Merges',
    badge: 'PHASE 04 IDENTITY',
    version: 'v4.0.0-PROD',
    desc: 'Identity Resolution, Entity Linking, Deduplication & Safe Reversible Merges',
    defaultTab: 'p4-engine',
  },
  {
    id: 'phase03',
    num: 'Phase 03',
    name: 'Extraction & DAG',
    badge: 'PHASE 03 EXTRACTION',
    version: 'v3.0.0-PROD',
    desc: 'Public-Data Extraction, Normalization, Validation & Provenance DAG',
    defaultTab: 'p3-spec',
  },
  {
    id: 'phase02',
    num: 'Phase 02',
    name: 'Browser & Workers',
    badge: 'PHASE 02 BROWSER',
    version: 'v2.0.0-PROD',
    desc: 'Browser Worker & Public UI Automation Specification (Playwright / Anti-Evasion)',
    defaultTab: 'p2-spec',
  },
  {
    id: 'phase01',
    num: 'Phase 01',
    name: 'Blueprint & FSM',
    badge: 'PHASE 01 BLUEPRINT',
    version: 'v1.0.0-PROD',
    desc: 'Core Production Architecture & Engineering Specification Blueprint',
    defaultTab: 'p1-spec',
  },
];

const SUB_TABS: Record<ActivePhase, Array<{ id: ActiveTab; label: string }>> = {
  phase10: [
    { id: 'p10-gate', label: 'Release Gate & Checklist' },
    { id: 'p10-lineage', label: 'Golden Lineage Trace' },
    { id: 'p10-consistency', label: 'Consistency & SoR Matrix' },
    { id: 'p10-security', label: 'SSRF & AppSec Lab' },
    { id: 'p10-chaos', label: 'Failure Matrix (20 Pts)' },
    { id: 'p10-performance', label: 'Performance, Load & DR' },
    { id: 'p10-spec', label: 'Phase 10 Spec (37 Sec)' },
    { id: 'p10-contract', label: 'Handoff Contract (Sec 77)' },
  ],
  phase09: [
    { id: 'p9-cockpit', label: 'Operational Cockpit' },
    { id: 'p9-chaos', label: 'Chaos Lab (6 Scenarios)' },
    { id: 'p9-drift', label: 'DOM Drift & Anomaly Center' },
    { id: 'p9-metrics', label: 'Metrics, SLOs & Alerts' },
    { id: 'p9-reconciliation', label: 'Reconciliation & DR' },
    { id: 'p9-runbooks', label: 'Runbooks (10 Procedures)' },
    { id: 'p9-spec', label: 'Phase 09 Spec (36 Sec)' },
    { id: 'p9-audit', label: 'Readiness Matrix (35/35)' },
  ],
  phase08: [
    { id: 'p8-dashboard', label: 'Research Dashboard' },
    { id: 'p8-workspace', label: 'Job Workspace & Directory' },
    { id: 'p8-dossier', label: 'Advertiser Workspace (Dossier)' },
    { id: 'p8-reviews', label: 'Human Review Queues (3)' },
    { id: 'p8-chrome-mv3', label: 'Chrome Extension MV3' },
    { id: 'p8-export', label: 'Export Pipeline & Safe CSV' },
    { id: 'p8-spec', label: 'Specification (31 Sections)' },
    { id: 'p8-audit', label: 'Phase 08 Audit (33/33)' },
  ],
  phase07: [
    { id: 'p7-schema', label: 'Database Schema (32 Tables)' },
    { id: 'p7-transactions', label: 'Transaction & Concurrency Simulator' },
    { id: 'p7-lineage', label: 'Provenance & Proof Graph' },
    { id: 'p7-migrations', label: 'Migration Pipeline (001-008)' },
    { id: 'p7-spec', label: 'Specification (31 Sections)' },
    { id: 'p7-audit', label: 'Phase 07 Audit (33/33)' },
    { id: 'p7-handoff', label: 'Phase 08 Handoff Contract' },
  ],
  phase06: [
    { id: 'p6-simulator', label: 'Qualification Simulator' },
    { id: 'p6-matrix', label: 'Prioritization Matrix' },
    { id: 'p6-models', label: 'Model Registry & Shadow Mode' },
    { id: 'p6-replay', label: 'Golden Benchmark Replay (16)' },
    { id: 'p6-spec', label: 'Specification (28 Sections)' },
    { id: 'p6-audit', label: 'Phase 06 Audit (17/17)' },
    { id: 'p6-handoff', label: 'Handoff JSON' },
  ],
  phase05: [
    { id: 'p5-pipeline', label: 'Verification Simulator (10 Layers)' },
    { id: 'p5-ssrf', label: 'SSRF Security Matrix (15 Vectors)' },
    { id: 'p5-evidence', label: 'Evidence & Provenance Inspector' },
    { id: 'p5-fixtures', label: 'Benchmark Replay (22 Fixtures)' },
    { id: 'p5-spec', label: 'Specification (25 Sections)' },
    { id: 'p5-audit', label: 'Phase 05 Audit (30/30)' },
    { id: 'p5-handoff', label: 'Handoff JSON' },
  ],
  phase04: [
    { id: 'p4-engine', label: 'Resolution Engine & 4-Tier DAG' },
    { id: 'p4-matrix', label: 'Match Signal Matrix & Scoring' },
    { id: 'p4-ledger', label: 'Reversible Merge Ledger' },
    { id: 'p4-fixtures', label: 'Benchmark Suite (10 Scenarios)' },
    { id: 'p4-spec', label: 'Specification (7 Sections)' },
    { id: 'p4-audit', label: 'Phase 04 Audit (26/26)' },
    { id: 'p4-handoff', label: 'Handoff JSON' },
  ],
  phase03: [
    { id: 'p3-spec', label: 'Extraction Spec (23 Sections)' },
    { id: 'p3-pipeline', label: 'Pipeline Simulator (6 Stages)' },
    { id: 'p3-provenance', label: 'Provenance Graph & Lineage' },
    { id: 'p3-fixtures', label: 'Fixture Replay (10 Snapshots)' },
    { id: 'p3-audit', label: 'Phase 03 Audit (35/35)' },
    { id: 'p3-handoff', label: 'Phase 03 Handoff JSON' },
  ],
  phase02: [
    { id: 'p2-spec', label: 'Browser Worker Spec (27 Sections)' },
    { id: 'p2-fsm', label: 'Page State Machine (15 States)' },
    { id: 'p2-selectors', label: 'Selector Registry (10)' },
    { id: 'p2-fixtures', label: 'Test Fixture Replay (10 Snapshots)' },
    { id: 'p2-audit', label: 'Phase 02 Audit (31/31)' },
    { id: 'p2-handoff', label: 'Phase 02 Handoff JSON' },
  ],
  phase01: [
    { id: 'p1-spec', label: 'Architecture Spec (20 Sections)' },
    { id: 'p1-fsm', label: 'Job FSM Engine (14 States)' },
    { id: 'p1-contracts', label: 'Contracts (12)' },
    { id: 'p1-db', label: 'PostgreSQL Schema' },
    { id: 'p1-audit', label: 'Phase 01 Audit (26/26)' },
    { id: 'p1-handoff', label: 'Phase 01 Handoff JSON' },
  ],
};

export const Header: React.FC<HeaderProps> = ({
  activePhase,
  setActivePhase,
  activeTab,
  setActiveTab,
  onExportJson,
}) => {
  const activePhaseConfig =
    PHASES_CONFIG.find((p) => p.id === activePhase) || PHASES_CONFIG[0];
  const currentTabs = SUB_TABS[activePhase] || [];

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-30 shadow-xs w-full max-w-full min-w-0 box-border">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0 box-border">
        {/* Tier 1: Brand & Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 sm:py-3 w-full min-w-0 box-border">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-neutral-900 tracking-tight text-sm sm:text-base truncate max-w-[280px] sm:max-w-none">
                  Nova
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {activePhaseConfig.badge}
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-200 shrink-0">
                  {activePhaseConfig.version}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-normal truncate max-w-xl sm:max-w-2xl mt-0.5 hidden sm:block">
                {activePhaseConfig.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              id="export-handoff-btn"
              onClick={onExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Export Handoff</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Phase Navigation Strip (Phase 10 down to Phase 01) */}
        <nav
          aria-label="Phase navigation"
          className="border-t border-neutral-100 py-2 w-full min-w-0 max-w-full box-border"
        >
          <div className="phaseNav flex items-stretch gap-2 sm:gap-2.5 w-full min-w-0 overflow-x-auto overflow-y-hidden flex-nowrap py-1 scrollbar-thin box-border">
            {PHASES_CONFIG.map((phase) => {
              const isActive = activePhase === phase.id;
              return (
                <button
                  key={phase.id}
                  id={`nav-phase-${phase.id}`}
                  onClick={() => {
                    setActivePhase(phase.id);
                    setActiveTab(phase.defaultTab);
                  }}
                  className={`phaseItem flex-initial min-w-[125px] sm:min-w-[145px] max-w-[200px] sm:max-w-[240px] p-2 sm:p-2.5 rounded-lg border text-left transition-all box-border focus:outline-none focus:ring-2 focus:ring-neutral-900 shrink-0 ${
                    isActive
                      ? 'bg-purple-600 text-white border-neutral-900 shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold tracking-wider uppercase truncate ${
                        isActive ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {phase.num}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-300'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-xs font-semibold leading-tight break-words overflow-wrap-anywhere ${
                      isActive ? 'text-white' : 'text-neutral-900'
                    }`}
                  >
                    {phase.name}
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Tier 3: Phase Sub-Navigation Tabs */}
        <div
          aria-label="Phase sub-navigation tabs"
          className="border-t border-neutral-100 py-1.5 sm:py-2 w-full min-w-0 max-w-full box-border"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 w-full min-w-0 overflow-x-auto overflow-y-hidden flex-nowrap scrollbar-thin box-border py-0.5">
            {currentTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-initial min-w-0 max-w-[240px] px-3 py-1.5 rounded-md text-xs font-medium transition-colors box-border text-center sm:text-left leading-normal break-words shrink-0 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                    isActive
                      ? 'bg-purple-600 text-white font-semibold shadow-xs'
                      : 'bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/60'
                  }`}
                >
                  <span className="block break-words overflow-wrap-anywhere">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
