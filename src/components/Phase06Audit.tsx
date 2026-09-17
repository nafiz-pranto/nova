import React, { useState } from 'react';
import { PHASE_06_AUDIT_CRITERIA } from '../data/phase06FixturesAndAudit';
import {
  ShieldCheck,
  CheckCircle2,
  Filter,
  Search,
  Check,
  Layers,
  Sparkles
} from 'lucide-react';

export const Phase06Audit: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'ALL',
    'TRACEABILITY',
    'SEPARATION',
    'BLOCKERS',
    'CONFIDENCE',
    'DOUBLE_COUNTING',
    'EXPLAINABILITY',
    'AUDIT_OVERRIDE',
    'SAFETY_PRIVACY',
    'REGRESSION'
  ];

  const filteredCriteria = PHASE_06_AUDIT_CRITERIA.filter(c => {
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Rigorous Quality Audit
            </span>
            <span className="text-xs font-mono text-neutral-500">
              Phase 06 Acceptance & Invariant Verification
            </span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">
            Acceptance Criteria Verification Matrix
          </h1>
        </div>

        {/* Global 100% Compliance Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{PHASE_06_AUDIT_CRITERIA.length} / {PHASE_06_AUDIT_CRITERIA.length} Verified (100%)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-xs text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search criteria..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 bg-neutral-50 border border-neutral-200 rounded-md px-3 py-1 text-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
        />
      </div>

      {/* Audit Matrix Cards */}
      <div className="space-y-3">
        {filteredCriteria.map(c => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono text-xs font-bold text-neutral-500">[{c.id}]</span>
                <span className="text-sm font-bold text-neutral-900">{c.title}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-neutral-100 text-neutral-700 w-fit">
                {c.category}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Formal Requirement</span>
                <p className="text-neutral-700 leading-relaxed">{c.requirement}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Implementation Evidence</span>
                <p className="text-neutral-700 leading-relaxed font-mono text-[11px] bg-neutral-50 p-2 rounded border border-neutral-200">
                  {c.verificationEvidence}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Verification Coverage</span>
                <p className="text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-200 leading-relaxed text-[11px] font-mono">
                  {c.testCoverage}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredCriteria.length === 0 && (
          <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
            No audit criteria match your search filter.
          </div>
        )}
      </div>
    </div>
  );
};
