import React from 'react';
import { SPEC_SECTIONS } from '../data/specificationData';
import { SECTION_TEXTS } from '../data/specificationMarkdown';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface SpecificationReaderProps {
  activeSectionId: string;
  onSelectSection: (id: string) => void;
}

export const SpecificationReader: React.FC<SpecificationReaderProps> = ({
  activeSectionId,
  onSelectSection,
}) => {
  const currentIndex = SPEC_SECTIONS.findIndex((s) => s.id === activeSectionId);
  const currentSection = SPEC_SECTIONS[currentIndex] || SPEC_SECTIONS[0];
  const sectionText = SECTION_TEXTS[activeSectionId] || {
    title: currentSection.title,
    content: `Detailed specifications for ${currentSection.title} are comprehensively detailed in the official Master Blueprint. Refer to the corresponding subsections in the complete system documentation.`
  };

  const prevSection = currentIndex > 0 ? SPEC_SECTIONS[currentIndex - 1] : null;
  const nextSection = currentIndex < SPEC_SECTIONS.length - 1 ? SPEC_SECTIONS[currentIndex + 1] : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-2">
          <span>SECTION {currentSection.number.toString().padStart(2, '0')} OF 24</span>
          <span>•</span>
          <span className="uppercase tracking-wider font-semibold text-neutral-700">{currentSection.category}</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight font-mono">
          {sectionText.title}
        </h1>
        <p className="text-sm text-neutral-600 mt-2 font-normal leading-relaxed">{currentSection.subtitle}</p>
      </div>

      {/* Content Body */}
      <div className="prose prose-neutral max-w-none text-neutral-800 text-sm leading-relaxed space-y-4">
        {sectionText.content.split('\n\n').map((block, i) => {
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

      {/* Pagination Footer */}
      <div className="mt-12 pt-6 border-t border-neutral-200 flex items-center justify-between">
        {prevSection ? (
          <button
            onClick={() => onSelectSection(prevSection.id)}
            className="flex items-center gap-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 p-2 rounded-md hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev: #{prevSection.number.toString().padStart(2, '0')} {prevSection.title.replace(/^#\s*\d+\.\s*/, '')}</span>
          </button>
        ) : <div />}

        {nextSection ? (
          <button
            onClick={() => onSelectSection(nextSection.id)}
            className="flex items-center gap-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 p-2 rounded-md hover:bg-neutral-50 transition-colors ml-auto"
          >
            <span>Next: #{nextSection.number.toString().padStart(2, '0')} {nextSection.title.replace(/^#\s*\d+\.\s*/, '')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
};
