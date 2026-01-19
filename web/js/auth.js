"use strict";

// PKCE Helper Functions
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function parseQueryArgs() {
    const params = new URLSearchParams(window.location.search);
    const args = {};
    for (const [key, value] of params) {
        args[key] = value;
    }
    return args;
}

function parseHashArgs() {
    var hash = location.hash.replace(/#/g, '');
    var all = hash.split('&');
    var args = {};
    _.each(all, function(keyvalue) {
        var kv = keyvalue.split('=');
        var key = kv[0];
        var val = kv[1];
        args[key] = val;
    });
    return args;
}

async function exchangeCodeForToken(code) {
    const codeVerifier = sessionStorage.getItem('code_verifier');
    if (!codeVerifier) {
        throw new Error('No code verifier found');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            code_verifier: codeVerifier,
        }),
    });

    if (!response.ok) {
        throw new Error('Token exchange failed');
    }

    const data = await response.json();
    sessionStorage.removeItem('code_verifier');
    return data.access_token;
}

async function authorizeUser() {
    var scopes = 'playlist-read-private playlist-modify-private playlist-modify-public';

    // Generate PKCE code verifier and challenge
    var codeVerifier = generateRandomString(64);
    sessionStorage.setItem('code_verifier', codeVerifier);
    var codeChallenge = await generateCodeChallenge(codeVerifier);

    var url = 'https://accounts.spotify.com/authorize?client_id=' + SPOTIFY_CLIENT_ID +
        '&response_type=code' +
        '&scope=' + encodeURIComponent(scopes) +
        '&redirect_uri=' + encodeURIComponent(SPOTIFY_REDIRECT_URI) +
        '&code_challenge_method=S256' +
        '&code_challenge=' + codeChallenge;
    document.location = url;
}
