import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import startServer from './app.js';

let app;

beforeAll(async () => {
  // Wait for server to initialize
  app = await startServer();
});

describe('Renovate Resolver Service', () => {

  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should return 400 if no config is sent', async () => {
    const res = await request(app).post('/resolve').send();
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should resolve a simple Renovate config', async () => {
    const simpleConfig = { extends: ['config:base'] };
    const res = await request(app).post('/resolve').send(simpleConfig);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('resolvedConfig');
    expect(res.body.resolvedConfig).not.toContain('config:base');
  });

  it('should handle invalid preset gracefully', async () => {
    const invalidConfig = { extends: ['nonexistent-preset'] };
    const res = await request(app).post('/resolve').send(invalidConfig);
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

});
