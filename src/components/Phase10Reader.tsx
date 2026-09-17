import React, { useState } from 'react';
import { BookOpen, Search, Filter, ChevronLeft, ChevronRight, Hash, Layers } from 'lucide-react';
import { PHASE_10_SECTIONS } from '../data/phase10Sections';
import { SectionItem } from '../types';

export const Phase10Reader: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(PHASE_10_SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', 'architecture', 'data', 'security', 'operations', 'handoff'];

  const filteredSections = PHASE_10_SECTIONS.filter(sec => {
    const matchesCat = categoryFilter === 'ALL' || sec.category === categoryFilter;
    const matchesSearch = searchQuery === '' ||
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.contentMarkdown.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeIndex = PHASE_10_SECTIONS.findIndex(s => s.id === selectedSectionId);
  const currentSection = PHASE_10_SECTIONS[activeIndex] || PHASE_10_SECTIONS[0];

  return (
    <div className="space-y-6">
      {/* Search and Category Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-neutral-800" />
          <h2 className="text-sm font-bold text-neutral-900">
            Phase 10 Formal Specification & Acceptance Report (37 Sections)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-neutral-200 rounded-lg px-2 py-1.5 font-mono text-neutral-700 capitalize"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search 37 sections..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-52 text-neutral-800 placeholder-neutral-400"
            />
          </div>
        </div>
      </div>

      {/* Split View: Index & Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sections Index Column */}
        <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {filteredSections.map((sec) => {
            const isSelected = sec.id === currentSection.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-neutral-500 font-bold'}>
                    SECTION {String(sec.number).padStart(2, '0')}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded capitalize ${
                    isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {sec.category}
                  </span>
                </div>

                <div className="font-semibold text-xs mt-1 tracking-tight">
                  {sec.title}
                </div>
                <div className="text-[11px] opacity-75 truncate mt-0.5">
                  {sec.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Section Content Reader */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-6">
          <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                  SECTION {String(currentSection.number).padStart(2, '0')}
                </span>
                <span className="text-xs font-mono uppercase text-neutral-500">
                  {currentSection.category}
                </span>
              </div>
              <h1 className="text-xl font-bold text-neutral-900 mt-2">
                {currentSection.title}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                {currentSection.subtitle}
              </p>
            </div>
          </div>

          {/* Section Markdown Rendering */}
          <div className="prose prose-sm max-w-none text-neutral-800 space-y-4 font-sans text-xs leading-relaxed">
            {currentSection.contentMarkdown.split('\n\n').map((para, i) => {
              if (para.startsWith('```')) {
                const code = para.replace(/```[a-z]*\n?/g, '').trim();
                return (
                  <pre key={i} className="p-3 bg-neutral-950 text-neutral-100 rounded-lg font-mono text-xs overflow-x-auto my-3">
                    {code}
                  </pre>
                );
              }
              if (para.startsWith('|')) {
                const rows = para.trim().split('\n');
                return (
                  <div key={i} className="overflow-x-auto my-3">
                    <table className="min-w-full text-xs border border-neutral-200 divide-y divide-neutral-200">
                      <tbody>
                        {rows.map((row, rIdx) => {
                          const cols = row.split('|').filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1);
                          if (row.includes('---')) return null;
                          const isHead = rIdx === 0;
                          return (
                            <tr key={rIdx} className={isHead ? 'bg-neutral-100 font-bold' : 'hover:bg-neutral-50'}>
                              {cols.map((col, cIdx) => (
                                <td key={cIdx} className="p-2 border-r border-neutral-200 last:border-0 font-mono text-[11px]">
                                  {col.trim()}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return (
                <p key={i} className="text-neutral-700 whitespace-pre-line">
                  {para}
                </p>
              );
            })}
          </div>

          {/* Section Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <button
              onClick={() => setSelectedSectionId(PHASE_10_SECTIONS[Math.max(0, activeIndex - 1)].id)}
              disabled={activeIndex === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous Section
            </button>
            <span className="text-xs font-mono text-neutral-500">
              {currentSection.number} of {PHASE_10_SECTIONS.length}
            </span>
            <button
              onClick={() => setSelectedSectionId(PHASE_10_SECTIONS[Math.min(PHASE_10_SECTIONS.length - 1, activeIndex + 1)].id)}
              disabled={activeIndex === PHASE_10_SECTIONS.length - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next Section
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
