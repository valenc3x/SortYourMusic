# SortYourMusic

A web app that sorts Spotify playlists by audio features (tempo, energy, danceability, etc.).

## Project Structure

```
SortYourMusic/
  web-legacy/              # Old vanilla JS app (preserved for reference)
  src/
    lib/
      stores/
        auth.js            # Auth state (accessToken, currentUser)
        playlist.js        # Playlist state (playlists, tracks, sort, filter)
        ui.js              # UI state (infoMessage, progress, selectedTrack)
      api/
        spotify.js         # Spotify API (fetch-based)
        reccobeats.js      # ReccoBeats API (batched audio features)
        itunes.js          # iTunes Search API (audio previews)
        loadPlaylist.js    # Playlist loading orchestration
      utils/
        pkce.js            # PKCE helpers
        format.js          # formatDuration, inRange
        smartOrder.js      # Artist separation algorithm
      components/
        Navbar.svelte
        LoginHero.svelte
        PlaylistList.svelte
        PlaylistRow.svelte
        PlaylistView.svelte
        SortableTable.svelte
        SortableHeader.svelte
        TrackRow.svelte
        BpmFilter.svelte
        SaveButton.svelte
        HelpPanel.svelte
        ProgressBar.svelte
        InfoBar.svelte
    App.svelte             # Root component with view switching
    main.js                # Vite entry point
    app.css                # Tailwind directives
  public/images/           # Static assets
  server/index.js          # Express server (prod)
  index.html               # Vite HTML entry
  vite.config.js
  package.json
  .env / .env.example
  railway.toml
```

## Running Locally

```bash
npm install
npm run dev
```

Access at: http://127.0.0.1:5173/

## Setup Requirements

1. Create a Spotify Developer App at https://developer.spotify.com/dashboard
2. Set redirect URI to `http://127.0.0.1:5173/`
3. Add your email to User Management (app is in dev mode)
4. Copy your Client ID to `.env`:
   ```
   VITE_SPOTIFY_CLIENT_ID=your-client-id-here
   VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/
   ```

## Production Build

```bash
npm run build
SPOTIFY_CLIENT_ID=xxx SPOTIFY_REDIRECT_URI=https://your-domain/ node server/index.js
```

The Express server serves the built app and exposes `/config` (returns env vars as JSON) and `/health` endpoints.

## Deployment (Railway)

Set env vars `SPOTIFY_CLIENT_ID` and `SPOTIFY_REDIRECT_URI` in Railway. The `railway.toml` handles build and start commands.

## Key Technical Details

- **Stack**: Svelte 5, Vite, Tailwind CSS v4, Express
- **Authentication**: PKCE flow with token persistence in localStorage
- **Audio Features**: ReccoBeats API (batched 20 tracks/request)
- **Audio Previews**: iTunes Search API via fetch
- **Config Injection**: Dev uses Vite `import.meta.env.VITE_*` from `.env`; production uses Express `/config` endpoint
- **No router**: 3 views (login, playlists, playlist) managed by a `view` state variable
