import React, { useState } from 'react';
import { SAMPLE_PROVENANCE_GRAPH } from '../data/phase07FixturesAndAudit';
import { DatabaseLineageNode, DatabaseLineageEdge } from '../types';
import { 
  GitCommit, 
  ArrowDown, 
  ShieldCheck, 
  CheckCircle, 
  Hash, 
  Clock, 
  FileCode, 
  ChevronRight, 
  Layers, 
  ExternalLink,
  Lock
} from 'lucide-react';

export const ProvenanceLineageViewer: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('score-res-772');
  const graph = SAMPLE_PROVENANCE_GRAPH;

  const selectedNode = graph.nodes.find(n => n.id === selectedNodeId) || graph.nodes[0];

  const getLayerColor = (layer: string) => {
    switch (layer) {
      case 'A_OBSERVATION': return 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100';
      case 'B_CANONICAL': return 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100';
      case 'C_IDENTITY': return 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-100';
      case 'D_VERIFICATION': return 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-100';
      case 'E_QUALIFICATION': return 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100';
      default: return 'border-slate-500 bg-slate-50 text-slate-900';
    }
  };

  const getLayerBadge = (layer: string) => {
    switch (layer) {
      case 'A_OBSERVATION': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'B_CANONICAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'C_IDENTITY': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'D_VERIFICATION': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300';
      case 'E_QUALIFICATION': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AUDITABLE PROVENANCE LEDGER
              </span>
              <span className="text-xs text-slate-400">Section 11 & Section 18 Invariants</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              End-to-End Lineage & Cryptographic Proof Graph
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Trace any qualification score back through frozen JSON snapshots, multi-hop verification probes, 
              canonical identity links, and raw HTML token extractions with SHA-256 validation.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically Bound</span>
          </div>
        </div>
      </div>

      {/* Main Graph & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Step-by-Step Lineage Graph */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-emerald-500" />
                <span>Lineage Trace for Apex Legal Partners LLC</span>
              </h2>
              <span className="text-[11px] text-slate-500">
                Click any node to inspect raw relational database values and hash signatures
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              {graph.nodes.length} Verified Nodes
            </span>
          </div>

          <div className="space-y-3 relative">
            {graph.nodes.map((node, index) => {
              const isSelected = node.id === selectedNodeId;
              const isLast = index === graph.nodes.length - 1;

              return (
                <div key={node.id} className="relative">
                  {/* Vertical connector line */}
                  {!isLast && (
                    <div className="absolute left-6 top-10 bottom-[-16px] w-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
                  )}

                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`relative z-10 p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? `${getLayerColor(node.layer)} ring-2 ring-emerald-500/20 shadow-sm font-medium`
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Node Icon */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {index + 1}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {node.label}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${getLayerBadge(node.layer)}`}>
                            {node.table}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300">
                          {node.summary}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-0.5">
                          <span>ID: {node.id}</span>
                          <span>•</span>
                          <span>{node.timestamp.replace('T', ' ').replace('Z', ' UTC')}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-2 transition-transform ${isSelected ? 'text-emerald-500 translate-x-1' : 'text-slate-300 dark:text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Forensic Deep Dive Inspector */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[700px] overflow-hidden">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${getLayerBadge(selectedNode.layer)}`}>
                LAYER: {selectedNode.layer}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                TABLE: {selectedNode.table}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {selectedNode.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedNode.summary}
            </p>
          </div>

          <div className="overflow-y-auto flex-1 pr-1 space-y-4">
            {/* Timestamp & Provenance Metadata */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Node ID:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Captured At:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedNode.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Audit Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedNode.status}</span>
              </div>
            </div>

            {/* Invariant Rule Mapping */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Database Level Invariants
              </h4>
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800 dark:text-slate-200">Append-Only Invariant:</strong> Row is immutable once written. Updates raise an exception.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800 dark:text-slate-200">ON DELETE RESTRICT:</strong> Anchoring parent records cannot be dropped.
                  </span>
                </div>
              </div>
            </div>

            {/* Structured Evidence Payload */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>Relational Tuple Payload</span>
                <Hash className="w-3.5 h-3.5 text-slate-400" />
              </h4>
              <pre className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {JSON.stringify(selectedNode.details, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
