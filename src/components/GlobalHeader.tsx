import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Hexagon, 
  Download, 
  Cpu, 
  Bell, 
  Settings,
  Command,
  Briefcase,
  Users,
  LogOut,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { SAMPLE_RESEARCH_JOBS, SAMPLE_REVIEW_ITEMS } from '../data/phase08FixturesAndAudit';

export type WorkspaceArea = 'RESEARCH' | 'ENGINEERING';

export type ResearchTab = 
  | 'overview' 
  | 'wizard'
  | 'advertisers' 
  | 'reviews' 
  | 'exports'
  | 'analytics'
  | 'workflows'
  | 'rules-studio'
  | 'policy-safety'
  | 'multi-tenant'
  | 'collaboration'
  | 'discovery'
  | 'evidence-provenance'
  | 'monitoring-intelligence'
  | 'governance-audit'
  | 'production-operations'
  | 'product-telemetry'
  | 'investigations'
  | 'ads' 
  | 'businesses'
  | 'search'
  | 'watchlists' 
  | 'verification' 
  | 'qualification' 
  | 'compare' 
  | 'anomalies'
  | 'activity'
  | 'data-quality';

interface GlobalHeaderProps {
  activeArea: WorkspaceArea;
  setActiveArea: (area: WorkspaceArea) => void;
  researchTab: ResearchTab;
  setResearchTab: (tab: ResearchTab) => void;
  onOpenSearch: () => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  onExportJson: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  activeArea,
  setActiveArea,
  researchTab,
  setResearchTab,
  onOpenSearch,
  onOpenCommandPalette,
  onOpenNotifications,
  onExportJson,
}) => {
  const [activeJobsCount] = useState(
    SAMPLE_RESEARCH_JOBS.filter(j => ['COLLECTING', 'STARTING', 'NAVIGATING'].includes(j.state)).length
  );
  const [pendingReviewsCount] = useState(
    SAMPLE_REVIEW_ITEMS.filter(r => r.status === 'PENDING').length
  );

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette, onOpenSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const coreNavItems = [
    { id: 'wizard', label: 'New Research' },
    { id: 'advertisers', label: 'Leads' },
    { id: 'overview', label: 'History' },
    { id: 'exports', label: 'Exports' },
  ] as const;

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-30 shadow-xs w-full box-border">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 box-border h-14 flex items-center justify-between gap-4">
        
        {/* MOBILE: Menu Button */}
        <div className="md:hidden flex items-center shrink-0">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="p-2 -ml-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* LEFT: Brand */}
        <div className="flex items-center gap-3 shrink-0 flex-1 md:flex-none">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-xs shrink-0">
            <Hexagon className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-bold text-neutral-900 tracking-tight text-sm sm:text-base truncate">
            {BRAND_CONFIG.productName}
          </span>
        </div>

        {/* CENTER: Core Navigation (Desktop Only) */}
        <nav className="hidden md:flex flex-1 items-center justify-center min-w-0">
          <div className="flex items-center gap-2">
            {coreNavItems.map(tab => {
              const isActive = activeArea === 'RESEARCH' && researchTab === tab.id;
              
              if (tab.id === 'wizard') {
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveArea('RESEARCH');
                      setResearchTab(tab.id);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <Plus className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveArea('RESEARCH');
                    setResearchTab(tab.id);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* RIGHT: Secondary / Profile */}
        <div className="flex items-center gap-2 shrink-0 justify-end flex-1 md:flex-none">
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors border border-transparent"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full" />
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 border-l border-neutral-200 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 ring-offset-1 ring-neutral-900 transition-all">
                DR
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50 text-xs font-medium origin-top-right animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-neutral-100 mb-1">
                  <div className="font-bold text-neutral-900 text-sm">Daniel Researcher</div>
                  <div className="text-neutral-500">daniel@example.com</div>
                </div>

                <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
                  Workspace
                </div>
                
                <button
                  onClick={() => {
                    setActiveArea('RESEARCH');
                    setResearchTab('rules-studio');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-neutral-50 text-neutral-700"
                >
                  <Settings className="w-4 h-4 text-neutral-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setActiveArea('ENGINEERING');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-neutral-50 text-neutral-700"
                >
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span>Engineering &amp; Admin</span>
                </button>

                <div className="my-1 border-t border-neutral-100" />
                <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Tools &amp; Commands
                </div>

                <button
                  onClick={() => {
                    onOpenCommandPalette();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-neutral-50 text-neutral-700"
                >
                  <div className="flex items-center gap-2">
                    <Command className="w-4 h-4 text-purple-500" />
                    <span>Commands</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-500 border border-neutral-200">
                    ⌘K
                  </kbd>
                </button>

                <button
                  onClick={() => {
                    onOpenSearch();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-neutral-50 text-neutral-700"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-neutral-400" />
                    <span>Quick Search</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-500 border border-neutral-200">
                    /
                  </kbd>
                </button>

                <button
                  onClick={() => {
                    onExportJson();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-neutral-50 text-neutral-700"
                >
                  <Download className="w-4 h-4 text-neutral-400" />
                  <span>System Handoff</span>
                </button>

                {(activeJobsCount > 0 || pendingReviewsCount > 0) && (
                  <>
                    <div className="my-1 border-t border-neutral-100" />
                    <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Collaboration
                    </div>
                  </>
                )}

                {activeJobsCount > 0 && (
                  <button
                    onClick={() => {
                      setActiveArea('RESEARCH');
                      setResearchTab('advertisers');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-neutral-50 text-neutral-700"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      <span>Active Jobs</span>
                    </div>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">{activeJobsCount}</span>
                  </button>
                )}

                {pendingReviewsCount > 0 && (
                  <button
                    onClick={() => {
                      setActiveArea('RESEARCH');
                      setResearchTab('reviews');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-neutral-50 text-neutral-700"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-500" />
                      <span>Pending Reviews</span>
                    </div>
                    <span className="font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">{pendingReviewsCount}</span>
                  </button>
                )}
                
                <div className="my-1 border-t border-neutral-100" />
                
                <button
                  className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-rose-50 text-rose-600"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />
          {/* Drawer */}
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 flex items-center justify-between border-b border-neutral-100">
              <span className="font-bold text-neutral-900">Menu</span>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 pb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Research Workspace
              </div>
              <div className="px-2 space-y-1">
                {coreNavItems.map(tab => {
                  const isActive = activeArea === 'RESEARCH' && researchTab === tab.id;
                  
                  if (tab.id === 'wizard') {
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveArea('RESEARCH');
                          setResearchTab(tab.id);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        <Plus className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                        {tab.label}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveArea('RESEARCH');
                        setResearchTab(tab.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
