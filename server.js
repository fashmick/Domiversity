import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;
const STATE_FILE_PATH = path.join(process.cwd(), 'state.json');

// Enable CORS allowing https://domiversity.vercel.app specifically
const allowedOrigins = [
  'https://domiversity.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.run.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let platformState = null;

function getPlatformState() {
  if (platformState) {
    return platformState;
  }
  if (fs.existsSync(STATE_FILE_PATH)) {
    try {
      const content = fs.readFileSync(STATE_FILE_PATH, 'utf8');
      platformState = JSON.parse(content);
      return platformState;
    } catch (e) {
      console.error('Error reading state.json:', e);
    }
  }
  platformState = {
    schools: [],
    users: [],
    hostels: [],
    bookings: [],
    jobs: [],
    cohabitants: [],
    chats: [],
    messages: [],
    bookmarks: [],
    activeUserId: ''
  };
  return platformState;
}

function savePlatformState(state) {
  platformState = state;
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write state.json:', e);
  }
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// GET /api/state route
app.get('/api/state', (req, res) => {
  const state = getPlatformState();
  res.json(state);
});

// POST /api/state route
app.post('/api/state', (req, res) => {
  const newState = req.body;
  if (!newState) {
    return res.status(400).json({ error: 'State body required' });
  }
  savePlatformState(newState);
  res.json({ status: 'saved', state: newState });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
