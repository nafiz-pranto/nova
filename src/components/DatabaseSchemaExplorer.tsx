import React, { useState, useMemo } from 'react';
import { ALL_TABLE_SPECIFICATIONS } from '../data/phase07SchemaAndMigrations';
import { TableSpecification, DatabaseLayer } from '../types';
import { 
  Database, 
  Search, 
  Key, 
  Link, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Code, 
  Copy, 
  Check, 
  Layers, 
  ChevronRight,
  Filter
} from 'lucide-react';

export const DatabaseSchemaExplorer: React.FC = () => {
  const [selectedTableName, setSelectedTableName] = useState<string>('advertiser');
  const [selectedLayer, setSelectedLayer] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'COLUMNS' | 'CONSTRAINTS' | 'INDEXES' | 'DDL'>('COLUMNS');
  const [copied, setCopied] = useState<boolean>(false);

  const layers: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Layers (32 Tables)' },
    { key: 'A_OBSERVATION', label: 'Layer A: Observations (4)' },
    { key: 'B_CANONICAL', label: 'Layer B: Canonical Domain (6)' },
    { key: 'C_IDENTITY', label: 'Layer C: Identity & Merge (5)' },
    { key: 'D_VERIFICATION', label: 'Layer D: Verification (4)' },
    { key: 'E_QUALIFICATION', label: 'Layer E: Scoring & Rules (7)' },
    { key: 'F_EXECUTION', label: 'Layer F: Execution & Runs (6)' },
    { key: 'G_AUDIT', label: 'Layer G: Audit Ledger (2)' },
    { key: 'H_EXPORT', label: 'Layer H: Export & Reporting (2)' },
  ];

  const filteredTables = useMemo(() => {
    return ALL_TABLE_SPECIFICATIONS.filter(t => {
      const matchesLayer = selectedLayer === 'ALL' || t.layer === selectedLayer;
      const matchesSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.columns.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesLayer && matchesSearch;
    });
  }, [selectedLayer, searchQuery]);

  const activeTable = useMemo(() => {
    return ALL_TABLE_SPECIFICATIONS.find(t => t.name === selectedTableName) || ALL_TABLE_SPECIFICATIONS[0];
  }, [selectedTableName]);

  // Generate pure SQL DDL for active table
  const generatedTableDdl = useMemo(() => {
    const colLines = activeTable.columns.map(c => {
      let line = `    ${c.name} ${c.type}`;
      if (c.isPrimaryKey) line += ' PRIMARY KEY';
      if (!c.nullable && !c.isPrimaryKey) line += ' NOT NULL';
      if (c.defaultValue) line += ` DEFAULT ${c.defaultValue}`;
      return line;
    });

    const fkLines = activeTable.foreignKeys.map(fk => {
      return `    CONSTRAINT fk_${activeTable.name}_${fk.column} FOREIGN KEY (${fk.column}) REFERENCES ${fk.referencesTable}(${fk.referencesColumn}) ON DELETE ${fk.onDelete}`;
    });

    const uqLines = activeTable.uniqueConstraints.filter(u => !u.isPartial).map(u => {
      return `    CONSTRAINT ${u.name} UNIQUE (${u.columns.join(', ')})`;
    });

    const chkLines = activeTable.checkConstraints.map(chk => {
      return `    CONSTRAINT ${chk.name} CHECK (${chk.expression})`;
    });

    const allParts = [...colLines, ...fkLines, ...uqLines, ...chkLines];

    let sql = `-- Table: ${activeTable.name} (${activeTable.layer})\n`;
    sql += `-- Mutability: ${activeTable.mutability} | Retention: ${activeTable.retention}\n`;
    sql += `-- Provenance: ${activeTable.provenanceRule}\n\n`;
    sql += `CREATE TABLE ${activeTable.name} (\n`;
    sql += allParts.join(',\n');
    sql += '\n);\n\n';

    // Partial unique indexes or indexes
    activeTable.uniqueConstraints.filter(u => u.isPartial).forEach(u => {
      sql += `-- Partial Unique Index: ${u.name}\n`;
      sql += `CREATE UNIQUE INDEX ${u.name} ON ${activeTable.name} (${u.columns.join(', ')}) ${u.whereClause || ''};\n\n`;
    });

    activeTable.indexes.forEach(idx => {
      sql += `-- Index: ${idx.name} (${idx.type})\n`;
      sql += `CREATE INDEX ${idx.name} ON ${activeTable.name} USING ${idx.type} (${idx.columns.join(', ')});\n`;
    });

    return sql;
  }, [activeTable]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMutabilityColor = (mut: string) => {
    switch (mut) {
      case 'IMMUTABLE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'VERSIONED_FACT': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'CURRENT_STATE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'REFERENCE_CONFIG': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getRetentionColor = (ret: string) => {
    switch (ret) {
      case 'PERMANENT': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'HIGH_RETENTION_7YR': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'OPERATIONAL_90D': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'TRANSIENT_30D': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                POSTGRESQL 16+ DATA MODEL
              </span>
              <span className="text-xs text-slate-400">32 Normalized Relational Tables</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Database Schema & DDL Explorer
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Inspect normalized table definitions across Layers A–H. Includes column specifications, foreign key cascade protections,
              partial unique constraints, mathematical check constraints, and production B-Tree/GIN indexes.
            </p>
          </div>
          <div className="flex items-center gap-4 self-start md:self-auto">
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400">32</div>
              <div className="text-xs text-slate-400">Total Tables</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-blue-400">8</div>
              <div className="text-xs text-slate-400">Architectural Layers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Filter and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search table or column name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {layers.map(l => (
              <option key={l.key} value={l.key}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Two-Column Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Selector Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 h-[750px] flex flex-col shadow-sm">
          <div className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wider flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
            <span>Tables ({filteredTables.length})</span>
            <span className="text-emerald-500 font-mono text-[11px]">{selectedLayer}</span>
          </div>

          <div className="overflow-y-auto flex-1 mt-2 space-y-1 pr-1">
            {filteredTables.map(t => {
              const isSelected = t.name === selectedTableName;
              return (
                <button
                  key={t.name}
                  onClick={() => setSelectedTableName(t.name)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all flex items-start justify-between group ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-xs truncate">
                        {t.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                      <span className="text-slate-400 font-mono">
                        {t.layer.replace('_', ' ')}
                      </span>
                      <span className={`px-1 py-0.2 rounded border font-mono ${getMutabilityColor(t.mutability)}`}>
                        {t.mutability}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {t.description}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 mt-2 flex-shrink-0 transition-transform ${isSelected ? 'text-emerald-600 dark:text-emerald-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Details & SQL View */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[750px] overflow-hidden">
          {/* Active Table Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100">
                    {activeTable.name}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${getMutabilityColor(activeTable.mutability)}`}>
                    {activeTable.mutability}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${getRetentionColor(activeTable.retention)}`}>
                    {activeTable.retention}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                    PK: {activeTable.primaryKey} ({activeTable.primaryKeyType})
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {activeTable.description}
                </p>
                <div className="mt-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800/40">
                  <span className="font-bold">Provenance:</span> {activeTable.provenanceRule}
                </div>
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center gap-1 self-start sm:self-auto flex-shrink-0 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('COLUMNS')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === 'COLUMNS'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Columns ({activeTable.columns.length})
                </button>
                <button
                  onClick={() => setActiveTab('CONSTRAINTS')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === 'CONSTRAINTS'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Constraints ({activeTable.foreignKeys.length + activeTable.uniqueConstraints.length + activeTable.checkConstraints.length})
                </button>
                <button
                  onClick={() => setActiveTab('INDEXES')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === 'INDEXES'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Indexes ({activeTable.indexes.length})
                </button>
                <button
                  onClick={() => setActiveTab('DDL')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === 'DDL'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  SQL DDL
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Tab Content */}
          <div className="overflow-y-auto flex-1 pr-2">
            {/* COLUMNS TAB */}
            {activeTab === 'COLUMNS' && (
              <div className="space-y-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <th className="py-2 px-2">Column Name</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2">Null</th>
                      <th className="py-2 px-2">Default</th>
                      <th className="py-2 px-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                    {activeTable.columns.map(col => (
                      <tr key={col.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-2 font-mono font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {col.isPrimaryKey && <Key className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                          <span>{col.name}</span>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-blue-600 dark:text-blue-400 text-[11px]">
                          {col.type}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[11px]">
                          {col.nullable ? (
                            <span className="text-slate-400">NULL</span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 font-bold">NOT NULL</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-slate-500 text-[11px]">
                          {col.defaultValue || '—'}
                        </td>
                        <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300 text-[11px]">
                          {col.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CONSTRAINTS TAB */}
            {activeTab === 'CONSTRAINTS' && (
              <div className="space-y-4 text-xs">
                {/* Foreign Keys */}
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <Link className="w-4 h-4 text-blue-500" />
                    <span>Foreign Key References ({activeTable.foreignKeys.length})</span>
                  </h3>
                  {activeTable.foreignKeys.length === 0 ? (
                    <div className="text-slate-400 italic text-xs">No outbound foreign key references.</div>
                  ) : (
                    <div className="space-y-2">
                      {activeTable.foreignKeys.map((fk, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {fk.column} ──► {fk.referencesTable}({fk.referencesColumn})
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 font-bold text-[10px]">
                              ON DELETE {fk.onDelete}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {fk.justification}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unique Constraints */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Unique Constraints & Partial Indexes ({activeTable.uniqueConstraints.length})</span>
                  </h3>
                  {activeTable.uniqueConstraints.length === 0 ? (
                    <div className="text-slate-400 italic text-xs">No additional unique constraints.</div>
                  ) : (
                    <div className="space-y-2">
                      {activeTable.uniqueConstraints.map((uq, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {uq.name} ({uq.columns.join(', ')})
                            </span>
                            {uq.isPartial && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 font-bold text-[10px]">
                                PARTIAL: {uq.whereClause}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {uq.justification}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Check Constraints */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>Check Constraints ({activeTable.checkConstraints.length})</span>
                  </h3>
                  {activeTable.checkConstraints.length === 0 ? (
                    <div className="text-slate-400 italic text-xs">No table-level check constraints.</div>
                  ) : (
                    <div className="space-y-2">
                      {activeTable.checkConstraints.map((chk, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                          <div className="font-mono text-[11px] font-semibold text-amber-800 dark:text-amber-300 mb-1">
                            {chk.name}: {chk.expression}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {chk.invariantDescription}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INDEXES TAB */}
            {activeTab === 'INDEXES' && (
              <div className="space-y-3 text-xs">
                {activeTable.indexes.length === 0 ? (
                  <div className="text-slate-400 italic text-xs p-4">Only default Primary Key B-Tree index exists.</div>
                ) : (
                  activeTable.indexes.map((idx, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {idx.name} ({idx.type})
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Card: {idx.cardinality}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            Write Cost: {idx.writeCost}
                          </span>
                        </div>
                      </div>
                      <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                        ON ({idx.columns.join(', ')})
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Query Supported:</span> {idx.querySupported} — {idx.justification}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* DDL TAB */}
            {activeTab === 'DDL' && (
              <div className="relative">
                <button
                  onClick={() => handleCopy(generatedTableDdl)}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-white hover:bg-slate-700 text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>
                <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  {generatedTableDdl}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
