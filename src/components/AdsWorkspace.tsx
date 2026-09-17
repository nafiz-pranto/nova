import React, { useState } from 'react';
import { SAMPLE_ADS, SAMPLE_ADVERTISERS } from '../data/phase08FixturesAndAudit';
import { AdViewModel, AdvertiserViewModel } from '../types';
import { StatusBadge } from './common/StatusBadge';
import { PageHeader } from './common/PageHeader';
import { 
  FileText, 
  Search, 
  Filter, 
  ExternalLink, 
  Layers, 
  X, 
  Eye, 
  Calendar, 
  Globe, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  Building2,
  Share2,
  Copy,
  Hash
} from 'lucide-react';

interface AdsWorkspaceProps {
  onSelectAdvertiser: (adv: AdvertiserViewModel) => void;
}

export const AdsWorkspace: React.FC<AdsWorkspaceProps> = ({ onSelectAdvertiser }) => {
  const [ads] = useState<AdViewModel[]>(SAMPLE_ADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [creativeTypeFilter, setCreativeTypeFilter] = useState<string>('ALL');
  const [selectedAd, setSelectedAd] = useState<AdViewModel | null>(SAMPLE_ADS[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Filter ads
  const filteredAds = ads.filter(ad => {
    const matchesSearch = 
      !searchQuery ||
      ad.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.observedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.adLibraryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.adId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = 
      platformFilter === 'ALL' || 
      ad.platforms.some(p => p.toUpperCase().includes(platformFilter.toUpperCase()));

    const matchesCreative = 
      creativeTypeFilter === 'ALL' || 
      ad.creativeType === creativeTypeFilter;

    return matchesSearch && matchesPlatform && matchesCreative;
  });

  const getAdvertiserForAd = (advId: string): AdvertiserViewModel | undefined => {
    return SAMPLE_ADVERTISERS.find(a => a.advertiserId === advId);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Ads Intelligence & Creatives', active: true },
        ]}
        title="Observed Ads & Public Creatives"
        description="Search, inspect, and trace verbatim public ad copy, destination URLs, creative types, and cryptographic provenance nodes extracted from the Meta Ad Library."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            {filteredAds.length} Records Indexed
          </span>
        }
      />

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search ad text, headline, Meta Ad Library ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-900 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 font-medium">Platform:</span>
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="ALL">All Platforms</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="MESSENGER">Messenger</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 font-medium">Type:</span>
            <select
              value={creativeTypeFilter}
              onChange={e => setCreativeTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="ALL">All Creatives</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="CAROUSEL">Carousel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAds.map(ad => {
          const adv = getAdvertiserForAd(ad.advertiserId);
          return (
            <div
              key={ad.adId}
              className="bg-white rounded-xl border border-neutral-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Creative Thumbnail / Fallback Header */}
              <div className="h-32 bg-neutral-100 border-b border-neutral-200 relative flex items-center justify-center p-3 text-center overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-neutral-900/10 pointer-events-none" />
                <div className="space-y-1 relative z-10">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white/90 text-neutral-800 shadow-xs">
                    {ad.creativeType} Creative
                  </span>
                  <div className="text-[11px] font-mono text-neutral-500">
                    ID: {ad.adLibraryId}
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-600 text-white shadow-xs">
                    {ad.extractionStatus}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  {/* Advertiser link */}
                  {adv && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onSelectAdvertiser(adv)}
                        className="text-xs font-semibold text-neutral-900 hover:text-emerald-700 flex items-center gap-1.5 truncate max-w-[200px]"
                      >
                        <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{adv.canonicalName}</span>
                      </button>
                      <StatusBadge status={adv.qualificationState} size="sm" showPrefix={false} />
                    </div>
                  )}

                  {/* Headline & Body */}
                  <h4 className="text-sm font-bold text-neutral-900 line-clamp-1 leading-snug">
                    {ad.headline}
                  </h4>
                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {ad.observedText}
                  </p>
                </div>

                {/* Metadata details */}
                <div className="pt-3 border-t border-neutral-100 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-neutral-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      Started: {ad.startDate}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 font-medium">
                      CTA: {ad.ctaText}
                    </span>
                  </div>

                  {/* Platforms */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {ad.platforms.map((p, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-600"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedAd(ad);
                    setIsDrawerOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950 focus:outline-none"
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Inspect Details</span>
                </button>

                {ad.destinationUrl && (
                  <a
                    href={ad.destinationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900"
                  >
                    <span>Destination</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAds.length === 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900">No observed ads match filters</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting search terms, clearing platform filters, or resetting creative criteria.
          </p>
        </div>
      )}

      {/* Ad Detail Drawer (Section 15) */}
      {isDrawerOpen && selectedAd && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-end bg-neutral-950/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-xl h-full bg-white shadow-2xl border-l border-neutral-200 overflow-y-auto flex flex-col justify-between box-border p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-600 text-white">
                      AD RECORD
                    </span>
                    <span className="text-xs font-mono text-neutral-500">
                      {selectedAd.adId}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mt-1">
                    {selectedAd.headline}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Observed Verbatim Copy */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Observed Public Ad Text
                </div>
                <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 leading-relaxed font-sans">
                  {selectedAd.observedText}
                </div>
              </div>

              {/* Identity & Source */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                  <div className="text-neutral-400 text-[10px] font-mono uppercase">Meta Ad Library ID</div>
                  <div className="font-mono font-bold text-neutral-900 mt-0.5">{selectedAd.adLibraryId}</div>
                </div>
                <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                  <div className="text-neutral-400 text-[10px] font-mono uppercase">CTA Category</div>
                  <div className="font-mono font-bold text-neutral-900 mt-0.5">{selectedAd.ctaText}</div>
                </div>
                <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                  <div className="text-neutral-400 text-[10px] font-mono uppercase">Start Date</div>
                  <div className="font-mono font-bold text-neutral-900 mt-0.5">{selectedAd.startDate}</div>
                </div>
                <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                  <div className="text-neutral-400 text-[10px] font-mono uppercase">Extraction Status</div>
                  <div className="font-mono font-bold text-emerald-700 mt-0.5">{selectedAd.extractionStatus}</div>
                </div>
              </div>

              {/* Destination URL */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Target Destination URL
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs font-mono break-all gap-2">
                  <span className="text-neutral-800 select-all">{selectedAd.destinationUrl}</span>
                  <a
                    href={selectedAd.destinationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-neutral-500 hover:text-neutral-900 shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Cryptographic Provenance Node */}
              <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Layer C Provenance Node
                  </span>
                  <button
                    onClick={() => handleCopyHash(selectedAd.provenanceHash)}
                    className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedHash ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono text-neutral-300 break-all bg-neutral-800/80 p-2 rounded border border-neutral-700">
                  {selectedAd.provenanceHash}
                </div>
                <p className="text-[10px] text-neutral-400 font-mono">
                  Immutable SHA-256 fingerprint verified against DOM observation envelope.
                </p>
              </div>
            </div>

            {/* Bottom Drawer Actions */}
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Close Drawer
              </button>

              {getAdvertiserForAd(selectedAd.advertiserId) && (
                <button
                  onClick={() => {
                    const adv = getAdvertiserForAd(selectedAd.advertiserId);
                    if (adv) {
                      setIsDrawerOpen(false);
                      onSelectAdvertiser(adv);
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Open Lead Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
