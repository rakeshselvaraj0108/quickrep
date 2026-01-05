# Authentication Login Troubleshooting Guide

## 🔴 Error: "An error occurred during login. Please try again"

This generic error message means something failed on the server side. Let's diagnose it:

---

## 📋 Step 1: Check Server Logs

When you try to login, look for messages like:
```
🔑 Login attempt: { email: 'your-email@example.com' }
```

Depending on what follows, you'll see ONE of these:

### **Case A: "User not found"**
```
❌ User not found: your-email@example.com
```
**Problem**: User account doesn't exist in database
**Solution**: 
1. Register again at `/register`
2. Make sure registration showed "✅ User created successfully"
3. Try with a DIFFERENT email

---

### **Case B: "Invalid password"**
```
👤 User found: user_id
❌ Invalid password for: your-email@example.com
```
**Problem**: Password doesn't match
**Solution**:
1. Check CAPS LOCK is off
2. Make sure you're typing the EXACT password you registered with
3. Try resetting password via `/forgot-password`

---

### **Case C: MongoDB Connection Error**
```
❌ Login error: MongoNetworkError
```
**Problem**: Cannot connect to database
**Solution**:
1. Check your `MONGODB_URI` in `.env.local`
2. Verify MongoDB Atlas credentials are correct
3. Add your IP to whitelist in MongoDB Atlas:
   - https://cloud.mongodb.com/v2
   - Security → Network Access
   - Add your current IP

---

### **Case D: Schema/Model Error**
```
❌ Login error: user.comparePassword is not a function
```
**Problem**: User model doesn't have password comparison method
**Solution**: Restart the server (npm run dev)

---

## 🧪 Quick Diagnostic Test

Run this PowerShell command in a NEW terminal (keep your dev server running):

```powershell
# Test 1: Register a new user
$register = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body @{
    name = "Test User"
    email = "testuser_$(Get-Random)@example.com"
    password = "Password123"
    confirmPassword = "Password123"
  } | ConvertFrom-Json

if ($register.success) {
  Write-Host "✅ Registration successful" -ForegroundColor Green
  $testEmail = $register.user.email
  Write-Host "📧 Test email: $testEmail"
  
  # Test 2: Try to login with same email
  Start-Sleep -Seconds 1
  $login = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body @{
      email = $testEmail
      password = "Password123"
    } | ConvertFrom-Json
  
  if ($login.success) {
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "🎫 Token: $($login.token.Substring(0,20))..." -ForegroundColor Green
  } else {
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host "Error: $($login.error)" -ForegroundColor Red
  }
} else {
  Write-Host "❌ Registration failed" -ForegroundColor Red
  Write-Host "Error: $($register.error)" -ForegroundColor Red
}
```

**What to do**:
1. Open a NEW PowerShell terminal (don't close the dev server)
2. Copy-paste the above command
3. Press Enter
4. **Tell me what output you see**

---

## 🔧 Common Fixes

### Fix 1: Clear Browser Cache
```
Press Ctrl + Shift + Delete
Clear: Cookies and Cached Images/Files
Retry login
```

### Fix 2: Restart Server
```powershell
# In your dev server terminal, press Ctrl+C
# Then run:
npm run dev
```

### Fix 3: Check Environment Variables
Verify your `.env.local` has:
```env
MONGODB_URI=mongodb+srv://testuser:testpass123@cluster0.mongodb.net/quickprep?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-2024
```

### Fix 4: Verify Database Connection
```javascript
// Run in Node console:
const mongoose = require('mongoose');
mongoose.connect('your-MONGODB_URI-here').then(() => {
  console.log('✅ Connected!');
}).catch(err => {
  console.log('❌ Error:', err.message);
});
```

---

## 📱 Browser Console Check

1. Open DevTools: **F12**
2. Go to **Console** tab
3. Try logging in
4. Look for red errors
5. **Share any errors you see**

---

## 🆘 If Still Not Working

Please provide:
1. ✅ Server log output when you try to login
2. ✅ Your `.env.local` file (without passwords)
3. ✅ Browser console errors (F12 → Console)
4. ✅ Did registration work? (What email did you use?)
5. ✅ Are you using the SAME email for registration and login?

---

## ✅ Success Checklist

- [ ] Registration shows "Account created successfully"
- [ ] Login shows "🔑 Login attempt" in server logs
- [ ] Login shows "👤 User found" in server logs
- [ ] Login shows "✅ Password validated" in server logs
- [ ] Login shows "🎫 Token generated" in server logs
- [ ] Browser redirects to `/dashboard`
- [ ] Dashboard shows your user info

---

## 🚀 Next: Test Password Reset

Once login works, test the full flow:
1. Go to `/forgot-password`
2. Enter your email
3. Check your Gmail inbox for reset link
4. Click link and set new password
5. Login with new password

---

**Status**: Ready for testing  
**Last Updated**: January 2, 2026
