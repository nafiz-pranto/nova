import React, { useState } from 'react';
import { GlobalHeader, WorkspaceArea, ResearchTab } from './components/GlobalHeader';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { NotificationCenterDrawer } from './components/NotificationCenterDrawer';
import { EvidenceInspectorModal } from './components/EvidenceInspectorModal';

// Area A: Research Workspace Components
import { ResearchDashboard } from './components/ResearchDashboard';
import { ResearchWorkspace } from './components/ResearchWorkspace';
import { LeadDossierInspector } from './components/LeadDossierInspector';
import { AdsWorkspace } from './components/AdsWorkspace';
import { WatchlistWorkspace } from './components/WatchlistWorkspace';
import { ReviewQueuesWorkspace } from './components/ReviewQueuesWorkspace';
import { VerificationWorkspace } from './components/VerificationWorkspace';
import { QualificationWorkspace } from './components/QualificationWorkspace';
import { CompareWorkspace } from './components/CompareWorkspace';
import { DataHealthWorkspace } from './components/DataHealthWorkspace';
import { ExportPipelineStudio } from './components/ExportPipelineStudio';
import { ResearchWizard } from './components/ResearchWizard';
import { ResearchExecutionResult } from './utils/researchWorkflowRunner';

// Phase 12 New Advanced Workspaces
import { InvestigationWorkspace } from './components/InvestigationWorkspace';
import { BusinessEntityWorkspace } from './components/BusinessEntityWorkspace';
import { SearchAndQueryWorkspace } from './components/SearchAndQueryWorkspace';
import { AnomalyInboxWorkspace } from './components/AnomalyInboxWorkspace';
import { GlobalActivityWorkspace } from './components/GlobalActivityWorkspace';

// Phase 13 Workflow Engine Workspace
import { WorkflowWorkspace } from './components/WorkflowWorkspace';

// Phase 14 Analytics Workspace
import { AnalyticsWorkspace } from './components/AnalyticsWorkspace';

// Phase 16 Rules, Policy & Configuration Studio
import { ConfigurationStudio } from './components/ConfigurationStudio';

// Phase 17 Policy, Safety, Security Invariants & Control Plane
import { PolicySafetyStudio } from './components/PolicySafetyStudio';

// Phase 18 Secure Multi-Tenant Organization & Team Platform
import { MultiTenantPlatformStudio } from './components/MultiTenantPlatformStudio';

// Phase 19 Secure Team Collaboration & Shared Research Platform
import { CollaborationPlatformStudio } from './components/CollaborationPlatformStudio';

// Phase 20 Advanced Research Search & Discovery Platform
import { ResearchDiscoveryWorkspace } from './components/ResearchDiscoveryWorkspace';

// Phase 21 Evidence, Provenance & Reproducible Research Platform
import { EvidenceProvenanceWorkspace } from './components/EvidenceProvenanceWorkspace';

// Phase 22 Continuous Monitoring, Change Intelligence & Event-Driven Research
import { MonitoringIntelligenceWorkspace } from './components/MonitoringIntelligenceWorkspace';

// Phase 23 Centralized Audit, Governance, Control Verification & Remediation
import { GovernanceAuditWorkspace } from './components/GovernanceAuditWorkspace';

// Phase 24 Production Operations & Recovery Control Plane
import { ProductionOperationsWorkspace } from './components/ProductionOperationsWorkspace';

// Phase 25 Product Telemetry, Usage Intelligence & Capacity Platform
import { ProductTelemetryWorkspace } from './components/ProductTelemetryWorkspace';

// Area B: Engineering & Admin Components
import { EngineeringWorkspace } from './components/EngineeringWorkspace';

import { SAMPLE_ADVERTISERS, SAMPLE_RESEARCH_JOBS } from './data/phase08FixturesAndAudit';
import { AdvertiserViewModel, AdViewModel, ResearchJobModel } from './types';

