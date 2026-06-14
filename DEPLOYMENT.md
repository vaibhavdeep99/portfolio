# 🚀 Deployment Guide - Live on Internet!

## Option 1: Deploy to Vercel (Recommended - Easiest)

### Frontend to Vercel
1. **Go to:** https://vercel.com
2. **Sign up** with GitHub
3. **Import your repository**
4. **Configure:**
   - Framework: Vite
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
5. **Deploy** - Click Deploy button
6. Your frontend will be live at: `https://your-portfolio.vercel.app`

### Backend to Railway (Free Tier)
1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **New Project → Import from GitHub**
4. **Select your portfolio repo**
5. **Add Environment Variables:**
   ```
   PORT=5000
   ADMIN_PASSWORD=admin123
   JWT_SECRET=vaibhav_portfolio_secret_key_2026
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vaibhav-portfolio
   ```
6. **Deploy** - Railway auto-deploys
7. Your backend will be live at: `https://your-backend.railway.app`

## Option 2: Deploy to Heroku (Alternative)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app for backend
heroku create your-portfolio-backend
heroku config:set PORT=5000 ADMIN_PASSWORD=admin123 JWT_SECRET=vaibhav_portfolio_secret_key_2026

# Push backend
git subtree push --prefix backend heroku main
```

## Option 3: GitHub Pages + Backend as API

1. Frontend on GitHub Pages
2. Backend deployed separately (Railway/Render)

## Update Frontend for Production

Once backend is deployed, update this in `frontend/vite.config.js`:

```javascript
// For production API calls
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000'
```

Then in your API calls:
```javascript
fetch(`${API_URL}/api/portfolio`)
```

## Database Setup - MongoDB Atlas

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Create free account**
3. **Create a cluster** (free tier available)
4. **Get connection string**
5. **Add to Railway/Heroku environment variables** as `MONGODB_URI`

## Summary of URLs After Deployment

```
Frontend (Vercel):    https://your-portfolio.vercel.app
Backend (Railway):    https://your-backend.railway.app/api
Admin Panel:          https://your-portfolio.vercel.app/admin
API Endpoint:         https://your-backend.railway.app/api
```

**Done! Your portfolio is now LIVE! 🎉**
