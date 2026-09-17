import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  User, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Hash, 
  Search, 
  ExternalLink,
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_ACTIVITY_EVENTS, ActivityEventModel } from '../data/phase12FixturesAndStore';
import { PageHeader } from './common/PageHeader';
import { StatusBadge } from './common/StatusBadge';

export const GlobalActivityWorkspace: React.FC = () => {
  const [events] = useState<ActivityEventModel[]>(SAMPLE_ACTIVITY_EVENTS);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ActivityEventModel | null>(null);

  const filteredEvents = events.filter(e => {
    if (eventTypeFilter !== 'ALL' && e.eventType !== eventTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.targetName.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusIcon = (status: ActivityEventModel['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Global Audit Activity', active: true },
        ]}
        title="Global Activity &amp; Audit Stream"
        description="Immutable chronological ledger of crawler pipeline events, verification probe executions, qualification updates, and operator reviews."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            PostgreSQL Layer G Audit Ledger
          </span>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by target entity, actor, or payload..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="font-bold text-neutral-500 uppercase tracking-wider text-[11px] shrink-0">Event Type:</span>
          {['ALL', 'VERIFICATION_REFRESHED', 'NEW_AD_OBSERVED', 'QUALIFICATION_UPDATED', 'REVIEW_RESOLVED'].map(t => (
            <button
              key={t}
              onClick={() => setEventTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                eventTypeFilter === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t === 'ALL' ? 'All Events' : t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden divide-y divide-neutral-100">
        {filteredEvents.map(event => (
          <div
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className="p-4 hover:bg-neutral-50/70 transition-colors cursor-pointer flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 shrink-0">{getStatusIcon(event.status)}</div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-neutral-900">{event.targetName}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {event.eventType}
                  </span>
                </div>

                <p className="text-neutral-700 mt-1 leading-relaxed">
                  {event.description}
                </p>

                <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-neutral-400">
                  <span>Actor: <strong className="text-neutral-600 font-medium">{event.actor}</strong></span>
                  <span>&bull;</span>
                  <span>Hash: <span className="text-neutral-600">{event.provenanceHash.substring(0, 16)}</span></span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-neutral-400 shrink-0 text-right">
              {event.timestamp.substring(11, 19)} UTC
              <div className="text-[10px] text-neutral-400 mt-0.5">{event.timestamp.substring(0, 10)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Event JSON Payload Drawer */}
      {selectedEvent && (
        <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold font-mono text-neutral-700 uppercase tracking-wider text-[11px]">
              Audit Record Payload: {selectedEvent.id}
            </span>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-neutral-500 hover:text-neutral-800 font-mono text-[11px]"
            >
              Close Record
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-neutral-900 text-emerald-400 font-mono text-[11px] overflow-x-auto select-all">
            {JSON.stringify(selectedEvent, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
