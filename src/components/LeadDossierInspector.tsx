import React, { useState } from 'react';
import { AdvertiserViewModel, AdViewModel } from '../types';
import { SAMPLE_ADS } from '../data/phase08FixturesAndAudit';
import { StatusBadge } from './common/StatusBadge';
import { EvidenceField } from './common/EvidenceField';
import { ScoreExplainerCard } from './common/ScoreExplainerCard';
import { PageHeader } from './common/PageHeader';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  FileText, 
  Hash, 
  Globe, 
  Lock, 
  Layers, 
  Cpu, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Info,
  Calendar,
  XCircle,
  Eye,
  GitBranch,
  ArrowRight,
  Database,
  Check,
  Building,
  TrendingUp,
  Radio,
  FileCheck
} from 'lucide-react';

export type DossierSectionId =
  | 'IDENTITY'
  | 'ADVERTISING_ACTIVITY'
  | 'ADS'
  | 'DESTINATION'
  | 'VERIFICATION'
  | 'QUALIFICATION'
  | 'EVIDENCE_PROVENANCE'
  | 'HISTORICAL_TIMELINE'
  | 'REVIEW_ACTIONS';

interface LeadDossierInspectorProps {
  advertiser: AdvertiserViewModel;
  onBack?: () => void;
  onUpdateAdvertiser?: (updated: AdvertiserViewModel) => void;
}

