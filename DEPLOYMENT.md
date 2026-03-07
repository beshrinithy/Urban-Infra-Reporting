# 🚀 Complete Deployment Guide

## Step-by-Step Commands

### 1. Run Backend Locally

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Sync database schema
npx prisma db push

# Start backend server
npm start
# or for development: npm run dev
```

**Backend will run on:** http://localhost:5005

### 2. Run Frontend Locally

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file (copy from template)
cp .env.example .env.local

# Start frontend server
npm run dev
```

**Frontend will run on:** http://localhost:3000

### 3. Push to GitHub

```bash
# Initialize git repository (if not already done)
git init
git branch -M main

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Urban Infrastructure Reporting System"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/urban-infra-reporting.git

# Push to GitHub
git push -u origin main
```

### 4. Deploy Backend to Vercel

1. **Import Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the `backend` folder as root directory

2. **Configure Environment Variables:**
   ```
   DATABASE_URL=postgresql://citymind:citymind123@localhost:5432/cityminddb
   PORT=5005
   JWT_SECRET=supersecretkey123
   AI_API_URL=http://127.0.0.1:8000
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the deployed backend URL

### 5. Deploy Frontend to Vercel

1. **Import Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import the same GitHub repository
   - Select the `frontend` folder as root directory

2. **Configure Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-frontend-url.vercel.app
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

### 6. Production Database Setup

**Option A: Vercel Postgres (Recommended)**
1. In Vercel dashboard, go to "Storage"
2. Create new Postgres database
3. Copy connection string
4. Update backend environment variables with new DATABASE_URL

**Option B: External Database (Railway/Supabase)**
1. Create PostgreSQL database on Railway or Supabase
2. Copy connection string
3. Update backend environment variables
4. Run `npx prisma db push` on production

### 7. Final Verification

1. **Test Backend:**
   ```bash
   curl https://your-backend-url.vercel.app/api/health
   # Should return: {"status":"Online","db":"Connected"}
   ```

2. **Test Frontend:**
   - Open https://your-frontend-url.vercel.app
   - Try registering a new user
   - Submit a test report

## 🎯 Quick Deployment Commands

### Windows (run deploy.bat):
```batch
deploy.bat
```

### Mac/Linux (run deploy.sh):
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 Environment Variables Summary

### Backend (.env)
```env
DATABASE_URL=postgresql://citymind:citymind123@localhost:5432/cityminddb
PORT=5005
JWT_SECRET=supersecretkey123
AI_API_URL=http://127.0.0.1:8000
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5005
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔧 Troubleshooting

### Database Issues
```bash
# Reset database
npx prisma db push --force-reset

# Check database connection
npx prisma db pull
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Deployment Issues
- Check all environment variables are set
- Ensure database is accessible from production
- Verify API endpoints are working in production

## 🎉 Success!

Your Urban Infrastructure Reporting System is now:
- ✅ Running locally without Docker
- ✅ Deployed on Vercel
- ✅ Connected to production database
- ✅ Ready for citizen use!

For support, check the main README.md or create GitHub issues.
