import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Search,
  Download,
  History,
  Globe,
  Building2,
  Tag,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  FileCode,
  Trash2,
  RefreshCw,
  Sliders,
  Layers
} from 'lucide-react';
import { RESEARCH_PRESETS } from '../../data/presetCatalogue.ts';
import { META_AD_LIBRARY_LOCATIONS, getLocationByCode } from '../../data/locationCatalogue.ts';
import { exportLeadsToCsv } from '../metaAdapter.ts';
import {
  ExtensionResearchRun,
  ExtensionLead,
  StartResearchPayload,
  ResearchMode
} from '../types.ts';

export const ExtensionApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RESEARCH' | 'RESULTS' | 'HISTORY'>('RESEARCH');
  const [researchMode, setResearchMode] = useState<ResearchMode>('CUSTOM');
  const [presetId, setPresetId] = useState<string>(RESEARCH_PRESETS[0]?.preset_id || '');
  const [keywordsInput, setKeywordsInput] = useState<string>('Furniture, Home Decor');
  const [countryCode, setCountryCode] = useState<string>('BD');
  const [maxResults, setMaxResults] = useState<number>(10);
  const [customSearchName, setCustomSearchName] = useState<string>('');

  const [activeRun, setActiveRun] = useState<ExtensionResearchRun | null>(null);
  const [historyRuns, setHistoryRuns] = useState<ExtensionResearchRun[]>([]);
  const [selectedLead, setSelectedLead] = useState<ExtensionLead | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Poll or sync state with chrome.storage.local on mount
  useEffect(() => {
    loadStateFromStorage();

    // Listen for progress messages from the background service worker
    const messageListener = (msg: any) => {
      if (msg.type === 'RESEARCH_PROGRESS' && msg.payload?.run) {
        setActiveRun(msg.payload.run);
        if (msg.payload.logMessage) {
          setStatusMessage(msg.payload.logMessage);
        }
      } else if (msg.type === 'RESEARCH_COMPLETED' && msg.payload?.run) {
        setActiveRun(msg.payload.run);
        setIsSubmitting(false);
        loadHistory();
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
  }, []);

  const loadStateFromStorage = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['activeResearchRun', 'meta_scraper_active_run'], (res: Record<string, any>) => {
        const run = (res.activeResearchRun || res.meta_scraper_active_run) as ExtensionResearchRun | undefined;
        if (run) {
          setActiveRun(run);
          if (run.leads && run.leads.length > 0) {
            setActiveTab('RESULTS');
          }
        }
      });
      loadHistory();
    }
  };

  const loadHistory = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['researchHistory', 'meta_scraper_history'], (res: Record<string, any>) => {
        const hist = (res.researchHistory || res.meta_scraper_history) as ExtensionResearchRun[] | undefined;
        if (Array.isArray(hist)) {
          setHistoryRuns(hist);
        }
      });
    }
  };

  const selectedPreset = RESEARCH_PRESETS.find(p => p.preset_id === presetId) || RESEARCH_PRESETS[0];

  const handleStartResearch = async () => {
    setStatusMessage('');
    setIsSubmitting(true);

    let parsedKeywords: string[] = [];
    let presetName: string | undefined;

    if (researchMode === 'PRESET') {
      if (!selectedPreset) {
        setStatusMessage('Please select a valid preset.');
        setIsSubmitting(false);
        return;
      }
      parsedKeywords = selectedPreset.primary_keywords;
      presetName = selectedPreset.name;
    } else {
      parsedKeywords = keywordsInput
        .split(/[,;\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (parsedKeywords.length === 0) {
        setStatusMessage('Please enter at least one keyword.');
        setIsSubmitting(false);
        return;
      }
    }

    const loc = getLocationByCode(countryCode);
    const locationName = loc ? loc.displayName : countryCode;

    const payload: StartResearchPayload = {
      mode: researchMode,
      presetId: researchMode === 'PRESET' ? presetId : undefined,
      presetName,
      keywords: parsedKeywords,
      countryCode,
      locationName,
      maxResults: Number(maxResults) || 10,
      researchName: customSearchName.trim() || `${researchMode === 'PRESET' ? presetName : parsedKeywords[0]} in ${locationName}`
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'START_RESEARCH',
        payload
      }, (res) => {
        if (res && res.run) {
          setActiveRun(res.run);
          setActiveTab('RESULTS');
        } else if (res && !res.success) {
          setStatusMessage(`Failed to start research: ${res.error}`);
          setIsSubmitting(false);
        }
      });
    } else {
      setStatusMessage('Chrome extension runtime not detected. Ensure extension is loaded in Chrome.');
      setIsSubmitting(false);
    }
  };

  const handleStopResearch = () => {
    if (!activeRun) return;
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'STOP_RESEARCH',
        payload: { runId: activeRun.runId }
      }, () => {
        setStatusMessage('Cancellation signal sent.');
      });
    }
  };

  const handleClearHistory = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ researchHistory: [] }, () => {
        setHistoryRuns([]);
      });
    }
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = (leads: ExtensionLead[], run?: ExtensionResearchRun) => {
    if (!leads || leads.length === 0) return;
    const csvData = exportLeadsToCsv(leads, run);
    const fileName = `meta_ad_library_leads_${run ? run.runId : Date.now()}.csv`;
    downloadFile(csvData, fileName, 'text/csv;charset=utf-8;');
  };

  const handleExportJson = (run: ExtensionResearchRun) => {
    const jsonData = JSON.stringify(run, null, 2);
    const fileName = `meta_ad_library_run_${run.runId}.json`;
    downloadFile(jsonData, fileName, 'application/json;charset=utf-8;');
  };

  const isRunning = activeRun && (activeRun.status === 'STARTING' || activeRun.status === 'NAVIGATING' || activeRun.status === 'COLLECTING' || activeRun.status === 'NORMALIZING');
  const isStale = activeRun && activeRun.status === 'RECOVERY_REQUIRED';

  const formatStatus = (status: string): string => {
    switch (status) {
      case 'STARTING': return 'Initializing';
      case 'NAVIGATING': return 'Loading Search';
      case 'COLLECTING': return 'Extracting Ads';
      case 'NORMALIZING': return 'Filtering Relevance';
      case 'COMPLETED': return 'Completed';
      case 'PARTIAL': return 'Partial Result';
      case 'CANCELLED': return 'Cancelled';
      case 'BROWSER_TAB_CLOSED': return 'Ad Library Tab Closed';
      case 'BROWSER_INTERRUPTED': return 'Session Interrupted';
      case 'BLOCKED': return 'Access Restricted';
      case 'RATE_LIMITED': return 'Meta Access Rate-Limited';
      case 'CHALLENGED': return 'Meta Security Check Required';
      case 'FAILED': return 'Failed';
      case 'RECOVERY_REQUIRED': return 'Incomplete Session (Recovery Needed)';
      default: return status.replace(/_/g, ' ');
    }
  };

  const formatStopReason = (reason?: string): string => {
    if (!reason) return '';
    switch (reason) {
      case 'TARGET_REACHED': return 'Target Quota Reached';
      case 'SOURCE_EXHAUSTED':
      case 'SOURCE_EXHAUSTED_VERIFIED': return 'Search Results Exhausted';
      case 'SOURCE_PROGRESS_STALLED': return 'Ad Library Stalled — No New Ads Observed';
      case 'NO_NEW_RESULTS_OBSERVED': return 'No Ads Observed for Query';
      case 'USER_CANCELLED': return 'Cancelled by User';
      case 'BROWSER_TAB_CLOSED': return 'Ad Library Tab Closed';
      case 'BROWSER_INTERRUPTED':
      case 'STALE_JOB_TIMEOUT': return 'Session Interrupted';
      case 'CHALLENGED':
      case 'CHALLENGE_DETECTED': return 'Meta Security Check Required';
      case 'RATE_LIMITED': return 'Meta Access Rate-Limited';
      case 'FAILED':
      case 'FATAL_ERROR': return 'Unrecoverable Execution Error';
      default: return reason.replace(/_/g, ' ');
    }
  };

  const formatEvidenceType = (type: string): string => {
    switch (type) {
      case 'ENTITY_IDENTITY': return 'Business Identity';
      case 'CATEGORY_MATCH': return 'Industry Match';
      case 'COMMERCIAL_INTENT': return 'Commercial Intent';
      case 'NEGATIVE_CATEGORY': return 'Category Conflict';
      case 'CONTRADICTION': return 'Hard Contradiction';
      default: return type.replace(/_/g, ' ');
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-100 text-xs antialiased font-sans select-none overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-3 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            N
          </div>
          <div>
            <h1 className="text-xs font-semibold tracking-tight text-white flex items-center gap-1.5">
              Meta Ad Library Lead Scraper
              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/50 rounded">
                MV3 Local
              </span>
            </h1>
          </div>
        </div>

        {isRunning && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950/80 border border-emerald-700/50 rounded text-emerald-300 text-[10px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Scraping Active
          </div>
        )}
      </header>

      {/* Navigation Tabs */}
      <nav className="flex items-center px-2 py-1 bg-slate-900/90 border-b border-slate-800 text-[11px] gap-1">
        <button
          onClick={() => setActiveTab('RESEARCH')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'RESEARCH'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          New Research
        </button>
        <button
          onClick={() => setActiveTab('RESULTS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'RESULTS'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Results {activeRun ? `(${activeRun.leads.length})` : ''}
        </button>
        <button
          onClick={() => {
            loadHistory();
            setActiveTab('HISTORY');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'HISTORY'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          History ({historyRuns.length})
        </button>
      </nav>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-3 space-y-3">
        {statusMessage && (
          <div className={`p-2 border rounded text-[11px] flex items-start gap-2 ${
            statusMessage.includes('Failed') || statusMessage.includes('Error') || statusMessage.includes('blocked')
              ? 'bg-rose-950/60 border-rose-800/60 text-rose-200'
              : 'bg-blue-950/60 border-blue-800/60 text-blue-200'
          }`}>
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 mt-0.5 text-blue-400 flex-shrink-0 animate-spin" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-amber-400 flex-shrink-0" />
            )}
            <div className="break-words">{statusMessage}</div>
          </div>
        )}

        {isStale && (
          <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4" />
              Incomplete Research Detected
            </div>
            <p className="text-[10px] text-amber-200/80 leading-relaxed">
              The previous research session was interrupted (browser restart or service worker timeout). 
              Leads collected so far are preserved. You can start a new research to continue.
            </p>
            <button
              onClick={() => setActiveTab('RESEARCH')}
              className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded text-[10px] font-medium transition-colors"
            >
              Configure New Run
            </button>
          </div>
        )}

        {/* TAB 1: NEW RESEARCH CONFIGURATION */}
        {activeTab === 'RESEARCH' && (
          <div className="space-y-3">
            {/* Mode Selection */}
            <div className="p-2.5 bg-slate-800/50 border border-slate-700/60 rounded-lg space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 block">Research Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResearchMode('CUSTOM')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded border text-[11px] font-medium transition-all ${
                    researchMode === 'CUSTOM'
                      ? 'bg-blue-600/30 border-blue-500 text-white font-semibold'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  Custom Keywords
                </button>
                <button
                  type="button"
                  onClick={() => setResearchMode('PRESET')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded border text-[11px] font-medium transition-all ${
                    researchMode === 'PRESET'
                      ? 'bg-blue-600/30 border-blue-500 text-white font-semibold'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  Industry Preset
                </button>
              </div>

              {/* Mode-specific input */}
              {researchMode === 'CUSTOM' ? (
                <div className="pt-1">
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Keywords (comma or newline separated):
                  </label>
                  <textarea
                    rows={2}
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    placeholder="e.g. Furniture, Modern Living, Office Chairs"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[9px] text-slate-500 block mt-0.5">
                    Individual terms will be searched sequentially on Meta Ad Library.
                  </span>
                </div>
              ) : (
                <div className="pt-1">
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Select Industry Preset ({RESEARCH_PRESETS.length} available):
                  </label>
                  <select
                    value={presetId}
                    onChange={(e) => setPresetId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {RESEARCH_PRESETS.map((p) => (
                      <option key={p.preset_id} value={p.preset_id}>
                        {p.name} — {p.industry}
                      </option>
                    ))}
                  </select>
                  {selectedPreset && (
                    <div className="mt-1.5 p-2 bg-slate-900/80 rounded border border-slate-700/40 text-[10px] text-slate-300">
                      <div className="text-slate-400">{selectedPreset.description}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedPreset.primary_keywords.map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.2 bg-slate-800 text-blue-300 rounded border border-slate-700 text-[9px]">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Location & Limit */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-800/50 border border-slate-700/60 rounded-lg space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-400" />
                  Search Location
                </label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                >
                  {META_AD_LIBRARY_LOCATIONS.map((loc) => (
                    <option key={loc.locationCode} value={loc.locationCode}>
                      {loc.displayName} ({loc.locationCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 bg-slate-800/50 border border-slate-700/60 rounded-lg space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-blue-400" />
                  Maximum Leads
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={maxResults}
                  onChange={(e) => setMaxResults(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Start Action */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting || isRunning}
                onClick={handleStartResearch}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                  isSubmitting || isRunning
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-[0.98]'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isRunning ? 'Research in Progress...' : 'Start Research'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: RESULTS VIEW */}
        {activeTab === 'RESULTS' && (
          <div className="space-y-3">
            {activeRun ? (
              <>
                {/* Run Summary Card */}
                <div className="p-2.5 bg-slate-800/60 border border-slate-700 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-semibold text-white">{activeRun.researchName}</h2>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Loc: {activeRun.locationName} ({activeRun.countryCode})</span>
                        <span>•</span>
                        <span>Mode: {activeRun.mode}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        activeRun.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                        activeRun.status === 'PARTIAL' ? 'bg-amber-950/80 text-amber-300 border border-amber-700/80' :
                        activeRun.status === 'CANCELLED' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                        activeRun.status === 'BLOCKED' ? 'bg-rose-950 text-rose-300 border border-rose-700' :
                        activeRun.status === 'RECOVERY_REQUIRED' ? 'bg-amber-950/50 text-amber-400 border border-amber-700/50' :
                        activeRun.status === 'FAILED' ? 'bg-rose-950 text-rose-300 border border-rose-700' :
                        'bg-blue-950 text-blue-300 border border-blue-700 animate-pulse'
                      }`}>
                        {formatStatus(activeRun.status)}
                      </span>
                    </div>
                  </div>

                  {/* Progress stats */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[9px] text-slate-400">Unique Leads</div>
                      <div className="text-sm font-bold text-emerald-400">
                        {activeRun.leads.length} <span className="text-[10px] text-slate-500 font-normal">/ {activeRun.maxResults}</span>
                      </div>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[9px] text-slate-400">Ads Inspected</div>
                      <div className="text-sm font-bold text-blue-400">{activeRun.totalAdsInspected}</div>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <div className="text-[9px] text-slate-400">Target Quota</div>
                      <div className="text-sm font-bold text-slate-300">{activeRun.maxResults}</div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-1">
                    {isRunning ? (
                      <button
                        type="button"
                        onClick={handleStopResearch}
                        className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800/80 border border-rose-700 text-rose-200 rounded text-[10px] font-medium flex items-center gap-1"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        Stop Research
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400">
                        {activeRun.stopReason ? (
                          <span className="text-slate-300 font-medium">({formatStopReason(activeRun.stopReason)})</span>
                        ) : activeRun.leads.length >= activeRun.maxResults ? (
                          '✓ Target quota reached'
                        ) : (
                          'Research stopped'
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={activeRun.leads.length === 0}
                        onClick={() => handleExportCsv(activeRun.leads, activeRun)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded text-[10px] flex items-center gap-1"
                        title="Export RFC-4180 CSV with Formula Injection Protection"
                      >
                        <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                        CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportJson(activeRun)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded text-[10px] flex items-center gap-1"
                        title="Export Full JSON Run Payload"
                      >
                        <FileCode className="w-3 h-3 text-blue-400" />
                        JSON
                      </button>
                    </div>
                  </div>
                </div>

                {/* Leads List */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 px-1">
                    <span>Relevant Leads ({activeRun.leads.length})</span>
                    <span className="text-[9px] text-slate-400 font-normal">
                      {activeRun.rejectedLeadsCount ? `${activeRun.rejectedLeadsCount} irrelevant excluded` : 'Click lead to inspect'}
                    </span>
                  </div>

                  {activeRun.leads.length === 0 ? (
                    <div className="p-4 bg-slate-800/30 border border-dashed border-slate-700 rounded-lg text-center text-slate-500 text-[11px]">
                      {isRunning ? 'Actively extracting ad cards from Meta Ad Library...' : 'No leads found yet. Start research above.'}
                    </div>
                  ) : (
                    activeRun.leads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`p-2 bg-slate-800/60 hover:bg-slate-800 border rounded cursor-pointer transition-all ${
                          selectedLead?.id === lead.id ? 'border-blue-500 bg-slate-800' : 'border-slate-700/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="font-semibold text-slate-100 text-xs truncate max-w-[220px]">
                            {lead.name}
                          </div>
                          <div className="flex items-center gap-1">
                            {lead.relevanceDecision && (
                              <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded text-[9px] font-mono whitespace-nowrap">
                                {lead.relevanceDecision} ({Math.round((lead.relevanceScore || 1) * 100)}%)
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 bg-blue-950 border border-blue-800 text-blue-300 rounded text-[9px] font-mono whitespace-nowrap">
                              {lead.activeAdCount} {lead.activeAdCount === 1 ? 'ad' : 'ads'}
                            </span>
                          </div>
                        </div>

                        {/* Page & Website State badges */}
                        <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                          {lead.facebookPageUrl ? (
                            <a
                              href={lead.facebookPageUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 truncate max-w-[140px]"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                              <span className="truncate">FB Page</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                              No Page
                            </span>
                          )}

                          <span className="text-slate-600">•</span>

                          {lead.destinationUrl ? (
                            <a
                              href={lead.destinationUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 truncate max-w-[140px]"
                            >
                              <Globe className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                              <span className="truncate">{lead.destinationDomain || 'Website'}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                              No Website
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Lead Inspection Modal / Drawer */}
                {selectedLead && (
                  <div className="p-2.5 bg-slate-950 border border-blue-700/60 rounded-lg space-y-2 mt-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <h3 className="font-semibold text-white text-xs">{selectedLead.name}</h3>
                      <button
                        onClick={() => setSelectedLead(null)}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1 text-[10px]">
                      <div>
                        <span className="text-slate-500">Facebook Page: </span>
                        {selectedLead.facebookPageUrl ? (
                          <a
                            href={selectedLead.facebookPageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline break-all"
                          >
                            {selectedLead.facebookPageUrl}
                          </a>
                        ) : (
                          <span className="text-slate-400">Not detected in ad card</span>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-500">Website Destination: </span>
                        {selectedLead.destinationUrl ? (
                          <a
                            href={selectedLead.destinationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline break-all"
                          >
                            {selectedLead.destinationUrl}
                          </a>
                        ) : (
                          <span className="text-slate-400">No external link detected</span>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-500">Ad Library: </span>
                        {selectedLead.adLibraryUrl ? (
                          <a
                            href={selectedLead.adLibraryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-300 hover:underline font-mono text-[9px] inline-flex items-center gap-1"
                          >
                            <span>View Ad ({selectedLead.adLibraryIds[0]})</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-slate-300 font-mono text-[9px]">
                            {selectedLead.adLibraryIds.join(', ')}
                          </span>
                        )}
                      </div>

                      {selectedLead.sampleCopy && (
                        <div className="mt-1 pt-1 border-t border-slate-900">
                          <span className="text-slate-500 block mb-0.5">Observed Ad Copy:</span>
                          <div className="p-1.5 bg-slate-900 rounded text-slate-300 italic text-[10px]">
                            "{selectedLead.sampleCopy}"
                          </div>
                        </div>
                      )}

                      {/* Relevance Audit Trail */}
                      {selectedLead.relevanceDecision && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 font-semibold">Strict Relevance Gate:</span>
                              <span className="px-1.5 py-0.2 bg-blue-950/80 border border-blue-800/80 text-blue-300 rounded text-[8px] font-mono">
                                {selectedLead.engineVersion || 'strict-v2'}
                              </span>
                            </div>
                            <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded text-[9px]">
                              {selectedLead.relevanceDecision} ({selectedLead.relevanceConfidence || 'HIGH'}) • {Math.round((selectedLead.relevanceScore || 1) * 100)}%
                            </span>
                          </div>

                          {selectedLead.relevanceMatchedTerms && selectedLead.relevanceMatchedTerms.length > 0 && (
                            <div className="text-[9px] text-slate-400">
                              <span className="text-slate-500">Matched Category Terms: </span>
                              <span className="text-blue-300">{selectedLead.relevanceMatchedTerms.join(', ')}</span>
                            </div>
                          )}

                          {selectedLead.relevanceReasons && selectedLead.relevanceReasons.length > 0 && (
                            <div className="space-y-0.5 mt-1 bg-slate-900/90 p-1.5 rounded border border-slate-800/80">
                              <span className="text-[9px] text-slate-500 block">Evaluation & Signals:</span>
                              {selectedLead.relevanceReasons.map((r, i) => (
                                <div key={i} className="text-[9px] text-slate-300 flex items-start gap-1">
                                  <span className="text-emerald-400">•</span>
                                  <span>{r}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {selectedLead.relevanceEvidence && selectedLead.relevanceEvidence.length > 0 && (
                            <div className="space-y-1 mt-1">
                              <span className="text-[9px] text-slate-500 block">Verified Evidence Breakdown:</span>
                              <div className="flex flex-wrap gap-1">
                                {selectedLead.relevanceEvidence.map((ev, i) => (
                                  <span
                                    key={i}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono border ${
                                      ev.type === 'ENTITY_IDENTITY'
                                        ? 'bg-blue-950/60 border-blue-800/60 text-blue-300'
                                        : ev.type === 'CATEGORY_MATCH'
                                        ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                                        : ev.type === 'COMMERCIAL_INTENT'
                                        ? 'bg-amber-950/60 border-amber-800/60 text-amber-300'
                                        : 'bg-slate-800 border-slate-700 text-slate-300'
                                    }`}
                                    title={ev.reason}
                                  >
                                    {formatEvidenceType(ev.type)}: {ev.strength}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 bg-slate-800/30 border border-dashed border-slate-700 rounded-lg text-center space-y-2">
                <Search className="w-6 h-6 text-slate-500 mx-auto" />
                <div className="text-slate-400 text-xs">No active research session.</div>
                <button
                  type="button"
                  onClick={() => setActiveTab('RESEARCH')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-[11px]"
                >
                  Configure Research
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HISTORY VIEW */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 px-1">
              <span>Research History ({historyRuns.length})</span>
              {historyRuns.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear History
                </button>
              )}
            </div>

            {historyRuns.length === 0 ? (
              <div className="p-6 bg-slate-800/30 border border-dashed border-slate-700 rounded-lg text-center text-slate-500 text-[11px]">
                No previous research runs recorded yet.
              </div>
            ) : (
              historyRuns.map((run) => (
                <div
                  key={run.runId}
                  className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg space-y-1.5 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">{run.researchName}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                      run.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300' : 
                      run.status === 'PARTIAL' ? 'bg-amber-950/80 text-amber-300' : 
                      run.status === 'CANCELLED' ? 'bg-amber-950 text-amber-300' :
                      run.status === 'RECOVERY_REQUIRED' ? 'bg-amber-900 text-amber-200' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {formatStatus(run.status)}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{run.locationName} • {run.leads.length} of {run.targetLeadCount || run.maxResults} leads</span>
                    <span>{new Date(run.startedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-700/40">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRun(run);
                        setActiveTab('RESULTS');
                      }}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded text-[10px]"
                    >
                      View Results
                    </button>
                    <button
                      type="button"
                      disabled={run.leads.length === 0}
                      onClick={() => handleExportCsv(run.leads, run)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-emerald-400 rounded text-[10px] flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-2.5 h-2.5" />
                      CSV
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};
