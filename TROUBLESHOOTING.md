# Troubleshooting: "Failed to Fetch" Error

## Current Server Status ✅

Both servers are confirmed running:
- **Backend**: Port 3001 - Active and responding to API requests
- **Frontend**: Port 8080 - Vite dev server ready
- **Database**: MongoDB connected at 127.0.0.1:27017/payzenix

## Common Causes & Solutions

### 1. Stale Authentication Token (Most Likely)
**Symptoms**: "Failed to fetch" error on login or after page load

**Solution**:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage → http://localhost:8080
3. Delete the `token` entry
4. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
5. Try logging in again with:
   - Email: `hr@payzenix.com`
   - Password: `hrpassword123`

### 2. Browser Cache Issue
**Solution**:
1. Hard refresh the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache for localhost

### 3. CORS or Network Issue
**Check**:
1. Open browser DevTools → Network tab
2. Try to log in
3. Look for failed requests to `http://localhost:3001/api/auth/login`
4. Check if the request shows CORS errors or connection refused

**If you see CORS errors**: The backend needs to be restarted
**If you see connection refused**: The backend is not running

### 4. Backend Server Crashed
**Verify backend is running**:
```powershell
netstat -ano | findstr :3001
```

**Test backend API directly**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/" -Method Get
```

**If not running, restart**:
```powershell
cd server
npm run dev
```

## Quick Verification Commands

**Check both servers are running**:
```powershell
netstat -ano | findstr ":3001 :8080"
```

**Test backend API**:
```powershell
curl http://localhost:3001/
```

**Test frontend**:
```powershell
curl http://localhost:8080/
```

## Current Configuration

- **Frontend API Base URL**: `http://localhost:3001/api` ✅
- **Backend Port**: 3001 ✅
- **Frontend Port**: 8080 ✅
- **MongoDB URI**: `mongodb://127.0.0.1:27017/payzenix` ✅

All configurations are correct!
