import React, { useState, useEffect } from 'react';
import { PHASE_03_FIXTURES } from '../data/phase03FixturesAndAudit';
import { executeExtractionPipeline, PipelineExecutionResult } from '../utils/extractionEngine';
import { ExtractionPipelineStage, CanonicalAdEnvelope, ProvenanceNode } from '../types';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Hash,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const PIPELINE_STAGES: { stage: ExtractionPipelineStage; label: string; desc: string }[] = [
  { stage: 'INGESTION', label: '1. Ingestion', desc: 'Isolate DOM container & SHA-256 snapshot hashing' },
  { stage: 'PARSING', label: '2. Semantic Parsing', desc: 'Execute primary & secondary semantic locators' },
  { stage: 'PROVENANCE_MAPPING', label: '3. Provenance DAG', desc: 'Trace origins, transform histories & confidence' },
  { stage: 'NORMALIZATION', label: '4. Normalization', desc: 'Standardize ISO-8601, E.164, UTM stripping, CTA enum' },
  { stage: 'VALIDATION', label: '5. Validation', desc: 'Enforce Tier-1 fatal invariants & cross-field rules' },
  { stage: 'EMISSION', label: '6. Canonical Emission', desc: 'Emit tamper-evident CanonicalAdEnvelope' }
];

export const ExtractionPipelineSimulator: React.FC = () => {
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(PHASE_03_FIXTURES[0].id);
  const [currentFixture, setCurrentFixture] = useState(PHASE_03_FIXTURES[0]);
  const [customHtml, setCustomHtml] = useState<string>(PHASE_03_FIXTURES[0].rawHtml);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(5); // Default to full emission
  const [executionResult, setExecutionResult] = useState<PipelineExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'record' | 'provenance' | 'validation' | 'raw'>('record');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fixture = PHASE_03_FIXTURES.find((f) => f.id === selectedFixtureId) || PHASE_03_FIXTURES[0];
    setCurrentFixture(fixture);
    setCustomHtml(fixture.rawHtml);
    runPipelineOnHtml(fixture.rawHtml);
  }, [selectedFixtureId]);

  const runPipelineOnHtml = (html: string) => {
    const res = executeExtractionPipeline(html, {
      jobId: 'job_ad_library_prod_01',
      runId: 'run_worker_node_42',
      batchSeq: 104
    });
    setExecutionResult(res);
  };

  const handleRun = () => {
    runPipelineOnHtml(customHtml);
  };

  const handleCopyJson = () => {
    if (!executionResult?.envelope) return;
    navigator.clipboard.writeText(JSON.stringify(executionResult.envelope, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const env = executionResult?.envelope;
  const rec = env?.record;
  const rep = env?.validationReport;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto p-6">
      {/* Header Banner */}
      <div className="border-b border-neutral-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-neutral-900 tracking-tight font-mono">
              Extraction & Provenance Pipeline Engine
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              6-Stage Deterministic DAG
            </span>
          </div>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            Live interactive execution harness parsing public Meta Ad Library card elements. Traces exact selector paths, captures cryptographic evidence, normalizes schemas, and enforces fatal invariants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-purple-700 shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute Pipeline</span>
          </button>
        </div>
      </div>

      {/* Controls: Fixture Selector */}
      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-mono font-medium text-neutral-700 mb-1.5">
              SELECT SYNTHETIC CARD FIXTURE (10 SCENARIOS):
            </label>
            <select
              value={selectedFixtureId}
              onChange={(e) => setSelectedFixtureId(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-neutral-300 rounded-lg p-2 text-neutral-900 shadow-xs focus:ring-1 focus:ring-neutral-900"
            >
              {PHASE_03_FIXTURES.map((fix) => (
                <option key={fix.id} value={fix.id}>
                  [{fix.id}] {fix.name} ({fix.category})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-500 mt-1.5">{currentFixture.description}</p>
          </div>

          {/* Quick Stats Cards */}
          {env && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs min-w-[120px]">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Confidence</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold font-mono text-neutral-900">
                    {(env.compositeConfidence * 100).toFixed(1)}%
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                      rep?.recordStatus === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rep?.recordStatus === 'FLAGGED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {rep?.recordStatus}
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs min-w-[110px]">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">CPU Parse Latency</span>
                <span className="text-lg font-bold font-mono text-neutral-900 mt-0.5 block">
                  {executionResult?.stageTimingsMs?.['parsing'] || 2.4} ms
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs min-w-[110px]">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Fields Traced</span>
                <span className="text-lg font-bold font-mono text-neutral-900 mt-0.5 block">
                  {Object.keys(env.provenanceGraph).length} / 24
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6-Stage Progress Stepper */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PIPELINE_STAGES.map((s, idx) => {
            const isCompleted = activeStageIndex >= idx;
            const isCurrent = activeStageIndex === idx;
            return (
              <button
                key={s.stage}
                onClick={() => setActiveStageIndex(idx)}
                className={`p-2.5 text-left rounded-lg border transition-all text-xs flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-purple-600 text-white border-neutral-900 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100/70'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[11px]">{s.label}</span>
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] leading-tight opacity-80">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: 2-Column Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Raw HTML Preview & Card Simulation */}
        <div className="lg:col-span-5 flex flex-col border border-neutral-200 rounded-xl bg-white shadow-xs overflow-hidden">
          <div className="p-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-neutral-700 flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4 text-neutral-500" />
              RAW CARD DOM SUBTREE EVIDENCE
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              SHA-256: {env?.rawSnapshotSha256.slice(0, 12)}...
            </span>
          </div>

          <div className="p-3 flex-1 flex flex-col">
            <textarea
              value={customHtml}
              onChange={(e) => {
                setCustomHtml(e.target.value);
                runPipelineOnHtml(e.target.value);
              }}
              rows={14}
              className="w-full flex-1 p-3 text-xs font-mono bg-neutral-900 text-emerald-300 rounded-lg focus:outline-none resize-none leading-relaxed border border-neutral-800"
              placeholder="Paste raw ad card HTML here..."
            />
            <p className="text-[11px] text-neutral-500 mt-2 font-mono">
              💡 Live editable: modifying HTML instantly re-runs the 6-stage extraction DAG.
            </p>
          </div>
        </div>

        {/* Right Column: Emitted Envelope, Provenance & Validation */}
        <div className="lg:col-span-7 flex flex-col border border-neutral-200 rounded-xl bg-white shadow-xs overflow-hidden">
          {/* Sub-tabs */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 pt-2">
            <div className="flex items-center space-x-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab('record')}
                className={`px-3 py-1.5 border-b-2 font-mono transition-colors ${
                  activeTab === 'record'
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Canonical Record
              </button>
              <button
                onClick={() => setActiveTab('provenance')}
                className={`px-3 py-1.5 border-b-2 font-mono transition-colors ${
                  activeTab === 'provenance'
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Provenance Graph ({Object.keys(env?.provenanceGraph || {}).length})
              </button>
              <button
                onClick={() => setActiveTab('validation')}
                className={`px-3 py-1.5 border-b-2 font-mono transition-colors ${
                  activeTab === 'validation'
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Validation Violations ({rep?.violations.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 border-b-2 font-mono transition-colors ${
                  activeTab === 'raw'
                    ? 'border-neutral-900 text-neutral-900 font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Full JSON Envelope
              </button>
            </div>

            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-600 hover:text-neutral-900 pb-1.5"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto text-xs">
            {/* Tab 1: Canonical Record Key Fields */}
            {activeTab === 'record' && rec && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">Ad Library ID</span>
                    <span className="font-mono font-bold text-neutral-900 text-xs mt-0.5 block truncate">
                      {rec.adLibraryId}
                    </span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">Status</span>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        rec.adStatus === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.adStatus === 'INACTIVE'
                          ? 'bg-neutral-200 text-neutral-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.adStatus}
                    </span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">Start Date (ISO)</span>
                    <span className="font-mono font-semibold text-neutral-900 text-xs mt-0.5 block">
                      {rec.startDateIso}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Advertiser Page Name</span>
                  <p className="text-sm font-semibold text-neutral-900 mt-0.5">{rec.pageName}</p>
                  {rec.pageProfileUrl && (
                    <a
                      href={rec.pageProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      <span>{rec.pageProfileUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Primary Creative Copy</span>
                  <p className="text-xs text-neutral-800 mt-1 whitespace-pre-wrap leading-relaxed">
                    {rec.bodyText || <span className="text-neutral-400 italic">No textual copy (Media-only ad)</span>}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">Normalized CTA</span>
                    <span className="font-mono font-semibold text-neutral-900 text-xs mt-0.5 block">
                      {rec.ctaNormalizedCategory}
                    </span>
                    <span className="text-[11px] text-neutral-500">Label: "{rec.ctaText || 'None'}"</span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">Clean Domain</span>
                    <span className="font-mono font-semibold text-neutral-900 text-xs mt-0.5 block truncate">
                      {rec.cleanDestinationDomain || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Lead Gen Indicators */}
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                  <span className="text-[10px] font-mono text-emerald-800 uppercase font-semibold block mb-1">
                    Detected Lead Generation Signals
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.leadGenIndicators.hasFormLeadHook && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-medium">
                        LEAD_FORM_HOOK
                      </span>
                    )}
                    {rec.leadGenIndicators.extractedEmails.map((email) => (
                      <span key={email} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono">
                        Email: {email}
                      </span>
                    ))}
                    {rec.leadGenIndicators.extractedPhoneE164.map((phone) => (
                      <span key={phone} className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-mono">
                        Phone: {phone}
                      </span>
                    ))}
                    {rec.leadGenIndicators.identifiedIntentSignals.map((signal) => (
                      <span key={signal} className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 text-[10px] font-mono">
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Provenance Nodes */}
            {activeTab === 'provenance' && env && (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600 mb-2">
                  Every field below is cryptographically anchored back to the source DOM element and transformation list.
                </p>
                {(Object.entries(env.provenanceGraph) as [string, ProvenanceNode][]).map(([field, node]) => (
                  <div key={field} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5 mb-1.5">
                      <span className="font-bold text-neutral-900">{field}</span>
                      <span className="px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800 text-[10px]">
                        Score: {(node.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-700">
                      <div>
                        <span className="text-neutral-400 block">Source Locator:</span>
                        <span className="text-neutral-900 break-all">{node.sourceLocator}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Raw Snippet:</span>
                        <span className="text-neutral-900 truncate block">{node.rawSnippet}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-neutral-500">
                      <span className="font-semibold text-neutral-700">Transformations:</span> {node.transformations.join(' ➔ ')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Validation Violations */}
            {activeTab === 'validation' && rep && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg text-xs font-mono">
                  <span>Rules Evaluated: {rep.rulesEvaluatedCount}</span>
                  <span className="font-semibold">
                    Status: <span className={rep.isValid ? 'text-emerald-700' : 'text-rose-700'}>{rep.recordStatus}</span>
                  </span>
                </div>

                {rep.violations.length === 0 ? (
                  <div className="p-6 text-center text-neutral-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-medium text-neutral-800">Zero Invariant Violations</p>
                    <p className="text-[11px] mt-0.5">Card passes all Tier-1 Fatal, Semantic Integrity, and Format checks.</p>
                  </div>
                ) : (
                  rep.violations.map((v, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border text-xs ${
                        v.severity === 'FATAL'
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : v.severity === 'ERROR'
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-yellow-50 border-yellow-300 text-yellow-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-[11px] mb-1">
                        <span>{v.ruleId} ({v.field})</span>
                        <span className="px-1.5 py-0.2 rounded uppercase text-[9px] bg-white border">
                          {v.severity}
                        </span>
                      </div>
                      <p>{v.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 4: Raw JSON Envelope */}
            {activeTab === 'raw' && env && (
              <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-[480px]">
                {JSON.stringify(env, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
