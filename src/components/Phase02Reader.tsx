import React, { useState } from 'react';
import { PHASE_02_SECTIONS } from '../data/phase02Markdown';
import { PHASE_02_CONTENT } from '../data/phase02SectionContent';
import { Search, ChevronLeft, ChevronRight, BookOpen, Layers } from 'lucide-react';

export const Phase02Reader: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('p2-traceability');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredSections = PHASE_02_SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.number.toString().includes(searchTerm)
  );

  const currentIndex = PHASE_02_SECTIONS.findIndex((s) => s.id === activeSectionId);
  const currentSection = PHASE_02_SECTIONS[currentIndex] || PHASE_02_SECTIONS[0];
  const sectionContent = PHASE_02_CONTENT[activeSectionId] || {
    title: currentSection.title,
    content: `Detailed specifications for ${currentSection.title} are fully documented in the authoritative Phase 02 blueprint.`
  };

  const prevSection = currentIndex > 0 ? PHASE_02_SECTIONS[currentIndex - 1] : null;
  const nextSection = currentIndex < PHASE_02_SECTIONS.length - 1 ? PHASE_02_SECTIONS[currentIndex + 1] : null;

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Sidebar navigation */}
      <aside className="w-80 border-r border-neutral-200 bg-neutral-50/50 flex flex-col h-full">
        <div className="p-4 border-b border-neutral-200 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 27 Phase 02 sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500 font-mono">
            <span>{filteredSections.length} of {PHASE_02_SECTIONS.length} SECTIONS</span>
            <span className="text-emerald-600 font-medium">PHASE 02 SPEC</span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filteredSections.map((section) => {
            const isActive = section.id === activeSectionId;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                  isActive
                    ? 'bg-white border border-neutral-300 shadow-xs text-neutral-900 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900 border border-transparent'
                }`}
              >
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-purple-600 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  #{section.number.toString().padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate leading-tight">{section.title.replace(/^#\s*\d+\.\s*/, '')}</p>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5 font-normal">{section.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Reader */}
      <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto p-8 max-w-4xl mx-auto">
        <div className="border-b border-neutral-200 pb-6 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-2">
            <span>PHASE 02 • SECTION {currentSection.number.toString().padStart(2, '0')} OF 27</span>
            <span>•</span>
            <span className="uppercase tracking-wider font-semibold text-neutral-700">{currentSection.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight font-mono">
            {sectionContent.title}
          </h1>
          <p className="text-sm text-neutral-600 mt-2 font-normal leading-relaxed">{currentSection.subtitle}</p>
        </div>

        <div className="prose prose-neutral max-w-none text-neutral-800 text-sm leading-relaxed space-y-4">
          {sectionContent.content.split('\n\n').map((block, i) => {
            if (block.startsWith('### ')) {
              return (
                <h3 key={i} className="text-sm font-bold text-neutral-900 mt-5 mb-2 font-mono">
                  {block.replace('### ', '')}
                </h3>
              );
            }
            if (block.startsWith('## ')) {
              return (
                <h2 key={i} className="text-base font-semibold text-neutral-900 mt-6 mb-2 border-b border-neutral-100 pb-1 font-mono">
                  {block.replace('## ', '')}
                </h2>
              );
            }
            if (block.startsWith('```')) {
              const cleanCode = block.replace(/```[a-z]*\n/, '').replace(/\n```$/, '');
              return (
                <pre key={i} className="p-4 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto my-3 leading-relaxed">
                  {cleanCode}
                </pre>
              );
            }
            if (block.startsWith('|')) {
              const rows = block.trim().split('\n');
              return (
                <div key={i} className="overflow-x-auto my-4 border border-neutral-200 rounded-lg">
                  <table className="w-full text-xs text-left border-collapse">
                    <tbody>
                      {rows.map((r, rIdx) => {
                        if (r.includes(':---') || r.includes('---')) return null;
                        const cols = r.split('|').filter((c) => c.trim() !== '');
                        return (
                          <tr key={rIdx} className={rIdx === 0 ? 'bg-neutral-100 font-mono font-semibold border-b border-neutral-200' : 'border-b border-neutral-200 hover:bg-neutral-50'}>
                            {cols.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2.5">
                                {cell.trim()}
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
            if (block.startsWith('- ')) {
              const items = block.split('\n- ');
              return (
                <ul key={i} className="list-disc pl-5 space-y-1.5 my-2 text-xs">
                  {items.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item.replace(/^- /, '')}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-neutral-700 leading-relaxed text-xs">
                {block}
              </p>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-6 border-t border-neutral-200 flex items-center justify-between">
          {prevSection ? (
            <button
              onClick={() => setActiveSectionId(prevSection.id)}
              className="flex items-center gap-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 p-2 rounded-md hover:bg-neutral-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev: #{prevSection.number.toString().padStart(2, '0')} {prevSection.title.replace(/^#\s*\d+\.\s*/, '')}</span>
            </button>
          ) : <div />}

          {nextSection ? (
            <button
              onClick={() => setActiveSectionId(nextSection.id)}
              className="flex items-center gap-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 p-2 rounded-md hover:bg-neutral-50 transition-colors ml-auto"
            >
              <span>Next: #{nextSection.number.toString().padStart(2, '0')} {nextSection.title.replace(/^#\s*\d+\.\s*/, '')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
};
