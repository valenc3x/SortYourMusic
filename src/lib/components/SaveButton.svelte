<script>
  import { get } from 'svelte/store';
  import { currentPlaylist, sortColumn, sortDirection, bpmMin, bpmMax, includeDoubleBpm, savedState, sortedTracks, columns } from '../stores/playlist.js';
  import { currentUserId } from '../stores/playlist.js';
  import { infoMessage } from '../stores/ui.js';
  import { createPlaylist, saveTidsToPlaylist } from '../api/spotify.js';

  let saving = $state(false);
  let dropdownOpen = $state(false);

  function getCurSortName() {
    const colIdx = get(sortColumn);
    const dir = get(sortDirection);
    const col = columns[colIdx];
    if (!col) return '';
    const cname = col.label.toLowerCase();
    if (cname === 'rnd' || cname === 'a.sep') return col.label;
    const prefix = dir === 'asc' ? 'increasing ' : 'decreasing ';
    return prefix + col.label;
  }

  function isSavable() {
    const saved = get(savedState);
    if (!saved) return false;
    const current = {
      order: [get(sortColumn), get(sortDirection)],
      minBpm: get(bpmMin),
      maxBpm: get(bpmMax),
      includeDouble: get(includeDoubleBpm),
    };
    return JSON.stringify(saved) !== JSON.stringify(current);
  }

  let savable = $derived(isSavable());

  // Resubscribe to changes
  $effect(() => {
    // Access reactive stores to trigger re-evaluation
    $sortColumn; $sortDirection; $bpmMin; $bpmMax; $includeDoubleBpm; $savedState;
  });

  async function handleSave(createNew) {
    dropdownOpen = false;
    const playlist = get(currentPlaylist);
    const tracks = get(sortedTracks);
    const uris = tracks
      .filter(t => t.uri?.startsWith('spotify:track:'))
      .map(t => t.uri);

    if (uris.length === 0) {
      infoMessage.set('Cannot save: no tracks left after filtering');
      return;
    }

    saving = true;
    infoMessage.set(createNew ? 'Saving new playlist...' : 'Overwriting playlist...');

    try {
      let targetPlaylist;
      if (createNew) {
        const sortName = getCurSortName();
        const userId = get(currentUserId);
        targetPlaylist = await createPlaylist(userId, playlist.name + ' ordered by ' + sortName, playlist.public);
      } else {
        targetPlaylist = playlist;
      }

      await saveTidsToPlaylist(targetPlaylist.id, uris, true);

      // Update saved state
      savedState.set({
        order: [get(sortColumn), get(sortDirection)],
        minBpm: get(bpmMin),
        maxBpm: get(bpmMax),
        includeDouble: get(includeDoubleBpm),
      });

      infoMessage.set('');
    } catch (err) {
      infoMessage.set('Error saving playlist: ' + err.message);
    } finally {
      saving = false;
    }
  }
</script>

<div class="relative inline-flex">
  <button
    onclick={() => handleSave(true)}
    disabled={!savable || saving}
    class="px-4 py-2 text-sm bg-[#1DB954] text-white rounded-l hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
  >
    {#if saving}
      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
    Save New Playlist
  </button>
  <button
    onclick={() => dropdownOpen = !dropdownOpen}
    disabled={!savable || saving}
    aria-label="Save options"
    class="px-2 py-2 text-sm bg-[#1DB954] text-white rounded-r border-l border-[#18a449] hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
  >
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </button>

  {#if dropdownOpen}
    <div class="absolute top-full right-0 mt-1 bg-gray-800 rounded shadow-lg z-10 min-w-[180px]">
      <button
        onclick={() => handleSave(true)}
        class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
      >Save New Playlist</button>
      <button
        onclick={() => handleSave(false)}
        class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
      >Overwrite Playlist</button>
    </div>
  {/if}
</div>
