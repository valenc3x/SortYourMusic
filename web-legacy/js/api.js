"use strict";

// Spotify API calls (callback style)
function callSpotify(type, url, json, callback) {
    $.ajax(url, {
        type: type,
        data: JSON.stringify(json),
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        success: function(r) {
            callback(true, r);
        },
        error: function(r) {
            if (r.status >= 200 && r.status < 300) {
                callback(true, r);
            } else {
                callback(false, r);
            }
        }
    });
}

// Spotify API calls (Promise style)
function callSpotifyQ(type, url, json) {
    return new Promise(function(resolve, reject) {
        $.ajax(url, {
            type: type,
            data: JSON.stringify(json),
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            beforeSend: function() {
                console.log(type + ": " + this.url);
            },
            success: function(data) {
                resolve(data);
            },
            error: function(jqXHR, textStatus) {
                if (jqXHR.status >= 200 && jqXHR.status < 300) {
                    resolve(undefined);
                } else {
                    reject(textStatus);
                }
            }
        });
    });
}

function getSpotify(url, data, callback) {
    $.ajax(url, {
        dataType: 'json',
        data: data,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        success: function(r) {
            callback(r);
        },
        error: function(r) {
            callback(null);
        }
    });
}

function getSpotifyQ(url, data) {
    return new Promise(function(resolve, reject) {
        $.ajax(url, {
            dataType: 'json',
            data: data,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(data) {
                resolve(data);
            },
            error: function(jqXHR, textStatus) {
                if (jqXHR.status >= 200 && jqXHR.status < 300) {
                    resolve(undefined);
                } else {
                    reject(textStatus);
                }
            }
        });
    });
}

// ReccoBeats API calls
function fetchReccoBeats(url) {
    return new Promise(function(resolve, reject) {
        $.ajax(url, {
            dataType: 'json',
            success: function(data) {
                resolve(data);
            },
            error: function(jqXHR, textStatus) {
                if (jqXHR.status >= 200 && jqXHR.status < 300) {
                    resolve(undefined);
                } else {
                    console.log('ReccoBeats error:', jqXHR.status, textStatus);
                    reject(textStatus);
                }
            }
        });
    });
}

// Fetch audio features for a single batch from ReccoBeats
function fetchAudioFeaturesBatch(ids) {
    if (ids.length === 0) {
        return Promise.resolve([]);
    }

    var cids = ids.join(',');
    var lookupUrl = "https://api.reccobeats.com/v1/track?ids=" + encodeURIComponent(cids);

    return fetchReccoBeats(lookupUrl)
        .then(function(trackData) {
            if (!trackData || !trackData.content || trackData.content.length === 0) {
                return [];
            }

            // Get ReccoBeats IDs
            var reccoIds = trackData.content.map(function(t) { return t.id; });
            if (reccoIds.length === 0) {
                return [];
            }

            var featuresUrl = "https://api.reccobeats.com/v1/audio-features?ids=" + reccoIds.join(',');
            return fetchReccoBeats(featuresUrl)
                .then(function(featuresData) {
                    if (!featuresData || !featuresData.content) {
                        return [];
                    }

                    // Map back to Spotify IDs for compatibility
                    return featuresData.content.map(function(f) {
                        var spotifyId = f.href.split('/').pop();
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
                            mode: f.mode
                        };
                    });
                });
        })
        .catch(function(err) {
            console.log('ReccoBeats batch fetch failed:', err);
            return [];
        });
}

