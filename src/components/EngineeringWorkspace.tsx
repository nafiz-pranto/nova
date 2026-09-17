import React, { useState } from 'react';
import { ActivePhase, ActiveTab } from './Header';

// Phase 10 components
import { ProductionAcceptanceGate } from './ProductionAcceptanceGate';
import { GoldenTraceLineageViewer } from './GoldenTraceLineageViewer';
import { ConsistencyAuditMatrix } from './ConsistencyAuditMatrix';
import { SecurityAssuranceSuite } from './SecurityAssuranceSuite';
import { FailureMatrixSimulator } from './FailureMatrixSimulator';
import { PerformanceAndRecoveryLab } from './PerformanceAndRecoveryLab';
import { Phase10Reader } from './Phase10Reader';
import { Phase10HandoffViewer } from './Phase10HandoffViewer';

// Phase 09 components
import { OperationalCockpit } from './OperationalCockpit';
import { ChaosLabSimulator } from './ChaosLabSimulator';
import { DriftAnomalyCenter } from './DriftAnomalyCenter';
import { MetricsAndAlertsCenter } from './MetricsAndAlertsCenter';
import { ReconciliationLedger } from './ReconciliationLedger';
import { RunbookCatalogViewer } from './RunbookCatalogViewer';
import { Phase09Reader } from './Phase09Reader';
import { Phase09AuditMatrix } from './Phase09AuditMatrix';

// Phase 08 components
import { ChromeMV3Studio } from './ChromeMV3Studio';
import { Phase08Reader } from './Phase08Reader';
import { Phase08AuditMatrix } from './Phase08AuditMatrix';

// Phase 07 components
import { Phase07Reader } from './Phase07Reader';
import { DatabaseSchemaExplorer } from './DatabaseSchemaExplorer';
import { TransactionSimulator } from './TransactionSimulator';
import { ProvenanceLineageViewer } from './ProvenanceLineageViewer';
import { MigrationPipelineRunner } from './MigrationPipelineRunner';
import { Phase07Audit } from './Phase07Audit';
import { Phase07HandoffViewer } from './Phase07HandoffViewer';

// Phase 06 components
import { Phase06Reader } from './Phase06Reader';
import { QualificationSimulator } from './QualificationSimulator';
import { PrioritizationMatrixViewer } from './PrioritizationMatrixViewer';
import { ModelRegistryAndImpactViewer } from './ModelRegistryAndImpactViewer';
import { Phase06GoldenReplay } from './Phase06GoldenReplay';
import { Phase06Audit } from './Phase06Audit';
import { Phase06HandoffViewer } from './Phase06HandoffViewer';

// Phase 05 components
import { Phase05Reader } from './Phase05Reader';
import { VerificationPipelineSimulator } from './VerificationPipelineSimulator';
import { SsrfSecurityMatrixViewer } from './SsrfSecurityMatrixViewer';
import { VerificationEvidenceInspector } from './VerificationEvidenceInspector';
import { Phase05FixtureReplay } from './Phase05FixtureReplay';
import { Phase05Audit } from './Phase05Audit';
import { Phase05HandoffViewer } from './Phase05HandoffViewer';

// Phase 04 components
import { Phase04Reader } from './Phase04Reader';
import { EntityResolutionSimulator } from './EntityResolutionSimulator';
import { CandidateScoringMatrixViewer } from './CandidateScoringMatrixViewer';
import { ReversibleMergeLedgerViewer } from './ReversibleMergeLedgerViewer';
import { Phase04FixtureReplay } from './Phase04FixtureReplay';
import { Phase04Audit } from './Phase04Audit';
import { Phase04HandoffViewer } from './Phase04HandoffViewer';

// Phase 03 components
import { Phase03Reader } from './Phase03Reader';
import { ExtractionPipelineSimulator } from './ExtractionPipelineSimulator';
import { ProvenanceGraphViewer } from './ProvenanceGraphViewer';
import { ExtractionFixtureReplay } from './ExtractionFixtureReplay';
import { Phase03Audit } from './Phase03Audit';
import { Phase03HandoffViewer } from './Phase03HandoffViewer';

