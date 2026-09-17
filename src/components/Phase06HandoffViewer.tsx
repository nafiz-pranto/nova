import React, { useState } from 'react';
import { PHASE_06_HANDOFF_PAYLOAD } from '../data/phase06FixturesAndAudit';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Database,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const Phase06HandoffViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(PHASE_06_HANDOFF_PAYLOAD, null, 2);

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
    a.download = `phase-06-handoff-contract-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Phase 06 → Phase 07 Handoff
            </span>
            <span className="text-xs font-mono text-neutral-500">
              Durable Schema Contract & Persistence Specification
            </span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-1">
            Machine-Readable Handoff Contract
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-purple-700 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Contract</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-[10px] font-mono uppercase font-bold text-neutral-400">Schema Version</div>
          <div className="text-lg font-bold font-mono text-neutral-900 mt-1">
            {PHASE_06_HANDOFF_PAYLOAD.qualificationSchemaVersion}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">Authoritative for Phase 07</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-[10px] font-mono uppercase font-bold text-neutral-400">Active Scoring Model</div>
          <div className="text-lg font-bold font-mono text-neutral-900 mt-1">
            {PHASE_06_HANDOFF_PAYLOAD.scoringModelId}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">v{PHASE_06_HANDOFF_PAYLOAD.scoringModelVersion}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-[10px] font-mono uppercase font-bold text-neutral-400">Database Tables Defined</div>
          <div className="text-lg font-bold font-mono text-emerald-700 mt-1">
            {PHASE_06_HANDOFF_PAYLOAD.phase7PersistenceRequirements.tables.length} Target Tables
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">Fully indexed relational layout</div>
        </div>
      </div>

      {/* Target Schema Tables */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Phase 07 Relational Persistence Specifications
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {PHASE_06_HANDOFF_PAYLOAD.phase7PersistenceRequirements.tables.map(tbl => (
            <div key={tbl.name} className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-neutral-900">{tbl.name}</span>
                <span className="font-mono text-[10px] text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                  PK: {tbl.primaryKey}
                </span>
              </div>
              <p className="text-neutral-600 text-[11px]">{tbl.description}</p>
              <div className="pt-2 border-t border-neutral-200 flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="text-neutral-400">Indices:</span>
                {tbl.indices.map(idx => (
                  <span key={idx} className="bg-neutral-200/70 text-neutral-700 px-1.5 py-0.2 rounded">
                    {idx}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Formatted JSON Contract */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-neutral-500" />
            <span className="text-xs font-bold text-neutral-900 font-mono">
              phase_06_handoff_contract.json
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">
            {jsonString.split('\n').length} lines
          </span>
        </div>
        <div className="p-4 bg-neutral-900 overflow-x-auto max-h-[500px]">
          <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
