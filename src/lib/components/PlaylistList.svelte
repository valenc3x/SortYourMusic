<script>
  import PlaylistRow from './PlaylistRow.svelte';

  let { playlists, currentUserId, onSelectPlaylist, loading } = $props();

  const PAGE_SIZE = 50;
  let visibleCount = $state(PAGE_SIZE);

  let visiblePlaylists = $derived(playlists.slice(0, visibleCount));
  let hasMore = $derived(visibleCount < playlists.length);
</script>

<div class="mt-14 p-6 max-w-5xl mx-auto">
  {#if loading && playlists.length === 0}
    <div class="text-center py-12">
      <img src="/images/ajaxSpinner.gif" alt="Loading" class="w-16 mx-auto mb-4">
    </div>
  {:else if playlists.length > 0}
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
          {#each visiblePlaylists as playlist (playlist.id)}
            <PlaylistRow {playlist} {currentUserId} onclick={onSelectPlaylist} />
          {/each}
        </tbody>
      </table>
    </div>
    <div class="text-center text-gray-400 text-sm py-3">
      Showing {visiblePlaylists.length} of {playlists.length} playlists{#if loading}&nbsp;(loading...){/if}
      {#if hasMore}
        <div class="mt-2 flex justify-center gap-3">
          <button
            class="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            onclick={() => visibleCount += PAGE_SIZE}
          >Show more</button>
          <button
            class="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            onclick={() => visibleCount = playlists.length}
          >Show all</button>
        </div>
      {/if}
    </div>
  {/if}
</div>
