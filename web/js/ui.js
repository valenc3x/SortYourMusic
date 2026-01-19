"use strict";

// UI messaging
function error(msg) {
    info(msg);
    if (msg != "") {
        alert(msg);
    }
}

function info(msg) {
    $("#info").text(msg);
}

// Progress bar functions
function showProgress(text) {
    $("#progress-text").text(text || "Loading audio features...");
    $("#progress-bar").css("width", "0%");
    $("#audio-features-progress").show();
}

function updateProgress(current, total, text) {
    var percent = Math.round((current / total) * 100);
    $("#progress-bar").css("width", percent + "%");
    if (text) {
        $("#progress-text").text(text);
    } else {
        $("#progress-text").text("Loading audio features... " + current + "/" + total + " tracks");
    }
}

function hideProgress() {
    $("#audio-features-progress").hide();
}

// Utility functions
function formatDuration(dur) {
    var mins = Math.floor(dur / 60);
    var secs = Math.floor(dur - mins * 60);
    var ssecs = secs.toString();
    if (secs < 10) {
        ssecs = '0' + ssecs;
    }
    return mins + ":" + ssecs;
}

function inRange(val, min, max) {
    return ((isNaN(min) && isNaN(max)) ||
        (isNaN(min) && val <= max) ||
        (min <= val && isNaN(max)) ||
        (min <= val && val <= max));
}

// Sort name helpers
function getCurSortName() {
    let currentState = getPlaylistState();
    let col = currentState.order[0];
    if (directionMatters(col)) {
        let prefix = (currentState.order[1] == 'asc') ? 'increasing ' : 'decreasing ';
        return prefix + cols[col];
    } else {
        return cols[col];
    }
}

function directionMatters(col) {
    let cname = cols[col];
    if (cname === "rnd" || cname === "artist separation") {
        return false;
    }
    return true;
}

// Table operations
function clearTable() {
    songTable.clear();
}

function updateTable(items) {
    $("#single-playlist-contents").show();
    _.each(items, function(item, i) {
        if (item.track) {
            var track = item.track;
            track.rnd = Math.random() * 10000;
            addTrack(songTable, track);
        }
    });
    songTable.draw();
    $(".spinner2").hide();
}

function addTrack(table, track) {
    // Duration comes from Spotify track data, not audio features
    var duration = track.duration_ms ? formatDuration(Math.round(track.duration_ms / 1000.0)) : '';
    var relDate = '';
    if (track.album && track.album.id && track.album.id in albumDates) {
        relDate = albumDates[track.album.id];
    }

    if (track && track.enInfo && 'tempo' in track.enInfo) {
        table.row.add([
            track.which + 1,
            track.name,
            track.artists[0].name,
            relDate,
            Math.round(track.enInfo.tempo),
            Math.round(track.enInfo.energy * 100),
            Math.round(track.enInfo.danceability * 100),
            Math.round(track.enInfo.loudness),
            Math.round(track.enInfo.valence * 100),
            duration,
            Math.round(track.enInfo.acousticness * 100),
            Math.round(track.popularity),
            Math.round(track.smart),
            Math.round(track.rnd),
            track
        ]);
    } else {
        console.log('Track missing audio features:', track.id, track.name, '-', track.artists[0].name);
        table.row.add([
            track.which + 1,
            track.name,
            track.artists[0].name,
            relDate,
            '',
            '',
            '',
            '',
            '',
            duration,
            '',
            Math.round(track.popularity),
            '',
            '',
            track
        ]);
    }
}

function playlistFilter(settings, data, dataIndex) {
    var minBpm = parseInt($('#min-bpm').val(), 10);
    var maxBpm = parseInt($('#max-bpm').val(), 10);
    var includeDouble = $('#include-double').is(':checked');
    var bpm = parseFloat(data[4]) || 0;

    return inRange(bpm, minBpm, maxBpm) ||
        (includeDouble && inRange(bpm * 2, minBpm, maxBpm));
}

// Audio playback
function playTrack(track) {
    audio.attr('src', track.preview_url);
    audio.get(0).play();
}

function stopTrack() {
    audio.get(0).pause();
}

// State tracking
function resetState() {
    songTable.order([0, 'asc']);
    $('#min-bpm').val("");
    $('#max-bpm').val("");
    $('#include-double').prop('checked', true);
    saveState();
}

function getPlaylistState() {
    var firstOrder = [];
    var selectedTableOrder = songTable.order();
    if (selectedTableOrder.length >= 1) {
        firstOrder = _.clone(selectedTableOrder[0]);
    }

    return {
        minBpm: parseInt($('#min-bpm').val(), 10),
        maxBpm: parseInt($('#max-bpm').val(), 10),
        includeDouble: $('#include-double').is(':checked'),
        order: firstOrder,
    };
}

function saveState() {
    savedState = getPlaylistState();
}

function isSavable() {
    return !_.isEqual(savedState, getPlaylistState());
}

// Save button state management
function setNeedsSave(state) {
    if (state) {
        $("#save,#saveDropdown").attr('disabled', false);
        $("#save,#saveDropdown").removeClass('btn-warning');
        $("#save,#saveDropdown").addClass('btn-primary');
    } else {
        $("#save,#saveDropdown").attr('disabled', true);
        $("#save,#saveDropdown").addClass('btn-warning');
        $("#save,#saveDropdown").removeClass('btn-primary');
    }
}

function updateSaveButtonState() {
    setNeedsSave(!forceDisableSave && isSavable());
}

function disableSaveButton() {
    forceDisableSave = true;
    updateSaveButtonState();
}

function enableSaveButtonWhenNeeded() {
    forceDisableSave = false;
    updateSaveButtonState();
}

function showSaveSpinner(showSpinner) {
    if (showSpinner) {
        $('#save').addClass('active');
    } else {
        $('#save').removeClass('active');
    }
}

// Table initialization
function initTable() {
    var table = $("#song-table").DataTable({
        paging: false,
        searching: true,
        info: false,
        dom: "t",
        columnDefs: [
            { type: "time-uni", targets: 9 },
        ]
    });

    table.on('order.dt', function() {
        updateSaveButtonState();
    });

    $("#song-table tbody").on('click', 'tr', function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            var row = songTable.row($(this));
            stopTrack();
        } else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var row = songTable.row($(this));
            var rowData = row.data();
            var track = rowData[rowData.length - 1];
            playTrack(track);
        }
    });

    return table;
}
