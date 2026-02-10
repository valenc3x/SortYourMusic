async function fetchReccoBeats(url) {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status >= 200 && res.status < 300) return undefined;
    console.log('ReccoBeats error:', res.status);
    throw new Error(`ReccoBeats error: ${res.status}`);
  }
  return res.json();
}

async function fetchAudioFeaturesBatch(ids) {
  if (ids.length === 0) return [];

  const cids = ids.join(',');
  const lookupUrl = 'https://api.reccobeats.com/v1/track?ids=' + encodeURIComponent(cids);

  try {
    const trackData = await fetchReccoBeats(lookupUrl);
    if (!trackData?.content?.length) return [];

    const reccoIds = trackData.content.map(t => t.id);
    if (reccoIds.length === 0) return [];

    const featuresUrl = 'https://api.reccobeats.com/v1/audio-features?ids=' + reccoIds.join(',');
    const featuresData = await fetchReccoBeats(featuresUrl);
    if (!featuresData?.content) return [];

    return featuresData.content.map(f => {
      const spotifyId = f.href.split('/').pop();
      return {
        id: spotifyId,
        tempo: f.tempo,
        energy: f.energy,
        danceability: f.danceability,
        loudness: f.loudness,
        valence: f.valence,
        acousticness: f.acousticness,
        speechiness: f.speechiness,
        instrumentalness: f.instrumentalness,
        liveness: f.liveness,
        key: f.key,
        mode: f.mode,
      };
    });
  } catch (err) {
    console.log('ReccoBeats batch fetch failed:', err);
    return [];
  }
}

export async function fetchAudioFeatures(ids, progressCallback) {
  if (ids.length === 0) return { audio_features: [] };

  const maxIdsPerCall = 20;
  const batches = [];
  for (let i = 0; i < ids.length; i += maxIdsPerCall) {
    batches.push(ids.slice(i, i + maxIdsPerCall));
  }

  const allFeatures = [];
  let processedTracks = 0;
  const totalTracks = ids.length;

  for (const batch of batches) {
    const batchFeatures = await fetchAudioFeaturesBatch(batch);
    allFeatures.push(...batchFeatures);
    processedTracks += batch.length;
    if (progressCallback) {
      progressCallback(processedTracks, totalTracks);
    }
  }

  return { audio_features: allFeatures };
}
