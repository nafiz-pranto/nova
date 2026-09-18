import React, { useState, useRef } from 'react';
import { 
  Play, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { 
  ResearchWorkflowRunner, 
  ResearchExecutionResult,
  WorkflowProgressEvent
} from '../utils/researchWorkflowRunner';
import { StatusBadge } from './common/StatusBadge';
import { AdvertiserViewModel, ResearchMode } from '../types';
import { LocationSelector } from './LocationSelector';
import { PresetSelector } from './PresetSelector';
import { getPresetById } from '../data/presetCatalogue';
import { 
  getLocationByCode, 
  META_AD_LIBRARY_LOCATION_CATALOGUE_VERSION 
} from '../data/locationCatalogue';

interface ResearchWizardProps {
  onRunComplete: (result: ResearchExecutionResult) => void;
  onNavigateToLeads: () => void;
  onNavigateToExport: () => void;
  onSelectAdvertiser: (adv: AdvertiserViewModel) => void;
}

export const ResearchWizard: React.FC<ResearchWizardProps> = ({
  onRunComplete,
  onNavigateToLeads,
  onNavigateToExport,
  onSelectAdvertiser,
}) => {
  const [researchState, setResearchState] = useState<'IDLE' | 'RUNNING' | 'COMPLETE' | 'BLOCKED' | 'ERROR'>('IDLE');
  
  const [researchMode, setResearchMode] = useState<ResearchMode>('PRESET');
  const [validationMode, setValidationMode] = useState<'LIVE' | 'CONTROLLED_FIXTURE'>('LIVE');
  const [presetId, setPresetId] = useState<string>('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [countryCode, setCountryCode] = useState<string>('US');
  const [maxResults, setMaxResults] = useState<number>(50);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState<WorkflowProgressEvent | null>(null);

  const [latestResult, setLatestResult] = useState<ResearchExecutionResult | null>(null);
  const abortControllerRef = useRef<boolean>(false);

  const getAutoResearchName = () => {
    const locName = getLocationByCode(countryCode)?.displayName || countryCode;
    let keyStr = 'Research';
    if (researchMode === 'PRESET' && presetId) {
      keyStr = getPresetById(presetId)?.name || 'Preset Research';
    } else if (researchMode === 'CUSTOM' && keywordsInput.trim()) {
      keyStr = keywordsInput.split(/[,;\n]/)[0].trim();
    }
    return `${keyStr} — ${locName} — ${maxResults} Leads`;
  };

  const handleStartResearch = async (forcedMode?: 'LIVE' | 'CONTROLLED_FIXTURE') => {
    setFormError(null);
    setExecutionError(null);
    setProgressLogs([]);
    setCurrentProgress(null);

    const activeValidationMode = forcedMode || validationMode;

    let uniqueKeywords: string[] = [];
    let resolvedPresetVersion: string | undefined = undefined;

    if (researchMode === 'PRESET') {
      if (!presetId) {
        setFormError('Select a research preset.');
        return;
      }
      const preset = getPresetById(presetId);
      if (!preset) {
        setFormError('Selected preset is invalid.');
        return;
      }
      uniqueKeywords = preset.primary_keywords;
      resolvedPresetVersion = preset.version;
    } else {
      const parsedKeywords = keywordsInput
        .split(/[,;\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);
      
      uniqueKeywords = Array.from(new Set(parsedKeywords.map(k => k.toLowerCase())));

      if (uniqueKeywords.length === 0) {
        setFormError('Enter at least one keyword.');
        return;
      }
      if (uniqueKeywords.length > 20) {
        setFormError(`Too many keywords (${uniqueKeywords.length}). Maximum allowed is 20.`);
        return;
      }
    }

    if (!countryCode) {
      setFormError('Select a search location.');
      return;
    }
    if (maxResults < 1 || maxResults > 1000) {
      setFormError('Enter a valid number of leads.');
      return;
    }

    setResearchState('RUNNING');
    abortControllerRef.current = false;
    const idempotencyKey = `idemp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const autoResearchName = getAutoResearchName();

    const request = {
      query: uniqueKeywords[0],
      researchName: autoResearchName,
      keywords: uniqueKeywords,
      countryCode: countryCode,
      locationName: getLocationByCode(countryCode)?.displayName || countryCode,
      locationCatalogueVersion: META_AD_LIBRARY_LOCATION_CATALOGUE_VERSION,
      mode: researchMode,
      presetId: researchMode === 'PRESET' ? presetId : undefined,
      presetVersion: resolvedPresetVersion,
      maxResults: maxResults,
      tenantId: 'tn_198592_default',
      idempotencyKey,
      websiteRequired: false,
      validationMode: activeValidationMode
    };

    try {
      const result = await ResearchWorkflowRunner.executeRun(
        request, 
        (progressEvent) => {
          setCurrentProgress(progressEvent);
          if (progressEvent.logMessage) {
            setProgressLogs(prev => [...prev.slice(-40), progressEvent.logMessage]);
          }
        }
      );

      if (abortControllerRef.current) {
        setResearchState('IDLE');
        return;
      }

      setLatestResult(result);
      onRunComplete(result);

      if (result.job.state === 'BLOCKED') {
        setResearchState('BLOCKED');
      } else {
        setResearchState('COMPLETE');
      }
    } catch (err: any) {
      setResearchState('ERROR');
      setExecutionError(err instanceof Error ? err.message : 'An unknown error occurred during research execution.');
    }
  };

  const handleReset = () => {
    setResearchState('IDLE');
    setLatestResult(null);
    setProgressLogs([]);
    setCurrentProgress(null);
  };

  // 1. IDLE & ERROR FORM VIEW
  if (researchState === 'IDLE' || researchState === 'ERROR') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">New Research</h1>
          <p className="mt-3 text-sm text-neutral-500 max-w-lg mx-auto">
            Choose what you want to research, select a location, and let the scraper gather verified leads.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Research Mode */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Research Mode
              </label>
              <div className="flex bg-neutral-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setResearchMode('PRESET')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                    researchMode === 'PRESET' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Preset
                </button>
                <button
                  type="button"
                  onClick={() => setResearchMode('CUSTOM')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                    researchMode === 'CUSTOM' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Custom
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                {researchMode === 'PRESET' ? 'Choose a ready-made research strategy.' : 'Use your own keywords.'}
              </p>
            </div>

            {/* Execution Strategy */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Execution Target
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValidationMode('LIVE')}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    validationMode === 'LIVE'
                      ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600 text-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Live Meta Scraper</div>
                  <div className="text-xs text-neutral-600">Connect directly to Meta Ad Library public interface.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setValidationMode('CONTROLLED_FIXTURE')}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    validationMode === 'CONTROLLED_FIXTURE'
                      ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600 text-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">Controlled Fixture</div>
                  <div className="text-xs text-neutral-600">Deterministic verified SaaS corpus for pipeline & result tests.</div>
                </button>
              </div>
            </div>

            {researchMode === 'PRESET' ? (
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  What are you looking for?
                </label>
                <PresetSelector
                  value={presetId}
                  onChange={setPresetId}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="keywords-input" className="block text-sm font-bold text-neutral-900 mb-2">
                  Keywords
                </label>
                <textarea
                  id="keywords-input"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="e.g. SaaS, CRM, Marketing Agency"
                  className="w-full h-24 p-3 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400 font-mono resize-none transition-colors"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Use commas or separate keywords with new lines.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Search Location
              </label>
              <LocationSelector
                value={countryCode}
                onChange={(code) => setCountryCode(code)}
                disabled={false}
              />
              <p className="text-xs text-neutral-500 mt-2">
                Location used for Meta Ad Library research.
              </p>
            </div>

            <div>
              <label htmlFor="max-leads-input" className="block text-sm font-bold text-neutral-900 mb-2">
                Maximum Leads
              </label>
              <input
                id="max-leads-input"
                type="number"
                min={1}
                max={1000}
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value) || 0)}
                className="w-full sm:w-1/3 p-3 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono transition-colors"
              />
              <p className="text-xs text-neutral-500 mt-2">
                Maximum number of unique leads in the final result.
              </p>
            </div>

            {formError && (
              <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200 font-medium">
                {formError}
              </div>
            )}
            {executionError && (
              <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Research execution stopped:
                </div>
                <div className="text-xs font-mono bg-rose-100/70 p-2 rounded">{executionError}</div>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleStartResearch()}
              disabled={(researchMode === 'PRESET' ? !presetId : !keywordsInput.trim()) || !countryCode}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START RESEARCH</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. RUNNING STREAMING VIEW
  if (researchState === 'RUNNING') {
    const percent = currentProgress?.percent || 10;
    const stageName = currentProgress?.stageLabel || 'Initializing Research Scraper...';

    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Research Job in Progress</h2>
                <p className="text-xs text-neutral-500">{stageName}</p>
              </div>
            </div>
            <span className="font-mono text-sm font-bold text-purple-700">{percent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Real-time Streaming Logs */}
          <div className="bg-neutral-900 rounded-xl p-4 font-mono text-xs text-neutral-300 space-y-1.5 h-64 overflow-y-auto border border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-500 pb-2 border-b border-neutral-800 mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>Execution DAG Event Stream</span>
            </div>
            {progressLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))}
            {progressLogs.length === 0 && (
              <div className="text-neutral-600 italic">Waiting for initial scraper event stream from server...</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. BLOCKED STATE VIEW (Clean, accurate preservation of BLOCKED facts)
  if (researchState === 'BLOCKED' && latestResult) {
    const job = latestResult.job;
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-mono text-[10px] font-bold rounded">
                  STATE: BLOCKED
                </span>
                <span className="text-xs text-neutral-500 font-mono">Job ID: {job.jobId}</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mt-1">
                Research Blocked: Live Browser Execution Unavailable
              </h2>
              <p className="text-sm text-neutral-600 mt-2">
                The research job was accepted and safely initialized, but the live Meta Ad Library browser worker was blocked from extracting ads.
              </p>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-amber-200 font-mono text-xs space-y-2">
            <div>
              <span className="font-bold text-neutral-700">Stop Reason: </span>
              <span className="text-amber-800">{job.stopReason || 'META_AD_LIBRARY_ACCESS_BLOCKED'}</span>
            </div>
            <div>
              <span className="font-bold text-neutral-700">Perimeter Diagnostic: </span>
              <span className="text-neutral-800">{job.challengeReason || 'Meta Ad Library returned HTTP 403 Forbidden. Cloud datacenter IP is blocked by Meta anti-bot security perimeter.'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => handleStartResearch('CONTROLLED_FIXTURE')}
              className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Controlled Validation Fixture</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold rounded-xl border border-neutral-300 transition-colors cursor-pointer"
            >
              Back to Research Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. COMPLETE VIEW (Verified Leads Table)
  if (researchState === 'COMPLETE' && latestResult) {
    const websiteFoundCount = latestResult.newAdvertisers.filter(a => a.destinationUrl).length;
    const websiteNotFoundCount = latestResult.newAdvertisers.length - websiteFoundCount;
    
    const fbFoundCount = latestResult.newAdvertisers.filter(a => a.facebookPageName || a.facebookPageUrl || a.adLibraryId).length;
    const fbNotFoundCount = latestResult.newAdvertisers.length - fbFoundCount;

    return (
      <div className="max-w-6xl mx-auto py-8 px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              Research Complete
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              <span className="font-bold text-neutral-900">{latestResult.newAdvertisers.length} LEADS FOUND</span> out of {maxResults} requested.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
            >
              New Research
            </button>
            <button
              onClick={onNavigateToExport}
              className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
            >
              Export Results
            </button>
            <button
              onClick={onNavigateToLeads}
              className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>VIEW RESULTS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Website</div>
            <div className="text-lg font-bold text-neutral-900">{websiteFoundCount} found</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Website</div>
            <div className="text-lg font-bold text-neutral-500">{websiteNotFoundCount} not found</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Facebook Page</div>
            <div className="text-lg font-bold text-neutral-900">{fbFoundCount} found</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Facebook Page</div>
            <div className="text-lg font-bold text-neutral-500">{fbNotFoundCount} not found / unknown</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3">Advertiser</th>
                  <th className="px-5 py-3">Facebook Page</th>
                  <th className="px-5 py-3">Website</th>
                  <th className="px-5 py-3">Ads</th>
                  <th className="px-5 py-3">Keyword</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {latestResult.newAdvertisers.map(adv => (
                  <tr key={adv.advertiserId} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-neutral-900">{adv.canonicalName}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      {adv.facebookPageName || adv.adLibraryId ? (
                        <div className="flex items-center gap-1.5 text-neutral-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Found</span>
                        </div>
                      ) : (
                        <div className="text-neutral-400 italic">Not found</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {adv.destinationUrl ? (
                        <a 
                          href={adv.destinationUrl} 
                          target="_blank" 
                          rel="noreferrer noopener"
                          className="font-mono text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          {adv.destinationDomain}
                          <ExternalLink className="w-3 h-3 text-neutral-400" />
                        </a>
                      ) : (
                        <span className="text-neutral-400 italic">Not found</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-neutral-600">
                      {adv.activeAdCount}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(adv.matchedKeywords || []).map((k, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] font-mono">
                            {k}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">
                      {getLocationByCode(adv.locationCode || countryCode)?.displayName || adv.locationCode || countryCode}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={adv.qualificationState || 'QUALIFIED'} size="sm" showPrefix={false} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectAdvertiser(adv)}
                        className="text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  return null;
};
