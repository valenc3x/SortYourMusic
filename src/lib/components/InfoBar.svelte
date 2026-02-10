<script>
  import { infoMessage } from '../stores/ui.js';
</script>

{#if $infoMessage}
  <div class="fixed top-14 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2.5 text-center font-bold shadow-md">
    {$infoMessage}
  </div>
{/if}
