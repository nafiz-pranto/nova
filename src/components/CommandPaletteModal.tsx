import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Command, 
  Layers, 
  Users, 
  ShieldCheck, 
  FileCheck, 
  Bookmark, 
  Briefcase, 
  Download, 
  RefreshCw, 
  Cpu, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  Database,
  Building2,
  FileText,
  AlertTriangle,
  FolderOpen,
  GitBranch,
  Eye,
  Server
} from 'lucide-react';
import { SAMPLE_ADVERTISERS, SAMPLE_ADS, SAMPLE_RESEARCH_JOBS } from '../data/phase08FixturesAndAudit';
import { AdvertiserViewModel, AdViewModel, ResearchJobModel } from '../types';

export interface CommandItem {
  id: string;
  category: 'NAVIGATION' | 'ACTIONS' | 'ENTITIES';
  title: string;
  subtitle?: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  onSelectAdvertiser: (adv: AdvertiserViewModel) => void;
  onOpenCreateJob: () => void;
  onOpenExport: () => void;
  onTriggerReverify: () => void;
  onOpenInvestigation: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectAdvertiser,
  onOpenCreateJob,
  onOpenExport,
  onTriggerReverify,
  onOpenInvestigation,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Base System Commands
  const baseCommands: CommandItem[] = [
    {
      id: 'cmd_nav_overview',
      category: 'NAVIGATION',
      title: 'Open Research Overview Dashboard',
      subtitle: 'System KPIs, active runs, needs attention queue',
      shortcut: 'G O',
      icon: Layers,
      action: () => {
        onNavigateTab('overview');
        onClose();
      },
    },
    {
      id: 'cmd_nav_advertisers',
      category: 'NAVIGATION',
      title: 'Open Advertisers & Leads Directory',
      subtitle: 'Canonical lead index with verification states',
      shortcut: 'G A',
      icon: Building2,
      action: () => {
        onNavigateTab('advertisers');
        onClose();
      },
    },
    {
      id: 'cmd_nav_investigation',
      category: 'NAVIGATION',
      title: 'Open Investigation Mode #2048',
      subtitle: 'Focused deep-dive research workspace & checklist',
      shortcut: 'G I',
      icon: FolderOpen,
      action: () => {
        onOpenInvestigation();
        onClose();
      },
    },
    {
      id: 'cmd_nav_ads',
      category: 'NAVIGATION',
      title: 'Open Ads & Creatives Intelligence',
      subtitle: 'Filter observed ads, verbatim copy & platforms',
      shortcut: 'G C',
      icon: FileText,
      action: () => {
        onNavigateTab('ads');
        onClose();
      },
    },
    {
      id: 'cmd_nav_reviews',
      category: 'NAVIGATION',
      title: 'Open Review Center',
      subtitle: 'Identity conflicts, verification discrepancies',
      shortcut: 'G R',
      icon: Users,
      action: () => {
        onNavigateTab('reviews');
        onClose();
      },
    },
    {
      id: 'cmd_nav_verification',
      category: 'NAVIGATION',
      title: 'Open Verification Center',
      subtitle: 'Claim-by-claim network probes & SSRF defense',
      shortcut: 'G V',
      icon: ShieldCheck,
      action: () => {
        onNavigateTab('verification');
        onClose();
      },
    },
    {
      id: 'cmd_nav_qualification',
      category: 'NAVIGATION',
      title: 'Open Qualification & Scoring Workspace',
      subtitle: '"Why?" & "Why not qualified?" explainability rules',
      shortcut: 'G Q',
      icon: FileCheck,
      action: () => {
        onNavigateTab('qualification');
        onClose();
      },
    },
    {
      id: 'cmd_nav_watchlists',
      category: 'NAVIGATION',
      title: 'Open Watchlists & Cohorts',
      subtitle: 'Automated delta change alerts on monitored leads',
      shortcut: 'G W',
      icon: Bookmark,
      action: () => {
        onNavigateTab('watchlists');
        onClose();
      },
    },
    {
      id: 'cmd_nav_businesses',
      category: 'NAVIGATION',
      title: 'Open Business Entity Directory',
      subtitle: 'State SOS filings (Business vs Advertiser vs Destination)',
      shortcut: 'G B',
      icon: Database,
      action: () => {
        onNavigateTab('businesses');
        onClose();
      },
    },
    {
      id: 'cmd_nav_multi_tenant',
      category: 'NAVIGATION',
      title: 'Open Multi-Tenant & Teams Platform (Phase 18)',
      subtitle: 'Org hierarchy, server-side TenantContext, RLS, fair-share queues',
      shortcut: 'G M',
      icon: Building2,
      action: () => {
        onNavigateTab('multi-tenant');
        onClose();
      },
    },
    {
      id: 'cmd_nav_collaboration',
      category: 'NAVIGATION',
      title: 'Open Team Collaboration & Shared Research (Phase 19)',
      subtitle: 'Task assignments, 4-eyes review queues, optimistic concurrency & threaded mentions',
      shortcut: 'G T',
      icon: Users,
      action: () => {
        onNavigateTab('collaboration');
        onClose();
      },
    },
    {
      id: 'cmd_nav_discovery',
      category: 'NAVIGATION',
      title: 'Open Advanced Research Discovery & Search Engine (Phase 20)',
      subtitle: 'Typed AST queries, authorized facets, graph neighborhoods, saved snapshots & invariants',
      shortcut: 'G D',
      icon: Search,
      action: () => {
        onNavigateTab('discovery');
        onClose();
      },
    },
    {
      id: 'cmd_nav_evidence',
      category: 'NAVIGATION',
      title: 'Open Evidence, Provenance & Reproducible Research (Phase 21)',
      subtitle: 'SHA-256 CAS artifacts, lineage graph, claims, snapshots, replay diffs & verifier',
      shortcut: 'G E',
      icon: GitBranch,
      action: () => {
        onNavigateTab('evidence-provenance');
        onClose();
      },
    },
    {
      id: 'cmd_nav_monitoring',
      category: 'NAVIGATION',
      title: 'Open Continuous Monitoring & Change Intelligence (Phase 22)',
      subtitle: 'Evidence-driven watchlists, field-level diffs, anomaly detection, shadow rule simulator & 18 invariants',
      shortcut: 'G N',
      icon: Eye,
      action: () => {
        onNavigateTab('monitoring-intelligence');
        onClose();
      },
    },
    {
      id: 'cmd_nav_governance',
      category: 'NAVIGATION',
      title: 'Open Governance & Audit Platform (Phase 23)',
      subtitle: 'Immutable audit logs, control testing, findings, risk register, break-glass oversight & 17 invariants',
      shortcut: 'G A',
      icon: ShieldCheck,
      action: () => {
        onNavigateTab('governance-audit');
        onClose();
      },
    },
    {
      id: 'cmd_nav_production_operations',
      category: 'NAVIGATION',
      title: 'Open Production Operations & Recovery Control Plane (Phase 24)',
      subtitle: 'Deterministic recovery actions, circuit breakers, worker leases, fencing, runbooks & 20 invariants',
      shortcut: 'G O',
      icon: Server,
      action: () => {
        onNavigateTab('production-operations');
        onClose();
      },
    },
    {
      id: 'cmd_nav_anomalies',
      category: 'NAVIGATION',
      title: 'Open Anomaly Inbox',
      subtitle: 'Operational drift, field disappearance, outage triage',
      shortcut: 'G X',
      icon: AlertTriangle,
      action: () => {
        onNavigateTab('anomalies');
        onClose();
      },
    },
    {
      id: 'cmd_act_create_job',
      category: 'ACTIONS',
      title: 'Create Research Job',
      subtitle: 'Idempotent crawler job for Meta Ad Library targets',
      shortcut: 'N J',
      icon: Briefcase,
      action: () => {
        onOpenCreateJob();
        onClose();
      },
    },
    {
      id: 'cmd_act_reverify',
      category: 'ACTIONS',
      title: 'Re-verify Selected Entity',
      subtitle: 'Dispatch immediate TCP/TLS socket probe check',
      shortcut: 'R',
      icon: RefreshCw,
      action: () => {
        onTriggerReverify();
        onClose();
      },
    },
    {
      id: 'cmd_act_export',
      category: 'ACTIONS',
      title: 'Create Sanitized Export (CSV / JSON)',
      subtitle: 'Defense against spreadsheet formula injection',
      shortcut: 'E',
      icon: Download,
      action: () => {
        onOpenExport();
        onClose();
      },
    },
  ];

