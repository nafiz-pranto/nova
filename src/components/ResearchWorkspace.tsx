import React, { useState } from 'react';
import { 
  SAMPLE_RESEARCH_JOBS, 
  SAMPLE_ADVERTISERS 
} from '../data/phase08FixturesAndAudit';
import { 
  ResearchJobModel, 
  JobCreationFormModel, 
  JobState, 
  AdvertiserViewModel 
} from '../types';
import { StatusBadge } from './common/StatusBadge';
import { PageHeader } from './common/PageHeader';
import { 
  Play, 
  Pause, 
  XCircle, 
  RefreshCw, 
  Plus, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Key, 
  Clock, 
  Cpu, 
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  RotateCw,
  Database,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ResearchWorkspaceProps {
  onSelectAdvertiser?: (advertiser: AdvertiserViewModel) => void;
  onCreateJobRequest?: () => void;
  onOpenWizard?: () => void;
  advertisers?: AdvertiserViewModel[];
  jobs?: ResearchJobModel[];
  onAddJob?: (job: ResearchJobModel) => void;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({ 
  onSelectAdvertiser,
  onCreateJobRequest,
  onOpenWizard,
  advertisers: propAdvertisers,
  jobs: propJobs,
  onAddJob,
}) => {
  const [localJobs, setLocalJobs] = useState<ResearchJobModel[]>(SAMPLE_RESEARCH_JOBS);
  const jobs = propJobs || localJobs;
  const [selectedJob, setSelectedJob] = useState<ResearchJobModel>(jobs[0] || SAMPLE_RESEARCH_JOBS[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'QUALIFIED' | 'REVIEW_REQUIRED' | 'DISQUALIFIED'>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [websiteOnlyFilter, setWebsiteOnlyFilter] = useState<boolean>(true);
  const [localAdvertisers, setLocalAdvertisers] = useState<AdvertiserViewModel[]>(SAMPLE_ADVERTISERS);
  const advertisers = propAdvertisers || localAdvertisers;

  // Form State with UUIDv7 Idempotency
  const generateIdempotencyKey = () => `idemp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  const [formData, setFormData] = useState<JobCreationFormModel>({
    idempotencyKey: generateIdempotencyKey(),
    query: '',
    countryCode: 'US',
    adActiveStatus: 'ACTIVE',
    mediaType: 'ALL',
    maxResults: 100,
    executionTimeoutSeconds: 600,
    tenantId: 'tenant_enterprise_apac_01'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.query.trim()) {
      errors.query = 'Search query is required. Specify target niche or commercial terms.';
    } else if (formData.query.length < 3) {
      errors.query = 'Query must be at least 3 characters long.';
    }

    if (formData.maxResults < 10 || formData.maxResults > 500) {
      errors.maxResults = 'Max results must be between 10 and 500.';
    }

    if (formData.executionTimeoutSeconds < 60 || formData.executionTimeoutSeconds > 1800) {
      errors.executionTimeoutSeconds = 'Execution timeout must be between 60 and 1800 seconds.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    // Simulate backend submission with idempotency protection
    setTimeout(() => {
      const newJob: ResearchJobModel = {
        jobId: `job_${Date.now().toString(36)}_new`,
        idempotencyKey: formData.idempotencyKey,
        query: formData.query,
        countryCode: formData.countryCode,
        state: 'STARTING',
        progressPercent: 5,
        processedCount: 0,
        totalExpectedLimit: formData.maxResults,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPartial: false,
        workerId: 'worker_playwright_pool_us_east_1',
        batchId: `batch_${Date.now().toString(36)}`,
        tenantId: formData.tenantId
      };

      if (onAddJob) {
        onAddJob(newJob);
      } else {
        setLocalJobs([newJob, ...jobs]);
      }
      setSelectedJob(newJob);
      setIsSubmitting(false);
      setShowCreateModal(false);
      setFormData({
        idempotencyKey: generateIdempotencyKey(),
        query: '',
        countryCode: 'US',
        adActiveStatus: 'ACTIVE',
        mediaType: 'ALL',
        maxResults: 100,
        executionTimeoutSeconds: 600,
        tenantId: 'tenant_enterprise_apac_01'
      });
    }, 600);
  };

  // Job Control simulation
  const handleJobAction = (action: 'START' | 'PAUSE' | 'RESUME' | 'CANCEL') => {
    setLocalJobs(prevJobs =>
      prevJobs.map(job => {
        if (job.jobId !== selectedJob.jobId) return job;
        let nextState: JobState = job.state;
        let progress = job.progressPercent;
        if (action === 'PAUSE') nextState = 'PAUSED';
        if (action === 'RESUME') nextState = 'COLLECTING';
        if (action === 'CANCEL') nextState = 'CANCELLED';
        if (action === 'START') {
          nextState = 'COLLECTING';
          progress = 25;
        }
        const updated = { ...job, state: nextState, progressPercent: progress, updatedAt: new Date().toISOString() };
        setSelectedJob(updated);
        return updated;
      })
    );
  };

  const filteredAdvertisers = advertisers.filter(adv => {
    if (websiteOnlyFilter && (!adv.destinationDomain || adv.destinationDomain === 'None' || !adv.destinationUrl || adv.destinationUrl.length < 5)) {
      return false;
    }
    if (activeTabFilter !== 'ALL' && adv.qualificationState !== activeTabFilter) return false;
    if (searchFilter && !adv.canonicalName.toLowerCase().includes(searchFilter.toLowerCase()) && !adv.destinationDomain.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', active: false },
          { label: 'Lead Research', active: false },
          { label: 'Leads Directory', active: true },
        ]}
        title="Discovered Leads Directory"
        description="Explore verified business leads extracted from active public Meta Ad Library campaigns with automatic destination website verification."
        primaryAction={{
          label: '+ New Research',
          icon: Plus,
          onClick: onOpenWizard || (() => setShowCreateModal(true)),
        }}
        secondaryActions={[
          {
            label: 'Advanced Custom Job',
            icon: Play,
            onClick: () => setShowCreateModal(true),
          }
        ]}
      />

      {/* Grid: Job List & Active Job Workspace Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Job Selector List (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Research Jobs Queue ({jobs.length})
              </h3>
              <span className="text-[11px] font-mono text-neutral-500">Tenant: APAC-01</span>
            </div>

            <div className="mt-3 space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {jobs.map(job => (
                <div
                  key={job.jobId}
                  onClick={() => setSelectedJob(job)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedJob.jobId === job.jobId
                      ? 'border-neutral-900 bg-neutral-50/80 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-neutral-900 truncate max-w-[200px]" title={job.query}>
                      {job.query}
                    </span>
                    <StatusBadge status={job.state} size="sm" showPrefix={false} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                    <span>Ads: {job.processedCount}/{job.totalExpectedLimit}</span>
                    <span>{job.progressPercent}%</span>
                  </div>

                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full transition-all ${
                        job.state === 'COMPLETED'
                          ? 'bg-emerald-600'
                          : job.state === 'PARTIAL'
                          ? 'bg-amber-500'
                          : job.state === 'CHALLENGED'
                          ? 'bg-red-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${job.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2 font-mono">
                    <span>ID: {job.jobId.slice(0, 18)}...</span>
                    <span>{new Date(job.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-mono">Playwright v1.42.1 engine</span>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Job
            </button>
          </div>
        </div>

        {/* Right Col: Active Job Telemetry & Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            {/* Header with Title, State, Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-neutral-100">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900 truncate max-w-md">{selectedJob.query}</h3>
                  <StatusBadge status={selectedJob.state} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 font-mono mt-1">
                  <span>Job ID: {selectedJob.jobId}</span>
                  <span>&bull;</span>
                  <span>Market: {selectedJob.countryCode}</span>
                  <span>&bull;</span>
                  <span>Tenant: {selectedJob.tenantId}</span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                {selectedJob.state === 'PAUSED' && (
                  <button
                    onClick={() => handleJobAction('RESUME')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shadow-2xs"
                    title="Resume Run"
                  >
                    <Play className="w-3.5 h-3.5 text-purple-600" />
                    <span>Resume</span>
                  </button>
                )}
                {selectedJob.state === 'COLLECTING' && (
                  <button
                    onClick={() => handleJobAction('PAUSE')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shadow-2xs"
                    title="Pause Run"
                  >
                    <Pause className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pause</span>
                  </button>
                )}
                {['COLLECTING', 'PAUSED', 'STARTING'].includes(selectedJob.state) && (
                  <button
                    onClick={() => handleJobAction('CANCEL')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-red-50 text-red-600 border border-red-200 shadow-2xs"
                    title="Cancel Run"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* If Challenge or Blocked */}
            {selectedJob.state === 'CHALLENGED' && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                      Anti-Bot Security Checkpoint Detected
                    </h4>
                    <p className="text-xs text-red-800 mt-1">
                      {selectedJob.challengeReason || 'Meta Ad Library prompted an anti-bot challenge. Automated collection suspended immediately per anti-bypass doctrine.'}
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-red-700 bg-white/70 p-2 rounded border border-red-200">
                      Checkpoint Token: {selectedJob.lastCheckpointToken || 'chk_offset_12_saved'} &bull; Records Preserved: {selectedJob.processedCount}
                    </div>
                    <p className="text-[11px] text-red-700 mt-2 italic">
                      Non-evasion rule enforced: No browser fingerprints are spoofed. All collected records are safely preserved in PostgreSQL Layer A.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* If Partial */}
            {selectedJob.state === 'PARTIAL' && (
              <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Partial Result Semantics Active
                    </h4>
                    <p className="text-xs text-amber-800 mt-1">
                      This search reached the end of available active ads ({selectedJob.processedCount} ads found) before reaching the requested limit of {selectedJob.totalExpectedLimit}.
                    </p>
                    <p className="text-[11px] font-mono text-amber-700 mt-1">
                      Stop Reason: {selectedJob.stopReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Processed Ads</div>
                <div className="text-base font-semibold text-neutral-900 font-mono mt-0.5">
                  {selectedJob.processedCount} <span className="text-xs text-neutral-400 font-normal">/ {selectedJob.totalExpectedLimit}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Worker Node</div>
                <div className="text-xs font-semibold text-neutral-900 font-mono mt-0.5 truncate" title={selectedJob.workerId}>
                  {selectedJob.workerId.replace('worker_playwright_', '')}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Execution Batch</div>
                <div className="text-xs font-semibold text-neutral-900 font-mono mt-0.5 truncate" title={selectedJob.batchId}>
                  {selectedJob.batchId}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="text-[10px] uppercase font-bold text-neutral-500">Idempotency Key</div>
                <div className="text-xs font-semibold text-neutral-900 font-mono mt-0.5 truncate" title={selectedJob.idempotencyKey}>
                  {selectedJob.idempotencyKey.slice(0, 14)}...
                </div>
              </div>
            </div>

            {/* Checkpoint & Trace Info */}
            <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700 uppercase tracking-wider text-[11px]">
                  State Checkpoint &amp; Resumption Token
                </span>
                <span className="font-mono text-[11px] text-neutral-500">
                  {selectedJob.lastCheckpointToken || 'chk_active_head'}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-neutral-600 bg-neutral-50 px-2 py-1 rounded">
                  <span>[08:15:00Z] job_created: enqueued with worker dispatch</span>
                  <span className="text-emerald-700 font-semibold">OK</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 bg-neutral-50 px-2 py-1 rounded">
                  <span>[08:15:12Z] browser_worker_launched: playwright chromium headless</span>
                  <span className="text-emerald-700 font-semibold">OK</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 bg-neutral-50 px-2 py-1 rounded">
                  <span>[08:18:22Z] checkpoint_saved: {selectedJob.processedCount} tokens committed to Layer A</span>
                  <span className="text-emerald-700 font-semibold">COMMITTED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Started: {new Date(selectedJob.startedAt).toLocaleString()}</span>
            <span>Last Sync: {new Date(selectedJob.updatedAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Canonical Advertiser Directory */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Canonical Advertisers Directory</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Authoritative entities from PostgreSQL read model <code className="font-mono text-[11px]">v_lead_research_current</code>.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setWebsiteOnlyFilter(!websiteOnlyFilter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                websiteOnlyFilter
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${websiteOnlyFilter ? 'bg-emerald-600' : 'bg-neutral-400'}`} />
              <span>Website Required: {websiteOnlyFilter ? 'ON' : 'OFF'}</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search business or domain..."
                className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-medium border border-neutral-200">
              {(['ALL', 'QUALIFIED', 'REVIEW_REQUIRED', 'DISQUALIFIED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTabFilter(tab)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeTabFilter === tab
                      ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advertisers Table (Controlled Horizontal Overflow) */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                <th scope="col" className="py-2.5 px-3">Advertiser</th>
                <th scope="col" className="py-2.5 px-3">Facebook Page & Location</th>
                <th scope="col" className="py-2.5 px-3">Matched Keywords</th>
                <th scope="col" className="py-2.5 px-3">Active Ads</th>
                <th scope="col" className="py-2.5 px-3">Website</th>
                <th scope="col" className="py-2.5 px-3">Score & Status</th>
                <th scope="col" className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {filteredAdvertisers.map(adv => (
                <tr 
                  key={adv.advertiserId} 
                  className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                  onClick={() => onSelectAdvertiser?.(adv)}
                >
                  <td className="py-3 px-3 font-semibold text-neutral-900">
                    <div className="flex items-center gap-1.5">
                      <span>{adv.canonicalName}</span>
                      {adv.hasActiveManualOverride && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                          OVERRIDE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-neutral-500">
                    <div className="flex flex-col gap-1">
                      <span className="text-neutral-900 font-medium">{adv.facebookPageName || adv.canonicalName}</span>
                      <span>{adv.locationCode || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-600">
                    {adv.matchedKeywords && adv.matchedKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {adv.matchedKeywords.map((k, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded-sm bg-neutral-100 text-neutral-600 text-[10px] font-mono">{k}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-700">{adv.activeAdCount}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-neutral-900 font-mono text-[11px] truncate max-w-[150px]">
                        {adv.destinationDomain || adv.destinationUrl || 'No Website'}
                      </span>
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                        {adv.websiteReachable ? (
                          <><CheckCircle2 className="w-3 h-3 text-green-600" /> Found</>
                        ) : (
                          adv.destinationDomain || adv.destinationUrl ? <><AlertTriangle className="w-3 h-3 text-yellow-600" /> Not Reachable</> : <><Search className="w-3 h-3 text-neutral-400" /> Not Found</>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge status={adv.qualificationState} size="sm" showPrefix={true} />
                      {adv.qualificationState === 'QUALIFIED' && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{adv.qualificationScore.toFixed(0)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAdvertiser?.(adv);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded shadow-2xs inline-flex items-center gap-1"
                    >
                      <span>Dossier</span>
                      <ChevronRight className="w-3 h-3 text-neutral-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Idempotent Job Creation Dialog */}
      {showCreateModal && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-job-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg rounded-xl bg-white border border-neutral-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 id="create-job-modal-title" className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-neutral-900" />
                Create Research Job
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleValidateAndSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Search Query / Commercial Keywords
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. residential solar installation dallas tx"
                  value={formData.query}
                  onChange={e => setFormData({ ...formData, query: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-900"
                />
                {formErrors.query && <p className="text-red-600 text-[11px] mt-1">{formErrors.query}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Target Market Country
                  </label>
                  <select
                    value={formData.countryCode}
                    onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                    className="w-full p-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="US">United States (US)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="AU">Australia (AU)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Max Expected Records
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={formData.maxResults}
                    onChange={e => setFormData({ ...formData, maxResults: parseInt(e.target.value) || 50 })}
                    className="w-full p-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Idempotency Key:</span>
                  <span className="text-neutral-800 font-semibold">{formData.idempotencyKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Target Tenant:</span>
                  <span className="text-neutral-800">{formData.tenantId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Worker Pool:</span>
                  <span className="text-neutral-800">Playwright Pool US-East</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Starting Research...' : 'Launch Research Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
