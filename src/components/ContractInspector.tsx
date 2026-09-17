import React, { useState } from 'react';
import { CONTRACT_LIST } from '../data/specificationData';
import { FileJson, Check, Copy, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const ContractInspector: React.FC = () => {
  const [selectedContractIndex, setSelectedContractIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const selected = CONTRACT_LIST[selectedContractIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(selected, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Contract selector */}
      <div className="w-72 border-r border-neutral-200 bg-neutral-50/60 flex flex-col h-full overflow-y-auto p-3 space-y-1.5">
        <div className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider font-mono">
          Internal Contracts ({CONTRACT_LIST.length})
        </div>
        {CONTRACT_LIST.map((contract, idx) => (
          <button
            key={contract.name}
            onClick={() => setSelectedContractIndex(idx)}
            className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
              idx === selectedContractIndex
                ? 'bg-white border-neutral-300 shadow-xs font-medium text-neutral-900'
                : 'border-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-medium">{contract.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700">
                v{contract.version}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 truncate mt-1">{contract.purpose}</p>
          </button>
        ))}
      </div>

      {/* Contract details */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6">
        <div className="flex items-start justify-between border-b border-neutral-200 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-neutral-900 font-mono tracking-tight">{selected.name}</h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                Contract v{selected.version}
              </span>
            </div>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">{selected.purpose}</p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-1">
              Idempotency Enforcement
            </span>
            <p className="text-xs text-neutral-800 leading-relaxed font-normal">{selected.idempotency}</p>
          </div>
          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 block mb-1">
              Error / Non-Circumvention Behavior
            </span>
            <p className="text-xs text-amber-900 leading-relaxed font-normal">{selected.errorBehavior}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Request Schema */}
          <div className="flex flex-col border border-neutral-200 rounded-lg overflow-hidden">
            <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-neutral-700 flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5 text-neutral-500" />
                Request Schema (JSON Schema / Zod)
              </span>
            </div>
            <pre className="p-3 text-[11px] font-mono text-neutral-800 bg-neutral-50/70 overflow-x-auto flex-1 leading-relaxed">
              {JSON.stringify(selected.requestSchema, null, 2)}
            </pre>
          </div>

          {/* Response Schema */}
          <div className="flex flex-col border border-neutral-200 rounded-lg overflow-hidden">
            <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-neutral-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Response Schema
              </span>
            </div>
            <pre className="p-3 text-[11px] font-mono text-neutral-800 bg-neutral-50/70 overflow-x-auto flex-1 leading-relaxed">
              {JSON.stringify(selected.responseSchema, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
