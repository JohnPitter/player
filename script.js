const token = 'BQDnSosXIT8eRD0eW7fQaQu6N8J2BHlEP0mgfB-FIxtcDq1t5NjmIg4i6xoN9D3D3ZOCQU_-HZ4vTBPWoDqmA3QPBHD6wYf-Y6vm6O1yc0ncLCQlK-uFlUGGHV8dxjtyYAqDox9N9cJWid_Nu8lcvaMA110Y2MY4YsCnFGs686m9JNaFMuOkdKk34lNcEXNGtd292Os1ExdST4FYWi_4C1nCdn7q84EXMvcfpkQ4l50uuVPvY26QaFR-c1OqrgEGE8pKoEJJhg';

// Função para buscar músicas na API do Spotify
async function searchSong(query) {
    const result = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    const data = await result.json();
    displayResults(data.tracks.items);
}

// Função para exibir os resultados na página
function displayResults(tracks) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';  // Limpa resultados anteriores

    tracks.forEach(track => {
        const trackDiv = document.createElement('div');
        trackDiv.classList.add('card', 'mt-2');

        trackDiv.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${track.name} - ${track.artists[0].name}</h5>
        <audio controls src="${track.preview_url}"></audio>
      </div>
    `;

        resultsDiv.appendChild(trackDiv);
    });
}

// Event listener para o botão de busca
document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    if (query) {
        searchSong(query);
    }
});

