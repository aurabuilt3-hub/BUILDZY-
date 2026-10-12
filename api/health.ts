import type { IncomingMessage, ServerResponse } from 'http';
import { GeminiScopeInterpreter } from '../server/geminiService.ts';


const gemini = new GeminiScopeInterpreter();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed', allowed: ['GET'] }));
    return;
  }

  const health = gemini.getHealth();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      service: 'Buildzy Backend & Gemini Engine',
      version: '1.0.0',
      status: 'healthy',
      runtime: 'vercel-serverless-function',
      timestamp: new Date().toISOString(),
      ai: health,
    })
  );
}
