import React, { useState } from 'react';
import { DATABASE_TABLES } from '../data/specificationData';
import { Database, Key, Table as TableIcon, Hash, Lock } from 'lucide-react';

export const DatabaseSchemaViewer: React.FC = () => {
  const [selectedTableIndex, setSelectedTableIndex] = useState(0);
  const table = DATABASE_TABLES[selectedTableIndex];

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Table List */}
      <div className="w-72 border-r border-neutral-200 bg-neutral-50/60 flex flex-col h-full overflow-y-auto p-3 space-y-1.5">
        <div className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider font-mono">
          PostgreSQL Tables ({DATABASE_TABLES.length})
        </div>
        {DATABASE_TABLES.map((t, idx) => (
          <button
            key={t.name}
            onClick={() => setSelectedTableIndex(idx)}
            className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
              idx === selectedTableIndex
                ? 'bg-white border-neutral-300 shadow-xs font-medium text-neutral-900'
                : 'border-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <TableIcon className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-mono font-medium">{t.name}</span>
            </div>
            <p className="text-[11px] text-neutral-500 truncate mt-1">{t.description}</p>
          </button>
        ))}
      </div>

      {/* Table Schema Detail */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6">
        <div className="border-b border-neutral-200 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-neutral-800" />
            <h2 className="text-xl font-semibold text-neutral-900 font-mono tracking-tight">{table.name}</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
              PK: {table.primaryKey}
            </span>
          </div>
          <p className="text-sm text-neutral-600 mt-1">{table.description}</p>
        </div>

        {/* Columns Table */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden mb-6 shadow-2xs">
          <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200 font-mono text-xs font-semibold text-neutral-700">
            Columns & Data Classifications
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[11px] font-mono text-neutral-500 border-b border-neutral-200">
                <th className="p-2.5 pl-4">Column</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Constraints</th>
                <th className="p-2.5">Classification</th>
                <th className="p-2.5 pr-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-xs">
              {table.columns.map((col) => (
                <tr key={col.name} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="p-2.5 pl-4 font-mono font-medium text-neutral-900 flex items-center gap-1.5">
                    {col.constraints.includes('PRIMARY KEY') && <Key className="w-3 h-3 text-amber-500" />}
                    {col.name}
                  </td>
                  <td className="p-2.5 font-mono text-neutral-600">{col.type}</td>
                  <td className="p-2.5 font-mono text-[11px] text-neutral-500">{col.constraints}</td>
                  <td className="p-2.5">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        col.classification === 'PUBLIC_UI_OBSERVED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : col.classification === 'NORMALIZED_FROM_PUBLIC_DATA'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                      }`}
                    >
                      {col.classification}
                    </span>
                  </td>
                  <td className="p-2.5 pr-4 text-neutral-600 text-[11px]">{col.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Indices */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200 font-mono text-xs font-semibold text-neutral-700 flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-neutral-500" />
            Performance & Deduplication Indices
          </div>
          <div className="p-3 bg-neutral-50/50 space-y-1.5">
            {table.indices.map((idx, i) => (
              <div key={i} className="p-2 rounded bg-white border border-neutral-200 font-mono text-[11px] text-neutral-800">
                {idx};
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
