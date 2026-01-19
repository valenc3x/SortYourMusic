"use strict";

function showPlaylists() {
    $(".worker").hide();
    $("#playlists").show();
}

function fetchSinglePlaylist(playlist) {
    $(".worker").hide();
    $("#single-playlist").show();
    $("#single-playlist-contents").hide();
    $(".spinner2").show();
    $("#song-table tbody").empty();
    window.scrollTo(0, 0);
    disableSaveButton();
    songTable.clear();
    resetState();

    curPlaylist = playlist;
    curPlaylist.tracks.items = [];

    $("#playlist-title").text(playlist.name);
    $("#playlist-title").attr('href', playlist.uri);

    info("");

    fetchPlaylistTracks(playlist)
        .then(function() {
            saveState();
            enableSaveButtonWhenNeeded();
        })
        .catch(function(msg) {
            console.log('msg', msg);
            error("Error while loading playlist: " + msg);
        });
}

function smartOrder(items) {
    // Smart ordering tries to equally distribute artists
    let length = items.length;
    let artist_counts = new Proxy({}, { get: (target, name) => name in target ? target[name] : 0 });
    _.each(items, function(item, i) {
        if (item.track) {
            var track = item.track;
            var artist = track.artists[0].name;
            artist_counts[artist]++;
        }
    });

    let artist_counts_so_far = new Proxy({}, { get: (target, name) => name in target ? target[name] : 0 });
    let out = [];
    let all_items = items.slice();

    while (all_items.length > 0) {
        let best_delta = 1000;
        let best_item = all_items[0];
        _.each(all_items, function(item, i) {
            if (item.track) {
                var track = item.track;
                let artist = track.artists[0].name;
                let desired_percentage = artist_counts[artist] / length;
                let next_percentage = (artist_counts_so_far[artist] + 1) / (out.length + 1);
                let delta_percentage = Math.abs(next_percentage - desired_percentage);
                if (delta_percentage < best_delta) {
                    best_delta = delta_percentage;
                    best_item = item;
                }
            } else {
                console.log("nope", item);
            }
        });
        all_items = all_items.filter(item => item != best_item);
        best_item.track.smart = out.length;
        out.push(best_item);
        artist_counts_so_far[best_item.track.artists[0].name] += 1;
    }
}

function findDuplicates(playlist) {
    var ids = {};
    var dups = [];
    _.each(playlist.tracks.items, function(item, i) {
        if (item.track && item.track.id) {
            var id = item.track.id;
            if (id in ids) {
                dups.push(id);
            }
            ids[id] = 1;
        }
    });
    return dups;
}

function fetchPlaylistTracks(playlist) {
    let all_items = [];

    function fetchLoop(url) {
        var tracks;

        return getSpotifyQ(url)
            .then(function(data) {
                var ids = [];
                var aids = [];

                tracks = data.tracks ? data.tracks : data;
                _.each(tracks.items, function(item, i) {
                    all_items.push(item);
                    if (item.track) {
                        item.track.which = curPlaylist.tracks.items.length;
                        curPlaylist.tracks.items.push(item);
                        if (!item.is_local) {
                            if (item.track && item.track.id) {
                                ids.push(item.track.id);
                            }
                            if (!(_.contains(aids, item.track.album.id))) {
                                if (!(item.track.album.id in albumDates)) {
                                    aids.push(item.track.album.id);
                                }
                            }
                        }
                    } else {
                        console.log('no track at', i);
                    }
                });
                return Q.all([fetchAllAlbums(aids), fetchAudioFeatures(ids)]);
            })
            .then(function(results) {
                var allAlbums = results[0];
                var trackFeatures = results[1];

                _.each(allAlbums, function(albums) {
                    _.each(albums.albums, function(album) {
                        if (album != null && 'id' in album) {
                            albumDates[album.id] = album.release_date;
                        }
                    });
                });

                var fmap = {};
                if ('audio_attributes' in trackFeatures) {
                    trackFeatures = trackFeatures['audio_attributes'];
                }
                if ('audio_features' in trackFeatures) {
                    trackFeatures = trackFeatures['audio_features'];
                }

                _.each(trackFeatures, function(trackFeature, i) {
                    if (trackFeature && trackFeature.id) {
                        fmap[trackFeature.id] = trackFeature;
                    }
                });

                _.each(tracks.items, function(item, i) {
                    if (item.track && item.track.id) {
                        var tid = item.track.id;
                        if (tid in fmap) {
                            item.track.enInfo = fmap[tid];
                        } else {
                            item.track.enInfo = {};
                        }
                    }
                });
                updateTable(tracks.items);

                if (tracks.next) {
                    return fetchLoop(tracks.next);
                } else {
                    console.log("tracks loaded");
                    smartOrder(all_items);
                    clearTable();
                    updateTable(all_items);
                }
            });
    }

    var startUrl = "https://api.spotify.com/v1/users/" + playlist.owner.id +
        "/playlists/" + playlist.id + "/tracks?limit=50";
    return fetchLoop(startUrl);
}

