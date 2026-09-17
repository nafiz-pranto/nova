import React, { useState } from 'react';
import { PHASE_08_HANDOFF_PAYLOAD } from '../data/phase07FixturesAndAudit';
import { 
  FileCheck, 
  Copy, 
  Check, 
  Download, 
  Database, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Code
} from 'lucide-react';

export const Phase07HandoffViewer: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const payload = PHASE_08_HANDOFF_PAYLOAD;

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'phase-07-to-08-handoff-contract.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PHASE-08 DOWNSTREAM HANDOFF
              </span>
              <span className="text-xs text-slate-400">Section 31 Machine-Readable Contract</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Phase-08 Persistence & Reporting Handoff Contract
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Authoritative, verified contract delivering 32 normalized tables, 8 migration scripts, 
              the <code className="font-mono text-emerald-400">v_lead_research_current</code> read model view, 
              and zero-lock read guarantees for Phase 08 consumption.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Contract</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Audit Compliance</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">100.0%</div>
          <div className="text-[11px] text-slate-400">33 / 33 Invariants Passed</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Architecture</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">8 Layers / 32 Tables</div>
          <div className="text-[11px] text-slate-400">PostgreSQL 16+ Engine</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Primary Key Paradigm</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">UUIDv7 + Identity</div>
          <div className="text-[11px] text-slate-400">Time-ordered & compact</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Downstream View</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm truncate">
            v_lead_research_current
          </div>
          <div className="text-[11px] text-slate-400">Non-locking read model</div>
        </div>
      </div>

      {/* Guarantees & JSON Payload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Consumer Guarantees */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Phase 08 Consumer Guarantees</span>
            </h3>
            <div className="space-y-3 text-xs">
              {payload.consumerGuarantees.map((g, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {g}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Authoritative Read Model Interface</span>
            </h3>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                SELECT * FROM v_lead_research_current;
              </div>
              <p className="text-[11px] text-slate-500">
                Phase 08 analytics and reporting consumers need only bind to this view or the typed <code className="font-mono">LeadResearchReadModel</code> TypeScript interface.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Machine-Readable JSON */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[560px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-500" />
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                phase_08_handoff_contract.json
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Valid RFC 8259 JSON
            </span>
          </div>

          <div className="overflow-y-auto flex-1">
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {jsonString}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
