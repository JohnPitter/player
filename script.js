
// Function to fetch the user's playlists
function fetchUserPlaylists(accessToken) {
    return fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }).then(response => response.json());
}

// Function to display playlists in the UI
function displayPlaylists(playlists) {
    const playlistContainer = document.getElementById('playlists');
    playlists.items.forEach(playlist => {
        const div = document.createElement('div');
        div.className = 'playlist';
        div.innerHTML = `
  <img src="${playlist.images[0]?.url}" alt="${playlist.name}" />
  <p>${playlist.name}</p>
`;
        div.onclick = () => playPlaylist(playlist.uri, true); // Mark as playlist with 'true'
        playlistContainer.appendChild(div);
    });
}

// Function to start playback by loading a track/playlist
function startPlayback(deviceId, accessToken, uris, isPlaylist = false) {
    let body;

    if (isPlaylist) {
        // Use context_uri for playlist playback
        body = JSON.stringify({
            context_uri: uris[0] // Single playlist URI
        });
    } else {
        // Use uris for track playback
        body = JSON.stringify({
            uris: uris // Array of track URIs
        });
    }

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: body
    }).then(response => {
        if (response.status === 204) {
            console.log('Playback started successfully');
        } else {
            console.error('Failed to start playback:', response.status, response.statusText);
        }
    });
}

// Function to play a selected playlist
function playPlaylist(playlistUri, isPlaylist = false) {
    if (!playerDeviceId || !accessToken) {
        console.error('Player not ready or access token missing.');
        return;
    }
    startPlayback(playerDeviceId, accessToken, [playlistUri], isPlaylist);
}

let playerDeviceId;
let accessToken;

async function redirectToSpotifyLogin() {
    const response = await fetch('https://callback-jals.onrender.com/auth/token');
    const json = await response.json();
    token = json.access_token;

    if (token === '') {
        document.getElementById('status-token').innerText = "Token invalido";
    } else {
        return token;
    }
}

// Função para mostrar a tela de login
async function login() {
    const response = await fetch('https://callback-jals.onrender.com/auth/login');
    const json = await response.json();
    token = json.access_token;

    if (token != '') {
        document.getElementById('status-token').innerText = "Token invativo"
    } else {
        initializeSpotifyPlayer(token)
    }
}

// Function to change the volume
function changeVolume(volume) {
    const volumeValue = Math.max(0, Math.min(100, volume)); // Ensure volume is between 0 and 100
    if (playerDeviceId) {
        fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumeValue}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(response => {
            if (response.status === 204) {
                console.log(`Volume set to ${volumeValue}%`);
                document.getElementById('volume-value').innerText = volumeValue; // Update volume display
                document.getElementById('volume-slider').value = volumeValue; // Sync the slider
            } else {
                console.error('Failed to set volume:', response.statusText);
            }
        }).catch(error => {
            console.error('Error while setting volume:', error);
        });
    } else {
        console.error('Player device ID not available yet.');
    }
}

// Initialize the Spotify Web Playback SDK
function initializeSpotifyPlayer(token) {
    accessToken = token;
    window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new Spotify.Player({
            name: 'Web Playback SDK Player',
            getOAuthToken: cb => { cb(accessToken); }
        });

        // Ready event
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            playerDeviceId = device_id;
            document.getElementById('track-name').innerText = 'Player está funcionando!';

            // Fetch and display user's playlists after the player is ready
            fetchUserPlaylists(accessToken).then(data => {
                displayPlaylists(data);
            }).catch(error => {
                console.error('Failed to fetch playlists:', error);
            });
        });

        // Player state change event
        player.addListener('player_state_changed', (state) => {
            if (!state) return;
            const currentTrack = state.track_window.current_track;
            document.getElementById('track-name').innerText = `Tocando: ${currentTrack.name} by ${currentTrack.artists.map(artist => artist.name).join(', ')}`;
        });

        // Error event
        player.addListener('initialization_error', ({ message }) => { console.error(message); });
        player.addListener('authentication_error', ({ message }) => { console.error(message); });
        player.addListener('account_error', ({ message }) => { console.error(message); });
        player.addListener('playback_error', ({ message }) => { console.error(message); });

        // Connect the player!
        player.connect();

        // Play button
        document.getElementById('play-btn').addEventListener('click', () => {
            player.resume().then(() => {
                console.log('Resumed playback');
            });
        });

        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            player.pause().then(() => {
                console.log('Paused playback');
            });
        });

        // Next button
        document.getElementById('next-btn').addEventListener('click', () => {
            player.nextTrack().then(() => {
                console.log('Skipped to next track');
            });
        });

        // Previous button
        document.getElementById('prev-btn').addEventListener('click', () => {
            player.previousTrack().then(() => {
                console.log('Skipped to previous track');
            });
        });

        // Volume control events
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            changeVolume(e.target.value);
        });

        document.getElementById('volume-down-btn').addEventListener('click', () => {
            let currentVolume = parseInt(document.getElementById('volume-slider').value, 10);
            changeVolume(currentVolume - 10); // Decrease volume by 10
        });

        document.getElementById('volume-up-btn').addEventListener('click', () => {
            let currentVolume = parseInt(document.getElementById('volume-slider').value, 10);
            changeVolume(currentVolume + 10); // Increase volume by 10
        });
    };
}

// Fetch the access token from the URL and initialize the player
accessToken = redirectToSpotifyLogin();

if (accessToken) {
    initializeSpotifyPlayer(accessToken);
}

// Play button
document.getElementById('login').addEventListener('click', () => {
    login();
});
