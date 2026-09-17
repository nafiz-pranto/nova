import React, { useState } from 'react';
import { SAMPLE_ADVERTISERS, SAMPLE_ADS } from '../data/phase08FixturesAndAudit';
import { AdvertiserViewModel } from '../types';
import { StatusBadge } from './common/StatusBadge';
import { PageHeader } from './common/PageHeader';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Building2, 
  ExternalLink, 
  ArrowRight,
  Filter,
  Tag,
  Star,
  Users,
  Bell,
  Sliders,
  TrendingUp,
  FileText,
  Search,
  Clock,
  History,
  AlertCircle
} from 'lucide-react';

export type WatchlistKind = 'ENTITY' | 'AD' | 'QUERY_MARKET';

interface WatchlistAlertConfig {
  onAdAddedRemoved: boolean;
  onScoreDeltaThreshold: number; // e.g. 5 points
  onStatusChange: boolean;
  onDomainFailure: boolean;
}

interface WatchlistChangeItem {
  id: string;
  timestamp: string;
  entityName: string;
  changeType: string;
  deltaSummary: string;
}

interface Watchlist {
  id: string;
  name: string;
  kind: WatchlistKind;
  description: string;
  targetCount: number;
  unreadChanges: number;
  entityIds: string[];
  alertConfig: WatchlistAlertConfig;
  createdAt: string;
  color: string;
}

interface WatchlistWorkspaceProps {
  onSelectAdvertiser: (adv: AdvertiserViewModel) => void;
}

