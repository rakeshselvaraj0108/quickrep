# 🍃 MongoDB Setup for QuickPrep - Step by Step

## 5-Minute Quick Setup

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"**
3. Sign up with email/Google/GitHub
4. Email verification (check spam folder!)

### Step 2: Create a Cluster
1. After signup, click **"Create a Deployment"**
2. Choose **"Free"** tier
3. Select **AWS** + any region close to you
4. Click **"Create Deployment"**
5. Wait 2-3 minutes for cluster to be ready

### Step 3: Get Connection String
1. Once cluster is ready, click **"Connect"**
2. Select **"Drivers"**
3. Choose **Node.js** version **4.x**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

### Step 4: Replace Password in Connection String
The connection string has `<password>` placeholder. You set this password when creating the database user.

1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Set username: `quickprep_user`
4. Set password: `generate` (copy the generated one)
5. Click **"Add User"**
6. Replace `<password>` in connection string with this password
7. Also replace `<username>` with `quickprep_user`

Final connection string should look like:
```
mongodb+srv://quickprep_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/quickprep?retryWrites=true&w=majority&appName=Cluster0
```

### Step 5: Add to Vercel
1. Go to: https://vercel.com/dashboard
2. Click **quickrep** project
3. Settings → **Environment Variables**
4. Add new variable:
   - Name: `DATABASE_URL`
   - Value: `mongodb+srv://quickprep_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/quickprep?retryWrites=true&w=majority&appName=Cluster0`
5. Click **"Save"**

### Step 6: Redeploy
```bash
cd c:\Users\Rakesh S\Downloads\quickprep
vc deploy --prod
```

---

## ⚠️ Important Notes

### IP Whitelist
MongoDB blocks all IPs by default. You need to whitelist Vercel:

1. In MongoDB Atlas, go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Add Current IP"** to add your computer (for local testing)
4. Also click **"Allow Access from Anywhere"** for Vercel (temporarily, or use specific IPs)
5. Click **"Confirm"**

### Vercel IP Whitelist (Advanced)
For security, add only Vercel's IP range:
- Use Vercel's documented IP ranges or
- Use MongoDB's "Whitelist All" temporarily while testing

### Database Name
In the connection string, replace `test` with `quickprep`:
```
mongodb+srv://user:pass@cluster.mongodb.net/quickprep
```

---

## 🧪 Test Your Connection

### Local Test
1. Update `.env.local` with your MongoDB connection string
2. Run: `npm run dev`
3. Go to: http://localhost:3000/register
4. Try signing up
5. Check MongoDB Atlas > Browse Collections to see if user was created

### Production Test
1. After redeploy, go to: https://quickrep.vercel.app/register
2. Try signing up
3. Check MongoDB for the new user

---

## 📊 MongoDB Free Tier Limits

- **Storage**: 512 MB
- **Connections**: 100
- **Database Users**: Unlimited
- **Collections**: Unlimited
- **Cost**: FREE forever (with limits)

Perfect for MVP/testing!

---

## 🆘 Troubleshooting

### "Connection refused"
- [ ] Check MongoDB cluster is running
- [ ] Verify connection string is correct
- [ ] Check IP whitelist allows your IP
- [ ] Check password is correct

### "Authentication failed"
- [ ] Verify username and password in connection string
- [ ] Check you used `DATABASE_URL`, not other variable name
- [ ] Regenerate password if forgotten

### "Timeout"
- [ ] Check internet connection
- [ ] Verify IP is whitelisted
- [ ] Try from different network
- [ ] Check MongoDB status page

### Still failing?
1. Copy exact connection string from MongoDB
2. Test in `.env.local` locally first
3. Only then add to Vercel
4. Check Vercel deployment logs

---

## 📚 Resources

- [MongoDB Atlas Docs](https://docs.mongodb.com/atlas/)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)

---

**Once set up, your sign-up will work! 🎉**
