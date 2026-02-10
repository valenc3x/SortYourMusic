# Sort Your Music

Sort your Spotify playlists by audio features like tempo, energy, danceability, and more.

> **Fork of**: [sortyourmusic.playlistmachinery.com](http://sortyourmusic.playlistmachinery.com/) by [@plamere](https://twitter.com/plamere)

> **Note**: This app requires a Spotify Developer App in dev mode. Clone the repo and set up your own credentials to run it locally or deploy it yourself.

## Features

- Sort playlists by BPM, energy, danceability, loudness, valence, acousticness, popularity, and more
- Filter tracks by BPM range (with doubled-BPM toggle)
- Artist separation sorting to spread out repeated artists
- Preview tracks with 30-second audio clips via iTunes
- Save reordered playlists back to Spotify or create new ones
- Random shuffle via the Rnd column

## Tech Stack

- **Frontend**: Svelte 5 + Vite 6 + Tailwind CSS v4
- **Server**: Express (serves built app + `/config` endpoint)
- **Deployment**: Railway
- **APIs**: Spotify Web API, ReccoBeats (audio features), iTunes Search (previews)

## Running Locally

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173/ in your browser.

### Setup

1. Create a Spotify Developer App at https://developer.spotify.com/dashboard
2. Add `http://127.0.0.1:5173/` as a redirect URI
3. Add your email to User Management (app is in dev mode)
4. Create a `.env` file:
   ```
   VITE_SPOTIFY_CLIENT_ID=your-client-id
   VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/
   ```

## Production

```bash
npm run build
SPOTIFY_CLIENT_ID=xxx SPOTIFY_REDIRECT_URI=https://your-domain/ node server/index.js
```

In production, the Express server exposes a `/config` endpoint that provides credentials to the client at runtime (no secrets baked into the bundle).

## Deploying to Railway

1. Push to GitHub and connect your repo in Railway
2. Set env vars: `SPOTIFY_CLIENT_ID`, `SPOTIFY_REDIRECT_URI`
3. Add your Railway domain as a redirect URI in the Spotify dashboard
4. Railway auto-detects the build and start commands from `railway.toml`

## License

MIT
