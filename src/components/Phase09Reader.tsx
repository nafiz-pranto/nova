import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  ChevronRight,
  Filter,
  FileText,
  ListOrdered,
  Sparkles
} from 'lucide-react';
import { PHASE_09_SECTIONS, Phase09Section } from '../data/phase09Sections';

export const Phase09Reader: React.FC = () => {
  const [sections] = useState<Phase09Section[]>(PHASE_09_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0];

  const filteredSections = sections.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.number.includes(q) ||
      s.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar: Table of Contents */}
      <div className="lg:col-span-4 bg-white rounded-xl border border-neutral-200 p-4 shadow-xs sticky top-20 max-h-[calc(100vh-6rem)] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-neutral-700" />
            <h3 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider font-mono">
              36 Master Sections
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">Phase 09</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search specification..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:bg-white focus:outline-none"
          />
        </div>

        {/* Section List */}
        <div className="space-y-1 overflow-y-auto flex-1 pr-1 font-mono text-xs">
          {filteredSections.map(s => {
            const isSelected = s.id === activeSectionId;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSectionId(s.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                    {s.number}.
                  </span>
                  <span className="text-xs truncate">{s.title}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-neutral-300 group-hover:text-neutral-500'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-8 bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Section Header */}
        <div className="border-b border-neutral-200 pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-1">
            <span>SECTION {activeSection.number}</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold">PHASE 09 SRE & RESILIENCE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            {activeSection.title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
            {activeSection.summary}
          </p>
        </div>

        {/* Key Takeaways */}
        {activeSection.keyTakeaways && activeSection.keyTakeaways.length > 0 && (
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-neutral-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Architectural Invariants & Key Takeaways</span>
            </div>
            <ul className="space-y-1.5 text-xs text-neutral-700">
              {activeSection.keyTakeaways.map((k, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Markdown / Content Body */}
        <div className="prose prose-sm max-w-none text-neutral-800 text-xs sm:text-sm leading-relaxed space-y-4">
          <div className="whitespace-pre-wrap font-sans">
            {activeSection.content}
          </div>
        </div>

        {/* Section Navigation Footer */}
        <div className="pt-6 border-t border-neutral-200 flex items-center justify-between text-xs font-mono">
          {sections.findIndex(s => s.id === activeSectionId) > 0 ? (
            <button
              onClick={() => {
                const idx = sections.findIndex(s => s.id === activeSectionId);
                setActiveSectionId(sections[idx - 1].id);
              }}
              className="px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-700"
            >
              &larr; Previous Section
            </button>
          ) : <div />}

          {sections.findIndex(s => s.id === activeSectionId) < sections.length - 1 && (
            <button
              onClick={() => {
                const idx = sections.findIndex(s => s.id === activeSectionId);
                setActiveSectionId(sections[idx + 1].id);
              }}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              Next Section &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
