const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'vaibhav_portfolio_secret_key_2026';

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// Directories
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `Resume${path.extname(file.originalname)}`)
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  const filetypes = /pdf|doc|docx/;
  if (filetypes.test(path.extname(file.originalname).toLowerCase())) {
    return cb(null, true);
  }
  cb(new Error('Only PDF and Word documents allowed!'));
}});

app.use('/uploads', express.static(uploadsDir));

// Data Functions
const getPortfolioData = () => {
  try {
    const filePath = path.join(dataDir, 'portfolio.json');
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {};
  } catch (e) { return {}; }
};

const savePortfolioData = (data) => {
  try {
    fs.writeFileSync(path.join(dataDir, 'portfolio.json'), JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
};

const getMessages = () => {
  try {
    const filePath = path.join(dataDir, 'messages.json');
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
  } catch (e) { return []; }
};

const saveMessages = (messages) => {
  try {
    fs.writeFileSync(path.join(dataDir, 'messages.json'), JSON.stringify(messages, null, 2), 'utf8');
  } catch (e) {}
};

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/portfolio', (req, res) => {
  try {
    const data = getPortfolioData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch portfolio data.' });
  }
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, success: true });
  }
  res.status(401).json({ success: false, message: 'Invalid password.' });
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

app.post('/api/portfolio', authenticateToken, (req, res) => {
  try {
    savePortfolioData(req.body);
    res.json({ message: 'Portfolio updated!', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save portfolio data.' });
  }
});

app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, projectType, budget, timeline, details } = req.body;
    if (!name || !email || !details) {
      return res.status(400).json({ message: 'Name, email, and details required.' });
    }
    const messages = getMessages();
    messages.push({
      id: Date.now().toString(),
      name, email, phone: phone || 'Not provided',
      projectType: projectType || 'General',
      budget: budget || 'Not specified',
      timeline: timeline || 'Not specified',
      details,
      createdAt: new Date().toISOString()
    });
    saveMessages(messages);
    res.json({ message: 'Message sent successfully!', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process inquiry.' });
  }
});

app.get('/api/messages', authenticateToken, (req, res) => {
  try {
    const messages = getMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});

app.delete('/api/messages/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    let messages = getMessages();
    const initialLength = messages.length;
    messages = messages.filter(msg => msg.id !== id);
    if (messages.length === initialLength) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    saveMessages(messages);
    res.json({ message: 'Message deleted!', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete message.' });
  }
});

app.post('/api/resume/upload', authenticateToken, upload.single('resume'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const portfolio = getPortfolioData();
    portfolio.profile = portfolio.profile || {};
    portfolio.profile.resumeUrl = `/uploads/${req.file.filename}`;
    savePortfolioData(portfolio);
    res.json({ message: 'Resume uploaded!', success: true, resumeUrl: portfolio.profile.resumeUrl });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed.' });
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || 'Server error.' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend Server running on http://localhost:${PORT}`);
});
