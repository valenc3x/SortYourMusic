# SortYourMusic

A client-side web app that sorts Spotify playlists by audio features (tempo, energy, danceability, etc.).

## Project Structure

```
web/
├── index.html          # Main HTML page
├── config.js           # Spotify credentials (not committed)
├── js/
│   ├── auth.js         # PKCE authentication flow
│   ├── api.js          # Spotify and ReccoBeats API calls
│   ├── ui.js           # UI utilities, table, state management
│   ├── playlist.js     # Playlist loading, saving, display
│   └── app.js          # Global variables and initialization
├── lib/                # Third-party libraries (jQuery, Bootstrap, etc.)
├── styles.css          # Custom styles
└── images/             # Static assets
```

## Running Locally

```bash
cd web
python3 -m http.server 8000 --bind 127.0.0.1
```

Access at: http://127.0.0.1:8000/

**Important**: Must use `127.0.0.1`, not `localhost` - Spotify requires explicit IP in redirect URIs.

## Setup Requirements

1. Create a Spotify Developer App at https://developer.spotify.com/dashboard
2. Set redirect URI to `http://127.0.0.1:8000/`
3. Add your email to User Management (app is in dev mode)
4. Copy your Client ID to `web/config.js`:
   ```javascript
   var SPOTIFY_CLIENT_ID = 'your-client-id-here';
   var SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:8000/';
   ```

## Key Technical Details

- **Authentication**: Uses PKCE (Proof Key for Code Exchange) flow - Spotify deprecated implicit grant for new apps
- **Audio Features**: Uses ReccoBeats API (https://api.reccobeats.com) instead of Spotify's restricted `/v1/audio-features` endpoint
- **Batching**: ReccoBeats calls are batched (20 tracks per request) to avoid URL length limits
- **Audio Previews**: Uses iTunes Search API for 30-second previews (Spotify previews unavailable in dev mode)

## Dependencies

- jQuery 1.11.1
- Bootstrap 3.x
- DataTables 1.13.1
- Underscore.js
- Q.js (Promises)

## Config File

`web/config.js` contains Spotify credentials and is NOT committed to git. Example:
```javascript
"use strict";
var SPOTIFY_CLIENT_ID = 'your-client-id';
var SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:8000/';
```
