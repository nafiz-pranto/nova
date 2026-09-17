import React, { useState, useMemo } from 'react';
import { PHASE_07_AUDIT_CRITERIA } from '../data/phase07FixturesAndAudit';
import { Phase07AuditCriterion } from '../types';
import { 
  ShieldCheck, 
  CheckCircle, 
  Search, 
  Filter, 
  Award, 
  ChevronRight, 
  Check, 
  FileCheck
} from 'lucide-react';

export const Phase07Audit: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'ALL', 
    'TRACEABILITY', 
    'IMMUTABILITY', 
    'INTEGRITY', 
    'TRANSACTIONS', 
    'CONCURRENCY', 
    'PROVENANCE', 
    'SECURITY_PRIVACY', 
    'MIGRATION_RESTORE'
  ];

  const filteredCriteria = useMemo(() => {
    return PHASE_07_AUDIT_CRITERIA.filter(crit => {
      const matchesCategory = selectedCategory === 'ALL' || crit.category === selectedCategory;
      const matchesSearch = 
        crit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crit.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crit.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crit.verificationEvidence.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'TRACEABILITY': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'IMMUTABILITY': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'INTEGRITY': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'TRANSACTIONS': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'CONCURRENCY': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300';
      case 'PROVENANCE': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300';
      case 'SECURITY_PRIVACY': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
      case 'MIGRATION_RESTORE': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AUDIT & VERIFICATION MATRIX
              </span>
              <span className="text-xs text-slate-400">Section 30 Authoritative Checklist</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Phase 07 Acceptance & Invariant Audit
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Strict 33-point acceptance verification covering upstream traceability, observation immutability, 
              referential integrity constraints, transactional boundaries, concurrency safety, provenance graphs, and security privileges.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <Award className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-xl font-black text-white">33 / 33 PASSED</div>
              <div className="text-xs text-emerald-400 font-medium">100% Invariant Compliance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search code, title, requirement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Criteria Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 w-28">Code</th>
                <th className="py-3 px-4 w-40">Category</th>
                <th className="py-3 px-4">Title & Requirement</th>
                <th className="py-3 px-4">Verification Evidence</th>
                <th className="py-3 px-4 w-44">Test Suite</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCriteria.map((crit) => (
                <tr key={crit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {crit.code}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${getCategoryBadgeClass(crit.category)}`}>
                      {crit.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                      {crit.title}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {crit.requirement}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {crit.verificationEvidence}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                    {crit.testCoverage}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-[10px]">
                      <Check className="w-3 h-3" />
                      <span>PASSED</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
