import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { runBrowserWorker } from "./src/server/browserWorker.ts";
import { researchJobStore } from "./src/server/researchJobStore.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: List all research jobs (for Research History / Dashboard)
  app.get("/api/research/jobs", (req, res) => {
    try {
      const jobs = researchJobStore.listJobs();
      res.json(jobs);
    } catch (err: any) {
      console.error("Failed to list jobs:", err);
      res.status(500).json({ error: err.message || "Failed to list jobs" });
    }
  });

  // API: Get specific job details
  app.get("/api/research/jobs/:jobId", (req, res) => {
    try {
      const job = researchJobStore.getJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found", jobId: req.params.jobId });
      }
      res.json(job);
    } catch (err: any) {
      console.error("Failed to get job:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API: Get specific job status (Lightweight Polling Contract)
  app.get("/api/research/jobs/:jobId/status", (req, res) => {
    try {
      const job = researchJobStore.getJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found", jobId: req.params.jobId });
      }
      const hasResult = researchJobStore.getResult(req.params.jobId) !== undefined;
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
  app.get("/api/research/jobs/:jobId/results", (req, res) => {
    try {
      const job = researchJobStore.getJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found", jobId: req.params.jobId });
      }

      const result = researchJobStore.getResult(req.params.jobId);
      if (result) {
        return res.json(result);
      }

      // If job is in terminal non-completed state (e.g. BLOCKED or FAILED)
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

  // API: Execute research job (NDJSON stream)
  app.post("/api/research", async (req, res) => {
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
