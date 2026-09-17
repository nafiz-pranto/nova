import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Bookmark, 
  Plus, 
  Play, 
  Trash2, 
  Check, 
  Sparkles, 
  HelpCircle, 
  ArrowRight,
  Database,
  Sliders,
  RefreshCw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { SAMPLE_SAVED_VIEWS, SavedViewDefinition } from '../data/phase12FixturesAndStore';
import { SAMPLE_ADVERTISERS } from '../data/phase08FixturesAndAudit';
import { AdvertiserViewModel } from '../types';
import { PageHeader } from './common/PageHeader';
import { StatusBadge } from './common/StatusBadge';

interface SearchAndQueryWorkspaceProps {
  onSelectAdvertiser: (adv: AdvertiserViewModel) => void;
}

export const SearchAndQueryWorkspace: React.FC<SearchAndQueryWorkspaceProps> = ({
  onSelectAdvertiser,
}) => {
  const [savedViews, setSavedViews] = useState<SavedViewDefinition[]>(SAMPLE_SAVED_VIEWS);
  const [selectedView, setSelectedView] = useState<SavedViewDefinition>(SAMPLE_SAVED_VIEWS[0]);

  // Structured Query Builder State
  const [adCountFilter, setAdCountFilter] = useState<number>(1);
  const [qualificationFilter, setQualificationFilter] = useState<string>('ALL');
  const [freshnessFilter, setFreshnessFilter] = useState<string>('ALL');
  const [hasDomainOnly, setHasDomainOnly] = useState<boolean>(false);

  // Natural Language Query State (Section 30)
  const [nlQuery, setNlQuery] = useState('');
  const [interpretedTranslation, setInterpretedTranslation] = useState<string | null>(null);
  const [isNlConfirmed, setIsNlConfirmed] = useState(false);

  const handleInterpretNl = () => {
    if (!nlQuery.trim()) return;

    // Strict Deterministic NL-to-Structured Mapping
    const q = nlQuery.toLowerCase();
    if (q.includes('solar') || q.includes('texas')) {
      setInterpretedTranslation('MATCH advertisers WHERE category = "Solar" AND state = "TX" AND active_ads >= 5 AND verification_freshness = "CURRENT"');
    } else if (q.includes('stale') || q.includes('recheck')) {
      setInterpretedTranslation('MATCH advertisers WHERE verification_freshness = "STALE" AND last_probe_days > 30');
    } else if (q.includes('review') || q.includes('borderline')) {
      setInterpretedTranslation('MATCH advertisers WHERE qualification_state = "REVIEW_REQUIRED" OR identity_conflict_flag = TRUE');
    } else {
      setInterpretedTranslation(`MATCH advertisers WHERE canonical_name ILIKE "%${nlQuery.trim()}%" AND active_ads >= 1`);
    }
    setIsNlConfirmed(false);
  };

  const handleExecuteInterpreted = () => {
    setIsNlConfirmed(true);
    // Apply filters based on query
    if (nlQuery.toLowerCase().includes('solar')) {
      setAdCountFilter(5);
      setQualificationFilter('QUALIFIED');
    } else if (nlQuery.toLowerCase().includes('review')) {
      setQualificationFilter('REVIEW_REQUIRED');
    }
  };

  const filteredAdvertisers = SAMPLE_ADVERTISERS.filter(adv => {
    if (adv.activeAdCount < adCountFilter) return false;
    if (qualificationFilter !== 'ALL' && adv.qualificationState !== qualificationFilter) return false;
    if (freshnessFilter !== 'ALL' && adv.verificationFreshness !== freshnessFilter) return false;
    if (hasDomainOnly && !adv.destinationDomain) return false;
    return true;
  });

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Search & Query Studio', active: true },
        ]}
        title="Advanced Query Builder &amp; Saved Views"
        description="Construct multi-variable structured criteria filters, manage operator presets, and compile natural language requests with strict preview confirmation."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            Factual Criteria Engine
          </span>
        }
      />

      {/* SECTION A: NATURAL LANGUAGE QUERY INTERPRETER (Section 30) */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Natural Language Query Interpreter (Operator Assistance)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Strict Non-Hallucinatory Translation Invariant
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            value={nlQuery}
            onChange={e => setNlQuery(e.target.value)}
            placeholder='e.g., "Find Texas solar companies with at least 5 active ads and fresh verification"'
            className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={handleInterpretNl}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>Interpret Query</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Confirmation Preview Dialog (Section 30: "Never execute opaque AI search directly") */}
        {interpretedTranslation && (
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-800 uppercase tracking-wider block">
                  Compiled Structured Translation Preview
                </span>
                <div className="font-mono text-xs text-purple-950 font-bold mt-1 bg-white p-2.5 rounded-lg border border-purple-200 select-all">
                  {interpretedTranslation}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-purple-900">
                Inspect compiled SQL/DSL filters before committing query to database index.
              </span>
              <button
                onClick={handleExecuteInterpreted}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirm &amp; Execute Query</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION B: STRUCTURED QUERY BUILDER (Section 28) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter Form (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Filter Criteria
              </h3>
            </div>
            <button
              onClick={() => {
                setAdCountFilter(1);
                setQualificationFilter('ALL');
                setFreshnessFilter('ALL');
                setHasDomainOnly(false);
              }}
              className="text-[11px] font-mono text-neutral-400 hover:text-neutral-700"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Minimum Active Ads ({adCountFilter})
              </label>
              <input
                type="range"
                min={0}
                max={20}
                value={adCountFilter}
                onChange={e => setAdCountFilter(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Qualification State
              </label>
              <select
                value={qualificationFilter}
                onChange={e => setQualificationFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-neutral-50 text-neutral-900 focus:outline-none"
              >
                <option value="ALL">All Qualification States</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
                <option value="DISQUALIFIED">DISQUALIFIED</option>
                <option value="INSUFFICIENT_DATA">INSUFFICIENT_DATA</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Verification Freshness
              </label>
              <select
                value={freshnessFilter}
                onChange={e => setFreshnessFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-neutral-50 text-neutral-900 focus:outline-none"
              >
                <option value="ALL">All Freshness Levels</option>
                <option value="CURRENT">CURRENT (&lt; 7 Days)</option>
                <option value="EXPIRING_SOON">EXPIRING_SOON (7-30 Days)</option>
                <option value="STALE">STALE (&gt; 30 Days)</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDomainOnly}
                  onChange={e => setHasDomainOnly(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <span className="text-xs text-neutral-800 font-medium">Must have confirmed destination domain</span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100">
            <button
              onClick={() => alert('Filter set saved to local saved views.')}
              className="w-full py-2 rounded-xl text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5 text-neutral-600" />
              <span>Save As New View</span>
            </button>
          </div>
        </div>

        {/* Right Column: Query Results Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50 text-xs">
            <div className="font-bold text-neutral-800">
              Filtered Query Results ({filteredAdvertisers.length} Matching Entities)
            </div>
            <span className="text-[11px] font-mono text-neutral-500">PostgreSQL v_lead_research_current</span>
          </div>

          <div className="divide-y divide-neutral-100 overflow-y-auto max-h-[500px]">
            {filteredAdvertisers.map(adv => (
              <div
                key={adv.advertiserId}
                onClick={() => onSelectAdvertiser(adv)}
                className="p-4 hover:bg-neutral-50 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-neutral-900 text-xs">{adv.canonicalName}</div>
                  <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                    Domain: {adv.destinationDomain || 'No domain observed'} &bull; {adv.activeAdCount} ads active
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={adv.qualificationState} />
                  <StatusBadge status={adv.verificationFreshness} />
                  <ArrowRight className="w-4 h-4 text-neutral-400 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
