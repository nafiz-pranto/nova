import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { RESEARCH_PRESETS, getPresetCategories, searchPresets, ResearchPreset } from '../data/presetCatalogue';

interface PresetSelectorProps {
  value: string;
  onChange: (presetId: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = useMemo(() => ['ALL', ...getPresetCategories()], []);
  
  const filteredPresets = useMemo(() => {
    return searchPresets(searchTerm, activeCategory);
  }, [searchTerm, activeCategory]);

  const selectedPreset = useMemo(() => {
    return RESEARCH_PRESETS.find(p => p.preset_id === value);
  }, [value]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
      >
        <div className="flex flex-col text-left">
          {selectedPreset ? (
            <>
              <span className="font-bold text-neutral-900">{selectedPreset.name}</span>
              <span className="text-xs text-neutral-500">{selectedPreset.description}</span>
            </>
          ) : (
            <span className="text-neutral-500">Select a preset...</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-96">
          <div className="p-3 border-b border-neutral-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search presets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Industries' : cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-y-auto p-2 space-y-1">
            {filteredPresets.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">
                No presets found matching your search.
              </div>
            ) : (
              filteredPresets.map(preset => (
                <button
                  key={preset.preset_id}
                  onClick={() => {
                    onChange(preset.preset_id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-start gap-3 ${
                    value === preset.preset_id
                      ? 'bg-purple-50 text-purple-900 border border-purple-200'
                      : 'hover:bg-neutral-50 border border-transparent'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-bold">{preset.name}</div>
                    <div className="text-xs mt-0.5 opacity-80">{preset.description}</div>
                  </div>
                  {value === preset.preset_id && (
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
