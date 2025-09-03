import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import startServer from "./app.js";

let app;

beforeAll(async () => {
  // Wait for server to initialize
  app = await startServer();
});

describe("Renovate Resolver Service", () => {
  it("should return health status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("should return 400 if no config is sent", async () => {
    const res = await request(app).post("/resolve").send();
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should resolve a simple Renovate config", async () => {
    const simpleConfig = { extends: ["config:base"] };
    const res = await request(app).post("/resolve").send(simpleConfig);
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("config:base");
  });

  it("should handle invalid preset gracefully", async () => {
    const invalidConfig = { extends: ["nonexistent-preset"] };
    const res = await request(app).post("/resolve").send(invalidConfig);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
  });

  it("should resolve gitlab hosted configs", async () => {
    const invalidConfig = {
      $schema: "https://docs.renovatebot.com/renovate-schema.json",
      extends: [
        "gitlab>team-supercharge/jarvis/renovate-presets//base#v1.0.0",
        "gitlab>team-supercharge/jarvis/renovate-presets//api-generator#v1.0.0",
      ],
    };
    const res = await request(app).post("/resolve").send(invalidConfig);
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("extends");
    expect(JSON.stringify(res.body)).toContain(
      "registry.gitlab.com/team-supercharge/oasg",
    );
  });

  it("should resolve github hosted configs", async () => {
    const githubConfig = {
      extends: ["github>nice-move/renovate-config"],
    };
    const res = await request(app).post("/resolve").send(githubConfig);
    console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("extends");
    expect(JSON.stringify(res.body)).toContain("nice-move packages");
  });
});
