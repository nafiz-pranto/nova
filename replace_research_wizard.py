import re

with open('src/components/ResearchWizard.tsx', 'r') as f:
    content = f.read()

# I want to add PresetSelector and getPresetById
if "import { PresetSelector }" not in content:
    content = content.replace("import { LocationSelector } from './LocationSelector';", "import { LocationSelector } from './LocationSelector';\nimport { PresetSelector } from './PresetSelector';\nimport { getPresetById } from '../data/presetCatalogue';\nimport { ResearchMode } from '../types';")

# I want to replace keywordsInput with mode, preset, and keywords
content = content.replace("const [keywordsInput, setKeywordsInput] = useState('');", "const [researchMode, setResearchMode] = useState<ResearchMode>('PRESET');\n  const [presetId, setPresetId] = useState<string>('');\n  const [keywordsInput, setKeywordsInput] = useState('');")

# Inside getAutoResearchName
new_getAutoResearchName = """  const getAutoResearchName = () => {
    const locName = getLocationByCode(countryCode)?.displayName || countryCode;
    let keyStr = 'Research';
    if (researchMode === 'PRESET' && presetId) {
      keyStr = getPresetById(presetId)?.name || 'Preset Research';
    } else if (researchMode === 'CUSTOM' && keywordsInput.trim()) {
      keyStr = keywordsInput.split(/[,;\n]/)[0].trim();
    }
    return `${keyStr} — ${locName} — ${maxResults} Leads`;
  };"""

content = re.sub(r"const getAutoResearchName = \(\) => \{[\s\S]*?\};", new_getAutoResearchName, content)

# Inside handleStartResearch
new_startResearch = """  const handleStartResearch = async () => {
    // 1. Validation
    setFormError(null);
    setExecutionError(null);

    let uniqueKeywords: string[] = [];
    let resolvedPresetVersion: string | undefined = undefined;

    if (researchMode === 'PRESET') {
      if (!presetId) {
        setFormError('Please select a research preset to continue.');
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
        setFormError('Please enter at least one keyword.');
        return;
      }

      if (uniqueKeywords.length > 20) {
        setFormError(`Too many keywords (${uniqueKeywords.length}). Maximum allowed is 20.`);
        return;
      }
    }

    if (!countryCode) {
      setFormError('Please select a target location.');
      return;
    }

    if (maxResults < 1 || maxResults > 1000) {
      setFormError('Maximum leads must be between 1 and 1000.');
      return;
    }

    // 2. Execution Setup
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
    };"""

content = re.sub(r"const handleStartResearch = async \(\) => \{[\s\S]*?websiteRequired: false\n    \};", new_startResearch, content)

form_jsx = """            {/* Research Mode Selector */}
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

            {/* Dynamic Input based on Mode */}
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
                  placeholder="e.g. SaaS, CRM, Marketing Agency (comma or newline separated)"
                  className="w-full h-24 p-3 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400 font-mono resize-none transition-colors"
                />
              </div>
            )}"""

content = re.sub(r"\{\/\* Keywords \*\/\}.*?<\/div>", form_jsx, content, flags=re.DOTALL)


content = content.replace("disabled={!keywordsInput.trim() || !countryCode}", "disabled={(researchMode === 'PRESET' ? !presetId : !keywordsInput.trim()) || !countryCode}")

with open('src/components/ResearchWizard.tsx', 'w') as f:
    f.write(content)

