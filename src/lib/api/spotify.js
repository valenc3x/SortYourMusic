import { get } from 'svelte/store';
import { accessToken } from '../stores/auth.js';

async function spotifyGet(url, params) {
  const token = get(accessToken);
  const fullUrl = params
    ? url + '?' + new URLSearchParams(params)
    : url;

  const res = await fetch(fullUrl, {
    headers: { Authorization: 'Bearer ' + token },
  });

  if (!res.ok) {
    if (res.status >= 200 && res.status < 300) return undefined;
    throw new Error(`Spotify API error: ${res.status}`);
  }

  return res.json();
}

async function spotifyRequest(method, url, body) {
  const token = get(accessToken);

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    if (res.status >= 200 && res.status < 300) return undefined;
    throw new Error(`Spotify API error: ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

export async function fetchCurrentUserProfile() {
  return spotifyGet('https://api.spotify.com/v1/me');
}

export async function fetchAllPlaylists(userId, { onBatch } = {}) {
  const playlists = [];
  const seen = new Set();
  let url = `https://api.spotify.com/v1/users/${userId}/playlists`;
  let params = { limit: 50, offset: 0 };

  while (url) {
    const data = await spotifyGet(url, params);
    if (!data) break;

    const batch = [];
    for (const playlist of data.items) {
      if (playlist.tracks.total > 0 && !seen.has(playlist.id)) {
        seen.add(playlist.id);
        batch.push(playlist);
      }
    }

    playlists.push(...batch);
    if (onBatch && batch.length > 0) onBatch(batch);

    url = data.next;
    params = null; // next URL already includes params
  }

  return playlists;
}

export async function fetchPlaylistTracks(ownerId, playlistId) {
  const items = [];
  let url = `https://api.spotify.com/v1/users/${ownerId}/playlists/${playlistId}/tracks?limit=50`;

  while (url) {
    const data = await spotifyGet(url);
    if (!data) break;

    const tracks = data.tracks || data;
    items.push(...tracks.items);
    url = tracks.next;
  }

  return items;
}

export async function fetchAlbums(ids) {
  const cids = ids.join(',');
  return spotifyGet('https://api.spotify.com/v1/albums', { ids: cids });
}

export async function fetchAllAlbums(ids) {
  const maxPerCall = 20;
  const promises = [];
  for (let i = 0; i < ids.length; i += maxPerCall) {
    promises.push(fetchAlbums(ids.slice(i, i + maxPerCall)));
  }
  return Promise.all(promises);
}

export async function createPlaylist(ownerId, name, isPublic) {
  const url = `https://api.spotify.com/v1/users/${ownerId}/playlists`;
  return spotifyRequest('POST', url, { name, public: isPublic });
}

export async function saveTidsToPlaylist(playlistId, uris, replace) {
  const sliceLength = 100;
  const thisUris = uris.slice(0, sliceLength);
  const remaining = uris.slice(sliceLength);
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  if (replace) {
    await spotifyRequest('PUT', url, { uris: thisUris });
  } else {
    await spotifyRequest('POST', url, thisUris);
  }

  if (remaining.length > 0) {
    await saveTidsToPlaylist(playlistId, remaining, false);
  }
}
