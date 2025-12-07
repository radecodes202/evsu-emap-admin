# API Connection Fix Guide

## Current Issue: "No response from server"

This means the frontend cannot reach your backend API server.

## Quick Fixes

### 1. Check if Backend Server is Running

**Verify your backend is running:**
- Open your backend project
- Make sure the server is started (usually `npm start` or `node server.js`)
- Check the terminal - it should show something like "Server running on port 3000"

### 2. Verify API URL

The login page shows the current API URL. Check if it matches your backend:

**Current default:** `http://192.168.1.8:3000/api`

**Common alternatives:**
- If backend is on same machine: `http://localhost:3000/api`
- If backend is on different IP: Update in `src/config/api.js`
- If backend uses different port: Update the port number

### 3. Test Connection Button

I've added a "Test Connection" button on the login page. Click it to:
- Test if the server is reachable
- See detailed error messages
- Verify the API endpoint exists

### 4. Update API URL

If your backend is on a different URL, update `src/config/api.js`:

```javascript
export const API_BASE_URL = 'http://YOUR_IP:3000/api';
// Or for same machine:
export const API_BASE_URL = 'http://localhost:3000/api';
```

### 5. Check Network Connection

**If backend is on different machine (192.168.1.8):**
- Make sure both machines are on the same network
- Check if you can ping the IP: `ping 192.168.1.8`
- Verify firewall isn't blocking port 3000

**If backend is on same machine:**
- Use `http://localhost:3000/api` instead
- Or `http://127.0.0.1:3000/api`

### 6. Test Backend Directly

Open a browser or use curl to test:

```bash
# Test if backend is running
curl http://192.168.1.8:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@evsu.edu.ph","password":"password123"}'

# Or if on same machine:
curl http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@evsu.edu.ph","password":"password123"}'
```

### 7. Check CORS (if you see CORS errors)

Your backend needs to allow requests from `http://localhost:3001`. Add to your backend:

```javascript
// Express.js example
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

### 8. Check Firewall

Windows Firewall might be blocking the connection:
- Open Windows Defender Firewall
- Allow Node.js/your backend through firewall
- Or temporarily disable firewall to test

## Step-by-Step Debugging

1. **Click "Test Connection" on login page**
   - This will tell you exactly what's wrong

2. **Check browser console (F12)**
   - Look for network errors
   - Check the Network tab for failed requests

3. **Verify backend is running**
   - Check backend terminal for errors
   - Make sure it's listening on the correct port

4. **Try different API URLs:**
   - `http://localhost:3000/api` (if on same machine)
   - `http://127.0.0.1:3000/api` (alternative localhost)
   - `http://YOUR_ACTUAL_IP:3000/api` (if on network)

5. **Test with curl/Postman**
   - If curl works but frontend doesn't = CORS issue
   - If curl doesn't work = backend not running or wrong URL

## Most Common Solutions

1. **Backend not running** → Start your backend server
2. **Wrong IP address** → Update API URL in `src/config/api.js`
3. **Backend on same machine** → Use `localhost` instead of IP
4. **CORS not configured** → Add CORS middleware to backend
5. **Firewall blocking** → Allow Node.js through firewall

## Still Not Working?

1. Share the error message from "Test Connection" button
2. Check browser console (F12) and share any errors
3. Verify backend is actually running and accessible
4. Try accessing `http://YOUR_API_URL` directly in browser

