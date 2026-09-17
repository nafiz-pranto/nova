import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  Clock,
  Layers,
  Search,
  Filter
} from 'lucide-react';
import { CandidateSLOModel, AlertRuleModel } from '../types';
import { CANDIDATE_SLOS, ALERT_RULES_CATALOG } from '../data/phase09FixturesAndAudit';

interface MetricsAndAlertsCenterProps {
  onNotify?: (msg: string) => void;
}

export const MetricsAndAlertsCenter: React.FC<MetricsAndAlertsCenterProps> = ({ onNotify }) => {
  const [slos] = useState<CandidateSLOModel[]>(CANDIDATE_SLOS);
  const [alerts] = useState<AlertRuleModel[]>(ALERT_RULES_CATALOG);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Live Structured JSON Logs sample
  const [logFilter, setLogFilter] = useState<string>('');
  const mockLogs = [
    {
      timestamp: '2026-09-16T09:42:01.120Z',
      level: 'INFO',
      service: 'meta-browser-worker',
      event: 'EXTRACTION_BATCH_PERSISTED',
      correlation: {
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        jobId: 'job-0191f6a0-5b12-7001-9911-223344556601',
        runId: 'run-01'
      },
      message: 'Persisted 25 ad observations into PostgreSQL.',
      data: { batchSequence: 4, recordsObserved: 25, durationMs: 142 }
    },
    {
      timestamp: '2026-09-16T09:42:02.340Z',
      level: 'INFO',
      service: 'verification-service',
      event: 'LEAD_WEBSITE_VERIFIED',
      correlation: {
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '11a067bb0ca902c8',
        jobId: 'job-0191f6a0-5b12-7001-9911-223344556601'
      },
      message: 'Domain apexclimatesolutions.com verified with valid TLS 1.3 certificate.',
      data: {
        domain: 'apexclimatesolutions.com',
        resolvedIp: '198.51.100.42',
        dnsLatencyMs: 44,
        redactedContactEmail: 'c***@apexclimatesolutions.com'
      }
    },
    {
      timestamp: '2026-09-16T09:42:03.010Z',
      level: 'WARN',
      service: 'extraction-adapter',
      event: 'SELECTOR_FALLBACK_INVOKED',
      correlation: {
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        jobId: 'job-0191f6a0-5b12-7001-9911-223344556602'
      },
      message: 'Primary CTA button selector missed; fallback div[data-cta] matched.',
      data: { fallbackSelector: 'div[data-cta]', confidence: 0.94 }
    },
    {
      timestamp: '2026-09-16T09:42:04.880Z',
      level: 'INFO',
      service: 'orchestrator',
      event: 'CHECKPOINT_COMMITTED',
      correlation: {
        jobId: 'job-0191f6a0-5b12-7001-9911-223344556601',
        workerId: 'worker-us-east-01'
      },
      message: 'Checkpoint sequence #13 committed with SHA-256 digest.',
      data: {
        sequenceNumber: 13,
        recordsValidated: 325,
        digest: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
      }
    }
  ];

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity === 'ALL') return true;
    return a.severity === selectedSeverity;
  });

  const filteredLogs = mockLogs.filter(l => {
    if (!logFilter) return true;
    const q = logFilter.toLowerCase();
    return (
      l.message.toLowerCase().includes(q) ||
      l.event.toLowerCase().includes(q) ||
      l.service.toLowerCase().includes(q) ||
      l.correlation.jobId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Candidate SLO Cards */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neutral-700" />
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Candidate Service Level Objectives (SLOs)</h2>
              <p className="text-xs text-neutral-500">
                Correctness, durability, and availability targets measured across 30-day rolling windows
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            SLO STATUS: 100% HEALTHY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slos.map(slo => (
            <div key={slo.sloName} className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-xs text-neutral-900">{slo.sloName}</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    PASSING
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-neutral-800 mt-1">
                  Target: <span className="text-emerald-700">{slo.target}</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{slo.measurement}</p>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-neutral-200 text-[10px] font-mono text-neutral-400">
                Alert: {slo.alertingThreshold}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Rules & Deduplication Catalog */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-neutral-700" />
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">Production Alerting & Deduplication Rules</h3>
              <p className="text-xs text-neutral-500">
                15-minute grouping windows, root-cause inhibition, and mandatory runbook links
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                  selectedSeverity === sev
                    ? 'bg-purple-600 text-white font-semibold shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-600 font-mono uppercase text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Alert Rule Name</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Trigger Condition</th>
                <th className="py-2.5 px-3">Suppression / Inhibition</th>
                <th className="py-2.5 px-3">Runbook</th>
                <th className="py-2.5 px-3">Operator Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredAlerts.map(rule => (
                <tr key={rule.alertName} className="hover:bg-neutral-50/50">
                  <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                    {rule.alertName}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      rule.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : rule.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-neutral-700">
                    {rule.condition}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-neutral-500">
                    {rule.suppressionRules}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-neutral-800">
                    {rule.runbookId}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-neutral-600 max-w-xs">
                    {rule.expectedOperatorAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Structured JSON Logs Viewer */}
      <div className="bg-neutral-900 text-neutral-200 rounded-xl p-5 font-mono text-xs shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-neutral-200 text-sm">Structured JSON Telemetry Stream</span>
            <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700">
              PII Redaction Active
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Filter logs by event, service, jobId..."
              value={logFilter}
              onChange={e => setLogFilter(e.target.value)}
              className="bg-neutral-800 text-neutral-200 placeholder-neutral-500 px-3 py-1.5 rounded-lg text-xs w-64 border border-neutral-700 focus:outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        <div className="space-y-3 font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto">
          {filteredLogs.map((log, i) => (
            <div key={i} className="p-3 bg-neutral-950/60 rounded border border-neutral-800/80 space-y-1">
              <div className="flex items-center justify-between text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    [{log.level}]
                  </span>
                  <span className="text-neutral-300 font-bold">{log.event}</span>
                  <span className="text-neutral-500">via {log.service}</span>
                </div>
                <span className="text-[10px]">{log.timestamp}</span>
              </div>

              <div className="text-neutral-200">{log.message}</div>

              <div className="text-[10px] text-neutral-400 flex flex-wrap gap-x-4 pt-1">
                {log.correlation.traceId && <span>traceId: {log.correlation.traceId}</span>}
                {log.correlation.jobId && <span>jobId: {log.correlation.jobId}</span>}
                {log.correlation.workerId && <span>workerId: {log.correlation.workerId}</span>}
              </div>

              {log.data && (
                <pre className="text-[10px] text-neutral-400 bg-neutral-900 p-2 rounded overflow-x-auto mt-1">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
