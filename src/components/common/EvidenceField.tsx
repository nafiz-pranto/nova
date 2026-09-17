import React, { useState } from 'react';
import { 
  Info, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Database, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export type DataOriginCategory = 
  | 'OBSERVED' 
  | 'NORMALIZED' 
  | 'DERIVED' 
  | 'INFERRED' 
  | 'VERIFIED' 
  | 'CONFLICTING';

export interface EvidenceMetadata {
  observedValue: string | number;
  source: string;
  observedAt: string;
  normalizedValue?: string | number;
  verificationState?: 'VERIFIED' | 'FAILED' | 'PENDING' | 'SKIPPED';
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | number;
  versionMetadata?: string;
  rawDomTokenHash?: string;
  classification?: DataOriginCategory;
  isSensitive?: boolean;
}

interface EvidenceFieldProps {
  label: string;
  evidence: EvidenceMetadata;
  href?: string;
  className?: string;
  compact?: boolean;
}

export const EvidenceField: React.FC<EvidenceFieldProps> = ({
  label,
  evidence,
  href,
  className = '',
  compact = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const classification = evidence.classification || 'OBSERVED';

  const classificationConfig: Record<DataOriginCategory, { label: string; bg: string; text: string; border: string }> = {
    OBSERVED: {
      label: 'Observed Fact',
      bg: 'bg-neutral-100',
      text: 'text-neutral-700',
      border: 'border-neutral-300',
    },
    NORMALIZED: {
      label: 'Normalized',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    VERIFIED: {
      label: 'Verified Destination',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    DERIVED: {
      label: 'Calculated / Derived',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    INFERRED: {
      label: 'Statistical Inference',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    CONFLICTING: {
      label: 'Disputed Fact',
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
    },
  };

  const currentCfg = classificationConfig[classification] || classificationConfig.OBSERVED;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`rounded-lg border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-xs ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span 
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${currentCfg.bg} ${currentCfg.text} ${currentCfg.border}`}
            title={`Data provenance category: ${currentCfg.label}`}
          >
            {classification === 'INFERRED' ? '⚠️ INFERRED' : classification}
          </span>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-label={`Show provenance details for ${label}`}
            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900"
            title="Inspect factual evidence and lineage"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-neutral-900 break-words min-w-0 font-sans">
          {href ? (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:underline text-neutral-900 flex items-center gap-1 font-mono text-xs"
            >
              <span>{evidence.observedValue}</span>
              <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
            </a>
          ) : (
            <span className="font-mono text-xs text-neutral-900">{evidence.observedValue}</span>
          )}
        </div>

        {evidence.confidence && (
          <span className="text-[10px] font-mono text-neutral-500 shrink-0">
            Conf: {typeof evidence.confidence === 'number' ? `${(evidence.confidence * 100).toFixed(0)}%` : evidence.confidence}
          </span>
        )}
      </div>

      {/* Expandable Lineage & Evidence Panel */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-neutral-100 text-[11px] space-y-2 bg-neutral-50/70 p-2.5 rounded-md font-mono text-neutral-600 animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-2">
            <span className="text-neutral-400">Observed Value:</span>
            <span className="font-semibold text-neutral-800 text-right truncate max-w-[200px]" title={String(evidence.observedValue)}>
              {evidence.observedValue}
            </span>
          </div>

          {evidence.normalizedValue && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-neutral-400">Normalized:</span>
              <span className="font-semibold text-blue-700 text-right truncate max-w-[200px]" title={String(evidence.normalizedValue)}>
                {evidence.normalizedValue}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <span className="text-neutral-400">Source:</span>
            <span className="text-neutral-700 text-right truncate max-w-[220px]" title={evidence.source}>
              {evidence.source}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <span className="text-neutral-400">Observed At:</span>
            <span className="text-neutral-700 text-right">
              {new Date(evidence.observedAt).toLocaleString()}
            </span>
          </div>

          {evidence.verificationState && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-neutral-400">Verification:</span>
              <StatusBadge status={evidence.verificationState === 'VERIFIED' ? 'VERIFIED' : 'REVIEW_REQUIRED'} size="sm" />
            </div>
          )}

          {evidence.versionMetadata && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-neutral-400">Engine Version:</span>
              <span className="text-neutral-700 text-right text-[10px]">
                {evidence.versionMetadata}
              </span>
            </div>
          )}

          {evidence.rawDomTokenHash && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200">
              <span className="text-neutral-400">Evidence Hash:</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-500 font-mono truncate max-w-[130px]">
                  {evidence.rawDomTokenHash}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(evidence.rawDomTokenHash || '')}
                  className="p-0.5 text-neutral-400 hover:text-neutral-700"
                  title="Copy SHA-256 evidence hash"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
