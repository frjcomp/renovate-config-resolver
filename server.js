#!/usr/bin/env node
import { createApp, startServer } from "./app.js";

try {
  const app = createApp();
  startServer(app);
} catch (err) {
  console.error("Failed to start server:", err);
  process.exit(1);
}
