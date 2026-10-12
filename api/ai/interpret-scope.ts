import type { IncomingMessage, ServerResponse } from 'http';
import { GeminiScopeInterpreter, type ScopeExtractionInput } from '../../server/geminiService.ts';


const gemini = new GeminiScopeInterpreter();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed', allowed: ['POST'] }));
    return;
  }

  // Parse incoming JSON body with 1MB body limit guard
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 1e6) {
      req.destroy();
    }
  });

  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body || '{}') as ScopeExtractionInput;
      if (!parsed.userPrompt || typeof parsed.userPrompt !== 'string') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Invalid request: "userPrompt" string is required',
          })
        );
        return;
      }

      const scope = await gemini.interpretScope(parsed);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: true,
          scope,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Server error processing requirement',
          message: (err as Error).message,
        })
      );
    }
  });
}
