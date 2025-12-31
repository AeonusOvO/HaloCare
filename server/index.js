import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs-extra';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { taskManager } from './taskManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors()); // Allow all origins

// Explicitly log the limit setting to confirm server restart
console.log("Configuring Express: Body Limit = 200mb");

// Use a raw byte value just in case 'mb' parsing is quirky in some envs
const LIMIT = 200 * 1024 * 1024; // 200MB
app.use(express.json({ limit: LIMIT })); 
app.use(express.urlencoded({ limit: LIMIT, extended: true }));

// Debug middleware to check content length
app.use((req, res, next) => {
  if (req.path === '/api/chat/completions') {
    console.log(`[Middleware] Incoming request to ${req.path}, Content-Length: ${req.get('Content-Length')}`);
  }
  next();
});

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

// --- Diagnosis Task Routes (Async) ---

app.post('/api/diagnosis/start', authenticateToken, (req, res) => {
  try {
    const inputData = req.body; // Should contain images, text, etc.
    const task = taskManager.startTask(req.user.id, inputData);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/diagnosis/active', authenticateToken, (req, res) => {
  try {
    const task = taskManager.getUserActiveTask(req.user.id);
    res.json(task || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/diagnosis/task/:taskId', authenticateToken, (req, res) => {
  try {
    const task = taskManager.getTask(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Security check: only allow owner to see task
    if (task.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Diagnosis History Routes ---
app.get('/api/diagnosis', authenticateToken, async (req, res) => {
  try {
    const history = await db.getDiagnosisHistory(req.user.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/diagnosis/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.getDiagnosisDetail(req.user.id, req.params.id);
    res.json(record);
  } catch (err) {
    if (err.message.includes('not found')) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/diagnosis', authenticateToken, async (req, res) => {
  try {
    const record = req.body;
    // Basic validation
    if (!record || !record.diagnosis) {
      return res.status(400).json({ error: 'Invalid diagnosis record' });
    }
    const savedRecord = await db.addDiagnosis(req.user.id, record);
    res.json(savedRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/diagnosis/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteDiagnosis(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Health Profile Routes (TCM Archives) ---

app.get('/api/profiles', authenticateToken, async (req, res) => {
  try {
    const profiles = await db.getHealthProfiles(req.user.id);
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profiles', authenticateToken, async (req, res) => {
  try {
    const profile = await db.createHealthProfile(req.user.id, req.body);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profiles/:id', authenticateToken, async (req, res) => {
  try {
    const profile = await db.updateHealthProfile(req.user.id, req.params.id, req.body);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/profiles/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteHealthProfile(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-eba2fce7c20c42af9acb2e2acfaa6760';

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

// --- Habit Model (Cloud Sync) ---
app.get('/api/habits', authenticateToken, async (req, res) => {
  try {
    const model = await db.getHabitModel(req.user.id);
    res.json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habits', authenticateToken, async (req, res) => {
  try {
    const saved = await db.setHabitModel(req.user.id, req.body || {});
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habits/event', authenticateToken, async (req, res) => {
  try {
    const { cardId, type } = req.body || {};
    if (!cardId || !type) return res.status(400).json({ error: 'Missing cardId or type' });
    const updated = await db.applyHabitEvent(req.user.id, cardId, type);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
      let errorBody = {};
      try {
        errorBody = await response.json();
        errorMessage = errorBody.error?.message || errorBody.message || errorMessage;
        console.error('[Upstream Error Body]', JSON.stringify(errorBody));
      } catch (_) {
        errorMessage = `HTTP Error ${response.status} ${response.statusText}`;
        console.error('[Upstream Error]', response.status, response.statusText);
      }
      
      // Pass through the status code and error details
      console.error(`[Upstream Error] Status: ${response.status}, Message: ${errorMessage}`);
      res.status(response.status).json({ 
        error: { 
          message: `Upstream(${response.status}): ${errorMessage}`,
          details: errorBody 
        } 
      });
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

// Global Error Handler to catch body-parser errors (like 413 Entity Too Large)
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    console.error(`[Server Error] Entity Too Large: ${err.message}`);
    return res.status(413).json({ 
      error: { 
        message: 'Request entity too large (Server Limit Exceeded)', 
        detail: 'Please restart the server if you just updated the limit.' 
      } 
    });
  }
  console.error('[Server Error]', err);
  res.status(500).json({ error: { message: err.message || 'Internal Server Error' } });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