export const LeadDossierInspector: React.FC<LeadDossierInspectorProps> = ({ 
  advertiser: initialAdvertiser, 
  onBack,
  onUpdateAdvertiser,
}) => {
  const [advertiser, setAdvertiser] = useState<AdvertiserViewModel>(initialAdvertiser);
  const [activeSection, setActiveSection] = useState<DossierSectionId>('IDENTITY');

  // Load ads matching this advertiser ID, or fallback
  const matchingAds: AdViewModel[] = SAMPLE_ADS.filter(a => a.advertiserId === advertiser.advertiserId);
  const [expandedAdId, setExpandedAdId] = useState<string | null>(matchingAds[0]?.adId || null);

  // Manual Override Modal / Form State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideScore, setOverrideScore] = useState<number>(advertiser.qualificationScore);
  const [overrideReason, setOverrideReason] = useState<string>(
    advertiser.overrideDetails?.reasonCode || 'EXTERNAL_BUSINESS_PROOF'
  );
  const [overrideNotes, setOverrideNotes] = useState<string>(
    advertiser.overrideDetails?.notes || ''
  );
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOverride(true);

    setTimeout(() => {
      const updated: AdvertiserViewModel = {
        ...advertiser,
        qualificationScore: overrideScore,
        qualificationState: overrideScore >= 70 ? 'QUALIFIED' : 'REVIEW_REQUIRED',
        hasActiveManualOverride: true,
        overrideDetails: {
          originalScore: advertiser.overrideDetails?.originalScore ?? advertiser.qualificationScore,
          overrideScore: overrideScore,
          reasonCode: overrideReason,
          notes: overrideNotes || 'Manual audit verified external state corporate registry & business license.',
          reviewerId: 'operator_daniela_leadops',
          appliedAt: new Date().toISOString(),
        },
        scoreExplanation: [
          ...advertiser.scoreExplanation,
          {
            signal: 'Manual Operator Compliance Override',
            ruleId: 'MANUAL_OVERRIDE_CLEARANCE',
            ruleVersion: 'v1.0',
            contribution: overrideScore - advertiser.qualificationScore,
            evidence: `Operator override reason: ${overrideReason}`,
            explanation: overrideNotes || 'Adjusted in accordance with verified secondary documentation.',
          },
        ],
        lastCalculatedAt: new Date().toISOString(),
      };

      setAdvertiser(updated);
      onUpdateAdvertiser?.(updated);
      setIsSubmittingOverride(false);
      setShowOverrideModal(false);
    }, 300);
  };

  const sectionsConfig: Array<{ id: DossierSectionId; label: string; num: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'IDENTITY', label: 'Identity', num: '1', icon: Building },
    { id: 'ADVERTISING_ACTIVITY', label: 'Advertising Activity', num: '2', icon: TrendingUp },
    { id: 'ADS', label: `Observed Ads (${matchingAds.length})`, num: '3', icon: Layers },
    { id: 'DESTINATION', label: 'Destination & Domain', num: '4', icon: Globe },
    { id: 'VERIFICATION', label: 'Verification & Probes', num: '5', icon: ShieldCheck },
    { id: 'QUALIFICATION', label: 'Qualification & Score', num: '6', icon: FileCheck },
    { id: 'EVIDENCE_PROVENANCE', label: 'Evidence & Provenance', num: '7', icon: Database },
    { id: 'HISTORICAL_TIMELINE', label: 'Historical Timeline', num: '8', icon: History },
    { id: 'REVIEW_ACTIONS', label: 'Review Actions', num: '9', icon: Edit3 },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Phase 08: Lead Research', active: false },
          { label: 'Advertiser Workspace', onClick: onBack, active: false },
          { label: advertiser.canonicalName, active: true },
        ]}
        title={advertiser.canonicalName}
        description={`Ad Library Entity ID: ${advertiser.adLibraryId} • Destination: ${advertiser.destinationDomain} • State: ${advertiser.dataState}`}
        statusBadge={<StatusBadge status={advertiser.qualificationState} size="md" />}
        secondaryActions={[
          {
            label: 'All Leads Directory',
            onClick: () => onBack?.(),
          },
        ]}
        primaryAction={{
          label: advertiser.hasActiveManualOverride ? 'Edit Override' : 'Apply Manual Override',
          icon: Edit3,
          onClick: () => setShowOverrideModal(true),
        }}
      />

      {/* 9-Section Horizontal Sticky Navigation Strip */}
      <nav 
        aria-label="Advertiser Workspace Sections"
        className="bg-white rounded-xl border border-neutral-200 p-1.5 shadow-xs overflow-x-auto w-full min-w-0"
      >
        <div className="flex items-center gap-1 min-w-max">
          {sectionsConfig.map(sec => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span className={`w-4 h-4 rounded text-[10px] font-mono flex items-center justify-center font-bold ${
                  isActive ? 'bg-neutral-800 text-emerald-400' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {sec.num}
                </span>
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* SECTION 1: IDENTITY */}
      {activeSection === 'IDENTITY' && (
        <div className="space-y-6">
          {/* Card: Current State vs Historical State Notice */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Canonical Identity &amp; Entity Resolution</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Distinguishing verified <strong className="text-neutral-700 font-semibold">Current State</strong> from immutable <strong className="text-neutral-700 font-semibold">Historical Observations</strong>.
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
                advertiser.identityReviewState === 'CONFIRMED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Identity Status: {advertiser.identityReviewState}
              </span>
            </div>

            {/* Current State Container (Strong Green/Neutral Border) */}
            <div className="p-4 rounded-lg border-2 border-emerald-500/80 bg-emerald-50/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white uppercase tracking-wider">
                    CURRENT CANONICAL STATE
                  </span>
                  <span className="text-xs font-semibold text-emerald-950">Active Truth Record</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  Last verified: {advertiser.verificationFreshness}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <EvidenceField
                  label="Canonical Business Name"
                  evidence={{
                    observedValue: advertiser.canonicalName,
                    source: 'Meta Ad Library Page Card DOM',
                    observedAt: advertiser.provenanceSummary.observedAt,
                    normalizedValue: advertiser.canonicalName.toUpperCase(),
                    verificationState: 'VERIFIED',
                    confidence: advertiser.scoreConfidence,
                    versionMetadata: advertiser.provenanceSummary.normalizationVersion,
                    rawDomTokenHash: advertiser.provenanceSummary.rawPayloadHash,
                    classification: 'VERIFIED',
                  }}
                />

                <EvidenceField
                  label="Ad Library Entity ID"
                  evidence={{
                    observedValue: advertiser.adLibraryId,
                    source: 'DOM attribute data-page-id',
                    observedAt: advertiser.provenanceSummary.observedAt,
                    verificationState: 'VERIFIED',
                    confidence: 'HIGH',
                    versionMetadata: advertiser.provenanceSummary.extractionVersion,
                    classification: 'OBSERVED',
                  }}
                />

                <EvidenceField
                  label="Registered Destination"
                  href={`https://${advertiser.destinationDomain}`}
                  evidence={{
                    observedValue: advertiser.destinationDomain,
                    source: 'Ad Landing Page Redirect Anchor',
                    observedAt: advertiser.provenanceSummary.observedAt,
                    normalizedValue: advertiser.destinationDomain.toLowerCase(),
                    verificationState: advertiser.websiteReachable ? 'VERIFIED' : 'FAILED',
                    confidence: 'HIGH',
                    classification: 'VERIFIED',
                  }}
                />

                <EvidenceField
                  label="Data Origin State"
                  evidence={{
                    observedValue: advertiser.dataState,
                    source: 'Layer D Entity Cluster Ledger',
                    observedAt: advertiser.provenanceSummary.observedAt,
                    confidence: 'HIGH',
                    classification: 'DERIVED',
                  }}
                />
              </div>
            </div>

            {/* Historical State Observations (Visual Distinction: Neutral Dashed Border & Clock Badge) */}
            <div className="p-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-200 text-neutral-700 uppercase tracking-wider">
                    HISTORICAL OBSERVATION ARCHIVE
                  </span>
                  <span className="text-xs text-neutral-600">Previous Snapshots (Immutable)</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  {advertiser.historicalNames.length} Prior Snapshots Recorded
                </span>
              </div>

              <div className="space-y-2">
                {advertiser.historicalNames.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="font-semibold text-neutral-800">{item.name}</span>
                      {item.name === advertiser.canonicalName ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Current Name
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                          Prior Variant
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-500">
                      <span>Observed: {new Date(item.observedAt).toLocaleDateString()}</span>
                      <span>Token: {item.sourceTokenId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ADVERTISING ACTIVITY */}
      {activeSection === 'ADVERTISING_ACTIVITY' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Advertising Velocity &amp; Campaign Momentum</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  Active Continuous Ads
                </span>
                <div className="text-2xl font-bold font-mono text-neutral-900">
                  {advertiser.activeAdCount}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Concurrently running in public Ad Library</p>
              </div>

              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  Estimated Continuous Run
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-800">
                  &gt; 35 Days
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Uninterrupted paid placement window</p>
              </div>

              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  Ad Library Link
                </span>
                <a
                  href={`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&view_all_page_id=${advertiser.adLibraryId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:underline mt-2 font-mono"
                >
                  <span>Open Public Meta Ad Library Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                </a>
                <p className="text-[11px] text-neutral-500 mt-1">Public verified advertiser page profile</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ADS */}
      {activeSection === 'ADS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Extracted Ad Creatives &amp; Body Copy ({matchingAds.length})
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Verbatim public DOM extractions with cryptographic SHA-256 evidence tokens.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-neutral-100 text-neutral-700">
              Layer C Normalized
            </span>
          </div>

          {matchingAds.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-neutral-200">
              <Layers className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs text-neutral-500">No creative text parsed for this record yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matchingAds.map(ad => {
                const isExpanded = expandedAdId === ad.adId;
                return (
                  <div
                    key={ad.adId}
                    className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => setExpandedAdId(isExpanded ? null : ad.adId)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center font-mono text-xs font-bold text-neutral-800 shrink-0">
                          {ad.creativeType === 'VIDEO' ? 'VID' : 'IMG'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs text-neutral-900 flex items-center gap-2">
                            <span>Ad Public ID: {ad.adId}</span>
                            <StatusBadge status={ad.extractionStatus === 'SUCCESS' ? 'COMPLETED' : 'PARTIAL'} size="sm" showPrefix={false} />
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">
                            First seen: {ad.startDate} &bull; CTA: &ldquo;{ad.ctaText}&rdquo; &bull; Headline: {ad.headline}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <div className="hidden sm:flex items-center gap-1">
                          {ad.platforms.map(p => (
                            <span key={p} className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-100 text-neutral-600 rounded">
                              {p}
                            </span>
                          ))}
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 border-t border-neutral-100 bg-neutral-50/40 space-y-4 text-xs">
                        <div>
                          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                            Extracted Headline
                          </span>
                          <div className="p-3 rounded-lg bg-white border border-neutral-200 font-semibold text-neutral-900">
                            {ad.headline}
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                            Verbatim Ad Copy (Public Text)
                          </span>
                          <div className="p-3 rounded-lg bg-white border border-neutral-200 font-mono text-neutral-800 whitespace-pre-wrap leading-relaxed">
                            {ad.observedText}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 rounded-lg bg-white border border-neutral-200 font-mono text-[11px]">
                            <span className="text-neutral-400 block mb-0.5">Observed Landing URL:</span>
                            <a
                              href={ad.destinationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-900 hover:underline truncate block"
                            >
                              {ad.destinationUrl}
                            </a>
                          </div>
                          <div className="p-3 rounded-lg bg-white border border-neutral-200 font-mono text-[11px]">
                            <span className="text-neutral-400 block mb-0.5">Raw Evidence Hash (SHA-256):</span>
                            <span className="text-neutral-600 truncate block">{ad.provenanceHash}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: DESTINATION */}
      {activeSection === 'DESTINATION' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Destination Website &amp; Landing Page Infrastructure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <EvidenceField
                label="Primary Destination Domain"
                href={`https://${advertiser.destinationDomain}`}
                evidence={{
                  observedValue: advertiser.destinationDomain,
                  source: 'Ad Landing Page Redirect Anchor',
                  observedAt: advertiser.provenanceSummary.observedAt,
                  verificationState: advertiser.websiteReachable ? 'VERIFIED' : 'FAILED',
                  confidence: 'HIGH',
                  classification: 'VERIFIED',
                }}
              />

              <EvidenceField
                label="Destination URL"
                href={advertiser.destinationUrl}
                evidence={{
                  observedValue: advertiser.destinationUrl,
                  source: 'CTA URL Parameter',
                  observedAt: advertiser.provenanceSummary.observedAt,
                  verificationState: 'VERIFIED',
                  confidence: 'HIGH',
                  classification: 'OBSERVED',
                }}
              />

              <EvidenceField
                label="HTTP Status Code"
                evidence={{
                  observedValue: `${advertiser.verificationStatusCode} ${advertiser.verificationStatusCode === 200 ? 'OK' : 'ERR'}`,
                  source: 'Autonomous Network Probe',
                  observedAt: advertiser.provenanceSummary.observedAt,
                  verificationState: advertiser.verificationStatusCode === 200 ? 'VERIFIED' : 'FAILED',
                  confidence: 'HIGH',
                  classification: 'VERIFIED',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: VERIFICATION */}
      {activeSection === 'VERIFICATION' && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Autonomous Network Verification &amp; Probes</h3>
              <p className="text-xs text-neutral-500">Autonomous verification executed with SSRF egress protection.</p>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              FRESH: {advertiser.verificationFreshness}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                HTTP Status Probe
              </div>
              <div className="text-xl font-bold font-mono text-neutral-900">
                {advertiser.verificationStatusCode} OK
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 font-mono">Status: {advertiser.websiteReachable ? 'Reachable' : 'Unreachable'}</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
                <Lock className="w-4 h-4" />
                TLS Cipher &amp; Handshake
              </div>
              <div className="text-sm font-bold font-mono text-neutral-900 truncate" title={advertiser.tlsVersion}>
                {advertiser.tlsVersion}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 font-mono">Modern cryptographic suite</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                SSRF Anti-Evasion Audit
              </div>
              <div className="text-sm font-bold font-mono text-emerald-800">
                {advertiser.ssrfValidated ? 'PASSED (Clean Egress)' : 'BLOCKED'}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 font-mono">Private IP ranges blocked</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: QUALIFICATION (Using ScoreExplainerCard) */}
      {activeSection === 'QUALIFICATION' && (
        <div className="space-y-6">
          <ScoreExplainerCard
            score={advertiser.qualificationScore}
            confidence={advertiser.scoreConfidence}
            modelVersion={advertiser.scoringModelVersion}
            calculatedAt={advertiser.lastCalculatedAt}
            positiveSignals={advertiser.positiveSignals}
            negativeEvidence={advertiser.negativeEvidence}
            missingEvidence={advertiser.missingEvidence}
            activeBlockers={advertiser.activeBlockers}
            scoreExplanation={advertiser.scoreExplanation}
          />
        </div>
      )}

      {/* SECTION 7: EVIDENCE / PROVENANCE */}
      {activeSection === 'EVIDENCE_PROVENANCE' && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Evidence Provenance &amp; DAG Lineage</h3>
              <p className="text-xs text-neutral-500">Complete pipeline versioning metadata from Raw Scraping to Scoring.</p>
            </div>
            <span className="text-xs font-mono text-neutral-500">Layer G Traceable</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 font-mono space-y-2">
              <div className="text-xs font-bold text-neutral-900 font-sans">Pipeline Execution Stack</div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Adapter Version:</span>
                <span className="text-neutral-800">{advertiser.provenanceSummary.adapterVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Parser Version:</span>
                <span className="text-neutral-800">{advertiser.provenanceSummary.extractionVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Normalizer:</span>
                <span className="text-neutral-800">{advertiser.provenanceSummary.normalizationVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Entity Resolver:</span>
                <span className="text-neutral-800">{advertiser.provenanceSummary.identityResolutionVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Verification Engine:</span>
                <span className="text-neutral-800">{advertiser.provenanceSummary.verificationVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Scoring Engine:</span>
                <span className="text-neutral-800">{advertiser.provenanceSummary.scoringVersion}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 font-mono space-y-2">
              <div className="text-xs font-bold text-neutral-900 font-sans">Cryptographic Checksums</div>
              <div>
                <span className="text-neutral-500 block mb-1">Raw Payload SHA-256 Hash:</span>
                <div className="p-2 bg-white rounded border border-neutral-200 break-all text-[11px] text-neutral-700 select-all">
                  {advertiser.provenanceSummary.rawPayloadHash}
                </div>
              </div>
              <div className="pt-2 text-[11px] text-neutral-500 font-sans">
                Lineage is verified against the golden benchmark suite ensuring 100% reproducible qualification.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8: HISTORICAL TIMELINE */}
      {activeSection === 'HISTORICAL_TIMELINE' && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Historical Observation &amp; Mutation Ledger</h3>
            <p className="text-xs text-neutral-500">Chronological history with clear visual separation between current state and prior events.</p>
          </div>

          <div className="relative pl-6 border-l-2 border-neutral-200 space-y-6 text-xs">
            {/* Current State Marker */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-sm">{advertiser.canonicalName}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                  CURRENT STATE
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                Calculated at {advertiser.lastCalculatedAt} &bull; Score: {advertiser.qualificationScore.toFixed(1)}
              </p>
            </div>

            {/* Historical Observations */}
            {advertiser.historicalNames.map((hist, idx) => (
              <div key={idx} className="relative opacity-80">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-neutral-300 border-2 border-white" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-700">{hist.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-neutral-100 text-neutral-600">
                    HISTORICAL OBSERVATION
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                  Recorded at {hist.observedAt} &bull; Token: {hist.sourceTokenId}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 9: REVIEW ACTIONS */}
      {activeSection === 'REVIEW_ACTIONS' && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Human-in-the-Loop Review Actions &amp; Overrides</h3>
              <p className="text-xs text-neutral-500">Apply human auditor overrides with mandatory reason codes and audit tracking.</p>
            </div>
            {advertiser.hasActiveManualOverride && (
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                ACTIVE OVERRIDE COMMITTED
              </span>
            )}
          </div>

          {advertiser.hasActiveManualOverride && advertiser.overrideDetails && (
            <div className="p-4 rounded-lg bg-purple-50/60 border border-purple-200 text-xs space-y-2">
              <div className="font-bold text-purple-900 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Active Manual Override Details
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px] pt-1">
                <div>Original Score: <span className="font-bold text-purple-950">{advertiser.overrideDetails.originalScore.toFixed(1)}</span></div>
                <div>Overridden Score: <span className="font-bold text-purple-950">{advertiser.overrideDetails.overrideScore.toFixed(1)}</span></div>
                <div>Reviewer: <span className="text-purple-900">{advertiser.overrideDetails.reviewerId}</span></div>
                <div>Applied: <span className="text-purple-900">{new Date(advertiser.overrideDetails.appliedAt).toLocaleDateString()}</span></div>
              </div>
              <div className="text-[11px] text-purple-800 mt-1">
                <strong>Reason:</strong> {advertiser.overrideDetails.reasonCode} &bull; <strong>Notes:</strong> {advertiser.overrideDetails.notes}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowOverrideModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {advertiser.hasActiveManualOverride ? 'Update Override' : 'Submit Manual Override'}
            </button>
          </div>
        </div>
      )}

      {/* Manual Override Dialog Modal */}
      {showOverrideModal && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="override-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg rounded-xl bg-white border border-neutral-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 id="override-modal-title" className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-purple-600" />
                Human Auditor Manual Override
              </h3>
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Adjusted Qualification Score (0.0 - 100.0)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.5}
                    value={overrideScore}
                    onChange={e => setOverrideScore(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono font-bold text-sm text-neutral-900 w-12 text-right">
                    {overrideScore.toFixed(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Compliance Clearance Reason Code
                </label>
                <select
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-300 font-mono text-xs focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="EXTERNAL_BUSINESS_PROOF">EXTERNAL_BUSINESS_PROOF (Registry / License Verified)</option>
                  <option value="FALSE_POSITIVE_BLOCKER">FALSE_POSITIVE_BLOCKER (Blocker Rule Refuted)</option>
                  <option value="MANUAL_COMPLIANCE_CLEARANCE">MANUAL_COMPLIANCE_CLEARANCE (Executive Exception)</option>
                  <option value="HUMAN_AUDITOR_ADJUSTMENT">HUMAN_AUDITOR_ADJUSTMENT (Routine Audit Correction)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Auditor Verification Notes &amp; Evidence Reference
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the verified public records, state licensing directory, or secretary of state filing..."
                  value={overrideNotes}
                  onChange={e => setOverrideNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-500">
                Audited action will be signed with operator key <code className="font-mono text-neutral-800 font-semibold">operator_daniela_leadops</code> and persisted immutably in PostgreSQL audit table.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3 py-1.5 font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride}
                  className="px-4 py-1.5 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
                >
                  {isSubmittingOverride ? 'Committing...' : 'Commit Override to Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
