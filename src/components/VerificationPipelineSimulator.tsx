import React, { useState, useMemo } from 'react';
import {
  executeVerification,
  validateUrlSafety,
  UrlSafetyEvaluation
} from '../utils/verificationEngine';
import {
  VerificationSummary,
  VerificationClaim,
  VerificationEvidence,
  VerificationState,
  ConfidenceLevel
} from '../types';
import {
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  Layers,
  Activity,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface PresetScenario {
  id: string;
  name: string;
  url: string;
  advertiser: string;
  badge: string;
  description: string;
  override?: Parameters<typeof executeVerification>[2];
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'valid-corp',
    name: 'Verified Business Landing (Apex Dental)',
    url: 'https://apexdentalcare.com/invisalign-promo',
    advertiser: 'Apex Dental Care',
    badge: 'VERIFIED',
    description: 'Fully consistent dental practice with matching H1, verified E.164 phone, domain email, and TLS 1.3.'
  },
  {
    id: 'ssrf-attack',
    name: 'Malicious Cloud Metadata SSRF',
    url: 'http://169.254.169.254/latest/meta-data/',
    advertiser: 'Cloud Systems Direct',
    badge: 'SSRF BLOCKED',
    description: 'Untrusted ad link attempting exfiltration of AWS/GCP instance credentials.'
  },
  {
    id: 'loopback-attack',
    name: 'Localhost / 127.0.0.1 Loopback Probe',
    url: 'http://127.0.0.1:3000/internal-metrics',
    advertiser: 'DevOps Tools',
    badge: 'SSRF BLOCKED',
    description: 'Attempt to probe internal container port 3000 via loopback address.'
  },
  {
    id: 'http-404',
    name: 'Deleted Campaign Page (HTTP 404)',
    url: 'https://acmeplumbing.com/expired-summer-offer',
    advertiser: 'Acme Plumbing',
    badge: 'UNAVAILABLE (404)',
    description: 'Path returns 404. Verifier asserts path is unavailable without claiming business is invalid.',
    override: { httpStatus: 404 }
  },
  {
    id: 'unreachable-host',
    name: 'Unreachable Server (Connection Refused)',
    url: 'https://down-dental-server.org',
    advertiser: 'Metro Dentistry',
    badge: 'UNAVAILABLE',
    description: 'DNS resolves, but TCP SYN is refused. Failure semantics preserve neutral uncertainty.',
    override: { isUnreachable: true }
  },
  {
    id: 'captcha-blocked',
    name: 'Cloudflare Turnstile CAPTCHA Wall',
    url: 'https://protected-dropship-store.shop',
    advertiser: 'Trend Deals Direct',
    badge: 'BLOCKED (CAPTCHA)',
    description: 'Interactive challenge presented. Verification stops immediately with zero evasion.',
    override: { isCaptcha: true }
  },
  {
    id: 'conflicting-brands',
    name: 'Conflicting Disparate Brands',
    url: 'https://affiliate-offer-hub.com/lead-capture',
    advertiser: 'Solar Solutions Midwest',
    badge: 'CONFLICT',
    description: 'Header promotes Auto Insurance while footer claims Zenith Home Loans. Operator review flagged.',
    override: {
      conflictingNames: ['Auto Insurance Saver', 'Zenith Home Loans LLC'],
      pageTitle: 'Auto Insurance Saver'
    }
  },
  {
    id: 'js-spa',
    name: 'Client-Side Rendered SPA (React/Vue)',
    url: 'https://modern-react-dashboard.app',
    advertiser: 'Modern SaaS Platform',
    badge: 'SPA EVAL',
    description: 'Empty root DOM dynamically evaluated using headless Playwright engine in isolated cgroup.',
    override: { isJsSpa: true, pageTitle: 'Modern SaaS Platform' }
  }
];

