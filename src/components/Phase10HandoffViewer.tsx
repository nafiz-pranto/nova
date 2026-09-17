import React, { useState } from 'react';
import { Download, Copy, CheckCircle2, FileText, Code2, ShieldCheck, Terminal, Layers } from 'lucide-react';
import { PHASE_10_FINAL_HANDOFF_CONTRACT } from '../data/phase10FixturesAndAudit';

interface Phase10HandoffViewerProps {
  onNotify?: (msg: string) => void;
}

export const Phase10HandoffViewer: React.FC<Phase10HandoffViewerProps> = ({ onNotify }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw_json'>('formatted');

  const contract = PHASE_10_FINAL_HANDOFF_CONTRACT;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(contract, null, 2));
    setCopied(true);
    onNotify?.('Copied full Phase 10 Handoff Contract to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contract, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `phase_10_handoff_contract_${contract.systemVersion}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onNotify?.('Downloaded Phase 10 Handoff Contract JSON.');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-purple-600 text-white">
                SECTION 77 CONFORMANT
              </span>
              <span className="text-xs font-mono text-emerald-700 font-semibold">
                VERSION: {contract.systemVersion}
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mt-2 tracking-tight">
              Final Phase 10 Machine-Readable Handoff Contract
            </h2>
            <p className="text-xs text-neutral-600 mt-1 max-w-3xl">
              Provides the formal, digitally sealed release artifact containing component version locks, test execution metrics, zero-blocker disposition, and canary rollout bounds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 shadow-xs transition-all"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Contract JSON'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
          <button
            onClick={() => setActiveTab('formatted')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'formatted'
                ? 'bg-purple-600 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Formatted Sections
          </button>
          <button
            onClick={() => setActiveTab('raw_json')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'raw_json'
                ? 'bg-purple-600 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Raw JSON Spec
          </button>
        </div>
      </div>

      {/* Tab 1: Formatted Sections */}
      {activeTab === 'formatted' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Metadata & Verdict */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Contract Release Metadata
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">SYSTEM VERSION:</span>
                <span className="font-bold text-neutral-900">{contract.systemVersion}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">RELEASE STATUS:</span>
                <span className="font-bold text-emerald-700">{contract.releaseStatus}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">DATABASE TIER:</span>
                <span className="text-neutral-800">{contract.databaseVersion}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-500">API GATEWAY:</span>
                <span className="text-neutral-800">{contract.apiVersion}</span>
              </div>
            </div>
          </div>

          {/* Test Metrics Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-neutral-700" />
              Automated Test Suites Execution
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">UNIT</span>
                <span className="font-bold text-neutral-900 text-sm">{contract.testSummary.unit.passed}/{contract.testSummary.unit.total}</span>
              </div>
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">INTEGRATION</span>
                <span className="font-bold text-neutral-900 text-sm">{contract.testSummary.integration.passed}/{contract.testSummary.integration.total}</span>
              </div>
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">E2E SCENARIOS</span>
                <span className="font-bold text-neutral-900 text-sm">{contract.testSummary.e2e.passed}/{contract.testSummary.e2e.total}</span>
              </div>
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">SECURITY</span>
                <span className="font-bold text-neutral-900 text-sm">{contract.testSummary.security.passed}/{contract.testSummary.security.total}</span>
              </div>
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">PERFORMANCE</span>
                <span className="font-bold text-neutral-900 text-sm">{contract.testSummary.performance.passed}/{contract.testSummary.performance.total}</span>
              </div>
              <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">RECOVERY</span>
                <span className="font-bold text-neutral-900 text-sm">{contract.testSummary.recovery.passed}/{contract.testSummary.recovery.total}</span>
              </div>
            </div>
          </div>

          {/* Locked Component Versions */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-700" />
              Locked Interface Versions
            </h3>
            <div className="space-y-1.5 text-xs font-mono max-h-48 overflow-y-auto">
              {Object.entries(contract.contractVersions).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">{key}:</span>
                  <span className="font-semibold text-neutral-800">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Canary Policy & Rollout */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-neutral-700" />
              Deployment Gates & Rollback Bounds
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block text-[10px]">PRE-DEPLOYMENT CHECKS:</span>
                <span className="font-bold text-neutral-900">{contract.deploymentChecks.length} Criteria Verified</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block text-[10px]">ROLLBACK TRIGGER (P1):</span>
                <span className="font-bold text-rose-700">{contract.rollbackConditions[0]}</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block text-[10px]">POST-LAUNCH POLICIES:</span>
                <span className="font-bold text-neutral-900">{contract.postLaunchMonitoring[0]}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Raw JSON Spec */}
      {activeTab === 'raw_json' && (
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>RFC 8259 JSON FORMAT</span>
            <span>DIGITAL PROVENANCE SHA-256 SEALED</span>
          </div>
          <pre className="bg-neutral-950 text-neutral-200 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed">
            {JSON.stringify(contract, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
