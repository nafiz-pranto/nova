import React, { useState } from 'react';
import { DATABASE_MIGRATIONS } from '../data/phase07SchemaAndMigrations';
import { DatabaseMigration } from '../types';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Code, 
  Layers, 
  ChevronRight, 
  Copy, 
  Check, 
  Terminal
} from 'lucide-react';

export const MigrationPipelineRunner: React.FC = () => {
  const [appliedMigrations, setAppliedMigrations] = useState<string[]>(
    DATABASE_MIGRATIONS.map(m => m.version)
  );
  const [selectedMigrationVersion, setSelectedMigrationVersion] = useState<string>('001_foundation_and_enums');
  const [sqlMode, setSqlMode] = useState<'UP' | 'DOWN'>('UP');
  const [copied, setCopied] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const selectedMigration = DATABASE_MIGRATIONS.find(m => m.version === selectedMigrationVersion) || DATABASE_MIGRATIONS[0];

  const handleApplyAll = () => {
    setIsApplying(true);
    setTimeout(() => {
      setAppliedMigrations(DATABASE_MIGRATIONS.map(m => m.version));
      setIsApplying(false);
    }, 600);
  };

  const handleRollbackLatest = () => {
    if (appliedMigrations.length === 0) return;
    setIsApplying(true);
    setTimeout(() => {
      setAppliedMigrations(prev => prev.slice(0, prev.length - 1));
      setIsApplying(false);
    }, 400);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                TRANSACTIONAL DDL PIPELINE
              </span>
              <span className="text-xs text-slate-400">Migrations 001 through 008</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Database Migration & Rollback Pipeline
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Sequential, fully reproducible PostgreSQL schema migration chain. Tested from clean database initialization 
              through complete rollback with zero-downtime expand/contract patterns.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleApplyAll}
              disabled={isApplying || appliedMigrations.length === DATABASE_MIGRATIONS.length}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Apply All Migrations</span>
            </button>
            <button
              onClick={handleRollbackLatest}
              disabled={isApplying || appliedMigrations.length === 0}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rollback Step</span>
            </button>
          </div>
        </div>
      </div>

      {/* Migration Stages & SQL Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Migration Stepper */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col h-[650px]">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Migration Sequence ({DATABASE_MIGRATIONS.length})
            </span>
            <span className="text-xs font-mono text-emerald-500 font-semibold">
              {appliedMigrations.length} / {DATABASE_MIGRATIONS.length} Applied
            </span>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {DATABASE_MIGRATIONS.map((mig, idx) => {
              const isApplied = appliedMigrations.includes(mig.version);
              const isSelected = mig.version === selectedMigrationVersion;

              return (
                <div
                  key={mig.version}
                  onClick={() => setSelectedMigrationVersion(mig.version)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono font-bold text-xs truncate text-slate-900 dark:text-slate-100">
                        {mig.version}
                      </span>
                      {isApplied ? (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold">
                          APPLIED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px]">
                          PENDING
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-[11px] text-slate-700 dark:text-slate-300">
                      {mig.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Creates {mig.tablesCreated.length} tables: <span className="font-mono">{mig.tablesCreated.join(', ')}</span>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 mt-2 flex-shrink-0 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: SQL DDL & Safety Inspector */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[650px] overflow-hidden">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                    {selectedMigration.version}.sql
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-mono">
                    {selectedMigration.layer}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedMigration.name}
                </p>
              </div>

              {/* UP / DOWN SQL Switcher */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setSqlMode('UP')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      sqlMode === 'UP'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    UP (Migration)
                  </button>
                  <button
                    onClick={() => setSqlMode('DOWN')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      sqlMode === 'DOWN'
                        ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    DOWN (Rollback)
                  </button>
                </div>

                <button
                  onClick={() => handleCopy(sqlMode === 'UP' ? selectedMigration.upSql : selectedMigration.downSql)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Zero Downtime Safety Notice */}
            <div className="mt-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-200">Zero-Downtime Safety:</span>{' '}
              <span className="text-slate-600 dark:text-slate-400">{selectedMigration.zeroDowntimeSafety}</span>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="overflow-y-auto flex-1">
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {sqlMode === 'UP' ? selectedMigration.upSql : selectedMigration.downSql}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
