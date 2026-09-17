import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  FileText, 
  Bookmark, 
  Download, 
  Settings, 
  Check, 
  Sliders,
  Trash2,
  ExternalLink
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  category: 'REVIEW_REQUIRED' | 'VERIFICATION_STALE' | 'WATCHLIST_CHANGED' | 'EXPORT_COMPLETED' | 'JOB_BLOCKED';
  timestamp: string;
  targetEntity?: string;
  description: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'Review Required: Identity Ambiguity',
    category: 'REVIEW_REQUIRED',
    timestamp: '10m ago',
    targetEntity: 'SolarFlow Energy Solutions LLC',
    description: 'Ambiguity detected between solarflow.io and solarflow-texas.com. Operator resolution needed.',
    isRead: false,
  },
  {
    id: 'notif_02',
    title: 'Watchlist Alert: New Ad Observed',
    category: 'WATCHLIST_CHANGED',
    timestamp: '45m ago',
    targetEntity: 'SolarFlow Energy Solutions LLC',
    description: '+1 new ad observed in Meta Ad Library targeting Texas solar rebate incentives.',
    isRead: false,
  },
  {
    id: 'notif_03',
    title: 'Compliance Blocker Triggered',
    category: 'JOB_BLOCKED',
    timestamp: '2h ago',
    targetEntity: 'Quantum Crypto Yields Bot',
    description: 'Probe failure: HTTP 502 Bad Gateway. Destination quarantined under BLOCKER-RULE-001.',
    isRead: true,
  },
  {
    id: 'notif_04',
    title: 'Export Generated Successfully',
    category: 'EXPORT_COMPLETED',
    timestamp: '5h ago',
    description: 'Sanitized CSV export [Texas Solar Research Cohort] is ready for download.',
    isRead: true,
  },
];

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToEntity?: (entityName: string) => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToEntity,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [showPreferences, setShowPreferences] = useState(false);

  // Notification Preferences State (Section 44)
  const [prefs, setPrefs] = useState({
    reviewRequired: true,
    verificationStale: true,
    watchlistChanged: true,
    exportCompleted: true,
    jobBlocked: true,
  });

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'REVIEW_REQUIRED':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'JOB_BLOCKED':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'WATCHLIST_CHANGED':
        return <Bookmark className="w-4 h-4 text-blue-600" />;
      case 'EXPORT_COMPLETED':
        return <Download className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-600" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-neutral-950/40 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Notification Center"
    >
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-neutral-200 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-neutral-700" />
            <h3 className="font-bold text-sm text-neutral-900">Operator Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.2 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className={`p-1.5 rounded-lg transition-colors ${
                showPreferences ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Notification Preferences"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preferences Tray (Collapsible) */}
        {showPreferences && (
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 space-y-2.5 text-xs">
            <span className="font-bold text-neutral-700 uppercase tracking-wider text-[10px] block">
              Notification Routing Preferences
            </span>
            <div className="space-y-1.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-700">Review Required alerts</span>
                <input
                  type="checkbox"
                  checked={prefs.reviewRequired}
                  onChange={e => setPrefs({ ...prefs, reviewRequired: e.target.checked })}
                  className="rounded text-neutral-900"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-700">Watchlist delta updates</span>
                <input
                  type="checkbox"
                  checked={prefs.watchlistChanged}
                  onChange={e => setPrefs({ ...prefs, watchlistChanged: e.target.checked })}
                  className="rounded text-neutral-900"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-700">Compliance &amp; job blockers</span>
                <input
                  type="checkbox"
                  checked={prefs.jobBlocked}
                  onChange={e => setPrefs({ ...prefs, jobBlocked: e.target.checked })}
                  className="rounded text-neutral-900"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-700">Export generation completed</span>
                <input
                  type="checkbox"
                  checked={prefs.exportCompleted}
                  onChange={e => setPrefs({ ...prefs, exportCompleted: e.target.checked })}
                  className="rounded text-neutral-900"
                />
              </label>
            </div>
          </div>
        )}

        {/* Action Strip */}
        <div className="px-4 py-2 border-b border-neutral-100 bg-white flex items-center justify-between text-xs font-medium text-neutral-500">
          <span>Recent Activity Stream</span>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-neutral-700 hover:text-neutral-900 font-semibold"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="text-neutral-400 hover:text-rose-600"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 font-mono">
              No active notifications.
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl transition-colors text-xs ${
                  item.isRead ? 'bg-white hover:bg-neutral-50 text-neutral-700' : 'bg-neutral-50/80 hover:bg-neutral-100/70 text-neutral-900 font-medium'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getCategoryIcon(item.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs truncate">{item.title}</span>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">{item.timestamp}</span>
                    </div>

                    <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {item.targetEntity && (
                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                        <span>Target: <strong className="text-neutral-800">{item.targetEntity}</strong></span>
                        {onNavigateToEntity && (
                          <button
                            onClick={() => {
                              onNavigateToEntity(item.targetEntity!);
                              onClose();
                            }}
                            className="text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
