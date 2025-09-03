import express from "express";
import bodyParser from "body-parser";
import { resolveConfigPresets } from "renovate/dist/config/presets/index.js";
import pino from "pino";

// Setup logger
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

// Create Express app
const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
  logger.info("Health check requested");
  res.json({ status: "ok" });
});

// POST /resolve endpoint
app.post("/resolve", async (req, res) => {
  logger.info({ body: req.body }, "Received /resolve request");
  const configObj = req.body;
  if (!configObj) {
    logger.warn("Missing Renovate config in request body");
    return res
      .status(400)
      .json({ error: "Missing Renovate config in request body" });
  }

  try {
    logger.debug({ configObj }, "Resolving Renovate config");
    const resolvedConfig = await resolveConfigPresets(configObj);
    logger.info({ resolvedConfig }, "Resolved Renovate config");
    res.json(resolvedConfig);
  } catch (error) {
    logger.error({ error }, "Error resolving Renovate config");
    res
      .status(500)
      .json({ error: error?.message || "Internal Server Error" });
  }
});

// Vercel handler export
export default app;