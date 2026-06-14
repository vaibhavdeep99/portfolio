const mongoose = require('mongoose');

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
  profile: {
    name: String,
    title: String,
    bio: String,
    email: String,
    phone: String,
    location: String,
    resumeUrl: String,
    avatar: String
  },
  skills: [{
    category: String,
    items: [String]
  }],
  projects: [{
    id: String,
    title: String,
    tech: String,
    description: String,
    github: String,
    link: String,
    image: String
  }],
  education: [{
    id: String,
    degree: String,
    institution: String,
    board: String,
    duration: String,
    performance: String,
    description: String
  }],
  internships: [{
    id: String,
    role: String,
    company: String,
    duration: String,
    description: String
  }],
  services: [{
    id: String,
    title: String,
    description: String,
    icon: String
  }],
  certificates: [{
    id: String,
    title: String,
    issuer: String,
    year: String,
    imageUrl: String
  }],
  updatedAt: { type: Date, default: Date.now }
});

// Message Schema
const messageSchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  projectType: String,
  budget: String,
  timeline: String,
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { Portfolio, Message };
