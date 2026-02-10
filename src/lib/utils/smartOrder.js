export function smartOrder(items) {
  // Filter out items without valid tracks
  const validItems = items.filter(
    item => item.track?.artists?.length > 0
  );

  if (validItems.length === 0) return;

  const length = validItems.length;
  const artistCounts = {};
  for (const item of validItems) {
    const artist = item.track.artists[0].name;
    artistCounts[artist] = (artistCounts[artist] || 0) + 1;
  }

  const artistCountsSoFar = {};
  const out = [];
  let allItems = validItems.slice();

  while (allItems.length > 0) {
    let bestDelta = 1000;
    let bestItem = allItems[0];

    for (const item of allItems) {
      const artist = item.track.artists[0].name;
      const desiredPercentage = artistCounts[artist] / length;
      const nextPercentage = ((artistCountsSoFar[artist] || 0) + 1) / (out.length + 1);
      const deltaPercentage = Math.abs(nextPercentage - desiredPercentage);
      if (deltaPercentage < bestDelta) {
        bestDelta = deltaPercentage;
        bestItem = item;
      }
    }

    allItems = allItems.filter(item => item !== bestItem);
    bestItem.track.smart = out.length;
    out.push(bestItem);
    const bestArtist = bestItem.track.artists[0].name;
    artistCountsSoFar[bestArtist] = (artistCountsSoFar[bestArtist] || 0) + 1;
  }

  // Assign smart order to invalid items
  const invalidItems = items.filter(
    item => !item.track?.artists?.length
  );
  invalidItems.forEach((item, i) => {
    if (item.track) {
      item.track.smart = validItems.length + i;
    }
  });
}
