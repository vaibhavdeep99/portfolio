
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();

// ---------------- CONFIG ----------------

const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// ---------------- DATABASE ----------------

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// ---------------- SCHEMAS ----------------

const portfolioSchema = new mongoose.Schema(
  {
    profile: { type: Object, default: {} },
    skills: { type: Array, default: [] },
    projects: { type: Array, default: [] },
    education: { type: Array, default: [] },
    internships: { type: Array, default: [] },
    services: { type: Array, default: [] },
    certificates: { type: Array, default: [] }
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    details: { type: String, required: true }
  },
  { timestamps: true }
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Message = mongoose.model('Message', messageSchema);

// ---------------- MIDDLEWARE ----------------

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------- MULTER ----------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX allowed'));
    }
  }
});

// ---------------- AUTH ----------------

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'No token provided'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  });
};

// ---------------- ROUTES ----------------

// Health check
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Get portfolio
app.get('/api/portfolio', async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne();

    if (!portfolio) {
      portfolio = await Portfolio.create({});
    }

    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update portfolio
app.post('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const updated = await Portfolio.findOneAndUpdate(
      {},
      req.body,
      {
        new: true,
        upsert: true
      }
    );

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Wrong password'
    });
  }

  const token = jwt.sign(
    { admin: true },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token
  });
});

// Verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

// Save contact message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, details } = req.body;

    if (!name || !email || !details) {
      return res.status(400).json({
        message: 'Missing fields'
      });
    }

    const message = await Message.create({
      name,
      email,
      details
    });

    res.json({
      success: true,
      data: message
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all messages
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find().sort({
      createdAt: -1
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete message
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);

    res.json({
      success: true
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload resume
app.post(
  '/api/resume/upload',
  authenticateToken,
  upload.single('resume'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded'
        });
      }

      const resumeUrl = `/uploads/${req.file.filename}`;

      const portfolio = await Portfolio.findOneAndUpdate(
        {},
        {
          $set: {
            'profile.resumeUrl': resumeUrl
          }
        },
        {
          new: true,
          upsert: true
        }
      );

      res.json({
        success: true,
        resumeUrl: portfolio.profile.resumeUrl
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
