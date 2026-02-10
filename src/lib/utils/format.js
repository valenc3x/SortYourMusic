export function formatDuration(durationMs) {
  const totalSecs = Math.round(durationMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs - mins * 60;
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

export function inRange(val, min, max) {
  return (isNaN(min) && isNaN(max)) ||
    (isNaN(min) && val <= max) ||
    (min <= val && isNaN(max)) ||
    (min <= val && val <= max);
}