// Phase 02 components
import { Phase02Reader } from './Phase02Reader';
import { PageStateSimulator } from './PageStateSimulator';
import { SelectorRegistryViewer } from './SelectorRegistryViewer';
import { FixtureViewer } from './FixtureViewer';
import { Phase02Audit } from './Phase02Audit';
import { Phase02HandoffViewer } from './Phase02HandoffViewer';

// Phase 01 components
import { NavigationSidebar } from './NavigationSidebar';
import { SpecificationReader } from './SpecificationReader';
import { StateMachineVisualizer } from './StateMachineVisualizer';
import { ContractInspector } from './ContractInspector';
import { DatabaseSchemaViewer } from './DatabaseSchemaViewer';
import { AcceptanceAudit } from './AcceptanceAudit';
import { HandoffExportView } from './HandoffExportView';

import { PageHeader } from './common/PageHeader';
import { Layers, Terminal, Shield, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';

interface EngineeringWorkspaceProps {
  onNotify: (msg: string) => void;
}

const PHASES_LIST: Array<{ id: ActivePhase; name: string; label: string; defaultTab: ActiveTab }> = [
  { id: 'phase10', name: 'Phase 10', label: 'Acceptance & Release Gate', defaultTab: 'p10-gate' },
  { id: 'phase09', name: 'Phase 09', label: 'SRE & Operational Observability', defaultTab: 'p9-cockpit' },
  { id: 'phase08', name: 'Phase 08', label: 'Chrome MV3 & Export Hardening', defaultTab: 'p8-chrome-mv3' },
  { id: 'phase07', name: 'Phase 07', label: 'Database Schema & Transactions', defaultTab: 'p7-schema' },
  { id: 'phase06', name: 'Phase 06', label: 'Scoring Models & Shadow Mode', defaultTab: 'p6-simulator' },
  { id: 'phase05', name: 'Phase 05', label: 'Verification & SSRF Security', defaultTab: 'p5-pipeline' },
  { id: 'phase04', name: 'Phase 04', label: 'Identity Resolution & Merges', defaultTab: 'p4-engine' },
  { id: 'phase03', name: 'Phase 03', label: 'Extraction & Provenance DAG', defaultTab: 'p3-spec' },
  { id: 'phase02', name: 'Phase 02', label: 'Browser Workers & Automation', defaultTab: 'p2-spec' },
  { id: 'phase01', name: 'Phase 01', label: 'Architecture Blueprint & FSM', defaultTab: 'p1-spec' },
];

const PHASE_TABS: Record<ActivePhase, Array<{ id: ActiveTab; label: string }>> = {
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
    { id: 'p8-chrome-mv3', label: 'Chrome Extension MV3' },
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
    { id: 'p3-spec', label: 'Specification (30 Sections)' },
    { id: 'p3-pipeline', label: 'Pipeline DAG Simulator' },
    { id: 'p3-provenance', label: 'Provenance Graph Viewer' },
    { id: 'p3-fixtures', label: 'Fixture Suite (24 Test Cards)' },
    { id: 'p3-audit', label: 'Phase 03 Audit Matrix (28/28)' },
    { id: 'p3-handoff', label: 'Phase 04 Handoff Contract' },
  ],
  phase02: [
    { id: 'p2-spec', label: 'Specification (28 Sections)' },
    { id: 'p2-fsm', label: 'Page State Simulator' },
    { id: 'p2-selectors', label: 'Resilient Selector Registry' },
    { id: 'p2-fixtures', label: 'HTML Fixtures Suite' },
    { id: 'p2-audit', label: 'Phase 02 Audit (30/30)' },
    { id: 'p2-handoff', label: 'Phase 03 Handoff Contract' },
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

export const EngineeringWorkspace: React.FC<EngineeringWorkspaceProps> = ({ onNotify }) => {
  const [activePhase, setActivePhase] = useState<ActivePhase>('phase10');
  const [activeTab, setActiveTab] = useState<ActiveTab>('p10-gate');
  const [p1SectionId, setP1SectionId] = useState<string>('adr');

  const tabsForActivePhase = PHASE_TABS[activePhase] || [];

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Engineering & Admin', active: true },
        ]}
        title="System Architecture & Production Acceptance Console"
        description="Specifications, deterministic simulators, security assurance suites, PostgreSQL schemas, and full-system acceptance gates for Phases 01 through 10."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Acceptance Status: ACCEPTED
          </span>
        }
      />

      {/* Compact Phase Stepper Rail */}
      <div className="bg-white p-2.5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2">
          Select Engineering Subsystem (Phases 01–10)
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {PHASES_LIST.map(p => {
            const isSelected = activePhase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePhase(p.id);
                  setActiveTab(p.defaultTab);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/60'
                }`}
              >
                <span>{p.name}: {p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-tab strip */}
        <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          {tabsForActivePhase.map(t => {
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-neutral-200 text-neutral-900 font-bold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Component */}
      <div className="w-full min-w-0">
        {/* Phase 10 */}
        {activePhase === 'phase10' && (
          <div>
            {activeTab === 'p10-gate' && <ProductionAcceptanceGate onNotify={onNotify} />}
            {activeTab === 'p10-lineage' && <GoldenTraceLineageViewer onNotify={onNotify} />}
            {activeTab === 'p10-consistency' && <ConsistencyAuditMatrix onNotify={onNotify} />}
            {activeTab === 'p10-security' && <SecurityAssuranceSuite onNotify={onNotify} />}
            {activeTab === 'p10-chaos' && <FailureMatrixSimulator onNotify={onNotify} />}
            {activeTab === 'p10-performance' && <PerformanceAndRecoveryLab onNotify={onNotify} />}
            {activeTab === 'p10-spec' && <Phase10Reader />}
            {activeTab === 'p10-contract' && <Phase10HandoffViewer onNotify={onNotify} />}
          </div>
        )}

        {/* Phase 09 */}
        {activePhase === 'phase09' && (
          <div>
            {activeTab === 'p9-cockpit' && <OperationalCockpit onNotify={onNotify} />}
            {activeTab === 'p9-chaos' && <ChaosLabSimulator onNotify={onNotify} />}
            {activeTab === 'p9-drift' && <DriftAnomalyCenter onNotify={onNotify} />}
            {activeTab === 'p9-metrics' && <MetricsAndAlertsCenter onNotify={onNotify} />}
            {activeTab === 'p9-reconciliation' && <ReconciliationLedger onNotify={onNotify} />}
            {activeTab === 'p9-runbooks' && <RunbookCatalogViewer onNotify={onNotify} />}
            {activeTab === 'p9-spec' && <Phase09Reader />}
            {activeTab === 'p9-audit' && <Phase09AuditMatrix onNotify={onNotify} />}
          </div>
        )}

        {/* Phase 08 */}
        {activePhase === 'phase08' && (
          <div>
            {activeTab === 'p8-chrome-mv3' && <ChromeMV3Studio />}
            {activeTab === 'p8-spec' && <Phase08Reader />}
            {activeTab === 'p8-audit' && <Phase08AuditMatrix />}
          </div>
        )}

        {/* Phase 07 */}
        {activePhase === 'phase07' && (
          <div>
            {activeTab === 'p7-schema' && <DatabaseSchemaExplorer />}
            {activeTab === 'p7-transactions' && <TransactionSimulator />}
            {activeTab === 'p7-lineage' && <ProvenanceLineageViewer />}
            {activeTab === 'p7-migrations' && <MigrationPipelineRunner />}
            {activeTab === 'p7-spec' && <Phase07Reader />}
            {activeTab === 'p7-audit' && <Phase07Audit />}
            {activeTab === 'p7-handoff' && <Phase07HandoffViewer />}
          </div>
        )}

        {/* Phase 06 */}
        {activePhase === 'phase06' && (
          <div>
            {activeTab === 'p6-simulator' && <QualificationSimulator />}
            {activeTab === 'p6-matrix' && <PrioritizationMatrixViewer />}
            {activeTab === 'p6-models' && <ModelRegistryAndImpactViewer />}
            {activeTab === 'p6-replay' && <Phase06GoldenReplay />}
            {activeTab === 'p6-spec' && <Phase06Reader />}
            {activeTab === 'p6-audit' && <Phase06Audit />}
            {activeTab === 'p6-handoff' && <Phase06HandoffViewer />}
          </div>
        )}

        {/* Phase 05 */}
        {activePhase === 'phase05' && (
          <div>
            {activeTab === 'p5-pipeline' && <VerificationPipelineSimulator />}
            {activeTab === 'p5-ssrf' && <SsrfSecurityMatrixViewer />}
            {activeTab === 'p5-evidence' && <VerificationEvidenceInspector />}
            {activeTab === 'p5-fixtures' && <Phase05FixtureReplay />}
            {activeTab === 'p5-spec' && <Phase05Reader />}
            {activeTab === 'p5-audit' && <Phase05Audit />}
            {activeTab === 'p5-handoff' && <Phase05HandoffViewer />}
          </div>
        )}

        {/* Phase 04 */}
        {activePhase === 'phase04' && (
          <div>
            {activeTab === 'p4-engine' && <EntityResolutionSimulator />}
            {activeTab === 'p4-matrix' && <CandidateScoringMatrixViewer />}
            {activeTab === 'p4-ledger' && <ReversibleMergeLedgerViewer />}
            {activeTab === 'p4-fixtures' && <Phase04FixtureReplay />}
            {activeTab === 'p4-spec' && <Phase04Reader />}
            {activeTab === 'p4-audit' && <Phase04Audit />}
            {activeTab === 'p4-handoff' && <Phase04HandoffViewer />}
          </div>
        )}

        {/* Phase 03 */}
        {activePhase === 'phase03' && (
          <div>
            {activeTab === 'p3-spec' && <Phase03Reader />}
            {activeTab === 'p3-pipeline' && <ExtractionPipelineSimulator />}
            {activeTab === 'p3-provenance' && <ProvenanceGraphViewer />}
            {activeTab === 'p3-fixtures' && <ExtractionFixtureReplay />}
            {activeTab === 'p3-audit' && <Phase03Audit />}
            {activeTab === 'p3-handoff' && <Phase03HandoffViewer />}
          </div>
        )}

        {/* Phase 02 */}
        {activePhase === 'phase02' && (
          <div>
            {activeTab === 'p2-spec' && <Phase02Reader />}
            {activeTab === 'p2-fsm' && <PageStateSimulator />}
            {activeTab === 'p2-selectors' && <SelectorRegistryViewer />}
            {activeTab === 'p2-fixtures' && <FixtureViewer />}
            {activeTab === 'p2-audit' && <Phase02Audit />}
            {activeTab === 'p2-handoff' && <Phase02HandoffViewer />}
          </div>
        )}

        {/* Phase 01 */}
        {activePhase === 'phase01' && (
          <div className="flex flex-col md:flex-row overflow-hidden w-full min-w-0 rounded-xl border border-neutral-200 bg-white">
            {activeTab === 'p1-spec' && (
              <>
                <NavigationSidebar
                  activeSectionId={p1SectionId}
                  onSelectSection={setP1SectionId}
                />
                <SpecificationReader
                  activeSectionId={p1SectionId}
                  onSelectSection={setP1SectionId}
                />
              </>
            )}
            {activeTab === 'p1-fsm' && <StateMachineVisualizer />}
            {activeTab === 'p1-contracts' && <ContractInspector />}
            {activeTab === 'p1-db' && <DatabaseSchemaViewer />}
            {activeTab === 'p1-audit' && <AcceptanceAudit />}
            {activeTab === 'p1-handoff' && <HandoffExportView />}
          </div>
        )}
      </div>
    </div>
  );
};
