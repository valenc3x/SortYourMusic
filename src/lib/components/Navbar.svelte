<script>
  import { currentUser } from '../stores/auth.js';
  import { logout } from '../stores/auth.js';

  function handleLogout(e) {
    e.preventDefault();
    logout();
    window.location.reload();
  }
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700 h-14 flex items-center px-4">
  <div class="flex items-center justify-between w-full max-w-7xl mx-auto">
    <a href="/" class="flex items-center gap-2 text-white font-bold text-lg no-underline">
      <img src="/images/favicon.png" alt="" class="w-6 h-6">
      <span>Sort Your Music</span>
    </a>

    <div class="flex items-center gap-2">
      {#if $currentUser}
        <a
          href="#logout"
          onclick={handleLogout}
          class="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 no-underline"
        >Logout</a>
      {/if}
      <a
        href="https://www.spotify.com"
        target="_blank"
        rel="noopener"
        class="px-3 py-1.5 text-sm bg-spotify-green text-white rounded hover:bg-spotify-green-light no-underline"
      >Get Spotify</a>
    </div>
  </div>
</nav>

<style>
  :global(.bg-spotify-green) { background-color: #1DB954; }
  :global(.hover\:bg-spotify-green-light:hover) { background-color: #1ed760; }
</style>
