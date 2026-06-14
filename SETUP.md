# Portfolio Website - MongoDB Setup & Startup Guide

## 🚀 Quick Start

### Step 1: Install MongoDB Locally
**Option A: Download MongoDB Community Edition**
- Go to: https://www.mongodb.com/try/download/community
- Install for Windows
- Default connection: `mongodb://localhost:27017`

**Option B: Use Docker (if installed)**
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Start the Application

**Terminal 1 - Backend:**
```powershell
cd portfolio/backend
npm start
```
(Runs on http://localhost:5000)

**Terminal 2 - Frontend:**
```powershell
cd portfolio/frontend
npm run dev
```
(Runs on http://localhost:5173)

### Step 3: Access Your Portfolio
- **View Site:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin
- **Admin Password:** `admin123`

## 📊 Database Structure

### Portfolio Collection
- Stores: profile, skills, projects, education, internships, services, certificates
- Auto-synced with admin panel updates

### Messages Collection
- Stores: contact form submissions
- Fields: name, email, phone, projectType, budget, timeline, details, createdAt

## 🔧 Environment Variables (.env)
```
PORT=5000
ADMIN_PASSWORD=admin123
JWT_SECRET=vaibhav_portfolio_secret_key_2026
MONGODB_URI=mongodb://localhost:27017/vaibhav-portfolio
```

## ✅ Features
✓ MongoDB Atlas ready (just update MONGODB_URI in .env)
✓ Automatic fallback to JSON files if MongoDB is unavailable
✓ JWT Authentication for admin panel
✓ Resume upload support
✓ Message management system
✓ Full CORS support

## 🛠️ Troubleshooting

**MongoDB Connection Error?**
- Make sure MongoDB service is running
- Check MONGODB_URI in .env
- Or use JSON fallback (automatically enabled)

**Port Already in Use?**
- Backend: Change PORT in .env
- Frontend: It will use next available port (usually 5173)

**Need to Reset Data?**
- Delete the database in MongoDB or restart MongoDB

Enjoy! 🎉