export const VerificationPipelineSimulator: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('valid-corp');
  const [inputUrl, setInputUrl] = useState<string>(PRESET_SCENARIOS[0].url);
  const [inputAdvertiser, setInputAdvertiser] = useState<string>(PRESET_SCENARIOS[0].advertiser);
  const [activeLayer, setActiveLayer] = useState<number>(10);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const selectedPreset = PRESET_SCENARIOS.find((p) => p.id === selectedPresetId) || PRESET_SCENARIOS[0];

  const handleSelectPreset = (preset: PresetScenario) => {
    setSelectedPresetId(preset.id);
    setInputUrl(preset.url);
    setInputAdvertiser(preset.advertiser);
    setActiveLayer(10);
  };

  const summary: VerificationSummary = useMemo(() => {
    return executeVerification(inputUrl, inputAdvertiser, selectedPreset.override);
  }, [inputUrl, inputAdvertiser, selectedPreset]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setActiveLayer(1);
    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step <= 10) {
        setActiveLayer(step);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 180);
  };

  const layers = [
    { num: 1, name: 'LAYER 1: URL Safety & SSRF', status: summary.claims.find((c) => c.claimType === 'URL_SAFE')?.isSupported ? 'PASS' : 'FAIL' },
    { num: 2, name: 'LAYER 2: Network & DNS', status: summary.claims.find((c) => c.claimType === 'DOMAIN_RESOLVES')?.isSupported ? 'PASS' : 'FAIL' },
    { num: 3, name: 'LAYER 3: HTTP/HTTPS & TLS', status: summary.claims.find((c) => c.claimType === 'HTTPS_AVAILABLE')?.isSupported ? 'PASS' : 'WARN' },
    { num: 4, name: 'LAYER 4: Page Reachability', status: summary.claims.find((c) => c.claimType === 'PAGE_REACHABLE')?.isSupported ? 'PASS' : 'FAIL' },
    { num: 5, name: 'LAYER 5: Content Extraction', status: summary.claims.find((c) => c.claimType === 'PAGE_CONTENT_ACCESSIBLE')?.isSupported ? 'PASS' : 'FAIL' },
    { num: 6, name: 'LAYER 6: Business Identity', status: summary.claims.find((c) => c.claimType === 'BUSINESS_NAME_VISIBLE')?.isSupported ? 'PASS' : 'WARN' },
    { num: 7, name: 'LAYER 7: Advertiser Consistency', status: summary.claims.find((c) => c.claimType === 'DESTINATION_MATCHES_ADVERTISER_NAME')?.isSupported ? 'PASS' : 'WARN' },
    { num: 8, name: 'LAYER 8: Contact Anchors', status: summary.claims.find((c) => c.claimType === 'CONTACT_INFO_PRESENT')?.isSupported ? 'PASS' : 'WARN' },
    { num: 9, name: 'LAYER 9: Conflict Detection', status: summary.conflicts.length > 0 ? 'FAIL' : 'PASS' },
    { num: 10, name: 'LAYER 10: Summary Synthesis', status: summary.status.startsWith('VERIFIED') ? 'PASS' : summary.status === 'ERROR' || summary.status === 'BLOCKED' ? 'FAIL' : 'WARN' }
  ];

  const getStatusColor = (st: VerificationState) => {
    switch (st) {
      case 'VERIFIED_ADVERTISER_DESTINATION_CONSISTENCY':
      case 'VERIFIED_BUSINESS_IDENTITY_EVIDENCE':
      case 'VERIFIED_PUBLIC_URL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PARTIALLY_VERIFIED':
      case 'INCONCLUSIVE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFLICTING_EVIDENCE':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'UNAVAILABLE':
      case 'BLOCKED':
      case 'ERROR':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50 overflow-y-auto">
      {/* Top Controls Bar */}
      <div className="bg-white border-b border-neutral-200 p-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-semibold text-neutral-900">
                  Phase 05 Verification Pipeline Simulator (10 Layers)
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  v5.0.0-PROD
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Execute strict SSRF security, DNS resolution, bounded retrieval, multi-signal consistency, and conflict triage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSimulating ? 'Simulating Layers...' : 'Run Pipeline'}</span>
              </button>
              <button
                onClick={() => handleSelectPreset(selectedPreset)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Presets Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">
              Presets:
            </span>
            {PRESET_SCENARIOS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition-all text-left ${
                  selectedPresetId === p.id
                    ? 'bg-purple-600 text-white border-neutral-900 font-semibold shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          {/* Interactive Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Target Destination URL (Untrusted Input)
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full text-xs font-mono px-3 py-1.5 bg-white border border-neutral-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Phase 04 Advertiser Candidate Name
              </label>
              <input
                type="text"
                value={inputAdvertiser}
                onChange={(e) => setInputAdvertiser(e.target.value)}
                className="w-full text-xs font-mono px-3 py-1.5 bg-white border border-neutral-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Layer Execution Progress Steps */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-xs">
          <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>10-Layer Execution Architecture</span>
            <span className="text-neutral-400 font-normal normal-case">
              Active Layer: {activeLayer} / 10
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 text-center text-[10px]">
            {layers.map((l) => {
              const isPassed = l.num <= activeLayer;
              const isCurrent = l.num === activeLayer;
              return (
                <div
                  key={l.num}
                  className={`p-2 rounded border transition-all ${
                    isCurrent
                      ? 'bg-purple-600 text-white border-neutral-900 font-bold ring-2 ring-neutral-400'
                      : isPassed
                      ? l.status === 'PASS'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : l.status === 'FAIL'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                  }`}
                >
                  <div className="font-mono font-bold text-xs mb-0.5">L{l.num}</div>
                  <div className="truncate font-medium">{l.name.replace(/^LAYER \d+: /, '')}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status & Telemetry Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Status Card */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Verification Output State
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  Target ID: {summary.targetId}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold border ${getStatusColor(
                    summary.status
                  )}`}
                >
                  {summary.status}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {summary.retrievalMode}
                </span>
              </div>
              {summary.warnings.length > 0 && (
                <div className="mt-3 p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="font-medium text-[11px] leading-relaxed">
                    {summary.warnings[0]}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Evaluated: {new Date(summary.checkedAt).toLocaleTimeString()}</span>
              <span>Rule Version: {summary.verificationVersion}</span>
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 p-4 shadow-xs">
            <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-neutral-500" />
              <span>Real-Time Telemetry & Resource Budget</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2 rounded bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">DNS Latency</span>
                <span className="font-mono font-bold text-neutral-800">
                  {summary.metrics.dnsTimeMs} ms
                </span>
              </div>
              <div className="p-2 rounded bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">TCP / TLS</span>
                <span className="font-mono font-bold text-neutral-800">
                  {summary.metrics.connectionTimeMs + summary.metrics.tlsTimeMs} ms
                </span>
              </div>
              <div className="p-2 rounded bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">Bytes Retrieved</span>
                <span className="font-mono font-bold text-neutral-800">
                  {(summary.metrics.bytesRetrieved / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="p-2 rounded bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">Total Duration</span>
                <span className="font-mono font-bold text-neutral-800">
                  {summary.metrics.totalDurationMs} ms
                </span>
              </div>
            </div>
            <p className="text-[10px] text-neutral-400 mt-3 font-normal">
              Enforces hard limits: Max 5,242,880 bytes (5MB), 10s timeout, max 3 pages, strict domain boundary.
            </p>
          </div>
        </div>

        {/* Decomposed Claims Grid */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Decomposed Independent Factual Claims
              </h3>
              <p className="text-xs text-neutral-500">
                Every claim is verified independently with its own evidence references and confidence level.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
              {summary.claims.filter((c) => c.isSupported).length} / {summary.claims.length} SUPPORTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.claims.map((claim) => (
              <div
                key={claim.claimType}
                className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                  claim.isSupported
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-neutral-50 border-neutral-200 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-[11px] text-neutral-900 truncate">
                      {claim.claimType}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        claim.isSupported
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {claim.isSupported ? 'SUPPORTED' : 'NOT FOUND'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 line-clamp-2">
                    {claim.explanation}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                  <span>Confidence: {claim.confidence}</span>
                  <span>{claim.evidenceIds.length} Evidence Links</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conflicts Alert Box (if any) */}
        {summary.conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <h3 className="text-xs font-bold text-red-950 uppercase tracking-wider">
                Material Verification Conflicts Detected ({summary.conflicts.length})
              </h3>
            </div>
            {summary.conflicts.map((conf) => (
              <div
                key={conf.conflictId}
                className="bg-white rounded p-3 border border-red-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-red-900">{conf.conflictType}</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                    {conf.severity}
                  </span>
                </div>
                <p className="text-neutral-700 text-[11px]">{conf.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-neutral-100 font-mono text-[10px] text-neutral-500">
                  <div>Claim A: {conf.evidenceA}</div>
                  <div>Claim B: {conf.evidenceB}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
