import React from 'react';
import { ResearchJobModel } from '../types';
import { StatusBadge } from './common/StatusBadge';
import { Play, ArrowRight, ShieldAlert } from 'lucide-react';
import { ResearchWorkflowRunner } from '../utils/researchWorkflowRunner';

interface ResearchDashboardProps {
  onNavigateToJobs?: () => void;
  onSelectAdvertiser?: (advertiser: any) => void;
  onNavigateToReviews?: () => void;
  onNavigateToExport?: () => void;
  onCreateJob?: () => void;
  onOpenWizard?: () => void;
  onLoadJobResults?: (result: any) => void;
  advertisers?: any[];
  jobs?: ResearchJobModel[];
  reviewItems?: any[];
}

export const ResearchDashboard: React.FC<ResearchDashboardProps> = ({
  jobs = [],
  onOpenWizard,
  onLoadJobResults,
}) => {
  const handleViewJobResults = async (jobId: string) => {
    try {
      const results = await ResearchWorkflowRunner.fetchJobResults(jobId);
      if (onLoadJobResults) {
        onLoadJobResults(results);
      }
    } catch (err: any) {
      alert(`Could not load results for job ${jobId}: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Research History</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Previous lead generation runs and their outcomes.
          </p>
        </div>
        {onOpenWizard && (
          <button
            type="button"
            onClick={onOpenWizard}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>New Research</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
              <tr>
                <th className="px-5 py-3">Research Name</th>
                <th className="px-5 py-3">Query</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Mode</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {jobs.map((job) => {
                const status = (job as any).status || job.state;
                const rawDate = (job as any).createdAt || job.startedAt || job.updatedAt;
                const dateFormatted = rawDate ? new Date(rawDate).toLocaleDateString() : 'Recent';
                const modeLabel = (job as any).researchMode === 'AUTO_DISCOVERY' || !(job as any).targetLeadCount ? 'Auto Discovery' : 'Custom';
                const name = (job as any).researchName || job.query || 'Untitled Research';

                return (
                  <tr key={job.jobId} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-neutral-900">{name}</div>
                      {job.challengeReason && (
                        <div className="text-[11px] text-amber-700 mt-0.5 flex items-center gap-1 font-mono">
                          <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-xs">{job.challengeReason}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600 font-mono text-xs">
                      {job.query}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">
                      {job.locationName || job.countryCode}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600 font-mono text-xs">
                      {modeLabel}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={status} size="sm" showPrefix={false} />
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 text-xs font-mono">
                      {dateFormatted}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleViewJobResults(job.jobId)}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-4">
                      <h3 className="text-lg font-bold text-neutral-900">No research yet</h3>
                      <p className="text-sm text-neutral-500">
                        Choose a preset or enter your own keywords to find advertisers from public Meta Ad Library research.
                      </p>
                      {onOpenWizard && (
                        <button
                          type="button"
                          onClick={onOpenWizard}
                          className="mt-4 px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          START YOUR FIRST RESEARCH
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
