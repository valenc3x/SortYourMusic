<script>
  import { progressState } from '../stores/ui.js';

  let percent = $derived(
    $progressState.total > 0
      ? Math.round(($progressState.current / $progressState.total) * 100)
      : 0
  );
</script>

{#if $progressState.visible}
  <div class="fixed top-14 left-0 right-0 z-40 bg-white px-5 py-3 shadow-md">
    <p class="text-center font-bold text-gray-800 text-sm mb-1">{$progressState.text}</p>
    <div class="max-w-xl mx-auto bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        class="bg-[#1DB954] h-full transition-all duration-300 rounded-full"
        style="width: {percent}%"
      ></div>
    </div>
  </div>
{/if}
