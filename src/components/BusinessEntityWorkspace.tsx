import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Globe, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Database,
  ArrowRight,
  Hash,
  MapPin,
  Calendar
} from 'lucide-react';
import { SAMPLE_BUSINESS_ENTITIES, BusinessEntityModel } from '../data/phase12FixturesAndStore';
import { PageHeader } from './common/PageHeader';
import { StatusBadge } from './common/StatusBadge';

interface BusinessEntityWorkspaceProps {
  onSelectAdvertiserId?: (advertiserId: string) => void;
}

export const BusinessEntityWorkspace: React.FC<BusinessEntityWorkspaceProps> = ({
  onSelectAdvertiserId,
}) => {
  const [entities] = useState<BusinessEntityModel[]>(SAMPLE_BUSINESS_ENTITIES);
  const [selectedEntity, setSelectedEntity] = useState<BusinessEntityModel>(SAMPLE_BUSINESS_ENTITIES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntities = entities.filter(e =>
    e.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tradeNameDba.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.stateOfIncorporation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Business Entity Registry', active: true },
        ]}
        title="Registered Corporate Entities &amp; SOS Filings"
        description="Preserving strict 3-way architectural boundary: Public Meta Advertiser (Ad Account) vs. Legal Business Entity (Registered SOS Filing) vs. Destination Domain."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            {entities.length} Verified Legal Entities
          </span>
        }
      />

      {/* Strict 3-Way Architectural Disambiguation Banner (Section 32) */}
      <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-neutral-100">
          <Database className="w-4 h-4 text-neutral-800" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Core Invariant: Entity Triad Disambiguation
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 font-bold text-neutral-900 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>1. Public Meta Advertiser</span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              The public Facebook/Instagram page or ad library entity publishing creatives. May use marketing brands or DBA nicknames.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 font-bold text-neutral-900 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>2. Legal Business Entity</span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              The registered corporate entity with state Secretary of State (SOS), corporate charter, EIN tax ID, and registered agent.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2 font-bold text-neutral-900 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>3. Destination Domain</span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              The web host destination URL where traffic is sent. Probed via TCP/TLS 1.3 socket probes and verified against SSRF invariants.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Directory Table (Left 7) + Detail Inspector (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Business Entity Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter by legal name, filing number, or state..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="divide-y divide-neutral-100 overflow-y-auto max-h-[600px]">
            {filteredEntities.map(entity => {
              const isSelected = selectedEntity.businessId === entity.businessId;
              return (
                <div
                  key={entity.businessId}
                  onClick={() => setSelectedEntity(entity)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-purple-600 text-white' : 'hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{entity.legalName}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          isSelected ? 'bg-neutral-800 text-emerald-400' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {entity.stateOfIncorporation}
                        </span>
                      </div>
                      <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        Filing: {entity.registrationNumber} &bull; DBA: "{entity.tradeNameDba}"
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      entity.filingStatus === 'ACTIVE' 
                        ? (isSelected ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200')
                        : (isSelected ? 'bg-amber-950 text-amber-300' : 'bg-amber-50 text-amber-800 border border-amber-200')
                    }`}>
                      {entity.filingStatus}
                    </span>
                  </div>

                  <div className={`mt-2 flex items-center justify-between text-[11px] font-mono ${
                    isSelected ? 'text-neutral-400' : 'text-neutral-500'
                  }`}>
                    <span>Linked Page Accounts: {entity.matchedAdvertiserIds.length}</span>
                    <span>Probed Domain: {entity.primaryDomain}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Legal Entity Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-neutral-100">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                SOS State Registry Dossier
              </span>
              <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                {selectedEntity.legalName}
              </h3>
              <div className="text-xs text-neutral-500 font-mono mt-0.5">
                {selectedEntity.tradeNameDba}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-mono text-[11px]">Corporate Status:</span>
                  <span className="font-bold text-emerald-700">{selectedEntity.filingStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-mono text-[11px]">Registration No:</span>
                  <span className="font-mono font-semibold text-neutral-900">{selectedEntity.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-mono text-[11px]">State of Incorporation:</span>
                  <span className="font-semibold text-neutral-900">{selectedEntity.stateOfIncorporation}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Registered Agent
                </span>
                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 font-mono text-[11px] text-neutral-800">
                  {selectedEntity.registeredAgent}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Principal Executive Address
                </span>
                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 font-mono text-[11px] text-neutral-800">
                  {selectedEntity.principalAddress}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Linked Public Ad Accounts ({selectedEntity.matchedAdvertiserIds.length})
                </span>
                <div className="space-y-1.5">
                  {selectedEntity.matchedAdvertiserIds.map(advId => (
                    <div 
                      key={advId}
                      className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs"
                    >
                      <div className="font-mono font-medium text-neutral-800">{advId}</div>
                      {onSelectAdvertiserId && (
                        <button
                          onClick={() => onSelectAdvertiserId(advId)}
                          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <span>Open Lead Dossier</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
