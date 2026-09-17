import React, { useState } from 'react';
import { SAMPLE_ADVERTISERS } from '../data/phase08FixturesAndAudit';
import { AdvertiserViewModel } from '../types';
import { StatusBadge } from './common/StatusBadge';
import { PageHeader } from './common/PageHeader';
import { ScoreExplainerCard } from './common/ScoreExplainerCard';
import { 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  FileCheck, 
  ArrowRight, 
  Building2, 
  Info, 
  Sparkles,
  ShieldAlert,
  Layers,
  HelpCircle
} from 'lucide-react';

interface QualificationWorkspaceProps {
  onSelectAdvertiser: (adv: AdvertiserViewModel) => void;
}

export const QualificationWorkspace: React.FC<QualificationWorkspaceProps> = ({ onSelectAdvertiser }) => {
  const [advertisers] = useState<AdvertiserViewModel[]>(SAMPLE_ADVERTISERS);
  const [selectedAdvId, setSelectedAdvId] = useState<string>(SAMPLE_ADVERTISERS[0].advertiserId);

  const currentAdv = advertisers.find(a => a.advertiserId === selectedAdvId) || advertisers[0];

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Lead Qualification & Scoring', active: true },
        ]}
        title="Evidence-Driven Lead Qualification"
        description="Explainable qualification results calculated by deterministic rule models evaluating advertising velocity, destination validity, and entity consistency."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            Model: {currentAdv.scoringModelVersion}
          </span>
        }
      />

      {/* Grid: Entity Picker (4 Cols) + Qualification Detail (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Advertiser list */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-neutral-200 shadow-xs p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider pb-2 border-b border-neutral-100 flex items-center justify-between">
              <span>Scored Entities ({advertisers.length})</span>
              <span className="font-mono text-[10px]">Phase 06 Engine</span>
            </div>

            <div className="mt-3 space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {advertisers.map(adv => {
                const isSelected = adv.advertiserId === selectedAdvId;
                return (
                  <div
                    key={adv.advertiserId}
                    onClick={() => setSelectedAdvId(adv.advertiserId)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-neutral-900 truncate">
                        {adv.canonicalName}
                      </span>
                      <StatusBadge status={adv.qualificationState} size="sm" showPrefix={false} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                      <span>Score: <strong>{adv.qualificationScore}</strong></span>
                      <span>Confidence: {adv.scoreConfidence}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-1 truncate">
                      {adv.activeBlockers.length > 0 ? (
                        <span className="text-red-600 font-bold">● {adv.activeBlockers.length} Blocker Triggered</span>
                      ) : (
                        <span>No compliance blockers</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400 font-mono">
            Deterministic rule evaluations &bull; Layer F Registry
          </div>
        </div>

        {/* Right Column: Deep Qualification Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Bar */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-900">
                  {currentAdv.canonicalName}
                </h3>
                <StatusBadge status={currentAdv.qualificationState} />
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-neutral-500 mt-1">
                <span>Domain: {currentAdv.destinationDomain}</span>
                <span>&bull;</span>
                <span>Calculated: {currentAdv.lastCalculatedAt}</span>
              </div>
            </div>

            <button
              onClick={() => onSelectAdvertiser(currentAdv)}
              className="px-3.5 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>Open Lead Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Core ScoreExplainerCard */}
          <ScoreExplainerCard
            score={currentAdv.qualificationScore}
            qualificationState={currentAdv.qualificationState}
            scoreConfidence={currentAdv.scoreConfidence}
            scoringModelVersion={currentAdv.scoringModelVersion}
            lastCalculatedAt={currentAdv.lastCalculatedAt}
            signals={currentAdv.scoreExplanation}
            positiveSignals={currentAdv.positiveSignals}
            negativeEvidence={currentAdv.negativeEvidence}
            missingEvidence={currentAdv.missingEvidence}
            activeBlockers={currentAdv.activeBlockers}
          />
        </div>
      </div>
    </div>
  );
};
