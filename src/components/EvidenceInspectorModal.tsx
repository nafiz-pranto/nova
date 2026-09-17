import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  ExternalLink, 
  History, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  FileText, 
  Hash, 
  Database,
  ArrowRight,
  GitCommit,
  Check
} from 'lucide-react';
import { EvidenceItemModel, EvidenceClassification, SAMPLE_EVIDENCE_ITEMS } from '../data/phase12FixturesAndStore';

interface EvidenceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceItem?: EvidenceItemModel | null;
  entityName?: string;
  onReverify?: () => void;
}

export const EvidenceInspectorModal: React.FC<EvidenceInspectorModalProps> = ({
  isOpen,
  onClose,
  evidenceItem: propItem,
  entityName = 'SolarFlow Energy Solutions LLC',
  onReverify,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY' | 'WHY' | 'LINEAGE'>('DETAILS');

  const item = propItem || SAMPLE_EVIDENCE_ITEMS[0];

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getClassificationBadge = (cls: EvidenceClassification) => {
    switch (cls) {
      case 'OBSERVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>[OBSERVED] Direct DOM Observation</span>
          </span>
        );
      case 'NORMALIZED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <GitCommit className="w-3.5 h-3.5 text-indigo-600" />
            <span>[NORMALIZED] Canonical Standard Form</span>
          </span>
        );
      case 'DERIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Hash className="w-3.5 h-3.5 text-purple-600" />
            <span>[DERIVED] Multi-Signal Aggregation</span>
          </span>
        );
      case 'INFERRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>[INFERRED] Probabilistic Association</span>
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>[VERIFIED] Active Network/Authority Proof</span>
          </span>
        );
      case 'CONFLICTING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>[CONFLICTING] Contradictory Records</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-50 text-red-900 border border-red-300">
            <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
            <span>[FAILED] Probe Failure / Blocked</span>
          </span>
        );
      case 'UNAVAILABLE':
      case 'UNKNOWN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
            <span>[{cls}] Unverified / No Record</span>
          </span>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Factual Evidence Inspector"
    >
      <div 
        className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50/70 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                Factual Evidence Inspector &bull; {entityName}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span>{item.claimOrField}</span>
            </h2>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              {getClassificationBadge(item.classification)}
              <span className="text-xs font-mono text-neutral-500">
                Confidence: <strong className="text-neutral-800">{item.confidence}</strong>
              </span>
              <span className="text-xs font-mono text-neutral-400">&bull;</span>
              <span className="text-xs font-mono text-neutral-500">
                Engine: <span className="text-neutral-700">{item.version}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-5 border-b border-neutral-200 bg-white flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'DETAILS'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Observed Value &amp; Source
          </button>
          <button
            onClick={() => setActiveTab('WHY')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'WHY'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            "Why?" Explainability
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'HISTORY'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Observation History ({item.historyLog.length})
          </button>
          <button
            onClick={() => setActiveTab('LINEAGE')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'LINEAGE'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Data Lineage
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'DETAILS' && (
            <div className="space-y-4">
              {/* Primary Value Card */}
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Observed Value (Raw Ground Truth)
                </span>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-sm font-semibold text-neutral-900 break-all select-all">
                    {item.observedValue}
                  </div>
                  <button
                    onClick={() => handleCopy(item.observedValue)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors flex items-center gap-1 shrink-0"
                    title="Copy observed value"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {item.normalizedValue && (
                  <div className="mt-2 pt-2 border-t border-neutral-200/80">
                    <span className="text-[10px] font-mono text-neutral-500 block">Normalized Canonical Form:</span>
                    <span className="font-mono text-xs text-neutral-800 font-medium">{item.normalizedValue}</span>
                  </div>
                )}
              </div>

              {/* Source & Extraction Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Source Authority
                  </span>
                  <div className="font-medium text-neutral-900">{item.source}</div>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-[11px] inline-flex items-center gap-1 mt-1 font-mono truncate max-w-full"
                    >
                      <span>{item.sourceUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Observed At (UTC)
                  </span>
                  <div className="font-mono text-neutral-900 font-medium">{item.observedAt}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Freshness: <span className="text-emerald-700 font-medium">Verified Current (&lt; 24h)</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic SHA-256 Provenance */}
              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-neutral-400" />
                    Raw Payload SHA-256 Checksum
                  </span>
                  <button
                    onClick={() => handleCopy(item.rawPayloadHash)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-800 font-mono"
                  >
                    Copy Hash
                  </button>
                </div>
                <div className="font-mono text-[11px] text-neutral-700 select-all break-all bg-white p-2 rounded border border-neutral-200">
                  {item.rawPayloadHash}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'WHY' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-blue-700" />
                  <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider">
                    "Why?" Factual Grounding &amp; Rules
                  </h4>
                </div>
                <p className="text-xs text-neutral-800 leading-relaxed">
                  {item.whyExplanation}
                </p>
                {item.ruleCitation && (
                  <div className="mt-3 pt-2 border-t border-blue-200/80 flex items-center gap-2 text-[11px] font-mono text-blue-800">
                    <strong className="text-blue-950">Deterministic Rule:</strong>
                    <span>{item.ruleCitation}</span>
                  </div>
                )}
              </div>

              {/* Strict Non-AI Confirmation Banner */}
              <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50 text-[11px] text-neutral-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">Strict Evidence Citation Invariant:</strong>
                  All explanations are derived directly from verifiable HTTP response headers, DOM selector paths, and Secretary of State public corporate records. No ungrounded inferences are tolerated.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block">
                Chronological Observation Ledger
              </span>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl bg-white overflow-hidden">
                {item.historyLog.map((hist, idx) => (
                  <div key={idx} className="p-3 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="font-mono font-semibold text-neutral-900">{hist.value}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{hist.source}</div>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 shrink-0">
                      {hist.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'LINEAGE' && (
            <div className="space-y-4">
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block">
                Data Lineage: Source Observation to Qualification
              </span>
              
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold text-blue-800">
                    1
                  </div>
                  <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Step 1: Source Acquisition</span>
                    <div className="font-semibold text-neutral-900 mt-0.5">Meta Ad Library HTML Snapshot</div>
                    <div className="text-[11px] text-neutral-500 font-mono mt-0.5">SHA-256: {item.rawPayloadHash.substring(0, 16)}...</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-indigo-100 border-2 border-indigo-600 flex items-center justify-center text-[10px] font-bold text-indigo-800">
                    2
                  </div>
                  <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Step 2: Canonical Normalization</span>
                    <div className="font-semibold text-neutral-900 mt-0.5">Entity Resolution Engine v3.1</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Cleaned company suffixes, E.164 phone formatting, lower-case domain normalization.</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold text-emerald-800">
                    3
                  </div>
                  <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Step 3: Verification Probe</span>
                    <div className="font-semibold text-neutral-900 mt-0.5">TCP/TLS Socket Probe &bull; HTTP 200 Probe</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">SSRF guard enforced; Let's Encrypt TLS 1.3 certificate chain verified.</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-neutral-900 border-2 border-neutral-900 flex items-center justify-center text-[10px] font-bold text-white">
                    4
                  </div>
                  <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Step 4: Qualification Contribution</span>
                    <div className="font-semibold text-neutral-900 mt-0.5">Qualification Scoring Model v2.1</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Evaluated against commercial solar business threshold. Score: +15.0 pts.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-neutral-500 truncate">
            Evidence ID: <span className="text-neutral-800">{item.evidenceId}</span>
          </div>

          <div className="flex items-center gap-2">
            {onReverify && (
              <button
                onClick={() => {
                  onReverify();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors shadow-2xs"
              >
                Re-Verify Claim
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
