<script>
  import { columns, sortColumn, sortDirection, sortedTracks, tracksLoading } from '../stores/playlist.js';
  import { selectedTrackId } from '../stores/ui.js';
  import SortableHeader from './SortableHeader.svelte';
  import TrackRow from './TrackRow.svelte';

  const PAGE_SIZE = 100;

  let { onTrackClick } = $props();
  let visibleCount = $state(PAGE_SIZE);

  let visibleTracks = $derived($sortedTracks.slice(0, visibleCount));
  let totalCount = $derived($sortedTracks.length);
  let hasMore = $derived(visibleCount < totalCount);

  // Reset visible count when sort changes
  $effect(() => {
    $sortColumn;
    $sortDirection;
    visibleCount = PAGE_SIZE;
  });

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

  function showMore() {
    visibleCount += PAGE_SIZE;
  }

  function showAll() {
    visibleCount = totalCount;
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
      {#each visibleTracks as track (track.id || track.which)}
        <TrackRow
          {track}
          isSelected={$selectedTrackId === track.id}
          onclick={handleTrackClick}
        />
      {/each}
    </tbody>
  </table>

  <div class="px-4 py-3 text-sm text-gray-400 flex items-center justify-between border-t border-gray-700">
    <span>
      Showing {Math.min(visibleCount, totalCount)} of {totalCount} tracks{#if $tracksLoading} <span class="text-amber-400">(loading...)</span>{/if}
    </span>
    {#if hasMore}
      <div class="flex gap-2">
        <button
          onclick={showMore}
          class="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 cursor-pointer"
        >Show more</button>
        <button
          onclick={showAll}
          class="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 cursor-pointer"
        >Show all</button>
      </div>
    {/if}
  </div>
</div>
