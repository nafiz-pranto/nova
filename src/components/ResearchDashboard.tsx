import React from 'react';
import { ResearchJobModel } from '../types';
import { StatusBadge } from './common/StatusBadge';
import { Play } from 'lucide-react';

interface ResearchDashboardProps {
  onNavigateToJobs: () => void;
  onSelectAdvertiser: (advertiser: any) => void;
  onNavigateToReviews: () => void;
  onNavigateToExport: () => void;
  onCreateJob: () => void;
  onOpenWizard?: () => void;
  advertisers?: any[];
  jobs?: ResearchJobModel[];
  reviewItems?: any[];
}

export const ResearchDashboard: React.FC<ResearchDashboardProps> = ({
  jobs = [],
  onOpenWizard,
}) => {
  return (
    <div className="space-y-6 w-full min-w-0 max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Research History</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Previous lead generation runs and their outcomes.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenWizard}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
          <span>New Research</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
              <tr>
                <th className="px-5 py-3">Research Name</th>
                <th className="px-5 py-3">Query</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Requested</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {jobs.map((job) => (
                <tr key={job.jobId} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-neutral-900">{job.researchName || 'Untitled Research'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600">
                    {job.query}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600">
                    {job.countryCode}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600">
                    {job.maxResults}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={job.status} size="sm" showPrefix={false} />
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500 text-xs">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-4">
                      <h3 className="text-lg font-bold text-neutral-900">No research yet</h3>
                      <p className="text-sm text-neutral-500">
                        Choose a preset or enter your own keywords to find advertisers from public Meta Ad Library research.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenWizard}
                        className="mt-4 px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        START YOUR FIRST RESEARCH
                      </button>
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
