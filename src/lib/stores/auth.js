import { writable } from 'svelte/store';
import { generateRandomString, generateCodeChallenge } from '../utils/pkce.js';

export const accessToken = writable(null);
export const currentUser = writable(null);
export const configLoaded = writable(false);

let clientId = '';
let redirectUri = '';

export async function loadConfig() {
  // In dev, use Vite env vars; in production, fetch from /config
  if (import.meta.env.VITE_SPOTIFY_CLIENT_ID) {
    clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  } else {
    const res = await fetch('/config');
    const data = await res.json();
    clientId = data.spotifyClientId;
    redirectUri = data.spotifyRedirectUri;
  }
  configLoaded.set(true);
}

export function getClientId() {
  return clientId;
}

export function getRedirectUri() {
  return redirectUri;
}

export function storeTokens(data) {
  localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  const expiresAt = Date.now() + (data.expires_in * 1000);
  localStorage.setItem('spotify_token_expiry', expiresAt.toString());
}

export function getStoredToken() {
  const token = localStorage.getItem('spotify_access_token');
  const expiry = localStorage.getItem('spotify_token_expiry');
  if (!token || !expiry) return null;
  if (Date.now() > (parseInt(expiry, 10) - 5 * 60 * 1000)) return null;
  return token;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    clearStoredTokens();
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  storeTokens(data);
  return data.access_token;
}

export async function restoreSession() {
  const token = getStoredToken();
  if (token) return token;

  const refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) return null;

  try {
    return await refreshAccessToken();
  } catch {
    return null;
  }
}

export function clearStoredTokens() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiry');
}

export async function exchangeCodeForToken(code) {
  const codeVerifier = sessionStorage.getItem('code_verifier');
  if (!codeVerifier) throw new Error('No code verifier found');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) throw new Error('Token exchange failed');

  const data = await response.json();
  sessionStorage.removeItem('code_verifier');
  storeTokens(data);
  return data.access_token;
}

export async function authorizeUser() {
  const scopes = 'playlist-read-private playlist-modify-private playlist-modify-public';
  const codeVerifier = generateRandomString(64);
  sessionStorage.setItem('code_verifier', codeVerifier);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const url = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: scopes,
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  window.location.href = url;
}

export function logout() {
  clearStoredTokens();
  accessToken.set(null);
  currentUser.set(null);
}
