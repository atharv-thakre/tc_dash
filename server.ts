import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { tcAuthRouter } from "./src/server/tcAuthRouter.js";
import { documentsRouter } from "./src/server/documentsRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Global CORS and permissive headers for AI scrapers, curl, agents, and client libraries
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  // Health endpoint for cloud health checks
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Dynamic visual file system and documents API
  app.use("/api/documents", documentsRouter);

  // Statically mount documents and public directories with open access for all AI tools & bots
  app.use("/documents", express.static(path.resolve(process.cwd(), "documents"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
  }));

  app.use("/public", express.static(path.resolve(process.cwd(), "public"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
  }));

  // Mount LLM reference files at root endpoints (/llm.txt, /llms.txt, /llm-full.txt, /llms-full.txt)
  const serveLlmFile = (filePath: string) => (req: express.Request, res: express.Response) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.sendFile(filePath);
  };

  const llmTxtPath = path.resolve(process.cwd(), "public/llms.txt");
  const llmFullTxtPath = path.resolve(process.cwd(), "public/llms-full.txt");
  const readmePath = path.resolve(process.cwd(), "public/README.md");
  const robotsPath = path.resolve(process.cwd(), "public/robots.txt");
  const sitemapPath = path.resolve(process.cwd(), "public/sitemap.xml");
  const openapiPath = path.resolve(process.cwd(), "public/openapi.json");
  const pluginPath = path.resolve(process.cwd(), "public/.well-known/ai-plugin.json");
  const aiManifestPath = path.resolve(process.cwd(), "public/ai-agent-manifest.json");

  app.get(["/llm.txt", "/llms.txt", "/llm", "/llms"], serveLlmFile(llmTxtPath));
  app.get(["/llm-full.txt", "/llms-full.txt", "/llm-full", "/llms-full"], serveLlmFile(llmFullTxtPath));
  
  app.get(["/robots.txt", "/robot.txt"], (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.sendFile(robotsPath);
  });

  app.get("/sitemap.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.sendFile(sitemapPath);
  });

  app.get(["/openapi.json", "/api/openapi.json", "/swagger.json"], (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.sendFile(openapiPath);
  });

  app.get(["/.well-known/ai-plugin.json", "/ai-plugin.json"], (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.sendFile(pluginPath);
  });

  app.get(["/ai-agent-manifest.json", "/api-manifest.json"], (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.sendFile(aiManifestPath);
  });

  app.get(["/README.md", "/readme.md", "/README", "/readme"], (req, res) => {
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.sendFile(readmePath);
  });

  // Mount standardized tc-auth backend API routes (supports both /tc-auth prefix and root paths)
  app.use("/tc-auth", tcAuthRouter);
  app.use(tcAuthRouter);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
