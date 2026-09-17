import React, { useState } from 'react';
import { PHASE_02_HANDOFF_JSON } from '../data/phase02Data';
import { Copy, Check, Download, FileJson, CheckCircle } from 'lucide-react';

export const Phase02HandoffViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(PHASE_02_HANDOFF_JSON, null, 2);

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
    a.download = 'phase-02-handoff-contract.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden p-6">
      <div className="border-b border-neutral-200 pb-4 mb-4 flex items-start justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-neutral-800" />
            <h2 className="text-xl font-semibold text-neutral-900 tracking-tight font-mono">
              Phase-02 Handoff Contract (JSON)
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              READY FOR PHASE 03
            </span>
          </div>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            Machine-readable architectural specification consumed by Phase 03 engineers. Defines raw record contracts, extraction boundaries, page states, and provenance schemas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 border border-neutral-900 rounded-md hover:bg-purple-700 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Contract JSON</span>
          </button>
        </div>
      </div>

      <div className="flex-1 border border-neutral-200 rounded-lg overflow-hidden flex flex-col bg-neutral-950">
        <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>phase-02-handoff-contract.json</span>
          <span>{new Blob([jsonString]).size} bytes</span>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-400 overflow-y-auto flex-1 leading-relaxed selection:bg-neutral-800 selection:text-white">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};
