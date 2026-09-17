import React, { useState } from 'react';
import { PHASE_08_SECTIONS, Phase08Section } from '../data/phase08Sections';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  Key, 
  ShieldCheck,
  Tag
} from 'lucide-react';

export const Phase08Reader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<Phase08Section>(PHASE_08_SECTIONS[0]);

  const filteredSections = PHASE_08_SECTIONS.filter(sec => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.summary.toLowerCase().includes(q) ||
      sec.content.toLowerCase().includes(q) ||
      sec.number.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-900">Phase 08 Specification Reader</h2>
            <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-purple-600 text-white rounded">
              31 Sections Complete
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Exhaustive architectural, UX, Chrome Extension MV3, and export pipeline specifications.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search specification sections..."
            className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 w-64"
          />
        </div>
      </div>

      {/* Two Column Layout: Navigation on Left (4 cols), Content on Right (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Section Index */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-neutral-200 shadow-xs p-4 flex flex-col">
          <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Sections ({filteredSections.length})
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">Master Prompt 08</span>
          </div>

          <div className="mt-3 space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredSections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                  selectedSection.id === sec.id
                    ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                    : 'border-transparent hover:border-neutral-200 hover:bg-neutral-50/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-500">
                    §{sec.number}
                  </span>
                  <span className="text-xs font-semibold text-neutral-900 truncate">
                    {sec.title}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5 ml-6">
                  {sec.summary}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Deep Content Reader */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-neutral-200 shadow-xs p-6 space-y-6">
          <div className="pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">
              <span>Section {selectedSection.number}</span>
              <span>&bull;</span>
              <span>ID: {selectedSection.id}</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mt-1">{selectedSection.title}</h1>
            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              {selectedSection.summary}
            </p>
          </div>

          {/* Key Takeaways */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block">
              Architectural Imperatives
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {selectedSection.keyTakeaways.map((takeaway, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Body */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="prose prose-xs max-w-none text-neutral-800 text-xs font-sans leading-relaxed whitespace-pre-wrap font-mono bg-neutral-50/60 p-4 rounded-xl border border-neutral-200 overflow-x-auto">
              {selectedSection.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
