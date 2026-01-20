# Sort Your Music

A client-side web app that lets you sort your Spotify playlists by audio features like tempo, energy, danceability, and more.

> **Original project**: [sortyourmusic.playlistmachinery.com](http://sortyourmusic.playlistmachinery.com/)

## Features

- Sort playlists by tempo (BPM), energy, danceability, loudness, valence, acousticness, and popularity
- Filter tracks by BPM range
- Preview tracks with 30-second audio clips (via iTunes)
- Save reordered playlists back to Spotify
- Create new playlists from sorted results

## Setup

1. Create a Spotify Developer App at https://developer.spotify.com/dashboard
2. Set redirect URI to `http://127.0.0.1:8000/`
3. Add your email to User Management (app is in dev mode)
4. Create `web/config.js` with your credentials:
   ```javascript
   "use strict";
   var SPOTIFY_CLIENT_ID = 'your-client-id-here';
   var SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:8000/';
   ```

## Running Locally

```bash
cd web
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/ in your browser.

**Note**: Use `127.0.0.1`, not `localhost` - Spotify requires the exact redirect URI.

## Tech Stack

- Vanilla JavaScript with jQuery
- Bootstrap 3 for UI
- DataTables for sortable tables
- Spotify Web API for playlists
- ReccoBeats API for audio features
- iTunes Search API for audio previews

## License

MIT
