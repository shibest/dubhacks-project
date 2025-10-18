# Spotify OAuth Debug Checklist

## Current Configuration
- **Client ID**: `b7157ce528ea4f44853a0f08dbc87170`
- **Redirect URI**: `http://127.0.0.1:5173/spotify/callback`

## Step-by-Step Debugging

### 1. Verify Spotify Dashboard Settings

Go to: https://developer.spotify.com/dashboard

**Check:**
- [ ] You're logged into the account that owns Client ID `b7157ce528ea4f44853a0f08dbc87170`
- [ ] App exists with this Client ID
- [ ] In "Edit Settings" → "Redirect URIs" section
- [ ] **Exact match**: `http://127.0.0.1:5173/spotify/callback` is listed
- [ ] No typos (check for spaces, extra slashes, https vs http)
- [ ] Clicked "SAVE" at the bottom (not just "Add")

### 2. Verify Environment Variables

Check your `.env` file has:
```
SPOTIFY_CLIENT_ID="b7157ce528ea4f44853a0f08dbc87170"
SPOTIFY_CLIENT_SECRET="ecf465189914496bbbf1ab692813fb83"
VITE_SPOTIFY_CLIENT_ID="b7157ce528ea4f44853a0f08dbc87170"
```

### 3. Restart Everything

After changing `.env` or Spotify Dashboard settings:
```bash
# Stop current server (Ctrl+C)
npm start
```

### 4. Test the OAuth URL

**Manual Test:**

Open browser console (F12) and run:
```javascript
console.log(import.meta.env.VITE_SPOTIFY_CLIENT_ID)
```

Should output: `b7157ce528ea4f44853a0f08dbc87170`

**Check the OAuth URL:**

When you click "Connect Spotify", check the URL you're redirected to. It should be:
```
https://accounts.spotify.com/authorize?client_id=b7157ce528ea4f44853a0f08dbc87170&response_type=code&redirect_uri=http://127.0.0.1:5173/spotify/callback&scope=...
```

Copy this URL and check:
- `client_id` matches your Client ID
- `redirect_uri` is EXACTLY `http://127.0.0.1:5173/spotify/callback`

### 5. Common Issues

#### Issue: "INVALID_CLIENT: Invalid redirect URI"
**Solution:**
- Redirect URI in Dashboard must EXACTLY match `http://127.0.0.1:5173/spotify/callback`
- No trailing slash
- Must be `http://` not `https://`
- Must be `127.0.0.1` not `localhost`
- Port must be `5173`

#### Issue: "INVALID_CLIENT: Invalid client"
**Solution:**
- Client ID is wrong or doesn't exist
- Check you copied the correct Client ID from Dashboard
- Make sure VITE_SPOTIFY_CLIENT_ID in `.env` matches Dashboard

#### Issue: Environment variable is undefined
**Solution:**
- Restart the dev server after changing `.env`
- Make sure variable starts with `VITE_` for frontend

### 6. Access Points

You MUST use `127.0.0.1` (not `localhost`) for Spotify:
- ✅ `http://127.0.0.1:5173/spotify/profile`
- ❌ `http://localhost:5173/spotify/profile` (won't match redirect URI)

### 7. Check Browser Console

When you click "Connect Spotify", open browser DevTools (F12) → Console tab

Look for any errors or the OAuth URL being generated.

### 8. Test Backend Connection

Open browser console and test:
```javascript
fetch('http://127.0.0.1:5000/api/spotify/auth/token', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({code: 'test'})
}).then(r => r.json()).then(console.log)
```

Should NOT show CORS errors.

### 9. If Still Not Working

**Verify the exact redirect URI in Spotify Dashboard:**

The redirect URI in Spotify Dashboard is case-sensitive and must be EXACT:
```
http://127.0.0.1:5173/spotify/callback
```

**NOT:**
- ~~http://localhost:5173/spotify/callback~~
- ~~http://127.0.0.1:5173/spotify/callback/~~ (trailing slash)
- ~~https://127.0.0.1:5173/spotify/callback~~ (https)
- ~~http://127.0.0.1:5173/Spotify/callback~~ (capital S)

### 10. Screenshot Your Settings

If still having issues, take a screenshot of:
1. Spotify Dashboard → Your App → Settings → Redirect URIs section
2. Browser console showing the error
3. The OAuth URL you're being redirected to

This will help debug the exact issue.
