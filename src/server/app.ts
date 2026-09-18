import express, { Request, Response, NextFunction } from "express";
import { runBrowserWorker, cancelJob, checkBrowserAvailability } from "./browserWorker.ts";
import { researchJobStore } from "./researchJobStore.ts";

export const app = express();

// Standard middleware
app.use(express.json());

// Permissive CORS for same-origin and cross-origin deployments
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Idempotency-Key, X-Requested-With, Accept");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Router for API endpoints
const router = express.Router();

// Health check endpoint
router.get("/health", async (req: Request, res: Response) => {
  const browserReady = await checkBrowserAvailability().catch(() => false);
  res.json({
    status: "healthy",
    app: "standalone_local_scraper",
    browserReady,
    runtime: "node_server",
    storageDirectory: ".data",
    timestamp: new Date().toISOString()
  });
});

// API: Cancel active research job
router.post("/research/jobs/:jobId/cancel", (req: Request, res: Response) => {
  try {
    const jobId = String(req.params.jobId);
    const success = cancelJob(jobId);
    res.json({
      success,
      jobId,
      message: success ? "Research job cancelled." : "Job not found or already in terminal state."
    });
  } catch (err: any) {
    console.error("Failed to cancel job:", err);
    res.status(500).json({ error: err.message || "Failed to cancel job" });
  }
});

// API: List all research jobs (for Research History / Dashboard)
router.get("/research/jobs", (req: Request, res: Response) => {
  try {
    const jobs = researchJobStore.listJobs();
    res.json(jobs);
  } catch (err: any) {
    console.error("Failed to list jobs:", err);
    res.status(500).json({ error: err.message || "Failed to list jobs" });
  }
});

// API: Get specific job details
router.get("/research/jobs/:jobId", (req: Request, res: Response) => {
  try {
    const jobId = String(req.params.jobId);
    const job = researchJobStore.getJob(jobId);
    if (!job) {
      return res.status(404).json({
        error: {
          code: "JOB_NOT_FOUND",
          message: `Research job ${jobId} was not found.`,
          jobId
        }
      });
    }
    res.json(job);
  } catch (err: any) {
    console.error("Failed to get job:", err);
    res.status(500).json({ error: err.message });
  }
});

// API: Get specific job status (Lightweight Polling Contract)
router.get("/research/jobs/:jobId/status", (req: Request, res: Response) => {
  try {
    const jobId = String(req.params.jobId);
    const job = researchJobStore.getJob(jobId);
    if (!job) {
      return res.status(404).json({
        error: {
          code: "JOB_NOT_FOUND",
          message: `Research job ${jobId} was not found.`,
          jobId
        }
      });
    }
    const hasResult = researchJobStore.getResult(jobId) !== undefined;
    res.json({
      jobId: job.jobId,
      status: job.state,
      stage: job.state === 'COMPLETED' ? 'EMISSION' : job.state === 'BLOCKED' ? 'INGESTION' : 'VALIDATION',
      percent: job.progressPercent,
      resultAvailable: hasResult,
      finalLeadCount: job.processedCount,
      error: job.stopReason || null,
      challengeReason: job.challengeReason || null
    });
  } catch (err: any) {
    console.error("Failed to get job status:", err);
    res.status(500).json({ error: err.message });
  }
});

// API: Direct Result Retrieval Endpoint
router.get("/research/jobs/:jobId/results", (req: Request, res: Response) => {
  try {
    const jobId = String(req.params.jobId);
    const job = researchJobStore.getJob(jobId);
    if (!job) {
      return res.status(404).json({
        error: {
          code: "JOB_NOT_FOUND",
          message: `Research job ${jobId} was not found.`,
          jobId
        }
      });
    }

    const result = researchJobStore.getResult(jobId);
    if (result) {
      return res.json(result);
    }

    // If job is in terminal non-completed state (e.g. BLOCKED, FAILED, CANCELLED)
    if (job.state === 'BLOCKED' || job.state === 'FAILED' || job.state === 'CANCELLED') {
      return res.status(200).json({
        job,
        status: job.state,
        error: job.challengeReason || job.stopReason || `Job ended with status ${job.state}`,
        newAdvertisers: [],
        newAds: [],
        summary: {
          totalExtracted: 0,
          qualifiedCount: 0,
          reviewCount: 0,
          disqualifiedCount: 0,
          reachablePercent: 0,
          averageScore: 0,
          durationMs: 0,
          excludedNoWebsiteCount: 0,
          keywordsProcessedCount: 0
        }
      });
    }

    // If still running
    return res.status(202).json({
      jobId: job.jobId,
      status: job.state,
      message: "Job is currently running. Results not yet finalized."
    });
  } catch (err: any) {
    console.error("Failed to get job results:", err);
    res.status(500).json({ error: err.message });
  }
});

// API: Execute research job (NDJSON stream / Serverless chunked response)
router.post("/research", async (req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    const request = req.body;
    
    const emitEvent = (event: any) => {
      try {
        res.write(JSON.stringify(event) + "\n");
      } catch (e) {
        console.error("Error writing event to stream:", e);
      }
    };

    const result = await runBrowserWorker(request, emitEvent);
    // Emit the final result object so consumer receives it
    res.write(JSON.stringify(result) + "\n");
    res.end();
  } catch (err: any) {
    console.error("Execution error in /api/research:", err);
    res.write(JSON.stringify({ type: 'error', message: err.message, stack: err.stack }) + "\n");
    res.end();
  }
});

// API: Server-side Export Generation Endpoint
router.post("/research/export", (req: Request, res: Response) => {
  try {
    const { jobId, format = "json", profile = "sanitized_leads_profile" } = req.body || {};
    const result = jobId ? researchJobStore.getResult(jobId) : null;
    const leads = result?.newAdvertisers || [];
    
    const exportId = `exp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const downloadToken = `dl_tok_${exportId}_valid_2h`;

    if (format.toLowerCase() === "csv") {
      const headers = ["advertiserId", "canonicalName", "locationCode", "matchedKeywords", "qualificationState", "qualificationScore", "destinationDomain"];
      const rows = leads.map(l => [
        `"${l.advertiserId}"`,
        `"${(l.canonicalName || '').replace(/"/g, '""')}"`,
        `"${l.locationCode || ''}"`,
        `"${(l.matchedKeywords || []).join(';')}"`,
        `"${l.qualificationState || ''}"`,
        `"${l.qualificationScore || 0}"`,
        `"${l.destinationDomain || ''}"`
      ].join(","));
      const csvContent = [headers.join(","), ...rows].join("\n");
      
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="leads_export_${profile}_${Date.now()}.csv"`);
      return res.send(csvContent);
    }

    res.json({
      status: "COMPLETED",
      exportId,
      downloadToken,
      format,
      recordCount: leads.length,
      downloadUrl: `/api/research/export/${exportId}/download?token=${downloadToken}`,
      data: {
        schemaVersion: "1.2.0-phase08-stable",
        exportProfile: profile,
        generatedAt: new Date().toISOString(),
        recordCount: leads.length,
        records: leads
      }
    });
  } catch (err: any) {
    console.error("Export error:", err);
    res.status(500).json({ error: err.message || "Failed to generate export" });
  }
});

// Mount the router on both `/api` and `/` so that path variations, rewrites, or proxy prefixes work identically
app.use("/api", router);
app.use("/", router);

// Controlled 404 handler for API routes
app.use("/api/*", (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: "API_ROUTE_NOT_FOUND",
      message: `The API endpoint '${req.originalUrl}' does not exist on this server.`,
      path: req.originalUrl,
      method: req.method
    }
  });
});

export default app;
