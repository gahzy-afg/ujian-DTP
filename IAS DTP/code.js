        //koneksi
        const API_BASE = 'https://api.jikan.moe/v4';
        let searchTimeout;

        // load popular anime di page load
        async function loadPopularAnime() {
            try {
                const response = await fetch(`${API_BASE}/top/anime?limit=24`);
                const data = await response.json();
                displayAnime(data.data);
            } catch (error) {
                document.getElementById('animeGrid').innerHTML = '<div class="loading">Failed to load anime. Please try again.</div>';
            }
        }

        // search anime
        async function searchAnime(query) {
            if (!query.trim()) {
                loadPopularAnime();
                document.getElementById('sectionTitle').textContent = 'Popular Anime';
                return;
            }

            try {
                document.getElementById('animeGrid').innerHTML = '<div class="loading"><div class="spinner"></div>Searching...</div>';
                const response = await fetch(`${API_BASE}/anime?q=${encodeURIComponent(query)}&limit=24`);
                const data = await response.json();
                displayAnime(data.data);
                document.getElementById('sectionTitle').textContent = `Search results for "${query}"`;
            } catch (error) {
                document.getElementById('animeGrid').innerHTML = '<div class="loading">Search failed. Please try again.</div>';
            }
        }

        // Display anime cards
        function displayAnime(animeList) {
            const grid = document.getElementById('animeGrid');
            
            if (!animeList || animeList.length === 0) {
                grid.innerHTML = '<div class="loading">No anime found.</div>';
                return;
            }

            grid.innerHTML = animeList.map(anime => `
                <div class="anime-card" onclick="showAnimeDetail(${anime.mal_id})">
                    <img class="anime-poster" src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                    <div class="anime-info">
                        <h3 class="anime-title">${anime.title}</h3>
                        <div class="anime-meta">
                            <span class="anime-type">${anime.type || 'Unknown'}</span>
                            <span class="anime-score">${anime.score || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // show anime detail modal
        async function showAnimeDetail(id) {
            const modal = document.getElementById('animeModal');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            try {
                const response = await fetch(`${API_BASE}/anime/${id}/full`);
                const data = await response.json();
                const anime = data.data;

                document.getElementById('modalBackdrop').src = anime.images.jpg.large_image_url;
                document.getElementById('modalPoster').src = anime.images.jpg.large_image_url;
                document.getElementById('modalTitle').textContent = anime.title;
                document.getElementById('modalTitleEn').textContent = anime.title_english || anime.title;
                document.getElementById('modalScore').textContent = anime.score || 'N/A';
                document.getElementById('modalType').textContent = anime.type || 'Unknown';
                document.getElementById('modalEpisodes').textContent = anime.episodes || 'Unknown';
                document.getElementById('modalStatus').textContent = anime.status || 'Unknown';
                document.getElementById('modalSynopsis').textContent = anime.synopsis || 'No synopsis available.';

                const genresHtml = anime.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('');
                document.getElementById('modalGenres').innerHTML = genresHtml;
            } catch (error) {
                console.error('Failed to load anime details:', error);
            }
        }

        // close modal
        function closeModal() {
            document.getElementById('animeModal').classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // search input handler with debounce
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchAnime(e.target.value);
            }, 500);
        });

        // close modal on outside click
        document.getElementById('animeModal').addEventListener('click', (e) => {
            if (e.target.id === 'animeModal') {
                closeModal();
            }
        });

        // Load initial data
        loadPopularAnime();
