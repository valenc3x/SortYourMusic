<script>
  import { onMount } from 'svelte';
  import { accessToken, currentUser, loadConfig, restoreSession, exchangeCodeForToken, logout } from './lib/stores/auth.js';
  import { fetchCurrentUserProfile, fetchAllPlaylists } from './lib/api/spotify.js';
  import { playlists, currentPlaylist, currentUserId } from './lib/stores/playlist.js';
  import Navbar from './lib/components/Navbar.svelte';
  import LoginHero from './lib/components/LoginHero.svelte';
  import PlaylistList from './lib/components/PlaylistList.svelte';
  import PlaylistView from './lib/components/PlaylistView.svelte';

  let view = $state('loading');
  let playlistsLoading = $state(false);
  let selectedPlaylist = $state(null);

  async function loadUserPlaylists(userId) {
    playlistsLoading = true;
    view = 'playlists';
    const pls = await fetchAllPlaylists(userId);
    playlists.set(pls);
    playlistsLoading = false;
  }

  function handleSelectPlaylist(playlist) {
    selectedPlaylist = playlist;
    currentPlaylist.set(playlist);
    view = 'playlist';
  }

  function handleBack() {
    selectedPlaylist = null;
    currentPlaylist.set(null);
    view = 'playlists';
  }

  onMount(async () => {
    await loadConfig();

    let token = await restoreSession();

    if (!token) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        view = 'login';
        return;
      }

      if (code) {
        try {
          token = await exchangeCodeForToken(code);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch {
          view = 'login';
          return;
        }
      }
    }

    if (token) {
      accessToken.set(token);
      const user = await fetchCurrentUserProfile();
      if (user) {
        currentUser.set(user);
        currentUserId.set(user.id);
        await loadUserPlaylists(user.id);
      } else {
        logout();
        view = 'login';
      }
    } else {
      view = 'login';
    }
  });
</script>

<Navbar />

{#if view === 'loading'}
  <div class="mt-14 min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gray-900 text-white">
    <div class="text-center">
      <img src="/images/ajaxSpinner.gif" alt="Loading" class="w-16 mx-auto mb-4">
      <p class="text-gray-400">Loading...</p>
    </div>
  </div>
{:else if view === 'login'}
  <LoginHero />
{:else if view === 'playlists'}
  <PlaylistList
    playlists={$playlists}
    currentUserId={$currentUserId}
    onSelectPlaylist={handleSelectPlaylist}
    loading={playlistsLoading}
  />
{:else if view === 'playlist'}
  {#key selectedPlaylist?.id}
    <PlaylistView playlist={selectedPlaylist} onBack={handleBack} />
  {/key}
{/if}

<div class="text-center py-2 text-xs text-gray-500">
  Powered by <a href="https://spotify.com" class="underline hover:text-gray-300">Spotify</a>.
  Created by <a href="https://twitter.com/plamere" class="underline hover:text-gray-300">@plamere</a>
  with contributions by <a href="https://twitter.com/sonneveld" class="underline hover:text-gray-300">@sonneveld</a>,
  rivalenghost, and Claude.
</div>
