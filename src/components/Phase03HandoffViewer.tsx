import React, { useState } from 'react';
import { PHASE_03_HANDOFF_JSON } from '../data/phase03FixturesAndAudit';
import { Copy, Download, CheckCircle2, FileJson, ArrowRight, ShieldCheck } from 'lucide-react';

export const Phase03HandoffViewer: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const jsonString = JSON.stringify(PHASE_03_HANDOFF_JSON, null, 2);

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
    a.download = 'phase-03-handoff-contract.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto p-6">
      {/* Header Banner */}
      <div className="border-b border-neutral-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-neutral-900 tracking-tight font-mono">
              Phase 03 Machine-Readable Handoff Contract
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              v3.0.0-PROD
            </span>
          </div>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            Authoritative JSON contract defining upstream Phase 02 bindings, downstream Phase 04 identity resolution interfaces, schemas, and verification parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 shadow-xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-purple-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Contract JSON</span>
          </button>
        </div>
      </div>

      {/* Contract Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 font-mono text-xs">
          <span className="text-[10px] text-neutral-500 uppercase block mb-1">Upstream Provider</span>
          <div className="font-bold text-neutral-900">PHASE 02: BROWSER WORKER</div>
          <p className="text-[11px] text-neutral-600 mt-1 font-sans">
            Method: <code className="text-neutral-800">IExtractionAdapter.extractBatch()</code>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 font-mono text-xs">
          <span className="text-[10px] text-neutral-500 uppercase block mb-1">Downstream Consumer</span>
          <div className="font-bold text-neutral-900">PHASE 04: IDENTITY RESOLUTION</div>
          <p className="text-[11px] text-neutral-600 mt-1 font-sans">
            Target: <code className="text-neutral-800">CanonicalAdEnvelope</code> over Kafka bus
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 font-mono text-xs">
          <span className="text-[10px] text-emerald-800 uppercase block mb-1">Audit Status</span>
          <div className="font-bold text-emerald-950 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            35/35 CRITERIA PASSED
          </div>
          <p className="text-[11px] text-emerald-800 mt-1 font-sans">
            Approved for Phase 04 entity clustering ingestion
          </p>
        </div>
      </div>

      {/* JSON Viewer */}
      <div className="border border-neutral-200 rounded-xl bg-neutral-900 p-4 shadow-xs flex-1 overflow-hidden flex flex-col font-mono">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <FileJson className="w-4 h-4" />
            phase-03-handoff-contract.json
          </span>
          <span className="text-[10px]">UTF-8 • JSON Schema Validated</span>
        </div>
        <pre className="overflow-y-auto flex-1 text-xs text-emerald-300 leading-relaxed max-h-[600px]">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};
