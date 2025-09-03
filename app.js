// app.js
import express from "express";
import { resolveConfigPresets } from "renovate/dist/config/presets/index.js";
import pino from "pino";
import swaggerUi from "swagger-ui-express";
import AjvDraft04 from "ajv-draft-04";
import addFormats from "ajv-formats";
import fetch from "node-fetch";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

export default async function startServer() {
  const app = express();
  app.use(express.json());

  // -----------------------
  // Download Renovate JSON Schema
  // -----------------------
  let renovateSchema;
  try {
    logger.info("Fetching Renovate schema...");
    const res = await fetch(
      "https://docs.renovatebot.com/renovate-schema.json",
    );
    if (!res.ok)
      throw new Error(`Failed to fetch Renovate schema: ${res.statusText}`);
    renovateSchema = await res.json();
    logger.info("Renovate schema downloaded successfully");
  } catch (err) {
    logger.error(
      { err },
      "Could not download Renovate schema. Server will not start.",
    );
    process.exit(1);
  }

  // -----------------------
  // AJV Draft-04 Validator
  // -----------------------
  const ajv = new AjvDraft04({ strict: false });
  addFormats(ajv);
  const validateRenovate = ajv.compile(renovateSchema);

  const validateRequestBody = (req, res, next) => {
    const valid = validateRenovate(req.body);
    if (!valid) {
      return res.status(400).json({
        error: "Invalid Renovate config",
        details: validateRenovate.errors,
      });
    }
    next();
  };

  // -----------------------
  // OpenAPI JSON with Renovate schema embedded for Swagger UI
  // -----------------------
  const swaggerSpec = {
    openapi: "3.0.3",
    info: {
      title: "Renovate Resolver API",
      version: "1.0.0",
      description: "Automatically generated OpenAPI spec",
    },
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          responses: {
            200: {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { status: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
      "/resolve": {
        post: {
          summary: "Resolve a Renovate config",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: renovateSchema, // Embed the full Renovate JSON Schema here
              },
            },
          },
          responses: {
            200: {
              description: "Resolved config",
              content: { "application/json": { schema: { type: "object" } } },
            },
            400: { description: "Invalid Renovate config" },
            500: { description: "Internal server error" },
          },
        },
      },
    },
  };

  // -----------------------
  // Serve Swagger UI
  // -----------------------
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve OpenAPI JSON
  app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

  // -----------------------
  // Routes
  // -----------------------
  app.get("/", (req, res) => {
    res.redirect("/api-docs/");
  });

  app.get("/health", (req, res) => {
    logger.info("Health check requested");
    res.json({ status: "ok" });
  });

  app.post("/resolve", validateRequestBody, async (req, res) => {
    logger.info({ body: req.body }, "Received /resolve request");
    try {
      const resolvedConfig = await resolveConfigPresets(req.body);
      res.json(resolvedConfig);
    } catch (error) {
      logger.error({ error }, "Error resolving Renovate config");
      res
        .status(500)
        .json({ error: error?.message || "Internal Server Error" });
    }
  });

  // -----------------------
  // Error handling middleware
  // -----------------------
  app.use((err, req, res, next) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "Internal Server Error" });
    next();
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger UI: http://localhost:${PORT}/api-docs`);
    logger.info(`OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
  });

  return app;
}