export const WatchlistWorkspace: React.FC<WatchlistWorkspaceProps> = ({ onSelectAdvertiser }) => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    {
      id: 'wl_solar_top',
      name: 'Priority Clean Energy Cohort',
      kind: 'ENTITY',
      description: 'Verified residential solar installers with active Meta ads, valid TLS, and score >= 80.',
      targetCount: 1,
      unreadChanges: 2,
      entityIds: ['adv_01j7p8_solarflow'],
      alertConfig: {
        onAdAddedRemoved: true,
        onScoreDeltaThreshold: 5,
        onStatusChange: true,
        onDomainFailure: true,
      },
      createdAt: '2026-09-16T08:30:00Z',
      color: 'emerald'
    },
    {
      id: 'wl_florida_contractors',
      name: 'Florida Roofing Contractors',
      kind: 'QUERY_MARKET',
      description: 'Recurring market watchlist tracking queries for roofing, hurricane repair, and restoration contractors.',
      targetCount: 1,
      unreadChanges: 1,
      entityIds: ['adv_01j7p8_apexroof'],
      alertConfig: {
        onAdAddedRemoved: true,
        onScoreDeltaThreshold: 10,
        onStatusChange: true,
        onDomainFailure: false,
      },
      createdAt: '2026-09-16T09:10:00Z',
      color: 'blue'
    },
    {
      id: 'wl_compliance_hold',
      name: 'Compliance Quarantine & Blockers',
      kind: 'ENTITY',
      description: 'Quarantined entities triggering non-negotiable compliance rules (unsupported promises or dead gateways).',
      targetCount: 1,
      unreadChanges: 0,
      entityIds: ['adv_01j7p8_quantumcrypto'],
      alertConfig: {
        onAdAddedRemoved: false,
        onScoreDeltaThreshold: 0,
        onStatusChange: true,
        onDomainFailure: true,
      },
      createdAt: '2026-09-16T07:45:00Z',
      color: 'red'
    }
  ]);

  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('wl_solar_top');
  const [activeTab, setActiveTab] = useState<'ENTITIES' | 'TIMELINE' | 'ALERTS'>('ENTITIES');
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListKind, setNewListKind] = useState<WatchlistKind>('ENTITY');
  const [newListDesc, setNewListDesc] = useState('');

  const sampleChangeEvents: WatchlistChangeItem[] = [
    {
      id: 'evt_01',
      timestamp: '45m ago',
      entityName: 'SolarFlow Energy Solutions LLC',
      changeType: 'AD_OBSERVED',
      deltaSummary: '+1 new ad observed in Meta Ad Library (Meta Ad ID: meta_ad_99212001).'
    },
    {
      id: 'evt_02',
      timestamp: '3h ago',
      entityName: 'SolarFlow Energy Solutions LLC',
      changeType: 'SCORE_RECALCULATED',
      deltaSummary: 'Qualification score increased from 82.5 to 87.5 (+5.0 pts) on positive HTTPS & WHOIS verification.'
    },
    {
      id: 'evt_03',
      timestamp: '1d ago',
      entityName: 'Apex Roofing & Restoration Co',
      changeType: 'STATUS_FLAGGED',
      deltaSummary: 'Identity ambiguity review queue item created for apexroofingflorida.com vs apex-roof.net.'
    }
  ];

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];

  const watchlistAdvertisers = SAMPLE_ADVERTISERS.filter(adv => 
    activeWatchlist?.entityIds.includes(adv.advertiserId)
  );

  const unassignedAdvertisers = SAMPLE_ADVERTISERS.filter(adv => 
    !activeWatchlist?.entityIds.includes(adv.advertiserId)
  );

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newWl: Watchlist = {
      id: `wl_${Date.now()}`,
      name: newListName.trim(),
      kind: newListKind,
      description: newListDesc.trim() || 'Custom operator research watchlist',
      targetCount: 0,
      unreadChanges: 0,
      entityIds: [],
      alertConfig: {
        onAdAddedRemoved: true,
        onScoreDeltaThreshold: 5,
        onStatusChange: true,
        onDomainFailure: true,
      },
      createdAt: new Date().toISOString(),
      color: 'neutral'
    };
    setWatchlists(prev => [...prev, newWl]);
    setActiveWatchlistId(newWl.id);
    setNewListName('');
    setNewListDesc('');
    setIsCreating(false);
  };

  const handleDeleteWatchlist = (id: string) => {
    setWatchlists(prev => prev.filter(w => w.id !== id));
    if (activeWatchlistId === id && watchlists.length > 1) {
      const remaining = watchlists.filter(w => w.id !== id);
      setActiveWatchlistId(remaining[0].id);
    }
  };

  const handleRemoveEntity = (advId: string) => {
    setWatchlists(prev => prev.map(w => {
      if (w.id === activeWatchlistId) {
        return { 
          ...w, 
          entityIds: w.entityIds.filter(id => id !== advId),
          targetCount: Math.max(0, w.entityIds.length - 1)
        };
      }
      return w;
    }));
  };

  const handleAddEntity = (advId: string) => {
    setWatchlists(prev => prev.map(w => {
      if (w.id === activeWatchlistId && !w.entityIds.includes(advId)) {
        return { 
          ...w, 
          entityIds: [...w.entityIds, advId],
          targetCount: w.entityIds.length + 1
        };
      }
      return w;
    }));
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Watchlists & Saved Sets', active: true },
        ]}
        title="Custom Research Watchlists & Change Tracking"
        description="Monitor cohorts of verified advertisers, ad creatives, or recurring market queries. Real-time change tracking across ad libraries, score movements, and infrastructure updates."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            {watchlists.length} Active Watchlists &bull; {watchlists.reduce((acc, w) => acc + w.unreadChanges, 0)} Unread Deltas
          </span>
        }
        actions={
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Watchlist</span>
          </button>
        }
      />

      {/* Creation Modal / Form */}
      {isCreating && (
        <div className="bg-white p-5 rounded-xl border border-neutral-300 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              New Research Watchlist
            </h4>
            <button
              onClick={() => setIsCreating(false)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateWatchlist} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Watchlist Name
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  placeholder="e.g. Dallas High-Intent Solar Cohort"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Watchlist Type
                </label>
                <select
                  value={newListKind}
                  onChange={e => setNewListKind(e.target.value as WatchlistKind)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-xs bg-white"
                >
                  <option value="ENTITY">Entity Watchlist (Advertisers & Businesses)</option>
                  <option value="AD">Ad Creative Watchlist (Copy & Variations)</option>
                  <option value="QUERY_MARKET">Market Query Watchlist (Automated Re-scrape)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Description &amp; Research Intent
              </label>
              <input
                type="text"
                value={newListDesc}
                onChange={e => setNewListDesc(e.target.value)}
                placeholder="Explain the criteria and purpose for tracking this cohort..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
              >
                Save Watchlist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Layout: Left Watchlist Selector & Right Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Watchlist Selector List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-neutral-200 p-3 shadow-xs space-y-2">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            <span>Watchlists</span>
            <span>Count</span>
          </div>

          <div className="space-y-1">
            {watchlists.map(w => {
              const isSelected = w.id === activeWatchlistId;
              return (
                <div
                  key={w.id}
                  onClick={() => setActiveWatchlistId(w.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border text-xs ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-100 hover:border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="font-semibold truncate">{w.name}</div>
                    {w.unreadChanges > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        isSelected ? 'bg-emerald-400 text-neutral-900' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        +{w.unreadChanges}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] font-mono">
                    <span className={isSelected ? 'text-neutral-300' : 'text-neutral-500'}>
                      {w.kind === 'ENTITY' ? 'Entity Cohort' : w.kind === 'AD' ? 'Creative Set' : 'Market Query'}
                    </span>
                    <span className={isSelected ? 'text-neutral-300' : 'text-neutral-400'}>
                      {w.entityIds.length} items
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Watchlist Detail */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-100 text-neutral-700">
                  {activeWatchlist.kind}
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  {activeWatchlist.name}
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {activeWatchlist.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteWatchlist(activeWatchlist.id)}
                disabled={watchlists.length <= 1}
                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 disabled:opacity-30"
                title="Delete this watchlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sub-tab strip */}
          <div className="flex items-center gap-1 border-b border-neutral-100 pb-2">
            <button
              onClick={() => setActiveTab('ENTITIES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'ENTITIES'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Tracked Items ({watchlistAdvertisers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'TIMELINE'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Change Timeline</span>
              {activeWatchlist.unreadChanges > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('ALERTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'ALERTS'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Alert Thresholds</span>
            </button>
          </div>

          {/* TAB 1: TRACKED ITEMS */}
          {activeTab === 'ENTITIES' && (
            <div className="space-y-6">
              {watchlistAdvertisers.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400 font-mono bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                  No entities currently in this watchlist. Add entities below.
                </div>
              ) : (
                <div className="space-y-2">
                  {watchlistAdvertisers.map(adv => (
                    <div
                      key={adv.advertiserId}
                      className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 text-sm">{adv.canonicalName}</span>
                          <StatusBadge status={adv.qualificationState} />
                        </div>
                        <div className="text-neutral-500 font-mono text-[11px] mt-0.5 flex items-center gap-3">
                          <span>Domain: <strong className="text-neutral-800">{adv.destinationDomain}</strong></span>
                          <span>&bull;</span>
                          <span>Ads: <strong className="text-neutral-800">{adv.activeAdCount}</strong></span>
                          <span>&bull;</span>
                          <span>Score: <strong className="text-neutral-800">{adv.qualificationScore}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onSelectAdvertiser(adv)}
                          className="px-3 py-1.5 font-semibold text-neutral-700 bg-white hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
                        >
                          View Dossier
                        </button>
                        <button
                          onClick={() => handleRemoveEntity(adv.advertiserId)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove from watchlist"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Entity Section */}
              {unassignedAdvertisers.length > 0 && (
                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                    Available Entities in Workspace
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {unassignedAdvertisers.map(adv => (
                      <div
                        key={adv.advertiserId}
                        className="p-3 rounded-lg border border-neutral-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-neutral-900 truncate block">{adv.canonicalName}</span>
                          <span className="text-[10px] font-mono text-neutral-400">{adv.destinationDomain}</span>
                        </div>
                        <button
                          onClick={() => handleAddEntity(adv.advertiserId)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors shrink-0"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHANGE TIMELINE */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-3 text-xs">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                Observed Deltas for this Cohort
              </div>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                {sampleChangeEvents.map(evt => (
                  <div key={evt.id} className="p-4 bg-white hover:bg-neutral-50 flex items-start gap-3 transition-colors">
                    <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 shrink-0 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900 text-xs">{evt.entityName}</span>
                        <span className="font-mono text-[10px] text-neutral-400">{evt.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                        {evt.deltaSummary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ALERT THRESHOLDS */}
          {activeTab === 'ALERTS' && (
            <div className="space-y-4 text-xs">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                Watchlist Notification Trigger Rules
              </div>
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-neutral-900 block">Ad Creative Delta Alert</span>
                    <span className="text-[11px] text-neutral-500">Trigger notification whenever a new ad is observed or existing ad stopped.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeWatchlist.alertConfig.onAdAddedRemoved}
                    readOnly
                    className="rounded text-neutral-900"
                  />
                </label>

                <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900 block">Score Movement Threshold</span>
                    <span className="text-[11px] text-neutral-500">Only trigger alerts if qualification score changes by at least this amount.</span>
                  </div>
                  <span className="px-2.5 py-1 font-mono font-bold text-xs bg-white rounded-md border border-neutral-200">
                    &gt;= {activeWatchlist.alertConfig.onScoreDeltaThreshold} pts
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900 block">Domain Failure &amp; Quarantined Probes</span>
                    <span className="text-[11px] text-neutral-500">Immediately dispatch high-priority alert if HTTP 5xx or SSL handshake fails.</span>
                  </div>
                  <span className="px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
