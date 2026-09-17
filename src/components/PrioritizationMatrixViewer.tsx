import React, { useState, useMemo } from 'react';
import { QualificationEngine, DEFAULT_MODEL_V1 } from '../utils/qualificationEngine';
import { GOLDEN_SCORING_DATASETS } from '../data/phase06FixturesAndAudit';
import {
  PrioritizationPolicy,
  QualificationResult,
  QualificationState
} from '../types';
import {
  ArrowUpDown,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  Globe,
  Radio,
  UserCheck
} from 'lucide-react';

export const PrioritizationMatrixViewer: React.FC = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<PrioritizationPolicy>('BALANCED_SCORE_DESCENDING');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const engine = useMemo(() => new QualificationEngine(DEFAULT_MODEL_V1), []);

  // Pre-calculate qualification results for all golden datasets
  const allResults: QualificationResult[] = useMemo(() => {
    return GOLDEN_SCORING_DATASETS.map(d => engine.evaluate(d.inputSnapshot));
  }, [engine]);

  // Filter and prioritize
  const filteredAndPrioritized = useMemo(() => {
    let list = allResults.filter(r => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const d = GOLDEN_SCORING_DATASETS.find(g => g.inputSnapshot.entityId === r.entityId);
      const name = d?.inputSnapshot.advertiserName || '';
      const matchesSearch =
        r.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    return engine.prioritize(list, selectedPolicy);
  }, [allResults, statusFilter, searchQuery, selectedPolicy, engine]);

  const policies: { id: PrioritizationPolicy; label: string; desc: string }[] = [
    {
      id: 'BALANCED_SCORE_DESCENDING',
      label: 'Balanced Score (High → Low)',
      desc: 'Standard quantitative score ordering'
    },
    {
      id: 'HIGH_CONFIDENCE_FIRST',
      label: 'High Confidence First',
      desc: 'Prioritizes density and freshness of verified evidence'
    },
    {
      id: 'COMPLETE_EVIDENCE_FIRST',
      label: 'Complete Evidence First',
      desc: 'Prioritizes records with fewest missing fields'
    },
    {
      id: 'RECENT_ACTIVITY_FIRST',
      label: 'Highest Ad Activity First',
      desc: 'Prioritizes volume and longevity of public advertising'
    },
    {
      id: 'REVIEW_QUEUE_FIRST',
      label: 'Review Queue First',
      desc: 'Focuses operator attention on conflicts and borderline cases'
    }
  ];

  const getStatusBadge = (status: QualificationState) => {
    switch (status) {
      case 'VERIFIED_FOR_WORKFLOW':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'QUALIFIED':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'REVIEW_REQUIRED':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'INSUFFICIENT_EVIDENCE':
        return 'bg-neutral-100 text-neutral-700 border-neutral-300';
      case 'NOT_ELIGIBLE':
      case 'REJECTED_BY_RULE':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Operations & Workflow
            </span>
            <span className="text-xs font-mono text-neutral-500">
              Decoupled Prioritization Queue
            </span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">
            Lead Prioritization Matrix
          </h1>
        </div>

        {/* Policy Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium">Policy:</span>
          <select
            value={selectedPolicy}
            onChange={e => setSelectedPolicy(e.target.value as PrioritizationPolicy)}
            className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 font-medium text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
          >
            {policies.map(p => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-xs text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-600">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1 text-neutral-800"
          >
            <option value="ALL">All States ({allResults.length})</option>
            <option value="VERIFIED_FOR_WORKFLOW">VERIFIED_FOR_WORKFLOW</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
            <option value="INSUFFICIENT_EVIDENCE">INSUFFICIENT_EVIDENCE</option>
            <option value="REJECTED_BY_RULE">REJECTED_BY_RULE</option>
            <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Filter by name, ID or explanation..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 bg-neutral-50 border border-neutral-200 rounded-md px-3 py-1 text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
        />
      </div>

      {/* Leads Prioritization List */}
      <div className="space-y-3">
        {filteredAndPrioritized.map((res, index) => {
          const dataset = GOLDEN_SCORING_DATASETS.find(g => g.inputSnapshot.entityId === res.entityId);
          const snap = dataset?.inputSnapshot;

          return (
            <div
              key={res.qualificationId}
              className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs hover:border-neutral-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Column: Ranking & Entity Info */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center font-mono font-bold text-xs text-neutral-600 shrink-0">
                  #{index + 1}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">
                      {snap?.advertiserName || '(Unnamed Entity)'}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="font-mono text-xs text-neutral-500">{res.entityId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${getStatusBadge(res.status)}`}>
                      {res.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 font-mono leading-relaxed line-clamp-2 max-w-2xl">
                    {res.explanation}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-indigo-500" />
                      {snap?.canonicalAdCount || 0} ads ({snap?.platforms?.join(', ') || 'None'})
                    </span>
                    {snap?.destinationUrl && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-500" />
                        {snap.destinationUrl.replace('https://', '').replace('http://', '').split('/')[0]}
                      </span>
                    )}
                    {res.missingEvidence.length > 0 && (
                      <span className="text-amber-700">
                        Missing: {res.missingEvidence.length} field(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Score, Confidence & Categories */}
              <div className="flex items-center gap-6 shrink-0 lg:border-l lg:border-neutral-100 lg:pl-6">
                {/* Category mini pills */}
                <div className="hidden sm:grid grid-cols-2 gap-1 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-neutral-50 border border-neutral-200">
                    ADV: {res.categoryScores.ADVERTISING_ACTIVITY.capped}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-neutral-50 border border-neutral-200">
                    WEB: {res.categoryScores.WEBSITE_DESTINATION.capped}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-neutral-50 border border-neutral-200">
                    ID: {res.categoryScores.IDENTITY_CONSISTENCY.capped}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-neutral-50 border border-neutral-200">
                    CNT: {res.categoryScores.BUSINESS_CONTACTABILITY.capped}
                  </span>
                </div>

                {/* Score & Confidence */}
                <div className="text-right">
                  <div className="text-xl font-black font-mono text-neutral-900 leading-none">
                    {res.score} <span className="text-xs font-normal text-neutral-400">/ 100</span>
                  </div>
                  <div
                    className={`text-[10px] font-mono font-bold mt-1 ${
                      res.confidence === 'HIGH'
                        ? 'text-emerald-700'
                        : res.confidence === 'MEDIUM'
                        ? 'text-blue-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {res.confidence} ({Math.round(res.confidenceScore * 100)}%)
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAndPrioritized.length === 0 && (
          <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
            No leads match the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
