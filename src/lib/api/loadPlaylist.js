import { get } from 'svelte/store';
import { accessToken } from '../stores/auth.js';
import { tracks, tracksLoading, albumDates, sortColumn, sortDirection, bpmMin, bpmMax, includeDoubleBpm, savedState, currentPlaylist } from '../stores/playlist.js';
import { showProgress, updateProgress, hideProgress } from '../stores/ui.js';
import { fetchAllAlbums } from './spotify.js';
import { fetchAudioFeatures } from './reccobeats.js';
import { smartOrder } from '../utils/smartOrder.js';

async function spotifyGet(url) {
  const token = get(accessToken);
  const res = await fetch(url, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

export async function loadPlaylist(playlist) {
  // Reset state
  tracks.set([]);
  tracksLoading.set(true);
  sortColumn.set(0);
  sortDirection.set('asc');
  bpmMin.set(NaN);
  bpmMax.set(NaN);
  includeDoubleBpm.set(true);

  const allItems = [];
  const dates = {};
  const totalTracks = playlist.tracks.total;
  let processedTracks = 0;

  showProgress(`Loading audio features... 0/${totalTracks} tracks`);

  let url = `https://api.spotify.com/v1/users/${playlist.owner.id}/playlists/${playlist.id}/tracks?limit=50`;

  while (url) {
    const data = await spotifyGet(url);
    const trackData = data.tracks || data;

    const ids = [];
    const aids = [];

    trackData.items.forEach((item, i) => {
      item.track = item.track || null;
      allItems.push(item);

      if (item.track) {
        item.track.which = allItems.length - 1;

        if (!item.is_local && item.track.id) {
          ids.push(item.track.id);
          if (item.track.album?.id && !aids.includes(item.track.album.id) && !(item.track.album.id in dates)) {
            aids.push(item.track.album.id);
          }
        }
      }
    });

    const batchStartOffset = processedTracks;

    const progressCallback = (currentInBatch, totalInBatch) => {
      const cumulative = batchStartOffset + currentInBatch;
      updateProgress(cumulative, totalTracks);
    };

    const [allAlbumsResults, trackFeatures] = await Promise.all([
      fetchAllAlbums(aids),
      fetchAudioFeatures(ids, progressCallback),
    ]);

    // Process albums
    for (const albums of allAlbumsResults) {
      if (albums?.albums) {
        for (const album of albums.albums) {
          if (album?.id) {
            dates[album.id] = album.release_date;
          }
        }
      }
    }

    // Process audio features
    let features = trackFeatures;
    if (features.audio_attributes) features = features.audio_attributes;
    if (features.audio_features) features = features.audio_features;

    const fmap = {};
    for (const f of features) {
      if (f?.id) fmap[f.id] = f;
    }

    for (const item of trackData.items) {
      if (item.track?.id) {
        item.track.enInfo = fmap[item.track.id] || {};
      }
    }

    processedTracks += trackData.items.length;
    updateProgress(processedTracks, totalTracks);

    // Progressively append this batch's tracks to the store
    const batchTracks = trackData.items
      .filter(item => item.track)
      .map(item => {
        const t = item.track;
        t.rnd = Math.random() * 10000;
        t.releaseDate = (t.album?.id && dates[t.album.id]) || '';
        return t;
      });

    tracks.update(existing => [...existing, ...batchTracks]);

    url = trackData.next;
  }

  // Compute smartOrder on the full set (needs all tracks)
  smartOrder(allItems);

  // Rebuild final track list with smart values included
  const finalTracks = allItems
    .filter(item => item.track)
    .map(item => {
      const t = item.track;
      // rnd and releaseDate already set during progressive loading
      return t;
    });

  albumDates.set(dates);
  tracks.set(finalTracks);
  tracksLoading.set(false);
  hideProgress();

  // Save initial state
  savedState.set({ order: [0, 'asc'], minBpm: NaN, maxBpm: NaN, includeDouble: true });
}
