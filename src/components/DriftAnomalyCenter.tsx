import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  Eye,
  CheckCircle2,
  FileCode,
  ShieldAlert,
  Activity,
  ArrowDownRight,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { FieldPresenceMetric } from '../types';
import { FIELD_PRESENCE_METRICS } from '../data/phase09FixturesAndAudit';

interface DriftAnomalyCenterProps {
  onNotify?: (msg: string) => void;
}

export const DriftAnomalyCenter: React.FC<DriftAnomalyCenterProps> = ({ onNotify }) => {
  const [metrics, setMetrics] = useState<FieldPresenceMetric[]>(FIELD_PRESENCE_METRICS);
  const [activeDriftAlert, setActiveDriftAlert] = useState<boolean>(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  // Simulated DOM snapshot
  const mockDomSnapshot = `<!-- Meta Ad Library DOM Snapshot (Preserved at 2026-09-16T09:41:00Z) -->
<div class="_7jwy _9x1a" data-testid="ad-library-feed">
  <div class="x1plvlek xryxfnj" data-card-id="meta-ad-9912048">
    <!-- Primary wrapper changed from div._7jwy to div.x1plvlek -->
    <div class="advertiser-header">
      <span class="x1lliihq">Apex Climate Solutions Dallas</span>
    </div>
    <div class="creative-body">
      <p class="x11i5rnm">Commercial Rooftop HVAC Maintenance & Emergency Service</p>
    </div>
    <!-- Destination URL button element missing target href attribute -->
    <a class="x1i10hfl" data-cta="Learn More">Call (214) 555-0199</a>
  </div>
</div>`;

  const handleSimulateDrift = () => {
    setActiveDriftAlert(true);
    setMetrics(prev =>
      prev.map(m => {
        if (m.field === 'destination_url') {
          return {
            ...m,
            currentRatePct: 28.4,
            status: 'DRIFT_DETECTED'
          };
        }
        return m;
      })
    );
    if (onNotify) {
      onNotify('Simulated DOM drift: destination_url presence collapsed to 28.4%. Alert UI_CHANGE_DETECTED triggered; active jobs PAUSED.');
    }
  };

  const handleResetMetrics = () => {
    setActiveDriftAlert(false);
    setMetrics(FIELD_PRESENCE_METRICS);
    if (onNotify) {
      onNotify('Drift metrics reset to baseline. Primary selectors confirmed healthy.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-neutral-800" />
            <div>
              <h2 className="text-base font-semibold text-neutral-900">UI & DOM Drift Anomaly Center</h2>
              <p className="text-xs text-neutral-500">
                Continuous field presence monitoring, selector fallback tracking, and zero-result anomaly guards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!activeDriftAlert ? (
              <button
                onClick={handleSimulateDrift}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Simulate DOM Drift Anomaly
              </button>
            ) : (
              <button
                onClick={handleResetMetrics}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Reset to Baseline
              </button>
            )}
          </div>
        </div>

        {/* Drift Status Banner */}
        {activeDriftAlert && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-lg text-rose-950 flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider font-mono">
                ALERT: UI_CHANGE_DETECTED &bull; Field Presence Collapse
              </h4>
              <p className="text-xs mt-1">
                Field <code>destination_url</code> observation rate collapsed from <strong>86.4%</strong> baseline to{' '}
                <strong>28.4%</strong> (Anomaly threshold: 40.0%). All active jobs scraping Meta Ad Library have been
                transitioned to <strong>PAUSED</strong>. Zero corrupted records will be written.
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] font-mono">
                <span>Runbook: <strong>RB-01</strong></span>
                <span>Incident: <strong>INC-DOM-9912</strong></span>
                <button
                  onClick={() => setSelectedSnapshot(mockDomSnapshot)}
                  className="underline font-bold hover:text-rose-700"
                >
                  Inspect Captured DOM Snapshot &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Field Presence Metrics Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-600 font-mono uppercase text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Monitored Field</th>
                <th className="py-2.5 px-3">Adapter Version</th>
                <th className="py-2.5 px-3">Baseline Rate</th>
                <th className="py-2.5 px-3">Current Rate (Rolling 100)</th>
                <th className="py-2.5 px-3">Anomaly Threshold</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {metrics.map(m => {
                const isDrift = m.status === 'DRIFT_DETECTED';
                return (
                  <tr key={m.field} className={isDrift ? 'bg-rose-50/40' : ''}>
                    <td className="py-3 px-3 font-mono font-semibold text-neutral-900">
                      {m.field}
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-500">
                      {m.adapterVersion}
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-700">
                      {m.baselineRatePct}%
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${isDrift ? 'text-rose-600' : 'text-neutral-900'}`}>
                          {m.currentRatePct}%
                        </span>
                        <div className="w-24 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isDrift ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${m.currentRatePct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-400">
                      &lt; {m.anomalyThresholdPct}%
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isDrift
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Selector Fallbacks & Zero-Result Anomaly Guard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selector Fallback Health */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-neutral-700" />
              <h3 className="font-semibold text-neutral-900 text-sm">Selector Fallback Health</h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">2-Tier Selector Architecture</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between font-mono">
                <span className="font-semibold text-neutral-900">Feed Container Selector</span>
                <span className="text-emerald-700 font-bold">HEALTHY (0% fallback)</span>
              </div>
              <p className="text-[11px] font-mono text-neutral-500 mt-1">
                Primary: <code>[role=&quot;feed&quot;]</code> &bull; Fallback: <code>div[data-testid=&quot;ad-library-feed&quot;]</code>
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between font-mono">
                <span className="font-semibold text-neutral-900">Individual Card Wrapper</span>
                <span className="text-emerald-700 font-bold">HEALTHY (1.2% fallback)</span>
              </div>
              <p className="text-[11px] font-mono text-neutral-500 mt-1">
                Primary: <code>div._7jwy</code> &bull; Fallback: <code>div[data-card-type=&quot;ad&quot;]</code>
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between font-mono">
                <span className="font-semibold text-neutral-900">Call-to-Action Link Element</span>
                <span className="text-amber-700 font-bold">DEGRADED (4.8% fallback)</span>
              </div>
              <p className="text-[11px] font-mono text-neutral-500 mt-1">
                Primary: <code>a[role=&quot;button&quot;][href]</code> &bull; Fallback: <code>div[data-cta]</code>
              </p>
            </div>
          </div>
        </div>

        {/* Zero-Result Anomaly Guard */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-neutral-700" />
              <h3 className="font-semibold text-neutral-900 text-sm">Zero-Result Anomaly Guard</h3>
            </div>
            <span className="text-xs text-neutral-500 font-mono">Empty Dossier Prevention</span>
          </div>

          <p className="text-xs text-neutral-600 mb-3">
            A sudden return of 0 ads on a high-volume keyword (e.g. &quot;Plumber Dallas&quot;) is treated as a potential
            DOM break rather than an empty market:
          </p>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-neutral-800">Page State Signature Check</span>
              <span className="text-emerald-700 font-bold">ACTIVE</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Cross-references the presence of Meta&apos;s explicit &quot;No results found for your search&quot; banner element.
              If the banner is absent and results = 0, the batch is flagged <strong>ZERO_RESULT_ANOMALY</strong> and paused.
            </p>
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>Verified Empty Returns: <strong>14</strong></span>
              <span>Anomalous Pauses: <strong>0</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Inspection Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 border border-neutral-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-neutral-700" />
                <h3 className="font-semibold text-neutral-900 text-sm">Diagnostic DOM Snapshot Viewer</h3>
              </div>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xs"
              >
                ✕
              </button>
            </div>
            <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed">
              {selectedSnapshot}
            </pre>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Preserved for Runbook RB-01 analysis. Zero PII stored.</span>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-medium"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
