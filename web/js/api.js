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
    return Q.Promise(function(resolve, reject, notify) {
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
    return Q.Promise(function(resolve, reject, notify) {
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
    return Q.Promise(function(resolve, reject) {
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
        return Q.resolve([]);
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

// Fetch audio features from ReccoBeats with batching
function fetchAudioFeatures(ids) {
    if (ids.length === 0) {
        return Q.resolve({ audio_features: [] });
    }

    // Batch requests to avoid URL length limits (20 IDs per request)
    var maxIdsPerCall = 20;
    var batches = [];
    for (var i = 0; i < ids.length; i += maxIdsPerCall) {
        batches.push(ids.slice(i, i + maxIdsPerCall));
    }

    // Fetch all batches in parallel
    var batchPromises = batches.map(function(batch) {
        return fetchAudioFeaturesBatch(batch);
    });

    return Q.all(batchPromises)
        .then(function(results) {
            // Flatten all batch results into one array
            var allFeatures = [];
            results.forEach(function(batchFeatures) {
                allFeatures = allFeatures.concat(batchFeatures);
            });
            return { audio_features: allFeatures };
        })
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
    return Q.all(qs);
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
