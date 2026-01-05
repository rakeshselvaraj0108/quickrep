# 🤖 Why Study Buddy Shows Fallback Response

## What You're Seeing

```
Fallback summary for "You are an expert professor creating DETAILED study summaries 
for university students. Analyze these...

UI works perfectly!
Real Gemini will replace this once API key is fixed.
Check server logs (terminal) for exact error.
💡 Next: Fix GEMINI_API_KEY in .env.local
```

This happens when **the Gemini API call fails**.

---

## ✅ Your Setup Is Correct

Your `.env.local` has:
```
GEMINI_API_KEY=AIzaSyDtHY7D6qPZNn5N_7tgFDP_n0kh5lK_cf0 ✅ FORMAT CORRECT (starts with AIzaSy)
GEMINI_MODEL=models/gemini-2.5-flash ✅ VALID MODEL
```

---

## 🔍 Common Reasons for Fallback

### 1. **API Key Validity Issue** (Most Common)
The key exists but might be:
- **Expired** - Google rotates keys periodically
- **Revoked** - Deleted from your Google Cloud Console
- **Rate limited** - Hit quota for free tier
- **API not enabled** - Gemini API not activated in Google Cloud

**Fix:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the new key
4. Update `.env.local`:
   ```
   GEMINI_API_KEY=AIzaSy... (paste new key)
   ```
5. Restart dev server: `npm run dev`

### 2. **Network/Connectivity Issue**
- Firewall blocking API calls
- Proxy interference
- No internet connection

**Fix:**
```bash
# Test connectivity
node test-gemini-api.js
```

### 3. **Model Not Available**
Using a model that's not accessible in your region

**Fix:**
Try alternative models:
```
GEMINI_MODEL=models/gemini-1.5-flash-latest
GEMINI_MODEL=models/gemini-pro
```

### 4. **Timeout Issue**
API takes too long to respond

**Fix:**
Increase timeout in `src/app/api/studybuddy/route.ts`:
```typescript
// Change from 15000ms to 30000ms
signal: AbortSignal.timeout(30000)
```

---

## 🐛 Debugging Steps

### Step 1: Check Server Logs
Look at your terminal running `npm run dev`:

```
📚 Study Buddy API Request: { type: 'response', ... }
💬 Generated prompt for type: response
❌ Study Buddy API Error: Invalid API key
```

### Step 2: Test API Directly
```bash
# Run test script
node test-gemini-api.js
```

Expected output:
```
✅ SUCCESS! Gemini Response:
"Hello! I'm here to help you learn..."
🎉 Gemini API is working correctly!
```

If you see error like:
```
❌ API ERROR:
{
  "error": {
    "code": 401,
    "message": "API key not valid",
    "status": "UNAUTHENTICATED"
  }
}
```

→ **Your API key is invalid. Get a new one!**

### Step 3: Verify in Browser Console
1. Open DevTools (F12)
2. Go to Network tab
3. Send message in Study Buddy
4. Look for `/api/studybuddy` request
5. Check response in "Preview" tab

---

## 📋 Solution Checklist

- [ ] Go to https://aistudio.google.com/app/apikey
- [ ] Create new API key (if old one expired)
- [ ] Copy the full key starting with `AIzaSy`
- [ ] Open `.env.local` in root folder
- [ ] Replace `GEMINI_API_KEY` value with new key
- [ ] Save file
- [ ] Restart dev server: Stop and run `npm run dev` again
- [ ] Test by sending message to Study Buddy
- [ ] Check server terminal for success message:
  ```
  ✅ Received message from Gemini, length: 256
  ```

---

## 🧪 Testing the Fix

### Test 1: Run Node Test Script
```bash
cd quickprep
node test-gemini-api.js
```

Should show:
```
✅ SUCCESS! Gemini Response:
"Hello! I'm here to help you learn..."
🎉 Gemini API is working correctly!
```

### Test 2: Send Message in App
1. Open http://localhost:3000
2. Find Study Buddy component
3. Send a test message
4. Should get **real AI response** instead of fallback

### Test 3: Check Health Endpoint
```bash
curl -X POST http://localhost:3000/api/studybuddy \
  -H "Content-Type: application/json" \
  -d '{"type":"health_check"}'
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "message": "AI Study Buddy backend is connected and ready!",
  "version": "2.0"
}
```

---

## 🔐 Getting a Valid Gemini API Key

### Method 1: Google AI Studio (Recommended for Development)

1. **Visit**: https://aistudio.google.com/
2. **Click**: "Get API Key" button
3. **Choose**: "Create API key in new Google Cloud project"
4. **Copy**: The key starts with `AIzaSy`
5. **Update**: `.env.local` with new key
6. **Restart**: Dev server

⚠️ **Free tier limits**: 
- 60 requests/minute
- 15,000 requests/month
- No production use

### Method 2: Google Cloud Console (For Production)

1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Generative Language API
4. Create API key
5. Use in `.env.local`

---

## 📊 Expected Behavior

### When API Key is Invalid:
```
API Request → Gemini API Rejects → Fallback Response
"UI works perfectly! Real Gemini will replace this..."
```

### When API Key is Valid:
```
API Request → Gemini Processes → Real AI Response
"Here's how photosynthesis works: Plants convert sunlight..."
```

---

## 🆘 Still Not Working?

### Check These:

1. **Key Format**
   ```powershell
   $key = "YOUR_KEY_HERE"
   if ($key.StartsWith("AIzaSy")) { 
       Write-Host "✅ Format OK" 
   } else { 
       Write-Host "❌ Invalid Format" 
   }
   ```

2. **Server Logs**
   - Look for `❌ Study Buddy API Error:` messages
   - Note the error message exactly
   - Could be: API key, quota, timeout, or network

3. **Network Access**
   - Can you access https://aistudio.google.com/ from browser?
   - Is firewall blocking `generativelanguage.googleapis.com`?

4. **Node Version**
   ```bash
   node --version  # Should be 16+ for fetch API
   ```

---

## 🚀 Quick Fix Summary

```bash
# 1. Get new API key from https://aistudio.google.com/app/apikey
# 2. Update .env.local with new key
# 3. Restart server
npm run dev
# 4. Test
node test-gemini-api.js
```

That's it! The fallback will be replaced with real AI responses.

---

**Last Updated**: January 3, 2026  
**Status**: Ready to Debug  
**Support**: Check server logs for exact error message
