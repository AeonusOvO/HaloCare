import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const API_KEY = process.env.DASHSCOPE_API_KEY;

if (!API_KEY) {
  console.warn('DASHSCOPE_API_KEY is not set. Please configure it in server/.env');
}

app.post('/api/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, stream, ...rest } = req.body || {};
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
      } catch (_) {
        errorMessage = `HTTP Error ${response.status} ${response.statusText}`;
      }
      res.status(response.status).json({ error: { message: errorMessage } });
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    if (body.stream && contentType.includes('text/event-stream')) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        res.write(chunk);
      }
      res.end();
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: { message: err.message || 'Server error' } });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
