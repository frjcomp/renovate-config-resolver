import express from "express";
import bodyParser from "body-parser";
import { resolveConfigPresets } from "renovate/dist/config/presets/index.js";

export default async function startServer() {
  const app = express();
  app.use(bodyParser.json());

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // POST /resolve endpoint
  app.post("/resolve", async (req, res) => {
    const configObj = req.body;
    if (!configObj) {
      return res
        .status(400)
        .json({ error: "Missing Renovate config in request body" });
    }

    try {
      const resolvedConfig = await resolveConfigPresets(configObj);
      res.json(resolvedConfig);
    } catch (error) {
      res.status(500).json({ error: error || "Internal Server Error" });
    }
  });

  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Renovate resolver service running on port ${PORT}`);
  });

  return app; // Export for testing
}
