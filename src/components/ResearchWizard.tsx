import React, { useState, useRef } from 'react';
import { 
  Play, 
  CheckCircle2, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { 
  ResearchWorkflowRunner, 
  ResearchExecutionResult
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
  const [researchState, setResearchState] = useState<'IDLE' | 'RUNNING' | 'COMPLETE' | 'ERROR'>('IDLE');
  
  const [researchMode, setResearchMode] = useState<ResearchMode>('PRESET');
  const [presetId, setPresetId] = useState<string>('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [countryCode, setCountryCode] = useState<string>('US');
  const [maxResults, setMaxResults] = useState<number>(50);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

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

  const handleStartResearch = async () => {
    setFormError(null);
    setExecutionError(null);

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
      websiteRequired: false
    };

    try {
      const result = await ResearchWorkflowRunner.executeRun(
        request, 
        () => {} // optional progress
      );

      if (abortControllerRef.current) {
        setResearchState('IDLE');
        return;
      }

      setLatestResult(result);
      setResearchState('COMPLETE');
      onRunComplete(result);
    } catch (err: any) {
      setResearchState('ERROR');
      setExecutionError(err instanceof Error ? err.message : 'An unknown error occurred during research execution.');
    }
  };

  const handleReset = () => {
    setResearchState('IDLE');
    setLatestResult(null);
  };

  if (researchState === 'IDLE' || researchState === 'ERROR') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">New Research</h1>
          <p className="mt-3 text-sm text-neutral-500 max-w-lg mx-auto">
            Choose what you want to research, select a location, and let the system handle the rest.
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
              <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200 font-medium">
                <span className="font-bold">Research paused:</span> {executionError}
              </div>
            )}
          </div>

          <div className="bg-neutral-50 px-6 py-5 sm:px-8 border-t border-neutral-200">
            <button
              onClick={handleStartResearch}
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

  if (researchState === 'RUNNING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-neutral-900 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-neutral-900">Research started</h2>
        <div className="mt-4 text-neutral-500 text-sm flex flex-col items-center gap-2">
          <span>Finding relevant advertisers...</span>
          <span>Processing results...</span>
          <span>Finalizing leads...</span>
        </div>
      </div>
    );
  }

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
