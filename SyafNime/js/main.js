// Main script for homepage interactions
const dataUrl = "data/anime.json";

// Helper: get favorite IDs from localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem("syafnime_favorites") || "[]");
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
  localStorage.setItem("syafnime_favorites", JSON.stringify(favorites));
}

// Helper: build anime card HTML
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

// Render slider content
function renderSlider(list) {
  const track = document.getElementById("slider-track");
  if (!track) return;

  track.innerHTML = list
    .map(
      (anime) => `
        <div class="slide">
          <div>
            <h3>${anime.title}</h3>
            <p>${anime.synopsis}</p>
            <div class="hero-actions">
              <a class="button" href="detail.html?id=${anime.id}">Detail</a>
            </div>
          </div>
          <img src="${anime.banner}" alt="${anime.title}" />
        </div>
      `
    )
    .join("");
}

// Slider control setup
function setupSlider(list) {
  const track = document.getElementById("slider-track");
  const prevBtn = document.getElementById("prev-slide");
  const nextBtn = document.getElementById("next-slide");
  if (!track || !prevBtn || !nextBtn) return;

  let index = 0;
  const updateSlide = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + list.length) % list.length;
    updateSlide();
  });

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % list.length;
    updateSlide();
  });

  // Auto slide every 6 seconds
  setInterval(() => {
    index = (index + 1) % list.length;
    updateSlide();
  }, 6000);
}

// Render latest anime cards
function renderLatest(list) {
  const grid = document.getElementById("latest-grid");
  if (!grid) return;
  grid.innerHTML = list.map(createAnimeCard).join("");

  grid.addEventListener("click", (event) => {
    const target = event.target;
    if (target.dataset.detail) {
      window.location.href = `detail.html?id=${target.dataset.detail}`;
    }
    if (target.dataset.favorite) {
      toggleFavorite(target.dataset.favorite);
      renderLatest(list);
    }
  });
}

// Fetch data and initialize homepage
fetch(dataUrl)
  .then((response) => response.json())
  .then((data) => {
    const popular = data.anime.slice(0, 3);
    const latest = data.anime.slice().reverse();
    renderSlider(popular);
    setupSlider(popular);
    renderLatest(latest);
  })
  .catch((error) => {
    console.error("Gagal memuat data anime:", error);
  });
