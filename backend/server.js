const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// ✅ Render port
const PORT = process.env.PORT || 10000;

// ENV
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// ---------------- MIDDLEWARE ----------------

// ✅ CORS FIX (IMPORTANT FOR VERCEL)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-frontend.vercel.app' // 🔴 CHANGE THIS
  ],
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ---------------- DIRECTORIES ----------------

const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));

// ---------------- MULTER ----------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only PDF, DOC, DOCX allowed'), ok);
  }
});

// ---------------- FILE HELPERS ----------------

const portfolioFile = path.join(dataDir, 'portfolio.json');
const messagesFile = path.join(dataDir, 'messages.json');

const getPortfolioData = () => {
  try {
    if (!fs.existsSync(portfolioFile)) {
      return {
        profile: {},
        skills: [],
        projects: [],
        education: [],
        internships: [],
        services: [],
        certificates: []
      };
    }
    return JSON.parse(fs.readFileSync(portfolioFile, 'utf8'));
  } catch {
    return {
      profile: {},
      skills: [],
      projects: [],
      education: [],
      internships: [],
      services: [],
      certificates: []
    };
  }
};

const savePortfolioData = (data) => {
  fs.writeFileSync(portfolioFile, JSON.stringify(data, null, 2));
};

const getMessages = () => {
  try {
    if (!fs.existsSync(messagesFile)) return [];
    return JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
  } catch {
    return [];
  }
};

const saveMessages = (data) => {
  fs.writeFileSync(messagesFile, JSON.stringify(data, null, 2));
};

// ---------------- AUTH ----------------

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ---------------- ROUTES ----------------

// Health check
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Portfolio GET
app.get('/api/portfolio', (req, res) => {
  res.json(getPortfolioData());
});

// Portfolio UPDATE
app.post('/api/portfolio', authenticateToken, (req, res) => {
  savePortfolioData(req.body);
  res.json({ success: true });
});

// Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Wrong password' });
  }

  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });

  res.json({ success: true, token });
});

// Verify
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

// Contact
app.post('/api/contact', (req, res) => {
  const { name, email, details } = req.body;

  if (!name || !email || !details) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const messages = getMessages();

  messages.push({
    id: Date.now().toString(),
    name,
    email,
    details,
    createdAt: new Date().toISOString()
  });

  saveMessages(messages);

  res.json({ success: true });
});

// Messages
app.get('/api/messages', authenticateToken, (req, res) => {
  res.json(getMessages());
});

// Delete message
app.delete('/api/messages/:id', authenticateToken, (req, res) => {
  let messages = getMessages();
  messages = messages.filter(m => m.id !== req.params.id);
  saveMessages(messages);
  res.json({ success: true });
});

// Resume upload
app.post('/api/resume/upload',
  authenticateToken,
  upload.single('resume'),
  (req, res) => {

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const portfolio = getPortfolioData();
    portfolio.profile.resumeUrl = `/uploads/${req.file.filename}`;
    savePortfolioData(portfolio);

    res.json({
      success: true,
      resumeUrl: portfolio.profile.resumeUrl
    });
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
