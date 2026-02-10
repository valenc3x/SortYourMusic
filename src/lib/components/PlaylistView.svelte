<script>
  import { onMount } from 'svelte';
  import { sortedTracks } from '../stores/playlist.js';
  import { selectedTrackId, infoMessage } from '../stores/ui.js';
  import { loadPlaylist } from '../api/loadPlaylist.js';
  import { searchItunesPreview } from '../api/itunes.js';
  import ProgressBar from './ProgressBar.svelte';
  import InfoBar from './InfoBar.svelte';
  import SortableTable from './SortableTable.svelte';
  import BpmFilter from './BpmFilter.svelte';
  import SaveButton from './SaveButton.svelte';
  import HelpPanel from './HelpPanel.svelte';

  let { playlist, onBack } = $props();
  let loading = $state(true);
  let audioEl = $state(null);

  onMount(async () => {
    await loadPlaylist(playlist);
    loading = false;
  });

  function handleTrackClick(track) {
    if ($selectedTrackId === track.id) {
      stopAudio();
      selectedTrackId.set(null);
      infoMessage.set('');
    } else {
      selectedTrackId.set(track.id);
      playTrack(track);
    }
  }

  function stopAudio() {
    if (audioEl) {
      audioEl.pause();
      audioEl.removeAttribute('src');
      audioEl.load();
    }
  }

  async function playTrack(track) {
    stopAudio();
    infoMessage.set('Searching for preview...');

    try {
      const previewUrl = await searchItunesPreview(track.name, track.artists[0].name, track.duration_ms);
      if (previewUrl) {
        infoMessage.set('Playing preview...');
        audioEl.src = previewUrl;
        audioEl.play().catch(() => infoMessage.set('Could not play preview'));
      } else {
        infoMessage.set('No preview available for this track');
      }
    } catch {
      infoMessage.set('No preview available for this track');
    }
  }
</script>

<ProgressBar />
<InfoBar />
<audio bind:this={audioEl}></audio>

<div class="mt-14 p-4 max-w-7xl mx-auto text-white">
  <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
    <div class="flex items-center gap-3">
      <button
        onclick={onBack}
        class="px-4 py-2 text-sm bg-[#1DB954] text-white rounded hover:bg-[#1ed760] cursor-pointer"
      >back</button>
      <HelpPanel />
    </div>
    <h2 class="text-xl font-bold">
      <a href={playlist.uri} class="hover:underline">{playlist.name}</a>
    </h2>
    <div>
      {#if !loading}
        <SaveButton />
      {/if}
    </div>
  </div>

  {#if loading}
    <div class="text-center py-12">
      <img src="/images/ajaxSpinner.gif" alt="Loading" class="w-16 mx-auto mb-4">
    </div>
  {:else}
    <BpmFilter />
    <SortableTable onTrackClick={handleTrackClick} />
  {/if}
</div>
