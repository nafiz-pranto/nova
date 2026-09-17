import React, { useState } from 'react';
import { PHASE_05_HANDOFF_PAYLOAD } from '../data/phase05FixturesAndAudit';
import {
  FileCode,
  Copy,
  Download,
  CheckCircle2,
  Share2,
  ArrowRight,
  ShieldCheck,
  Layers,
  Database
} from 'lucide-react';

export const Phase05HandoffViewer: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const jsonString = JSON.stringify(PHASE_05_HANDOFF_PAYLOAD, null, 2);

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
    a.download = 'phase-05-handoff-contract.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-white border-b border-neutral-200 p-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-semibold text-neutral-900">
                  Phase 05 → Phase 06 Handoff Contract
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  ACCEPTED_PRODUCTION_READY
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Explicit schema definitions, confidence bounds, verified factual claims, and known unknowns handed off to Phase 06.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">JSON Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Contract</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-md hover:bg-purple-700 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* High-Level Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white rounded-lg border border-neutral-200 shadow-xs space-y-2">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
              What Phase 06 Receives
            </span>
            <ul className="space-y-1.5 text-neutral-700 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified factual claims &amp; evidence links</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Public business phone numbers &amp; emails</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Advertiser-to-Landing multi-signal consistency</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Preserved contradictions &amp; conflict alerts</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded-lg border border-neutral-200 shadow-xs space-y-2">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
              Known Unknowns &amp; Boundaries
            </span>
            <ul className="space-y-1.5 text-neutral-700 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Corporate holding structures remain unobserved</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Affiliate bridges require secondary attribution</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Geo-localized landing pages may vary</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded-lg border border-neutral-200 shadow-xs space-y-2">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
              Strict Non-Assumptions
            </span>
            <ul className="space-y-1.5 text-neutral-700 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>404 does NOT imply fraudulent business</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>No subjective reputation or lead score</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>Zero anti-bot evasion / stealth scraping</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Machine-Readable JSON Contract Viewer */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-purple-600 text-white flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>phase-05-handoff-contract.json</span>
            </div>
            <span className="text-[11px] text-neutral-400">Schema Version 5.0.0-PROD</span>
          </div>

          <pre className="p-4 text-[11px] font-mono bg-neutral-950 text-neutral-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
