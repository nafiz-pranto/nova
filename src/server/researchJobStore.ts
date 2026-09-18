import fs from 'fs';
import path from 'path';
import { ResearchJobModel, AdvertiserViewModel, AdViewModel } from '../types.ts';
import { SAMPLE_RESEARCH_JOBS, SAMPLE_ADVERTISERS } from '../data/phase08FixturesAndAudit.ts';

export interface ResearchExecutionResult {
  job: ResearchJobModel;
  newAdvertisers: AdvertiserViewModel[];
  newAds: AdViewModel[];
  summary: {
    totalExtracted: number;
    qualifiedCount: number;
    reviewCount: number;
    disqualifiedCount: number;
    reachablePercent: number;
    averageScore: number;
    durationMs: number;
    excludedNoWebsiteCount: number;
    keywordsProcessedCount: number;
  };
}

const DATA_DIR = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? path.join('/tmp', '.data')
  : path.resolve(process.cwd(), '.data');
const JOBS_FILE = path.join(DATA_DIR, 'research_jobs.json');
const RESULTS_FILE = path.join(DATA_DIR, 'research_results.json');

class ResearchJobStore {
  private jobsMap: Map<string, ResearchJobModel> = new Map();
  private resultsMap: Map<string, ResearchExecutionResult> = new Map();
  private idempotencyMap: Map<string, string> = new Map(); // idempotencyKey -> jobId
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Load jobs
      if (fs.existsSync(JOBS_FILE)) {
        const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
        const list: ResearchJobModel[] = JSON.parse(raw);
        for (const job of list) {
          this.jobsMap.set(job.jobId, job);
          if (job.idempotencyKey) {
            this.idempotencyMap.set(job.idempotencyKey, job.jobId);
          }
        }
      } else {
        // Seed default sample jobs
        for (const job of SAMPLE_RESEARCH_JOBS) {
          this.jobsMap.set(job.jobId, job);
          if (job.idempotencyKey) {
            this.idempotencyMap.set(job.idempotencyKey, job.jobId);
          }
        }
        this.persistJobs();
      }

      // Load results
      if (fs.existsSync(RESULTS_FILE)) {
        const raw = fs.readFileSync(RESULTS_FILE, 'utf-8');
        const list: ResearchExecutionResult[] = JSON.parse(raw);
        for (const res of list) {
          this.resultsMap.set(res.job.jobId, res);
        }
      } else {
        // Create initial fixture results for completed sample jobs
        const completedJob = SAMPLE_RESEARCH_JOBS.find(j => j.state === 'COMPLETED');
        if (completedJob) {
          const sampleResult: ResearchExecutionResult = {
            job: completedJob,
            newAdvertisers: SAMPLE_ADVERTISERS.slice(0, 5),
            newAds: [],
            summary: {
              totalExtracted: 5,
              qualifiedCount: 4,
              reviewCount: 1,
              disqualifiedCount: 0,
              reachablePercent: 100,
              averageScore: 92.4,
              durationMs: 4200,
              excludedNoWebsiteCount: 0,
              keywordsProcessedCount: 1
            }
          };
          this.resultsMap.set(completedJob.jobId, sampleResult);
          this.persistResults();
        }
      }

      this.initialized = true;
    } catch (err) {
      console.error('[ResearchJobStore] Initialization error, using in-memory store:', err);
    }
  }

  private persistJobs() {
    try {
      const arr = Array.from(this.jobsMap.values());
      fs.writeFileSync(JOBS_FILE, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[ResearchJobStore] Could not write jobs to disk:', e);
    }
  }

  private persistResults() {
    try {
      const arr = Array.from(this.resultsMap.values());
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[ResearchJobStore] Could not write results to disk:', e);
    }
  }

  public saveJob(job: ResearchJobModel): ResearchJobModel {
    this.jobsMap.set(job.jobId, job);
    if (job.idempotencyKey) {
      this.idempotencyMap.set(job.idempotencyKey, job.jobId);
    }
    this.persistJobs();
    return job;
  }

  public getJob(jobId: string): ResearchJobModel | undefined {
    return this.jobsMap.get(jobId);
  }

  public getJobByIdempotencyKey(key: string): ResearchJobModel | undefined {
    const jobId = this.idempotencyMap.get(key);
    if (!jobId) return undefined;
    return this.jobsMap.get(jobId);
  }

  public listJobs(): ResearchJobModel[] {
    // Return newest first
    return Array.from(this.jobsMap.values()).sort((a, b) => {
      const tA = new Date((a as any).createdAt || a.startedAt || 0).getTime();
      const tB = new Date((b as any).createdAt || b.startedAt || 0).getTime();
      return tB - tA;
    });
  }

  public updateJob(jobId: string, updates: Partial<ResearchJobModel>): ResearchJobModel | undefined {
    const existing = this.jobsMap.get(jobId);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.jobsMap.set(jobId, updated);
    this.persistJobs();
    return updated;
  }

  public saveResult(jobId: string, result: ResearchExecutionResult) {
    this.resultsMap.set(jobId, result);
    this.persistResults();
  }

  public getResult(jobId: string): ResearchExecutionResult | undefined {
    return this.resultsMap.get(jobId);
  }
}

export const researchJobStore = new ResearchJobStore();