// Fetch audio features from ReccoBeats with batching and progress reporting
function fetchAudioFeatures(ids, progressCallback) {
    if (ids.length === 0) {
        return Promise.resolve({ audio_features: [] });
    }

    // Batch requests to avoid URL length limits (20 IDs per request)
    var maxIdsPerCall = 20;
    var batches = [];
    for (var i = 0; i < ids.length; i += maxIdsPerCall) {
        batches.push(ids.slice(i, i + maxIdsPerCall));
    }

    var allFeatures = [];
    var totalTracks = ids.length;
    var processedTracks = 0;

    // Fetch batches sequentially for accurate progress reporting
    function fetchNextBatch(batchIndex) {
        if (batchIndex >= batches.length) {
            return Promise.resolve({ audio_features: allFeatures });
        }

        return fetchAudioFeaturesBatch(batches[batchIndex])
            .then(function(batchFeatures) {
                allFeatures = allFeatures.concat(batchFeatures);
                processedTracks += batches[batchIndex].length;

                if (progressCallback) {
                    progressCallback(processedTracks, totalTracks);
                }

                return fetchNextBatch(batchIndex + 1);
            });
    }

    return fetchNextBatch(0)
        .catch(function(err) {
            console.log('ReccoBeats fetch failed, returning empty features:', err);
            return { audio_features: [] };
        });
}

function fetchAlbums(ids) {
    var cids = ids.join(',');
    var url = "https://api.spotify.com/v1/albums";
    return getSpotifyQ(url, { ids: cids });
}

function fetchAllAlbums(ids) {
    var maxAlbumsPerCall = 20;
    var qs = [];
    for (var i = 0; i < ids.length; i += maxAlbumsPerCall) {
        var aids = ids.slice(i, i + maxAlbumsPerCall);
        qs.push(fetchAlbums(aids));
    }
    return Promise.all(qs);
}

function fetchCurrentUserProfile(callback) {
    var url = 'https://api.spotify.com/v1/me';
    getSpotify(url, null, callback);
}

function fetchPlaylists(uid, callback) {
    $("#playlist-list tbody").empty();
    $(".prompt").hide();
    $(".spinner").show();

    info("Getting your playlists");
    var url = 'https://api.spotify.com/v1/users/' + uid + '/playlists';
    var data = {
        limit: 50,
        offset: 0
    };
    getSpotify(url, data, callback);
}

// iTunes Search API for preview fallback
function searchItunesPreview(trackName, artistName, durationMs) {
    return new Promise(function(resolve, reject) {
        var term = encodeURIComponent(trackName + " " + artistName);
        var callbackName = 'itunesCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        var url = "https://itunes.apple.com/search?term=" + term +
                  "&media=music&entity=musicTrack&limit=5&callback=" + callbackName;

        // JSONP callback
        window[callbackName] = function(data) {
            delete window[callbackName];
            script.remove();

            if (data.results && data.results.length > 0) {
                var best = findBestItunesMatch(data.results, trackName, artistName, durationMs);
                resolve(best ? best.previewUrl : null);
            } else {
                resolve(null);
            }
        };

        var script = document.createElement('script');
        script.src = url;
        script.onerror = function() {
            delete window[callbackName];
            script.remove();
            resolve(null);
        };
        document.head.appendChild(script);

        // Timeout after 5 seconds
        setTimeout(function() {
            if (window[callbackName]) {
                delete window[callbackName];
                script.remove();
                resolve(null);
            }
        }, 5000);
    });
}

function findBestItunesMatch(results, trackName, artistName, durationMs) {
    var trackLower = trackName.toLowerCase();
    var artistLower = artistName.toLowerCase();

    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        if (!r.previewUrl) continue;

        var nameMatch = r.trackName && r.trackName.toLowerCase().includes(trackLower.substring(0, 20));
        var artistMatch = r.artistName && r.artistName.toLowerCase().includes(artistLower.split(' ')[0]);
        var durationClose = !durationMs || !r.trackTimeMillis ||
                           Math.abs(r.trackTimeMillis - durationMs) < 10000; // 10 sec tolerance

        if (nameMatch && artistMatch && durationClose) {
            return r;
        }
    }

    // Fallback: return first result with preview
    for (var j = 0; j < results.length; j++) {
        if (results[j].previewUrl) return results[j];
    }
    return null;
}
