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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Create directories if they do not exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Multer Storage Configuration for Resume Uploader
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    cb(null, `Vaibhav_Deep_Srivastava_Resume${fileExt}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF and Word documents are allowed!'));
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Helper Functions
const getPortfolioData = () => {
  const filePath = path.join(dataDir, 'portfolio.json');
  if (!fs.existsSync(filePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const savePortfolioData = (data) => {
  const filePath = path.join(dataDir, 'portfolio.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const getMessages = () => {
  const filePath = path.join(dataDir, 'messages.json');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const saveMessages = (messages) => {
  const filePath = path.join(dataDir, 'messages.json');
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// API Endpoints

// Public portfolio fetch
app.get('/api/portfolio', (req, res) => {
  try {
    const data = getPortfolioData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch portfolio data.', error: error.message });
  }
});

// Admin login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, success: true });
  }
  
  res.status(401).json({ success: false, message: 'Invalid Admin Password.' });
});

// Verify token route (helps frontend check if session is still valid)
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

// Admin portfolio updates (entire update or specific sections can be handled frontend-side and posted back)
app.post('/api/portfolio', authenticateToken, (req, res) => {
  try {
    const newData = req.body;
    savePortfolioData(newData);
    res.json({ message: 'Portfolio updated successfully!', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save portfolio data.', error: error.message });
  }
});

// Contact message submit (public)
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, projectType, budget, timeline, details } = req.body;
    
    if (!name || !email || !details) {
      return res.status(400).json({ message: 'Name, email, and project details are required.' });
    }
    
    const messages = getMessages();
    const newMessage = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || 'Not provided',
      projectType: projectType || 'General Inquiry',
      budget: budget || 'Not specified',
      timeline: timeline || 'Not specified',
      details,
      createdAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    saveMessages(messages);
    
    res.json({ message: 'Your request has been sent successfully!', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process inquiry.', error: error.message });
  }
});

// Fetch all contact messages (Admin only)
app.get('/api/messages', authenticateToken, (req, res) => {
  try {
    const messages = getMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inquiries.', error: error.message });
  }
});

// Delete a message (Admin only)
app.delete('/api/messages/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    let messages = getMessages();
    
    const initialLength = messages.length;
    messages = messages.filter(msg => msg.id !== id);
    
    if (messages.length === initialLength) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }
    
    saveMessages(messages);
    res.json({ message: 'Inquiry deleted successfully.', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete inquiry.', error: error.message });
  }
});

// Resume PDF upload (Admin only)
app.post('/api/resume/upload', authenticateToken, upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    // Update the portfolio JSON to point to the uploaded resume
    const portfolio = getPortfolioData();
    const resumeUrl = `/uploads/${req.file.filename}`;
    portfolio.profile.resumeUrl = resumeUrl;
    savePortfolioData(portfolio);
    
    res.json({ 
      message: 'Resume uploaded successfully!', 
      success: true, 
      resumeUrl 
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed.', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || 'An internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Backend Portfolio Server running on port ${PORT}`);
});
