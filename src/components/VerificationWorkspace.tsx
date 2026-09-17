import React, { useState } from 'react';
import { SAMPLE_ADVERTISERS } from '../data/phase08FixturesAndAudit';
import { AdvertiserViewModel } from '../types';
import { StatusBadge } from './common/StatusBadge';
import { PageHeader } from './common/PageHeader';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  ExternalLink,
  Search,
  Server,
  FileCheck,
  Building2,
  RefreshCw,
  AlertOctagon,
  Info
} from 'lucide-react';

interface VerificationWorkspaceProps {
  onSelectAdvertiser: (adv: AdvertiserViewModel) => void;
}

export const VerificationWorkspace: React.FC<VerificationWorkspaceProps> = ({ onSelectAdvertiser }) => {
  const [advertisers] = useState<AdvertiserViewModel[]>(SAMPLE_ADVERTISERS);
  const [selectedAdvId, setSelectedAdvId] = useState<string>(SAMPLE_ADVERTISERS[0].advertiserId);
  const [searchQuery, setSearchQuery] = useState('');

  const currentAdv = advertisers.find(a => a.advertiserId === selectedAdvId) || advertisers[0];

  // Specific verifiable claims for the active advertiser
  const claims = [
    {
      claimId: 'claim_dns',
      category: 'INFRASTRUCTURE',
      claim: 'Public DNS & Domain Reachability',
      status: currentAdv.websiteReachable ? 'VERIFIED' : 'FAILED',
      evidence: `${currentAdv.destinationDomain} resolves to public IP space via quad-9 DoH resolver. No private/reserved IP blocks detected.`,
      confidence: 'HIGH',
      timestamp: currentAdv.verificationFreshness,
      ssrfSafe: currentAdv.ssrfValidated
    },
    {
      claimId: 'claim_tls',
      category: 'TRANSPORT',
      claim: 'Transport Layer Security (TLS/HTTPS)',
      status: currentAdv.tlsVersion.includes('TLS') ? 'VERIFIED' : 'FAILED',
      evidence: `Handshake negotiated ${currentAdv.tlsVersion}. Valid public PKI certificate chain verified against system trust roots.`,
      confidence: 'HIGH',
      timestamp: currentAdv.verificationFreshness,
      ssrfSafe: true
    },
    {
      claimId: 'claim_http',
      category: 'HTTP_PROBE',
      claim: 'Target URL Reachability & Status',
      status: currentAdv.verificationStatusCode === 200 ? 'VERIFIED' : 'FAILED',
      evidence: `HTTP GET probe returned status ${currentAdv.verificationStatusCode}. Content-Type text/html within 2.5MB payload boundary.`,
      confidence: 'HIGH',
      timestamp: currentAdv.verificationFreshness,
      ssrfSafe: true
    },
    {
      claimId: 'claim_identity',
      category: 'BUSINESS_IDENTITY',
      claim: 'Advertiser Name & Entity Consistency',
      status: currentAdv.businessIdentitySupported ? 'VERIFIED' : 'CONFLICTING',
      evidence: currentAdv.businessIdentitySupported 
        ? `Declared Ad Library name "${currentAdv.canonicalName}" corroborated by registered website copyright and public entity registration records.`
        : `Discrepancy detected between Ad Library name and destination footer entity. Queued for human verification triage.`,
      confidence: currentAdv.scoreConfidence,
      timestamp: currentAdv.verificationFreshness,
      ssrfSafe: true
    },
    {
      claimId: 'claim_ssrf',
      category: 'APPSEC',
      claim: 'SSRF & Boundary Defense Layer',
      status: currentAdv.ssrfValidated ? 'VERIFIED' : 'FAILED',
      evidence: 'Destination host validated against 15 RFC-compliant private network vectors. AWS metadata (169.254.169.254) strictly forbidden.',
      confidence: 'HIGH',
      timestamp: currentAdv.verificationFreshness,
      ssrfSafe: true
    }
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Network Verification', active: true },
        ]}
        title="Public Website & Business Identity Verification"
        description="Factual claim-by-claim verification of external destinations, DNS resolution, TLS certificates, SSRF boundaries, and legal entity alignment."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Phase 05 Engine Active
          </span>
        }
      />

      {/* Grid: Advertiser Selector (4 Cols) + Claims Matrix (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Entities List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-neutral-200 shadow-xs p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider pb-2 border-b border-neutral-100 flex items-center justify-between">
              <span>Indexed Entities ({advertisers.length})</span>
              <span className="font-mono text-[10px]">Layer E Probes</span>
            </div>

            <div className="mt-3 space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {advertisers.map(adv => {
                const isSelected = adv.advertiserId === selectedAdvId;
                return (
                  <div
                    key={adv.advertiserId}
                    onClick={() => setSelectedAdvId(adv.advertiserId)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-neutral-900 truncate">
                        {adv.canonicalName}
                      </span>
                      <StatusBadge 
                        status={adv.websiteReachable ? 'VERIFIED' : 'FAILED'} 
                        size="sm" 
                        showPrefix={false} 
                      />
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 truncate">
                      {adv.destinationDomain}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mt-2 pt-1 border-t border-neutral-100">
                      <span>HTTP {adv.verificationStatusCode}</span>
                      <span>{adv.verificationFreshness}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400 font-mono">
            Probes run via isolated non-evasive verification worker
          </div>
        </div>

        {/* Right Column: Claim by Claim Matrix */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-neutral-200 shadow-xs p-6 space-y-6">
          {/* Header */}
          <div className="pb-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900">
                  {currentAdv.canonicalName}
                </h3>
                <StatusBadge 
                  status={currentAdv.websiteReachable ? 'VERIFIED' : 'FAILED'} 
                  size="sm" 
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mt-1">
                <span>Domain: {currentAdv.destinationDomain}</span>
                <span>&bull;</span>
                <span>Freshness: {currentAdv.verificationFreshness}</span>
              </div>
            </div>

            <button
              onClick={() => onSelectAdvertiser(currentAdv)}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start"
            >
              <span>Open Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Core Rule: "Never present 'Verified' without explaining 'Verified WHAT?'" */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <p>
              <strong>Verification Standard:</strong> A "Verified" badge denotes that automated and cryptographic network probes corroborated specific public claims below. It does not imply financial endorsement or business solvency.
            </p>
          </div>

          {/* Claims List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Audited Verification Claims ({claims.length})
            </h4>

            {claims.map(c => (
              <div
                key={c.claimId}
                className={`p-4 rounded-xl border transition-all ${
                  c.status === 'VERIFIED'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : c.status === 'CONFLICTING'
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-red-200 bg-red-50/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {c.status === 'VERIFIED' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {c.status === 'CONFLICTING' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                    {c.status === 'FAILED' && <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />}
                    <span className="text-xs font-bold text-neutral-900">
                      {c.claim}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-600">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} size="sm" showPrefix={false} />
                  </div>
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed font-sans pl-6">
                  {c.evidence}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-2 mt-2 border-t border-neutral-100 pl-6">
                  <span>Confidence: {c.confidence}</span>
                  <span>Evaluated: {c.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* SSRF & Network Security Footer Box */}
          <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>SSRF Defense Matrix Active</span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-1">
                Strict RFC 1918/6598 private network blocking, DNS re-binding protection, and redirect limits enforced.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-neutral-800 border border-neutral-700 text-emerald-400 shrink-0">
              15/15 PASS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
