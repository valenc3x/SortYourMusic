<script>
  import { formatDuration } from '../utils/format.js';

  let { track, isSelected, onclick } = $props();

  let hasFeatures = $derived(track.enInfo && 'tempo' in track.enInfo);
  let duration = $derived(track.duration_ms ? formatDuration(track.duration_ms) : '');
</script>

<tr
  class="border-b border-gray-700 hover:bg-gray-700 cursor-pointer text-sm {isSelected ? 'bg-gray-600' : ''}"
  onclick={() => onclick(track)}
>
  <td class="px-2 py-1.5 text-gray-500">{track.which + 1}</td>
  <td class="px-2 py-1.5 max-w-[200px] truncate">{track.name}</td>
  <td class="px-2 py-1.5 max-w-[150px] truncate text-gray-300">{track.artists?.[0]?.name || ''}</td>
  <td class="px-2 py-1.5 text-gray-400">{track.releaseDate || ''}</td>
  {#if hasFeatures}
    <td class="px-2 py-1.5">{Math.round(track.enInfo.tempo)}</td>
    <td class="px-2 py-1.5">{Math.round(track.enInfo.energy * 100)}</td>
    <td class="px-2 py-1.5">{Math.round(track.enInfo.danceability * 100)}</td>
    <td class="px-2 py-1.5">{Math.round(track.enInfo.loudness)}</td>
    <td class="px-2 py-1.5">{Math.round(track.enInfo.valence * 100)}</td>
  {:else}
    <td class="px-2 py-1.5"></td>
    <td class="px-2 py-1.5"></td>
    <td class="px-2 py-1.5"></td>
    <td class="px-2 py-1.5"></td>
    <td class="px-2 py-1.5"></td>
  {/if}
  <td class="px-2 py-1.5 text-gray-400">{duration}</td>
  {#if hasFeatures}
    <td class="px-2 py-1.5">{Math.round(track.enInfo.acousticness * 100)}</td>
  {:else}
    <td class="px-2 py-1.5"></td>
  {/if}
  <td class="px-2 py-1.5">{Math.round(track.popularity ?? 0)}</td>
  <td class="px-2 py-1.5">{track.smart != null ? Math.round(track.smart) : ''}</td>
  <td class="px-2 py-1.5">{track.rnd != null ? Math.round(track.rnd) : ''}</td>
</tr>
