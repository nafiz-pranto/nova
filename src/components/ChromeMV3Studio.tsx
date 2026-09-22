import React, { useState } from 'react';
import { CHROME_MV3_MANIFEST_SPEC, EXTENSION_PERMISSIONS_MATRIX } from '../data/phase08FixturesAndAudit';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Send, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  Layers, 
  Laptop, 
  Smartphone, 
  Code,
  Sparkles,
  Search
} from 'lucide-react';

export const ChromeMV3Studio: React.FC = () => {
  const [activeTabUrl, setActiveTabUrl] = useState('https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=commercial+solar+installers&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped');
  const [selectedMessageAction, setSelectedMessageAction] = useState<'DETECT_PAGE' | 'DISPATCH_SEARCH' | 'GET_JOB_STATUS'>('DETECT_PAGE');
  const [messageLogs, setMessageLogs] = useState<Array<{ timestamp: string; type: string; payload: any; status: string }>>([
    {
      timestamp: '08:20:01Z',
      type: 'EXT_INIT',
      payload: { version: '8.0.0', permissions: ['activeTab', 'storage'] },
      status: 'INITIALIZED'
    }
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'POPUP_SIMULATOR' | 'MANIFEST_VIEWER' | 'PERMISSION_AUDIT' | 'SW_MESSAGING'>('POPUP_SIMULATOR');

  // Simulated query parser
  const parseQueryFromUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.searchParams.get('q') || 'solar installers';
    } catch {
      return 'solar installers';
    }
  };

  const detectedQuery = parseQueryFromUrl(activeTabUrl);

  const handleSimulateMessage = () => {
    const newLog = {
      timestamp: new Date().toISOString().substring(11, 19) + 'Z',
      type: selectedMessageAction,
      payload: selectedMessageAction === 'DISPATCH_SEARCH'
        ? { query: detectedQuery, country: 'US', maxResults: 100 }
        : { targetTabUrl: activeTabUrl },
      status: 'ACK_VALIDATED'
    };
    setMessageLogs(prev => [newLog, ...prev]);
  };

  const copyManifest = () => {
    navigator.clipboard.writeText(JSON.stringify(CHROME_MV3_MANIFEST_SPEC, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-900">Chrome Manifest V3 Extension Studio</h2>
            <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-purple-600 text-white rounded">
              MV3 Compliant
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Operator cockpit extension with strict zero-scraping, zero-cookie, minimal activeTab security architecture.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-lg text-xs font-semibold border border-neutral-200">
          {[
            { id: 'POPUP_SIMULATOR', label: 'Popup Cockpit' },
            { id: 'MANIFEST_VIEWER', label: 'Manifest V3 JSON' },
            { id: 'PERMISSION_AUDIT', label: 'Permissions Audit' },
            { id: 'SW_MESSAGING', label: 'Service Worker Bridge' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSubTab === tab.id
                  ? 'bg-white text-neutral-900 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: POPUP COCKPIT SIMULATOR */}
      {activeSubTab === 'POPUP_SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Col: Browser Context Simulator (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Simulated Operator Browser Tab
              </h3>
              <span className="text-[11px] font-mono text-neutral-400">Chrome activeTab context</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Active Tab Meta Ad Library URL:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activeTabUrl}
                  onChange={e => setActiveTabUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
              <span className="font-bold text-neutral-700 uppercase tracking-wider text-[10px]">
                Autonomous Query Detection
              </span>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Detected Search Term:</span>
                <span className="font-bold text-neutral-900 font-mono">{detectedQuery}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Target Market:</span>
                <span className="font-bold text-neutral-900 font-mono">United States (US)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Execution Mode:</span>
                <span className="font-bold text-emerald-700 font-mono">Server-Side BFF Dispatch</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Zero Scraping in Extension
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                The extension reads only the active URL query parameter upon user click. It does NOT inject content scripts to parse DOM cards or access cookies. Clicking &ldquo;Dispatch to Workspace&rdquo; forwards the query to the background worker cluster.
              </p>
            </div>
          </div>

          {/* Right Col: Chrome Extension Popup Mockup (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center items-start">
            <div className="w-80 bg-white rounded-2xl shadow-xl border border-neutral-300 overflow-hidden text-neutral-900">
              {/* Chrome Extension Header */}
              <div className="bg-purple-600 text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center font-bold text-[10px]">
                    M
                  </div>
                  <span className="font-bold text-xs tracking-tight">Meta Ad Library Cockpit</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">v8.0.0</span>
              </div>

              {/* Popup Body */}
              <div className="p-4 space-y-3.5 text-xs">
                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Detected Active Search
                  </span>
                  <div className="font-semibold text-neutral-900 truncate">
                    &ldquo;{detectedQuery}&rdquo;
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                    Market: US &bull; Active Ads Only
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-neutral-700">
                    Research Pipeline:
                  </label>
                  <div className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-800 flex items-center justify-between">
                    <span>Auto-Discovery Extraction</span>
                    <span className="text-[10px] text-emerald-600 font-bold">ACTIVE</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulateMessage}
                  className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Job to Workspace
                </button>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Permissions: activeTab</span>
                  <span className="text-emerald-600 font-semibold">BFF Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MANIFEST V3 JSON VIEWER */}
      {activeSubTab === 'MANIFEST_VIEWER' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">manifest.json Specification</h3>
              <p className="text-xs text-neutral-500">Compliant with Chrome Web Store MV3 strict security standards.</p>
            </div>
            <button
              onClick={copyManifest}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-1.5"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : 'Copy Manifest JSON'}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto leading-relaxed">
            {JSON.stringify(CHROME_MV3_MANIFEST_SPEC, null, 2)}
          </pre>
        </div>
      )}

      {/* VIEW 3: PERMISSION AUDIT MATRIX */}
      {activeSubTab === 'PERMISSION_AUDIT' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Manifest V3 Permission Footprint & Audit</h3>
            <p className="text-xs text-neutral-500">Exhaustive verification of allowed vs strictly banned permissions.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold text-neutral-600 uppercase">
                  <th scope="col" className="py-2.5 px-3">Permission Name</th>
                  <th scope="col" className="py-2.5 px-3">Status</th>
                  <th scope="col" className="py-2.5 px-3">Architectural Justification & Security Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {EXTENSION_PERMISSIONS_MATRIX.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900">{perm.permission}</td>
                    <td className="py-3 px-3">
                      {perm.status === 'ALLOWED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ALLOWED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                          PROHIBITED / BANNED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 leading-relaxed">{perm.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: SERVICE WORKER MESSAGING LOG */}
      {activeSubTab === 'SW_MESSAGING' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Background Service Worker Communication Console</h3>
              <p className="text-xs text-neutral-500">Typed runtime message dispatch simulator with origin verification.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedMessageAction}
                onChange={e => setSelectedMessageAction(e.target.value as any)}
                className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
              >
                <option value="DETECT_PAGE">DETECT_PAGE</option>
                <option value="DISPATCH_SEARCH">DISPATCH_SEARCH</option>
                <option value="GET_JOB_STATUS">GET_JOB_STATUS</option>
              </select>
              <button
                onClick={handleSimulateMessage}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
              >
                Send Message
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {messageLogs.map((log, i) => (
              <div key={i} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 font-mono text-xs flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">[{log.timestamp}]</span>
                    <span className="font-bold text-neutral-900">{log.type}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                      {log.status}
                    </span>
                  </div>
                  <pre className="text-[11px] text-neutral-600 mt-1">
                    {JSON.stringify(log.payload)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
