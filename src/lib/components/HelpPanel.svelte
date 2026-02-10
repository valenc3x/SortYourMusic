<script>
  let open = $state(false);
</script>

<div class="relative inline-block">
  <button
    onclick={() => open = !open}
    class="px-3 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 cursor-pointer"
    title="Song attribute help"
  >
    <svg class="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
    </svg>
  </button>

  {#if open}
    <div class="absolute top-full left-0 mt-1 bg-black/90 text-white rounded-lg p-4 z-50 shadow-lg min-w-[340px] whitespace-nowrap">
      <dl class="space-y-1 text-sm">
        <div class="flex gap-3">
          <dt class="w-20 text-right text-[#1DB954] font-semibold shrink-0">BPM</dt>
          <dd>Beats per minute &mdash; the tempo of the song</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-20 text-right text-[#1DB954] font-semibold shrink-0">Energy</dt>
          <dd>The higher the value, the more energetic the song</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-20 text-right text-[#1DB954] font-semibold shrink-0">Dance</dt>
          <dd>The higher the value, the easier it is to dance to</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-20 text-right text-[#1DB954] font-semibold shrink-0">Loud</dt>
          <dd>The loudness of the song in dB</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-20 text-right text-[#1DB954] font-semibold shrink-0">Valence</dt>
          <dd>The higher the value, the more positive the mood</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-20 text-right text-[#1DB954] font-semibold shrink-0">Length</dt>
          <dd>The duration of the song</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-20 text-right text-[#1DB954] font-semibold shrink-0">Acoustic</dt>
          <dd>The higher the value, the more acoustic the song</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-20 text-right text-[#1DB954] font-semibold shrink-0">Pop.</dt>
          <dd>The higher the value, the more popular the song</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-20 text-right text-[#1DB954] font-semibold shrink-0">A.Sep</dt>
          <dd>Maximizes artist separation in the playlist</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-20 text-right text-[#1DB954] font-semibold shrink-0">Rnd</dt>
          <dd>A random value &mdash; sort by this to shuffle</dd>
        </div>
      </dl>
    </div>
  {/if}
</div>
