import React, { useState } from 'react';
import { SELECTOR_REGISTRY } from '../data/phase02Data';
import { SelectorDefinition } from '../types';
import { Check, Copy, Code, Layers, AlertCircle, ShieldCheck, Search } from 'lucide-react';

export const SelectorRegistryViewer: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = SELECTOR_REGISTRY.filter(
    (s) =>
      s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.purpose.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const selected = filtered[selectedIndex] || SELECTOR_REGISTRY[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(selected, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Selector List */}
      <div className="w-80 border-r border-neutral-200 bg-neutral-50/60 flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-neutral-200 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter selectors..."
              value={filterQuery}
              onChange={(e) => {
                setFilterQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-neutral-500">
            <span>{filtered.length} SELECTORS REGISTERED</span>
            <span className="text-emerald-600 font-semibold">ALL VERSIONED</span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filtered.map((sel, idx) => {
            const isSelected = sel.id === selected.id;
            return (
              <button
                key={sel.id}
                onClick={() => setSelectedIndex(idx)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                  isSelected
                    ? 'bg-white border-neutral-300 shadow-xs font-medium text-neutral-900'
                    : 'border-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{sel.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                    {sel.id}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate mt-1">{sel.purpose}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {sel.strategy}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400">
                    Conf: {(sel.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Selector Details */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6">
        <div className="flex items-start justify-between border-b border-neutral-200 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm px-2 py-0.5 rounded bg-purple-600 text-white">{selected.id}</span>
              <h2 className="text-xl font-semibold text-neutral-900 font-mono tracking-tight">{selected.name}</h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selected.verificationStatus}
              </span>
            </div>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">{selected.purpose}</p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Definition'}</span>
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Strategy</span>
            <span className="text-xs font-mono font-semibold text-neutral-900">{selected.strategy}</span>
          </div>
          <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Target Page State</span>
            <span className="text-xs font-mono font-semibold text-neutral-900">{selected.expectedState}</span>
          </div>
          <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Confidence Score</span>
            <span className="text-xs font-mono font-semibold text-emerald-700">{(selected.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Introduced / Validated</span>
            <span className="text-xs font-mono font-semibold text-neutral-900">{selected.introducedIn} ({selected.lastValidated})</span>
          </div>
        </div>

        {/* Primary Locator Code */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden mb-6 shadow-2xs">
          <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200 font-mono text-xs font-semibold text-neutral-700 flex items-center justify-between">
            <span>Primary Semantic Locator (Playwright API)</span>
            <span className="text-[10px] font-mono text-neutral-500">Auto-waiting enabled</span>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-600 bg-neutral-950 overflow-x-auto leading-relaxed">
            {selected.primaryLocator}
          </pre>
        </div>

        {/* Fallbacks Tree */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200 font-mono text-xs font-semibold text-neutral-700 flex items-center justify-between">
            <span>Automated Diagnostic Fallback Cascade ({selected.fallbacks.length})</span>
            <span className="text-[10px] font-mono text-amber-700">Emits warning when used</span>
          </div>
          <div className="divide-y divide-neutral-200 bg-white">
            {selected.fallbacks.map((fb, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between hover:bg-neutral-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-neutral-400">Fallback #{idx + 1}</span>
                  <code className="text-xs font-mono text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    {fb}
                  </code>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">Tier {idx + 2} Priority</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
