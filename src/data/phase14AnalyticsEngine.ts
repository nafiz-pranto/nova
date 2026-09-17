// phase14AnalyticsEngine.ts

export interface AnalyticsMetricDefinition {
  metricId: string;
  name: string;
  description: string;
  population: string;
  numerator?: string;
  denominator?: string;
  timeField: string;
  aggregationMethod: string;
  exclusions: string[];
  version: string;
}

export interface ResearchSnapshot {
  snapshotId: string;
  name: string;
  capturedAt: string;
  dataCutoff: string;
  analyticsVersion: string;
  scope: {
    timeWindow: { start: string; end: string };
    filters: Record<string, string>;
  };
  createdBy: string;
  isImmutable: boolean;
  metrics: Record<string, number | null>;
}

export const METRIC_CATALOG: AnalyticsMetricDefinition[] = [
  {
    metricId: 'unique_advertisers_observed',
    name: 'Unique Advertisers Observed',
    description: 'Count of unique canonical advertisers observed within the time window.',
    population: 'All advertisers with >=1 valid observation',
    timeField: 'observation.observed_at',
    aggregationMethod: 'COUNT(DISTINCT advertiser_id)',
    exclusions: ['quarantined observations'],
    version: '1.0'
  },
  {
    metricId: 'new_advertisers_discovered',
    name: 'New Advertisers Discovered',
    description: 'Count of unique advertisers whose first observation falls within the time window.',
    population: 'Advertisers with first_seen_at in time window',
    timeField: 'advertiser.first_seen_at',
    aggregationMethod: 'COUNT(DISTINCT advertiser_id)',
    exclusions: ['quarantined observations'],
    version: '1.0'
  },
  {
    metricId: 'verification_completion_rate',
    name: 'Verification Completion Rate',
    description: 'Percentage of verification requests that have reached a terminal state (VERIFIED, FAILED, CONFLICT).',
    population: 'Verification requests created in time window',
    numerator: 'Completed verifications',
    denominator: 'Total verification requests',
    timeField: 'verification.created_at',
    aggregationMethod: '(Completed / Total) * 100',
    exclusions: ['orphaned requests'],
    version: '1.1'
  },
  {
    metricId: 'active_ads_count',
    name: 'Active Ads Observed',
    description: 'Total number of active ad observations (distinct by ad_id).',
    population: 'Ad observations marked as ACTIVE',
    timeField: 'ad.observed_at',
    aggregationMethod: 'COUNT(DISTINCT ad_id)',
    exclusions: ['quarantined ads'],
    version: '1.0'
  },
  {
    metricId: 'workflow_success_rate',
    name: 'Workflow Success Rate',
    description: 'Percentage of workflow runs that completed successfully without manual aborts.',
    population: 'Workflow runs started in time window',
    numerator: 'Runs with status COMPLETED',
    denominator: 'All runs',
    timeField: 'workflow_run.started_at',
    aggregationMethod: '(Completed / Total) * 100',
    exclusions: [],
    version: '1.0'
  }
];

export const SAMPLE_SNAPSHOTS: ResearchSnapshot[] = [
  {
    snapshotId: 'snap_2026_09_01',
    name: 'September 1st Research Baseline',
    capturedAt: '2026-09-01T00:05:00Z',
    dataCutoff: '2026-09-01T00:00:00Z',
    analyticsVersion: '1.1',
    scope: {
      timeWindow: { start: '2026-08-01T00:00:00Z', end: '2026-09-01T00:00:00Z' },
      filters: {}
    },
    createdBy: 'system_cron',
    isImmutable: true,
    metrics: {
      'unique_advertisers_observed': 1402,
      'new_advertisers_discovered': 342,
      'verification_completion_rate': 88.5,
      'active_ads_count': 12050,
      'workflow_success_rate': 94.2
    }
  },
  {
    snapshotId: 'snap_2026_09_15',
    name: 'Mid-September Progress Report',
    capturedAt: '2026-09-15T00:05:00Z',
    dataCutoff: '2026-09-15T00:00:00Z',
    analyticsVersion: '1.1',
    scope: {
      timeWindow: { start: '2026-09-01T00:00:00Z', end: '2026-09-15T00:00:00Z' },
      filters: {}
    },
    createdBy: 'operator_daniela',
    isImmutable: true,
    metrics: {
      'unique_advertisers_observed': 850,
      'new_advertisers_discovered': 112,
      'verification_completion_rate': 92.1,
      'active_ads_count': 8400,
      'workflow_success_rate': 98.0
    }
  }
];

export const DAILY_TRENDS = [
  { date: '2026-09-10', newAdvertisers: 12, activeAds: 840, workflowsCompleted: 45 },
  { date: '2026-09-11', newAdvertisers: 15, activeAds: 890, workflowsCompleted: 52 },
  { date: '2026-09-12', newAdvertisers: 8, activeAds: 810, workflowsCompleted: 38 },
  { date: '2026-09-13', newAdvertisers: 22, activeAds: 1050, workflowsCompleted: 60 },
  { date: '2026-09-14', newAdvertisers: 18, activeAds: 960, workflowsCompleted: 55 },
  { date: '2026-09-15', newAdvertisers: 10, activeAds: 850, workflowsCompleted: 42 },
];
