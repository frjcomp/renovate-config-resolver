import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import startServer from "./app.js";

// Mock logger module
vi.mock("./logger.js", () => {
  const logger = { info: vi.fn(), error: vi.fn(), debug: vi.fn() };
  return { default: logger };
});

import logger from "./logger.js";

let app;

beforeAll(async () => {
  app = await startServer();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Renovate Resolver Service", () => {
  it("should return health status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });

    expect(logger.info).toHaveBeenCalledWith("Health check requested");
  });

  it("should redirect from / to /api-docs/", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/api-docs/");
  });

  it("should return empty config if no config is sent", async () => {
    const res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({});

    expect(logger.info).toHaveBeenCalledWith("/resolve endpoint called");
    expect(logger.debug).toHaveBeenCalled();
    // Lazy compilation happens only once
    expect(logger.info).toHaveBeenCalledWith(
      "Renovate validator compiled lazily",
    );
  });

  it("should return 400 if config violates Renovate schema", async () => {
    const invalidSchemaConfig = { extends: 123, invalidField: "not allowed" };

    const res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send(invalidSchemaConfig);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid Renovate config");
    expect(res.body).toHaveProperty("details");
    expect(Array.isArray(res.body.details)).toBe(true);

    const messages = res.body.details.map((e) => e.message).join(" ");
    expect(messages).toContain(
      "must be array must be string must match exactly one schema in oneOf",
    );

    expect(logger.info).toHaveBeenCalledWith(
      "Schema validation failed",
      expect.any(Object),
    );
  });

  it("should resolve a simple Renovate config", async () => {
    const simpleConfig = { extends: ["config:base"] };
    const res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send(simpleConfig);
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("config:base");

    expect(logger.info).toHaveBeenCalledWith("/resolve endpoint called");
    expect(logger.debug).toHaveBeenCalled();
  });

  it("should handle invalid preset gracefully", async () => {
    const invalidConfig = { extends: ["nonexistent-preset"] };
    const res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send(invalidConfig);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(Error) }),
      "Error resolving Renovate config",
    );
  });

  it("should resolve GitLab hosted configs", async () => {
    const gitlabConfig = {
      $schema: "https://docs.renovatebot.com/renovate-schema.json",
      extends: [
        "gitlab>team-supercharge/jarvis/renovate-presets//base#v1.0.0",
        "gitlab>team-supercharge/jarvis/renovate-presets//api-generator#v1.0.0",
      ],
    };
    const res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send(gitlabConfig);
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("extends");
    expect(JSON.stringify(res.body)).toContain(
      "registry.gitlab.com/team-supercharge/oasg",
    );

    expect(logger.info).toHaveBeenCalledWith("/resolve endpoint called");
    expect(logger.debug).toHaveBeenCalled();
  });

  it("should resolve GitHub hosted configs", async () => {
    let githubConfig = { extends: ["github>nice-move/renovate-config"] };
    let res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send(githubConfig);
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("extends");
    expect(JSON.stringify(res.body)).toContain("nice-move packages");

    expect(logger.info).toHaveBeenCalledWith("/resolve endpoint called");
    expect(logger.debug).toHaveBeenCalled();

    githubConfig = {
      $schema: "https://docs.renovatebot.com/renovate-schema.json",
      extends: ["github>renovatebot/.github"],
    };
    res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send(githubConfig);
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("extends");

    expect(logger.info).toHaveBeenCalledWith("/resolve endpoint called");
    expect(logger.debug).toHaveBeenCalled();
  });
});
