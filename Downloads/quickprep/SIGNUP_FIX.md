# ✅ SIGN-UP ERROR FIX - COMPLETE GUIDE

## 🔴 Root Cause

Your app is deployed on Vercel with a **local SQLite database**, which doesn't persist between deployments. When you try to sign up:

1. User data is saved to the database
2. Server restarts/redeploys
3. Database file is lost
4. Sign-up fails, login fails, all data is gone

## ✅ QUICK FIX (5 minutes)

### 1️⃣ Add Environment Variables to Vercel

Go to: https://vercel.com/dashboard

1. Click **quickrep** project
2. Go to **Settings** → **Environment Variables**
3. Click **Add New**
4. Add these 8 variables:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | `AIzaSyDBHPIuObYvN6SL2DU8nAIbpanXOUezFWA` |
| `GEMINI_MODEL` | `models/gemini-2.5-flash` |
| `JWT_SECRET` | `18e4eef24c8b58b94ead13311bbac319ac254812357d48bd827b2e908e572281d015492211dacda3afde834c2e09dc8d96b48a1cf160dcc588cb8854b3d79513` |
| `EMAIL_USER` | `rakeshselvaraj0108@gmail.com` |
| `EMAIL_PASSWORD` | `tvtg wqjo ecsu gjds` |
| `NEXT_PUBLIC_APP_URL` | `https://quickrep.vercel.app` |
| `NEXT_PUBLIC_API_URL` | `https://quickrep.vercel.app` |
| `DATABASE_URL` | See Step 2 below |

### 2️⃣ Set Up Cloud Database (CRITICAL!)

**Choose ONE option:**

#### Option A: MongoDB Atlas (Easiest) ⭐ RECOMMENDED

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a cluster (takes 2-3 minutes)
4. Get connection string:
   - Click "Connect"
   - Choose "Drivers"
   - Copy connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/mydb`)
5. Add to Vercel as `DATABASE_URL`

#### Option B: Vercel PostgreSQL

1. Go to: https://vercel.com/dashboard
2. Click **quickrep** → **Storage**
3. Click **Create** → **Postgres**
4. Copy connection string
5. Add to Vercel as `DATABASE_URL`

#### Option C: Vercel KV Store (Simple, Limited)

1. Go to: https://vercel.com/dashboard
2. Click **quickrep** → **Storage**
3. Click **Create** → **KV Database**
4. Copy connection string
5. Add to Vercel as `DATABASE_URL`

### 3️⃣ Redeploy

```bash
cd c:\Users\Rakesh S\Downloads\quickprep
vc deploy --prod
```

### 4️⃣ Test

Go to: https://quickrep.vercel.app/register

Try signing up. It should now work! ✅

---

## 🔐 Security Best Practices

### Current Issues:
- ⚠️ Credentials in `.env` file (could be committed to git)
- ⚠️ Using local SQLite (no persistence)
- ⚠️ Environment variables not set in Vercel

### How to Fix:

#### 1. Create `.env.local` (NEVER commit this!)
```bash
# .env.local - Only on your machine
GEMINI_API_KEY=AIzaSyDBHPIuObYvN6SL2DU8nAIbpanXOUezFWA
GEMINI_MODEL=models/gemini-2.5-flash
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=18e4eef24c8b58b94ead13311bbac319ac254812357d48bd827b2e908e572281d015492211dacda3afde834c2e09dc8d96b48a1cf160dcc588cb8854b3d79513
EMAIL_USER=rakeshselvaraj0108@gmail.com
EMAIL_PASSWORD=tvtg wqjo ecsu gjds
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### 2. Update `.env` (Safe template, can be committed)
```bash
# .env - Template only
GEMINI_MODEL=models/gemini-2.5-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
# Other variables go in .env.local and Vercel
```

#### 3. Update `.gitignore`
```
.env.local
.env*.local
```

---

## 🛠️ Advanced: Update Prisma for MongoDB

If using MongoDB, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id    String  @id @default(auto()) @map("_id") @db.ObjectId
  email String  @unique
  name  String
  // ... rest of schema
}
```

Then:
```bash
npx prisma db push
```

---

## 📊 Comparison: Local vs Production

| Feature | Local (SQLite) | Production (Vercel) |
|---------|---|---|
| **Database** | File on disk | Cloud (MongoDB/PostgreSQL) |
| **Persistence** | ✅ Yes | ❌ No (without cloud DB) |
| **Data Loss** | Manual delete | On redeploy (without cloud DB) |
| **Cost** | Free | Free (cloud DB free tier) |
| **Performance** | Slow | Fast |
| **Scalability** | Limited | Unlimited |

---

## ✅ Testing Checklist

After deployment:

- [ ] Visit https://quickrep.vercel.app
- [ ] Go to /register
- [ ] Sign up with a test email
- [ ] Check for errors (should say "Account created")
- [ ] Go to /login
- [ ] Login with same credentials
- [ ] Verify dashboard loads
- [ ] Check Vercel logs for any errors

---

## 🆘 If Still Failing

1. **Check Vercel Logs**:
   - Go to: https://vercel.com/dashboard
   - Click **quickrep** → **Deployments**
   - Click latest → **Logs**
   - Look for error messages

2. **Check Database Connection**:
   - Verify DATABASE_URL is correct
   - Test connection in MongoDB/PostgreSQL UI
   - Ensure IP whitelist allows Vercel IPs

3. **Check Email Config**:
   - Verify EMAIL_USER and EMAIL_PASSWORD are correct
   - Test with Gmail app password (not regular password)
   - Check spam folder for emails

4. **Run Local Test**:
   ```bash
   npm run dev
   # Try signing up at http://localhost:3000/register
   # Check console for error messages
   ```

---

## 📚 Resources

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [MongoDB Atlas Setup](https://docs.mongodb.com/atlas/getting-started/)
- [Vercel PostgreSQL](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Database Setup](https://www.prisma.io/docs/orm/overview/databases)

---

**Questions?** Check the logs at https://vercel.com/dashboard or re-read the "If Still Failing" section above.
