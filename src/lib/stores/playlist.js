import { writable, derived } from 'svelte/store';

export const playlists = writable([]);
export const currentPlaylist = writable(null);
export const currentUserId = writable(null);
export const tracks = writable([]);
export const tracksLoading = writable(false);
export const albumDates = writable({});
export const sortColumn = writable(0);
export const sortDirection = writable('asc');
export const bpmMin = writable(NaN);
export const bpmMax = writable(NaN);
export const includeDoubleBpm = writable(true);
export const savedState = writable(null);

// Column definitions matching legacy order
export const columns = [
  { key: 'which', label: '#', title: 'original track order' },
  { key: 'name', label: 'Title', title: 'the title of the track' },
  { key: 'artist', label: 'Artist', title: 'the primary artist of the track' },
  { key: 'releaseDate', label: 'Release', title: 'date of release' },
  { key: 'bpm', label: 'BPM', title: 'the tempo, in beats-per-minute of the track' },
  { key: 'energy', label: 'Energy', title: 'the overall energy of the track' },
  { key: 'dance', label: 'Dance', title: 'the danceability of the track' },
  { key: 'loud', label: 'Loud', title: 'the loudness in dBs of the track' },
  { key: 'valence', label: 'Valence', title: 'how positive is the track' },
  { key: 'length', label: 'Length', title: 'the duration of the track' },
  { key: 'acoustic', label: 'Acoustic', title: 'how acoustic is the track' },
  { key: 'popularity', label: 'Pop.', title: 'how popular is the track' },
  { key: 'smart', label: 'A.Sep', title: 'maximizes artist separation' },
  { key: 'rnd', label: 'Rnd', title: 'a random value, suitable for generating a random shuffle' },
];

function getTrackSortValue(track, key) {
  switch (key) {
    case 'which': return track.which;
    case 'name': return (track.name || '').toLowerCase();
    case 'artist': return (track.artists?.[0]?.name || '').toLowerCase();
    case 'releaseDate': return track.releaseDate || '';
    case 'bpm': return track.enInfo?.tempo ?? -1;
    case 'energy': return track.enInfo?.energy ?? -1;
    case 'dance': return track.enInfo?.danceability ?? -1;
    case 'loud': return track.enInfo?.loudness ?? -Infinity;
    case 'valence': return track.enInfo?.valence ?? -1;
    case 'length': return track.duration_ms || 0;
    case 'acoustic': return track.enInfo?.acousticness ?? -1;
    case 'popularity': return track.popularity ?? -1;
    case 'smart': return track.smart ?? Infinity;
    case 'rnd': return track.rnd ?? 0;
    default: return 0;
  }
}

function inRange(val, min, max) {
  return (isNaN(min) && isNaN(max)) ||
    (isNaN(min) && val <= max) ||
    (min <= val && isNaN(max)) ||
    (min <= val && val <= max);
}

export const sortedTracks = derived(
  [tracks, sortColumn, sortDirection, bpmMin, bpmMax, includeDoubleBpm],
  ([$tracks, $sortColumn, $sortDirection, $bpmMin, $bpmMax, $includeDoubleBpm]) => {
    const col = columns[$sortColumn];
    if (!col) return $tracks;

    // Filter by BPM
    let filtered = $tracks;
    if (!isNaN($bpmMin) || !isNaN($bpmMax)) {
      filtered = $tracks.filter(track => {
        const bpm = track.enInfo?.tempo || 0;
        return inRange(bpm, $bpmMin, $bpmMax) ||
          ($includeDoubleBpm && inRange(bpm * 2, $bpmMin, $bpmMax));
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      const va = getTrackSortValue(a, col.key);
      const vb = getTrackSortValue(b, col.key);
      if (va < vb) return $sortDirection === 'asc' ? -1 : 1;
      if (va > vb) return $sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }
);

export function getPlaylistState(colIdx, dir, minBpm, maxBpm, inclDouble) {
  return { order: [colIdx, dir], minBpm, maxBpm, includeDouble: inclDouble };
}
