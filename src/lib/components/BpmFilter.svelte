<script>
  import { bpmMin, bpmMax, includeDoubleBpm } from '../stores/playlist.js';

  function handleMinChange(e) {
    bpmMin.set(parseInt(e.target.value, 10));
  }

  function handleMaxChange(e) {
    bpmMax.set(parseInt(e.target.value, 10));
  }

  function handleDoubleChange(e) {
    includeDoubleBpm.set(e.target.checked);
  }
</script>

<div class="flex flex-wrap items-center gap-4 bg-gray-800 rounded-lg p-3 mb-4">
  <div class="flex items-center gap-2">
    <label for="min-bpm" class="text-sm text-gray-400">BPM Min:</label>
    <input
      id="min-bpm"
      type="number"
      placeholder="0"
      class="w-20 px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-[#1DB954] focus:outline-none"
      oninput={handleMinChange}
    >
  </div>
  <div class="flex items-center gap-2">
    <label for="max-bpm" class="text-sm text-gray-400">Max:</label>
    <input
      id="max-bpm"
      type="number"
      placeholder="1000"
      class="w-20 px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-[#1DB954] focus:outline-none"
      oninput={handleMaxChange}
    >
  </div>
  <div class="flex items-center gap-2">
    <label for="include-double" class="text-sm text-gray-400">Include doubled BPM</label>
    <input
      id="include-double"
      type="checkbox"
      checked={$includeDoubleBpm}
      onchange={handleDoubleChange}
      class="accent-[#1DB954]"
    >
  </div>
</div>