  // Entity search items
  const entityCommands: CommandItem[] = SAMPLE_ADVERTISERS.map(adv => ({
    id: `entity_${adv.advertiserId}`,
    category: 'ENTITIES',
    title: adv.canonicalName,
    subtitle: `${adv.activeAdCount} ads observed • ${adv.destinationDomain} • ${adv.qualificationState}`,
    icon: Building2,
    action: () => {
      onSelectAdvertiser(adv);
      onClose();
    },
  }));

  const allItems = [...baseCommands, ...entityCommands];
  const filteredItems = query.trim()
    ? allItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div 
        className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Input */}
        <div className="p-3 sm:p-4 border-b border-neutral-200 flex items-center gap-3 bg-neutral-50/50">
          <Command className="w-5 h-5 text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, advertiser, or page shortcut..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-200/80 text-neutral-600 border border-neutral-300">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto max-h-[60vh] divide-y divide-neutral-100">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 font-mono">
              No matching commands or entities found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs ${
                    isSelected ? 'bg-purple-600 text-white' : 'hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-neutral-800 text-emerald-400' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className={`text-[11px] truncate ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                        isSelected 
                          ? 'bg-neutral-800 text-neutral-300 border-neutral-700' 
                          : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                      }`}>
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard Helper Footer */}
        <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-3">
            <span>&uarr;&darr; or J/K to navigate</span>
            <span>&crarr; to select</span>
          </div>
          <span>Permission Level: Operator (L2)</span>
        </div>
      </div>
    </div>
  );
};
