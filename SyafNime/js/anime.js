// Shared script for anime list, detail, and episode pages
const dataUrl = "data/anime.json";

// Helper: get favorite IDs from localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem("syafnime_favorites") || "[]");
}

// Helper: save favorite IDs
function setFavorites(favorites) {
  localStorage.setItem("syafnime_favorites", JSON.stringify(favorites));
}

// Helper: toggle favorite status
function toggleFavorite(id) {
  const favorites = getFavorites();
  const index = favorites.indexOf(id);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(id);
  }
  setFavorites(favorites);
}

// Helper: parse query parameter
function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

// Build anime card
function createAnimeCard(anime) {
  const isFavorite = getFavorites().includes(anime.id);
  return `
    <article class="anime-card">
      <img src="${anime.cover}" alt="${anime.title}" />
      <div class="info">
        <h4>${anime.title}</h4>
        <div class="meta">
          <span>${anime.genres.join(", ")}</span>
          <span>• ${anime.status}</span>
          <span>• ⭐ ${anime.rating}</span>
        </div>
        <div class="card-actions">
          <button class="small-button primary" data-detail="${anime.id}">Detail</button>
          <button class="small-button" data-favorite="${anime.id}">
            ${isFavorite ? "Favorit ✔" : "Favorit"}
          </button>
        </div>
      </div>
    </article>
  `;
}

// Render anime list and handle search
function renderAnimeList(data) {
  const grid = document.getElementById("anime-grid");
  const favoriteGrid = document.getElementById("favorite-grid");
  const searchInput = document.getElementById("search-input");
  if (!grid) return;

  const updateList = (keyword) => {
    const filtered = data.filter((anime) =>
      anime.title.toLowerCase().includes(keyword.toLowerCase())
    );
    grid.innerHTML = filtered.map(createAnimeCard).join("");
  };

  const renderFavorites = () => {
    if (!favoriteGrid) return;
    const favorites = getFavorites();
    const favoriteList = data.filter((anime) => favorites.includes(anime.id));
    favoriteGrid.innerHTML = favoriteList.length
      ? favoriteList.map(createAnimeCard).join("")
      : "<p class=\"meta\">Belum ada anime favorit.</p>";
  };

  updateList("");
  renderFavorites();

  searchInput.addEventListener("input", (event) => {
    updateList(event.target.value);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (target.dataset.detail) {
      window.location.href = `detail.html?id=${target.dataset.detail}`;
    }
    if (target.dataset.favorite) {
      toggleFavorite(target.dataset.favorite);
      updateList(searchInput.value);
      renderFavorites();
    }
  });
}

// Render detail page content
function renderDetailPage(data) {
  const container = document.getElementById("detail-container");
  if (!container) return;

  const id = getQueryParam("id");
  const anime = data.find((item) => item.id === id) || data[0];

  container.innerHTML = `
    <section class="detail-hero">
      <div class="detail-banner">
        <img src="${anime.banner}" alt="${anime.title}" />
      </div>
      <div class="detail-content">
        <h2>${anime.title}</h2>
        <div class="detail-meta">
          <span>${anime.status}</span>
          <span>${anime.genres.join(", ")}</span>
          <span>${anime.episodes} Episode</span>
          <span>⭐ ${anime.rating}</span>
        </div>
        <p>${anime.synopsis}</p>
        <div class="hero-actions">
          <a class="button" href="episode.html?id=${anime.id}&ep=1">Tonton Episode</a>
          <button class="button outline" id="favorite-btn">
            ${getFavorites().includes(anime.id) ? "Hapus Favorit" : "Tambah Favorit"}
          </button>
        </div>
      </div>
    </section>
  `;

  const favoriteBtn = document.getElementById("favorite-btn");
  favoriteBtn.addEventListener("click", () => {
    toggleFavorite(anime.id);
    favoriteBtn.textContent = getFavorites().includes(anime.id)
      ? "Hapus Favorit"
      : "Tambah Favorit";
  });
}

// Render episode page content
function renderEpisodePage(data) {
  const container = document.getElementById("episode-container");
  if (!container) return;

  const id = getQueryParam("id");
  const episodeNumber = parseInt(getQueryParam("ep") || "1", 10);
  const anime = data.find((item) => item.id === id) || data[0];
  const episode = anime.episodeList.find((item) => item.number === episodeNumber) || anime.episodeList[0];

  const episodeItems = anime.episodeList
    .map(
      (item) => `
        <div class="episode-item ${item.number === episode.number ? "active" : ""}" data-episode="${item.number}">
          Episode ${item.number} - ${item.title}
        </div>
      `
    )
    .join("");

  const prevEpisode = episode.number > 1 ? episode.number - 1 : null;
  const nextEpisode = episode.number < anime.episodeList.length ? episode.number + 1 : null;

  container.innerHTML = `
    <section class="episode-layout">
      <div class="video-card">
        <h2>${anime.title} - Episode ${episode.number}</h2>
        <p class="meta">${episode.title}</p>
        <video controls src="${episode.video}"></video>
        <div class="episode-nav">
          <a class="button outline" href="episode.html?id=${anime.id}&ep=${prevEpisode || episode.number}">
            ${prevEpisode ? "Episode Sebelumnya" : "Tidak Ada Sebelumnya"}
          </a>
          <a class="button" href="episode.html?id=${anime.id}&ep=${nextEpisode || episode.number}">
            ${nextEpisode ? "Episode Selanjutnya" : "Tidak Ada Selanjutnya"}
          </a>
        </div>
      </div>
      <aside class="episode-sidebar">
        <h3>Daftar Episode</h3>
        ${episodeItems}
      </aside>
    </section>
  `;

  container.addEventListener("click", (event) => {
    const target = event.target;
    if (target.dataset.episode) {
      window.location.href = `episode.html?id=${anime.id}&ep=${target.dataset.episode}`;
    }
  });
}

// Initialize page based on current content
fetch(dataUrl)
  .then((response) => response.json())
  .then((data) => {
    const list = data.anime;
    renderAnimeList(list);
    renderDetailPage(list);
    renderEpisodePage(list);
  })
  .catch((error) => {
    console.error("Gagal memuat data anime:", error);
  });