export default function App() {
  const [activeArea, setActiveArea] = useState<WorkspaceArea>('RESEARCH');
  const [researchTab, setResearchTab] = useState<ResearchTab>('wizard');
  const [advertisers, setAdvertisers] = useState<AdvertiserViewModel[]>(SAMPLE_ADVERTISERS);
  const [jobs, setJobs] = useState<ResearchJobModel[]>(SAMPLE_RESEARCH_JOBS);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<AdvertiserViewModel>(SAMPLE_ADVERTISERS[0]);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleWizardRunComplete = (result: ResearchExecutionResult) => {
    setAdvertisers(prev => {
      const existingIds = new Set(prev.map(a => a.advertiserId));
      const filteredNew = result.newAdvertisers.filter(a => !existingIds.has(a.advertiserId));
      return [...filteredNew, ...prev];
    });
    setJobs(prev => [result.job, ...prev]);
    handleNotify(`Research run completed: ${result.newAdvertisers.length} verified leads discovered with public websites.`);
  };

  const handleSelectAdvertiser = (adv: AdvertiserViewModel) => {
    setSelectedAdvertiser(adv);
    setIsDossierOpen(true);
    setResearchTab('advertisers');
  };

  const handleSelectJob = (job: ResearchJobModel) => {
    setResearchTab('advertisers');
    handleNotify(`Opened research job context: ${job.jobId} (${job.query})`);
  };

  const handleSelectAd = (ad: AdViewModel) => {
    setResearchTab('ads');
    handleNotify(`Selected observed ad: ${ad.adLibraryId}`);
  };

  const handleExportHandoff = () => {
    setActiveArea('ENGINEERING');
    handleNotify('Navigated to Engineering Console & System Export Contracts.');
  };

  return (
    <div className="page min-h-screen bg-neutral-50/50 text-neutral-900 flex flex-col font-sans relative w-full max-w-full min-w-0 box-border overflow-x-hidden">
      {/* Production-Grade Global Header with Area Switcher, Command Palette & Cmd+K Search */}
      <GlobalHeader
        activeArea={activeArea}
        setActiveArea={setActiveArea}
        researchTab={researchTab}
        setResearchTab={tab => {
          setResearchTab(tab);
          if (tab !== 'advertisers') {
            setIsDossierOpen(false);
          }
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onExportJson={handleExportHandoff}
      />

      {/* Global Search Modal (/) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAdvertiser={handleSelectAdvertiser}
        onSelectJob={handleSelectJob}
        onSelectAd={handleSelectAd}
      />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={tab => {
          setResearchTab(tab);
          if (tab !== 'advertisers') setIsDossierOpen(false);
        }}
        onSelectAdvertiser={handleSelectAdvertiser}
        onOpenCreateJob={() => {
          setResearchTab('advertisers');
          setIsDossierOpen(false);
          handleNotify('Job Creation initialized with crawler idempotency key.');
        }}
        onOpenExport={() => setResearchTab('exports')}
        onTriggerReverify={() => handleNotify(`TCP/TLS verification probe dispatched for ${selectedAdvertiser.canonicalName}.`)}
        onOpenInvestigation={() => setResearchTab('investigations')}
      />

      {/* Notification Center Drawer */}
      <NotificationCenterDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToEntity={name => {
          const adv = SAMPLE_ADVERTISERS.find(a => a.canonicalName.includes(name)) || SAMPLE_ADVERTISERS[0];
          handleSelectAdvertiser(adv);
        }}
      />

      {/* Evidence Inspector Global Modal */}
      <EvidenceInspectorModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        entityName={selectedAdvertiser.canonicalName}
        onReverify={() => handleNotify(`Dispatched immediate verification probe for ${selectedAdvertiser.canonicalName}`)}
      />

      {/* Operator Notification Banner */}
      {notification && (
        <div className="w-full max-w-full min-w-0 box-border bg-neutral-900 text-white px-4 py-2 text-xs font-mono flex items-center justify-between border-b border-neutral-700 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
            <span className="truncate">[AUDIT-LOG] {notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-neutral-400 hover:text-white text-xs px-2 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Canvas */}
      <main className="content flex-1 flex flex-col w-full max-w-full min-w-0 box-border overflow-x-hidden overflow-y-auto">
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 box-border">
          {/* AREA A: RESEARCH WORKSPACE */}
          {activeArea === 'RESEARCH' && (
            <div className="w-full min-w-0">
              {/* Overview / Dashboard */}
              {researchTab === 'overview' && (
                <ResearchDashboard
                  onNavigateToJobs={() => {
                    setResearchTab('advertisers');
                    setIsDossierOpen(false);
                  }}
                  onSelectAdvertiser={handleSelectAdvertiser}
                  onNavigateToReviews={() => {
                    setResearchTab('reviews');
                  }}
                  onNavigateToExport={() => {
                    setResearchTab('exports');
                  }}
                  onCreateJob={() => {
                    setResearchTab('wizard');
                  }}
                  onOpenWizard={() => {
                    setResearchTab('wizard');
                  }}
                  advertisers={advertisers}
                  jobs={jobs}
                />
              )}

              {/* Phase 26: 1-Click Research Wizard */}
              {researchTab === 'wizard' && (
                <ResearchWizard
                  onRunComplete={handleWizardRunComplete}
                  onNavigateToLeads={() => {
                    setResearchTab('advertisers');
                    setIsDossierOpen(false);
                  }}
                  onNavigateToExport={() => {
                    setResearchTab('exports');
                  }}
                  onSelectAdvertiser={handleSelectAdvertiser}
                />
              )}

              {/* Analytics & Trends (Phase 14) */}
              {researchTab === 'analytics' && (
                <AnalyticsWorkspace />
              )}

              {/* Workflows & DAG (Phase 13) */}
              {researchTab === 'workflows' && (
                <WorkflowWorkspace />
              )}

              {/* Rules, Policy & Configuration Studio (Phase 16) */}
              {researchTab === 'rules-studio' && (
                <ConfigurationStudio />
              )}

              {/* Policy, Safety, Security Invariants & Control Plane (Phase 17) */}
              {researchTab === 'policy-safety' && (
                <PolicySafetyStudio />
              )}

              {/* Secure Multi-Tenant Organization & Team Platform (Phase 18) */}
              {researchTab === 'multi-tenant' && (
                <MultiTenantPlatformStudio />
              )}

              {/* Secure Team Collaboration & Shared Research Platform (Phase 19) */}
              {researchTab === 'collaboration' && (
                <CollaborationPlatformStudio />
              )}

              {/* Advanced Research Search & Discovery Platform (Phase 20) */}
              {researchTab === 'discovery' && (
                <ResearchDiscoveryWorkspace />
              )}

              {/* Evidence, Provenance & Reproducible Research Platform (Phase 21) */}
              {researchTab === 'evidence-provenance' && (
                <EvidenceProvenanceWorkspace />
              )}

              {/* Continuous Monitoring, Change Intelligence & Event-Driven Research (Phase 22) */}
              {researchTab === 'monitoring-intelligence' && (
                <MonitoringIntelligenceWorkspace />
              )}

              {/* Centralized Governance, Audit, Control Verification & Oversight (Phase 23) */}
              {researchTab === 'governance-audit' && (
                <GovernanceAuditWorkspace />
              )}

              {/* Production Operations & Recovery Control Plane (Phase 24) */}
              {researchTab === 'production-operations' && (
                <ProductionOperationsWorkspace />
              )}

              {/* Product Telemetry, Usage Intelligence & Capacity (Phase 25) */}
              {researchTab === 'product-telemetry' && (
                <ProductTelemetryWorkspace />
              )}

              {/* Advertisers & Lead Dossier */}
              {researchTab === 'advertisers' && (
                <div>
                  {isDossierOpen ? (
                    <LeadDossierInspector
                      advertiser={selectedAdvertiser}
                      onBack={() => setIsDossierOpen(false)}
                      onUpdateAdvertiser={updated => {
                        setSelectedAdvertiser(updated);
                        handleNotify(`Dossier manual override committed for ${updated.canonicalName}`);
                      }}
                    />
                  ) : (
                    <ResearchWorkspace
                      onSelectAdvertiser={handleSelectAdvertiser}
                      onCreateJobRequest={() => setResearchTab('wizard')}
                      onOpenWizard={() => setResearchTab('wizard')}
                      advertisers={advertisers}
                      jobs={jobs}
                    />
                  )}
                </div>
              )}

              {/* Investigation Mode #2048 (Phase 12) */}
              {researchTab === 'investigations' && (
                <InvestigationWorkspace
                  onSelectAdvertiser={handleSelectAdvertiser}
                  onOpenExportSnapshot={() => setResearchTab('exports')}
                />
              )}

              {/* Ads & Creatives Intelligence */}
              {researchTab === 'ads' && (
                <AdsWorkspace onSelectAdvertiser={handleSelectAdvertiser} />
              )}

              {/* Business Entity Directory (Phase 12: Business vs Advertiser vs Destination) */}
              {researchTab === 'businesses' && (
                <BusinessEntityWorkspace
                  onSelectAdvertiserId={advId => {
                    const adv = SAMPLE_ADVERTISERS.find(a => a.advertiserId === advId) || SAMPLE_ADVERTISERS[0];
                    handleSelectAdvertiser(adv);
                  }}
                />
              )}

              {/* Advanced Query Studio (Phase 12) */}
              {researchTab === 'search' && (
                <SearchAndQueryWorkspace onSelectAdvertiser={handleSelectAdvertiser} />
              )}

              {/* Watchlists & Saved Sets */}
              {researchTab === 'watchlists' && (
                <WatchlistWorkspace onSelectAdvertiser={handleSelectAdvertiser} />
              )}

              {/* Review Center */}
              {researchTab === 'reviews' && (
                <ReviewQueuesWorkspace />
              )}

              {/* Dedicated Verification Workspace */}
              {researchTab === 'verification' && (
                <VerificationWorkspace onSelectAdvertiser={handleSelectAdvertiser} />
              )}

              {/* Dedicated Qualification Workspace */}
              {researchTab === 'qualification' && (
                <QualificationWorkspace onSelectAdvertiser={handleSelectAdvertiser} />
              )}

              {/* Side-by-Side Comparator (Entity vs Entity & Ad vs Ad) */}
              {researchTab === 'compare' && (
                <CompareWorkspace onSelectAdvertiser={handleSelectAdvertiser} />
              )}

              {/* Anomaly Inbox (Phase 12) */}
              {researchTab === 'anomalies' && (
                <AnomalyInboxWorkspace
                  onInspectEntity={entityId => {
                    const adv = SAMPLE_ADVERTISERS.find(a => a.advertiserId === entityId) || SAMPLE_ADVERTISERS[0];
                    handleSelectAdvertiser(adv);
                  }}
                />
              )}

              {/* Global Activity Feed (Phase 12) */}
              {researchTab === 'activity' && (
                <GlobalActivityWorkspace />
              )}

              {/* Data Quality & Source Health */}
              {researchTab === 'data-quality' && (
                <DataHealthWorkspace />
              )}

              {/* Sanitized Export Pipeline Studio */}
              {researchTab === 'exports' && (
                <ExportPipelineStudio advertisers={advertisers} />
              )}
            </div>
          )}

          {/* AREA B: ENGINEERING & ADMIN WORKSPACE */}
          {activeArea === 'ENGINEERING' && (
            <EngineeringWorkspace onNotify={handleNotify} />
          )}
        </div>
      </main>
    </div>
  );
}
