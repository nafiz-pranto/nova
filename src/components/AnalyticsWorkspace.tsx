import React, { useState } from 'react';
import { PageHeader } from './common/PageHeader';
import { 
  METRIC_CATALOG, 
  SAMPLE_SNAPSHOTS, 
  DAILY_TRENDS,
  AnalyticsMetricDefinition,
  ResearchSnapshot
} from '../data/phase14AnalyticsEngine';
import { 
  BarChart2, 
  TrendingUp, 
  History, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Download,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

export const AnalyticsWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRENDS' | 'SNAPSHOTS' | 'DICTIONARY'>('OVERVIEW');
  const [selectedSnapshot, setSelectedSnapshot] = useState<ResearchSnapshot | null>(null);

  const currentSnapshot = SAMPLE_SNAPSHOTS[SAMPLE_SNAPSHOTS.length - 1];
  const previousSnapshot = SAMPLE_SNAPSHOTS[SAMPLE_SNAPSHOTS.length - 2];

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Research OS', active: false },
          { label: 'Analytics & Trends (Phase 14)', active: true },
        ]}
        title="Production Analytics & Research Intelligence"
        description="Factual, immutable aggregations of historical research observations. Strict entity/observation distinction, time semantics, and denominator governance are enforced. No unsupported predictive claims."
        statusBadge={
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Engine v14.0 &bull; Snapshots Immutable &bull; Data Fresh
          </span>
        }
        actions={
          <button
            onClick={() => {}}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
        }
      />

      {/* Main Navigation Sub-Tab Strip */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Overview Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('TRENDS')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'TRENDS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Trend Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('SNAPSHOTS')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'SNAPSHOTS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Immutable Snapshots</span>
        </button>

        <button
          onClick={() => setActiveTab('DICTIONARY')}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'DICTIONARY'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Metric Dictionary &amp; Governance</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW ANALYTICS */}
      {/* ============================================================ */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-700" />
              <span>Descriptive Aggregations (Time Window: {currentSnapshot.scope.timeWindow.start} to {currentSnapshot.scope.timeWindow.end})</span>
            </div>
            <p className="text-blue-800 leading-relaxed">
              These metrics represent factual observations. Ad volumes and observation counts do not infer business revenue, profitability, or campaign success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {METRIC_CATALOG.map(metric => {
              const currentValue = currentSnapshot.metrics[metric.metricId];
              const prevValue = previousSnapshot?.metrics[metric.metricId];
              const diff = currentValue !== null && prevValue !== null && currentValue !== undefined && prevValue !== undefined
                ? currentValue - prevValue
                : null;
              
              const isRate = metric.aggregationMethod.includes('100');

              return (
                <div key={metric.metricId} className="p-5 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 line-clamp-2">
                      {metric.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono text-[9px] whitespace-nowrap">
                      v{metric.version}
                    </span>
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold text-neutral-900">
                      {currentValue !== null && currentValue !== undefined ? (isRate ? `${currentValue.toFixed(1)}%` : currentValue.toLocaleString()) : 'N/A'}
                    </div>
                    {diff !== null && (
                      <div className={`text-xs font-mono mb-1 ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-neutral-400'}`}>
                        {diff > 0 ? '+' : ''}{isRate ? diff.toFixed(1) : diff.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t border-neutral-100 text-[10px] text-neutral-500 leading-tight">
                    {metric.population}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: TREND EXPLORER */}
      {/* ============================================================ */}
      {activeTab === 'TRENDS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Daily Observation Trends</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Visualizing new advertisers discovered and active ads observed over the trailing 7 days.
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DAILY_TRENDS} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#171717', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="activeAds" name="Active Ads" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="newAdvertisers" name="New Advertisers" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: SNAPSHOTS */}
      {/* ============================================================ */}
      {activeTab === 'SNAPSHOTS' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Immutable Snapshot Architecture</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Snapshots capture the exact analytical state at a specific cutoff. They are never silently overwritten by backfills or late-arriving data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SAMPLE_SNAPSHOTS.map(snap => (
              <div key={snap.snapshotId} className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col">
                <div className="p-5 border-b border-neutral-100 space-y-1 bg-neutral-50/50">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-600 text-white">
                      {snap.snapshotId}
                    </span>
                    {snap.isImmutable && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <FileCheck className="w-3 h-3" /> IMMUTABLE
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-neutral-900 text-sm mt-2">{snap.name}</h3>
                  <div className="text-[10px] font-mono text-neutral-500">
                    Created By: {snap.createdBy} &bull; Analytics Engine v{snap.analyticsVersion}
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1">
                  <div className="space-y-1.5 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span className="font-semibold text-neutral-700">Data Cutoff:</span>
                      <span className="font-mono">{snap.dataCutoff}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-neutral-700">Time Window:</span>
                      <span className="font-mono">{snap.scope.timeWindow.start} to {snap.scope.timeWindow.end}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                      Snapshot Values
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(snap.metrics).map(([key, value]) => {
                        const def = METRIC_CATALOG.find(m => m.metricId === key);
                        return (
                          <div key={key} className="p-2 bg-neutral-50 rounded border border-neutral-100">
                            <span className="block text-[9px] font-mono text-neutral-500 truncate" title={def?.name || key}>{def?.name || key}</span>
                            <strong className="text-xs text-neutral-900">{value !== null ? value.toLocaleString() : 'N/A'}</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 border-t border-neutral-100">
                  <button className="w-full py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors">
                    Export Snapshot JSON
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: METRIC DICTIONARY */}
      {/* ============================================================ */}
      {activeTab === 'DICTIONARY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Governed Metric Dictionary</h3>
              <p className="text-xs text-neutral-500 mt-1">Explicit denominator rules, populations, and exclusion policies.</p>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-neutral-100 text-neutral-700">
              {METRIC_CATALOG.length} Governed Metrics
            </span>
          </div>

          <div className="space-y-4">
            {METRIC_CATALOG.map(metric => (
              <div key={metric.metricId} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                      {metric.name}
                      <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-mono text-[9px]">
                        v{metric.version}
                      </span>
                    </h4>
                    <span className="font-mono text-[10px] text-blue-600 font-semibold">{metric.metricId}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed">
                  {metric.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-0.5">Population Scope</span>
                      <div className="bg-neutral-50 p-2 rounded border border-neutral-100 text-neutral-800">{metric.population}</div>
                    </div>
                    {metric.numerator && (
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-0.5">Numerator</span>
                        <div className="bg-emerald-50/50 p-2 rounded border border-emerald-100 text-emerald-900">{metric.numerator}</div>
                      </div>
                    )}
                    {metric.denominator && (
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-0.5">Denominator</span>
                        <div className="bg-amber-50/50 p-2 rounded border border-amber-100 text-amber-900">{metric.denominator}</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-0.5">Aggregation Method</span>
                      <div className="font-mono bg-neutral-900 text-emerald-400 p-2 rounded text-[10px] whitespace-pre-wrap">
                        {metric.aggregationMethod}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-0.5">Time Field Binding</span>
                      <div className="font-mono text-neutral-600 text-[11px]">{metric.timeField}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-0.5">Exclusion Policies</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {metric.exclusions.length > 0 ? metric.exclusions.map((ex, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-100">
                            {ex}
                          </span>
                        )) : (
                          <span className="text-neutral-400 italic">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
