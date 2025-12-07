# Login Troubleshooting Guide

## Common Issues and Solutions

### 1. Check API URL
The login page now shows the API URL being used. Verify it matches your backend server:
- Default: `http://192.168.1.8:3000/api`
- Update in `src/config/api.js` if different

### 2. Check Browser Console
Open browser console (F12) and look for:
- **Network errors**: Check if the request is being made
- **CORS errors**: "Access-Control-Allow-Origin" errors mean CORS is not configured
- **404 errors**: API endpoint doesn't exist
- **500 errors**: Server error

### 3. Verify Backend is Running
```bash
# Test if your API is accessible
curl http://192.168.1.8:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@evsu.edu.ph","password":"password123"}'
```

### 4. Check CORS Configuration
Your backend must allow requests from `http://localhost:3001`. Add to your backend:

```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

### 5. Check Response Format
The login expects one of these response formats:

**Format 1 (with success flag):**
```json
{
  "success": true,
  "user": { "id": 1, "email": "...", "role": "admin" },
  "token": "jwt_token_here"
}
```

**Format 2 (without success flag):**
```json
{
  "user": { "id": 1, "email": "...", "role": "admin" },
  "token": "jwt_token_here"
}
```

### 6. Test Credentials
- Email: `admin@evsu.edu.ph`
- Password: `password123` (or your actual admin password)

### 7. Network Issues
- Check if you're on the same network as the API server
- Try `http://localhost:3000/api` if API is on same machine
- Check firewall settings

### 8. Check Console Logs
The app now logs detailed information:
- Login attempt with email
- Full API response
- Any errors with details

Open browser console (F12) to see these logs.

## Quick Debug Steps

1. **Open browser console** (F12 → Console tab)
2. **Try to login** with credentials
3. **Check the console** for:
   - "Attempting login with: { email: ... }"
   - "Login response: ..." (shows API response)
   - Any error messages
4. **Check Network tab** (F12 → Network tab):
   - Look for the `/auth/login` request
   - Check the request URL, status code, and response

## Common Error Messages

- **"No response from server"**: Backend is not running or URL is wrong
- **"CORS error"**: Backend needs CORS configuration
- **"401 Unauthorized"**: Wrong credentials
- **"404 Not Found"**: API endpoint doesn't exist
- **"Network error"**: Connection issue or firewall blocking

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Verify your backend API is running and accessible
3. Test the API endpoint directly with curl or Postman
4. Check if the API URL in `src/config/api.js` is correct
5. Verify CORS is configured on your backend

