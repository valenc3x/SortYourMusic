<script>
  let { column, index, sortColumn, sortDirection, onclick } = $props();

  let isActive = $derived(sortColumn === index);
</script>

<th
  class="px-2 py-2 text-xs font-semibold uppercase text-gray-400 cursor-pointer select-none whitespace-nowrap hover:text-white"
  title={column.title}
  onclick={() => onclick(index)}
>
  {column.label}
  {#if isActive}
    <span class="ml-0.5 text-[#1DB954]">{sortDirection === 'asc' ? '\u25B2' : '\u25BC'}</span>
  {/if}
</th>
