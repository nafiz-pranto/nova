import React, { useState } from 'react';
import {
  ShieldCheck,
  GitCommit,
  Layers,
  ShieldAlert,
  Zap,
  Activity,
  BookOpen,
  FileCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ProductionAcceptanceGate } from './ProductionAcceptanceGate';
import { GoldenTraceLineageViewer } from './GoldenTraceLineageViewer';
import { ConsistencyAuditMatrix } from './ConsistencyAuditMatrix';
import { SecurityAssuranceSuite } from './SecurityAssuranceSuite';
import { FailureMatrixSimulator } from './FailureMatrixSimulator';
import { PerformanceAndRecoveryLab } from './PerformanceAndRecoveryLab';
import { Phase10Reader } from './Phase10Reader';
import { Phase10HandoffViewer } from './Phase10HandoffViewer';

interface Phase10DashboardProps {
  onNotify?: (msg: string) => void;
}

export const Phase10Dashboard: React.FC<Phase10DashboardProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<
    'gate' | 'lineage' | 'consistency' | 'security' | 'chaos' | 'performance' | 'spec' | 'contract'
  >('gate');

  const navTabs = [
    { id: 'gate', label: 'Release Gate & Checklist', icon: ShieldCheck },
    { id: 'lineage', label: 'Golden Trace Lineage', icon: GitCommit },
    { id: 'consistency', label: 'Consistency & SoR Matrix', icon: Layers },
    { id: 'security', label: 'SSRF & AppSec Suite', icon: ShieldAlert },
    { id: 'chaos', label: 'Failure & Zero-Result Lab', icon: Zap },
    { id: 'performance', label: 'Performance, Load & DR', icon: Activity },
    { id: 'spec', label: '37-Section Master Report', icon: BookOpen },
    { id: 'contract', label: 'Machine Handoff Contract', icon: FileCode }
  ];

  return (
    <div className="space-y-6">
      {/* Top Phase 10 Navigation Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 min-w-max">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 text-xs font-mono text-neutral-500 whitespace-nowrap">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PHASE 10 VERIFIED</span>
        </div>
      </div>

      {/* Render Selected View */}
      {activeTab === 'gate' && <ProductionAcceptanceGate />}
      {activeTab === 'lineage' && <GoldenTraceLineageViewer onNotify={onNotify} />}
      {activeTab === 'consistency' && <ConsistencyAuditMatrix />}
      {activeTab === 'security' && <SecurityAssuranceSuite onNotify={onNotify} />}
      {activeTab === 'chaos' && <FailureMatrixSimulator onNotify={onNotify} />}
      {activeTab === 'performance' && <PerformanceAndRecoveryLab />}
      {activeTab === 'spec' && <Phase10Reader />}
      {activeTab === 'contract' && <Phase10HandoffViewer onNotify={onNotify} />}
    </div>
  );
};
