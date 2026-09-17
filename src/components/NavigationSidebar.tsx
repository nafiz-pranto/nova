import React, { useState } from 'react';
import { SPEC_SECTIONS } from '../data/specificationData';
import { Search, ChevronRight, BookmarkCheck } from 'lucide-react';

interface NavigationSidebarProps {
  activeSectionId: string;
  onSelectSection: (id: string) => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeSectionId,
  onSelectSection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSections = SPEC_SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.number.toString().includes(searchTerm)
  );

  return (
    <aside className="w-80 border-r border-neutral-200 bg-neutral-50/50 flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-neutral-200 bg-white">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter 24 architectural sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500 font-mono">
          <span>{filteredSections.length} of {SPEC_SECTIONS.length} SECTIONS</span>
          <span className="text-emerald-600 font-medium">COMPLETE BLUEPRINT</span>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-2 space-y-1">
        {filteredSections.map((section) => {
          const isActive = section.id === activeSectionId;
          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
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
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 self-center" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
