import React, { useState } from 'react';
import { PHASE_04_SPEC_SECTIONS } from '../data/phase04SpecAndAudit';
import { ShieldCheck, BookOpen, Layers, GitMerge, FileCode, CheckCircle2 } from 'lucide-react';

export const Phase04Reader: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(PHASE_04_SPEC_SECTIONS[0].id);

  const currentSection =
    PHASE_04_SPEC_SECTIONS.find((s) => s.id === selectedSectionId) || PHASE_04_SPEC_SECTIONS[0];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-white overflow-hidden">
      {/* Table of Contents Sidebar */}
      <aside className="w-full md:w-80 border-r border-neutral-200 bg-neutral-50 flex flex-col shrink-0 h-full overflow-y-auto">
        <div className="p-4 border-b border-neutral-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono">
              Phase 04 Specification
            </h2>
          </div>
          <p className="text-sm font-medium text-neutral-900 mt-1">
            Identity Resolution & Deduplication
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-semibold">
              v4.0.0-PROD
            </span>
            <span className="text-xs text-neutral-500">7 Core Sections</span>
          </div>
        </div>

        <nav className="p-2 space-y-1">
          {PHASE_04_SPEC_SECTIONS.map((sec) => {
            const isSelected = sec.id === selectedSectionId;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white font-medium shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] shrink-0 font-medium ${
                    isSelected
                      ? 'bg-neutral-800 text-emerald-300'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  §0{sec.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{sec.title}</div>
                  <div
                    className={`truncate text-[11px] mt-0.5 ${
                      isSelected ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    {sec.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-neutral-200 bg-white">
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Non-Destructive • Reversible Ledger • Explaining Weights</span>
          </div>
        </div>
      </aside>

      {/* Specification Content Reader */}
      <main className="flex-1 h-full overflow-y-auto p-6 lg:p-10 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="border-b border-neutral-200 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 font-semibold mb-1">
              <span>SECTION 0{currentSection.number}</span>
              <span>•</span>
              <span className="uppercase">{currentSection.category}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
              {currentSection.title}
            </h1>
            <p className="text-sm text-neutral-600 mt-1">{currentSection.subtitle}</p>
          </div>

          {/* Markdown rendering container */}
          <div className="prose prose-sm max-w-none text-neutral-800 leading-relaxed space-y-4">
            {currentSection.contentMarkdown?.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3
                    key={idx}
                    className="text-lg font-bold text-neutral-900 tracking-tight pt-3 border-b border-neutral-100 pb-1 font-mono"
                  >
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4
                    key={idx}
                    className="text-sm font-semibold text-neutral-900 tracking-tight pt-2 font-mono"
                  >
                    {paragraph.replace('#### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('```sql')) {
                const code = paragraph.replace('```sql\n', '').replace('\n```', '');
                return (
                  <div
                    key={idx}
                    className="my-3 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 text-neutral-100 p-4 font-mono text-xs overflow-x-auto shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[11px] text-neutral-400">
                      <span>PostgreSQL Relational DDL (v4.0.0)</span>
                      <span className="text-emerald-400">Production Ready</span>
                    </div>
                    <pre>{code}</pre>
                  </div>
                );
              }
              if (paragraph.startsWith('```json')) {
                const code = paragraph.replace('```json\n', '').replace('\n```', '');
                return (
                  <div
                    key={idx}
                    className="my-3 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 text-emerald-300 p-4 font-mono text-xs overflow-x-auto shadow-xs"
                  >
                    <pre>{code}</pre>
                  </div>
                );
              }
              if (paragraph.startsWith('```')) {
                const code = paragraph.replace(/```[a-z]*\n?/i, '').replace(/\n?```$/, '');
                return (
                  <div
                    key={idx}
                    className="my-3 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 text-neutral-900 p-4 font-mono text-xs overflow-x-auto"
                  >
                    <pre>{code}</pre>
                  </div>
                );
              }
              if (paragraph.startsWith('|')) {
                // Render table
                const rows = paragraph.split('\n').map((r) =>
                  r
                    .split('|')
                    .slice(1, -1)
                    .map((c) => c.trim())
                );
                const header = rows[0];
                const body = rows.slice(2);
                return (
                  <div
                    key={idx}
                    className="my-4 overflow-x-auto border border-neutral-200 rounded-lg shadow-xs"
                  >
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-mono">
                        <tr>
                          {header.map((th, hIdx) => (
                            <th key={hIdx} className="p-2.5 font-semibold">
                              {th}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 bg-white">
                        {body.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-neutral-50 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2.5 font-mono text-[11px] text-neutral-800">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return (
                <p key={idx} className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
