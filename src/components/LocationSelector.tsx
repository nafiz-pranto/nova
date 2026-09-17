import React, { useState, useMemo } from 'react';
import { Globe, Search, Check, ChevronDown, MapPin, X } from 'lucide-react';
import { 
  MetaAdLibraryLocation, 
  getAllLocations, 
  getPopularLocations, 
  searchLocations, 
  getLocationByCode,
  META_AD_LIBRARY_LOCATION_CATALOGUE_VERSION
} from '../data/locationCatalogue';

interface LocationSelectorProps {
  value: string; // ISO 3166-1 alpha-2
  onChange: (locationCode: string, locationObj?: MetaAdLibraryLocation) => void;
  disabled?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  const popularLocations = useMemo(() => getPopularLocations(), []);
  const allLocations = useMemo(() => getAllLocations(), []);

  const selectedLocation = useMemo(() => {
    return getLocationByCode(value) || {
      locationCode: value,
      displayName: value,
      region: 'North America',
      aliases: [],
      status: 'ACTIVE'
    } as MetaAdLibraryLocation;
  }, [value]);

  const filteredLocations = useMemo(() => {
    let list = searchQuery.trim() ? searchLocations(searchQuery) : allLocations;
    if (selectedRegion !== 'ALL') {
      list = list.filter(loc => loc.region === selectedRegion);
    }
    return list;
  }, [searchQuery, selectedRegion, allLocations]);

  const regions = ['ALL', 'North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East', 'Africa'];

  const handleSelect = (loc: MetaAdLibraryLocation) => {
    onChange(loc.locationCode, loc);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <span className="text-[10px] text-neutral-500 font-mono">
          Catalogue {META_AD_LIBRARY_LOCATION_CATALOGUE_VERSION}
        </span>
      </div>

      {/* Popular Quick Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-neutral-500 font-medium mr-1">Popular:</span>
        {popularLocations.map(loc => {
          const isSelected = loc.locationCode === value;
          return (
            <button
              key={loc.locationCode}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(loc)}
              className={`px-2 py-0.5 text-xs rounded-md font-mono transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              {loc.locationCode}
            </button>
          );
        })}
      </div>

      {/* Trigger & Dropdown */}
      <div className="relative">
        <button
          id="location-selector-trigger"
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-full p-2.5 text-xs bg-neutral-50 border rounded-lg flex items-center justify-between transition-all text-left cursor-pointer ${
            isOpen ? 'border-neutral-900 ring-2 ring-neutral-900/10 bg-white' : 'border-neutral-300 hover:border-neutral-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-4 bg-neutral-200 text-neutral-700 text-[10px] font-mono font-bold rounded flex items-center justify-center">
              {selectedLocation.locationCode}
            </span>
            <span className="font-semibold text-neutral-900">{selectedLocation.displayName}</span>
            <span className="text-[11px] text-neutral-400 font-medium">({selectedLocation.region})</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute z-50 mt-1.5 w-full bg-white border border-neutral-200 rounded-xl shadow-lg p-3 space-y-2.5 animate-in fade-in-50">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search country, region, alias or code (e.g., Germany, BD, UK)..."
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Region Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                {regions.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRegion(r)}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                      selectedRegion === r
                        ? 'bg-purple-600 text-white font-semibold'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Location List */}
              <div className="max-h-56 overflow-y-auto divide-y divide-neutral-100 border border-neutral-100 rounded-lg">
                {filteredLocations.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-500">
                    No matching locations found for "{searchQuery}".
                  </div>
                ) : (
                  filteredLocations.map(loc => {
                    const isSelected = loc.locationCode === value;
                    return (
                      <button
                        key={loc.locationCode}
                        type="button"
                        onClick={() => handleSelect(loc)}
                        className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-neutral-100 font-semibold text-neutral-900' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 text-[11px] font-mono font-bold text-neutral-500 text-center bg-neutral-100 rounded py-0.5">
                            {loc.locationCode}
                          </span>
                          <div>
                            <div className="text-neutral-900 font-medium">{loc.displayName}</div>
                            <div className="text-[10px] text-neutral-400">
                              {loc.region}
                              {loc.aliases.length > 0 ? ` &bull; ${loc.aliases.slice(0, 2).join(', ')}` : ''}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="text-[10px] text-neutral-400 px-1">
                Note: Location specifies the target market parameter for Meta Ad Library ad distribution, not physical corporate incorporation.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
