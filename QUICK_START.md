# Quick Start Guide

## If you see a blank page:

1. **Check the browser console** (Press F12 → Console tab)
   - Look for any red error messages
   - Common issues: Missing dependencies, import errors

2. **Verify the dev server is running:**
   ```bash
   npm run dev
   ```
   - Should show: `Local: http://localhost:3001`
   - Open that URL in your browser

3. **Clear browser cache:**
   - Press Ctrl+Shift+R (hard refresh)
   - Or clear localStorage: Open Console → Application → Local Storage → Clear

4. **Check if you're logged in:**
   - If you see a blank page, try going directly to: `http://localhost:3001/login`
   - You should see the login form

5. **Common fixes:**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   
   # Restart dev server
   npm run dev
   ```

## Expected Behavior:

- **First visit (not logged in):** Should redirect to `/login` and show login form
- **After login:** Should show dashboard with sidebar navigation
- **If blank:** Check browser console for errors

## Troubleshooting:

If still blank after above steps, check:
- Node.js version (should be 16+): `node --version`
- All dependencies installed: `npm list --depth=0`
- No port conflicts (try different port in vite.config.js)

