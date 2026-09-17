import React, { useState } from 'react';
import { PHASE_06_SECTIONS, Phase06Section } from '../data/phase06Sections';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Scale,
  Layers,
  Sparkles
} from 'lucide-react';

export const Phase06Reader: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<Phase06Section>(PHASE_06_SECTIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  const categories = [
    'ALL',
    'FOUNDATION',
    'SIGNALS_AND_RULES',
    'SCORING_AND_CONFIDENCE',
    'OPERATIONS',
    'AUDIT_AND_HANDOFF'
  ];

  const filteredSections = PHASE_06_SECTIONS.filter(s => {
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contentMarkdown.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(selectedSection.contentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-neutral-50">
      {/* Sidebar navigation */}
      <div className="w-full md:w-80 border-r border-neutral-200 bg-white flex flex-col h-auto md:h-full">
        <div className="p-4 border-b border-neutral-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Phase 06 Specification
              </span>
            </div>
            <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
              28 Sections
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search sections or terms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-800"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Sections list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSections.map(s => {
            const isSelected = selectedSection.number === s.number;
            return (
              <button
                key={s.number}
                onClick={() => setSelectedSection(s)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-start justify-between ${
                  isSelected
                    ? 'bg-purple-600 text-white font-medium shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-start gap-2 truncate">
                  <span
                    className={`font-mono text-[10px] mt-0.5 px-1 py-0.2 rounded shrink-0 ${
                      isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    #{s.number.toString().padStart(2, '0')}
                  </span>
                  <span className="truncate">{s.title}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                    isSelected ? 'text-white' : 'text-neutral-300'
                  }`}
                />
              </button>
            );
          })}
          {filteredSections.length === 0 && (
            <p className="text-center text-xs text-neutral-400 py-6">No matching sections found.</p>
          )}
        </div>
      </div>

      {/* Content Reader Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-neutral-100 text-neutral-700">
                SECTION {selectedSection.number} OF 28
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {selectedSection.category}
              </span>
            </div>
            <h1 className="text-lg font-bold text-neutral-900 mt-1">{selectedSection.title}</h1>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>
        </div>

        {/* Section Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 font-sans">
          <div className="max-w-4xl prose prose-neutral prose-sm">
            <div className="whitespace-pre-wrap leading-relaxed text-neutral-800 text-xs sm:text-sm font-mono bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              {selectedSection.contentMarkdown}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