function goodPlaylist(playlist) {
    return playlist.tracks.total > 0;
}

function formatOwner(owner) {
    if (owner.id == curUserID) {
        return "";
    } else {
        return owner.id;
    }
}

function get_tiny_image(playlist) {
    if (playlist.images) {
        var len = playlist.images.length;
        if (len > 0) {
            return playlist.images[len - 1]['url'];
        }
    }
    return null;
}

function playlistLoaded(playlists) {
    var pl = $("#playlist-list tbody");
    $(".prompt").show();
    $(".spinner").hide();

    if (playlists) {
        info("");
        _.each(playlists.items, function(playlist) {
            if (goodPlaylist(playlist)) {
                var tr = $("<tr>");
                var tiny_image_url = get_tiny_image(playlist);
                var imageCell = $("<td>");
                if (tiny_image_url) {
                    var image = $("<img>");
                    image.attr("src", tiny_image_url);
                    image.attr("width", "60px");
                    imageCell.append(image);
                }
                tr.append(imageCell);

                var tdName = $("<td>");
                var aName = $("<a>")
                    .text(playlist.name)
                    .addClass('hoverable')
                    .on('click', function() {
                        fetchSinglePlaylist(playlist);
                    });
                tdName.append(aName);

                var tdTrackCount = $("<td>").text(playlist.tracks.total);
                var tdOwner = $("<td>").text(formatOwner(playlist.owner));

                tr.append(tdName);
                tr.append(tdTrackCount);
                tr.append(tdOwner);

                pl.append(tr);
            }
        });
        if (playlists.next) {
            getSpotify(playlists.next, null, playlistLoaded);
        }
    } else {
        error("Sorry, I couldn't find your playlists");
    }
}

function loadPlaylists(uid) {
    $("#playlists").show();
    fetchPlaylists(uid, playlistLoaded);
}

// Playlist saving functions
function getSortedUrisFromTable(tracks, table) {
    return _.chain(table.rows({ filter: 'applied' }).data())
        .select(function(rowdata) { return rowdata[14].uri.startsWith("spotify:track:"); })
        .map(function(rowdata) { return rowdata[14].uri; })
        .value();
}

function savePlaylist(playlist, createNewPlaylist) {
    var tids = getSortedUrisFromTable(playlist.tracks.items, songTable);

    if (tids.length <= 0) {
        error("Cannot save the playlist because there are no tracks left after filtering");
        return;
    }

    disableSaveButton();
    showSaveSpinner(true);

    createOrReusePlaylist(playlist, createNewPlaylist)
        .then(function(playlistToModify) {
            return saveTidsToPlaylist(playlistToModify, tids, true);
        })
        .then(function() {
            saveState();
        })
        .catch(function(msg) {
            error(msg);
        })
        .finally(function() {
            showSaveSpinner(false);
            enableSaveButtonWhenNeeded();
            error("");
        });
}

function saveTidsToPlaylist(playlist, tids, replace) {
    var sliceLength = 100;
    var this_tids = tids.slice(0, sliceLength);
    var remaining = tids.slice(sliceLength);
    var url = "https://api.spotify.com/v1/playlists/" + playlist.id + '/tracks';
    var type;
    var json;

    if (replace) {
        type = 'PUT';
        json = { 'uris': this_tids };
    } else {
        type = 'POST';
        json = this_tids;
    }

    return callSpotifyQ(type, url, json)
        .then(function() {
            if (remaining.length > 0) {
                return saveTidsToPlaylist(playlist, remaining, false);
            }
        })
        .catch(function() {
            console.log("reject");
            return Q.reject("Trouble saving tracks to the playlist");
        });
}

function createPlaylist(owner, name, isPublic) {
    var url = "https://api.spotify.com/v1/users/" + owner + "/playlists";
    var json = { name: name, 'public': isPublic };
    return callSpotifyQ('POST', url, json)
        .catch(function() {
            return Q.reject("Cannot create the new playlist");
        });
}

function createOrReusePlaylist(playlist, createNewPlaylist) {
    if (createNewPlaylist) {
        var sortName = getCurSortName();
        return createPlaylist(curUserID, playlist.name + " ordered by " + sortName, playlist.public);
    } else {
        return Q(playlist);
    }
}
