<script>
  import { authorizeUser } from '../stores/auth.js';
</script>

<div class="mt-14 min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-cover bg-center bg-no-repeat"
     style="background-image: url('/images/saxman.jpg');">
  <div class="bg-black/30 rounded-2xl p-10 text-center text-white max-w-xl mx-4">
    <h1 class="text-4xl font-bold mb-4">Sort Your Music</h1>
    <p class="text-lg mb-6 opacity-90">
      Sort your Spotify playlists by any of a wide range of musical attributes
      such as tempo, loudness, valence, energy, danceability, popularity and more.
      Now with <b>Filters</b>!
    </p>
    <p class="mb-6 opacity-80">Login with your Spotify account to get started</p>
    <button
      onclick={authorizeUser}
      class="px-8 py-3 text-lg font-semibold bg-[#1DB954] text-white rounded-full hover:bg-[#1ed760] cursor-pointer"
    >
      Login with Spotify
    </button>
  </div>
</div>
