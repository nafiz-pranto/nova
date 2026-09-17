import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Building2, 
  FileText, 
  Globe, 
  Briefcase, 
  ArrowRight, 
  Clock, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { SAMPLE_ADVERTISERS, SAMPLE_ADS, SAMPLE_RESEARCH_JOBS } from '../data/phase08FixturesAndAudit';
import { AdvertiserViewModel, AdViewModel, ResearchJobModel } from '../types';
import { StatusBadge } from './common/StatusBadge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAdvertiser: (adv: AdvertiserViewModel) => void;
  onSelectJob: (job: ResearchJobModel) => void;
  onSelectAd: (ad: AdViewModel) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAdvertiser,
  onSelectJob,
  onSelectAd,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'ADVERTISERS' | 'ADS' | 'DOMAINS' | 'JOBS'>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Filter Advertisers
  const matchedAdvertisers = SAMPLE_ADVERTISERS.filter(adv => 
    !normalizedQuery ||
    adv.canonicalName.toLowerCase().includes(normalizedQuery) ||
    adv.adLibraryId.toLowerCase().includes(normalizedQuery) ||
    adv.destinationDomain.toLowerCase().includes(normalizedQuery)
  );

  // Filter Ads
  const matchedAds = SAMPLE_ADS.filter(ad => 
    !normalizedQuery ||
    ad.adId.toLowerCase().includes(normalizedQuery) ||
    ad.headline.toLowerCase().includes(normalizedQuery) ||
    ad.observedText.toLowerCase().includes(normalizedQuery) ||
    ad.ctaText.toLowerCase().includes(normalizedQuery)
  );

  // Filter Jobs
  const matchedJobs = SAMPLE_RESEARCH_JOBS.filter(job => 
    !normalizedQuery ||
    job.query.toLowerCase().includes(normalizedQuery) ||
    job.jobId.toLowerCase().includes(normalizedQuery) ||
    job.idempotencyKey.toLowerCase().includes(normalizedQuery)
  );

  const recentSearches = [
    'residential solar panel Texas',
    'Apex Roofing',
    'metrodentalcare.org',
    'quantum crypto blocker'
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global Research Search"
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[80vh] box-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 bg-neutral-50/50 gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search advertisers, ads, domains, URLs, job IDs..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 focus:outline-none"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium text-neutral-500 bg-neutral-200/70 border border-neutral-300/60">
            ESC
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-neutral-100 bg-white overflow-x-auto text-xs font-medium">
          {(['ALL', 'ADVERTISERS', 'ADS', 'DOMAINS', 'JOBS'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === f 
                  ? 'bg-purple-600 text-white font-semibold' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {!query && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Advertisers */}
          {(filterType === 'ALL' || filterType === 'ADVERTISERS' || filterType === 'DOMAINS') && matchedAdvertisers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
                <span>Advertisers ({matchedAdvertisers.length})</span>
                <span className="font-mono text-[10px]">Indexed in Database</span>
              </div>
              <div className="space-y-1.5">
                {matchedAdvertisers.map(adv => (
                  <div
                    key={adv.advertiserId}
                    onClick={() => {
                      onSelectAdvertiser(adv);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50/80 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-colors shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 truncate flex items-center gap-2">
                          <span>{adv.canonicalName}</span>
                          <span className="text-[11px] font-mono text-neutral-400 font-normal">
                            {adv.destinationDomain}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>{adv.activeAdCount} Active Ads</span>
                          <span>&bull;</span>
                          <span>Score: {adv.qualificationScore}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={adv.qualificationState} size="sm" showPrefix={false} />
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Ads */}
          {(filterType === 'ALL' || filterType === 'ADS') && matchedAds.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Observed Ads ({matchedAds.length})
              </div>
              <div className="space-y-1.5">
                {matchedAds.map(ad => (
                  <div
                    key={ad.adId}
                    onClick={() => {
                      onSelectAd(ad);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50/80 transition-all cursor-pointer flex items-start justify-between group gap-2"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-neutral-900 truncate">
                          {ad.headline}
                        </div>
                        <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                          {ad.observedText}
                        </p>
                        <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-2 mt-1">
                          <span>{ad.adLibraryId}</span>
                          <span>&bull;</span>
                          <span>CTA: {ad.ctaText}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-100 text-neutral-700 shrink-0">
                      {ad.creativeType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Jobs */}
          {(filterType === 'ALL' || filterType === 'JOBS') && matchedJobs.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Research Jobs ({matchedJobs.length})
              </div>
              <div className="space-y-1.5">
                {matchedJobs.map(job => (
                  <div
                    key={job.jobId}
                    onClick={() => {
                      onSelectJob(job);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50/80 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-colors shrink-0">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 truncate">
                          {job.query}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>{job.jobId}</span>
                          <span>&bull;</span>
                          <span>{job.processedCount} / {job.totalExpectedLimit} leads</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={job.state} size="sm" showPrefix={false} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {query && matchedAdvertisers.length === 0 && matchedAds.length === 0 && matchedJobs.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <div className="text-sm font-semibold text-neutral-800">No records found</div>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                No advertisers, ads, or jobs matched "{query}". Check spelling or try searching by domain name.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Search scope: Real Indexed Database &bull; Schema 3.0</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
