import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const API_KEY = process.env.DASHSCOPE_API_KEY;

if (!API_KEY) {
  console.warn('WARNING: DASHSCOPE_API_KEY is not set. API calls will fail.');
} else {
  console.log('DASHSCOPE_API_KEY loaded successfully');
}

// Health check endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running correctly', 
    timestamp: new Date().toISOString() 
  });
});

app.post('/api/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, stream, ...rest } = req.body || {};
    
    // Log incoming request (simplified)
    console.log(`[Request] Model: ${model}, Stream: ${stream}`);

    const body = {
      model: model || 'qwen-plus',
      messages: messages || [],
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      stream: !!stream,
      ...rest
    };

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = 'Upstream API request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
        console.error('[Upstream Error]', errorData);
      } catch (_) {
        errorMessage = `HTTP Error ${response.status} ${response.statusText}`;
        console.error('[Upstream Error]', response.status, response.statusText);
      }
      res.status(response.status).json({ error: { message: errorMessage } });
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    if (body.stream && contentType.includes('text/event-stream')) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Node.js fetch body is a ReadableStream
      if (!response.body) {
         throw new Error('Response body is null');
      }

      // Handle stream piping
      // For Node.js native fetch, we can use an async iterator or getReader
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      } catch (streamError) {
        console.error('[Stream Error]', streamError);
      } finally {
        res.end();
      }
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (err) {
    console.error('[Server Internal Error]', err);
    res.status(500).json({ error: { message: err.message || 'Server error' } });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
