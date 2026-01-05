# 🚀 VERCEL DEPLOYMENT - ENVIRONMENT VARIABLES SETUP GUIDE

## ⚠️ CRITICAL ISSUE WITH CURRENT SETUP

Your app uses **SQLite** for local development, but **Vercel doesn't support persistent local file storage**. When you deploy:
- The database file gets reset on every deployment
- User data is lost
- Sign-up, login, and all database operations fail

## ✅ SOLUTIONS

### Option 1: Use MongoDB (Recommended for Production) 🎯

1. **Create a free MongoDB Atlas account**:
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free tier
   - Create a cluster
   - Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

2. **Update your Prisma schema** (if using Prisma):
   - Change provider from "sqlite" to "mongodb"
   - Update DATABASE_URL to MongoDB connection string

### Option 2: Use Vercel KV Store (Simpler, but limited)

1. **Go to Vercel Dashboard**:
   - Select your project (quickrep)
   - Go to Storage → KV Store
   - Create a store
   - Copy connection string

### Option 3: Use PostgreSQL (Most Reliable)

1. **Use Vercel PostgreSQL**:
   - Go to Vercel Dashboard
   - Storage → Postgres
   - Create database
   - Copy connection string

## 📋 IMMEDIATE FIX - Add Vercel Environment Variables

### Step-by-Step:

1. **Go to**: https://vercel.com/dashboard
2. **Click on your project**: "quickrep"
3. **Go to Settings → Environment Variables**
4. **Add these variables**:

```
GEMINI_API_KEY = AIzaSyDBHPIuObYvN6SL2DU8nAIbpanXOUezFWA
GEMINI_MODEL = models/gemini-2.5-flash
JWT_SECRET = 18e4eef24c8b58b94ead13311bbac319ac254812357d48bd827b2e908e572281d015492211dacda3afde834c2e09dc8d96b48a1cf160dcc588cb8854b3d79513
EMAIL_USER = rakeshselvaraj0108@gmail.com
EMAIL_PASSWORD = tvtg wqjo ecsu gjds
NEXT_PUBLIC_APP_URL = https://quickrep.vercel.app
NEXT_PUBLIC_API_URL = https://quickrep.vercel.app
DATABASE_URL = (use MongoDB or PostgreSQL connection string)
```

5. **Redeploy**: Run `vc deploy --prod` after setting variables

## 🔒 SECURITY NOTES

⚠️ **DO NOT commit sensitive keys to Git!**

Your current `.env` file has:
- ✅ API keys
- ✅ Email credentials
- ✅ JWT secret

**These should be in `.env.local` (local only) and Vercel environment variables (production)**

### Protect your secrets:

1. Create `.env.local` (ignored by git):
```bash
# .env.local (NEVER commit this!)
GEMINI_API_KEY=your_actual_key
EMAIL_PASSWORD=your_actual_password
JWT_SECRET=your_actual_secret
```

2. Update `.env.production`:
```bash
# .env.production (safe to commit)
GEMINI_MODEL=models/gemini-2.5-flash
EMAIL_USER=rakeshselvaraj0108@gmail.com
NEXT_PUBLIC_APP_URL=https://quickrep.vercel.app
NEXT_PUBLIC_API_URL=https://quickrep.vercel.app
DATABASE_URL=your_production_db_url
```

3. Add to `.gitignore`:
```
.env.local
.env*.local
.vercel
```

## 🗂️ Recommended Database Setup for Production

### MongoDB Atlas (Free Tier):
- **Easiest to setup**
- 512MB storage (free)
- Perfect for MVP/testing
- Link: https://mongodb.com/cloud/atlas

### Vercel PostgreSQL:
- **Built-in to Vercel**
- Automatic backups
- Pay as you go
- Link: https://vercel.com/docs/storage/vercel-postgres

### Vercel Postgres with Prisma:
```
# In .env.production
DATABASE_URL="postgres://user:password@host/database"
```

## 📝 Current Status

❌ **Not working**: SQLite database (persistent storage)
❌ **Not set**: Vercel environment variables
⚠️ **Risk**: Sensitive credentials in `.env` file

## ✅ Next Steps

1. Choose a cloud database (MongoDB recommended)
2. Add environment variables to Vercel Dashboard
3. Update DATABASE_URL to cloud DB connection string
4. Run: `vc deploy --prod`
5. Test sign-up at: https://quickrep.vercel.app/register

## 🆘 Troubleshooting

If sign-up still fails after setup:

1. Check Vercel deployment logs:
   - Go to Vercel Dashboard → quickrep → Deployments
   - Click latest deployment
   - View logs

2. Check database connection:
   - Ensure DATABASE_URL is correct
   - Test connection in local environment first

3. Check email configuration:
   - Ensure EMAIL_USER and EMAIL_PASSWORD are correct
   - Test with Gmail app password (not regular password)

---

For more help: https://vercel.com/docs/environment-variables
