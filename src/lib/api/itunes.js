function findBestItunesMatch(results, trackName, artistName, durationMs) {
  const trackLower = trackName.toLowerCase();
  const artistLower = artistName.toLowerCase();

  for (const r of results) {
    if (!r.previewUrl) continue;

    const nameMatch = r.trackName?.toLowerCase().includes(trackLower.substring(0, 20));
    const artistMatch = r.artistName?.toLowerCase().includes(artistLower.split(' ')[0]);
    const durationClose = !durationMs || !r.trackTimeMillis ||
      Math.abs(r.trackTimeMillis - durationMs) < 10000;

    if (nameMatch && artistMatch && durationClose) return r;
  }

  // Fallback: first result with preview
  for (const r of results) {
    if (r.previewUrl) return r;
  }
  return null;
}

export async function searchItunesPreview(trackName, artistName, durationMs) {
  const term = encodeURIComponent(trackName + ' ' + artistName);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&entity=musicTrack&limit=5`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (data.results?.length > 0) {
      const best = findBestItunesMatch(data.results, trackName, artistName, durationMs);
      return best?.previewUrl || null;
    }
    return null;
  } catch {
    return null;
  }
}
