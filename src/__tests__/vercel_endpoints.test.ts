import { describe, it, expect } from 'vitest';
import healthHandler from '../../api/health.ts';
import interpretHandler from '../../api/ai/interpret-scope.ts';
import { EventEmitter } from 'events';

class MockRequest extends EventEmitter {
  method: string;
  url: string;
  headers: Record<string, string>;

  constructor(method: string, url: string, headers: Record<string, string> = {}) {
    super();
    this.method = method;
    this.url = url;
    this.headers = headers;
  }
}

class MockResponse {
  statusCode: number = 200;
  headers: Record<string, string> = {};
  body: string = '';

  setHeader(name: string, value: string) {
    this.headers[name] = value;
  }

  end(data?: string) {
    if (data) {
      this.body = data;
    }
  }
}

describe('Vercel Serverless Functions (/api)', () => {
  it('GET /api/health returns 200 with service health info and no exposed secrets', async () => {
    const req = new MockRequest('GET', '/api/health');
    const res = new MockResponse();

    await healthHandler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toBe('application/json');

    const data = JSON.parse(res.body);
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('Buildzy Backend & Gemini Engine');
    expect(data.ai).toBeDefined();
    expect(data.ai.apiKey).toBeUndefined(); // Crucial security check
  });

  it('OPTIONS /api/health responds with 204 for CORS preflight', async () => {
    const req = new MockRequest('OPTIONS', '/api/health');
    const res = new MockResponse();

    await healthHandler(req as any, res as any);

    expect(res.statusCode).toBe(204);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('POST /api/ai/interpret-scope rejects invalid payloads with 400', async () => {
    const req = new MockRequest('POST', '/api/ai/interpret-scope');
    const res = new MockResponse();

    const handlerPromise = interpretHandler(req as any, res as any);
    req.emit('data', JSON.stringify({ invalidField: 123 }));
    req.emit('end');

    await handlerPromise;

    // Small event tick
    await new Promise(r => setTimeout(r, 20));

    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body);
    expect(data.error).toContain('userPrompt');
  });

  it('POST /api/ai/interpret-scope successfully extracts scope using fallback when no key', async () => {
    const req = new MockRequest('POST', '/api/ai/interpret-scope');
    const res = new MockResponse();

    const handlerPromise = interpretHandler(req as any, res as any);
    req.emit('data', JSON.stringify({ userPrompt: 'Build 1500 sq ft house in Pune' }));
    req.emit('end');

    await handlerPromise;
    await new Promise(r => setTimeout(r, 20));

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.success).toBe(true);
    expect(data.scope.detectedCategory).toBe('New Construction');
    expect(data.scope.recommendedAreaSqFt).toBe(1500);
    expect(data.scope.isAiGenerated).toBe(false); // Graceful fallback
  });
});
