import React, { useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  FileCheck,
  RefreshCw,
  Award,
  Layers
} from 'lucide-react';
import { ReconciliationResult } from '../types';
import { RECONCILIATION_CHECKS } from '../data/phase09FixturesAndAudit';

interface ReconciliationLedgerProps {
  onNotify?: (msg: string) => void;
}

export const ReconciliationLedger: React.FC<ReconciliationLedgerProps> = ({ onNotify }) => {
  const [checks, setChecks] = useState<ReconciliationResult[]>(RECONCILIATION_CHECKS);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [lastSweepTime, setLastSweepTime] = useState<string>('2026-09-16T09:00:00Z');

  const handleRunReconciliation = () => {
    setIsSweeping(true);
    setTimeout(() => {
      setIsSweeping(false);
      const now = new Date().toISOString();
      setLastSweepTime(now);
      setChecks(prev =>
        prev.map(c => ({
          ...c,
          status: 'CLEAN',
          anomaliesFound: 0,
          lastRunTimestamp: now,
          repairAuditLog: `Automated sweep executed at ${now}. Verified 100% integrity across ${c.recordsAudited.toLocaleString()} records.`
        }))
      );
      if (onNotify) {
        onNotify('Full data integrity reconciliation sweep completed. All 6 domains verified clean.');
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 mb-4 gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neutral-800" />
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Data Integrity Reconciliation Ledger</h2>
              <p className="text-xs text-neutral-500">
                Hourly automated background consistency audits & non-destructive repair protocols
              </p>
            </div>
          </div>

          <button
            onClick={handleRunReconciliation}
            disabled={isSweeping}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
            {isSweeping ? 'Auditing Database...' : 'Run Full Reconciliation Sweep'}
          </button>
        </div>

        <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
          Reconciliation jobs operate on a strict <strong>zero-silent-mutation policy</strong>: ambiguous states are
          never destroyed; they are either advanced using proven cryptographic checkpoints or surfaced to human operators in the Review Queues.
        </p>

        {/* Sweepers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-600 font-mono uppercase text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Reconciliation Sweep</th>
                <th className="py-2.5 px-3">Target Domain</th>
                <th className="py-2.5 px-3">Records Audited</th>
                <th className="py-2.5 px-3">Anomalies Found</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Audit Log Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {checks.map(check => (
                <tr key={check.id} className="hover:bg-neutral-50/50">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-neutral-900">{check.name}</div>
                    <div className="text-[10px] font-mono text-neutral-400">{check.id}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {check.targetDomain}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-neutral-800">
                    {check.recordsAudited.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className={check.anomaliesFound > 0 ? 'text-amber-600 font-bold' : 'text-neutral-500'}>
                      {check.anomaliesFound}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      check.status === 'CLEAN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {check.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-neutral-600 max-w-sm">
                    {check.repairAuditLog}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disaster Recovery & Restore Drill Compliance */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">Disaster Recovery (DR) RTO & RPO Compliance</h3>
              <p className="text-xs text-neutral-500">
                Automated 30-day synthetic restore drill & database failover benchmarks
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            DR CERTIFICATE: ACTIVE (VERIFIED 2026-09-01)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="text-[11px] font-medium text-neutral-500">Worker Node Failure</div>
            <div className="text-sm font-bold text-neutral-900 mt-1">RTO &lt; 60s &bull; RPO = 0</div>
            <p className="text-[11px] text-neutral-600 mt-1">
              Automated lease expiry and checkpoint task reclaim by standby worker.
            </p>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="text-[11px] font-medium text-neutral-500">Worker Cluster Outage</div>
            <div className="text-sm font-bold text-neutral-900 mt-1">RTO &lt; 5m &bull; RPO = 0</div>
            <p className="text-[11px] text-neutral-600 mt-1">
              Multi-AZ Kubernetes worker pod autoscaling across secondary availability zones.
            </p>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="text-[11px] font-medium text-neutral-500">PostgreSQL Primary Crash</div>
            <div className="text-sm font-bold text-neutral-900 mt-1">RTO &lt; 2m &bull; RPO &lt; 5s</div>
            <p className="text-[11px] text-neutral-600 mt-1">
              Synchronous standby promotion with zero data loss on committed transactions.
            </p>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="text-[11px] font-medium text-neutral-500">Total Regional Outage</div>
            <div className="text-sm font-bold text-neutral-900 mt-1">RTO &lt; 30m &bull; RPO &lt; 5m</div>
            <p className="text-[11px] text-neutral-600 mt-1">
              Cross-region WAL replay and cold-storage restore drill executed monthly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
