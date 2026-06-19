
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
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'vaibhav_super_secret_jwt_key_2024';
const MONGODB_URI = process.env.MONGODB_URI;

// ---------------- DATABASE ----------------

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in environment variables!');
      return;
    }
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Retry after 5 seconds instead of crashing
    setTimeout(connectDB, 5000);
  }
};

connectDB();

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

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true }
  },
  { timestamps: true }
);

const FileModel = mongoose.model('File', fileSchema);

// ---------------- MIDDLEWARE ----------------

app.use(
  cors({
    origin: [
      'https://portfolio-ljlv-tau.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serving uploads folder if it exists (local development fallback)
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
}

// ---------------- MULTER ----------------

const storage = multer.memoryStorage();

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
  res.json({
    status: 'ok',
    message: 'Portfolio Backend is running 🚀',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Get portfolio
app.get('/api/portfolio', async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne();

    if (!portfolio) {
      // Auto-create with default data if empty
      portfolio = await Portfolio.create({
        profile: {
          name: "Vaibhav Deep Srivastava",
          title: "BTech Computer Science Student | MERN Stack Developer",
          email: "vaibhavdeepsrivastava12345@gmail.com",
          linkedin: "linkedin.com/in/vaibhav-deep-srivastava-121673323",
          github: "https://github.com/vaibhav-deep-srivastava",
          about: "I am a BTech 3rd year Computer Science student with a strong command of Data Structures & Algorithms (DSA), System Design, and Fullstack Web Development. I create clean, robust, and premium web designs and applications for clients and users.",
          resumeUrl: ""
        },
        skills: [
          { category: "MERN Stack Web Development", items: ["MongoDB", "Express.js", "React.js", "Node.js"] },
          { category: "Frontend", items: ["HTML", "CSS", "JavaScript", "React"] },
          { category: "Backend", items: ["NodeJS", "Express", "MongoDB", "SQL"] },
          { category: "Core CS & Design", items: ["Data Structures & Algorithms (DSA)", "System Design", "Operating System", "DBMS"] }
        ],
        projects: [
          { id: "1", title: "ChatGPT Clone", description: "A fully functional AI chatbot built on top of the OpenAI API with streaming responses, chat history, and prompt presets.", tech: ["React", "Node.js", "OpenAI API"], github: "https://github.com/vaibhav-deep-srivastava/chatgpt-clone", link: "", image: "" },
          { id: "2", title: "LinkedIn Clone", description: "MERN-stack social network with authentication, posts, likes, comments, real-time feed, and connection requests.", tech: ["MongoDB", "Express", "React", "Node.js"], github: "https://github.com/vaibhav-deep-srivastava/linkedin-clone", link: "", image: "" },
          { id: "3", title: "GitHub Clone", description: "A full stack version control system project implementing core GitHub features with repository management.", tech: ["Node.js", "MongoDB", "HTML", "CSS", "JavaScript"], github: "https://github.com/vaibhav-deep-srivastava/github-clone", link: "", image: "" }
        ],
        education: [
          { id: "1", degree: "BTech in Computer Science", institution: "Axis Institute Of Technology & Management, Kanpur", board: "A.P.J Abdul Kalam University, Lucknow", duration: "2024 - 2028", performance: "CGPA 8.5/10", description: "Currently in 2nd year. Specializing in DSA, System Design, and Fullstack Web Development." },
          { id: "2", degree: "Class 12th (Senior Secondary)", institution: "Adarsh Vidya Mandir Geetapuram, Unnao, Uttar Pradesh", board: "CBSE", duration: "2022 - 2023", performance: "84%", description: "PCM with Computer Science" },
          { id: "3", degree: "Class 10th (Secondary)", institution: "Adarsh Vidya Mandir Geetapuram, Unnao, Uttar Pradesh", board: "CBSE", duration: "2020 - 2021", performance: "92.3%", description: "General Subjects" }
        ],
        internships: [],
        services: [
          { id: "1", title: "Website Development", description: "Marketing sites, landing pages and product websites with modern design and performance.", price: "15,000", delivery: "10 days delivery", features: ["Responsive design", "SEO ready", "CMS optional", "1 month support"], popular: false },
          { id: "2", title: "Fullstack Web App", description: "MERN stack web applications with authentication, dashboard, payments and API integrations.", price: "45,000", delivery: "21 days delivery", features: ["MERN stack", "Auth & roles", "Database & APIs", "Deployment included"], popular: true },
          { id: "3", title: "UI/UX Design", description: "Pixel-perfect Figma designs and design systems tailored to your brand.", price: "12,000", delivery: "7 days delivery", features: ["Figma source", "Design system", "Prototype", "2 revisions"], popular: false }
        ],
        certificates: [
          { id: "1", title: "Data Structures & Algorithms", issuer: "Apna College", year: "2024", imageUrl: "https://images.unsplash.com/photo-1516116211223-5c359a36298a?w=600&auto=format&fit=crop&q=60" },
          { id: "2", title: "MERN Stack Development", issuer: "Online Certification", year: "2024", imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=60" }
        ]
      });
      console.log('📋 Created default portfolio data');
    }

    res.json(portfolio);
  } catch (err) {
    console.error('GET /api/portfolio error:', err.message);
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
    console.error('POST /api/portfolio error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;

  console.log('Login attempt - Expected:', ADMIN_PASSWORD, '| Received:', password);

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
        message: 'Missing fields: name, email, and details are required'
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
    console.error('POST /api/contact error:', err.message);
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
    console.error('GET /api/messages error:', err.message);
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
    console.error('DELETE /api/messages error:', err.message);
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

      // Save to MongoDB FileModel
      await FileModel.findOneAndUpdate(
        { filename: 'resume' },
        {
          filename: 'resume',
          contentType: req.file.mimetype,
          data: req.file.buffer
        },
        { upsert: true, new: true }
      );

      const resumeUrl = `/api/resume/download`;

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
      console.error('Resume upload error:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
);

// Serve/Download resume from MongoDB
app.get('/api/resume/download', async (req, res) => {
  try {
    const file = await FileModel.findOne({ filename: 'resume' });
    if (!file) {
      return res.status(404).send('Resume PDF not found');
    }
    res.set('Content-Type', file.contentType);
    res.send(file.data);
  } catch (err) {
    console.error('Download resume error:', err.message);
    res.status(500).send(err.message);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    message: err.message || 'Internal server error'
  });
});

// Start server (only if running locally, not in serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Admin password is set: ${!!ADMIN_PASSWORD}`);
    console.log(`🔐 JWT secret is set: ${!!JWT_SECRET}`);
  });
}

module.exports = app;
