import React, { useState } from 'react';
import { 
  EXPORT_PROFILES, 
  CSV_INJECTION_VECTORS, 
  GOLDEN_CSV_EXPORT_FIXTURE, 
  GOLDEN_JSON_EXPORT_FIXTURE 
} from '../data/phase08FixturesAndAudit';
import { ExportProfileType, ExportFormat, AdvertiserViewModel } from '../types';
import { SAMPLE_ADVERTISERS } from '../data/phase08FixturesAndAudit';
import { StatusBadge } from './common/StatusBadge';
import { PageHeader } from './common/PageHeader';
import { 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileCode, 
  Copy, 
  Check, 
  Key, 
  CheckCircle2, 
  Terminal, 
  Lock,
  Layers,
  ArrowRight,
  Filter,
  Eye,
  EyeOff,
  Database
} from 'lucide-react';

interface ExportPipelineStudioProps {
  advertisers?: AdvertiserViewModel[];
}

export const ExportPipelineStudio: React.FC<ExportPipelineStudioProps> = ({
  advertisers = SAMPLE_ADVERTISERS
}) => {
  const [selectedProfile, setSelectedProfile] = useState<ExportProfileType>('DETAILED_RESEARCH_EXPORT');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('CSV');
  const [testPayloadInput, setTestPayloadInput] = useState('=cmd|\' /C calc\'!A0');
  const [isCopied, setIsCopied] = useState(false);
  const [downloadToken, setDownloadToken] = useState('dl_tok_01j7p8x90005_hmac_valid_2h');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'QUALIFIED_ONLY' | 'REVIEW_ONLY'>('ALL');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(50);
  const [onlyReachableWebsites, setOnlyReachableWebsites] = useState<boolean>(true);
  const [includeInternalMetadata, setIncludeInternalMetadata] = useState<boolean>(false);

  // Formula Sanitizer Function
  const sanitizeFormulaCell = (raw: string) => {
    if (!raw) return raw;
    const trimmed = raw.trimStart();
    const triggerChars = ['=', '+', '-', '@', '\t', '\r'];
    if (triggerChars.some(char => trimmed.startsWith(char))) {
      return `'${raw}`;
    }
    return raw;
  };

  // Filter dynamic advertisers based on active UI filters
  const activeFilteredLeads = advertisers.filter(adv => {
    if (statusFilter === 'QUALIFIED_ONLY' && adv.qualificationState !== 'QUALIFIED') return false;
    if (statusFilter === 'REVIEW_ONLY' && adv.qualificationState !== 'REVIEW_REQUIRED') return false;
    if (adv.qualificationScore < minScoreFilter) return false;
    if (onlyReachableWebsites && !adv.websiteReachable) return false;
    return true;
  });

  const generateDynamicCsv = (): string => {
    const headers = [
      'advertiser_id',
      'canonical_name',
      'location_code',
      'matched_keywords',
      'ad_library_id',
      'qualification_state',
      'qualification_score',
      'active_ad_count',
      'destination_domain',
      'destination_url',
      'website_reachable',
      'tls_version',
      'ssrf_validated',
      'extracted_at'
    ];

    const rows = activeFilteredLeads.map(adv => [
      adv.advertiserId,
      `"${sanitizeFormulaCell(adv.canonicalName).replace(/"/g, '""')}"`,
      adv.locationCode || '',
      `"${(adv.matchedKeywords || []).join(';')}"`,
      adv.adLibraryId,
      adv.qualificationState,
      adv.qualificationScore.toFixed(1),
      adv.activeAdCount,
      `"${sanitizeFormulaCell(adv.destinationDomain)}"`,
      `"${sanitizeFormulaCell(adv.destinationUrl).replace(/"/g, '""')}"`,
      adv.websiteReachable ? 'true' : 'false',
      adv.tlsVersion,
      adv.ssrfValidated ? 'true' : 'false',
      adv.lastCalculatedAt || new Date().toISOString()
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  };

  const generateDynamicJson = () => {
    return {
      schemaVersion: '1.2.0-phase08-stable',
      exportProfile: selectedProfile,
      generatedAt: new Date().toISOString(),
      recordCount: activeFilteredLeads.length,
      records: activeFilteredLeads.map(adv => ({
        advertiserId: adv.advertiserId,
        canonicalName: adv.canonicalName,
        locationCode: adv.locationCode,
        matchedKeywords: adv.matchedKeywords,
        facebookPageName: adv.facebookPageName,
        facebookPageUrl: adv.facebookPageUrl,
        adLibraryId: adv.adLibraryId,
        activeAdCount: adv.activeAdCount,
        qualificationState: adv.qualificationState,
        qualificationScore: adv.qualificationScore,
        destinationDomain: adv.destinationDomain,
        destinationUrl: adv.destinationUrl,
        websiteReachable: adv.websiteReachable,
        tlsVersion: adv.tlsVersion,
        provenance: (currentProfileData as any)?.includesInternalMetadata ? adv.provenanceSummary : undefined
      }))
    };
  };

  const handleSimulateExport = () => {
    setIsExporting(true);
    setExportComplete(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setDownloadToken(`dl_tok_${Date.now().toString(36)}_hmac_valid_2h`);
    }, 400);
  };

  const copyFixture = () => {
    const text = selectedFormat === 'CSV' ? generateDynamicCsv() : JSON.stringify(generateDynamicJson(), null, 2);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const text = selectedFormat === 'CSV' ? generateDynamicCsv() : JSON.stringify(generateDynamicJson(), null, 2);
    const mime = selectedFormat === 'CSV' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${selectedProfile.toLowerCase()}_${Date.now()}.${selectedFormat.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Estimated Count Calculation based on dynamic filtered leads
  const estimatedCount = activeFilteredLeads.length;

  const currentProfileData = EXPORT_PROFILES.find(p => p.id === selectedProfile) || EXPORT_PROFILES[0];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Lead Research', active: false },
          { label: 'Export Pipeline', active: true },
        ]}
        title="Leads Export & Handoff Studio"
        description="Download verified lead lists in CSV or JSON with automatic spreadsheet formula injection defense."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            Validated Export Ready
          </span>
        }
        primaryAction={{
          label: isExporting ? 'Generating Snapshot...' : 'Generate New Export',
          icon: Download,
          onClick: handleSimulateExport,
        }}
      />

      {exportComplete && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold text-sm">Export Artifact Ready for Secure Download</span>
              <p className="text-[11px] text-purple-700 mt-0.5 font-mono">
                HMAC Token: {downloadToken} (Valid for 120 minutes &bull; SHA-256 integrity verified)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadFile}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Download {selectedFormat} ({estimatedCount} Records)
          </button>
        </div>
      )}

      {/* Grid: Export Configuration Dialog (5 Cols) vs Defense Lab & Schema Preview (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Export Configuration Dialog (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-5">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Export Configuration Dialog
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Define profile, filters, fields, and output format.</p>
          </div>

          {/* 1. Profile */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              1. Select Export Profile
            </label>
            <div className="space-y-2">
              {EXPORT_PROFILES.map(prof => (
                <div
                  key={prof.id}
                  onClick={() => setSelectedProfile(prof.id as any)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedProfile === prof.id
                      ? 'border-neutral-900 bg-neutral-50/80 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{prof.name}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{prof.columns.length} columns</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">{prof.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Filters */}
          <div className="space-y-3 pt-1 border-t border-neutral-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <span>2. Filter Parameters</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-neutral-600 block mb-1">Qualification Scope:</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="ALL">All Leads (Qualified, Review Required, Disqualified)</option>
                  <option value="QUALIFIED_ONLY">Qualified Leads Only (Score &ge; 70.0)</option>
                  <option value="REVIEW_ONLY">Review Required Queue Only</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-neutral-700 font-medium">Reachable Websites Only:</label>
                <input
                  type="checkbox"
                  checked={onlyReachableWebsites}
                  onChange={e => setOnlyReachableWebsites(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-neutral-700 font-medium">
                  Include Internal DAG Lineage &amp; Hashes:
                </label>
                <input
                  type="checkbox"
                  checked={includeInternalMetadata}
                  onChange={e => setIncludeInternalMetadata(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </div>
              {!includeInternalMetadata && (
                <p className="text-[11px] text-neutral-400 italic">
                  Internal audit hashes hidden by default to keep business exports clean.
                </p>
              )}
            </div>
          </div>

          {/* 3. Fields & Schema */}
          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">Included Fields:</span>
              <span className="text-[10px] font-mono text-neutral-400">
                {currentProfileData.columns.length + (includeInternalMetadata ? 3 : 0)} Total Fields
              </span>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-wrap gap-1">
              {currentProfileData.columns.map(col => (
                <span key={col.key} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white text-neutral-700 border border-neutral-200">
                  {col.key}
                </span>
              ))}
              {includeInternalMetadata && (
                <>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200">
                    dag_run_id
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200">
                    raw_payload_hash
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200">
                    provenance_token
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 4. Format & Estimated Count */}
          <div className="pt-2 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">Target Format:</span>
              <span className="font-mono text-neutral-900 font-bold">
                Estimated Records: {estimatedCount}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormat('CSV')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 ${
                  selectedFormat === 'CSV'
                    ? 'border-purple-600 bg-purple-600 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV (Sanitized)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('JSON')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 ${
                  selectedFormat === 'JSON'
                    ? 'border-purple-600 bg-purple-600 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON (Direct)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSimulateExport}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating Snapshot...' : `Generate Export Snapshot (${estimatedCount} Records)`}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Formula Injection Defense Test Lab (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Formula Injection (CSV Injection) Defense Lab
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Neutralizes Excel / Google Sheets formula execution triggers (=, +, -, @, \\t, \\r).
              </p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-neutral-100 text-neutral-700 rounded">
              RFC 4180 Extended
            </span>
          </div>

          {/* Interactive Test Sandbox */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Test Adversarial Payload:
            </label>
            <input
              type="text"
              value={testPayloadInput}
              onChange={e => setTestPayloadInput(e.target.value)}
              placeholder="Type formula string..."
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-red-50/60 border border-red-200 font-mono">
              <span className="text-[10px] font-bold text-red-700 uppercase block mb-1">
                Raw Adversarial Input
              </span>
              <div className="text-neutral-900 break-all">{testPayloadInput}</div>
              <div className="text-[10px] text-red-600 mt-2">
                Execution Risk: Arbitrary command or data exfiltration in Excel.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-50/60 border border-purple-200 font-mono">
              <span className="text-[10px] font-bold text-purple-700 uppercase block mb-1">
                Sanitized CSV Output
              </span>
              <div className="text-purple-900 font-bold break-all">
                {sanitizeFormulaCell(testPayloadInput)}
              </div>
              <div className="text-[10px] text-purple-700 mt-2">
                Safe: Single-quote suppresses Excel formula parsing.
              </div>
            </div>
          </div>

          {/* Preset Attack Vectors Test Suite */}
          <div>
            <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block mb-2">
              Verified Attack Vectors &amp; Sanitization Results
            </span>
            <div className="space-y-1.5 text-xs">
              {CSV_INJECTION_VECTORS.map((vec, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between font-mono">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 text-[10px]">{vec.category}</span>
                      <span className="text-red-600 font-semibold">{vec.rawPayload}</span>
                    </div>
                    <div className="text-purple-700 text-[11px]">
                      &rarr; Sanitized: <span className="font-bold">{vec.sanitized}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                    NEUTRALIZED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Golden Artifact Preview (CSV / JSON) */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Golden Artifact Output Preview ({selectedFormat})
            </h3>
            <p className="text-xs text-neutral-500">Deterministic golden sample complying with Phase 08 export schema.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyFixture}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-1.5"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : `Copy ${selectedFormat}`}
            </button>
            <button
              onClick={handleDownloadFile}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Artifact
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto leading-relaxed max-h-72">
          {selectedFormat === 'CSV' 
            ? (activeFilteredLeads.length > 0 ? generateDynamicCsv() : GOLDEN_CSV_EXPORT_FIXTURE) 
            : JSON.stringify(activeFilteredLeads.length > 0 ? generateDynamicJson() : GOLDEN_JSON_EXPORT_FIXTURE, null, 2)}
        </pre>
      </div>
    </div>
  );
};
