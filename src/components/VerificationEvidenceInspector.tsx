import React, { useState, useMemo } from 'react';
import { executeVerification } from '../utils/verificationEngine';
import { VerificationEvidence, VerificationClaim, VerificationConflict } from '../types';
import {
  FileCheck,
  Search,
  Hash,
  ShieldCheck,
  ExternalLink,
  Layers,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Tag
} from 'lucide-react';

export const VerificationEvidenceInspector: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('apex-dental');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const presets = [
    {
      id: 'apex-dental',
      name: 'Apex Dental Care (Verified Multi-Signal)',
      url: 'https://apexdentalcare.com/invisalign-promo',
      advertiser: 'Apex Dental Care'
    },
    {
      id: 'vanguard-legal',
      name: 'Vanguard Legal Services (Public Contact E.164)',
      url: 'https://vanguardlegalservices.com/contact-us',
      advertiser: 'Vanguard Legal Services'
    },
    {
      id: 'conflicting-brands',
      name: 'Conflicting Brands (Lead Capture Intermediary)',
      url: 'https://affiliate-offer-hub.com/lead-capture',
      advertiser: 'Solar Solutions Midwest',
      override: {
        conflictingNames: ['Auto Insurance Saver', 'Zenith Home Loans LLC'],
        pageTitle: 'Auto Insurance Saver'
      }
    }
  ];

  const activePreset = presets.find((p) => p.id === selectedPreset) || presets[0];
  const summary = useMemo(() => {
    return executeVerification(activePreset.url, activePreset.advertiser, activePreset.override);
  }, [activePreset]);

  const filteredEvidence = useMemo(() => {
    return summary.evidence.filter((e) => {
      const q = searchFilter.toLowerCase();
      return (
        e.evidenceId.toLowerCase().includes(q) ||
        e.claimType.toLowerCase().includes(q) ||
        e.evidenceSnippet.toLowerCase().includes(q) ||
        String(e.observedValue).toLowerCase().includes(q)
      );
    });
  }, [summary.evidence, searchFilter]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50 overflow-y-auto">
      {/* Top Controls */}
      <div className="bg-white border-b border-neutral-200 p-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-semibold text-neutral-900">
                  Verification Evidence & Provenance Inspector
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                  FIELD-LEVEL PROVENANCE
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Inspect cryptographic evidence objects, extraction methods, DOM node snippets, and operator review packages.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-500">
                Total Evidence Records: <strong className="text-neutral-900">{summary.evidence.length}</strong>
              </span>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] w-full sm:w-auto">
              <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">
                Target Preset:
              </span>
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreset(p.id)}
                  className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition-colors ${
                    selectedPreset === p.id
                      ? 'bg-purple-600 text-white border-neutral-900 font-medium'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter evidence records..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Evidence Cards */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-4">
        {/* Target Header Summary */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-400 text-[11px]">TARGET ID:</span>
              <span className="font-mono font-bold text-neutral-900">{summary.targetId}</span>
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {summary.status}
              </span>
            </div>
            <div className="font-mono text-neutral-600 text-[11px] mt-1 break-all">
              {summary.targetUrl}
            </div>
          </div>

          <div className="flex items-center gap-4 text-neutral-500 font-mono text-[11px]">
            <div>Mode: <strong className="text-neutral-800">{summary.retrievalMode}</strong></div>
            <div>Claims: <strong className="text-neutral-800">{summary.claims.length}</strong></div>
            <div>Evidence: <strong className="text-neutral-800">{summary.evidence.length}</strong></div>
          </div>
        </div>

        {/* Evidence List */}
        <div className="grid grid-cols-1 gap-3">
          {filteredEvidence.map((ev) => (
            <div
              key={ev.evidenceId}
              className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs space-y-3 hover:border-neutral-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    {ev.evidenceId}
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {ev.claimType}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                    {ev.classification}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
                  <span>Confidence: <strong className="text-neutral-700">{ev.confidence}</strong></span>
                  <span>•</span>
                  <span>HTTP {ev.retrievalStatus}</span>
                  <span>•</span>
                  <button
                    onClick={() => handleCopy(ev.evidenceId, JSON.stringify(ev, null, 2))}
                    className="text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1"
                  >
                    {copiedId === ev.evidenceId ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === ev.evidenceId ? 'Copied' : 'JSON'}</span>
                  </button>
                </div>
              </div>

              {/* Observed Value & Snippet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-sans">
                    Observed Field Value
                  </span>
                  <div className="font-semibold text-neutral-900 break-all">
                    {String(ev.observedValue)}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-sans pt-1">
                    Extraction Method: <span className="font-mono font-medium text-neutral-700">{ev.extractionMethod}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-sans">
                    Evidence Snippet / DOM Text Anchor
                  </span>
                  <div className="text-neutral-700 text-[11px] leading-relaxed break-words">
                    &quot;{ev.evidenceSnippet}&quot;
                  </div>
                  <div className="text-[10px] text-neutral-400 font-sans pt-1">
                    Source: {ev.sourceDomain}
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-neutral-400 flex items-center justify-between pt-1">
                <span>Observed At: {new Date(ev.observedAt).toISOString()}</span>
                <span>Rule Version: {ev.verificationVersion}</span>
              </div>
            </div>
          ))}

          {filteredEvidence.length === 0 && (
            <div className="p-12 text-center text-neutral-500 text-xs bg-white rounded-lg border border-neutral-200">
              No evidence records matching &quot;{searchFilter}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
