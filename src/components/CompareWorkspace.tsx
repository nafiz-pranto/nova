import React, { useState } from 'react';
import { SAMPLE_ADVERTISERS, SAMPLE_ADS } from '../data/phase08FixturesAndAudit';
import { AdvertiserViewModel, AdViewModel } from '../types';
import { StatusBadge } from './common/StatusBadge';
import { PageHeader } from './common/PageHeader';
import { 
  Columns, 
  ArrowRight, 
  Building2, 
  Globe, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  Copy,
  ExternalLink
} from 'lucide-react';

interface CompareWorkspaceProps {
  onSelectAdvertiser: (adv: AdvertiserViewModel) => void;
}

export const CompareWorkspace: React.FC<CompareWorkspaceProps> = ({ onSelectAdvertiser }) => {
  const [compareMode, setCompareMode] = useState<'ENTITY' | 'AD'>('ENTITY');

  // Entity comparison state
  const [entityAId, setEntityAId] = useState<string>(SAMPLE_ADVERTISERS[0].advertiserId);
  const [entityBId, setEntityBId] = useState<string>(SAMPLE_ADVERTISERS[1].advertiserId);

  // Ad comparison state (Section 31)
  const [adAId, setAdAId] = useState<string>(SAMPLE_ADS[0].adId);
  const [adBId, setAdBId] = useState<string>(SAMPLE_ADS[1] ? SAMPLE_ADS[1].adId : SAMPLE_ADS[0].adId);

  const entityA = SAMPLE_ADVERTISERS.find(a => a.advertiserId === entityAId) || SAMPLE_ADVERTISERS[0];
  const entityB = SAMPLE_ADVERTISERS.find(a => a.advertiserId === entityBId) || SAMPLE_ADVERTISERS[1];

  const adA = SAMPLE_ADS.find(ad => ad.adId === adAId) || SAMPLE_ADS[0];
  const adB = SAMPLE_ADS.find(ad => ad.adId === adBId) || SAMPLE_ADS[1] || SAMPLE_ADS[0];

  const getAdvertiserName = (advertiserId: string) => {
    return SAMPLE_ADVERTISERS.find(a => a.advertiserId === advertiserId)?.canonicalName || advertiserId;
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Side-by-Side Comparison', active: true },
        ]}
        title={compareMode === 'ENTITY' ? 'Factual Entity Comparison' : 'Ad-to-Ad Verbatim Creative Comparison'}
        description={
          compareMode === 'ENTITY'
            ? 'Objective, side-by-side comparison of observed advertising activity, infrastructure health, network verification, and qualification evidence across multiple entities.'
            : 'Granular comparison of verbatim ad copy, CTA, destination URLs, platform distributions, and observation metadata. Factual diffing without subjective quality evaluations.'
        }
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            Factual &bull; Non-Evaluative
          </span>
        }
      />

      {/* Mode Switcher */}
      <div className="bg-white p-1 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-1 w-fit">
        <button
          onClick={() => setCompareMode('ENTITY')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            compareMode === 'ENTITY'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Entity vs. Entity</span>
        </button>

        <button
          onClick={() => setCompareMode('AD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            compareMode === 'AD'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Ad vs. Ad Creative</span>
        </button>
      </div>

      {/* ENTITY COMPARISON MODE */}
      {compareMode === 'ENTITY' && (
        <div className="space-y-6">
          {/* Selector Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                Entity A (Baseline)
              </label>
              <select
                value={entityAId}
                onChange={e => setEntityAId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-900 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {SAMPLE_ADVERTISERS.map(a => (
                  <option key={a.advertiserId} value={a.advertiserId}>
                    {a.canonicalName} ({a.destinationDomain})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                Entity B (Comparison)
              </label>
              <select
                value={entityBId}
                onChange={e => setEntityBId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-900 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {SAMPLE_ADVERTISERS.map(a => (
                  <option key={a.advertiserId} value={a.advertiserId}>
                    {a.canonicalName} ({a.destinationDomain})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entity A Card */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Entity A Dossier
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                    {entityA.canonicalName}
                  </h3>
                  <div className="text-xs font-mono text-neutral-500 mt-0.5">
                    ID: {entityA.advertiserId}
                  </div>
                </div>
                <button
                  onClick={() => onSelectAdvertiser(entityA)}
                  className="px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  Open Dossier
                </button>
              </div>

              {/* Section 1: Qualification & Status */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Qualification &amp; Score
                </div>
                <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-neutral-900">{entityA.qualificationScore}</div>
                    <div className="text-[11px] font-mono text-neutral-500">Confidence: {entityA.scoreConfidence}</div>
                  </div>
                  <StatusBadge status={entityA.qualificationState} />
                </div>
              </div>

              {/* Section 2: Advertising Activity */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Observed Advertising Activity
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50">
                    <div className="text-[10px] text-neutral-400">Active Ads</div>
                    <div className="font-bold text-neutral-900 text-sm mt-0.5">{entityA.activeAdCount}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50">
                    <div className="text-[10px] text-neutral-400">Ad Library ID</div>
                    <div className="font-bold text-neutral-900 text-xs mt-0.5 truncate">{entityA.adLibraryId}</div>
                  </div>
                </div>
              </div>

              {/* Section 3: Verification & Infrastructure */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Destination &amp; Verification
                </div>
                <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Domain:</span>
                    <span className="font-semibold text-neutral-900">{entityA.destinationDomain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">HTTP Status:</span>
                    <span className="font-semibold text-neutral-900">{entityA.verificationStatusCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">TLS Encryption:</span>
                    <span className="font-semibold text-emerald-700 truncate max-w-[180px]">{entityA.tlsVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SSRF Validated:</span>
                    <span className="font-semibold text-emerald-700">{entityA.ssrfValidated ? 'PASS' : 'FAIL'}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Blockers */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Active Compliance Blockers
                </div>
                {entityA.activeBlockers.length === 0 ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No active compliance blockers triggered.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-800 text-xs font-medium border border-red-200 space-y-1">
                    {entityA.activeBlockers.map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Entity B Card */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Entity B Dossier
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                    {entityB.canonicalName}
                  </h3>
                  <div className="text-xs font-mono text-neutral-500 mt-0.5">
                    ID: {entityB.advertiserId}
                  </div>
                </div>
                <button
                  onClick={() => onSelectAdvertiser(entityB)}
                  className="px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  Open Dossier
                </button>
              </div>

              {/* Section 1: Qualification & Status */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Qualification &amp; Score
                </div>
                <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-neutral-900">{entityB.qualificationScore}</div>
                    <div className="text-[11px] font-mono text-neutral-500">Confidence: {entityB.scoreConfidence}</div>
                  </div>
                  <StatusBadge status={entityB.qualificationState} />
                </div>
              </div>

              {/* Section 2: Advertising Activity */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Observed Advertising Activity
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50">
                    <div className="text-[10px] text-neutral-400">Active Ads</div>
                    <div className="font-bold text-neutral-900 text-sm mt-0.5">{entityB.activeAdCount}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50">
                    <div className="text-[10px] text-neutral-400">Ad Library ID</div>
                    <div className="font-bold text-neutral-900 text-xs mt-0.5 truncate">{entityB.adLibraryId}</div>
                  </div>
                </div>
              </div>

              {/* Section 3: Verification & Infrastructure */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Destination &amp; Verification
                </div>
                <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Domain:</span>
                    <span className="font-semibold text-neutral-900">{entityB.destinationDomain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">HTTP Status:</span>
                    <span className="font-semibold text-neutral-900">{entityB.verificationStatusCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">TLS Encryption:</span>
                    <span className="font-semibold text-emerald-700 truncate max-w-[180px]">{entityB.tlsVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SSRF Validated:</span>
                    <span className="font-semibold text-emerald-700">{entityB.ssrfValidated ? 'PASS' : 'FAIL'}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Blockers */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Active Compliance Blockers
                </div>
                {entityB.activeBlockers.length === 0 ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No active compliance blockers triggered.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-800 text-xs font-medium border border-red-200 space-y-1">
                    {entityB.activeBlockers.map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AD-TO-AD COMPARISON MODE (Section 31) */}
      {compareMode === 'AD' && (
        <div className="space-y-6">
          {/* Ad Selector Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                Ad Creative A (Baseline)
              </label>
              <select
                value={adAId}
                onChange={e => setAdAId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-900 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {SAMPLE_ADS.map(a => (
                  <option key={a.adId} value={a.adId}>
                    {getAdvertiserName(a.advertiserId)}: {a.observedText.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                Ad Creative B (Comparison)
              </label>
              <select
                value={adBId}
                onChange={e => setAdBId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-900 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {SAMPLE_ADS.map(a => (
                  <option key={a.adId} value={a.adId}>
                    {getAdvertiserName(a.advertiserId)}: {a.observedText.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ad Diff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ad A Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-4 text-xs">
              <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Creative A &bull; {getAdvertiserName(adA.advertiserId)}
                  </span>
                  <div className="font-mono text-xs font-semibold text-neutral-800 mt-0.5">
                    Meta ID: {adA.adLibraryId}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700">
                  {adA.extractionStatus}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Verbatim Primary Ad Copy
                </span>
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
                  {adA.observedText}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50">
                  <span className="text-[10px] text-neutral-400 block">Call to Action (CTA)</span>
                  <span className="font-bold text-neutral-900 text-xs mt-0.5 block">{adA.ctaText || 'None'}</span>
                </div>
                <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50">
                  <span className="text-[10px] text-neutral-400 block">Observed Platforms</span>
                  <span className="font-mono text-neutral-900 text-xs mt-0.5 block">{adA.platforms.join(', ')}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50">
                <span className="text-[10px] text-neutral-400 block">Destination URL</span>
                <span className="font-mono text-neutral-900 text-xs mt-0.5 block break-all">{adA.destinationUrl || 'None'}</span>
              </div>
            </div>

            {/* Ad B Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-4 text-xs">
              <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Creative B &bull; {getAdvertiserName(adB.advertiserId)}
                  </span>
                  <div className="font-mono text-xs font-semibold text-neutral-800 mt-0.5">
                    Meta ID: {adB.adLibraryId}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700">
                  {adB.extractionStatus}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Verbatim Primary Ad Copy
                </span>
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
                  {adB.observedText}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50">
                  <span className="text-[10px] text-neutral-400 block">Call to Action (CTA)</span>
                  <span className="font-bold text-neutral-900 text-xs mt-0.5 block">{adB.ctaText || 'None'}</span>
                </div>
                <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50">
                  <span className="text-[10px] text-neutral-400 block">Observed Platforms</span>
                  <span className="font-mono text-neutral-900 text-xs mt-0.5 block">{adB.platforms.join(', ')}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-neutral-100 bg-neutral-50">
                <span className="text-[10px] text-neutral-400 block">Destination URL</span>
                <span className="font-mono text-neutral-900 text-xs mt-0.5 block break-all">{adB.destinationUrl || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
