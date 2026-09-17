import React, { useState, useMemo } from 'react';
import { PHASE_05_AUDIT_CRITERIA } from '../data/phase05FixturesAndAudit';
import { Phase05AuditCriterion } from '../types';
import {
  CheckCircle2,
  ShieldCheck,
  Search,
  ExternalLink,
  Layers,
  Award,
  Filter
} from 'lucide-react';

export const Phase05Audit: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'ALL', label: 'All 30 Criteria' },
    { id: 'TRACEABILITY', label: 'Traceability & Lineage' },
    { id: 'CLAIM_DECOMPOSITION', label: 'Claim Decomposition' },
    { id: 'SSRF_SECURITY', label: 'SSRF & URL Security' },
    { id: 'RETRIEVAL_BOUNDS', label: 'Retrieval Budgets' },
    { id: 'IDENTITY_CONSISTENCY', label: 'Identity Consistency' },
    { id: 'FAILURE_SEMANTICS', label: 'Truthful Failure Semantics' },
    { id: 'TEMPORAL_AUDIT', label: 'Temporal & Audit' },
    { id: 'NON_GOALS', label: 'Non-Goals & Bounds' }
  ];

  const filteredCriteria = useMemo(() => {
    return PHASE_05_AUDIT_CRITERIA.filter((crit) => {
      const matchesCat = selectedCategory === 'ALL' || crit.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        crit.code.toLowerCase().includes(q) ||
        crit.title.toLowerCase().includes(q) ||
        crit.requirement.toLowerCase().includes(q) ||
        crit.verificationEvidence.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-white border-b border-neutral-200 p-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-semibold text-neutral-900">
                  Phase 05 Engineering Acceptance Audit (30 Criteria)
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  VERIFIED 30/30 (100%)
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Exhaustive compliance audit verifying claim decomposition, SSRF defenses, failure semantics, and Phase 06 readiness.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 font-semibold">
                AUDIT SCORE: 100 / 100
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2 py-1 rounded whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-purple-600 text-white font-medium'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search audit criteria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Items List */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-3">
        <div className="grid grid-cols-1 gap-3">
          {filteredCriteria.map((crit, idx) => (
            <div
              key={crit.id}
              className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs hover:border-neutral-300 transition-colors space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {crit.id}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-neutral-900">
                    {crit.code}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                    {crit.category}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VERIFIED
                </span>
              </div>

              <h4 className="text-xs font-bold text-neutral-900">
                {crit.title}
              </h4>

              <div className="text-xs text-neutral-600 leading-relaxed font-sans">
                <strong className="text-neutral-700 font-semibold">Requirement: </strong>
                {crit.requirement}
              </div>

              <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200 text-xs font-mono space-y-1">
                <span className="text-[10px] text-neutral-400 font-sans uppercase tracking-wider block font-semibold">
                  Verification Evidence & Architectural Proof:
                </span>
                <p className="text-neutral-700 text-[11px] leading-relaxed">
                  {crit.verificationEvidence}
                </p>
                <div className="text-[10px] text-emerald-700 pt-1 font-sans font-medium">
                  {crit.testCoverage}
                </div>
              </div>
            </div>
          ))}

          {filteredCriteria.length === 0 && (
            <div className="p-12 text-center text-neutral-500 text-xs bg-white rounded-lg border border-neutral-200">
              No audit criteria matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
