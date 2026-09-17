import React, { useState, useMemo } from 'react';
import { PHASE_05_SPEC_SECTIONS, Phase05SpecSection } from '../data/phase05Sections';
import {
  ShieldCheck,
  Search,
  BookOpen,
  FileCheck2,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  SlidersHorizontal
} from 'lucide-react';

export const Phase05Reader: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(PHASE_05_SPEC_SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedSection, setCopiedSection] = useState<boolean>(false);

  const categories = [
    { id: 'ALL', label: 'All 25 Sections' },
    { id: 'TRACEABILITY', label: 'Traceability & Boundaries' },
    { id: 'SECURITY_SSRF', label: 'SSRF & URL Security' },
    { id: 'RETRIEVAL_ARCHITECTURE', label: 'Retrieval & Budgets' },
    { id: 'EVIDENCE_MODEL', label: 'Evidence & Claims' },
    { id: 'CONSISTENCY_CONFLICT', label: 'Consistency & Conflicts' },
    { id: 'TEMPORAL_AUDIT', label: 'Temporal & Audit' },
    { id: 'TESTING_HANDOFF', label: 'Testing & Handoff' }
  ];

  const filteredSections = useMemo(() => {
    return PHASE_05_SPEC_SECTIONS.filter((sec) => {
      const matchesCategory = selectedCategory === 'ALL' || sec.category === selectedCategory;
      const matchesSearch =
        sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.contentMarkdown.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeSection: Phase05SpecSection = useMemo(() => {
    return (
      PHASE_05_SPEC_SECTIONS.find((s) => s.id === selectedSectionId) ||
      PHASE_05_SPEC_SECTIONS[0]
    );
  }, [selectedSectionId]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(activeSection.contentMarkdown);
    setCopiedSection(true);
    setTimeout(() => setCopiedSection(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-neutral-50">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-neutral-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-neutral-900 text-sm">
                Phase 05 Specification
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              v5.0.0-PROD
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search 25 specification sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1 rounded whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white font-medium'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {filteredSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSectionId(sec.id)}
              className={`w-full text-left p-3 transition-colors flex items-start gap-2.5 ${
                selectedSectionId === sec.id
                  ? 'bg-emerald-50/50 border-l-4 border-emerald-600'
                  : 'hover:bg-neutral-50 border-l-4 border-transparent'
              }`}
            >
              <span className="text-xs font-mono font-bold text-neutral-400 mt-0.5 shrink-0">
                {sec.number < 10 ? `0${sec.number}` : sec.number}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 justify-between">
                  <h4
                    className={`text-xs font-semibold truncate ${
                      selectedSectionId === sec.id
                        ? 'text-emerald-950'
                        : 'text-neutral-800'
                    }`}
                  >
                    {sec.title}
                  </h4>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      selectedSectionId === sec.id
                        ? 'text-emerald-600 translate-x-0.5'
                        : 'text-neutral-300'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                  {sec.summary}
                </p>
              </div>
            </button>
          ))}

          {filteredSections.length === 0 && (
            <div className="p-8 text-center text-neutral-500 text-xs">
              No specification sections found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </div>

      {/* Main Content Reader */}
      <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
          {/* Section Header */}
          <div className="border-b border-neutral-200 pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                  SECTION {activeSection.number}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeSection.category}
                </span>
              </div>
              <button
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded px-2.5 py-1 hover:bg-neutral-50 transition-colors"
              >
                {copiedSection ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Section</span>
                  </>
                )}
              </button>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              {activeSection.title}
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              {activeSection.summary}
            </p>
          </div>

          {/* Section Markdown Body */}
          <div className="prose prose-sm prose-neutral max-w-none space-y-4 text-xs text-neutral-700 leading-relaxed">
            <div className="bg-neutral-50 rounded-lg p-5 border border-neutral-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto text-neutral-800">
              {activeSection.contentMarkdown}
            </div>
          </div>

          {/* Next / Previous Controls */}
          <div className="border-t border-neutral-200 pt-4 flex items-center justify-between text-xs">
            <button
              disabled={activeSection.number === 1}
              onClick={() => {
                const prev = PHASE_05_SPEC_SECTIONS.find(
                  (s) => s.number === activeSection.number - 1
                );
                if (prev) setSelectedSectionId(prev.id);
              }}
              className="px-3 py-1.5 rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              ← Previous Section
            </button>
            <span className="text-neutral-400 font-mono text-[11px]">
              {activeSection.number} of {PHASE_05_SPEC_SECTIONS.length}
            </span>
            <button
              disabled={activeSection.number === PHASE_05_SPEC_SECTIONS.length}
              onClick={() => {
                const next = PHASE_05_SPEC_SECTIONS.find(
                  (s) => s.number === activeSection.number + 1
                );
                if (next) setSelectedSectionId(next.id);
              }}
              className="px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:pointer-events-none"
            >
              Next Section →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
