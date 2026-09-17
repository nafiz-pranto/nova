import React, { useState, useMemo } from 'react';
import { PHASE_04_SCENARIOS } from '../data/phase04SpecAndAudit';
import {
  runIdentityResolution,
  generateScenarioEnvelopes
} from '../utils/entityResolutionEngine';
import {
  CanonicalAdEnvelope,
  BusinessEntityCluster,
  AdvertiserEntityRecord,
  AdEntityRecord,
  EntityTier
} from '../types';
import {
  Layers,
  GitMerge,
  Building2,
  Users,
  Eye,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Play
} from 'lucide-react';

export const EntityResolutionSimulator: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(PHASE_04_SCENARIOS[0].id);
  const [activeTier, setActiveTier] = useState<EntityTier>('BUSINESS_ENTITY');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'FLAGGED_CONFLICT'>('ALL');

  const currentScenario =
    PHASE_04_SCENARIOS.find((s) => s.id === selectedScenarioId) || PHASE_04_SCENARIOS[0];

  // Ingest synthetic Phase 03 envelopes for this scenario
  const envelopes = useMemo(() => {
    return generateScenarioEnvelopes(currentScenario);
  }, [currentScenario]);

  // Run deterministic resolution
  const graph = useMemo(() => {
    return runIdentityResolution(envelopes);
  }, [envelopes]);

  // Filter business entities if active
  const filteredBizEntities = useMemo(() => {
    if (statusFilter === 'ALL') return graph.businessEntities;
    return graph.businessEntities.filter((b) => b.status === statusFilter);
  }, [graph.businessEntities, statusFilter]);

  // Selected item detail
  const selectedBiz = graph.businessEntities.find((b) => b.clusterId === selectedEntityId);
  const selectedAdv = graph.advertiserEntities.find((a) => a.advertiserId === selectedEntityId);
  const selectedAd = graph.adEntities.find((ad) => ad.adEntityId === selectedEntityId);
  const selectedObs = graph.observations.find((o) => o.observationId === selectedEntityId);

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50 overflow-hidden">
      {/* Top Controls & Scenario Selector */}
      <div className="bg-white border-b border-neutral-200 p-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-100 text-emerald-700">
                <GitMerge className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-neutral-900 font-mono">
                Deterministic Identity Resolution Engine
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-200 font-medium">
                Phase 04 DAG Simulator
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
              Consumes Phase 03 Canonical Ad Envelopes, groups into unique Ad & Advertiser entities, scores candidate pairs with deterministic weights, and clusters into Business Entities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-neutral-600 font-mono">Scenario:</label>
            <select
              value={selectedScenarioId}
              onChange={(e) => {
                setSelectedScenarioId(e.target.value);
                setSelectedEntityId(null);
              }}
              className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-medium text-neutral-800 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {PHASE_04_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.id}: {sc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="bg-white border-b border-neutral-200 px-6 py-2.5 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Tier 1 Obs</span>
            <div className="text-base font-bold text-neutral-900 font-mono">
              {graph.metrics.totalObservations}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Tier 2 Ads</span>
            <div className="text-base font-bold text-neutral-900 font-mono">
              {graph.metrics.distinctAds}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Tier 3 Advertisers</span>
            <div className="text-base font-bold text-neutral-900 font-mono">
              {graph.metrics.distinctAdvertisers}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Tier 4 Entities</span>
            <div className="text-base font-bold text-emerald-700 font-mono">
              {graph.metrics.distinctBusinessEntities}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Dedup Ratio</span>
            <div className="text-base font-bold text-neutral-900 font-mono">
              {graph.metrics.deduplicationRatio}x
            </div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Auto Merges</span>
            <div className="text-base font-bold text-emerald-600 font-mono">
              {graph.metrics.autoConfirmedMerges}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Provisional</span>
            <div className="text-base font-bold text-amber-600 font-mono">
              {graph.metrics.provisionalReviews}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Quarantine</span>
            <div className="text-base font-bold text-rose-600 font-mono">
              {graph.metrics.conflictsQuarantined}
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Entity Tier Selector and List */}
        <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col border-r border-neutral-200 bg-white overflow-hidden">
          {/* Tier Tabs */}
          <div className="p-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setActiveTier('BUSINESS_ENTITY');
                  setSelectedEntityId(null);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                  activeTier === 'BUSINESS_ENTITY'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Tier 4: Business Clusters ({graph.businessEntities.length})</span>
              </button>
              <button
                onClick={() => {
                  setActiveTier('ADVERTISER_ENTITY');
                  setSelectedEntityId(null);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                  activeTier === 'ADVERTISER_ENTITY'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Tier 3: Advertisers ({graph.advertiserEntities.length})</span>
              </button>
              <button
                onClick={() => {
                  setActiveTier('AD_ENTITY');
                  setSelectedEntityId(null);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                  activeTier === 'AD_ENTITY'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tier 2: Ads ({graph.adEntities.length})</span>
              </button>
              <button
                onClick={() => {
                  setActiveTier('OBSERVATION');
                  setSelectedEntityId(null);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                  activeTier === 'OBSERVATION'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Tier 1: Obs ({graph.observations.length})</span>
              </button>
            </div>

            {activeTier === 'BUSINESS_ENTITY' && (
              <div className="flex items-center gap-1 text-xs">
                <Filter className="w-3 h-3 text-neutral-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white border border-neutral-300 rounded px-2 py-1 text-[11px] font-mono"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="FLAGGED_CONFLICT">Conflicts Only</option>
                </select>
              </div>
            )}
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* TIER 4: BUSINESS ENTITIES */}
            {activeTier === 'BUSINESS_ENTITY' && (
              <>
                {filteredBizEntities.map((biz) => {
                  const isSelected = biz.clusterId === selectedEntityId;
                  return (
                    <div
                      key={biz.clusterId}
                      onClick={() => setSelectedEntityId(biz.clusterId)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-sm font-mono">
                              {biz.canonicalName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                biz.status === 'FLAGGED_CONFLICT'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {biz.status}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500 font-mono flex items-center gap-2">
                            <span>Cluster: {biz.clusterId}</span>
                            <span>•</span>
                            <span>Domain: {biz.primaryDomain || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-xs font-mono font-medium">
                            {biz.advertiserIds.length} Page{biz.advertiserIds.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Brand Aliases & Stats */}
                      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-neutral-600">
                          <span className="text-neutral-400">Aliases:</span>
                          <span className="font-medium text-neutral-800">
                            {biz.brandAliases.join(' • ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-500">
                          <span>{biz.adLibraryIds.length} Ads</span>
                          <span>{biz.observationCount} Observations</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* TIER 3: ADVERTISERS */}
            {activeTier === 'ADVERTISER_ENTITY' && (
              <>
                {graph.advertiserEntities.map((adv) => {
                  const isSelected = adv.advertiserId === selectedEntityId;
                  return (
                    <div
                      key={adv.advertiserId}
                      onClick={() => setSelectedEntityId(adv.advertiserId)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-neutral-900 text-sm">
                            {adv.canonicalPageName}
                          </div>
                          <div className="text-xs text-neutral-500 font-mono mt-0.5">
                            ID: {adv.advertiserId}
                          </div>
                          {adv.pageProfileUrl && (
                            <a
                              href={adv.pageProfileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 mt-1 font-mono"
                            >
                              <span>{adv.pageProfileUrl}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-mono font-medium border border-emerald-200">
                            {adv.adCount} Ad{adv.adCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                        <div className="font-mono text-[11px]">
                          Root Domain: {adv.associatedDomains[0] || 'N/A'}
                        </div>
                        <div className="font-mono text-[11px] text-neutral-500">
                          Biz Cluster: {adv.businessEntityId || 'Unlinked'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* TIER 2: AD ENTITIES */}
            {activeTier === 'AD_ENTITY' && (
              <>
                {graph.adEntities.map((ad) => {
                  const isSelected = ad.adEntityId === selectedEntityId;
                  return (
                    <div
                      key={ad.adEntityId}
                      onClick={() => setSelectedEntityId(ad.adEntityId)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-neutral-900 text-sm">
                              Ad Library ID: {ad.adLibraryId}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              {ad.status}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-600 mt-1 font-medium">
                            Sponsor: {ad.pageName}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-xs font-mono">
                            {ad.observationCount} Obs
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-neutral-500 text-[11px]">
                        <div>Destination: {ad.cleanDestinationDomain || 'N/A'}</div>
                        <div>CTA: {ad.ctaNormalizedCategory}</div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* TIER 1: OBSERVATIONS */}
            {activeTier === 'OBSERVATION' && (
              <>
                {graph.observations.map((obs) => {
                  const isSelected = obs.observationId === selectedEntityId;
                  return (
                    <div
                      key={obs.observationId}
                      onClick={() => setSelectedEntityId(obs.observationId)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-mono font-bold text-neutral-900 text-xs">
                            {obs.observationId}
                          </div>
                          <div className="text-xs text-neutral-600 mt-1">
                            Ad Library ID: <span className="font-mono">{obs.adLibraryId}</span>
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            Captured: {new Date(obs.emittedAt).toLocaleString()}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[11px] font-mono">
                          Confidence: {obs.compositeConfidence}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-mono text-neutral-500 truncate">
                        Snapshot SHA-256: {obs.rawSnapshotSha256}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Right: Selected Entity Inspector / Lineage */}
        <div className="hidden md:flex flex-1 flex-col bg-neutral-50 overflow-y-auto p-6">
          {selectedBiz && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div className="border-b border-neutral-200 pb-4">
                <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold tracking-wider">
                  Tier 4 Business Entity Cluster
                </span>
                <h3 className="text-xl font-bold text-neutral-900 font-mono mt-1">
                  {selectedBiz.canonicalName}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                    ID: {selectedBiz.clusterId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                      selectedBiz.status === 'FLAGGED_CONFLICT'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {selectedBiz.status}
                  </span>
                </div>
              </div>

              {/* Brand Aliases */}
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 font-bold">
                  Brand Aliases & Facebook Page Names:
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedBiz.brandAliases.map((alias, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs font-medium border border-neutral-200"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>

              {/* Domain & Contact Nexus */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold">
                    Primary Domain
                  </span>
                  <div className="text-xs font-mono font-semibold text-neutral-900">
                    {selectedBiz.primaryDomain || 'None'}
                  </div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold">
                    Associated Domains
                  </span>
                  <div className="text-xs font-mono text-neutral-700 truncate">
                    {selectedBiz.associatedDomains.join(', ') || 'None'}
                  </div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold">
                    Contact Phones
                  </span>
                  <div className="text-xs font-mono text-neutral-700">
                    {selectedBiz.associatedPhones.join(', ') || 'None extracted'}
                  </div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold">
                    Contact Emails
                  </span>
                  <div className="text-xs font-mono text-neutral-700">
                    {selectedBiz.associatedEmails.join(', ') || 'None extracted'}
                  </div>
                </div>
              </div>

              {/* Member Advertisers */}
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 font-bold">
                  Underlying Advertisers Linked ({selectedBiz.advertiserIds.length}):
                </label>
                <div className="mt-2 space-y-2">
                  {selectedBiz.advertiserIds.map((advId) => {
                    const adv = graph.advertiserEntities.find((a) => a.advertiserId === advId);
                    return (
                      <div
                        key={advId}
                        className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-neutral-900">
                            {adv?.canonicalPageName || advId}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-500">ID: {advId}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white border border-neutral-200 font-mono text-[11px]">
                          {adv?.adCount} ads
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {selectedAdv && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold">
                Tier 3 Advertiser Entity
              </span>
              <h3 className="text-xl font-bold text-neutral-900 font-mono">
                {selectedAdv.canonicalPageName}
              </h3>
              <p className="text-xs font-mono text-neutral-500">ID: {selectedAdv.advertiserId}</p>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1 text-xs font-mono">
                <div>Normalized Name Key: {selectedAdv.normalizedNameKey}</div>
                <div>Parent Business Cluster: {selectedAdv.businessEntityId || 'Unlinked'}</div>
                <div>Total Ads Managed: {selectedAdv.adCount}</div>
              </div>
            </div>
          )}

          {selectedAd && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold">
                Tier 2 Ad Entity
              </span>
              <h3 className="text-lg font-bold text-neutral-900 font-mono">
                Library ID: {selectedAd.adLibraryId}
              </h3>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1 text-xs font-mono">
                <div>Page Sponsor: {selectedAd.pageName}</div>
                <div>Status: {selectedAd.status}</div>
                <div>Destination Domain: {selectedAd.cleanDestinationDomain || 'N/A'}</div>
                <div>CTA: {selectedAd.ctaNormalizedCategory}</div>
                <div>Observations Linked: {selectedAd.observationCount}</div>
                <div>Snapshot Hash: {selectedAd.snapshotSha256}</div>
              </div>
            </div>
          )}

          {selectedObs && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold">
                Tier 1 Raw Observation (Immutable)
              </span>
              <h3 className="text-base font-bold text-neutral-900 font-mono">
                {selectedObs.observationId}
              </h3>
              <div className="p-3 bg-neutral-950 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-96">
                <pre>{JSON.stringify(selectedObs, null, 2)}</pre>
              </div>
            </div>
          )}

          {!selectedEntityId && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
              <Building2 className="w-12 h-12 stroke-1 text-neutral-300 mb-3" />
              <div className="text-sm font-medium text-neutral-700">Select an Entity to Inspect</div>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Click any item in the 4-tier list to review its cluster lineage, contact nexus, contributing signals, and deduplication audit pointers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
