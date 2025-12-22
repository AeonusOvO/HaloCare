import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs-extra';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for photos
app.use('/uploads', express.static(path.join(__dirname, '../storage/uploads')));

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    
    const user = await db.createUser(username, password, email);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.loginUser(username, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Don't send password
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Family Routes ---
app.post('/api/family/create', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const family = await db.createFamily(req.user.id, name);
    res.json(family);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/family/my', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUser(req.user.id);
    if (!user.familyId) return res.json(null);
    const family = await db.getFamily(user.familyId);
    res.json(family);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/family/invite', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    await db.inviteToFamily(req.user.id, username);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/user/notifications', authenticateToken, async (req, res) => {
  try {
    const notifs = await db.getNotifications(req.user.id);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/notifications/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { accept } = req.body;
    await db.handleInvite(req.user.id, req.params.id, accept);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/family/role', authenticateToken, async (req, res) => {
  try {
    const { targetUserId, role } = req.body;
    const family = await db.updateMemberRole(req.user.id, targetUserId, role);
    res.json(family);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- File Upload ---
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    if (!req.user) return cb(new Error('Auth required'));
    const dir = path.join(__dirname, '../storage/users', req.user.id, 'photos');
    await fs.ensureDir(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/api/upload/photo', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  // Return the path relative to storage root, or a URL if we served it statically
  // For now, let's return the filename and let the frontend construct the URL or we serve it via a route
  // Actually, let's serve files via a route
  res.json({ filename: req.file.filename, path: req.file.path });
});

app.get('/api/photos/:userId/:filename', authenticateToken, (req, res) => {
  // Simple check: User can only see their own photos OR family photos? 
  // For now, let's allow family members to see each other's photos if they are in the same family
  // But strictly, let's just serve it if the user is authenticated for now to simplify
  const filePath = path.join(__dirname, '../storage/users', req.params.userId, 'photos', req.params.filename);
  res.sendFile(filePath);
});


// --- Existing Qwen Proxy ---
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
