"use strict";

// Global variables
var accessToken = null;
var curUserID = null;
var curPlaylist = null;
var albumDates = {};
var audio = null;
var songTable = null;
var cols = [
    'order', 'title', 'artist', 'Date', 'BPM', 'energy',
    'danceability', 'loudness', 'valence', 'duration',
    'acousticness', 'popularity', 'artist separation', 'rnd'
];

// Disable save while loading and saving
var forceDisableSave = false;

// State of the saved playlist
var savedState = {};

// Main initialization
$(document).ready(function() {
    audio = $("<audio>");
    songTable = initTable();

    var hashArgs = parseHashArgs();
    var queryArgs = parseQueryArgs();

    function setupLoginButton() {
        $("#go").show();
        $("#go").on('click', function() {
            authorizeUser();
        });
    }

    function onUserLoaded(user) {
        if (user) {
            curUserID = user.id;
            $("#who").text(user.id);
            loadPlaylists(user.id);
        } else {
            error("Trouble getting the user profile");
        }
    }

    // Check for errors in query string (PKCE flow)
    if ('error' in queryArgs) {
        error("Sorry, I can't read your playlists from Spotify without authorization");
        setupLoginButton();
    }
    // Handle authorization code (PKCE flow)
    else if ('code' in queryArgs) {
        info("Completing authentication...");
        exchangeCodeForToken(queryArgs['code'])
            .then(function(token) {
                accessToken = token;
                // Clean up the URL
                window.history.replaceState({}, document.title, window.location.pathname);
                $(".worker").hide();
                fetchCurrentUserProfile(onUserLoaded);
            })
            .catch(function(e) {
                error("Failed to complete authentication: " + e.message);
                setupLoginButton();
            });
    }
    // Legacy: check for access_token in hash (implicit flow - deprecated)
    else if ('access_token' in hashArgs) {
        accessToken = hashArgs['access_token'];
        $(".worker").hide();
        fetchCurrentUserProfile(onUserLoaded);
    }
    // Check for errors in hash (legacy implicit flow)
    else if ('error' in hashArgs) {
        error("Sorry, I can't read your playlists from Spotify without authorization");
        setupLoginButton();
    }
    else {
        setupLoginButton();
    }

    // Event handlers
    $("#save,#dropSave").on('click', function() {
        info("saving ...");
        savePlaylist(curPlaylist, true);
    });

    $("#dropOverwrite").on('click', function() {
        info("overwriting ...");
        savePlaylist(curPlaylist, false);
    });

    $("#pick").on('click', function() {
        showPlaylists();
    });

    // Setup playlist filter
    $.fn.dataTable.ext.search.push(playlistFilter);
    $('#min-bpm,#max-bpm,#include-double').on('keyup change', function() {
        songTable.draw();
        updateSaveButtonState();
    });
});
