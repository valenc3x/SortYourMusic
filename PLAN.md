# SortYourMusic v2 — Progress Tracker

## Phase 0: Scaffolding & Legacy Preservation
- [x] Rename web/ to web-legacy/
- [x] Create package.json with scripts
- [x] Install dependencies
- [x] Create vite.config.js, index.html, src/main.js, src/App.svelte, src/app.css
- [x] Copy static assets to public/images/
- [x] Create server/index.js
- [x] Create .env, .env.example, update .gitignore
- [x] Create railway.toml
- [x] Create PLAN.md

## Phase 1: Auth Flow
- [x] src/lib/utils/pkce.js
- [x] src/lib/stores/auth.js
- [x] src/lib/api/spotify.js
- [x] Navbar.svelte
- [x] LoginHero.svelte
- [x] App.svelte view switching

## Phase 2: Playlist Listing
- [x] src/lib/stores/playlist.js
- [x] fetchAllPlaylists in spotify.js
- [x] PlaylistList.svelte
- [x] PlaylistRow.svelte

## Phase 3: Track Loading + Progress
- [x] src/lib/api/reccobeats.js
- [x] src/lib/api/loadPlaylist.js (orchestration)
- [x] fetchPlaylistTracks, fetchAlbums in spotify.js
- [x] src/lib/utils/smartOrder.js
- [x] src/lib/utils/format.js
- [x] src/lib/stores/ui.js
- [x] ProgressBar.svelte, InfoBar.svelte
- [x] PlaylistView.svelte

## Phase 4: Sortable Table
- [x] SortableTable.svelte
- [x] SortableHeader.svelte
- [x] TrackRow.svelte
- [x] Sort stores + sortedTracks derived

## Phase 5: BPM Filter
- [x] BpmFilter.svelte
- [x] Filter stores + derived filtered tracks

## Phase 6: Audio Preview
- [x] src/lib/api/itunes.js
- [x] Track click play/stop
- [x] Audio element

## Phase 7: Save Playlist
- [x] createPlaylist, saveTidsToPlaylist in spotify.js
- [x] SaveButton.svelte
- [x] Save state management

## Phase 8: Help Panel + Polish
- [x] HelpPanel.svelte
- [x] Final styling (Tailwind, Spotify green theme)
- [x] Footer in App.svelte
- [x] Edge cases (tracks without audio features, local files)

## Phase 9: Deployment Prep
- [x] Finalize server/index.js (/config, /health, SPA fallback)
- [x] Finalize railway.toml
- [x] Config loading (dev vs prod)
- [x] Update CLAUDE.md
- [x] Update .gitignore
