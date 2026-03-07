# Urban Infrastructure Reporting System

A crowdsourced platform where citizens can report city issues like potholes, garbage, water leakage, and streetlight failures. Built with Node.js backend, PostgreSQL database, and Next.js frontend.

## 🏗️ Architecture

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: Next.js 16 + TypeScript + TailwindCSS
- **AI Module**: Python (optional, for intelligent issue classification)
- **Database**: PostgreSQL 15
- **Real-time**: Socket.io for live updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd urban-infra-reporting
```

### 2. Database Setup

Ensure PostgreSQL is running locally. The system will create the necessary database and user automatically.

### 3. Backend Setup

```bash
cd backend
npm install
```

The `.env` file is already configured with:
```
DATABASE_URL=postgresql://citymind:citymind123@localhost:5432/cityminddb
PORT=5005
JWT_SECRET=supersecretkey123
```

Generate Prisma client and sync database:
```bash
npx prisma generate
npx prisma db push
```

Start the backend server:
```bash
npm start
# or for development
npm run dev
```

Backend will run on: http://localhost:5005

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create environment file:
```bash
cp .env.example .env.local
```

Start the frontend:
```bash
npm run dev
```

Frontend will run on: http://localhost:3001

## 📁 Project Structure

```
urban-infra-reporting/
├── backend/                 # Node.js API server
│   ├── prisma/             # Database schema and migrations
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   ├── services/           # Background services
│   └── workers/            # Background workers
├── frontend/               # Next.js frontend
│   ├── src/app/           # App router pages
│   ├── src/components/     # React components
│   └── src/lib/          # Utility functions
├── ai_module/             # Python AI services (optional)
└── grafana/              # Monitoring dashboards
```

## 🔧 Configuration

### Backend Environment Variables

```env
DATABASE_URL=postgresql://citymind:citymind123@localhost:5432/cityminddb
PORT=5005
JWT_SECRET=your-secret-key
AI_API_URL=http://127.0.0.1:8000
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5005
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 🐘 Database Schema

The system uses Prisma ORM with the following main models:

- **User**: Citizens, officers, admins, auditors
- **Report**: Issue reports with AI analysis
- **ReportHistory**: Status change tracking

## 🚀 Deployment

### Backend Deployment (Vercel/Heroku)

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `DATABASE_URL` (production database)
   - `JWT_SECRET`
   - `AI_API_URL` (if using AI module)

### Frontend Deployment (Vercel)

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` (your deployed backend URL)
   - `NEXT_PUBLIC_APP_URL` (Vercel will set this)

### Database Deployment

Option 1: **Vercel Postgres** (Recommended)
- Create Postgres database in Vercel dashboard
- Copy connection string to environment variables

Option 2: **Railway/Supabase**
- Create external PostgreSQL database
- Update DATABASE_URL in production

## 📱 Features

- **Citizen Reporting**: Submit issues with photos and location
- **AI Classification**: Automatic category and priority assignment
- **Role-based Access**: Citizens, Officers, Admins, Auditors
- **Real-time Updates**: Live status notifications
- **Analytics Dashboard**: Issue tracking and metrics
- **Mobile Responsive**: Works on all devices

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Monitoring

- **Health Check**: `GET /api/health`
- **System Logs**: Winston-based logging
- **Grafana Dashboards**: Available in `/grafana` folder

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit your changes
4. Push to the branch
5. Create Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running on port 5432
- Check if user `citymind` exists with password `citymind123`
- Run `npx prisma db push` to sync schema

### Frontend Build Issues
- Clear Next.js cache: `rm -rf .next`
- Ensure all environment variables are set
- Check Node.js version (18+ required)

### Backend Not Starting
- Check if port 5005 is available
- Verify database connection
- Check logs for specific errors

## 📞 Support

For issues and questions:
- Create GitHub issue
- Email: admin@urbaninfra.app
