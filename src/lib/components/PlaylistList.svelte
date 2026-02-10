<script>
  import PlaylistRow from './PlaylistRow.svelte';

  let { playlists, currentUserId, onSelectPlaylist, loading } = $props();
</script>

<div class="mt-14 p-6 max-w-5xl mx-auto">
  {#if loading}
    <div class="text-center py-12">
      <img src="/images/ajaxSpinner.gif" alt="Loading" class="w-16 mx-auto mb-4">
    </div>
  {:else}
    <h2 class="text-2xl font-bold text-white mb-4">Pick a playlist:</h2>
    <div class="bg-gray-800 rounded-lg overflow-hidden">
      <table class="w-full text-left text-white">
        <thead>
          <tr class="border-b border-gray-600 text-gray-400 text-sm uppercase">
            <th class="p-2 w-16">Cover</th>
            <th class="p-2">Name</th>
            <th class="p-2">Tracks</th>
            <th class="p-2">Owner</th>
          </tr>
        </thead>
        <tbody>
          {#each playlists as playlist (playlist.id)}
            <PlaylistRow {playlist} {currentUserId} onclick={onSelectPlaylist} />
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
