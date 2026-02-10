<script>
  import { columns, sortColumn, sortDirection, sortedTracks } from '../stores/playlist.js';
  import { selectedTrackId } from '../stores/ui.js';
  import SortableHeader from './SortableHeader.svelte';
  import TrackRow from './TrackRow.svelte';

  let { onTrackClick } = $props();

  function handleHeaderClick(index) {
    if ($sortColumn === index) {
      sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      sortColumn.set(index);
      sortDirection.set('asc');
    }
  }

  function handleTrackClick(track) {
    if (onTrackClick) onTrackClick(track);
  }
</script>

<div class="overflow-x-auto bg-gray-800 rounded-lg">
  <table class="w-full text-left text-white">
    <thead>
      <tr class="border-b border-gray-600">
        {#each columns as column, i}
          <SortableHeader
            {column}
            index={i}
            sortColumn={$sortColumn}
            sortDirection={$sortDirection}
            onclick={handleHeaderClick}
          />
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each $sortedTracks as track (track.id || track.which)}
        <TrackRow
          {track}
          isSelected={$selectedTrackId === track.id}
          onclick={handleTrackClick}
        />
      {/each}
    </tbody>
  </table>
</div>
