import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  Clock, 
  ShieldAlert, 
  Filter, 
  Search, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  Zap
} from 'lucide-react';
import { SAMPLE_ANOMALIES, AnomalyItemModel } from '../data/phase12FixturesAndStore';
import { PageHeader } from './common/PageHeader';
import { StatusBadge } from './common/StatusBadge';

interface AnomalyInboxWorkspaceProps {
  onInspectEntity?: (entityId: string) => void;
}

export const AnomalyInboxWorkspace: React.FC<AnomalyInboxWorkspaceProps> = ({
  onInspectEntity,
}) => {
  const [anomalies, setAnomalies] = useState<AnomalyItemModel[]>(SAMPLE_ANOMALIES);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItemModel>(SAMPLE_ANOMALIES[0]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const filteredAnomalies = anomalies.filter(a => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const handleApplyAction = (anomalyId: string, actionName: string) => {
    setActionSuccessMessage(`Rule-based remediation applied: [${actionName}] executed. PostgreSQL anomaly log updated.`);
    setAnomalies(prev =>
      prev.map(a => (a.id === anomalyId ? { ...a, status: 'ACKNOWLEDGED' as const } : a))
    );
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const getSeverityBadge = (sev: AnomalyItemModel['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">LOW</span>;
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Anomaly Inbox', active: true },
        ]}
        title="Operational &amp; Research Anomaly Triage"
        description="Rule-based monitoring of field disappearances, score fluctuations, probe failures, and schema drifts across crawler pipelines."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            {anomalies.filter(a => a.status === 'UNRESOLVED').length} Unresolved Anomalies
          </span>
        }
      />

      {/* Action Success Toast */}
      {actionSuccessMessage && (
        <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-500 uppercase tracking-wider text-[11px]">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                severityFilter === sev 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-500 uppercase tracking-wider text-[11px]">Status:</span>
          {['ALL', 'UNRESOLVED', 'ACKNOWLEDGED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                statusFilter === st 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Anomaly List (7 cols) + Detail Triage Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Anomaly List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden divide-y divide-neutral-100">
          {filteredAnomalies.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 font-mono">
              No anomalies matching the selected filters.
            </div>
          ) : (
            filteredAnomalies.map(item => {
              const isSelected = selectedAnomaly.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAnomaly(item)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-purple-600 text-white' : 'hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(item.severity)}
                        <span className="font-bold text-xs">{item.title}</span>
                      </div>
                      <div className={`text-[11px] font-mono mt-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        Target: <strong className={isSelected ? 'text-white' : 'text-neutral-900'}>{item.entityName}</strong>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      item.status === 'UNRESOLVED'
                        ? (isSelected ? 'bg-rose-950 text-rose-300' : 'bg-rose-50 text-rose-800 border border-rose-200')
                        : (isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600')
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className={`text-[11px] mt-2 line-clamp-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    {item.evidenceSummary}
                  </p>

                  <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                    isSelected ? 'border-neutral-800 text-neutral-400' : 'border-neutral-100 text-neutral-400'
                  }`}>
                    <span>Source: {item.source}</span>
                    <span>Detected: {item.detectedAt.substring(11, 19)} UTC</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Anomaly Remediation Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 mb-1">
                {getSeverityBadge(selectedAnomaly.severity)}
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  {selectedAnomaly.anomalyType}
                </span>
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                {selectedAnomaly.title}
              </h3>
              <div className="text-xs text-neutral-600 font-medium mt-1">
                Target Entity: <span className="font-semibold text-neutral-900">{selectedAnomaly.entityName}</span>
              </div>
            </div>

            {/* Evidence Summary */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Factual Evidence &amp; Anomaly Signal
              </span>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 leading-relaxed">
                {selectedAnomaly.evidenceSummary}
              </div>
            </div>

            {/* Rule-Based Recommended Action (Strict Non-AI Invariant, Section 37) */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-blue-700" />
                <span>Rule-Based Recommended Action</span>
              </div>
              <p className="text-xs text-blue-950 font-medium leading-relaxed">
                {selectedAnomaly.recommendedAction}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleApplyAction(selectedAnomaly.id, 'Execute Operational Quarantine')}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Execute Operational Remediation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {onInspectEntity && (
                <button
                  onClick={() => onInspectEntity(selectedAnomaly.entityId)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Target Entity Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
