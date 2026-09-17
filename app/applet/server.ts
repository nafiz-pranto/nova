import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { runBrowserWorker } from "./src/server/browserWorker.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for starting the Playwright worker
  app.post("/api/research", async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      const request = req.body;
      
      // We will stream back JSON chunks separated by newlines
      const emitEvent = (event: any) => {
        res.write(JSON.stringify(event) + "\n");
      };

      await runBrowserWorker(request, emitEvent);
      
      res.end();
    } catch (err: any) {
      console.error(err);
      res.write(JSON.stringify({ type: 'error', message: err.message }) + "\n");
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
