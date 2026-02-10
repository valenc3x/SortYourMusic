<script>
  let { playlist, currentUserId, onclick } = $props();

  function getTinyImage(pl) {
    if (pl.images && pl.images.length > 0) {
      return pl.images[pl.images.length - 1].url;
    }
    return null;
  }

  function formatOwner(owner) {
    if (owner.id === currentUserId) return '';
    return owner.id;
  }

  let imageUrl = $derived(getTinyImage(playlist));
  let ownerText = $derived(formatOwner(playlist.owner));
</script>

<tr
  class="hover:bg-gray-700 cursor-pointer border-b border-gray-700"
  onclick={() => onclick(playlist)}
>
  <td class="p-2 w-16">
    {#if imageUrl}
      <img src={imageUrl} alt="" class="w-12 h-12 rounded">
    {:else}
      <div class="w-12 h-12 rounded bg-gray-600"></div>
    {/if}
  </td>
  <td class="p-2 text-[#1DB954] hover:text-[#1ed760] font-medium">{playlist.name}</td>
  <td class="p-2 text-gray-400">{playlist.tracks.total}</td>
  <td class="p-2 text-gray-500">{ownerText}</td>
</tr>
