import React, { useState, useMemo } from 'react';
import { PHASE_07_SECTIONS, Phase07Section } from '../data/phase07Sections';
import { 
  Search, 
  BookOpen, 
  Layers, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight, 
  Copy, 
  Check, 
  FileText
} from 'lucide-react';

export const Phase07Reader: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = ['ALL', 'FOUNDATION', 'STORAGE', 'INTEGRITY', 'CONCURRENCY', 'OPERATIONS', 'GOVERNANCE'];

  const filteredSections = useMemo(() => {
    return PHASE_07_SECTIONS.filter(sec => {
      const matchesCategory = selectedCategory === 'ALL' || sec.category === selectedCategory;
      const matchesSearch = 
        sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.number.toString().includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const activeSection = useMemo(() => {
    return PHASE_07_SECTIONS.find(s => s.id === selectedSectionId) || PHASE_07_SECTIONS[0];
  }, [selectedSectionId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'FOUNDATION': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'STORAGE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'INTEGRITY': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'CONCURRENCY': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'OPERATIONS': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'GOVERNANCE': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PHASE 07 AUTHORITATIVE SPECIFICATION
              </span>
              <span className="text-xs text-slate-400">PostgreSQL Persistence & Integrity</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Database Persistence, Data Model, Provenance & Auditability
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Complete 31-Section Production Specification establishing immutable observations, normalized domain entities, 
              reversible identity merges, verifiable multi-hop verification, and point-in-time calculation snapshots.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400">31 / 31</div>
              <div className="text-xs text-slate-400">Sections Defined</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search all 31 sections, schemas, SQL, or rules..."
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Master Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 h-[750px] flex flex-col shadow-sm">
          <div className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wider flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
            <span>Sections Index</span>
            <span className="text-emerald-500">{filteredSections.length} available</span>
          </div>

          <div className="overflow-y-auto flex-1 mt-2 space-y-1 pr-1">
            {filteredSections.map((sec) => {
              const isSelected = sec.id === selectedSectionId;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all flex items-start justify-between group ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[10px]">
                        #{String(sec.number).padStart(2, '0')}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${getCategoryBadgeClass(sec.category)}`}>
                        {sec.category}
                      </span>
                    </div>
                    <div className="font-medium text-xs truncate">
                      {sec.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {sec.summary}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 mt-2 flex-shrink-0 transition-transform ${isSelected ? 'text-emerald-600 dark:text-emerald-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Content Display */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[750px] overflow-hidden">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  SECTION {String(activeSection.number).padStart(2, '0')}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${getCategoryBadgeClass(activeSection.category)}`}>
                  {activeSection.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {activeSection.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeSection.summary}
              </p>
            </div>

            <button
              onClick={() => handleCopy(activeSection.content)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors self-start sm:self-auto flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Content'}</span>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 pr-3 prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <div className="whitespace-pre-wrap font-sans">
              {activeSection.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
