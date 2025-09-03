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
  });

  it("should return 400 if config violates Renovate schema", async () => {
    const invalidSchemaConfig = {
      extends: 123, // should be array of strings
      invalidField: "not allowed",
    };

    const res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send(invalidSchemaConfig);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid Renovate config");
    expect(res.body).toHaveProperty("details");
    expect(Array.isArray(res.body.details)).toBe(true);

    const messages = res.body.details.map((e) => e.message).join(" ");
    expect(messages).toContain("must be array must be string must match exactly one schema in oneOf");
  });

  it("should resolve a simple Renovate config", async () => {
    const simpleConfig = { extends: ["config:base"] };
    const res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send(simpleConfig);
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("config:base");
  });

  it("should handle invalid preset gracefully", async () => {
    const invalidConfig = { extends: ["nonexistent-preset"] };
    const res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send(invalidConfig);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
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
    expect(JSON.stringify(res.body)).toContain("registry.gitlab.com/team-supercharge/oasg");
  });

  it("should resolve GitHub hosted configs", async () => {
    const githubConfig = {
      extends: ["github>nice-move/renovate-config"],
    };
    const res = await request(app)
      .post("/resolve")
      .set("Content-Type", "application/json")
      .send(githubConfig);
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("extends");
    expect(JSON.stringify(res.body)).toContain("nice-move packages");
  });
});
