import http from 'http';
import { GeminiScopeInterpreter, type ScopeExtractionInput } from './geminiService';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const gemini = new GeminiScopeInterpreter();

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

export function createApiServer() {
  return http.createServer(async (req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end();
      return;
    }

    const url = req.url || '';

    // 1. Health check
    if (req.method === 'GET' && (url === '/api/health' || url === '/health')) {
      const health = gemini.getHealth();
      sendJson(res, 200, {
        service: 'Buildzy Backend & Gemini Engine',
        version: '1.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        ai: health,
      });
      return;
    }

    // 2. AI Scope Interpretation endpoint
    if (req.method === 'POST' && url === '/api/ai/interpret-scope') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 1e6) {
          // 1MB max body limit
          req.destroy();
        }
      });

      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}') as ScopeExtractionInput;
          if (!parsed.userPrompt || typeof parsed.userPrompt !== 'string') {
            sendJson(res, 400, {
              error: 'Invalid request: "userPrompt" string is required',
            });
            return;
          }

          const scope = await gemini.interpretScope(parsed);
          sendJson(res, 200, {
            success: true,
            scope,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          sendJson(res, 500, {
            error: 'Server error processing requirement',
            message: (err as Error).message,
          });
        }
      });
      return;
    }

    // Default 404
    sendJson(res, 404, { error: 'Not found', path: url });
  });
}

// Start server if run directly
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  const server = createApiServer();
  server.listen(port, () => {
    console.log(`[Buildzy Server] Listening on http://localhost:${port}`);
    console.log(`[Buildzy Server] Gemini AI Provider: ${gemini.getHealth().provider} (${gemini.getHealth().model})`);
  });
}
