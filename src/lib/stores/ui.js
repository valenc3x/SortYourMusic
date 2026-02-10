import { writable } from 'svelte/store';

export const infoMessage = writable('');
export const progressState = writable({ visible: false, current: 0, total: 0, text: '' });
export const selectedTrackId = writable(null);

export function showProgress(text) {
  progressState.set({ visible: true, current: 0, total: 0, text: text || 'Loading audio features...' });
}

export function updateProgress(current, total, text) {
  progressState.set({
    visible: true,
    current,
    total,
    text: text || `Loading audio features... ${current}/${total} tracks`,
  });
}

export function hideProgress() {
  progressState.set({ visible: false, current: 0, total: 0, text: '' });
}
